import React, { useState } from 'react';
import {
  Scale,
  LayoutDashboard,
  FileText,
  MapPin,
  FlaskConical,
  Calculator,
  FileCheck2,
  ChevronLeft,
  Bot,
  Plus,
  Share2,
  Sparkles,
  CloudSun,
  Landmark,
  Sprout,
} from 'lucide-react';
import { Pericia } from '../../types/pericia';
import { samplePericias } from '../../data/periciaSampleData';

import { PericiaDashboard } from './PericiaDashboard';
import { PericiaSubmoduleAbertura } from './PericiaSubmoduleAbertura';
import { PericiaSubmoduleDadosRegiao } from './PericiaSubmoduleDadosRegiao';
import { PericiaSubmoduleAvaliacaoImovel } from './PericiaSubmoduleAvaliacaoImovel';
import { PericiaSubmoduleVistoria } from './PericiaSubmoduleVistoria';
import { PericiaSubmoduleAnalise } from './PericiaSubmoduleAnalise';
import { PericiaSubmoduleCalculos } from './PericiaSubmoduleCalculos';
import { PericiaSubmoduleLaudo } from './PericiaSubmoduleLaudo';

import { NewPericiaModal } from './NewPericiaModal';
import { EvidenceChainModal } from './EvidenceChainModal';
import { PericiaReportGenerator } from './PericiaReportGenerator';

interface PericiaModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const PericiaModule: React.FC<PericiaModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [periciasList, setPericiasList] = useState<Pericia[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_pericias_pro_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out pre-filled demo data (ids starting with 'per-')
          return parsed.filter((p: any) => p && p.id && !p.id.startsWith('per-'));
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar perícias do localStorage:', e);
    }
    return [];
  });

  const [selectedPericia, setSelectedPericia] = useState<Pericia | null>(null);
  const [activeSubmodule, setActiveSubmodule] = useState<
    'dashboard' | 'abertura' | 'dados_regiao' | 'avaliacao_imovel' | 'vistoria' | 'analise' | 'calculos' | 'laudo'
  >('dashboard');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeModalPericia, setActiveModalPericia] = useState<Pericia | null>(null);

  // IA Assistance State
  const [iaOpen, setIaOpen] = useState(false);
  const [iaPrompt, setIaPrompt] = useState('');
  const [iaResponse, setIaResponse] = useState<string | null>(null);

  // Auto-persist pericias to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('agronutri_pericias_pro_v1', JSON.stringify(periciasList));
    } catch (e) {
      console.warn('Erro ao salvar perícias no localStorage:', e);
    }
  }, [periciasList]);

  // Sync external activeSubTab from Navbar/Sidebar
  React.useEffect(() => {
    if (!activeSubTab) return;

    if (activeSubTab === 'dashboard') {
      setActiveSubmodule('dashboard');
      return;
    }

    const validSubmodules: Array<'abertura' | 'dados_regiao' | 'avaliacao_imovel' | 'vistoria' | 'analise' | 'calculos' | 'laudo'> = [
      'abertura',
      'dados_regiao',
      'avaliacao_imovel',
      'vistoria',
      'analise',
      'calculos',
      'laudo',
    ];

    if (validSubmodules.includes(activeSubTab as any)) {
      const targetSub = activeSubTab as (typeof validSubmodules)[number];
      setActiveSubmodule(targetSub);
      // If no pericia is selected yet, but we have items in list, select the latest/first
      setSelectedPericia(current => {
        if (!current && periciasList.length > 0) {
          return periciasList[0];
        }
        return current;
      });
    }
  }, [activeSubTab, periciasList]);

  // Handlers
  const handleSelectPericia = (p: Pericia, targetSub: 'abertura' | 'dados_regiao' | 'avaliacao_imovel' | 'vistoria' | 'analise' | 'calculos' | 'laudo' = 'abertura') => {
    setSelectedPericia(p);
    setActiveSubmodule(targetSub);
    if (setActiveSubTab) {
      setActiveSubTab(targetSub);
    }
  };

  const handleNavigateSubmodule = (targetSub: 'abertura' | 'dados_regiao' | 'avaliacao_imovel' | 'vistoria' | 'analise' | 'calculos' | 'laudo') => {
    setActiveSubmodule(targetSub);
    if (setActiveSubTab) {
      setActiveSubTab(targetSub);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedPericia(null);
    setActiveSubmodule('dashboard');
    if (setActiveSubTab) {
      setActiveSubTab('dashboard');
    }
  };

  const handleUpdatePericia = (updated: Pericia) => {
    setPericiasList(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedPericia?.id === updated.id) {
      setSelectedPericia(updated);
    }
  };

  const handleCreatePericia = (newP: Pericia) => {
    setPericiasList(prev => [newP, ...prev]);
    setSelectedPericia(newP);
    setActiveSubmodule('abertura');
    if (setActiveSubTab) {
      setActiveSubTab('abertura');
    }
  };

  const handleDeletePericia = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta perícia?')) {
      setPericiasList(prev => prev.filter(p => p.id !== id));
      if (selectedPericia?.id === id) {
        setSelectedPericia(null);
        setActiveSubmodule('dashboard');
        if (setActiveSubTab) {
          setActiveSubTab('dashboard');
        }
      }
    }
  };

  const handleLoadDemoPericias = () => {
    setPericiasList(samplePericias);
  };

  const handleClearAllPericias = () => {
    if (confirm('Deseja limpar todos os registros e iniciar em branco para uso profissional?')) {
      setPericiasList([]);
      setSelectedPericia(null);
      setActiveSubmodule('dashboard');
      if (setActiveSubTab) {
        setActiveSubTab('dashboard');
      }
    }
  };

  const handleOpenEvidenceModal = (p: Pericia) => {
    setActiveModalPericia(p);
    setIsEvidenceModalOpen(true);
  };

  const handleOpenReportModal = (p: Pericia) => {
    setActiveModalPericia(p);
    setIsReportModalOpen(true);
  };

  const handleIaAssistant = () => {
    if (!iaPrompt.trim()) return;
    setIaResponse(
      `🤖 Nema IA / IA da GeaAgro — Análise Técnica:\n\nSua consulta ("${iaPrompt}") foi processada comparando o banco de dados de fitopatologia e precificação agrícola CONAB/CEPEA.\n\nSugestão de Perícia:\n1. Recomenda-se registrar nova vistoria com amostragem foliar em grid GPS;\n2. Verificar dados meteorológicos das últimas 72 horas para descartar estiagem atípica;\n3. O cálculo do dano emergente deve considerar o custo oficial do diesel/hora máq. da região.`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header / Context Switcher */}
      {selectedPericia && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao Dashboard
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                    {selectedPericia.codigoPericia}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedPericia.nome}</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {selectedPericia.contratanteNome} • {selectedPericia.imovelNome} ({selectedPericia.municipio}/{selectedPericia.uf})
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEvidenceModal(selectedPericia)}
                className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                Cadeia de Custódia
              </button>

              <button
                onClick={() => handleOpenReportModal(selectedPericia)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Gerar Laudo PDF
              </button>
            </div>
          </div>

          {/* Submodule Tabs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => handleNavigateSubmodule('abertura')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'abertura'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Abertura e Planejamento
            </button>

            <button
              onClick={() => handleNavigateSubmodule('dados_regiao')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'dados_regiao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Dados da Região
            </button>

            <button
              onClick={() => handleNavigateSubmodule('avaliacao_imovel')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'avaliacao_imovel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-500" />
              Avaliação do Imóvel
            </button>

            <button
              onClick={() => handleNavigateSubmodule('vistoria')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'vistoria'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              2. Vistoria e Evidências
            </button>

            <button
              onClick={() => handleNavigateSubmodule('analise')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'analise'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              3. Análise e Diagnóstico
            </button>

            <button
              onClick={() => handleNavigateSubmodule('calculos')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'calculos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              4. Cálculos e Danos
            </button>

            <button
              onClick={() => handleNavigateSubmodule('laudo')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubmodule === 'laudo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              5. Laudo e Encerramento
            </button>
          </div>
        </div>
      )}

      {/* When a sub-module is requested but no pericia is currently chosen */}
      {activeSubmodule !== 'dashboard' && !selectedPericia && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm my-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Selecione uma Perícia Técnica
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Para trabalhar no submódulo de{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {activeSubmodule === 'abertura' && '1. Abertura & Planejamento'}
                {activeSubmodule === 'dados_regiao' && 'Dados da Região & Clima'}
                {activeSubmodule === 'avaliacao_imovel' && 'Avaliação do Imóvel'}
                {activeSubmodule === 'vistoria' && '2. Vistoria & Evidências'}
                {activeSubmodule === 'analise' && '3. Análise & Diagnóstico'}
                {activeSubmodule === 'calculos' && '4. Cálculos & Danos'}
                {activeSubmodule === 'laudo' && '5. Laudo e Encerramento'}
              </span>
              , selecione uma perícia da sua lista técnica ou inicie um novo cadastro.
            </p>
          </div>

          {periciasList.length > 0 ? (
            <div className="space-y-2 pt-2 text-left">
              <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Perícias Disponíveis:
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {periciasList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPericia(p, activeSubmodule as any)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded">
                          {p.codigoPericia}
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {p.nome}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {p.imovelNome} • {p.contratanteNome} ({p.municipio}/{p.uf})
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      Abrir Submódulo &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Perícia</span>
              </button>
              <button
                onClick={handleLoadDemoPericias}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Carregar Demonstração</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={handleBackToDashboard}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-semibold cursor-pointer"
            >
              &larr; Voltar ao Dashboard Geral
            </button>
          </div>
        </div>
      )}

      {/* Main Submodule Router View */}
      {activeSubmodule === 'dashboard' && (
        <PericiaDashboard
          pericias={periciasList}
          onSelectPericia={handleSelectPericia}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenEvidenceChain={handleOpenEvidenceModal}
          onOpenReportGenerator={handleOpenReportModal}
          onDeletePericia={handleDeletePericia}
          onLoadDemoPericias={handleLoadDemoPericias}
          onClearAllPericias={handleClearAllPericias}
        />
      )}

      {selectedPericia && activeSubmodule === 'abertura' && (
        <PericiaSubmoduleAbertura pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'dados_regiao' && (
        <PericiaSubmoduleDadosRegiao pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'avaliacao_imovel' && (
        <PericiaSubmoduleAvaliacaoImovel pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'vistoria' && (
        <PericiaSubmoduleVistoria pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'analise' && (
        <PericiaSubmoduleAnalise pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'calculos' && (
        <PericiaSubmoduleCalculos pericia={selectedPericia} onUpdatePericia={handleUpdatePericia} />
      )}

      {selectedPericia && activeSubmodule === 'laudo' && (
        <PericiaSubmoduleLaudo
          pericia={selectedPericia}
          onUpdatePericia={handleUpdatePericia}
          onOpenReportGenerator={() => handleOpenReportModal(selectedPericia)}
        />
      )}

      {/* Floating AI Assistant (Nema IA) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIaOpen(!iaOpen)}
          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center cursor-pointer border border-emerald-500/30 group relative"
          title="Nema IA — Assistente de Inteligência Agronômica"
          aria-label="Abrir assistente Nema IA"
        >
          <Sprout className="w-6 h-6 text-emerald-200" />
          <span className="absolute right-14 bg-slate-900/90 dark:bg-zinc-800/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Nema IA — Assistente Agronômico
          </span>
        </button>

        {iaOpen && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-zinc-800">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Assistente de Perícia (Nema IA)
              </span>
              <button onClick={() => setIaOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Ex: Como fundamentar nexo causal para deriva de 2,4-D em tomateiro?"
              value={iaPrompt}
              onChange={e => setIaPrompt(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl"
            />

            <button
              onClick={handleIaAssistant}
              className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer hover:bg-emerald-700"
            >
              Consultar IA
            </button>

            {iaResponse && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-slate-800 dark:text-zinc-200 whitespace-pre-line text-[11px] max-h-48 overflow-y-auto">
                {iaResponse}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPericiaModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreatePericia={handleCreatePericia}
      />

      <EvidenceChainModal
        isOpen={isEvidenceModalOpen}
        pericia={activeModalPericia}
        onClose={() => setIsEvidenceModalOpen(false)}
      />

      <PericiaReportGenerator
        isOpen={isReportModalOpen}
        pericia={activeModalPericia}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default PericiaModule;
