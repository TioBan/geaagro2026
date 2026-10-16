import * as fs from 'fs';
import * as path from 'path';

const sumitomoRawProducts = [
  // PDF 1 - São Paulo
  {
    reg: '37125',
    name: 'Aveo ST',
    active: 'Bacillus amyloliquefaciens cepa PTA-4838 (270 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Nematicida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Colonização radicular, indução de resistência e antagonismo microbiológico contra nematoides',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne incognita / Meloidogyne javanica), Nematoide-das-lesões-radiculares (Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Nematoide-das-lesões (Pratylenchus zeae / Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Algodão', dose: 60, unit: 'mL/100kg sementes', target: 'Nematoide-das-galhas (Meloidogyne incognita)', grace: 0 },
    ]
  },
  // PDF 2 - Page 1
  {
    reg: '01520',
    name: 'Abaday',
    active: 'Tiodicarbe (300 g/L) + Lufenurom (50 g/L)',
    group: 'Metilcarbamato de oxima + Benzoiluréia',
    class: 'Inseticida',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe II - Muito Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Ação por contato e ingestão; inibidor da acetilcolinesterase e inibidor da síntese de quitina',
    crops: [
      { crop: 'Soja', dose: 0.35, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Lagarta-falsa-medideira (Chrysodeixis includens), Lagarta-das-vagens (Spodoptera eridania)', grace: 30 },
      { crop: 'Milho', dose: 0.4, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda)', grace: 30 },
      { crop: 'Algodão', dose: 0.45, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Lagarta-das-maçãs (Heliothis virescens), Spodoptera frugiperda', grace: 28 },
    ]
  },
  {
    reg: '03801',
    name: 'Abamex',
    active: 'Abamectina (18 g/L)',
    group: 'Avermectina',
    class: 'Acaricida / Inseticida',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe III - Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Ativador dos canais de cloro mediado pelo GABA gerando paralisia neuromuscular',
    crops: [
      { crop: 'Citros', dose: 50, unit: 'mL/100L de água', target: 'Ácaro-da-falsa-ferrugem (Phyllocoptruta oleivora), Larva-minadora-dos-citros (Phyllocnistis citrella)', grace: 7 },
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
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SG - Grânulos Solúveis em Água',
    action: 'Estimulação da síntese endógena de etileno para raleio de frutos e maturação',
    crops: [
      { crop: 'Maçã', dose: 300, unit: 'g/ha', target: 'Raleio químico de flores e frutinhos jovens', grace: 30 },
      { crop: 'Pêssego', dose: 250, unit: 'g/ha', target: 'Raleio de frutinhos e uniformização da carga pendente', grace: 30 },
    ]
  },
  {
    reg: '35521',
    name: 'Accel',
    active: '6-Benziladenina (20 g/L)',
    group: 'Citocinina sintética',
    class: 'Regulador de Crescimento',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Estímulo à divisão celular, expansão de frutos e raleio equilibrado',
    crops: [
      { crop: 'Maçã', dose: 0.75, unit: 'L/ha', target: 'Aumento do calibre dos frutos e raleio químico', grace: 30 },
      { crop: 'Pera', dose: 0.5, unit: 'L/ha', target: 'Raleio e desenvolvimento de calibre de frutos', grace: 30 },
    ]
  },
  {
    reg: '0417',
    name: 'Acefato Sumitomo 750 SP',
    active: 'Acefato (750 g/kg)',
    group: 'Organofosforado',
    class: 'Inseticida',
    tox: 'Categoria 2 - Altamente Tóxico',
    amb: 'Classe II - Muito Perigoso',
    form: 'SP - Pó Solúvel',
    action: 'Inibidor da acetilcolinesterase (AChE), sistêmico com ação por contato e ingestão',
    crops: [
      { crop: 'Soja', dose: 0.7, unit: 'kg/ha', target: 'Percevejo-marrom (Euschistus heros), Percevejo-verde-pequeno (Piezodorus guildinii), Lagarta-da-soja (Anticarsia gemmatalis)', grace: 14 },
      { crop: 'Algodão', dose: 0.8, unit: 'kg/ha', target: 'Pulgão-do-algodoeiro (Aphis gossypii), Tripes (Frankliniella schultzei), Bicudo (Anthonomus grandis)', grace: 21 },
      { crop: 'Feijão', dose: 0.6, unit: 'kg/ha', target: 'Mosca-branca (Bemisia tabaci), Cigarrinha-verde (Empoasca kraemeri)', grace: 14 },
    ]
  },
  {
    reg: '2708',
    name: 'Addit',
    active: 'Picloram (103 g/L) + 2,4-D-trietanolamina (406 g/L)',
    group: 'Ácido piridinocarboxílico + Ácido ariloxialcanóico (Mimetizadores de Auxina)',
    class: 'Herbicida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Mimetizador de auxina sintética com ação sistêmica seletiva para pastagens e florestas',
    crops: [
      { crop: 'Pastagens', dose: 2.5, unit: 'L/ha', target: 'Guanxuma (Sida rhombifolia), Cheirosa (Hyptis suaveolens), Joá-bravo (Solanum viarum), Assa-peixe (Vernonia polysphaera)', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 2.0, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea nil), Mamona (Ricinus communis)', grace: 30 },
    ]
  },
  {
    reg: '178810',
    name: 'Agritoato 400',
    active: 'Dimetoato (400 g/L)',
    group: 'Organofosforado',
    class: 'Inseticida / Acaricida',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe II - Muito Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibidor da enzima acetilcolinesterase, inseticida de ação sistêmica e de contato',
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
    group: 'Ácido ariloxialcanóico (Mimetizador de Auxina)',
    class: 'Herbicida',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe III - Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Mimetizador de auxina de absorção foliar e radicular seletivo para gramíneas',
    crops: [
      { crop: 'Arroz Irrigado', dose: 1.5, unit: 'L/ha', target: 'Sagitaria (Sagittaria montevidensis), Angiquinho (Aeschynomene denticulata), Aguapé (Heteranthera reniformis)', grace: 60 },
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
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    action: 'Colonização da rizosfera e barreira microbiológica protetora contra nematoides fitoparasitas',
    crops: [
      { crop: 'Soja', dose: 50, unit: 'mL/100kg sementes', target: 'Meloidogyne javanica, Meloidogyne incognita, Pratylenchus brachyurus, Heterodera glycines', grace: 0 },
      { crop: 'Milho', dose: 40, unit: 'mL/100kg sementes', target: 'Pratylenchus zeae, Pratylenchus brachyurus', grace: 0 },
    ]
  },
  // Page 2
  {
    reg: '48025',
    name: 'Aveo SC (Loyalty SC / Streat SC)',
    active: 'Bacillus amyloliquefaciens cepa PTA-4838 (14 g/L)',
    group: 'Biológico / Microbiológico',
    class: 'Nematicida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe IV - Pouco Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Indução de resistência, secreção de metabólitos antagônicos e colonização radicular',
    crops: [
      { crop: 'Soja', dose: 0.2, unit: 'L/ha', target: 'Nematoide-das-galhas (Meloidogyne javanica), Nematoide-das-lesões (Pratylenchus brachyurus)', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 0.5, unit: 'L/ha', target: 'Meloidogyne javanica, Pratylenchus zeae', grace: 0 },
      { crop: 'Café', dose: 0.5, unit: 'L/ha', target: 'Meloidogyne incognita, Meloidogyne exigua', grace: 0 },
    ]
  },
  {
    reg: '25924',
    name: 'Azbany Maxx',
    active: 'Fluroxipir-meptílico (480 g/L)',
    group: 'Ácido piridiniloxialcanóico (Mimetizador de Auxina)',
    class: 'Herbicida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Herbicida seletivo de ação sistêmica mimetizador de auxina para controle de dicotiledôneas de difícil controle',
    crops: [
      { crop: 'Pastagens', dose: 0.8, unit: 'L/ha', target: 'Guanxuma (Sida cordifolia / Sida rhombifolia), Vassourinha-de-botão (Borreria verticillata), Malva-branca', grace: 0 },
      { crop: 'Cana-de-açúcar', dose: 0.7, unit: 'L/ha', target: 'Corda-de-viola (Ipomoea grandifolia), Merreca (Merremia cissoides)', grace: 30 },
    ]
  },
  {
    reg: '13221',
    name: 'Biffo',
    active: 'Glufosinato - sal de amônio (800 g/kg)',
    group: 'Homoalanina substituída',
    class: 'Herbicida / Regulador de Crescimento',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Perigoso',
    form: 'WG - Grânulos Dispersíveis em Água',
    action: 'Inibidor da glutamina sintetase (GS), causando acúmulo letal de amônia nos tecidos vegetais',
    crops: [
      { crop: 'Soja', dose: 1.0, unit: 'kg/ha', target: 'Dessecação pré-colheita e controle de Buva (Conyza spp.), Capim-amargoso (Digitaria insularis) resistente', grace: 7 },
      { crop: 'Milho', dose: 1.2, unit: 'kg/ha', target: 'Manejo pós-emergência em milho geneticamente modificado LibertyLink', grace: 45 },
      { crop: 'Algodão', dose: 1.2, unit: 'kg/ha', target: 'Dessecação e controle de plantas daninhas de folhas largas e estreitas', grace: 14 },
    ]
  },
  {
    reg: '2107',
    name: 'Borneo',
    active: 'Etoxazol (110 g/L)',
    group: 'Difenil oxazolina',
    class: 'Acaricida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe III - Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibidor da síntese de quitina com forte ação ovicida e ninficida em ácaros',
    crops: [
      { crop: 'Citros', dose: 25, unit: 'mL/100L de água', target: 'Ácaro-da-leprose (Brevipalpus yothersi / phoenicis), Ácaro-da-falsa-ferrugem (Phyllocoptruta oleivora)', grace: 14 },
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
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe II - Muito Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Agonista do receptor nicotínico da acetilcolina (nAChR), sistêmico com ação translaminar e residual prolongado',
    crops: [
      { crop: 'Algodão', dose: 0.2, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci), Pulgão-do-algodoeiro (Aphis gossypii)', grace: 14 },
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Mosca-branca (Bemisia tabaci biótipo B), Percevejo-marrom (Euschistus heros)', grace: 21 },
      { crop: 'Milho', dose: 0.2, unit: 'L/ha', target: 'Cigarrinha-do-milho (Dalbulus maidis)', grace: 14 },
      { crop: 'Tomate', dose: 40, unit: 'mL/100L de água', target: 'Mosca-branca, Tripes (Frankliniella schultzei)', grace: 3 },
    ]
  },
  {
    reg: '538696',
    name: 'Cartap BR 500',
    active: 'Cloridrato de cartape (500 g/kg)',
    group: 'Bis(tiocarbamato) / Análogo de nereistoxina',
    class: 'Inseticida / Fungicida',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe III - Perigoso',
    form: 'SP - Pó Solúvel',
    action: 'Bloqueador dos receptores nicotínicos de acetilcolina pós-sinápticos',
    crops: [
      { crop: 'Arroz Irrigado', dose: 1.2, unit: 'kg/ha', target: 'Bicheiro-da-raiz-do-arroz (Oryzophagus oryzae), Lagarta-da-panícula', grace: 21 },
      { crop: 'Tomate', dose: 150, unit: 'g/100L de água', target: 'Traça-do-tomateiro (Tuta absoluta), Broca-pequena-do-fruto (Neoleucinodes elegantalis)', grace: 7 },
      { crop: 'Batata', dose: 1.5, unit: 'kg/ha', target: 'Traça-da-batatinha (Phthorimaea operculella)', grace: 7 },
    ]
  },
  {
    reg: '29921',
    name: 'Celphos Tablet',
    active: 'Fosfeto de alumínio (570 g/kg)',
    group: 'Inorgânico precursor de fosfina',
    class: 'Inseticida / Fumigante',
    tox: 'Categoria 1 - Extremamente Tóxico',
    amb: 'Classe III - Perigoso',
    form: 'GE - Gerador de Gás (Pastilhas)',
    action: 'Inibidor da respiração celular por liberação de gás fosfina (citocromo-c oxidase)',
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
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Muito Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibidor da biossíntese de quitina em larvas impedindo a ecdise normal',
    crops: [
      { crop: 'Milho', dose: 0.3, unit: 'L/ha', target: 'Lagarta-do-cartucho (Spodoptera frugiperda)', grace: 30 },
      { crop: 'Soja', dose: 0.25, unit: 'L/ha', target: 'Lagarta-da-soja (Anticarsia gemmatalis), Lagarta-falsa-medideira (Chrysodeixis includens)', grace: 21 },
      { crop: 'Algodão', dose: 0.4, unit: 'L/ha', target: 'Curuquerê (Alabama argillacea), Spodoptera cosmioides', grace: 14 },
    ]
  },
  {
    reg: '3396',
    name: 'Condor EC',
    active: 'Bromuconazol (200 g/L)',
    group: 'Triazol',
    class: 'Fungicida',
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Muito Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Inibidor da desmetilação na biossíntese de esteróis (DMI / C14-desmetilase)',
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
    tox: 'Categoria 5 - Improvável de Causar Dano Agudo',
    amb: 'Classe II - Muito Perigoso',
    form: 'SC - Suspensão Concentrada',
    action: 'Inibidor da C14-desmetilação no ergosterol da membrana fúngica com ação sistêmica preventiva e curativa',
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
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe II - Muito Perigoso',
    form: 'EC - Concentrado Emulsionável',
    action: 'Mimetizador de auxinas de amplo espectro para dessecação e erradicação de plantas lenhosas e arbustivas',
    crops: [
      { crop: 'Pastagens', dose: 2.0, unit: 'L/ha', target: 'Assa-peixe (Vernonia spp.), Leucena (Leucaena leucocephala), Guanxuma (Sida spp.), Cambará (Lantana camara)', grace: 0 },
    ]
  },
  {
    reg: '5204',
    name: 'CottonQuik',
    active: 'Etefom (273 g/L)',
    group: 'Precursor de etileno',
    class: 'Regulador de Crescimento / Desfolhante',
    tox: 'Categoria 4 - Pouco Tóxico',
    amb: 'Classe III - Perigoso',
    form: 'SL - Concentrado Solúvel',
    action: 'Promotor de abertura uniforme de maçãs e desfolha acelerada para colheita mecânica',
    crops: [
      { crop: 'Algodão', dose: 2.0, unit: 'L/ha', target: 'Abertura rápida e uniforme de capulhos e desfolha pré-colheita', grace: 7 },
    ]
  }
];

fs.writeFileSync('/tmp/sumitomo_test.json', JSON.stringify(sumitomoRawProducts, null, 2));
console.log('Sample parsed successfully');
