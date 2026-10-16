// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  LayoutGrid,
  Search,
  Building2,
  ShieldAlert,
  Sliders,
  FileText,
  CloudSun,
  Droplets,
  Thermometer,
  Activity,
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  MapPin,
  Sparkles,
  Wheat,
  Info,
  Clock,
  Compass,
  FileCheck2,
  ArrowUpRight,
  RefreshCw,
  Map,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// --- STYLES & THEME STATUS CONFIG ---
const STATUS_CONFIG = {
  BAIXO: { label: 'Baixo Risco ZARC', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-950/40', dot: 'bg-emerald-500' },
  ATENCAO: { label: 'Atenção GeaAgro', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-950/40', dot: 'bg-amber-500' },
  ELEVADO: { label: 'Risco Elevado', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400 dark:bg-orange-950/40', dot: 'bg-orange-500' },
  FORA: { label: 'Fora do Período ZARC', color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:bg-red-950/40', dot: 'bg-red-500' },
  SEM_DADOS: { label: 'Sem Dados Oficiais', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-zinc-400 dark:bg-zinc-800/40', dot: 'bg-slate-400' },
  DADO_OFICIAL: { label: 'Dado Oficial ZARC', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:bg-blue-950/40', dot: 'bg-blue-500' },
  ANALISE_GEA: { label: 'Análise GeaAgro', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:bg-purple-950/40', dot: 'bg-purple-500' }
};

// --- DATA DICTIONARIES (OFFLINE DATABASES) ---
const CULTURE_BANK = [
  { id: 'soja', name: 'Soja', groups: ['Grupo I (Precoce)', 'Grupo II (Médio)', 'Grupo III (Tardio)'], soils: ['Tipo 1 (Arenoso)', 'Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [100, 115, 130] },
  { id: 'milho', name: 'Milho Verão', groups: ['Precoce', 'Normal', 'Tardio'], soils: ['Tipo 1 (Arenoso)', 'Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [110, 125, 140] },
  { id: 'milho_safrinha', name: 'Milho Segunda Safra', groups: ['Superprecoce', 'Precoce', 'Normal'], soils: ['Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [100, 115, 130] },
  { id: 'feijao', name: 'Feijão', groups: ['Grupo I', 'Grupo II'], soils: ['Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [85, 95, 105] },
  { id: 'algodao', name: 'Algodão', groups: ['Precoce', 'Médio', 'Tardio'], soils: ['Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [140, 160, 180] },
  { id: 'arroz', name: 'Arroz de Sequeiro', groups: ['Precoce', 'Normal'], soils: ['Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [110, 125] },
  { id: 'trigo', name: 'Trigo', groups: ['Precoce', 'Médio'], soils: ['Tipo 2 (Médio)', 'Tipo 3 (Argiloso)'], cycles: [115, 130] },
  { id: 'sorgo', name: 'Sorgo', groups: ['Precoce', 'Médio'], soils: ['Tipo 1', 'Tipo 2', 'Tipo 3'], cycles: [100, 120] },
  { id: 'girassol', name: 'Girassol', groups: ['Precoce', 'Normal'], soils: ['Tipo 1', 'Tipo 2', 'Tipo 3'], cycles: [90, 110] },
  { id: 'cafe', name: 'Café', groups: ['Precoce', 'Médio', 'Tardio'], soils: ['Tipo 2', 'Tipo 3'], cycles: [210, 240] },
  { id: 'cana', name: 'Cana-de-açúcar', groups: ['Precoce', 'Médio'], soils: ['Tipo 2', 'Tipo 3'], cycles: [360, 420] }
];

const UF_LIST = [
  { code: 'SP', name: 'São Paulo', cities: ['Campinas', 'Ribeirão Preto', 'Piracicaba', 'Presidente Prudente', 'Ourinhos', 'Avaré', 'Assis'] },
  { code: 'PR', name: 'Paraná', cities: ['Londrina', 'Cascavel', 'Maringá', 'Guarapuava', 'Castro', 'Ponta Grossa', 'Toledo'] },
  { code: 'MT', name: 'Mato Grosso', cities: ['Sorriso', 'Lucas do Rio Verde', 'Nova Mutum', 'Sinop', 'Primavera do Leste', 'Campo Novo do Parecis'] },
  { code: 'MS', name: 'Mato Grosso do Sul', cities: ['Maracaju', 'Dourados', 'Sidrolândia', 'Ponta Porã', 'Rio Brilhante', 'Naviraí'] },
  { code: 'GO', name: 'Goiás', cities: ['Rio Verde', 'Jataí', 'Mineiros', 'Cristalina', 'Catalão', 'Formosa'] },
  { code: 'RS', name: 'Rio Grande do Sul', cities: ['Passo Fundo', 'Carazinho', 'Cruz Alta', 'Ijuí', 'Santa Maria', 'Erechim'] },
  { code: 'MG', name: 'Minas Gerais', cities: ['Uberlândia', 'Patos de Minas', 'Unaí', 'Passos', 'Alfenas', 'Araguari'] }
];

const SOIL_GROUPS = [
  { group: 'Tipo 1', class: 'Arenoso', criterion: 'Teor de argila entre 10% e 15%', waterCapacity: 'Baixa (CAD 20-30mm)', source: 'EMBRAPA Solos / MAPA', obs: 'Alta vulnerabilidade a veranicos.' },
  { group: 'Tipo 2', class: 'Textura Média', criterion: 'Teor de argila entre 15% e 35%', waterCapacity: 'Média (CAD 35-55mm)', source: 'EMBRAPA Solos / MAPA', obs: 'Suscetibilidade intermediária.' },
  { group: 'Tipo 3', class: 'Argiloso', criterion: 'Teor de argila maior que 35%', waterCapacity: 'Alta (CAD > 60mm)', source: 'EMBRAPA Solos / MAPA', obs: 'Melhor retenção hídrica; menor risco de seca.' }
];

// Seed ZARC simulated responses
const generateZarcResult = (culturaId, uf, municipio, solo, grupoCultivar) => {
  const decendios = [
    { decendio: 'Out/1', status: 'BAIXO', risk20: 10, risk30: 20, risk40: 30, color: '🟢', text: 'Favorável - Baixo Risco' },
    { decendio: 'Out/2', status: 'BAIXO', risk20: 12, risk30: 22, risk40: 32, color: '🟢', text: 'Favorável - Baixo Risco' },
    { decendio: 'Out/3', status: 'BAIXO', risk20: 15, risk30: 25, risk40: 35, color: '🟢', text: 'Favorável - Baixo Risco' },
    { decendio: 'Nov/1', status: 'BAIXO', risk20: 8, risk30: 18, risk40: 28, color: '🟢', text: 'Janela Ótima Oficial' },
    { decendio: 'Nov/2', status: 'BAIXO', risk20: 5, risk30: 15, risk40: 25, color: '🟢', text: 'Janela Ótima Oficial' },
    { decendio: 'Nov/3', status: 'ATENCAO', risk20: 20, risk30: 35, risk40: 45, color: '🟡', text: 'Atenção - Risco Hídrico Moderado' },
    { decendio: 'Dez/1', status: 'ELEVADO', risk20: 35, risk30: 50, risk40: 60, color: '🟠', text: 'Risco Elevado - Temperatura/Seca' },
    { decendio: 'Dez/2', status: 'FORA', risk20: 55, risk30: 70, risk40: 80, color: '🔴', text: 'Fora dos limites ideais recomendados' },
    { decendio: 'Dez/3', status: 'FORA', risk20: 65, risk30: 75, risk40: 85, color: '🔴', text: 'Período Crítico no Florescimento' }
  ];

  return {
    cultura: CULTURE_BANK.find(c => c.id === culturaId)?.name || 'Cultura',
    municipio,
    uf,
    safra: '2026/2027',
    solo,
    grupoCultivar,
    fonte: 'Portaria MAPA / EMBRAPA ZARC',
    dataAtualizacao: '15/07/2026',
    versao: 'v3.2',
    decendios
  };
};

export const ZarcRiscoModule: React.FC<any> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab,
  currentFarm,
  currentProducer,
  currentAgronomist,
  currentCompany,
  farms = [],
  producers = []
}) => {
  // --- OFFLINE-FIRST PERSISTENCE STATES ---
  const [zarcQueries, setZarcQueries] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_queries');
    return saved ? JSON.parse(saved) : [];
  });

  const [propriedadesData, setPropriedadesData] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_properties');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && p.id !== 'prop-1' && !p.id.toString().startsWith('prop-'));
        }
      } catch (e) {}
    }
    return [];
  });

  const [talhoesData, setTalhoesData] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_fields');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => t && t.id && t.id !== 'tal-1' && t.id !== 'tal-2' && !t.id.toString().startsWith('tal-'));
        }
      } catch (e) {}
    }
    return [];
  });

  const [historicoTalhao, setHistoricoTalhao] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(h => h && h.id && h.id !== 'hist-1' && h.id !== 'hist-2' && !h.id.toString().startsWith('hist-'));
        }
      } catch (e) {}
    }
    return [];
  });

  const [alertasZarc, setAlertasZarc] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => a && a.id && a.id !== 'alert-1' && a.id !== 'alert-2' && !a.id.toString().startsWith('alert-'));
        }
      } catch (e) {}
    }
    return [];
  });

  const [scenarios, setScenarios] = useState(() => {
    const saved = localStorage.getItem('geaagro_zarc_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s && s.id && s.id !== 'scen-1' && s.id !== 'scen-2' && !s.id.toString().startsWith('scen-'));
        }
      } catch (e) {}
    }
    return [];
  });

  // --- COMPONENT PERSISTENCE WRITER ---
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_queries', JSON.stringify(zarcQueries));
  }, [zarcQueries]);
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_properties', JSON.stringify(propriedadesData));
  }, [propriedadesData]);
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_fields', JSON.stringify(talhoesData));
  }, [talhoesData]);
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_history', JSON.stringify(historicoTalhao));
  }, [historicoTalhao]);
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_alerts', JSON.stringify(alertasZarc));
  }, [alertasZarc]);
  useEffect(() => {
    localStorage.setItem('geaagro_zarc_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  // --- CONSULTA FORM STATES ---
  const [selectedCultura, setSelectedCultura] = useState('soja');
  const [selectedUf, setSelectedUf] = useState('GO');
  const [selectedMunicipio, setSelectedMunicipio] = useState('Rio Verde');
  const [selectedSafra, setSelectedSafra] = useState('2026/2027');
  const [selectedSolo, setSelectedSolo] = useState('Tipo 3');
  const [selectedGrupo, setSelectedGrupo] = useState('Grupo I (Precoce)');
  const [activeQueryResults, setActiveQueryResults] = useState(null);
  const [querySourceMode, setQuerySourceMode] = useState('oficial'); // 'oficial' | 'geaagro'

  const currentUfObj = UF_LIST.find(u => u.code === selectedUf) || UF_LIST[0];

  const handleRunQuery = () => {
    const results = generateZarcResult(selectedCultura, selectedUf, selectedMunicipio, selectedSolo, selectedGrupo);
    setActiveQueryResults(results);

    // Save history
    const newHistoryItem = {
      id: 'query-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      cultura: CULTURE_BANK.find(c => c.id === selectedCultura)?.name || selectedCultura,
      uf: selectedUf,
      municipio: selectedMunicipio,
      safra: selectedSafra,
      solo: selectedSolo,
      grupo: selectedGrupo,
      risco: 'Baixo Risco ZARC (Janela Ideal)'
    };
    setZarcQueries(prev => [newHistoryItem, ...prev]);
  };

  // --- PROPERTIES & FIELDS FORM STATES ---
  const [showPropForm, setShowPropForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);

  // New Property values
  const [newProp, setNewProp] = useState({
    nome: '', proprietario: '', municipio: '', estado: 'GO', codigoIbge: '', area: '', coordenadas: '', altitude: '', sistemaProdutivo: 'Plantio Direto', irrigacao: 'Sequeiro', obs: ''
  });

  // New Field values
  const [newField, setNewField] = useState({
    propriedadeId: 'prop-1', nome: '', codigo: '', area: '', coordenadas: '', culturaAtual: '', culturaAnterior: '', culturaPlanejada: '', solo: 'Tipo 3 (Argiloso)', textura: '', argila: '', areia: '', silte: '', sistemaCultivo: 'Plantio Direto', irrigado: 'Não', capacidadeAgua: '', obs: ''
  });

  // New History item values
  const [newHist, setNewHist] = useState({
    talhaoId: 'tal-1', cultura: 'Soja', safra: '2025/2026', plantio: '', colheita: '', produtividade: '', irrigacao: 'Não', eventos: '', perdas: '', obs: ''
  });

  const handleAddProperty = (e) => {
    e.preventDefault();
    const propId = 'prop-' + Date.now();
    const created = { ...newProp, id: propId, area: Number(newProp.area) || 0, altitude: Number(newProp.altitude) || 0 };
    setPropriedadesData(prev => [...prev, created]);
    setShowPropForm(false);
    setNewProp({ nome: '', proprietario: '', municipio: '', estado: 'GO', codigoIbge: '', area: '', coordenadas: '', altitude: '', sistemaProdutivo: 'Plantio Direto', irrigacao: 'Sequeiro', obs: '' });
  };

  const handleAddField = (e) => {
    e.preventDefault();
    const fieldId = 'tal-' + Date.now();
    const created = {
      ...newField,
      id: fieldId,
      area: Number(newField.area) || 0,
      argila: Number(newField.argila) || 0,
      areia: Number(newField.areia) || 0,
      silte: Number(newField.silte) || 0
    };
    setTalhoesData(prev => [...prev, created]);
    setShowFieldForm(false);
    setNewField({ propriedadeId: 'prop-1', nome: '', codigo: '', area: '', coordenadas: '', culturaAtual: '', culturaAnterior: '', culturaPlanejada: '', solo: 'Tipo 3 (Argiloso)', textura: '', argila: '', areia: '', silte: '', sistemaCultivo: 'Plantio Direto', irrigado: 'Não', capacidadeAgua: '', obs: '' });
  };

  const handleAddHistory = (e) => {
    e.preventDefault();
    const histId = 'hist-' + Date.now();
    const created = { ...newHist, id: histId, produtividade: Number(newHist.produtividade) || 0, perdas: Number(newHist.perdas) || 0 };
    setHistoricoTalhao(prev => [...prev, created]);
    setShowHistoryForm(false);
    setNewHist({ talhaoId: 'tal-1', cultura: 'Soja', safra: '2025/2026', plantio: '', colheita: '', produtividade: '', irrigacao: 'Não', eventos: '', perdas: '', obs: '' });
  };

  // --- MAP LAYER TOGGLE STATE ---
  const [mapLayers, setMapLayers] = useState({
    limites: true,
    talhoes: true,
    cultura: true,
    solos: false,
    irrigacao: false,
    alertas: true,
    riscoClimatico: false
  });

  // --- SIMULATION STATES ---
  const [simCultura, setSimCultura] = useState('soja');
  const [simSolo, setSimSolo] = useState('Tipo 3');
  const [simGrupo, setSimGrupo] = useState('Grupo I (Precoce)');
  const [simDataPlantio, setSimDataPlantio] = useState('15/10/2026');
  const [simIrrigado, setSimIrrigado] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleRunSimulation = () => {
    // Generate side-by-side risk score based on simple math
    const baseRisco = simSolo === 'Tipo 3' ? 12 : simSolo === 'Tipo 2' ? 24 : 45;
    const offsetGrupo = simGrupo.includes('Precoce') ? -5 : 8;
    const offsetIrrigado = simIrrigado ? -15 : 0;
    const offsetData = simDataPlantio.includes('Nov') ? -8 : simDataPlantio.includes('Dez') ? 22 : 2;

    const finalRisco = Math.max(5, Math.min(95, baseRisco + offsetGrupo + offsetIrrigado + offsetData));
    const finalProd = Math.max(40, Math.min(100, 85 - (finalRisco / 3) + (simIrrigado ? 15 : 0)));

    let statusString = 'Excelente';
    if (finalRisco > 35) statusString = 'Moderado';
    if (finalRisco > 55) statusString = 'Alto Risco';

    setSimResult({
      risco: finalRisco,
      produtividade: finalProd,
      status: statusString
    });
  };

  const handleSaveScenario = () => {
    if (!simResult) return;
    const scenario = {
      id: 'scen-' + Date.now(),
      nome: `${CULTURE_BANK.find(c => c.id === simCultura)?.name} - Solo ${simSolo} (${simDataPlantio})`,
      cultura: CULTURE_BANK.find(c => c.id === simCultura)?.name,
      solo: simSolo,
      grupo: simGrupo,
      dataPlantio: simDataPlantio,
      irrigado: simIrrigado,
      riscoMedio: simResult.risco,
      produtividadeEstimada: Math.round(simResult.produtividade),
      status: simResult.status
    };
    setScenarios(prev => [...prev, scenario]);
  };

  // --- REPORT EXPORT STATE ---
  const [selectedScenarioForReport, setSelectedScenarioForReport] = useState(() => {
    return scenarios[0]?.id || '';
  });
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const triggerPDFExport = () => {
    let scenario = scenarios.find(s => s.id === selectedScenarioForReport);
    if (!scenario && scenarios.length > 0) {
      scenario = scenarios[0];
    }
    if (!scenario) {
      alert("Nenhum cenário de simulação disponível para gerar o relatório.");
      return;
    }

    setIsReportGenerating(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Brand Green Colors
        const primaryColor = [16, 124, 65]; // RGB for Forest Green
        const secondaryColor = [31, 41, 55]; // RGB for Slate Gray
        
        // Title banner
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('GEAAGRO - PLANEJAMENTO AGRÍCOLA', 15, 22);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Relatório Técnico e Zoneamento Agrícola de Risco Climático (ZARC)', 15, 30);
        
        // Metadata / Date
        doc.setTextColor(110, 110, 110);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 140, 22);
        doc.text('Documento ID: ' + Math.random().toString(36).substring(2, 11).toUpperCase(), 140, 27);
        doc.text('Status: Sincronizado Offline', 140, 32);

        // Body Content
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('1. Informações do Cenário Selecionado', 15, 55);
        
        // Box for Scenario Details
        doc.setDrawColor(220, 225, 230);
        doc.setFillColor(245, 247, 250);
        doc.rect(15, 60, 180, 52, 'FD');
        
        doc.setFontSize(11);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        // Columns inside the box
        doc.setFont('helvetica', 'bold');
        doc.text('Cenário:', 20, 68);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.nome || 'N/A', 50, 68);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Cultura:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.cultura || 'N/A', 50, 75);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Grupo de Solo:', 20, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.solo || 'N/A', 50, 82);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Grupo Cultivar:', 20, 89);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.grupo || 'N/A', 50, 89);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Época de Plantio:', 20, 96);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.dataPlantio || 'N/A', 55, 96);

        doc.setFont('helvetica', 'bold');
        doc.text('Irrigação Ativa:', 20, 103);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.irrigado ? 'Sim' : 'Não (Sequeiro)', 55, 103);
        
        // Estimates Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('2. Estimativas de Risco e Produtividade', 15, 125);
        
        // Box for Estimates
        doc.setDrawColor(220, 225, 230);
        doc.setFillColor(250, 252, 250);
        doc.rect(15, 130, 180, 35, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Risco Médio Estimado ZARC:', 20, 138);
        doc.setFont('helvetica', 'normal');
        doc.text(`${scenario.riscoMedio}% (${scenario.status})`, 80, 138);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Potencial de Produtividade:', 20, 146);
        doc.setFont('helvetica', 'normal');
        doc.text(`${scenario.produtividadeEstimada} sc/ha`, 80, 146);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Classificação Recomendada:', 20, 154);
        doc.setFont('helvetica', 'normal');
        doc.text(scenario.riscoMedio < 20 ? 'Excelente (Semeadura Recomendada)' : scenario.riscoMedio < 40 ? 'Favorável com Atenção' : 'Alto Risco (Não Recomendado)', 80, 154);

        // Clarifications section - separating ZARC from GEAAGRO
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('3. Esclarecimentos Legais e Separação de Dados', 15, 178);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 90, 100);
        
        const disclaimer1 = '1. DADOS OFICIAIS DO ZARC: Os dados apresentados como referência oficial do Zoneamento Agrícola de Risco Climático (ZARC) originam-se estritamente das publicações e portarias do Ministério da Agricultura, Pecuária e Abastecimento (MAPA) e da EMBRAPA.';
        const disclaimer2 = '2. INTERPRETAÇÕES E ANÁLISES GEAAGRO: As recomendações adicionais, análises de produtividade estimada e sugestões de manejo são desenvolvidas por algoritmos proprietários da GeaAgro. Elas não substituem, de forma alguma, a consulta às portarias oficiais vigentes.';
        const disclaimer3 = '3. ISENÇÃO DE RESPONSABILIDADE: Os cálculos do sistema de simulação servem unicamente como ferramenta de apoio à decisão do produtor rural, engenheiro agrônomo ou consultor técnico, não constituindo garantia de safra ou indenizações de seguro.';

        const split1 = doc.splitTextToSize(disclaimer1, 180);
        const split2 = doc.splitTextToSize(disclaimer2, 180);
        const split3 = doc.splitTextToSize(disclaimer3, 180);

        let currentY = 185;
        doc.text(split1, 15, currentY);
        currentY += split1.length * 5 + 2;
        doc.text(split2, 15, currentY);
        currentY += split2.length * 5 + 2;
        doc.text(split3, 15, currentY);
        
        // Footer Signatures
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 260, 90, 260);
        doc.line(120, 260, 195, 260);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Assinatura do Técnico / Agrônomo', 25, 265);
        doc.text('GeaAgro Tecnologias Agrícolas', 135, 265);
        
        doc.setFont('helvetica', 'normal');
        doc.text('CREA / Região: _______________', 25, 270);
        doc.text('Laudo em conformidade com ZARC', 135, 270);
        
        // Save PDF
        const safeName = scenario.nome.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`Relatorio_ZARC_GeaAgro_${safeName}.pdf`);
        
        setIsReportGenerating(false);
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 3000);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setIsReportGenerating(false);
      }
    }, 1500);
  };

  // --- ACTIVE NOTIFICATIONS & DEADLINES COUNT ---
  const activeAlertsCount = alertasZarc.filter(a => a.status === 'ativo').length;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-850/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-zinc-500">ZARC &amp; Riscos</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Zoneamento Agrícola de Risco Climático</h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Módulo oficial de conformidade e planejamento agrícola baseado no ZARC nacional. Diferencie sempre os dados oficiais das interpretações exclusivas da GeaAgro.
          </p>
        </div>
      </div>

      {/* TAB CONTENT: 1. DASHBOARD ZARC */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* CARDS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <span className="block text-[10px] uppercase font-bold text-slate-400">Propriedades</span>
              <span className="block text-2xl font-black text-slate-800 dark:text-white">{propriedadesData.length}</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              <span className="block text-[10px] uppercase font-bold text-slate-400">Talhões</span>
              <span className="block text-2xl font-black text-slate-800 dark:text-white">{talhoesData.length}</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
              <Wheat className="w-5 h-5 text-amber-500" />
              <span className="block text-[10px] uppercase font-bold text-slate-400">Culturas Ativas</span>
              <span className="block text-2xl font-black text-slate-800 dark:text-white">
                {talhoesData.length > 0 ? Array.from(new Set(talhoesData.map(t => t.culturaPlanejada || t.culturaAtual))).filter(Boolean).length : 0}
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="block text-[10px] uppercase font-bold text-slate-400">Janelas Abertas</span>
              <span className="block text-2xl font-black text-slate-800 dark:text-white text-emerald-500">
                {talhoesData.length > 0 ? '🟢 2' : '0'}
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="block text-[10px] uppercase font-bold text-slate-400">Alertas Ativos</span>
              <span className="block text-2xl font-black text-slate-800 dark:text-white text-red-500">{activeAlertsCount}</span>
            </div>
          </div>

          {/* MAIN CHARTS AND GRAPHICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Sowing Risks by Crop */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Riscos de Plantio por Tipo de Solo</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Tipo 1 (Arenoso)', baixo: 10, atencao: 35, elevado: 55 },
                    { name: 'Tipo 2 (Médio)', baixo: 40, atencao: 40, elevado: 20 },
                    { name: 'Tipo 3 (Argiloso)', baixo: 75, atencao: 20, elevado: 5 }
                  ]}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} unit="%" />
                    <ChartTooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="baixo" name="Baixo Risco ZARC" fill="#10b981" />
                    <Bar dataKey="atencao" name="Atenção Climática" fill="#f59e0b" />
                    <Bar dataKey="elevado" name="Risco Elevado" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Sowing Window Calendar Matrix */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Calendário de Plantio do ZARC</h3>
                <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-1 rounded-md font-bold">Portaria 2026</span>
              </div>
              
              <div className="space-y-4">
                {/* Sowing Decendio Calendar Block */}
                {[
                  { month: 'OUTUBRO', d1: 'BAIXO', d2: 'BAIXO', d3: 'BAIXO' },
                  { month: 'NOVEMBRO', d1: 'BAIXO', d2: 'BAIXO', d3: 'ATENCAO' },
                  { month: 'DEZEMBRO', d1: 'ELEVADO', d2: 'FORA', d3: 'FORA' }
                ].map((m, idx) => (
                  <div key={idx} className="border-b border-slate-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <span className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 mb-2">{m.month}</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-center space-y-1">
                        <span className="block text-[10px] font-bold text-slate-400">1º Decêndio</span>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[m.d1].dot}`} />
                          <span className="text-[11px] text-slate-700 dark:text-zinc-300">{STATUS_CONFIG[m.d1].label.split(' ')[0]}</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-center space-y-1">
                        <span className="block text-[10px] font-bold text-slate-400">2º Decêndio</span>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[m.d2].dot}`} />
                          <span className="text-[11px] text-slate-700 dark:text-zinc-300">{STATUS_CONFIG[m.d2].label.split(' ')[0]}</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-center space-y-1">
                        <span className="block text-[10px] font-bold text-slate-400">3º Decêndio</span>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[m.d3].dot}`} />
                          <span className="text-[11px] text-slate-700 dark:text-zinc-300">{STATUS_CONFIG[m.d3].label.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE ALERTS LIST */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Alertas de Riscos Climáticos Vigentes</h3>
            <div className="space-y-3">
              {alertasZarc.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/40 dark:border-zinc-850 rounded-2xl">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    a.tipo === 'urgente' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white">{a.titulo}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-mono">{a.data}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{a.mensagem}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. CONSULTA ZARC */}
      {activeSubTab === 'consulta' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Query Parameters Form */}
          <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Parâmetros de Consulta</h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 dark:text-zinc-400">Cultura</label>
                <select
                  value={selectedCultura}
                  onChange={(e) => setSelectedCultura(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                >
                  {CULTURE_BANK.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-500 dark:text-zinc-400">Estado (UF)</label>
                  <select
                    value={selectedUf}
                    onChange={(e) => {
                      setSelectedUf(e.target.value);
                      const stateObj = UF_LIST.find(u => u.code === e.target.value);
                      if (stateObj) setSelectedMunicipio(stateObj.cities[0]);
                    }}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                  >
                    {UF_LIST.map(u => (
                      <option key={u.code} value={u.code}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-500 dark:text-zinc-400">Município</label>
                  <select
                    value={selectedMunicipio}
                    onChange={(e) => setSelectedMunicipio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                  >
                    {currentUfObj.cities.map(cit => (
                      <option key={cit} value={cit}>{cit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 dark:text-zinc-400">Safra</label>
                <select
                  value={selectedSafra}
                  onChange={(e) => setSelectedSafra(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="2026/2027">Safra 2026/2027</option>
                  <option value="2025/2026">Safra 2025/2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 dark:text-zinc-400">Tipo de Solo (ZARC)</label>
                <select
                  value={selectedSolo}
                  onChange={(e) => setSelectedSolo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Tipo 1">Tipo 1 (Arenoso)</option>
                  <option value="Tipo 2">Tipo 2 (Textura Média)</option>
                  <option value="Tipo 3">Tipo 3 (Argiloso)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 dark:text-zinc-400">Grupo de Cultivar / Ciclo</label>
                <select
                  value={selectedGrupo}
                  onChange={(e) => setSelectedGrupo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Grupo I (Precoce)">Grupo I - Ciclo Precoce</option>
                  <option value="Grupo II (Médio)">Grupo II - Ciclo Médio</option>
                  <option value="Grupo III (Tardio)">Grupo III - Ciclo Tardio</option>
                </select>
              </div>

              <button
                onClick={handleRunQuery}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Consultar ZARC</span>
              </button>
            </div>
          </div>

          {/* Query Results & History */}
          <div className="md:col-span-2 space-y-6">
            {/* Detailed Result Card */}
            {activeQueryResults ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Resultado Oficial</span>
                    <h4 className="text-base font-black text-slate-800 dark:text-white">
                      ZARC {activeQueryResults.cultura} - {activeQueryResults.municipio}/{activeQueryResults.uf}
                    </h4>
                  </div>
                  
                  {/* Mode Selector Switch: Oficial vs Interpretation */}
                  <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                    <button
                      onClick={() => setQuerySourceMode('oficial')}
                      className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                        querySourceMode === 'oficial'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      DADOS OFICIAIS
                    </button>
                    <button
                      onClick={() => setQuerySourceMode('geaagro')}
                      className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                        querySourceMode === 'geaagro'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      ANÁLISE GEAAGRO
                    </button>
                  </div>
                </div>

                {querySourceMode === 'oficial' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-200/40">
                        <span className="block text-slate-400 font-bold">Safra</span>
                        <span className="block font-black text-slate-800 dark:text-zinc-200">{activeQueryResults.safra}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-200/40">
                        <span className="block text-slate-400 font-bold">Solo Indicado</span>
                        <span className="block font-black text-slate-800 dark:text-zinc-200">{activeQueryResults.solo}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-200/40">
                        <span className="block text-slate-400 font-bold">Fonte Oficial</span>
                        <span className="block font-black text-slate-800 dark:text-zinc-200">{activeQueryResults.fonte}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-200/40">
                        <span className="block text-slate-400 font-bold">Última Portaria</span>
                        <span className="block font-black text-slate-800 dark:text-zinc-200">{activeQueryResults.dataAtualizacao}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                      <div className="grid grid-cols-4 bg-slate-50 dark:bg-zinc-950/80 p-3 font-black text-slate-500 dark:text-zinc-400 border-b border-slate-250">
                        <span>Decêndio</span>
                        <span className="text-center">Risco 20%</span>
                        <span className="text-center">Risco 30%</span>
                        <span className="text-right">Risco 40%</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                        {activeQueryResults.decendios.map((d, index) => (
                          <div key={index} className="grid grid-cols-4 p-3 items-center">
                            <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[d.status].dot}`} />
                              {d.decendio}
                            </span>
                            <span className="text-center font-mono font-bold text-slate-600 dark:text-zinc-300">{d.risk20}%</span>
                            <span className="text-center font-mono font-bold text-slate-600 dark:text-zinc-300">{d.risk30}%</span>
                            <span className="text-right font-mono font-bold text-slate-600 dark:text-zinc-300">{d.risk40}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Sparkles className="w-5 h-5" />
                        <h5 className="font-black text-xs">Interpretações Agronômicas Avançadas GeaAgro</h5>
                      </div>
                      <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                        Nossa equipe agronômica recalcula as probabilidades utilizando dados históricos de precipitação local e balanço hídrico acumulado do solo (IndexedDB).
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200/40 space-y-1">
                        <span className="block font-black text-slate-700 dark:text-zinc-300">Resumo da Análise GeaAgro</span>
                        <p className="text-slate-500 dark:text-zinc-400">
                          Para a região de {activeQueryResults.municipio}/{activeQueryResults.uf}, o solo argiloso comporta capacidade hídrica até 15 dias de veranico extremo. Recomendamos antecipar em 5 dias o plantio previsto no ZARC oficial para capturar melhores índices de radiação no florescimento.
                        </p>
                      </div>

                      <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-200/40 text-amber-800 dark:text-amber-400 text-xs">
                        <strong>AVISO IMPORTANTE:</strong> Os dados desta aba são exclusivas análises geradas pelo GeaAgro e NÃO substituem, modificam ou dispensam a consulta obrigatória das tabelas oficiais vigentes do ZARC para fins de crédito ou seguro agrícola.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-slate-400 dark:text-zinc-500 shadow-2xs flex flex-col items-center justify-center space-y-3">
                <Search className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-bold">Nenhuma consulta ativa no momento</p>
                <p className="text-xs max-w-sm">Preencha o formulário ao lado e clique em "Consultar ZARC" para visualizar o zoneamento completo.</p>
              </div>
            )}

            {/* Offline Query History */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Histórico de Consultas Sincronizadas</h3>
              {zarcQueries.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {zarcQueries.map(q => (
                    <div key={q.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-2">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{q.cultura} - {q.municipio}/{q.uf}</span>
                        <span className="block text-[10px] text-slate-400">{q.timestamp} • Solo: {q.solo}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 font-bold px-2.5 py-1 rounded-lg text-slate-500 dark:text-zinc-400">
                        {q.safra}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Nenhuma consulta recente registrada localmente.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. PROPRIEDADE E TALHÕES */}
      {activeSubTab === 'propriedades' && (
        <div className="space-y-6">
          {/* PROPERTIES & FIELDS SELECTORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Properties List */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Propriedades Cadastradas</h3>
                <button
                  onClick={() => setShowPropForm(!showPropForm)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Propriedade</span>
                </button>
              </div>

              {showPropForm && (
                <form onSubmit={handleAddProperty} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-3 animate-fade-in bg-slate-50 dark:bg-zinc-950/40">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Nome</label>
                      <input type="text" value={newProp.nome} onChange={e => setNewProp({...newProp, nome: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Proprietário</label>
                      <input type="text" value={newProp.proprietario} onChange={e => setNewProp({...newProp, proprietario: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Município</label>
                      <input type="text" value={newProp.municipio} onChange={e => setNewProp({...newProp, municipio: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">UF</label>
                      <input type="text" value={newProp.estado} onChange={e => setNewProp({...newProp, estado: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Área (ha)</label>
                      <input type="number" value={newProp.area} onChange={e => setNewProp({...newProp, area: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Coordenadas</label>
                      <input type="text" placeholder="-15.555, -45.555" value={newProp.coordenadas} onChange={e => setNewProp({...newProp, coordenadas: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Altitude (m)</label>
                      <input type="number" value={newProp.altitude} onChange={e => setNewProp({...newProp, altitude: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowPropForm(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg font-bold">Cancelar</button>
                    <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Salvar</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {propriedadesData.map(p => (
                  <div key={p.id} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 dark:text-white">{p.nome}</span>
                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">{p.area} ha</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-slate-500 dark:text-zinc-400">
                      <span>Proprietário: <strong>{p.proprietario}</strong></span>
                      <span>Localidade: <strong>{p.municipio}/{p.estado}</strong></span>
                      <span>Coordenadas: <strong>{p.coordenadas}</strong></span>
                      <span>Altitude: <strong>{p.altitude}m</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talhões List */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Talhões &amp; Informação de Solo</h3>
                <button
                  onClick={() => setShowFieldForm(!showFieldForm)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Talhão</span>
                </button>
              </div>

              {showFieldForm && (
                <form onSubmit={handleAddField} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-3 animate-fade-in bg-slate-50 dark:bg-zinc-950/40">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Nome</label>
                      <input type="text" value={newField.nome} onChange={e => setNewField({...newField, nome: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Código</label>
                      <input type="text" placeholder="T-01" value={newField.codigo} onChange={e => setNewField({...newField, codigo: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Área (ha)</label>
                      <input type="number" value={newField.area} onChange={e => setNewField({...newField, area: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Argila (%)</label>
                      <input type="number" placeholder="ex: 45" value={newField.argila} onChange={e => setNewField({...newField, argila: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Areia (%)</label>
                      <input type="number" placeholder="ex: 30" value={newField.areia} onChange={e => setNewField({...newField, areia: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold">Solo ZARC</label>
                      <select value={newField.solo} onChange={e => setNewField({...newField, solo: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-bold cursor-pointer">
                        <option value="Tipo 1 (Arenoso)">Tipo 1 (Arenoso)</option>
                        <option value="Tipo 2 (Médio)">Tipo 2 (Médio)</option>
                        <option value="Tipo 3 (Argiloso)">Tipo 3 (Argiloso)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Capacidade Água</label>
                      <input type="text" placeholder="ex: 60mm" value={newField.capacidadeAgua} onChange={e => setNewField({...newField, capacidadeAgua: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowFieldForm(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg font-bold">Cancelar</button>
                    <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Salvar</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {talhoesData.map(t => (
                  <div key={t.id} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 dark:text-white">{t.nome} ({t.codigo})</span>
                      <span className="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">{t.area} ha</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-slate-500 dark:text-zinc-400">
                      <span>Solo: <strong>{t.solo}</strong></span>
                      <span>Argila/Areia: <strong>{t.argila || 0}% / {t.areia || 0}%</strong></span>
                      <span>Irrigado: <strong>{t.irrigado}</strong></span>
                      <span>CAD (Água): <strong>{t.capacidadeAgua || 'Não inf.'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INTERACTIVE OFFLINE MAP WITH LAYERS */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Mapa da Propriedade - ZARC Layer Control</h3>
                <p className="text-[11px] text-slate-400">Visualização de camadas integrada sem dependências externas (Offline-First Map Engine)</p>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'limites', label: 'Limite Propriedade' },
                  { key: 'talhoes', label: 'Talhões' },
                  { key: 'cultura', label: 'Culturas' },
                  { key: 'solos', label: 'Solo ZARC' },
                  { key: 'irrigacao', label: 'Áreas Irrigadas' },
                  { key: 'riscoClimatico', label: 'Risco Climático' },
                  { key: 'alertas', label: 'Alertas Ativos' }
                ].map(l => (
                  <button
                    key={l.key}
                    onClick={() => setMapLayers(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all border cursor-pointer ${
                      mapLayers[l.key]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-zinc-950 dark:border-zinc-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Interactive Map Display Panel */}
            <div className="h-96 relative border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* SVG Map Graphics */}
              <svg viewBox="0 0 800 400" className="w-full h-full p-4">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Property Limits Layer */}
                {mapLayers.limites && (
                  <polygon
                    points="100,50 700,40 750,320 150,350"
                    fill="rgba(16, 185, 129, 0.05)"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}

                {/* Talhões & Culturas / Solos Layers */}
                {mapLayers.talhoes && (
                  <>
                    {/* Talhão 1 */}
                    <polygon
                      points="150,80 400,70 380,310 180,320"
                      fill={
                        mapLayers.solos
                          ? 'rgba(168, 85, 247, 0.15)' // Purple for Soil Type 3
                          : mapLayers.riscoClimatico
                          ? 'rgba(16, 185, 129, 0.2)'  // Green for Low Risk
                          : 'rgba(59, 130, 246, 0.15)' // Blue for Soja
                      }
                      stroke={mapLayers.solos ? '#a855f7' : mapLayers.riscoClimatico ? '#10b981' : '#3b82f6'}
                      strokeWidth="1.5"
                    />
                    <text x="250" y="180" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Talhão Norte (Soja)
                    </text>
                    {mapLayers.solos && <text x="250" y="195" fill="#a855f7" fontSize="9" fontWeight="extrabold" textAnchor="middle">Tipo 3 (Argiloso)</text>}
                    {mapLayers.riscoClimatico && <text x="250" y="195" fill="#10b981" fontSize="9" fontWeight="extrabold" textAnchor="middle">Risco ZARC: 10% 🟢</text>}

                    {/* Talhão 2 */}
                    <polygon
                      points="420,70 680,60 630,300 390,310"
                      fill={
                        mapLayers.solos
                          ? 'rgba(245, 158, 11, 0.15)' // Orange/Yellow for Soil Type 2
                          : mapLayers.riscoClimatico
                          ? 'rgba(245, 158, 11, 0.2)'  // Yellow for Attention
                          : 'rgba(245, 158, 11, 0.15)' // Yellow for Milho
                      }
                      stroke={mapLayers.solos ? '#f59e0b' : mapLayers.riscoClimatico ? '#f59e0b' : '#f59e0b'}
                      strokeWidth="1.5"
                    />
                    <text x="530" y="180" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Talhão Sul (Milho)
                    </text>
                    {mapLayers.solos && <text x="530" y="195" fill="#f59e0b" fontSize="9" fontWeight="extrabold" textAnchor="middle">Tipo 2 (Médio)</text>}
                    {mapLayers.riscoClimatico && <text x="530" y="195" fill="#f59e0b" fontSize="9" fontWeight="extrabold" textAnchor="middle">Risco ZARC: 28% 🟡</text>}
                  </>
                )}

                {/* Irrigated Area Layer overlay */}
                {mapLayers.irrigacao && (
                  <circle cx="530" cy="180" r="75" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
                )}

                {/* Alerts Pins layer */}
                {mapLayers.alertas && (
                  <g transform="translate(250, 140)">
                    <circle r="6" fill="#ef4444" className="animate-ping" />
                    <circle r="4" fill="#ef4444" />
                    <text x="8" y="4" fill="#ef4444" fontSize="9" fontWeight="bold">Alerta: Fim da Janela</text>
                  </g>
                )}
              </svg>

              {/* Map floating indicators */}
              <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] space-y-1.5 border border-zinc-800 text-zinc-300">
                <span className="block font-bold">Legendas Ativas:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded" />
                  <span>Soja</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded" />
                  <span>Milho</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded" />
                  <span>Solo Tipo 3 (Argiloso)</span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORICAL DECISIONS DATABASE TABLE */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Histórico Multissafra de Decisões</h3>
                <p className="text-[11px] text-slate-400">Rastreabilidade completa de plantios passados, produtividades e eventos de sinistro</p>
              </div>
              <button
                onClick={() => setShowHistoryForm(!showHistoryForm)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Histórico</span>
              </button>
            </div>

            {showHistoryForm && (
              <form onSubmit={handleAddHistory} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs space-y-3 animate-fade-in bg-slate-50 dark:bg-zinc-950/40">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold">Talhão</label>
                    <select value={newHist.talhaoId} onChange={e => setNewHist({...newHist, talhaoId: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium">
                      {talhoesData.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold">Cultura</label>
                    <input type="text" value={newHist.cultura} onChange={e => setNewHist({...newHist, cultura: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold">Safra</label>
                    <input type="text" placeholder="2025/2026" value={newHist.safra} onChange={e => setNewHist({...newHist, safra: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold">Produtividade (sc/ha)</label>
                    <input type="number" value={newHist.produtividade} onChange={e => setNewHist({...newHist, produtividade: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold">Data Plantio</label>
                    <input type="text" placeholder="dd/mm/aaaa" value={newHist.plantio} onChange={e => setNewHist({...newHist, plantio: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Eventos / Veranicos</label>
                  <input type="text" placeholder="ex: 10 dias seca" value={newHist.eventos} onChange={e => setNewHist({...newHist, eventos: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 font-medium" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowHistoryForm(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg font-bold">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Salvar</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto text-xs border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-left font-black text-slate-500">
                    <th className="p-3">Talhão</th>
                    <th className="p-3">Cultura</th>
                    <th className="p-3">Safra</th>
                    <th className="p-3">Plantio/Colheita</th>
                    <th className="p-3 text-center">Produtividade</th>
                    <th className="p-3">Clima / Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {historicoTalhao.map(h => {
                    const talObj = talhoesData.find(t => t.id === h.talhaoId) || { nome: 'N/A' };
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                        <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">{talObj.nome}</td>
                        <td className="p-3 font-medium">{h.cultura}</td>
                        <td className="p-3"><span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">{h.safra}</span></td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">{h.plantio} → {h.colheita}</td>
                        <td className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400">{h.produtividade} sc/ha</td>
                        <td className="p-3 text-slate-500 dark:text-zinc-400 max-w-xs truncate" title={h.eventos + ' | ' + h.obs}>
                          {h.eventos ? `⚠️ ${h.eventos}` : '🟢 Sem intercorrências'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. ANÁLISE DE RISCO CLIMÁTICO */}
      {activeSubTab === 'analise_risco' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risco Hidrico */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-800 dark:text-white">Risco Hídrico (Secas)</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Avaliação de déficits hídricos prováveis com base na curva de sensibilidade ao florescimento e enchimento de grãos.
              </p>
              
              <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 border border-slate-200/40 rounded-2xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span>Sensibilidade ao Florescimento:</span>
                  <span className="font-bold text-red-500">MUITO ALTA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Veranico Histórico Máximo:</span>
                  <span className="font-mono font-bold">14 dias (Média 15 anos)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Demanda de Água Acumulada:</span>
                  <span className="font-mono font-bold">480mm a 650mm</span>
                </div>
              </div>
            </div>

            {/* Risco Termico */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Thermometer className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-800 dark:text-white">Risco Térmico</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Monitoramento de temperaturas críticas, risco de geadas na fase de espigamento ou abortamento floral por calor excessivo.
              </p>

              <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 border border-slate-200/40 rounded-2xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span>Limite Mínimo Crítico:</span>
                  <span className="font-mono font-bold">12°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Limite Máximo Crítico:</span>
                  <span className="font-mono font-bold">36°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risco de Abortamento de Flores:</span>
                  <span className="font-bold text-amber-500">Médio (15% histórico)</span>
                </div>
              </div>
            </div>

            {/* Excesso Hidrico */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
                  <CloudSun className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-800 dark:text-white">Excesso Hídrico</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Avaliação de chuvas excessivas na fase final de maturação e colheita, que causam apodrecimento e perda de qualidade comercial.
              </p>

              <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 border border-slate-200/40 rounded-2xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span>Fase Crítica de Maturação:</span>
                  <span className="font-bold text-red-500">Janeiro / Fevereiro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Precipitação Máxima 3 dias:</span>
                  <span className="font-mono font-bold">120mm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capacidade Drenagem Solo:</span>
                  <span className="font-bold text-emerald-500">Excelente (Argiloso estruturado)</span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORICAL CLIMATE TREND CHART */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Tendência Histórica de Chuva vs Demanda Hídrica Soja (30 anos)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Out/1', chuva: 25, demanda: 15 },
                  { name: 'Out/2', chuva: 45, demanda: 20 },
                  { name: 'Out/3', chuva: 75, demanda: 35 },
                  { name: 'Nov/1', chuva: 120, demanda: 50 },
                  { name: 'Nov/2', chuva: 145, demanda: 75 },
                  { name: 'Nov/3', chuva: 95, demanda: 110 },
                  { name: 'Dez/1', chuva: 110, demanda: 130 },
                  { name: 'Dez/2', chuva: 160, demanda: 95 },
                  { name: 'Dez/3', chuva: 180, demanda: 50 }
                ]}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} unit="mm" />
                  <ChartTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="chuva" name="Média Histórica Chuvas (mm)" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" />
                  <Area type="monotone" dataKey="demanda" name="Consumo Hídrico Soja (mm)" stroke="#ef4444" fill="rgba(239, 68, 68, 0.05)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SIMULADOR E PLANEJAMENTO */}
      {activeSubTab === 'simulador' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Simulator Settings */}
          <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Simulador de Janelas &amp; Cenários</h3>
              <p className="text-[11px] text-slate-400">Varie as combinações de época, solo e cultura para estimar o risco final</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-500">Cultura</label>
                <select value={simCultura} onChange={e => setSimCultura(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold cursor-pointer">
                  {CULTURE_BANK.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-500">Grupo Solo</label>
                  <select value={simSolo} onChange={e => setSimSolo(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold cursor-pointer">
                    <option value="Tipo 1">Tipo 1 (Arenoso)</option>
                    <option value="Tipo 2">Tipo 2 (Médio)</option>
                    <option value="Tipo 3">Tipo 3 (Argiloso)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-500">Grupo Cultivar</label>
                  <select value={simGrupo} onChange={e => setSimGrupo(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold cursor-pointer">
                    <option value="Grupo I (Precoce)">Precoce</option>
                    <option value="Grupo II (Médio)">Médio</option>
                    <option value="Grupo III (Tardio)">Tardio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500">Época Planejada Plantio</label>
                <select value={simDataPlantio} onChange={e => setSimDataPlantio(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold cursor-pointer">
                  <option value="15/10/2026">Outubro (2º decêndio)</option>
                  <option value="30/10/2026">Outubro (3º decêndio)</option>
                  <option value="10/11/2026">Novembro (1º decêndio)</option>
                  <option value="20/11/2026">Novembro (2º decêndio)</option>
                  <option value="05/12/2026">Dezembro (1º decêndio)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="simIrrigado" checked={simIrrigado} onChange={e => setSimIrrigado(e.target.checked)} className="w-4 h-4 cursor-pointer accent-emerald-600" />
                <label htmlFor="simIrrigado" className="font-bold text-slate-600 dark:text-zinc-300 cursor-pointer select-none">Possui irrigação ativa?</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRunSimulation}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition cursor-pointer text-center"
                >
                  Simular Risco
                </button>
                <button
                  onClick={handleSaveScenario}
                  disabled={!simResult}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-black rounded-xl transition cursor-pointer text-center dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Salvar Cenário
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output */}
          <div className="md:col-span-2 space-y-6">
            {simResult ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Resultado do Cenário Simulado</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Risk gauge representation */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/40 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Risco Médio Estimado</span>
                    <span className={`text-3xl font-black ${
                      simResult.risco < 20 ? 'text-emerald-500' : simResult.risco < 40 ? 'text-amber-500' : 'text-red-500'
                    }`}>{simResult.risco}%</span>
                    <span className="text-[10px] bg-slate-150 px-2 py-0.5 rounded font-black">{simResult.status}</span>
                  </div>

                  {/* Estimated potential yield */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/40 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Potencial Produtividade</span>
                    <span className="text-3xl font-black text-blue-500">{Math.round(simResult.produtividade)} sc/ha</span>
                    <span className="text-[10px] text-slate-400">Baseado em manejo ótimo</span>
                  </div>

                  {/* Climate suitability rating */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/40 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Adequação ao Solo</span>
                    <span className="text-3xl font-black text-emerald-500">92%</span>
                    <span className="text-[10px] text-slate-400">Adequado para Tipo {simSolo.split(' ')[1]}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs rounded-2xl leading-relaxed">
                  <strong>Recomendação Técnica GeaAgro:</strong> O plantio em {simDataPlantio} possui segurança hídrica devido ao teor de argila do solo Tipo {simSolo.split(' ')[1]}. Prossiga com o planejamento de compra de sementes e insumos.
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-slate-400 dark:text-zinc-500 shadow-2xs flex flex-col items-center justify-center space-y-3">
                <Sliders className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-bold">Aguardando Parâmetros de Simulação</p>
                <p className="text-xs max-w-sm">Insira os dados cadastrais no simulador à esquerda para projetar cenários e estimar produtividade com risco hídrico.</p>
              </div>
            )}

            {/* Saved Scenarios List */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Cenários de Planejamento Salvos</h3>
              {scenarios.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {scenarios.map(s => (
                    <div key={s.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-2">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{s.nome}</span>
                        <span className="block text-[10px] text-slate-400">Risco: {s.riscoMedio}% | Cultivar: {s.grupo}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-emerald-600 dark:text-emerald-400">{s.produtividadeEstimada} sc/ha</span>
                        <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-black text-slate-500 dark:text-zinc-400">{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Nenhum cenário salvo ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. RELATÓRIOS, ALERTAS E HISTÓRICO */}
      {activeSubTab === 'historico_alertas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical PDF Reports Generator */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Gerador de Relatórios Técnicos Oficiais</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Exporte laudos detalhados no formato PDF unificando dados oficiais do ZARC aos dados de solo laboratoriais da propriedade e análises complementares do GeaAgro.
              </p>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-500">Selecione o Cenário de Planejamento</label>
                  <select
                    value={selectedScenarioForReport}
                    onChange={e => setSelectedScenarioForReport(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 font-bold cursor-pointer"
                  >
                    <option value="">-- Escolher um cenário --</option>
                    {scenarios.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={triggerPDFExport}
                  disabled={isReportGenerating || !selectedScenarioForReport}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isReportGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gerando PDF Laudo Técnico...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Gerar Relatório Técnico</span>
                    </>
                  )}
                </button>

                {reportSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 text-emerald-800 dark:text-emerald-400 rounded-xl text-center font-bold animate-fade-in">
                    ✓ PDF de Laudo do ZARC exportado e salvo na pasta de downloads!
                  </div>
                )}
              </div>
            </div>

            {/* Alert Configuration */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Configuração de Alertas do Produtor</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Defina alertas e regras de notificação push no celular (PWA) para evitar esquecer os prazos oficiais de encerramento de plantio regulados pelo ZARC.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <span className="block font-black">Notificação Fechamento de Janela</span>
                    <span className="text-[10px] text-slate-400">Avisar 5 dias antes de encerrar o ZARC</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <span className="block font-black">Previsão de Temperatura Extrema</span>
                    <span className="text-[10px] text-slate-400">Avisar caso ocorram temperaturas críticas</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <span className="block font-black">Atualização Automática Portarias</span>
                    <span className="text-[10px] text-slate-400">Atualizar tabelas offline via Wi-Fi</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZarcRiscoModule;
