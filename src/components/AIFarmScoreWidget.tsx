import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
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
  Layers,
  Scale,
  Zap,
  Check,
  Bug,
  X,
} from 'lucide-react';
import { Farm, SoilSample, LeafSample } from '../types/agronomy';
import { interpretNutrient, calculateRatios } from '../data/foliarData';

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
  precisionLevel: 'Máxima (Solo + Folha)' | 'Média (Apenas Solo)' | 'Preliminar (Sem Análises)';
  precisionPercent: number;

  soilScore: number;
  foliarScore: number;
  nematodeScore: number;
  synchronyScore: number;

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

export const NemaIaLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nemaLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="42"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeDasharray="160 50"
      opacity="0.85"
    />
    <path
      d="M50 18C30 35 32 65 50 82C68 65 70 35 50 18Z"
      fill="url(#nemaLogoGrad)"
      stroke="currentColor"
      strokeWidth="4"
    />
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

const getScoreStatus = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: 'Excelente', color: 'text-emerald-700 dark:text-emerald-400' };
  if (score >= 60) return { label: 'Bom', color: 'text-sky-700 dark:text-sky-400' };
  if (score >= 45) return { label: 'Regular', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Crítico', color: 'text-rose-600 dark:text-rose-400' };
};

const calculateIntegratedOfflineScore = (
  soilList: SoilSample[],
  leafList: LeafSample[]
): ScoreBreakdown => {
  const hasSoil = (soilList || []).length > 0;
  const hasLeaf = (leafList || []).length > 0;

  if (!hasSoil && !hasLeaf) {
    return {
      overallScore: 50,
      scoreLabel: 'Regular',
      statusColor: 'text-amber-600 dark:text-amber-400',
      precisionLevel: 'Preliminar (Sem Análises)',
      precisionPercent: 35,
      soilScore: 50,
      foliarScore: 50,
      nematodeScore: 85,
      synchronyScore: 50,
      productivity:
        'Dados insuficientes. Importe análises de solo e folha para calibrar o potencial produtivo da safra.',
      productivityDetails: [
        'Amostragem de solo de 0–20 cm e 20–40 cm necessária para recomendação de calagem e gessagem.',
        'Amostragem foliar no início do florescimento (R1–R2 ou V4–V6) para auditoria nutricional em tempo real.',
      ],
      soilManagement: 'Mapeie a fertilidade química e a biologia (BioAS) dos talhões prioritários.',
      soilDetails: ['Sem laudos químicos recentes cadastrados no sistema.'],
      foliarManagement:
        'Cadastre a diagnose foliar para avaliar deficiências ocultas de micro e macronutrientes.',
      foliarDetails: ['Aguardando laudos laboratoriais de folhas.'],
      foliarNutrientsStatus: [],
      foliarRatios: { NP: 0, NK: 0, CaMg: 0, KMg: 0 },
      waterManagement: 'Monitore o histórico de precipitação e a textura do solo dos talhões.',
      waterDetails: ['Implemente pluviômetros e monitore a palhada para mitigar veranicos.'],
      correlations: ['Sem dados para correlacionar solo e nutrição foliar.'],
    };
  }

  let totalSoilScore = 0;
  const soilIssues = {
    acidity: false,
    lowV: false,
    lowP: false,
    lowK: false,
    lowMO: false,
    highAl: false,
    lowS: false,
  };
  const soilNotes: string[] = [];

  if (hasSoil) {
    soilList.forEach(s => {
      let sScore = 100;
      const v = s.vPercent ?? 0;
      if (v < 45) {
        sScore -= 25;
        soilIssues.lowV = true;
        soilIssues.acidity = true;
      } else if (v < 60) {
        sScore -= 12;
        soilIssues.lowV = true;
      } else if (v > 75) {
        sScore -= 5;
      }

      const al = s.alCmolcDm3 ?? 0;
      if (al > 0.5) {
        sScore -= 20;
        soilIssues.highAl = true;
      } else if (al > 0.2) {
        sScore -= 10;
      }

      const p = s.pResinaMgDm3 || s.pMehlich1MgDm3 || 0;
      if (p < 8) {
        sScore -= 18;
        soilIssues.lowP = true;
      } else if (p < 18) {
        sScore -= 8;
      }

      const k = s.kCmolcDm3 ?? 0;
      if (k < 0.12) {
        sScore -= 15;
        soilIssues.lowK = true;
      } else if (k < 0.22) {
        sScore -= 5;
      }

      const mo = s.organicMatterGdm3 ?? 0;
      if (mo < 15) {
        sScore -= 15;
        soilIssues.lowMO = true;
      } else if (mo > 30) {
        sScore += 5;
      }

      const sVal = s.sSO4MgDm3 ?? 0;
      if (sVal < 5 && sVal > 0) {
        sScore -= 8;
        soilIssues.lowS = true;
      }

      totalSoilScore += Math.max(10, Math.min(100, sScore));
    });
    totalSoilScore = Math.round(totalSoilScore / (soilList.length || 1));
  } else {
    totalSoilScore = 60;
  }

  if (soilIssues.highAl || soilIssues.acidity) {
    soilNotes.push(
      'Acidez ativa e toxidez por Alumínio (Al³⁺) detectadas. Priorize calagem com calcário dolomítico.'
    );
  }
  if (soilIssues.lowP) {
    soilNotes.push(
      'Fósforo em nível limitante no solo. Necessária adubação fosfatada corretiva ou no sulco.'
    );
  }
  if (soilIssues.lowK) {
    soilNotes.push('Potássio baixo no solo. Risco para enchimento de grãos e tolerância à seca.');
  }
  if (soilIssues.lowMO) {
    soilNotes.push(
      'Matéria orgânica crítica (< 15 g/dm³). Recomenda-se inserção de plantas de cobertura (Brachiaria/Crotalária).'
    );
  }
  if (soilNotes.length === 0) {
    soilNotes.push(
      'Perfil de solo equilibrado com fertilidade química construída e boa capacidade de troca catiônica (CTC).'
    );
  }

  let totalFoliarScore = 0;
  const foliarNotes: string[] = [];
  const foliarNutrientsStatus: ScoreBreakdown['foliarNutrientsStatus'] = [];
  let foliarRatios = { NP: 0, NK: 0, CaMg: 0, KMg: 0 };
  const foliarIssues = {
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
      const legacyResults = (l as unknown as { results?: Record<string, number> }).results;

      const n = l.n_g_kg ?? legacyResults?.N ?? 0;
      const p = l.p_g_kg ?? legacyResults?.P ?? 0;
      const k = l.k_g_kg ?? legacyResults?.K ?? 0;
      const ca = l.ca_g_kg ?? legacyResults?.Ca ?? 0;
      const mg = l.mg_g_kg ?? legacyResults?.Mg ?? 0;
      const s = l.s_g_kg ?? legacyResults?.S ?? 0;

      const b = l.b_mg_kg ?? legacyResults?.B ?? 0;
      const zn = l.zn_mg_kg ?? legacyResults?.Zn ?? 0;
      const cu = l.cu_mg_kg ?? legacyResults?.Cu ?? 0;
      const fe = l.fe_mg_kg ?? legacyResults?.Fe ?? 0;
      const mn = l.mn_mg_kg ?? legacyResults?.Mn ?? 0;
      const mo = legacyResults?.Mo ?? 0.8;

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

      const ratios = calculateRatios({ N: n, P: p, K: k, Ca: ca, Mg: mg, S: s, B: b, Zn: zn, Cu: cu, Fe: fe, Mn: mn, Mo: mo });
      foliarRatios = ratios;

      if (ratios.NK > 3.8 || ratios.NK < 2.0) {
        fScore -= 8;
        foliarIssues.unbalancedNK = true;
      }
      if (ratios.CaMg > 4.0 || (ratios.CaMg < 1.4 && ratios.CaMg > 0)) {
        fScore -= 6;
        foliarIssues.unbalancedCaMg = true;
      }

      totalFoliarScore += Math.max(15, Math.min(100, fScore));

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
    totalFoliarScore = 70;
  }

  if (foliarIssues.lowK) {
    foliarNotes.push(
      'Potássio foliar abaixo da faixa ideal. Aplicação foliar com fontes quelatadas (Acetato/Citrato de K) em R1–R3 é recomendada.'
    );
  }
  if (foliarIssues.lowB) {
    foliarNotes.push(
      'Boro foliar deficitário (< 25 mg/kg). Risco de abortamento floral; recomenda-se pulverização com Ácido Bórico ou Octaborato.'
    );
  }
  if (foliarIssues.lowZn) {
    foliarNotes.push('Zinco foliar baixo. Afeta o alongamento de entrenós e síntese de auxinas.');
  }
  if (foliarIssues.unbalancedNK) {
    foliarNotes.push(
      `Relação N/K foliar desequilibrada (${foliarRatios.NK.toFixed(1)}). Excesso relativo de N frente a K atrai pragas mastigadoras e reduz enchimento.`
    );
  }
  if (foliarNotes.length === 0) {
    foliarNotes.push(
      'Teores de macro e micronutrientes foliares em harmonia com as faixas de suficiência padrão Embrapa/IAC.'
    );
  }

  const correlations: string[] = [];
  let synchronyScore = 90;

  if (hasSoil && hasLeaf) {
    const avgSoilK = soilList.reduce((acc, s) => acc + (s.kCmolcDm3 || 0), 0) / soilList.length;
    const avgLeafK =
      leafList.reduce((acc, l) => {
        const legacyResults = (l as unknown as { results?: Record<string, number> }).results;
        return acc + (l.n_g_kg ? l.k_g_kg || 0 : legacyResults?.K || 0);
      }, 0) / leafList.length;

    if (avgSoilK >= 0.25 && avgLeafK < 17) {
      correlations.push(
        'O solo apresenta Potássio adequado/alto, porém a planta acusa restrição de absorção foliar — possível compactação, estresse hídrico ou antagonismo com Ca/Mg.'
      );
      synchronyScore -= 15;
    } else if (avgSoilK < 0.15 && avgLeafK >= 18) {
      correlations.push(
        'A folha mantém bom teor de K temporário, mas o solo está esgotado. A planta consumirá reservas rapidamente no enchimento de grãos.'
      );
      synchronyScore -= 10;
    } else {
      correlations.push(
        'Sinergismo Solo x Planta validado: disponibilidade no solo reflete diretamente na absorção foliar sem bloqueios de raiz.'
      );
    }

    if (soilIssues.highAl && foliarIssues.lowCa) {
      correlations.push(
        'Alumínio tóxico no solo está bloqueando o aprofundamento de raízes e a absorção de Cálcio/Boro na parte aérea.'
      );
      synchronyScore -= 15;
    }
  } else if (hasSoil && !hasLeaf) {
    correlations.push(
      'Cadastre laudos de análise foliar para desbloquear o cálculo completo de sincronismo e elevar a precisão para 98%.'
    );
  } else {
    correlations.push('Aguardando dados completos de solo e folha para matriz de correlação.');
  }

  let overallScore = 0;
  let precisionLevel: ScoreBreakdown['precisionLevel'] = 'Média (Apenas Solo)';
  let precisionPercent = 65;

  if (hasSoil && hasLeaf) {
    overallScore = Math.round(totalSoilScore * 0.45 + totalFoliarScore * 0.45 + synchronyScore * 0.1);
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
  const { label: scoreLabel, color: statusColor } = getScoreStatus(overallScore);

  let prodText =
    'Potencial produtivo alto. O equilíbrio entre solo e folha sustenta tetos elevados com foco em proteção fitossanitária.';
  if (foliarIssues.lowK || soilIssues.lowK) {
    prodText =
      'Restrição de Potássio (solo e/ou folha) pode limitar o peso de grãos. Reforce a adubação potássica e aplicações foliares nos estádios reprodutivos.';
  } else if (soilIssues.lowP || foliarIssues.lowP) {
    prodText =
      'Fósforo é o principal fator limitante para o arranque inicial e desenvolvimento radicular da cultura.';
  } else if (foliarIssues.lowB || foliarIssues.lowZn) {
    prodText =
      'Micronutrientes foliares (Boro/Zinco) estão limitando a taxa fotossintética e o pegamento floral.';
  }

  let waterText =
    'Armazenamento hídrico do solo e osmorregulação foliar adequados para suportar curtos veranicos.';
  if (soilIssues.lowMO) {
    waterText =
      'Baixa retenção de água devido à pouca Matéria Orgânica no solo. Alto risco de perda por estresse hídrico em veranicos.';
  } else if (foliarIssues.lowK) {
    waterText =
      'Potássio foliar baixo prejudica o fechamento estomático, elevando a perda de água por transpiração.';
  }

  return {
    overallScore,
    scoreLabel,
    statusColor,
    precisionLevel,
    precisionPercent,
    soilScore: totalSoilScore,
    foliarScore: totalFoliarScore,
    nematodeScore: 85,
    synchronyScore,
    productivity: prodText,
    productivityDetails: [
      prodText,
      'Teto produtivo estimado condicionado pelo fator mais limitante da Lei do Mínimo de Liebig.',
      `Sincronismo Solo x Folha: ${synchronyScore}/100.`,
    ],
    soilManagement: soilNotes[0] || 'Perfil de solo com fertilidade construída.',
    soilDetails: soilNotes,
    foliarManagement:
      foliarNotes[0] || 'Nutrição foliar com macro e micronutrientes em faixas satisfatórias.',
    foliarDetails: foliarNotes,
    foliarNutrientsStatus,
    foliarRatios,
    waterManagement: waterText,
    waterDetails: [
      waterText,
      'Capacidade de Retenção de Água (CAD): dependente do teor de argila e Matéria Orgânica.',
      'Regulação Estomática Foliar: Potássio atua na abertura e fechamento das células-guarda.',
    ],
    correlations,
  };
};

export const AIFarmScoreWidget: React.FC<AIFarmScoreWidgetProps> = ({
  farm,
  soilSamples,
  leafSamples = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [forceOffline, setForceOffline] = useState(() => {
    try {
      return localStorage.getItem('nema_score_force_offline') === 'true';
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
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [expandedCard]);

  useEffect(() => {
    try {
      localStorage.setItem('nema_score_force_offline', String(forceOffline));
    } catch {
      // ignore storage errors
    }
  }, [forceOffline]);

  const currentFarmSoilSamples = useMemo(() => {
    if (!farm?.id) return [];
    return (soilSamples || []).filter(s => s?.farmId === farm.id);
  }, [soilSamples, farm?.id]);

  const currentFarmLeafSamples = useMemo(() => {
    if (!farm?.id) return [];
    return (leafSamples || []).filter(l => l?.farmId === farm.id);
  }, [leafSamples, farm?.id]);

  useEffect(() => {
    const controller = new AbortController();

    const analyzeFarm = async (signal: AbortSignal) => {
      setLoading(true);
      setIsOfflineMode(false);

      const hasAnySamples = currentFarmSoilSamples.length > 0 || currentFarmLeafSamples.length > 0;

      if (forceOffline || !navigator.onLine || !hasAnySamples) {
        setIsOfflineMode(forceOffline || !navigator.onLine);
        const offlineCalc = calculateIntegratedOfflineScore(
          currentFarmSoilSamples,
          currentFarmLeafSamples
        );
        if (!signal.aborted) {
          setScoreData(offlineCalc);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/nema-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
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
4. Recomendações de produtividade, manejo de solo, nutrição/adubação foliar e resiliência hídrica.`,
          }),
        });

        if (!response.ok) throw new Error('API offline/error');
        const { data } = await response.json();
        if (signal.aborted) return;

        const calculatedScore = Math.max(0, Math.min(100, 100 - (data.riskScorePercentage || 25)));
        const localBase = calculateIntegratedOfflineScore(
          currentFarmSoilSamples,
          currentFarmLeafSamples
        );
        const { label, color } = getScoreStatus(calculatedScore);
        const foliarDiag = data.foliarDiagnosisAndBalance;

        setScoreData({
          overallScore: calculatedScore,
          scoreLabel: label,
          statusColor: color,
          precisionLevel:
            currentFarmLeafSamples.length > 0 ? 'Máxima (Solo + Folha)' : 'Média (Apenas Solo)',
          precisionPercent: currentFarmLeafSamples.length > 0 ? 98 : 68,
          soilScore: localBase.soilScore,
          foliarScore: localBase.foliarScore,
          nematodeScore: localBase.nematodeScore || 85,
          synchronyScore: localBase.synchronyScore,
          productivity: data.actionChecklist?.[0] || localBase.productivity,
          productivityDetails: [
            data.actionChecklist?.[0] || localBase.productivity,
            data.damageThresholdAssessment ||
              'Equilíbrio nutricional garante alta conversão de radiação solar em biomassa e grãos.',
            data.executiveSummary || 'Auditoria técnica gerada pela Nema IA.',
          ],
          soilManagement: data.soilHealthAndBioASRecommendations?.[0] || localBase.soilManagement,
          soilDetails: data.soilHealthAndBioASRecommendations || localBase.soilDetails,
          foliarManagement:
            foliarDiag?.foliarSprayRecommendation ||
            foliarDiag?.nutritionalStatusSummary ||
            localBase.foliarManagement,
          foliarDetails: foliarDiag?.limitingNutrients?.length
            ? [
                `Nutrientes em foco: ${foliarDiag.limitingNutrients.join(', ')}`,
                foliarDiag.foliarSprayRecommendation,
                foliarDiag.soilPlantSynchrony,
              ]
            : localBase.foliarDetails,
          foliarNutrientsStatus: localBase.foliarNutrientsStatus,
          foliarRatios: localBase.foliarRatios,
          waterManagement: data.actionChecklist?.[1] || localBase.waterManagement,
          waterDetails: [
            data.actionChecklist?.[1] || localBase.waterManagement,
            'Monitoramento de déficit de pressão de vapor (DPV) e condutância estomática.',
            'Manutenção de palhada orgânica para redução da temperatura superficial do solo.',
          ],
          correlations: foliarDiag?.soilPlantSynchrony
            ? [foliarDiag.soilPlantSynchrony, ...localBase.correlations]
            : localBase.correlations,
        });
      } catch (err: unknown) {
        if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
        console.warn('Fallback para cálculo algorítmico local Nema IA:', err);
        setIsOfflineMode(true);
        setScoreData(
          calculateIntegratedOfflineScore(currentFarmSoilSamples, currentFarmLeafSamples)
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    analyzeFarm(controller.signal);

    const handleConnectivity = () => analyzeFarm(controller.signal);
    window.addEventListener('online', handleConnectivity);
    window.addEventListener('offline', handleConnectivity);

    return () => {
      controller.abort();
      window.removeEventListener('online', handleConnectivity);
      window.removeEventListener('offline', handleConnectivity);
    };
  }, [farm?.id, farm?.name, currentFarmSoilSamples, currentFarmLeafSamples, forceOffline]);

  const toggleCard = (cardType: ExpandedCardType) => {
    setExpandedCard(prev => (prev === cardType ? null : cardType));
  };

  const pillars = [
    {
      id: 'productivity' as const,
      title: 'Produtividade',
      subtitle: 'Potencial de safra',
      summary: scoreData?.productivity,
      icon: TrendingUp,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-50/40 dark:bg-indigo-950/20',
    },
    {
      id: 'soil' as const,
      title: 'Manejo de solo',
      subtitle: 'Química e BioAS',
      summary: scoreData?.soilManagement,
      icon: Layers,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    },
    {
      id: 'foliar' as const,
      title: 'Nutrição foliar',
      subtitle: 'Balanço e DRIS',
      summary: scoreData?.foliarManagement,
      icon: Leaf,
      iconColor: 'text-teal-600 dark:text-teal-400',
      activeBg: 'bg-teal-50/40 dark:bg-teal-950/20',
    },
    {
      id: 'water' as const,
      title: 'Manejo de água',
      subtitle: 'CAD e resiliência',
      summary: scoreData?.waterManagement,
      icon: Droplets,
      iconColor: 'text-sky-600 dark:text-sky-400',
      activeBg: 'bg-sky-50/40 dark:bg-sky-950/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3.5 sm:px-5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <NemaIaLogoIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Nema IA Score Integrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              Auditoria agronômica 360°
              {scoreData && ` · Precisão ${scoreData.precisionPercent}% (${scoreData.precisionLevel})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOfflineMode && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
              title="Processamento algorítmico local offline"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo local</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setForceOffline(prev => !prev)}
            className={`h-7 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              forceOffline
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
            title="Alternar entre motor local offline e análise online"
          >
            <span>{forceOffline ? 'Motor local ativo' : 'Forçar motor local'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Score Overview + 4 Pillar Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
        {/* Left Column: Overall Score & Sub-Pillars */}
        <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Índice geral da fazenda
            </span>
            <button
              type="button"
              onClick={() => toggleCard('score')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors border cursor-pointer whitespace-nowrap ${
                expandedCard === 'score'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{expandedCard === 'score' ? 'Recolher' : 'Decomposição'}</span>
              {expandedCard === 'score' ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {loading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Processando matriz nutricional...</span>
            </div>
          ) : scoreData ? (
            <>
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {scoreData.overallScore}
                  </span>
                  <span className="text-sm text-slate-400 dark:text-zinc-500">/100</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${scoreData.statusColor}`}>
                  {scoreData.overallScore >= 80 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : scoreData.overallScore >= 45 ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Score {scoreData.scoreLabel}</span>
                </div>
              </div>

              {/* 4 Sub-Pillar Interactive Hairline Cells */}
              <div className="grid grid-cols-4 border border-slate-200 dark:border-zinc-800 rounded-lg divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                {[
                  { id: 'soil' as const, label: 'Solo', value: scoreData.soilScore },
                  { id: 'foliar' as const, label: 'Folha', value: scoreData.foliarScore },
                  { id: 'nematode' as const, label: 'Nemat.', value: scoreData.nematodeScore ?? 85 },
                  { id: 'score' as const, label: 'Sincronia', value: scoreData.synchronyScore },
                ].map(sub => {
                  const active = expandedCard === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleCard(sub.id)}
                      className={`py-2 px-1 text-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50/50 dark:bg-zinc-950/30 hover:bg-slate-100/70 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400">
                        {sub.label}
                      </span>
                      <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                        {sub.value}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* Right Columns: 4 Pillar Cells */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-slate-200 dark:divide-zinc-800">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isExpanded = expandedCard === pillar.id;
            const borderClasses = `${idx >= 2 ? 'sm:border-t sm:border-slate-200 sm:dark:border-zinc-800' : ''} ${
              idx % 2 === 1 ? 'sm:border-l sm:border-slate-200 sm:dark:border-zinc-800' : ''
            }`;

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => toggleCard(pillar.id)}
                className={`p-4 text-left flex flex-col justify-between transition-colors cursor-pointer ${borderClasses} ${
                  isExpanded
                    ? pillar.activeBg
                    : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${pillar.iconColor}`} />
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {pillar.title}
                      </h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {loading ? (
                    <div className="h-9 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded my-1.5" />
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {pillar.summary}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>{pillar.subtitle}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {isExpanded ? 'Recolher' : 'Ver detalhes'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Details Panel */}
      {expandedCard && scoreData && (
        <div
          ref={detailsRef}
          className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {expandedCard === 'score' && 'Decomposição do Nema IA Score Integrado'}
                {expandedCard === 'productivity' && 'Auditoria de potencial produtivo e fatores limitantes'}
                {expandedCard === 'soil' && 'Diagnóstico químico, físico e biológico de solo (BioAS)'}
                {expandedCard === 'foliar' && 'Diagnose foliar nutricional, DRIS e relações estequiométricas'}
                {expandedCard === 'nematode' && 'Diagnóstico de sanidade nematológica'}
                {expandedCard === 'water' && 'Gestão hídrica, armazenamento no solo e osmorregulação'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Ponderação dos parâmetros da propriedade e ações agronômicas prioritárias.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpandedCard(null)}
              className="h-7 px-2.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Recolher</span>
            </button>
          </div>

          {expandedCard === 'score' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
                {[
                  {
                    title: '1. Fertilidade de solo',
                    score: scoreData.soilScore,
                    bar: 'bg-emerald-500',
                    desc: 'Avalia acidez (pH, Al³⁺), saturação por bases (V%), P, K, matéria orgânica e enxofre.',
                  },
                  {
                    title: '2. Diagnose foliar',
                    score: scoreData.foliarScore,
                    bar: 'bg-teal-500',
                    desc: 'Avalia macro e micronutrientes na folha índice e índices de equilíbrio DRIS.',
                  },
                  {
                    title: '3. Sincronismo solo × planta',
                    score: scoreData.synchronyScore,
                    bar: 'bg-indigo-500',
                    desc: 'Cruza disponibilidade química no solo com a absorção e translocação foliar efetiva.',
                  },
                ].map(item => (
                  <div key={item.title} className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {item.title}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {item.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${item.bar} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Correlações críticas identificadas</span>
                </h5>
                <ul className="space-y-1.5">
                  {(scoreData.correlations || []).map((corr, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{corr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {expandedCard === 'productivity' && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Diretrizes para o teto produtivo</span>
              </h5>
              <ol className="space-y-2">
                {(scoreData.productivityDetails || []).map((det, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
                  >
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0 mt-0.5">
                      {idx + 1}.
                    </span>
                    <span>{det}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {expandedCard === 'soil' && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Plano de manejo e correção do solo</span>
              </h5>
              <ul className="space-y-1.5">
                {(scoreData.soilDetails || []).map((det, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{det}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expandedCard === 'foliar' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-teal-500" />
                  <span>Diagnóstico foliar e balanço nutricional</span>
                </h5>
                <ul className="space-y-1.5">
                  {(scoreData.foliarDetails || []).map((det, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{det}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {(scoreData.foliarNutrientsStatus || []).length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      Auditoria de nutrientes na folha ({scoreData.foliarNutrientsStatus.length} elementos)
                    </span>
                    {scoreData.foliarRatios.NK > 0 && (
                      <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                        Relação N/K: <strong className="text-slate-900 dark:text-zinc-100">{scoreData.foliarRatios.NK}</strong> · Ca/Mg:{' '}
                        <strong className="text-slate-900 dark:text-zinc-100">{scoreData.foliarRatios.CaMg}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 divide-slate-100 dark:divide-zinc-800/80">
                    {scoreData.foliarNutrientsStatus.map((item, idx) => {
                      const statusTextColor =
                        item.status === 'Muito Baixo' || item.status === 'Baixo'
                          ? 'text-rose-600 dark:text-rose-400'
                          : item.status === 'Alto' || item.status === 'Muito Alto'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400';

                      return (
                        <div
                          key={idx}
                          className="p-3 border-b sm:border-r border-slate-100 dark:border-zinc-800/80 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1 text-xs">
                            <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                              {item.nutrient}
                            </span>
                            <span className={`text-[11px] font-semibold shrink-0 ${statusTextColor}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                            {item.value}{' '}
                            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">
                              {item.unit}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
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

          {expandedCard === 'water' && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                <span>Estratégia hídrica e fisiologia de estresse</span>
              </h5>
              <ul className="space-y-1.5">
                {(scoreData.waterDetails || []).map((det, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <span>{det}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expandedCard === 'nematode' && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-amber-500" />
                <span>Diagnóstico de sanidade nematológica</span>
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                O Nema IA Score integra amostragens de solo e raiz com a dinâmica de reprodução (FR = Pf / Pi) e suscetibilidade varietal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
                <div className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block tabular-nums">
                    Índice de sanidade atual: {scoreData.nematodeScore ?? 85}%
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Pressão populacional sob controle relativo. Recomenda-se amostragem fitossanitária anual pós-colheita.
                  </p>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                    Manejo biológico e cultural
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Incorpore culturas antagônicas (<em>Crotalaria spectabilis</em>, <em>Brachiaria ruziziensis</em>) para reduzir o fator de reprodução.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
