import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineFeedDiet,
  SwineFeedInventoryItem,
  SwineShedEnvironment,
  SwineWaterPointCheck,
  SwineDiseaseInfo,
  SwineBiosecurityLog,
  SwinePhotoRecord,
} from '../types/swine';

export const DEFAULT_SWINE_ANIMALS: SwineAnimal[] = [];

export const DEFAULT_SWINE_BATCHES: SwineBatch[] = [];

export const DEFAULT_FARROWING_LITTERS: FarrowingLitter[] = [];

export const DEFAULT_SWINE_DIETS: SwineFeedDiet[] = [];

export const DEFAULT_SWINE_INVENTORY: SwineFeedInventoryItem[] = [];

export const DEFAULT_SWINE_SHEDS: SwineShedEnvironment[] = [];

export const DEFAULT_SWINE_WATER_CHECKS: SwineWaterPointCheck[] = [];

export const DEFAULT_SWINE_DISEASES: SwineDiseaseInfo[] = [
  {
    id: 'dis_psc',
    name: 'Peste Suína Clássica (PSC)',
    scientificName: 'Classical Swine Fever Virus (Pestivirus)',
    category: 'Viral',
    severity: 'Muito Alta (Notificação Obrigatória)',
    affectedStages: ['Todas as idades', 'Matrizes', 'Leitões', 'Terminação'],
    causativeAgent: 'Vírus da família Flaviviridae, gênero Pestivirus',
    transmission: ['Contato direto entre suínos', 'Ingestão de restos alimentares não tratados', 'Fômites e caminhões contaminados'],
    symptoms: ['Febre alta (41-42°C)', 'Apatia e anorexia', 'Hemorragias cutâneas em orelhas e abdômen', 'Conjuntivite', 'Convulsões e paralisia'],
    anatomopathologicalLesions: ['Petéquias e hemorragias em rins (rim em casca de ovo)', 'Infartos marginais esplênicos', 'Úlceras em botão na válvula ileocecal'],
    preventionAndBiosecurity: ['Zona Livre de PSC reconhecida pela OIE/MAPA', 'Rigoroso controle de trânsito (GTA)', 'Proibição do uso de lavagem/restos de comida'],
    treatmentAndControl: ['Não há tratamento. Notificação imediata ao serviço veterinário oficial e abate sanitário.'],
    vaccinationAvailable: true,
    zoonosisRisk: false,
  },
  {
    id: 'dis_psa',
    name: 'Peste Suína Africana (PSA)',
    scientificName: 'African Swine Fever Virus (Asfarviridae)',
    category: 'Viral',
    severity: 'Muito Alta (Notificação Obrigatória)',
    affectedStages: ['Todas as idades'],
    causativeAgent: 'DNA vírus bicatenário único da família Asfarviridae',
    transmission: ['Contato direto com suínos/javalis infectados', 'Carrapatos do gênero Ornithodoros', 'Produtos cárneos suínos e fômites'],
    symptoms: ['Mortalidade próxima a 100%', 'Febre hemorrágica hiperaguda', 'Cianose intensa em ponta de orelhas e membros', 'Diarreia sanguinolenta'],
    anatomopathologicalLesions: ['Esplenomegalia friável escura gigante', 'Hemorragias massivas em linfonodos gastro-hepáticos e renais'],
    preventionAndBiosecurity: ['Barreira sanitária internacional', 'Vazio sanitário absoluto', 'Desinfecção com produtos viricidas de alta eficácia'],
    treatmentAndControl: ['Sem tratamento ou vacina globalmente licenciada. Sacrifício sanitário total do foco.'],
    vaccinationAvailable: false,
    zoonosisRisk: false,
  },
  {
    id: 'dis_prrs',
    name: 'PRRS (Síndrome Respiratória e Reprodutiva Suína)',
    scientificName: 'Porcine Reproductive and Respiratory Syndrome Virus',
    category: 'Viral',
    severity: 'Muito Alta (Notificação Obrigatória)',
    affectedStages: ['Matrizes (abortos e natimortos)', 'Leitões e Creche (pneumonia intersticial)'],
    causativeAgent: 'Arterivirus envelopado de RNA simples',
    transmission: ['Aerossóis', 'Sêmen contaminado', 'Agulhas e fômites'],
    symptoms: ['Falhas reprodutivas catastróficas, abortos tardios', 'Nascidos fracos e mumificados', 'Dispneia em leitões'],
    anatomopathologicalLesions: ['Pneumonia intersticial broncointersticial', 'Linfadenomegalia pronunciada'],
    preventionAndBiosecurity: ['Sêmen exclusivamente de centrais livres testadas por PCR', 'Filtros de ar MERV em granjas núcleo'],
    treatmentAndControl: ['Antibioticoterapia para infecções secundárias, estabilização do rebanho'],
    vaccinationAvailable: true,
    zoonosisRisk: false,
  },
  {
    id: 'dis_app',
    name: 'Pleuropneumonia Suína (APP)',
    scientificName: 'Actinobacillus pleuropneumoniae',
    category: 'Bacteriana',
    severity: 'Alta',
    affectedStages: ['Crescimento', 'Terminação'],
    causativeAgent: 'Actinobacillus pleuropneumoniae (Sorotipos 1 a 19)',
    transmission: ['Gotículas respiratórias de contato próximo', 'Suínos portadores assintomáticos'],
    symptoms: ['Morte súbita com espuma sanguinolenta nasal', 'Febre alta, dispneia grave em posição de cão sentado'],
    anatomopathologicalLesions: ['Pleuropneumonia fibrinonecrótica hemorrágica lobar bilateral', 'Aderências pleurais severas'],
    preventionAndBiosecurity: ['Controle de ventilação e amônia', 'Quarentena com sorologia/PCR', 'Vacinas com toxoides Apx'],
    treatmentAndControl: ['Tratamento precoce injetável com Ceftiofur, Florfenicol ou Tulatromicina'],
    vaccinationAvailable: true,
    zoonosisRisk: false,
  },
  {
    id: 'dis_ileite',
    name: 'Ileite Proliferativa Suína (Enteropatia Proliferativa)',
    scientificName: 'Lawsonia intracellularis',
    category: 'Bacteriana',
    severity: 'Alta',
    affectedStages: ['Creche', 'Crescimento', 'Terminação', 'Marrãs'],
    causativeAgent: 'Bactéria intracelular obrigatória Lawsonia intracellularis',
    transmission: ['Via fecal-oral', 'Fezes contaminadas em baias coletivas'],
    symptoms: ['Diarreia crônica acastanhada pastosa', 'Piora severa da conversão alimentar (CA)', 'Forma aguda: melena sanguinolenta e morte em terminação'],
    anatomopathologicalLesions: ['Espessamento marcado da mucosa do íleo terminal com padrão reticulado'],
    preventionAndBiosecurity: ['Vacinação oral via água de bebida', 'Limpeza e desinfecção com tempo de contato adequado'],
    treatmentAndControl: ['Tilosina, Tiamulina, Valnemulina ou Lincomicina via ração/água'],
    vaccinationAvailable: true,
    zoonosisRisk: false,
  },
  {
    id: 'dis_pcv2',
    name: 'Circovirose Suína (PCV2 / PMWS)',
    scientificName: 'Porcine Circovirus Type 2',
    category: 'Viral',
    severity: 'Alta',
    affectedStages: ['Creche', 'Crescimento'],
    causativeAgent: 'Circovírus Suíno Tipo 2 (PCV2a, PCV2b, PCV2d)',
    transmission: ['Secreções oronasais, fezes, urina e sêmen'],
    symptoms: ['Refugagem progressiva, palidez, icterícia, taquipneia, diarreia'],
    anatomopathologicalLesions: ['Linfonodos hipertrofiados esbranquiçados, nefrite intersticial multifocal'],
    preventionAndBiosecurity: ['Vacinação sistemática de leitões aos 21 dias e reprodutoras', 'Princípios de Madec (melhoria de manejo)'],
    treatmentAndControl: ['Não há antiviral. Controle por vacinação estrita e biosseguridade'],
    vaccinationAvailable: true,
    zoonosisRisk: false,
  },
];

export const DEFAULT_SWINE_BIOSECURITY_LOGS: SwineBiosecurityLog[] = [];

export const DEFAULT_SWINE_PHOTOS: SwinePhotoRecord[] = [];
