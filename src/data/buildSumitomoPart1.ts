import * as fs from 'fs';
import * as path from 'path';

interface SumitomoRaw {
  reg: string;
  name: string;
  active: string;
  group: string;
  class: string;
  tox: string;
  amb: string;
  form: string;
  action: string;
  crops: Array<{
    crop: string;
    dose: number;
    unit: string;
    target: string;
    phase?: string;
    grace: number;
    maxApp?: number;
    volume?: number;
  }>;
}

const products: SumitomoRaw[] = [
  // PDF 1 (São Paulo)
  {
    reg: '37125',
    name: 'Aveo ST',
    active: 'Bacillus amyloliquefaciens cepa PTA-4838 (270 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Nematicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Colonização da rizosfera radicular formando biofilme protetor e induzindo respostas de defesa contra nematoides fitoparasitas',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne javanica / incognita), Nematoide-das-lesões (Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Nematoide-das-lesões (Pratylenchus zeae / brachyurus)', grace: 0 },
      { crop: 'Algodão', dose: 60, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne incognita)', grace: 0 },
    ]
  },
  // Page 1
  {
    reg: '01520',
    name: 'Abaday',
    active: 'Tiodicarbe (300 g/L) + Lufenurom (50 g/L)',
    group: 'Metilcarbamato de oxima + Benzoiluréia',
    class: 'Inseticida',
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
    group: 'Avermectina (Glicídeos macrocíclicos)',
    class: 'Acaricida / Inseticida',
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
    class: 'Regulador de Crescimento',
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
    class: 'Regulador de Crescimento',
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
    class: 'Inseticida',
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
    class: 'Herbicida',
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
    class: 'Inseticida',
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
    class: 'Herbicida',
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
    class: 'Nematicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Biofilme protetor radicular e secreção de metabólitos que inibem eclosão e penetração de juvenis de nematoides',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Meloidogyne javanica, Pratylenchus brachyurus, Heterodera glycines', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Pratylenchus zeae, Meloidogyne incognita', grace: 0 },
    ]
  },
  // Page 2
  {
    reg: '48025',
    name: 'Aveo SC (Loyalty SC / Streat SC)',
    active: 'Bacillus amyloliquefaciens cepa PTA-4838 (14 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Nematicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Indução de resistência sistêmica e proteção da rizosfera via pulverização no sulco de plantio ou drench',
    crops: [
      { crop: 'Soja', dose: 0.2, unit: 'L/ha', target: 'Meloidogyne javanica, Pratylenchus brachyurus', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 0.5, unit: 'L/ha', target: 'Meloidogyne incognita, Pratylenchus zeae', grace: 0 },
      { crop: 'Café', dose: 0.5, unit: 'L/ha', target: 'Meloidogyne exigua, Meloidogyne incognita', grace: 0 },
    ]
  },
  {
    reg: '25924',
    name: 'Azbany Maxx',
    active: 'Fluroxipir-meptílico (480 g/L)',
    group: 'Ácido piridiniloxialcanóico',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Mimetizador de auxina com alta velocidade de absorção foliar para controle seletivo de dicotiledôneas de difícil controle',
    crops: [
      { crop: 'Pastagens', dose: 0.8, unit: 'L/ha', target: 'Guanxuma (Sida rhombifolia), Vassourinha-de-botão (Borreria verticillata), Erva-de-touro', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 0.7, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea grandifolia), Merreca (Merremia cissoides)', grace: 30 },
    ]
  },
  {
    reg: '13221',
    name: 'Biffo',
    active: 'Glufosinato - sal de amônio (800 g/kg)',
    group: 'Homoalanina substituída',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'WG - Grânulos Dispersíveis em Água',
    action: 'Inibidor da glutamina sintetase, causando rápida dessecação celular e clorose generalizada',
    crops: [
      { crop: 'Soja', dose: 1.0, unit: 'kg/ha', target: 'Dessecação pré-colheita e controle de Buva (Conyza spp.), Capim-amargoso (Digitaria insularis)', grace: 7 },
      { crop: 'Milho', dose: 1.2, unit: 'kg/ha', target: 'Manejo em pós-emergência de híbridos de milho tolerantes ao glufosinato', grace: 45 },
      { crop: 'Algodão', dose: 1.0, unit: 'kg/ha', target: 'Dessecação e controle de plantas daninhas resistentes ao glifosato', grace: 14 },
    ]
  },
  {
    reg: '2107',
    name: 'Borneo',
    active: 'Etoxazol (110 g/L)',
    group: 'Difenil oxazolina',
    class: 'Acaricida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibidor do crescimento e síntese de quitina dos ácaros, bloqueando a eclosão dos ovos e mudas ninfais',
    crops: [
      { crop: 'Citros', dose: 25, unit: 'mL/100L de água', target: 'Ácaro-da-leprose (Brevipalpus yothersi), Ácaro-da-falsa-ferrugem (Phyllocoptruta oleivora)', grace: 14 },
      { crop: 'Soja', dose: 0.15, unit: 'L/ha', target: 'Ácaro-rajado (Tetranychus urticae), Ácaro-verde (Mononychellus planki)', grace: 21 },
      { crop: 'Algodão', dose: 0.2, unit: 'L/ha', target: 'Ácaro-rajado (Tetranychus urticae)', grace: 14 },
      { crop: 'Maçã', dose: 30, unit: 'mL/100L de água', target: 'Ácaro-vermelho-europeu (Panonychus ulmi)', grace: 14 },
    ]
  },
  {
    reg: '24417',
    name: 'Carnadine',
    active: 'Acetamiprido (200 g/L)',
    group: 'Neonicotinóide',
    class: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Agonista do receptor nicotínico da acetilcolina (nAChR), sistêmico com excelente translocação e efeito de choque',
    crops: [
      { crop: 'Algodão', dose: 0.2, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Pulgão-do-algodoeiro (Aphis gossypii)', grace: 14 },
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Percevejo-marrom (Euschistus heros)', grace: 21 },
      { crop: 'Milho', dose: 0.2, unit: 'L/ha', target: 'Cigarrinha-do-milho (Dalbulus maidis)', grace: 14 },
      { crop: 'Tomate', dose: 40, unit: 'mL/100L de água', target: 'Mosca-branca, Tripes (Frankliniella schultzei)', grace: 3 },
    ]
  },
  {
    reg: '538696',
    name: 'Cartap BR 500',
    active: 'Cloridrato de cartape (500 g/kg)',
    group: 'Bis(tiocarbamato) / Análogo de nereistoxina',
    class: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SP - Pó Solúvel',
    action: 'Bloqueio sináptico nos canais nicotínicos de acetilcolina provocando paralisia e morte dos insetos mastigadores e minadores',
    crops: [
      { crop: 'Arroz Irrigado', dose: 1.2, unit: 'kg/ha', target: 'Bicheiro-da-raiz-do-arroz (Oryzophagus oryzae), Lagarta-da-panícula', grace: 21 },
      { crop: 'Tomate', dose: 150, unit: 'g/100L de água', target: 'Traça-do-tomateiro (Tuta absoluta), Broca-pequena (Neoleucinodes elegantalis)', grace: 7 },
      { crop: 'Batata', dose: 1.5, unit: 'kg/ha', target: 'Traça-da-batatinha (Phthorimaea operculella)', grace: 7 },
    ]
  },
  {
    reg: '29921',
    name: 'Celphos Tablet',
    active: 'Fosfeto de alumínio (570 g/kg)',
    group: 'Inorgânico precursor de fosfina',
    class: 'Inseticida',
    tox: 'Classe I - Extremamente Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'GE - Gerador de Gás (Pastilhas)',
    action: 'Fumigante gerador de fosfina gasosa que inibe a respiração celular bloqueando a citocromo oxidase mitocondrial',
    crops: [
      { crop: 'Grãos Armazenados (Soja, Milho, Trigo, Café, Arroz)', dose: 2.0, unit: 'g/m³ (pastilhas)', target: 'Gorgulho-do-milho (Sitophilus zeamais), Caruncho (Rhyzopertha dominica), Traça-dos-cereais (Sitotroga cerealella)', grace: 4 },
    ]
  },
  {
    reg: '19118',
    name: 'Compact',
    active: 'Lufenurom (50 g/L)',
    group: 'Benzoiluréia',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Regulador do crescimento de insetos que inibe a síntese de quitina impedindo a troca de exoesqueleto',
    crops: [
      { crop: 'Milho', dose: 0.3, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda)', grace: 30 },
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Falsa-medideira (Chrysodeixis includens)', grace: 21 },
      { crop: 'Algodão', dose: 0.4, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Spodoptera cosmioides', grace: 14 },
    ]
  },
  {
    reg: '3396',
    name: 'Condor EC',
    active: 'Bromuconazol (200 g/L)',
    group: 'Triazol',
    class: 'Fungicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibição da C14-desmetilação no processo de biossíntese de ergosterol na membrana celular dos fungos fitopatogênicos',
    crops: [
      { crop: 'Trigo', dose: 0.5, unit: 'L/ha', target: 'Ferrugem-da-folha (Puccinia triticina), Mancha-marrom (Bipolaris sorokiniana), Oídio (Blumeria graminis)', grace: 30 },
      { crop: 'Banana', dose: 0.4, unit: 'L/ha', target: 'Sigatoka-amarela (Pseudocercospora musae), Sigatoka-negra (Pseudocercospora fijiensis)', grace: 3 },
    ]
  },
  {
    reg: '1096',
    name: 'Condor 200 SC',
    active: 'Bromuconazol (200 g/L)',
    group: 'Triazol',
    class: 'Fungicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Fungicida sistêmico protetor e curativo com inibição de ergosterol',
    crops: [
      { crop: 'Trigo', dose: 0.5, unit: 'L/ha', target: 'Mancha-amarela (Drechslera tritici-repentis), Ferrugem-da-folha', grace: 30 },
      { crop: 'Cevada', dose: 0.5, unit: 'L/ha', target: 'Mancha-reticular (Drechslera teres), Oídio', grace: 30 },
    ]
  },
  {
    reg: '07224',
    name: 'Conqueror',
    active: 'Triclopir-butotílico (417,3 g/L) + Picloram (168,8 g/L)',
    group: 'Ácido piridiniloxialcanóico + Ácido piridinocarboxílico',
    class: 'Herbicida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Ação auxínica sistêmica em toco, basal ou foliar para dessecação e controle de plantas invasoras lenhosas',
    crops: [
      { crop: 'Pastagens', dose: 2.0, unit: 'L/ha', target: 'Assa-peixe (Vernonia spp.), Leucena (Leucaena leucocephala), Guanxuma, Cambará', grace: 0 },
    ]
  },
  {
    reg: '5204',
    name: 'CottonQuik',
    active: 'Etefom (273 g/L)',
    group: 'Precursor de etileno',
    class: 'Regulador de Crescimento',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Liberação direta de etileno promovendo abscisão foliar e abertura uniforme das maçãs de algodão',
    crops: [
      { crop: 'Algodão', dose: 2.0, unit: 'L/ha', target: 'Desfolha pré-colheita e abertura uniforme de capulhos', grace: 7 },
    ]
  },
  // Page 3
  {
    reg: '12618',
    name: 'Creta',
    active: 'Fluroxipir-meptílico (115 g/L) + Picloram (129,5 g/L)',
    group: 'Ácido piridiniloxialcanóico + Ácido piridinocarboxílico',
    class: 'Herbicida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Mimetizador de auxina com translocação simplástica e apoplástica para erradicação de plantas invasoras dicotiledôneas de porte arbustivo',
    crops: [
      { crop: 'Pastagens', dose: 2.0, unit: 'L/ha', target: 'Guanxuma (Sida rhombifolia), Malva (Malvastrum coromandelianum), Joá-bravo (Solanum viarum)', grace: 0 },
    ]
  },
  {
    reg: '8912',
    name: 'Crucial',
    active: 'Glifosato-sal de isopropilamina (400,8 g/L) + Glifosato-sal de potássio (297,75 g/L)',
    group: 'Glicina substituída (EPSPs)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Inibidor da enzima EPSP sintase (5-enolpiruvilchiquimato-3-fosfato sintase), bloqueando síntese de aminoácidos aromáticos',
    crops: [
      { crop: 'Soja', dose: 2.0, unit: 'L/ha', target: 'Dessecação pré-plantio e manejo de plantas daninhas anuais e perenes em soja Roundup Ready', grace: 14 },
      { crop: 'Milho', dose: 2.0, unit: 'L/ha', target: 'Manejo de gramíneas e folhas largas em pós-emergência de milho RR', grace: 90 },
      { crop: 'Café', dose: 2.5, unit: 'L/ha', target: 'Capim-braquiária (Urochloa decumbens), Capim-colonião (Megathyrsus maximus)', grace: 15 },
      { crop: 'Citros', dose: 2.5, unit: 'L/ha', target: 'Capim-colchão (Digitaria horizontalis), Caruru (Amaranthus spp.)', grace: 30 },
    ]
  },
  {
    reg: '19617',
    name: 'Curado',
    active: 'Fluazinam (500 g/L)',
    group: 'Fenilpiridinilamina',
    class: 'Fungicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Desacoplador da fosforilação oxidativa mitocondrial com potente ação protetora multissítio',
    crops: [
      { crop: 'Soja', dose: 0.8, unit: 'L/ha', target: 'Mofo-branco (Sclerotinia sclerotiorum), Podridão-radicular (Rhizoctonia solani)', grace: 30 },
      { crop: 'Feijão', dose: 0.8, unit: 'L/ha', target: 'Mofo-branco (Sclerotinia sclerotiorum), Antracnose (Colletotrichum lindemuthianum)', grace: 14 },
      { crop: 'Batata', dose: 1.0, unit: 'L/ha', target: 'Requeima (Phytophthora infestans), Pinta-preta (Alternaria solani)', grace: 7 },
      { crop: 'Tomate', dose: 1.0, unit: 'L/ha', target: 'Requeima (Phytophthora infestans)', grace: 3 },
    ]
  },
  {
    reg: '18222',
    name: 'Cyptrin',
    active: 'Cipermetrina (250 g/L)',
    group: 'Piretróide',
    class: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Modulador dos canais de sódio no axônio neuronal de insetos provocando hiperexcitação e morte rápida por contato e ingestão',
    crops: [
      { crop: 'Milho', dose: 0.15, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda), Lagarta-da-espiga (Helicoverpa zea)', grace: 20 },
      { crop: 'Soja', dose: 0.1, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis)', grace: 21 },
      { crop: 'Algodão', dose: 0.2, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Lagarta-das-maçãs (Heliothis virescens)', grace: 15 },
      { crop: 'Café', dose: 0.2, unit: 'L/ha', target: 'Bicho-mineiro (Leucoptera coffeella)', grace: 14 },
    ]
  },
  {
    reg: '6395',
    name: 'Cyptrin 250 CE',
    active: 'Cipermetrina (250 g/L)',
    group: 'Piretróide',
    class: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe I - Produto Altamente Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Modulador de canais de sódio com rápida ação de choque e derrubada',
    crops: [
      { crop: 'Soja', dose: 0.1, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis)', grace: 21 },
      { crop: 'Milho', dose: 0.15, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda)', grace: 20 },
      { crop: 'Algodão', dose: 0.2, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea)', grace: 15 },
    ]
  },
  {
    reg: '21519',
    name: 'Cytolin',
    active: 'Ácido giberélico (GA4+GA7) (18,8 g/L) + 6-Benziladenina (18,8 g/L)',
    group: 'Giberelina + Citocinina',
    class: 'Regulador de Crescimento',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Estimulação do alongamento e aumento do índice de conformação (tipicidade e alongamento de maçãs e frutos nobres)',
    crops: [
      { crop: 'Maçã', dose: 1.5, unit: 'L/ha', target: 'Alongamento de frutos, melhora da conformação cônica e controle da rugosidade peduncular (russeting)', grace: 30 },
      { crop: 'Pera', dose: 1.0, unit: 'L/ha', target: 'Aumento de pegamento de frutos partenocárpicos e calibre', grace: 30 },
    ]
  },
  {
    reg: '1678591',
    name: 'Danimen 300 EC',
    active: 'Fenpropatrina (300 g/L)',
    group: 'Piretróide',
    class: 'Acaricida / Inseticida',
    tox: 'Classe III - Moderadamente Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Modulador de canais de sódio com amplo espectro sobre lagartas, percevejos e ácaros fitófagos',
    crops: [
      { crop: 'Soja', dose: 0.3, unit: 'L/ha', target: 'Lagarta-falsa-medideira (Chrysodeixis includens), Percevejo-marrom (Euschistus heros), Ácaro-rajado', grace: 21 },
      { crop: 'Algodão', dose: 0.4, unit: 'L/ha', target: 'Bicudo-do-algodoeiro (Anthonomus grandis), Ácaro-rajado (Tetranychus urticae)', grace: 14 },
      { crop: 'Café', dose: 0.4, unit: 'L/ha', target: 'Bicho-mineiro (Leucoptera coffeella), Ácaro-vermelho (Oligonychus ilicis)', grace: 14 },
      { crop: 'Citros', dose: 50, unit: 'mL/100L de água', target: 'Ácaro-da-leprose (Brevipalpus yothersi), Larva-minadora', grace: 7 },
    ]
  },
  {
    reg: '04324',
    name: 'Diflubenzurom SCLA',
    active: 'Diflubenzurom (480 g/L)',
    group: 'Benzoiluréia',
    class: 'Acaricida / Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibidor da biossíntese de quitina (tipo 0), bloqueando a muda e a eclosão larval com excelente seletividade aos inimigos naturais',
    crops: [
      { crop: 'Soja', dose: 70, unit: 'mL/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Falsa-medideira (Chrysodeixis includens)', grace: 21 },
      { crop: 'Citros', dose: 20, unit: 'mL/100L de água', target: 'Bicho-furão (Gymnandrosoma aurantianum), Larva-minadora (Phyllocnistis citrella)', grace: 14 },
      { crop: 'Algodão', dose: 100, unit: 'mL/ha', target: 'Bicudo (ação ovicida e esterilizante de adultos), Curuquerê', grace: 14 },
    ]
  },
  {
    reg: '7507',
    name: 'Diflubenzurom 480 SCLA',
    active: 'Diflubenzurom (480 g/L)',
    group: 'Benzoiluréia',
    class: 'Acaricida / Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Regulador de crescimento larval inibidor de quitina',
    crops: [
      { crop: 'Soja', dose: 70, unit: 'mL/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis)', grace: 21 },
      { crop: 'Milho', dose: 100, unit: 'mL/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda)', grace: 30 },
      { crop: 'Trigo', dose: 80, unit: 'mL/ha', target: 'Lagarta-do-trigo (Mythimna sequax)', grace: 30 },
    ]
  },
  // Page 4
  {
    reg: '1608',
    name: 'Diflubenzuron Sumitomo 480 SC',
    active: 'Diflubenzurom (480 g/L)',
    group: 'Benzoiluréia',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibição da síntese de quitina em lagartas e ninfas com ação por ingestão e contato',
    crops: [
      { crop: 'Soja', dose: 70, unit: 'mL/ha', target: 'Anticarsia gemmatalis, Chrysodeixis includens', grace: 21 },
      { crop: 'Algodão', dose: 100, unit: 'mL/ha', target: 'Alabama argillacea, Anthonomus grandis (supressão reprodutiva)', grace: 14 },
    ]
  },
  {
    reg: '06025',
    name: 'Dimax',
    active: 'Fenpropatrina (250 g/L) + Piriproxifem (42 g/L)',
    group: 'Piretróide + Éter piridiloxipropílico',
    class: 'Acaricida / Inseticida',
    tox: 'Classe III - Moderadamente Tóxico',
    amb: 'Classe I - Produto Altamente Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Duplo mecanismo: choque axonal imediato via piretróide e interrupção do ciclo biológico juvenil via piriproxifem',
    crops: [
      { crop: 'Soja', dose: 0.5, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Percevejo-marrom (Euschistus heros), Lagarta-falsa-medideira', grace: 21 },
      { crop: 'Algodão', dose: 0.6, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Bicudo (Anthonomus grandis), Ácaro-rajado', grace: 14 },
      { crop: 'Feijão', dose: 0.5, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Vaquinha (Diabrotica speciosa)', grace: 14 },
    ]
  },
  {
    reg: '00291',
    name: 'Dipel',
    active: 'Bacillus thuringiensis var. kurstaki isolado HD-1 (S1450) (33,6 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Inseticida',
    tox: 'Não Classificado (Biológico Seguro)',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Proteínas cristalinas endotoxinas Cry que provocam lise das células epiteliais do intestino médio de lagartas',
    crops: [
      { crop: 'Soja', dose: 0.5, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Helicoverpa armigera, Spodoptera eridania, Chrysodeixis includens', grace: 0 },
      { crop: 'Milho', dose: 0.6, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda), Helicoverpa zea', grace: 0 },
      { crop: 'Algodão', dose: 0.75, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Helicoverpa armigera, Spodoptera frugiperda', grace: 0 },
      { crop: 'Café', dose: 0.5, unit: 'L/ha', target: 'Bicho-mineiro (Leucoptera coffeella)', grace: 0 },
      { crop: 'Tomate', dose: 100, unit: 'mL/100L de água', target: 'Traça-do-tomateiro (Tuta absoluta), Helicoverpa zea', grace: 0 },
    ]
  },
  {
    reg: '5917',
    name: 'Dipel ES-NT (Biobit / Quark / Bactospeine)',
    active: 'Bacillus thuringiensis var. kurstaki isolado HD-1 (S1450) (250 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Inseticida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'OF - Suspensão Óleo-Dispersível',
    action: 'Formulação em óleo de alta aderência contendo cristais de Bt e esporos com liberação de endotoxinas específicas no intestino de lagartas',
    crops: [
      { crop: 'Soja', dose: 0.3, unit: 'L/ha', target: 'Chrysodeixis includens, Helicoverpa armigera, Anticarsia gemmatalis, Spodoptera frugiperda', grace: 0 },
      { crop: 'Milho', dose: 0.4, unit: 'L/ha', target: 'Spodoptera frugiperda, Helicoverpa zea', grace: 0 },
      { crop: 'Algodão', dose: 0.5, unit: 'L/ha', target: 'Alabama argillacea, Heliothis virescens, Spodoptera cosmioides', grace: 0 },
      { crop: 'HF e Fruticultura', dose: 80, unit: 'mL/100L de água', target: 'Plutella xylostella, Tuta absoluta, Trichoplusia ni', grace: 0 },
    ]
  },
  {
    reg: '4707',
    name: 'Dipel WG',
    active: 'Bacillus thuringiensis var. kurstaki isolado HD-1 (540 g/kg)',
    group: 'Biológico / Microbiológico',
    class: 'Inseticida',
    tox: 'Não Classificado (Biológico Seguro)',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'WG - Grânulos Dispersíveis em Água',
    action: 'Bioinseticida granular de alta solubilidade com rápida absorção e quebra da integridade intestinal de lagartas lepidópteras',
    crops: [
      { crop: 'Soja', dose: 0.25, unit: 'kg/ha', target: 'Anticarsia gemmatalis, Chrysodeixis includens, Helicoverpa armigera', grace: 0 },
      { crop: 'Milho', dose: 0.3, unit: 'kg/ha', target: 'Spodoptera frugiperda', grace: 0 },
      { crop: 'Algodão', dose: 0.35, unit: 'kg/ha', target: 'Alabama argillacea, Heliothis virescens', grace: 0 },
    ]
  },
  {
    reg: '858901',
    name: 'Dipel WP',
    active: 'Bacillus thuringiensis (32 g/kg)',
    group: 'Biológico / Microbiológico',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'WP - Pó Molhável',
    action: 'Endotoxinas ativadas pelo pH alcalino do trato digestivo de lagartas causando paralisia e cessação imediata da alimentação',
    crops: [
      { crop: 'Hortaliças e Brássicas', dose: 100, unit: 'g/100L de água', target: 'Traça-das-crucíferas (Plutella xylostella), Lagarta-mede-palmo (Trichoplusia ni)', grace: 0 },
      { crop: 'Tomate', dose: 100, unit: 'g/100L de água', target: 'Traça-do-tomateiro (Tuta absoluta)', grace: 0 },
      { crop: 'Fumo', dose: 0.5, unit: 'kg/ha', target: 'Manduca sexta, Heliothis virescens', grace: 0 },
    ]
  },
  {
    reg: '18118',
    name: 'Diquate Sumitomo 200 SL',
    active: 'Dibrometo de diquate (374 g/L correspondente a 200 g/L do cátion diquate)',
    group: 'Bipiridílio (Fotossistema I)',
    class: 'Herbicida',
    tox: 'Classe III - Moderadamente Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Desvio de elétrons no Fotossistema I com formação de radicais superóxido e destruição relâmpago de membranas celulares',
    crops: [
      { crop: 'Soja', dose: 1.5, unit: 'L/ha', target: 'Dessecação pré-colheita para uniformização de grãos e controle de folhas largas e estreitas', grace: 7 },
      { crop: 'Feijão', dose: 1.5, unit: 'L/ha', target: 'Dessecação pré-colheita para viabilizar colheita direta mecanizada', grace: 7 },
      { crop: 'Batata', dose: 2.0, unit: 'L/ha', target: 'Dessecação da parte aérea para maturação uniforme da casca dos tubérculos', grace: 7 },
      { crop: 'Milho', dose: 1.5, unit: 'L/ha', target: 'Dessecação em pré-plantio e manejo de dessecação de plantas daninhas', grace: 14 },
    ]
  },
  {
    reg: '5007',
    name: 'Drible',
    active: 'Lactofem (240 g/L)',
    group: 'Éter difenílico (Inibidor da PROTOX / PPO)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibição da protoporfirinogênio oxidase (PPO) causando acúmulo de protoporfirina IX e rápida dessecação celular',
    crops: [
      { crop: 'Soja', dose: 0.6, unit: 'L/ha', target: 'Controle em pós-emergência de Buva (Conyza bonariensis), Caruru (Amaranthus spp.), Trapoeraba (Commelina benghalensis)', grace: 45 },
      { crop: 'Feijão', dose: 0.5, unit: 'L/ha', target: 'Folhas largas de difícil controle em pós-emergência', grace: 40 },
    ]
  },
  {
    reg: '06219',
    name: 'Epingle EW (Cordial EW)',
    active: 'Piriproxifem (100 g/L)',
    group: 'Éter piridiloxipropílico (Mimetizador do Hormônio Juvenil)',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EW - Emulsão Óleo em Água',
    action: 'Mimetizador de hormônio juvenil (JHA) que impede a metamorfose das ninfas para adultos e esteriliza fêmeas reprodutoras',
    crops: [
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci) - ovos e ninfas', grace: 21 },
      { crop: 'Algodão', dose: 0.3, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci)', grace: 14 },
      { crop: 'Tomate', dose: 50, unit: 'mL/100L de água', target: 'Mosca-branca (Bemisia tabaci)', grace: 3 },
      { crop: 'Citros', dose: 50, unit: 'mL/100L de água', target: 'Cochonilha-ortézia (Praelongorthezia praelonga), Cochonilha-pardinha', grace: 14 },
    ]
  },
  // Page 5
  {
    reg: '7698',
    name: 'Epingle 100',
    active: 'Piriproxifem (100 g/L)',
    group: 'Éter piridiloxipropílico',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibição da metamorfose larval e ação ovicida/esterilizante em insetos sugadores',
    crops: [
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci)', grace: 21 },
      { crop: 'Algodão', dose: 0.3, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci)', grace: 14 },
      { crop: 'Café', dose: 0.5, unit: 'L/ha', target: 'Cochonilha-da-raiz (Dysmicoccus texensis)', grace: 30 },
    ]
  },
  {
    reg: '29422',
    name: 'Excalia',
    active: 'Impirfluxam (400 g/L)',
    group: 'Carboxamida (Inibidor da Succinato Desidrogenase - SDHI)',
    class: 'Fungicida',
    tox: 'Classe III - Moderadamente Tóxico',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibição do complexo II mitocondrial da succinato desidrogenase com altíssima potência intrínseca contra ferrugens e manchas',
    crops: [
      { crop: 'Soja', dose: 0.15, unit: 'L/ha', target: 'Ferrugem-asiática (Phakopsora pachyrhizi), Mancha-alvo (Corynespora cassiicola)', grace: 30 },
      { crop: 'Algodão', dose: 0.15, unit: 'L/ha', target: 'Mancha-de-ramulária (Ramulariopsis pseudoglycines)', grace: 21 },
      { crop: 'Café', dose: 0.2, unit: 'L/ha', target: 'Ferrugem-do-cafeeiro (Hemileia vastatrix), Mancha-de-olho-pardo (Cercospora coffeicola)', grace: 30 },
      { crop: 'Milho', dose: 0.15, unit: 'L/ha', target: 'Ferrugem-polissora (Puccinia polysora), Mancha-de-bipolaris (Bipolaris maydis)', grace: 30 },
    ]
  },
  {
    reg: '00122',
    name: 'Excalia Max',
    active: 'Impirfluxam (60 g/L) + Tebuconazol (200 g/L)',
    group: 'Carboxamida (SDHI) + Triazol (DMI)',
    class: 'Fungicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Produto Muito Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Associação sinérgica de carboxamida inovadora com triazol curativo oferecendo amplo controle e antirresistência em soja e algodão',
    crops: [
      { crop: 'Soja', dose: 0.5, unit: 'L/ha', target: 'Ferrugem-asiática (Phakopsora pachyrhizi), Mancha-alvo (Corynespora cassiicola), Cercosporiose (Cercospora kikuchii), Antracnose', grace: 30 },
      { crop: 'Algodão', dose: 0.6, unit: 'L/ha', target: 'Ramulária (Ramulariopsis pseudoglycines), Mancha-de-stemphylium', grace: 21 },
      { crop: 'Café', dose: 0.6, unit: 'L/ha', target: 'Ferrugem-do-cafeeiro (Hemileia vastatrix)', grace: 30 },
      { crop: 'Milho', dose: 0.5, unit: 'L/ha', target: 'Ferrugem-polissora (Puccinia polysora), Cercosporiose (Cercospora zeae-maydis)', grace: 30 },
    ]
  },
  {
    reg: '01422',
    name: 'Exert 540 EC',
    active: 'Haloxifope-P-metílico (540 g/L)',
    group: 'Ácido ariloxifenoxipropiônico (FOPs / Inibidor da ACCase)',
    class: 'Herbicida',
    tox: 'Classe IV - Pouco Tóxico',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibição sistêmica da enzima acetil-coenzima A carboxilase (ACCase) com dessecação seletiva de gramíneas anuais e perenes',
    crops: [
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Capim-amargoso (Digitaria insularis), Capim-pé-de-galinha (Eleusine indica), Capim-colchão, Milho voluntário', grace: 60 },
      { crop: 'Algodão', dose: 0.3, unit: 'L/ha', target: 'Capim-amargoso, Capim-braquiária, Capim-carrapicho (Cenchrus echinatus)', grace: 60 },
      { crop: 'Feijão', dose: 0.25, unit: 'L/ha', target: 'Gramíneas invasoras de folhas estreitas em pós-emergência', grace: 40 },
    ]
  },
  {
    reg: '18020',
    name: 'Flumioxazin 500 SC',
    active: 'Flumioxazina (500 g/L)',
    group: 'Ciclohexenodicarboximida (Inibidor da PROTOX / PPO)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibidor de PPO de solo e foliar criando potente barreira residual pré-emergente contra plantas daninhas de folhas largas e estreitas',
    crops: [
      { crop: 'Soja', dose: 0.12, unit: 'L/ha', target: 'Buva (Conyza spp.), Capim-amargoso (Digitaria insularis), Trapoeraba, Caruru (Amaranthus hybridus)', grace: 60 },
      { crop: 'Cana-de-açúcar', dose: 0.2, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea spp.), Mamona, Capim-colchão, Tiririca (Cyperus rotundus)', grace: 30 },
      { crop: 'Milho', dose: 0.1, unit: 'L/ha', target: 'Aplicação ' + 'plante e aplique' + ' ou dessecação pré-plantio', grace: 90 },
      { crop: 'Café', dose: 0.2, unit: 'L/ha', target: 'Manejo de plantas daninhas na linha e entrelinha do cafeeiro', grace: 30 },
    ]
  },
  {
    reg: '22617',
    name: 'Flumyzin 500 SC',
    active: 'Flumioxazina (500 g/L)',
    group: 'Ciclohexenodicarboximida (PPO)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Barreira química residual pré-emergente e controle de contato em dessecação',
    crops: [
      { crop: 'Soja', dose: 0.12, unit: 'L/ha', target: 'Buva (Conyza spp.), Caruru (Amaranthus palmeri / hybridus), Capim-amargoso', grace: 60 },
      { crop: 'Café', dose: 0.2, unit: 'L/ha', target: 'Folhas largas e gramíneas em pré-emergência', grace: 30 },
      { crop: 'Citros', dose: 0.2, unit: 'L/ha', target: 'Controle residual de bancos de sementes de plantas daninhas', grace: 30 },
    ]
  },
  {
    reg: '01424',
    name: 'Folicap 250 SL',
    active: 'Fomesafem (250 g/L)',
    group: 'Éter difenílico (Inibidor da PPO)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Inibição da PROTOX em pós-emergência precoce para controle seletivo de folhas largas em soja e feijão',
    crops: [
      { crop: 'Soja', dose: 1.0, unit: 'L/ha', target: 'Caruru (Amaranthus spp.), Picão-preto (Bidens pilosa), Corda-de-viola (Ipomoea nil)', grace: 60 },
      { crop: 'Feijão', dose: 1.0, unit: 'L/ha', target: 'Caruru, Picão-preto, Guanxuma, Trapoeraba', grace: 40 },
    ]
  },
  {
    reg: '02918',
    name: 'Glifoready',
    active: 'Glifosato-sal de isopropilamina (698,55 g/L) + Glifosato-sal de potássio (297,75 g/L)',
    group: 'Glicina substituída (EPSPs)',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Inibição sistêmica da EPSP sintase com formulação concentrada de alta solubilidade e absorção foliar acelerada',
    crops: [
      { crop: 'Soja RR', dose: 1.5, unit: 'L/ha', target: 'Manejo em dessecação pré-plantio e pós-emergência em soja tolerante ao glifosato', grace: 14 },
      { crop: 'Milho RR', dose: 1.5, unit: 'L/ha', target: 'Plantas daninhas anuais e perenes de folhas largas e estreitas', grace: 90 },
      { crop: 'Algodão', dose: 2.0, unit: 'L/ha', target: 'Dessecação em pré-plantio na área total', grace: 30 },
    ]
  },
  {
    reg: '13917',
    name: 'Glifosato SCB BR',
    active: 'Glifosato (480 g/L)',
    group: 'Glicina substituída',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'SL - Concentrado Solúvel',
    action: 'Herbicida total sistêmico não seletivo com translocação até as gemas e raízes',
    crops: [
      { crop: 'Soja', dose: 2.5, unit: 'L/ha', target: 'Dessecação pré-plantio e manejo pré-semeadura', grace: 14 },
      { crop: 'Café', dose: 3.0, unit: 'L/ha', target: 'Capim-braquiária, Capim-colchão, Trapoeraba', grace: 15 },
      { crop: 'Cana-de-açúcar', dose: 3.0, unit: 'L/ha', target: 'Eliminação de soqueira e dessecação', grace: 30 },
    ]
  },
  {
    reg: '1704',
    name: 'Glifosato Sumitomo 720 WG',
    active: 'Glifosato - sal de amônio (792,5 g/kg)',
    group: 'Glicina substituída',
    class: 'Herbicida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Produto Perigoso ao Meio Ambiente',
    form: 'WG - Grânulos Dispersíveis em Água',
    action: 'Inibição sistêmica da rota do ácido chiquímico em grânulos de altíssima concentração',
    crops: [
      { crop: 'Soja', dose: 1.5, unit: 'kg/ha', target: 'Capim-amargoso, Buva, Caruru, Trapoeraba, Picão-preto', grace: 14 },
      { crop: 'Milho', dose: 1.5, unit: 'kg/ha', target: 'Controle de plantas invasoras em pré-plantio e pós de milho geneticamente modificado', grace: 90 },
      { crop: 'Pastagens', dose: 2.0, unit: 'kg/ha', target: 'Reforma de pastagens e dessecação de gramíneas', grace: 0 },
    ]
  },
  {
    reg: '24224',
    name: 'Grandprid',
    active: 'Imidacloprido (210 g/L) + Piriproxifem (50 g/L)',
    group: 'Neonicotinóide + Éter piridiloxipropílico',
    class: 'Inseticida',
    tox: 'Classe V - Improvável de Causar Dano Agudo',
    amb: 'Classe I - Produto Altamente Perigoso ao Meio Ambiente',
    form: 'SC - Suspensão Concentrada',
    action: 'Controle integrado de insetos sugadores combinando ação neonicotinóide sistêmica em adultos com interrupção de mudas e ovos via piriproxifem',
    crops: [
      { crop: 'Soja', dose: 0.5, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Percevejo-marrom (Euschistus heros)', grace: 21 },
      { crop: 'Algodão', dose: 0.6, unit: 'L/ha', target: 'Mosca-branca, Pulgão-do-algodoeiro (Aphis gossypii)', grace: 21 },
      { crop: 'Tomate', dose: 80, unit: 'mL/100L de água', target: 'Mosca-branca (Bemisia tabaci)', grace: 7 },
    ]
  }
];

fs.writeFileSync('/tmp/sumitomo_part1.json', JSON.stringify(products, null, 2));
console.log('Saved Part 1 with ' + products.length + ' products');
