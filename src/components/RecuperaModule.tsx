import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  DiagnosticoTecnicoCompleto,
  AnaliseSoloItem,
  ProjetoRecuperacao,
  MonitoramentoVisita,
  ItemCustoRecuperacao,
  AtividadeCronograma,
  PontoInteresseGps
} from '../types/recupera';
import {
  carregarPropriedadesRecupera,
  salvarPropriedadesRecupera,
  carregarPropriedadeSelecionadaId,
  salvarPropriedadeSelecionadaId,
  carregarAreasRecupera,
  salvarAreasRecupera,
  carregarAreaSelecionadaId,
  salvarAreaSelecionadaId,
  carregarDiagnosticos,
  salvarDiagnosticos,
  carregarAnalisesSolo,
  salvarAnalisesSolo,
  carregarProjetosRecupera,
  salvarProjetosRecupera,
  carregarMonitoramentos,
  salvarMonitoramentos,
  carregarCustosRecupera,
  salvarCustosRecupera,
  carregarCronogramasRecupera,
  salvarCronogramasRecupera,
  carregarPontosGpsRecupera,
  salvarPontosGpsRecupera,
  resetarTodosOsDadosRecupera,
  criarPropriedadeVaziaRecupera
} from '../utils/recuperaStorage';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  LayoutDashboard,
  Building2,
  Layers,
  ClipboardCheck,
  FlaskConical,
  FolderKanban,
  Calculator,
  Leaf,
  Sprout,
  Shovel,
  TreePine,
  MapPin,
  Activity,
  DollarSign,
  Calendar,
  FileText,
  BookOpen,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  X
} from 'lucide-react';

// Subviews carregadas sob demanda com retry automático
const RecuperaDashboardView = lazyWithRetry(() => import('./recupera/RecuperaDashboardView').then(m => ({ default: m.RecuperaDashboardView })));
const RecuperaPropriedadesView = lazyWithRetry(() => import('./recupera/RecuperaPropriedadesView').then(m => ({ default: m.RecuperaPropriedadesView })));
const RecuperaAreasView = lazyWithRetry(() => import('./recupera/RecuperaAreasView').then(m => ({ default: m.RecuperaAreasView })));
const RecuperaDiagnosticoView = lazyWithRetry(() => import('./recupera/RecuperaDiagnosticoView').then(m => ({ default: m.RecuperaDiagnosticoView })));
const RecuperaAnalisesSoloView = lazyWithRetry(() => import('./recupera/RecuperaAnalisesSoloView').then(m => ({ default: m.RecuperaAnalisesSoloView })));
const RecuperaProjetosView = lazyWithRetry(() => import('./recupera/RecuperaProjetosView').then(m => ({ default: m.RecuperaProjetosView })));
const RecuperaCalculadorasView = lazyWithRetry(() => import('./recupera/RecuperaCalculadorasView').then(m => ({ default: m.RecuperaCalculadorasView })));
const RecuperaPastagensView = lazyWithRetry(() => import('./recupera/RecuperaPastagensView').then(m => ({ default: m.RecuperaPastagensView })));
const RecuperaPlantasCoberturaView = lazyWithRetry(() => import('./recupera/RecuperaPlantasCoberturaView').then(m => ({ default: m.RecuperaPlantasCoberturaView })));
const RecuperaConservacaoSoloView = lazyWithRetry(() => import('./recupera/RecuperaConservacaoSoloView').then(m => ({ default: m.RecuperaConservacaoSoloView })));
const RecuperaAmbientalView = lazyWithRetry(() => import('./recupera/RecuperaAmbientalView').then(m => ({ default: m.RecuperaAmbientalView })));
const RecuperaMapasView = lazyWithRetry(() => import('./recupera/RecuperaMapasView').then(m => ({ default: m.RecuperaMapasView })));
const RecuperaMonitoramentoView = lazyWithRetry(() => import('./recupera/RecuperaMonitoramentoView').then(m => ({ default: m.RecuperaMonitoramentoView })));
const RecuperaCustosView = lazyWithRetry(() => import('./recupera/RecuperaCustosView').then(m => ({ default: m.RecuperaCustosView })));
const RecuperaCronogramaView = lazyWithRetry(() => import('./recupera/RecuperaCronogramaView').then(m => ({ default: m.RecuperaCronogramaView })));
const RecuperaRelatoriosView = lazyWithRetry(() => import('./recupera/RecuperaRelatoriosView').then(m => ({ default: m.RecuperaRelatoriosView })));
const RecuperaBibliotecaView = lazyWithRetry(() => import('./recupera/RecuperaBibliotecaView').then(m => ({ default: m.RecuperaBibliotecaView })));

interface Props {
  initialSubTab?: string;
}

const SUBTABS = [
  { key: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, fase: 'Fase 1 • Diagnóstico & Território', descricao: 'Painel executivo, alertas e KPIs de severidade' },
  { key: 'propriedades', label: '2. Propriedades', icon: Building2, fase: 'Fase 1 • Diagnóstico & Território', descricao: 'Cadastro fundiário, CAR, CCIR e localização' },
  { key: 'areas', label: '3. Áreas Degradadas', icon: Layers, fase: 'Fase 1 • Diagnóstico & Território', descricao: 'Talhões, polígonos, severidade e histórico de uso' },
  { key: 'diagnostico', label: '4. Diagnóstico', icon: ClipboardCheck, fase: 'Fase 1 • Diagnóstico & Território', descricao: 'Avaliação física, química, biológica e erosiva' },
  { key: 'analises_solo', label: '5. Análises do Solo', icon: FlaskConical, fase: 'Fase 1 • Diagnóstico & Território', descricao: 'Laudos laboratoriais (0-20 cm e 20-40 cm)' },
  { key: 'projetos', label: '6. Projetos de Recuperação', icon: FolderKanban, fase: 'Fase 2 • Planejamento & Dimensionamento', descricao: '16 modalidades de PRAD e operações técnicas' },
  { key: 'calculadoras', label: '7. Calculadoras', icon: Calculator, fase: 'Fase 2 • Planejamento & Dimensionamento', descricao: 'Calagem (V% e Al), gesso, NPK e micronutrientes' },
  { key: 'pastagens', label: '8. Recuperação de Pastagens', icon: Leaf, fase: 'Fase 2 • Planejamento & Dimensionamento', descricao: 'Árvore de decisão, semeadura VC% e manejo' },
  { key: 'cobertura', label: '9. Plantas de Cobertura', icon: Sprout, fase: 'Fase 2 • Planejamento & Dimensionamento', descricao: '20+ espécies, relação C/N, biomassa e mix' },
  { key: 'conservacao_solo', label: '10. Conservação do Solo', icon: Shovel, fase: 'Fase 3 • Conservação do Solo & Restauração', descricao: 'Terraços Bentley, curvas de nível e voçorocas' },
  { key: 'ambiental', label: '11. Recuperação Ambiental', icon: TreePine, fase: 'Fase 3 • Conservação do Solo & Restauração', descricao: 'APP, Reserva Legal e modelos 50/50 de mudas' },
  { key: 'mapas', label: '12. Mapas & GPS', icon: MapPin, fase: 'Fase 3 • Conservação do Solo & Restauração', descricao: 'Coleta de coordenadas e mapa interativo OSM' },
  { key: 'monitoramento', label: '13. Monitoramento & IGRA', icon: Activity, fase: 'Fase 4 • Gestão Operacional & Monitoramento', descricao: 'Vistorias periódicas e radar das 5 dimensões' },
  { key: 'custos', label: '14. Custos e Orçamento', icon: DollarSign, fase: 'Fase 4 • Gestão Operacional & Monitoramento', descricao: 'Orçamento previsto vs. executado e R$/ha' },
  { key: 'cronogramas', label: '15. Cronogramas', icon: Calendar, fase: 'Fase 4 • Gestão Operacional & Monitoramento', descricao: 'Janelas climáticas e avanço de operações' },
  { key: 'relatorios', label: '16. Relatórios PDF', icon: FileText, fase: 'Fase 5 • Documentação & Referências', descricao: 'Emissão dos 13 modelos oficiais com ART/CREA' },
  { key: 'biblioteca', label: '17. Biblioteca Técnica', icon: BookOpen, fase: 'Fase 5 • Documentação & Referências', descricao: 'Manuais Embrapa, IAC e normas regulamentadoras' }
] as const;

function normalizeSubTab(tab?: string): string {
  if (!tab) return 'dashboard';
  if (tab === 'plantas_cobertura') return 'cobertura';
  if (tab === 'cronograma') return 'cronogramas';
  if (tab === 'ia_assistente' || tab === 'configuracoes') return 'dashboard';
  return tab;
}

const SubviewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl p-10 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <span>Carregando etapa...</span>
  </div>
);

const AreaObrigatoriaPlaceholder: React.FC<{
  descricao: string;
  onIrAreas: () => void;
}> = ({ descricao, onIrAreas }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-slate-200/80 dark:border-zinc-800 text-center space-y-3">
    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
      <Layers className="w-5 h-5" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Nenhum talhão selecionado</h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">{descricao}</p>
    </div>
    <button
      type="button"
      onClick={onIrAreas}
      className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1.5 whitespace-nowrap"
    >
      Ir para Áreas Degradadas
    </button>
  </div>
);

export const RecuperaModule: React.FC<Props> = ({ initialSubTab }) => {
  const [propriedades, setPropriedades] = useState<PropriedadeRecupera[]>(() => carregarPropriedadesRecupera());
  const [propriedadeAtivaId, setPropriedadeAtivaId] = useState<string>(() => carregarPropriedadeSelecionadaId());

  const propriedadeAtiva = useMemo(
    () => propriedades.find(p => p.id === propriedadeAtivaId),
    [propriedades, propriedadeAtivaId]
  );

  const [areas, setAreas] = useState<AreaDegradadaItem[]>(() => carregarAreasRecupera(propriedadeAtiva?.id));
  const [areaAtivaId, setAreaAtivaId] = useState<string>(() => carregarAreaSelecionadaId());

  const areaAtiva = useMemo(
    () => areas.find(a => a.id === areaAtivaId),
    [areas, areaAtivaId]
  );

  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoTecnicoCompleto[]>(() => carregarDiagnosticos());
  const [analises, setAnalises] = useState<AnaliseSoloItem[]>(() => carregarAnalisesSolo());
  const [projetos, setProjetos] = useState<ProjetoRecuperacao[]>(() => carregarProjetosRecupera());
  const [monitoramentos, setMonitoramentos] = useState<MonitoramentoVisita[]>(() => carregarMonitoramentos());
  const [custos, setCustos] = useState<ItemCustoRecuperacao[]>(() => carregarCustosRecupera());
  const [cronogramas, setCronogramas] = useState<AtividadeCronograma[]>(() => carregarCronogramasRecupera());
  const [pontosGps, setPontosGps] = useState<PontoInteresseGps[]>(() => carregarPontosGpsRecupera());

  const [activeTab, setActiveTab] = useState<string>(() => normalizeSubTab(initialSubTab));
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(normalizeSubTab(initialSubTab));
    }
  }, [initialSubTab]);

  const handleTrocarPropriedade = (id: string) => {
    salvarPropriedadeSelecionadaId(id);
    setPropriedadeAtivaId(id);
    setAreas(id ? carregarAreasRecupera(id) : carregarAreasRecupera());
    setAreaAtivaId('');
    salvarAreaSelecionadaId('');
  };

  const handleSelecionarArea = (id: string) => {
    salvarAreaSelecionadaId(id);
    setAreaAtivaId(id);
  };

  const handleSalvarPropriedadeUnica = (propAtualizada: PropriedadeRecupera) => {
    setPropriedades(prev => {
      const existe = prev.some(p => p.id === propAtualizada.id);
      const lista = existe
        ? prev.map(p => (p.id === propAtualizada.id ? propAtualizada : p))
        : [...prev, propAtualizada];
      salvarPropriedadesRecupera(lista);
      return lista;
    });
    if (!propriedadeAtivaId || !propriedades.some(p => p.id === propAtualizada.id)) {
      setPropriedadeAtivaId(propAtualizada.id);
      salvarPropriedadeSelecionadaId(propAtualizada.id);
    }
  };

  const handleSalvarDiagnosticoUnico = (diag: DiagnosticoTecnicoCompleto) => {
    setDiagnosticos(prev => {
      const existe = prev.some(d => d.id === diag.id || d.areaId === diag.areaId);
      const lista = existe
        ? prev.map(d => (d.id === diag.id || d.areaId === diag.areaId ? diag : d))
        : [...prev, diag];
      salvarDiagnosticos(lista);
      return lista;
    });
  };

  const handleConfirmarResetGeral = () => {
    resetarTodosOsDadosRecupera();
    const novasProps = carregarPropriedadesRecupera();
    const novaPropId = carregarPropriedadeSelecionadaId();
    setPropriedades(novasProps);
    setPropriedadeAtivaId(novaPropId);
    setAreas(carregarAreasRecupera(novaPropId || undefined));
    setAreaAtivaId(carregarAreaSelecionadaId());
    setDiagnosticos(carregarDiagnosticos());
    setAnalises(carregarAnalisesSolo());
    setProjetos(carregarProjetosRecupera());
    setMonitoramentos(carregarMonitoramentos());
    setCustos(carregarCustosRecupera());
    setCronogramas(carregarCronogramasRecupera());
    setPontosGps(carregarPontosGpsRecupera());
    setActiveTab('dashboard');
    setConfirmandoReset(false);
  };

  // Controle do Menu Suspenso
  const [isMenuAberto, setIsMenuAberto] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

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

  const currentIndex = Math.max(0, SUBTABS.findIndex(t => t.key === activeTab));
  const currentTabItem = SUBTABS[currentIndex];
  const CurrentIcon = currentTabItem.icon;
  const progressoPct = Math.round(((currentIndex + 1) / SUBTABS.length) * 100);

  const irParaEtapa = (indice: number) => {
    if (indice >= 0 && indice < SUBTABS.length) {
      setActiveTab(SUBTABS[indice].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fasesAgrupadas = useMemo(() => {
    const termo = filtroBusca.trim().toLowerCase();
    const filtradas = termo
      ? SUBTABS.filter(
          t =>
            t.label.toLowerCase().includes(termo) ||
            t.fase.toLowerCase().includes(termo) ||
            t.descricao.toLowerCase().includes(termo)
        )
      : SUBTABS;

    const grupos: Record<string, Array<(typeof SUBTABS)[number]>> = {};
    filtradas.forEach(tab => {
      if (!grupos[tab.fase]) grupos[tab.fase] = [];
      grupos[tab.fase].push(tab);
    });
    return grupos;
  }, [filtroBusca]);

  const irParaAreas = () => setActiveTab('areas');

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Painel de Controle Unificado */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 relative z-30">
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Linha 1: Identidade e Seletores de Contexto */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                    Recuperação de Áreas Degradadas
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700/70 shrink-0">
                    RAD / PRAD
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 leading-tight truncate">
                  Recupera
                </h1>
              </div>
            </div>

            {/* Seletores de Contexto + Reset Inline */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={propriedadeAtivaId}
                onChange={e => handleTrocarPropriedade(e.target.value)}
                className="h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 max-w-[200px] sm:max-w-[220px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 truncate"
                title="Selecionar Fazenda"
              >
                <option value="">Selecione uma fazenda...</option>
                {propriedades.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome || 'Sem nome'}{p.municipio ? ` (${p.municipio}/${p.estado})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={areaAtivaId}
                onChange={e => handleSelecionarArea(e.target.value)}
                className="h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 max-w-[200px] sm:max-w-[230px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 truncate"
                title="Selecionar Talhão"
              >
                <option value="">Nenhum talhão selecionado</option>
                {areas.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nomeTalhao} ({a.areaHa} ha)
                  </option>
                ))}
              </select>

              {confirmandoReset ? (
                <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2 h-8 shrink-0">
                  <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 whitespace-nowrap">
                    Limpar dados?
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmarResetGeral}
                    className="px-1.5 py-0.5 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition whitespace-nowrap"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(false)}
                    className="px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded transition whitespace-nowrap"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoReset(true)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition shrink-0"
                  title="Limpar todos os dados do módulo Recupera"
                  aria-label="Limpar todos os dados do módulo Recupera"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Linha 2: Seletor de Etapa e Navegação Sequencial */}
          <div className="pt-2.5 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="relative flex-1 min-w-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuAberto(prev => !prev)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 flex items-center justify-between gap-2 text-left transition"
                aria-expanded={isMenuAberto}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {currentTabItem.label}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    {currentTabItem.fase.split('•')[0].trim()}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums shrink-0">
                    {currentIndex + 1}/{SUBTABS.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400 dark:text-zinc-500">
                  <span className="text-[11px] font-medium hidden md:inline">Etapas</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuAberto ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                </div>
              </button>

              {isMenuAberto && (
                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[440px] md:w-[500px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-md z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={filtroBusca}
                      onChange={e => setFiltroBusca(e.target.value)}
                      placeholder="Filtrar etapas..."
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none py-0.5"
                      autoFocus
                    />
                    {filtroBusca && (
                      <button
                        type="button"
                        onClick={() => setFiltroBusca('')}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-2.5">
                    {Object.entries(fasesAgrupadas).map(([fase, tabs]) => (
                      <div key={fase} className="space-y-1">
                        <div className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                          <span>{fase}</span>
                          <span className="tabular-nums">{tabs.length}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-0.5">
                          {tabs.map(tab => {
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
                                    ? 'bg-emerald-600 text-white font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate leading-tight">{tab.label}</p>
                                    <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                                      {tab.descricao}
                                    </p>
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

                  <div className="px-2.5 py-1.5 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-zinc-500 tabular-nums">{SUBTABS.length} etapas</span>
                    <button
                      type="button"
                      onClick={() => setIsMenuAberto(false)}
                      className="px-2 py-0.5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded font-medium transition"
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
                onClick={() => irParaEtapa(currentIndex - 1)}
                disabled={currentIndex <= 0}
                className={`h-9 px-2.5 rounded-lg text-xs font-medium border transition inline-flex items-center gap-1 whitespace-nowrap ${
                  currentIndex <= 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
                title="Ir para etapa anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                type="button"
                onClick={() => irParaEtapa(currentIndex + 1)}
                disabled={currentIndex >= SUBTABS.length - 1}
                className={`h-9 px-3 rounded-lg text-xs font-medium border transition inline-flex items-center gap-1 whitespace-nowrap ${
                  currentIndex >= SUBTABS.length - 1
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                }`}
                title="Avançar para próxima etapa"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra fina de progresso das etapas */}
        <div className="h-0.5 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden rounded-b-xl">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progressoPct}%` }}
          />
        </div>
      </div>

      {/* Conteúdo Dinâmico da Sub-Aba Ativa */}
      <Suspense fallback={<SubviewFallback />}>
        {activeTab === 'dashboard' && (
          <RecuperaDashboardView
            propriedadeAtiva={propriedadeAtiva}
            areas={areas}
            projetos={projetos}
            diagnosticos={diagnosticos}
            onNavigateTab={setActiveTab}
            onSelecionarArea={handleSelecionarArea}
            areaAtivaId={areaAtivaId}
          />
        )}

        {activeTab === 'propriedades' && (
          <RecuperaPropriedadesView
            propriedade={propriedadeAtiva}
            onSalvarPropriedade={handleSalvarPropriedadeUnica}
          />
        )}

        {activeTab === 'areas' && (
          <RecuperaAreasView
            areas={areas}
            propriedadeId={propriedadeAtiva?.id || ''}
            areaAtivaId={areaAtivaId}
            onSelecionarArea={handleSelecionarArea}
            onSalvarAreas={novas => {
              setAreas(novas);
              salvarAreasRecupera(novas);
            }}
          />
        )}

        {activeTab === 'diagnostico' && (
          areaAtiva ? (
            <RecuperaDiagnosticoView
              areaAtiva={areaAtiva}
              diagnosticoExistente={diagnosticos.find(d => d.areaId === areaAtiva.id)}
              onSalvarDiagnostico={handleSalvarDiagnosticoUnico}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione um talhão no seletor superior ou cadastre uma área degradada para iniciar o diagnóstico técnico."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'analises_solo' && (
          areaAtiva ? (
            <RecuperaAnalisesSoloView
              areaAtiva={areaAtiva}
              analises={analises}
              onSalvarAnalises={novas => {
                setAnalises(novas);
                salvarAnalisesSolo(novas);
              }}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para vincular análises laboratoriais de solo."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'projetos' && (
          <RecuperaProjetosView
            areaAtiva={areaAtiva}
            propriedadeId={propriedadeAtiva?.id || ''}
            projetos={projetos}
            onSalvarProjetos={novos => {
              setProjetos(novos);
              salvarProjetosRecupera(novos);
            }}
          />
        )}

        {activeTab === 'calculadoras' && (
          <RecuperaCalculadorasView
            areaAtiva={areaAtiva}
            analises={analises}
          />
        )}

        {activeTab === 'pastagens' && (
          areaAtiva ? (
            <RecuperaPastagensView areaAtiva={areaAtiva} />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para avaliar a recuperação de pastagens."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'cobertura' && (
          <RecuperaPlantasCoberturaView areaAtiva={areaAtiva} />
        )}

        {activeTab === 'conservacao_solo' && (
          <RecuperaConservacaoSoloView areaAtiva={areaAtiva} />
        )}

        {activeTab === 'ambiental' && (
          areaAtiva ? (
            <RecuperaAmbientalView areaAtiva={areaAtiva} />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para dimensionar recuperação de APP/Reserva Legal."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'mapas' && (
          <RecuperaMapasView
            areaAtiva={areaAtiva}
            propriedade={propriedadeAtiva}
            areasDisponiveis={areas}
            onSelecionarArea={handleSelecionarArea}
            pontosGps={pontosGps}
            onSalvarPontosGps={novos => {
              setPontosGps(novos);
              salvarPontosGpsRecupera(novos);
            }}
          />
        )}

        {activeTab === 'monitoramento' && (
          areaAtiva ? (
            <RecuperaMonitoramentoView
              areaAtiva={areaAtiva}
              monitoramentos={monitoramentos}
              onSalvarMonitoramentos={novos => {
                setMonitoramentos(novos);
                salvarMonitoramentos(novos);
              }}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para registrar vistorias de monitoramento e IGRA."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'custos' && (
          areaAtiva ? (
            <RecuperaCustosView
              areaAtiva={areaAtiva}
              custos={custos}
              onSalvarCustos={novos => {
                setCustos(novos);
                salvarCustosRecupera(novos);
              }}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para controlar custos e orçamento."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'cronogramas' && (
          areaAtiva ? (
            <RecuperaCronogramaView
              areaAtiva={areaAtiva}
              cronogramas={cronogramas}
              onSalvarCronogramas={novos => {
                setCronogramas(novos);
                salvarCronogramasRecupera(novos);
              }}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para gerenciar o cronograma operacional."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'relatorios' && (
          areaAtiva ? (
            <RecuperaRelatoriosView
              propriedade={propriedadeAtiva || criarPropriedadeVaziaRecupera()}
              areaAtiva={areaAtiva}
              diagnostico={diagnosticos.find(d => d.areaId === areaAtiva.id)}
              analiseSolo={analises.find(a => a.areaId === areaAtiva.id)}
              projeto={projetos.find(p => p.areaId === areaAtiva.id)}
              monitoramentos={monitoramentos}
              custos={custos}
              cronogramas={cronogramas}
            />
          ) : (
            <AreaObrigatoriaPlaceholder
              descricao="Selecione ou cadastre um talhão em Áreas Degradadas para emitir relatórios e laudos técnicos em PDF."
              onIrAreas={irParaAreas}
            />
          )
        )}

        {activeTab === 'biblioteca' && <RecuperaBibliotecaView />}
      </Suspense>
    </div>
  );
};
