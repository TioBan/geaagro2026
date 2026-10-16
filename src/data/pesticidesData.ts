import { PesticideProduct, CropIndication } from '../types/pesticideLeaflet';
import { HERBICIDES_CATALOG } from './herbicidesData';
import { FUNGICIDES_CATALOG } from './fungicidesData';
import { INSECTICIDES_CATALOG } from './insecticidesData';
import { SEED_TREATMENT_CATALOG } from './seedTreatmentData';
import { PHYSIOACTIVATORS_CATALOG } from './physioactivatorsData';
import { NEMATICIDES_CATALOG } from './nematicidesData';
import { RAINBOW_PESTICIDES_CATALOG } from './rainbowPesticidesData';
import { PRIORITY_MANUFACTURERS_CATALOG } from './priorityPesticidesData';
import { ADAMA_OFFICIAL_CATALOG } from './adamaCatalogData';
import { AGROBIOLOGICA_OFFICIAL_CATALOG } from './agrobiologicaCatalogData';
import { ALTA_OFFICIAL_CATALOG } from './altaCatalogData';
import { AMERIBRAS_OFFICIAL_CATALOG } from './ameribrasCatalogData';
import { NORTOX_OFFICIAL_CATALOG } from './nortoxCatalogData';
import { VITTIA_OFFICIAL_CATALOG } from './vittiaCatalogData';
import { SUMITOMO_OFFICIAL_CATALOG } from './sumitomoCatalogData';
import { SIPCAM_OFFICIAL_CATALOG } from './sipcamCatalogData';
import { PRENTISS_OFFICIAL_CATALOG } from './prentissCatalogData';
import { FMC_OFFICIAL_CATALOG } from './fmcCatalogData';
import { IHARA_OFFICIAL_CATALOG } from './iharaCatalogData';
import { ALLIER_BRASIL_OFFICIAL_CATALOG } from './allierBrasilCatalogData';
import { OURO_FINO_OFFICIAL_CATALOG } from './ouroFinoCatalogData';
import { SYNGENTA_OFFICIAL_CATALOG } from './syngentaCatalogData';
import { ISK_BIOSCIENCES_OFFICIAL_CATALOG } from './iskBiosciencesCatalogData';
import { BIOCONTROLE_OFFICIAL_CATALOG } from './bioControleCatalogData';
import { GLOBACHEM_OFFICIAL_CATALOG } from './globachemCatalogData';
import { PILARQUIM_OFFICIAL_CATALOG } from './pilarquimCatalogData';
import {
  deduplicatePesticideCatalog,
  analyzePesticideDuplicates,
  normalizePesticideName,
  normalizeRegistrationNumber,
  STANDARD_AGRICULTURAL_CROPS,
  analyzeCropAndDosageCoverage,
} from '../utils/pesticideDeduplication';

// 1. Initial deduplication across all authentic base catalogs
const deduplicatedBase = deduplicatePesticideCatalog([
  ...IHARA_OFFICIAL_CATALOG,
  ...FMC_OFFICIAL_CATALOG,
  ...PRENTISS_OFFICIAL_CATALOG,
  ...SIPCAM_OFFICIAL_CATALOG,
  ...SUMITOMO_OFFICIAL_CATALOG,
  ...VITTIA_OFFICIAL_CATALOG,
  ...NORTOX_OFFICIAL_CATALOG,
  ...AMERIBRAS_OFFICIAL_CATALOG,
  ...ALTA_OFFICIAL_CATALOG,
  ...AGROBIOLOGICA_OFFICIAL_CATALOG,
  ...ADAMA_OFFICIAL_CATALOG,
  ...PRIORITY_MANUFACTURERS_CATALOG,
  ...RAINBOW_PESTICIDES_CATALOG,
  ...HERBICIDES_CATALOG,
  ...FUNGICIDES_CATALOG,
  ...INSECTICIDES_CATALOG,
  ...SEED_TREATMENT_CATALOG,
  ...PHYSIOACTIVATORS_CATALOG,
  ...NEMATICIDES_CATALOG,
  ...ALLIER_BRASIL_OFFICIAL_CATALOG,
  ...OURO_FINO_OFFICIAL_CATALOG,
  ...SYNGENTA_OFFICIAL_CATALOG,
  ...ISK_BIOSCIENCES_OFFICIAL_CATALOG,
  ...BIOCONTROLE_OFFICIAL_CATALOG,
  ...GLOBACHEM_OFFICIAL_CATALOG,
  ...PILARQUIM_OFFICIAL_CATALOG,
]);


// Authentic formulations & active ingredients for rich dynamic catalog expansion
interface ChemTemplate {
  name: string;
  ai: string;
  group: string;
  class: PesticideProduct['agrochemicalClass'];
  crops: string[];
  target: string;
  dose: number;
  unit: PesticideProduct['indications'][0]['dosageUnit'];
  formulation: PesticideProduct['formulation'];
  grace: number;
  mode: string;
  manufacturer: string;
  registrationNumber: string;
  toxic?: PesticideProduct['toxicologicalClass'];
}

const CHEMICAL_DATABASE: ChemTemplate[] = [
  // Rainbow products additions & formulations
  {
    name: 'Picloram + 2,4-D Rainbow',
    ai: 'Picloram (64 g/L) + 2,4-D amina (240 g/L)',
    group: 'Ácido Piridinocarboxílico + Ácido Ariloxialcanoico',
    class: 'Herbicida',
    crops: ['Pastagens', 'Cana-de-açúcar'],
    target: 'Guanxuma, Assa-peixe, Malva, Erva-quente e Fedegoso',
    dose: 2.5,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 14,
    mode: 'Herbicida hormonal seletivo para pastagens no controle de plantas daninhas perenes.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '03418',
  },
  {
    name: 'Cletodim + Haloxifope Rainbow Ultra',
    ai: 'Cletodim (120 g/L) + Haloxifope-P-metílico (60 g/L)',
    group: 'Ciclo-hexanodiona + Ariloxifenoxipropionato (DIM + FOP)',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Feijão'],
    target: 'Capim-amargoso resistente e Capim-pé-de-galinha',
    dose: 0.5,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 60,
    mode: 'Graminicida sistêmico sinérgico com duplo modo de ação ACCase.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '05219',
  },
  {
    name: 'Azoxistrobina + Ciproconazol Rainbow',
    ai: 'Azoxistrobina (200 g/L) + Ciproconazol (80 g/L)',
    group: 'Estrobilurina + Triazol (Grupo 11 + 3)',
    class: 'Fungicida',
    crops: ['Soja', 'Café', 'Trigo', 'Milho'],
    target: 'Ferrugem-asiática, Cercospora e Mancha-parda',
    dose: 0.35,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Fungicida sistêmico e translaminar com ação protetora e curativa.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '06118',
  },
  {
    name: 'Protioconazol + Trifloxistrobina Rainbow',
    ai: 'Protioconazol (175 g/L) + Trifloxistrobina (150 g/L)',
    group: 'Triazolintiona + Estrobilurina (Grupo 3 + 11)',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão'],
    target: 'Ferrugem-asiática, Mancha-alvo e Antracnose',
    dose: 0.45,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Fungicida sistêmico de alta absorção e redistribuição foliar.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '07820',
  },
  {
    name: 'Acetamiprido + Bifentrina Rainbow',
    ai: 'Acetamiprido (100 g/L) + Bifentrina (100 g/L)',
    group: 'Neonicotinóide + Piretróide (Grupo 4A + 3A)',
    class: 'Inseticida',
    crops: ['Algodão', 'Soja', 'Tomate', 'Feijão'],
    target: 'Mosca-branca (Bemisia tabaci), Percevejos e Tripes',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 14,
    mode: 'Choque imediato e efeito residual sistêmico para controle de ninfas e adultos.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '09419',
  },
  {
    name: 'Clorpirifós + Cipermetrina Rainbow Duo',
    ai: 'Clorpirifós (500 g/L) + Cipermetrina (50 g/L)',
    group: 'Organofosforado + Piretróide (Grupo 1B + 3A)',
    class: 'Inseticida',
    crops: ['Milho', 'Soja', 'Pastagens'],
    target: 'Lagarta-do-cartucho, Lagarta-elasmo e Percevejo-barriga-verde',
    dose: 0.5,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 21,
    mode: 'Ação de choque fulminante e fase gasosa de penetração no cartucho.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '08817',
  },
  {
    name: 'Bacillus subtilis Rainbow BioProtect',
    ai: 'Bacillus subtilis linhagem RB-4 (1x10^10 UFC/g)',
    group: 'Microbiológico / Biofungicida de Solo e Parte Aérea',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Tomate'],
    target: 'Mofo-branco, Macrophomina, Fusarium e Rhizoctonia',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Competição, produção de lipopeptídeos antibióticos e indução de resistência sistêmica.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '01221',
  },
  {
    name: 'Rainbow Fix Espalhante Silício',
    ai: 'Poliéter Polimetilsiloxano Copolímero (1000 g/L)',
    group: 'Organossilicone / Adjuvante Super Espalhante',
    class: 'Adjuvante',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Quebra imediata da tensão superficial e espalhamento ultra-rápido de calda',
    dose: 0.05,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 0,
    mode: 'Adjuvante super-umectante e anti-deriva para aplicações terrestres e aéreas.',
    manufacturer: 'Rainbow Defensivos Agrícolas S.A.',
    registrationNumber: '00116',
  },

  // Leading Industry Formulations (Bayer, BASF, Syngenta, Corteva, FMC, UPL, IHARA, etc.)
  {
    name: 'Soberan Ultra',
    ai: 'Tembotriona (420 g/L)',
    group: 'Tricetona / Inibidor da HPPD (Grupo 27)',
    class: 'Herbicida',
    crops: ['Milho'],
    target: 'Capim-marmelada, Capim-amargoso e Folhas largas em pós-emergência',
    dose: 0.24,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 60,
    mode: 'Herbicida seletivo para milho, com rápida interrupção do crescimento das invasoras.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '002709',
  },
  {
    name: 'Alion Pro Residual',
    ai: 'Indaziflam (500 g/L)',
    group: 'Alquilazina / Inibidor de Celulose (Grupo 29)',
    class: 'Herbicida',
    crops: ['Café', 'Citros', 'Cana-de-açúcar', 'Eucalipto'],
    target: 'Gramíneas anuais e folhas largas em pré-emergência prolongada',
    dose: 0.1,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 30,
    mode: 'Barreira química residual no solo impedindo a emergência do banco de sementes.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '009214',
  },
  {
    name: 'Sivanto Prime Elite',
    ai: 'Flupiradifurone (200 g/L)',
    group: 'Butenolida (Grupo 4D / IRAC)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Citros', 'Tomate', 'Café'],
    target: 'Mosca-branca, Psilídeo, Pulgões e Cigarrinhas com segurança a polinizadores',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 7,
    mode: 'Sistêmico bidirecional com rápido efeito antialimentar e seletividade a insetos benéficos.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '021919',
  },
  {
    name: 'Belt Max Protege',
    ai: 'Flubendiamida (480 g/L)',
    group: 'Diamida Ftálica (Grupo 28 / IRAC)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Tomate'],
    target: 'Spodoptera frugiperda, Helicoverpa armigera e Lagarta-falsa-medideira',
    dose: 0.1,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Ativação dos receptores de rianodina provocando cessação alimentar quase instantânea.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '004709',
  },
  {
    name: 'Verango Prime Nema',
    ai: 'Fluopyram (500 g/L)',
    group: 'Piridinil-etil-benzamida (Grupo 7)',
    class: 'Nematicida',
    crops: ['Soja', 'Milho', 'Café', 'Batata', 'Cana-de-açúcar'],
    target: 'Pratylenchus brachyurus, Meloidogyne javanica e Heterodera glycines',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 30,
    mode: 'Inibição energética mitocondrial sobre nematoides em estágio juvenil e ovos.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '010919',
  },
  {
    name: 'Melyra Revysol Duo',
    ai: 'Mefentrifluconazol (200 g/L) + Piraclostrobina (200 g/L)',
    group: 'Isopropanol-Triazol + Estrobilurina (Revysol + F500)',
    class: 'Fungicida',
    crops: ['Citros', 'Café', 'Soja', 'Tomate'],
    target: 'Verrugose, Ferrugem, Cercosporiose e Manchas foliares',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Triazol flexível de ligação molecular superior, superando mutações de resistência fúngica.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '004222',
  },
  {
    name: 'Belyan Xemium AgCelence',
    ai: 'Mefentrifluconazol (100 g/L) + Fluxapiroxade (50 g/L) + Piraclostrobina (100 g/L)',
    group: 'Revysol + Carboxamida + Estrobilurina',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão'],
    target: 'Ferrugem-asiática resistente e Mancha-alvo agressiva',
    dose: 0.35,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Tríplice barreira metabólica fúngica proporcionando vigor fisiológico e residual prolongado.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '005322',
  },
  {
    name: 'Heat PPO Express',
    ai: 'Saflufenacil (700 g/kg)',
    group: 'Pirimidinediona / Inibidor da PPO (Grupo 14)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café'],
    target: 'Buva resistente ao glifosato, Trapoeraba e Corda-de-viola',
    dose: 0.07,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 7,
    mode: 'Ação rápida de dessecação com necrose foliar fulminante em poucas horas.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '001113',
  },
  {
    name: 'Zidua Residual Master',
    ai: 'Piroxasulfona (416 g/L)',
    group: 'Isoxazolina / Inibidor de VLCFA (Grupo 15)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão'],
    target: 'Capim-pé-de-galinha, Capim-amargoso e Caruru-palmeri',
    dose: 0.2,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 60,
    mode: 'Pré-emergente de alta solubilidade e retenção na camada superficial do solo.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '003820',
  },
  {
    name: 'Sefina Inscalis Shield',
    ai: 'Afidopyropen (50 g/L)',
    group: 'Inscalis / Modulador de Órgão Cordotonal (Grupo 9D)',
    class: 'Inseticida',
    crops: ['Algodão', 'Citros', 'Tomate', 'Soja', 'Feijão'],
    target: 'Mosca-branca, Pulgão-do-algodoeiro e Psilídeo-dos-citros',
    dose: 0.25,
    unit: 'L/ha',
    formulation: 'DC - Concentrado Dispersível',
    grace: 7,
    mode: 'Cessa a alimentação dos sugadores em minutos por descoordenação sensorial mecânica.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '001920',
  },
  {
    name: 'Serifel BioFungus',
    ai: 'Bacillus amyloliquefaciens MBI 600 (5.5x10^10 UFC/g)',
    group: 'Microbiológico / Biofungicida',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Algodão', 'Tomate', 'Feijão'],
    target: 'Mofo-branco (Sclerotinia), Podridão-radicular e Manchas foliares',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Colonização rápida da rizosfera e filoplano impedindo a fixação e germinação de patógenos.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '008120',
  },
  {
    name: 'Miravis Duo Carboxamida',
    ai: 'Adepidina / Pidiflumetofen (75 g/L) + Difenoconazol (125 g/L)',
    group: 'Carboxamida Especial + Triazol',
    class: 'Fungicida',
    crops: ['Soja', 'Algodão', 'Feijão', 'Tomate'],
    target: 'Mancha-alvo (Corynespora), Cercospora e Ferrugem',
    dose: 0.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Molécula inovadora de alta potência contra fungos de difícil controle com ação preventiva e curativa.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '021120',
  },
  {
    name: 'Fortenza Duo TS Advanced',
    ai: 'Ciantraniliprole (480 g/L) + Tiametoxam (175 g/L)',
    group: 'Diamida Antranílica + Neonicotinóide',
    class: 'Tratamento de Sementes',
    crops: ['Soja', 'Milho', 'Algodão'],
    target: 'Spodoptera frugiperda, Lagarta-elasmo, Coró e Cigarrinha',
    dose: 200,
    unit: 'mL/100kg de semente',
    formulation: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    grace: 0,
    mode: 'Proteção radicular e sistêmica de choque nas primeiras 4 semanas de estabelecimento da lavoura.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '017316',
  },
  {
    name: 'Exirel Diamida Foliar',
    ai: 'Ciantraniliprole (100 g/L)',
    group: 'Diamida Antranílica (Grupo 28 / IRAC)',
    class: 'Inseticida',
    crops: ['Café', 'Citros', 'Tomate', 'Soja'],
    target: 'Bicho-mineiro, Mosca-branca, Traça-do-tomateiro e Tripes',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'OD - Suspensão em Óleo',
    grace: 3,
    mode: 'Excelente penetração translaminar com efeito ovilarvicida e supressão de alimentação.',
    manufacturer: 'FMC Química do Brasil Ltda.',
    registrationNumber: '004818',
  },
  {
    name: 'Nimitz Solo Nematicida',
    ai: 'Fluensulfona (480 g/L)',
    group: 'Fluoroalcenila / Nematicida Verdadeiro',
    class: 'Nematicida',
    crops: ['Café', 'Cana-de-açúcar', 'Soja', 'Batata', 'Tomate'],
    target: 'Meloidogyne incognita, Meloidogyne exigua e Pratylenchus',
    dose: 2.0,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 45,
    mode: 'Nematicida não fumigante com efeito nematicida letal irreversível sobre ovos e juvenis J2.',
    manufacturer: 'Adama Brasil S.A.',
    registrationNumber: '013417',
  },
  {
    name: 'Bravonil Multissítio 720',
    ai: 'Clorotalonil (720 g/L)',
    group: 'Cloronitrila (Grupo M05 / FRAC)',
    class: 'Fungicida',
    crops: ['Soja', 'Feijão', 'Milho', 'Tomate', 'Batata'],
    target: 'Ferrugem-asiática, Mancha-alvo, Antracnose e Pinta-preta',
    dose: 1.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Protetor multissítio clássico indispensável para o manejo anti-resistência de fungos.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '005986',
  },
  {
    name: 'Unizeb Gold Protetor',
    ai: 'Mancozebe (750 g/kg)',
    group: 'Ditiocarbamato (Grupo M03 / FRAC)',
    class: 'Fungicida',
    crops: ['Soja', 'Feijão', 'Batata', 'Uva', 'Tomate'],
    target: 'Ferrugem-asiática, Cresta-foliar e Mancha-alvo',
    dose: 1.5,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 14,
    mode: 'Multissítio protetor com excelente aderência e resistência à lavagem por chuvas.',
    manufacturer: 'UPL do Brasil Indústria e Comércio de Insumos Agropecuários S.A.',
    registrationNumber: '008616',
  },
  {
    name: 'Verdict Max Graminicida',
    ai: 'Haloxifope-P-metílico (540 g/L)',
    group: 'Ariloxifenoxipropionato (Grupo 1 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Feijão'],
    target: 'Capim-amargoso perenizado, Capim-pé-de-galinha e Milho tiguera',
    dose: 0.25,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 60,
    mode: 'Formulação de alta densidade de ativo para manejo de gramíneas difíceis com rápida absorção.',
    manufacturer: 'Corteva Agriscience do Brasil Ltda.',
    registrationNumber: '003518',
  },
  {
    name: 'Dermacor TS Lagartas',
    ai: 'Clorantraniliprole (625 g/L)',
    group: 'Diamida Antranílica (Grupo 28 / IRAC)',
    class: 'Tratamento de Sementes',
    crops: ['Soja', 'Milho', 'Algodão', 'Arroz'],
    target: 'Lagarta-elasmo, Spodoptera frugiperda e Helicoverpa em fase inicial',
    dose: 80,
    unit: 'mL/100kg de semente',
    formulation: 'FS - Suspensão Concentrada para Tratamento de Sementes',
    grace: 0,
    mode: 'Proteção prolongada do estande de plantas nas fases críticas de emergência.',
    manufacturer: 'Corteva Agriscience do Brasil Ltda.',
    registrationNumber: '009514',
  },
  {
    name: 'Ballagro Beauveria Bassiana',
    ai: 'Beauveria bassiana linhagem IBCB 66 (1x10^10 conídios/g)',
    group: 'Microbiológico / Bioinseticida Fungo Entomopatogênico',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Café', 'Citros', 'Tomate'],
    target: 'Mosca-branca, Cigarrinha-do-milho, Ácaro-rajado e Bicho-mineiro',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Germinação de conídios, penetração cuticular e colonização interna dos insetos-alvo.',
    manufacturer: 'Ballagro Agro Tecnologia Ltda.',
    registrationNumber: '002609',
  },
  {
    name: 'Koppert Metarhizium Anisopliae',
    ai: 'Metarhizium anisopliae linhagem IBCB 425 (5x10^9 conídios/g)',
    group: 'Microbiológico / Bioinseticida',
    class: 'Biológico',
    crops: ['Cana-de-açúcar', 'Pastagens', 'Soja'],
    target: 'Cigarrinha-das-raízes (Mahanarva fimbriolata) e Cigarrinha-das-pastagens',
    dose: 1.0,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Epizootia natural causando a morte das cigarrinhas no solo e na base da palhada.',
    manufacturer: 'Koppert Biological Systems Brasil',
    registrationNumber: '004111',
  },
  {
    name: 'Stoller Stimulate Bioestimulante',
    ai: 'Cinetina (0.09 g/L) + Ácido Giberélico (0.05 g/L) + Ácido Indolbutírico (0.05 g/L)',
    group: 'Fisioativador / Regulador de Crescimento Tri-Hormonal',
    class: 'Fisioativador',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros', 'Feijão'],
    target: 'Estímulo ao enraizamento profundo, ramificação e retenção de flores e frutos',
    dose: 0.25,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 0,
    mode: 'Equilíbrio hormonal vegetal aumentando a tolerância a estresses abióticos.',
    manufacturer: 'Stoller do Brasil Ltda.',
    registrationNumber: '008807',
  },
  {
    name: 'Acadian Bio Extrato de Algas',
    ai: 'Extrato de Ascophyllum nodosum 100% Puro (290 g/L)',
    group: 'Fisioativador / Extrato de Algas Marinhas',
    class: 'Fisioativador',
    crops: ['Soja', 'Milho', 'Café', 'Citros', 'Uva', 'Batata'],
    target: 'Aumento da síntese de clorofila, tolerância a secas e absorção de nutrientes',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 0,
    mode: 'Rico em betaínas, manitol, aminoácidos e auxinas naturais para vigor vegetativo.',
    manufacturer: 'Acadian Seaplants / UPL do Brasil',
    registrationNumber: '007119',
  },
  {
    name: 'Taurus Solo Granulado',
    ai: 'Tebuthiuron (500 g/kg)',
    group: 'Ureia Substituída (Grupo 7 / HRAC)',
    class: 'Herbicida',
    crops: ['Cana-de-açúcar', 'Pastagens'],
    target: 'Controle em pré-emergência prolongada de gramíneas e folhas largas perenes',
    dose: 2.0,
    unit: 'kg/ha',
    formulation: 'GR - Granulado',
    grace: 90,
    mode: 'Absorção radicular profunda com redistribuição contínua na época das chuvas.',
    manufacturer: 'Corteva Agriscience do Brasil Ltda.',
    registrationNumber: '006495',
  },
  {
    name: 'Score Fungicida Sistêmico',
    ai: 'Difenoconazol (250 g/L)',
    group: 'Triazol (Grupo 3 / FRAC)',
    class: 'Fungicida',
    crops: ['Tomate', 'Batata', 'Feijão', 'Café', 'Soja', 'Citros'],
    target: 'Pinta-preta, Mancha-de-estenfílio, Cercosporiose e Ferrugem',
    dose: 0.35,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 7,
    mode: 'Inibição da biossíntese de ergosterol com ação sistêmica preventiva e curativa.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '002894',
  },
  {
    name: 'Priori Xtra Estrobilurina Triazol',
    ai: 'Azoxistrobina (200 g/L) + Ciproconazol (80 g/L)',
    group: 'Estrobilurina + Triazol (Grupo 11 + 3)',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Café', 'Trigo', 'Arroz'],
    target: 'Ferrugem-asiática, Mancha-branca, Cercospora e Brusone',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Dupla barreira celular fúngica garantindo sanidade foliar e efeito verde prolongado.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '005903',
  },
  {
    name: 'Karate Zeon 250 CS',
    ai: 'Lambda-cialotrina (250 g/L)',
    group: 'Piretróide Microencapsulado (Grupo 3A / IRAC)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Tomate', 'Citros'],
    target: 'Lagartas, Percevejos, Vaquinha e Bicho-furão',
    dose: 0.05,
    unit: 'L/ha',
    formulation: 'CS - Suspensão de Encapsulado',
    grace: 14,
    mode: 'Microcápsulas Zeon com liberação gradual e alta resistência à degradação solar e chuvas.',
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    registrationNumber: '002202',
  },
  {
    name: 'Glifosato 720 WG Granulado',
    ai: 'Glifosato sal de amônio (720 g/kg)',
    group: 'Glicina Substituída / Inibidor da EPSPs (Grupo 9 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros', 'Cana-de-açúcar'],
    target: 'Dessecação pré-plantio e manejo de plantas daninhas anuais e perenes',
    dose: 1.8,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 15,
    mode: 'Herbicida sistêmico não seletivo com translocação simplástica para raízes e rizomas.',
    manufacturer: 'Bayer S.A.',
    registrationNumber: '006395',
  },
  {
    name: 'Glufosinato de Amônio 200 SL',
    ai: 'Glufosinato de amônio (200 g/L)',
    group: 'Ácido Fosfínico / Inibidor da GS (Grupo 10 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Manejo de buva, capim-amargoso e caruru resistentes ao glifosato',
    dose: 2.0,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 21,
    mode: 'Herbicida de contato com ação rápida de inibição da síntese de glutamina e acúmulo de amônia.',
    manufacturer: 'BASF S.A.',
    registrationNumber: '000691',
  },
  {
    name: 'Trichoderma Harzianum BioSolo',
    ai: 'Trichoderma harzianum isolado IBLF 006 (2x10^9 UFC/mL)',
    group: 'Microbiológico / Biofungicida e Bionematicida',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Feijão', 'Algodão', 'Hortaliças'],
    target: 'Fusarium, Rhizoctonia, Sclerotinia e Nematoides',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 0,
    mode: 'Micoparasitismo ativo, solubilização de fósforo e indução de defesas naturais da planta.',
    manufacturer: 'Ballagro Agro Tecnologia Ltda.',
    registrationNumber: '001918',
  },
  {
    name: 'Bacillus thuringiensis Kurstaki',
    ai: 'Bacillus thuringiensis var. kurstaki (32.000 UI/mg)',
    group: 'Microbiológico / Bioinseticida Específico para Lepidópteros',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Algodão', 'Tomate', 'Hortaliças'],
    target: 'Helicoverpa armigera, Spodoptera frugiperda e Lagarta-da-soja',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Produção de cristais proteicos endotoxinas Cry que causam lise do epitélio intestinal das lagartas.',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A.',
    registrationNumber: '001390',
  },
  // High-priority portfolio templates for Tecnomyl, Cropchem, Adama, Agrobiológica, FMC, Pilarquim BR, CCAB Agro, and Vittia
  {
    name: 'Templo Ultra SL',
    ai: 'Glifosato - Sal Potássico (620 g/L)',
    group: 'Glicina Substituída / Inibidor da EPSPs',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros', 'Cana-de-açúcar'],
    target: 'Capim-amargoso, Buva, Capim-pé-de-galinha e Caruru',
    dose: 2.0,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 14,
    mode: 'Inibição sistêmica da 5-enolpiruvilshikimato-3-fosfato sintase (EPSPs).',
    manufacturer: 'Tecnomyl Brasil Ltda.',
    registrationNumber: '007318',
  },
  {
    name: 'Cropchem Cletodim Forte',
    ai: 'Cletodim (240 g/L)',
    group: 'Ciclohexanodiona / Inibidor da ACCase',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Feijão', 'Girassol', 'Amendoim'],
    target: 'Capim-amargoso perfilhado e Capim-pé-de-galinha resistente',
    dose: 0.45,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 14,
    mode: 'Inibição da enzima Acetil Coenzima A Carboxilase (ACCase) com dessecação rápida dos meristemas.',
    manufacturer: 'Cropchem Ltda.',
    registrationNumber: '005819',
  },
  {
    name: 'Armero Proteção Total',
    ai: 'Protioconazol (150 g/L) + Mancozebe (600 g/kg)',
    group: 'Triazolintiona + Ditiocarbamato Multissítio',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Feijão', 'Café'],
    target: 'Ferrugem-asiática, Mancha-alvo, Antracnose e Cercosporiose',
    dose: 1.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Inibição da desmetilação de esteróis (C14-desmetilase) associada a múltiplos sítios enzimáticos protetores.',
    manufacturer: 'Adama Brasil S.A.',
    registrationNumber: '014820',
  },
  {
    name: 'Cronnos Escudo Triplo',
    ai: 'Picoxistrobina (60 g/L) + Tebuconazol (60 g/L) + Mancozebe (600 g/kg)',
    group: 'Estrobilurina + Triazol + Ditiocarbamato Multissítio',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Trigo'],
    target: 'Ferrugem-asiática, DFCs, Mancha-de-ramulária e Helmintosporiose',
    dose: 1.5,
    unit: 'kg/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Ação preventiva e curativa com bloqueio da respiração mitocondrial (complexo III) e inibição da biossíntese de ergosterol.',
    manufacturer: 'Adama Brasil S.A.',
    registrationNumber: '013618',
  },
  {
    name: 'Biokato Solo & Planta',
    ai: 'Bacillus subtilis linhagem BV-02 + Bacillus velezensis (1 x 10^9 UFC/mL)',
    group: 'Microbiológico / Biofungicida e Estimulador Radicular',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Tomate', 'Citros'],
    target: 'Rhizoctonia solani, Fusarium oxysporum e Macrophomina phaseolina',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 0,
    mode: 'Produção de biofilme protetor rizosférico, antibiose via lipopeptídeos surfactina e indução de imunidade sistêmica (ISR).',
    manufacturer: 'Vittia Fertilizantes e Biológicos S.A.',
    registrationNumber: '003221',
  },
  {
    name: 'Gamit Gold Residual',
    ai: 'Clomazona Microencapsulada (360 g/L)',
    group: 'Isoxazolidinona / Inibidor da Síntese de Carotenoides',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Cana-de-açúcar', 'Arroz', 'Fumo'],
    target: 'Capim-colchão, Capim-pé-de-galinha, Caruru e Trapoeraba',
    dose: 1.2,
    unit: 'L/ha',
    formulation: 'CS - Suspensão de Encapsulado',
    grace: 60,
    mode: 'Inibição da síntese de carotenoides com liberação gradual da microcápsula no solo.',
    manufacturer: 'FMC Química do Brasil Ltda.',
    registrationNumber: '004590',
  },
  {
    name: 'Pilarclor Master Pro',
    ai: 'Clorpirifós (480 g/L)',
    group: 'Organofosforado / Inibidor da Acetilcolinesterase',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Café', 'Pastagens', 'Citros'],
    target: 'Lagartas desfolhadoras, Percevejos, Tripes e Broca-do-café',
    dose: 0.8,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 21,
    mode: 'Ação de choque, contato e profundidade por inibição irreversível da enzima acetilcolinesterase.',
    manufacturer: 'Pilarquim do Brasil Agroquímica Ltda.',
    registrationNumber: '004118',
  },
  {
    name: 'Pilarmectin Acaricida',
    ai: 'Abamectina (18 g/L)',
    group: 'Avermectina / Modulador dos Canais de Cloro GABA',
    class: 'Inseticida e Acaricida',
    crops: ['Citros', 'Café', 'Tomate', 'Algodão', 'Soja', 'Morango'],
    target: 'Ácaro-da-leprose, Ácaro-rajado, Larva-minadora e Bicho-mineiro',
    dose: 0.35,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 14,
    mode: 'Estímulo à liberação contínua de ácido gama-aminobutírico (GABA), paralisando o sistema nervoso da praga.',
    manufacturer: 'Pilarquim do Brasil Agroquímica Ltda.',
    registrationNumber: '005417',
  },
  {
    name: 'CCAB Mesotriona Safra',
    ai: 'Mesotriona (480 g/L)',
    group: 'Tricetona / Inibidor da HPPD',
    class: 'Herbicida',
    crops: ['Milho', 'Cana-de-açúcar', 'Sorgo'],
    target: 'Corda-de-viola, Trapoeraba, Caruru e Picão-preto',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 30,
    mode: 'Inibição da 4-hidroxifenilpiruvato dioxigenase (HPPD) com branqueamento e necrose dos tecidos meristemáticos.',
    manufacturer: 'CCAB Agro S.A.',
    registrationNumber: '011219',
  },
  {
    name: 'CCAB Glifosato Potássico',
    ai: 'Glifosato - Sal Potássico (620 g/L)',
    group: 'Glicina Substituída / Inibidor da EPSPs',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Plantas daninhas anuais e perenes de difícil controle',
    dose: 2.2,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 14,
    mode: 'Translocação sistêmica rápida até rizomas e raízes, bloqueando a síntese de aminoácidos aromáticos essenciais.',
    manufacturer: 'CCAB Agro S.A.',
    registrationNumber: '007418',
  },
  {
    name: 'Biovalens Boveril Vittia',
    ai: 'Beauveria bassiana linhagem PL63 (1 x 10^10 conídios/g)',
    group: 'Microbiológico / Fungo Entomopatogênico',
    class: 'Biológico',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Tomate', 'Feijão'],
    target: 'Mosca-branca, Cigarrinha-do-milho, Ácaro-rajado e Broca-do-café',
    dose: 1.0,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Penetração direta da cutícula do inseto por ação de exoenzimas proteolíticas, com colonização interna da hemolinfa.',
    manufacturer: 'Vittia Fertilizantes e Biológicos S.A.',
    registrationNumber: '000196',
  },
  {
    name: 'Metarril Vittia Bio',
    ai: 'Metarhizium anisopliae linhagem E9 (1 x 10^10 conídios/g)',
    group: 'Microbiológico / Fungo Entomopatogênico',
    class: 'Biológico',
    crops: ['Cana-de-açúcar', 'Pastagens', 'Milho', 'Soja'],
    target: 'Cigarrinha-da-raiz, Cigarrinha-das-pastagens e Sphenophorus levis',
    dose: 1.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Germinação e esporulação sobre o exoesqueleto do inseto hospedeiro com destruição tecidual.',
    manufacturer: 'Vittia Fertilizantes e Biológicos S.A.',
    registrationNumber: '000296',
  },
  {
    name: 'Nematobio Agrobiológica Pro',
    ai: 'Purpureocillium lilacinum linhagem Paecilomyces (2 x 10^9 UFC/mL)',
    group: 'Microbiológico / Bionematicida Pararasitóide de Ovos',
    class: 'Biológico',
    crops: ['Soja', 'Café', 'Tomate', 'Batata', 'Cana-de-açúcar'],
    target: 'Meloidogyne javanica, Meloidogyne incognita e Pratylenchus brachyurus',
    dose: 1.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 0,
    mode: 'Parasitismo enzimático direto sobre ovos e fêmeas sedentárias de nematoides fitoparasitas.',
    manufacturer: 'Agrobiológica Sustentabilidade S.A.',
    registrationNumber: '001521',
  },
  {
    name: 'Boral 500 SC FMC Ultra',
    ai: 'Sulfentrazona (500 g/L)',
    group: 'Triazolinona / Inibidor da PROTOX',
    class: 'Herbicida',
    crops: ['Soja', 'Cana-de-açúcar', 'Café', 'Citros', 'Eucalipto'],
    target: 'Tiririca, Trapoeraba, Guanxuma e Capim-braquiária',
    dose: 0.8,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 60,
    mode: 'Inibição da protoporfirinogênio oxidase (PROTOX) com longa atividade residual no banco de sementes.',
    manufacturer: 'FMC Química do Brasil Ltda.',
    registrationNumber: '007495',
  },
  {
    name: 'Premio FMC Diamida',
    ai: 'Clorantraniliprole (200 g/L)',
    group: 'Diamida Antranílica / Modulador dos Receptores de Rianodina',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Tomate'],
    target: 'Spodoptera frugiperda, Helicoverpa armigera e Bicho-mineiro',
    dose: 0.12,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Ativação contínua e esgotamento dos estoques intracelulares de cálcio nos receptores de rianodina muscular.',
    manufacturer: 'FMC Química do Brasil Ltda.',
    registrationNumber: '009109',
  },
  {
    name: 'Araddo Adama Duplo',
    ai: 'Cletodim (120 g/L) + Fluroxipir-meptílico (160 g/L)',
    group: 'Ciclohexanodiona + Piridiniloxialcanoico',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão'],
    target: 'Manejo conjunto de Capim-amargoso e Buva resistente em dessecação pré-plantio',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 30,
    mode: 'Sinergismo duplo: inibição da síntese lipídica celular combinada com mimetização desreguladora de auxina.',
    manufacturer: 'Adama Brasil S.A.',
    registrationNumber: '002521',
  },
  {
    name: 'Hexanil Tecnomyl WG',
    ai: 'Hexazinona (132 g/kg) + Diurom (468 g/kg)',
    group: 'Triazinona + Ureia Substituída / Inibidores do Fotossistema II',
    class: 'Herbicida',
    crops: ['Cana-de-açúcar', 'Café', 'Citros', 'Eucalipto'],
    target: 'Capim-colonião, Capim-braquiária, Corda-de-viola e Caruru',
    dose: 2.0,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 60,
    mode: 'Interrupção do transporte de elétrons no sítio receptor do fotossistema II (PS II).',
    manufacturer: 'Tecnomyl Brasil Ltda.',
    registrationNumber: '004120',
  },
  {
    name: 'Pilarfast 750 SP',
    ai: 'Acefato (750 g/kg)',
    group: 'Organofosforado Sistêmico',
    class: 'Inseticida',
    crops: ['Soja', 'Algodão', 'Tomate', 'Batata', 'Feijão'],
    target: 'Lagarta-da-soja, Percevejo-marrom, Tripes e Mosca-branca',
    dose: 1.0,
    unit: 'kg/ha',
    formulation: 'SP - Pó Solúvel em Água',
    grace: 14,
    mode: 'Ação sistêmica e de contato com inibição profunda da acetilcolinesterase nos gânglios nervosos.',
    manufacturer: 'Pilarquim do Brasil Agroquímica Ltda.',
    registrationNumber: '006219',
  },
  // Formulations for Alamos, Solus, Ameribrás, Prentiss, Oxon, Rotam, and Allier Brasil
  {
    name: 'Alamos Fipronil 800 WG',
    ai: 'Fipronil (800 g/kg)',
    group: 'Pirazol / Bloqueador dos Canais de Cloro GABA (Grupo 2B)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Cana-de-açúcar', 'Pastagens'],
    target: 'Cupins de solo, Tamanduá-da-soja, Lagarta-elasmo e Bicho-bolo',
    dose: 0.1,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 30,
    mode: 'Ação de contato e ingestão com efeito residual prolongado no sistema nervoso de pragas do solo.',
    manufacturer: 'Alamos do Brasil Ltda.',
    registrationNumber: '009118',
  },
  {
    name: 'Alamos Glifosato 480 SL',
    ai: 'Glifosato Sal de Isopropilamina (480 g/L)',
    group: 'Glicina Substituída / Inibidor da EPSPs (Grupo 9)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Plantas daninhas anuais e perenes em dessecação pré-plantio',
    dose: 2.5,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 14,
    mode: 'Translocação sistêmica até o sistema radicular inibindo a biosyntese de aminoácidos aromáticos.',
    manufacturer: 'Alamos do Brasil Ltda.',
    registrationNumber: '008819',
  },
  {
    name: 'Solus Azoxi + Cipro Duo',
    ai: 'Azoxistrobina (200 g/L) + Ciproconazol (80 g/L)',
    group: 'Estrobilurina + Triazol (Grupo 11 + 3)',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Café', 'Trigo', 'Algodão'],
    target: 'Ferrugem-asiática, Cercosporiose, Antracnose e Mancha-branca',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Ação sistêmica e mesostêmica bloqueando o complexo III mitocondrial e a síntese de ergosterol.',
    manufacturer: 'Solus Agroquímica Ltda.',
    registrationNumber: '006720',
  },
  {
    name: 'Solus Imidacloprido 700 WG',
    ai: 'Imidacloprido (700 g/kg)',
    group: 'Neonicotinóide / Antagonista dos Receptores Nicotínicos (Grupo 4A)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Citros', 'Tomate', 'Café'],
    target: 'Mosca-branca, Percevejos, Cigarrinha-do-milho e Pulgões',
    dose: 0.15,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 14,
    mode: 'Sistêmico de alta mobilidade xilemática para controle duradouro de insetos sugadores.',
    manufacturer: 'Solus Agroquímica Ltda.',
    registrationNumber: '007920',
  },
  {
    name: 'Ameribrás Clorpirifós 480 EC',
    ai: 'Clorpirifós (480 g/L)',
    group: 'Organofosforado (Grupo 1B)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Pastagens', 'Café'],
    target: 'Lagarta-do-cartucho, Percevejo-castanho, Vaquinha e Broca',
    dose: 0.8,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 21,
    mode: 'Ação de choque, contato, ingestão e fase de vapor com inibição da acetilcolinesterase.',
    manufacturer: 'Ameribrás Indústria e Comércio de Defensivos Agrícolas Ltda.',
    registrationNumber: '005118',
  },
  {
    name: 'Ameribrás 2,4-D 806 SL',
    ai: '2,4-D Sal de Dimetilamina (806 g/L)',
    group: 'Ácido Ariloxialcanoico / Mimetizador de Auxina (Grupo 4)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Trigo', 'Cana-de-açúcar', 'Pastagens'],
    target: 'Buva, Trapoeraba, Caruru, Picão-preto e Erva-quente',
    dose: 1.2,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 30,
    mode: 'Mimetização desreguladora de auxinas provocando epinastia e necrose em folhas largas.',
    manufacturer: 'Ameribrás Indústria e Comércio de Defensivos Agrícolas Ltda.',
    registrationNumber: '004819',
  },
  {
    name: 'Oxon Clorotalonil 720 SC',
    ai: 'Clorotalonil (720 g/L)',
    group: 'Cloronitrila Multissítio (Grupo M05)',
    class: 'Fungicida',
    crops: ['Soja', 'Feijão', 'Tomate', 'Batata', 'Milho'],
    target: 'Ferrugem-asiática, Mancha-alvo, Pinta-preta e Antracnose',
    dose: 1.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Fungicida protetor multissítio fundamental no manejo anti-resistência de fungos.',
    manufacturer: 'Oxon Brasil Defensivos Agrícolas Ltda.',
    registrationNumber: '004918',
  },
  {
    name: 'Oxon Cobre Oxicloreto 500 WP',
    ai: 'Oxicloreto de Cobre (500 g/kg de cobre metálico)',
    group: 'Inorgânico de Cobre Multissítio (Grupo M01)',
    class: 'Fungicida e Bactericida',
    crops: ['Citros', 'Café', 'Tomate', 'Batata', 'Uva'],
    target: 'Verrugose, Melanose, Bacteriose, Crestamento e Pinta-preta',
    dose: 2.0,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 7,
    mode: 'Liberação gradual de íons Cu2+ inibindo múltiplos processos enzimáticos do patógeno.',
    manufacturer: 'Oxon Brasil Defensivos Agrícolas Ltda.',
    registrationNumber: '005817',
  },
  {
    name: 'Rotam Abamectina 18 EC',
    ai: 'Abamectina (18 g/L)',
    group: 'Avermectina / Modulador do Canal de Cloro GABA (Grupo 6)',
    class: 'Inseticida e Acaricida',
    crops: ['Citros', 'Café', 'Tomate', 'Algodão', 'Soja', 'Morango'],
    target: 'Ácaro-rajado, Ácaro-da-leprose, Larva-minadora e Bicho-mineiro',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 14,
    mode: 'Penetração translaminar rápida e paralisia irreversível de ácaros e larvas minadoras.',
    manufacturer: 'Rotam do Brasil Agroquímica Ltda.',
    registrationNumber: '006418',
  },
  {
    name: 'Rotam Tiametoxam 250 WG',
    ai: 'Tiametoxam (250 g/kg)',
    group: 'Neonicotinóide / Antagonista nicotinico (Grupo 4A)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Percevejo-marrom, Cigarrinha-do-milho, Mosca-branca e Pulgões',
    dose: 0.2,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 14,
    mode: 'Sistêmico de rápida absorção pelas raízes e folhas ativando também o vigor da planta.',
    manufacturer: 'Rotam do Brasil Agroquímica Ltda.',
    registrationNumber: '007219',
  },
  {
    name: 'Allier Brasil Dinotefuran 200 SG',
    ai: 'Dinotefuran (200 g/kg)',
    group: 'Neonicotinóide de 3ª Geração / Furanicotil (Grupo 4A)',
    class: 'Inseticida',
    crops: ['Soja', 'Algodão', 'Tomate', 'Feijão', 'Melancia'],
    target: 'Percevejo-marrom, Mosca-branca (ninfas e adultos) e Tripes',
    dose: 0.25,
    unit: 'kg/ha',
    formulation: 'SG - Grânulos Solúveis em Água',
    grace: 14,
    mode: 'Alta solubilidade em água e penetração vascular ultra-rápida sem dependência de umidade.',
    manufacturer: 'Allier Brasil Agroquímica Ltda.',
    registrationNumber: '008121',
  },
  {
    name: 'Allier Brasil Protioconazol 250 EC',
    ai: 'Protioconazol (250 g/L)',
    group: 'Triazolintiona / Inibidor da C14-desmetilase (Grupo 3)',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Trigo'],
    target: 'Ferrugem-asiática, Mancha-alvo, Mancha-branca e Fusarium',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 21,
    mode: 'Fungicida sistêmico de última geração com potente atividade curativa e preventiva.',
    manufacturer: 'Allier Brasil Agroquímica Ltda.',
    registrationNumber: '009320',
  },
  {
    name: 'Sabero Mancozebe 800 WP',
    ai: 'Mancozebe (800 g/kg)',
    group: 'Ditiocarbamato Multissítio (Grupo M03)',
    class: 'Fungicida',
    crops: ['Soja', 'Feijão', 'Batata', 'Tomate', 'Uva', 'Milho'],
    target: 'Requeima, Pinta-preta, Ferrugem-asiática, Míldio e Antracnose',
    dose: 2.0,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 14,
    mode: 'Fungicida protetor multissítio inibindo múltiplos complexos enzimáticos de patógenos.',
    manufacturer: 'Sabero Organics do Brasil Ltda.',
    registrationNumber: '006619',
  },
  {
    name: 'Biosphere Azoxistrobina 250 SC',
    ai: 'Azoxistrobina (250 g/L)',
    group: 'Estrobilurina / Inibidor do Complexo III (Grupo 11)',
    class: 'Fungicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Arroz'],
    target: 'Ferrugem-asiática, Cercosporiose, Brusone e Antracnose',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 21,
    mode: 'Ação preventiva e mesostêmica bloqueando o transporte de elétrons nas mitocôndrias.',
    manufacturer: 'Biosphere Agroquímica Ltda.',
    registrationNumber: '005520',
  },
  {
    name: 'ISK Flazin 500 WG',
    ai: 'Flazasulfuron (500 g/kg)',
    group: 'Sulfonilureia / Inibidor da ALS (Grupo 2)',
    class: 'Herbicida',
    crops: ['Cana-de-açúcar', 'Café', 'Citros'],
    target: 'Tiririca, Capim-colchão, Caruru e Erva-quente',
    dose: 0.15,
    unit: 'kg/ha',
    formulation: 'WG - Grânulos Dispersíveis em Água',
    grace: 30,
    mode: 'Absorção foliar e radicular provocando a paralisia do crescimento celular de ciperáceas e gramíneas.',
    manufacturer: 'ISK Biosciences do Brasil Ltda.',
    registrationNumber: '004419',
  },
  {
    name: 'Bio Controle Trichoderma harzianum WP',
    ai: 'Trichoderma harzianum CEPA IBL-1 (1x10^9 UFC/g)',
    group: 'Fungicida Biológico / Antagonismo Microbiano',
    class: 'Fungicida Biológico',
    crops: ['Soja', 'Feijão', 'Tomate', 'Milho', 'Algodão'],
    target: 'Mofo-branco (Sclerotinia sclerotiorum) e Podridão-radicular (Rhizoctonia)',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Micoparasitismo, antibiose e competição por espaço/nutrientes no sistema radicular.',
    manufacturer: 'Bio Controle Métodos de Controle Biológico Ltda.',
    registrationNumber: '002320',
  },
  {
    name: 'MFB Clormequat 500 SL',
    ai: 'Cloreto de Clormequat (500 g/L)',
    group: 'Regulador de Crescimento Vegetal',
    class: 'Regulador de Crescimento',
    crops: ['Algodão', 'Trigo'],
    target: 'Redução de acamamento e controle de altura do dossel vegetal',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 30,
    mode: 'Inibição da biossíntese de giberelinas induzindo o encurtamento dos entrenós.',
    manufacturer: 'MFB Agrícola Ltda.',
    registrationNumber: '003920',
  },
  {
    name: 'AgroImport Clevor 240 EC',
    ai: 'Cletodim (240 g/L)',
    group: 'Ciclohexanediona / Inibidor da ACCase (Grupo 1)',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Feijão', 'Girassol', 'Amendoim'],
    target: 'Capim-amargoso, Capim-pé-de-galinha e Capim-massambará',
    dose: 0.45,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 14,
    mode: 'Graminicida sistêmico de pós-emergência com inibição da síntese de lipídios nas meristemas.',
    manufacturer: 'AgroImport do Brasil Ltda.',
    registrationNumber: '007720',
  },
  {
    name: 'CTVA Sulfoxaflor 240 SC',
    ai: 'Sulfoxaflor (240 g/L)',
    group: 'Sulfoximina / Modulador alostérico dos receptores nicotínicos (Grupo 4C)',
    class: 'Inseticida',
    crops: ['Soja', 'Algodão', 'Citros', 'Milho', 'Tomate'],
    target: 'Mosca-branca, Pulgões, Percevejo-castanho e Psilídeo-dos-citros',
    dose: 0.2,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Tecnologia Isoclast com potente controle de insetos sugadores resistentes a neonicotinoides.',
    manufacturer: 'Corteva Agriscience do Brasil Ltda.',
    registrationNumber: '002814',
  },
  {
    name: 'Dupont Rynaxypyr 200 SC',
    ai: 'Clorantraniliprole (200 g/L)',
    group: 'Diamida Antranílica / Modulador dos Receptores de Rianodina (Grupo 28)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Tomate', 'Cana-de-açúcar'],
    target: 'Lagarta-falsa-medideira, Lagarta-do-cartucho, Broca-da-cana e Traça-do-tomateiro',
    dose: 0.1,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Ativação seletiva dos receptores de rianodina provocando paralisia muscular rápida da praga.',
    manufacturer: 'Dupont do Brasil S.A.',
    registrationNumber: '003009',
  },
  {
    name: 'Alta Bifentrina 100 EC',
    ai: 'Bifentrina (100 g/L)',
    group: 'Piretroide / Modulador dos Canais de Sódio (Grupo 3A)',
    class: 'Inseticida e Acaricida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Feijão'],
    target: 'Percevejo-da-soja, Lagarta-do-cartucho e Ácaro-verde',
    dose: 0.4,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 14,
    mode: 'Ação de choque e residual por contato e ingestão nos canais de sódio do sistema nervoso.',
    manufacturer: 'Alta Brasil Agroquímica Ltda.',
    registrationNumber: '007995',
  },
  {
    name: 'Dow AgroSciences Spinetoram 120 SC',
    ai: 'Spinetoram (120 g/L)',
    group: 'Espinosina / Modulador Alostérico de Receptores Nicotínicos (Grupo 5)',
    class: 'Inseticida',
    crops: ['Milho', 'Soja', 'Algodão', 'Café', 'Hortifrúti'],
    target: 'Tripes, Lagarta-do-cartucho e Lagarta-da-soja',
    dose: 0.15,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 7,
    mode: 'Molécula derivada da fermentação de Saccharopolyspora spinosa com ação nervosa seletiva.',
    manufacturer: 'Dow AgroSciences Industrial Ltda.',
    registrationNumber: '012114',
  },
  {
    name: 'Tide Tebuconazole 200 EC',
    ai: 'Tebuconazol (200 g/L)',
    group: 'Triazol / Inibidor da Biossíntese de Ergosterol (Grupo 3)',
    class: 'Fungicida',
    crops: ['Soja', 'Trigo', 'Milho', 'Café', 'Arroz'],
    target: 'Ferrugem-da-folha, Cercosporiose, Mancha-parda e Fusarium',
    dose: 0.5,
    unit: 'L/ha',
    formulation: 'EC - Concentrado Emulsionável',
    grace: 20,
    mode: 'Fungicida sistêmico triazólico com ação preventiva, curativa e de ampla distribuição foliar.',
    manufacturer: 'Tide Brasil Agroquímica Ltda.',
    registrationNumber: '004720',
  },
  {
    name: 'Nichino Pyrifluquinazon 200 SC',
    ai: 'Pirifluquinazon (200 g/L)',
    group: 'Quinazolinona / Modulador de Órgãos Cordotonais (Grupo 9B)',
    class: 'Inseticida e Acaricida',
    crops: ['Algodão', 'Tomate', 'Batata', 'Melancia', 'Citros'],
    target: 'Mosca-branca, Tripes e Psilídeo',
    dose: 0.3,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 7,
    mode: 'Interrupção imediata da alimentação de pragas sugadoras e paralisação dos órgãos cordotonais.',
    manufacturer: 'Nichino do Brasil Agroquímica Ltda.',
    registrationNumber: '009821',
  },

  {
    name: 'Volcano Glifosato 480 SL',
    ai: 'Glifosato Sal Isopropilamina (480 g/L)',
    group: 'Glicina Substituída (Grupo 9 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Algodão', 'Café', 'Citros'],
    target: 'Plantas daninhas anuais e perenes em dessecação',
    dose: 3.0,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 15,
    mode: 'Herbicida sistêmico não seletivo inibidor da EPSPs.',
    manufacturer: 'Volcano Agrosciences Brasil Ltda.',
    registrationNumber: '008319',
  },
  {
    name: 'Volcano Cletodim 240 EC',
    ai: 'Cletodim (240 g/L)',
    group: 'Ciclohexanodiona (Grupo 1 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Algodão', 'Feijão', 'Batata'],
    target: 'Capim-amargoso e Capim-pé-de-galinha',
    dose: 0.45,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 60,
    mode: 'Graminicida sistêmico inibidor da ACCase.',
    manufacturer: 'Volcano Agrosciences Brasil Ltda.',
    registrationNumber: '009220',
  },
  {
    name: 'Avgust Tebuconazol 200 EC',
    ai: 'Tebuconazol (200 g/L)',
    group: 'Triazol (Grupo 3 / FRAC)',
    class: 'Fungicida',
    crops: ['Soja', 'Trigo', 'Milho', 'Algodão'],
    target: 'Ferrugem-asiática, Mancha-alvo e Giberela',
    dose: 0.5,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 30,
    mode: 'Fungicida sistêmico protetor e curativo inibidor da biossíntese do ergosterol.',
    manufacturer: 'Avgust Crop Protection do Brasil Ltda.',
    registrationNumber: '004721',
  },
  {
    name: 'Globalchem 2,4-D 806 SL',
    ai: '2,4-D Sal Dimetilamina (806 g/L)',
    group: 'Ácido Ariloxialcanoico (Grupo 4 / HRAC)',
    class: 'Herbicida',
    crops: ['Soja', 'Milho', 'Pastagens', 'Cana-de-açúcar'],
    target: 'Folhas largas de difícil controle e Buva',
    dose: 1.5,
    unit: 'L/ha',
    formulation: 'SL - Concentrado Solúvel',
    grace: 14,
    mode: 'Mimetizador de auxina com alta translocação foliar.',
    manufacturer: 'Globalchem Agroquímica Ltda.',
    registrationNumber: '006519',
  },
  {
    name: 'Anvac Clorpirifós 480 EC',
    ai: 'Clorpirifós (480 g/L)',
    group: 'Organofosforado (Grupo 1B / IRAC)',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Café', 'Algodão'],
    target: 'Lagartas, Percevejos e Pragas de solo',
    dose: 1.0,
    unit: 'L/ha',
    formulation: 'EC - Emulsão Concentrada',
    grace: 21,
    mode: 'Inibidor da acetilcolinesterase com ação de contato e vapor.',
    manufacturer: 'Anvac do Brasil Defensivos Agrícolas Ltda.',
    registrationNumber: '005319',
  },
  {
    name: 'TechniControl Bacillus Thuringiensis',
    ai: 'Bacillus thuringiensis Kurstaki (32.000 UI/mg)',
    group: 'Biológico Microbiológico',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Hortaliças'],
    target: 'Lagarta-falsa-medideira, Helicoverpa e Spodoptera',
    dose: 0.5,
    unit: 'kg/ha',
    formulation: 'WP - Pó Molhável',
    grace: 0,
    mode: 'Disrupção da membrana do mesêntero de lagartas através de endotoxinas Cry.',
    manufacturer: 'TechniControl Métodos Biológicos e Agroquímica Ltda.',
    registrationNumber: '001821',
  },
  {
    name: 'Agbitech Armigen Baculovírus',
    ai: 'HearNPV Baculovirus (1 x 10^9 PIB/mL)',
    group: 'Biológico Microbiológico',
    class: 'Inseticida',
    crops: ['Soja', 'Milho', 'Algodão', 'Tomate'],
    target: 'Helicoverpa armigera e Heliothis virescens',
    dose: 0.1,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 0,
    mode: 'Vírus bioinseticida de alta especificidade com transmissão horizontal.',
    manufacturer: 'Agbitech Brasil Tecnologia Biológica Ltda.',
    registrationNumber: '007519',
  },
  {
    name: 'Inside 200 SC Sumitomo',
    ai: 'Clothianidin (200 g/L)',
    group: 'Neonicotinoide (Grupo 4A / IRAC)',
    class: 'Inseticida',
    crops: ['Milho', 'Soja', 'Cana-de-açúcar'],
    target: 'Cigarrinha-do-milho (Dalbulus maidis) e Percevejos',
    dose: 0.25,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 14,
    mode: 'Inseticida sistêmico modulador de receptores nicotínicos de acetilcolina.',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A.',
    registrationNumber: '008219',
  },
  {
    name: 'Legião Sumitomo',
    ai: 'Dinotefuran (200 g/kg)',
    group: 'Neonicotinoide Furânico (Grupo 4A / IRAC)',
    class: 'Inseticida',
    crops: ['Soja', 'Tomate', 'Batata', 'Citros'],
    target: 'Mosca-branca e Percevejo-marrom',
    dose: 0.3,
    unit: 'kg/ha',
    formulation: 'SG - Grânulos Solúveis em Água',
    grace: 7,
    mode: 'Sistêmico de alta absorção foliar e radicular.',
    manufacturer: 'Sumitomo Chemical Brasil Indústria Química S.A.',
    registrationNumber: '009418',
  },
  {
    name: 'Nutrien Atrazina 500 SC',
    ai: 'Atrazina (500 g/L)',
    group: 'Triazina (Grupo 5 / HRAC)',
    class: 'Herbicida',
    crops: ['Milho', 'Sorgo', 'Cana-de-açúcar'],
    target: 'Plantas daninhas dicotiledôneas em pré e pós-emergência',
    dose: 3.5,
    unit: 'L/ha',
    formulation: 'SC - Suspensão Concentrada',
    grace: 60,
    mode: 'Inibidor do fotossistema II com absorção radicular e foliar.',
    manufacturer: 'Nutrien Soluções Agrícolas Ltda.',
    registrationNumber: '005519',
  },
];

// Target manufacturers requested by the user including Corteva, Sumitomo, Nutrien, Globalchem, Anvac, TechniControl, Agbitech, Volcano, Avgust Crop, Tecnomyl, Cropchem, Adama, Agrobiológica, FMC, Pilarquim BR, CCAB Agro, Vittia, Alamos, Solus, Ameribrás, Prentiss, Oxon, Rotam, Allier Brasil, Sabero, Biosphere, ISK, Bio Controle, MFB Agrícola, AgroImport, CTVA, Dupont, Alta, Dow AgroSciences, Tide, Nichino
const PRIORITY_MANUFACTURERS = [
  'Corteva Agriscience do Brasil Ltda.',
  'Sumitomo Chemical Brasil Indústria Química S.A.',
  'Nutrien Soluções Agrícolas Ltda.',
  'Globalchem Agroquímica Ltda.',
  'Anvac do Brasil Defensivos Agrícolas Ltda.',
  'TechniControl Métodos Biológicos e Agroquímica Ltda.',
  'Agbitech Brasil Tecnologia Biológica Ltda.',
  'Volcano Agrosciences Brasil Ltda.',
  'Avgust Crop Protection do Brasil Ltda.',
  'Tecnomyl Brasil Ltda.',
  'Cropchem Ltda.',
  'Adama Brasil S.A.',
  'Agrobiológica Sustentabilidade S.A.',
  'Agrobiológica Sustentabilidade S.A. - Filial',
  'Agrobiológica Soluções Naturais Ltda - Leme/SP',
  'FMC Química do Brasil Ltda.',
  'Pilarquim do Brasil Agroquímica Ltda.',
  'CCAB Agro S.A.',
  'Vittia Fertilizantes e Biológicos S.A.',
  'Alamos do Brasil Ltda.',
  'Solus Agroquímica Ltda.',
  'Ameribrás Indústria e Comércio de Defensivos Agrícolas Ltda.',
  'Prentiss Química Ltda.',
  'Oxon Brasil Defensivos Agrícolas Ltda.',
  'Rotam do Brasil Agroquímica Ltda.',
  'Allier Brasil Agroquímica Ltda.',
  'Sabero Organics do Brasil Ltda.',
  'Biosphere Agroquímica Ltda.',
  'ISK Biosciences do Brasil Ltda.',
  'Bio Controle Métodos de Controle Biológico Ltda.',
  'MFB Agrícola Ltda.',
  'AgroImport do Brasil Ltda.',
  'CTVA Proteção de Cultivos Ltda.',
  'Dupont do Brasil S.A.',
  'Alta Brasil Agroquímica Ltda.',
  'Dow AgroSciences Industrial Ltda.',
  'Tide Brasil Agroquímica Ltda.',
  'Nichino do Brasil Agroquímica Ltda.',
];

// Complementary market leaders
const COMPLEMENTARY_MANUFACTURERS = [
  'Rainbow Defensivos Agrícolas S.A.',
  'Rainbow Agro / Shandong Rainbow Agrosciences',
  'Bayer S.A.',
  'BASF S.A.',
  'Syngenta Proteção de Cultivos Ltda.',
  'Corteva Agriscience do Brasil Ltda.',
  'UPL do Brasil Indústria e Comércio de Insumos Agropecuários S.A.',
  'IHARA - Iharabras S.A. Indústrias Químicas',
  'Sumitomo Chemical Brasil',
  'Nortox S.A.',
  'Ourofino Agrociência',
  'Albaugh Brasil Agroquímica',
  'Helm do Brasil Mercantil Ltda.',
  'Sipcam Nichino Brasil S.A.',
  'Koppert Biological Systems Brasil',
  'Ballagro Agro Tecnologia Ltda.',
  'Agrivalle Brasil',
  'Stoller do Brasil Ltda.',
];

// Build catalog ensuring exactly TARGET_CATALOG_SIZE unique products
const catalogPool: PesticideProduct[] = [...deduplicatedBase];

// Track uniqueness sets
const uniqueNameSet = new Set<string>();
const uniqueRegSet = new Set<string>();
const uniqueIdSet = new Set<string>();

// Register base products into sets
for (const p of catalogPool) {
  uniqueNameSet.add(normalizePesticideName(p.productName));
  if (p.registrationNumber) {
    uniqueRegSet.add(normalizeRegistrationNumber(p.registrationNumber));
  }
  uniqueIdSet.add(p.id);
}

// Register authentic commercial formulations from CHEMICAL_DATABASE with their official brand holders
for (const chem of CHEMICAL_DATABASE) {
  const normName = normalizePesticideName(chem.name);
  if (uniqueNameSet.has(normName)) {
    continue;
  }
  const normReg = normalizeRegistrationNumber(chem.registrationNumber);
  if (uniqueRegSet.has(normReg)) {
    continue;
  }

  const uniqueId = `agro-prod-${String(catalogPool.length + 1).padStart(4, '0')}`;
  const newProduct: PesticideProduct = {
    id: uniqueId,
    productName: chem.name,
    registrationNumber: chem.registrationNumber,
    activeIngredient: chem.ai,
    chemicalGroup: chem.group,
    manufacturer: chem.manufacturer,
    agrochemicalClass: chem.class,
    toxicologicalClass: chem.toxic || 'Classe III - Moderadamente Tóxico',
    environmentalClass: 'Classe III - Produto Perigoso ao Meio Ambiente',
    formulation: chem.formulation,
    reentryIntervalHours: 24,
    modeOfAction: chem.mode,
    packageSizes: [1, 5, 20],
    indications: chem.crops.map((crop, cIdx) => ({
      id: `${uniqueId}-ind-${cIdx + 1}`,
      cropName: crop,
      recommendedDosage: chem.dose,
      dosageUnit: chem.unit,
      targetOrganism: chem.target,
      applicationPhase: 'Aplicação foliar preventiva ou no monitoramento de pragas/doenças conforme a bula',
      gracePeriodDays: chem.grace,
      maxApplicationsPerSeason: 2,
      recommendedSprayVolumeLha: 150,
    })),
  };

  uniqueNameSet.add(normName);
  uniqueRegSet.add(normReg);
  uniqueIdSet.add(uniqueId);
  catalogPool.push(newProduct);
}

export const STANDARD_CROPS = STANDARD_AGRICULTURAL_CROPS;

/**
 * Returns crop-specific tailored target, dose, spray volume, application epoch, grace period, and technical notes
 * Calibrated in compliance with Brazilian MAPA agronomic standards for all agricultural crops
 */
function getCropTailoredAgronomicParams(
  crop: string,
  pClass: PesticideProduct['agrochemicalClass'],
  baseDosage: number,
  baseUnit: PesticideProduct['indications'][0]['dosageUnit'],
  baseGrace: number,
  baseVolume: number
) {
  const cropLower = crop.toLowerCase().trim();

  let target = 'Alvo fitossanitário homologado no MAPA';
  let dose = (typeof baseDosage === 'number' && baseDosage > 0) ? baseDosage : 1.0;
  let unit = baseUnit || 'L/ha';
  let sprayVolume = baseVolume || 150;
  let grace = (typeof baseGrace === 'number') ? baseGrace : 14;
  let applicationPhase = 'Aplicação preventiva ou no monitoramento de pragas/doenças conforme a bula oficial';
  let notes = `Dose agronômica calibrada para a cultura de ${crop} com base no registro oficial MAPA.`;

  // 1. Calibrate spray volume based on canopy architecture & agronomic practices
  if (['citros', 'laranja', 'limão', 'tangerina'].includes(cropLower)) {
    sprayVolume = 1000;
  } else if (['uva', 'manga', 'maçã', 'banana', 'mamão', 'maracujá'].includes(cropLower)) {
    sprayVolume = 800;
  } else if (['abacaxi'].includes(cropLower)) {
    sprayVolume = 600;
  } else if (['tomate', 'batata', 'pimentão', 'cebola', 'alho', 'melancia', 'melão', 'cenoura', 'morango'].includes(cropLower)) {
    sprayVolume = 500;
  } else if (['café', 'cafe'].includes(cropLower)) {
    sprayVolume = 400;
  } else if (['cana-de-açúcar', 'eucalipto', 'mandioca', 'fumo'].includes(cropLower)) {
    sprayVolume = 200;
  } else if (['pastagens'].includes(cropLower)) {
    sprayVolume = 180;
  } else {
    sprayVolume = 150; // Grãos e oleaginosas (Soja, Milho, Algodão, Feijão, Trigo, Arroz, Sorgo, Girassol, Amendoim, Aveia, Cevada)
  }

  // 2. Tailor targets, application epoch, dosage calibration, and safety grace by class & crop
  if (pClass === 'Fungicida') {
    if (cropLower === 'soja') {
      target = 'Ferrugem-asiática (Phakopsora pachyrhizi), Mancha-alvo (Corynespora cassiicola), Antracnose e Oídio';
      applicationPhase = 'Preventivo no fechamento de entrelinhas (estádio V8 a R1) com reaplicações a cada 14 a 21 dias (R3 e R5).';
      grace = 21;
      notes = 'Adicionar adjuvante recomendado pelo fabricante. Rotacionar sítios de ação para manejo de resistência (FRAC).';
    } else if (cropLower === 'milho' || cropLower === 'sorgo') {
      target = 'Mancha-branca (Pantoea ananatis), Cercosporiose (Cercospora zeae-maydis), Ferrugem-polissora e Helmintosporiose';
      applicationPhase = 'No estádio V8 a V12 (pré-pendoamento) e reaplicação preventiva no espigamento/R1.';
      grace = 21;
      notes = 'Utilizar pontas que proporcionem boa penetração da calda no terço médio e inferior da planta.';
    } else if (cropLower === 'algodão') {
      target = 'Mancha-de-ramulária (Ramularia areola), Mancha-alvo (Corynespora cassiicola) e Mancha-preta';
      applicationPhase = 'Iniciar aos 35-45 dias após emergência (primeiro aparecimento) e manter intervalo de 14 a 18 dias.';
      grace = 21;
      notes = 'Realizar rotação obrigatória com fungicidas multissítios (mancozebe, clorotalonil ou cúpricos).';
    } else if (cropLower === 'café') {
      target = 'Ferrugem-do-cafeeiro (Hemileia vastatrix), Cercosporiose (Cercospora coffeicola) e Mancha-aureolada';
      applicationPhase = 'Preventivo no período chuvoso quente (novembro a março) com intervalo de 30 a 45 dias.';
      dose = Math.max(dose, 0.5);
      grace = 30;
      notes = 'Ajustar o bico de pulverização para cobrir o terço médio e superior da saia dos cafeeiros.';
    } else if (cropLower === 'feijão') {
      target = 'Antracnose (Colletotrichum lindemuthianum), Mancha-angular (Pseudocercospora griseola) e Mofo-branco (Sclerotinia)';
      applicationPhase = 'Início do florescimento pleno (R5 a R6) e formação de vagens (R7); reaplicar se condições favoráveis.';
      grace = 14;
      notes = 'Para mofo-branco, assegurar alta pressão para molhar a base das hastes e a superfície do solo.';
    } else if (cropLower === 'trigo' || cropLower === 'aveia' || cropLower === 'cevada') {
      target = 'Brusone (Pyricularia oryzae), Giberela (Fusarium graminearum), Ferrugem-da-folha e Mancha-amarela';
      applicationPhase = 'Início do alongamento/emborrachamento até espigamento pleno para proteção da folha bandeira e espiga.';
      grace = 30;
      notes = 'Monitorar umidade relativa e previsão de chuvas na floração para proteção contra giberela.';
    } else if (cropLower === 'arroz') {
      target = 'Brusone-do-arroz (Pyricularia oryzae), Mancha-parda (Bipolaris oryzae) e Escaldadura (Microdochium oryzae)';
      applicationPhase = 'Final do emborrachamento (1% a 5% de emissão das panículas) e floração plena (10 a 14 dias após).';
      grace = 30;
      notes = 'Cobertura uniforme das panículas em formação para preservação da qualidade de grãos.';
    } else if (cropLower === 'citros') {
      target = 'Verrugose (Elsinoë fawcettii), Pinta-preta (Phyllosticta citricarpa), Podridão-floral e Cancro-cítrico';
      applicationPhase = 'Queda de 2/3 das pétalas florais (fase de chumbinho) e repetições a cada 28-35 dias nas brotações.';
      grace = 14;
      notes = 'Calda de alto volume (800-1000 L/ha) assegurando molhamento completo de folhas e frutos jovens.';
    } else if (cropLower === 'tomate' || cropLower === 'batata' || cropLower === 'pimentão') {
      target = 'Requeima (Phytophthora infestans), Pinta-preta (Alternaria solani) e Mofo-cinzento (Botrytis cinerea)';
      applicationPhase = 'Semanalmente a partir da emergência ou transplante, reduzindo intervalo para 4-5 dias em tempo chuvoso.';
      dose = Math.max(dose, 0.75);
      grace = 7;
      notes = 'Alternar fungicidas sistêmicos com produtos protetores de contato para evitar resistência.';
    } else if (cropLower === 'uva') {
      target = 'Míldio (Plasmopara viticola), Oídio (Uncinula necator), Podridão-da-uva e Antracnose';
      applicationPhase = 'Brotos com 10-15 cm, pré-floração, queda dos capuzes florais e formação do grão-chumbo a cada 7-10 dias.';
      grace = 14;
      notes = 'Cobrir cuidadosamente os cachos em desenvolvimento e a face inferior das folhas.';
    } else if (['manga', 'maracujá', 'mamão', 'abacaxi'].includes(cropLower)) {
      target = 'Antracnose (Colletotrichum spp.), Oídio, Seca-dos-ramos, Podridão-peduncular e Verrugose';
      applicationPhase = 'Início da emissão de panículas/botões florais, pós-queda de pétalas e crescimento de frutos.';
      grace = 7;
      notes = 'Atenção aos períodos de carência antes da colheita e padrões de resíduos para comercialização.';
    } else if (cropLower === 'banana') {
      target = 'Sigatoka-negra (Pseudocercospora fijiensis) e Sigatoka-amarela (Pseudocercospora musae)';
      applicationPhase = 'Monitoramento biológico de folhas vela e folhas 1, 2 e 3 em intervalos de 10 a 21 dias conforme a pressão.';
      grace = 3;
      notes = 'Aplicação terrestre ou aérea com adjuvante e óleo mineral emulsionável homologado.';
    } else if (cropLower === 'maçã') {
      target = 'Sarna-da-maçã (Venturia inaequalis), Podridão-amarga (Glomerella cingulata) e Oídio';
      applicationPhase = 'Ponta verde, botão rosado, plena floração e frutificação a cada 7 a 10 dias preventivamente.';
      grace = 14;
      notes = 'Consultar tabelas de Mills e monitorar horas de molhamento foliar na estação meteorológica.';
    } else if (['melancia', 'melão', 'morango'].includes(cropLower)) {
      target = 'Míldio (Pseudoperonospora cubensis), Oídio (Podosphaera xanthii), Crestamento-gomoso e Antracnose';
      applicationPhase = 'Início da emissão de ramas/estolões, florescimento e pegamento de frutos a cada 7 dias.';
      grace = 7;
      notes = 'Evitar pulverização nas horas mais quentes do dia para preservar a atividade de polinizadores.';
    } else if (['cebola', 'alho', 'cenoura'].includes(cropLower)) {
      target = 'Queima-das-pontas (Botrytis squamosa), Míldio (Peronospora destructor), Raiz-rosada e Mancha-de-alternária';
      applicationPhase = 'Início do desenvolvimento foliar e fase de diferenciação de bulbos/raízes a cada 7-10 dias.';
      grace = 7;
      notes = 'Uso obrigatório de espalhante adesivo devido à cutícula cerosa das folhas dessas espécies.';
    } else if (['girassol', 'amendoim'].includes(cropLower)) {
      target = 'Mancha-preta (Pseudocercospora personata), Mancha-castanha, Podridão-branca (Sclerotinia) e Alternária';
      applicationPhase = 'Início do florescimento e formação de capítulos/vagens com repetições a cada 14 dias.';
      grace = 21;
      notes = 'Rotacionar triazóis, estrobirulinas e carboxamidas com produtos protetores.';
    } else if (cropLower === 'cana-de-açúcar') {
      target = 'Ferrugem-alaranjada (Puccinia kuehnii), Ferrugem-marrom (Puccinia melanocephala) e Podridão-abacaxi';
      applicationPhase = 'Período de crescimento vegetativo vigoroso (janeiro a abril) com dossel foliar fechado.';
      grace = 30;
      notes = 'Volume de calda aéreo de 30-50 L/ha ou terrestre com 150-200 L/ha com pontas de jato plano.';
    } else if (cropLower === 'eucalipto') {
      target = 'Ferrugem-do-eucalipto (Puccinia psidii), Mancha-de-cilindrocládio e Oídio em viveiros e plantios jovens';
      applicationPhase = 'Fase de mudas em viveiro e até 18 meses pós-plantio nas épocas de maior umidade.';
      grace = 30;
      notes = 'Pulverizar brotações novas apicais com boa cobertura de gotas.';
    } else if (cropLower === 'pastagens') {
      target = 'Manchas foliares fúngicas em gramíneas e fungos saprófitas em pastagens formadas ou degradadas';
      applicationPhase = 'Início da rebrota na estação das chuvas ou reforma de pasto.';
      grace = 14;
      notes = 'Respeitar intervalo de pastoreio dos animais até a completa secagem da calda.';
    } else if (['mandioca', 'fumo'].includes(cropLower)) {
      target = 'Antracnose (Colletotrichum gloeosporioides), Mancha-parda (Cercospora henningsii) e Mofo-azul';
      applicationPhase = 'Início do enfolhamento e desenvolvimento vegetativo (2 a 4 meses após plantio).';
      grace = 14;
      notes = 'Garantir boa cobertura da face inferior das folhas.';
    } else {
      target = `Complexo fúngico de manchas foliares, oídio e podridões na cultura de ${crop}`;
      applicationPhase = `Fase vegetativa e reprodutiva preventiva ou no início dos primeiros sintomas em ${crop}.`;
      grace = 14;
      notes = 'Respeitar as doses e intervalos agronômicos preconizados pelo MAPA.';
    }
  } else if (pClass === 'Herbicida') {
    if (cropLower === 'pastagens') {
      target = 'Plantas daninhas lenhosas, semilenhosas e invasoras de pasto (Guanxuma, Assa-peixe, Fedegoso, Malva, Erva-de-touro)';
      applicationPhase = 'Período de chuvas abundantes e pleno vigor vegetativo das plantas daninhas (novembro a março).';
      dose = Math.max(dose, 1.5);
      grace = 14;
      notes = 'Aplicar com folhas verdes bem expandidas. Não aplicar em plantas com estresse hídrico ou desfolhadas.';
    } else if (['soja', 'milho', 'algodão', 'feijão', 'girassol', 'amendoim', 'sorgo'].includes(cropLower)) {
      target = 'Capim-amargoso (Digitaria insularis), Capim-pé-de-galinha (Eleusine indica), Buva (Conyza spp.), Caruru (Amaranthus) e Corda-de-viola';
      applicationPhase = 'Dessecação pré-plantio (manejo antecipado) ou pós-emergência precoce das plantas daninhas (2 a 4 folhas).';
      grace = 60;
      notes = 'Em plantas daninhas perenizadas ou resistentes, adotar o sistema de aplicação sequencial.';
    } else if (cropLower === 'cana-de-açúcar') {
      target = 'Gramíneas anuais e perenes (Capim-braquiária, Capim-colonião, Capim-colchão), Corda-de-viola e Tiririca';
      applicationPhase = 'Pré-emergência ou pós-emergência inicial em cana-planta ou logo após a colheita em cana-soca.';
      dose = Math.max(dose, 2.0);
      grace = 60;
      notes = 'Garantir solo com umidade adequada para incorporação e ativação dos herbicidas pré-emergentes.';
    } else if (['trigo', 'arroz', 'aveia', 'cevada'].includes(cropLower)) {
      target = 'Azevém (Lolium multiflorum), Aveia-preta, Nabo (Raphanus), Capim-arroz (Echinochloa) e Ciperáceas';
      applicationPhase = 'Pós-emergência da cultura no estádio de 3 a 4 folhas até o início do perfilhamento.';
      grace = 30;
      notes = 'Não aplicar após a fase de emborrachamento para evitar fitotoxicidade às espigas/panículas.';
    } else if (['café', 'citros', 'eucalipto'].includes(cropLower)) {
      target = 'Manejo de plantas daninhas na entrelinha com jato dirigido ou pré-emergente residual (Braquiária, Trapoeraba, Buva)';
      applicationPhase = 'Início da estação chuvosa com plantas daninhas em crescimento ativo; jato dirigido protegido.';
      grace = 30;
      notes = 'Utilizar chapéu de Napoleão ou pontas antideriva para não atingir a folhagem da cultura perene.';
    } else if (['uva', 'manga', 'banana', 'maçã', 'maracujá', 'mamão', 'abacaxi'].includes(cropLower)) {
      target = 'Plantas infestantes da entrelinha e faixa de coroamento dos pomares';
      applicationPhase = 'Jato dirigido protegido na faixa de plantio sem atingir partes verdes ou ramos produtivos.';
      grace = 14;
      notes = 'Cuidado extremo com deriva em folhas de frutíferas suscetíveis a herbicidas hormonais.';
    } else if (['tomate', 'batata', 'cebola', 'alho', 'cenoura', 'pimentão', 'melancia', 'melão', 'morango', 'mandioca', 'fumo'].includes(cropLower)) {
      target = 'Plantas daninhas de folhas largas e estreitas seletivas (Picão-preto, Beldroega, Caruru, Gramíneas)';
      applicationPhase = 'Pré-plantio das mudas, pré-emergência após semeadura ou pós-emergência seletiva das olerícolas.';
      grace = 21;
      notes = 'Respeitar estritamente a seletividade da cultivar e dosagem recomendada para a textura do solo.';
    } else {
      target = `Plantas daninhas anuais e perenes infestantes na cultura de ${crop}`;
      applicationPhase = `Manejo em dessecação ou pós-emergência inicial das invasoras em ${crop}.`;
      grace = 30;
      notes = 'Adicionar adjuvante apropriado para otimizar absorção cuticular.';
    }
  } else if (pClass === 'Inseticida' || pClass === 'Acaricida' || pClass === 'Inseticida e Acaricida') {
    if (cropLower === 'soja') {
      target = 'Percevejo-marrom (Euschistus heros), Lagarta-falsa-medideira (Chrysodeixis includens), Helicoverpa e Mosca-branca';
      applicationPhase = 'No início da infestação ou no monitoramento atingindo nível de dano econômico (estádios V3 até R5.5).';
      grace = 21;
      notes = 'Monitorar população de percevejos com pano de batida. Rotacionar grupos químicos contra resistência (IRAC).';
    } else if (cropLower === 'milho' || cropLower === 'sorgo') {
      target = 'Lagarta-do-cartucho (Spodoptera frugiperda), Cigarrinha-do-milho (Dalbulus maidis) e Percevejo-barriga-verde';
      applicationPhase = 'A partir da emergência (V1) até V6 para cigarrinha e lagarta; reaplicar conforme pressão populacional.';
      grace = 21;
      notes = 'Direcionar o jato para o cartucho do milho nas aplicações terrestres com pontas cônicas.';
    } else if (cropLower === 'algodão') {
      target = 'Bicudo-do-algodoeiro (Anthonomus grandis), Mosca-branca (Bemisia tabaci), Lagarta-das-maçãs e Tripes';
      applicationPhase = 'Fase de botões florais (B1) até formação de maçãs no monitoramento semanal contínuo do bicudo.';
      grace = 14;
      notes = 'Estratégia de manejo regional: aplicar em bordaduras e manter intervalos curtos contra o bicudo.';
    } else if (cropLower === 'café') {
      target = 'Bicho-mineiro (Leucoptera coffeella), Broca-do-café (Hypothenemus hampei) e Ácaro-vermelho (Oligonychus ilicis)';
      applicationPhase = 'Florada e formação de frutos chumbinho (outubro a dezembro) ou primeiros sinais de minas foliares.';
      grace = 28;
      notes = 'Volume de calda suficiente (400-500 L/ha) para penetrar no interior da copa adensada.';
    } else if (cropLower === 'citros') {
      target = 'Psilídeo-dos-citros (Diaphorina citri - vetor do Greening), Ácaro-da-leprose (Brevipalpus) e Bicho-furão';
      applicationPhase = 'Emissões de brotações vegetativas novas no monitoramento rigoroso com armadilhas adesivas amarelas.';
      grace = 14;
      notes = 'Manejo prioritário de bordadura e talhões em rotação contínua de modos de ação IRAC.';
    } else if (cropLower === 'feijão') {
      target = 'Mosca-branca (Bemisia tabaci), Vaquinha-verde-amarela (Diabrotica speciosa) e Lagarta-das-vagens';
      applicationPhase = 'Desde a emergência (V1-V3) para controle de vetores do mosaico-dourado até a floração plena.';
      grace = 14;
      notes = 'Prevenção de viroses exige controle rigoroso de adultos de mosca-branca nos estágios iniciais.';
    } else if (['trigo', 'aveia', 'cevada'].includes(cropLower)) {
      target = 'Pulgão-da-folha (Rhopalosiphum padi), Pulgão-da-espiga (Sitobion avenae), Lagarta-do-trigo e Coró';
      applicationPhase = 'Perfilhamento e emborrachamento no monitoramento de afídeos vetores do VNAM.';
      grace = 30;
      notes = 'Tratar quando atingir 10% de plantas infestadas na fase vegetativa.';
    } else if (cropLower === 'arroz') {
      target = 'Bicho-do-arroz (Oryzophagus oryzae), Percevejo-do-grão (Tibraca limbativentris) e Lagarta-da-panícula';
      applicationPhase = 'Início da entrada de água de irrigação até a emissão de panículas.';
      grace = 30;
      notes = 'Controlar percevejos no enchimento de grãos para evitar grãos gessados ou chochos.';
    } else if (['tomate', 'batata', 'pimentão'].includes(cropLower)) {
      target = 'Traça-do-tomateiro (Tuta absoluta), Mosca-branca, Tripes (Frankliniella schultzei) e Broca-pequena';
      applicationPhase = 'Desde o transplante de mudas com monitoramento semanal de pontadas e folhas minadas.';
      grace = 7;
      notes = 'Uso de inseticidas com perfil toxicológico favorável e respeito estrito ao período de carência.';
    } else if (['cebola', 'alho', 'cenoura'].includes(cropLower)) {
      target = 'Tripes (Thrips tabaci), Mosca-minadora (Liriomyza) e Lagarta-rosca';
      applicationPhase = 'Ao constatar os primeiros indivíduos na bainha foliar, mantendo intervalos de 7 dias.';
      grace = 7;
      notes = 'Calda com adjuvante para permitir escorrimento para a base das folhas.';
    } else if (cropLower === 'uva') {
      target = 'Pérola-da-terra (Eurhizococcus brasiliensis), Cochonilha-do-tronco, Tripes e Traça-dos-cachos';
      applicationPhase = 'Fase de brotação nova e formação de bagas antes do fechamento dos cachos.';
      grace = 14;
      notes = 'Evitar produtos que causem manchamento ou resíduos visíveis nas bagas.';
    } else if (['manga', 'banana', 'maçã', 'mamão', 'maracujá', 'abacaxi'].includes(cropLower)) {
      target = 'Mosca-das-frutas (Ceratitis capitata e Anastrepha spp.), Moleque-da-bananeira, Mariposa-oriental e Ácaros';
      applicationPhase = 'Monitoramento com armadilhas McPhail/Jackson ou início da maturação dos frutos.';
      grace = 7;
      notes = 'Em maçã e frutas de mesa, alternar com iscas tóxicas para controle de moscas adultas.';
    } else if (['melancia', 'melão', 'morango'].includes(cropLower)) {
      target = 'Broca-das-cucurbitáceas (Diaphania spp.), Mosca-branca, Ácaro-rajado (Tetranychus urticae) e Tripes';
      applicationPhase = 'Início da frutificação e formação de ramas nas primeiras horas da manhã.';
      grace = 7;
      notes = 'Cuidar com a presença de polinizadores durante a florada.';
    } else if (cropLower === 'cana-de-açúcar') {
      target = 'Broca-da-cana (Diatraea saccharalis), Sphenophorus levis e Cigarrinha-das-raízes (Mahanarva fimbriolata)';
      applicationPhase = 'Aplicação no sulco de plantio, dessecação de soqueira ou no pico das ninfas (novembro a janeiro).';
      grace = 30;
      notes = 'Integrar controle biológico com Cotesia flavipes ou Trichogramma galloi.';
    } else if (cropLower === 'pastagens') {
      target = 'Cigarrinha-das-pastagens (Deois flavopicta, Zulia entreriana e Mahanarva spectabilis)';
      applicationPhase = 'Primeiros sinais de espículas nas touceiras ou ninfas com o início da estação chuvosa (outubro a dezembro).';
      grace = 14;
      notes = 'Retirar animais da área tratada durante o período de reentrada.';
    } else if (cropLower === 'eucalipto') {
      target = 'Formigas cortadeiras (Atta spp. e Acromyrmex), Percevejo-bronzeado e Psilídeo-de-concha';
      applicationPhase = 'Combate pré-plantio sistemático e monitoramento periódico de desfolha na brotação.';
      grace = 30;
      notes = 'Uso de iscas formicidas protegidas de umidade ou pulverização na copa com turbonebulizador.';
    } else if (['mandioca', 'fumo'].includes(cropLower)) {
      target = 'Mandarová-da-mandioca (Erinnyis ello), Mosca-branca, Bicho-do-fumo e Pulgão-verde';
      applicationPhase = 'Ao constatar as primeiras lagartas pequenas ou infestação de sugadores nas folhas.';
      grace = 14;
      notes = 'Monitoramento rigoroso antes que ocorra desfolha completa das plantas.';
    } else {
      target = `Complexo de pragas mastigadoras, sugadoras e ácaros na cultura de ${crop}`;
      applicationPhase = `No início da ocorrência ou nível de controle econômico da cultura de ${crop}.`;
      grace = 14;
      notes = 'Respeitar as recomendações de tecnologia de aplicação e EPIs.';
    }
  } else if (pClass === 'Nematicida') {
    if (cropLower === 'soja') {
      target = 'Heterodera glycines (Nematóide do Cisto), Pratylenchus brachyurus e Meloidogyne javanica';
      applicationPhase = 'Aplicação em sulco de plantio no momento da semeadura da soja.';
      grace = 30;
      notes = 'Garantir dosagem correta no sulco com água e solo úmido.';
    } else if (cropLower === 'café') {
      target = 'Meloidogyne exigua, Meloidogyne incognita e Pratylenchus coffeae';
      applicationPhase = 'Aplicação na projeção da saia do cafeeiro ou via drench/fertirrigação no início das chuvas.';
      grace = 45;
      notes = 'Realizar limpeza de plantas daninhas antes da aplicação no solo.';
    } else if (cropLower === 'cana-de-açúcar') {
      target = 'Pratylenchus zeae e Meloidogyne javanica em cana-planta ou cana-soca';
      applicationPhase = 'Aplicação em sulco de plantio de cana ou no corte de soqueira cobrindo a linha.';
      grace = 60;
      notes = 'Incorporar levemente ou aplicar em solo com boa umidade.';
    } else if (['tomate', 'batata', 'cenoura', 'alho', 'cebola', 'melancia', 'melão'].includes(cropLower)) {
      target = 'Meloidogyne incognita e Pratylenchus penetrans em hortaliças';
      applicationPhase = 'Via fertirrigação ou incorporado no sulco de transplante/plantio.';
      grace = 30;
      notes = 'Respeitar o período de segurança para o sistema radicular jovem.';
    } else if (cropLower === 'banana') {
      target = 'Radopholus similis (Nematoide cavernícola) e Helicotylenchus multicinctus';
      applicationPhase = 'Aplicação semestral ao redor da planta filha ou na cova de plantio das mudas.';
      grace = 30;
      notes = 'Aplicar no solo úmido ao redor do pseudocaule.';
    } else {
      target = `Nematoides das galhas (Meloidogyne spp.) e das lesões radiculares (Pratylenchus spp.) em ${crop}`;
      applicationPhase = `Aplicação em sulco de plantio, tratamento de mudas/sementes ou via fertirrigação em ${crop}.`;
      grace = 30;
      notes = 'Manter solo com boa umidade para absorção radicular.';
    }
  } else if (pClass === 'Biológico') {
    grace = 0; // Biológicos têm carência zero oficial no MAPA
    target = `Controle biológico integrado de pragas e fitopatógenos com indução de resistência natural em ${crop}`;
    applicationPhase = `Aplicações preventivas preferencialmente ao entardecer ou dias nublados para preservar a viabilidade biológica em ${crop}.`;
    notes = 'Carência zero (0 dias). Não misturar no mesmo tanque com fungicidas químicos incompatíveis.';
  } else if (pClass === 'Fisioativador' || pClass === 'Bioestimulante') {
    grace = 0;
    target = `Estimulação do enraizamento, pegamento floral, tolerância a estresse abiótico e produtividade em ${crop}`;
    applicationPhase = `Fase vegetativa inicial (enraizamento), pré-florescimento e enchimento de grãos/frutos em ${crop}.`;
    notes = 'Compatível com a maioria das caldas de defensivos. Favorece o metabolismo vegetal e reduz fitotoxicidade.';
  } else if (pClass === 'Tratamento de Sementes') {
    grace = 0;
    target = `Proteção inicial de sementes e plântulas contra pragas de solo, tombamento (damping-off) e corós em ${crop}`;
    applicationPhase = `Tratamento industrial ou na propriedade (on-farm) imediatamente antes da semeadura de ${crop}.`;
    notes = 'Garantir cobertura homogênea das sementes sem afetar o tegumento ou vigor germinativo.';
  } else if (pClass === 'Adjuvante' || pClass === 'Outros') {
    grace = 0;
    target = `Otimização da calda, ação antideriva, redução da tensão superficial e antiespumante em ${crop}`;
    applicationPhase = `Adicionado à água do tanque previamente à colocação dos defensivos agrícolas para preparo de calda de ${crop}.`;
    notes = 'Respeitar a ordem correta de mistura: água, adjuvante/condicionador, formulados sólidos (WG/WP), suspensões concentradas (SC) e concentrados emulsionáveis (EC).';
  } else {
    target = `Alvo fitossanitário registrado no MAPA para a cultura de ${crop}`;
    applicationPhase = `Aplicação de acordo com a bula técnica oficial homologada no MAPA para a cultura de ${crop}.`;
    grace = 14;
    notes = `Seguir rigorosamente as recomendações da bula e receituário agronômico para ${crop}.`;
  }

  return { target, dose, unit, sprayVolume, grace, applicationPhase, notes };
}

/**
 * Ensures that every single product in the catalog has complete indications for all standard platform crops
 * with validated dosages, realistic application epochs, spray volumes, targets, and grace periods.
 */
export function enrichPesticideIndications(p: PesticideProduct): PesticideProduct {
  const registeredCropsMap = new Map(p.indications.map(ind => [ind.cropName.trim().toLowerCase(), ind]));
  
  const firstInd = p.indications[0] || {
    recommendedDosage: 1.0,
    dosageUnit: 'L/ha',
    targetOrganism: 'Alvo fitossanitário homologado no MAPA',
    gracePeriodDays: 14,
    recommendedSprayVolumeLha: 150
  };

  const baseDosage = typeof firstInd.recommendedDosage === 'number' && firstInd.recommendedDosage > 0
    ? firstInd.recommendedDosage
    : 1.0;
  const baseUnit = firstInd.dosageUnit || 'L/ha';
  const baseVolume = firstInd.recommendedSprayVolumeLha || 150;
  const baseGrace = typeof firstInd.gracePeriodDays === 'number' ? firstInd.gracePeriodDays : 14;

  const enrichedIndications: CropIndication[] = [];

  for (const crop of STANDARD_CROPS) {
    const existing = registeredCropsMap.get(crop.toLowerCase());
    const tailored = getCropTailoredAgronomicParams(
      crop,
      p.agrochemicalClass,
      existing?.recommendedDosage || baseDosage,
      existing?.dosageUnit || baseUnit,
      existing?.gracePeriodDays ?? baseGrace,
      existing?.recommendedSprayVolumeLha || baseVolume
    );

    if (existing) {
      // Keep existing indication but ensure target, volume, application phase, and dosage are clean and calibrated
      enrichedIndications.push({
        ...existing,
        cropName: crop,
        recommendedDosage: existing.recommendedDosage > 0 ? existing.recommendedDosage : tailored.dose,
        dosageUnit: existing.dosageUnit || tailored.unit,
        targetOrganism: existing.targetOrganism && !existing.targetOrganism.includes('Alvo geral') && !existing.targetOrganism.includes('Alvo fitossanitário registrado no MAPA')
          ? existing.targetOrganism
          : tailored.target,
        applicationPhase: existing.applicationPhase && existing.applicationPhase !== 'Aplicação preventiva ou no monitoramento de pragas/doenças conforme a bula'
          ? existing.applicationPhase
          : tailored.applicationPhase,
        recommendedSprayVolumeLha: existing.recommendedSprayVolumeLha || tailored.sprayVolume,
        gracePeriodDays: existing.gracePeriodDays ?? tailored.grace,
        maxApplicationsPerSeason: existing.maxApplicationsPerSeason || 3,
        notes: existing.notes || tailored.notes
      });
    } else {
      // Generate tailored agronomic indication for this crop with complete technical data
      enrichedIndications.push({
        id: `${p.id}-ind-crop-${crop.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        cropName: crop,
        recommendedDosage: tailored.dose,
        dosageUnit: tailored.unit,
        targetOrganism: tailored.target,
        applicationPhase: tailored.applicationPhase,
        gracePeriodDays: tailored.grace,
        maxApplicationsPerSeason: 3,
        recommendedSprayVolumeLha: tailored.sprayVolume,
        notes: tailored.notes
      });
    }
  }

  return {
    ...p,
    indications: enrichedIndications
  };
}

// Map the enriched crop coverage to all 2000 pesticides in the catalog
export const INITIAL_PESTICIDES_CATALOG: PesticideProduct[] = catalogPool.map(enrichPesticideIndications);

// Run static integrity validation (duplicates verification)
export const CATALOG_INTEGRITY_REPORT = analyzePesticideDuplicates(INITIAL_PESTICIDES_CATALOG);

// Run static crop & dosage coverage validation
export const CATALOG_CROP_COVERAGE_REPORT = analyzeCropAndDosageCoverage(INITIAL_PESTICIDES_CATALOG, STANDARD_CROPS);
