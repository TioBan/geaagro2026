import React, { useState } from 'react';
import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  ProjetoRecuperacao,
  DiagnosticoTecnicoCompleto,
  StatusSincronizacaoRecupera
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
  Plus
} from 'lucide-react';

interface Props {
  propriedadeAtiva?: PropriedadeRecupera;
  areas: AreaDegradadaItem[];
  projetos: ProjetoRecuperacao[];
  diagnosticos: DiagnosticoTecnicoCompleto[];
  statusSync: StatusSincronizacaoRecupera;
  onNavigateTab: (tabKey: string) => void;
  onSelecionarArea: (areaId: string) => void;
  areaAtivaId: string;
}

export const RecuperaDashboardView: React.FC<Props> = ({
  propriedadeAtiva,
  areas,
  projetos,
  diagnosticos,
  statusSync,
  onNavigateTab,
  onSelecionarArea,
  areaAtivaId
}) => {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todas');

  // KPIs
  const totalAreas = areas.length;
  const areaDegradadaTotalHa = areas.reduce((acc, a) => acc + (a.areaHa || 0), 0);
  const areaEmRecuperacaoHa = areas
    .filter(a => a.statusRecuperacao === 'em_execucao' || a.statusRecuperacao === 'em_monitoramento' || a.statusRecuperacao === 'recuperada')
    .reduce((acc, a) => acc + (a.areaHa || 0), 0);

  const projetosEmAndamento = projetos.filter(p => p.statusProjeto === 'em_implantacao' || p.statusProjeto === 'em_manutencao').length;
  const projetosConcluidos = projetos.filter(p => p.statusProjeto === 'recuperado' || p.statusProjeto === 'concluido').length;

  const custoPrevistoTotal = projetos.reduce((acc, p) => acc + (p.orcamentoTotalPrevistoR$ || 0), 0);
  const custoRealizadoTotal = projetos.reduce((acc, p) => acc + (p.orcamentoTotalRealizadoR$ || 0), 0);

  const areasFiltradas = areas.filter(a => {
    if (filtroSeveridade === 'todas') return true;
    return a.grauSeveridade === filtroSeveridade;
  });

  return (
    <div className="space-y-6">
      {/* Header com Resumo da Fazenda Ativa e Status de Conexão */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                FASE 1 • FUNDAÇÃO & DIAGNÓSTICO
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                statusSync.modoOfflineAtivo
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusSync.modoOfflineAtivo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {statusSync.modoOfflineAtivo ? 'Offline Ativo' : 'Online / Sincronizado'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recupera • {propriedadeAtiva?.nome || 'Propriedade em Avaliação'}
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1">
              {propriedadeAtiva
                ? `${propriedadeAtiva.municipio || 'Município N/I'}/${propriedadeAtiva.estado || 'UF'} • Área Total da Fazenda: ${propriedadeAtiva.areaTotalHa || 0} ha • Produtor: ${propriedadeAtiva.produtorNome || 'Não cadastrado'}`
                : 'Nenhuma propriedade selecionada • Cadastre uma propriedade rural para iniciar'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('areas')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Área Degradada</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('calculadoras')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition border border-white/20 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Calculadoras</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Áreas Cadastradas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Áreas Registradas</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalAreas}
          </p>
          <span className="text-[10px] text-slate-500">Talhões mapeados</span>
        </div>

        {/* KPI 2: Área Degradada Total */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Área Degradada</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {areaDegradadaTotalHa.toLocaleString('pt-BR')} <span className="text-xs font-semibold">ha</span>
          </p>
          <span className="text-[10px] text-slate-500">Demanda de intervenção</span>
        </div>

        {/* KPI 3: Área em Recuperação */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Em Recuperação</span>
            <Sprout className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {areaEmRecuperacaoHa.toLocaleString('pt-BR')} <span className="text-xs font-semibold">ha</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {areaDegradadaTotalHa > 0 ? ((areaEmRecuperacaoHa / areaDegradadaTotalHa) * 100).toFixed(0) : 0}% sob manejo
          </span>
        </div>

        {/* KPI 4: Projetos Ativos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Projetos Ativos</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {projetosEmAndamento}
          </p>
          <span className="text-[10px] text-slate-500">{projetosConcluidos} concluídos</span>
        </div>

        {/* KPI 5: Diagnósticos Realizados */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Diagnósticos</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {diagnosticos.length}
          </p>
          <span className="text-[10px] text-slate-500">Laudos técnicos</span>
        </div>

        {/* KPI 6: Investimento Previsto */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Investimento</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            R$ {(custoPrevistoTotal / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-slate-500">Realizado: R$ {(custoRealizadoTotal / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Seção Principal: Lista de Áreas Degradadas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo (2 colunas): Áreas em Acompanhamento com Filtro */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Talhões & Áreas Degradadas Mapeadas</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecione uma área para visualizar diagnóstico, calculadora ou emitir laudo
              </p>
            </div>

            {/* Filtro por Severidade */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {['todas', 'leve', 'moderada', 'severa', 'muito_severa'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFiltroSeveridade(sev)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                    filtroSeveridade === sev
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sev === 'muito_severa' ? 'M. Severa' : sev}
                </button>
              ))}
            </div>
          </div>

          {/* Cards das Áreas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {areasFiltradas.length === 0 ? (
              <div className="sm:col-span-2 py-8 text-center text-slate-400 text-xs">
                Nenhuma área encontrada com o filtro selecionado.
              </div>
            ) : (
              areasFiltradas.map((a) => {
                const isSelected = a.id === areaAtivaId;
                return (
                  <div
                    key={a.id}
                    onClick={() => onSelecionarArea(a.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {a.nomeTalhao}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        a.grauSeveridade === 'muito_severa'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : a.grauSeveridade === 'severa'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : a.grauSeveridade === 'moderada'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {a.grauSeveridade.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {a.tipoDegradacao.replace(/_/g, ' ').toUpperCase()} • {a.areaHa} ha
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-500">
                      <span>Status: <strong className="text-slate-700 dark:text-slate-300">{a.statusRecuperacao.replace('_', ' ')}</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelecionarArea(a.id);
                          onNavigateTab('diagnostico');
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Ver Diagnóstico →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito (1 coluna): Roteiro de Trabalho & Acesso às 7 Fases */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Ciclo Agronômico Integrado</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o fluxo técnico de recuperação completo da área ativa
          </p>

          <div className="space-y-2 pt-1 text-xs">
            {[
              { num: '1', label: 'Cadastros & Mapeamento', tab: 'areas', desc: 'Propriedade, talhões e polígonos' },
              { num: '2', label: 'Diagnóstico & Solo', tab: 'diagnostico', desc: 'Físico, químico, biológico e pastagens' },
              { num: '3', label: 'Calculadoras Agronômicas', tab: 'calculadoras', desc: 'Calagem, gessagem, NPK e sementes' },
              { num: '4', label: 'Estratégias & Projetos', tab: 'projetos', desc: 'Reforma de pasto, cobertura e PRAD' },
              { num: '5', label: 'Mapas & Monitoramento IGRA', tab: 'monitoramento', desc: 'GPS, fotos antes/depois e 5 dimensões' },
              { num: '6', label: 'Custos, Cronograma & Relatórios', tab: 'relatorios', desc: '13 modelos em PDF e orçamentos' },
              { num: '7', label: 'Biblioteca Técnica Embrapa', tab: 'biblioteca', desc: 'Manuais Embrapa, IAC e normas técnicas' }
            ].map((fase) => (
              <button
                key={fase.tab}
                type="button"
                onClick={() => onNavigateTab(fase.tab)}
                className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition flex items-center gap-3 text-left group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  {fase.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition truncate">
                    {fase.label}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{fase.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab('relatorios')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Emitir Laudo / Relatório PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
