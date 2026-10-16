import { NematodeSpecies, NematodeField, InfestationRisk } from '../types/nematology';
import { NEMATODE_SPECIES_CATALOG_50 } from './nematodeSpeciesCatalog';

export const NEMATODE_SPECIES_CATALOG: NematodeSpecies[] = NEMATODE_SPECIES_CATALOG_50;


// Motor de Regras Sem IA (Sistema Especialista)
export function calculateDynamicRisk(
  speciesId: string, 
  popSoil: number, 
  popRoot: number, 
  soilType: string
): InfestationRisk {
  const species = NEMATODE_SPECIES_CATALOG.find(s => s.id === speciesId);
  if (!species) return 'Baixa';

  // O risco é amplificado em solos arenosos
  const soilMultiplier = (soilType === 'Arenoso' || soilType === 'Misto') ? 1.5 : 1.0;
  
  // Combina população do solo e raiz para uma "Pressão Total" simplificada
  const totalPressure = (popSoil + (popRoot * 2)) * soilMultiplier;

  if (totalPressure >= species.riskThresholds.veryHigh) return 'Muito Alta';
  if (totalPressure >= species.riskThresholds.high) return 'Alta';
  if (totalPressure >= species.riskThresholds.moderate) return 'Moderada';
  return 'Baixa';
}

export function calculateReproductionFactor(pi: number, pf: number): number {
  if (pi <= 0) return pf > 0 ? 999 : 0;
  return Math.round((pf / pi) * 10) / 10;
}

export const INITIAL_NEMATODE_FIELDS: NematodeField[] = [];

