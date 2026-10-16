import fs from 'fs';
import path from 'path';

// Master records from all 16 pages + Page 1 (São Paulo)
const rawProducts = [
  // PDF 1 (São Paulo)
  {
    reg: '37125',
    name: 'Aveo ST',
    active: 'Bacillus amyloliquefaciens, cepa PTA-4838 (270 g/L)',
    group: 'Biológico / Microbiológico',
    cls: 'Nematicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Colonização da rizosfera radicular formando biofilme protetor e induzindo respostas de defesa contra nematoides fitoparasitas',
    mfg: 'Sumitomo Chemical Brasil Indústria Química S.A. - São Paulo/SP',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne javanica / Meloidogyne incognita), Nematoide-das-lesões-radiculares (Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Nematoide-das-lesões (Pratylenchus zeae / Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Algodão', dose: 60, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne incognita)', grace: 0 },
    ]
  },
  // Page 1
  {
    reg: '01520',
    name: 'Abaday',
    active: 'Tiodicarbe (300 g/L) + Lufenurom (50 g/L)',
    group: 'Metilcarbamato de oxima + Benzoiluréia',
    cls: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibição da acetilcolinesterase combinada à inibição da síntese de quitina com forte ação ovicida e larvicida',
    crops: [
      { crop: 'Soja', dose: 0.35, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Falsa-medideira (Chrysodeixis includens), Spodoptera eridania', grace: 30 },
      { crop: 'Milho', dose: 0.4, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda), Helicoverpa armigera', grace: 30 },
      { crop: 'Algodão', dose: 0.45, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Lagarta-das-maçãs (Heliothis virescens)', grace: 28 },
    ]
  },
  {
    reg: '03801',
    name: 'Abamex',
    active: 'Abamectina (18 g/L)',
    group: 'Avermectina',
    cls: 'Acaricida / Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Estimulação da liberação de GABA causando paralisia e bloqueio de estímulos neurais dos ácaros e insetos-praga',
    crops: [
      { crop: 'Citros', dose: 50, unit: 'mL/100L de água', target: 'Ácaro-da-falsa-ferrugem (Phyllocoptruta oleivora), Larva-minadora (Phyllocnistis citrella)', grace: 7 },
      { crop: 'Café', dose: 0.75, unit: 'L/ha', target: 'Bicho-mineiro-do-café (Leucoptera coffeella), Ácaro-vermelho (Oligonychus ilicis)', grace: 14 },
      { crop: 'Tomate', dose: 75, unit: 'mL/100L de água', target: 'Traça-do-tomateiro (Tuta absoluta), Ácaro-rajado (Tetranychus urticae)', grace: 3 },
      { crop: 'Soja', dose: 0.2, unit: 'L/ha', target: 'Ácaro-rajado (Tetranychus urticae)', grace: 21 },
    ]
  },
  {
    reg: '02823',
    name: 'Accede',
    active: '1-Aminocyclopropane-1-carboxylic acid (ACC) (400 g/kg)',
    group: 'Precursor de etileno',
    cls: 'Regulador de Crescimento',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SG - Grânulos Solúveis em Água',
    action: 'Estimulação biológica da síntese endógena de etileno para raleio químico uniforme de frutos jovens',
    crops: [
      { crop: 'Maçã', dose: 300, unit: 'g/ha', target: 'Raleio químico de frutinhos e uniformização da carga da copa', grace: 30 },
      { crop: 'Pêssego', dose: 250, unit: 'g/ha', target: 'Raleio de frutos para ganho de calibre comercial', grace: 30 },
    ]
  },
  {
    reg: '35521',
    name: 'Accel',
    active: '6-Benziladenina (20 g/L)',
    group: 'Citocinina sintética',
    cls: 'Regulador de Crescimento',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Estímulo à divisão e elongação celular e incremento no diâmetro e peso de frutos',
    crops: [
      { crop: 'Maçã', dose: 0.75, unit: 'L/ha', target: 'Aumento de calibre de frutos e raleio controlado', grace: 30 },
      { crop: 'Pera', dose: 0.5, unit: 'L/ha', target: 'Raleio de frutos e melhora do pegamento', grace: 30 },
    ]
  },
  {
    reg: '0417',
    name: 'Acefato Sumitomo 750 SP',
    active: 'Acefato (750 g/kg)',
    group: 'Organofosforado',
    cls: 'Inseticida',
    tox: 'Classe II - Altamente Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SP - Pó Solúvel',
    action: 'Inibidor sistêmico da acetilcolinesterase (AChE) com rápida absorção e efeito residual',
    crops: [
      { crop: 'Soja', dose: 0.7, unit: 'kg/ha', target: 'Percevejo-marrom (Euschistus heros), Percevejo-verde-pequeno (Piezodorus guildinii)', grace: 14 },
      { crop: 'Algodão', dose: 0.8, unit: 'kg/ha', target: 'Pulgão-do-algodoeiro (Aphis gossypii), Tripes (Frankliniella schultzei), Bicudo', grace: 21 },
      { crop: 'Feijão', dose: 0.6, unit: 'kg/ha', target: 'Mosca-branca (Bemisia tabaci), Cigarrinha-verde (Empoasca kraemeri)', grace: 14 },
    ]
  },
  {
    reg: '2708',
    name: 'Addit',
    active: 'Picloram (103 g/L) + 2,4-D-trietanolamina (406 g/L)',
    group: 'Ácido piridinocarboxílico + Ácido ariloxialcanóico',
    cls: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Mimetizador de auxina sintética com ação sistêmica seletiva para pastagens e cana',
    crops: [
      { crop: 'Pastagens', dose: 2.5, unit: 'L/ha', target: 'Guanxuma (Sida rhombifolia), Cheirosa (Hyptis suaveolens), Joá-bravo (Solanum viarum), Assa-peixe', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 2.0, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea nil), Mamona (Ricinus communis)', grace: 30 },
    ]
  },
  {
    reg: '178810',
    name: 'Agritoato 400',
    active: 'Dimetoato (400 g/L)',
    group: 'Organofosforado',
    cls: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibidor da enzima acetilcolinesterase, inseticida de ação sistêmica e contato',
    crops: [
      { crop: 'Citros', dose: 150, unit: 'mL/100L de água', target: 'Mosca-das-frutas (Ceratitis capitata), Pulgão-preto (Toxoptera citricida)', grace: 3 },
      { crop: 'Tomate', dose: 100, unit: 'mL/100L de água', target: 'Mosca-branca (Bemisia tabaci), Tripes (Frankliniella schultzei)', grace: 7 },
      { crop: 'Algodão', dose: 0.8, unit: 'L/ha', target: 'Pulgão-do-algodoeiro (Aphis gossypii), Tripes', grace: 14 },
    ]
  },
  {
    reg: '2110',
    name: 'Agritone',
    active: 'MCPA (585,6 g/L)',
    group: 'Ácido ariloxialcanóico',
    cls: 'Herbicida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Mimetizador de auxina para dessecação e controle de folhas largas em cereais e pastagens',
    crops: [
      { crop: 'Arroz Irrigado', dose: 1.5, unit: 'L/ha', target: 'Sagitaria (Sagittaria montevidensis), Angiquinho (Aeschynomene denticulata)', grace: 60 },
      { crop: 'Cana-de-açúcar', dose: 2.0, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea purpurea), Caruru (Amaranthus viridis)', grace: 30 },
      { crop: 'Trigo', dose: 1.0, unit: 'L/ha', target: 'Nabo (Raphanus raphanistrum), Serralha (Sonchus oleraceus)', grace: 30 },
    ]
  },
  {
    reg: '12320',
    name: 'Aveo EZ (Streat)',
    active: 'Bacillus amyloliquefaciens (270 g/L)',
    group: 'Microbiológico',
    cls: 'Nematicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Biofilme protetor radicular e secreção de metabólitos que inibem eclosão e penetração de juvenis de nematoides',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Meloidogyne javanica, Pratylenchus brachyurus, Heterodera glycines', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Pratylenchus zeae, Meloidogyne incognita', grace: 0 },
    ]
  }
];

console.log('Total starter products defined:', rawProducts.length);
