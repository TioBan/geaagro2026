export type NematologyTab =
  | 'dashboard'
  | 'nema_ia'
  | 'nema_ia_chat'
  | 'nema_ia_score'
  | 'gemeo_digital'
  | 'amostragem'
  | 'banco_especies'
  | 'rotacao_manejo'
  | 'diario_fotografico';

export type InfestationRisk = 'Baixa' | 'Moderada' | 'Alta' | 'Muito Alta';

export interface BiologicalPlanItem {
  agent: string;
  target: string;
  applicationTiming: string;
  doseRecommendation: string;
  mechanismOfAction: string;
}

export interface NemaAIAnalysisResult {
  executiveSummary: string;
  riskLevel: InfestationRisk;
  riskScorePercentage: number;
  nemaIAScore?: {
    score: number; // 0 to 100
    riskLevel: InfestationRisk;
    subScores: {
      populationPressure: number;
      reproductionDynamics: number;
      soilVulnerability: number;
      cropSusceptibility: number;
    };
    interpretation: string;
  };
  reproductionFactorAnalysis: {
    estimatedFR: number;
    status: string;
    interpretation: string;
  };
  dominantSpeciesIdentified: string[];
  damageThresholdAssessment: string;
  biologicalManagementPlan: BiologicalPlanItem[];
  chemicalManagementPlan: {
    recommended: boolean;
    activeIngredients: string[];
    observation: string;
  };
  cropRotationAndCoverCrops: {
    recommendedCoverCrops: string[];
    cropsToAvoid: string[];
    successionStrategy: string;
  };
  soilHealthAndBioASRecommendations: string[];
  actionChecklist: string[];
}

export interface NematodeSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  morphology: string;
  biologicalCycle: string;
  survival: string;
  hosts: string[];
  symptoms: string;
  identificationMethods: string;
  economicDamage: string;
  managementStrategies: string;
  references: string;
  // Thresholds used for the Expert System (Sistema Especialista)
  riskThresholds: {
    moderate: number; // Juveniles per 200cm3 of soil or 10g of root
    high: number;
    veryHigh: number;
  };
  
  // Specific requested fields for Nematology Library
  etiology?: string;
  identification?: string;
  chemicalControl?: string;
  physicalControl?: string;
  culturalControl?: string;
  anatomyType?: 'globose' | 'vermiform' | 'cyst' | 'reniform' | 'dagger' | 'sheath' | 'spiral' | 'pin';
  media?: NematodeMediaData;
}

export interface NematodeMediaData {
  microscope: {
    url: string;
    magnification: string;
    staining: string;
    markers: string[];
    caption: string;
    credit: string;
    severityScore?: number;
  };
  fieldDamage: {
    url: string;
    symptomTitle: string;
    organ: string;
    markers: string[];
    caption: string;
    credit: string;
    severityScore: number; // 1 to 5
  };
  extraGallery?: Array<{
    url: string;
    title: string;
    type: 'micro' | 'symptom' | 'drawing';
    credit: string;
  }>;
}

export interface NematodeSample {
  id: string;
  date: string;
  responsible: string;
  depthCm: string;
  subsamplesCount: number;
  gpsLocation: string;
  sampleType: 'Solo' | 'Raiz' | 'Solo e Raiz';
  photos: string[];
}

export interface LabResult {
  id: string;
  sampleId: string;
  speciesId: string;
  date: string;
  method: string;
  populationSoil200cm3: number;
  populationRoot10g: number;
  eggs: number;
  juveniles: number;
  adults: number;
}

export interface ManagementAction {
  id: string;
  date: string;
  type: 'Rotação de Culturas' | 'Plantas de Cobertura' | 'Biofumigação' | 'Nematicida Químico' | 'Agente Biológico' | 'Matéria Orgânica' | 'Solarização' | 'Outro';
  description: string;
  product?: string;
  dose?: string;
}

export interface FieldHistoryRecord {
  year: number;
  cropSeason: string;
  crop: string;
  cultivar: string;
  yieldKgHa: number;
}

export interface NematodeField {
  id: string;
  farmName: string;
  fieldName: string;
  areaHa: number;
  soilType: 'Arenoso' | 'Misto' | 'Argiloso' | 'Muito Argiloso';
  cultivationSystem: 'Plantio Direto' | 'Convencional' | 'Mínimo';
  currentCrop: string;
  currentCultivar: string;
  history: FieldHistoryRecord[];
  
  samples: NematodeSample[];
  labResults: LabResult[];
  managements: ManagementAction[];
  
  // Gêmeo Digital Calculated Properties
  currentRisk: InfestationRisk;
  dominantSpeciesId?: string;
  pi?: number; // Initial Population
  pf?: number; // Final Population
  reproductionFactor?: number; // Pf / Pi
}
