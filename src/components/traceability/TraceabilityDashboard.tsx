import React, { useMemo } from 'react';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  Truck,
  Building2,
  PieChart as PieIcon,
  BarChart2,
  Award,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TraceabilityLot,
  TraceabilityProperty,
  TraceabilityHarvestItem,
  TraceabilityExpedition,
  TraceabilityPestMonitoring,
} from '../../types/traceability';

interface DashboardProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  harvests: TraceabilityHarvestItem[];
  expeditions: TraceabilityExpedition[];
  monitoring: TraceabilityPestMonitoring[];
  onSelectLot: (lot: TraceabilityLot) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenPassport: (lot: TraceabilityLot) => void;
}

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#6366f1', '#64748b'];

function getIgrClassification(score: number): { label: string; tone: string } {
  if (score >= 90) {
    return {
      label: 'Excelente',
      tone: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60',
    };
  }
  if (score >= 75) {
    return {
      label: 'Boa',
      tone: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200/80 dark:border-sky-800/60',
    };
  }
  if (score >= 50) {
    return {
      label: 'Atenção',
      tone: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60',
    };
  }
  return {
    label: 'Incompleta',
    tone: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60',
  };
}

export const TraceabilityDashboard: React.FC<DashboardProps> = ({
  property,
  lots,
  expeditions,
  monitoring,
  onSelectLot,
  onNavigateTab,
  onOpenPassport,
}) => {
  const stats = useMemo(() => {
    const activeLots = lots.filter(l => l.status !== 'finalizado' && l.status !== 'cancelado');
    const totalCultivatedArea = lots.reduce((acc, l) => acc + (l.plantedAreaHa || 0), 0);
    const totalEstYieldKg = lots.reduce((acc, l) => acc + (l.estimatedYieldKg || 0), 0);
    const totalHarvestedKg = lots.reduce((acc, l) => acc + (l.totalHarvestedKg || 0), 0);
    const totalHarvestedBoxes = lots.reduce((acc, l) => acc + (l.totalHarvestedBoxes || 0), 0);
    const totalExpeditedBoxes = lots.reduce((acc, l) => acc + (l.totalExpeditedBoxes || 0), 0);
    const quarantineLots = lots.filter(l => l.isUnderActiveQuarantine);
    const uniqueCustomers = new Set(expeditions.map(e => e.customerName).filter(Boolean)).size;
    const totalPalletsExpedited = expeditions.reduce((acc, e) => acc + (e.totalPallets || 0), 0);
    const avgIgr =
      lots.length > 0
        ? Math.round(lots.reduce((acc, l) => acc + (l.igrScorePercentage || 0), 0) / lots.length)
        : 0;
    const activeAlerts = monitoring.filter(
      m => m.severity === 'alta' || m.severity === 'critica' || m.economicThresholdExceeded
    );

    return {
      activeLotsCount: activeLots.length,
      totalLotsCount: lots.length,
      totalCultivatedArea: totalCultivatedArea.toFixed(1),
      totalEstYieldKg,
      totalHarvestedKg,
      totalHarvestedBoxes,
      totalExpeditedBoxes,
      quarantineCount: quarantineLots.length,
      quarantineLots,
      uniqueCustomers,
      totalPalletsExpedited,
      avgIgr,
      activeAlertsCount: activeAlerts.length,
    };
  }, [lots, expeditions, monitoring]);

  const productionByCropData = useMemo(() => {
    const map: Record<string, { crop: string; colhidoKg: number; estimadoKg: number }> = {};
    lots.forEach(lot => {
      if (!map[lot.cropName]) {
        map[lot.cropName] = { crop: lot.cropName, colhidoKg: 0, estimadoKg: 0 };
      }
      map[lot.cropName].colhidoKg += lot.totalHarvestedKg || 0;
      map[lot.cropName].estimadoKg += lot.estimatedYieldKg || 0;
    });
    return Object.values(map);
  }, [lots]);

  const lotStatusData = useMemo(() => {
    const map: Record<string, number> = {
      Colheita: 0,
      Frutificação: 0,
      Desenvolvimento: 0,
      Semeadura: 0,
      Finalizado: 0,
    };
    lots.forEach(l => {
      if (l.status === 'colheita') map.Colheita++;
      else if (l.status === 'frutificacao') map['Frutificação']++;
      else if (l.status === 'desenvolvimento') map.Desenvolvimento++;
      else if (l.status === 'semeadura') map.Semeadura++;
      else map.Finalizado++;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [lots]);

  const igrMeta = getIgrClassification(stats.avgIgr);

  return (
    <div className="space-y-4">
      {/* Property Identity & IGR Summary Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60">
                <ShieldCheck className="w-3 h-3" />
                INC 02/2018 MAPA/ANVISA & GlobalG.A.P.
              </span>
              {(property.city || property.state) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700">
                  <Building2 className="w-3 h-3" />
                  {[property.city, property.state].filter(Boolean).join(' - ')}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
              {property.farmName || 'Propriedade não configurada'}
            </h2>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {property.producerName ? (
                <>
                  Produtor: <strong className="text-slate-700 dark:text-zinc-200 font-semibold">{property.producerName}</strong>
                  {property.documentNumber && (
                    <> • {property.documentType}: <span className="tabular-nums">{property.documentNumber}</span></>
                  )}
                  {property.technicalResponsible && (
                    <> • RT: <strong className="text-slate-700 dark:text-zinc-200 font-semibold">{property.technicalResponsible}</strong> ({property.councilType} {property.creaNumber}{property.creaState ? `/${property.creaState}` : ''})</>
                  )}
                </>
              ) : (
                'Configure os dados da propriedade, produtor e responsável técnico na aba Configurações.'
              )}
            </p>
          </div>

          {/* IGR Compact Metric Card */}
          <div className="flex items-center justify-between lg:justify-end gap-4 px-3.5 py-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 shrink-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Índice GeaAgro IGR
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {lots.length > 0 ? `${stats.avgIgr}%` : '--'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${lots.length > 0 ? igrMeta.tone : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
                  {lots.length > 0 ? igrMeta.label : 'Sem lotes'}
                </span>
              </div>
            </div>
            {!property.farmName && (
              <button
                type="button"
                onClick={() => onNavigateTab('configuracoes')}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                Configurar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Quarantine Alert */}
      {stats.quarantineCount > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Atenção Fitossanitária: {stats.quarantineCount} lote(s) em período de carência ativa
            </h4>
            <div className="text-xs text-amber-800 dark:text-amber-300/90 space-y-0.5">
              {stats.quarantineLots.map(l => (
                <p key={l.id}>
                  Lote <strong className="font-mono font-semibold">{l.lotCode}</strong> ({l.cropName} - {l.cultivarName}):{' '}
                  {l.activeQuarantineProduct || 'Defensivo com carência pendente'} até{' '}
                  <strong className="tabular-nums">{l.activeQuarantineUntilDate || 'Data em aberto'}</strong>. Colheita temporariamente bloqueada.
                </p>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('operacoes')}
            className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Ver Pulverizações
          </button>
        </div>
      )}

      {/* Unified KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 dark:divide-zinc-800">
          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Lotes Ativos</span>
              <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.activeLotsCount} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {stats.totalLotsCount}</span>
            </p>
            <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
              {stats.totalCultivatedArea} ha cultivados
            </span>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Produção Estimada</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {(stats.totalEstYieldKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">ton</span>
            </p>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
              Previsão consolidada
            </span>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Colheita Real</span>
              <PackageCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {(stats.totalHarvestedKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">ton</span>
            </p>
            <span className="block text-[11px] text-teal-600 dark:text-teal-400 font-medium tabular-nums">
              {stats.totalHarvestedBoxes.toLocaleString('pt-BR')} caixas
            </span>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Expedição Total</span>
              <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.totalExpeditedBoxes.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">cx</span>
            </p>
            <span className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-medium tabular-nums">
              {stats.totalPalletsExpedited} pallets enviados
            </span>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Clientes</span>
              <Building2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.uniqueCustomers} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">redes</span>
            </p>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
              Atendimento rastreado
            </span>
          </div>

          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px] font-medium">Carência & MIP</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {stats.quarantineCount === 0 ? '100% OK' : `${stats.quarantineCount} Alerta`}
            </p>
            <span className={`block text-[11px] font-medium tabular-nums ${stats.quarantineCount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {stats.activeAlertsCount} ocorrências MIP
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Produção por Cultura (Estimado vs. Colhido em kg)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Acompanhamento de rendimento por cultura cadastrada
            </p>
          </div>
          {productionByCropData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-4">
              <BarChart2 className="w-6 h-6 text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">Nenhum lote cadastrado para comparativo</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Cadastre um lote agrícola para acompanhar a estimativa e colheita.</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionByCropData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                  <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={val => `${(val / 1000).toFixed(0)}t`} />
                  <Tooltip
                    formatter={(value: unknown) => [`${Number(value).toLocaleString('pt-BR')} kg`, '']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="estimadoKg" name="Estimativa (kg)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="colhidoKg" name="Colhido Real (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Distribuição dos Lotes por Estádio Fenológico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Status fenológico das lavouras ativas na fazenda
            </p>
          </div>
          {lotStatusData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-4">
              <PieIcon className="w-6 h-6 text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">Sem dados fenológicos disponíveis</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">A distribuição aparece automaticamente conforme os lotes avançam de fase.</p>
            </div>
          ) : (
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lotStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name} (${Math.round((percent || 0) * 100)}%)`
                    }
                  >
                    {lotStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Active Lots Quick Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Lotes Ativos & Passaporte Digital Rápido
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Acesso instantâneo à identidade do lote, QR Code e conformidade
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('lotes')}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <span>Ver todos os {lots.length} lotes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lots.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Boxes className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Nenhum lote rastreado cadastrado</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Crie o primeiro lote agrícola para gerar código único, QR Code e passaporte digital.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('lotes')}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Criar Primeiro Lote
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3.5">Código do Lote</th>
                  <th className="py-2.5 px-3.5">Cultura & Cultivar</th>
                  <th className="py-2.5 px-3.5">Talhão / Estufa</th>
                  <th className="py-2.5 px-3.5">Semeadura / Transplante</th>
                  <th className="py-2.5 px-3.5">Colhido / Estimado</th>
                  <th className="py-2.5 px-3.5">Status & Carência</th>
                  <th className="py-2.5 px-3.5">IGR</th>
                  <th className="py-2.5 px-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800">
                {lots.slice(0, 5).map(lot => (
                  <tr key={lot.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {lot.lotCode}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">{lot.cropName}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-zinc-400">{lot.cultivarName}</span>
                    </td>
                    <td className="py-2.5 px-3.5 font-medium whitespace-nowrap tabular-nums">
                      {lot.plotCode} <span className="text-[11px] text-slate-400 dark:text-zinc-500">({lot.plantedAreaHa} ha)</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                      {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                      {lot.nurseryTransplantDate && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                          Tr: {new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap tabular-nums">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200">
                        {(lot.totalHarvestedKg / 1000).toFixed(1)}t{' '}
                        <span className="text-slate-400 dark:text-zinc-500 font-normal">/ {(lot.estimatedYieldKg / 1000).toFixed(1)}t</span>
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">
                        {lot.totalHarvestedBoxes.toLocaleString('pt-BR')} cx colhidas
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {lot.isUnderActiveQuarantine ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60">
                          <AlertTriangle className="w-3 h-3" /> Em Carência
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 capitalize">
                          <CheckCircle2 className="w-3 h-3" /> {lot.status}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {lot.igrScorePercentage}%
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenPassport(lot)}
                          className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" /> Passaporte
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectLot(lot)}
                          className="h-7 px-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                        >
                          Gêmeo 360°
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
