export interface ForageSanityArticle {
  id: string;
  name: string;
  scientificName: string;
  agentType: 'Fungo' | 'Praga' | 'Complexo Patológico' | 'Distúrbio Metabólico' | 'Nematoide';
  affectedForages: string[];
  severityLevel: 'Crítica' | 'Alta' | 'Média' | 'Moderada';
  favorableConditions: string;
  symptoms: string[];
  damageDescription: string;
  integratedManagement: {
    cultural: string[];
    genetic: string[];
    biological: string[];
    chemical: string[];
  };
  fieldDiagnosticTips: string;
}

export const FORAGE_SANITY_GUIDE: ForageSanityArticle[] = [
  {
    id: 'morte_braquiarao',
    name: 'Síndrome da Morte do Braquiarão',
    scientificName: 'Complexo Pythium spp., Rhizoctonia solani, Fusarium spp. + Hipóxia Radicular',
    agentType: 'Complexo Patológico',
    affectedForages: ['Urochloa brizantha cv. Marandu', 'Urochloa brizantha cv. Xaraés', 'Urochloa decumbens'],
    severityLevel: 'Crítica',
    favorableConditions: 'Solos com drenagem lenta, excesso de chuvas, compactação de solo, lençol freático superficial.',
    symptoms: [
      'Amarelecimento inicial das folhas mais velhas em reboleiras',
      'Evolução para coloração arroxeada e seca completa da folhagem',
      'Necrose e podridão total do sistema radicular e colmo basal',
      'Morte súbita e irreversível das touceiras',
    ],
    damageDescription: 'Dizimação completa de hectares de pastagens de Marandu, forçando a reforma imediata da área com alto custo financeiro.',
    integratedManagement: {
      cultural: [
        'Descompactação mecânica do solo com escarificador/subsolador',
        'Construção de drenos e curvas de nível para escoamento das águas superficiais',
        'Evitar o superpastoreio e pisoteio excessivo em solos úmidos',
      ],
      genetic: [
        'Substituição do capim Marandu por cultivares resistentes a solos úmidos: BRS Tupi, Humidícola Comum, BRS Zuri, Setária Kazungula ou BRS Piatã em drenagem intermediária',
      ],
      biological: [
        'Aplicação de Trichoderma harzianum e Bacillus subtilis no sulco de semeadura na renovação do pasto',
      ],
      chemical: [
        'Não há controle químico fungicida economicamente viável a campo para áreas de pastagem',
      ],
    },
    fieldDiagnosticTips: 'Arranque uma touceira afetada: raízes podres com cheiro característico de decomposição e desprendimento fácil da casca confirmam a síndrome.',
  },
  {
    id: 'cigarrinhas_tipicas',
    name: 'Cigarrinhas-das-Pastagens (Típicas)',
    scientificName: 'Notozulia entreriana e Deois flavopicta',
    agentType: 'Praga',
    affectedForages: ['Urochloa decumbens', 'Urochloa ruziziensis', 'Urochloa brizantha cv. Paiaguás (moderado)', 'Cenchrus purpureus'],
    severityLevel: 'Alta',
    favorableConditions: 'Início do período chuvoso (outubro a dezembro), temperaturas entre 24°C e 30°C, pastos altos com acúmulo de palha úmida.',
    symptoms: [
      'Presença de massa espumosa branca na base dos perfilhos abrigando as ninfas',
      'Manchas cloróticas amarelas lineares nas folhas causadas por toxinas injetadas pelos adultos',
      'Seca prematura da folhagem ("queima das folhas"), assemelhando-se a geada',
      'Pasto fibroso, sem folhas verdes e rejeitado pelo gado',
    ],
    damageDescription: 'Redução de até 80% na produção de matéria seca e drástica diminuição no teor de proteína bruta e ganho de peso.',
    integratedManagement: {
      cultural: [
        'Pastejo mais intensivo no início das chuvas para rebaixar o pasto e aumentar a incidência solar na base, desidratando a espuma das ninfas',
        'Evitar pastos "passados" e superacumulados no início da estação chuvosa',
      ],
      genetic: [
        'Utilização de gramíneas com resistência antibiótica comprovada: BRS Ipyporã, Marandu, BRS Piatã, Andropogon e Panicum (Zuri, Mombaça, Quênia)',
      ],
      biological: [
        'Pulverização aérea ou terrestre do fungo entomopatogênico Metarhizium anisopliae (mínimo de 1x10^12 conídios viáveis/ha) em dias nublados',
      ],
      chemical: [
        'Inseticidas químicos registrados no MAPA (Neonicotinoides + Piretroides) quando a população de ninfas ultrapassar o nível de dano econômico (25 a 30 ninfas/m²)',
      ],
    },
    fieldDiagnosticTips: 'Caminhe no pasto sacudindo a forragem nas primeiras horas da manhã. Conte as espumas por metro quadrado com auxílio de um aro de 0,25 m².',
  },
  {
    id: 'cigarrinha_cana',
    name: 'Cigarrinha-da-Cana em Pastagens',
    scientificName: 'Mahanarva fimbriolata / Mahanarva spectabilis',
    agentType: 'Praga',
    affectedForages: ['Cenchrus purpureus (Capiaçu / Kurumi)', 'Megathyrsus maximus (Mombaça / Paredão)', 'Urochloa brizantha cv. Marandu (suscetível a Mahanarva)'],
    severityLevel: 'Alta',
    favorableConditions: 'Alta umidade, canaviais vizinhos, pastagens com touceiras muito volumosas e densas.',
    symptoms: [
      'Espuma abundante nos nós dos colmos e na base da planta',
      'Adultos maiores (12 a 15 mm) com faixas avermelhadas ou alaranjadas marcantes',
      'Queima foliar rápida com estrias necróticas longitudinais avermelhadas/castanhas',
    ],
    damageDescription: 'Ataca até mesmo cultivares que são resistentes às cigarrinhas típicas (como o Marandu e Mombaça), provocando perda substancial de capineiras e piquetes intensivos.',
    integratedManagement: {
      cultural: [
        'Manejo de pastejo rotacionado impedindo o acúmulo excessivo de material senescente',
        'Eliminação de resíduos e corte rente das capineiras',
      ],
      genetic: [
        'Adoção da nova cultivar BRS Ipyporã (única braquiária com resistência comprovada tanto a Notozulia/Deois quanto a Mahanarva)',
      ],
      biological: [
        'Aplicação de Metarhizium anisopliae na dose de 5x10^12 conídios/ha ao primeiro sinal de emergência dos adultos',
      ],
      chemical: [
        'Aplicação dirigida de tiametoxam + lambda-cialotrina em capineiras de Capiaçu e Kurumi severamente infestadas',
      ],
    },
    fieldDiagnosticTips: 'Ao contrário das cigarrinhas comuns, as ninfas de Mahanarva conseguem produzir espuma a até 30 cm de altura sobre os colmos do capim-elefante e do capim-mombaça.',
  },
  {
    id: 'mancha_bipolaris',
    name: 'Mancha Foliar por Bipolaris',
    scientificName: 'Bipolaris maydis (Teleomorfo: Cochliobolus heterostrophus)',
    agentType: 'Fungo',
    affectedForages: ['Megathyrsus maximus cv. Tanzânia-1', 'Megathyrsus maximus cv. Mombaça (moderado)', 'Milheto'],
    severityLevel: 'Alta',
    favorableConditions: 'Temperaturas elevadas (28-32°C), alta umidade relativa (>85%), dias nublados e chuvosos contínuos.',
    symptoms: [
      'Pequenas lesões castanho-escuras que evoluem para manchas elípticas alongadas de centro cinza e halo amarelado',
      'Coalescência das manchas gerando queima generalizada das folhas',
      'Seca precoce do terço médio e superior da planta',
    ],
    damageDescription: 'Causa perdas de até 40% da biomassa e reduz severamente a digestibilidade e o ganho de peso em rebanhos leiteiros.',
    integratedManagement: {
      cultural: [
        'Manter adubação equilibrada com ênfase no Potássio (K) e Silício (Si), que fortalecem a parede celular',
        'Evitar o pastejo em excesso que debilite o vigor da rebrota',
      ],
      genetic: [
        'Substituição do capim Tanzânia pelas cultivares BRS Zuri, BRS Quênia ou BRS Tamani, que possuem alta imunidade genética ao patógeno',
      ],
      biological: [
        'Indução de resistência com biofertilizantes e extratos de algas',
      ],
      chemical: [
        'Geralmente inviável economicamente em pastoreio extensivo, reservado a campos de produção de sementes',
      ],
    },
    fieldDiagnosticTips: 'Observe as lesões contra a luz do sol: o halo amarelado translúcido circundando a necrose central é típico de toxinas produzidas por Bipolaris.',
  },
  {
    id: 'fotossensibilizacao',
    name: 'Fotossensibilização Hepatógena / Eczema Facial',
    scientificName: 'Pithomyces chartarum (Toxina Esporidesmina)',
    agentType: 'Distúrbio Metabólico',
    affectedForages: ['Urochloa decumbens cv. Basilisk', 'Urochloa brizantha cv. Marandu (em menor escala)', 'Ovinos, caprinos e bezerros jovens'],
    severityLevel: 'Crítica',
    favorableConditions: 'Acúmulo de forragem morta e palhada úmida na base do pasto durante o outono após períodos quentes e chuvosos.',
    symptoms: [
      'Lesão hepática silenciosa provocada pela ingestão de esporos contendo esporidesmina',
      'Incapacidade do fígado de excretar a filoeritrina (metabólito da clorofila)',
      'Inchaço doloroso de cabeça, pálpebras, orelhas e focinho em animais brancos ou desprovidos de pigmento',
      'Necrose e desprendimento de placas de pele, cegueira, emagrecimento severo e morte',
    ],
    damageDescription: 'Altíssima mortalidade em lotes de ovinos e bezerros desmamados colocados em pastos passados de Urochloa decumbens.',
    integratedManagement: {
      cultural: [
        'Evitar a criação de ovinos e bezerros jovens desmamados em pastagens exclusivas de Urochloa decumbens',
        'Roçar ou vedar pastos com alta camada de palha morta decompondo-se',
        'Fornecer sombra abundante nos piquetes',
      ],
      genetic: [
        'Utilizar grama Pensacola, Tifton 85, BRS Tamani ou Azevém para rebanhos ovinos e bezerreiros',
      ],
      biological: [
        'Suplementação mineral reforçada com Zinco (óxido de zinco previne danos hepáticos da esporidesmina)',
      ],
      chemical: [
        'Retirar os animais afetados para o curral com sombra e dieta sem clorofila verde (feno e concentrado), aplicando anti-inflamatórios e protetores hepáticos',
      ],
    },
    fieldDiagnosticTips: 'Contagem de esporos de Pithomyces no laboratório: níveis acima de 100.000 esporos/grama de palha indicam perigo iminente de surto.',
  },
  {
    id: 'lagartas_pastagens',
    name: 'Lagartas-das-Pastagens e Curuquerê-dos-Capinzais',
    scientificName: 'Mocis latipes e Spodoptera frugiperda',
    agentType: 'Praga',
    affectedForages: ['Todas as gramíneas tropicais e temperadas (especialmente Tifton 85, Aveia, Milheto, Brachiaria e Panicum)'],
    severityLevel: 'Alta',
    favorableConditions: 'Períodos de veranico seguidos de chuvas rápidas, temperaturas altas, ausência de inimigos naturais.',
    symptoms: [
      'Folhas com bordas recortadas e destruição rápida do limbo foliar em reboleiras',
      'Lagartas de cor verde, parda ou cinzenta com listras dorsais deslocando-se em exército',
      'Em ataques severos, resta apenas a nervura central dos capins',
    ],
    damageDescription: 'Consumo voraz de centenas de hectares em 48 a 72 horas, deixando o rebanho sem alimento disponível.',
    integratedManagement: {
      cultural: [
        'Monitoramento semanal dos pastos no verão',
        'Entrada com lotação pesada para aproveitar a forragem antes da destruição total se o ataque for generalizado',
      ],
      genetic: [
        'Forrageiras com rápida capacidade de rebrota (Piatã, Tifton 85)',
      ],
      biological: [
        'Pulverização com Bacillus thuringiensis (Bt) ou Baculovirus spodoptera na fase de lagartas pequenas (<1 cm)',
        'Preservação de pássaros e tesourinhas predadoras',
      ],
      chemical: [
        'Aplicação de reguladores de crescimento (Lufenuron, Diflubenzuron) ou piretroides registrados com respeito ao período de carência para pastejo',
      ],
    },
    fieldDiagnosticTips: 'Inspecione a base do capim ao entardecer: as lagartas sobem para se alimentar principalmente no final da tarde e durante a noite.',
  },
];
