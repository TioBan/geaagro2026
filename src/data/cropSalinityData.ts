import { CropSalinityTolerance, CropCategory } from '../types/waterAnalysis';
import { CROP_PLANTING_RECOMMENDATIONS_250 } from './crops250Data';

// Specific overrides and scientific data according to FAO 29 (Ayers & Westcot), Maas & Hoffman, and Embrapa:
interface CropSalinityMeta {
  category: CropCategory;
  sensitivityRating: 'sensivel' | 'moderadamente_sensivel' | 'moderadamente_tolerante' | 'tolerante';
  thresholdEcDeciSiemensM: number;
  yieldLossPercentPerUnitEc: number;
  maxBoronMgL: number;
  sodiumToleranceRating: 'baixa' | 'moderada' | 'alta';
  specialRecommendations: string;
}

function resolveSalinityProfile(cropName: string, scientificName: string): CropSalinityMeta {
  const name = cropName.toLowerCase();
  const sci = scientificName.toLowerCase();

  // 1. TOLERANTE (CE limiar alta >= 4.0 dS/m ou tolerância comprovada)
  if (name.includes('algod') || sci.includes('gossypium')) {
    return {
      category: 'industriais',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 7.7,
      yieldLossPercentPerUnitEc: 5.2,
      maxBoronMgL: 5.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Altamente tolerante à salinidade em solos agrícolas (CEe até 7.7 dS/m sem redução). Monitorar cloretos na abertura de capulhos.'
    };
  }
  if (name.includes('cevada') || sci.includes('hordeum')) {
    return {
      category: 'graos',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 8.0,
      yieldLossPercentPerUnitEc: 5.0,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'O cereal mais tolerante a sais; excelente cultura para rotação de inverno em solos com salinidade residual.'
    };
  }
  if (name.includes('quinoa') || sci.includes('chenopodium quinoa')) {
    return {
      category: 'graos',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 8.0,
      yieldLossPercentPerUnitEc: 5.5,
      maxBoronMgL: 3.5,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Pseudocereal andino halotolerante de altíssima rusticidade osmótica e ajuste celular.'
    };
  }
  if (name.includes('beterraba') || sci.includes('beta vulgaris')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 7.0,
      yieldLossPercentPerUnitEc: 9.0,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Planta halófita facultativa tolerante a Na e cloretos; requer atenção especial na fase de plântula.'
    };
  }
  if (name.includes('aspargo') || sci.includes('asparagus')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 4.1,
      yieldLossPercentPerUnitEc: 2.0,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Elevada tolerância à salinidade em todas as fases; curva de perda de produtividade suave (2%/dS/m).'
    };
  }
  if (name.includes('coco') || sci.includes('cocos nucifera')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 6.5,
      yieldLossPercentPerUnitEc: 4.5,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Naturalmente adaptado a zonas litorâneas e águas salobras; responde favoravelmente à aplicação equilibrada de Cl e Na.'
    };
  }
  if (name.includes('cynodon') || name.includes('tifton') || name.includes('coastcross') || name.includes('vaquero') || name.includes('estrela-africana') || name.includes('bermuda')) {
    return {
      category: 'pastagens',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 5.6,
      yieldLossPercentPerUnitEc: 6.0,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Excelente gramínea forrageira altamente tolerante para fenação e pastejo irrigado com água salobra.'
    };
  }
  if (name.includes('palma') && (name.includes('forrageira') || sci.includes('opuntia') || sci.includes('nopalea'))) {
    return {
      category: 'pastagens',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 4.5,
      yieldLossPercentPerUnitEc: 7.0,
      maxBoronMgL: 3.5,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Cactácea xerófila e halotolerante; suporta irrigação deficitária com água salobra no Semiárido.'
    };
  }
  if (name.includes('sisal') || name.includes('agave')) {
    return {
      category: 'industriais',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 6.0,
      yieldLossPercentPerUnitEc: 6.5,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Cultivada no Semiárido com elevada tolerância a sais e estresse hídrico severo.'
    };
  }
  if (name.includes('grama') && (name.includes('esmeralda') || name.includes('bermudas') || name.includes('santo agostinho') || name.includes('zoysia'))) {
    return {
      category: 'ornamentais',
      sensitivityRating: 'tolerante',
      thresholdEcDeciSiemensM: 6.0,
      yieldLossPercentPerUnitEc: 5.5,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Grama de alta resistência ao pisoteio e à irrigação com água tratada/reúso e sais.'
    };
  }

  // 2. SENSÍVEIS CRÍTICOS (CE limiar <= 1.3 dS/m ou alta perda por dS/m)
  if (name.includes('morango') || sci.includes('fragaria')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.0,
      yieldLossPercentPerUnitEc: 33.0,
      maxBoronMgL: 0.5,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Uma das culturas mais sensíveis do agronegócio; manter CE da solução nutritiva < 1.2 dS/m e água pura < 0.7 dS/m.'
    };
  }
  if (name.includes('feijão') || name.includes('feijoeiro') || sci.includes('phaseolus')) {
    return {
      category: 'graos',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.0,
      yieldLossPercentPerUnitEc: 19.0,
      maxBoronMgL: 0.75,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Cultura muito sensível a sais e sódio. Queima de bordas foliares e abortamento floral sob CEa > 0.7 dS/m.'
    };
  }
  if (name.includes('cenoura') || sci.includes('daucus carota')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.0,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 0.75,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível na germinação e engrossamento da raiz; sais provocam deformações, rachaduras e bifurcações.'
    };
  }
  if (name.includes('cebola') || sci.includes('allium cepa')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.2,
      yieldLossPercentPerUnitEc: 16.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Raízes muito superficiais; requer irrigação com baixa condutividade elétrica e boa drenagem do canteiro.'
    };
  }
  if (name.includes('alho') || sci.includes('allium sativum')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.3,
      yieldLossPercentPerUnitEc: 15.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a sais na fase de diferenciação de bulbilhos; manter umidade uniforme com água de boa qualidade.'
    };
  }
  if (name.includes('abacate') || sci.includes('persea')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.3,
      yieldLossPercentPerUnitEc: 21.0,
      maxBoronMgL: 0.5,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Extremamente suscetível à toxidez por cloreto e sódio; necrose marginal foliar e desfolha precoce.'
    };
  }
  if (name.includes('banana') || sci.includes('musa')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.1,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Alta demanda transpiratória; excesso de sais reduz a taxa de emissão foliar, tamanho do engaço e peso dos frutos.'
    };
  }
  if (name.includes('maracuj') || sci.includes('passiflora')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.3,
      yieldLossPercentPerUnitEc: 15.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível ao acúmulo de cloretos nas folhas; monitorar RAS da água de irrigação para evitar sodicidade.'
    };
  }
  if (name.includes('citros') || name.includes('laranja') || name.includes('limão') || name.includes('tangerina') || sci.includes('citrus')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 16.0,
      maxBoronMgL: 0.75,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível ao acúmulo foliar de Na e Cl; porta-enxertos de Citrumelo Swingle e Cleópatra conferem maior tolerância do que Limão Cravo.'
    };
  }
  if (name.includes('manga') || sci.includes('mangifera')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível no período de florescimento e frutificação; excesso de sais provoca queima no ápice das folhas maduras.'
    };
  }
  if (name.includes('maca') || name.includes('maçã') || sci.includes('malus')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível ao acúmulo de cloretos e sais nos botões florais e brotações novas.'
    };
  }
  if (name.includes('pera') || name.includes('pêra') || sci.includes('pyrus')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Frutífera de clima temperado; manter CEa < 1.0 dS/m na irrigação por microaspersão.'
    };
  }
  if (name.includes('pessego') || name.includes('pêssego') || name.includes('nectarina') || name.includes('ameixa') || sci.includes('prunus')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 18.0,
      maxBoronMgL: 0.75,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Prunóideas são muito sensíveis a cloreto e sódio; exigem solos bem drenados e água límpida.'
    };
  }
  if (name.includes('cacau') || sci.includes('theobroma')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 15.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a sais solúveis na zona radicular superficial; manter sombreamento e umidade constante.'
    };
  }
  if (name.includes('lentilha') || sci.includes('lens culinaris')) {
    return {
      category: 'graos',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.2,
      yieldLossPercentPerUnitEc: 18.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a sais solúveis e deficiência de aeração radicular.'
    };
  }
  if (name.includes('ervilha') || sci.includes('pisum sativum')) {
    return {
      category: 'graos',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a sais; queima foliar rápida se irrigada com água de CE > 1.0 dS/m.'
    };
  }

  // 3. GRAOS & CEREAIS MOD. TOLERANTES / MOD. SENSÍVEIS
  if (name.includes('trigo') || sci.includes('triticum')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 6.0,
      yieldLossPercentPerUnitEc: 7.1,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Boa tolerância osmótica no perfilhamento e espigamento; evitar estresse salino severo no enchimento de grãos.'
    };
  }
  if (name.includes('triticale') || sci.includes('triticosecale')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 6.1,
      yieldLossPercentPerUnitEc: 6.8,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Híbrido rústico com tolerância salina superior ao trigo em solos corrigidos.'
    };
  }
  if (name.includes('sorgo') || sci.includes('sorghum')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 6.8,
      yieldLossPercentPerUnitEc: 16.0,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Elevada capacidade de ajuste osmótico; suporta irrigação suplementar com água de salinidade moderada.'
    };
  }
  if (name.includes('soja') || sci.includes('glycine max')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 5.0,
      yieldLossPercentPerUnitEc: 20.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Tolerância moderada na fase vegetativa; sensibilidade crítica na germinação e no enchimento de vagens (R5).'
    };
  }
  if (name.includes('girassol') || sci.includes('helianthus')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 4.8,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Sistema radicular pivotante profundo que extrai água em horizontes menos salinos; bom ajuste osmótico no capítulo.'
    };
  }
  if (name.includes('milho') || sci.includes('zea mays')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a estresse osmótico na emergência e no pendoamento/embonecamento (VT/R1); aplicar lâmina de lixiviação se CEa > 1.1 dS/m.'
    };
  }
  if (name.includes('arroz') || sci.includes('oryza sativa')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 3.0,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível na germinação e no emborrachamento; lâmina de água contínua ajuda a diluir sais mas exige renovação periódica.'
    };
  }
  if (name.includes('amendoim') || sci.includes('arachis hypogaea')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 3.2,
      yieldLossPercentPerUnitEc: 29.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Sensível a cloretos e sais no ginecóforo e desenvolvimento de vagens submersas no solo.'
    };
  }
  if (name.includes('feijão-caupi') || name.includes('feijao-caupi') || sci.includes('vigna unguiculata')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 4.9,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Muito mais rústico e tolerante à salinidade do que o feijoeiro comum (Phaseolus).'
    };
  }
  if (name.includes('aveia') || sci.includes('avena')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 5.5,
      yieldLossPercentPerUnitEc: 8.5,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Excelente cobertura e forragem com boa rusticidade a sais.'
    };
  }
  if (name.includes('centeio') || sci.includes('secale')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 6.4,
      yieldLossPercentPerUnitEc: 7.0,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Cereal de elevada rusticidade em solos ácidos ou com salinidade marginal.'
    };
  }
  if (name.includes('canola') || sci.includes('brassica napus')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 6.5,
      yieldLossPercentPerUnitEc: 7.5,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Boa tolerância à salinidade e alta demanda por Enxofre na fertirrigação.'
    };
  }
  if (name.includes('milheto') || sci.includes('pennisetum glaucum')) {
    return {
      category: 'graos',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 5.2,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Cereal de altíssima eficiência no uso da água e boa tolerância a solos salinizados.'
    };
  }

  // 4. HORTALIÇAS & TUBÉRCULOS
  if (name.includes('espinafre') || sci.includes('spinacia')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.2,
      yieldLossPercentPerUnitEc: 7.6,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Tolera concentrações moderadas de sais sem queima marginal, mas exige irrigação uniforme.'
    };
  }
  if (name.includes('acelga') || sci.includes('cicla')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.5,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Da mesma família da beterraba; tolera sódio e boro acima da média das folhosas.'
    };
  }
  if (name.includes('brocolis') || name.includes('brócolis') || sci.includes('italica')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.8,
      yieldLossPercentPerUnitEc: 9.2,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Tolera salinidade moderada melhor que alface; alta exigência em boro e cálcio.'
    };
  }
  if (name.includes('couve-flor') || sci.includes('botrytis')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.5,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Sensível a sais na indução e formação da inflorescência (cabeça).'
    };
  }
  if (name.includes('repolho') || sci.includes('capitata')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.8,
      yieldLossPercentPerUnitEc: 9.7,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Formação de cabeça densa exige controle de salinidade para evitar necrose interna de bordas.'
    };
  }
  if (name.includes('tomate') || sci.includes('lycopersicon') || sci.includes('solanum lycopersicum')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.5,
      yieldLossPercentPerUnitEc: 9.9,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Salinidade moderada na fase de maturação eleva os sólidos solúveis (°Brix), mas reduz o calibre comercial.'
    };
  }
  if (name.includes('pepino') || sci.includes('cucumis sativus')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.5,
      yieldLossPercentPerUnitEc: 13.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Sensível ao estresse osmótico que induz frutos curvos e pontas afiladas.'
    };
  }
  if (name.includes('pimentão') || name.includes('pimentao') || name.includes('pimenta') || sci.includes('capsicum')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Suscetível à podridão apical (fundo preto) quando a salinidade inibe a absorção de Cálcio.'
    };
  }
  if (name.includes('batata') && !name.includes('doce') && !name.includes('baroa')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a cloretos na tuberização; fontes de potássio na forma de sulfato (K₂SO₄) são preferíveis ao KCl.'
    };
  }
  if (name.includes('alface') || sci.includes('lactuca')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.3,
      yieldLossPercentPerUnitEc: 13.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a cloretos e sódio; excesso de sais provoca queima de bordos (tip-burn) associado ao cálcio.'
    };
  }
  if (name.includes('rucula') || name.includes('rúcula') || sci.includes('eruca')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Ciclo ultra-curto (25 a 30 dias); manter CE da solução de fertirrigação < 1.8 dS/m para folhas tenras.'
    };
  }
  if (name.includes('melancia') || sci.includes('citrullus')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.2,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Tolera salinidade moderada na frutificação; estresse salino severo reduz o tamanho dos frutos.'
    };
  }
  if (name.includes('melão') || name.includes('melao') || sci.includes('cucumis melo')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.2,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Muito cultivado no Semiárido; água moderadamente salina (1.5-2.0 dS/m) pode intensificar a doçura dos frutos.'
    };
  }
  if (name.includes('mandioca') || sci.includes('manihot')) {
    return {
      category: 'hortalicas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Rusticidade hídrica notável, porém moderadamente sensível ao acúmulo de sais na rizosfera tuberosa.'
    };
  }

  // 5. FRUTÍFERAS
  if (name.includes('caju') || sci.includes('anacardium')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.0,
      yieldLossPercentPerUnitEc: 8.5,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Adaptado a solos arenosos e condições semiáridas com boa tolerância osmótica.'
    };
  }
  if (name.includes('goiaba') || sci.includes('psidium')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.2,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Boa capacidade de adaptação a águas com condutividade elétrica moderada sob fertirrigação.'
    };
  }
  if (name.includes('figo') || sci.includes('ficus carica')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 2.7,
      yieldLossPercentPerUnitEc: 9.0,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Frutífera rústica de origem mediterrânea com boa tolerância a sais solúveis.'
    };
  }
  if (name.includes('roma') || name.includes('romã') || sci.includes('punica granatum')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.5,
      yieldLossPercentPerUnitEc: 7.5,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Excelente adaptação a climas áridos e solos com salinidade moderada a alta.'
    };
  }
  if (name.includes('pitaya') || name.includes('pitanga') || sci.includes('hylocereus')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 2.5,
      yieldLossPercentPerUnitEc: 9.5,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Cactácea epífita rústica; evitar encharcamento e salinidade excessiva na fase de floração.'
    };
  }
  if (name.includes('uva') || sci.includes('vitis')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 9.6,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Porta-enxertos como Paulsen 1103 e Ramsey conferem resistência moderada a sais e cloretos.'
    };
  }
  if (name.includes('mamao') || name.includes('mamão') || sci.includes('carica')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.8,
      yieldLossPercentPerUnitEc: 11.0,
      maxBoronMgL: 1.2,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Crescimento rápido; sensível a alagamento e salinidade combinados na rizosfera.'
    };
  }
  if (name.includes('abacaxi') || sci.includes('ananas')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Bromeliácea com metabolismo CAM e alta eficiência hídrica, mas sensível a excesso de cloretos.'
    };
  }
  if (name.includes('acai') || name.includes('açaí') || sci.includes('euterpe oleracea')) {
    return {
      category: 'frutiferas',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.8,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.2,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Palmeira nativa de várzeas e terra firme; alta demanda hídrica, exigindo água oxigenada e baixo sódio.'
    };
  }

  // 6. PASTAGENS & FORRAGENS
  if (name.includes('capim') || name.includes('brachiaria') || name.includes('braquiaria') || name.includes('panicum') || name.includes('andropogon')) {
    return {
      category: 'pastagens',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.5,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 3.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Excelente capacidade de suporte forrageiro com boa tolerância a sais solúveis.'
    };
  }
  if (name.includes('alfafa') || sci.includes('medicago')) {
    return {
      category: 'pastagens',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 2.0,
      yieldLossPercentPerUnitEc: 7.3,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Rainha das forrageiras; tolera boro relativamente bem, mas sofre em solos com sodicidade elevada.'
    };
  }
  if (name.includes('trevo') || sci.includes('trifolium')) {
    return {
      category: 'pastagens',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 12.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Leguminosa forrageira de clima temperado; sensível a sais na germinação e fixação biológica de N.'
    };
  }

  // 7. INDUSTRIAIS
  if (name.includes('cana') || sci.includes('saccharum')) {
    return {
      category: 'industriais',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 1.7,
      yieldLossPercentPerUnitEc: 5.9,
      maxBoronMgL: 4.0,
      sodiumToleranceRating: 'alta',
      specialRecommendations: 'Curva de perda de rendimento suave (5.9%/dS/m); excelente para fertirrigação com vinhaça controlada.'
    };
  }
  if (name.includes('cafe') || name.includes('café') || sci.includes('coffea')) {
    return {
      category: 'industriais',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.5,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Excesso de sais induz queima foliar, abortamento de flores (chumbinho) e maturação desuniforme.'
    };
  }
  if (name.includes('fumo') || name.includes('tabaco') || sci.includes('nicotiana')) {
    return {
      category: 'industriais',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.8,
      yieldLossPercentPerUnitEc: 14.0,
      maxBoronMgL: 1.0,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Cloretos em excesso prejudicam severamente a combustibilidade e qualidade aromática da folha curada.'
    };
  }
  if (name.includes('dende') || name.includes('dendê') || sci.includes('elaeis')) {
    return {
      category: 'industriais',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 3.2,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Palmeira tropical com boa tolerância a variações físico-químicas da água de irrigação.'
    };
  }
  if (name.includes('mamona') || sci.includes('ricinus')) {
    return {
      category: 'industriais',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 2.8,
      yieldLossPercentPerUnitEc: 10.0,
      maxBoronMgL: 2.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Oleaginosa rústica adaptada ao Semiárido com tolerância moderada a sais.'
    };
  }

  // 8. FLORESTAIS
  if (name.includes('eucalipto') || sci.includes('eucalyptus')) {
    return {
      category: 'florestais',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 2.5,
      yieldLossPercentPerUnitEc: 8.0,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Árvore de rápido crescimento; sistema radicular profundo confere boa resiliência osmótica.'
    };
  }
  if (name.includes('pinus') || sci.includes('pinus')) {
    return {
      category: 'florestais',
      sensitivityRating: 'moderadamente_tolerante',
      thresholdEcDeciSiemensM: 2.2,
      yieldLossPercentPerUnitEc: 8.5,
      maxBoronMgL: 2.0,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Conífera com boa tolerância a solos marginais e água com baixa mineralização.'
    };
  }

  // 9. MEDICINAIS & AROMÁTICAS
  if (name.includes('alecrim') || name.includes('lavanda') || name.includes('alfazema') || name.includes('babosa') || name.includes('camomila') || name.includes('hortela') || name.includes('hortelã') || name.includes('manjericao') || name.includes('manjericão') || name.includes('oregano') || name.includes('orégano') || name.includes('tomilho') || name.includes('stevia') || name.includes('vetiver') || name.includes('boldo') || name.includes('carqueja') || name.includes('citronela') || name.includes('yacon') || name.includes('zimbro')) {
    return {
      category: 'medicinais',
      sensitivityRating: 'moderadamente_sensivel',
      thresholdEcDeciSiemensM: 1.8,
      yieldLossPercentPerUnitEc: 11.0,
      maxBoronMgL: 1.5,
      sodiumToleranceRating: 'moderada',
      specialRecommendations: 'Estresse osmótico moderado pode estimular a síntese de óleos essenciais, mas reduz a biomassa foliar.'
    };
  }

  // 10. ORNAMENTAIS
  if (name.includes('anturio') || name.includes('antúrio') || name.includes('orquidea') || name.includes('orquídea') || name.includes('rosa') || name.includes('crisantemo') || name.includes('gerbera') || name.includes('lirio') || name.includes('gladiolo') || name.includes('begonia') || name.includes('violeta') || name.includes('crav')) {
    return {
      category: 'ornamentais',
      sensitivityRating: 'sensivel',
      thresholdEcDeciSiemensM: 1.2,
      yieldLossPercentPerUnitEc: 18.0,
      maxBoronMgL: 0.8,
      sodiumToleranceRating: 'baixa',
      specialRecommendations: 'Sensível a manchas foliares e queima de pétalas por sais dissolvidos na irrigação por aspersão.'
    };
  }

  // Fallback category heuristic based on name/family
  let category: CropCategory = 'hortalicas';
  if (name.includes('capim') || name.includes('brachiaria') || name.includes('braquiaria') || name.includes('panicum') || name.includes('trevo') || name.includes('alfafa') || name.includes('forrag') || name.includes('pastagem') || name.includes('calopogonio') || name.includes('crotalaria') || name.includes('estilosantes')) {
    category = 'pastagens';
  } else if (name.includes('soja') || name.includes('milho') || name.includes('trigo') || name.includes('arroz') || name.includes('sorgo') || name.includes('aveia') || name.includes('centeio') || name.includes('cevada') || name.includes('triticale') || name.includes('girassol') || name.includes('amendoim') || name.includes('grao') || name.includes('lentilha') || name.includes('ervilha') || name.includes('quinoa') || name.includes('gergelim') || name.includes('canola') || name.includes('linho')) {
    category = 'graos';
  } else if (name.includes('uva') || name.includes('maca') || name.includes('maçã') || name.includes('pera') || name.includes('pêra') || name.includes('pessego') || name.includes('pêssego') || name.includes('ameixa') || name.includes('goiaba') || name.includes('caju') || name.includes('mamao') || name.includes('mamão') || name.includes('abacaxi') || name.includes('melancia') || name.includes('melao') || name.includes('melão') || name.includes('figo') || name.includes('cacau') || name.includes('acai') || name.includes('açaí') || name.includes('acerola') || name.includes('amora') || name.includes('framboesa') || name.includes('mirtilo') || name.includes('pitaya') || name.includes('pitanga') || name.includes('jabuticaba') || name.includes('roma') || name.includes('romã') || name.includes('carambola') || name.includes('graviola') || name.includes('atem') || name.includes('kiwi') || name.includes('lichia') || name.includes('noz') || name.includes('castanha') || name.includes('cupuacu') || name.includes('cupuaçu') || name.includes('marolo') || name.includes('marmelo') || name.includes('uvaia') || name.includes('sapoti') || name.includes('tamarindo')) {
    category = 'frutiferas';
  } else if (name.includes('cana') || name.includes('cafe') || name.includes('café') || name.includes('algod') || name.includes('fumo') || name.includes('tabaco') || name.includes('seringueira') || name.includes('dende') || name.includes('dendê') || name.includes('mamona') || name.includes('pinhao') || name.includes('pinhão') || name.includes('eucalipto') || name.includes('pinus') || name.includes('cha') || name.includes('chá') || name.includes('erva-mate') || name.includes('urucum') || name.includes('juta') || name.includes('malva')) {
    category = 'industriais';
  } else if (name.includes('teca') || name.includes('mogno') || name.includes('cedro') || name.includes('parica') || name.includes('paricá') || name.includes('acacia') || name.includes('acácia') || name.includes('guanandi') || name.includes('bambu') || name.includes('candeia') || name.includes('khaya')) {
    category = 'florestais';
  }

  return {
    category,
    sensitivityRating: 'moderadamente_sensivel',
    thresholdEcDeciSiemensM: 1.6,
    yieldLossPercentPerUnitEc: 12.0,
    maxBoronMgL: 1.2,
    sodiumToleranceRating: 'baixa',
    specialRecommendations: 'Monitorar a condutividade elétrica da água de irrigação e manter drenagem adequada na rizosfera.'
  };
}

// Build complete master salinity database dynamically from all 253 system crops:
export const FULL_CROP_SALINITY_DATABASE: CropSalinityTolerance[] = CROP_PLANTING_RECOMMENDATIONS_250
  .map(crop => {
    const profile = resolveSalinityProfile(crop.cropName, crop.scientificName || '');
    return {
      cropName: crop.cropName,
      scientificName: crop.scientificName,
      category: profile.category,
      sensitivityRating: profile.sensitivityRating,
      thresholdEcDeciSiemensM: profile.thresholdEcDeciSiemensM,
      yieldLossPercentPerUnitEc: profile.yieldLossPercentPerUnitEc,
      maxBoronMgL: profile.maxBoronMgL,
      sodiumToleranceRating: profile.sodiumToleranceRating,
      specialRecommendations: profile.specialRecommendations,
    };
  })
  .sort((a, b) => a.cropName.localeCompare(b.cropName, 'pt-BR'));
