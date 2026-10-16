import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da Bio Controle
 * Registrante: Bio Controle - Métodos de Controle de Pragas Ltda.
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: 27 produtos biológicos, semioquímicos e feromônios para manejo integrado (MIP).
 */

interface RawBioProduct {
  reg: string;
  name: string;
  ai: string;
  conc: string;
  class: string;
  tox: string; // "5" | "Não"
  env: string; // "IV" | "-"
}

const RAW_PRODUCTS: RawBioProduct[] = [
  { reg: '6095', name: 'Agree', ai: 'Bacillus thuringiensis (Produto Microbiológico)', conc: '500 g/kg', class: 'Inseticida Microbiológico', tox: '5', env: 'IV' },
  { reg: '35519', name: 'Bio Bacteriophora', ai: 'Heterorhabditis bacteriophora (Nematóides entomopatogênicos)', conc: '100 g/kg', class: 'Agente Biológico de Controle', tox: 'Não', env: 'IV' },
  { reg: '8805', name: 'Bio BM', ai: '5,9-dimetilpentadecano (hidrocarboneto)', conc: '1,95 g/kg', class: 'Feromônio', tox: 'Não', env: '-' },
  { reg: '9406', name: 'Bio Bonagota', ai: 'acetato de (Z)-5-dodecenila + acetato de (E,Z)-3,5-dodecadienila + acetato de (Z)-9-hexadecenila', conc: '0,02 g/kg + 0,039 g/kg + 0,00091 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '9606', name: 'Bio Broca', ai: 'metanol + etanol (álcool alifático)', conc: '596 ml/L + 370 ml/L', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '9506', name: 'Bio Carambolae', ai: 'eugenol-metilico (éter aromático)', conc: '994 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '45025', name: 'Bio Furão', ai: 'acetato de (E)-8-dodecenila (acetato insaturado)', conc: '4,5 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '7415', name: 'Bio Helicoverpa', ai: '(Z)-11-Hexadecenal (aldeído)', conc: '1,49 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '13817', name: 'Bio Lobesia', ai: '(E,Z)-dodeca-7,9-dienyl acetate (feromônio)', conc: '2,55 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '01302', name: 'Bio Neo', ai: '(Z,Z,Z)-3,6,9-tricosatrieno + E-11-hexadecenol', conc: '0,23 g/kg + 0,23 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '6311', name: 'Bio Pseudoplusia', ai: 'acetato de (Z)-7-dodecenila (acetato insaturado)', conc: '10,45 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '6799', name: 'Bio Serrico', ai: 'serricornim (cetona alifática)', conc: '240 g/kg', class: 'Feromônio', tox: 'Não', env: '-' },
  { reg: '2403', name: 'Bio Spodoptera', ai: 'acetato de (Z)-11-hexadecenila + acetato de (Z)-7-dodecenila + acetato de (Z)-9-tetradecenila', conc: '0,00066 g/kg + 0,00066 g/kg + 0,00066 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '25623', name: 'Bio Stenoma', ai: '(Z)-9,13-Tetradecadienal (aldeído)', conc: '0,86 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '3901', name: 'Bio Trimedlure', ai: 'trimedlure (ésteres saturados)', conc: '558,8 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '6805', name: 'Bio Tuta', ai: 'acetato de (E,Z,Z)-3,8,11-tetradecatrienila', conc: '0,041 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '7998', name: 'Biocydia', ai: 'codlelure (clodemônio) (álcool insaturado)', conc: '2,7 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '08001', name: 'Biographolita', ai: 'álcool laurílico + acetato de (Z)-8-dodecenila + (Z)-8-dodecenol + acetato de (E)-8-dodecenila', conc: '0,13 g/kg + 0,13 g/kg + 0,13 g/kg + 0,13 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '07426', name: 'Cera Trap', ai: 'Proteína hidrolisada de mucosa intestinal de suínos (Amina cíclica)', conc: '55 g/kg', class: 'Semioquímico', tox: '5', env: 'IV' },
  { reg: '6699', name: 'Cosmolure', ai: 'sordidim (cetal bicíclico)', conc: '2,26 g/kg', class: 'Feromônio', tox: 'Não', env: '-' },
  { reg: '03401', name: 'Gachon', ai: 'acetato de (Z,E)-9,12-tetradecadienil', conc: '6,25 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '27318', name: 'Isomate-OFM TT', ai: 'acetato de (Z)-8-dodecenila + acetato de (E)-8-dodecenila + (Z)-8-dodecenol', conc: '198,27 g + 11,96 g + 2,2 g', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '22825', name: 'Isonet-T; Isonet-Tuta', ai: 'acetato de (E,Z,Z)-3,8,11-tetradecatrienila + acetato de (E,Z)-3,8-tetradecadienila', conc: '707 g/kg + 77 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '9008', name: 'Luretape BW-10', ai: 'grandlure (I, II, III e IV) (álcool alifático)', conc: '15,14 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '8098', name: 'Migdo', ai: 'N-2\'S-metilbutil-2-metilbutilamida (amida)', conc: '34 g/kg', class: 'Feromônio', tox: 'Não', env: '-' },
  { reg: '3102', name: 'RMD-1', ai: 'rincoforol (álcool alifático)', conc: '524,6 g/kg', class: 'Feromônio', tox: 'Não', env: 'IV' },
  { reg: '1608491', name: 'Thuricide', ai: 'Bacillus thuringiensis var. kurstaki, isolado HD-1 (S1450)', conc: '32 g/kg', class: 'Inseticida Microbiológico', tox: '5', env: 'IV' }
];

function getToxicologicalClass(tox: string): string {
  if (tox === '5') return 'Classe V - Improvável de Causar Dano Agudo';
  return 'Não Classificado - Baixo Risco Toxicológico';
}

function getEnvironmentalClass(env: string): string {
  if (env === 'IV') return 'Classe IV - Produto Pouco Perigoso ao Meio Ambiente';
  return 'Não Classificado - Praticamente Não Tóxico ao Meio Ambiente';
}

function getFormulation(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('MIGDO') || upper.includes('RMD-1') || upper.includes('COSMOLURE') || upper.includes('LURETAPE')) {
    return 'Outro - Dispositivo Difusor de Feromônio';
  }
  if (upper.includes('CERA TRAP')) return 'SL - Concentrado Solúvel';
  if (upper.includes('AGREE') || upper.includes('THURICIDE')) return 'WP - Pó Molhável';
  return 'Outro - Isca ou Armadilha de Feromônio Fisiológica';
}

function getBiologicalDetails(name: string, ai: string): { crop: string[]; target: string; desc: string } {
  const upper = name.toUpperCase();
  if (upper.includes('AGREE') || upper.includes('THURICIDE')) {
    return {
      crop: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Hortaliças'],
      target: 'Lagarta-do-cartucho (Spodoptera frugiperda), Lagarta-falsa-medideira (Chrysodeixis includens)',
      desc: 'Inseticida microbiológico altamente seletivo que atua por ingestão, provocando a paralisia do canal alimentar das lagartas.'
    };
  }
  if (upper.includes('BACTERIOPHORA')) {
    return {
      crop: ['Frutíferas', 'Flores', 'Hortaliças', 'Cultivos Protegidos'],
      target: 'Larvas de insetos de solo e nematoides fitoparasitas',
      desc: 'Nematóide entomopatogênico que busca ativamente pragas de solo, liberando bactérias simbióticas letais às pragas.'
    };
  }
  if (upper.includes('CERA TRAP')) {
    return {
      crop: ['Pêssego', 'Maçã', 'Citros', 'Uva', 'Goiaba', 'Manga'],
      target: 'Mosca-das-frutas (Ceratitis capitata e Anastrepha fraterculus)',
      desc: 'Semioquímico atrativo alimentar líquido 100% natural baseado em proteínas hidrolisadas de alta qualidade para captura massiva.'
    };
  }
  if (upper.includes('TUTA') || upper.includes('ISONET-T')) {
    return {
      crop: ['Tomate', 'Batata', 'Beringela'],
      target: 'Traça-do-tomateiro (Tuta absoluta)',
      desc: 'Feromônio de confusão sexual e monitoramento populacional altamente específico, reduzindo os acasalamentos viáveis da praga.'
    };
  }
  if (upper.includes('GRAPHOLITA') || upper.includes('ISOMATE-OFM')) {
    return {
      crop: ['Maçã', 'Pera', 'Pêssego', 'Ameixa'],
      target: 'Mariposa-oriental (Grapholita molesta)',
      desc: 'Feromônio sintético idêntico ao natural para confusão sexual e monitoramento, minimizando danos em pomares.'
    };
  }
  if (upper.includes('CYDIA') || upper.includes('BIOCYDIA')) {
    return {
      crop: ['Maçã', 'Pera'],
      target: 'Cydia pomonella (Mariposa-da-maçã)',
      desc: 'Dispositivo difusor de feromônio específico para interrupção do acasalamento de Cydia pomonella.'
    };
  }
  if (upper.includes('SPODOPTERA')) {
    return {
      crop: ['Milho', 'Soja', 'Algodão', 'Sorgo'],
      target: 'Lagarta-do-cartucho (Spodoptera frugiperda)',
      desc: 'Feromônio de monitoramento de alta especificidade para determinação do nível de dano econômico no campo.'
    };
  }
  if (upper.includes('PSEUDOPLUSIA')) {
    return {
      crop: ['Soja', 'Algodão', 'Feijão', 'Girassol'],
      target: 'Lagarta-falsa-medideira (Chrysodeixis includens)',
      desc: 'Feromônio sexual sintético para atração de machos, permitindo mapeamento preciso da flutuação populacional.'
    };
  }
  if (upper.includes('HELICOVERPA')) {
    return {
      crop: ['Soja', 'Milho', 'Algodão', 'Tomate'],
      target: 'Lagarta-da-espiga (Helicoverpa armigera)',
      desc: 'Feromônio específico de monitoramento de Helicoverpa armigera para otimização da tomada de decisão de controle.'
    };
  }
  if (upper.includes('BROCA')) {
    return {
      crop: ['Café'],
      target: 'Broca-do-café (Hypothenemus hampei)',
      desc: 'Atrativo semioquímico composto de álcoois alifáticos para detecção e monitoramento de focos de infestação na lavoura.'
    };
  }
  if (upper.includes('CARAMBOLAE')) {
    return {
      crop: ['Carambola', 'Manga', 'Goiaba', 'Frutas tropicais'],
      target: 'Mosca-da-carambola (Bactrocera carambolae)',
      desc: 'Feromônio de monitoramento e controle para controle de quarentena da Mosca-da-carambola.'
    };
  }
  if (upper.includes('RMD') || upper.includes('RINCOFOROL')) {
    return {
      crop: ['Coco', 'Dendê', 'Palmeiras'],
      target: 'Broca-do-olho-do-coqueiro (Rhynchophorus palmarum)',
      desc: 'Feromônio de agregação de alta atração para captura de adultos, diminuindo o vetor do anel-vermelho-do-coqueiro.'
    };
  }
  if (upper.includes('LURETAPE') || upper.includes('BW-10')) {
    return {
      crop: ['Algodão'],
      target: 'Bicudo-do-algodoeiro (Anthonomus grandis)',
      desc: 'Fita difusora impregnada com Grandlure para atração em armadilhas de monitoramento em perímetros de plantio.'
    };
  }
  if (upper.includes('COSMOLURE')) {
    return {
      crop: ['Banana'],
      target: 'Moleque-da-bananeira (Cosmopolites sordidus)',
      desc: 'Feromônio de agregação específico (Sordidim) para armadilhas de captura de adultos da broca-da-bananeira.'
    };
  }
  if (upper.includes('SERRICO')) {
    return {
      crop: ['Grãos Armazenados', 'Tabaco', 'Alimentos Processados'],
      target: 'Bicho-do-fumo (Lasioderma serricorne)',
      desc: 'Feromônio sexual altamente específico para armadilhas adesivas em silos e indústrias de beneficiamento.'
    };
  }
  if (upper.includes('TRIMEDLURE')) {
    return {
      crop: ['Frutíferas', 'Citros', 'Uva'],
      target: 'Mosca-do-mediterrâneo (Ceratitis capitata)',
      desc: 'Atrativo feromonal sintético específico para monitoramento de machos da mosca Ceratitis capitata.'
    };
  }

  return {
    crop: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Hortifrúti'],
    target: 'Controle fisiológico e monitoramento seletivo de pragas-alvo de relevância econômica',
    desc: `Feromônio/Semioquímico desenvolvido pela Bio Controle para manejo fitossanitário ecológico e integrativo.`
  };
}

export const BIOCONTROLE_OFFICIAL_CATALOG: PesticideProduct[] = RAW_PRODUCTS.map((raw, idx) => {
  const uniqueId = `agro-bio-${String(idx + 1).padStart(4, '0')}`;
  const formulation = getFormulation(raw.name);
  const bioInfo = getBiologicalDetails(raw.name, raw.ai);

  return {
    id: uniqueId,
    productName: `${raw.name} (${raw.conc})`,
    registrationNumber: raw.reg,
    activeIngredient: `${raw.ai} (${raw.conc})`,
    chemicalGroup: raw.class,
    manufacturer: 'Bio Controle - Métodos de Controle de Pragas Ltda.',
    agrochemicalClass: (raw.class === 'Agente Biológico de Controle' ? 'Biológico' : raw.class) as any,
    toxicologicalClass: getToxicologicalClass(raw.tox) as any,
    environmentalClass: getEnvironmentalClass(raw.env),
    formulation: formulation as any,
    reentryIntervalHours: 4, // Biological/Pheromone usually have very short reentry intervals
    modeOfAction: bioInfo.desc,
    packageSizes: [1, 5, 10],
    indications: bioInfo.crop.map((cropName, cIdx) => ({
      id: `${uniqueId}-ind-${cIdx + 1}`,
      cropName,
      recommendedDosage: 1.0,
      dosageUnit: 'Outro' as any,
      targetOrganism: bioInfo.target,
      applicationPhase: 'Instalação de armadilhas para monitoramento, captura massiva ou aplicação microbiológica preventiva',
      gracePeriodDays: 0, // Biological and Pheromone products typically have 0 days grace period
      maxApplicationsPerSeason: 4,
      recommendedSprayVolumeLha: 100
    }))
  };
});
