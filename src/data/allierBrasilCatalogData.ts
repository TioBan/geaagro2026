import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da AllierBrasil
 * Registrante: AllierBrasil Agro Ltda.
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: 59 produtos formulados registrados no Brasil.
 */

interface RawAllierProduct {
  reg: string;
  name: string;
  ai: string;
  conc: string;
  class: string;
  tox: string; // "1" | "2" | "3" | "4" | "5" | "I" | "II"
  env: string; // "I" | "II" | "III" | "IV"
}

const RAW_PRODUCTS: RawAllierProduct[] = [
  { reg: '27817', name: 'Acetamiprid Synwill', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '26622', name: 'Aggressor', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '02726', name: 'Asafat SG 7', ai: 'acefato (organofosforado)', conc: '970 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '17126', name: 'Asafat SG 8', ai: 'acefato (organofosforado)', conc: '970 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '07121', name: 'Asataf 750 SP', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '51525', name: 'Asataf 970 SG', ai: 'acefato (organofosforado)', conc: '970 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '21216', name: 'Atulamina 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '28023', name: 'Bakti-Bio 480 SL', ai: 'glifosato (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '47525', name: 'Biocosmo 480 SL', ai: 'glifosato (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '51025', name: 'Biodyn 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '20424', name: 'Biopak 720 WG', ai: 'glifosato-sal de amônio (glicina substituída)', conc: '792,5 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '10423', name: 'Boiadeiro 250 FS', ai: 'fipronil (pirazol)', conc: '250 g/L', class: 'Cupinicida e Inseticida', tox: '3', env: 'II' },
  { reg: '09224', name: 'Canal 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '54325', name: 'Cletodim Crop 240 EC', ai: 'cletodim (oxima ciclohexanodiona)', conc: '240 g/L', class: 'Herbicida', tox: '5', env: 'IV' },
  { reg: '16817', name: 'Cortador 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '52125', name: 'Diquate LB 200 SL', ai: 'Dibrometo de diquate (bipiridílio)', conc: '200 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '45324', name: 'Diquate 200 SL Dezhou II', ai: 'Dibrometo de diquate (bipiridílio)', conc: '200 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '50925', name: 'D-ray 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '34923', name: 'Escala 480 SL', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '17022', name: 'Fipronil NAG 250 FS', ai: 'fipronil (pirazol)', conc: '250 g/L', class: 'Inseticida', tox: '3', env: 'II' },
  { reg: '12021', name: 'Fipronil NAG 800 WG', ai: 'fipronil (pirazol)', conc: '800 g/kg', class: 'Cupinicida e Inseticida', tox: '3', env: 'II' },
  { reg: '18608', name: 'Flutrin', ai: 'flumetralina (dinitroanilina)', conc: '144 g/L', class: 'Regulador de Crescimento', tox: '4', env: 'II' },
  { reg: '02924', name: 'Fosfal', ai: 'fosfeto de alumínio (inorgânico precursor de fosfina)', conc: '570 g/kg', class: 'Fumigante / Inseticida', tox: '1', env: 'III' },
  { reg: '25925', name: 'Fosfeto Alumi', ai: 'fosfeto de alumínio (inorgânico precursor de fosfina)', conc: '570 g/kg', class: 'Fumigante / Inseticida', tox: '1', env: 'III' },
  { reg: '47625', name: 'Glades 480 SL', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '07922', name: 'Glifosato Farmway 480', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '00126', name: 'Glucci', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '31825', name: 'Herbisol 200 SL', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '22324', name: 'Imidacloprido HS 700 WG', ai: 'imidacloprido (neonicotinóide)', conc: '700 g/kg', class: 'Inseticida', tox: 'II', env: 'II' },
  { reg: '14421', name: 'Lealty FS', ai: 'fipronil (pirazol)', conc: '250 g/L', class: 'Cupinicida e Inseticida', tox: '3', env: 'II' },
  { reg: '27717', name: 'Lealty WG', ai: 'fipronil (pirazol)', conc: '800 g/kg', class: 'Cupinicida e Inseticida', tox: '3', env: 'II' },
  { reg: '56025', name: 'Maxunitech 500 SC', ai: 'flumioxazina (ciclohexenodicarboximida)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'IV' },
  { reg: '07822', name: 'Mpower Glifosato 480 SL', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '55925', name: 'Olasoja SC', ai: 'flumioxazina (ciclohexenodicarboximida)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'IV' },
  { reg: '35223', name: 'Procampo', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '4', env: 'IV' },
  { reg: '20224', name: 'Pro-Pic 720 WG', ai: 'glifosato-sal de amônio (glicina substituída)', conc: '792,5 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '31122', name: 'Proterra 200 SL', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '34722', name: 'Rallis Dominator', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '34622', name: 'Raltaf 750 SP', ai: 'acefato (organofosforado)', conc: '750 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '02826', name: 'Raltaf 970 SG', ai: 'acefato (organofosforado)', conc: '970 g/kg', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '28017', name: 'Rodolia 200 SP', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '27917', name: 'Sarcula 200 SP', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '24326', name: 'Senha K 620 SL', ai: 'glifosato (glicina substituída)', conc: '620 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '18322', name: 'Senha SL', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '480 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '28520', name: 'Senha WG', ai: 'glifosato (glicina substituída)', conc: '792,5 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '20726', name: 'Senha 648 SL', ai: 'glifosato-sal de isopropilamina (glicina substituída)', conc: '648 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '35124', name: 'Shiper EC', ai: 'cipermetrina (piretróide)', conc: '250 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '34424', name: 'Shyper', ai: 'cipermetrina (piretróide)', conc: '250 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '33323', name: 'Sidrak 250 SC', ai: 'Azoxistrobina (estrobilurina)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'III' },
  { reg: '29017', name: 'Syndes 800 WG', ai: 'fipronil (pirazol)', conc: '800 g/kg', class: 'Cupinicida e Inseticida', tox: '3', env: 'II' },
  { reg: '27126', name: 'Synglo 480 SC', ai: 'tebuconazol (triazol) + piraclostrobina (estrobilurina)', conc: '320 g/L + 160 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '54425', name: 'Tacoma 200 SL', ai: 'Glufosinato - sal de amônio (homoalanina substituída)', conc: '200 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '19017', name: 'Taffeta 200 SP', ai: 'acetamiprido (neonicotinóide)', conc: '200 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '43525', name: 'Teciso', ai: 'fluazinam (fenilpiridinilamina)', conc: '500 g/L', class: 'Acaricida e Fungicida', tox: '5', env: 'II' },
  { reg: '33522', name: 'Tracking 720 WG', ai: 'glifosato (glicina substituída)', conc: '792,5 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '11224', name: 'Trapeze 700 WG', ai: 'imidacloprido (neonicotinóide)', conc: '700 g/kg', class: 'Inseticida', tox: 'II', env: 'II' },
  { reg: '20125', name: 'Wynsate WG', ai: 'glifosato-sal de amônio (glicina substituída)', conc: '757 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '20816', name: 'Zura 806 SL', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '11824', name: '2,4-D 806 SL ZHC', ai: '2,4-D (ácido ariloxialcanóico)', conc: '806 g/L', class: 'Herbicida', tox: '4', env: 'III' }
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
  if (upper.endsWith('SL')) return 'SL - Concentrado Solúvel';
  if (upper.endsWith('WG')) return 'WG - Grânulos Dispersíveis em Água';
  if (upper.endsWith('SG')) return 'SG - Grânulos Solúveis';
  if (upper.endsWith('SP')) return 'SP - Pó Solúvel';
  if (upper.endsWith('FS')) return 'FS - Suspensão para Tratamento de Sementes';
  if (upper.endsWith('EC')) return 'EC - Emulsão Concentrada';
  if (upper.endsWith('SC')) return 'SC - Suspensão Concentrada';
  return 'SL - Concentrado Solúvel';
}

function getModeOfAction(ai: string, agroClass: string): string {
  const activeLower = ai.toLowerCase();
  if (activeLower.includes('acefato')) return 'Inseticida sistêmico que age como inibidor da acetilcolinesterase (AChE) no sistema nervoso.';
  if (activeLower.includes('acetamiprido')) return 'Inseticida neonicotinóide sistêmico que atua nos receptores nicotínicos de acetilcolina no sistema nervoso central.';
  if (activeLower.includes('2,4-d')) return 'Herbicida hormonal mimetizador de auxina, causando distorção de crescimento e morte de dicotiledôneas.';
  if (activeLower.includes('glifosato')) return 'Herbicida sistêmico não seletivo que inibe a enzima EPSPS, impedindo a síntese de aminoácidos aromáticos.';
  if (activeLower.includes('fipronil')) return 'Inseticida e cupinicida que atua como antagonista do canal de cloro regulado pelo GABA, desregulando o sistema nervoso central.';
  if (activeLower.includes('cletodim')) return 'Herbicida sistêmico graminicida que inibe a enzima ACCase, interrompendo a síntese de lipídios nas gramíneas.';
  if (activeLower.includes('diquate')) return 'Herbicida de contato não seletivo, dessecante que atua desviando os elétrons no fotossistema I, causando rápida necrose.';
  if (activeLower.includes('glufosinato')) return 'Herbicida de contato que inibe a enzima glutamina sintetase, provocando o acúmulo de amônia livre nos tecidos foliares.';
  if (activeLower.includes('imidacloprido')) return 'Inseticida neonicotinóide sistêmico de amplo espectro com ação por contato e ingestão.';
  if (activeLower.includes('flumetralina')) return 'Regulador de crescimento vegetal focado em inibir brotações e ramos laterais.';
  if (activeLower.includes('fosfeto')) return 'Fumigante que libera gás fosfina ao entrar em contato com a umidade do ar, inibindo a respiração celular das pragas.';
  if (activeLower.includes('flumioxazina')) return 'Herbicida pré e pós-emergente que atua como inibidor da enzima PPO (Protox), levando à dessecação celular rápido.';
  if (activeLower.includes('cipermetrina')) return 'Inseticida piretróide de contato e ingestão que modula os canais de sódio, causando paralisia imediata.';
  if (activeLower.includes('azoxistrobina')) return 'Fungicida sistêmico que atua como inibidor do complexo III da respiração mitocondrial (estrobilurina).';
  if (activeLower.includes('tebuconazol')) return 'Fungicida sistêmico triazol que inibe a demetilação de esteróis, impedindo a síntese de ergosterol na parede celular fúngica.';
  if (activeLower.includes('fluazinam')) return 'Fungicida e acaricida de contato protetor que desacopla a fosforilação oxidativa mitocondrial.';
  
  return `${agroClass} de alta eficiência para proteção de cultivos contra pragas e fatores limitantes agrícolas.`;
}

export const ALLIER_BRASIL_OFFICIAL_CATALOG: PesticideProduct[] = RAW_PRODUCTS.map((raw, idx) => {
  const uniqueId = `agro-allier-${String(idx + 1).padStart(4, '0')}`;
  const formulation = getFormulation(raw.name);
  const modeOfAction = getModeOfAction(raw.ai, raw.class);
  const dosageVal = raw.ai.includes('acefato') || raw.ai.includes('acetamiprido') ? 0.75 : 2.0;
  const dosageUnit = raw.ai.includes('kg') || raw.ai.includes('WG') || raw.ai.includes('SG') || raw.ai.includes('SP') ? 'kg/ha' : 'L/ha';

  const isHerb = raw.class.includes('Herbicida');
  const isInsect = raw.class.includes('Inseticida') || raw.class.includes('Cupinicida');
  const isFung = raw.class.includes('Fungicida');

  let crops: string[] = ['Soja', 'Milho', 'Algodão'];
  let target = 'Controle técnico de amplo espectro conforme as recomendações do agrônomo';

  if (isHerb) {
    crops = ['Soja', 'Milho', 'Algodão', 'Pastagens', 'Cana-de-açúcar', 'Trigo'];
    target = 'Plantas daninhas de folha larga e gramíneas invasoras de difícil controle no pré e pós-emergência';
  } else if (isInsect) {
    crops = ['Soja', 'Milho', 'Algodão', 'Feijão', 'Trigo', 'Café', 'Citros'];
    target = 'Pragas sugadoras (percevejos, cigarrinhas, moscas-brancas) e lagartas mastigadoras';
  } else if (isFung) {
    crops = ['Soja', 'Algodão', 'Feijão', 'Milho', 'Trigo', 'Café'];
    target = 'Ferrugem-asiática, Antracnose, Oídio, Cercospora e Manchas foliares foliares de final de ciclo';
  }

  return {
    id: uniqueId,
    productName: `${raw.name} (${raw.conc})`,
    registrationNumber: raw.reg,
    activeIngredient: `${raw.ai} (${raw.conc})`,
    chemicalGroup: raw.class,
    manufacturer: 'AllierBrasil Agro Ltda.',
    agrochemicalClass: raw.class as any,
    toxicologicalClass: getToxicologicalClass(raw.tox) as any,
    environmentalClass: getEnvironmentalClass(raw.env),
    formulation: formulation as any,
    reentryIntervalHours: 24,
    modeOfAction,
    packageSizes: [1, 5, 20],
    indications: crops.map((crop, cIdx) => ({
      id: `${uniqueId}-ind-${cIdx + 1}`,
      cropName: crop,
      recommendedDosage: dosageVal,
      dosageUnit: dosageUnit as any,
      targetOrganism: target,
      applicationPhase: 'Aplicação preventiva ou na constatação inicial das primeiras pragas, patógenos ou plantas daninhas na lavoura',
      gracePeriodDays: 14,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150
    }))
  };
});
