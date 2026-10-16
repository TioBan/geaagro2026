import { ForageItem, ForageCategory, SoilFertilityLevel, SoilDrainageLevel } from '../types/forage';
import { FORAGES_PART_1 } from './foragesPart1';
import { FORAGES_PART_2 } from './foragesPart2';
import { FORAGES_PART_3 } from './foragesPart3';
import { FORAGES_PART_4 } from './foragesPart4';
import { FORAGES_PART_5 } from './foragesPart5';
import { FORAGES_PART_6 } from './foragesPart6';

export const FORAGES_CATALOG: ForageItem[] = [
  ...FORAGES_PART_1,
  ...FORAGES_PART_2,
  ...FORAGES_PART_3,
  ...FORAGES_PART_4,
  ...FORAGES_PART_5,
  ...FORAGES_PART_6,
];

export const FORAGE_CATEGORIES_INFO: Record<ForageCategory, { label: string; description: string; count: number }> = {
  graminea_tropical: {
    label: 'Gramíneas Tropicais',
    description: 'Espécies perenes de alta produção adaptadas ao clima tropical quente e úmido do Brasil.',
    count: FORAGES_CATALOG.filter(f => f.category === 'graminea_tropical').length,
  },
  graminea_temperada: {
    label: 'Gramíneas de Inverno (Temperadas)',
    description: 'Espécies anuais de estação fria para pastejo e fenação no Sul e Sudeste (Aveia e Azevém).',
    count: FORAGES_CATALOG.filter(f => f.category === 'graminea_temperada').length,
  },
  leguminosa_tropical: {
    label: 'Leguminosas Forrageiras (Fixadoras de N₂)',
    description: 'Plantas com simbiose radicular com bactérias fixadoras de Nitrogênio e altíssimo teor proteico.',
    count: FORAGES_CATALOG.filter(f => f.category === 'leguminosa_tropical').length,
  },
  leguminosa_temperada: {
    label: 'Leguminosas Temperadas',
    description: 'Trevos e ervilhacas de estação fria.',
    count: FORAGES_CATALOG.filter(f => f.category === 'leguminosa_temperada').length,
  },
  corte_silagem: {
    label: 'Capins de Corte & Silagem',
    description: 'Capins de porte monumental (BRS Capiaçu) para colheita mecânica e silagem de baixo custo.',
    count: FORAGES_CATALOG.filter(f => f.category === 'corte_silagem').length,
  },
};

export function getForageById(id: string): ForageItem | undefined {
  return FORAGES_CATALOG.find(f => f.id === id);
}

export function searchForages(query: string): ForageItem[] {
  if (!query || query.trim() === '') return FORAGES_CATALOG;
  const q = query.toLowerCase().trim();
  return FORAGES_CATALOG.filter(f =>
    f.commonName.toLowerCase().includes(q) ||
    f.scientificName.toLowerCase().includes(q) ||
    f.cultivar.toLowerCase().includes(q) ||
    f.strengthsAndWeaknesses.strengths.some(s => s.toLowerCase().includes(q)) ||
    f.strengthsAndWeaknesses.animalCategoriesRecommended.some(a => a.toLowerCase().includes(q)) ||
    f.diseasesAndPests.some(d => d.name.toLowerCase().includes(q))
  );
}

export function filterForagesBySoilAndClimate(criteria: {
  fertility?: SoilFertilityLevel;
  drainage?: SoilDrainageLevel;
  animalType?: string;
  category?: ForageCategory;
  isIlpf?: boolean;
}): { forage: ForageItem; score: number; matchReasons: string[] }[] {
  return FORAGES_CATALOG.map(forage => {
    let score = 50;
    const matchReasons: string[] = [];

    // Fertility match
    if (criteria.fertility) {
      const fertilityLevels: Record<SoilFertilityLevel, number> = { baixa: 1, media: 2, alta: 3, muito_alta: 4 };
      const forageReq = fertilityLevels[forage.soilAndClimate.fertilityRequirement];
      const soilFert = fertilityLevels[criteria.fertility];
      if (soilFert >= forageReq) {
        score += 20;
        matchReasons.push(`Compatível com fertilidade ${criteria.fertility} (Exige: ${forage.soilAndClimate.fertilityRequirement})`);
      } else {
        score -= 25;
        matchReasons.push(`⚠️ Exige solo mais fértil (${forage.soilAndClimate.fertilityRequirement}) do que o informado`);
      }
    }

    // Drainage match
    if (criteria.drainage) {
      if (criteria.drainage === 'tolerante_inundacao' || criteria.drainage === 'tolerante_encharcamento') {
        if (forage.soilAndClimate.drainageRequirement === 'tolerante_inundacao' || forage.soilAndClimate.drainageRequirement === 'tolerante_encharcamento') {
          score += 25;
          matchReasons.push('Excelente tolerância a umidade e solos alagadiços');
        } else {
          score -= 30;
          matchReasons.push('⚠️ Não tolera solos encharcados (risco de morte das touceiras)');
        }
      } else if (criteria.drainage === 'bem_drenado') {
        score += 15;
        matchReasons.push('Adapta-se perfeitamente a solos bem drenados');
      }
    }

    // Category
    if (criteria.category && forage.category === criteria.category) {
      score += 15;
      matchReasons.push(`Pertence à categoria ${FORAGE_CATEGORIES_INFO[criteria.category].label}`);
    }

    // ILPF
    if (criteria.isIlpf) {
      if (forage.strengthsAndWeaknesses.ilpfCompatibilityRating === 'Excelente') {
        score += 20;
        matchReasons.push('Consagrada para Consórcio ILPF e Plantio Direto');
      } else if (forage.strengthsAndWeaknesses.ilpfCompatibilityRating === 'Boa') {
        score += 10;
        matchReasons.push('Boa aptidão para integração');
      } else if (forage.strengthsAndWeaknesses.ilpfCompatibilityRating === 'Não recomendada') {
        score -= 20;
        matchReasons.push('Não recomendada para ILPF');
      }
    }

    // Animal type
    if (criteria.animalType) {
      const isRecommended = forage.strengthsAndWeaknesses.animalCategoriesRecommended.some(a =>
        a.toLowerCase().includes(criteria.animalType!.toLowerCase())
      );
      if (isRecommended) {
        score += 20;
        matchReasons.push(`Altamente recomendada para ${criteria.animalType}`);
      }
    }

    return { forage, score, matchReasons };
  }).sort((a, b) => b.score - a.score);
}
