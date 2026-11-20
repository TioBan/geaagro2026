import React, { useState, useMemo } from 'react';
import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  ProjetoRecuperacao,
  DiagnosticoTecnicoCompleto
} from '../../types/recupera';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  Layers,
  Sprout,
  ShieldCheck,
  Filter,
  Plus,
  ArrowRight
} from 'lucide-react';

interface Props {
  propriedadeAtiva?: PropriedadeRecupera;
  areas: AreaDegradadaItem[];
  projetos: ProjetoRecuperacao[];
  diagnosticos: DiagnosticoTecnicoCompleto[];
  onNavigateTab: (tabKey: string) => void;
  onSelecionarArea: (areaId: string) => void;
  areaAtivaId: string;
}

const SEVERIDADE_STYLES: Record<string, string> = {
  muito_severa: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
  severa: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60',
  moderada: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  leve: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
};

export const RecuperaDashboardView: React.FC<Props> = ({
  propriedadeAtiva,
  areas,
  projetos,
  diagnosticos,
  onNavigateTab,
  onSelecionarArea,
  areaAtivaId
}) => {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todas');

  const kpis = useMemo(() => {
    const areaDegradadaTotalHa = areas.reduce((acc, a) => acc + (a.areaHa || 0), 0);
    const areaEmRecuperacaoHa = areas
      .filter(a => a.statusRecuperacao === 'em_execucao' || a.statusRecuperacao === 'em_monitoramento' || a.statusRecuperacao === 'recuperada')
      .reduce((acc, a) => acc + (a.areaHa || 0), 0);
    const projetosEmAndamento = projetos.filter(p => p.statusProjeto === 'em_implantacao' || p.statusProjeto === 'em_manutencao').length;
    const projetosConcluidos = projetos.filter(p => p.statusProjeto === 'recuperado' || p.statusProjeto === 'concluido').length;
    const custoPrevistoTotal = projetos.reduce((acc, p) => acc + (p.orcamentoTotalPrevistoR$ || 0), 0);
    const custoRealizadoTotal = projetos.reduce((acc, p) => acc + (p.orcamentoTotalRealizadoR$ || 0), 0);
    return {
      totalAreas: areas.length,
      areaDegradadaTotalHa,
      areaEmRecuperacaoHa,
      pctSobManejo: areaDegradadaTotalHa > 0 ? Math.round((areaEmRecuperacaoHa / areaDegradadaTotalHa) * 100) : 0,
      projetosEmAndamento,
      projetosConcluidos,
      custoPrevistoTotal,
      custoRealizadoTotal
    };
  }, [areas, projetos]);

  const areasFiltradas = useMemo(() => {
    if (filtroSeveridade === 'todas') return areas;
    return areas.filter(a => a.grauSeveridade === filtroSeveridade);
  }, [areas, filtroSeveridade]);

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Propriedade Ativa */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Fase 1 • Fundação & Diagnóstico
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
            {propriedadeAtiva?.nome || 'Propriedade em Avaliação'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {propriedadeAtiva
              ? `${propriedadeAtiva.municipio || 'Município N/I'}/${propriedadeAtiva.estado || 'UF'} • Área total: ${(propriedadeAtiva.areaTotalHa || 0).toLocaleString('pt-BR')} ha • Produtor: ${propriedadeAtiva.produtorNome || 'Não cadastrado'}`
              : 'Nenhuma propriedade selecionada. Cadastre uma propriedade rural para iniciar.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateTab('areas')}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Área Degradada</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('calculadoras')}
            className="h-9 px-3.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs rounded-lg transition border border-slate-200 dark:border-zinc-700 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Calculadoras</span>
          </button>
        </div>
      </div>

      {/* Faixa Unificada de KPIs */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Áreas Registradas</span>
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
            {kpis.totalAreas}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Talhões mapeados</span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Área Degradada</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {kpis.areaDegradadaTotalHa.toLocaleString('pt-BR')} <span className="text-xs font-medium">ha</span>
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Demanda de intervenção</span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Em Recuperação</span>
            <Sprout className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {kpis.areaEmRecuperacaoHa.toLocaleString('pt-BR')} <span className="text-xs font-medium">ha</span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
            {kpis.pctSobManejo}% sob manejo
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Projetos Ativos</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
            {kpis.projetosEmAndamento}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
            {kpis.projetosConcluidos} concluídos
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Diagnósticos</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
            {diagnosticos.length}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Laudos técnicos</span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Investimento</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums truncate">
            R$ {(kpis.custoPrevistoTotal / 1000).toFixed(0)}k
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
            Realizado: R$ {(kpis.custoRealizadoTotal / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Seção Principal: Lista de Áreas Degradadas e Ciclo Integrado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Painel Esquerdo: Áreas em Acompanhamento */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Talhões & Áreas Degradadas Mapeadas</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione uma área para visualizar diagnóstico, calculadora ou emitir laudo
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-1 rounded-lg text-[11px] overflow-x-auto">
              <Filter className="w-3 h-3 text-slate-400 dark:text-zinc-500 ml-1 shrink-0" />
              {['todas', 'leve', 'moderada', 'severa', 'muito_severa'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFiltroSeveridade(sev)}
                  className={`px-2 py-1 rounded-md font-medium capitalize transition whitespace-nowrap ${
                    filtroSeveridade === sev
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {sev === 'muito_severa' ? 'M. Severa' : sev}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {areasFiltradas.length === 0 ? (
              <div className="sm:col-span-2 py-8 px-4 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {areas.length === 0
                    ? 'Nenhuma área degradada cadastrada para esta propriedade.'
                    : 'Nenhuma área encontrada com o filtro selecionado.'}
                </p>
                {areas.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('areas')}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Primeira Área</span>
                  </button>
                )}
              </div>
            ) : (
              areasFiltradas.map(a => {
                const isSelected = a.id === areaAtivaId;
                return (
                  <div
                    key={a.id}
                    onClick={() => onSelecionarArea(a.id)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-950/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {a.nomeTalhao}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase border shrink-0 ${
                          SEVERIDADE_STYLES[a.grauSeveridade] || SEVERIDADE_STYLES.leve
                        }`}
                      >
                        {a.grauSeveridade.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 tabular-nums">
                      {a.tipoDegradacao.replace(/_/g, ' ').toUpperCase()} • {a.areaHa.toLocaleString('pt-BR')} ha
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      <span>
                        Status:{' '}
                        <strong className="font-medium text-slate-700 dark:text-zinc-200">
                          {a.statusRecuperacao.replace('_', ' ')}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSelecionarArea(a.id);
                          onNavigateTab('diagnostico');
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>Diagnóstico</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Roteiro de Trabalho */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ciclo Agronômico Integrado</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Fluxo técnico completo de recuperação da área ativa
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/70 dark:border-zinc-800 rounded-lg overflow-hidden">
              {[
                { num: '1', label: 'Cadastros & Mapeamento', tab: 'areas', desc: 'Propriedade, talhões e polígonos' },
                { num: '2', label: 'Diagnóstico & Solo', tab: 'diagnostico', desc: 'Físico, químico, biológico e pastagens' },
                { num: '3', label: 'Calculadoras Agronômicas', tab: 'calculadoras', desc: 'Calagem, gessagem, NPK e sementes' },
                { num: '4', label: 'Estratégias & Projetos', tab: 'projetos', desc: 'Reforma de pasto, cobertura e PRAD' },
                { num: '5', label: 'Mapas & Monitoramento IGRA', tab: 'monitoramento', desc: 'GPS, fotos antes/depois e 5 dimensões' },
                { num: '6', label: 'Custos, Cronograma & Relatórios', tab: 'relatorios', desc: '13 modelos em PDF e orçamentos' },
                { num: '7', label: 'Biblioteca Técnica Embrapa', tab: 'biblioteca', desc: 'Manuais Embrapa, IAC e normas técnicas' }
              ].map(fase => (
                <button
                  key={fase.tab}
                  type="button"
                  onClick={() => onNavigateTab(fase.tab)}
                  className="w-full px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition flex items-center gap-2.5 text-left group"
                >
                  <span className="w-5 h-5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center shrink-0 text-[11px] tabular-nums">
                    {fase.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                      {fase.label}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{fase.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('relatorios')}
            className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition inline-flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Emitir Laudo / Relatório PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
