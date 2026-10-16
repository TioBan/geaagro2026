import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  TrendingUp,
  Droplets,
  Leaf,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  WifiOff,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Activity,
  Layers,
  Scale,
  Zap,
  Info,
  Check,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  Maximize2,
  Bug,
  X
} from 'lucide-react';
import { Farm, SoilSample, LeafSample } from '../types/agronomy';
import { FOLIAR_SUFFICIENCY_RANGES, interpretNutrient, calculateRatios } from '../data/foliarData';

interface AIFarmScoreWidgetProps {
  farm: Farm;
  soilSamples: SoilSample[];
  leafSamples?: LeafSample[];
}

export type ExpandedCardType = 'score' | 'productivity' | 'soil' | 'foliar' | 'nematode' | 'water' | null;

interface ScoreBreakdown {
  overallScore: number;
  scoreLabel: string;
  statusColor: string;
  statusBg: string;
  precisionLevel: 'Máxima (Solo + Folha)' | 'Média (Apenas Solo)' | 'Preliminar (Sem Análises)';
  precisionPercent: number;
  
  // Pillars
  soilScore: number;
  foliarScore: number;
  nematodeScore: number;
  synchronyScore: number;

  // Diagnostics
  productivity: string;
  productivityDetails: string[];
  
  soilManagement: string;
  soilDetails: string[];
  
  foliarManagement: string;
  foliarDetails: string[];
  foliarNutrientsStatus: Array<{
    nutrient: string;
    value: number;
    unit: string;
    status: 'Muito Baixo' | 'Baixo' | 'Adequado' | 'Alto' | 'Muito Alto';
    role: string;
  }>;
  foliarRatios: {
    NP: number;
    NK: number;
    CaMg: number;
    KMg: number;
  };
  
  waterManagement: string;
  waterDetails: string[];
  
  correlations: string[];
}

export const NemaIaLogoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nemaLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="160 50" opacity="0.85" />
    <path d="M50 18C30 35 32 65 50 82C68 65 70 35 50 18Z" fill="url(#nemaLogoGrad)" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill="white" />
    <line x1="50" y1="50" x2="35" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="65" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="50" y2="72" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <circle cx="35" cy="35" r="4" fill="white" />
    <circle cx="65" cy="35" r="4" fill="white" />
    <circle cx="50" cy="72" r="4" fill="white" />
    <path d="M78 22L76 26L72 27L76 28L78 32L79 28L83 27L79 26L78 22Z" fill="white" />
  </svg>
);

export const AIFarmScoreWidget: React.FC<AIFarmScoreWidgetProps> = ({
  farm,
  soilSamples,
  leafSamples = []
}) => {
  const [loading, setLoading] = useState(true);
  const [forceOffline, setForceOffline] = useState(() => {
    try {
      const saved = localStorage.getItem('nema_score_force_offline');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [expandedCard, setExpandedCard] = useState<ExpandedCardType>(null);
  const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);

  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedCard && detailsRef.current) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [expandedCard]);

  useEffect(() => {
    try {
      localStorage.setItem('nema_score_force_offline', String(forceOffline));
    } catch (e) {
      // ignore
    }
  }, [forceOffline]);

  // Filter samples for current farm
  const currentFarmSoilSamples = useMemo(() => {
    if (!farm?.id) return [];
    return (soilSamples || []).filter(s => s?.farmId === farm.id);
  }, [soilSamples, farm?.id]);

  const currentFarmLeafSamples = useMemo(() => {
    if (!farm?.id) return [];
    return (leafSamples || []).filter(l => l?.farmId === farm.id);
  }, [leafSamples, farm?.id]);

  // Robust Agronomic Calculation integrating Soil + Foliar Analysis
  const calculateIntegratedOfflineScore = (
    soilList: SoilSample[],
    leafList: LeafSample[],
    currentFarm: Farm
  ): ScoreBreakdown => {
    const hasSoil = (soilList || []).length > 0;
    const hasLeaf = (leafList || []).length > 0;

    // Default when no data at all
    if (!hasSoil && !hasLeaf) {
      return {
        overallScore: 50,
        scoreLabel: 'Regular',
        statusColor: 'text-amber-500 border-amber-200 dark:border-amber-800',
        statusBg: 'bg-amber-50 dark:bg-amber-950/30',
        precisionLevel: 'Preliminar (Sem Análises)',
        precisionPercent: 35,
        soilScore: 50,
        foliarScore: 50,
        nematodeScore: 85,
        synchronyScore: 50,
        productivity: 'Dados insuficientes. Importe análises de solo e folha para calibrar o potencial produtivo da safra.',
        productivityDetails: [
          'Amostragem de solo de 0-20 cm e 20-40 cm necessária para recomendação de calagem e gessagem.',
          'Amostragem foliar no início do florescimento (R1-R2 ou V4-V6) para auditoria nutricional em tempo real.'
        ],
        soilManagement: 'Mapeie a fertilidade química e a biologia (BioAS) dos talhões prioritários.',
        soilDetails: ['Sem laudos químicos recentes cadastrados no sistema.'],
        foliarManagement: 'Cadastre a diagnose foliar para avaliar deficiências ocultas de micro e macronutrientes.',
        foliarDetails: ['Aguardando laudos laboratoriais de folhas.'],
        foliarNutrientsStatus: [],
        foliarRatios: { NP: 0, NK: 0, CaMg: 0, KMg: 0 },
        waterManagement: 'Monitore o histórico de precipitação e a textura do solo dos talhões.',
        waterDetails: ['Implemente pluviômetros e monitore a palhada para mitigar veranicos.'],
        correlations: ['Sem dados para correlacionar solo e nutrição foliar.']
      };
    }

    // 1. SOIL SCORE CALCULATION
    let totalSoilScore = 0;
    let soilIssues = {
      acidity: false,
      lowV: false,
      lowP: false,
      lowK: false,
      lowMO: false,
      highAl: false,
      lowS: false,
      lowMicros: false,
    };
    const soilNotes: string[] = [];

    if (hasSoil) {
      soilList.forEach(s => {
        let sScore = 100;
        
        // V% (Base Saturation)
        const v = s.vPercent ?? 0;
        if (v < 45) { sScore -= 25; soilIssues.lowV = true; soilIssues.acidity = true; }
        else if (v < 60) { sScore -= 12; soilIssues.lowV = true; }
        else if (v > 75) { sScore -= 5; } // Too high base saturation
        
        // Al toxicity
        const al = s.alCmolcDm3 ?? 0;
        if (al > 0.5) { sScore -= 20; soilIssues.highAl = true; }
        else if (al > 0.2) { sScore -= 10; }
        
        // Phosphorus
        const p = s.pResinaMgDm3 || s.pMehlich1MgDm3 || 0;
        if (p < 8) { sScore -= 18; soilIssues.lowP = true; }
        else if (p < 18) { sScore -= 8; }
        
        // Potassium
        const k = s.kCmolcDm3 ?? 0;
        if (k < 0.12) { sScore -= 15; soilIssues.lowK = true; }
        else if (k < 0.22) { sScore -= 5; }
        
        // Organic Matter
        const mo = s.organicMatterGdm3 ?? 0;
        if (mo < 15) { sScore -= 15; soilIssues.lowMO = true; }
        else if (mo > 30) { sScore += 5; } // Bonus for high OM

        // Sulfur
        const sVal = s.sSO4MgDm3 ?? 0;
        if (sVal < 5 && sVal > 0) { sScore -= 8; soilIssues.lowS = true; }

        totalSoilScore += Math.max(10, Math.min(100, sScore));
      });
      totalSoilScore = Math.round(totalSoilScore / (soilList.length || 1));
    } else {
      totalSoilScore = 60; // Neutral fallback
    }

    if (soilIssues.highAl || soilIssues.acidity) {
      soilNotes.push('Acidez ativa e toxidez por Alumínio (Al³⁺) detectadas. Priorize calagem com calcário dolomítico.');
    }
    if (soilIssues.lowP) {
      soilNotes.push('Fósforo em nível limitante no solo. Necessária adubação fosfatada corretiva ou no sulco.');
    }
    if (soilIssues.lowK) {
      soilNotes.push('Potássio baixo no solo. Risco para enchimento de grãos e tolerância à seca.');
    }
    if (soilIssues.lowMO) {
      soilNotes.push('Matéria Orgânica crítica (< 15 g/dm³). É urgente a inserção de plantas de cobertura (Brachiaria/Crotalária).');
    }
    if (soilNotes.length === 0) {
      soilNotes.push('Perfil de solo equilibrado com fertilidade química construída e boa capacidade de troca catiônica (CTC).');
    }

    // 2. FOLIAR SCORE CALCULATION (Diagnose Foliar)
    let totalFoliarScore = 0;
    const foliarNotes: string[] = [];
    const foliarNutrientsStatus: ScoreBreakdown['foliarNutrientsStatus'] = [];
    let foliarRatios = { NP: 0, NK: 0, CaMg: 0, KMg: 0 };
    let foliarIssues = {
      lowN: false,
      lowP: false,
      lowK: false,
      lowCa: false,
      lowMg: false,
      lowS: false,
      lowB: false,
      lowZn: false,
      unbalancedNK: false,
      unbalancedCaMg: false,
    };

    if (hasLeaf) {
      leafList.forEach(l => {
        let fScore = 100;
        const crop = l.crop || 'Soja';
        const stage = l.growthStage || 'R1 - R2 (Início do florescimento)';

        // Map values
        const n = l.n_g_kg ?? (l as any).results?.N ?? 0;
        const p = l.p_g_kg ?? (l as any).results?.P ?? 0;
        const k = l.k_g_kg ?? (l as any).results?.K ?? 0;
        const ca = l.ca_g_kg ?? (l as any).results?.Ca ?? 0;
        const mg = l.mg_g_kg ?? (l as any).results?.Mg ?? 0;
        const s = l.s_g_kg ?? (l as any).results?.S ?? 0;

        const b = l.b_mg_kg ?? (l as any).results?.B ?? 0;
        const zn = l.zn_mg_kg ?? (l as any).results?.Zn ?? 0;
        const cu = l.cu_mg_kg ?? (l as any).results?.Cu ?? 0;
        const fe = l.fe_mg_kg ?? (l as any).results?.Fe ?? 0;
        const mn = l.mn_mg_kg ?? (l as any).results?.Mn ?? 0;
        const mo = (l as any).results?.Mo ?? 0.8;

        // Interpret individual elements
        const statusN = interpretNutrient(n, 'N', 'macros', crop, stage);
        const statusP = interpretNutrient(p, 'P', 'macros', crop, stage);
        const statusK = interpretNutrient(k, 'K', 'macros', crop, stage);
        const statusCa = interpretNutrient(ca, 'Ca', 'macros', crop, stage);
        const statusMg = interpretNutrient(mg, 'Mg', 'macros', crop, stage);
        const statusS = interpretNutrient(s, 'S', 'macros', crop, stage);

        const statusB = interpretNutrient(b, 'B', 'micros', crop, stage);
        const statusZn = interpretNutrient(zn, 'Zn', 'micros', crop, stage);
        const statusCu = interpretNutrient(cu, 'Cu', 'micros', crop, stage);
        const statusMn = interpretNutrient(mn, 'Mn', 'micros', crop, stage);
        const statusFe = interpretNutrient(fe, 'Fe', 'micros', crop, stage);

        // Deductions
        if (statusN === 'Muito Baixo' || statusN === 'Baixo') { fScore -= 15; foliarIssues.lowN = true; }
        if (statusP === 'Muito Baixo' || statusP === 'Baixo') { fScore -= 15; foliarIssues.lowP = true; }
        if (statusK === 'Muito Baixo' || statusK === 'Baixo') { fScore -= 18; foliarIssues.lowK = true; }
        if (statusCa === 'Muito Baixo' || statusCa === 'Baixo') { fScore -= 10; foliarIssues.lowCa = true; }
        if (statusMg === 'Muito Baixo' || statusMg === 'Baixo') { fScore -= 10; foliarIssues.lowMg = true; }
        if (statusS === 'Muito Baixo' || statusS === 'Baixo') { fScore -= 8; foliarIssues.lowS = true; }

        if (statusB === 'Muito Baixo' || statusB === 'Baixo') { fScore -= 12; foliarIssues.lowB = true; }
        if (statusZn === 'Muito Baixo' || statusZn === 'Baixo') { fScore -= 10; foliarIssues.lowZn = true; }
        if (statusCu === 'Muito Baixo' || statusCu === 'Baixo') { fScore -= 6; }
        if (statusMn === 'Muito Baixo' || statusMn === 'Baixo') { fScore -= 6; }

        // Ratios
        const ratios = calculateRatios({ N: n, P: p, K: k, Ca: ca, Mg: mg, S: s, B: b, Zn: zn, Cu: cu, Fe: fe, Mn: mn, Mo: mo });
        foliarRatios = ratios;

        // Ratio checks (Soja reference: N/K around 2.8 - 3.2, Ca/Mg around 2.0 - 3.0)
        if (ratios.NK > 3.8 || ratios.NK < 2.0) {
          fScore -= 8;
          foliarIssues.unbalancedNK = true;
        }
        if (ratios.CaMg > 4.0 || (ratios.CaMg < 1.4 && ratios.CaMg > 0)) {
          fScore -= 6;
          foliarIssues.unbalancedCaMg = true;
        }

        totalFoliarScore += Math.max(15, Math.min(100, fScore));

        // Save status list from the most representative sample
        if (foliarNutrientsStatus.length === 0) {
          foliarNutrientsStatus.push(
            { nutrient: 'Nitrogênio (N)', value: n, unit: 'g/kg', status: statusN, role: 'Clorofila, fotossíntese e vigor vegetativo' },
            { nutrient: 'Fósforo (P)', value: p, unit: 'g/kg', status: statusP, role: 'Transferência de energia ATP e enraizamento' },
            { nutrient: 'Potássio (K)', value: k, unit: 'g/kg', status: statusK, role: 'Regulação estomática e enchimento de grãos' },
            { nutrient: 'Cálcio (Ca)', value: ca, unit: 'g/kg', status: statusCa, role: 'Estrutura da parede celular e crescimento radicular' },
            { nutrient: 'Magnésio (Mg)', value: mg, unit: 'g/kg', status: statusMg, role: 'Átomo central da molécula de clorofila' },
            { nutrient: 'Enxofre (S)', value: s, unit: 'g/kg', status: statusS, role: 'Aminoácidos sulfurados e síntese proteica' },
            { nutrient: 'Boro (B)', value: b, unit: 'mg/kg', status: statusB, role: 'Pegamento floral e translocação de açúcares' },
            { nutrient: 'Zinco (Zn)', value: zn, unit: 'mg/kg', status: statusZn, role: 'Síntese de triptofano e hormônio auxina' },
            { nutrient: 'Manganês (Mn)', value: mn, unit: 'mg/kg', status: statusMn, role: 'Fotólise da água na fotossíntese' },
            { nutrient: 'Cobre (Cu)', value: cu, unit: 'mg/kg', status: statusCu, role: 'Lignificação e imunidade celular da planta' }
          );
        }
      });

      totalFoliarScore = Math.round(totalFoliarScore / (leafList.length || 1));
    } else {
      totalFoliarScore = 70; // Default estimate
    }

    if (foliarIssues.lowK) {
      foliarNotes.push('Potássio foliar abaixo da faixa ideal. Aplicação foliar com fontes quelatadas (Acetato/Citrato de K) em R1-R3 é altamente recomendada.');
    }
    if (foliarIssues.lowB) {
      foliarNotes.push('Boro foliar deficitário (< 25 mg/kg). Risco de abortamento floral e menor fertilidade do pólen. Recomenda-se pulverização de Ácido Bórico ou Octaborato.');
    }
    if (foliarIssues.lowZn) {
      foliarNotes.push('Zinco foliar baixo. Afeta o alongamento de entrenós e síntese de auxinas.');
    }
    if (foliarIssues.unbalancedNK) {
      foliarNotes.push(`Relação N/K foliar desequilibrada (${foliarRatios.NK.toFixed(1)}). Excesso relativo de N frente a K atrai pragas mastigadoras e reduz enchimento.`);
    }
    if (foliarNotes.length === 0) {
      foliarNotes.push('Teores de macro e micronutrientes foliares em harmonia com as faixas de suficiência padrão Embrapa/IAC.');
    }

    // 3. SYNCHRONY & CORRELATIONS (Soil x Leaf)
    const correlations: string[] = [];
    let synchronyScore = 90;

    if (hasSoil && hasLeaf && (soilList?.length || 0) > 0 && (leafList?.length || 0) > 0) {
      const avgSoilK = (soilList.reduce((acc, s) => acc + (s.kCmolcDm3 || 0), 0)) / (soilList.length || 1);
      const avgLeafK = (leafList.reduce((acc, l) => acc + (l.n_g_kg ? (l.k_g_kg || 0) : ((l as any).results?.K || 0)), 0)) / (leafList.length || 1);

      if (avgSoilK >= 0.25 && avgLeafK < 17) {
        correlations.push('Atenção: O solo apresenta Potássio bom/alto, porém a planta acusa restrição de absorção foliar. Pode indicar compactação de solo, estresse hídrico ou antagonismo com Ca/Mg.');
        synchronyScore -= 15;
      } else if (avgSoilK < 0.15 && avgLeafK >= 18) {
        correlations.push('A folha mantém bom teor de K temporário, mas o solo está esgotado. A planta consumirá reservas rapidamente no enchimento de grãos.');
        synchronyScore -= 10;
      } else {
        correlations.push('Sinergismo Solo x Planta validado: Disponibilidade no solo reflete diretamente na absorção foliar sem bloqueios de raiz.');
      }

      if (soilIssues.highAl && foliarIssues.lowCa) {
        correlations.push('O Alumínio tóxico no solo está bloqueando o aprofundamento de raízes e a absorção de Cálcio/Boro na parte aérea.');
        synchronyScore -= 15;
      }
    } else if (hasSoil && !hasLeaf) {
      correlations.push('Recomendação Nema IA: Cadastre laudos de análise foliar para desbloquear o cálculo de sincronismo e atingir precisão de 98%.');
    } else {
      correlations.push('Aguardando dados completos de solo e folha para gerar matriz de correlação.');
    }

    // 4. OVERALL SCORE INTEGRATION
    let overallScore = 0;
    let precisionLevel: ScoreBreakdown['precisionLevel'] = 'Média (Apenas Solo)';
    let precisionPercent = 65;

    if (hasSoil && hasLeaf) {
      // 45% Soil + 45% Foliar + 10% Synchrony
      overallScore = Math.round(totalSoilScore * 0.45 + totalFoliarScore * 0.45 + synchronyScore * 0.10);
      precisionLevel = 'Máxima (Solo + Folha)';
      precisionPercent = 98;
    } else if (hasSoil) {
      overallScore = totalSoilScore;
      precisionLevel = 'Média (Apenas Solo)';
      precisionPercent = 68;
    } else if (hasLeaf) {
      overallScore = totalFoliarScore;
      precisionLevel = 'Média (Apenas Solo)';
      precisionPercent = 62;
    }

    overallScore = Math.max(0, Math.min(100, overallScore));

    // Label & Colors
    let scoreLabel = 'Bom';
    let statusColor = 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    let statusBg = 'bg-emerald-50 dark:bg-emerald-950/40';

    if (overallScore >= 80) {
      scoreLabel = 'Excelente';
    } else if (overallScore >= 60) {
      scoreLabel = 'Bom';
      statusColor = 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      statusBg = 'bg-blue-50 dark:bg-blue-950/40';
    } else if (overallScore >= 45) {
      scoreLabel = 'Regular';
      statusColor = 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      statusBg = 'bg-amber-50 dark:bg-amber-950/40';
    } else {
      scoreLabel = 'Crítico';
      statusColor = 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      statusBg = 'bg-rose-50 dark:bg-rose-950/40';
    }

    // Texts
    let prodText = 'Potencial produtivo alto. O equilíbrio entre solo e folha sustenta tetos elevados com foco em proteção fitossanitária.';
    if (foliarIssues.lowK || soilIssues.lowK) {
      prodText = 'Restrição de Potássio (solo e/ou folha) pode limitar o peso de grãos/frutos. Reforce a adubação potássica e aplicações foliares nos estádios reprodutivos.';
    } else if (soilIssues.lowP || foliarIssues.lowP) {
      prodText = 'Fósforo é o principal fator limitante para o arranque inicial e desenvolvimento de raízes da cultura.';
    } else if (foliarIssues.lowB || foliarIssues.lowZn) {
      prodText = 'Micronutrientes foliares (Boro/Zinco) estão limitando a taxa fotossintética e pegamento de flores.';
    }

    let soilText = soilNotes[0] || 'Perfil de solo com fertilidade construída.';
    let foliarText = foliarNotes[0] || 'Nutrição foliar com macronutrientes e micronutrientes em faixas satisfatórias.';
    
    let waterText = 'Armazenamento hídrico do solo e osmorregulação foliar adequados para suportar curtos veranicos.';
    if (soilIssues.lowMO) {
      waterText = 'Baixa retenção de água devido à pouca Matéria Orgânica no solo. Alto risco de perda por estresse hídrico em veranicos.';
    } else if (foliarIssues.lowK) {
      waterText = 'Atenção: O Potássio foliar baixo prejudica o fechamento estomático, aumentando a perda de água por transpiração da planta.';
    }

    return {
      overallScore,
      scoreLabel,
      statusColor,
      statusBg,
      precisionLevel,
      precisionPercent,
      soilScore: totalSoilScore,
      foliarScore: totalFoliarScore,
      nematodeScore: 85,
      synchronyScore,
      productivity: prodText,
      productivityDetails: [
        prodText,
        `Teto produtivo estimado condicionado pelo fator mais limitante da Lei do Mínimo de Liebig.`,
        `Sincronismo Solo x Folha: ${synchronyScore}/100.`
      ],
      soilManagement: soilText,
      soilDetails: soilNotes,
      foliarManagement: foliarText,
      foliarDetails: foliarNotes,
      foliarNutrientsStatus,
      foliarRatios,
      waterManagement: waterText,
      waterDetails: [
        waterText,
        `Capacidade de Retenção de Água (CAD): Dependente do teor de argila e Matéria Orgânica.`,
        `Regulação Estomática Foliar: Potássio atua na abertura e fechamento das células-guarda.`
      ],
      correlations
    };
  };

  const analyzeFarm = async () => {
    setLoading(true);
    setIsOfflineMode(false);

    // If forced offline or offline browser mode
    if (forceOffline || !navigator.onLine) {
      setIsOfflineMode(true);
      const offlineCalc = calculateIntegratedOfflineScore(
        currentFarmSoilSamples,
        currentFarmLeafSamples,
        farm
      );
      setScoreData(offlineCalc);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/nema-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: farm.name,
          domain: 'Solo & Nutrição',
          samples: currentFarmSoilSamples,
          foliarSamples: currentFarmLeafSamples,
          leafSamples: currentFarmLeafSamples,
          userPrompt: `Realize uma avaliação integrada 360° da fazenda com base nos laudos de SOLO e laudos de ANÁLISE FOLIAR.
Foque em:
1. Nema IA Score Integrado de Alta Precisão (combinando fertilidade de solo + diagnose nutricional foliar).
2. Resumo Executivo e classificação de risco.
3. Relação solo x planta (sinergismo ou restrições de absorção).
4. Recomendações de produtividade, manejo de solo, nutrição/adubação foliar e resiliência hídrica.`
        })
      });

      if (!response.ok) throw new Error('API offline/error');
      const { data } = await response.json();

      const calculatedScore = Math.max(0, Math.min(100, 100 - (data.riskScorePercentage || 25)));
      
      // Calculate local baseline for precise breakdowns
      const localBase = calculateIntegratedOfflineScore(
        currentFarmSoilSamples,
        currentFarmLeafSamples,
        farm
      );

      let label = 'Bom';
      let color = 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      let bg = 'bg-emerald-50 dark:bg-emerald-950/40';

      if (calculatedScore >= 80) {
        label = 'Excelente';
      } else if (calculatedScore >= 60) {
        label = 'Bom';
        color = 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        bg = 'bg-blue-50 dark:bg-blue-950/40';
      } else if (calculatedScore >= 45) {
        label = 'Regular';
        color = 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        bg = 'bg-amber-50 dark:bg-amber-950/40';
      } else {
        label = 'Crítico';
        color = 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
        bg = 'bg-rose-50 dark:bg-rose-950/40';
      }

      const foliarDiag = data.foliarDiagnosisAndBalance;

      setScoreData({
        overallScore: calculatedScore,
        scoreLabel: label,
        statusColor: color,
        statusBg: bg,
        precisionLevel: (currentFarmLeafSamples || []).length > 0 ? 'Máxima (Solo + Folha)' : 'Média (Apenas Solo)',
        precisionPercent: (currentFarmLeafSamples || []).length > 0 ? 98 : 68,
        soilScore: localBase.soilScore,
        foliarScore: localBase.foliarScore,
        nematodeScore: localBase.nematodeScore || 85,
        synchronyScore: localBase.synchronyScore,
        productivity: data.actionChecklist?.[0] || localBase.productivity,
        productivityDetails: [
          data.actionChecklist?.[0] || localBase.productivity,
          data.damageThresholdAssessment || 'Equilíbrio nutricional garante alta conversão de radiação solar em biomassa e grãos.',
          data.executiveSummary || 'Auditoria técnica gerada pela Nema IA.'
        ],
        soilManagement: data.soilHealthAndBioASRecommendations?.[0] || localBase.soilManagement,
        soilDetails: data.soilHealthAndBioASRecommendations || localBase.soilDetails,
        foliarManagement: foliarDiag?.foliarSprayRecommendation || foliarDiag?.nutritionalStatusSummary || localBase.foliarManagement,
        foliarDetails: foliarDiag?.limitingNutrients?.length 
          ? [`Nutrientes em foco: ${foliarDiag.limitingNutrients.join(', ')}`, foliarDiag.foliarSprayRecommendation, foliarDiag.soilPlantSynchrony]
          : localBase.foliarDetails,
        foliarNutrientsStatus: localBase.foliarNutrientsStatus,
        foliarRatios: localBase.foliarRatios,
        waterManagement: data.actionChecklist?.[1] || localBase.waterManagement,
        waterDetails: [
          data.actionChecklist?.[1] || localBase.waterManagement,
          'Monitoramento de déficit de pressão de vapor (DPV) e condutância estomática.',
          'Manutenção de palhada orgânica para redução da temperatura superficial do solo.'
        ],
        correlations: foliarDiag?.soilPlantSynchrony ? [foliarDiag.soilPlantSynchrony, ...localBase.correlations] : localBase.correlations
      });

    } catch (err) {
      console.warn('Fallback para cálculo algorítmico local Nema IA:', err);
      setIsOfflineMode(true);
      const offlineCalc = calculateIntegratedOfflineScore(
        currentFarmSoilSamples,
        currentFarmLeafSamples,
        farm
      );
      setScoreData(offlineCalc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeFarm();
    
    const handleOnline = () => analyzeFarm();
    const handleOffline = () => analyzeFarm();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [farm?.id, soilSamples, leafSamples, forceOffline]);

  const toggleCard = (cardType: ExpandedCardType) => {
    setExpandedCard(prev => prev === cardType ? null : cardType);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 relative overflow-hidden transition-all duration-200">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 p-1.5 border border-white/10">
            <NemaIaLogoIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                Nema IA Score Integrado
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Auditoria agronômica computacional 360° • Clique nos cards abaixo para expandir e entender cada pilar
            </p>
          </div>
        </div>

        {/* Precision, Offline Toggle & Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Offline Engine Force Toggle */}
          <button
            onClick={() => setForceOffline(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
              forceOffline
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
            title="Clique para forçar o Motor de Regras Local sem internet"
          >
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${forceOffline ? 'bg-amber-500 border-amber-600' : 'bg-slate-300 dark:bg-zinc-700 border-slate-400 dark:border-zinc-600'}`}>
              {forceOffline && <Check className="w-2 text-white" style={{ strokeWidth: 4 }} />}
            </div>
            <span>Motor Local {forceOffline ? '(Habilitado)' : '(Bypass)'}</span>
          </button>

          {scoreData && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px]">
              <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Precisão:</span>
              <span className="font-bold text-slate-700 dark:text-zinc-200">{scoreData.precisionPercent}%</span>
              <span className="text-[10px] text-slate-400">({scoreData.precisionLevel})</span>
            </div>
          )}

          {isOfflineMode && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold" title="Processamento Algorítmico Local Offline">
              <WifiOff className="w-3 h-3 animate-bounce" />
              <span>Modo Local Ativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Score Box on Left + 4 Interactive Diagnostic Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        
        {/* Left Column (Cols 1-4): Main Score Card */}
        <div
          onClick={() => toggleCard('score')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('score'); }}
          className={`lg:col-span-4 rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden select-none ${
            expandedCard === 'score'
              ? 'bg-gradient-to-b from-indigo-50/80 to-indigo-100/20 dark:from-indigo-950/40 dark:to-indigo-900/10 border-indigo-400 dark:border-indigo-700/80 shadow-md ring-4 ring-indigo-500/10'
              : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-700/60 hover:bg-slate-50/50 dark:hover:bg-zinc-900 shadow-xs hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Índice Geral da Fazenda
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCard('score');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                expandedCard === 'score'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs hover:bg-indigo-700'
                  : 'bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-900/50'
              }`}
            >
              <span>{expandedCard === 'score' ? 'Recolher' : 'Expandir'}</span>
              {expandedCard === 'score' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <span className="text-xs text-slate-400">Processando matriz nutricional...</span>
            </div>
          ) : scoreData ? (
            <div className="flex flex-col items-center text-center my-auto py-2">
              <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline justify-center gap-1">
                {scoreData.overallScore}
                <span className="text-xl font-normal text-slate-400 dark:text-zinc-500">/100</span>
              </div>

              <div className={`mt-3 px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1.5 shadow-2xs ${scoreData.statusBg} ${scoreData.statusColor}`}>
                {scoreData.overallScore >= 80 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : scoreData.overallScore >= 45 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Score {scoreData.scoreLabel}</span>
              </div>

              {/* Sub-Pillars Mini Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard('soil');
                  }}
                  className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    expandedCard === 'soil'
                      ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                  title="Ver Detalhamento de Solo"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Solo</span>
                  <span className="font-mono font-black text-sm text-slate-800 dark:text-zinc-200">{scoreData.soilScore}%</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard('foliar');
                  }}
                  className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    expandedCard === 'foliar'
                      ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                  title="Ver Nutrição Foliar"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Folha</span>
                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">{scoreData.foliarScore}%</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard('nematode');
                  }}
                  className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    expandedCard === 'nematode'
                      ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                  title="Ver Sanidade Nematológica"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Nematóide</span>
                  <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">{scoreData.nematodeScore ?? 85}%</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard('score');
                  }}
                  className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    expandedCard === 'score'
                      ? 'border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/15 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900'
                  }`}
                  title="Ver Sincronia de Dados"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Sincronia</span>
                  <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">{scoreData.synchronyScore}%</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-3 flex items-center justify-center gap-1.5 font-semibold">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Toque para ver a decomposição matemática</span>
          </div>
        </div>

        {/* Right Columns (Cols 5-12): 4 Interactive Pillars Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: Produtividade */}
          <div
            onClick={() => toggleCard('productivity')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('productivity'); }}
            className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
              expandedCard === 'productivity'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50/80 dark:hover:bg-zinc-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                    Produtividade
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                  {expandedCard === 'productivity' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>

              {loading ? (
                <div className="h-10 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded my-2" />
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {scoreData?.productivity}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Potencial de Safra</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Manejo de Solo */}
          <div
            onClick={() => toggleCard('soil')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('soil'); }}
            className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
              expandedCard === 'soil'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-slate-50/80 dark:hover:bg-zinc-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                    Manejo de Solo
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  {expandedCard === 'soil' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>

              {loading ? (
                <div className="h-10 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded my-2" />
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {scoreData?.soilManagement}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Química & BioAS</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Nutrição Foliar (New Core Integration) */}
          <div
            onClick={() => toggleCard('foliar')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('foliar'); }}
            className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
              expandedCard === 'foliar'
                ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 ring-2 ring-teal-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-800 hover:bg-slate-50/80 dark:hover:bg-zinc-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                    Nutrição Foliar
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                  {expandedCard === 'foliar' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>

              {loading ? (
                <div className="h-10 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded my-2" />
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {scoreData?.foliarManagement}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Balanço & DRIS</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Manejo de Água & Estresse */}
          <div
            onClick={() => toggleCard('water')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('water'); }}
            className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
              expandedCard === 'water'
                ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-sky-300 dark:hover:border-sky-800 hover:bg-slate-50/80 dark:hover:bg-zinc-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                    Manejo de Água
                  </h4>
                </div>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                  {expandedCard === 'water' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>

              {loading ? (
                <div className="h-10 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded my-2" />
              ) : (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {scoreData?.waterManagement}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>CAD & Resiliência</span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* EXPANDED DETAILS PANEL (Interactive Explanation Section) */}
      {expandedCard && scoreData && (
        <div
          ref={detailsRef}
          className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 relative z-10 overflow-hidden animate-fade-in"
        >
          <div className="bg-slate-50 dark:bg-zinc-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 relative">
            
            {/* Header of Expanded View */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  expandedCard === 'score' ? 'bg-indigo-600 text-white' :
                  expandedCard === 'productivity' ? 'bg-indigo-600 text-white' :
                  expandedCard === 'soil' ? 'bg-emerald-600 text-white' :
                  expandedCard === 'foliar' ? 'bg-teal-600 text-white' :
                  expandedCard === 'nematode' ? 'bg-amber-600 text-white' : 'bg-sky-600 text-white'
                }`}>
                  {expandedCard === 'score' && <Sparkles className="w-4 h-4" />}
                  {expandedCard === 'productivity' && <TrendingUp className="w-4 h-4" />}
                  {expandedCard === 'soil' && <Layers className="w-4 h-4" />}
                  {expandedCard === 'foliar' && <Leaf className="w-4 h-4" />}
                  {expandedCard === 'nematode' && <Bug className="w-4 h-4" />}
                  {expandedCard === 'water' && <Droplets className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {expandedCard === 'score' && 'Detalhamento Técnico do Nema IA Score Integrado'}
                    {expandedCard === 'productivity' && 'Auditoria de Potencial Produtivo & Fatores Limitantes'}
                    {expandedCard === 'soil' && 'Diagnóstico Químico, Físico e Biológico de Solo (BioAS)'}
                    {expandedCard === 'foliar' && 'Diagnose Foliar Nutricional, DRIS & Relações Estequiométricas'}
                    {expandedCard === 'nematode' && 'Diagnóstico de Sanidade Nematológica (Nema IA Score)'}
                    {expandedCard === 'water' && 'Gestão Hídrica, Armazenamento no Solo e Osmorregulação Foliar'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Entenda como os parâmetros da sua fazenda foram ponderados e quais ações agronômicas devem ser priorizadas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandedCard(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Recolher</span>
              </button>
            </div>

            {/* EXPANDED CONTENT: 1. SCORE BREAKDOWN */}
            {expandedCard === 'score' && (
              <div className="space-y-6">
                
                {/* 3 Pillars Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase">1. Fertilidade de Solo</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{scoreData.soilScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${scoreData.soilScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Avalia acidez (pH, Al³⁺), saturação por bases (V%), teores de Fósforo (P), Potássio (K), Matéria Orgânica e enxofre no perfil 0-20 e 20-40 cm.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase">2. Diagnose Foliar</span>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-400">{scoreData.foliarScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${scoreData.foliarScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Avalia os teores de macro e micronutrientes na folha índice (N, P, K, Ca, Mg, S, B, Zn, Cu, Fe, Mn, Mo) e índices de equilíbrio DRIS.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase">3. Sincronismo Solo x Planta</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{scoreData.synchronyScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${scoreData.synchronyScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Cruza a disponibilidade química do solo com a capacidade efetiva da raiz de absorver e translocar nutrientes para as folhas.
                    </p>
                  </div>

                </div>

                {/* Correlations and Executive Explanation */}
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-500" />
                    <span>Correlações Críticas Identificadas </span>
                  </h5>
                  <div className="space-y-2.5">
                    {(scoreData.correlations || []).map((corr, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{corr}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* EXPANDED CONTENT: 2. PRODUCTIVITY */}
            {expandedCard === 'productivity' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Diretrizes para Atingir o Teto Produtivo</span>
                  </h5>
                  <div className="space-y-2">
                    {(scoreData.productivityDetails || []).map((det, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="w-5 h-5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{det}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED CONTENT: 3. SOIL MANAGEMENT */}
            {expandedCard === 'soil' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Plano de Manejo e Correção do Solo</span>
                  </h5>
                  <div className="space-y-2">
                    {(scoreData.soilDetails || []).map((det, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{det}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED CONTENT: 4. FOLIAR NUTRITION (Rich Element Breakdown) */}
            {expandedCard === 'foliar' && (
              <div className="space-y-5">
                
                {/* Summary Notes */}
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-teal-500" />
                    <span>Diagnóstico da Folha & Balanço Nutricional</span>
                  </h5>
                  <div className="space-y-2">
                    {(scoreData.foliarDetails || []).map((det, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{det}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Elements Table / Badges if present */}
                {(scoreData.foliarNutrientsStatus || []).length > 0 && (
                  <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase">
                        Auditoria de Nutrientes na Folha ({(scoreData.foliarNutrientsStatus || []).length} elementos)
                      </span>
                      {scoreData.foliarRatios.NK > 0 && (
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                          Relação N/K: <strong>{scoreData.foliarRatios.NK}</strong> | Ca/Mg: <strong>{scoreData.foliarRatios.CaMg}</strong>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                      {(scoreData.foliarNutrientsStatus || []).map((item, idx) => {
                        let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                        if (item.status === 'Muito Baixo' || item.status === 'Baixo') {
                          badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                        } else if (item.status === 'Alto' || item.status === 'Muito Alto') {
                          badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                        }

                        return (
                          <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">{item.nutrient}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${badgeColor}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 my-1">
                              <span className="text-lg font-black text-slate-900 dark:text-white">{item.value}</span>
                              <span className="text-[10px] text-slate-400">{item.unit}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                              {item.role}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* EXPANDED CONTENT: 5. WATER MANAGEMENT */}
            {expandedCard === 'water' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span>Estratégia Hídrica & Fisiologia de Estresse</span>
                  </h5>
                  <div className="space-y-2">
                    {(scoreData.waterDetails || []).map((det, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{det}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED CONTENT: 6. NEMATOLOGY / NEMA IA */}
            {expandedCard === 'nematode' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-500" />
                    <span>Diagnóstico de Sanidade Nematológica (Nema IA Score)</span>
                  </h5>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      O Nema IA Score integra amostragens de solo e raiz com a dinâmica de reprodução (FR = Pf / Pi) e suscetibilidade varietal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">Índice de Sanidade Atual: {scoreData.nematodeScore ?? 85}%</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">Pressão populacional sob controle relativo. Recomenda-se amostragem fitossanitária anual pós-colheita.</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">Manejo Biológico / Cultura:</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">Incorpore culturas antagônicas (*Crotalaria spectabilis*, *Brachiaria ruziziensis*) para reduzir fator de reprodução.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
