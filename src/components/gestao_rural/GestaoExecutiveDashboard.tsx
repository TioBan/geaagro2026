import React from 'react';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  MapPin,
  Wheat,
  Package,
  Calendar,
  AlertTriangle,
  Droplets,
  CloudSun,
  Tractor,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  PropriedadeRural,
  TalhaoRural,
  SafraAgragricola,
  ContaFinanceiraRecord,
  ItemEstoqueRural,
  MaquinaImplementoRecord,
  FuncionarioRuralRecord,
  OperacaoCampoRecord,
} from '../../types/gestaoRural';

interface GestaoExecutiveDashboardProps {
  propriedade: PropriedadeRural;
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  financeiro: ContaFinanceiraRecord[];
  estoque: ItemEstoqueRural[];
  maquinas: MaquinaImplementoRecord[];
  funcionarios: FuncionarioRuralRecord[];
  operacoes: OperacaoCampoRecord[];
  onNavigateTab: (tabId: string) => void;
}

export const GestaoExecutiveDashboard: React.FC<GestaoExecutiveDashboardProps> = ({
  propriedade,
  talhoes,
  safras,
  financeiro,
  estoque,
  maquinas,
  funcionarios,
  operacoes,
  onNavigateTab,
}) => {
  // Financial Calculations
  const receitaTotal = financeiro
    .filter(f => f.tipo === 'receita')
    .reduce((acc, f) => acc + f.valorR$, 0);

  const despesaTotal = financeiro
    .filter(f => f.tipo === 'despesa')
    .reduce((acc, f) => acc + f.valorR$, 0);

  const lucroLiquido = receitaTotal - despesaTotal;

  const contasPagar = financeiro
    .filter(f => f.tipo === 'despesa' && f.status === 'pendente')
    .reduce((acc, f) => acc + f.valorR$, 0);

  const contasReceber = financeiro
    .filter(f => f.tipo === 'receita' && f.status === 'pendente')
    .reduce((acc, f) => acc + f.valorR$, 0);

  // Agronomic Calculations
  const areaTotalPlantada = safras.reduce((acc, s) => acc + s.areaHa, 0);
  const safrasColhidas = safras.filter(s => s.status === 'colhida');
  const areaTotalColhida = safrasColhidas.reduce((acc, s) => acc + s.areaHa, 0);
  const produtividadeMediaSacas =
    safrasColhidas.length > 0
      ? safrasColhidas.reduce((acc, s) => acc + (s.produtividadeRealizadaSacasHa || 0), 0) /
        safrasColhidas.length
      : 0;

  const maquinasAtivas = maquinas.filter(m => m.status === 'ativo').length;
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const alertasEstoqueCount = estoque.filter(
    e => e.statusAlerta === 'minimo' || e.statusAlerta === 'vencendo' || e.statusAlerta === 'vencido'
  ).length;

  // Chart Data: Dynamic Cash Flow from Financeiro
  const fluxoCaixaChartData = React.useMemo(() => {
    if (financeiro.length === 0) return [];
    const monthlyMap: Record<string, { receita: number; despesa: number }> = {};
    financeiro.forEach(f => {
      const date = f.dataPagamentoRecebimento || f.dataVencimento;
      if (!date) return;
      const d = new Date(date);
      const key = `${d.toLocaleString('pt-BR', { month: 'short' })}/${String(d.getFullYear()).slice(-2)}`;
      if (!monthlyMap[key]) monthlyMap[key] = { receita: 0, despesa: 0 };
      if (f.tipo === 'receita') monthlyMap[key].receita += f.valorR$;
      else if (f.tipo === 'despesa') monthlyMap[key].despesa += f.valorR$;
    });
    return Object.entries(monthlyMap).map(([mes, vals]) => ({
      mes,
      receita: vals.receita,
      despesa: vals.despesa,
      saldo: vals.receita - vals.despesa,
    }));
  }, [financeiro]);

  // Chart Data: Costs per Crop (From Safras and Despesas)
  const custosPorCulturaChartData = React.useMemo(() => {
    if (safras.length === 0) return [];
    return safras.map(s => {
      const safrasDespesas = financeiro.filter(f => f.tipo === 'despesa' && f.safraId === s.id);
      const adubacao = safrasDespesas.filter(f => f.categoria?.toLowerCase().includes('fertilizante') || f.categoria?.toLowerCase().includes('adubo')).reduce((a, b) => a + b.valorR$, 0);
      const defensivos = safrasDespesas.filter(f => f.categoria?.toLowerCase().includes('defensivo')).reduce((a, b) => a + b.valorR$, 0);
      const sementes = safrasDespesas.filter(f => f.categoria?.toLowerCase().includes('semente')).reduce((a, b) => a + b.valorR$, 0);
      const outras = safrasDespesas.filter(f => !['fertilizante', 'adubo', 'defensivo', 'semente'].some(k => f.categoria?.toLowerCase().includes(k))).reduce((a, b) => a + b.valorR$, 0);
      const area = s.areaHa > 0 ? s.areaHa : 1;
      return {
        cultura: `${s.cultura} (${s.nomeSafra})`,
        adubacao: Math.round(adubacao / area),
        defensivos: Math.round(defensivos / area),
        sementes: Math.round(sementes / area),
        operacoes: Math.round(outras / area),
      };
    });
  }, [safras, financeiro]);

  // Chart Data: Revenue and Cost per Plot
  const receitaPorTalhaoChartData = React.useMemo(() => {
    if (talhoes.length === 0) return [];
    return talhoes.map(t => {
      const talhaoReceita = financeiro.filter(f => f.tipo === 'receita' && f.talhaoId === t.id).reduce((a, b) => a + b.valorR$, 0);
      const talhaoCusto = financeiro.filter(f => f.tipo === 'despesa' && f.talhaoId === t.id).reduce((a, b) => a + b.valorR$, 0);
      const area = t.areaHa > 0 ? t.areaHa : 1;
      return {
        name: t.nome || t.codigo,
        receitaHa: Math.round(talhaoReceita / area),
        custoHa: Math.round(talhaoCusto / area),
      };
    });
  }, [talhoes, financeiro]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* TOP METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Receita */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Receita Bruta
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="block text-lg font-black text-slate-900 dark:text-white">
            R$ {(receitaTotal / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-slate-500">
            {receitaTotal > 0 ? 'Entradas acumuladas' : 'Sem receitas'}
          </span>
        </div>

        {/* Card 2: Lucro Líquido */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Lucro Líquido
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span className="block text-lg font-black text-slate-900 dark:text-white">
            R$ {(lucroLiquido / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-slate-500">
            Margem: {receitaTotal > 0 ? ((lucroLiquido / receitaTotal) * 100).toFixed(1) : 0}%
          </span>
        </div>

        {/* Card 3: Custo Total */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Custo Total
            </span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <span className="block text-lg font-black text-slate-900 dark:text-white">
            R$ {(despesaTotal / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-slate-500">
            {areaTotalPlantada > 0 ? `R$ ${(despesaTotal / areaTotalPlantada).toFixed(0)} / ha` : 'Sem área colhida'}
          </span>
        </div>

        {/* Card 4: Área Plantada */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Área Plantada
            </span>
            <Wheat className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="block text-lg font-black text-slate-900 dark:text-white">
            {areaTotalPlantada} ha
          </span>
          <span className="text-[10px] text-slate-500">Colhida: {areaTotalColhida} ha</span>
        </div>

        {/* Card 5: Produtividade */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Produtividade
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <span className="block text-lg font-black text-slate-900 dark:text-white">
            {produtividadeMediaSacas.toFixed(1)} sc/ha
          </span>
          <span className="text-[10px] text-slate-500">
            {safrasColhidas.length > 0 ? `${safrasColhidas.length} safra(s) colhida(s)` : 'Sem colheitas'}
          </span>
        </div>

        {/* Card 6: Contas a Pagar / Receber */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Contas P/R
            </span>
            <Calendar className="w-4 h-4 text-orange-500" />
          </div>
          <span className="block text-xs font-bold text-red-600 dark:text-red-400">
            Pagar: R$ {(contasPagar / 1000).toFixed(0)}k
          </span>
          <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Receber: R$ {(contasReceber / 1000).toFixed(0)}k
          </span>
        </div>

        {/* Card 7: Frota & RH */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Frota & RH
            </span>
            <Tractor className="w-4 h-4 text-blue-500" />
          </div>
          <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
            {maquinasAtivas} Máquinas Ativas
          </span>
          <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
            {funcionariosAtivos} Funcionários
          </span>
        </div>
      </div>

      {/* ALERT BANNERS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alert 1: Clima */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
          <CloudSun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Condições Climáticas & Janela Operacional
            </h4>
            <p className="text-amber-700 dark:text-amber-300/80">
              Consulte a aba Clima & ZARC para monitorar previsões de precipitação e janelas de plantio.
            </p>
          </div>
        </div>

        {/* Alert 2: Irrigação / Operações */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-start gap-3">
          <Droplets className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-blue-900 dark:text-blue-200">
              Operações de Campo & Manejo
            </h4>
            <p className="text-blue-700 dark:text-blue-300/80">
              {operacoes.length > 0 
                ? `${operacoes.length} operação(ões) registrada(s) no histórico da fazenda.` 
                : 'Nenhuma operação em andamento registrada no momento.'}
            </p>
          </div>
        </div>

        {/* Alert 3: Estoque Mínimo */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-2xl p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-red-900 dark:text-red-200">
              {alertasEstoqueCount} Alerta(s) de Insumos & Validade
            </h4>
            <p className="text-red-700 dark:text-red-300/80">
              {alertasEstoqueCount > 0 
                ? 'Existem insumos atingindo o estoque mínimo ou com validade próxima.' 
                : 'Nenhum insumo em nível crítico ou com validade expirada.'}
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 1: FLUXO DE CAIXA & CUSTOS POR CULTURA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fluxo de Caixa */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Fluxo de Caixa Agrícola (Entradas x Saídas)
              </h3>
              <p className="text-[11px] text-slate-500">Evolução mensal de receitas e despesas</p>
            </div>
            <button
              onClick={() => onNavigateTab('financeiro')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
            >
              Ver DRE Completo &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            {fluxoCaixaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fluxoCaixaChartData}>
                  <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    name="Receita (Entradas)"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    name="Despesa (Saídas)"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
                <DollarSign className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
                <p className="font-semibold text-xs text-slate-600 dark:text-zinc-300">Nenhum lançamento financeiro</p>
                <p className="text-[11px] text-slate-400">Cadastre receitas e despesas para acompanhar o fluxo de caixa.</p>
              </div>
            )}
          </div>
        </div>

        {/* Custos por Cultura */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Composição de Custos por Hectare (R$/ha)
              </h3>
              <p className="text-[11px] text-slate-500">Detalhamento por insumo e operação</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {custosPorCulturaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={custosPorCulturaChartData}>
                  <XAxis dataKey="cultura" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="adubacao" name="Adubação / Fertilizante" stackId="a" fill="#10b981" />
                  <Bar dataKey="defensivos" name="Defensivos" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="sementes" name="Sementes" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="operacoes" name="Máquinas & Mão de Obra" stackId="a" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
                <BarChart3 className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
                <p className="font-semibold text-xs text-slate-600 dark:text-zinc-300">Sem custos de safra apurados</p>
                <p className="text-[11px] text-slate-400">Cadastre safras e lance despesas para visualizar os custos por cultura.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: RECEITA POR TALHÃO & MAPA DE OPERAÇÕES RECENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Receita x Custo por Talhão */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Rentabilidade por Talhão (R$/ha)
          </h3>

          <div className="h-56 w-full">
            {receitaPorTalhaoChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receitaPorTalhaoChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip formatter={(value: any) => [`R$ ${value}/ha`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="receitaHa" name="Receita/ha" fill="#10b981" />
                  <Bar dataKey="custoHa" name="Custo/ha" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
                <p className="font-semibold text-xs text-slate-600 dark:text-zinc-300">Nenhum talhão cadastrado</p>
                <p className="text-[11px] text-slate-400">Cadastre talhões na aba Administração para calcular a rentabilidade.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo de Operações Recentes de Campo */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Tractor className="w-4 h-4 text-emerald-600" />
              Últimas Operações de Campo Lançadas
            </h3>
            <button
              onClick={() => onNavigateTab('operacoes')}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {operacoes.length > 0 ? (
              operacoes.slice(0, 3).map(op => (
                <div
                  key={op.id}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-zinc-100 block">
                      {op.tipoOperacao} • {op.talhaoNome}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {op.operadorNome || 'Operador não informado'} | {op.maquinaNome || 'Máquina não informada'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      {op.areaAplicadaHa} ha
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(op.dataHoraInicio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400">
                <Tractor className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-1" />
                <p className="font-semibold text-xs text-slate-600 dark:text-zinc-300">Nenhuma operação lançada</p>
                <p className="text-[11px] text-slate-400">Acesse a aba Operações de Campo para realizar o primeiro lançamento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
