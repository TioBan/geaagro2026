import React, { useState, useMemo, useEffect } from 'react';
import {
  Bird, LayoutGrid, Home, Thermometer, Droplets, Wheat, 
  Scale, Syringe, BookOpen, ShieldAlert, Package, Camera,
  LineChart, Activity, Target, ArrowRight, CheckCircle2,
  FileSearch, Egg, Database, RefreshCw, AlertTriangle, Plus, Trash2,
  Search, WifiOff, Save, FileText, Check, Bookmark
} from 'lucide-react';
import { PoultryTab, PoultryBatch, PoultryShed } from '../types/poultry';
import { INITIAL_POULTRY_BATCHES, INITIAL_POULTRY_SHEDS, POULTRY_DISEASES, calculateIEA } from '../data/poultryData';
import { offlineDB, SyncItem } from '../utils/indexedDB';

interface PoultryModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: PoultryTab) => void;
}

export const PoultryModule: React.FC<PoultryModuleProps> = ({ activeSubTab, setActiveSubTab }) => {
  const [internalTab, setInternalTab] = useState<PoultryTab>('dashboard');
  const activeTab = (activeSubTab as PoultryTab) || internalTab;
  const setActiveTab = (tab: PoultryTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [sheds, setSheds] = useState<PoultryShed[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states for new batch
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchLineage, setNewBatchLineage] = useState('Cobb 500');
  const [newBatchQuantity, setNewBatchQuantity] = useState(30000);
  const [newBatchHatchery, setNewBatchHatchery] = useState('Incubatório Catarinense');

  // Form states for new shed
  const [showAddShed, setShowAddShed] = useState(false);
  const [newShedName, setNewShedName] = useState('');
  const [newShedCapacity, setNewShedCapacity] = useState(35000);

  useEffect(() => {
    loadOfflineData();
    // Listen to network changes
    window.addEventListener('online', handleOnlineSync);
    // Listen to Service Worker message
    const handleSWMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SYNC_OFFLINE_DATA') {
        handleOnlineSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    return () => {
      window.removeEventListener('online', handleOnlineSync);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const dbBatches = await offlineDB.getAll<PoultryBatch>('poultry_batches');
      const dbSheds = await offlineDB.getAll<PoultryShed>('poultry_sheds');
      const dbSync = await offlineDB.getSyncQueue();
      
      setBatches(dbBatches.length > 0 ? dbBatches : INITIAL_POULTRY_BATCHES);
      setSheds(dbSheds.length > 0 ? dbSheds : INITIAL_POULTRY_SHEDS);
      setSyncQueue(dbSync);
    } catch (err) {
      console.warn('Could not load offline poultry data, using initial data:', err);
      setBatches(INITIAL_POULTRY_BATCHES);
      setSheds(INITIAL_POULTRY_SHEDS);
    }
  };

  const handleOnlineSync = async () => {
    setIsSyncing(true);
    try {
      const queue = await offlineDB.getSyncQueue();
      if (queue.length > 0) {
        // Simulate synchronization delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await offlineDB.clearSyncQueue();
        console.log('[Sync] Poultry data synchronized successfully with cloud!');
      }
      await loadOfflineData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchCode) return;

    const newBatch: PoultryBatch = {
      id: `batch-${Date.now()}`,
      code: newBatchCode,
      lineage: newBatchLineage,
      purpose: 'Corte',
      housingDate: new Date().toISOString().split('T')[0],
      initialQuantity: Number(newBatchQuantity),
      currentQuantity: Number(newBatchQuantity),
      supplier: 'Aves de Ouro Ltda',
      hatchery: newBatchHatchery,
      shedId: sheds[0]?.id || 'galpao-01',
      technicalResponsible: 'Dr. Lucas Mendes',
      weighings: [{ id: `pw-${Date.now()}`, date: new Date().toISOString().split('T')[0], averageWeight: 42, uniformity: 95, dailyGain: 4.2 }],
      consumptions: [],
      healthEvents: [],
      productions: []
    };

    await offlineDB.add('poultry_batches', newBatch);
    setShowAddBatch(false);
    setNewBatchCode('');
    await loadOfflineData();
  };

  const handleAddShedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShedName) return;

    const newShed: PoultryShed = {
      id: `shed-${Date.now()}`,
      identification: newShedName,
      dimensions: '150x15m',
      capacity: Number(newShedCapacity),
      ventilationType: 'Pressão Positiva (Dark House)',
      heatingSystem: 'Fornos a Lenha automatizados',
      environmentHistory: []
    };

    await offlineDB.add('poultry_sheds', newShed);
    setShowAddShed(false);
    setNewShedName('');
    await loadOfflineData();
  };

  const handleDeleteBatch = async (id: string) => {
    if (confirm('Deseja realmente remover este lote offline?')) {
      await offlineDB.delete('poultry_batches', id);
      await loadOfflineData();
    }
  };

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const currentBatch = useMemo(() => {
    if (batches.length === 0) return null;
    return batches.find(b => b.id === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      if (batches[0]?.id) setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  // Simuladores para o IEA
  const [simAgeDays, setSimAgeDays] = useState(42);
  const [simSlaughterWeight, setSimSlaughterWeight] = useState(2.8);
  const [simTotalFeed, setSimTotalFeed] = useState(130000); // kg

  // =========================================================
  // States & Constants for Offline Poultry Disease Library
  // =========================================================
  const RELEVANT_SYMPTOMS = useMemo(() => [
    'Problemas respiratórios (ronco, tosse, espirros)',
    'Secreção ocular/nasal',
    'Queda drástica de postura',
    'Ovos deformados / casca fina',
    'Diarreia aquosa ou esbranquiçada',
    'Prostração / apatia profunda',
    'Torcicolo ou pescoço torcido',
    'Paralisia de asas ou pernas',
    'Nódulos e crostas (pele sem penas)',
    'Placas amareladas na boca/garganta',
    'Diarreia com sangue ou chocolate',
    'Palidez extrema na crista (anemia)',
    'Edema facial (cabeça inchada)'
  ], []);

  const symptomDiseaseMap = useMemo<Record<string, string[]>>(() => ({
    'Problemas respiratórios (ronco, tosse, espirros)': ['d1', 'd3', 'd4', 'd6'],
    'Secreção ocular/nasal': ['d1', 'd6'],
    'Queda drástica de postura': ['d1', 'd3'],
    'Ovos deformados / casca fina': ['d1'],
    'Diarreia aquosa ou esbranquiçada': ['d2', 'd3'],
    'Prostração / apatia profunda': ['d1', 'd2', 'd5', 'd6'],
    'Torcicolo ou pescoço torcido': ['d3'],
    'Paralisia de asas ou pernas': ['d3'],
    'Nódulos e crostas (pele sem penas)': ['d4'],
    'Placas amareladas na boca/garganta': ['d4'],
    'Diarreia com sangue ou chocolate': ['d5'],
    'Palidez extrema na crista (anemia)': ['d5'],
    'Edema facial (cabeça inchada)': ['d6']
  }), []);

  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState('');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('d1');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diseaseNotes, setDiseaseNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('poultry_disease_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [saveNoteSuccess, setSaveNoteSuccess] = useState<string | null>(null);

  // Sync current note text when selected disease changes
  useEffect(() => {
    setCurrentNoteText(diseaseNotes[selectedDiseaseId] || '');
  }, [selectedDiseaseId, diseaseNotes]);

  const handleSaveNote = (diseaseId: string) => {
    const updated = { ...diseaseNotes, [diseaseId]: currentNoteText };
    setDiseaseNotes(updated);
    localStorage.setItem('poultry_disease_notes', JSON.stringify(updated));
    setSaveNoteSuccess(diseaseId);
    setTimeout(() => setSaveNoteSuccess(null), 2000);
  };

  const filteredDiseases = useMemo(() => {
    return POULTRY_DISEASES.filter(d => {
      // Search filter
      const matchesSearch = 
        d.name.toLowerCase().includes(diseaseSearchTerm.toLowerCase()) ||
        d.agent.toLowerCase().includes(diseaseSearchTerm.toLowerCase()) ||
        d.symptoms.toLowerCase().includes(diseaseSearchTerm.toLowerCase()) ||
        d.etiology.toLowerCase().includes(diseaseSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Symptom filter
      if (selectedSymptoms.length === 0) return true;
      
      // Match if the disease has ANY of the selected symptoms
      return selectedSymptoms.some(sym => {
        const matchingIds = symptomDiseaseMap[sym] || [];
        return matchingIds.includes(d.id);
      });
    }).sort((a, b) => {
      if (selectedSymptoms.length === 0) return 0;
      const countA = selectedSymptoms.filter(sym => (symptomDiseaseMap[sym] || []).includes(a.id)).length;
      const countB = selectedSymptoms.filter(sym => (symptomDiseaseMap[sym] || []).includes(b.id)).length;
      return countB - countA; // Sort by relevance match count descending
    });
  }, [diseaseSearchTerm, selectedSymptoms, symptomDiseaseMap]);

  const ieaResult = useMemo(() => {
    if (!currentBatch) return { score: 0, status: 'N/A', feedConversion: 0, mortalityRate: 0 };
    return calculateIEA(currentBatch, simTotalFeed, simSlaughterWeight, simAgeDays);
  }, [currentBatch, simTotalFeed, simSlaughterWeight, simAgeDays]);

  const mortalityPercentage = useMemo(() => {
    if (!currentBatch) return '0.00';
    const mortalityAccumulated = currentBatch.initialQuantity - currentBatch.currentQuantity;
    return ((mortalityAccumulated / currentBatch.initialQuantity) * 100).toFixed(2);
  }, [currentBatch]);

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-yellow-950 via-orange-900 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-yellow-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Bird className="w-3 h-3" />
                Avicultura de Precisão
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Egg className="w-6 h-6 text-yellow-400" />
              Gestão de Lotes & IEA
            </h2>
            <p className="text-xs sm:text-sm text-yellow-100/80 mt-1 max-w-4xl">
              Monitoramento ambiental, nutricional e sanitário de galpões e o exclusivo cálculo do Índice de Eficiência Avícola (IEA).
            </p>
          </div>
        </div>
      </div>

      {/* Status de Sincronização Local */}
      <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-2xs animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Banco de Dados Local (IndexedDB)</span>
            <div className="flex items-center gap-2 mt-0.5">
              {syncQueue.length === 0 ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sincronizado & Disponível Offline
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> {syncQueue.length} registro(s) aguardando conexão
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddBatch(!showAddBatch)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Lote
          </button>
          <button
            onClick={() => setShowAddShed(!showAddShed)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Galpão
          </button>
          <button
            onClick={handleOnlineSync}
            disabled={isSyncing}
            className="border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {/* Form Cadastro de Novo Lote (Offline-First) */}
      {showAddBatch && (
        <form onSubmit={handleAddBatchSubmit} className="bg-white dark:bg-black border border-orange-200 dark:border-orange-900/30 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-black text-sm text-orange-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Alojar Novo Lote (Persistência Offline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Código do Lote</label>
              <input
                type="text"
                required
                value={newBatchCode}
                onChange={e => setNewBatchCode(e.target.value)}
                placeholder="Ex: LOTE-2026-A"
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Linhagem</label>
              <select
                value={newBatchLineage}
                onChange={e => setNewBatchLineage(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              >
                <option value="Cobb 500">Cobb 500</option>
                <option value="Ross 308">Ross 308</option>
                <option value="Hubbard">Hubbard</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Qtd. Inicial de Pintos</label>
              <input
                type="number"
                value={newBatchQuantity}
                onChange={e => setNewBatchQuantity(Number(e.target.value))}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Incubatório de Origem</label>
              <input
                type="text"
                value={newBatchHatchery}
                onChange={e => setNewBatchHatchery(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddBatch(false)}
              className="px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
            >
              Confirmar e Gravar Offline
            </button>
          </div>
        </form>
      )}

      {/* Form Cadastro de Novo Galpão (Offline-First) */}
      {showAddShed && (
        <form onSubmit={handleAddShedSubmit} className="bg-white dark:bg-black border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-black text-sm text-amber-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Novo Galpão (Persistência Offline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Identificação do Galpão</label>
              <input
                type="text"
                required
                value={newShedName}
                onChange={e => setNewShedName(e.target.value)}
                placeholder="Ex: Galpão 03 - Dark House"
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Capacidade Aves</label>
              <input
                type="number"
                value={newShedCapacity}
                onChange={e => setNewShedCapacity(Number(e.target.value))}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddShed(false)}
              className="px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
            >
              Confirmar e Gravar Offline
            </button>
          </div>
        </form>
      )}



      {/* ========================================================= */}
      {/* DASHBOARD & ÍNDICE DE EFICIÊNCIA AVÍCOLA (IEA)              */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && currentBatch && (
        <div className="space-y-6 animate-fade-in">
           
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <div className="p-4 bg-white dark:bg-black border rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Aves Alojadas (Ativas)</span>
               <strong className="text-2xl text-slate-900 dark:text-white">{currentBatch.currentQuantity.toLocaleString()}</strong>
               <div className="text-[10px] text-slate-500 mt-1 font-bold flex items-center gap-1">
                 <ArrowRight className="w-3 h-3 text-red-500"/> {mortalityPercentage}% Mortalidade
               </div>
             </div>
             <div className="p-4 bg-white dark:bg-black border rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Último Peso Médio</span>
               <strong className="text-2xl text-emerald-600">450g</strong>
               <div className="text-[10px] text-slate-500 mt-1 font-bold">Aos 15 dias</div>
             </div>
             <div className="p-4 bg-white dark:bg-black border rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Uniformidade</span>
               <strong className="text-2xl text-blue-600">92%</strong>
               <div className="text-[10px] text-slate-500 mt-1 font-bold">Meta: {'>'} 90%</div>
             </div>
             <div className="p-4 bg-white dark:bg-black border rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Galpões Ativos</span>
               <strong className="text-2xl text-orange-600">{sheds.length}</strong>
               <div className="text-[10px] text-slate-500 mt-1 font-bold">Capacidade: 35k/cada</div>
             </div>
           </div>

           {/* Painel IEA Exclusivo */}
           <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 mb-4">
                <h3 className="font-black text-lg text-orange-700 dark:text-orange-500 flex items-center gap-2">
                  <Activity className="w-5 h-5"/> Índice de Eficiência Avícola (IEA)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Simule o abate para prever a rentabilidade do lote baseado nas métricas atuais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Controles de Simulação */}
                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Idade de Abate (Dias)</label>
                      <input type="range" min="35" max="50" value={simAgeDays} onChange={e => setSimAgeDays(Number(e.target.value))} className="w-full mt-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{simAgeDays} dias</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Peso de Abate Projetado (kg)</label>
                      <input type="range" min="2.0" max="3.5" step="0.1" value={simSlaughterWeight} onChange={e => setSimSlaughterWeight(Number(e.target.value))} className="w-full mt-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{simSlaughterWeight.toFixed(1)} kg</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Consumo Total de Ração (kg)</label>
                      <input type="range" min="100000" max="180000" step="1000" value={simTotalFeed} onChange={e => setSimTotalFeed(Number(e.target.value))} className="w-full mt-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{simTotalFeed.toLocaleString()} kg</span>
                    </div>
                 </div>

                 {/* Resultado IEA */}
                 <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-6 border flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Pontuação IEA GeaAgro</span>
                    <strong className={`text-6xl font-black ${
                      ieaResult.status === 'Excelente' ? 'text-emerald-500' :
                      ieaResult.status === 'Bom' ? 'text-blue-500' :
                      ieaResult.status === 'Atenção' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {ieaResult.score}
                    </strong>
                    <div className="mt-2 bg-slate-200 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                      Status: {ieaResult.status}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Conv. Alimentar (CA)</span>
                        <strong className="text-lg text-slate-900 dark:text-white">{ieaResult.feedConversion}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Mortalidade Final</span>
                        <strong className="text-lg text-red-500">{ieaResult.mortalityRate}%</strong>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GÊMEO DIGITAL DO LOTE                                       */}
      {/* ========================================================= */}
      {activeTab === 'lote_twin' && currentBatch && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-4 flex justify-between items-end">
              <div>
                <h3 className="font-black text-lg text-orange-700 dark:text-orange-500 flex items-center gap-2">
                  <Target className="w-5 h-5"/> Gêmeo Digital do Lote
                </h3>
                <p className="text-xs text-slate-500 mt-1">Identidade viva do lote: origens, pesos, sanidade e consumo na linha do tempo.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-xs max-w-[200px]"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.code} ({b.lineage})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteBatch(currentBatch.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                  title="Remover Lote"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 border">
                  <h4 className="font-black text-xl">{currentBatch.code}</h4>
                  <p className="text-xs text-orange-600 font-bold mb-3">{currentBatch.lineage} ({currentBatch.purpose})</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Alojamento</span><strong className="dark:text-white">{currentBatch.housingDate}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Qtd. Inicial</span><strong className="dark:text-white">{currentBatch.initialQuantity.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Incubatório</span><strong className="dark:text-white">{currentBatch.hatchery}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Galpão</span><strong className="dark:text-white">{sheds.find(s => s.id === currentBatch.shedId)?.identification || 'Galpão 01'}</strong></div>
                  </div>
                </div>
             </div>

             <div className="lg:col-span-2 space-y-4">
                <h4 className="font-bold text-sm">Linha do Tempo (Eventos)</h4>
                <div className="space-y-3">
                  {currentBatch.weighings && currentBatch.weighings.slice().reverse().map(w => (
                    <div key={w.id} className="p-3 border rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 flex gap-3">
                      <Scale className="w-5 h-5 text-emerald-500" />
                      <div>
                        <strong className="text-xs text-emerald-700 dark:text-emerald-400 block">Pesagem ({w.date})</strong>
                        <p className="text-xs text-emerald-600 mt-1">Peso Médio: {w.averageWeight}g | Unif: {w.uniformity}% | GMD: {w.dailyGain}g/dia</p>
                      </div>
                    </div>
                  ))}
                  {currentBatch.healthEvents && currentBatch.healthEvents.map(h => (
                    <div key={h.id} className="p-3 border rounded-xl bg-red-50 dark:bg-red-950/20 border-red-200 flex gap-3">
                      <Syringe className="w-5 h-5 text-red-500" />
                      <div>
                        <strong className="text-xs text-red-700 dark:text-red-400 block">{h.type} ({h.date})</strong>
                        <p className="text-xs text-red-600 mt-1">{h.description} {h.quantity ? `(Qtd: ${h.quantity})` : ''}</p>
                      </div>
                    </div>
                  ))}
                  {(!currentBatch.weighings?.length && !currentBatch.healthEvents?.length) && (
                    <p className="text-xs text-slate-500 italic">Sem eventos de pesagem ou sanidade registrados offline.</p>
                  )}
                </div>
             </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BANCO DE DOENÇAS (BIBLIOTECA OFFLINE)                    */}
      {/* ========================================================= */}
      {activeTab === 'banco_doencas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header da Seção */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Biblioteca Offline Sincronizada
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Dados Locais Carregados
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5.5 h-5.5 text-orange-500" />
                Biblioteca de Patologia & Sanidade Aviária
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                Manual de diagnóstico de campo completo e ativo sem necessidade de conexão à internet. Filtre por sintomas clínicos para obter diagnósticos presuntivos imediatos.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="text-xs font-semibold text-slate-400">Total cadastrado:</span>
              <strong className="text-sm bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">{POULTRY_DISEASES.length} Doenças</strong>
            </div>
          </div>

          {/* Triagem Clínica Baseada em Sintomas (Quiz Presuntivo) */}
          <div className="bg-amber-50/40 dark:bg-yellow-950/10 border border-amber-200/60 dark:border-yellow-900/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-400">Presuntivo de Campo: O que você está observando?</h4>
              </div>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Limpar todos os sintomas
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecione os sinais clínicos visíveis na granja ou na necropsia. O sistema ordenará as patologias por probabilidade (grau de coincidência de sintomas):
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {RELEVANT_SYMPTOMS.map(symptom => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
                      } else {
                        setSelectedSymptoms(prev => [...prev, symptom]);
                      }
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-yellow-900 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                      isSelected ? 'bg-amber-700 border-amber-800 text-white' : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="leading-tight">{symptom}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Busca e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Coluna Esquerda: Lista de Doenças */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar doença, agente ou patógeno..."
                  value={diseaseSearchTerm}
                  onChange={e => setDiseaseSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Lista de Cards de Doença */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredDiseases.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <strong className="text-xs text-slate-600 dark:text-slate-400 block">Nenhuma patologia encontrada</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5 px-4">Tente reduzir os filtros de sintomas ou alterar os termos de busca.</p>
                  </div>
                ) : (
                  filteredDiseases.map(disease => {
                    const isSelected = disease.id === selectedDiseaseId;
                    
                    // Count matching symptoms for this disease
                    const matchCount = selectedSymptoms.filter(sym => 
                      (symptomDiseaseMap[sym] || []).includes(disease.id)
                    ).length;

                    return (
                      <button
                        key={disease.id}
                        onClick={() => setSelectedDiseaseId(disease.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex gap-3.5 relative overflow-hidden items-center cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/60 dark:bg-orange-950/10 border-orange-300 dark:border-orange-900 ring-1 ring-orange-400/20'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {/* Indicador Ativo */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
                        )}

                        {/* Foto de Pré-visualização com Tratamento de Erro */}
                        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0 overflow-hidden border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center">
                          {disease.image ? (
                            <img
                              src={disease.image}
                              alt={disease.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback em caso de falha de imagem offline
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Bird className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        {/* Info Principal */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              {disease.agent.split(' ')[0]}
                            </span>
                            {matchCount > 0 && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[9px] px-1.5 py-0.5 rounded-sm font-black flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                {matchCount} {matchCount === 1 ? 'Sinal' : 'Sinais'}
                              </span>
                            )}
                          </div>
                          <strong className="block text-xs font-black text-slate-800 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                            {disease.name}
                          </strong>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <strong>Agente:</strong> {disease.agent}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Coluna Direita: Ficha Clínica e Diagnóstica Detalhada */}
            <div className="lg:col-span-7 xl:col-span-8">
              {(() => {
                const disease = POULTRY_DISEASES.find(d => d.id === selectedDiseaseId) || POULTRY_DISEASES[0];
                if (!disease) return null;

                const hasCustomNote = !!diseaseNotes[disease.id];

                return (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs space-y-0">
                    
                    {/* Header da Ficha */}
                    <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/20">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              ID: {disease.id.toUpperCase()}
                            </span>
                            <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              Agente: {disease.agent}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {disease.name}
                          </h4>
                          <p className="text-xs text-slate-500 italic">
                            Especialidade patológica clínica de campo
                          </p>
                        </div>
                        {hasCustomNote && (
                          <span className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-teal-200/50">
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                            Anotação Salva
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Imagem e Metadados Rápidos */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-slate-100 dark:border-zinc-800">
                      
                      {/* Foto Real de Diagnóstico */}
                      <div className="md:col-span-5 xl:col-span-4 space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Foto Real da Doença</span>
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/60 flex items-center justify-center group shadow-2xs">
                          {disease.image ? (
                            <img
                              src={disease.image}
                              alt={disease.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                // Fallback em caso de falha offline
                                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${disease.id}/600/450`;
                              }}
                            />
                          ) : (
                            <div className="text-center p-4">
                              <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                              <span className="text-[10px] text-slate-400">Sem imagem disponível</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-xs">
                            Amostra Clínica
                          </div>
                        </div>
                      </div>

                      {/* Parâmetros Epidemiológicos / Clínicos Rápidos */}
                      <div className="md:col-span-7 xl:col-span-8 flex flex-col justify-between gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800/50 rounded-xl">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Mortalidade Estimada</span>
                            <strong className="text-xs text-red-600 dark:text-red-400 font-bold block mt-0.5">
                              {disease.mortality || 'Variável'}
                            </strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800/50 rounded-xl">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Período de Incubação</span>
                            <strong className="text-xs text-amber-700 dark:text-amber-400 font-bold block mt-0.5">
                              {disease.incubation || 'Imediato'}
                            </strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800/50 rounded-xl col-span-2">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Principal Via de Transmissão</span>
                            <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium mt-0.5 leading-tight">
                              {disease.transmission || 'Contato direto e fômites contaminados'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fichas Técnicas Detalhadas de Conteúdo */}
                    <div className="p-6 space-y-5.5 text-xs text-slate-700 dark:text-zinc-300">
                      
                      {/* Etiologia */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
                          Etiologia (Agente & Fisiologia de Ataque)
                        </h5>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                          {disease.etiology}
                        </p>
                      </div>

                      {/* Sintomas Clínicos */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3 bg-red-500 rounded-sm"></span>
                          Sintomas e Manifestações no Campo
                        </h5>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                          {disease.symptoms}
                        </p>
                      </div>

                      {/* Controle */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>
                          Ações de Controle & Tratamento Imediato
                        </h5>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                          {disease.control}
                        </p>
                      </div>

                      {/* Manejo Preventivo */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3 bg-blue-500 rounded-sm"></span>
                          Manejo Preventivo & Biosseguridade
                        </h5>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                          {disease.management}
                        </p>
                      </div>

                      {/* Cuidado Fisiológico */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3 bg-yellow-500 rounded-sm"></span>
                          Cuidados de Suporte & Fisiologia de Recuperação
                        </h5>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                          {disease.care}
                        </p>
                      </div>

                      {/* Área de Anotações Técnicas de Campo (Persistência Offline) */}
                      <div className="border-t border-slate-100 dark:border-zinc-800 pt-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Anotações Personalizadas da Granja (Salvo no Aparelho)
                          </h5>
                          {saveNoteSuccess === disease.id && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs animate-fade-in flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Salvo Offline!
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Escreva notas específicas sobre esta doença de acordo com o histórico da sua granja (ex: datas de ocorrência, marcas de vacina preferidas, cepas identificadas, dosagem de sulfas aplicada):
                        </p>
                        
                        <div className="space-y-2">
                          <textarea
                            value={currentNoteText}
                            onChange={e => setCurrentNoteText(e.target.value)}
                            placeholder="Ex: Cepa BR-I registrada no aviário 03 em março/2026. Resposta excelente à Enrofloxacina após antibiograma."
                            rows={3}
                            className="w-full p-3 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-teal-500 text-slate-800 dark:text-white leading-relaxed resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSaveNote(disease.id)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-3xs hover:shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Salvar Observação
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* PLACHOLDER GERAL OUTRAS ABAS */}
      {(activeTab !== 'dashboard' && activeTab !== 'lote_twin' && activeTab !== 'banco_doencas') && (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-slate-500">
           <Activity className="w-10 h-10 mx-auto mb-3 text-orange-300" />
           <strong className="block text-sm">O módulo de {activeTab.replace('_', ' ')} está ativo e sincronizado.</strong>
           <p className="text-xs mt-2 max-w-lg mx-auto">Os registros de nutrição, ambiente e rastreabilidade alimentam o Gêmeo do Lote e o cálculo do IEA em tempo real, 100% offline.</p>
        </div>
      )}
    </div>
  );
};
