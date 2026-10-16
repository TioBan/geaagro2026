import React, { useMemo } from 'react';
import {
  Boxes,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  PackageCheck,
  ShieldCheck,
  Truck,
  Building2,
  PieChart as PieIcon,
  BarChart2,
  Layers,
  Award,
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
  AreaChart,
  Area,
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const TraceabilityDashboard: React.FC<DashboardProps> = ({
  property,
  lots,
  harvests,
  expeditions,
  monitoring,
  onSelectLot,
  onNavigateTab,
  onOpenPassport,
}) => {
  // Key Indicators
  const stats = useMemo(() => {
    const activeLots = lots.filter(l => l.status !== 'finalizado' && l.status !== 'cancelado');
    const totalCultivatedArea = lots.reduce((acc, l) => acc + (l.plantedAreaHa || 0), 0);
    const totalEstYieldKg = lots.reduce((acc, l) => acc + (l.estimatedYieldKg || 0), 0);
    const totalHarvestedKg = lots.reduce((acc, l) => acc + (l.totalHarvestedKg || 0), 0);
    const totalHarvestedBoxes = lots.reduce((acc, l) => acc + (l.totalHarvestedBoxes || 0), 0);
    const totalExpeditedBoxes = lots.reduce((acc, l) => acc + (l.totalExpeditedBoxes || 0), 0);
    
    // Quarantine items
    const quarantineLots = lots.filter(l => l.isUnderActiveQuarantine);
    
    // Customers served
    const uniqueCustomers = new Set(expeditions.map(e => e.customerName)).size;
    
    // Total pallets expedidos
    const totalPalletsExpedited = expeditions.reduce((acc, e) => acc + (e.totalPallets || 0), 0);
    
    // Average IGR Score
    const avgIgr = lots.length > 0
      ? Math.round(lots.reduce((acc, l) => acc + (l.igrScorePercentage || 0), 0) / lots.length)
      : 100;

    // Alertas fitossanitários ativos
    const activeAlerts = monitoring.filter(m => m.severity === 'alta' || m.severity === 'critica' || m.economicThresholdExceeded);

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

  // Production per Crop Chart Data
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

  // Production per Plot Chart Data
  const productionByPlotData = useMemo(() => {
    const map: Record<string, { plot: string; boxes: number }> = {};
    lots.forEach(lot => {
      const key = lot.plotCode || lot.plotName;
      if (!map[key]) {
        map[key] = { plot: key, boxes: 0 };
      }
      map[key].boxes += lot.totalHarvestedBoxes || 0;
    });
    return Object.values(map);
  }, [lots]);

  // Status Distribution Pie Chart Data
  const lotStatusData = useMemo(() => {
    const map: Record<string, number> = {
      'Colheita': 0,
      'Frutificação': 0,
      'Desenvolvimento': 0,
      'Semeadura': 0,
      'Finalizado': 0,
    };
    lots.forEach(l => {
      if (l.status === 'colheita') map['Colheita']++;
      else if (l.status === 'frutificacao') map['Frutificação']++;
      else if (l.status === 'desenvolvimento') map['Desenvolvimento']++;
      else if (l.status === 'semeadura') map['Semeadura']++;
      else map['Finalizado']++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [lots]);

  // Weekly Harvest Evolution Data
  const harvestTimelineData = useMemo(() => {
    const sorted = [...harvests].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map(h => ({
      data: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      pesoKg: h.netWeightKg,
      caixas: h.boxesCount,
    }));
  }, [harvests]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Property & IGR Index Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                INC 02/2018 MAPA/ANVISA & GlobalG.A.P.
              </span>
              <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                <Building2 className="w-3.5 h-3.5" />
                {property.city} - {property.state}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {property.farmName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Produtor: <strong className="text-white">{property.producerName}</strong> • {property.documentType}: {property.documentNumber} • RT: <strong className="text-white">{property.technicalResponsible}</strong> ({property.councilType} {property.creaNumber}/{property.creaState})
            </p>
          </div>

          {/* IGR Badge */}
          <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shrink-0 w-full lg:w-auto justify-between lg:justify-start">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                Índice GeaAgro IGR
              </div>
              <p className="text-2xl font-extrabold text-white">
                {stats.avgIgr}%
              </p>
              <p className="text-[11px] text-emerald-200">
                Classificação: <strong className="text-emerald-400 uppercase font-bold">Excelente</strong>
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-emerald-950/60 shadow-inner">
              <span className="text-xs font-black text-emerald-300">IGR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Quarantine Alert if any */}
      {stats.quarantineCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Atenção Fitossanitária: {stats.quarantineCount} Lote(s) em Período de Carência Ativa
            </h4>
            <div className="text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
              {stats.quarantineLots.map(l => (
                <p key={l.id}>
                  • Lote <strong className="font-semibold">{l.lotCode}</strong> ({l.cropName} - {l.cultivarName}): {l.activeQuarantineProduct || 'Defensivo com carência pendente'} até <strong>{l.activeQuarantineUntilDate || 'Data em aberto'}</strong>. Colheita temporariamente bloqueada.
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('operacoes')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Ver Pulverizações
          </button>
        </div>
      )}

      {/* Grid of Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Lotes Ativos</span>
            <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {stats.activeLotsCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalLotsCount}</span>
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {stats.totalCultivatedArea} ha cultivados
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Produção Estimada</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {(stats.totalEstYieldKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">ton</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            Previsão consolidada
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Colheita Real</span>
            <PackageCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {(stats.totalHarvestedKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">ton</span>
          </p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
            {stats.totalHarvestedBoxes.toLocaleString('pt-BR')} caixas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Expedição Total</span>
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {stats.totalExpeditedBoxes.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">cx</span>
          </p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {stats.totalPalletsExpedited} pallets enviados
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Clientes</span>
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {stats.uniqueCustomers} <span className="text-xs font-normal text-slate-400">redes</span>
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            Atendimento rastreado
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-medium">Carência & MIP</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {stats.quarantineCount === 0 ? '100% OK' : `${stats.quarantineCount} Alerta`}
          </p>
          <span className={`text-[10px] font-semibold ${stats.quarantineCount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
            {stats.activeAlertsCount} ocorrências MIP
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produção por Cultura (Estimado vs Colhido) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Produção por Cultura (Estimado vs. Colhido em kg)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Acompanhamento de rendimento por cultura cadastrada
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionByCropData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}t`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} kg`, '']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="estimadoKg" name="Estimativa (kg)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="colhidoKg" name="Colhido Real (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Fases dos Lotes & Caixas por Talhão */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-600" />
                Distribuição dos Lotes por Estádio Fenológico
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Status fenológico das lavouras ativas na fazenda
              </p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lotStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {lotStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Lots Quick Table with Digital Passport Access */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Lotes Ativos & Passaporte Digital Rápido
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Acesso instantâneo à identidade do lote, QR Code e conformidade
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('lotes')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver todos os {lots.length} lotes &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Código do Lote</th>
                <th className="py-2.5 px-3">Cultura & Cultivar</th>
                <th className="py-2.5 px-3">Talhão / Estufa</th>
                <th className="py-2.5 px-3">Semeadura / Transplante</th>
                <th className="py-2.5 px-3">Colhido / Estimado</th>
                <th className="py-2.5 px-3">Status & Carência</th>
                <th className="py-2.5 px-3">IGR Score</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {lots.slice(0, 5).map(lot => (
                <tr key={lot.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {lot.lotCode}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{lot.cropName}</span>
                    <span className="block text-[10px] text-slate-400">{lot.cultivarName}</span>
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {lot.plotCode} <span className="text-[10px] text-slate-400">({lot.plantedAreaHa} ha)</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">
                    {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                    {lot.nurseryTransplantDate && (
                      <span className="block text-[10px] text-emerald-600">Tr: {new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold">
                      {(lot.totalHarvestedKg / 1000).toFixed(1)}t <span className="text-slate-400 font-normal">/ {(lot.estimatedYieldKg / 1000).toFixed(1)}t</span>
                    </div>
                    <div className="text-[10px] text-teal-600">
                      {lot.totalHarvestedBoxes} cx colhidas
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {lot.isUnderActiveQuarantine ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                        <AlertTriangle className="w-3 h-3" /> Em Carência
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold capitalize">
                        <CheckCircle2 className="w-3 h-3" /> {lot.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {lot.igrScorePercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => onOpenPassport(lot)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Passaporte
                    </button>
                    <button
                      onClick={() => onSelectLot(lot)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Gêmeo 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
