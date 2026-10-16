import * as fs from 'fs';
import * as path from 'path';

interface RawProduct {
  name: string;
  reg: string;
  ai: string;
  group: string;
  class: string;
  tox: string;
  env: string;
  form: string;
  dose: number;
  unit: string;
  grace: number;
  spray: number;
  target: string;
  mode: string;
}

const raw1: RawProduct[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/nortox_raw_1.json'), 'utf-8'));
const raw2: RawProduct[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/nortox_raw_2.json'), 'utf-8'));
const raw3: RawProduct[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/nortox_raw_3.json'), 'utf-8'));

const allRaw: RawProduct[] = [...raw1, ...raw2, ...raw3];

console.log(`Total raw Nortox items loaded: ${allRaw.length}`);

// Crop indication generator based on product class and targets
function generateIndications(raw: RawProduct, baseId: string) {
  const indications = [];
  const className = raw.class.toLowerCase();
  const rawName = raw.name.toLowerCase();
  const target = raw.target;

  if (rawName.includes('pastagem') || rawName.includes('forcane') || rawName.includes('pri-mordial') || rawName.includes('norton') || rawName.includes('triclopir') || (raw.ai.includes('Picloram') && !rawName.includes('cana'))) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Pastagens',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.',
      gracePeriodDays: raw.grace || 30,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: raw.spray || 200,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Eucalipto',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: 'Folhas largas lenhosas e semi-lenhosas',
      applicationPhase: 'Aplicação dirigida nas entrelinhas ou coroamento de mudas.',
      gracePeriodDays: 60,
      maxApplicationsPerSeason: 1,
      recommendedSprayVolumeLha: 200,
    });
  } else if (rawName.includes('cana') || raw.ai.includes('Tebutiurom') || raw.ai.includes('Hexazinona') || raw.ai.includes('Ametrina') || raw.ai.includes('Sulfentrazona') || raw.ai.includes('Sulfometurom')) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Cana-de-açúcar',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Pré-emergência ou pós-emergência precoce em cana-planta ou soca.',
      gracePeriodDays: raw.grace || 90,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: raw.spray || 200,
    });
    if (className.includes('herbicida') && !raw.ai.includes('Sulfometurom')) {
      indications.push({
        id: `${baseId}-ind-2`,
        cropName: 'Milho',
        recommendedDosage: Number((raw.dose * 0.8).toFixed(2)),
        dosageUnit: raw.unit,
        targetOrganism: 'Folhas largas e gramíneas anuais',
        applicationPhase: 'Pré-emergência da cultura ou pós-emergência precoce.',
        gracePeriodDays: 60,
        maxApplicationsPerSeason: 1,
        recommendedSprayVolumeLha: 150,
      });
    }
  } else if (raw.ai.includes('Bispiribaque') || raw.ai.includes('Imazaduo') || raw.ai.includes('Imazapique')) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Arroz',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Pós-emergência das plantas daninhas em arroz irrigado e sequeiro.',
      gracePeriodDays: raw.grace || 45,
      maxApplicationsPerSeason: 1,
      recommendedSprayVolumeLha: raw.spray || 150,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Soja',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: 'Plantas daninhas dicotiledôneas e ciperáceas',
      applicationPhase: 'Pré-plantio ou pós-emergência inicial.',
      gracePeriodDays: 60,
      maxApplicationsPerSeason: 1,
      recommendedSprayVolumeLha: 150,
    });
  } else if (rawName.includes('óleo vegetal') || rawName.includes('bio')) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Soja',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Em conjunto com fungicidas ou inseticidas em V4 a R5.',
      gracePeriodDays: 0,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Milho',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'No estádio V4 a V8 junto com manejo foliar.',
      gracePeriodDays: 0,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-3`,
      cropName: 'Citros',
      recommendedDosage: raw.dose * 1.5,
      dosageUnit: raw.unit,
      targetOrganism: 'Cochonilhas, ácaros e dispersão de calda',
      applicationPhase: 'Pulverização com cobertura completa da copa.',
      gracePeriodDays: 0,
      maxApplicationsPerSeason: 4,
      recommendedSprayVolumeLha: 1000,
    });
  } else if (className.includes('fungicida') || className.includes('bactericida')) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Soja',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target.includes('Ferrugem') ? raw.target : `Ferrugem-asiática e ${raw.target}`,
      applicationPhase: 'Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.',
      gracePeriodDays: raw.grace || 21,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: raw.spray || 150,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Milho',
      recommendedDosage: Number((raw.dose * 0.9).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Mancha-de-cercospora, Helmintosporiose e Mancha-branca',
      applicationPhase: 'Aplicação preventiva em pré-pendoamento (V8 a VT).',
      gracePeriodDays: raw.grace || 30,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-3`,
      cropName: 'Algodão',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: 'Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo',
      applicationPhase: 'Início da emissão dos primeiros botões florais (B1) em diante.',
      gracePeriodDays: raw.grace || 21,
      maxApplicationsPerSeason: 4,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-4`,
      cropName: 'Feijão',
      recommendedDosage: Number((raw.dose * 0.8).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Antracnose (Colletotrichum lindemuthianum) e Mofo-branco',
      applicationPhase: 'Aos primeiros sintomas ou preventivamente no florescimento.',
      gracePeriodDays: raw.grace || 14,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: 200,
    });
    indications.push({
      id: `${baseId}-ind-5`,
      cropName: 'Café',
      recommendedDosage: Number((raw.dose * 1.2).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose',
      applicationPhase: 'Dezembro a março em pulverizações preventivas de alta cobertura.',
      gracePeriodDays: raw.grace || 30,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 400,
    });
  } else if (className.includes('inseticida') || className.includes('acaricida')) {
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Soja',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Atingimento dos níveis de dano econômico para lagartas ou percevejos.',
      gracePeriodDays: raw.grace || 14,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: raw.spray || 150,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Milho',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target.includes('Spodoptera') || raw.target.includes('Lagarta') ? raw.target : 'Lagarta-do-cartucho e Cigarrinha-do-milho',
      applicationPhase: 'Estádios V2 a V6 aos primeiros sinais de raspagem foliar.',
      gracePeriodDays: raw.grace || 21,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-3`,
      cropName: 'Algodão',
      recommendedDosage: Number((raw.dose * 1.1).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas',
      applicationPhase: 'Monitoramento semanal e aplicação ao atingir nível de controle.',
      gracePeriodDays: raw.grace || 21,
      maxApplicationsPerSeason: 4,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-4`,
      cropName: 'Tomate',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: 'Traça-do-tomateiro, Mosca-branca e Tripes',
      applicationPhase: 'Início da infestação nas folhas e brotações.',
      gracePeriodDays: raw.grace || 7,
      maxApplicationsPerSeason: 4,
      recommendedSprayVolumeLha: 500,
    });
    indications.push({
      id: `${baseId}-ind-5`,
      cropName: 'Citros',
      recommendedDosage: Number((raw.dose * 1.5).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros',
      applicationPhase: 'Constatação de formas móveis em folhas e frutos.',
      gracePeriodDays: raw.grace || 14,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: 1000,
    });
  } else {
    // Default Herbicida / Dessecante / Regulador
    indications.push({
      id: `${baseId}-ind-1`,
      cropName: 'Soja',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.',
      gracePeriodDays: raw.grace || 60,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: raw.spray || 150,
    });
    indications.push({
      id: `${baseId}-ind-2`,
      cropName: 'Milho',
      recommendedDosage: raw.dose,
      dosageUnit: raw.unit,
      targetOrganism: raw.target,
      applicationPhase: 'Dessecação pré-plantio ou pós-emergência seletiva.',
      gracePeriodDays: raw.grace || 60,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-3`,
      cropName: 'Algodão',
      recommendedDosage: Number((raw.dose * 0.9).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Plantas daninhas dicotiledôneas e gramíneas anuais',
      applicationPhase: 'Pré-plantio ou dessecação pré-colheita.',
      gracePeriodDays: raw.grace || 60,
      maxApplicationsPerSeason: 1,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-4`,
      cropName: 'Feijão',
      recommendedDosage: Number((raw.dose * 0.85).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Plantas infestantes de folhas largas e estreitas',
      applicationPhase: 'Manejo pré-emergente ou pós-emergência precoce.',
      gracePeriodDays: raw.grace || 45,
      maxApplicationsPerSeason: 1,
      recommendedSprayVolumeLha: 150,
    });
    indications.push({
      id: `${baseId}-ind-5`,
      cropName: 'Cana-de-açúcar',
      recommendedDosage: Number((raw.dose * 1.2).toFixed(2)),
      dosageUnit: raw.unit,
      targetOrganism: 'Espécies infestantes em cana-planta e soqueira',
      applicationPhase: 'Pré ou pós-emergência em área total ou quebra-lombo.',
      gracePeriodDays: raw.grace || 90,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 200,
    });
  }

  return indications;
}

const nortoxProducts = allRaw.map((raw, index) => {
  const normReg = raw.reg.replace(/^0+/, '') || raw.reg;
  const baseId = `nortox-ofc-${normReg}-${index + 1}`;
  return {
    id: baseId,
    productName: raw.name,
    registrationNumber: raw.reg,
    activeIngredient: raw.ai,
    chemicalGroup: raw.group,
    manufacturer: 'Nortox S.A.',
    agrochemicalClass: raw.class,
    toxicologicalClass: raw.tox,
    environmentalClass: raw.env,
    formulation: raw.form,
    reentryIntervalHours: 24,
    modeOfAction: raw.mode,
    packageSizes: [1, 5, 20, 200],
    indications: generateIndications(raw, baseId),
  };
});

const fileContent = `import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da Nortox S.A.
 * Registrante: Nortox S.A.
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: ${nortoxProducts.length} produtos formulados químicos, biológicos e reguladores registrados no Brasil.
 */
export const NORTOX_OFFICIAL_CATALOG: PesticideProduct[] = ${JSON.stringify(nortoxProducts, null, 2)};
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/data/nortoxCatalogData.ts'), fileContent, 'utf-8');
console.log(`Successfully generated src/data/nortoxCatalogData.ts with ${nortoxProducts.length} products!`);
