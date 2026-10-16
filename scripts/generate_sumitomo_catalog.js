import fs from 'fs';
import path from 'path';

// Complete dataset from MAPA / AGROFIT for SUMITOMO CHEMICAL
const sumitomoList = [
  // Page 1 (SP)
  {
    id: 'sumitomo-37125',
    productName: 'Aveo ST',
    registrationNumber: '37125',
    activeIngredient: 'Bacillus amyloliquefaciens cepa PTA-4838 (270 g/L)',
    chemicalGroup: 'Biológico / Microbiológico',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - São Paulo/SP',
    agrochemicalClass: 'Nematicida',
    toxicologicalClass: 'Classe V - Improvável de Causar Dano Agudo',
    environmentalClass: 'Classe IV - Pouco Perigoso',
    formulation: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    modeOfAction: 'Colonização da rizosfera radicular formando biofilme protetor e induzindo respostas de defesa contra fitonematoides.',
    crops: [
      { cropName: 'Soja', recommendedDosage: 50, dosageUnit: 'mL/100kg sementes', targetOrganism: 'Nematoide-das-galhas (Meloidogyne incognita / Meloidogyne javanica), Pratylenchus brachyurus', gracePeriodDays: 0 },
      { cropName: 'Milho', recommendedDosage: 40, dosageUnit: 'mL/100kg sementes', targetOrganism: 'Pratylenchus zeae, Meloidogyne javanica', gracePeriodDays: 0 },
      { cropName: 'Algodão', recommendedDosage: 60, dosageUnit: 'mL/100kg sementes', targetOrganism: 'Meloidogyne incognita, Rotylenchulus reniformis', gracePeriodDays: 0 }
    ]
  },
  // Page 1 (CE)
  {
    id: 'sumitomo-01520',
    productName: 'Abaday',
    registrationNumber: '01520',
    activeIngredient: 'Tiodicarbe (300 g/L) + Lufenurom (50 g/L)',
    chemicalGroup: 'Metilcarbamato de oxima + Benzoiluréia',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Inseticida',
    toxicologicalClass: 'Classe IV - Pouco Tóxico',
    environmentalClass: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    formulation: 'SC - Suspensão Concentrada',
    modeOfAction: 'Inibição da enzima acetilcolinesterase combinada à inibição da biossíntese de quitina com forte ação ovicida e larvicida.',
    crops: [
      { cropName: 'Soja', recommendedDosage: 0.35, dosageUnit: 'L/ha', targetOrganism: 'Lagarta-da-soja (Anticarsia gemmatalis), Falsa-medideira (Chrysodeixis includens), Spodoptera eridania', gracePeriodDays: 30 },
      { cropName: 'Milho', recommendedDosage: 0.4, dosageUnit: 'L/ha', targetOrganism: 'Lagarta-do-cartucho (Spodoptera frugiperda), Helicoverpa zea', gracePeriodDays: 30 },
      { cropName: 'Algodão', recommendedDosage: 0.45, dosageUnit: 'L/ha', targetOrganism: 'Curuquerê (Alabama argillacea), Lagarta-das-maçãs (Heliothis virescens)', gracePeriodDays: 28 }
    ]
  },
  {
    id: 'sumitomo-03801',
    productName: 'Abamex',
    registrationNumber: '03801',
    activeIngredient: 'Abamectina (18 g/L)',
    chemicalGroup: 'Avermectina',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Acaricida',
    toxicologicalClass: 'Classe IV - Pouco Tóxico',
    environmentalClass: 'Classe III - Produto Perigoso ao Meio Ambiente',
    formulation: 'EC - Concentrado Emulsionável',
    modeOfAction: 'Ativação dos canais de cloro mediada pelo GABA, bloqueando a transmissão de impulsos nervosos.',
    crops: [
      { cropName: 'Citros', recommendedDosage: 50, dosageUnit: 'mL/100L de água', targetOrganism: 'Ácaro-da-falsa-ferrugem (Phyllocoptruta oleivora), Larva-minadora (Phyllocnistis citrella)', gracePeriodDays: 7 },
      { cropName: 'Café', recommendedDosage: 0.75, dosageUnit: 'L/ha', targetOrganism: 'Bicho-mineiro-do-café (Leucoptera coffeella), Ácaro-vermelho (Oligonychus ilicis)', gracePeriodDays: 14 },
      { cropName: 'Tomate', recommendedDosage: 75, dosageUnit: 'mL/100L de água', targetOrganism: 'Traça-do-tomateiro (Tuta absoluta), Ácaro-rajado (Tetranychus urticae)', gracePeriodDays: 3 },
      { cropName: 'Soja', recommendedDosage: 0.2, dosageUnit: 'L/ha', targetOrganism: 'Ácaro-rajado (Tetranychus urticae)', gracePeriodDays: 21 }
    ]
  },
  {
    id: 'sumitomo-02823',
    productName: 'Accede',
    registrationNumber: '02823',
    activeIngredient: '1-Aminocyclopropane-1-carboxylic acid (ACC) (400 g/kg)',
    chemicalGroup: 'Precursor de etileno',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Regulador de Crescimento',
    toxicologicalClass: 'Classe V - Improvável de Causar Dano Agudo',
    environmentalClass: 'Classe IV - Pouco Perigoso',
    formulation: 'SG - Grânulos Solúveis em Água',
    modeOfAction: 'Estimulação biológica da síntese endógena de etileno para raleio químico uniforme de frutinhos jovens.',
    crops: [
      { cropName: 'Maçã', recommendedDosage: 300, dosageUnit: 'g/ha', targetOrganism: 'Raleio químico de frutinhos e uniformização da carga da copa', gracePeriodDays: 30 },
      { cropName: 'Pêssego', recommendedDosage: 250, dosageUnit: 'g/ha', targetOrganism: 'Raleio de frutos para ganho de calibre comercial', gracePeriodDays: 30 }
    ]
  },
  {
    id: 'sumitomo-35521',
    productName: 'Accel',
    registrationNumber: '35521',
    activeIngredient: '6-Benziladenina (20 g/L)',
    chemicalGroup: 'Citocinina sintética',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Regulador de Crescimento',
    toxicologicalClass: 'Classe V - Improvável de Causar Dano Agudo',
    environmentalClass: 'Classe IV - Pouco Perigoso',
    formulation: 'SL - Concentrado Solúvel',
    modeOfAction: 'Estímulo à divisão e elongação celular e incremento no diâmetro e peso de frutos.',
    crops: [
      { cropName: 'Maçã', recommendedDosage: 0.75, dosageUnit: 'L/ha', targetOrganism: 'Aumento de calibre de frutos e raleio controlado', gracePeriodDays: 30 },
      { cropName: 'Pera', recommendedDosage: 0.5, dosageUnit: 'L/ha', targetOrganism: 'Raleio de frutos e melhora do pegamento', gracePeriodDays: 30 }
    ]
  },
  {
    id: 'sumitomo-0417',
    productName: 'Acefato Sumitomo 750 SP',
    registrationNumber: '0417',
    activeIngredient: 'Acefato (750 g/kg)',
    chemicalGroup: 'Organofosforado',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Inseticida',
    toxicologicalClass: 'Classe II - Altamente Tóxico',
    environmentalClass: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    formulation: 'SP - Pó Solúvel',
    modeOfAction: 'Inibidor sistêmico da acetilcolinesterase (AChE) com rápida absorção e efeito residual.',
    crops: [
      { cropName: 'Soja', recommendedDosage: 0.7, dosageUnit: 'kg/ha', targetOrganism: 'Percevejo-marrom (Euschistus heros), Percevejo-verde-pequeno (Piezodorus guildinii)', gracePeriodDays: 14 },
      { cropName: 'Algodão', recommendedDosage: 0.8, dosageUnit: 'kg/ha', targetOrganism: 'Pulgão-do-algodoeiro (Aphis gossypii), Tripes (Frankliniella schultzei), Bicudo', gracePeriodDays: 21 },
      { cropName: 'Feijão', recommendedDosage: 0.6, dosageUnit: 'kg/ha', targetOrganism: 'Mosca-branca (Bemisia tabaci), Cigarrinha-verde (Empoasca kraemeri)', gracePeriodDays: 14 }
    ]
  },
  {
    id: 'sumitomo-2708',
    productName: 'Addit',
    registrationNumber: '2708',
    activeIngredient: 'Picloram (103 g/L) + 2,4-D-trietanolamina (406 g/L)',
    chemicalGroup: 'Ácido piridinocarboxílico + Ácido ariloxialcanóico',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Herbicida',
    toxicologicalClass: 'Classe V - Improvável de Causar Dano Agudo',
    environmentalClass: 'Classe III - Produto Perigoso ao Meio Ambiente',
    formulation: 'SL - Concentrado Solúvel',
    modeOfAction: 'Mimetizador de auxina sintética com ação sistêmica seletiva para pastagens e cana.',
    crops: [
      { cropName: 'Pastagens', recommendedDosage: 2.5, dosageUnit: 'L/ha', targetOrganism: 'Guanxuma (Sida rhombifolia), Cheirosa (Hyptis suaveolens), Joá-bravo (Solanum viarum), Assa-peixe', gracePeriodDays: 0 },
      { cropName: 'Cana-de-açúcar', recommendedDosage: 2.0, dosageUnit: 'L/ha', targetOrganism: 'Corda-de-viola (Ipomoea nil), Mamona (Ricinus communis)', gracePeriodDays: 30 }
    ]
  },
  {
    id: 'sumitomo-178810',
    productName: 'Agritoato 400',
    registrationNumber: '178810',
    activeIngredient: 'Dimetoato (400 g/L)',
    chemicalGroup: 'Organofosforado',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Inseticida',
    toxicologicalClass: 'Classe IV - Pouco Tóxico',
    environmentalClass: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    formulation: 'EC - Concentrado Emulsionável',
    modeOfAction: 'Inibidor da enzima acetilcolinesterase, inseticida de ação sistêmica e contato.',
    crops: [
      { cropName: 'Citros', recommendedDosage: 150, dosageUnit: 'mL/100L de água', targetOrganism: 'Mosca-das-frutas (Ceratitis capitata), Pulgão-preto (Toxoptera citricida)', gracePeriodDays: 3 },
      { cropName: 'Tomate', recommendedDosage: 100, dosageUnit: 'mL/100L de água', targetOrganism: 'Mosca-branca (Bemisia tabaci), Tripes (Frankliniella schultzei)', gracePeriodDays: 7 },
      { cropName: 'Algodão', recommendedDosage: 0.8, dosageUnit: 'L/ha', targetOrganism: 'Pulgão-do-algodoeiro (Aphis gossypii), Tripes', gracePeriodDays: 14 }
    ]
  },
  {
    id: 'sumitomo-2110',
    productName: 'Agritone',
    registrationNumber: '2110',
    activeIngredient: 'MCPA (585,6 g/L)',
    chemicalGroup: 'Ácido ariloxialcanóico',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Herbicida',
    toxicologicalClass: 'Classe IV - Pouco Tóxico',
    environmentalClass: 'Classe III - Produto Perigoso ao Meio Ambiente',
    formulation: 'SL - Concentrado Solúvel',
    modeOfAction: 'Mimetizador de auxina para dessecação e controle de folhas largas em cereais e pastagens.',
    crops: [
      { cropName: 'Arroz Irrigado', recommendedDosage: 1.5, dosageUnit: 'L/ha', targetOrganism: 'Sagitaria (Sagittaria montevidensis), Angiquinho (Aeschynomene denticulata)', gracePeriodDays: 60 },
      { cropName: 'Cana-de-açúcar', recommendedDosage: 2.0, dosageUnit: 'L/ha', targetOrganism: 'Corda-de-viola (Ipomoea purpurea), Caruru (Amaranthus viridis)', gracePeriodDays: 30 },
      { cropName: 'Trigo', recommendedDosage: 1.0, dosageUnit: 'L/ha', targetOrganism: 'Nabo (Raphanus raphanistrum), Serralha (Sonchus oleraceus)', gracePeriodDays: 30 }
    ]
  },
  {
    id: 'sumitomo-12320',
    productName: 'Aveo EZ (Streat)',
    registrationNumber: '12320',
    activeIngredient: 'Bacillus amyloliquefaciens (270 g/L)',
    chemicalGroup: 'Microbiológico',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE',
    agrochemicalClass: 'Nematicida',
    toxicologicalClass: 'Classe V - Improvável de Causar Dano Agudo',
    environmentalClass: 'Classe IV - Pouco Perigoso',
    formulation: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    modeOfAction: 'Biofilme protetor radicular e secreção de metabólitos que inibem eclosão e penetração de juvenis de nematoides.',
    crops: [
      { cropName: 'Soja', recommendedDosage: 50, dosageUnit: 'mL/100kg sementes', targetOrganism: 'Meloidogyne javanica, Pratylenchus brachyurus, Heterodera glycines', gracePeriodDays: 0 },
      { cropName: 'Milho', recommendedDosage: 40, dosageUnit: 'mL/100kg sementes', targetOrganism: 'Pratylenchus zeae, Meloidogyne incognita', gracePeriodDays: 0 }
    ]
  }
];

console.log('List length:', sumitomoList.length);
