export type OccurrenceCategory =
  | 'deficiencia_nutricional'
  | 'doenca'
  | 'praga'
  | 'fitotoxicidade'
  | 'estresse_hidrico'
  | 'estresse_termico'
  | 'problema_fisiologico'
  | 'dano_mecanico';

export type GrowthStage =
  | 'cotiledones'
  | 'primeiro_par'
  | 'segundo_terceiro_par'
  | 'aclimatacao'
  | 'qualquer_fase';

export type PlantArea =
  | 'folhas_jovens'
  | 'folhas_velhas'
  | 'toda_planta'
  | 'colo_caule'
  | 'raizes_substrato';

export interface VisualCharacteristicsFeatures {
  // Cores e Folhagem
  leafColor?: 'verde_normal' | 'amarelo_uniforme' | 'amarelo_internerval' | 'bronzeado' | 'arroxeado' | 'esbranquicado';
  veinColor?: 'verde' | 'amarelada' | 'clorotica' | 'escurecida';
  leafShape?: 'normal' | 'encarquilhada' | 'em_copo_ou_gancho' | 'estreitada' | 'deformada';
  leafBurnMargin?: boolean; // Queima de bordas
  
  // Lesões e Sintomas
  hasSpots?: boolean; // Manchas
  spotType?: 'circular_concentrica' | 'irregular_aquosa' | 'pontuacoes_necroticas' | 'halo_amarelado';
  hasNecrosis?: boolean; // Necrose
  hasWilting?: boolean; // Murcha
  hasDampingOff?: boolean; // Tombamento no colo
  
  // Pragas e Sinais Visíveis
  visibleInsects?: boolean; // Insetos visíveis
  insectType?: 'pulgões' | 'tripes' | 'mosca_branca' | 'ácaros' | 'lagartas' | 'nenhum';
  hasMoldOrMycelium?: boolean; // Mofo ou micélio
  moldColor?: 'branco_algodonoso' | 'cinzento' | 'rosado' | 'escuro';
  
  // Raízes e Substrato
  rootColor?: 'branco_brilhante' | 'marrom_escuro' | 'preto_gelatinoso' | 'avermelhado';
  rootDevelopment?: 'abundante_com_pelos' | 'reduzido_sem_pelos' | 'apodrecido_na_ponta';
  substrateCondition?: 'ideal_drenado' | 'encharcado' | 'ressecado_compactado' | 'presenca_algas_musgos' | 'salinizacao_branca_superficie';
}

export interface OfflineDiagnosticRecord {
  id: string;
  code: string; // Ex: 'DIAG-PYTH-01'
  problemName: string;
  scientificNameOrCause?: string;
  category: OccurrenceCategory;
  cropsApplicable: string[]; // Ex: ['Alface', 'Tomate', 'Pimentão', 'Couve', 'Todas']
  growthStage: GrowthStage;
  plantAreaAffected: PlantArea;
  severity: 'baixo' | 'moderado' | 'severo' | 'critico';
  recoveryTimeEstimated: string; // Ex: '4 a 7 dias', 'Descarte do lote'
  
  // Rule Matching Profile
  features: VisualCharacteristicsFeatures;
  
  // Dichotomous Key Questions (for step-by-step decision tree)
  keyQuestionMatches: {
    questionId: string;
    expectedAnswer: boolean;
  }[];

  // Technical Breakdown
  technicalDescription: string;
  visualSymptomsList: string[];
  possibleCauses: string[];
  preventiveMeasures: string[];
  correctiveMeasures: string[];
  
  // Image & Visual Reference
  referenceImageColor: string; // Tailwind color scheme or illustration token
  referenceIllustration: string; // Conceptual visual description
  realPhotoUrl?: string; // Main real agronomic photo
  realPhotos?: {
    url: string;
    title: string;
    caption: string;
    tag: string;
  }[];
}

export interface DichotomousQuestion {
  id: string;
  questionText: string;
  helpTip: string;
  categoryHint?: string;
  relatedFeatureKey: keyof VisualCharacteristicsFeatures;
}

export interface DiagnosticComparisonResult {
  record: OfflineDiagnosticRecord;
  compatibilityPercent: number;
  matchedFeatures: string[];
  unmatchedFeatures: string[];
  confidenceLevel: 'alta' | 'moderada' | 'baixa';
}
