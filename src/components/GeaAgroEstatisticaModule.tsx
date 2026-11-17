import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calculator,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GitBranch,
  Layers,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { NemaIAEstatisticaIcon } from './icons/NemaIAEstatisticaIcon';
import {
  EstatisticaConjuntoDados,
  EstatisticaExperimento,
  EstatisticaGrafico,
  EstatisticaHistoricoRegistro,
  EstatisticaProjeto,
  EstatisticaResultado,
  EstatisticaUiPreferences,
  EstatisticaVariavel,
} from '../modules/estatistica/types/estatistica';
import { estatisticaStorage } from '../modules/estatistica/storage/estatisticaStorage';
import { AnovaResult } from '../modules/estatistica/statistics-engine/anova/anovaEngine';
import { ProjetosExperimentosView } from '../modules/estatistica/components/ProjetosExperimentosView';
import { DadosImportacaoView } from '../modules/estatistica/components/DadosImportacaoView';
import { AnalisesParametricasView } from '../modules/estatistica/components/AnalisesParametricasView';
import { AnalisesAvancadasView } from '../modules/estatistica/components/AnalisesAvancadasView';
import { GraficosRelatoriosBackupView } from '../modules/estatistica/components/GraficosRelatoriosBackupView';
import { NemaIAEstatisticaView } from '../modules/estatistica/components/NemaIAEstatisticaView';

export type EstatisticaSubTab =
  | 'projetos'
  | 'dados'
  | 'ia_estatistica'
  | 'descritiva'
  | 'delineamentos'
  | 'anova'
  | 'medias'
  | 'regressao'
  | 'correlacao'
  | 'pressupostos'
  | 'nao_parametrica'
  | 'multivariada'
  | 'especiais'
  | 'graficos'
  | 'relatorios';

interface GeaAgroEstatisticaModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (sub: string) => void;
}

const SUB_TABS: { id: EstatisticaSubTab; label: string; icon: any }[] = [
  { id: 'projetos', label: 'Projetos & Exp.', icon: FolderKanban },
  { id: 'dados', label: 'Dados & Planilhas', icon: FileSpreadsheet },
  { id: 'ia_estatistica', label: 'Nema IA Estatística', icon: NemaIAEstatisticaIcon },
  { id: 'descritiva', label: 'Descritiva', icon: Calculator },
  { id: 'delineamentos', label: 'Delineamentos', icon: Layers },
  { id: 'anova', label: 'ANOVA', icon: Sliders },
  { id: 'medias', label: 'Médias (Post-Hoc)', icon: BarChart3 },
  { id: 'regressao', label: 'Regressão', icon: TrendingUp },
  { id: 'correlacao', label: 'Correlação', icon: GitBranch },
  { id: 'pressupostos', label: 'Pressupostos', icon: ShieldCheck },
  { id: 'nao_parametrica', label: 'Não Paramétrica', icon: Activity },
  { id: 'multivariada', label: 'Multivariada', icon: Layers },
  { id: 'especiais', label: 'Especiais', icon: Activity },
  { id: 'graficos', label: 'Gráficos', icon: BarChart3 },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
];

export const GeaAgroEstatisticaModule: React.FC<GeaAgroEstatisticaModuleProps> = ({
  activeSubTab: propSubTab,
  setActiveSubTab: propSetSubTab,
}) => {
  const [localSubTab, setLocalSubTab] = useState<EstatisticaSubTab>('projetos');
  const currentSubTab: EstatisticaSubTab =
    propSubTab && SUB_TABS.some((t) => t.id === propSubTab)
      ? (propSubTab as EstatisticaSubTab)
      : localSubTab;

  const navigateSubTab = (tab: EstatisticaSubTab) => {
    setLocalSubTab(tab);
    propSetSubTab?.(tab);
  };

  const [prefs, setPrefs] = useState<EstatisticaUiPreferences>(() =>
    estatisticaStorage.getUiPreferences()
  );
  const [projetos, setProjetos] = useState<EstatisticaProjeto[]>([]);
  const [experimentos, setExperimentos] = useState<EstatisticaExperimento[]>([]);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string | null>(
    prefs.ultimoProjetoId || null
  );
  const [selectedExperimentoId, setSelectedExperimentoId] = useState<string | null>(
    prefs.ultimoExperimentoId || null
  );

  const [dataset, setDataset] = useState<EstatisticaConjuntoDados | null>(null);
  const [variaveis, setVariaveis] = useState<EstatisticaVariavel[]>([]);
  const [resultados, setResultados] = useState<EstatisticaResultado[]>([]);
  const [graficos, setGraficos] = useState<EstatisticaGrafico[]>([]);
  const [historico, setHistorico] = useState<EstatisticaHistoricoRegistro[]>([]);
  const [lastAnova, setLastAnova] = useState<AnovaResult | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const refreshAll = useCallback(async () => {
    const [projs, exps, hist] = await Promise.all([
      estatisticaStorage.listarProjetos(),
      estatisticaStorage.listarExperimentos(),
      estatisticaStorage.listarHistorico(),
    ]);
    setProjetos(projs);
    setExperimentos(exps);
    setHistorico(hist);

    let activeProjId = selectedProjetoId;
    if (!activeProjId || !projs.some((p) => p.id === activeProjId)) {
      activeProjId = projs[0]?.id || null;
      setSelectedProjetoId(activeProjId);
    }

    let activeExpId = selectedExperimentoId;
    if (!activeExpId || !exps.some((e) => e.id === activeExpId)) {
      const fromProj = activeProjId ? exps.find((e) => e.projetoId === activeProjId) : undefined;
      activeExpId = fromProj?.id || exps[0]?.id || null;
      setSelectedExperimentoId(activeExpId);
    }

    if (activeExpId) {
      const [ds, vars, resList, grafList] = await Promise.all([
        estatisticaStorage.obterConjuntoDados(activeExpId),
        estatisticaStorage.listarVariaveis(activeExpId),
        estatisticaStorage.listarResultados(activeExpId),
        estatisticaStorage.listarGraficos(activeExpId),
      ]);
      setDataset(ds);
      setVariaveis(vars);
      setResultados(resList);
      setGraficos(grafList);
    } else {
      setDataset(null);
      setVariaveis([]);
      setResultados([]);
      setGraficos([]);
    }
  }, [selectedProjetoId, selectedExperimentoId]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const handleSelectProjeto = (id: string | null) => {
    setSelectedProjetoId(id);
    const firstExp = id ? experimentos.find((e) => e.projetoId === id) : undefined;
    const nextExpId = firstExp?.id || null;
    setSelectedExperimentoId(nextExpId);
    setLastAnova(null);
    const nextPrefs = estatisticaStorage.saveUiPreferences({
      ultimoProjetoId: id || undefined,
      ultimoExperimentoId: nextExpId || undefined,
    });
    setPrefs(nextPrefs);
  };

  const handleSelectExperimento = (id: string | null) => {
    setSelectedExperimentoId(id);
    setLastAnova(null);
    const exp = experimentos.find((e) => e.id === id);
    if (exp) setSelectedProjetoId(exp.projetoId);
    const nextPrefs = estatisticaStorage.saveUiPreferences({
      ultimoProjetoId: exp?.projetoId || selectedProjetoId || undefined,
      ultimoExperimentoId: id || undefined,
    });
    setPrefs(nextPrefs);
  };

  const handleUpdatePrefs = (next: Partial<EstatisticaUiPreferences>) => {
    setPrefs(estatisticaStorage.saveUiPreferences(next));
  };

  const activeProjeto = projetos.find((p) => p.id === selectedProjetoId) || null;
  const activeExperimento = experimentos.find((e) => e.id === selectedExperimentoId) || null;

  const needsExperimento =
    currentSubTab !== 'projetos' &&
    currentSubTab !== 'ia_estatistica' &&
    currentSubTab !== 'graficos' &&
    currentSubTab !== 'relatorios';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      {/* Cabeçalho Institucional do Módulo */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  GeaAgro Estatística
                </h1>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  · Motor Determinístico Local (OPFS + WASM)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Experimentação agrícola, biometria, delineamentos multi-estratos, regressão dose-resposta, multivariada e laudos científicos offline.
              </p>
            </div>
          </div>

          {/* Seletor rápido de contexto + Status Offline */}
          <div className="flex flex-wrap items-center gap-2.5">
            {experimentos.length > 0 && (
              <select
                value={selectedExperimentoId || ''}
                onChange={(e) => handleSelectExperimento(e.target.value || null)}
                aria-label="Selecionar experimento ativo"
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 max-w-[260px]"
              >
                {experimentos.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.nome} ({exp.delineamento})
                  </option>
                ))}
              </select>
            )}
            <div className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-medium flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-600 dark:text-zinc-400">Online (Cálculo Local)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-400">100% Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navegação Horizontal das 15 Ferramentas */}
        <nav className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1">
          {SUB_TABS.map((t) => {
            const Icon = t.icon;
            const active = currentSubTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navigateSubTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {currentSubTab === 'projetos' && (
          <ProjetosExperimentosView
            projetos={projetos}
            experimentos={experimentos}
            historico={historico}
            selectedProjetoId={selectedProjetoId}
            selectedExperimentoId={selectedExperimentoId}
            onSelectProjeto={handleSelectProjeto}
            onSelectExperimento={handleSelectExperimento}
            onIrParaDados={() => navigateSubTab('dados')}
            onRefresh={refreshAll}
          />
        )}

        {needsExperimento && !activeExperimento ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Crie ou selecione um experimento científico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Para garantir rastreabilidade científica e integridade em OPFS, cada conjunto de dados e análise pertence a um experimento.
            </p>
            <button
              type="button"
              onClick={() => navigateSubTab('projetos')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
            >
              Ir para Projetos & Experimentos
            </button>
          </div>
        ) : (
          <>
            {currentSubTab === 'ia_estatistica' && (
              <NemaIAEstatisticaView
                activeExperimento={activeExperimento}
                experimentos={experimentos}
                dataset={dataset}
                variaveis={variaveis}
                resultados={resultados}
                graficos={graficos}
                onSelectExperimento={handleSelectExperimento}
                onRefresh={refreshAll}
                onNavigateSubTab={navigateSubTab}
              />
            )}

            {currentSubTab === 'dados' && activeExperimento && (
              <DadosImportacaoView
                experimento={activeExperimento}
                dataset={dataset}
                variaveis={variaveis}
                onRefresh={refreshAll}
              />
            )}

            {(currentSubTab === 'descritiva' ||
              currentSubTab === 'delineamentos' ||
              currentSubTab === 'anova' ||
              currentSubTab === 'medias' ||
              currentSubTab === 'regressao' ||
              currentSubTab === 'correlacao' ||
              currentSubTab === 'pressupostos') &&
              activeExperimento && (
                <AnalisesParametricasView
                  section={currentSubTab}
                  experimento={activeExperimento}
                  dataset={dataset}
                  variaveis={variaveis}
                  prefs={prefs}
                  resultados={resultados}
                  lastAnova={lastAnova}
                  onSetLastAnova={setLastAnova}
                  onNavigateSubTab={navigateSubTab}
                  onRefresh={refreshAll}
                />
              )}

            {(currentSubTab === 'nao_parametrica' ||
              currentSubTab === 'multivariada' ||
              currentSubTab === 'especiais') &&
              activeExperimento && (
                <AnalisesAvancadasView
                  section={currentSubTab}
                  experimento={activeExperimento}
                  dataset={dataset}
                  variaveis={variaveis}
                  prefs={prefs}
                  onNavigateSubTab={navigateSubTab}
                  onRefresh={refreshAll}
                />
              )}

            {(currentSubTab === 'graficos' || currentSubTab === 'relatorios') && (
              <GraficosRelatoriosBackupView
                section={currentSubTab}
                projeto={activeProjeto}
                experimento={activeExperimento}
                dataset={dataset}
                variaveis={variaveis}
                resultados={resultados}
                graficos={graficos}
                prefs={prefs}
                onRefresh={refreshAll}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default GeaAgroEstatisticaModule;
