import { Farm, RuralProducer, Agronomist, SoilSample, LeafSample } from '../../types/agronomy';
import { NematodeSpecies } from '../../types/nematology';

export type AIDomain = 'geral' | 'fertilidade' | 'nematologia' | 'pecuaria' | 'avicultura';

export interface BiologicalManagementItem {
  agent: string;
  target: string;
  applicationTiming: string;
  doseRecommendation: string;
  mechanismOfAction: string;
}

export interface ChemicalManagementPlan {
  recommended: boolean;
  activeIngredients: string[];
  observation: string;
}

export interface CropRotationPlan {
  recommendedCoverCrops: string[];
  cropsToAvoid: string[];
  successionStrategy: string;
}

export interface LivestockRecommendations {
  carryingCapacityUaHa?: string;
  pastureManagement?: string;
  nutritionalStrategy?: string;
  sanitaryProtocol?: string;
}

export interface FoliarDiagnosisAndBalance {
  nutritionalStatusSummary?: string;
  limitingNutrients?: string[];
  foliarSprayRecommendation?: string;
  soilPlantSynchrony?: string;
}

export interface ReproductionFactorAnalysis {
  estimatedFR: number;
  status: string;
  interpretation: string;
}

export interface NemaIAScoreData {
  score: number;
  riskLevel: string;
  interpretation: string;
  subScores: {
    populationPressure: number;
    reproductionDynamics: number;
    soilVulnerability: number;
    cropSusceptibility: number;
  };
}

export interface CentralAIAnalysisResult {
  reply?: string;
  executiveSummary: string;
  domainCategory?: string;
  riskLevel: 'Baixa' | 'Moderada' | 'Alta' | 'Muito Alta';
  riskScorePercentage: number;
  reproductionFactorAnalysis: ReproductionFactorAnalysis;
  dominantSpeciesIdentified?: string[];
  dominantSpeciesOrTargets?: string[];
  damageThresholdAssessment: string;
  biologicalManagementPlan: BiologicalManagementItem[];
  chemicalManagementPlan: ChemicalManagementPlan;
  cropRotationAndCoverCrops: CropRotationPlan;
  livestockAndPastureRecommendations?: LivestockRecommendations;
  soilHealthAndBioASRecommendations: string[];
  actionChecklist: string[];
  foliarDiagnosisAndBalance?: FoliarDiagnosisAndBalance;
  nemaIAScore?: NemaIAScoreData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  result?: CentralAIAnalysisResult;
  attachedFileName?: string | null;
}

export interface NemaAIConsoleProps {
  currentFarm?: Farm;
  currentProducer?: RuralProducer;
  currentAgronomist?: Agronomist;
  currentField?: any;
  soilSamples?: SoilSample[];
  leafSamples?: LeafSample[];
  speciesCatalog?: NematodeSpecies[];
  onApplyRecommendations?: (result: CentralAIAnalysisResult) => void;
  initialSubModule?: 'conversa' | 'score';
}

export function getRiskBadgeColor(risk: string): string {
  switch (risk) {
    case 'Baixa':
      return 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'Moderada':
      return 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'Alta':
      return 'bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'Muito Alta':
      return 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 border-slate-500/20';
  }
}
