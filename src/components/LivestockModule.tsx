import React, { useState, useMemo, useEffect } from 'react';
import {
  Tractor, Activity, Scale, HeartPulse, Dna,
  Syringe, Milk, Beef, PieChart, Info, MapPin, Sprout,
  ArrowRight, ShieldAlert, ArrowDownRight, ArrowUpRight,
  Database, RefreshCw, CheckCircle2, AlertTriangle, Plus, Trash2
} from 'lucide-react';
import { LivestockTab, Animal, Paddock } from '../types/livestock';
import { INITIAL_ANIMALS, INITIAL_PADDOCKS, analyzeISPA } from '../data/livestockData';
import { offlineDB, SyncItem } from '../utils/indexedDB';

interface LivestockModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: LivestockTab) => void;
}

export const LivestockModule: React.FC<LivestockModuleProps> = ({ activeSubTab, setActiveSubTab }) => {
  const [internalTab, setInternalTab] = useState<LivestockTab>('dashboard');
  const activeTab = (activeSubTab as LivestockTab) || internalTab;
  const setActiveTab = (tab: LivestockTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states for new animal
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [newAnimalNum, setNewAnimalNum] = useState('');
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalBreed, setNewAnimalBreed] = useState('Nelore');
  const [newAnimalCategory, setNewAnimalCategory] = useState<any>('Novilha');
  const [newAnimalWeight, setNewAnimalWeight] = useState(350);

  // Form states for new paddock
  const [showAddPaddock, setShowAddPaddock] = useState(false);
  const [newPaddockName, setNewPaddockName] = useState('');
  const [newPaddockArea, setNewPaddockArea] = useState(20);
  const [newPaddockForage, setNewPaddockForage] = useState('Brachiaria brizantha');

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
      const dbAnimals = await offlineDB.getAll<Animal>('animals');
      const dbPaddocks = await offlineDB.getAll<Paddock>('paddocks');
      const dbSync = await offlineDB.getSyncQueue();
      
      setAnimals(dbAnimals.length > 0 ? dbAnimals : INITIAL_ANIMALS);
      setPaddocks(dbPaddocks.length > 0 ? dbPaddocks : INITIAL_PADDOCKS);
      setSyncQueue(dbSync);
    } catch (err) {
      console.warn('Could not load offline livestock data, using initial data:', err);
      setAnimals(INITIAL_ANIMALS);
      setPaddocks(INITIAL_PADDOCKS);
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
        console.log('[Sync] Synchronization with remote cloud server completed!');
      }
      await loadOfflineData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalNum || !newAnimalName) return;

    const newAnimal: Animal = {
      id: `anim-${Date.now()}`,
      rfid: `840003${Math.floor(100000000 + Math.random() * 900000000)}`,
      name: newAnimalName,
      number: newAnimalNum,
      species: 'Bovina',
      breed: newAnimalBreed,
      sex: 'F',
      birthDate: new Date().toISOString().split('T')[0],
      category: newAnimalCategory,
      purpose: 'Corte',
      batch: 'Lote Recria 1',
      origin: 'Nascida na Fazenda',
      paddockId: paddocks[0]?.id || 'piquete-01',
      bloodDegree: 'PO',
      birthWeight: 30,
      currentWeight: Number(newAnimalWeight),
      photos: [],
      weightHistory: [{ id: `w-${Date.now()}`, date: new Date().toISOString().split('T')[0], weight: Number(newAnimalWeight), bodyConditionScore: 3.5 }],
      healthHistory: [],
      reproHistory: []
    };

    await offlineDB.add('animals', newAnimal);
    setShowAddAnimal(false);
    setNewAnimalNum('');
    setNewAnimalName('');
    await loadOfflineData();
  };

  const handleAddPaddockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaddockName) return;

    const newPaddock: Paddock = {
      id: `piquete-${Date.now()}`,
      name: newPaddockName,
      areaHa: Number(newPaddockArea),
      forageSpecies: newPaddockForage,
      cultivar: 'Marandu',
      currentHeightCm: 25,
      targetHeightCm: 30,
      currentBiomassKgHa: 2500,
      stockingRateAU: 1.5,
      restDays: 15,
      occupationDays: 5,
      history: []
    };

    await offlineDB.add('paddocks', newPaddock);
    setShowAddPaddock(false);
    setNewPaddockName('');
    await loadOfflineData();
  };

  const handleDeleteAnimal = async (id: string) => {
    if (confirm('Deseja realmente remover este animal offline?')) {
      await offlineDB.delete('animals', id);
      await loadOfflineData();
    }
  };

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const currentAnimal = useMemo(() => {
    if (!animals || animals.length === 0) return null;
    return animals.find(a => a?.id === selectedAnimalId) || animals[0] || null;
  }, [animals, selectedAnimalId]);

  // Set default selected animal once loaded
  useEffect(() => {
    if (animals && animals.length > 0 && !selectedAnimalId && animals[0]?.id) {
      setSelectedAnimalId(animals[0].id);
    }
  }, [animals, selectedAnimalId]);

  const [selectedPaddockId, setSelectedPaddockId] = useState<string>('');
  const currentPaddock = useMemo(() => {
    if (!paddocks || paddocks.length === 0) return null;
    return paddocks.find(p => p?.id === selectedPaddockId) || paddocks[0] || null;
  }, [paddocks, selectedPaddockId]);

  useEffect(() => {
    if (paddocks && paddocks.length > 0 && !selectedPaddockId && paddocks[0]?.id) {
      setSelectedPaddockId(paddocks[0].id);
    }
  }, [paddocks, selectedPaddockId]);

  // ISPA Mock inputs for offline calculation
  const [soilP, setSoilP] = useState(8); // mg/dm3 (Baixo)
  const [pastureGrowth, setPastureGrowth] = useState(25); // kg MS/ha/dia (Degradada)
  const [animalGmd, setAnimalGmd] = useState(0.4); // kg/dia (Abaixo)

  const ispaResult = useMemo(() => analyzeISPA(soilP, pastureGrowth, animalGmd), [soilP, pastureGrowth, animalGmd]);

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-amber-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Tractor className="w-3 h-3" />
                Pecuária de Decisão
              </span>
              <span className="text-amber-200/80 text-xs font-semibold">• Sistema Integrado Solo-Planta-Animal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Beef className="w-6 h-6 text-amber-400" />
              Gestão Zootécnica & Digital Twins
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-4xl">
              Acompanhe a vida produtiva do rebanho, controle de pastagens e descubra como a fertilidade do solo impacta no seu custo por arroba.
            </p>
          </div>
        </div>
      </div>

      {/* Status da Sincronização Local / Offline */}
      <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
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
            onClick={() => setShowAddAnimal(!showAddAnimal)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Animal
          </button>
          <button
            onClick={() => setShowAddPaddock(!showAddPaddock)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Piquete
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

      {/* Form Cadastro de Novo Animal (Offline-First) */}
      {showAddAnimal && (
        <form onSubmit={handleAddAnimalSubmit} className="bg-white dark:bg-black border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-black text-sm text-amber-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Novo Animal (Persistência Offline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Número do Brinco</label>
              <input
                type="text"
                required
                value={newAnimalNum}
                onChange={e => setNewAnimalNum(e.target.value)}
                placeholder="Ex: 5020"
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Nome do Animal</label>
              <input
                type="text"
                required
                value={newAnimalName}
                onChange={e => setNewAnimalName(e.target.value)}
                placeholder="Ex: Mimosa"
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Raça</label>
              <select
                value={newAnimalBreed}
                onChange={e => setNewAnimalBreed(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              >
                <option value="Nelore">Nelore</option>
                <option value="Angus">Angus</option>
                <option value="Senepol">Senepol</option>
                <option value="Girolando">Girolando</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Categoria</label>
              <select
                value={newAnimalCategory}
                onChange={e => setNewAnimalCategory(e.target.value as any)}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              >
                <option value="Novilha">Novilha</option>
                <option value="Garrote">Garrote</option>
                <option value="Vaca">Vaca</option>
                <option value="Boi Gordo">Boi Gordo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Peso Inicial (kg)</label>
              <input
                type="number"
                value={newAnimalWeight}
                onChange={e => setNewAnimalWeight(Number(e.target.value))}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddAnimal(false)}
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

      {/* Form Cadastro de Novo Piquete (Offline-First) */}
      {showAddPaddock && (
        <form onSubmit={handleAddPaddockSubmit} className="bg-white dark:bg-black border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-black text-sm text-emerald-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Novo Piquete (Persistência Offline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Identificação do Piquete</label>
              <input
                type="text"
                required
                value={newPaddockName}
                onChange={e => setNewPaddockName(e.target.value)}
                placeholder="Ex: Piquete 04 - Rotacionado"
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Área (ha)</label>
              <input
                type="number"
                value={newPaddockArea}
                onChange={e => setNewPaddockArea(Number(e.target.value))}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Espécie Forrageira</label>
              <input
                type="text"
                value={newPaddockForage}
                onChange={e => setNewPaddockForage(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-zinc-900 border rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddPaddock(false)}
              className="px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
            >
              Confirmar e Gravar Offline
            </button>
          </div>
        </form>
      )}



      {/* ========================================================= */}
      {/* 1. DASHBOARD EXECUTIVO                                      */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total de Animais</span>
               <strong className="text-2xl text-slate-900 dark:text-white">{animals.length}</strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lotação Média</span>
               <strong className="text-2xl text-amber-600">1.8 UA/ha</strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ganho Médio Diário</span>
               <strong className="text-2xl text-emerald-600">0.65 kg</strong>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Taxa de Prenhez</span>
               <strong className="text-2xl text-blue-600">85%</strong>
             </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GÊMEO DIGITAL DO ANIMAL                                  */}
      {/* ========================================================= */}
      {activeTab === 'animal_twin' && currentAnimal && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <h3 className="font-black text-lg text-amber-700 dark:text-amber-500 flex items-center gap-2">
                  <Dna className="w-5 h-5"/> Gêmeo Digital do Animal
                </h3>
                <p className="text-xs text-slate-500 mt-1">Identidade completa, histórico produtivo e rastreabilidade viva.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAnimalId}
                  onChange={e => setSelectedAnimalId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-xs max-w-[200px]"
                >
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.number} - {a.name} ({a.category})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteAnimal(currentAnimal.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                  title="Remover Animal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Info Básica */}
             <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800">
                  <div className="w-full h-32 bg-slate-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                    <Beef className="w-12 h-12 text-slate-400" />
                  </div>
                  <h4 className="font-black text-xl">{currentAnimal.name} <span className="text-sm font-bold text-slate-500">#{currentAnimal.number}</span></h4>
                  <p className="text-xs text-amber-600 font-bold mb-3">RFID: {currentAnimal.rfid}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Categoria</span><strong className="dark:text-white">{currentAnimal.category}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Raça</span><strong className="dark:text-white">{currentAnimal.breed} ({currentAnimal.bloodDegree})</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Nascimento</span><strong className="dark:text-white">{currentAnimal.birthDate}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Peso Atual</span><strong className="dark:text-white">{currentAnimal.currentWeight} kg</strong></div>
                  </div>
                </div>
             </div>

             {/* Linha do Tempo e Eventos */}
             <div className="lg:col-span-2 space-y-4">
                <h4 className="font-bold text-sm">Linha do Tempo Produtiva</h4>
                <div className="space-y-3">
                  {/* Evento Repro */}
                  {currentAnimal?.reproHistory && currentAnimal.reproHistory.length > 0 && (
                    <div className="p-3 border rounded-xl bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900 flex items-start gap-3">
                      <HeartPulse className="w-5 h-5 text-pink-500 mt-0.5" />
                      <div>
                        <strong className="text-xs text-pink-700 dark:text-pink-400 block">Último Evento Reprodutivo ({currentAnimal.reproHistory[0]?.date})</strong>
                        <p className="text-xs text-pink-600 dark:text-pink-300 mt-1">{currentAnimal.reproHistory[0]?.type} (Touro: {currentAnimal.reproHistory[0]?.bullId}) - {currentAnimal.reproHistory[0]?.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Evento Peso */}
                  {currentAnimal?.weightHistory && currentAnimal.weightHistory.length > 0 && (
                    <div className="p-3 border rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                      <Scale className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <strong className="text-xs text-emerald-700 dark:text-emerald-400 block">Última Pesagem ({currentAnimal.weightHistory[currentAnimal.weightHistory.length - 1]?.date})</strong>
                        <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">Peso: {currentAnimal.weightHistory[currentAnimal.weightHistory.length - 1]?.weight} kg | GMD: {currentAnimal.weightHistory[currentAnimal.weightHistory.length - 1]?.gmd || '0.6'} kg/dia</p>
                      </div>
                    </div>
                  )}

                  {/* Evento Sanidade */}
                  {currentAnimal?.healthHistory && currentAnimal.healthHistory.length > 0 && (
                    <div className="p-3 border rounded-xl bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 flex items-start gap-3">
                      <Syringe className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <strong className="text-xs text-blue-700 dark:text-blue-400 block">Sanidade ({currentAnimal.healthHistory[0]?.date})</strong>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{currentAnimal.healthHistory[0]?.type}: {currentAnimal.healthHistory[0]?.description} ({currentAnimal.healthHistory[0]?.product})</p>
                      </div>
                    </div>
                  )}

                  {(!currentAnimal.reproHistory?.length && !currentAnimal.weightHistory?.length && !currentAnimal.healthHistory?.length) && (
                    <p className="text-xs text-slate-500 italic">Sem eventos registrados para este animal.</p>
                  )}
                </div>
             </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. GÊMEO DIGITAL DO PIQUETE                                 */}
      {/* ========================================================= */}
      {activeTab === 'pasture_twin' && currentPaddock && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <h3 className="font-black text-lg text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
                  <Sprout className="w-5 h-5"/> Gêmeo Digital do Piquete
                </h3>
                <p className="text-xs text-slate-500 mt-1">Gestão de forragem, taxa de lotação e histórico de pastejo.</p>
              </div>
              <select
                value={selectedPaddockId}
                onChange={e => setSelectedPaddockId(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-xs max-w-[200px]"
              >
                {paddocks.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Altura do Pasto</span>
                <div className="flex items-end gap-2 mt-1">
                  <strong className="text-2xl font-black text-slate-900 dark:text-white">{currentPaddock.currentHeightCm} cm</strong>
                  <span className="text-xs font-bold text-red-500 mb-1">(Meta: {currentPaddock.targetHeightCm} cm)</span>
                </div>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Massa de Forragem</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{currentPaddock.currentBiomassKgHa} kg MS/ha</strong>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Taxa de Lotação Atual</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{currentPaddock.stockingRateAU} UA/ha</strong>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Dias de Descanso / Ocup.</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{currentPaddock.restDays} / {currentPaddock.occupationDays}</strong>
              </div>
           </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ISPA (SISTEMA INTEGRADO SOLO-PLANTA-ANIMAL) O GRANDE DIFERENCIAL */}
      {/* ========================================================= */}
      {activeTab === 'ispa' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
              <h3 className="font-black text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <Activity className="w-5 h-5"/> Sistema Integrado Solo-Planta-Animal (ISPA)
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                O grande diferencial da plataforma. Descubra como a fertilidade do solo impacta o crescimento do pasto, que por sua vez reflete no ganho de peso do animal e altera seu Custo por Arroba Produzida.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controles (Simulação Offline) */}
              <div className="lg:col-span-3 space-y-4">
                 <strong className="text-xs block text-slate-700 dark:text-slate-300 uppercase">Simulador ISPA</strong>
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 block">Fósforo no Solo (mg/dm³)</label>
                   <input type="range" min="1" max="30" value={soilP} onChange={e => setSoilP(Number(e.target.value))} className="w-full mt-1" />
                   <span className="text-xs font-bold text-indigo-600">{soilP} mg/dm³</span>
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 block">Crescimento Pastagem (kg MS/ha/dia)</label>
                   <input type="range" min="10" max="80" value={pastureGrowth} onChange={e => setPastureGrowth(Number(e.target.value))} className="w-full mt-1" />
                   <span className="text-xs font-bold text-emerald-600">{pastureGrowth} kg/dia</span>
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 block">Ganho Médio Diário (GMD kg/dia)</label>
                   <input type="range" min="0.1" max="1.5" step="0.1" value={animalGmd} onChange={e => setAnimalGmd(Number(e.target.value))} className="w-full mt-1" />
                   <span className="text-xs font-bold text-amber-600">{animalGmd} kg/dia</span>
                 </div>
              </div>

              {/* Fluxo Visual da Cadeia */}
              <div className="lg:col-span-9 bg-slate-50 dark:bg-zinc-900 rounded-xl p-6 border flex flex-col items-center justify-center space-y-6">
                 
                 <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-between relative">
                    
                    {/* Solo */}
                    <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center text-center p-2 z-10 bg-white dark:bg-black ${ispaResult.soilStatus === 'Baixo' ? 'border-red-500' : ispaResult.soilStatus === 'Médio' ? 'border-yellow-500' : 'border-emerald-500'}`}>
                      <MapPin className="w-6 h-6 mb-1 text-slate-400" />
                      <strong className="text-xs">Solo</strong>
                      <span className="text-[10px] font-bold mt-1 text-slate-500">Fósforo: {ispaResult.soilStatus}</span>
                    </div>

                    <ArrowRight className="text-slate-300 hidden md:block" />

                    {/* Planta */}
                    <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center text-center p-2 z-10 bg-white dark:bg-black ${ispaResult.pastureStatus === 'Degradada' ? 'border-red-500' : ispaResult.pastureStatus === 'Recuperação' ? 'border-yellow-500' : 'border-emerald-500'}`}>
                      <Sprout className="w-6 h-6 mb-1 text-slate-400" />
                      <strong className="text-xs">Pastagem</strong>
                      <span className="text-[10px] font-bold mt-1 text-slate-500">{ispaResult.pastureStatus}</span>
                    </div>

                    <ArrowRight className="text-slate-300 hidden md:block" />

                    {/* Animal */}
                    <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center text-center p-2 z-10 bg-white dark:bg-black ${ispaResult.animalStatus === 'Abaixo' ? 'border-red-500' : ispaResult.animalStatus === 'Meta' ? 'border-yellow-500' : 'border-emerald-500'}`}>
                      <Beef className="w-6 h-6 mb-1 text-slate-400" />
                      <strong className="text-xs">Animal</strong>
                      <span className="text-[10px] font-bold mt-1 text-slate-500">GMD: {ispaResult.animalStatus}</span>
                    </div>

                 </div>

                 {/* Resultado Econômico */}
                 <div className="w-full mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resultado Econômico (Custo / Arroba)</span>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <strong className={`text-4xl font-black ${ispaResult.profitabilityImpact === 'Negativo' ? 'text-red-500' : ispaResult.profitabilityImpact === 'Positivo' ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>
                        R$ {ispaResult.costPerArroba}
                      </strong>
                      {ispaResult.profitabilityImpact === 'Negativo' && <ShieldAlert className="w-6 h-6 text-red-500" />}
                    </div>
                    {ispaResult.profitabilityImpact === 'Negativo' && (
                      <p className="text-xs text-red-600 mt-3 max-w-lg mx-auto bg-red-100 p-2 rounded-lg font-bold">
                        Alerta ISPA: A baixa fertilidade do solo (Fósforo) está reduzindo a oferta de matéria seca. Os animais estão gastando energia para buscar alimento (GMD abaixo da meta), o que aumenta a permanência no pasto e eleva o custo da arroba produzida para R$ {ispaResult.costPerArroba}. Recomendado calagem e adubação fosfatada via Módulo de Solos.
                      </p>
                    )}
                 </div>

              </div>
           </div>
        </div>
      )}

      {/* PLACHOLDER GERAL OUTRAS ABAS */}
      {(activeTab === 'weight' || activeTab === 'reproduction' || activeTab === 'health' || activeTab === 'milk') && (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-slate-500">
           <Info className="w-10 h-10 mx-auto mb-3 text-amber-300" />
           <strong className="block text-sm">O módulo de {activeTab === 'reproduction' ? 'reprodução' : activeTab === 'weight' ? 'pesagem' : activeTab === 'health' ? 'sanidade' : 'produção de leite'} está sincronizado ao Gêmeo Animal.</strong>
           <p className="text-xs mt-2 max-w-lg mx-auto">Os registros de pesagens, manejo sanitário e reprodutivo alimentam a ficha do animal e são processados pelo ISPA.</p>
        </div>
      )}
    </div>
  );
};
