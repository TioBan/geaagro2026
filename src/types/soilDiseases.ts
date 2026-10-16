export type DiseaseGroup = 'Fungo' | 'Bactéria' | 'Nematoide' | 'Oomiceto';

export type ConfidenceLevel = 'Baixa' | 'Média' | 'Alta';

export type OccurrenceSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type DiagnosticMethod =
  | 'PCR'
  | 'Isolamento Microbiológico'
  | 'Sorologia'
  | 'Microscopia Óptica'
  | 'Sequenciamento DNA';

export type OrganCategory = 'Raiz' | 'Colo' | 'Caule' | 'Folha' | 'Fruto' | 'Plântula';

export type IgssClassification = 'Excelente' | 'Boa' | 'Atenção' | 'Alto Risco';

export interface SoilDisease {
  id: string;
  commonName: string;
  scientificName: string;
  group: DiseaseGroup;
  hosts: string[];
  symptomsByOrgan: {
    root?: string[];
    collar?: string[];
    stem?: string[];
    leaf?: string[];
    fruit?: string[];
    seedling?: string[];
  };
  photos: {
    root?: string;
    collar?: string;
    stem?: string;
    seedling?: string;
    adultPlant?: string;
    soil?: string;
  };
  technicalInfo: {
    etiology: {
      agentType: string;
      structures: string;
      thermalOptimum: string;
      survivalMechanism: string;
    };
    symptomsDescription: string;
    diseaseCycle: string;
    survival: string;
    dissemination: string;
    favorableConditions: {
      tempMinC: number;
      tempMaxC: number;
      tempIdeal: string;
      humidityIdeal: string;
      favorableSoilTypes: string[];
      phRange: string;
    };
    controls: {
      chemicalControl: string[];
      physicalControl: string[];
      biologicalControl: string[];
      culturalControl: string[];
    };
    preventiveManagement: string[];
    biologicalManagement: string[];
    chemicalManagement: string[];
    nutritionalManagement: string[];
    references: string[];
  };
}

export interface SymptomItem {
  id: string;
  name: string;
  organ: OrganCategory;
  description: string;
  associatedDiseaseIds: string[];
}

export interface SoilProperty {
  id: string;
  farmName: string;
  owner: string;
  technicalResponsible: string;
  crea?: string;
  municipality: string;
  state: string;
  gpsLatitude: number;
  gpsLongitude: number;
  totalAreaHa: number;
  cultivatedAreaHa: number;
  photos?: string[];
  notes?: string;
  createdAt: string;
}

export interface SoilField {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  areaHa: number;
  currentCrop: string;
  cultivar: string;
  season: string;
  croppingSystem: 'Plantio Direto' | 'Cultivo Convencional' | 'Cultivo Mínimo';
  soilType: string;
  texturalClass: 'Argilosa' | 'Areno-argilosa' | 'Arenosa' | 'Siltosa' | 'Média';
  latitude: number;
  longitude: number;
  photo?: string;
  cropHistory: string[];
}

export interface FieldSampleCollection {
  id: string;
  propertyId: string;
  fieldId: string;
  crop: string;
  date: string;
  time: string;
  responsible: string;
  gpsPoint: { lat: number; lng: number };
  sampleNumber: string;
  depth: '0-20 cm' | '20-40 cm' | '0-40 cm';
  sampleType: 'Solo' | 'Planta Completa' | 'Sistema Radicular' | 'Colo / Hastes';
  quantityCollected: string;
  photos: {
    fullPlant?: string;
    root?: string;
    collar?: string;
    soil?: string;
    area?: string;
  };
  selectedSymptoms: string[]; // Symptom names or IDs
  environmentalData: {
    soilMoisturePct: number;
    temperatureC: number;
    recentIrrigation: boolean;
    recentRainfallMm: number;
    managementType: string;
    cropRotation: string;
  };
}

export interface SuspectedDiseaseMatch {
  diseaseId: string;
  diseaseName: string;
  scientificName: string;
  group: DiseaseGroup;
  confidence: ConfidenceLevel;
  compatibilityScore: number; // 0 - 100%
  reasoning: string;
}

export interface ConfirmedDiagnosis {
  laboratory: string;
  result: string;
  pathogenIdentified: string;
  method: DiagnosticMethod;
  reportNumber: string;
  reportPdfUrl?: string;
  confirmationDate: string;
  notes?: string;
}

export interface PhotoTimelineEntry {
  id: string;
  dayLabel: 'Dia 1' | 'Dia 7' | 'Dia 15' | 'Dia 30' | string;
  date: string;
  photoUrl: string;
  notes: string;
  severityPct: number;
}

export interface SoilDiseaseOccurrence {
  id: string;
  sampleCollectionId?: string;
  propertyId: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  cultivar: string;
  date: string;
  stage: 'TRIAGEM' | 'DIAGNOSTICO_CONFIRMADO';
  suspectedDiseases: SuspectedDiseaseMatch[];
  confirmedDiagnosis?: ConfirmedDiagnosis;
  severity: OccurrenceSeverity;
  affectedAreaHa: number;
  incidencePct: number;
  symptoms: string[];
  photos: {
    root?: string;
    collar?: string;
    soil?: string;
    area?: string;
  };
  photoTimeline: PhotoTimelineEntry[];
  status: 'Ativa' | 'Em Monitoramento' | 'Tratada / Controlada' | 'Arquivada';
  gpsPoint: { lat: number; lng: number };
}

export interface SoilChemicalParams {
  phH2o: number;
  phCacl2: number;
  organicMatterGdm3: number;
  organicMatterPct: number;
  clayPct: number;
  caCmolc: number;
  mgCmolc: number;
  alCmolc: number;
  baseSaturationVpct: number;
  aluminumSaturationMpct: number;
  // Macronutrientes
  kCmolc?: number;
  pMgdm3?: number;
  sMgdm3?: number;
  // Micronutrientes
  bMgdm3?: number;
  cuMgdm3?: number;
  mnMgdm3?: number;
  znMgdm3?: number;
  feMgdm3?: number;
  siMgdm3?: number;
}

export interface WeatherRiskAlert {
  diseaseId: string;
  diseaseName: string;
  riskLevel: 'Baixo' | 'Favorável' | 'Crítico';
  reasons: string[];
}

export interface IgssResult {
  overallScore: number; // 0 to 100
  classification: IgssClassification;
  breakdown: {
    sanitaryHistoryScore: number; // max 30
    organicMatterScore: number; // max 20
    chemicalBalanceScore: number; // max 15
    drainageStructureScore: number; // max 10
    cropDiversityScore: number; // max 15
    managementBiologicalsScore: number; // max 10
  };
  recommendations: string[];
  predisposingFactors: string[];
}
