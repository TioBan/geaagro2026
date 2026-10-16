import React from 'react';
import {
  Landmark,
  Building,
  Tractor,
  Truck,
  Tag,
  Trees,
  Sprout,
  Scale,
  CheckCircle2,
  PieChart,
  Sparkles,
  Download,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PericiaAvaliacaoImovel } from '../../../types/pericia';
import {
  calcularResumoValoresImovel,
  createDefaultBenfeitorias,
  createDefaultMaquinasEquipamentos,
  createDefaultVeiculos,
  createDefaultSemoventes,
  createDefaultRecursosNaturais,
  createDefaultFrutos,
  createDefaultDireitos,
} from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoResumoGlobalTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  areaTotalImovelHa: number;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onNavigateTab: (tabKey: any) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoResumoGlobalTab: React.FC<AvaliacaoResumoGlobalTabProps> = ({
  avaliacao,
  areaTotalImovelHa,
  onUpdateAvaliacao,
  onNavigateTab,
  onShowNotification,
}) => {
  const resumo = calcularResumoValoresImovel(avaliacao, areaTotalImovelHa);

  const handleToggleComponent = (field: keyof PericiaAvaliacaoImovel, currentState: boolean | undefined) => {
    const nextState = !(currentState !== false);
    onUpdateAvaliacao({
      ...avaliacao,
      [field]: nextState,
    });
  };

  const handleLoadAllDefaults = () => {
    onUpdateAvaliacao({
      ...avaliacao,
      incluirBenfeitorias: true,
      benfeitorias: avaliacao.benfeitorias?.length ? avaliacao.benfeitorias : createDefaultBenfeitorias(),

      incluirMaquinasEquipamentos: true,
      maquinasEquipamentos: avaliacao.maquinasEquipamentos?.length ? avaliacao.maquinasEquipamentos : createDefaultMaquinasEquipamentos(),

      incluirVeiculos: true,
      veiculos: avaliacao.veiculos?.length ? avaliacao.veiculos : createDefaultVeiculos(),

      incluirSemoventes: true,
      semoventes: avaliacao.semoventes?.length ? avaliacao.semoventes : createDefaultSemoventes(),

      incluirRecursosNaturais: true,
      recursosNaturais: avaliacao.recursosNaturais?.length ? avaliacao.recursosNaturais : createDefaultRecursosNaturais(),

      incluirFrutos: true,
      frutos: avaliacao.frutos?.length ? avaliacao.frutos : createDefaultFrutos(),

      incluirDireitos: true,
      direitos: avaliacao.direitos?.length ? avaliacao.direitos : createDefaultDireitos(),
    });
    onShowNotification('Todos os 7 componentes da NBR 14653-3 foram carregados com dados de demonstração!');
  };

  const componentsList = [
    {
      key: 'terra_nua',
      title: 'Terra Nua (VTN)',
      subtitle: 'Capacidade de uso e mercado',
      valor: resumo.valorTerraNuaBrl,
      percent: resumo.percentTerraNua,
      icon: Landmark,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      active: true,
      canToggle: false,
      tabTarget: 'terra_nua',
    },
    {
      key: 'benfeitorias',
      title: 'Benfeitorias',
      subtitle: `${resumo.totalBenfeitorias} itens cadastrados`,
      valor: resumo.valorBenfeitoriasBrl,
      percent: resumo.percentBenfeitorias,
      icon: Building,
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-800',
      active: avaliacao.incluirBenfeitorias !== false,
      canToggle: true,
      toggleField: 'incluirBenfeitorias' as const,
      tabTarget: 'benfeitorias',
    },
    {
      key: 'maquinas',
      title: 'Máquinas e Equipamentos',
      subtitle: `${resumo.totalMaquinas} equipamentos`,
      valor: resumo.valorMaquinasEquipamentosBrl,
      percent: resumo.percentMaquinas,
      icon: Tractor,
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800',
      active: avaliacao.incluirMaquinasEquipamentos !== false,
      canToggle: true,
      toggleField: 'incluirMaquinasEquipamentos' as const,
      tabTarget: 'maquinas',
    },
    {
      key: 'veiculos',
      title: 'Veículos e Frota',
      subtitle: `${resumo.totalVeiculos} veículos`,
      valor: resumo.valorVeiculosBrl,
      percent: resumo.percentVeiculos,
      icon: Truck,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      active: avaliacao.incluirVeiculos !== false,
      canToggle: true,
      toggleField: 'incluirVeiculos' as const,
      tabTarget: 'veiculos',
    },
    {
      key: 'semoventes',
      title: 'Semoventes (Rebanho)',
      subtitle: `${resumo.totalSemoventesCabecas} cabeças de gado/animais`,
      valor: resumo.valorSemoventesBrl,
      percent: resumo.percentSemoventes,
      icon: Tag,
      color: 'bg-orange-500',
      textColor: 'text-orange-700 dark:text-orange-400',
      bgLight: 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: 'border-orange-200 dark:border-orange-800',
      active: avaliacao.incluirSemoventes !== false,
      canToggle: true,
      toggleField: 'incluirSemoventes' as const,
      tabTarget: 'semoventes',
    },
    {
      key: 'recursos',
      title: 'Recursos Naturais',
      subtitle: `${resumo.totalRecursos} recursos/outorgas`,
      valor: resumo.valorRecursosNaturaisBrl,
      percent: resumo.percentRecursosNaturais,
      icon: Trees,
      color: 'bg-teal-500',
      textColor: 'text-teal-700 dark:text-teal-400',
      bgLight: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-200 dark:border-teal-800',
      active: avaliacao.incluirRecursosNaturais !== false,
      canToggle: true,
      toggleField: 'incluirRecursosNaturais' as const,
      tabTarget: 'recursos',
    },
    {
      key: 'frutos',
      title: 'Frutos (Safras Pendentes)',
      subtitle: `${resumo.totalFrutosHa} ha cultivados`,
      valor: resumo.valorFrutosBrl,
      percent: resumo.percentFrutos,
      icon: Sprout,
      color: 'bg-lime-500',
      textColor: 'text-lime-700 dark:text-lime-400',
      bgLight: 'bg-lime-50 dark:bg-lime-950/40',
      borderColor: 'border-lime-200 dark:border-lime-800',
      active: avaliacao.incluirFrutos !== false,
      canToggle: true,
      toggleField: 'incluirFrutos' as const,
      tabTarget: 'frutos',
    },
    {
      key: 'direitos',
      title: 'Direitos e Servidões',
      subtitle: `${resumo.totalDireitos} registros (saldo líquido)`,
      valor: resumo.valorDireitosBrl,
      percent: resumo.percentDireitos,
      icon: Scale,
      color: 'bg-purple-500',
      textColor: 'text-purple-700 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-200 dark:border-purple-800',
      active: avaliacao.incluirDireitos !== false,
      canToggle: true,
      toggleField: 'incluirDireitos' as const,
      tabTarget: 'direitos',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Card Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl border border-blue-800/40 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valoração Patrimonial Global • ABNT NBR 14653-3</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              5.2.10 Quadro Resumo da Valoração Global do Imóvel Rural
            </h3>
            <p className="text-slate-300 text-xs max-w-2xl">
              Consolidação de todos os componentes da propriedade (Terra Nua, Benfeitorias, Máquinas, Veículos, Semoventes, Recursos Naturais, Frutos e Direitos/Gravames).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('inventario_ativos')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Tractor className="w-4 h-4 text-emerald-400" />
              <span>Inventário de Ativos (Máq./Equip./Veíc.)</span>
            </button>
            <button
              type="button"
              onClick={handleLoadAllDefaults}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Carregar Todos os 7 Componentes (Demo)</span>
            </button>
          </div>
        </div>

        {/* Big Total Box */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Valor Total do Imóvel Periciado (Porteira Fechada / Patrimônio Global)
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 mt-1">
              {resumo.valorTotalImovelBrl.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              })}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {areaTotalImovelHa > 0 ? `Gleba de ${areaTotalImovelHa} ha` : 'Área do imóvel'} • Valor Global apurado para a data base pericial
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              Valor Médio Global / Hectare
            </span>
            <div className="text-2xl font-mono font-bold text-blue-300 mt-1">
              {areaTotalImovelHa > 0
                ? (resumo.valorTotalImovelBrl / areaTotalImovelHa).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })
                : 'R$ 0'}
              <span className="text-xs font-normal text-slate-400">/ha</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Terra Nua + Todos os Acessórios
            </span>
          </div>
        </div>

        {/* Proportional Stack Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Composição Proporcional do Patrimônio Rural</span>
            <span className="text-emerald-400">100% Consolidado</span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {componentsList.map(
              c =>
                c.active &&
                c.percent > 0 && (
                  <div
                    key={c.key}
                    className={`${c.color} h-full transition-all`}
                    style={{ width: `${c.percent}%` }}
                    title={`${c.title}: ${c.percent}%`}
                  />
                )
            )}
          </div>
        </div>
      </div>

      {/* Grid of Component Cards with Quick Toggles & Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {componentsList.map(c => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className={`p-4 rounded-2xl border transition-all ${
                c.active ? `${c.bgLight} ${c.borderColor}` : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      c.active ? `${c.color} text-white` : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block">
                      {c.subtitle}
                    </span>
                  </div>
                </div>

                {c.canToggle && (
                  <button
                    type="button"
                    onClick={() => handleToggleComponent(c.toggleField!, c.active)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase cursor-pointer transition-all ${
                      c.active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {c.active ? 'Ativo' : 'Oculto'}
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-end justify-between">
                <div>
                  <div className={`text-base font-mono font-bold ${c.textColor}`}>
                    {c.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {c.percent}% do imóvel
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab(c.tabTarget)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Acessar Detalhes deste Componente"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synthesis Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Quadro Demonstrativo de Valoração Patrimonial (ABNT NBR 14653-3)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                <th className="p-3">Componente Patrimonial</th>
                <th className="p-3">Metodologia Normativa</th>
                <th className="p-3 text-center">Status no Laudo</th>
                <th className="p-3 text-right">Valor Total Apurado (R$)</th>
                <th className="p-3 text-right">Participação (%)</th>
              </tr>
            </thead>
            <tbody>
              {componentsList.map(c => (
                <tr
                  key={c.key}
                  className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 ${
                    !c.active ? 'opacity-40 line-through' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <c.icon className="w-4 h-4 text-slate-400" />
                    <span>{c.title}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-zinc-400 text-[11px]">
                    {c.key === 'terra_nua' && 'Método Comparativo Direto de Dados de Mercado'}
                    {c.key === 'benfeitorias' && 'Método do Custo de Reedição Depreciado (Ross-Heidecke)'}
                    {c.key === 'maquinas' && 'Pesquisa de Mercado / Cotações Diretas de Revendas'}
                    {c.key === 'veiculos' && 'Tabela FIPE e Vistoria com Coeficiente de Conservação'}
                    {c.key === 'semoventes' && 'Censo Zootécnico e Cotação da Arroba / Matriz CEPEA'}
                    {c.key === 'recursos' && 'Valoração Econômica de Serviços Ambientais / Outorgas'}
                    {c.key === 'frutos' && 'Método do Custo Invertido / Renda Futura Descontada'}
                    {c.key === 'direitos' && 'Indenização de Faixa de Servidão e Capitalização da Renda'}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {c.active ? 'Incluído' : 'Excluído'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {c.active
                      ? c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                    {c.active ? `${c.percent}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-zinc-800 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-zinc-700">
                <td colSpan={3} className="p-3 text-right uppercase text-xs">
                  Valor Total Global do Imóvel Rural:
                </td>
                <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                  {resumo.valorTotalImovelBrl.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
