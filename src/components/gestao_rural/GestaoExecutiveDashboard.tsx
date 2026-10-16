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
      : 86.4;

  const maquinasAtivas = maquinas.filter(m => m.status === 'ativo').length;
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const alertasEstoqueCount = estoque.filter(
    e => e.statusAlerta === 'minimo' || e.statusAlerta === 'vencendo' || e.statusAlerta === 'vencido'
  ).length;

  // Chart Data: Cash Flow
  const fluxoCaixaChartData = [
    { mes: 'Out/25', receita: 120000, despesa: 380000, saldo: -260000 },
    { mes: 'Nov/25', receita: 150000, despesa: 140000, saldo: 10000 },
    { mes: 'Dez/25', receita: 80000, despesa: 95000, saldo: -15000 },
    { mes: 'Jan/26', receita: 320000, despesa: 120000, saldo: 200000 },
    { mes: 'Fev/26', receita: 1407468, despesa: 106666, saldo: 1300802 },
    { mes: 'Mar/26', receita: 450000, despesa: 180000, saldo: 270000 },
  ];

  // Chart Data: Costs per Crop
  const custosPorCulturaChartData = [
    { cultura: 'Soja Verão', adubacao: 1850, defensivos: 920, sementes: 420, operacoes: 680 },
    { cultura: 'Milho Safrinha', adubacao: 2100, defensivos: 780, sementes: 580, operacoes: 740 },
    { cultura: 'Tomate HF', adubacao: 8500, defensivos: 6200, sementes: 1800, operacoes: 4500 },
  ];

  // Chart Data: Revenue per Plot
  const receitaPorTalhaoChartData = talhoes.map((t, idx) => ({
    name: t.nome,
    receitaHa: idx === 0 ? 11978 : idx === 1 ? 9840 : 28500,
    custoHa: idx === 0 ? 3870 : idx === 1 ? 4220 : 21000,
  }));

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
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs 2025
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
          <span className="text-[10px] text-slate-500">Margem: 72.8%</span>
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
          <span className="text-[10px] text-slate-500">R$ 3.870 / ha</span>
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
          <span className="text-[10px] text-emerald-600 font-bold">+5.3% meta</span>
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
              Alerta de Janela ZARC & Chuva
            </h4>
            <p className="text-amber-700 dark:text-amber-300/80">
              Previsão de 14.5 mm de precipitação em 24h. Ideal para início de irrigação sob demanda.
            </p>
          </div>
        </div>

        {/* Alert 2: Irrigação */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-start gap-3">
          <Droplets className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-blue-900 dark:text-blue-200">
              Fertirrigação em Andamento
            </h4>
            <p className="text-blue-700 dark:text-blue-300/80">
              Pivô Central Sul injetando 45 kg N/ha com compatibilidade físico-química otimizada.
            </p>
          </div>
        </div>

        {/* Alert 3: Estoque Mínimo */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-2xl p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-red-900 dark:text-red-200">
              {alertasEstoqueCount} Alertas de Insumos & Validade
            </h4>
            <p className="text-red-700 dark:text-red-300/80">
              Item Priori Xtra (Defensivo) com validade para nov/26. Verifique almoxarifado.
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
            {operacoes.slice(0, 3).map(op => (
              <div
                key={op.id}
                className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-zinc-100 block">
                    {op.tipoOperacao} • {op.talhaoNome}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {op.operadorNome} | {op.maquinaNome}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
