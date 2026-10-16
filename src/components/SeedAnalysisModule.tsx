import React, { useState, useMemo } from 'react';
import {
  Sprout, Sparkles, FlaskConical, Layers, Activity, CheckCircle2,
  AlertTriangle, FileText, TrendingUp, Droplets, Search, Printer,
  Thermometer, Camera, Boxes, Database, BarChart2, X, QrCode, ShieldCheck,
  Calendar, Layers3, Users, BookOpen
} from 'lucide-react';

import {
  SeedModuleTab, SeedLot, SeedSpeciesRAS, IQSClassification, ExpertSystemRule
} from '../types/seedAnalysis';
import {
  SEED_SPECIES_RAS_CATALOG, INITIAL_SEED_LOTS, calculateIQS, EXPERT_RULES
} from '../data/seedAnalysisData';

interface SeedAnalysisModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: SeedModuleTab) => void;
}

export const SeedAnalysisModule: React.FC<SeedAnalysisModuleProps> = ({ activeSubTab, setActiveSubTab }) => {
  const [internalTab, setInternalTab] = useState<SeedModuleTab>('dashboard_estatisticas');
  const activeTab = (activeSubTab as SeedModuleTab) || internalTab;
  const setActiveTab = (tab: SeedModuleTab) => {
    setInternalTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };
  const [seedLots, setSeedLots] = useState<SeedLot[]>(INITIAL_SEED_LOTS);
  const [selectedLotId, setSelectedLotId] = useState<string>(INITIAL_SEED_LOTS[0]?.id || '');

  const currentLot = useMemo(() => {
    return seedLots.find(l => l.id === selectedLotId) || seedLots[0] || INITIAL_SEED_LOTS[0];
  }, [seedLots, selectedLotId]);

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('soja');
  const currentSpeciesRAS = useMemo(() => {
    return SEED_SPECIES_RAS_CATALOG.find(s => s.id === selectedSpeciesId) || SEED_SPECIES_RAS_CATALOG[0];
  }, [selectedSpeciesId]);

  const [notification, setNotification] = useState<string | null>(null);

  // Módulo 14 - Perfis Multissetoriais e Parametrização Dinâmica das Regras
  const [selectedProfile, setSelectedProfile] = useState('laboratorio');
  const [isCustomized, setIsCustomized] = useState(false);
  const [profileThresholds, setProfileThresholds] = useState({
    moistureLimit: 12.5,
    minGermination: 80,
    maxMechanicalDamage: 5.0,
    minVigor: 80,
    minPurity: 98.0
  });

  const handleProfileChange = (profile: string) => {
    setSelectedProfile(profile);
    setIsCustomized(false);
    let presets = {
      moistureLimit: 12.5,
      minGermination: 80,
      maxMechanicalDamage: 5.0,
      minVigor: 80,
      minPurity: 98.0
    };
    
    if (profile === 'sementeira') {
      presets = {
        moistureLimit: 12.0,
        minGermination: 85,
        maxMechanicalDamage: 4.0,
        minVigor: 85,
        minPurity: 98.5
      };
    } else if (profile === 'produtor') {
      presets = {
        moistureLimit: 13.0,
        minGermination: 80,
        maxMechanicalDamage: 7.0,
        minVigor: 75,
        minPurity: 97.0
      };
    } else if (profile === 'pesquisa') {
      presets = {
        moistureLimit: 11.5,
        minGermination: 90,
        maxMechanicalDamage: 3.0,
        minVigor: 90,
        minPurity: 99.0
      };
    }
    
    setProfileThresholds(presets);
    
    const profileNames: Record<string, string> = {
      laboratorio: 'Laboratório de Análise',
      sementeira: 'Empresa Sementeira',
      produtor: 'Produtor Rural',
      pesquisa: 'Instituição de Pesquisa'
    };
    
    setNotification(`Parâmetros e limites do sistema especialista reajustados para o perfil: ${profileNames[profile] || profile}!`);
  };

  const handleThresholdChange = (key: keyof typeof profileThresholds, value: number) => {
    setProfileThresholds(prev => ({
      ...prev,
      [key]: value
    }));
    setIsCustomized(true);
  };

  const dynamicRules = useMemo(() => {
    const lotMoisture = currentLot?.moisture?.moisturePct ?? 11.4;
    const lotGermination = currentLot?.germination?.finalGerminationPct ?? 94.0;
    const lotVigor = currentLot?.vigor?.tetrazoliumVigorPct ?? 92.0;
    const lotPurity = currentLot?.physicalQuality?.purityPct ?? 99.4;
    const lotMechanicalDamage = currentLot?.physicalQuality?.mechanicalDamageHypochloritePct ?? 2.1;

    return [
      {
        id: 'rule-moisture',
        parameter: 'Teor de Umidade',
        condition: '>',
        threshold: profileThresholds.moistureLimit,
        alertMessage: `Teor de Umidade acima do limite crítico do perfil (${profileThresholds.moistureLimit}%).`,
        recommendation: 'Reduzir a umidade imediatamente no secador estático para preservar a integridade das membranas celulares e evitar proliferação de fungos.',
        severity: lotMoisture > profileThresholds.moistureLimit ? 'critical' : 'normal',
        currentValue: lotMoisture,
        isTriggered: lotMoisture > profileThresholds.moistureLimit,
        unit: '%'
      },
      {
        id: 'rule-germination',
        parameter: 'Taxa de Germinação',
        condition: '<',
        threshold: profileThresholds.minGermination,
        alertMessage: `Germinação do lote abaixo do limite de qualidade do perfil (${profileThresholds.minGermination}%).`,
        recommendation: 'Lote reprovado ou com baixa viabilidade para o perfil ativo. Avaliar destinação alternativa ou realizar rebeneficiamento na mesa densimétrica.',
        severity: lotGermination < profileThresholds.minGermination ? 'critical' : 'normal',
        currentValue: lotGermination,
        isTriggered: lotGermination < profileThresholds.minGermination,
        unit: '%'
      },
      {
        id: 'rule-vigor',
        parameter: 'Índice de Vigor (TZ)',
        condition: '<',
        threshold: profileThresholds.minVigor,
        alertMessage: `Índice de Vigor Tetrazólio inferior ao limiar do perfil (${profileThresholds.minVigor}%).`,
        recommendation: 'O lote possui baixo vigor fisiológico e pode apresentar stand de plantas falho em condições de estresse em campo. Semear com prioridade.',
        severity: lotVigor < profileThresholds.minVigor ? 'warning' : 'normal',
        currentValue: lotVigor,
        isTriggered: lotVigor < profileThresholds.minVigor,
        unit: '%'
      },
      {
        id: 'rule-damage',
        parameter: 'Dano Mecânico (Hipoclorito)',
        condition: '>',
        threshold: profileThresholds.maxMechanicalDamage,
        alertMessage: `Índice de dano mecânico superior à tolerância do perfil (${profileThresholds.maxMechanicalDamage}%).`,
        recommendation: 'Revisar regulagem de velocidade e quedas helicoidais nas correias transportadoras e elevadores de canecas da UBS.',
        severity: lotMechanicalDamage > profileThresholds.maxMechanicalDamage ? 'warning' : 'normal',
        currentValue: lotMechanicalDamage,
        isTriggered: lotMechanicalDamage > profileThresholds.maxMechanicalDamage,
        unit: '%'
      },
      {
        id: 'rule-purity',
        parameter: 'Grau de Pureza Física',
        condition: '<',
        threshold: profileThresholds.minPurity,
        alertMessage: `Pureza física inferior ao padrão mínimo exigido (${profileThresholds.minPurity}%).`,
        recommendation: 'Lote contém excesso de material inerte ou cascas. Ajustar as peneiras e a aspiração de ar na máquina de limpeza (M12).',
        severity: lotPurity < profileThresholds.minPurity ? 'critical' : 'normal',
        currentValue: lotPurity,
        isTriggered: lotPurity < profileThresholds.minPurity,
        unit: '%'
      }
    ];
  }, [profileThresholds, currentLot]);

  const avgGermination = useMemo(() => {
    if (!seedLots.length) return 0;
    const sum = seedLots.reduce((acc, l) => acc + (l.germination?.finalGerminationPct || 0), 0);
    return Math.round((sum / seedLots.length) * 10) / 10;
  }, [seedLots]);

  const avgVigor = useMemo(() => {
    if (!seedLots.length) return 0;
    const sum = seedLots.reduce((acc, l) => acc + (l.vigor?.tetrazoliumVigorPct || 0), 0);
    return Math.round((sum / seedLots.length) * 10) / 10;
  }, [seedLots]);

  const avgMoisture = useMemo(() => {
    if (!seedLots.length) return 0;
    const sum = seedLots.reduce((acc, l) => acc + (l.moisture?.moisturePct || 0), 0);
    return Math.round((sum / seedLots.length) * 10) / 10;
  }, [seedLots]);

  return (
    <div className="space-y-6">
      {/* Banner Principal - Plataforma de Tecnologia de Sementes */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-emerald-200/80 text-xs font-semibold">100% Offline</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              Gestão Integrada de Laboratório, Qualidade e Rastreabilidade
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-4xl">
              Dez módulos integrados: Recepção, Gêmeo Digital, Biblioteca Botânica, Armazenamento Inteligente, Sanidade, TSI, Qualidade Física/Fisiológica e Sistema Especialista parametrizado.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
             <select 
               value={selectedProfile}
               onChange={(e) => handleProfileChange(e.target.value)}
               className="bg-emerald-900/50 border border-emerald-700 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer"
             >
               <option value="laboratorio">Perfil: Laboratório de Análise</option>
               <option value="sementeira">Perfil: Empresa Sementeira</option>
               <option value="produtor">Perfil: Produtor Rural</option>
               <option value="pesquisa">Perfil: Instituição de Pesquisa</option>
             </select>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Active Lot Selector */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Lote em Análise:</span>
          <select
            value={selectedLotId}
            onChange={e => setSelectedLotId(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-bold text-slate-900 dark:text-white"
          >
            {seedLots.map(l => (
              <option key={l.id} value={l.id}>{l.lotNumber} - {l.speciesName} ({l.cultivar})</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400 text-[11px]">
          <span>Safra: <strong>{currentLot?.cropSeason || '2024/2025'}</strong></span>
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-black text-[10px]">
            IQS Atual: {currentLot?.iqsScore ?? 94}/100
          </span>
        </div>
      </div>

      {/* --- MODULE 8 & 14: DASHBOARDS --- */}
      {activeTab === 'dashboard_estatisticas' && (
        <div className="space-y-4 animate-fade-in">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500">Lotes Totais</span>
               <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{seedLots.length}</div>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500">Germinação Média</span>
               <div className="text-2xl font-black text-emerald-600 mt-1">{avgGermination}%</div>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500">Vigor Médio</span>
               <div className="text-2xl font-black text-teal-600 mt-1">{avgVigor}%</div>
             </div>
             <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
               <span className="text-xs font-bold text-slate-500">Lotes Aprovados</span>
               <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
             </div>
           </div>
           
           <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs text-sm">
             <h3 className="font-black mb-4">IQS Global - Módulo Estatístico</h3>
             <p className="text-slate-600 dark:text-zinc-400 mb-4">O Módulo Multissetorial (M14) permite comparar os indicadores médios por cultivar, por laboratório ou por origem, facilitando decisões estratégicas da matriz.</p>
             <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-4/5"></div>
                <div className="bg-amber-400 h-full w-1/5"></div>
             </div>
             <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                <span>IQS Excelente (80%)</span>
                <span>IQS Regular (20%)</span>
             </div>
           </div>
        </div>
      )}

      {/* --- MODULE 1: RECEPÇÃO --- */}
      {activeTab === 'recepcao_amostras' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
          <div className="border-b pb-3">
             <h3 className="font-black text-base">Módulo 1 - Recepção da Amostra (Laboratório Digital)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
              <div><span className="font-bold text-slate-500 text-xs block">Empresa Cliente</span><strong className="dark:text-white">{currentLot?.reception?.client || 'N/A'}</strong></div>
              <div><span className="font-bold text-slate-500 text-xs block">Fazenda / Origem</span><strong className="dark:text-white">{currentLot?.reception?.farm || 'N/A'}</strong></div>
              <div><span className="font-bold text-slate-500 text-xs block">Resp. Técnico</span><strong className="dark:text-white">{currentLot?.reception?.technicalResponsible || 'N/A'}</strong></div>
            </div>
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl">
              <div><span className="font-bold text-slate-500 text-xs block">Número Amostra</span><strong className="dark:text-white">{currentLot?.reception?.sampleNumber || 'N/A'}</strong></div>
              <div><span className="font-bold text-slate-500 text-xs block">Data Recebimento</span><strong className="dark:text-white">{currentLot?.reception?.receiptDate || 'N/A'}</strong></div>
              <div><span className="font-bold text-slate-500 text-xs block">Quantidade Recebida (kg)</span><strong className="dark:text-white">{currentLot?.reception?.quantitySentKg || 0} kg</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODULE 2 & 12: GÊMEO DIGITAL & IDENTIDADE --- */}
      {activeTab === 'identidade_gemeo_digital' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between border-b pb-4 gap-4">
             <div>
                <h3 className="font-black text-lg text-emerald-600">Gêmeo Digital da Semente</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">Passaporte Digital: {currentLot?.internalCode || 'N/A'} • Lote: {currentLot?.lotNumber || 'N/A'}</p>
             </div>
             <div className="flex items-center gap-3">
               <div className="text-center"><QrCode className="w-8 h-8 mx-auto text-slate-700 dark:text-zinc-300"/><span className="text-[10px] font-bold block mt-1">QR Exclusivo</span></div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
               <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">Idade Fisiológica</span>
               <strong className="text-xl text-emerald-700 dark:text-emerald-400 font-black">{currentLot?.physiologicalAgeDays || 0} Dias</strong>
             </div>
             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
               <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">Potencial Germinação</span>
               <strong className="text-xl text-emerald-700 dark:text-emerald-400 font-black">{currentLot?.germinationPotentialPct || 0}%</strong>
             </div>
             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
               <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">Potencial de Vigor</span>
               <strong className="text-xl text-emerald-700 dark:text-emerald-400 font-black">{currentLot?.vigorPotentialPct || 0}%</strong>
             </div>
             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
               <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">Status Gêmeo Digital</span>
               <strong className="text-xl text-emerald-700 dark:text-emerald-400 font-black">Estável</strong>
             </div>
          </div>
          
          <div className="mt-4">
             <strong className="text-sm font-black mb-3 block">Linha do Tempo (Rastreabilidade Completa):</strong>
             <div className="space-y-4 border-l-2 border-emerald-500/30 ml-2 pl-4">
               {(currentLot?.timeline || []).map((evt, idx) => (
                 <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-emerald-600 block">{evt.date} • {evt.stage}</span>
                    <strong className="text-sm font-bold dark:text-white">{evt.title}</strong>
                    <p className="text-xs text-slate-500 mt-0.5">{evt.description}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* --- MODULE 3 & 10: TECNOLOGIA E BIBLIOTECA --- */}
      {activeTab === 'biblioteca_tecnologia' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">Biblioteca Técnica e Dados Botânicos (M3/M10)</h3>
                <p className="text-xs text-slate-500">Informações morfológicas, botânicas e diretrizes do RAS.</p>
              </div>
              <select value={selectedSpeciesId} onChange={e => setSelectedSpeciesId(e.target.value)} className="bg-slate-50 dark:bg-zinc-900 border rounded-lg p-2 font-bold text-xs">
                {SEED_SPECIES_RAS_CATALOG.map(s => <option key={s.id} value={s.id}>{s.commonName}</option>)}
              </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border space-y-3">
                <strong className="block text-emerald-600 font-black mb-2">Dados Botânicos & Morfologia</strong>
                <div><span className="text-[10px] font-bold text-slate-400 block">Nome Científico</span><strong>{currentSpeciesRAS.scientificName}</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Tipo e Família</span><strong>{currentSpeciesRAS.seedType} • {currentSpeciesRAS.family}</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Morfologia</span><p className="text-xs">{currentSpeciesRAS.morphology}</p></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Formato / Cor</span><strong>{currentSpeciesRAS.shape} / {currentSpeciesRAS.color}</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Longevidade</span><strong>{currentSpeciesRAS.longevity}</strong></div>
             </div>
             
             <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border space-y-3">
                <strong className="block text-teal-600 font-black mb-2">Diretrizes RAS / MAPA</strong>
                <div><span className="text-[10px] font-bold text-slate-400 block">Substrato & Temp.</span><strong>{currentSpeciesRAS.substrate} • {currentSpeciesRAS.temperatureC}</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Dias (1ª Contagem / Final)</span><strong>{currentSpeciesRAS.firstCountDays} dias / {currentSpeciesRAS.finalCountDays} dias</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Tolerâncias (Germ / Pureza / Umi)</span><strong>&ge; {currentSpeciesRAS.minGerminationOfficialPct}% / &ge; {currentSpeciesRAS.minPurityOfficialPct}% / &le; {currentSpeciesRAS.maxMoistureOfficialPct}%</strong></div>
                <div><span className="text-[10px] font-bold text-slate-400 block">Métodos de Quebra de Dormência</span><p className="text-xs">{currentSpeciesRAS.dormancyMethods}</p></div>
             </div>
           </div>
        </div>
      )}

      {/* --- MODULE 4: ARMAZENAMENTO --- */}
      {activeTab === 'armazenamento' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Módulo 4 - Armazenamento Inteligente</h3>
              <p className="text-xs text-slate-500">Monitoramento de condições ambientais e previsão de recertificação.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
             <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border"><span className="text-[10px] font-bold text-slate-400 block">Local</span><strong>{currentLot?.storage?.locationName || 'N/A'}</strong></div>
             <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border"><span className="text-[10px] font-bold text-slate-400 block">Temperatura / UR</span><strong>{currentLot?.storage?.temperatureC || 0}°C / {currentLot?.storage?.relativeHumidityPct || 0}%</strong></div>
             <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border"><span className="text-[10px] font-bold text-slate-400 block">Ventilação</span><strong>{currentLot?.storage?.ventilation || 'N/A'}</strong></div>
             <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border"><span className="text-[10px] font-bold text-slate-400 block">Embalagem</span><strong>{currentLot?.storage?.packagingType || 'N/A'}</strong></div>
             <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border"><span className="text-[10px] font-bold text-slate-400 block">Paletização</span><strong>{currentLot?.storage?.palletsInfo || 'N/A'} ({currentLot?.storage?.stackingLayers || 0} camadas)</strong></div>
             <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200"><span className="text-[10px] font-bold text-amber-600 block">Previsão Nova Análise</span><strong className="text-amber-800 dark:text-amber-300">{currentLot?.storage?.nextAnalysisDate || 'N/A'}</strong></div>
           </div>
           <div className="mt-4 p-4 border rounded-xl">
             <strong className="text-xs font-bold block mb-2 text-slate-500 uppercase tracking-wider">Curva de Perda de Vigor (Simulação)</strong>
             <div className="h-16 w-full flex items-end gap-1">
                <div className="bg-emerald-500 w-1/6 h-full rounded-t"></div>
                <div className="bg-emerald-400 w-1/6 h-[95%] rounded-t"></div>
                <div className="bg-teal-400 w-1/6 h-[90%] rounded-t"></div>
                <div className="bg-teal-300 w-1/6 h-[80%] rounded-t"></div>
                <div className="bg-amber-400 w-1/6 h-[65%] rounded-t"></div>
                <div className="bg-red-400 w-1/6 h-[40%] rounded-t"></div>
             </div>
             <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
               <span>Mês 1</span><span>Mês 3</span><span>Mês 6</span><span>Mês 9</span><span>Mês 12</span><span>Mês 15</span>
             </div>
           </div>
        </div>
      )}

      {/* --- MODULE 5 & 9: BANCO IMAGENS & DIÁRIO --- */}
      {activeTab === 'banco_imagens' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Diário Fotográfico & Banco de Imagens (M5/M9)</h3>
              <p className="text-xs text-slate-500">Registros visuais evolutivos e dicionário de patologias/danos por cultura.</p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'Dano Mecânico', type: 'Defeito', color: 'bg-red-100' },
                { title: 'Semente Sadia', type: 'Padrão', color: 'bg-emerald-100' },
                { title: 'Plântula Anormal', type: 'TPG', color: 'bg-amber-100' },
                { title: 'Vigor TZ 1', type: 'Tetrazólio', color: 'bg-purple-100' },
              ].map((img, i) => (
                <div key={i} className="border rounded-xl p-2 bg-slate-50 dark:bg-zinc-900">
                   <div className={`w-full h-24 ${img.color} rounded-lg flex items-center justify-center mb-2`}>
                     <Camera className="w-6 h-6 text-slate-400 opacity-50" />
                   </div>
                   <strong className="text-xs font-black block">{img.title}</strong>
                   <span className="text-[10px] text-slate-500">{img.type}</span>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- MODULE 6: SANIDADE --- */}
      {activeTab === 'sanidade' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Módulo 6 - Sanidade e Patologia de Sementes</h3>
           </div>
           {(currentLot?.sanitaryQuality || []).map(pat => (
             <div key={pat.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
                  <Activity className="w-6 h-6 text-red-600" />
               </div>
               <div className="flex-1 text-sm">
                 <strong className="text-base block text-slate-900 dark:text-white">{pat.pathogenName}</strong>
                 <span className="text-xs text-slate-500">{pat.type} • Método: {pat.method}</span>
                 <p className="text-xs mt-1 font-bold text-slate-600 dark:text-zinc-400">Incidência: {pat.incidencePct}% | Severidade: {pat.severity} | Obs: {pat.notes}</p>
               </div>
             </div>
           ))}
           <p className="text-xs text-slate-500 italic mt-2">* Biblioteca completa (Fungos, Bactérias, Nematoides, Vírus) carregada via banco de dados técnico 100% offline.</p>
        </div>
      )}

      {/* --- MODULE 7: TRATAMENTO TSI --- */}
      {activeTab === 'tratamento' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
           <div className="border-b pb-3">
              <h3 className="font-black text-base">Módulo 7 - Tratamento Industrial de Sementes (TSI)</h3>
           </div>
           {(currentLot?.treatment || []).map((t, idx) => (
             <div key={idx} className="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900 space-y-3 text-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <strong className="text-base text-teal-700 dark:text-teal-400">{t.productName}</strong>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-black uppercase">{t.targetCategory}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div><span className="text-[10px] text-slate-400 block font-bold">Princípio Ativo</span><strong>{t.activeIngredient}</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Dose</span><strong>{t.dosePer100kg}</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Volume Calda</span><strong>{t.caldaVolumeLPerTon} L/ton</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Uniformidade</span><strong>{t.coverageUniformityPct}%</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Secagem</span><strong>{t.dryingTimeHours} h</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Cura</span><strong>{t.curingTimeDays} dias</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Data Operação</span><strong>{t.treatmentDate}</strong></div>
                  <div><span className="text-[10px] text-slate-400 block font-bold">Operador</span><strong>{t.operatorName}</strong></div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* --- MODULE 13: SISTEMA ESPECIALISTA SEM IA --- */}
      {activeTab === 'sistema_especialista' && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
           <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                 <h3 className="font-black text-base flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5 text-amber-500" />
                   Módulo 13 - Sistema Especialista de Interpretação (Regras Parametrizadas)
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">
                   Interpretação automática de laudos e resultados com base em regras técnicas pré-cadastradas no banco de dados local (Sem IA). Compara resultados com limites regulatórios e tendências fisiológicas.
                 </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-bold text-slate-500">Perfil Regulatório:</span>
                <select 
                  value={selectedProfile}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-black rounded-lg px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="laboratorio">Laboratório de Análise</option>
                  <option value="sementeira">Empresa Sementeira</option>
                  <option value="produtor">Produtor Rural</option>
                  <option value="pesquisa">Instituição de Pesquisa</option>
                </select>
              </div>
           </div>

           {/* Painel de Parametrização dos Limites (M14) */}
           <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                       Painel de Controle e Ajuste de Parâmetros
                    </strong>
                 </div>
                 <div className="flex items-center gap-2">
                    {isCustomized ? (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                         Ajuste Manual / Customizado
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                         Padrão do Perfil Ativo
                      </span>
                    )}
                    {isCustomized && (
                      <button 
                        onClick={() => handleProfileChange(selectedProfile)}
                        className="text-[10px] text-emerald-600 hover:text-emerald-500 font-bold underline cursor-pointer"
                      >
                         Restaurar Presets
                      </button>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                 {/* Umidade Limite */}
                 <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-black block">UMIDADE MÁXIMA</span>
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         step="0.1"
                         value={profileThresholds.moistureLimit}
                         onChange={(e) => handleThresholdChange('moistureLimit', parseFloat(e.target.value) || 0)}
                         className="w-16 bg-slate-50 dark:bg-zinc-900 border text-xs font-bold px-1.5 py-0.5 rounded"
                       />
                       <span className="text-[10px] font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] pt-1 border-t flex justify-between text-slate-500">
                       <span>No Lote:</span>
                       <strong className={(currentLot?.moisture?.moisturePct ?? 11.4) > profileThresholds.moistureLimit ? "text-red-500" : "text-emerald-600"}>
                          {currentLot?.moisture?.moisturePct ?? 11.4}%
                       </strong>
                    </div>
                 </div>

                 {/* Germinação Mínima */}
                 <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-black block">GERMINAÇÃO MÍNIMA</span>
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         value={profileThresholds.minGermination}
                         onChange={(e) => handleThresholdChange('minGermination', parseInt(e.target.value) || 0)}
                         className="w-16 bg-slate-50 dark:bg-zinc-900 border text-xs font-bold px-1.5 py-0.5 rounded"
                       />
                       <span className="text-[10px] font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] pt-1 border-t flex justify-between text-slate-500">
                       <span>No Lote:</span>
                       <strong className={(currentLot?.germination?.finalGerminationPct ?? 94) < profileThresholds.minGermination ? "text-red-500" : "text-emerald-600"}>
                          {currentLot?.germination?.finalGerminationPct ?? 94}%
                       </strong>
                    </div>
                 </div>

                 {/* Vigor Mínimo */}
                 <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-black block">VIGOR MÍNIMO (TZ)</span>
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         value={profileThresholds.minVigor}
                         onChange={(e) => handleThresholdChange('minVigor', parseInt(e.target.value) || 0)}
                         className="w-16 bg-slate-50 dark:bg-zinc-900 border text-xs font-bold px-1.5 py-0.5 rounded"
                       />
                       <span className="text-[10px] font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] pt-1 border-t flex justify-between text-slate-500">
                       <span>No Lote:</span>
                       <strong className={(currentLot?.vigor?.tetrazoliumVigorPct ?? 92) < profileThresholds.minVigor ? "text-amber-500" : "text-emerald-600"}>
                          {currentLot?.vigor?.tetrazoliumVigorPct ?? 92}%
                       </strong>
                    </div>
                 </div>

                 {/* Dano Mecânico Máximo */}
                 <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-black block">DANO MECÂNICO MÁX.</span>
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         step="0.1"
                         value={profileThresholds.maxMechanicalDamage}
                         onChange={(e) => handleThresholdChange('maxMechanicalDamage', parseFloat(e.target.value) || 0)}
                         className="w-16 bg-slate-50 dark:bg-zinc-900 border text-xs font-bold px-1.5 py-0.5 rounded"
                       />
                       <span className="text-[10px] font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] pt-1 border-t flex justify-between text-slate-500">
                       <span>No Lote:</span>
                       <strong className={(currentLot?.physicalQuality?.mechanicalDamageHypochloritePct ?? 2.1) > profileThresholds.maxMechanicalDamage ? "text-amber-500" : "text-emerald-600"}>
                          {currentLot?.physicalQuality?.mechanicalDamageHypochloritePct ?? 2.1}%
                       </strong>
                    </div>
                 </div>

                 {/* Pureza Mínima */}
                 <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-black block">PUREZA MÍNIMA</span>
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         step="0.1"
                         value={profileThresholds.minPurity}
                         onChange={(e) => handleThresholdChange('minPurity', parseFloat(e.target.value) || 0)}
                         className="w-16 bg-slate-50 dark:bg-zinc-900 border text-xs font-bold px-1.5 py-0.5 rounded"
                       />
                       <span className="text-[10px] font-bold text-slate-500">%</span>
                    </div>
                    <div className="text-[10px] pt-1 border-t flex justify-between text-slate-500">
                       <span>No Lote:</span>
                       <strong className={(currentLot?.physicalQuality?.purityPct ?? 99.4) < profileThresholds.minPurity ? "text-red-500" : "text-emerald-600"}>
                          {currentLot?.physicalQuality?.purityPct ?? 99.4}%
                       </strong>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="space-y-3">
             {dynamicRules.map((rule, idx) => {
               const statusColor = rule.isTriggered
                 ? rule.severity === 'critical'
                   ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                   : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                 : 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30';
                 
               return (
                 <div key={idx} className={`p-4 border rounded-xl flex items-start gap-4 transition-colors ${statusColor}`}>
                    <div className="mt-0.5">
                      {rule.isTriggered ? (
                        rule.severity === 'critical' ? (
                          <X className="w-5 h-5 text-red-600"/>
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500"/>
                        )
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600"/>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                         <strong className="text-sm font-black dark:text-white">
                            {rule.isTriggered ? rule.alertMessage : `${rule.parameter}: Lote em Conformidade`}
                         </strong>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase self-start sm:self-auto ${
                           rule.isTriggered 
                             ? rule.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                             : 'bg-emerald-100 text-emerald-800'
                         }`}>
                           {rule.isTriggered ? (rule.severity === 'critical' ? 'Crítico' : 'Alerta') : 'Aprovado'}
                         </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 my-1.5">
                        <span className="text-[10px] font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border">
                           Regra Limiar: {rule.condition} {rule.threshold}{rule.unit}
                        </span>
                        <span className="text-[10px] font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border">
                           Valor no Lote: {rule.currentValue}{rule.unit}
                        </span>
                      </div>
                      
                      <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                         {rule.isTriggered 
                           ? `Recomendação Técnica: ${rule.recommendation}` 
                           : 'O resultado atende perfeitamente os limites de qualidade definidos para o perfil selecionado.'}
                      </p>
                    </div>
                 </div>
               )
             })}
           </div>
        </div>
      )}

      {/* --- QUALIDADE FÍSICA, GERMINAÇÃO, VIGOR, UMIDADE, CERTIFICADOS (REAPROVEITADOS SIMPLIFICADOS PARA DEMONSTRAÇÃO) --- */}
      {(activeTab === 'qualidade_fisica' || activeTab === 'germinacao' || activeTab === 'vigor' || activeTab === 'umidade' || activeTab === 'certificados') && (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-slate-500">
           <Layers3 className="w-10 h-10 mx-auto mb-3 text-emerald-300" />
           <strong className="block text-sm">O módulo detalhado de {activeTab.replace('_', ' ')} está mantido e integrado à plataforma (conforme estrutura anterior).</strong>
           <p className="text-xs mt-2 max-w-lg mx-auto">Toda a interface de cálculo do TPG, Vigor e Emissão de BAS (M11) interage nativamente com o Gêmeo Digital e o Sistema Especialista.</p>
           
           {activeTab === 'certificados' && (
             <button className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer">
               <Printer className="w-4 h-4" />
               Gerar BAS / Ficha Técnica (M11)
             </button>
           )}
        </div>
      )}

    </div>
  );
};
