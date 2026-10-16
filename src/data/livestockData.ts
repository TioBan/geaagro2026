import { Animal, Paddock, ISPAMetrics } from '../types/livestock';

export const INITIAL_PADDOCKS: Paddock[] = [];

export const INITIAL_ANIMALS: Animal[] = [];

// Offline ISPA Logic (Sistema Integrado Solo-Planta-Animal)
export function analyzeISPA(soilP: number, pastGrowth: number, gmd: number): ISPAMetrics {
  const soilStatus = soilP < 10 ? 'Baixo' : soilP < 20 ? 'Médio' : 'Alto';
  const pastureStatus = pastGrowth < 30 ? 'Degradada' : pastGrowth < 60 ? 'Recuperação' : 'Produtiva';
  const animalStatus = gmd < 0.5 ? 'Abaixo' : gmd < 0.8 ? 'Meta' : 'Acima';
  
  let costPerArroba = 180; // Baseline
  let profitabilityImpact: 'Negativo' | 'Neutro' | 'Positivo' = 'Neutro';
  
  if (soilStatus === 'Baixo' && pastureStatus === 'Degradada') {
    costPerArroba = 220; // High cost due to inefficiency
    profitabilityImpact = 'Negativo';
  } else if (soilStatus === 'Alto' && animalStatus === 'Acima') {
    costPerArroba = 140; // Efficient production
    profitabilityImpact = 'Positivo';
  }

  return {
    soilPhosphorus: soilP,
    soilStatus,
    pastureGrowthRate: pastGrowth,
    pastureStatus,
    animalGmd: gmd,
    animalStatus,
    costPerArroba,
    profitabilityImpact
  };
}
