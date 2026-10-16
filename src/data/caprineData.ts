import {
  CaprineAnimal,
  CaprineWeighingRecord,
  CaprineReproductionRecord,
  CaprineKidRecord,
  CaprineMilkRecord,
  CaprineMeatRecord,
  CaprineFeedItem,
  CaprinePasturePaddock,
  CaprineHealthRecord,
  CaprineDiseaseInfo,
  CaprinePharmacyItem,
  CaprineFacility,
  CaprinePhotoEntry
} from '../types/caprine';

export const INITIAL_CAPRINE_ANIMALS: CaprineAnimal[] = [];

export const INITIAL_CAPRINE_WEIGHINGS: CaprineWeighingRecord[] = [];

export const INITIAL_CAPRINE_REPRODUCTION: CaprineReproductionRecord[] = [];

export const INITIAL_CAPRINE_KIDS: CaprineKidRecord[] = [];

export const INITIAL_CAPRINE_MILK_LOGS: CaprineMilkRecord[] = [];

export const INITIAL_CAPRINE_MEAT_LOGS: CaprineMeatRecord[] = [];

export const INITIAL_CAPRINE_FEEDS: CaprineFeedItem[] = [];

export const INITIAL_CAPRINE_PADDOCKS: CaprinePasturePaddock[] = [];

export const INITIAL_CAPRINE_HEALTH: CaprineHealthRecord[] = [];

export const INITIAL_CAPRINE_DISEASES: CaprineDiseaseInfo[] = [
  {
    id: 'dis-01',
    name: 'FAMACHA & Haemonchosis (Verminose Gastrointestinal)',
    category: 'Parasitária',
    causativeAgent: 'Haemonchus contortus (Nematóide abomasal sugador de sangue)',
    transmission: 'Ingestão de larvas L3 infectantes na ponta das folhas das pastagens sob orvalho.',
    symptoms: [
      'Anemia severa (mucosas ocular e bucal pálidas/brancas - FAMACHA grau 4 e 5)',
      'Edema submandibular ("papo inchado")',
      'Apatia, prostração, queda acentuada na produção de leite',
      'Perda de peso rápida e pelos arrepiados'
    ],
    prevention: [
      'Monitoramento quinzenal do cartão FAMACHA (graus 1 a 5)',
      'Desverminação seletiva apenas dos animais graus 3, 4 e 5 (preservando refúgio de nematóides sensíveis)',
      'Pastejo rotacionado com roçada e pastejo consorciado com bovinos',
      'Uso de fungos nematófagos e suplementação proteica adequada'
    ],
    management: [
      'Aplicação de vermífugos eficazes conforme teste de redução de OPG',
      'Suplementação com ferro, vitamina B12 e cobre para combate à anemia',
      'Isolamento e repouso em aprisco suspenso'
    ],
    technicalRef: 'Guia Embrapa Caprinos e Ovinos - Método FAMACHA para controle da Haemonchose.',
    photoUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dis-02',
    name: 'Linfadenite Caseosa ("Mal do Caroço")',
    category: 'Bacteriana',
    causativeAgent: 'Corynebacterium pseudotuberculosis',
    transmission: 'Penetração de bactérias por feridas na pele, tosquia, arbustos espinhosos ou frestas de cercas.',
    symptoms: [
      'Abscessos (caroços) volumosos contendo pus caseoso (semelhante a queijo ricota) nos gânglios linfáticos (parótida, pré-escapular, mamário)',
      'Emagrecimento progressivo quando atinge gânglios internos (pulmões e fígado)'
    ],
    prevention: [
      'Vacinação de todo o rebanho com vacina bacterina contendo toxóide',
      'Desinfecção rigorosa de agulhas, umbigo e instalações',
      'Cuidado no manejo para evitar arranhões e ferimentos'
    ],
    management: [
      'Nunca estourar o caroço no pasto ou aprisco!',
      'Cirurgia de drenagem em local isolado de descarte, queimando todo o pus e desinfetando com iodo 10%'
    ],
    technicalRef: 'Manual Técnico MAPA / Sanidade Caprina Embrapa Sobral.',
    photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dis-03',
    name: 'Artrite Encefalite Caprina (CAE)',
    category: 'Viral',
    causativeAgent: 'Lentivírus Caprino (Retroviridae)',
    transmission: 'Principalmente via ingestão de colostro e leite de matrizes infectadas, e secreções respiratórias.',
    symptoms: [
      'Artrite crônica progressiva com aumento volumoso das articulações carpais ("joelhos inchados")',
      'Mastite indutiva crônica ("úbere de madeira/duro")',
      'Pneumonia intersticial em adultos e encefalomielite em cabritos de 2 a 4 meses'
    ],
    prevention: [
      'Aleitamento de cabritos com colostro pasteurizado (56°C por 60 min) ou leite bovino/substituto',
      'Exames sorológicos semestrais por ELISA',
      'Eliminação ou segregação rigorosa de animais soropositivos'
    ],
    management: [
      'Doença incurável. Não existe tratamento específico ou vacina comercial eficaz.',
      'Suporte paliativo e descarte zootécnico orientado.'
    ],
    technicalRef: 'Protocolo Nacional de Erradicação da CAE - Embrapa Caprinos.',
    photoUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dis-04',
    name: 'Ectima Contagioso ("Boqueira")',
    category: 'Viral',
    causativeAgent: 'Parapoxvirus',
    transmission: 'Contato direto com crostas virais no ambiente, comedouros e durante a amamentação.',
    symptoms: [
      'Pústulas e crostas escuras ao redor dos lábios, narinas, gengivas e teto das matrizes',
      'Dificuldade e recusa de alimentação nos cabritos devido à dor intensa'
    ],
    prevention: [
      'Vacinação por escarificação na virilha aos 15-30 dias de vida',
      'Higienização diária de tetas e bicos de mamadeiras'
    ],
    management: [
      'Aplicação de pomadas antissépticas e cicatrizantes (Glicerina iodada / Própolis)',
      'Suplementação liquida com papas energéticas para cabritos debilitados'
    ],
    technicalRef: 'Sanidade Prática de Ovinos e Caprinos - Embrapa.',
    photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_CAPRINE_PHARMACY: CaprinePharmacyItem[] = [];

export const INITIAL_CAPRINE_FACILITIES: CaprineFacility[] = [];

export const INITIAL_CAPRINE_PHOTOS: CaprinePhotoEntry[] = [];
