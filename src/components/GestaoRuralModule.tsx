import React, { useState, useEffect } from 'react';
import {
  Building2,
  LayoutGrid,
  Calendar,
  Tractor,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Droplets,
  CloudSun,
  BarChart3,
  FileText,
  Bot,
  RefreshCw,
  Download,
  Upload,
  MapPin,
  Trash2,
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
  FornecedorRural,
  CompraInsumoRecord,
  VendaComercializacaoRecord,
  ContaFinanceiraRecord,
  MaquinaImplementoRecord,
  ManutencaoPreventivaRecord,
  FuncionarioRuralRecord,
  SistemaIrrigacaoFertirrigacao,
  LeituraEstacaoMeteorologica,
} from '../types/gestaoRural';

import { GestaoExecutiveDashboard } from './gestao_rural/GestaoExecutiveDashboard';
import { GestaoAdministracaoPropriedade } from './gestao_rural/GestaoAdministracaoPropriedade';
import { GestaoPlanejamentoAgricola } from './gestao_rural/GestaoPlanejamentoAgricola';
import { GestaoOperacoesCampo } from './gestao_rural/GestaoOperacoesCampo';
import { GestaoFinanceiroRural } from './gestao_rural/GestaoFinanceiroRural';
import { GestaoEstoqueAlmoxarifado } from './gestao_rural/GestaoEstoqueAlmoxarifado';
import { GestaoComprasComercializacao } from './gestao_rural/GestaoComprasComercializacao';
import { GestaoMaquinasRH } from './gestao_rural/GestaoMaquinasRH';
import { GestaoIrrigacaoClimaBI } from './gestao_rural/GestaoIrrigacaoClimaBI';
import { GestaoRelatoriosIA } from './gestao_rural/GestaoRelatoriosIA';

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
  // Offline-First Consolidated State Initializer
  const [data, setData] = useState(() => loadGestaoRuralStorage());

  // Navigation state
  const [localSubTab, setLocalSubTab] = useState<string>('dashboard');
  const currentSubTab = activeSubTab || localSubTab;

  const handleSwitchTab = (tabId: string) => {
    setLocalSubTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    saveGestaoRuralStorage(data);
  }, [data]);

  // Handlers for state mutations
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

  const handleResetData = () => {
    if (window.confirm('Deseja realmente limpar todos os dados de Administração e Gestão Rural? Todos os lançamentos serão zerados.')) {
      clearGestaoRuralStorage();
      setData(loadGestaoRuralStorage());
    }
  };

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
          <button
            onClick={handleResetData}
            className="px-3.5 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 font-extrabold text-xs rounded-xl border border-red-800/40 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            title="Limpar todos os dados deste módulo"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Limpar Dados</span>
          </button>
        </div>
      </div>

      {/* RENDER CURRENT SUB-VIEW */}
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
          onNavigateTab={handleSwitchTab}
        />
      )}

      {currentSubTab === 'administracao' && (
        <GestaoAdministracaoPropriedade
          propriedade={data.propriedade}
          talhoes={data.talhoes}
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
          onAddMovimentacao={() => {}}
        />
      )}

      {currentSubTab === 'comercializacao' && (
        <GestaoComprasComercializacao
          vendas={data.vendas}
          compras={data.compras}
          fornecedores={data.fornecedores}
          safras={data.safras}
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
    </div>
  );
};
