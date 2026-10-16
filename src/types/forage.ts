export type ForageCategory = 'graminea_tropical' | 'graminea_temperada' | 'leguminosa_tropical' | 'leguminosa_temperada' | 'corte_silagem';
export type SoilFertilityLevel = 'baixa' | 'media' | 'alta' | 'muito_alta';
export type SoilDrainageLevel = 'bem_drenado' | 'moderado' | 'tolerante_encharcamento' | 'tolerante_inundacao';
export type GrazingHabit = 'touceira_cespitosa' | 'estolonifera' | 'prostrada_decumbente' | 'ereta_porte_alto' | 'arbustiva_ereta';

export interface ForageDisease {
  id: string;
  name: string;
  agentType: 'fungo' | 'inseto_praga' | 'nematoide' | 'bacteria' | 'virus' | 'disturbio_fisiologico';
  scientificName?: string;
  susceptibilityLevel: 'alta' | 'moderada' | 'tolerante' | 'resistente';
  symptoms: string;
  damageImpact: string;
  controlAndManagement: string;
  favorableConditions: string;
}

export interface ForageBromatology {
  crudeProteinPercent: { min: number; max: number; average: number }; // PB %
  neutralDetergentFiberPercent: { min: number; max: number; average: number }; // FDN %
  acidDetergentFiberPercent: { min: number; max: number; average: number }; // FDA %
  totalDigestibleNutrientsPercent: { min: number; max: number; average: number }; // NDT %
  inVitroDryMatterDigestibilityPercent: { min: number; max: number; average: number }; // DIVMS %
  palatabilityRating: 'Excelente' | 'Boa' | 'Média' | 'Baixa' | 'Depende da idade fenológica';
  voluntaryIntakeNotes: string;
}

export interface ForagePhenology {
  growthHabit: GrazingHabit;
  plantHeightRangeCm: { min: number; max: number };
  entryHeightRotationalCm: number;
  exitHeightRotationalCm: number;
  floweringSeason: string;
  drySeasonAccumulationPercent: number; // % da produção que ocorre na seca (geralmente 10-25%)
  frostTolerance: 'Nula' | 'Baixa' | 'Média' | 'Boa' | 'Excelente';
  droughtTolerance: 'Baixa' | 'Média' | 'Alta' | 'Excelente';
  shadeTolerancePercent?: number; // % de sombreamento tolerado em ILPF
  establishmentDays: { min: number; max: number };
  grazingRestPeriodDays: { rainy: { min: number; max: number }; dry: { min: number; max: number } };
}

export interface ForageFertilization {
  targetBaseSaturationPercent: number; // V% recomendado (ex: 50%, 60%, 70%)
  minPhosphorusP_mg_dm3: number; // Mehlich-1 mínimo
  potassiumK_cmolc_dm3: number; // K no solo recomendado
  nitrogenN_kg_ha_year_range: { maintenance: number; intensive: number };
  limingRecommendation: string;
  establishmentFertilizerNPK: string;
  annualMaintenanceFertilizer: string;
  micronutrientsNeeds: string;
  gypsumNeedIndication: string;
}

export interface ForageSoilAndClimate {
  fertilityRequirement: SoilFertilityLevel;
  drainageRequirement: SoilDrainageLevel;
  soilTextureRecommendation: string[];
  phRange: { min: number; max: number; ideal: number };
  aluminumTolerance: 'Muito Sensível' | 'Sensível' | 'Moderadamente Tolerante' | 'Alta Tolerância';
  waterloggingTolerance: 'Nenhuma' | 'Baixa (poucos dias)' | 'Média (1 a 2 semanas)' | 'Alta (suporta meses úmidos)';
  annualRainfallMmRange: { min: number; max: number; ideal: number };
  altitudeRangeMeters?: { min: number; max: number };
}

export interface ForageStrengthsAndWeaknesses {
  strengths: string[];
  weaknesses: string[];
  agronomicIndication: string;
  animalCategoriesRecommended: string[]; // ex: Cria, Recria, Engorda, Vacas em Lactação, Equinos, Ovinos
  ilpfCompatibilityRating: 'Excelente' | 'Boa' | 'Média' | 'Baixa' | 'Não recomendada';
  hayOrSilageSuitability: string;
}

export interface ForageSeedingGuideline {
  seedingRateKgHa: {
    broadcast: { min: number; max: number }; // a lanço
    drill: { min: number; max: number }; // em linha
    aerial: { min: number; max: number }; // aérea
    ilpfIntercrop: { min: number; max: number }; // consórcio milho/soja
  };
  pureLiveSeedPointsVC: number; // Pontos de Valor Cultural recomendados (ex: 300 a 450 pontos)
  seedPlantingDepthCm: { min: number; max: number };
  seedsPerGramApprox: number;
}

export interface ForageItem {
  id: string;
  commonName: string;
  scientificName: string;
  cultivar: string;
  botanicalFamily: 'Poaceae (Gramínea)' | 'Fabaceae (Leguminosa)';
  category: ForageCategory;
  origin: string;
  releaseYearOrInstitution?: string;
  dryMatterYieldTonHaYear: { min: number; max: number; average: number };
  
  // Real offline visual representation & morphology
  visuals: {
    mainColorHex: string;
    secondaryColorHex: string;
    inflorescenceType: string;
    leafBladeDescription: string;
    collarAndLiguleDescription: string;
    rootSystemDescription: string;
    growthHabitBadge: string;
    offlineIllustrationKey: string;
    realPhotoDescription: string;
  };

  phenology: ForagePhenology;
  bromatology: ForageBromatology;
  soilAndClimate: ForageSoilAndClimate;
  fertilization: ForageFertilization;
  strengthsAndWeaknesses: ForageStrengthsAndWeaknesses;
  seeding: ForageSeedingGuideline;
  diseasesAndPests: ForageDisease[];
}
