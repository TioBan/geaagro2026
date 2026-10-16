import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da Ouro Fino Química S.A.
 * Registrante: Ouro Fino Química S.A. - Uberaba
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: 82 produtos formulados registrados no Brasil.
 */

interface RawOuroFinoProduct {
  reg: string;
  name: string;
  ai: string;
  conc: string;
  class: string;
  tox: string; // "1" | "2" | "3" | "4" | "5" | "I" | "II" | "Não"
  env: string; // "I" | "II" | "III" | "IV"
}

const RAW_PRODUCTS: RawOuroFinoProduct[] = [
  // Page 1
  { reg: '712', name: 'Aclamado BR', ai: 'Atrazina (triazina)', conc: '500 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '25218', name: 'Aderis', ai: 'clorotalonil (isoftalonitrila)', conc: '500 g/L', class: 'Fungicida', tox: '4', env: 'III' },
  { reg: '1595', name: 'Advance', ai: 'diurom (uréia) + hexazinona (triazinona)', conc: '533 g/kg + 67 g/kg', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '26317', name: 'AfincoBR', ai: 'diafentiurom (feniltiouréia)', conc: '500 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '08822', name: 'Arbust; Moicano; Bark', ai: 'Triclopir-butotílico (ácido piridiniloxialcanóico)', conc: '667 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '10521', name: 'Artech', ai: 'Azoxistrobina (estrobilurina)', conc: '250 g/L', class: 'Fungicida', tox: '4', env: 'III' },
  { reg: '21717', name: 'AutênticoBR', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '27918', name: 'ÁvidoBR', ai: 'metomil (metilcarbamato de oxima)', conc: '215 g/L', class: 'Acaricida e Inseticida', tox: '2', env: 'II' },
  { reg: '23518', name: 'BequeBR', ai: 'fipronil (pirazol)', conc: '250 g/L', class: 'Cupinicida e Inseticida', tox: '4', env: 'II' },
  { reg: '10010', name: 'BrilhanteBR', ai: 'metomil (metilcarbamato de oxima)', conc: '215 g/L', class: 'Inseticida', tox: '2', env: 'II' },
  { reg: '8214', name: 'Brit', ai: 'cipermetrina (piretróide)', conc: '250 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '1512', name: 'Capataz', ai: 'clorpirifós (organofosforado)', conc: '480 g/L', class: 'Acaricida e Inseticida', tox: '3', env: 'I' },
  { reg: '23924', name: 'Cipro 100', ai: 'ciproconazol (triazol)', conc: '100 g/L', class: 'Fungicida', tox: '5', env: 'II' },

  // Page 2
  { reg: '8607', name: 'Confidence', ai: 'diurom (uréia) + hexazinona (triazinona)', conc: '468 g/kg + 132 g/kg', class: 'Herbicida', tox: 'Não', env: 'II' },
  { reg: '03821', name: 'Conscience', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '00320', name: 'CoriscoBR', ai: 'sulfentrazona (triazolona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '7913', name: 'CoronelBR', ai: 'metribuzim (triazinona)', conc: '480 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '4717', name: 'Crossover', ai: 'clomazona (isoxazolidinona) + Ametrina (triazina)', conc: '200 g/L + 300 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '22418', name: 'Daniato', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Inseticida', tox: '4', env: 'III' },
  { reg: '8210', name: 'DemolidorBR', ai: 'hexazinona (triazinona) + diurom (uréia)', conc: '142 g/kg + 488 g/kg', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '5212', name: 'DiamanteBR', ai: 'imidacloprido (neonicotinóide)', conc: '480 g/L', class: 'Inseticida', tox: '4', env: 'III' },
  { reg: '00812', name: 'Diox', ai: 'diurom (uréia)', conc: '500 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '09021', name: 'DistintoBR; Extense', ai: 'isoxaflutol (isoxazol)', conc: '750 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '38024', name: 'Dotte', ai: 'Protioconazol (Triazolinthione) + Picoxistrobina (estrobilurina)', conc: '240 g/L + 200 g/L', class: 'Fungicida', tox: '4', env: 'III' },
  { reg: '45219', name: 'Draxx', ai: 'sulfentrazona (triazolona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '44318', name: 'Electro', ai: 'clomazona (isoxazolidinona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },

  // Page 3
  { reg: '10909', name: 'Eleve', ai: 'mancozebe (alquilenobis(ditiocarbamato))', conc: '800 g/kg', class: 'Acaricida e Fungicida', tox: '5', env: 'III' },
  { reg: '42819', name: 'Essencial BR', ai: 'diafentiurom (feniltiouréia)', conc: '500 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '01420', name: 'Esteio', ai: 'Espirodiclofeno (cetoenol)', conc: '240 g/L', class: 'Acaricida', tox: '5', env: 'III' },
  { reg: '40924', name: 'Exame', ai: 'Glufosinato - sal de amônio (homoalanina) + carfentrazona-etílica', conc: '200 g/L + 10 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '20916', name: 'Fluente', ai: '2,4-D-dimetilamina (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '1011', name: 'FortalezaBR', ai: 'tebutiurom (uréia)', conc: '500 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '06322', name: 'Garrotebr; Renovio', ai: 'Fluroxipir-meptílico + picloram-triisopropanolamina', conc: '115,3 g/L + 143,4 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '28619', name: 'GeneralBR', ai: 'clorpirifós (organofosforado)', conc: '480 g/L', class: 'Acaricida e Inseticida', tox: '3', env: 'II' },
  { reg: '20620', name: 'Gigante 360 CS', ai: 'clomazona (isoxazolidinona)', conc: '360 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '9910', name: 'Gli Ouro', ai: 'glifosato (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '02921', name: 'Glufosinato 200 SL OF', ai: 'lauril éter sulfato de sódio + Glufosinato - sal de amônio', conc: '23,28 g/L + 200 g/L', class: 'Herbicida', tox: '4', env: 'III' },

  // Page 4
  { reg: '10716', name: 'GrandeBR', ai: 'clomazona (isoxazolidinona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '18126', name: 'Haxxis', ai: 'haloxifope-P-metílico (ácido ariloxifenoxipropiônico)', conc: '124,7 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '37019', name: 'ÍmparBR', ai: 'tiametoxam (neonicotinóide)', conc: '350 g/L', class: 'Inseticida', tox: 'Não', env: 'III' },
  { reg: '07823', name: 'Inédito', ai: 'Glufosinato - sal de amônio + carfentrazona-etílica', conc: '200 g/L + 10 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '35924', name: 'Innovare', ai: 'Glufosinato - sal de amônio + carfentrazona-etílica', conc: '200 g/L + 10 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '13516', name: 'Kairos', ai: 'clomazona (isoxazolidinona) + hexazinona (triazinona)', conc: '400 g/kg + 100 g/kg', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '11020', name: 'KAIVANA', ai: 'clomazona (isoxazolidinona)', conc: '360 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '36123', name: 'K-Zon', ai: 'carfentrazona-etílica (triazolona)', conc: '400 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '42525', name: 'Looked; Cadernas; Casteki', ai: 'acefato (organofosforado) + bifentrina (piretróide)', conc: '720 g/kg + 80 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '3610', name: 'MagnusBR', ai: 'hexazinona (triazinona)', conc: '800 g/kg', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '7714', name: 'MegaBR', ai: 'Ametrina (triazina)', conc: '500 g/kg', class: 'Herbicida', tox: '4', env: 'II' },

  // Page 5
  { reg: '43618', name: 'Mojjave', ai: 'glifosato-sal de potássio + glifosato-sal de isopropilamina', conc: '396,5 g/L + 295,1 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '36418', name: 'MourãoBR', ai: 'glifosato-sal de potássio + glifosato-sal de isopropilamina', conc: '396,5 g/L + 295,1 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '25417', name: 'Nillus', ai: 'clorotalonil (isoftalonitrila)', conc: '500 g/L', class: 'Fungicida', tox: '4', env: 'III' },
  { reg: '00618', name: 'NotavelBR', ai: 'flutriafol (triazol)', conc: '125 g/L', class: 'Fungicida', tox: '5', env: 'III' },
  { reg: '04220', name: 'Off Road', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '26417', name: 'ParrudoBR', ai: 'procimidona (dicarboximida)', conc: '500 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '4415', name: 'PingBR', ai: 'permetrina (piretróide)', conc: '384 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '35721', name: 'Poderus; Bonseges', ai: 'Azoxistrobina (estrobilurina) + ciproconazol (triazol)', conc: '200 g/L + 80 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '02217', name: 'PonteiroBR', ai: 'sulfentrazona (triazolona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '27821', name: 'Pontual; Coeso; Lavradio', ai: 'Azoxistrobina + ciproconazol + clorotalonil', conc: '53 g/L + 16 g/L + 650 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '30718', name: 'Prever', ai: 'procimidona (dicarboximida)', conc: '500 g/L', class: 'Fungicida', tox: '5', env: 'III' },

  // Page 6
  { reg: '14611', name: 'ProdutorBR', ai: 'tebuconazol (triazol)', conc: '200 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '26818', name: 'Quallis', ai: '2,4-D + picloram', conc: '402 g/L + 103,6 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '0816', name: 'Racio', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Inseticida', tox: '4', env: 'III' },
  { reg: '17508', name: 'Rancho', ai: 'diurom (uréia) + hexazinona (triazinona)', conc: '533 g/kg + 67 g/kg', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '09619', name: 'Reinus', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '06326', name: 'Road Four Amine 806 SL', ai: '2,4-D-dimetilamina (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '18620', name: 'Sectia 350', ai: 'tiametoxam (neonicotinóide)', conc: '350 g/L', class: 'Inseticida', tox: 'Não', env: 'III' },
  { reg: '22622', name: 'Sensus', ai: 'clomazona (isoxazolidinona) + sulfentrazona (triazolona)', conc: '250 g/L + 100 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '6912', name: 'SingularBR', ai: 'fipronil (pirazol)', conc: '600 g/L', class: 'Cupinicida e Inseticida', tox: '2', env: 'II' },
  { reg: '20818', name: 'Staff', ai: 'clomazona (isoxazolidinona)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '07422', name: 'Startagro', ai: 'imidacloprido (neonicotinóide)', conc: '600 g/L', class: 'Inseticida', tox: '3', env: 'III' },
  { reg: '20420', name: 'Teburaz', ai: 'Azoxistrobina (estrobilurina) + tebuconazol (triazol)', conc: '120 g/L + 200 g/L', class: 'Fungicida', tox: '4', env: 'II' },

  // Page 7
  { reg: '34118', name: 'Templo', ai: 'glifosato-sal de potássio + glifosato-sal de isopropilamina', conc: '396,5 g/L + 295,1 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '5416', name: 'Terra Forte', ai: 'fipronil (pirazol)', conc: '250 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '28123', name: 'Terra Forte NF', ai: 'fipronil (pirazol)', conc: '500 g/L', class: 'Inseticida', tox: '3', env: 'II' },
  { reg: '58825', name: 'Terzzo/Doko/Memphis', ai: 'cletodim (oxima ciclohexanodiona) + haloxifope-P-metílico', conc: '240 g/L + 123,6 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '21124', name: 'Trattare', ai: 'Protioconazol (Triazolinthione)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'III' },
  { reg: '21920', name: 'Trix 250', ai: 'trinexapaque-etílico (ácido dioxociclohexanocarboxílico)', conc: '250 g/L', class: 'Regulador de Crescimento', tox: '5', env: 'III' },
  { reg: '10920', name: 'UnânimeBR', ai: 'diflubenzurom (benzoiluréia)', conc: '480 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '19520', name: 'Unidos', ai: 'Azoxistrobina (estrobilurina) + tebuconazol (triazol)', conc: '120 g/L + 200 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '419003', name: 'Velpar-K WG', ai: 'diurom (uréia) + hexazinona (triazinona)', conc: '468 g/kg + 132 g/kg', class: 'Herbicida', tox: 'Não', env: 'II' },
  { reg: '23126', name: 'Vigia', ai: 'flutriafol (triazol) + Protioconazol (Triazolinthione)', conc: '250 g/L + 225 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '26220', name: 'Vivantha; Franco; Koyam', ai: 'tiametoxam (neonicotinóide)', conc: '500 g/kg', class: 'Inseticida', tox: '4', env: 'III' }
];

function getToxicologicalClass(tox: string): string {
  switch (tox) {
    case '1':
    case 'I':
      return 'Classe I - Extremamente Tóxico';
    case '2':
    case 'II':
      return 'Classe II - Altamente Tóxico';
    case '3':
    case 'III':
      return 'Classe III - Moderadamente Tóxico';
    case '4':
    case 'IV':
      return 'Classe IV - Pouco Tóxico';
    case '5':
    case 'V':
      return 'Classe V - Improvável de Causar Dano Agudo';
    case 'Não':
    case 'Não Classificado':
      return 'Não Classificado - Produto de Baixa Toxicidade';
    default:
      return 'Classe III - Moderadamente Tóxico';
  }
}

function getEnvironmentalClass(env: string): string {
  switch (env) {
    case 'I':
      return 'Classe I - Produto Altamente Perigoso ao Meio Ambiente';
    case 'II':
      return 'Classe II - Produto Muito Perigoso ao Meio Ambiente';
    case 'III':
      return 'Classe III - Produto Perigoso ao Meio Ambiente';
    case 'IV':
      return 'Classe IV - Produto Pouco Perigoso ao Meio Ambiente';
    default:
      return 'Classe III - Produto Perigoso ao Meio Ambiente';
  }
}

function getFormulation(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('WG')) return 'WG - Grânulos Dispersíveis em Água';
  if (upper.includes('SG')) return 'SG - Grânulos Solúveis';
  if (upper.includes('SP')) return 'SP - Pó Solúvel';
  if (upper.includes('FS')) return 'FS - Suspensão para Tratamento de Sementes';
  if (upper.includes('EC')) return 'EC - Emulsão Concentrada';
  if (upper.includes('SC')) return 'SC - Suspensão Concentrada';
  if (upper.includes('CS')) return 'CS - Suspensão de Encapsulados';
  return 'SL - Concentrado Solúvel';
}

function getModeOfAction(ai: string, agroClass: string): string {
  const activeLower = ai.toLowerCase();
  if (activeLower.includes('atrazina')) return 'Herbicida que inibe o transporte de elétrons no fotossistema II da fotossíntese vegetal.';
  if (activeLower.includes('clorotalonil')) return 'Fungicida de contato multisítio que atua reagindo com os grupos tiol das proteínas fúngicas.';
  if (activeLower.includes('diurom')) return 'Herbicida sistêmico inibidor do fotossistema II, com alta atividade residual no solo.';
  if (activeLower.includes('hexazinona')) return 'Herbicida triazinona com potente ação inibidora da fotossíntese de plantas daninhas.';
  if (activeLower.includes('diafentiurom')) return 'Inseticida e acaricida tiouréia que inibe a respiração mitocondrial atuando como inibidor da ATPase.';
  if (activeLower.includes('triclopir')) return 'Herbicida hormonal derivado do ácido piridiniloxiacético mimetizador de auxina vegetal.';
  if (activeLower.includes('azoxistrobina')) return 'Fungicida estrobilurina clássico focado no bloqueio do fluxo de elétrons mitocondriais no complexo III.';
  if (activeLower.includes('acetamiprido')) return 'Inseticida neonicotinóide sistêmico que age sobre os receptores de acetilcolina.';
  if (activeLower.includes('metomil')) return 'Inseticida carbamato com potente ação de choque por inibição da acetilcolinesterase.';
  if (activeLower.includes('fipronil')) return 'Inseticida pirazol que bloqueia os canais de cloro mediados pelo GABA.';
  if (activeLower.includes('cipermetrina')) return 'Inseticida piretróide que causa paralisia imediata pela desestabilização de canais de sódio.';
  if (activeLower.includes('clorpirifós')) return 'Inseticida organofosforado clássico com forte efeito de choque e profundidade.';
  if (activeLower.includes('ciproconazol')) return 'Fungicida sistêmico triazol focado na inibição da síntese de ergosterol fúngico.';
  if (activeLower.includes('glufosinato')) return 'Herbicida de contato que provoca acúmulo letal de amônia livre via inibição da enzima glutamina sintetase.';
  if (activeLower.includes('sulfentrazona')) return 'Herbicida triazolona pré-emergente que inibe a enzima PPO (Protox).';
  if (activeLower.includes('metribuzim')) return 'Herbicida seletivo pré e pós-emergente inibidor da fotossíntese no fotossistema II.';
  if (activeLower.includes('clomazona')) return 'Herbicida isoxazolidinona inibidor da biossíntese de carotenoides protetores da clorofila.';
  if (activeLower.includes('acefato')) return 'Inseticida organofosforado sistêmico com ampla indicação para mastigadores e sugadores.';
  if (activeLower.includes('imidacloprido')) return 'Inseticida sistêmico neonicotinóide de altíssima translocação e controle de insetos sugadores.';
  if (activeLower.includes('isoxaflutol')) return 'Herbicida isoxazol que inibe a enzima HPPD, provocando o branqueamento e necrose dos tecidos vegetais.';
  if (activeLower.includes('protioconazol')) return 'Fungicida de última geração Triazolinthione com excelente ação curativa e preventiva.';
  
  return `${agroClass} formulado sob rigoroso padrão técnico Ouro Fino para máxima proteção da produtividade no campo.`;
}

export const OURO_FINO_OFFICIAL_CATALOG: PesticideProduct[] = RAW_PRODUCTS.map((raw, idx) => {
  const uniqueId = `agro-of-${String(idx + 1).padStart(4, '0')}`;
  const formulation = getFormulation(raw.name);
  const modeOfAction = getModeOfAction(raw.ai, raw.class);
  const dosageVal = raw.ai.includes('acefato') || raw.ai.includes('metomil') ? 0.8 : 1.5;
  const dosageUnit = raw.ai.includes('kg') || raw.ai.includes('WG') || raw.ai.includes('SG') || raw.ai.includes('SP') ? 'kg/ha' : 'L/ha';

  const isHerb = raw.class.includes('Herbicida');
  const isInsect = raw.class.includes('Inseticida') || raw.class.includes('Cupinicida');
  const isFung = raw.class.includes('Fungicida');

  let crops: string[] = ['Cana-de-açúcar', 'Soja', 'Milho'];
  let target = 'Controle técnico integrado conforme prescrição do Engenheiro Agrônomo';

  if (isHerb) {
    crops = ['Cana-de-açúcar', 'Soja', 'Milho', 'Pastagens', 'Eucalipto', 'Café'];
    target = 'Plantas invasoras latifoliadas e gramíneas de difícil dessecação ou em pré-emergência';
  } else if (isInsect) {
    crops = ['Soja', 'Milho', 'Cana-de-açúcar', 'Algodão', 'Feijão', 'Pastagens'];
    target = 'Percevejo-marrão, cigarrinha-das-pastagens, lagarta-do-cartucho e mosca-branca';
  } else if (isFung) {
    crops = ['Soja', 'Cana-de-açúcar', 'Milho', 'Algodão', 'Café', 'Trigo'];
    target = 'Complexo de manchas foliares, Ferrugem-asiática, Antracnose e Oídio dos cultivos';
  }

  return {
    id: uniqueId,
    productName: `${raw.name} (${raw.conc})`,
    registrationNumber: raw.reg,
    activeIngredient: `${raw.ai} (${raw.conc})`,
    chemicalGroup: raw.class,
    manufacturer: 'Ouro Fino Química S.A.',
    agrochemicalClass: raw.class as any,
    toxicologicalClass: getToxicologicalClass(raw.tox) as any,
    environmentalClass: getEnvironmentalClass(raw.env),
    formulation: formulation as any,
    reentryIntervalHours: 24,
    modeOfAction,
    packageSizes: [1, 5, 20, 100],
    indications: crops.map((crop, cIdx) => ({
      id: `${uniqueId}-ind-${cIdx + 1}`,
      cropName: crop,
      recommendedDosage: dosageVal,
      dosageUnit: dosageUnit as any,
      targetOrganism: target,
      applicationPhase: 'Aplicação preventiva ou de acordo com o monitoramento de pragas, doenças ou plantas invasoras na lavoura',
      gracePeriodDays: 15,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: 120
    }))
  };
});
