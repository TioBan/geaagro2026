import React, { useState, useMemo } from 'react';
import {
  Bug, Map, Layers, Database, Activity, MapPin, 
  Leaf, FlaskConical, BarChart2, Calendar, FileText, 
  ShieldCheck, AlertTriangle, TrendingUp, TrendingDown,
  Camera, Zap, CheckCircle2, Sparkles, Sprout, Bot, Plus, X
} from 'lucide-react';
import { NematologyTab, NematodeField, InfestationRisk, NematodeSpecies } from '../types/nematology';
import { NEMATODE_SPECIES_CATALOG, INITIAL_NEMATODE_FIELDS, calculateDynamicRisk, calculateReproductionFactor } from '../data/nematologyData';
import { NemaAIConsole } from './NemaAIConsole';
import { NematodeSpeciesBank } from './NematodeSpeciesBank';
import { NemaIAScoreCard } from './NemaIAScoreCard';

interface NematologyModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: NematologyTab) => void;
}

export const NematologyModule: React.FC<NematologyModuleProps> = ({ activeSubTab, setActiveSubTab }) => {
  const [internalTab, setInternalTab] = useState<NematologyTab>('dashboard');
  const activeTab = (activeSubTab as NematologyTab) || internalTab;
  const setActiveTab = (tab: NematologyTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };
  const [fields, setFields] = useState<NematodeField[]>(INITIAL_NEMATODE_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');

  const currentField = useMemo(() => fields.find(f => f?.id === selectedFieldId) || fields[0] || null, [fields, selectedFieldId]);

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('pratylenchus_brachyurus');

  // Modal para cadastrar novo talhão
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newAreaHa, setNewAreaHa] = useState<number | ''>('');
  const [newSoilType, setNewSoilType] = useState<'Arenoso' | 'Argiloso' | 'Misto'>('Misto');
  const [newCrop, setNewCrop] = useState('Soja');
  const [newCultivar, setNewCultivar] = useState('');

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const newField: NematodeField = {
      id: `nema-field-${Date.now()}`,
      farmName: newFarmName || 'Fazenda Principal',
      fieldName: newFieldName,
      areaHa: Number(newAreaHa) || 0,
      soilType: newSoilType,
      cultivationSystem: 'Plantio Direto',
      currentCrop: newCrop,
      currentCultivar: newCultivar || 'Padrão',
      currentRisk: 'Baixa',
      pi: 0,
      pf: 0,
      reproductionFactor: 0,
      history: [],
      samples: [],
      labResults: [],
      managements: []
    };

    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setIsAddModalOpen(false);
    setNewFarmName('');
    setNewFieldName('');
    setNewAreaHa('');
    setNewCultivar('');
  };

  // Dynamic calculations for Dashboard
  const totalArea = useMemo(() => fields.reduce((acc, f) => acc + (f.areaHa || 0), 0), [fields]);
  const occurrenceCount = useMemo(() => fields.filter(f => f.currentRisk && f.currentRisk !== 'Baixa').length, [fields]);
  const totalLabResults = useMemo(() => fields.reduce((acc, f) => acc + (f.labResults?.length || 0), 0), [fields]);

  // Visual helper for Risk Colors
  const getRiskColor = (risk: InfestationRisk) => {
    switch (risk) {
      case 'Baixa': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Moderada': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Muito Alta': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };
  
  const getRiskDot = (risk: InfestationRisk) => {
    switch (risk) {
      case 'Baixa': return '🟢';
      case 'Moderada': return '🟡';
      case 'Alta': return '🟠';
      case 'Muito Alta': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Bug className="w-3 h-3" />
                Manejo Integrado • Mapa Dinâmico
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5" />
                Nema IA Ativa
              </span>
              <span className="text-stone-300 text-xs font-semibold">• Diagnóstico Fitossanitário & Gêmeo Digital</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-400" />
              Nematologia do Talhão
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-4xl">
              Monitoramento de nematoides desde a amostragem, mapas de infestação, rotação de culturas, até o cálculo do Fator de Reprodução (Pf/Pi) e auditoria inteligente com a Nema IA.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-stone-600"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Talhão</span>
            </button>
            <button
              onClick={() => setActiveTab('nema_ia_chat')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-white" />
              <span>Abrir Nema IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de Talhão (Exceto no Banco de Espécies) */}
      {activeTab !== 'banco_especies' && (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {(fields || []).length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Talhão Monitorado:</span>
                <select
                  value={currentField?.id || ''}
                  onChange={e => setSelectedFieldId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.farmName} - {f.fieldName}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px]">
                <span>Área: <strong>{currentField?.areaHa || 0} ha</strong></span>
                <span>Cultura Atual: <strong>{currentField?.currentCrop || 'N/A'} ({currentField?.currentCultivar || 'N/A'})</strong></span>
                {currentField?.currentRisk && (
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] border ${getRiskColor(currentField.currentRisk)}`}>
                    Risco: {getRiskDot(currentField.currentRisk)} {currentField.currentRisk}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Nenhum talhão cadastrado para monitoramento nematológico.
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Talhão</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Cadastro de Talhão */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Bug className="w-5 h-5 text-amber-500" />
              Novo Talhão Nematológico
            </h3>
            <p className="text-xs text-slate-500 mb-4">Cadastre a área e características do solo para iniciar o monitoramento.</p>

            <form onSubmit={handleCreateField} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Fazenda / Propriedade</label>
                <input
                  type="text"
                  placeholder="Ex: Fazenda Santa Maria"
                  value={newFarmName}
                  onChange={e => setNewFarmName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Nome do Talhão *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Talhão 01"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Área (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 50"
                    value={newAreaHa}
                    onChange={e => setNewAreaHa(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Tipo de Solo</label>
                  <select
                    value={newSoilType}
                    onChange={e => setNewSoilType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="Misto">Misto</option>
                    <option value="Arenoso">Arenoso</option>
                    <option value="Argiloso">Argiloso</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Cultura</label>
                  <input
                    type="text"
                    placeholder="Soja"
                    value={newCrop}
                    onChange={e => setNewCrop(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Cultivar</label>
                  <input
                    type="text"
                    placeholder="TMG 7062"
                    value={newCultivar}
                    onChange={e => setNewCultivar(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl"
                >
                  Salvar Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 0. NEMA IA CONSOLE (SUBMODULES)                           */}
      {/* ========================================================= */}
      {activeTab === 'nema_ia_chat' && (
        <div className="space-y-6 animate-fade-in">
          <NemaAIConsole
            currentField={currentField}
            speciesCatalog={NEMATODE_SPECIES_CATALOG}
            initialSubModule="conversa"
          />
        </div>
      )}

      {activeTab === 'nema_ia_score' && (
        <div className="space-y-6 animate-fade-in">
          <NemaAIConsole
            currentField={currentField}
            speciesCatalog={NEMATODE_SPECIES_CATALOG}
            initialSubModule="score"
          />
        </div>
      )}

      {activeTab === 'nema_ia' && (
        <div className="space-y-6 animate-fade-in">
          <NemaAIConsole
            currentField={currentField}
            speciesCatalog={NEMATODE_SPECIES_CATALOG}
            initialSubModule="conversa"
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DASHBOARD & MAPA DE INFESTAÇÃO                           */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
          {/* Nema IA Score Card (Integrado Modo Local e IA) */}
          <NemaIAScoreCard
            field={currentField}
            onRunAIScore={() => setActiveTab('nema_ia_score')}
          />
          
          {/* Quick AI Callout */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm text-amber-950 dark:text-amber-200 block font-black">
                  Auditoria Inteligente de Nematoides com Nema IA
                </strong>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Execute o diagnóstico agronômico automatizado com inteligência artificial para este talhão ({currentField?.fieldName || 'Selecionado'}).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('nema_ia_chat')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Sprout className="w-4 h-4" />
              <span>Auditar com Nema IA</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Área Total Monitorada</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalArea.toLocaleString('pt-BR')} ha</div>
            </div>
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Talhões com Ocorrência</span>
              <div className="text-xl font-black text-amber-600 mt-1">{occurrenceCount} Talhões</div>
            </div>
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Espécie Predominante</span>
              <div className="text-sm font-black text-stone-600 dark:text-stone-300 mt-1 italic">
                {currentField?.dominantSpeciesId ? currentField.dominantSpeciesId.replace('_', ' ') : 'Nenhuma'}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Total de Laudos Lab.</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalLabResults}</div>
            </div>
            <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Índice de Risco Global</span>
              <div className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1">
                {occurrenceCount > 0 ? '🟠 Alertas Existentes' : '🟢 Baixo Risco'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
               <h3 className="font-black mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
                 <Map className="w-5 h-5 text-stone-500"/> Mapa de Infestação
               </h3>
               <p className="text-xs text-slate-500 mb-4">Intensidade de infestação classificada por níveis de risco técnico.</p>
               
               {(fields || []).length > 0 ? (
                 <div className="w-full min-h-64 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
                    {fields.map(f => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          selectedFieldId === f.id ? 'ring-2 ring-amber-500 shadow-md' : ''
                        } ${
                          f.currentRisk === 'Muito Alta' || f.currentRisk === 'Alta'
                            ? 'bg-red-100/50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                            : f.currentRisk === 'Moderada'
                            ? 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
                            : 'bg-emerald-100/50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600'
                        }`}
                      >
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{f.fieldName}</span>
                        <span className="text-[10px] font-bold mt-0.5">{getRiskDot(f.currentRisk || 'Baixa')} {f.currentRisk || 'Baixa'}</span>
                        <span className="text-[9px] text-slate-500 mt-1">{f.areaHa} ha • {f.currentCrop}</span>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="w-full h-48 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Map className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhum talhão registrado para mapa de infestação.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Talhão</span>
                    </button>
                 </div>
               )}
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
              <h3 className="font-black mb-3 text-slate-900 dark:text-white">Motor de Risco Dinâmico</h3>
              <p className="text-[11px] text-slate-500 mb-4">O sistema cruza dados do laboratório, cultura, tipo de solo e histórico para gerar alertas sem IA.</p>
              
              {(fields || []).length > 0 ? (
                <div className="space-y-3">
                  {fields.map(f => (
                    <div
                      key={f.id}
                      className={`p-3 border rounded-lg ${
                        f.currentRisk === 'Alta' || f.currentRisk === 'Muito Alta'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      <strong className={`text-xs block flex items-center gap-1 ${
                        f.currentRisk === 'Alta' || f.currentRisk === 'Muito Alta'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {f.currentRisk === 'Alta' || f.currentRisk === 'Muito Alta' ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {f.fieldName}: Solo {f.soilType} ({f.currentCrop})
                      </strong>
                      <p className={`text-[10px] mt-1 ${
                        f.currentRisk === 'Alta' || f.currentRisk === 'Muito Alta'
                          ? 'text-red-600 dark:text-red-300'
                          : 'text-emerald-600 dark:text-emerald-300'
                      }`}>
                        {f.currentRisk === 'Alta' || f.currentRisk === 'Muito Alta'
                          ? 'Atenção com sucessão de culturas suscetíveis. Recomendada adição de rotação e nematicida biológico.'
                          : 'Pressão sob controle ou nível baixo de nematóides detectados.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Sem dados para geração de alertas automáticos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GÊMEO DIGITAL DO TALHÃO                                  */}
      {/* ========================================================= */}
      {activeTab === 'gemeo_digital' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
          <div className="border-b pb-4">
             <h3 className="font-black text-lg text-stone-700 dark:text-stone-300 flex items-center gap-2">
               <Zap className="w-6 h-6 text-amber-500"/> Gêmeo Digital Nematológico: {currentField?.fieldName || 'Talhão'}
             </h3>
             <p className="text-xs text-slate-500 mt-1">
               Consolidação histórica completa das análises, culturas e manejo, avaliando se as estratégias reduzem ou aumentam a pressão.
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tipo de Solo</span>
                <strong className="text-base text-slate-900 dark:text-white mt-1">{currentField?.soilType || 'N/A'}</strong>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">População Inicial (Pi)</span>
                <strong className="text-lg text-red-600 mt-1">{currentField?.pi || 0} <span className="text-[10px]">individuos</span></strong>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">População Final (Pf)</span>
                <strong className="text-lg text-emerald-600 mt-1">{currentField?.pf || 0} <span className="text-[10px]">individuos</span></strong>
             </div>
             <div className={`p-4 rounded-xl border text-center ${currentField?.reproductionFactor && currentField.reproductionFactor < 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Fator Reprodução (Pf/Pi)</span>
                <strong className={`text-2xl font-black mt-1 ${currentField?.reproductionFactor && currentField.reproductionFactor < 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {currentField?.reproductionFactor || 0}
                </strong>
                <span className="text-[9px] block font-bold mt-1 text-slate-500">
                  {currentField?.reproductionFactor && currentField.reproductionFactor < 1 ? 'População em declínio 📉' : 'População em aumento 📈'}
                </span>
             </div>
          </div>

          <div className="mt-6">
            <h4 className="font-black text-sm mb-3">Linha do Tempo Integrada (Histórico de Culturas & Laudos)</h4>
            {(currentField?.history || []).length > 0 ? (
              <div className="space-y-4 border-l-2 border-stone-300 dark:border-stone-700 ml-2 pl-4 relative">
                 {currentField!.history.map((h, i) => (
                   <div key={i} className="relative">
                     <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-black"></span>
                     <span className="text-[10px] font-bold text-slate-500">Safra {h.cropSeason}</span>
                     <strong className="text-sm font-bold block text-slate-900 dark:text-white">{h.crop} ({h.cultivar})</strong>
                     <span className="text-xs text-slate-600 dark:text-zinc-400">Produtividade: {h.yieldKgHa} kg/ha.</span>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-xl text-center text-xs text-slate-500">
                Nenhum histórico de cultura ou laudo registrado para este talhão.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. AMOSTRAGEM E LAUDOS                                      */}
      {/* ========================================================= */}
      {activeTab === 'amostragem' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">Resultados Laboratoriais & Amostragem</h3>
                <p className="text-xs text-slate-500">Dados quantitativos por volume de solo e grama de raiz.</p>
              </div>
           </div>

           {(currentField?.labResults || []).length > 0 ? (
             currentField!.labResults.map(lab => (
               <div key={lab.id} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                     <div>
                       <strong className="text-sm text-slate-900 dark:text-white block">Laudo Lab: {lab.id}</strong>
                       <span className="text-[10px] text-slate-500 font-mono">Data: {lab.date} • Espécie ID: {lab.speciesId}</span>
                     </div>
                     <span className="bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300 px-2 py-1 rounded text-[10px] font-bold">
                       Método: {lab.method}
                     </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-2 border rounded bg-white dark:bg-black text-center">
                      <span className="text-[9px] font-bold text-slate-400 block">Solo (ind/200cm³)</span>
                      <strong className="text-lg text-slate-900 dark:text-white">{lab.populationSoil200cm3}</strong>
                    </div>
                    <div className="p-2 border rounded bg-white dark:bg-black text-center">
                      <span className="text-[9px] font-bold text-slate-400 block">Raiz (ind/10g)</span>
                      <strong className="text-lg text-slate-900 dark:text-white">{lab.populationRoot10g}</strong>
                    </div>
                    <div className="p-2 border rounded bg-white dark:bg-black text-center">
                      <span className="text-[9px] font-bold text-slate-400 block">Ovos</span>
                      <strong className="text-lg text-slate-900 dark:text-white">{lab.eggs}</strong>
                    </div>
                    <div className="p-2 border rounded bg-white dark:bg-black text-center">
                      <span className="text-[9px] font-bold text-slate-400 block">Juvenis</span>
                      <strong className="text-lg text-slate-900 dark:text-white">{lab.juveniles}</strong>
                    </div>
                    <div className="p-2 border rounded bg-white dark:bg-black text-center">
                      <span className="text-[9px] font-bold text-slate-400 block">Adultos</span>
                      <strong className="text-lg text-slate-900 dark:text-white">{lab.adults}</strong>
                    </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="p-8 border border-dashed rounded-xl text-center space-y-2">
               <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
               <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhum laudo laboratorial registrado para este talhão.</p>
               <p className="text-[11px] text-slate-400">Envie amostras ou adicione laudos de análise nematológica.</p>
             </div>
           )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BANCO DE ESPÉCIES & BIBLIOTECA TÉCNICA                   */}
      {/* ========================================================= */}
      {activeTab === 'banco_especies' && (
        <NematodeSpeciesBank
          selectedSpeciesId={selectedSpeciesId}
          onSelectSpecies={setSelectedSpeciesId}
        />
      )}

      {/* ========================================================= */}
      {/* 5. ROTAÇÃO & MANEJO                                         */}
      {/* ========================================================= */}
      {activeTab === 'rotacao_manejo' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Diário de Manejo & Rotação de Culturas</h3>
           </div>
           
           {(currentField?.managements || []).length > 0 ? (
             <div className="space-y-3">
                {currentField!.managements.map(m => (
                  <div key={m.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                     <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-200">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div className="flex-1 text-sm">
                       <strong className="text-sm block text-slate-900 dark:text-white">{m.type}</strong>
                       <span className="text-[10px] text-slate-500">{m.date} • Produto: {m.product || 'N/A'} (Dose: {m.dose || 'N/A'})</span>
                       <p className="text-xs mt-1 text-slate-600 dark:text-zinc-400">{m.description}</p>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="p-8 border border-dashed rounded-xl text-center space-y-2">
               <Leaf className="w-8 h-8 text-slate-400 mx-auto" />
               <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhum registro de manejo atrelado a este talhão.</p>
             </div>
           )}
           
           <div className="mt-6 p-5 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-900/30">
              <h4 className="font-bold text-sm text-stone-800 dark:text-stone-300 mb-2">💡 Recomendação do Sistema</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Utilize plantas de cobertura com baixo Fator de Reprodução (como Crotalaria spectabilis, C. ochroleuca ou braquiárias) associadas a bionematicidas microbiológicos no sulco para o controle sustentável de nematoides.
              </p>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DIÁRIO FOTOGRÁFICO                                       */}
      {/* ========================================================= */}
      {activeTab === 'diario_fotografico' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Diário Fotográfico do Talhão</h3>
              <p className="text-xs text-slate-500">Acompanhamento visual da evolução das galhas, lesões e sintomas aéreos.</p>
           </div>
           
           <div className="p-8 border border-dashed rounded-xl text-center space-y-2">
             <Camera className="w-8 h-8 text-slate-400 mx-auto" />
             <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhuma fotografia anexada ao diário fotográfico deste talhão.</p>
             <p className="text-[11px] text-slate-400">Fotografe sintomas no campo (galhas, reboleiras e lesões radiculares) para documentação temporal.</p>
           </div>
        </div>
      )}

    </div>
  );
};

export default NematologyModule;

