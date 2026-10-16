import React, { useState, useMemo } from 'react';
import {
  X,
  Bug,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  FlaskConical,
  Sprout,
  Search,
  Thermometer,
  Droplets,
  Clock,
  Printer,
  Shield,
  Wrench,
  Sun,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  NurseryCrop,
  CropPestDiseaseDetail,
  ActiveIngredientControl,
  PhysicalMechanicalControl,
  CulturalControlMeasure,
  BiologicalControlAgent
} from '../types/nursery';

interface NurseryCropPhytoDetailModalProps {
  crop: NurseryCrop;
  onClose: () => void;
}

type PhytoTab = 'todos' | 'pragas' | 'doencas' | 'quimico' | 'fisico' | 'biologico' | 'cultural';

export const NurseryCropPhytoDetailModal: React.FC<NurseryCropPhytoDetailModalProps> = ({
  crop,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<PhytoTab>('todos');
  const [innerSearch, setInnerSearch] = useState('');

  const items: CropPestDiseaseDetail[] = useMemo(() => {
    return crop.detailedPestsAndDiseases || [];
  }, [crop]);

  // Filter items based on tab and search
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchTab =
        activeTab === 'todos' ||
        (activeTab === 'pragas' && item.type === 'praga') ||
        (activeTab === 'doencas' && item.type === 'doenca') ||
        activeTab === 'quimico' ||
        activeTab === 'fisico' ||
        activeTab === 'biologico' ||
        activeTab === 'cultural';

      if (!matchTab) return false;

      const q = innerSearch.toLowerCase();
      if (!q) return true;

      const matchName = item.name.toLowerCase().includes(q) || item.scientificName.toLowerCase().includes(q);
      const matchSymptom = item.symptomsAndDamage.toLowerCase().includes(q);
      const matchAI = item.activeIngredients?.some(ai =>
        ai.name.toLowerCase().includes(q) ||
        ai.chemicalGroup.toLowerCase().includes(q) ||
        ai.commercialProducts.some(p => p.toLowerCase().includes(q))
      );
      const matchBio = item.biologicalControls?.some(b =>
        b.agentName.toLowerCase().includes(q) ||
        b.commercialExamples.some(c => c.toLowerCase().includes(q))
      );
      const matchPhysical = item.physicalControls?.some(p =>
        p.methodName.toLowerCase().includes(q) ||
        p.specifications.toLowerCase().includes(q)
      );
      const matchCultural = item.culturalControls?.some(c =>
        c.practiceName.toLowerCase().includes(q) ||
        c.actionGuideline.toLowerCase().includes(q)
      );

      return matchName || matchSymptom || matchAI || matchBio || matchPhysical || matchCultural;
    });
  }, [items, activeTab, innerSearch]);

  // Aggregate active ingredients
  const allActiveIngredients = useMemo(() => {
    const list: {
      ai: ActiveIngredientControl;
      targetPestOrDisease: string;
      targetType: 'praga' | 'doenca';
    }[] = [];

    items.forEach(item => {
      item.activeIngredients?.forEach(ai => {
        list.push({
          ai,
          targetPestOrDisease: `${item.name} (${item.scientificName})`,
          targetType: item.type
        });
      });
    });

    if (!innerSearch) return list;
    const q = innerSearch.toLowerCase();
    return list.filter(
      entry =>
        entry.ai.name.toLowerCase().includes(q) ||
        entry.ai.chemicalGroup.toLowerCase().includes(q) ||
        entry.ai.commercialProducts.some(p => p.toLowerCase().includes(q)) ||
        entry.targetPestOrDisease.toLowerCase().includes(q)
    );
  }, [items, innerSearch]);

  // Aggregate physical controls
  const allPhysicalControls = useMemo(() => {
    const list: {
      control: PhysicalMechanicalControl;
      targetName: string;
      targetType: 'praga' | 'doenca';
    }[] = [];

    items.forEach(item => {
      item.physicalControls?.forEach(ctrl => {
        list.push({
          control: ctrl,
          targetName: `${item.name} (${item.scientificName})`,
          targetType: item.type
        });
      });
    });

    if (!innerSearch) return list;
    const q = innerSearch.toLowerCase();
    return list.filter(
      item =>
        item.control.methodName.toLowerCase().includes(q) ||
        item.control.specifications.toLowerCase().includes(q) ||
        item.control.mechanism.toLowerCase().includes(q) ||
        item.targetName.toLowerCase().includes(q)
    );
  }, [items, innerSearch]);

  // Aggregate biological controls
  const allBiologicalControls = useMemo(() => {
    const list: {
      agent: BiologicalControlAgent;
      targetName: string;
      targetType: 'praga' | 'doenca';
    }[] = [];

    items.forEach(item => {
      item.biologicalControls?.forEach(agent => {
        list.push({
          agent,
          targetName: `${item.name} (${item.scientificName})`,
          targetType: item.type
        });
      });
    });

    if (!innerSearch) return list;
    const q = innerSearch.toLowerCase();
    return list.filter(
      item =>
        item.agent.agentName.toLowerCase().includes(q) ||
        item.agent.commercialExamples.some(p => p.toLowerCase().includes(q)) ||
        item.agent.targetStage.toLowerCase().includes(q) ||
        item.targetName.toLowerCase().includes(q)
    );
  }, [items, innerSearch]);

  // Aggregate cultural controls
  const allCulturalControls = useMemo(() => {
    const list: {
      cultural: CulturalControlMeasure;
      targetName: string;
      targetType: 'praga' | 'doenca';
    }[] = [];

    items.forEach(item => {
      item.culturalControls?.forEach(cult => {
        list.push({
          cultural: cult,
          targetName: `${item.name} (${item.scientificName})`,
          targetType: item.type
        });
      });
    });

    if (!innerSearch) return list;
    const q = innerSearch.toLowerCase();
    return list.filter(
      item =>
        item.cultural.practiceName.toLowerCase().includes(q) ||
        item.cultural.actionGuideline.toLowerCase().includes(q) ||
        item.cultural.impactOnDiseaseOrPest.toLowerCase().includes(q) ||
        item.targetName.toLowerCase().includes(q)
    );
  }, [items, innerSearch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {crop.category.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                Guia Fitossanitário do Viveirista • 4 Pilares MIP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {crop.name}
              <span className="text-xs sm:text-sm font-normal italic text-slate-500 dark:text-zinc-400">
                ({crop.scientificName})
              </span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Ciclo Viveiro: <strong>{crop.nurseryCycleDaysMin} a {crop.nurseryCycleDaysMax} dias</strong>
              </span>
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                Temp. Ideal: <strong>{crop.idealTempMin}°C a {crop.idealTempMax}°C</strong>
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                Bandeja/Recipiente: <strong>{crop.recommendedTray}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handlePrint}
              title="Imprimir / Exportar Ficha Fitossanitária Completa"
              className="px-3 py-2 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 text-xs flex items-center gap-1.5 font-semibold"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Pillars Mini-Dashboard Summary Bar */}
        <div className="bg-slate-100/60 dark:bg-zinc-900/40 border-b border-slate-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
          <span className="font-bold text-slate-500 dark:text-zinc-400 shrink-0 uppercase tracking-wider text-[10px]">
            Pilares do Manejo:
          </span>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              <span>Químico: <strong>{allActiveIngredients.length} ativos</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Físico/Mecânico: <strong>{allPhysicalControls.length} métodos</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-semibold">
              <Leaf className="w-3.5 h-3.5 text-teal-600" />
              <span>Biológico: <strong>{allBiologicalControls.length} bioinsumos</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Cultural/VPD: <strong>{allCulturalControls.length} medidas</strong></span>
            </div>
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({(items || []).length})
            </button>
            <button
              onClick={() => setActiveTab('pragas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'pragas'
                  ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-amber-500" />
              Pragas ({items.filter(i => i.type === 'praga').length})
            </button>
            <button
              onClick={() => setActiveTab('doencas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'doencas'
                  ? 'bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Doenças ({items.filter(i => i.type === 'doenca').length})
            </button>
            <button
              onClick={() => setActiveTab('quimico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'quimico'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              1. Químico ({allActiveIngredients.length})
            </button>
            <button
              onClick={() => setActiveTab('fisico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'fisico'
                  ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              2. Físico ({allPhysicalControls.length})
            </button>
            <button
              onClick={() => setActiveTab('biologico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'biologico'
                  ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-teal-600" />
              3. Biológico ({allBiologicalControls.length})
            </button>
            <button
              onClick={() => setActiveTab('cultural')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'cultural'
                  ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              4. Cultural ({allCulturalControls.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar em todos os 4 pilares..."
              value={innerSearch}
              onChange={e => setInnerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* VIEW: 1. MATRIZ DE CONTROLE QUÍMICO */}
          {activeTab === 'quimico' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                <FlaskConical className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">1º Pilar: Controle Químico & Manejo de Resistência (IRAC/FRAC)</strong>
                  Moléculas autorizadas, formulações comerciais, doses calibradas para plântulas em viveiro e estratégias de rotação para evitar seleção de populações resistentes.
                </div>
              </div>

              {allActiveIngredients.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum princípio ativo encontrado para os filtros atuais.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">Princípio Ativo</th>
                        <th className="p-3">Alvo (Praga/Doença)</th>
                        <th className="p-3">Grupo IRAC/FRAC</th>
                        <th className="p-3">Marcas Comerciais</th>
                        <th className="p-3">Dose Viveiro</th>
                        <th className="p-3">Aplicação</th>
                        <th className="p-3">Manejo de Resistência / Fitotoxidez</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {allActiveIngredients.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-emerald-400">
                            {item.ai.name}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-zinc-300">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${item.targetType === 'praga' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            {item.targetPestOrDisease}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                            {item.ai.chemicalGroup}
                          </td>
                          <td className="p-3 font-medium text-slate-800 dark:text-zinc-200">
                            {item.ai.commercialProducts.join(', ')}
                          </td>
                          <td className="p-3 font-bold text-emerald-700 dark:text-emerald-300">
                            {item.ai.recommendedDosage}
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">
                              {item.ai.applicationMethod.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs">
                            {item.ai.resistanceManagement || item.ai.phytotoxicityNotes || item.ai.observations || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: 2. GUIA DE CONTROLE FÍSICO E MECÂNICO */}
          {activeTab === 'fisico' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">2º Pilar: Controle Físico, Mecânico & Barreiras de Estufa</strong>
                  Barreiras mecânicas (telas 50 mesh, pressão positiva), termoterapia de sementes, sanitização por vapor de bandejas a 80°C, armadilhas cromotrópicas (amarelas/azuis) e roguing cirúrgico.
                </div>
              </div>

              {allPhysicalControls.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum método físico encontrado para os filtros atuais.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPhysicalControls.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-zinc-900/60 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                          {item.control.methodName}
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {item.control.efficiencyRating || 'alta eficácia'}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                        <strong>Especificações Técnicas:</strong> {item.control.specifications}
                      </div>
                      <div className="bg-blue-50/60 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-900 dark:text-blue-200">
                        <strong>Mecanismo de Ação:</strong> {item.control.mechanism}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Alvo Aplicado: <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.targetName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: 3. CATÁLOGO DE CONTROLE BIOLÓGICO */}
          {activeTab === 'biologico' && (
            <div className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 p-4 rounded-xl text-xs text-teal-950 dark:text-teal-200 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">3º Pilar: Controle Biológico, Bioinsumos e Insetos Benéficos</strong>
                  Microrganismos entomopatogênicos (Beauveria, Metarhizium, Cordyceps), biofungicidas antagonistas (Trichoderma, Bacillus) e macrobiológicos predadores/parasitoides (Orius, Encarsia, Phytoseiulus).
                </div>
              </div>

              {allBiologicalControls.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum agente biológico encontrado para os filtros atuais.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allBiologicalControls.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-zinc-900/60 border border-teal-200 dark:border-teal-900/50 rounded-xl p-4 text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">
                            {item.agent.agentType.replace('_', ' ')}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.agent.agentName}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded">
                          {item.agent.dosage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-300">
                        <strong>Fase Alvo da Praga/Doença:</strong> {item.agent.targetStage}
                      </div>
                      <div className="text-[11px] text-teal-800 dark:text-teal-300">
                        <strong>Produtos Comerciais / Cepas:</strong> {item.agent.commercialExamples.join(', ')}
                      </div>
                      <div className="bg-teal-50/60 dark:bg-teal-950/20 p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/30 text-[11px] text-slate-700 dark:text-zinc-300">
                        <strong>Modo de Uso:</strong> {item.agent.modeOfUse}
                        {item.agent.applicationConditions && (
                          <span className="block mt-1 text-slate-500 italic">Condições: {item.agent.applicationConditions}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Alvo: <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.targetName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: 4. CONTROLE CULTURAL & MANEJO SANITÁRIO */}
          {activeTab === 'cultural' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
                <Sun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">4º Pilar: Controle Cultural, Manejo de Irrigação e Sanidade</strong>
                  Gestão do Déficit de Pressão de Vapor (VPD 0.8 a 1.2 kPa), eliminação de molhamento foliar noturno, vazio sanitário de 15 a 21 dias, nutrição reforçada com Silício/Cálcio e desinfecção química de bandejas.
                </div>
              </div>

              {allCulturalControls.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhuma prática cultural encontrada para os filtros atuais.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allCulturalControls.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-zinc-900/60 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          {item.cultural.practiceName}
                        </h4>
                        <span className="text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                          {item.cultural.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                        <strong>Diretriz Operacional:</strong> {item.cultural.actionGuideline}
                      </div>
                      <div className="bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30 text-[11px] text-amber-950 dark:text-amber-200">
                        <strong>Impacto Agronômico:</strong> {item.cultural.impactOnDiseaseOrPest}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Alvo: <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.targetName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: TODOS / PRAGAS / DOENÇAS EM CARDS INTEGRADOS COM OS 4 PILARES */}
          {(activeTab === 'todos' || activeTab === 'pragas' || activeTab === 'doencas') && (
            <div className="space-y-6">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    Nenhum registro encontrado para esta busca.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Tente buscar por outro termo ou selecione a aba correspondente.
                  </p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                  >
                    {/* Header of Item */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              item.type === 'praga'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {item.type === 'praga' ? 'Praga / Inseto' : 'Doença Fitopatológica'}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md uppercase">
                            {item.agentCategory}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {item.name}
                        </h3>
                        <p className="text-xs italic text-slate-500 dark:text-zinc-400">
                          Agente causal: {item.scientificName}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Partes Afetadas na Muda:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5 sm:justify-end">
                          {item.plantPartsAffected.map((part, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[10px] font-semibold bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms, Damage & Action Threshold */}
                    <div className="bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 space-y-1.5">
                      <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Sintomas e Danos em Viveiro / Bandejas:
                      </strong>
                      <p className="leading-relaxed">{item.symptomsAndDamage}</p>
                      {item.economicThresholdInNursery && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                          <strong className="text-emerald-700 dark:text-emerald-400">Limiar de Ação no Viveiro:</strong> {item.economicThresholdInNursery}
                        </p>
                      )}
                      {item.favorableClimate && (
                        <div className="text-[11px] text-amber-800 dark:text-amber-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                          <Thermometer className="w-3 h-3 shrink-0" />
                          <span><strong>Clima Favorável:</strong> {item.favorableClimate.description} ({item.favorableClimate.tempMin ?? ''}°C a {item.favorableClimate.tempMax ?? ''}°C, UR &gt; {item.favorableClimate.humidityMin ?? ''}%)</span>
                        </div>
                      )}
                    </div>

                    {/* PILAR 1: CONTROLE QUÍMICO */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 tracking-wider">
                        <FlaskConical className="w-4 h-4" />
                        1. Controle Químico & Princípios Ativos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.activeIngredients.map((ai, aiIdx) => (
                          <div
                            key={aiIdx}
                            className="bg-white dark:bg-black border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 text-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                                  Princípio Ativo:
                                </span>
                                <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                  {ai.name}
                                </strong>
                              </div>
                              <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded uppercase">
                                {ai.chemicalGroup}
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                              <div>
                                <strong className="text-slate-800 dark:text-zinc-200">Exemplos Comerciais:</strong>{' '}
                                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                                  {ai.commercialProducts.join(', ')}
                                </span>
                              </div>
                              <div>
                                <strong className="text-slate-800 dark:text-zinc-200">Dose Viveiro:</strong>{' '}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {ai.recommendedDosage}
                                </span>
                              </div>
                              <div>
                                <strong className="text-slate-800 dark:text-zinc-200">Método de Aplicação:</strong>{' '}
                                <span className="capitalize">{ai.applicationMethod.replace('_', ' ')}</span>
                              </div>
                              {ai.resistanceManagement && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                  <strong>Manejo de Resistência:</strong> {ai.resistanceManagement}
                                </p>
                              )}
                              {ai.phytotoxicityNotes && (
                                <p className="text-[10px] text-rose-700 dark:text-rose-400">
                                  <strong>Cuidado Fitotóxico:</strong> {ai.phytotoxicityNotes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PILAR 2: CONTROLE FÍSICO E MECÂNICO */}
                    {item.physicalControls && item.physicalControls.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1.5 tracking-wider">
                          <Shield className="w-4 h-4" />
                          2. Controle Físico & Barreiras Mecânicas
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {item.physicalControls.map((phys, pIdx) => (
                            <div
                              key={pIdx}
                              className="bg-white dark:bg-black border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-zinc-100">
                                  {phys.methodName}
                                </span>
                                <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase">
                                  {phys.efficiencyRating || 'Eficácia alta'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                                {phys.specifications}
                              </div>
                              <div className="text-[10px] text-blue-700 dark:text-blue-300 italic">
                                Mecanismo: {phys.mechanism}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PILAR 3: CONTROLE BIOLÓGICO */}
                    {item.biologicalControls && item.biologicalControls.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-teal-700 dark:text-teal-400 flex items-center gap-1.5 tracking-wider">
                          <Leaf className="w-4 h-4" />
                          3. Controle Biológico & Bioinsumos
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.biologicalControls.map((bio, bIdx) => (
                            <div
                              key={bIdx}
                              className="bg-white dark:bg-black border border-teal-200 dark:border-teal-900/60 rounded-xl p-3 text-xs space-y-1"
                            >
                              <div className="font-bold text-slate-900 dark:text-zinc-100">
                                {bio.agentName}
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                                <strong>Alvo:</strong> {bio.targetStage} | <strong>Dose:</strong> {bio.dosage}
                              </div>
                              <div className="text-[10px] text-teal-700 dark:text-teal-400">
                                Marcas: {bio.commercialExamples.join(', ')} ({bio.modeOfUse})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PILAR 4: CONTROLE CULTURAL E SANITÁRIO */}
                    {( (item.culturalControls && item.culturalControls.length > 0) || (item.culturalPreventivePractices && item.culturalPreventivePractices.length > 0) ) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5 tracking-wider">
                          <Sun className="w-4 h-4" />
                          4. Controle Cultural, VPD & Higiene Operacional
                        </h4>
                        
                        {item.culturalControls && item.culturalControls.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.culturalControls.map((cult, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-white dark:bg-black border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-xs space-y-1"
                              >
                                <div className="font-bold text-slate-900 dark:text-zinc-100">
                                  {cult.practiceName}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                                  {cult.actionGuideline}
                                </div>
                                <div className="text-[10px] text-amber-800 dark:text-amber-300">
                                  Impacto: {cult.impactOnDiseaseOrPest}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.culturalPreventivePractices && item.culturalPreventivePractices.length > 0 && (
                          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3 rounded-xl text-xs space-y-1">
                            <strong className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              Recomendações Práticas de Rotina:
                            </strong>
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700 dark:text-zinc-300">
                              {item.culturalPreventivePractices.map((prac, pIdx) => (
                                <li key={pIdx}>{prac}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>
            {crop.name} • MIP 4 Pilares: Químico, Físico/Mecânico, Biológico e Cultural ({(items || []).length} alvos mapeados)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-xs"
          >
            Fechar Guia
          </button>
        </div>

      </div>
    </div>
  );
};
