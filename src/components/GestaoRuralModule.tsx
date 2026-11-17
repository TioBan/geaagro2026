import React, { useEffect, useRef, useState } from 'react';
import {
  Tractor,
  RefreshCw,
  MapPin,
  Trash2,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import {
  loadGestaoRuralStorage,
  saveGestaoRuralStorage,
  clearGestaoRuralStorage,
  getCropEmoji,
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

const SubViewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
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

  // Sync to LocalStorage only after user/state updates (skip redundant initial mount write)
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

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* UNIFIED SINGLE HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-700/50 flex flex-col gap-5">
        <div className="space-y-2">
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-300/90">
              Administração & Gestão Rural
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {data.propriedade.nome || 'Minha Propriedade'}
            </h1>
          </div>

          <p className="text-xs md:text-sm text-emerald-100/80 max-w-3xl leading-relaxed">
            {data.propriedade.municipio ? `${data.propriedade.municipio}${data.propriedade.estado ? ` - ${data.propriedade.estado}` : ''} • ` : ''}Área Agricolável:{' '}
            <strong className="text-white">{data.propriedade.areaAgricolaHa || 0} ha</strong> | Irrigada:{' '}
            <strong className="text-emerald-300">{data.propriedade.areaIrrigadaHa || 0} ha</strong>
            {data.propriedade.responsavelTecnico ? ` | RT: ${data.propriedade.responsavelTecnico}` : ''}
          </p>
        </div>

        {/* ACTION BUTTONS AT THE BOTTOM */}
        <div className="pt-4 border-t border-emerald-700/40 flex flex-wrap items-center gap-3 w-full">
          <button
            onClick={() => setShowCulturaModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 group"
            title="Escolher cultura integrada e ajustar unidades de comercialização (ex: Banana -> cx, sc, kg, ton)"
          >
            <span className="text-base group-hover:scale-110 transition-transform">
              {getCropEmoji(activeCulturaConfig.cultura)}
            </span>
            <div className="text-left leading-tight">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-950 block">Cultura Integrada</span>
              <span className="font-black text-xs">
                {activeCulturaConfig.cultura} • <span className="underline decoration-amber-900/40 font-mono text-[11px]">{activeCulturaConfig.unidadeComercializacaoPrincipal}</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-950/20 text-amber-950 text-[10px] font-extrabold ml-1">
              {activeCulturaConfig.unidadesHabilitadas?.join(', ') || 'cx, sc, kg, ton'}
            </span>
            <Sliders className="w-3.5 h-3.5 text-amber-950" />
          </button>

          <button
            onClick={() => handleSwitchTab('administracao')}
            className="px-4 py-2.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Ver Talhões</span>
          </button>
          <button
            onClick={() => handleSwitchTab('operacoes')}
            className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl border border-emerald-500/50 transition-all cursor-pointer flex items-center gap-2"
          >
            <Tractor className="w-4 h-4 text-emerald-300" />
            <span>Lançar Operação</span>
          </button>
          <button
            onClick={() => setData(loadGestaoRuralStorage())}
            className="px-3.5 py-2.5 bg-emerald-950/60 hover:bg-emerald-950/80 text-emerald-100 font-extrabold text-xs rounded-xl border border-emerald-600/40 transition-all cursor-pointer flex items-center gap-1.5"
            title="Atualizar Dados Locais"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recarregar</span>
          </button>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 font-extrabold text-xs rounded-xl border border-red-800/40 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
              title="Limpar todos os dados deste módulo"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Limpar Dados</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 ml-auto bg-red-950/80 border border-red-700/60 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-red-100 font-bold">Zerar lançamentos?</span>
              <button
                onClick={handleConfirmResetData}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Confirmar
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
            </div>
          )}
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

      {/* LAZY-LOADED CULTURA SELECTOR MODAL (mounted only when open) */}
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
