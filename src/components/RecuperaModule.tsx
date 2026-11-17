import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
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
  obterStatusSincronizacaoRecupera,
  resetarTodosOsDadosRecupera,
  criarPropriedadeVaziaRecupera
} from '../utils/recuperaStorage';
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

// Subviews carregadas sob demanda (Code Splitting)
const RecuperaDashboardView = lazy(() => import('./recupera/RecuperaDashboardView').then(m => ({ default: m.RecuperaDashboardView })));
const RecuperaPropriedadesView = lazy(() => import('./recupera/RecuperaPropriedadesView').then(m => ({ default: m.RecuperaPropriedadesView })));
const RecuperaAreasView = lazy(() => import('./recupera/RecuperaAreasView').then(m => ({ default: m.RecuperaAreasView })));
const RecuperaDiagnosticoView = lazy(() => import('./recupera/RecuperaDiagnosticoView').then(m => ({ default: m.RecuperaDiagnosticoView })));
const RecuperaAnalisesSoloView = lazy(() => import('./recupera/RecuperaAnalisesSoloView').then(m => ({ default: m.RecuperaAnalisesSoloView })));
const RecuperaProjetosView = lazy(() => import('./recupera/RecuperaProjetosView').then(m => ({ default: m.RecuperaProjetosView })));
const RecuperaCalculadorasView = lazy(() => import('./recupera/RecuperaCalculadorasView').then(m => ({ default: m.RecuperaCalculadorasView })));
const RecuperaPastagensView = lazy(() => import('./recupera/RecuperaPastagensView').then(m => ({ default: m.RecuperaPastagensView })));
const RecuperaPlantasCoberturaView = lazy(() => import('./recupera/RecuperaPlantasCoberturaView').then(m => ({ default: m.RecuperaPlantasCoberturaView })));
const RecuperaConservacaoSoloView = lazy(() => import('./recupera/RecuperaConservacaoSoloView').then(m => ({ default: m.RecuperaConservacaoSoloView })));
const RecuperaAmbientalView = lazy(() => import('./recupera/RecuperaAmbientalView').then(m => ({ default: m.RecuperaAmbientalView })));
const RecuperaMapasView = lazy(() => import('./recupera/RecuperaMapasView').then(m => ({ default: m.RecuperaMapasView })));
const RecuperaMonitoramentoView = lazy(() => import('./recupera/RecuperaMonitoramentoView').then(m => ({ default: m.RecuperaMonitoramentoView })));
const RecuperaCustosView = lazy(() => import('./recupera/RecuperaCustosView').then(m => ({ default: m.RecuperaCustosView })));
const RecuperaCronogramaView = lazy(() => import('./recupera/RecuperaCronogramaView').then(m => ({ default: m.RecuperaCronogramaView })));
const RecuperaRelatoriosView = lazy(() => import('./recupera/RecuperaRelatoriosView').then(m => ({ default: m.RecuperaRelatoriosView })));
const RecuperaBibliotecaView = lazy(() => import('./recupera/RecuperaBibliotecaView').then(m => ({ default: m.RecuperaBibliotecaView })));

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
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AreaObrigatoriaPlaceholder: React.FC<{
  descricao: string;
  onIrAreas: () => void;
}> = ({ descricao, onIrAreas }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
    <Layers className="w-10 h-10 text-slate-400 mx-auto" />
    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nenhum talhão selecionado</h3>
    <p className="text-xs text-slate-500 max-w-md mx-auto">{descricao}</p>
    <button
      type="button"
      onClick={onIrAreas}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
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

  const statusSync = useMemo(
    () => obterStatusSincronizacaoRecupera(areas.length + diagnosticos.length + projetos.length),
    [areas.length, diagnosticos.length, projetos.length]
  );

  const [activeTab, setActiveTab] = useState<string>(() => normalizeSubTab(initialSubTab));

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
    const existe = propriedades.some(p => p.id === propAtualizada.id);
    const lista = existe
      ? propriedades.map(p => (p.id === propAtualizada.id ? propAtualizada : p))
      : [...propriedades, propAtualizada];
    setPropriedades(lista);
    salvarPropriedadesRecupera(lista);
    if (!existe || !propriedadeAtivaId) {
      setPropriedadeAtivaId(propAtualizada.id);
      salvarPropriedadeSelecionadaId(propAtualizada.id);
    }
  };

  const handleSalvarDiagnosticoUnico = (diag: DiagnosticoTecnicoCompleto) => {
    const index = diagnosticos.findIndex(d => d.id === diag.id || d.areaId === diag.areaId);
    const lista = [...diagnosticos];
    if (index >= 0) lista[index] = diag;
    else lista.push(diag);
    setDiagnosticos(lista);
    salvarDiagnosticos(lista);
  };

  const handleResetarGeral = () => {
    if (window.confirm('Deseja realmente limpar todos os dados do módulo Recupera e reiniciar com a estrutura limpa?')) {
      resetarTodosOsDadosRecupera();
      window.location.reload();
    }
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
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [isMenuAberto]);

  const currentIndex = SUBTABS.findIndex(t => t.key === activeTab);
  const currentTabItem = SUBTABS[currentIndex >= 0 ? currentIndex : 0];
  const CurrentIcon = currentTabItem.icon;

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
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Painel de Controle Unificado e Profissional (Header + Contexto + Menu Suspenso) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative z-30 space-y-3">
        {/* Linha 1: Identidade da Solução & Seletores de Propriedade/Talhão */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/30 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  GeaAgro • Recuperação de Áreas Degradadas
                </span>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  RAD / PRAD
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Recupera
              </h1>
            </div>
          </div>

          {/* Seletores de Contexto: Propriedade & Área Degradada */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={propriedadeAtivaId}
              onChange={e => handleTrocarPropriedade(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white max-w-[210px] sm:max-w-xs focus:ring-2 focus:ring-emerald-500 truncate"
              title="Selecionar Fazenda"
            >
              <option value="">Selecione uma fazenda...</option>
              {propriedades.map(p => (
                <option key={p.id} value={p.id}>
                  Fazenda: {p.nome || 'Sem nome'}{p.municipio ? ` (${p.municipio}/${p.estado})` : ''}
                </option>
              ))}
            </select>

            <select
              value={areaAtivaId}
              onChange={e => handleSelecionarArea(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white max-w-[210px] sm:max-w-xs focus:ring-2 focus:ring-emerald-500 truncate"
              title="Selecionar Talhão"
            >
              <option value="">Nenhum talhão selecionado</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>
                  Talhão: {a.nomeTalhao} ({a.areaHa} ha - {a.grauSeveridade})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleResetarGeral}
              className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition shrink-0"
              title="Limpar todos os dados do módulo Recupera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linha 2: Menu Suspenso Compacto e Controles Sequenciais */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuAberto(prev => !prev)}
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
                  {currentTabItem.fase.split('•')[0].trim()}
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

            {isMenuAberto && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[440px] md:w-[500px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    value={filtroBusca}
                    onChange={e => setFiltroBusca(e.target.value)}
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

                {/* Lista Agrupada das 17 Sub-Abas Compacta */}
                <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-2.5 scrollbar-thin">
                  {Object.entries(fasesAgrupadas).map(([fase, tabs]) => (
                    <div key={fase} className="space-y-1">
                      <div className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <span>{fase}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{tabs.length}</span>
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

                <div className="p-1.5 px-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{SUBTABS.length} etapas</span>
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

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="py-1 px-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 sm:hidden"
              title="Menu suspenso alternativo"
            >
              {SUBTABS.map(t => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => irParaEtapa(currentIndex - 1)}
              disabled={currentIndex <= 0}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                currentIndex <= 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-xs'
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
          <RecuperaDashboardView
            propriedadeAtiva={propriedadeAtiva}
            areas={areas}
            projetos={projetos}
            diagnosticos={diagnosticos}
            statusSync={statusSync}
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
