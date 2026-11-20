import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  Download,
  Package,
  Plus,
  Save,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  HydroponicBench,
  HydroponicCustomerOrder,
  HydroponicFinancialSummary,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';
import {
  formatBrDate,
  getTodayIsoDate,
  HYDRO_INPUT_CLASS,
  HYDRO_LABEL_CLASS,
} from './hydroponicsUi';

interface HydroponicsBusinessViewProps {
  mode: 'comercial' | 'financeiro' | 'relatorios';
  benches: HydroponicBench[];
  reservoirs: NutrientSolutionReservoir[];
  orders: HydroponicCustomerOrder[];
  financials: HydroponicFinancialSummary;
  onAddOrder: (order: HydroponicCustomerOrder) => void;
  onUpdateOrderStatus: (id: string, status: HydroponicCustomerOrder['status']) => void;
  onDeleteOrder: (id: string) => void;
  onSaveFinancials: (updated: HydroponicFinancialSummary) => void;
}

const ORDER_STATUS_LABELS: Record<HydroponicCustomerOrder['status'], string> = {
  agendado: 'Agendado',
  em_colheita: 'Em colheita',
  faturado: 'Faturado',
  entregue: 'Entregue',
};

export const HydroponicsBusinessView: React.FC<HydroponicsBusinessViewProps> = ({
  mode,
  benches,
  reservoirs,
  orders,
  financials,
  onAddOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveFinancials,
}) => {
  // Commercial form state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] =
    useState<HydroponicCustomerOrder['customerType']>('Supermercado');
  const [cropName, setCropName] = useState('Alface Crespa');
  const [quantity, setQuantity] = useState<number>(100);
  const [unitPrice, setUnitPrice] = useState<number>(3.5);
  const [deliveryDate, setDeliveryDate] = useState<string>(getTodayIsoDate());
  const [recurrence, setRecurrence] =
    useState<HydroponicCustomerOrder['recurrence']>('Semanal (Seg/Qui)');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Cost breakdown editor state
  const [costDraft, setCostDraft] = useState(financials.costBreakdown);

  // Derived live numbers from real orders + benches + reservoirs
  const derived = useMemo(() => {
    const ordersRevenue = orders.reduce((s, o) => s + o.totalValueBrl, 0);
    const ordersUnits = orders.reduce((s, o) => s + o.quantityBunched, 0);
    const grossRevenue = ordersRevenue > 0 ? ordersRevenue : financials.grossRevenueBrl;
    const totalUnits = ordersUnits > 0 ? ordersUnits : financials.totalHarvestedUnits;
    const totalKg =
      benches.reduce((s, b) => s + b.estimatedYieldKg, 0) || financials.totalHarvestedKg;

    const totalCost = Object.values(costDraft).reduce((s, v) => s + (Number(v) || 0), 0);
    const netProfit = grossRevenue - totalCost;
    const marginPct = grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0;
    const unitCost = totalUnits > 0 ? totalCost / totalUnits : 0;

    const totalCapacity = benches.reduce((s, b) => s + b.totalCapacityPlants, 0);
    const totalPlants = benches.reduce((s, b) => s + b.currentPlantsCount, 0);
    const occupancyPct = totalCapacity > 0 ? Number(((totalPlants / totalCapacity) * 100).toFixed(1)) : 0;

    const dailyWaterL =
      reservoirs.reduce((s, r) => s + (r.waterConsumptionLitersDay || 0), 0) ||
      Math.round(reservoirs.reduce((s, r) => s + r.currentVolumeLiters, 0) * 0.15);

    return {
      grossRevenue,
      totalUnits,
      totalKg,
      totalCost,
      netProfit,
      marginPct,
      unitCost,
      totalCapacity,
      totalPlants,
      occupancyPct,
      dailyWaterL,
    };
  }, [orders, benches, reservoirs, financials, costDraft]);

  if (mode === 'comercial') {
    const handleSubmitOrder = (e: React.FormEvent) => {
      e.preventDefault();
      if (!customerName.trim() || quantity <= 0) return;
      const newOrder: HydroponicCustomerOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `PED-${String(orders.length + 1).padStart(3, '0')}`,
        customerName: customerName.trim(),
        customerType,
        cropName: cropName.trim() || 'Alface',
        quantityBunched: quantity,
        unitPriceBrl: unitPrice,
        totalValueBrl: Number((quantity * unitPrice).toFixed(2)),
        deliveryDateTarget: deliveryDate,
        recurrence,
        status: 'agendado',
      };
      onAddOrder(newOrder);
      setCustomerName('');
      setShowOrderForm(false);
    };

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Pedidos Recorrentes &amp; Entregas
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Gerencie pedidos de supermercados, restaurantes e hortifrutis integrados ao faturamento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOrderForm((v) => !v)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Pedido
          </button>
        </div>

        {showOrderForm && (
          <form
            onSubmit={handleSubmitOrder}
            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3.5 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={HYDRO_LABEL_CLASS}>Cliente *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Hortifruti Central"
                  className={HYDRO_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Perfil do Cliente</label>
                <select
                  value={customerType}
                  onChange={(e) =>
                    setCustomerType(e.target.value as HydroponicCustomerOrder['customerType'])
                  }
                  className={HYDRO_INPUT_CLASS}
                >
                  <option value="Supermercado">Supermercado</option>
                  <option value="Quitanda/Hortifruti">Quitanda / Hortifruti</option>
                  <option value="Restaurante">Restaurante</option>
                  <option value="Distribuidor">Distribuidor</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                </select>
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Cultura *</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className={HYDRO_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Frequência</label>
                <select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as HydroponicCustomerOrder['recurrence'])
                  }
                  className={HYDRO_INPUT_CLASS}
                >
                  <option value="Avulso">Avulso</option>
                  <option value="Diário">Diário</option>
                  <option value="Semanal (Seg/Qui)">Semanal (Seg/Qui)</option>
                  <option value="Semanal (Ter/Sex)">Semanal (Ter/Sex)</option>
                </select>
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Qtd (Maços/Pés)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>Data Entrega</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className={`${HYDRO_INPUT_CLASS} font-mono`}
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Pedido
                </button>
              </div>
            </div>
          </form>
        )}

        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-8 text-center space-y-2">
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhum pedido comercial cadastrado
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Adicione pedidos recorrentes ou avulsos para acompanhar entregas e alimentar o painel financeiro automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <th className="py-2 px-2.5">Pedido / Cliente</th>
                  <th className="py-2 px-2.5">Cultura</th>
                  <th className="py-2 px-2.5 text-right">Qtd</th>
                  <th className="py-2 px-2.5 text-right">Valor Total</th>
                  <th className="py-2 px-2.5">Entrega</th>
                  <th className="py-2 px-2.5">Frequência</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-2.5">
                      <div className="font-medium text-slate-900 dark:text-zinc-100">
                        {o.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {o.orderNumber} · {o.customerType}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-700 dark:text-zinc-300">{o.cropName}</td>
                    <td className="py-2.5 px-2.5 text-right font-medium text-slate-900 dark:text-zinc-100">
                      {o.quantityBunched.toLocaleString('pt-BR')} un
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      R$ {o.totalValueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-600 dark:text-zinc-400">
                      {formatBrDate(o.deliveryDateTarget)}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-600 dark:text-zinc-400">
                      {o.recurrence}
                    </td>
                    <td className="py-2.5 px-2.5">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            o.id,
                            e.target.value as HydroponicCustomerOrder['status']
                          )
                        }
                        aria-label={`Status do pedido ${o.orderNumber}`}
                        className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px] font-medium text-slate-700 dark:text-zinc-200"
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, lbl]) => (
                          <option key={k} value={k}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      {confirmDeleteId === o.id ? (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteOrder(o.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-medium cursor-pointer"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            Não
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(o.id)}
                          title="Excluir pedido"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'financeiro') {
    const costFields: { key: keyof HydroponicFinancialSummary['costBreakdown']; label: string }[] = [
      { key: 'fertilizers', label: 'Fertilizantes / Sais (R$)' },
      { key: 'seeds', label: 'Sementes / Mudas (R$)' },
      { key: 'phenolicFoamAndCups', label: 'Espuma Fenólica / Copos (R$)' },
      { key: 'electricity', label: 'Energia Elétrica (R$)' },
      { key: 'water', label: 'Água / Tratamento (R$)' },
      { key: 'packagingAndLabels', label: 'Embalagens / Rótulos (R$)' },
      { key: 'labor', label: 'Mão de Obra (R$)' },
      { key: 'transport', label: 'Frete / Entregas (R$)' },
    ];

    const handleSaveCosts = (e: React.FormEvent) => {
      e.preventDefault();
      const totalOperatingCostBrl = Object.values(costDraft).reduce(
        (s, v) => s + (Number(v) || 0),
        0
      );
      const netProfitBrl = derived.grossRevenue - totalOperatingCostBrl;
      const profitMarginPercent =
        derived.grossRevenue > 0
          ? Number(((netProfitBrl / derived.grossRevenue) * 100).toFixed(1))
          : 0;
      const unitCostPerPlantBrl =
        derived.totalUnits > 0 ? Number((totalOperatingCostBrl / derived.totalUnits).toFixed(2)) : 0;

      onSaveFinancials({
        ...financials,
        monthYear: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
        grossRevenueBrl: derived.grossRevenue,
        totalHarvestedUnits: derived.totalUnits,
        totalHarvestedKg: derived.totalKg,
        costBreakdown: { ...costDraft },
        totalOperatingCostBrl,
        netProfitBrl,
        profitMarginPercent,
        unitCostPerPlantBrl,
        unitSellingPriceAvgBrl:
          derived.totalUnits > 0 ? Number((derived.grossRevenue / derived.totalUnits).toFixed(2)) : 0,
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Faturamento Bruto</span>
            <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
              R$ {derived.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {derived.totalUnits.toLocaleString('pt-BR')} maços/pés em pedidos
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Custo Operacional</span>
            <strong className="text-xl font-bold text-slate-900 dark:text-zinc-100 block mt-1">
              R$ {derived.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              Custo unitário: R$ {derived.unitCost.toFixed(2)} / un
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Resultado Líquido</span>
            <strong
              className={`text-xl font-bold block mt-1 ${
                derived.netProfit > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : derived.netProfit < 0
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              R$ {derived.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {derived.grossRevenue > 0
                ? `Margem líquida: ${derived.marginPct}%`
                : 'Cadastre pedidos e custos para calcular margem'}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSaveCosts}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4"
        >
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Composição Mensal de Custos da Estufa
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Informe os custos operacionais do período para calcular margem real e custo por pé produzido.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {costFields.map((f) => (
              <div key={f.key}>
                <label className={HYDRO_LABEL_CLASS}>{f.label}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costDraft[f.key] || ''}
                  onChange={(e) =>
                    setCostDraft((prev) => ({
                      ...prev,
                      [f.key]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  placeholder="0,00"
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Custos do Período
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* MODE: RELATÓRIOS & INDICADORES */
  const handleExportCsv = () => {
    const header = [
      'Codigo',
      'Sistema',
      'Setor',
      'Cultura',
      'Cultivar',
      'Plantas',
      'Capacidade',
      'Estagio',
      'Producao_Est_Kg',
      'Colheita_Prevista',
    ];
    const rows = benches.map((b) =>
      [
        b.code,
        b.systemType,
        b.greenhouseSection,
        b.cropName,
        b.cultivar,
        b.currentPlantsCount,
        b.totalCapacityPlants,
        b.status,
        b.estimatedYieldKg,
        formatBrDate(b.expectedHarvestDate),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-hidroponia-${getTodayIsoDate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Produção Estimada</span>
          <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
            {derived.totalPlants.toLocaleString('pt-BR')} pés
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {derived.totalKg.toLocaleString('pt-BR')} kg estimados em {benches.length} bancadas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Consumo Hídrico Est.</span>
          <strong className="text-xl font-bold text-sky-700 dark:text-sky-400 block mt-1">
            {derived.dailyWaterL.toLocaleString('pt-BR')} L/dia
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {derived.totalPlants > 0 && derived.dailyWaterL > 0
              ? `${(derived.dailyWaterL / derived.totalPlants).toFixed(2)} L / planta / dia`
              : 'Sem dados de consumo'}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-zinc-400 block">Taxa de Ocupação</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-zinc-100 block mt-1">
            {derived.occupancyPct}%
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {derived.totalCapacity > 0
              ? `${derived.totalPlants.toLocaleString('pt-BR')} / ${derived.totalCapacity.toLocaleString('pt-BR')} posições`
              : 'Sem bancadas cadastradas'}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Resumo Consolidado de Bancadas
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Exporte o inventário completo das bancadas em formato CSV para auditoria ou planilha.
            </p>
          </div>
          <button
            type="button"
            disabled={benches.length === 0}
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>

        {benches.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
            Cadastre bancadas para gerar indicadores consolidados e exportação CSV.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <th className="py-2 px-2.5">Código</th>
                  <th className="py-2 px-2.5">Cultura</th>
                  <th className="py-2 px-2.5">Sistema</th>
                  <th className="py-2 px-2.5 text-right">Plantas</th>
                  <th className="py-2 px-2.5 text-right">Ocupação</th>
                  <th className="py-2 px-2.5 text-right">Produção Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {benches.map((b) => {
                  const occ =
                    b.totalCapacityPlants > 0
                      ? Math.round((b.currentPlantsCount / b.totalCapacityPlants) * 100)
                      : 0;
                  return (
                    <tr key={b.id}>
                      <td className="py-2 px-2.5 font-mono font-semibold text-slate-900 dark:text-zinc-100">
                        {b.code}
                      </td>
                      <td className="py-2 px-2.5 text-slate-700 dark:text-zinc-300">
                        {b.cropName} ({b.cultivar})
                      </td>
                      <td className="py-2 px-2.5 text-slate-500 dark:text-zinc-400">
                        {b.systemType.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-2.5 text-right text-slate-900 dark:text-zinc-100">
                        {b.currentPlantsCount.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-2.5 text-right text-slate-600 dark:text-zinc-400">
                        {occ}%
                      </td>
                      <td className="py-2 px-2.5 text-right font-medium text-emerald-700 dark:text-emerald-400">
                        {b.estimatedYieldKg} kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
