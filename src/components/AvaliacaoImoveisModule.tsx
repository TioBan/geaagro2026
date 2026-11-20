import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
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
import { lazyWithRetry } from '../utils/lazyWithRetry';
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

// Subviews carregadas sob demanda com retry automático em caso de atualização de chunk
const AvaliacaoDashboardView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoDashboardView').then((m) => ({ default: m.AvaliacaoDashboardView }))
);
const AvaliacaoPropriedadesView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoPropriedadesView').then((m) => ({ default: m.AvaliacaoPropriedadesView }))
);
const AvaliacaoSolicitantesView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoSolicitantesView').then((m) => ({ default: m.AvaliacaoSolicitantesView }))
);
const AvaliacaoVistoriasView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoVistoriasView').then((m) => ({ default: m.AvaliacaoVistoriasView }))
);
const AvaliacaoBenfeitoriasView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoBenfeitoriasView').then((m) => ({ default: m.AvaliacaoBenfeitoriasView }))
);
const AvaliacaoAptidaoSolosView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoAptidaoSolosView').then((m) => ({ default: m.AvaliacaoAptidaoSolosView }))
);
const AvaliacaoPesquisaMercadoView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoPesquisaMercadoView').then((m) => ({ default: m.AvaliacaoPesquisaMercadoView }))
);
const AvaliacaoTratamentoEstatisticoView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoTratamentoEstatisticoView').then((m) => ({ default: m.AvaliacaoTratamentoEstatisticoView }))
);
const AvaliacaoMetodosView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoMetodosView').then((m) => ({ default: m.AvaliacaoMetodosView }))
);
const AvaliacaoMapaInteligenteView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoMapaInteligenteView').then((m) => ({ default: m.AvaliacaoMapaInteligenteView }))
);
const AvaliacaoDueDiligenceView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoDueDiligenceView').then((m) => ({ default: m.AvaliacaoDueDiligenceView }))
);
const AvaliacaoSimuladorCenariosView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoSimuladorCenariosView').then((m) => ({ default: m.AvaliacaoSimuladorCenariosView }))
);
const AvaliacaoLaudoEmissaoView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoLaudoEmissaoView').then((m) => ({ default: m.AvaliacaoLaudoEmissaoView }))
);
const AvaliacaoIndicadoresGeaAgroView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoIndicadoresGeaAgroView').then((m) => ({ default: m.AvaliacaoIndicadoresGeaAgroView }))
);
const AvaliacaoIaAssistenteView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoIaAssistenteView').then((m) => ({ default: m.AvaliacaoIaAssistenteView }))
);
const AvaliacaoBibliotecaNormasView = lazyWithRetry(() =>
  import('./avaliacao_imoveis/AvaliacaoBibliotecaNormasView').then((m) => ({ default: m.AvaliacaoBibliotecaNormasView }))
);

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
  { key: 'indicadores_gea', label: '14. Índices GeaAgro', icon: Award, fase: 'Inteligência GeaAgro', descricao: 'IPR, ICV, IGM e IGT de maturidade imobiliária' },
  { key: 'ia_assistente', label: '15. GeaAgro IA', icon: Bot, fase: 'Inteligência GeaAgro', descricao: 'Assistente pericial com fundamentação técnica' },
  { key: 'biblioteca', label: '16. Normas & Tabelas', icon: BookOpen, fase: 'Inteligência GeaAgro', descricao: 'Tabelas Ross-Heidecke, NBR 14653 e IBAPE' }
] as const;

const SubviewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-3">
    <div className="h-4 w-44 bg-slate-100 dark:bg-zinc-800 rounded" />
    <div className="h-28 w-full bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800/80" />
  </div>
);

interface Props {
  initialSubTab?: string;
}

export const AvaliacaoImoveisModule: React.FC<Props> = ({ initialSubTab }) => {
  const [propriedades, setPropriedades] = useState<PropriedadeRuralAvaliacao[]>(() => carregarPropriedades());
  const [propriedadeAtivaId, setPropriedadeAtivaId] = useState<string>(() => carregarPropriedadeSelecionadaId());

  const propriedadeAtiva = propriedades.find((p) => p.id === propriedadeAtivaId) || propriedades[0];

  const [solicitante, setSolicitante] = useState<SolicitanteAvaliacao>(() => carregarSolicitante(propriedadeAtiva.id));
  const [benfeitorias, setBenfeitorias] = useState<BenfeitoriaItem[]>(() => carregarBenfeitorias(propriedadeAtiva.id));
  const [comparativos, setComparativos] = useState<ImovelComparativoMercado[]>(() => carregarComparativos());
  const [vistoria, setVistoria] = useState<VistoriaTecnica>(() => carregarVistoria(propriedadeAtiva.id));
  const [dueDiligence, setDueDiligence] = useState<DocumentoDueDiligence[]>(() => carregarDueDiligence(propriedadeAtiva.id));
  const [simuladores, setSimuladores] = useState<SimuladorCenarioMelhoria[]>(() => carregarSimuladores(propriedadeAtiva.id));
  const [avaliacao, setAvaliacao] = useState<AvaliacaoCompletaImovel>(() => carregarAvaliacaoCompleta(propriedadeAtiva.id));

  const [activeTab, setActiveTab] = useState<string>(initialSubTab || 'dashboard');
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (!isMenuAberto) return;

    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuAberto(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuAberto]);

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

  const handleConfirmarReset = () => {
    resetarTodosOsDadosAvaliacao();
    const novasProps = carregarPropriedades();
    const novoId = carregarPropriedadeSelecionadaId();
    const propInicial = novasProps.find((p) => p.id === novoId) || novasProps[0];

    setPropriedades(novasProps);
    setPropriedadeAtivaId(propInicial.id);
    setSolicitante(carregarSolicitante(propInicial.id));
    setBenfeitorias(carregarBenfeitorias(propInicial.id));
    setComparativos(carregarComparativos());
    setVistoria(carregarVistoria(propInicial.id));
    setDueDiligence(carregarDueDiligence(propInicial.id));
    setSimuladores(carregarSimuladores(propInicial.id));
    setAvaliacao(carregarAvaliacaoCompleta(propInicial.id));
    setActiveTab('dashboard');
    setConfirmReset(false);
  };

  const currentIndex = SUBTABS.findIndex((t) => t.key === activeTab);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentTabItem = SUBTABS[safeIndex];
  const CurrentIcon = currentTabItem.icon;
  const progressPercent = ((safeIndex + 1) / SUBTABS.length) * 100;

  const handleAnterior = () => {
    if (safeIndex > 0) {
      setActiveTab(SUBTABS[safeIndex - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProximo = () => {
    if (safeIndex < SUBTABS.length - 1) {
      setActiveTab(SUBTABS[safeIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const subtabsFiltradas = useMemo(() => {
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
    const grupos: Record<string, Array<(typeof SUBTABS)[number]>> = {};
    subtabsFiltradas.forEach((tab) => {
      if (!grupos[tab.fase]) grupos[tab.fase] = [];
      grupos[tab.fase].push(tab);
    });
    return grupos;
  }, [subtabsFiltradas]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Cabeçalho Unificado e Navegação por Etapas NBR 14653-3 */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 relative z-30">
        <div className="p-4 space-y-3">
          {/* Linha 1: Título & Controles do Imóvel Ativo */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Engenharia de Avaliações Rurais
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                    NBR 14653-3
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                  Avaliação de Imóveis Rurais
                </h1>
              </div>
            </div>

            {/* Seletor de Propriedade, Nova Propriedade e Reset Inline */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={propriedadeAtivaId}
                onChange={(e) => handleTrocarPropriedade(e.target.value)}
                className="h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 max-w-[230px] sm:max-w-[270px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 truncate"
                title="Selecionar Imóvel Rural"
              >
                {propriedades.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.municipio}/{p.estado} · {p.areaTotalHa} ha)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCriarNovaPropriedade}
                className="h-8 px-2.5 bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium shrink-0"
                title="Cadastrar nova propriedade para avaliação"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Novo Imóvel</span>
              </button>

              {confirmReset ? (
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 rounded-lg px-2 h-8 shrink-0">
                  <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                    Limpar tudo?
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmarReset}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="h-8 px-2.5 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
                  title="Limpar todos os dados salvos e iniciar formulários limpos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Linha 2: Menu de Etapas + Anterior / Próxima */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            <div className="relative flex-1 min-w-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuAberto((prev) => !prev)}
                className="w-full h-9 flex items-center justify-between gap-2 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-950/70 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 text-left transition-colors group"
                aria-expanded={isMenuAberto}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {currentTabItem.label}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    · {currentTabItem.fase}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-slate-400 dark:text-zinc-500 shrink-0">
                    ({safeIndex + 1}/{SUBTABS.length})
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200">
                  <span className="text-[11px] font-medium hidden md:inline">Etapas</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isMenuAberto ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  />
                </div>
              </button>

              {isMenuAberto && (
                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[440px] md:w-[500px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-lg z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={filtroBusca}
                      onChange={(e) => setFiltroBusca(e.target.value)}
                      placeholder="Filtrar etapas da avaliação..."
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none py-0.5"
                      autoFocus
                    />
                    {filtroBusca && (
                      <button
                        type="button"
                        onClick={() => setFiltroBusca('')}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        aria-label="Limpar busca"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-2.5">
                    {Object.entries(fasesAgrupadas).map(([fase, tabs]) => (
                      <div key={fase} className="space-y-1">
                        <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                          <span>{fase}</span>
                          <span className="tabular-nums">{tabs.length}</span>
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
                                className={`w-full py-1.5 px-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block truncate leading-tight font-medium">
                                      {tab.label}
                                    </span>
                                    <span
                                      className={`block text-[10px] truncate ${
                                        isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'
                                      }`}
                                    >
                                      {tab.descricao}
                                    </span>
                                  </div>
                                </div>

                                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {Object.keys(fasesAgrupadas).length === 0 && (
                      <div className="p-4 text-center text-slate-400 dark:text-zinc-500 text-xs">
                        Nenhuma etapa encontrada para "{filtroBusca}".
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-1.5 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-zinc-500 tabular-nums">
                      {SUBTABS.length} etapas NBR 14653-3
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMenuAberto(false)}
                      className="px-2 py-0.5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded font-medium transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleAnterior}
                disabled={safeIndex <= 0}
                className="h-9 px-2.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Etapa anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                type="button"
                onClick={handleProximo}
                disabled={safeIndex >= SUBTABS.length - 1}
                className="h-9 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Próxima etapa"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Discreta das 16 Etapas */}
        <div className="h-0.5 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden rounded-b-xl">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
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

        {activeTab === 'biblioteca' && <AvaliacaoBibliotecaNormasView />}
      </Suspense>
    </div>
  );
};
