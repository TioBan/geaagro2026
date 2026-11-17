import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import {
  PropriedadeRuralAvaliacao,
  SolicitanteAvaliacao,
  BenfeitoriaItem,
  ImovelComparativoMercado,
  VistoriaTecnica,
  DocumentoDueDiligence,
  SimuladorCenarioMelhoria,
  AvaliacaoCompletaImovel,
  MetodoAvaliacaoPrincipal,
  CaracterizacaoSoloTopografia,
  AptidaoCapacidadeUsoInfo,
  MetodoCapitalizacaoRendaConfig,
  MetodoEvolutivoConfig
} from '../types/avaliacaoImoveis';
import {
  carregarPropriedades,
  salvarPropriedades,
  carregarPropriedadeSelecionadaId,
  salvarPropriedadeSelecionadaId,
  carregarSolicitante,
  salvarSolicitante,
  carregarBenfeitorias,
  salvarBenfeitorias,
  carregarComparativos,
  salvarComparativos,
  carregarVistoria,
  salvarVistoria,
  carregarDueDiligence,
  salvarDueDiligence,
  carregarSimuladores,
  salvarSimuladores,
  carregarAvaliacaoCompleta,
  salvarAvaliacaoCompleta,
  resetarTodosOsDadosAvaliacao
} from '../utils/avaliacaoImoveisStorage';
import {
  calcularEstatisticasTratamento,
  calcularIndicadoresExclusivosGeaAgro
} from '../utils/avaliacaoImoveisCalculos';

// Subviews carregadas sob demanda (Code Splitting)
const AvaliacaoDashboardView = lazy(() => import('./avaliacao_imoveis/AvaliacaoDashboardView').then(m => ({ default: m.AvaliacaoDashboardView })));
const AvaliacaoPropriedadesView = lazy(() => import('./avaliacao_imoveis/AvaliacaoPropriedadesView').then(m => ({ default: m.AvaliacaoPropriedadesView })));
const AvaliacaoSolicitantesView = lazy(() => import('./avaliacao_imoveis/AvaliacaoSolicitantesView').then(m => ({ default: m.AvaliacaoSolicitantesView })));
const AvaliacaoVistoriasView = lazy(() => import('./avaliacao_imoveis/AvaliacaoVistoriasView').then(m => ({ default: m.AvaliacaoVistoriasView })));
const AvaliacaoBenfeitoriasView = lazy(() => import('./avaliacao_imoveis/AvaliacaoBenfeitoriasView').then(m => ({ default: m.AvaliacaoBenfeitoriasView })));
const AvaliacaoAptidaoSolosView = lazy(() => import('./avaliacao_imoveis/AvaliacaoAptidaoSolosView').then(m => ({ default: m.AvaliacaoAptidaoSolosView })));
const AvaliacaoPesquisaMercadoView = lazy(() => import('./avaliacao_imoveis/AvaliacaoPesquisaMercadoView').then(m => ({ default: m.AvaliacaoPesquisaMercadoView })));
const AvaliacaoTratamentoEstatisticoView = lazy(() => import('./avaliacao_imoveis/AvaliacaoTratamentoEstatisticoView').then(m => ({ default: m.AvaliacaoTratamentoEstatisticoView })));
const AvaliacaoMetodosView = lazy(() => import('./avaliacao_imoveis/AvaliacaoMetodosView').then(m => ({ default: m.AvaliacaoMetodosView })));
const AvaliacaoMapaInteligenteView = lazy(() => import('./avaliacao_imoveis/AvaliacaoMapaInteligenteView').then(m => ({ default: m.AvaliacaoMapaInteligenteView })));
const AvaliacaoDueDiligenceView = lazy(() => import('./avaliacao_imoveis/AvaliacaoDueDiligenceView').then(m => ({ default: m.AvaliacaoDueDiligenceView })));
const AvaliacaoSimuladorCenariosView = lazy(() => import('./avaliacao_imoveis/AvaliacaoSimuladorCenariosView').then(m => ({ default: m.AvaliacaoSimuladorCenariosView })));
const AvaliacaoLaudoEmissaoView = lazy(() => import('./avaliacao_imoveis/AvaliacaoLaudoEmissaoView').then(m => ({ default: m.AvaliacaoLaudoEmissaoView })));
const AvaliacaoIndicadoresGeaAgroView = lazy(() => import('./avaliacao_imoveis/AvaliacaoIndicadoresGeaAgroView').then(m => ({ default: m.AvaliacaoIndicadoresGeaAgroView })));
const AvaliacaoIaAssistenteView = lazy(() => import('./avaliacao_imoveis/AvaliacaoIaAssistenteView').then(m => ({ default: m.AvaliacaoIaAssistenteView })));
const AvaliacaoBibliotecaNormasView = lazy(() => import('./avaliacao_imoveis/AvaliacaoBibliotecaNormasView').then(m => ({ default: m.AvaliacaoBibliotecaNormasView })));

const SubviewFallback = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 animate-pulse space-y-4">
    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-lg" />
  </div>
);

import {
  LayoutDashboard,
  Building,
  UserCheck,
  ClipboardCheck,
  Building2,
  Shovel,
  TrendingUp,
  Sigma,
  Scale,
  MapPin,
  FileCheck2,
  Sparkles,
  FileText,
  Award,
  Bot,
  BookOpen,
  Plus,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  X
} from 'lucide-react';

interface Props {
  initialSubTab?: string;
}

export const AvaliacaoImoveisModule: React.FC<Props> = ({ initialSubTab }) => {
  // Propriedades
  const [propriedades, setPropriedades] = useState<PropriedadeRuralAvaliacao[]>(() => carregarPropriedades());
  const [propriedadeAtivaId, setPropriedadeAtivaId] = useState<string>(() => carregarPropriedadeSelecionadaId());

  // Propriedade selecionada
  const propriedadeAtiva = propriedades.find((p) => p.id === propriedadeAtivaId) || propriedades[0];

  // Subdados atrelados à propriedade ativa
  const [solicitante, setSolicitante] = useState<SolicitanteAvaliacao>(() => carregarSolicitante(propriedadeAtiva.id));
  const [benfeitorias, setBenfeitorias] = useState<BenfeitoriaItem[]>(() => carregarBenfeitorias(propriedadeAtiva.id));
  const [comparativos, setComparativos] = useState<ImovelComparativoMercado[]>(() => carregarComparativos());
  const [vistoria, setVistoria] = useState<VistoriaTecnica>(() => carregarVistoria(propriedadeAtiva.id));
  const [dueDiligence, setDueDiligence] = useState<DocumentoDueDiligence[]>(() => carregarDueDiligence(propriedadeAtiva.id));
  const [simuladores, setSimuladores] = useState<SimuladorCenarioMelhoria[]>(() => carregarSimuladores(propriedadeAtiva.id));
  const [avaliacao, setAvaliacao] = useState<AvaliacaoCompletaImovel>(() => carregarAvaliacaoCompleta(propriedadeAtiva.id));

  // Aba ativa
  const [activeTab, setActiveTab] = useState<string>(initialSubTab || 'dashboard');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Ao trocar de propriedade ativa
  const handleTrocarPropriedade = (novoId: string) => {
    salvarPropriedadeSelecionadaId(novoId);
    setPropriedadeAtivaId(novoId);
    setSolicitante(carregarSolicitante(novoId));
    setBenfeitorias(carregarBenfeitorias(novoId));
    setVistoria(carregarVistoria(novoId));
    setDueDiligence(carregarDueDiligence(novoId));
    setSimuladores(carregarSimuladores(novoId));
    setAvaliacao(carregarAvaliacaoCompleta(novoId));
  };

  // Recalcula avaliação completa com base nos dados mais recentes
  const triggerRecalculoGeral = (
    prop: PropriedadeRuralAvaliacao,
    benfs: BenfeitoriaItem[],
    comps: ImovelComparativoMercado[]
  ) => {
    const validComps = comps.filter((c) => c.statusInclusao === 'incluido');
    const est = calcularEstatisticasTratamento(validComps, { areaAvaliandoHa: prop.areaTotalHa || 500 });
    const ind = calcularIndicadoresExclusivosGeaAgro(prop, benfs, validComps);

    const valorTerraNuaR$ = prop.areaTotalHa * est.mediaR$PorHa;
    const valorBenfeitoriasR$ = benfs.reduce((acc, b) => acc + (b.valorDepreciadoFinalR$ || 0), 0);
    const valorFinalImovelR$ = valorTerraNuaR$ + valorBenfeitoriasR$;

    const atualizada: AvaliacaoCompletaImovel = {
      ...avaliacao,
      propriedadeId: prop.id,
      valorTotalHomogeneizadoR$: valorTerraNuaR$,
      valorTotalBenfeitoriasR$: valorBenfeitoriasR$,
      valorFinalImovelR$: valorFinalImovelR$,
      intervaloAdmissivelMinR$: valorFinalImovelR$ * 0.85,
      intervaloAdmissivelMaxR$: valorFinalImovelR$ * 1.15,
      grauFundamentacao: est.grauFundamentacaoApurado,
      grauPrecisao: est.grauPrecisaoApurado,
      estatistica: est,
      indicadores: ind
    };

    setAvaliacao(atualizada);
    salvarAvaliacaoCompleta(prop.id, atualizada);
  };

  // Handlers de Salvamento
  const handleSalvarPropriedade = (novaProp: PropriedadeRuralAvaliacao) => {
    const lista = propriedades.map((p) => (p.id === novaProp.id ? novaProp : p));
    setPropriedades(lista);
    salvarPropriedades(lista);
    triggerRecalculoGeral(novaProp, benfeitorias, comparativos);
  };

  const handleSalvarSolicitante = (novoSol: SolicitanteAvaliacao) => {
    setSolicitante(novoSol);
    salvarSolicitante(propriedadeAtiva.id, novoSol);
  };

  const handleSalvarBenfeitorias = (novasBenf: BenfeitoriaItem[]) => {
    setBenfeitorias(novasBenf);
    salvarBenfeitorias(propriedadeAtiva.id, novasBenf);
    triggerRecalculoGeral(propriedadeAtiva, novasBenf, comparativos);
  };

  const handleSalvarComparativos = (novosComps: ImovelComparativoMercado[]) => {
    setComparativos(novosComps);
    salvarComparativos(novosComps);
    triggerRecalculoGeral(propriedadeAtiva, benfeitorias, novosComps);
  };

  const handleSalvarVistoria = (novaVist: VistoriaTecnica) => {
    setVistoria(novaVist);
    salvarVistoria(propriedadeAtiva.id, novaVist);
  };

  const handleSalvarDueDiligence = (novosDocs: DocumentoDueDiligence[]) => {
    setDueDiligence(novosDocs);
    salvarDueDiligence(propriedadeAtiva.id, novosDocs);
  };

  const handleSalvarSimuladores = (novosSims: SimuladorCenarioMelhoria[]) => {
    setSimuladores(novosSims);
    salvarSimuladores(propriedadeAtiva.id, novosSims);
  };

  const handleSalvarSolosAptidao = (
    solos: CaracterizacaoSoloTopografia,
    apt: AptidaoCapacidadeUsoInfo
  ) => {
    const atualizada: PropriedadeRuralAvaliacao = {
      ...propriedadeAtiva,
      solosTopografia: solos,
      aptidao: apt
    };
    handleSalvarPropriedade(atualizada);
  };

  const handleAtualizarMetodoPrincipal = (metodo: MetodoAvaliacaoPrincipal) => {
    const atualizada = { ...avaliacao, metodoPrincipal: metodo };
    setAvaliacao(atualizada);
    salvarAvaliacaoCompleta(propriedadeAtiva.id, atualizada);
  };

  const handleSalvarMetodosConfig = (
    capRenda?: MetodoCapitalizacaoRendaConfig,
    evolutivo?: MetodoEvolutivoConfig
  ) => {
    const atualizada = {
      ...avaliacao,
      capitalizacaoRenda: capRenda,
      metodoEvolutivo: evolutivo
    };
    setAvaliacao(atualizada);
    salvarAvaliacaoCompleta(propriedadeAtiva.id, atualizada);
  };

  const handleSalvarConclusao = (conclusao: string, ressalvas: string[]) => {
    const atualizada = {
      ...avaliacao,
      conclusaoLaudo: conclusao,
      ressalvasLimitacoes: ressalvas
    };
    setAvaliacao(atualizada);
    salvarAvaliacaoCompleta(propriedadeAtiva.id, atualizada);
  };

  const handleCriarNovaPropriedade = () => {
    const novoId = `prop-${Date.now()}`;
    const novaProp: PropriedadeRuralAvaliacao = {
      ...propriedadeAtiva,
      id: novoId,
      codigoInterno: `GEO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      nome: `Nova Propriedade ${propriedades.length + 1}`,
      numeroMatricula: '',
      dataCadastro: new Date().toISOString().split('T')[0]
    };
    const lista = [...propriedades, novaProp];
    setPropriedades(lista);
    salvarPropriedades(lista);
    handleTrocarPropriedade(novoId);
  };

  const handleResetarDados = () => {
    if (window.confirm('Deseja limpar todos os dados salvos de avaliação e restaurar os formulários limpos?')) {
      resetarTodosOsDadosAvaliacao();
      window.location.reload();
    }
  };

  const SUBTABS = [
    { key: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, fase: 'Visão Geral & Indicadores', descricao: 'Painel executivo, valor global e métricas NBR' },
    { key: 'propriedade', label: '2. Imóvel Rural', icon: Building, fase: 'Caracterização Fundiária', descricao: 'Cadastro, matrícula, CAR, CCIR e localização' },
    { key: 'solicitante', label: '3. Solicitante & Finalidade', icon: UserCheck, fase: 'Caracterização Fundiária', descricao: 'Dados do cliente, objetivo e ART/CREA' },
    { key: 'vistoria', label: '4. Vistoria GPS', icon: ClipboardCheck, fase: 'Inspeção de Campo', descricao: 'Data, clima, coordenadas e fotos georreferenciadas' },
    { key: 'benfeitorias', label: '5. Ross-Heidecke', icon: Building2, fase: 'Avaliação Estrutural', descricao: 'Depreciação, reedição e estado de conservação' },
    { key: 'solos_aptidao', label: '6. Solos & Aptidão', icon: Shovel, fase: 'Avaliação da Terra Nua', descricao: 'Classes Embrapa/USDA, relevo e recursos hídricos' },
    { key: 'pesquisa_mercado', label: '7. Mercado', icon: TrendingUp, fase: 'Método Comparativo Direto', descricao: 'Imóveis comparativos, homogeneização e R$/ha' },
    { key: 'estatistica', label: '8. Estatística', icon: Sigma, fase: 'Método Comparativo Direto', descricao: 'Média, desvio, campo de arbítrio e NBR 14653' },
    { key: 'metodos', label: '9. Métodos NBR', icon: Scale, fase: 'Metodologias Avaliatórias', descricao: 'Comparativo, Evolutivo, Involutivo e Renda' },
    { key: 'mapa', label: '10. Mapa OSM', icon: MapPin, fase: 'Geotecnologia & Espacial', descricao: 'Visualização cartográfica e raios de amostragem' },
    { key: 'due_diligence', label: '11. Due Diligence', icon: FileCheck2, fase: 'Auditoria & Riscos', descricao: 'Checklist dominial, ambiental, trabalhista e fiscal' },
    { key: 'simulador', label: '12. CapEx & ROI', icon: Sparkles, fase: 'Auditoria & Riscos', descricao: 'Simulador de melhorias e valorização do imóvel' },
    { key: 'laudo_emissao', label: '13. Emissão Laudo', icon: FileText, fase: 'Documentação & Emissão', descricao: 'Laudo completo NBR 14653 com ART/CREA oficial' },
    { key: 'indicadores_gea', label: '14. Índices GeaAgro', icon: Award, fase: 'Inteligência GeaAgro', descricao: 'ILR, IQS, IVR e maturidade imobiliária' },
    { key: 'ia_assistente', label: '15. GeaAgro IA', icon: Bot, fase: 'Inteligência GeaAgro', descricao: 'Assistente pericial com fundamentação técnica' },
    { key: 'biblioteca', label: '16. Normas & Tabelas', icon: BookOpen, fase: 'Inteligência GeaAgro', descricao: 'Tabelas Ross-Heidecke, NBR 14653 e IBAPE' }
  ];

  // Controle do Menu Suspenso (Dropdown Navigation)
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuAberto(false);
      }
    };
    if (isMenuAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [isMenuAberto]);

  const currentIndex = SUBTABS.findIndex((t) => t.key === activeTab);
  const currentTabItem = SUBTABS[currentIndex >= 0 ? currentIndex : 0];
  const CurrentIcon = currentTabItem.icon;

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setActiveTab(SUBTABS[currentIndex - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProximo = () => {
    if (currentIndex < SUBTABS.length - 1) {
      setActiveTab(SUBTABS[currentIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const subtagsFiltradas = useMemo(() => {
    if (!filtroBusca.trim()) return SUBTABS;
    const termo = filtroBusca.toLowerCase();
    return SUBTABS.filter(
      (t) =>
        t.label.toLowerCase().includes(termo) ||
        t.fase.toLowerCase().includes(termo) ||
        t.descricao.toLowerCase().includes(termo)
    );
  }, [filtroBusca]);

  const fasesAgrupadas = useMemo(() => {
    const grupos: Record<string, typeof SUBTABS> = {};
    subtagsFiltradas.forEach((tab) => {
      if (!grupos[tab.fase]) grupos[tab.fase] = [];
      grupos[tab.fase].push(tab);
    });
    return grupos;
  }, [subtagsFiltradas]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Painel de Controle Unificado e Profissional (Header + Contexto + Menu Suspenso) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative z-30 space-y-3">
        {/* Linha 1: Identidade da Solução & Seletores de Propriedade */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/30 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Engenharia de Avaliações Rurais
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  NBR 14653-3
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Avaliação de Imóveis Rurais
              </h1>
            </div>
          </div>

          {/* Seletor de Propriedade e Nova Propriedade */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={propriedadeAtivaId}
              onChange={(e) => handleTrocarPropriedade(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white max-w-[220px] sm:max-w-xs focus:ring-2 focus:ring-emerald-500 truncate"
              title="Selecionar Imóvel Rural"
            >
              {propriedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.municipio}/{p.estado} - {p.areaTotalHa} ha)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCriarNovaPropriedade}
              className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
              title="Cadastrar Nova Propriedade para Avaliação"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetarDados}
              className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Limpar todos os dados armazenados e iniciar com formulários limpos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Dados</span>
            </button>
          </div>
        </div>

        {/* Linha 2: Menu Suspenso Compacto e Controles Sequenciais Integrados */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Botão de Acionamento do Menu Suspenso Compacto */}
          <div className="relative flex-1 min-w-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuAberto((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition shadow-xs group"
              aria-expanded={isMenuAberto}
              aria-haspopup="true"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-md bg-emerald-600 text-white shadow-xs shrink-0">
                  <CurrentIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentTabItem.label}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                  {currentTabItem.fase}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                  ({currentIndex + 1}/{SUBTABS.length})
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                <span className="text-[11px] font-medium hidden md:inline text-slate-400">Etapas</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuAberto ? 'rotate-180 text-emerald-600' : ''}`} />
              </div>
            </button>

            {/* Painel Flutuante do Menu Suspenso */}
            {isMenuAberto && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[440px] md:w-[500px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Campo de Busca Rápida no Menu */}
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    value={filtroBusca}
                    onChange={(e) => setFiltroBusca(e.target.value)}
                    placeholder="Filtrar etapas..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium py-0.5"
                    autoFocus
                  />
                  {filtroBusca && (
                    <button
                      type="button"
                      onClick={() => setFiltroBusca('')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Lista Agrupada das 16 Sub-Abas Compacta */}
                <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-2.5 scrollbar-thin">
                  {Object.entries(fasesAgrupadas).map(([fase, tabs]) => (
                    <div key={fase} className="space-y-1">
                      <div className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <span>{fase}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{tabs.length}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-0.5">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isSelected = activeTab === tab.key;
                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => {
                                setActiveTab(tab.key);
                                setIsMenuAberto(false);
                                setFiltroBusca('');
                              }}
                              className={`w-full py-1.5 px-2 rounded-lg text-left text-xs transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`p-1 rounded shrink-0 ${
                                    isSelected
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-semibold truncate leading-tight">
                                  {tab.label}
                                </span>
                              </div>

                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {Object.keys(fasesAgrupadas).length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      Nenhuma etapa com "{filtroBusca}".
                    </div>
                  )}
                </div>

                {/* Rodapé do Menu Suspenso */}
                <div className="p-1.5 px-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">16 etapas</span>
                  <button
                    type="button"
                    onClick={() => setIsMenuAberto(false)}
                    className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-semibold transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controles de Navegação Rápida (Anterior / Próximo e Seletor Nativo) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Seletor rápido nativo para acessibilidade e mobile */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="py-1 px-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 sm:hidden"
              title="Menu suspenso alternativo"
            >
              {SUBTABS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Botão Anterior */}
            <button
              type="button"
              onClick={handleAnterior}
              disabled={currentIndex <= 0}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                currentIndex <= 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
              }`}
              title="Ir para etapa anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Botão Próximo */}
            <button
              type="button"
              onClick={handleProximo}
              disabled={currentIndex >= SUBTABS.length - 1}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                currentIndex >= SUBTABS.length - 1
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
              }`}
              title="Avançar para próxima etapa"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Dinâmico da Sub-Aba Ativa */}
      <Suspense fallback={<SubviewFallback />}>
        {activeTab === 'dashboard' && (
          <AvaliacaoDashboardView
            propriedade={propriedadeAtiva}
            comparativos={comparativos}
            benfeitorias={benfeitorias}
            avaliacao={avaliacao}
            vistoria={vistoria}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'propriedade' && (
          <AvaliacaoPropriedadesView
            propriedade={propriedadeAtiva}
            onSalvarPropriedade={handleSalvarPropriedade}
          />
        )}

        {activeTab === 'solicitante' && (
          <AvaliacaoSolicitantesView
            solicitante={solicitante}
            onSalvarSolicitante={handleSalvarSolicitante}
          />
        )}

        {activeTab === 'vistoria' && (
          <AvaliacaoVistoriasView
            vistoria={vistoria}
            propriedadeNome={propriedadeAtiva.nome}
            onSalvarVistoria={handleSalvarVistoria}
          />
        )}

        {activeTab === 'benfeitorias' && (
          <AvaliacaoBenfeitoriasView
            benfeitorias={benfeitorias}
            propriedadeId={propriedadeAtiva.id}
            onSalvarBenfeitorias={handleSalvarBenfeitorias}
          />
        )}

        {activeTab === 'solos_aptidao' && (
          <AvaliacaoAptidaoSolosView
            solosTopografia={propriedadeAtiva.solosTopografia}
            aptidao={propriedadeAtiva.aptidao}
            onSalvar={handleSalvarSolosAptidao}
          />
        )}

        {activeTab === 'pesquisa_mercado' && (
          <AvaliacaoPesquisaMercadoView
            comparativos={comparativos}
            areaAvaliandoHa={propriedadeAtiva.areaTotalHa}
            onSalvarComparativos={handleSalvarComparativos}
          />
        )}

        {activeTab === 'estatistica' && (
          <AvaliacaoTratamentoEstatisticoView
            estatistica={avaliacao.estatistica || calcularEstatisticasTratamento(comparativos)}
            comparativos={comparativos}
          />
        )}

        {activeTab === 'metodos' && (
          <AvaliacaoMetodosView
            avaliacao={avaliacao}
            onAtualizarMetodoPrincipal={handleAtualizarMetodoPrincipal}
            onSalvarConfiguracoes={handleSalvarMetodosConfig}
          />
        )}

        {activeTab === 'mapa' && (
          <AvaliacaoMapaInteligenteView
            propriedade={propriedadeAtiva}
            pontosVistoria={vistoria.pontosInteresse}
            comparativos={comparativos}
            onAtualizarCoordenadas={(lat, lng) => {
              const upd: PropriedadeRuralAvaliacao = {
                ...propriedadeAtiva,
                coordenadasGps: { ...propriedadeAtiva.coordenadasGps, latitude: lat, longitude: lng }
              };
              handleSalvarPropriedade(upd);
            }}
          />
        )}

        {activeTab === 'due_diligence' && (
          <AvaliacaoDueDiligenceView
            documentos={dueDiligence}
            propriedadeId={propriedadeAtiva.id}
            onSalvarDocumentos={handleSalvarDueDiligence}
          />
        )}

        {activeTab === 'simulador' && (
          <AvaliacaoSimuladorCenariosView
            simuladores={simuladores}
            propriedadeId={propriedadeAtiva.id}
            valorAtualImovelR$={avaliacao.valorFinalImovelR$}
            onSalvarSimuladores={handleSalvarSimuladores}
          />
        )}

        {activeTab === 'laudo_emissao' && (
          <AvaliacaoLaudoEmissaoView
            propriedade={propriedadeAtiva}
            solicitante={solicitante}
            benfeitorias={benfeitorias}
            comparativos={comparativos}
            vistoria={vistoria}
            avaliacao={avaliacao}
            onSalvarConclusao={handleSalvarConclusao}
          />
        )}

        {activeTab === 'indicadores_gea' && (
          <AvaliacaoIndicadoresGeaAgroView
            indicadores={avaliacao.indicadores}
            propriedadeNome={propriedadeAtiva.nome}
          />
        )}

        {activeTab === 'ia_assistente' && (
          <AvaliacaoIaAssistenteView
            propriedade={propriedadeAtiva}
            avaliacao={avaliacao}
            solicitante={solicitante}
          />
        )}

        {activeTab === 'biblioteca' && (
          <AvaliacaoBibliotecaNormasView />
        )}
      </Suspense>
    </div>
  );
};
