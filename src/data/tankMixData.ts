import {
  FormulationInfo,
  TankMixProduct,
  CompatibilityRule,
  WaterQualityParameters,
  SprayerEquipment,
  CompatibilityRating,
  TankSelectedProduct,
  WeatherCondition,
  PesticideFormulationCode,
  AgrochemicalClass,
} from '../types/tankMix';

// ============================================================================
// 1. BANCO DE FORMULAÇÕES AGRÍCOLAS & COMPORTAMENTO EM ÁGUA (PADRÃO DAMES / WALES)
// ============================================================================

export const FORMULATION_DATABASE: FormulationInfo[] = [
  // 1. EMBALAGENS HIDROSSOLÚVEIS (ORDEM WALES: 1 - ÁGUA + WSB)
  {
    code: 'WSB',
    fullName: 'Bolsa / Embalagem Hidrossolúvel (Water Soluble Bag)',
    description: 'Sacos pré-dosados selados em película de Álcool Polivinílico (PVA) que se dissolvem na água sem liberar poeira.',
    waterBehavior: 'O filme polimérico de PVA se hidrata e dissolve em 2 a 5 minutos na água sob agitação moderada, dispersando o defensivo concentrado contido no interior.',
    mixingOrderIndex: 1,
    mixingOrderGroup: 'Bolsas Hidrossolúveis (WSB)',
    advantages: [
      'Exposição zero do operador e aplicador à poeira tóxica durante a dosagem',
      'Elimina a necessidade de tríplice lavagem de embalagens plásticas convencionais',
      'Dosagem volumétrica rigorosa e exata por sachê pré-embalado',
    ],
    precautions: [
      'NUNCA adicionar em tanque contendo fertilizantes com Boro ou eletrólitos concentrados (o Boro reage quimicamente com o PVA formando um polímero elástico insolúvel tipo "chiclete" que bloqueia a bomba)',
      'Adicionar sempre com pelo menos 50% a 70% de água limpa no tanque antes de qualquer outro produto químico',
      'Não manusear com luvas ou mãos molhadas',
    ],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Remover peneira de abastecimento caso o sachê não passe; recolocar a peneira após dissolução',
    carrierCompatibilityNotes: 'Incompatível com calda contendo Boro livre ou alta concentração de sulfatos na fase inicial de diluição.',
  },

  // 2. SÓLIDOS DISPERSÍVEIS EM ÁGUA (ORDEM WALES: 2 - WP / WG / DF)
  {
    code: 'WP',
    fullName: 'Pó Molhável (Wettable Powder)',
    description: 'Partículas sólidas finamente moídas dispersas em água com auxílio de surfactantes e agentes molhantes.',
    waterBehavior: 'Não se dissolve verdadeiramente; forma uma suspensão física instável de partículas sólidas. Requer constante agitação no tanque para evitar sedimentação.',
    mixingOrderIndex: 2,
    mixingOrderGroup: 'Sólidos (WP/WG/DF)',
    advantages: ['Não contém solventes orgânicos inflamáveis', 'Menor risco de fitotoxicidade por solvente', 'Excelente estabilidade em armazenagem longa'],
    precautions: ['Gera poeira tóxica na dosagem (uso obrigatório de máscara PFF2)', 'Abrasivo para pontas de bicos convencionais', 'Risco de decantação se a agitação parar', 'Pré-diluição em balde é recomendada'],
    recommendedAgitation: 'Alta e Contínua',
    filterMeshRecommendation: 'Malha 50 mesh recomendada; malha 100 mesh pode reter partículas e colmatar rapidamente',
    carrierCompatibilityNotes: 'Necessita hidratação prévia antes de entrar em contato com óleos ou formulações EC.',
  },
  {
    code: 'WG',
    fullName: 'Grânulos Dispersíveis em Água (Water Dispersible Granules / WDG)',
    description: 'Pequenos grânulos sólidos que se desintegram e dispersam rapidamente quando em contato com a água, sem gerar poeira.',
    waterBehavior: 'Desintegração espontânea dos grânulos e formação de suspensão coloidal homogênea estável.',
    mixingOrderIndex: 2,
    mixingOrderGroup: 'Sólidos (WP/WG/DF)',
    advantages: ['Sem poeira na manipulação e descarte limpo', 'Fácil escoamento da embalagem e medição', 'Excelente dispersão espontânea'],
    precautions: ['Necessita de 3 a 5 minutos de hidratação sob agitação antes de injetar formulações oleosas (EC/OD/Óleos)'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Suscetível a empelotamento caso óleos sejam adicionados antes de sua completa desintegração.',
  },
  {
    code: 'DF',
    fullName: 'Grânulos Secos de Fluxo Livre (Dry Flowable)',
    description: 'Formulação sólida microgranulada de alta fluidez que se dispersa em suspensão na água de forma imediata.',
    waterBehavior: 'Microgrânulos que se dispersam instantaneamente em contato com a água com mínima energia de cisalhamento.',
    mixingOrderIndex: 2,
    mixingOrderGroup: 'Sólidos (WP/WG/DF)',
    advantages: ['Fluidez excepcional sem retenção nas paredes da embalagem', 'Ausência de pó tóxico', 'Alta concentração de ingrediente ativo'],
    precautions: ['Aguardar dispersão completa antes de qualquer composto oleoso ou solvente'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Excelente com água em temperatura ambiente (18-28°C); em água fria (< 12°C) requer mais tempo de agitação.',
  },

  // 3. SÓLIDOS SOLÚVEIS EM ÁGUA (ORDEM WALES: 3 - SP / SG)
  {
    code: 'SP',
    fullName: 'Pó Solúvel em Água (Soluble Powder)',
    description: 'Sólido finamente particulado que se dissolve 100% em nível molecular na água, formando uma solução límpida verdadeira.',
    waterBehavior: 'Dissolve-se completamente na fase aquosa sem formar partículas suspensas; solução translúcida sem resíduo sólido.',
    mixingOrderIndex: 3,
    mixingOrderGroup: 'Sólidos Solúveis (SP/SG)',
    advantages: ['Não desgasta pontas de pulverização por abrasão', 'Zero risco de entupimento de filtros finos (mesh 80/100)', 'Solução perfeitamente estável após dissolvida'],
    precautions: ['Produto higroscópico: fechar bem a embalagem para não empedrar', 'Deve ser adicionado antes de formulações oleosas (EC) para que o solvente não impeça a dissolução'],
    recommendedAgitation: 'Baixa',
    filterMeshRecommendation: 'Compatível com qualquer malha (50 a 100 mesh)',
    carrierCompatibilityNotes: 'Em águas duras com alto cálcio, certos sais podem requerer condicionador quelatizante prévio.',
  },
  {
    code: 'SG',
    fullName: 'Grânulos Solúveis em Água (Soluble Granules)',
    description: 'Grânulos secos sem poeira que se dissolvem integralmente na água, gerando uma solução homogênea transparente.',
    waterBehavior: 'Dissolução química rápida ao nível molecular em segundos, sem turbidez nem resíduo coloidal.',
    mixingOrderIndex: 3,
    mixingOrderGroup: 'Sólidos Solúveis (SP/SG)',
    advantages: ['Combina a ausência de poeira do grânulo com a solubilidade molecular total da calda', 'Segurança máxima ao operador', 'Não decanta se a bomba for desligada'],
    precautions: ['Adicionar na água com agitação moderada antes de produtos emulsionáveis e óleos'],
    recommendedAgitation: 'Baixa',
    filterMeshRecommendation: 'Compatível com malhas 50, 80 e 100 mesh',
    carrierCompatibilityNotes: 'Compatível com a grande maioria dos defensivos; verificar apenas compatibilidade biológica.',
  },

  // 4. SUSPENSÕES & MICROENCAPSULADOS (ORDEM WALES: 4 - SC / FS / OD / CS / ZC / SE)
  {
    code: 'SC',
    fullName: 'Suspensão Concentrada (Suspension Concentrate)',
    description: 'Ingrediente ativo sólido insolúvel moído em escala micrométrica, suspenso em meio líquido aquoso com tensoativos.',
    waterBehavior: 'Dispersa-se prontamente na água formando uma suspensão leitosa coloidal estável e homogênea.',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: ['Fácil manuseio e dosagem líquida', 'Isento de solventes orgânicos agressivos', 'Excelente aderência foliar'],
    precautions: ['Pode sedimentar no fundo do frasco se estocado por longo período (agitar o frasco antes de dosar)', 'Sensível ao congelamento'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Padrão da indústria moderna; combina muito bem com caldas ácidas a neutras (pH 5.0 - 6.5).',
  },
  {
    code: 'FS',
    fullName: 'Suspensão Concentrada para Tratamento de Sementes (Flowable Concentrate for Seed Treatment)',
    description: 'Suspensão aquosa de alta densidade enriquecida com polímeros fixadores e corantes de segurança para recobrimento de sementes.',
    waterBehavior: 'Forma calda uniforme viscosa de alta adesividade seminal. Dispersa em água com agitação constante.',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: ['Altíssima retenção na semente com zero desprendimento de poeira ("dust-off")', 'Compatível com inoculantes biológicos bacterianos', 'Proteção prolongada plântula/solo'],
    precautions: ['Devido à alta viscosidade, agitar vigorosamente a embalagem antes da medição', 'Evitar choque com sais puros de micronutrientes não quelatizados (ex: sulfato de zinco bruto) que podem coagular os polímeros protetores'],
    recommendedAgitation: 'Alta e Contínua',
    filterMeshRecommendation: 'Malha 50 mesh em dosadores de TSI para evitar restrição de vazão',
    carrierCompatibilityNotes: 'Utilizar sempre quelatos orgânicos ao associar micronutrientes ao tratamento de sementes.',
  },
  {
    code: 'OD',
    fullName: 'Dispersão em Óleo (Oil Dispersion)',
    description: 'Ingrediente ativo sólido em partículas finas suspenso em fase líquida oleosa vegetal ou mineral com surfactantes.',
    waterBehavior: 'Forma uma dispersão/emulsão complexa onde microgotículas de óleo carregam as partículas sólidas do ingrediente ativo.',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: ['Adjuvante oleoso já embutido de fábrica', 'Excepcional penetração através da cutícula cerosa de plantas daninhas difíceis', 'Alta resistência à lavagem por chuvas'],
    precautions: ['Agitar a embalagem rigorosamente antes do uso', 'Adicionar no tanque APÓS a dispersão de pós e grânulos (WP/WG/DF), caso contrário o óleo reveste os grânulos secos impedindo sua diluição'],
    recommendedAgitation: 'Alta e Contínua',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Evitar associar óleos adicionais desnecessários sob temperaturas > 32°C para prevenir queima foliar.',
  },
  {
    code: 'CS',
    fullName: 'Suspensão de Encapsulado / Microencapsulado (Capsule Suspension)',
    description: 'Microcápsulas poliméricas contendo o ingrediente ativo suspensas em meio aquoso, projetadas para liberação programada.',
    waterBehavior: 'Dispersa-se de forma homogênea em água; as paredes poliméricas liberam o ativo após a evaporação da gota sobre o alvo vegetal.',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: ['Efeito residual expressivamente ampliado no campo', 'Menor toxicidade dérmica e inalatória para o aplicador', 'Menor degradação por raios UV solares'],
    precautions: ['Não utilizar bombas de alta pressão com cisalhamento extremo que possam romper mecanicamente as microcápsulas no tanque', 'Evitar óleos agressivos e solventes puros que dissolvam a parede polimérica na calda'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Excelente segurança biológica e compatibilidade ampla com fungicidas e inseticidas aquosos.',
  },
  {
    code: 'ZC',
    fullName: 'Mistura de Suspensão de Encapsulado e Suspensão Concentrada (CS + SC Formulation)',
    description: 'Formulação tecnológica avançada que combina um ativo microencapsulado (CS) com outro ativo em suspensão livre (SC) no mesmo galão.',
    waterBehavior: 'Gera suspensão coloidal dupla perfeitamente equilibrada com dispersantes duais de alta estabilidade termodinâmica.',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: [
      'Dupla dinâmica agronômica: choque imediato ("knockdown") pelo ativo em SC + residual longo pelo ativo microencapsulado (CS)',
      'Praticidade de campo eliminando a necessidade de misturar dois galões separados',
      'Excelente homogeneidade e estabilidade de tanque',
    ],
    precautions: [
      'Agitar o frasco antes da aplicação',
      'Não aplicar com doses excessivas de óleos minerais que possam acelerar a permeabilidade da casca da microcápsula',
      'Seguir rigorosamente a ordem no grupo de suspensões (Passo 4)',
    ],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Excelente compatibilidade com caldas fungicidas e adjuvantes siliconados padrão.',
  },
  {
    code: 'SE',
    fullName: 'Suspo-Emulsão (Suspo-Emulsion)',
    description: 'Sistema coloidal complexo contendo simultaneamente partículas sólidas insolúveis dispersas e gotículas líquidas emulsionadas na água.',
    waterBehavior: 'Combina em uma única fase o comportamento hidrodinâmico de uma suspensão (SC) e de uma emulsão (EW).',
    mixingOrderIndex: 4,
    mixingOrderGroup: 'Suspensões (SC/FS/OD/CS/ZC/SE)',
    advantages: ['Permite formular dois ingredientes ativos quimicamente incompatíveis em um único frasco estável', 'Redução do número de embalagens'],
    precautions: ['Rigorosa observância da ordem de preparo', 'Sensível a variações extremas de pH (< 4.5 ou > 8.0) que podem quebrar o balanço tensoativo'],
    recommendedAgitation: 'Alta e Contínua',
    filterMeshRecommendation: 'Filtros 50 mesh',
    carrierCompatibilityNotes: 'Manter a calda em agitação contínua durante todo o percurso da pulverização.',
  },

  // 5. SOLUÇÕES LÍQUIDAS AQUOSAS (ORDEM WALES: 5 - SL / AS / DC)
  {
    code: 'SL',
    fullName: 'Concentrado Solúvel (Soluble Liquid / Concentrate)',
    description: 'Ingrediente ativo completamente hidrossolúvel formulado em água ou solvente polar miscível.',
    waterBehavior: 'Dissolve-se 100% na água formando solução cristalina límpida e transparente sem partículas físicas suspensas.',
    mixingOrderIndex: 5,
    mixingOrderGroup: 'Soluções (SL/AS/DC)',
    advantages: ['Não entope filtros nem desgasta bicos', 'Não decanta caso a agitação do pulverizador seja desligada', 'Máxima homogeneidade e translocação sistêmica'],
    precautions: ['Muitas moléculas em SL (ex: Glifosato, 2,4-D amina) possuem carga iônica e sofrem complexação por águas duras (Ca²⁺, Mg²⁺, Fe³⁺)'],
    recommendedAgitation: 'Baixa',
    filterMeshRecommendation: 'Compatível com qualquer malha (50 a 100 mesh)',
    carrierCompatibilityNotes: 'Adicionar condicionador sequestrante ou sulfato de amônio ANTES do SL se a dureza da água for > 150 mg/L CaCO₃.',
  },
  {
    code: 'AS',
    fullName: 'Solução Aquosa Líquida (Aqueous Solution)',
    description: 'Solução líquida pura de sais orgânicos ou inorgânicos solúveis diluídos em veículo aquoso.',
    waterBehavior: 'Miscibilidade instantânea e total na água do tanque sem alteração de turbidez ou risco de separação de fases.',
    mixingOrderIndex: 5,
    mixingOrderGroup: 'Soluções (SL/AS/DC)',
    advantages: ['Compatibilidade física instantânea com água limpa', 'Segurança total para filtros finos e bicos eletrostáticos/rotativos', 'Rápida absorção'],
    precautions: ['Sais em alta concentração podem competir com outros sais em caldas super concentradas (salting-out)', 'Monitorar pH final'],
    recommendedAgitation: 'Baixa',
    filterMeshRecommendation: 'Filtros 50, 80 e 100 mesh',
    carrierCompatibilityNotes: 'Comumente usada para reguladores de crescimento e dessecação rápida.',
  },
  {
    code: 'DC',
    fullName: 'Concentrado Dispersível (Dispersible Concentrate)',
    description: 'Solução do ingrediente ativo em solventes miscíveis em água que, ao contato com a água do tanque, auto-dispersa o ativo em nanopartículas.',
    waterBehavior: 'Ao ser injetado na água, o solvente polar se dissolve e o ingrediente ativo forma instantaneamente uma névoa fina coloidal translúcida.',
    mixingOrderIndex: 5,
    mixingOrderGroup: 'Soluções (SL/AS/DC)',
    advantages: ['Permite formular ativos lipofílicos sem solventes aromáticos pesados de cheiro forte', 'Alta penetração e sistemicidade foliar'],
    precautions: ['Exige agitação ativa durante a adição para evitar formação de microcristais se a água estiver fria (< 14°C)'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Injetar lentamente no tanque com pelo menos 60% de água e agitador ligado.',
  },

  // 6. EMULSÕES & ÓLEOS EMULSIONÁVEIS (ORDEM WALES: 6 - EC / EW / ME / EO)
  {
    code: 'EC',
    fullName: 'Concentrado Emulsionável (Emulsifiable Concentrate)',
    description: 'Ingrediente ativo líquido insolúvel em água dissolvido em solvente orgânico associado a emulsionantes tensoativos.',
    waterBehavior: 'Ao entrar em contato com a água sob agitação, forma instantaneamente uma emulsão branca leitosa (efeito "bloom").',
    mixingOrderIndex: 6,
    mixingOrderGroup: 'Emulsões (EC/EW/ME/EO)',
    advantages: ['Rápida penetração através da camada de cera cuticular da folha e cutícula de insetos', 'Alta eficácia biológica'],
    precautions: ['Solventes orgânicos podem ressecar vedações de borracha do circuito de pulverização', 'NUNCA adicionar antes de pós ou grânulos (WP/WG/DF) pois forma pelotas insolúveis'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Requer atenção em misturas com sais concentrados para evitar quebra da emulsão ("nata" na superfície).',
  },
  {
    code: 'EW',
    fullName: 'Emulsão Óleo em Água (Emulsion Oil in Water)',
    description: 'Emulsão pré-estabilizada em fábrica com o ativo dissolvido em óleo disperso em fase aquosa externa contínua.',
    waterBehavior: 'Dilui-se prontamente na água sem a energia de quebra de solvente exigida por formulações EC tradicionais.',
    mixingOrderIndex: 6,
    mixingOrderGroup: 'Emulsões (EC/EW/ME/EO)',
    advantages: ['Menor teor de solventes aromáticos agressivos (VOC)', 'Menor odor, menor risco de fitotoxidez e maior segurança ao operador'],
    precautions: ['Proteger o frasco contra temperaturas extremas de calor (> 40°C) ou geada'],
    recommendedAgitation: 'Média',
    filterMeshRecommendation: 'Filtros 50 a 80 mesh',
    carrierCompatibilityNotes: 'Muito mais suave para a cera foliar do que EC, ideal para aplicações em fases reprodutivas sensíveis (florescimento).',
  },
  {
    code: 'ME',
    fullName: 'Microemulsão (Micro-Emulsion)',
    description: 'Sistema nanotecnológico termodinamicamente estável com gotículas nanométricas transparentes ou translúcidas.',
    waterBehavior: 'Miscibilidade espontânea instantânea sem turbidez marcante; aspecto límpido ou azulado translúcido.',
    mixingOrderIndex: 6,
    mixingOrderGroup: 'Emulsões (EC/EW/ME/EO)',
    advantages: ['Gotículas nanométricas com área de contato multiplicada', 'Absorção celular ultrarrápida', 'Não sofre separação de fases nem creaming'],
    precautions: ['Devido à rápida absorção cuticular, evitar misturas com óleos pesados sob sol escaldante'],
    recommendedAgitation: 'Baixa',
    filterMeshRecommendation: 'Filtros 50, 80 e 100 mesh',
    carrierCompatibilityNotes: 'Altíssima estabilidade física na calda.',
  },
  {
    code: 'EO',
    fullName: 'Emulsão Água em Óleo (Emulsion Water in Oil / Emulsão Invertida)',
    description: 'Sistema invertido onde microgotículas de água estão dispersas em uma fase oleosa externa contínua com agentes lipofílicos.',
    waterBehavior: 'Forma calda oleosa densa com forte tensão interfacial, conferindo gotas pesadas e altamente resistentes à deriva.',
    mixingOrderIndex: 6,
    mixingOrderGroup: 'Emulsões (EC/EW/ME/EO)',
    advantages: ['Excelente controle de deriva em aplicações com vento ou calor', 'Aderência e penetração cuticular extremas'],
    precautions: ['Viscosidade maior: verificar malha dos filtros para não restringir sucção da bomba', 'Limpeza rigorosa do tanque com detergente desengraxante pós-aplicação'],
    recommendedAgitation: 'Alta e Contínua',
    filterMeshRecommendation: 'Malha 50 mesh recomendada na sucção e linha',
    carrierCompatibilityNotes: 'Não associar a formulações incompatíveis com óleos.',
  },
];

/**
 * Retorna a posição oficial no protocolo WALES / DAMES com base na formulação e classe do produto
 */
export function getFormulationMixingStep(
  formulation: PesticideFormulationCode,
  agrochemicalClass?: AgrochemicalClass
): { step: number; groupName: string; note: string } {
  // Condicionadores e sequestrantes de água SEMPRE entram no primeiro instante
  if (agrochemicalClass === 'condicionador_calda') {
    return {
      step: 1,
      groupName: 'Condicionadores de Calda & Sequestrantes',
      note: 'Inserir com 30% a 50% de água limpa no tanque para neutralizar pH e dureza antes dos defensivos.',
    };
  }

  // Fertilizantes foliares entram após soluções e antes dos adjuvantes/óleos
  if (agrochemicalClass === 'fertilizante_foliar') {
    return {
      step: 7,
      groupName: 'Fertilizantes Foliares & Nutrientes',
      note: 'Inserir após a dispersão dos defensivos técnicos e antes dos adjuvantes óleos/espalhantes.',
    };
  }

  // Adjuvantes entram ao final (exceto anti-espumante que entra na água inicial)
  if (agrochemicalClass === 'adjuvante') {
    return {
      step: 8,
      groupName: 'Adjuvantes & Óleos',
      note: 'Adicionar por último com agitação contínua, permitindo a correta tensão superficial da calda.',
    };
  }

  switch (formulation) {
    case 'WSB':
      return {
        step: 1.5,
        groupName: 'Bolsas Hidrossolúveis (WSB)',
        note: 'Inserir com 50-70% de água sem Boro nem eletrólitos; aguardar 3-5 minutos para dissolução do PVA.',
      };
    case 'WP':
    case 'WG':
    case 'DF':
      return {
        step: 2,
        groupName: 'Sólidos Dispersíveis (WP / WG / DF)',
        note: 'Adicionar sob agitação e aguardar desintegração total antes de introduzir qualquer formulação líquida oleosa.',
      };
    case 'SP':
    case 'SG':
      return {
        step: 3,
        groupName: 'Sólidos Solúveis (SP / SG)',
        note: 'Aguardar dissolução molecular límpida completa na água.',
      };
    case 'SC':
    case 'FS':
    case 'OD':
    case 'CS':
    case 'ZC':
    case 'SE':
      return {
        step: 4,
        groupName: 'Suspensões & Dispersões (SC / FS / OD / CS / ZC / SE)',
        note: 'Agitar bem a embalagem antes da dosagem e adicionar na calda sob agitação constante.',
      };
    case 'SL':
    case 'AS':
    case 'DC':
      return {
        step: 5,
        groupName: 'Soluções Líquidas (SL / AS / DC)',
        note: 'Injetar de forma gradual na água sob recirculação.',
      };
    case 'EC':
    case 'EW':
    case 'ME':
    case 'EO':
      return {
        step: 6,
        groupName: 'Emulsões & Concentrados Emulsionáveis (EC / EW / ME / EO)',
        note: 'Injetar após todos os sólidos e suspensões estarem totalmente homogeneizados.',
      };
    default:
      return {
        step: 5,
        groupName: 'Defensivos em Geral',
        note: 'Adicionar com 75% da capacidade do tanque e agitação ativada.',
      };
  }
}

// ============================================================================
// 2. BANCO DE DEFENSIVOS & INSUMOS AGRÍCOLAS PARA O TANKMIX
// ============================================================================

export const TANKMIX_PRODUCTS_DATABASE: TankMixProduct[] = [
  // HERBICIDAS
  {
    id: 'glifosato_sal_potassico',
    commercialName: 'Glifosato Sal Potássico 620',
    activeIngredient: 'Glifosato (Sal Potássico)',
    concentration: '620 g/L (500 g/L equivalente ácido)',
    formulation: 'SL',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Glicina Substituída',
    actionMechanism: 'HRAC G (Inibidor da EPSPs)',
    manufacturer: 'Bayer / Syngenta / Vários',
    mapaRegistration: '006307',
    defaultDose: 2.5,
    doseUnit: 'L/ha',
    targetPests: ['Capim-amargoso', 'Buva', 'Capim-pé-de-galinha', 'Plantas daninhas anuais e perenes'],
    registeredCrops: ['Soja RR/Intacta', 'Milho RR', 'Algodão', 'Café', 'Citros', 'Dessecação pré-plantio'],
    optimalPhRange: { min: 4.0, max: 5.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: true, // Fortemente inativado por Ca2+, Mg2+, Fe3+
    mixingOrderStep: 5,
    safetyIntervalDays: 1,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Molécula sensível a águas duras. Em águas com > 150 ppm de dureza, adicionar Sulfato de Amônio ou condicionador sequestrante antes.',
    ppeRequired: ['Luvas de nitrila', 'Máscara com filtro', 'Óculos de proteção', 'Avental impermeável'],
  },
  {
    id: 'glifosato_sal_ipa',
    commercialName: 'Glifosato Sal Isopropilamina 480',
    activeIngredient: 'Glifosato (Sal Isopropilamina - IPA)',
    concentration: '480 g/L (360 g/L equivalente ácido)',
    formulation: 'SL',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Glicina Substituída',
    actionMechanism: 'HRAC G (Inibidor da EPSPs)',
    manufacturer: 'Genéricos / Nufarm / Albaugh',
    mapaRegistration: '002396',
    defaultDose: 3.0,
    doseUnit: 'L/ha',
    targetPests: ['Plantas daninhas de folha larga e estreita', 'Dessecação'],
    registeredCrops: ['Soja', 'Milho', 'Cana-de-açúcar', 'Café', 'Citros'],
    optimalPhRange: { min: 4.0, max: 5.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: true,
    mixingOrderStep: 5,
    safetyIntervalDays: 1,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Mistura com 2,4-D amina em alta concentração pode formar precipitado salino se a calda estiver muito concentrada.',
    ppeRequired: ['Luvas de nitrila', 'Botas de borracha', 'Viseira facial'],
  },
  {
    id: '2_4_d_sal_dimetilamina',
    commercialName: '2,4-D Sal Dimetilamina 806',
    activeIngredient: '2,4-D (Sal Dimetilamina)',
    concentration: '806 g/L (670 g/L eq. ácido)',
    formulation: 'SL',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Ácido Ariloxialcanoico',
    actionMechanism: 'HRAC O (Mimetizador de auxina)',
    manufacturer: 'Corteva / UPL / Nufarm',
    mapaRegistration: '006795',
    defaultDose: 1.5,
    doseUnit: 'L/ha',
    targetPests: ['Buva', 'Corda-de-viola', 'Trapoeraba', 'Caruru', 'Guanxuma'],
    registeredCrops: ['Soja Enlist', 'Milho Enlist', 'Pastagens', 'Trigo', 'Cana-de-açúcar', 'Dessecação'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: true,
    mixingOrderStep: 5,
    safetyIntervalDays: 14,
    toxicologicalClass: 'I - Extremamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Antagonista com graminicidas (Clethodim/Haloxifop). Se misturar com óleo mineral ou fertilizante foliar ácido pode causar separação.',
    ppeRequired: ['Macacão hidrorrepelente', 'Respirador PFF2', 'Luvas de borracha nitrílica', 'Botas'],
  },
  {
    id: 'clethodim_240',
    commercialName: 'Clethodim 240 EC',
    activeIngredient: 'Clethodim',
    concentration: '240 g/L',
    formulation: 'EC',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Ciclohexanodiona',
    actionMechanism: 'HRAC A (Inibidor da ACCase)',
    manufacturer: 'Arysta / UPL / Vários',
    mapaRegistration: '004098',
    defaultDose: 0.5,
    doseUnit: 'L/ha',
    targetPests: ['Capim-amargoso resistente', 'Capim-pé-de-galinha', 'Milho tiguera'],
    registeredCrops: ['Soja', 'Algodão', 'Feijão', 'Girassol', 'Café'],
    optimalPhRange: { min: 4.5, max: 6.0 },
    hydrolysisRiskHighPh: true, // Degrada rápido sob pH > 7.0 e sob luz intensa
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 60,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Exige adjuvante Óleo Mineral ou Vegetal Metilado (0.5 a 1.0% v/v). Não misturar com latifolicidas (2,4-D, Clorimuron, Bentazona) no mesmo tanque.',
    ppeRequired: ['Luvas', 'Óculos', 'Respirador'],
  },
  {
    id: 'haloxifop_124',
    commercialName: 'Haloxifop-P-Metílico 124 EC',
    activeIngredient: 'Haloxifop-P-metílico',
    concentration: '124 g/L',
    formulation: 'EC',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Ariloxifenoxipropionato (FOP)',
    actionMechanism: 'HRAC A (Inibidor da ACCase)',
    manufacturer: 'Corteva / Adama',
    mapaRegistration: '006207',
    defaultDose: 0.8,
    doseUnit: 'L/ha',
    targetPests: ['Capim-amargoso perenizado', 'Capim-colonião', 'Braquiária'],
    registeredCrops: ['Soja', 'Algodão', 'Feijão'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 65,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Antagonizado por herbicidas auxínicos e inibidores de ALS. Respeitar intervalo mínimo de 5 a 7 dias entre aplicações se não usar dose compensatória.',
    ppeRequired: ['Luvas', 'Óculos', 'Máscara'],
  },
  {
    id: 'atrazina_500_sc',
    commercialName: 'Atrazina 500 SC',
    activeIngredient: 'Atrazina',
    concentration: '500 g/L',
    formulation: 'SC',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Triazina',
    actionMechanism: 'HRAC C1 (Inibidor do Fotossistema II)',
    manufacturer: 'Syngenta / Ourofino / Sipcam',
    mapaRegistration: '009506',
    defaultDose: 3.5,
    doseUnit: 'L/ha',
    targetPests: ['Folhas largas em milho', 'Corda-de-viola', 'Caruru', 'Picão-preto'],
    registeredCrops: ['Milho', 'Sorgo', 'Cana-de-açúcar'],
    optimalPhRange: { min: 5.5, max: 7.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 3,
    safetyIntervalDays: 60,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Suspensão densa. Agitar bem antes de abrir o galão. Requer boa agitação no tanque.',
    ppeRequired: ['Luvas de nitrila', 'Viseira', 'Avental impermeável'],
  },
  {
    id: 's_metolacloro_960',
    commercialName: 'S-Metolacloro 960 EC',
    activeIngredient: 'S-Metolacloro',
    concentration: '960 g/L',
    formulation: 'EC',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Cloroacetamida',
    actionMechanism: 'HRAC K3 (Inibidor de VLCFA)',
    manufacturer: 'Syngenta / Iharabras',
    mapaRegistration: '008598',
    defaultDose: 1.5,
    doseUnit: 'L/ha',
    targetPests: ['Pré-emergência de gramíneas', 'Capim-pé-de-galinha', 'Capim-colchão'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Cana-de-açúcar'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 75,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Excelente parceiro para dessecação no sistema plante-aplique. Injetar após pós e suspensões.',
    ppeRequired: ['Luvas', 'Óculos', 'Respirador'],
  },
  {
    id: 'glufosinato_200',
    commercialName: 'Glufosinato de Amônio 200 SL',
    activeIngredient: 'Glufosinato de Amônio',
    concentration: '200 g/L',
    formulation: 'SL',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Ácido Fosfínico',
    actionMechanism: 'HRAC H (Inibidor da Glutamina Sintetase)',
    manufacturer: 'BASF / UPL / Adama',
    mapaRegistration: '002104',
    defaultDose: 2.0,
    doseUnit: 'L/ha',
    targetPests: ['Buva resistente', 'Capim-amargoso', 'Trapoeraba', 'Corda-de-viola'],
    registeredCrops: ['Algodão LL', 'Milho LL', 'Soja LL', 'Café', 'Citros', 'Dessecação'],
    optimalPhRange: { min: 4.5, max: 6.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: true,
    mixingOrderStep: 5,
    safetyIntervalDays: 14,
    toxicologicalClass: 'II - Altamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Herbicida de contato. Requer volume de calda maior (150-200 L/ha) e adição de sulfato de amônio em água dura.',
    ppeRequired: ['Macacão impermeável', 'Luvas', 'Máscara com carvão ativado'],
  },
  {
    id: 'saflufenacil_700_wg',
    commercialName: 'Saflufenacil 700 WG',
    activeIngredient: 'Saflufenacil',
    concentration: '700 g/kg',
    formulation: 'WG',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Pirimidinodiona',
    actionMechanism: 'HRAC E (Inibidor da PROTOX)',
    manufacturer: 'BASF',
    mapaRegistration: '008910',
    defaultDose: 0.05, // 50 g/ha
    doseUnit: 'kg/ha',
    targetPests: ['Buva', 'Corda-de-viola', 'Leiteiro', 'Trapoeraba'],
    registeredCrops: ['Soja (dessecação)', 'Milho', 'Algodão', 'Arroz', 'Cana'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 2,
    safetyIntervalDays: 7,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Exige obrigatoriamente adjuvante Óleo Vegetal Metilado (MSO). Adicionar o WG ao tanque logo após a água e condicionadores.',
    ppeRequired: ['Luvas', 'Óculos', 'Respirador'],
  },

  // FUNGICIDAS
  {
    id: 'mancozebe_750_wg',
    commercialName: 'Mancozebe 750 WG Multissítio',
    activeIngredient: 'Mancozebe',
    concentration: '750 g/kg',
    formulation: 'WG',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Ditiocarbamato',
    actionMechanism: 'FRAC M03 (Multissítio)',
    manufacturer: 'UPL / Indofil / Vários',
    mapaRegistration: '001202',
    defaultDose: 1.5,
    doseUnit: 'kg/ha',
    targetPests: ['Ferrugem-asiática da soja (Phakopsora pachyrhizi)', 'Mancha-alvo', 'Cercospora'],
    registeredCrops: ['Soja', 'Milho', 'Feijão', 'Batata', 'Tomate', 'Uva', 'Citros'],
    optimalPhRange: { min: 5.5, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 2,
    safetyIntervalDays: 21,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Fungicida protetor multissítio fundamental no manejo de resistência. Adicionar no início do preparo da calda.',
    ppeRequired: ['Luvas', 'Máscara PFF2', 'Óculos de ampla visão'],
  },
  {
    id: 'azoxi_ciproconazol_sc',
    commercialName: 'Azoxistrobina + Ciproconazol 280 SC',
    activeIngredient: 'Azoxistrobina (200 g/L) + Ciproconazol (80 g/L)',
    concentration: '280 g/L',
    formulation: 'SC',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Estrobilurina + Triazol',
    actionMechanism: 'FRAC 11 + FRAC 3',
    manufacturer: 'Syngenta / Vários',
    mapaRegistration: '004903',
    defaultDose: 0.3,
    doseUnit: 'L/ha',
    targetPests: ['Ferrugem-asiática', 'Cercosporiose', 'Septoriose', 'Oídio'],
    registeredCrops: ['Soja', 'Milho', 'Café', 'Algodão', 'Arroz'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 3,
    safetyIntervalDays: 30,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'Recomenda-se associar a adjuvante recomendado pelo fabricante. Manter constante agitação.',
    ppeRequired: ['Luvas de nitrila', 'Respirador', 'Viseira'],
  },
  {
    id: 'trifloxi_protioconazol_ec',
    commercialName: 'Trifloxistrobina + Protioconazol 325 EC',
    activeIngredient: 'Trifloxistrobina (150 g/L) + Protioconazol (175 g/L)',
    concentration: '325 g/L',
    formulation: 'EC',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Estrobilurina + Triazolintiona',
    actionMechanism: 'FRAC 11 + FRAC 3',
    manufacturer: 'Bayer CropScience',
    mapaRegistration: '005408',
    defaultDose: 0.4,
    doseUnit: 'L/ha',
    targetPests: ['Ferrugem-asiática', 'Mancha-alvo', 'Antracnose', 'Crestamento'],
    registeredCrops: ['Soja', 'Milho', 'Algodão'],
    optimalPhRange: { min: 5.0, max: 6.8 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 30,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Fórmula EC concentrada. Injetar após a prévia dispersão de multissítios (Mancozebe / Cobre).',
    ppeRequired: ['Luvas', 'Óculos', 'Respirador'],
  },
  {
    id: 'oxicloreto_de_cobre_wp',
    commercialName: 'Oxicloreto de Cobre 500 WP',
    activeIngredient: 'Cobre metálico (como Oxicloreto de Cobre)',
    concentration: '500 g/kg de Cobre',
    formulation: 'WP',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Inorgânico de Cobre',
    actionMechanism: 'FRAC M01 (Multissítio)',
    manufacturer: 'Albaugh / Iharabras / Vários',
    mapaRegistration: '001584',
    defaultDose: 1.0,
    doseUnit: 'kg/ha',
    targetPests: ['Bacterioses', 'Manchas foliares', 'Pústula bacteriana', 'Ferrugem'],
    registeredCrops: ['Soja', 'Café', 'Citros', 'Tomate', 'Uva', 'Feijão'],
    optimalPhRange: { min: 6.5, max: 8.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 2,
    safetyIntervalDays: 7,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'NUNCA misturar com calda ácida (pH < 6.0) ou com Fosfitos/Ácido Fosfórico, pois solubiliza íons Cu2+ livres provocando fitotoxicidade severa.',
    ppeRequired: ['Luvas de nitrila', 'Máscara PFF2', 'Óculos de proteção'],
  },
  {
    id: 'difenoconazol_250_ec',
    commercialName: 'Difenoconazol 250 EC',
    activeIngredient: 'Difenoconazol',
    concentration: '250 g/L',
    formulation: 'EC',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Triazol',
    actionMechanism: 'FRAC 3 (Inibidor da Desmetilação)',
    manufacturer: 'Syngenta / Vários',
    mapaRegistration: '008898',
    defaultDose: 0.3,
    doseUnit: 'L/ha',
    targetPests: ['Cercospora', 'Septoriose', 'Sarna', 'Oídio', 'Mancha-púrpura'],
    registeredCrops: ['Soja', 'Feijão', 'Maçã', 'Uva', 'Café', 'Citros'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 14,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Excelente sistemicidade e ação curativa inicial.',
    ppeRequired: ['Luvas', 'Óculos'],
  },

  // INSETICIDAS & ACARICIDAS
  {
    id: 'clorantraniliprole_200_sc',
    commercialName: 'Clorantraniliprole 200 SC',
    activeIngredient: 'Clorantraniliprole',
    concentration: '200 g/L',
    formulation: 'SC',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Diamida Antranílica',
    actionMechanism: 'IRAC 28 (Modulador dos receptores de rianodina)',
    manufacturer: 'FMC / Corteva',
    mapaRegistration: '008409',
    defaultDose: 0.08, // 80 mL/ha
    doseUnit: 'L/ha',
    targetPests: ['Helicoverpa armigera', 'Spodoptera frugiperda', 'Lagarta-falsa-medideira', 'Broca-do-café'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana-de-açúcar', 'Tomate'],
    optimalPhRange: { min: 4.5, max: 6.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 3,
    safetyIntervalDays: 1,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Excelente seletividade a inimigos naturais. Elevado período residual no tecido foliar.',
    ppeRequired: ['Luvas', 'Óculos de proteção'],
  },
  {
    id: 'acefato_750_sp',
    commercialName: 'Acefato 750 SP',
    activeIngredient: 'Acefato',
    concentration: '750 g/kg',
    formulation: 'SP',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Organofosforado',
    actionMechanism: 'IRAC 1B (Inibidor da Acetilcolinesterase)',
    manufacturer: 'UPL / Arysta / Vários',
    mapaRegistration: '002888',
    defaultDose: 0.8,
    doseUnit: 'kg/ha',
    targetPests: ['Percevejo-marrom', 'Percevejo-verde-pequeno', 'Lagartas', 'Tripes', 'Mosca-branca'],
    registeredCrops: ['Soja', 'Algodão', 'Feijão', 'Milho'],
    optimalPhRange: { min: 4.0, max: 6.0 },
    hydrolysisRiskHighPh: true, // Hidrólise alcalina severa em pH > 7.0
    cationBindingRisk: false,
    mixingOrderStep: 5,
    safetyIntervalDays: 14,
    toxicologicalClass: 'I - Extremamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'ATENÇÃO: Em água alcalina (pH > 7.5), sofre rápida hidrólise com perda de 50% de eficácia em poucas horas. Condicionar o pH da água para 5.0 antes de adicionar.',
    ppeRequired: ['Macacão impermeável com capuz', 'Respirador facial', 'Luvas nitrílicas longas', 'Botas'],
  },
  {
    id: 'tiametoxam_lambda_sc',
    commercialName: 'Tiametoxam + Lambda-Cialotrina 247 SC',
    activeIngredient: 'Tiametoxam (141 g/L) + Lambda-Cialotrina (106 g/L)',
    concentration: '247 g/L',
    formulation: 'SC',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Neonicotinoide + Piretroide',
    actionMechanism: 'IRAC 4A + IRAC 3A',
    manufacturer: 'Syngenta / Vários',
    mapaRegistration: '000504',
    defaultDose: 0.2,
    doseUnit: 'L/ha',
    targetPests: ['Percevejo-marrom', 'Percevejo-barriga-verde', 'Cigarrinha-do-milho', 'Lagartas'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Arroz', 'Café'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true, // Piretroide degrada em pH > 7.5
    cationBindingRisk: false,
    mixingOrderStep: 3,
    safetyIntervalDays: 21,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'Combinação de efeito de choque (piretroide) com sistêmico residual (neonicotinoide). Requer pH 5.0 a 6.0.',
    ppeRequired: ['Luvas', 'Viseira', 'Respirador'],
  },
  {
    id: 'bifentrina_100_ec',
    commercialName: 'Bifentrina 100 EC',
    activeIngredient: 'Bifentrina',
    concentration: '100 g/L',
    formulation: 'EC',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Piretroide',
    actionMechanism: 'IRAC 3A (Modulador dos canais de sódio)',
    manufacturer: 'FMC / Iharabras / Vários',
    mapaRegistration: '006595',
    defaultDose: 0.4,
    doseUnit: 'L/ha',
    targetPests: ['Ácaro-rajado', 'Percevejos', 'Lagartas', 'Bicudo-do-algodoeiro'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Tomate'],
    optimalPhRange: { min: 4.5, max: 6.0 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 14,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'Ação inseticida e acaricida por contato e ingestão. Evitar águas com pH > 7.0.',
    ppeRequired: ['Luvas de nitrila', 'Respirador', 'Óculos'],
  },

  // ADJUVANTES & CONDICIONADORES DE CALDA
  {
    id: 'oleo_mineral_756_ec',
    commercialName: 'Óleo Mineral Parafínico 756 EC',
    activeIngredient: 'Hidrocarbonetos Alifáticos Parafínicos',
    concentration: '756 g/L',
    formulation: 'EC',
    agrochemicalClass: 'adjuvante',
    chemicalGroup: 'Óleo Mineral',
    actionMechanism: 'Espalhante, Adesivo, Penetrante e Anti-evaporante',
    manufacturer: 'Vários / Ipiranga / Total',
    mapaRegistration: 'Isento / Adjuvante',
    defaultDose: 0.5,
    doseUnit: 'L/ha',
    targetPests: ['Adjuvante para dessecação e fungicidas'],
    registeredCrops: ['Todas as culturas agrícolas'],
    optimalPhRange: { min: 4.0, max: 8.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 8,
    safetyIntervalDays: 0,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Adicionar por último ou conforme recomendação da bula do defensivo associado. Não aplicar sob temperatura > 32°C para evitar fitotoxicidade.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'oleo_vegetal_metilado_mso',
    commercialName: 'Óleo Vegetal Metilado (MSO)',
    activeIngredient: 'Éster Metílico de Óleo de Soja',
    concentration: '720 g/L',
    formulation: 'EC',
    agrochemicalClass: 'adjuvante',
    chemicalGroup: 'Éster de Ácido Graxo Vegetal',
    actionMechanism: 'Penetrante de cutícula de alta performance e espalhante',
    manufacturer: 'Adama / Corteva / Vários',
    mapaRegistration: 'Isento / Adjuvante',
    defaultDose: 0.5,
    doseUnit: 'L/ha',
    targetPests: ['Adjuvante essencial para Graminicidas (Clethodim/Haloxifop) e Saflufenacil'],
    registeredCrops: ['Todas as culturas'],
    optimalPhRange: { min: 4.0, max: 8.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 8,
    safetyIntervalDays: 0,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'Excelente dissolução das ceras epicuticulares. Aumenta a velocidade de penetração do graminicida.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'silicone_organossiliconado',
    commercialName: 'Surfactante Organossiliconado Super-Espalhante',
    activeIngredient: 'Poliéter Polimetilsiloxano',
    concentration: '1000 g/L',
    formulation: 'SL',
    agrochemicalClass: 'adjuvante',
    chemicalGroup: 'Organossilicone',
    actionMechanism: 'Quebra extrema da tensão superficial (super-espalhamento) e efeito estomático',
    manufacturer: 'Momentive / Vários',
    mapaRegistration: 'Isento / Adjuvante',
    defaultDose: 0.05, // 50 mL/ha
    doseUnit: 'L/ha',
    targetPests: ['Espalhante foliar de alta cobertura'],
    registeredCrops: ['Todas as culturas'],
    optimalPhRange: { min: 5.0, max: 7.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 8,
    safetyIntervalDays: 0,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'Atenção à dose: excesso de organossiliconado causa escorrimento da gota ("run-off") e perda de defensivo para o solo.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'condicionador_sulfato_amonio',
    commercialName: 'Condicionador Redutor de Dureza & Sulfato de Amônio',
    activeIngredient: 'Sulfato de Amônio Grau Técnico + Ácido Policarboxílico Sequestrante',
    concentration: '400 g/L',
    formulation: 'SL',
    agrochemicalClass: 'condicionador_calda',
    chemicalGroup: 'Inorgânico / Sequestrante Catiônico',
    actionMechanism: 'Sequestra Ca²⁺, Mg²⁺, Fe³⁺ e acidifica para pH 4.5 - 5.2',
    manufacturer: 'GeaAgro Tech / Vários',
    mapaRegistration: 'Fertilizante / Adjuvante MAPA',
    defaultDose: 1.0,
    doseUnit: 'L/100L',
    targetPests: ['Condicionamento químico da água de pulverização'],
    registeredCrops: ['Todas'],
    optimalPhRange: { min: 3.5, max: 5.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 1, // PRIMEIRO DE TODOS (LOGO APÓS ÁGUA)
    safetyIntervalDays: 0,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'OBRIGATÓRIO: Inserir logo no início do abastecimento do tanque (com 30-50% de água) para neutralizar os cátions antes do defensivo entrar em contato.',
    ppeRequired: ['Luvas', 'Óculos'],
  },

  // FERTILIZANTES FOLIARES
  {
    id: 'boro_monoetanolamina_150',
    commercialName: 'Boro Monoetanolamina 150 g/L',
    activeIngredient: 'Boro complexado com MEA',
    concentration: '150 g/L Boro solúvel',
    formulation: 'SL',
    agrochemicalClass: 'fertilizante_foliar',
    chemicalGroup: 'Complexo Orgânico de Boro',
    actionMechanism: 'Nutrição de Boro, pegamento floral e tubo polínico',
    manufacturer: 'Vários / Yara / ICL',
    mapaRegistration: 'Fertilizante Foliar MAPA',
    defaultDose: 0.5,
    doseUnit: 'L/ha',
    targetPests: ['Nutrição vegetal foliar'],
    registeredCrops: ['Soja (R1/R2)', 'Milho', 'Algodão', 'Café', 'Citros'],
    optimalPhRange: { min: 7.0, max: 8.5 }, // Tende a elevar o pH da calda!
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 7,
    safetyIntervalDays: 0,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'ATENÇÃO CRÍTICA: Boro MEA é fortemente alcalinizante e eleva o pH da calda para > 8.0, o que pode hidrolisar inseticidas e fungicidas se não for reajustado.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'manganes_quelatizado_edta',
    commercialName: 'Manganês Quelatizado EDTA 100',
    activeIngredient: 'Manganês quelatizado por EDTA',
    concentration: '100 g/L Mn solúvel',
    formulation: 'SL',
    agrochemicalClass: 'fertilizante_foliar',
    chemicalGroup: 'Quelato Sintético EDTA',
    actionMechanism: 'Ativação enzimática e fotossíntese (Fotólise da água)',
    manufacturer: 'Vários / Brandt / Tradecorp',
    mapaRegistration: 'Fertilizante Foliar MAPA',
    defaultDose: 0.7,
    doseUnit: 'L/ha',
    targetPests: ['Suprimento de Mn em soja RR com efeito "yellow flash"'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 7,
    safetyIntervalDays: 0,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'Sendo 100% quelatizado em EDTA, NÃO inativa o glifosato na calda, diferentemente dos sais de sulfato de manganês comuns.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'fosfito_de_potassio_00_30_20',
    commercialName: 'Fosfito de Potássio 00-30-20',
    activeIngredient: 'Fosfito de Potássio (Íon Fosfito $H_2PO_3^-$)',
    concentration: '420 g/L P2O5 + 280 g/L K2O',
    formulation: 'SL',
    agrochemicalClass: 'fertilizante_foliar',
    chemicalGroup: 'Fosfito Inorgânico',
    actionMechanism: 'Indução de fitoalexinas, nutrição de K e sanidade',
    manufacturer: 'Vários / Spraytec / Nutriplant',
    mapaRegistration: 'Fertilizante Foliar MAPA',
    defaultDose: 1.0,
    doseUnit: 'L/ha',
    targetPests: ['Indutor de resistência foliar'],
    registeredCrops: ['Soja', 'Citros', 'Café', 'Uva', 'Milho'],
    optimalPhRange: { min: 5.5, max: 6.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 7,
    safetyIntervalDays: 0,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'NUNCA misturar com fungicidas cúpricos (Oxicloreto, Hidróxido de Cobre) ou óleos minerais pesados. Risco altíssimo de fitotoxicidade foliar severa.',
    ppeRequired: ['Luvas', 'Óculos'],
  },

  // PRODUTOS COM NOVAS FORMULAÇÕES TECNOLÓGICAS (ZC, CS, OD, SG, DF, FS, EW, ME, SE, AS, WSB, DC)
  {
    id: 'ampligo_zc',
    commercialName: 'Ampligo ZC',
    activeIngredient: 'Clorantraniliprole (100 g/L) + Lambda-cialotrina (50 g/L)',
    concentration: '100 + 50 g/L',
    formulation: 'ZC',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Diamida Antranílica + Piretroide Microencapsulado',
    actionMechanism: 'Modulador dos receptores de rianodina (IRAC 28) + Modulador de canais de sódio (IRAC 3A)',
    manufacturer: 'Syngenta',
    mapaRegistration: '09712',
    defaultDose: 0.15,
    doseUnit: 'L/ha',
    targetPests: ['Lagarta-do-cartucho (Spodoptera frugiperda)', 'Lagarta-falsa-medideira', 'Helicoverpa armigera'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Tomate', 'Feijão'],
    optimalPhRange: { min: 5.0, max: 6.8 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 14,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação mista ZC: combina suspensão concentrada (choque) com microcápsulas (longo residual). Injetar no Passo 4 (Suspensões). Evitar doses excessivas de óleo mineral que possam solubilizar a parede da cápsula.',
    ppeRequired: ['Luvas de nitrila', 'Respirador com filtro P2', 'Óculos de proteção'],
  },
  {
    id: 'engeo_pleno_s_zc',
    commercialName: 'Engeo Pleno S',
    activeIngredient: 'Tiametoxam (141 g/L) + Lambda-cialotrina (106 g/L)',
    concentration: '141 + 106 g/L',
    formulation: 'ZC',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Neonicotinoide + Piretroide Microencapsulado',
    actionMechanism: 'Agonista do receptor nicotínico de acetilcolina (IRAC 4A) + Modulador de canal de sódio (IRAC 3A)',
    manufacturer: 'Syngenta',
    mapaRegistration: '10312',
    defaultDose: 0.25,
    doseUnit: 'L/ha',
    targetPests: ['Percevejo-marrom (Euschistus heros)', 'Percevejo-verde-pequeno', 'Mosca-branca'],
    registeredCrops: ['Soja', 'Milho', 'Trigo', 'Algodão'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 21,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'Tecnologia Zeon ZC com microencapsulamento de liberação rápida. Excelente estabilidade física na água. Adicionar sob agitação contínua.',
    ppeRequired: ['Luvas de nitrila', 'Respirador', 'Óculos'],
  },
  {
    id: 'karate_zeon_50_cs',
    commercialName: 'Karate Zeon 50 CS',
    activeIngredient: 'Lambda-cialotrina Microencapsulada',
    concentration: '50 g/L',
    formulation: 'CS',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Piretroide Microencapsulado (IRAC 3A)',
    actionMechanism: 'Modulação de canais de sódio na membrana axônica dos neurônios dos insetos',
    manufacturer: 'Syngenta',
    mapaRegistration: '003299',
    defaultDose: 0.15,
    doseUnit: 'L/ha',
    targetPests: ['Lagartas desfolhadoras', 'Percevejos', 'Bicudo-do-algodoeiro'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Citros'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 14,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Microcápsulas de poliuréia que protegem o ingrediente ativo da degradação solar ultravioleta. Não utilizar bombas com pressão excessiva (> 8 bar) que rompam as cápsulas na recirculação.',
    ppeRequired: ['Luvas de nitrila', 'Óculos', 'Respirador'],
  },
  {
    id: 'gamit_360_cs',
    commercialName: 'Gamit 360 CS',
    activeIngredient: 'Clomazone Microencapsulado',
    concentration: '360 g/L',
    formulation: 'CS',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Isoxazolidinona (HRAC 13 / F4)',
    actionMechanism: 'Inibição da biossíntese de carotenoides e clorofila (despigmentação)',
    manufacturer: 'FMC Agrícola',
    mapaRegistration: '04898',
    defaultDose: 1.2,
    doseUnit: 'L/ha',
    targetPests: ['Capim-pé-de-galinha', 'Capim-colchão', 'Buva e folhas estreitas em pré-emergência'],
    registeredCrops: ['Soja', 'Algodão', 'Arroz', 'Cana-de-açúcar'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 60,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'A microencapsulação (CS) reduz drasticamente a volatilidade do clomazone, permitindo aplicação segura sem risco de deriva gasosa para culturas vizinhas. Inserir no Passo 4.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'sanson_40_od',
    commercialName: 'Sanson 40 OD',
    activeIngredient: 'Nicosulfurom em Dispersão Oleosa',
    concentration: '40 g/L',
    formulation: 'OD',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Sulfonilureia (HRAC 2 / B)',
    actionMechanism: 'Inibição da enzima acetolactato sintase (ALS) e síntese de aminoácidos essenciais',
    manufacturer: 'ISK / UPL',
    mapaRegistration: '006495',
    defaultDose: 1.0,
    doseUnit: 'L/ha',
    targetPests: ['Capim-marmelada', 'Capim-colchão', 'Trapoeraba', 'Corda-de-viola em pós-emergência do milho'],
    registeredCrops: ['Milho'],
    optimalPhRange: { min: 5.5, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 45,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'III - Perigoso',
    leafletNotes: 'Formulação OD (Dispersão em Óleo): já contém óleo adjuvante integrado. NUNCA colocar antes de dispersar grânulos ou pós (WG/WP/DF), pois a fase oleosa reveste os grânulos e impede a diluição.',
    ppeRequired: ['Luvas de nitrila', 'Óculos'],
  },
  {
    id: 'actara_250_sg',
    commercialName: 'Actara 250 SG',
    activeIngredient: 'Tiametoxam Solúvel em Grânulos',
    concentration: '250 g/kg',
    formulation: 'SG',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Neonicotinoide Solúvel (IRAC 4A)',
    actionMechanism: 'Agonista de receptores nicotínicos de acetilcolina no SNC dos insetos',
    manufacturer: 'Syngenta',
    mapaRegistration: '006098',
    defaultDose: 0.2,
    doseUnit: 'kg/ha',
    targetPests: ['Mosca-branca (Bemisia tabaci)', 'Pulgões', 'Cigarrinha-do-milho (Dalbulus maidis)'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros', 'Tomate'],
    optimalPhRange: { min: 5.0, max: 6.5 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 3,
    safetyIntervalDays: 14,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação SG (Grânulos Solúveis): dissolve-se completamente em nível molecular em menos de 1 minuto, sem gerar pó nem partículas em suspensão. Adicionar no Passo 3 (Sólidos Solúveis).',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'sencor_480_df',
    commercialName: 'Sencor 480 DF',
    activeIngredient: 'Metribuzim Dry Flowable',
    concentration: '480 g/kg',
    formulation: 'DF',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Triazinona (HRAC 5 / C1)',
    actionMechanism: 'Inibição da fotossíntese no fotossistema II (PS II)',
    manufacturer: 'Bayer CropScience',
    mapaRegistration: '000787',
    defaultDose: 0.7,
    doseUnit: 'kg/ha',
    targetPests: ['Caruru', 'Buva', 'Picão-preto', 'Trapoeraba em pré e pós-emergência'],
    registeredCrops: ['Soja', 'Cana-de-açúcar', 'Café', 'Batata', 'Tomate'],
    optimalPhRange: { min: 5.5, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 2,
    safetyIntervalDays: 45,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação DF (Dry Flowable): grânulos de fluxo livre sem poeira. Adicionar no Passo 2 e aguardar dispersão completa com agitador ligado antes de colocar formulações líquidas.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'standak_top_fs',
    commercialName: 'Standak Top FS',
    activeIngredient: 'Fipronil (250 g/L) + Tiofanato-metílico (225 g/L) + Piraclostrobina (25 g/L)',
    concentration: '250 + 225 + 25 g/L',
    formulation: 'FS',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Fenilpirazol + Benzimidazol + Estrobilurina',
    actionMechanism: 'Bloqueio de canais GABA (Fipronil) + Inibição de divisão celular mitótica + Bloqueio do complexo III mitocondrial',
    manufacturer: 'BASF',
    mapaRegistration: '01209',
    defaultDose: 0.1,
    doseUnit: 'L/ha',
    targetPests: ['Lagarta-elasmo (Elasmopalpus lignosellus)', 'Coró-da-soja', 'Fungos de solo (Rhizoctonia solani, Fusarium)', 'Antracnose'],
    registeredCrops: ['Soja (Tratamento de Sementes TSI)'],
    optimalPhRange: { min: 5.5, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 0,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'I - Altamente Perigoso',
    leafletNotes: 'Formulação FS desenvolvida especificamente para Recobrimento e Tratamento Industrial de Sementes (TSI). Alta aderência sem desprendimento de pó. Não misturar com sais concentrados de zinco inorgânico não-quelatizado.',
    ppeRequired: ['Luvas de nitrila', 'Respirador', 'Avental impermeável'],
  },
  {
    id: 'folicur_250_ew',
    commercialName: 'Folicur 250 EW',
    activeIngredient: 'Tebuconazol em Emulsão Óleo em Água',
    concentration: '250 g/L',
    formulation: 'EW',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Triazol (FRAC 3)',
    actionMechanism: 'Inibição da desmetilação na biossíntese de ergosterol na membrana fúngica',
    manufacturer: 'Bayer CropScience',
    mapaRegistration: '002895',
    defaultDose: 0.5,
    doseUnit: 'L/ha',
    targetPests: ['Ferrugem-asiática da soja (Phakopsora pachyrhizi)', 'Oídio', 'Cercóspora', 'Septoriose'],
    registeredCrops: ['Soja', 'Trigo', 'Milho', 'Arroz', 'Café'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 30,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação EW: óleo emulsionado em fase aquosa. Menos agressiva para as ceras das folhas do que EC convencional, conferindo maior seletividade fitotóxica em fases de florada.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'decis_25_me',
    commercialName: 'Decis 25 ME',
    activeIngredient: 'Deltametrina Microemulsionada',
    concentration: '25 g/L',
    formulation: 'ME',
    agrochemicalClass: 'inseticida',
    chemicalGroup: 'Piretroide Microemulsão (IRAC 3A)',
    actionMechanism: 'Modulação de canais de sódio gerando despolarização nervosa repetitiva rápida',
    manufacturer: 'Bayer CropScience',
    mapaRegistration: '006997',
    defaultDose: 0.2,
    doseUnit: 'L/ha',
    targetPests: ['Lagartas desfolhadoras', 'Vaquinha (Diabrotica speciosa)', 'Bicho-furão'],
    registeredCrops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Hortifrúti'],
    optimalPhRange: { min: 4.5, max: 6.0 },
    hydrolysisRiskHighPh: true,
    cationBindingRisk: false,
    mixingOrderStep: 6,
    safetyIntervalDays: 7,
    toxicologicalClass: 'III - Moderadamente Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Microemulsão (ME) com micelas nanométricas transparentes. Absorção cuticular muito mais veloz que formulações convencionais. Injetar no Passo 6.',
    ppeRequired: ['Luvas de nitrila', 'Óculos', 'Respirador'],
  },
  {
    id: 'primoleo_se',
    commercialName: 'Primóleo SE',
    activeIngredient: 'Atrazina (400 g/L) + Óleo Vegetal Emulsionado (200 g/L)',
    concentration: '400 + 200 g/L',
    formulation: 'SE',
    agrochemicalClass: 'herbicida',
    chemicalGroup: 'Triazina + Óleo Emulsionado (HRAC 5 / C1)',
    actionMechanism: 'Inibição do transporte de elétrons no fotossistema II da fotossíntese',
    manufacturer: 'Syngenta',
    mapaRegistration: '01889',
    defaultDose: 3.5,
    doseUnit: 'L/ha',
    targetPests: ['Folhas largas e gramíneas em pós-emergência precoce da cultura do milho'],
    registeredCrops: ['Milho', 'Sorgo'],
    optimalPhRange: { min: 5.5, max: 7.5 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 4,
    safetyIntervalDays: 60,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação Suspo-Emulsão (SE): combina partículas sólidas em suspensão com gotículas de óleo vegetal emulsionadas. Dispensa a adição de óleo mineral adjuvante na dessecação de milho.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'tuval_250_as',
    commercialName: 'Tuval 250 AS',
    activeIngredient: 'Cloreto de Mepiquat em Solução Aquosa Líquida',
    concentration: '250 g/L',
    formulation: 'AS',
    agrochemicalClass: 'regulador_crescimento',
    chemicalGroup: 'Sal de Amônio Quaternário',
    actionMechanism: 'Inibição da síntese de ácido giberélico, reduzindo o crescimento vegetativo excessivo e estimulando frutificação',
    manufacturer: 'Adama',
    mapaRegistration: '006700',
    defaultDose: 0.4,
    doseUnit: 'L/ha',
    targetPests: ['Regulação do porte vegetativo e retenção de maçãs no algodoeiro'],
    registeredCrops: ['Algodão'],
    optimalPhRange: { min: 5.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 5,
    safetyIntervalDays: 30,
    toxicologicalClass: 'V - Improvável Dano Agudo',
    environmentalHazard: 'IV - Pouco Perigoso',
    leafletNotes: 'Solução Aquosa Líquida (AS): miscibilidade total instantânea na água do tanque sem risco de precipitados ou abrasão de bicos.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
  {
    id: 'dithane_nt_wsb',
    commercialName: 'Dithane NT WSB (Sachê PVA)',
    activeIngredient: 'Mancozebe em Embalagem Hidrossolúvel de PVA',
    concentration: '750 g/kg',
    formulation: 'WSB',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Alquileno-bis-ditiocarbamato (FRAC M03)',
    actionMechanism: 'Atividade multissítio inibindo múltiplas enzimas fúngicas com grupos sulfidrila (-SH)',
    manufacturer: 'Corteva Agriscience / UPL',
    mapaRegistration: '006297',
    defaultDose: 1.5,
    doseUnit: 'kg/ha',
    targetPests: ['Ferrugem-asiática da soja', 'Mancha-alvo (Corynespora cassiicola)', 'Antracnose'],
    registeredCrops: ['Soja', 'Feijão', 'Milho', 'Algodão', 'Tomate'],
    optimalPhRange: { min: 6.0, max: 7.0 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 1,
    safetyIntervalDays: 20,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Embalagem Hidrossolúvel (WSB): Adicionar os sachês intactos com 50-70% de água limpa no tanque antes de qualquer outro produto. NUNCA colocar na presença de Boro livre sob risco de gelificação impermeável do filme de PVA.',
    ppeRequired: ['Luvas (para manuseio seco do sachê)', 'Óculos'],
  },
  {
    id: 'score_flex_dc',
    commercialName: 'Score Flex DC',
    activeIngredient: 'Difenoconazol em Concentrado Dispersível',
    concentration: '100 g/L',
    formulation: 'DC',
    agrochemicalClass: 'fungicida',
    chemicalGroup: 'Triazol Sistêmico (FRAC 3)',
    actionMechanism: 'Inibição da biossíntese de ergosterol na membrana fúngica',
    manufacturer: 'Syngenta',
    mapaRegistration: '002802',
    defaultDose: 0.4,
    doseUnit: 'L/ha',
    targetPests: ['Mancha-parda (Septoria glycines)', 'Cercosporiose', 'Crestamento foliar'],
    registeredCrops: ['Soja', 'Feijão', 'Trigo', 'Hortifrúti'],
    optimalPhRange: { min: 5.0, max: 6.8 },
    hydrolysisRiskHighPh: false,
    cationBindingRisk: false,
    mixingOrderStep: 5,
    safetyIntervalDays: 21,
    toxicologicalClass: 'IV - Pouco Tóxico',
    environmentalHazard: 'II - Muito Perigoso',
    leafletNotes: 'Formulação DC (Concentrado Dispersível): auto-dispersão espontânea na água com dispersantes polares ecológicos, sem odor forte de hidrocarbonetos pesados.',
    ppeRequired: ['Luvas', 'Óculos'],
  },
];

// ============================================================================
// 3. BANCO DE REGRAS DE COMPATIBILIDADE & INTERAÇÕES FÍSICO-QUÍMICAS
// ============================================================================

export const COMPATIBILITY_RULES_DATABASE: CompatibilityRule[] = [
  // 1. 2,4-D + Graminicidas (Clethodim / Haloxifop) -> Antagonismo Biológico Severo
  {
    id: 'rule_24d_clethodim',
    productAId: '2_4_d_sal_dimetilamina',
    productBId: 'clethodim_240',
    rating: 'restricao_severa',
    incompatibilityType: 'biologica_antagonismo',
    issueSummary: 'Antagonismo Biológico: Redução drástica do controle de gramíneas (Capim-amargoso e pé-de-galinha).',
    technicalDetails: 'O herbicida auxínico 2,4-D inibe a translocação do graminicida inibidor de ACCase no floema da planta daninha e reduz a despolarização de membrana.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Aplicar separadamente com intervalo mínimo de 5 a 7 dias, ou aumentar a dose do graminicida em 20-30% sob orientação agronômica.',
    jarTestRequired: false,
    scientificReference: 'Embrapa Soja - Manual de Manejo de Plantas Daninhas Resistentes (Gazziero et al.)',
  },
  {
    id: 'rule_24d_haloxifop',
    productAId: '2_4_d_sal_dimetilamina',
    productBId: 'haloxifop_124',
    rating: 'restricao_severa',
    incompatibilityType: 'biologica_antagonismo',
    issueSummary: 'Antagonismo Biológico Severo entre Auxina e Inibidor de ACCase (FOP).',
    technicalDetails: 'Queda de até 40% na eficácia de controle de capim-amargoso perenizado devido ao bloqueio da translocação do haloxifop.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Recomenda-se dessecação sequencial: aplicar o graminicida com óleo metilado e, após 5 a 7 dias, entrar com 2,4-D + Glifosato.',
    jarTestRequired: false,
    scientificReference: 'Weed Technology Journal / HRAC Brasil',
  },

  // 2. Glifosato Sal Potássico + 2,4-D Dimetilamina em alta concentração / pouca água -> Precipitação Física
  {
    id: 'rule_glifosato_24d_fisica',
    productAId: 'glifosato_sal_potassico',
    productBId: '2_4_d_sal_dimetilamina',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fisica',
    issueSummary: 'Risco de Precipitação Física Salina em Baixo Volume de Calda (< 80 L/ha) ou Água Fria (< 15°C).',
    technicalDetails: 'Em altas concentrações no tanque (ex: pulverização aérea ou ultrabaixo volume), ocorre troca iônica formando cristais insolúveis de ácido livre que decantam.',
    precipitateRisk: true,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Médio',
    recommendedAction: 'Garantir volume de calda mínimo de 100 L/ha. Abastecer 60% do tanque com água, adicionar o 2,4-D primeiro sob agitação e só depois injetar o Glifosato.',
    jarTestRequired: true,
    scientificReference: 'Petter et al. - Incompatibilidade Física de Misturas de Glifosato e 2,4-D (Planta Daninha)',
  },

  // 3. Cobre (Oxicloreto de Cobre) + Fosfito de Potássio -> Fitotoxicidade Extrema
  {
    id: 'rule_cobre_fosfito',
    productAId: 'oxicloreto_de_cobre_wp',
    productBId: 'fosfito_de_potassio_00_30_20',
    rating: 'incompativel',
    incompatibilityType: 'fitotoxicidade',
    issueSummary: 'INCOMPATÍVEL: Risco Crítico de Fitotoxicidade Foliar Severa (Queima Química da Lavoura).',
    technicalDetails: 'O fosfito solúvel reduz o pH da calda e reage quimicamente com o oxicloreto de cobre insolúvel, solubilizando uma quantidade massiva de íons Cu²⁺ livres tóxicos às folhas.',
    precipitateRisk: false,
    phaseSeparationRisk: true,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'PROIBIDA A MISTURA EM TANQUE. Aplicar os produtos em dias ou operações separadas com intervalo de 7 dias.',
    jarTestRequired: false,
    scientificReference: 'Fundecitrus / Manual de Tecnologia de Aplicação e Cuidados com Cúpricos',
  },

  // 4. Mancozebe WG + Óleo Mineral / MSO -> Risco de Formação de Grumos / "Queijo" se ordem incorreta
  {
    id: 'rule_mancozebe_oleo',
    productAId: 'mancozebe_750_wg',
    productBId: 'oleo_mineral_756_ec',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fisica',
    issueSummary: 'Atenção à Ordem de Adição: Risco de empelotamento e entupimento de filtros mesh 50.',
    technicalDetails: 'Se o óleo mineral for adicionado antes do Mancozebe WG ter se dispersado totalmente na água, as gotículas de óleo encapsulam o pó/grânulo seco, formando uma massa gomosa insolúvel.',
    precipitateRisk: true,
    phaseSeparationRisk: true,
    foamRisk: false,
    cloggingRiskLevel: 'Crítico (Bicos e Filtros 50/100 mesh)',
    recommendedAction: 'Ordem Rigorosa: 1º Água (75%) -> 2º Mancozebe WG (aguardar 5 minutos de agitação para dispersão total) -> 3º Óleo Mineral por último.',
    jarTestRequired: true,
    scientificReference: 'Sintag / Guia Prático de Misturas em Tanque (Ramos & Antuniassi)',
  },

  // 5. Acefato (Organofosforado) + Boro MEA (Alcalinizante) -> Hidrólise Alcalina Rápida
  {
    id: 'rule_acefato_boro_mea',
    productAId: 'acefato_750_sp',
    productBId: 'boro_monoetanolamina_150',
    rating: 'restricao_severa',
    incompatibilityType: 'quimica',
    issueSummary: 'Hidrólise Alcalina Química: Degradação acelerada da molécula do inseticida Acefato.',
    technicalDetails: 'O Boro MEA eleva o pH da água para 8.0 - 8.5. Em pH 8.0+, a meia-vida do acefato cai de 65 dias para poucas horas na calda.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar condicionador acidificante para manter o pH da calda rigorosamente entre 5.0 e 5.5, ou aplicar em operações separadas.',
    jarTestRequired: false,
    scientificReference: 'Compêndio de Degradação e Hidrólise de Pesticidas (FAO/WHO Specifications)',
  },

  // 6. Glifosato + Inseticida Piretroide EC (Bifentrina) -> Quebra de Emulsão / Nata
  {
    id: 'rule_glifosato_bifentrina',
    productAId: 'glifosato_sal_potassico',
    productBId: 'bifentrina_100_ec',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fisica',
    issueSummary: 'Risco de Quebra de Emulsão e Separação de Fases (Nata superficial no tanque).',
    technicalDetails: 'A alta carga de sais dissolvidos do glifosato "salga" a água ("salting-out"), quebrando os emulsificantes da fórmula EC da bifentrina.',
    precipitateRisk: false,
    phaseSeparationRisk: true,
    foamRisk: false,
    cloggingRiskLevel: 'Médio',
    recommendedAction: 'Realizar pré-diluição da Bifentrina em balde com água antes de despejar no tanque. Manter agitação mecânica contínua.',
    jarTestRequired: true,
    scientificReference: 'Boletim Técnico de Tecnologia de Aplicação UNESP Botucatu',
  },

  // 7. Saflufenacil WG + MSO -> Combinação Perfeita Recomendada
  {
    id: 'rule_saflufenacil_mso',
    productAId: 'saflufenacil_700_wg',
    productBId: 'oleo_vegetal_metilado_mso',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Combinação Sinérgica Recomendada em Bula.',
    technicalDetails: 'O MSO maximiza a absorção cuticular do saflufenacil pelas folhas de buva e trapoeraba sem incompatibilidades.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar Saflufenacil WG primeiro, aguardar dispersão completa e adicionar MSO ao final com agitação.',
    jarTestRequired: false,
    scientificReference: 'Bula Técnica Heat (BASF)',
  },

  // 8. Atrazina SC + Óleo Mineral EC -> Sinergia em Milho
  {
    id: 'rule_atrazina_oleo',
    productAId: 'atrazina_500_sc',
    productBId: 'oleo_mineral_756_ec',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Combinação Padrão com Elevada Estabilidade.',
    technicalDetails: 'Atrazina SC com Óleo Mineral proporciona sinergismo de penetração foliar em folhas largas no milho.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar Atrazina com o tanque a 60% e óleo mineral por último.',
    jarTestRequired: false,
    scientificReference: 'Manual de Herbicidas em Milho (Embrapa Milho e Sorgo)',
  },

  // 9. Glifosato + Manganês Quelatizado EDTA -> Compatibilidade Total
  {
    id: 'rule_glifosato_mn_edta',
    productAId: 'glifosato_sal_potassico',
    productBId: 'manganes_quelatizado_edta',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Compatibilidade Plena: O quelato EDTA protege o glifosato de inativação.',
    technicalDetails: 'Diferente do sulfato de manganês que inativa o glifosato em até 70%, o Mn-EDTA não permite ligação com a molécula de glifosato.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar o Mn-EDTA após o Glifosato sob agitação.',
    jarTestRequired: false,
    scientificReference: 'Bernards et al. - Glyphosate interactions with Manganese sources (Weed Science)',
  },

  // 10. Fungicida Triazol/Estrobilurina EC + Inseticida Diamida SC -> Ampla Compatibilidade
  {
    id: 'rule_fungicida_diamida',
    productAId: 'azoxi_ciproconazol_sc',
    productBId: 'clorantraniliprole_200_sc',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Excelente Compatibilidade Físico-Química e Operacional.',
    technicalDetails: 'Ambas as formulações são SC base água, mantendo excelente homogeneidade e sem risco de precipitação.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar os SCs sequencialmente na água em agitação.',
    jarTestRequired: false,
    scientificReference: 'Manejo Integrado de Pragas e Doenças da Soja (Embrapa Soja)',
  },

  // 11. Embalagem Hidrossolúvel (WSB) + Fertilizante Foliar Boro -> Incompatibilidade Físico-Química Crítica (Gelificação / Chiclete)
  {
    id: 'rule_wsb_boro_gel',
    productAId: 'dithane_nt_wsb',
    productBId: 'boro_monoetanolamina_150',
    rating: 'incompativel',
    incompatibilityType: 'fisica',
    issueSummary: 'Incompatibilidade Crítica: Gelificação irreversível do filme de Álcool Polivinílico (PVA) da bolsa hidrossolúvel.',
    technicalDetails: 'O íon Borato ($B(OH)_4^-$) atua como agente reticulante químico cruzado instantâneo com as hidroxilas do polímero de PVA, gerando um gel elastomérico viscoso insolúvel ("slime / chiclete") que encapa o rotor da bomba, o comando e os bicos.',
    precipitateRisk: true,
    phaseSeparationRisk: true,
    foamRisk: false,
    cloggingRiskLevel: 'Crítico (Bicos e Filtros 50/100 mesh)',
    recommendedAction: 'NUNCA misturar bolsas solúveis WSB em caldas contendo Boro. Se ambos forem necessários, colocar a bolsa WSB em 70% de água limpa, aguardar 5 minutos de agitação para dissolução completa do PVA e do pó, e só depois injetar o Boro.',
    jarTestRequired: true,
    scientificReference: 'FAO/WHO Pesticide Specifications - Water Soluble Bags (WSB) Compatibility Handbook',
  },

  // 12. OD (Dispersão em Óleo) + WG/WP (Grânulos/Pós Dispersíveis) -> Risco de Revestimento Oleoso e Empelotamento
  {
    id: 'rule_sanson_od_mancozebe_wg',
    productAId: 'sanson_40_od',
    productBId: 'mancozebe_750_wg',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fisica',
    issueSummary: 'Atenção à Ordem de Adição: Risco de empelotamento se o produto OD for colocado antes do WG.',
    technicalDetails: 'Se a formulação OD for vertida antes da hidratação total do WG, a fase oleosa contínua do OD reveste os grânulos de Mancozebe com um filme hidrofóbico impermeável, impedindo a penetração da água e gerando borras viscosas.',
    precipitateRisk: true,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Médio',
    recommendedAction: 'Seguir estritamente a ordem WALES: Adicionar Mancozebe WG no início (Passo 2), aguardar 3 a 5 minutos sob agitação contínua, e somente após a dispersão homogênea adicionar o Sanson OD (Passo 4).',
    jarTestRequired: true,
    scientificReference: 'Compêndio de Formulações e Misturas em Tanque (Antuniassi et al., UNESP Botucatu)',
  },

  // 13. ZC / CS (Microencapsulado) + Óleo Mineral em Alta Dose -> Risco de Permeabilização Acelerada
  {
    id: 'rule_ampligo_zc_oleo_mineral',
    productAId: 'ampligo_zc',
    productBId: 'oleo_mineral_756_ec',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fitotoxicidade',
    issueSummary: 'Restrição de Concentração: Óleo mineral em excesso pode alterar a liberação controlada das microcápsulas.',
    technicalDetails: 'Solventes alifáticos do óleo mineral podem plastificar ou acelerar a difusão do piretroide encapsulado, transformando a liberação lenta residual em liberação de choque imediato, além de risco de fitotoxicidade foliar sob temperatura > 30°C.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Baixo',
    recommendedAction: 'Limitar a dose do óleo mineral a no máximo 0,25% a 0,3% v/v (máx 250-300 mL / 100L de calda). Evitar pulverização nas horas mais quentes do dia.',
    jarTestRequired: false,
    scientificReference: 'Boletim Técnico Syngenta - Microencapsulação Zeon Technology',
  },

  // 14. CS (Microencapsulado) + Fungicida SC -> Sinergia e Alta Estabilidade
  {
    id: 'rule_karate_zeon_cs_azoxi_sc',
    productAId: 'karate_zeon_50_cs',
    productBId: 'azoxi_ciproconazol_sc',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Excelente Compatibilidade Físico-Química e Biológica.',
    technicalDetails: 'Ambas as formulações operam com dispersantes poliméricos de fase aquosa, sem degradação das microcápsulas nem separação coloidal.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar sequencialmente no Passo 4 com agitador ligado.',
    jarTestRequired: false,
    scientificReference: 'Manual de Aplicação de Defensivos na Cultura da Soja (Embrapa)',
  },

  // 15. SG (Grânulos Solúveis) + EC (Concentrado Emulsionável) -> Dissolução Prévia Obrigatória
  {
    id: 'rule_actara_sg_clethodim_ec',
    productAId: 'actara_250_sg',
    productBId: 'clethodim_240',
    rating: 'compativel_restricoes',
    incompatibilityType: 'fisica',
    issueSummary: 'Observância de Ordem: O Actara 250 SG deve ser totalmente dissolvido antes do Clethodim EC.',
    technicalDetails: 'A dissolução do SG em água limpa é molecular e rápida. Se o EC for colocado antes, os emulsionantes e solventes lipofílicos saturam a interface, retardando a solubilização do tiametoxam.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Baixo',
    recommendedAction: 'Adicionar Actara SG no Passo 3, aguardar 1 minuto até a calda ficar límpida, e em seguida injetar o Clethodim no Passo 6.',
    jarTestRequired: false,
    scientificReference: 'WALES Mixing Sequence Guidelines (Purdue Extension PPP-122)',
  },

  // 16. FS (Tratamento de Sementes) + Manganês Quelatizado EDTA -> Compatibilidade Total
  {
    id: 'rule_standak_top_fs_manganes',
    productAId: 'standak_top_fs',
    productBId: 'manganes_edta_100',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Alta Compatibilidade: O quelato EDTA protege o polímero do FS contra desestabilização.',
    technicalDetails: 'Diferente de sais inorgânicos brutos (como $MnSO_4$) que desestabilizam a suspensão seminal por efeito de força iônica ("salting-out"), o quelato de EDTA impede a coagulação dos látex e gomas do FS.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Pode ser misturado diretamente no preparo da calda de TSI.',
    jarTestRequired: false,
    scientificReference: 'Tecnologia de Tratamento de Sementes de Soja (Embrapa Soja)',
  },

  // 17. SE (Suspo-Emulsão) + Glifosato SL -> Alta Eficácia no Milho
  {
    id: 'rule_primoleo_se_glifosato',
    productAId: 'primoleo_se',
    productBId: 'glifosato_480_sl',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Sinergismo e Compatibilidade comprovada para dessecação e pré-emergência.',
    technicalDetails: 'A formulação SE fornece excelente efeito residual com distribuição homogênea no solo, sem inativar o sal de glifosato na fase líquida.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar Primóleo SE no Passo 4 e Glifosato SL no Passo 5 com agitação contínua.',
    jarTestRequired: false,
    scientificReference: 'Manejo de Plantas Daninhas no Milho Safrinha (Fundação MT)',
  },

  // 18. AS (Solução Aquosa) + CS (Microencapsulado) -> Estabilidade e Controle de Porte
  {
    id: 'rule_tuval_as_karate_cs',
    productAId: 'tuval_250_as',
    productBId: 'karate_zeon_50_cs',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Excelente Compatibilidade no Manejo do Algodoeiro.',
    technicalDetails: 'O sal aquoso de mepiquat não interfere com a parede polimérica das microcápsulas de lambda-cialotrina, conferindo estabilidade máxima e controle simultâneo de porte e pragas.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Adicionar Karate Zeon no Passo 4 e Tuval AS no Passo 5.',
    jarTestRequired: false,
    scientificReference: 'Circular Técnica Algodão - Instituto Mato-grossense do Algodão (IMAmt)',
  },

  // 19. EW (Emulsão Óleo em Água) + ZC (Microencapsulado + Suspensão) -> Calda Tecnológica Suave
  {
    id: 'rule_folicur_ew_ampligo_zc',
    productAId: 'folicur_250_ew',
    productBId: 'ampligo_zc',
    rating: 'compativel',
    incompatibilityType: undefined,
    issueSummary: 'Compatibilidade Tecnológica Premium: Baixa agressividade à cera foliar.',
    technicalDetails: 'Ambas as formulações de última geração (EW e ZC) utilizam solventes biodegradáveis com reduzido teor de aromáticos, proporcionando caldas com excelente espalhamento e baixíssimo índice de fitotoxidez.',
    precipitateRisk: false,
    phaseSeparationRisk: false,
    foamRisk: false,
    cloggingRiskLevel: 'Nenhum',
    recommendedAction: 'Injetar Ampligo ZC no Passo 4 e Folicur EW no Passo 6 sob agitação.',
    jarTestRequired: false,
    scientificReference: 'Tecnologia de Aplicação e Formulações Modernas (Ramos et al.)',
  },
];

// ============================================================================
// 4. PRESETS DE QUALIDADE DA ÁGUA DE PULVERIZAÇÃO
// ============================================================================

export const WATER_QUALITY_PRESETS: (WaterQualityParameters & { id: string; name: string; description: string })[] = [
  {
    id: 'agua_padrao_ideal',
    name: 'Água Padrão Tratada (Ideal)',
    description: 'Água mole, sem excesso de sais e pH levemente ácido otimizado para defensivos.',
    ph: 5.5,
    electricalConductivityUsCm: 120,
    hardnessMgL: 35,
    alkalinityMgL: 30,
    temperatureC: 22,
    calciumMgL: 8,
    magnesiumMgL: 4,
    ironMgL: 0.1,
    manganeseMgL: 0.05,
    bicarbonatesMgL: 35,
    classification: 'Mole',
  },
  {
    id: 'agua_poco_calcario_dura',
    name: 'Poço Profundo em Região Calcária (Muito Dura)',
    description: 'Água rica em Cálcio e Magnésio com pH alto. Inativa glifosato e hidrolisa organofosforados.',
    ph: 8.2,
    electricalConductivityUsCm: 680,
    hardnessMgL: 260,
    alkalinityMgL: 240,
    temperatureC: 24,
    calciumMgL: 75,
    magnesiumMgL: 22,
    ironMgL: 0.4,
    manganeseMgL: 0.1,
    bicarbonatesMgL: 280,
    classification: 'Muito Dura',
  },
  {
    id: 'agua_superficial_turva',
    name: 'Água de Açude / Represa Superficial (Argila em Suspensão)',
    description: 'Água com matéria orgânica e argilas coloidais que adsorvem e inativam Paraquat/Diquat e Glifosato.',
    ph: 6.8,
    electricalConductivityUsCm: 190,
    hardnessMgL: 75,
    alkalinityMgL: 65,
    temperatureC: 26,
    calciumMgL: 18,
    magnesiumMgL: 8,
    ironMgL: 1.8, // Ferro alto
    manganeseMgL: 0.4,
    bicarbonatesMgL: 80,
    classification: 'Média',
  },
  {
    id: 'agua_poco_acido_ferruginoso',
    name: 'Poço Ácido com Alto Teor de Ferro',
    description: 'pH ácido com íons de ferro solúvel que podem oxidar e precipitar ao contato com o ar no tanque.',
    ph: 4.8,
    electricalConductivityUsCm: 250,
    hardnessMgL: 90,
    alkalinityMgL: 20,
    temperatureC: 20,
    calciumMgL: 20,
    magnesiumMgL: 10,
    ironMgL: 4.5,
    manganeseMgL: 1.2,
    bicarbonatesMgL: 25,
    classification: 'Média',
  },
];

// ============================================================================
// 5. CADASTRO PADRÃO DE PULVERIZADORES
// ============================================================================

export const DEFAULT_SPRAYERS: SprayerEquipment[] = [
  {
    id: 'autopropelido_3000',
    name: 'Pulverizador Autopropelido 3.000 L (Barra 32m)',
    type: 'autopropelido',
    tankCapacityLiters: 3000,
    boomWidthMeters: 32,
    nozzleType: 'Leque Duplo com Indução de Ar (AVI Twin 110-02)',
    nozzleSpacingCm: 50,
    operatingPressureBar: 3.5,
    operatingSpeedKmH: 18.0,
    nozzleFlowRateLMin: 0.92,
    applicationRateLHa: 100, // 100 L/ha
    filterMesh: 100,
  },
  {
    id: 'barra_tratorizada_800',
    name: 'Pulverizador de Barra Tratorizada 800 L (Barra 18m)',
    type: 'barra_tratorizada',
    tankCapacityLiters: 800,
    boomWidthMeters: 18,
    nozzleType: 'Leque Plano Pré-Orifício Anti-Deriva (DG 110-02)',
    nozzleSpacingCm: 50,
    operatingPressureBar: 3.0,
    operatingSpeedKmH: 12.0,
    nozzleFlowRateLMin: 0.78,
    applicationRateLHa: 130, // 130 L/ha
    filterMesh: 80,
  },
  {
    id: 'turbo_atomizador_2000',
    name: 'Turbo Atomizador Citros/Café 2.000 L',
    type: 'turbo_atomizador',
    tankCapacityLiters: 2000,
    boomWidthMeters: 4,
    nozzleType: 'Cone Vazio Cerâmico (ATR 80 Laranja)',
    nozzleSpacingCm: 25,
    operatingPressureBar: 8.0,
    operatingSpeedKmH: 6.5,
    nozzleFlowRateLMin: 1.45,
    applicationRateLHa: 400, // 400 L/ha
    filterMesh: 50,
  },
  {
    id: 'costal_manual_20',
    name: 'Pulverizador Costal Manual 20 L',
    type: 'costal',
    tankCapacityLiters: 20,
    boomWidthMeters: 1.0,
    nozzleType: 'Cone Cheio Regulável',
    nozzleSpacingCm: 50,
    operatingPressureBar: 2.0,
    operatingSpeedKmH: 3.6,
    nozzleFlowRateLMin: 0.65,
    applicationRateLHa: 200,
    filterMesh: 50,
  },
  {
    id: 'drone_pulverizacao_40',
    name: 'Drone Agrícola de Pulverização 40 L',
    type: 'drone',
    tankCapacityLiters: 40,
    boomWidthMeters: 9.0,
    nozzleType: 'Bicos Centrífugos Atomizadores Rotativos (CDA)',
    nozzleSpacingCm: 150,
    operatingPressureBar: 1.5,
    operatingSpeedKmH: 22.0,
    nozzleFlowRateLMin: 3.2,
    applicationRateLHa: 10, // 10 L/ha ultra-baixo volume
    filterMesh: 80,
  },
];

// ============================================================================
// 6. FUNÇÕES AUXILIARES DE CÁLCULO E MOTOR DE COMPATIBILIDADE TANKMIX
// ============================================================================

/**
 * Calcula o Delta T em °C com base na Temperatura do Ar (°C) e Umidade Relativa (%)
 * Delta T = Temperatura de Bulbo Seco - Temperatura de Bulbo Úmido (Aproximação de Stull)
 */
export function calculateDeltaT(tempC: number, rhPct: number): number {
  if (tempC <= 0 || rhPct <= 0 || rhPct > 100) return 4.0;
  // Expressão psicrométrica para temperatura de bulbo úmido (Tw):
  const Tw =
    tempC * Math.atan(0.151977 * Math.pow(rhPct + 8.313659, 0.5)) +
    Math.atan(tempC + rhPct) -
    Math.atan(rhPct - 1.676331) +
    0.00391838 * Math.pow(rhPct, 1.5) * Math.atan(0.023101 * rhPct) -
    4.686035;
  const deltaT = Math.max(0, Number((tempC - Tw).toFixed(1)));
  return deltaT;
}

export function evaluateApplicationWindow(
  tempC: number,
  rhPct: number,
  windKmH: number,
  rainForecastH: number
): { status: WeatherCondition['applicationWindowStatus']; deltaT: number; notes: string } {
  const deltaT = calculateDeltaT(tempC, rhPct);

  if (windKmH > 15) {
    return {
      status: 'critica_inadequada',
      deltaT,
      notes: `Vento excessivo (${windKmH} km/h > 12-15 km/h). Risco extremo de deriva para lavouras vizinhas.`,
    };
  }

  if (windKmH < 3) {
    return {
      status: 'desfavoravel',
      deltaT,
      notes: `Vento calmo (< 3 km/h). Risco de inversão térmica, onde gotas ficam suspensas e se deslocam sem deposição.`,
    };
  }

  if (rainForecastH > 0 && rainForecastH < 2) {
    return {
      status: 'critica_inadequada',
      deltaT,
      notes: `Previsão de chuva iminente em menos de ${rainForecastH}h. Risco de lavagem completa da calda foliar.`,
    };
  }

  if (deltaT > 8 || tempC > 32 || rhPct < 45) {
    return {
      status: 'critica_inadequada',
      deltaT,
      notes: `Delta T muito alto (${deltaT}°C) ou UR baixa (${rhPct}%). Risco severo de evaporação da gota antes de atingir o alvo.`,
    };
  }

  if (deltaT < 2) {
    return {
      status: 'desfavoravel',
      deltaT,
      notes: `Delta T muito baixo (${deltaT}°C) com umidade próxima a 100%. Gotas demoram a secar, favorecendo escorrimento.`,
    };
  }

  if (deltaT >= 2 && deltaT <= 8 && windKmH >= 3 && windKmH <= 12 && tempC >= 15 && tempC <= 30 && rhPct >= 55) {
    return {
      status: 'ideal',
      deltaT,
      notes: `Condições meteorológicas ideais: Delta T de ${deltaT}°C, vento favorável (${windKmH} km/h) e boa umidade.`,
    };
  }

  return {
    status: 'aceitavel',
    deltaT,
    notes: `Condições aceitáveis com monitoramento contínuo do Delta T (${deltaT}°C) e do vento.`,
  };
}

export function getWaterHardnessClassification(hardnessMgL: number): string {
  if (hardnessMgL < 50) return 'Mole (Ideal)';
  if (hardnessMgL <= 150) return 'Média';
  if (hardnessMgL <= 300) return 'Dura (Exige condicionador sequestrante)';
  return 'Muito Dura (Crítico: inativa Glifosato/2,4-D)';
}

/**
 * Motor de Avaliação de Compatibilidade TankMix
 */
export function calculateTankMixEvaluation(
  selectedProducts: TankSelectedProduct[],
  waterQuality: WaterQualityParameters,
  tankVolumeL: number = 2000,
  sprayVolumeLHa: number = 100
) {
  const loadedProducts = selectedProducts
    .map(sp => {
      const p = sp.product || TANKMIX_PRODUCTS_DATABASE.find(item => item.id === sp.productId);
      return p ? { product: p, dose: sp.dose, doseUnit: sp.doseUnit } : null;
    })
    .filter(Boolean) as { product: TankMixProduct; dose: number; doseUnit: string }[];

  const detectedRules: CompatibilityRule[] = [];
  const activeAlerts: string[] = [];
  let worstRating: CompatibilityRating = 'compativel';

  // 1. Verificação Par a Par no Banco de Regras
  for (let i = 0; i < loadedProducts.length; i++) {
    for (let j = i + 1; j < loadedProducts.length; j++) {
      const pA = loadedProducts[i].product;
      const pB = loadedProducts[j].product;

      const rule = COMPATIBILITY_RULES_DATABASE.find(
        r =>
          (r.productAId === pA.id && r.productBId === pB.id) ||
          (r.productAId === pB.id && r.productBId === pA.id)
      );

      if (rule) {
        detectedRules.push(rule);
        if (rule.rating === 'incompativel') worstRating = 'incompativel';
        else if (rule.rating === 'restricao_severa' && worstRating !== 'incompativel') worstRating = 'restricao_severa';
        else if (rule.rating === 'compativel_restricoes' && worstRating === 'compativel') worstRating = 'compativel_restricoes';
      }
    }
  }

  // 2. Verificação de Restrições por Qualidade da Água
  const isWaterHard = waterQuality.hardnessMgL > 150;
  const isWaterHighPh = waterQuality.ph > 7.2;
  const isWaterLowPh = waterQuality.ph < 5.0;

  const hasCationSensitiveProduct = loadedProducts.some(p => p.product.cationBindingRisk);
  const hasHydrolysisSensitiveProduct = loadedProducts.some(p => p.product.hydrolysisRiskHighPh);
  const hasWaterConditioner = loadedProducts.some(p => p.product.agrochemicalClass === 'condicionador_calda');

  if (isWaterHard && hasCationSensitiveProduct && !hasWaterConditioner) {
    activeAlerts.push(
      `Água Dura (${waterQuality.hardnessMgL} mg/L CaCO₃): Inativação de ingredientes ativos aniônicos (ex: Glifosato / 2,4-D). Adicionar sulfato de amônio ou condicionador sequestrante.`
    );
    if (worstRating === 'compativel') worstRating = 'compativel_restricoes';
  }

  if (isWaterHighPh && hasHydrolysisSensitiveProduct) {
    activeAlerts.push(
      `pH da Água Alto (${waterQuality.ph}): Risco de hidrólise alcalina acelerada em organofosforados, carbamatos ou piretroides. Recomenda-se acidificar para pH 5.0 - 5.5.`
    );
    if (worstRating === 'compativel') worstRating = 'compativel_restricoes';
  }

  if (isWaterLowPh && loadedProducts.some(p => p.product.id === 'oxicloreto_de_cobre_wp')) {
    activeAlerts.push(
      `pH da Água Muito Ácido (${waterQuality.ph}) com Cobre: Risco severo de fitotoxicidade foliar por liberação excessiva de íons Cu²⁺ solúveis.`
    );
    worstRating = 'incompativel';
  }

  // 3. Ordem de Preparo Sugerida (Sequência WALES / DAMES Adaptada)
  const getProductOrder = (p: TankMixProduct) => {
    const stepInfo = getFormulationMixingStep(p.formulation, p.agrochemicalClass);
    return typeof p.mixingOrderStep === 'number' ? p.mixingOrderStep : stepInfo.step;
  };

  const sortedByMixingOrder = [...loadedProducts].sort(
    (a, b) => getProductOrder(a.product) - getProductOrder(b.product)
  );

  // Verificação de incompatibilidades genéricas a nível de formulação
  const hasWsb = loadedProducts.some(p => p.product.formulation === 'WSB');
  const hasBoro = loadedProducts.some(
    p =>
      p.product.id.toLowerCase().includes('boro') ||
      p.product.commercialName.toLowerCase().includes('boro') ||
      p.product.activeIngredient.toLowerCase().includes('boro')
  );
  if (hasWsb && hasBoro) {
    activeAlerts.push(
      'Incompatibilidade Crítica: Embalagem Hidrossolúvel (WSB) + Boro. O Boro reage quimicamente com o filme de PVA, formando um gel insolúvel ("chiclete") que obstrui filtros e bicos.'
    );
    worstRating = 'incompativel';
  }

  const hasOd = loadedProducts.some(p => p.product.formulation === 'OD');
  const hasSolidsDispersible = loadedProducts.some(p => ['WP', 'WG', 'DF'].includes(p.product.formulation));
  if (hasOd && hasSolidsDispersible) {
    activeAlerts.push(
      'Atenção à Ordem WALES: A formulação OD (Dispersão em Óleo) só deve ser adicionada APÓS a completa dispersão e hidratação dos grânulos e pós (WP/WG/DF), para evitar empelotamento.'
    );
    if (worstRating === 'compativel') worstRating = 'compativel_restricoes';
  }

  const hasSpOrSg = loadedProducts.some(p => ['SP', 'SG'].includes(p.product.formulation));
  const hasEc = loadedProducts.some(p => p.product.formulation === 'EC');
  if (hasSpOrSg && hasEc) {
    activeAlerts.push(
      'Ordem de Adição: Sólidos Solúveis (SP/SG) devem estar 100% dissolvidos em água limpa antes de injetar Concentrados Emulsionáveis (EC).'
    );
  }

  // 4. Cálculo do ICG (Índice de Compatibilidade GeaAgro - 0 a 100%)
  let icgScore = 95;
  if (worstRating === 'incompativel') icgScore = 20;
  else if (worstRating === 'restricao_severa') icgScore = 55;
  else if (worstRating === 'compativel_restricoes') icgScore = 75;
  else if (activeAlerts.length > 0) icgScore = 85;

  // Penalidade por número excessivo de produtos no mesmo tanque (> 5 produtos)
  if (loadedProducts.length > 5) {
    icgScore = Math.max(20, icgScore - 15);
    activeAlerts.push(`Calda com ${loadedProducts.length} insumos simultâneos: Complexidade elevada aumenta exponencialmente o risco de desestabilização.`);
  }

  // Verificar necessidade do Teste de Jarra
  const jarTestRequired =
    worstRating !== 'compativel' ||
    detectedRules.some(r => r.jarTestRequired) ||
    loadedProducts.length >= 4 ||
    isWaterHard ||
    hasWsb;

  const recommendedMixingOrder = sortedByMixingOrder.map((item, idx) => {
    const stepInfo = getFormulationMixingStep(item.product.formulation, item.product.agrochemicalClass);
    return {
      stepNumber: idx + 1,
      stepName: `Passo ${idx + 1}: ${item.product.commercialName} [${item.product.formulation}] - ${stepInfo.groupName}`,
      instructions: `Adicionar ${item.dose} ${item.doseUnit}. ${stepInfo.note}`,
      formulation: item.product.formulation,
      groupName: stepInfo.groupName,
    };
  });

  const issues = [
    ...detectedRules.map(r => ({
      id: r.id,
      summary: r.issueSummary,
      details: r.technicalDetails,
      recommendedAction: r.recommendedAction,
    })),
    ...activeAlerts.map((alt, idx) => ({
      id: `alt_${idx}`,
      summary: 'Alerta de Qualidade ou Formulação de Calda',
      details: alt,
      recommendedAction: 'Ajustar parâmetros de calda ou aplicar corretivo antes da calda.',
    })),
  ];

  return {
    loadedProducts,
    detectedRules,
    activeAlerts,
    worstRating,
    rating: worstRating,
    icgScore,
    sortedByMixingOrder,
    recommendedMixingOrder,
    issues,
    jarTestRequired,
    totalHectaresPerTank: sprayVolumeLHa > 0 ? Number((tankVolumeL / sprayVolumeLHa).toFixed(2)) : 0,
  };
}

export const POPULAR_TANK_RECIPES = [
  {
    id: 'rec_dessecacao_soja',
    title: 'Dessecação Pré-Plantio Soja (Amargoso + Buva)',
    crop: 'Soja / Milho',
    products: ['Glifosato 480 SL', 'Cletodim 240 EC', 'Óleo Mineral / Adjuvante'],
    rating: 'compativel' as CompatibilityRating,
    icgScore: 92,
  },
  {
    id: 'rec_fungicida_foliar',
    title: 'Manejo de Ferrugem Asiática + DFCs',
    crop: 'Soja',
    products: ['Trifloxistrobina + Protioconazol SC', 'Mancozebe 750 WG', 'Óleo Metilado'],
    rating: 'compativel' as CompatibilityRating,
    icgScore: 94,
  },
  {
    id: 'rec_lagarta_percevejo_moderno',
    title: 'Manejo de Lagartas e Percevejos de Alta Tecnologia (ZC + CS)',
    crop: 'Soja / Milho',
    products: ['Ampligo ZC', 'Engeo Pleno S ZC', 'Karate Zeon 50 CS'],
    rating: 'compativel' as CompatibilityRating,
    icgScore: 96,
  },
];

/**
 * Gera os passos detalhados para o Teste de Jarra (Jar Test) em escala de 1 Litro
 */
export function getJarTestProtocol(
  products: { product: TankMixProduct; dose: number; doseUnit: string }[],
  tankVolumeL: number,
  sprayVolumeLHa: number
) {
  // Proporção para frasco de 1.000 mL (1 L)
  // Se dose é D L/ha em calda de V L/ha -> Dose no Jarro de 1L = (D / V) * 1000 mL
  const steps = products
    .sort((a, b) => {
      const orderA = typeof a.product.mixingOrderStep === 'number' ? a.product.mixingOrderStep : getFormulationMixingStep(a.product.formulation, a.product.agrochemicalClass).step;
      const orderB = typeof b.product.mixingOrderStep === 'number' ? b.product.mixingOrderStep : getFormulationMixingStep(b.product.formulation, b.product.agrochemicalClass).step;
      return orderA - orderB;
    })
    .map((item, idx) => {
      const volCalda = sprayVolumeLHa > 0 ? sprayVolumeLHa : 100;
      let jarDose = (item.dose / volCalda) * 1000;
      const isSolid =
        ['WP', 'WG', 'DF', 'SP', 'SG', 'WSB'].includes(item.product.formulation) ||
        item.doseUnit.includes('kg') ||
        item.doseUnit.includes('g');
      let jarUnit = isSolid ? 'g' : 'mL';

      return {
        stepNumber: idx + 1,
        productName: item.product.commercialName,
        formulation: item.product.formulation,
        class: item.product.agrochemicalClass,
        jarDoseText: `${jarDose < 0.1 ? jarDose.toFixed(3) : jarDose.toFixed(2)} ${jarUnit} por Litro de água do jarro`,
        instructions: `Adicionar ${jarDose.toFixed(2)} ${jarUnit} no frasco contendo 800 mL da água real da propriedade e agitar suavemente por 30 segundos.`,
      };
    });

  return {
    jarVolumeMl: 1000,
    baseWaterMl: 800,
    steps,
    checkpoints: [
      { timeMinutes: 0, criteria: 'Homogeneidade imediata, ausência de empelotamento ("queijo") e dissolução completa.' },
      { timeMinutes: 15, criteria: 'Verificar se há separação de fases ou formação de nata viscosa na superfície.' },
      { timeMinutes: 30, criteria: 'Observar fundo do frasco: ausência de precipitados cristalinos ou areia.' },
      { timeMinutes: 60, criteria: 'Teste de reagitação: inverter o frasco 3 vezes. A calda deve se re-homogeneizar facilmente.' },
    ],
  };
}
