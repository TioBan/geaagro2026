import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  Tractor,
  Wallet,
  Package,
  ShoppingBag,
  Wrench,
  CloudRain,
  FileText,
  Sliders,
  RefreshCw,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import {
  loadGestaoRuralStorage,
  saveGestaoRuralStorage,
  clearGestaoRuralStorage,
} from '../utils/gestaoRuralStorage';
import {
  PropriedadeRural,
  TalhaoRural,
  SafraAgragricola,
  TarefaCronograma,
  OperacaoCampoRecord,
  ItemEstoqueRural,
  CompraInsumoRecord,
  VendaComercializacaoRecord,
  ContaFinanceiraRecord,
  MaquinaImplementoRecord,
  ManutencaoPreventivaRecord,
  FuncionarioRuralRecord,
  ConfigCulturaIntegrada,
} from '../types/gestaoRural';
import { DEFAULT_CONFIG_CULTURA } from '../data/cropCommercializationPresets';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const GestaoExecutiveDashboard = lazyWithRetry(() =>
  import('./gestao_rural/GestaoExecutiveDashboard').then(m => ({ default: m.GestaoExecutiveDashboard }))
);
const GestaoAdministracaoPropriedade = lazyWithRetry(() =>
  import('./gestao_rural/GestaoAdministracaoPropriedade').then(m => ({ default: m.GestaoAdministracaoPropriedade }))
);
const GestaoPlanejamentoAgricola = lazyWithRetry(() =>
  import('./gestao_rural/GestaoPlanejamentoAgricola').then(m => ({ default: m.GestaoPlanejamentoAgricola }))
);
const GestaoOperacoesCampo = lazyWithRetry(() =>
  import('./gestao_rural/GestaoOperacoesCampo').then(m => ({ default: m.GestaoOperacoesCampo }))
);
const GestaoFinanceiroRural = lazyWithRetry(() =>
  import('./gestao_rural/GestaoFinanceiroRural').then(m => ({ default: m.GestaoFinanceiroRural }))
);
const GestaoEstoqueAlmoxarifado = lazyWithRetry(() =>
  import('./gestao_rural/GestaoEstoqueAlmoxarifado').then(m => ({ default: m.GestaoEstoqueAlmoxarifado }))
);
const GestaoComprasComercializacao = lazyWithRetry(() =>
  import('./gestao_rural/GestaoComprasComercializacao').then(m => ({ default: m.GestaoComprasComercializacao }))
);
const GestaoMaquinasRH = lazyWithRetry(() =>
  import('./gestao_rural/GestaoMaquinasRH').then(m => ({ default: m.GestaoMaquinasRH }))
);
const GestaoIrrigacaoClimaBI = lazyWithRetry(() =>
  import('./gestao_rural/GestaoIrrigacaoClimaBI').then(m => ({ default: m.GestaoIrrigacaoClimaBI }))
);
const GestaoRelatoriosIA = lazyWithRetry(() =>
  import('./gestao_rural/GestaoRelatoriosIA').then(m => ({ default: m.GestaoRelatoriosIA }))
);
const GestaoCulturaSelectorModal = lazyWithRetry(() =>
  import('./gestao_rural/GestaoCulturaSelectorModal').then(m => ({ default: m.GestaoCulturaSelectorModal }))
);

const SUB_TABS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'administracao', label: 'Fazenda & Talhões', icon: Building2 },
  { id: 'planejamento', label: 'Safras', icon: CalendarRange },
  { id: 'operacoes', label: 'Operações', icon: Tractor },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'comercializacao', label: 'Comercialização', icon: ShoppingBag },
  { id: 'maquinas_rh', label: 'Máquinas & RH', icon: Wrench },
  { id: 'irrigacao_clima_bi', label: 'Irrigação & BI', icon: CloudRain },
  { id: 'relatorios_ia', label: 'Relatórios', icon: FileText },
] as const;

const SubViewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando módulo de gestão rural...
  </div>
);

interface GestaoRuralModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  onNavigateToRegister?: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export const GestaoRuralModule: React.FC<GestaoRuralModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
  onNavigateToRegister,
  onNavigate,
}) => {
  const [data, setData] = useState(() => loadGestaoRuralStorage());
  const isFirstRenderRef = useRef(true);

  const [localSubTab, setLocalSubTab] = useState<string>('dashboard');
  const currentSubTab = activeSubTab || localSubTab;
  const [showCulturaModal, setShowCulturaModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSwitchTab = (tabId: string) => {
    setLocalSubTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  const handleUpdateConfigCultura = (newConfig: ConfigCulturaIntegrada) => {
    setData(prev => ({
      ...prev,
      configCultura: newConfig,
      propriedade: {
        ...prev.propriedade,
        configCultura: newConfig,
      },
    }));
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    saveGestaoRuralStorage(data);
  }, [data]);

  const handleUpdatePropriedade = (updated: PropriedadeRural) => {
    setData(prev => ({ ...prev, propriedade: updated }));
  };

  const handleAddTalhao = (newTalhao: TalhaoRural) => {
    setData(prev => ({ ...prev, talhoes: [newTalhao, ...prev.talhoes] }));
  };

  const handleDeleteTalhao = (id: string) => {
    setData(prev => ({ ...prev, talhoes: prev.talhoes.filter(t => t.id !== id) }));
  };

  const handleAddSafra = (newSafra: SafraAgragricola) => {
    setData(prev => ({ ...prev, safras: [newSafra, ...prev.safras] }));
  };

  const handleAddTarefa = (newTarefa: TarefaCronograma) => {
    setData(prev => ({ ...prev, cronograma: [newTarefa, ...prev.cronograma] }));
  };

  const handleToggleChecklistItem = (tarefaId: string, checklistId: string) => {
    setData(prev => ({
      ...prev,
      cronograma: prev.cronograma.map(t => {
        if (t.id !== tarefaId) return t;
        return {
          ...t,
          checklist: t.checklist.map(ck =>
            ck.id === checklistId ? { ...ck, concluido: !ck.concluido } : ck
          ),
        };
      }),
    }));
  };

  const handleAddOperacao = (newOp: OperacaoCampoRecord) => {
    setData(prev => ({ ...prev, operacoes: [newOp, ...prev.operacoes] }));
  };

  const handleAddConta = (newConta: ContaFinanceiraRecord) => {
    setData(prev => ({ ...prev, financeiro: [newConta, ...prev.financeiro] }));
  };

  const handleUpdateStatusConta = (id: string, status: 'pago' | 'recebido' | 'pendente') => {
    setData(prev => ({
      ...prev,
      financeiro: prev.financeiro.map(f => (f.id === id ? { ...f, status } : f)),
    }));
  };

  const handleAddEstoqueItem = (item: ItemEstoqueRural) => {
    setData(prev => ({ ...prev, estoque: [item, ...prev.estoque] }));
  };

  const handleAddVenda = (venda: VendaComercializacaoRecord) => {
    setData(prev => ({ ...prev, vendas: [venda, ...prev.vendas] }));
  };

  const handleAddCompra = (compra: CompraInsumoRecord) => {
    setData(prev => ({ ...prev, compras: [compra, ...prev.compras] }));
  };

  const handleAddMaquina = (maquina: MaquinaImplementoRecord) => {
    setData(prev => ({ ...prev, maquinas: [maquina, ...prev.maquinas] }));
  };

  const handleAddFuncionario = (func: FuncionarioRuralRecord) => {
    setData(prev => ({ ...prev, funcionarios: [func, ...prev.funcionarios] }));
  };

  const handleAddManutencao = (manut: ManutencaoPreventivaRecord) => {
    setData(prev => ({ ...prev, manutencoes: [manut, ...prev.manutencoes] }));
  };

  const handleConfirmResetData = () => {
    clearGestaoRuralStorage();
    setData(loadGestaoRuralStorage());
    setConfirmReset(false);
  };

  const activeCulturaConfig = data.configCultura || DEFAULT_CONFIG_CULTURA;

  const locationText = data.propriedade.municipio
    ? `${data.propriedade.municipio}${data.propriedade.estado ? ` - ${data.propriedade.estado}` : ''}`
    : null;

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* COMPACT HEADER & HORIZONTAL SUB-NAVIGATION */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span>Administração &amp; Gestão Rural</span>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="text-slate-500 dark:text-zinc-400 font-medium normal-case tracking-normal">
                {activeCulturaConfig.cultura} ({activeCulturaConfig.unidadeComercializacaoPrincipal})
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 truncate">
              {data.propriedade.nome || 'Minha Propriedade'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
              {locationText && <span>{locationText}</span>}
              {locationText && <span className="text-slate-300 dark:text-zinc-700">·</span>}
              <span>
                Agrícola <strong className="font-semibold text-slate-700 dark:text-zinc-200">{data.propriedade.areaAgricolaHa || 0} ha</strong>
              </span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span>
                Irrigada <strong className="font-semibold text-slate-700 dark:text-zinc-200">{data.propriedade.areaIrrigadaHa || 0} ha</strong>
              </span>
              {data.propriedade.responsavelTecnico && (
                <>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <span>RT: {data.propriedade.responsavelTecnico}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCulturaModal(true)}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configurar cultura integrada e unidades de comercialização"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cultura &amp; Unidades</span>
            </button>

            <button
              type="button"
              onClick={() => setData(loadGestaoRuralStorage())}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recarregar dados locais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recarregar</span>
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:border-red-300 hover:text-red-600 dark:bg-zinc-900 dark:hover:border-red-800 dark:hover:text-red-400 text-slate-500 dark:text-zinc-400 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Zerar lançamentos deste módulo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-xs">
                <span className="text-red-700 dark:text-red-300 font-medium">Zerar tudo?</span>
                <button
                  type="button"
                  onClick={handleConfirmResetData}
                  className="h-6 px-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="h-6 px-2 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Não
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HAIRLINE SUB-TAB NAVIGATION */}
        <div className="border-t border-slate-200/80 dark:border-zinc-800 px-3 sm:px-5 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 min-w-max" aria-label="Seções de Gestão Rural">
            {SUB_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = currentSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`relative h-10 px-2.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-1 bottom-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* LAZY-LOADED ACTIVE SUB-VIEW */}
      <React.Suspense fallback={<SubViewFallback />}>
        {currentSubTab === 'dashboard' && (
          <GestaoExecutiveDashboard
            propriedade={data.propriedade}
            talhoes={data.talhoes}
            safras={data.safras}
            financeiro={data.financeiro}
            estoque={data.estoque}
            maquinas={data.maquinas}
            funcionarios={data.funcionarios}
            operacoes={data.operacoes}
            configCultura={activeCulturaConfig}
            onOpenConfigCultura={() => setShowCulturaModal(true)}
            onNavigateTab={handleSwitchTab}
          />
        )}

        {currentSubTab === 'administracao' && (
          <GestaoAdministracaoPropriedade
            propriedade={data.propriedade}
            talhoes={data.talhoes}
            configCultura={activeCulturaConfig}
            onOpenConfigCultura={() => setShowCulturaModal(true)}
            onUpdatePropriedade={handleUpdatePropriedade}
            onAddTalhao={handleAddTalhao}
            onDeleteTalhao={handleDeleteTalhao}
            onNavigateToRegister={onNavigateToRegister}
            onNavigate={onNavigate}
          />
        )}

        {currentSubTab === 'planejamento' && (
          <GestaoPlanejamentoAgricola
            safras={data.safras}
            cronograma={data.cronograma}
            talhoes={data.talhoes}
            configCultura={activeCulturaConfig}
            onAddSafra={handleAddSafra}
            onAddTarefa={handleAddTarefa}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        )}

        {currentSubTab === 'operacoes' && (
          <GestaoOperacoesCampo
            operacoes={data.operacoes}
            talhoes={data.talhoes}
            safras={data.safras}
            onAddOperacao={handleAddOperacao}
          />
        )}

        {currentSubTab === 'financeiro' && (
          <GestaoFinanceiroRural
            financeiro={data.financeiro}
            safras={data.safras}
            onAddConta={handleAddConta}
            onUpdateStatusConta={handleUpdateStatusConta}
          />
        )}

        {currentSubTab === 'estoque' && (
          <GestaoEstoqueAlmoxarifado
            estoque={data.estoque}
            fornecedores={data.fornecedores}
            compras={data.compras}
            onAddEstoqueItem={handleAddEstoqueItem}
          />
        )}

        {currentSubTab === 'comercializacao' && (
          <GestaoComprasComercializacao
            vendas={data.vendas}
            compras={data.compras}
            fornecedores={data.fornecedores}
            safras={data.safras}
            configCultura={activeCulturaConfig}
            onOpenConfigCultura={() => setShowCulturaModal(true)}
            onAddVenda={handleAddVenda}
            onAddCompra={handleAddCompra}
          />
        )}

        {currentSubTab === 'maquinas_rh' && (
          <GestaoMaquinasRH
            maquinas={data.maquinas}
            manutencoes={data.manutencoes}
            funcionarios={data.funcionarios}
            onAddMaquina={handleAddMaquina}
            onAddFuncionario={handleAddFuncionario}
            onAddManutencao={handleAddManutencao}
          />
        )}

        {currentSubTab === 'irrigacao_clima_bi' && (
          <GestaoIrrigacaoClimaBI
            irrigacao={data.irrigacao}
            clima={data.clima}
            safras={data.safras}
          />
        )}

        {currentSubTab === 'relatorios_ia' && (
          <GestaoRelatoriosIA
            propriedade={data.propriedade}
            talhoes={data.talhoes}
            safras={data.safras}
            financeiro={data.financeiro}
          />
        )}
      </React.Suspense>

      {/* LAZY-LOADED CULTURA SELECTOR MODAL */}
      <React.Suspense fallback={null}>
        {showCulturaModal && (
          <GestaoCulturaSelectorModal
            isOpen
            onClose={() => setShowCulturaModal(false)}
            currentConfig={activeCulturaConfig}
            onSaveConfig={handleUpdateConfigCultura}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default GestaoRuralModule;
