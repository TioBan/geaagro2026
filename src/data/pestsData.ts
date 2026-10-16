import { PestSpecies, PestField, NaturalEnemy, PopulationTrend, PestInspection } from '../types/pests';

export const PEST_SPECIES_CATALOG: PestSpecies[] = [
  {
    id: 'spodoptera_frugiperda',
    scientificName: 'Spodoptera frugiperda',
    commonName: 'Lagarta-do-cartucho / Lagarta-da-espiga',
    order: 'Lepidoptera',
    family: 'Noctuidae',
    classificationDetails: 'Subfamília Amphipyrinae. Espécie polífaga de alta plasticidade genômica com biótipos "Milho" e "Arroz".',
    biologicalCycle: '28 a 35 dias (dependente de temperatura). Ovo (3-5d), Larva 6 instares (14-22d), Pupa no solo (8-12d), Adulto (10-14d).',
    cycleDetails: {
      eggDays: '3 a 5 dias (posturas sobrepostas de 100 a 300 ovos recobertos por escamas).',
      nymphOrLarvaDays: '14 a 22 dias (passa por 6 instares instar de canibalismo intenso no cartucho).',
      pupaDays: '8 a 12 dias (no solo em câmara pupal a 2-5 cm de profundidade).',
      adultDays: '10 a 14 dias (mariposa noturna com alta capacidade migratória de até 500 km).',
      totalCycleDays: '30 dias a 25°C',
      reproductionInfo: 'Fêmea oviposita entre 1.000 e 2.000 ovos durante o ciclo adulto.'
    },
    hosts: ['Milho', 'Soja', 'Algodão', 'Feijão'],
    otherHosts: ['Sorgo', 'Arroz', 'Trigo', 'Cana-de-açúcar', 'Pastagens (Brachiaria)', 'Gergelim'],
    geographicalDistribution: 'América Latina, EUA e invasora na África e Ásia Tropical.',
    damage: 'Raspagem foliar (1º instar), perfuração e destruição do cartucho do milho com fezes úmidas, corte de plântulas na base (efeito rosca), perfuração de maçãs/botões florais no algodão e desfolha/ataque de vagens na soja e feijão.',
    economicDamageDetails: {
      directDamage: 'Destruição do ponto de crescimento no milho (corocó), perfuração de espigas e maçãs do algodão.',
      indirectDamage: 'Entrada de fungos micotoxicogênicos (Fusarium verticillioides e Aspergillus flavus) na espiga.',
      yieldLossPercentage: 'Redução de produtividade de 20% a 60% no milho e até 40% no algodoeiro se não controlada.',
      vectorDiseases: 'Facilita infecção por Podridão-da-espiga e mofos que geram aflatoxinas.'
    },
    etiologyBioecology: 'Desenvolvimento favorecido por temperaturas entre 25°C e 30°C e períodos secos. As mariposas fêmeas preferem plantas jovens (V2 a V8). Pupação ocorre no solo.',
    controlMethods: {
      chemical: 'Inseticidas diamidas antranílicas (Chlorantraniliprole, Flubendiamide), espinosinas (Spinetoram, Spinosad), oxadiazinas (Indoxacarbe) e reguladores de crescimento (Lufenuron, Novaluron). Rotação obrigatória de Modo de Ação (IRAC).',
      physical: 'Uso de armadilhas luminosas e de feromônio sintético para monitoramento e supressão de adultos.',
      cultural: 'Manejo de área de refúgio efetivo (mínimo 10% com milho não-Bt), destruição de plantas voluntárias (tiguera), época concentrada de semeadura e rotação de culturas.',
      biological: 'Liberação inundativa de Trichogramma pretiosum (parasitoide de ovos), Doru luteipes (tesourinha predadora), Baculovirus spodoptera (SfMNPV) e Bacillus thuringiensis (Bt) em pulverização.'
    },
    nutritionalRelations: 'Adubação nitrogenada em excesso eleva os teores de aminoácidos livres e nitrato nas folhas jovens, acelerando o desenvolvimento larval e o número de posturas. A suplementação com Silício (Si) aumenta o depósito de opala nas paredes celulares, causando desgaste das mandíbulas das larvas de 1º e 2º instares e reduzindo o consumo foliar.',
    criticalPeriods: ['V2 a V8 (Milho)', 'Emergência a V4 (Soja/Feijão)', 'Botoamento a Maçãs (Algodão)'],
    naturalEnemies: ['Trichogramma pretiosum', 'Doru luteipes', 'Baculovirus spodoptera', 'Campoletis flavicincta', 'Ectatomma brunneum'],
    monitoringMethods: 'Inspeção visual semanal em 20 pontos por talhão (5 plantas/ponto). Avaliar escala de Davis (1 a 9). Monitoramento de mariposas com armadilhas de feromônio (Delta).',
    managementStrategies: 'Uso de biotecnologia Bt (Vip3Aa) associada a refúgio, pulverização biológica com SfMNPV no início do surgimento de folhas raspadas (escala Davis 2) e rotação de químicos.',
    actionThresholds: [
      { stage: 'Milho (Vegetativo V2-V8)', threshold: 20, unit: '% de plantas com nota >= 3 na escala Davis (folhas raspadas)' },
      { stage: 'Soja / Feijão (Vegetativo)', threshold: 20, unit: '% de desfolha ou 2 lagartas > 1.5 cm/m' },
      { stage: 'Algodão (Reprodutivo)', threshold: 5, unit: '% de plantas com lagartas em botões/maçãs' }
    ]
  },
  {
    id: 'euschistus_heros',
    scientificName: 'Euschistus heros',
    commonName: 'Percevejo-marrom-da-soja',
    order: 'Hemiptera',
    family: 'Pentatomidae',
    classificationDetails: 'Subfamília Pentatominae. Hemíptero fitófago sugador de sementes e vagens com alta tolerância a estresse térmico.',
    biologicalCycle: '28 a 40 dias. Ovo (5-8d), Ninfa 5 instares (20-28d), Adulto com longevidade de até 100 dias.',
    cycleDetails: {
      eggDays: '5 a 8 dias (ovos amarelos dispostos em pequenas massas de 5 a 15 ovos nas folhas/vagens).',
      nymphOrLarvaDays: '20 a 28 dias (1º instar gregário sem alimentação; danos a partir do 3º instar).',
      pupaDays: 'Inexistente (Inseto hemimetábolo).',
      adultDays: '60 a 110 dias (entrando em diapausa na palhada durante o inverno/entressafra).',
      totalCycleDays: '35 dias sob 26°C',
      reproductionInfo: 'Fêmea pode ovipositar de 120 a 300 ovos ao longo da vida reprodutiva.'
    },
    hosts: ['Soja', 'Feijão', 'Algodão', 'Milho'],
    otherHosts: ['Girassol', 'Gergelim', 'Trigo', 'Crotalária', 'Mamona', 'Plantas daninhas (Caruru, Joá)'],
    geographicalDistribution: 'Região Neotropical, com pico de densidade no Cerrado e região Centro-Sul do Brasil.',
    damage: 'Inserção do estilete com injeção de saliva histolítica em vagens e grãos em formação. Provoca abortamento de vagens, retenção foliar (soja louca), grãos chochos, enrugados, escurecidos e redução drástica do teor de óleo e poder germinativo.',
    economicDamageDetails: {
      directDamage: 'Punturas diretas nos cotilédones e grãos. Perda de peso de grãos e destruição do embrião da semente.',
      indirectDamage: 'Retenção foliar (hastes verdes na colheita) dificultando a operação mecânica; contaminação por fungos do gênero Nematospora.',
      yieldLossPercentage: 'Perdas de até 30% a 50% no rendimento e até 100% na qualidade da semente.',
      vectorDiseases: 'Transmite o fungo Nematospora coryli (mancha fermentativa de grãos).'
    },
    etiologyBioecology: 'Após a colheita da soja, os adultos migram para sob a palhada (abufela/palhada de milho/brachiaria) e entram em diapausa reprodutiva. Reativam com a subida da temperatura e chuva na primavera.',
    controlMethods: {
      chemical: 'Misturas prontas de Neonicotinoides (Imidacloprido, Thiamethoxam, Acetamiprido) + Piretroides (Bifentrina, Lambda-Cialotrina, Beta-Ciflutrina) e organofosforados de choque (Acefato).',
      physical: 'Manejo de barreira física com culturas de bordadura e armadilhas de agregação feromonológica.',
      cultural: 'Eliminação de hospedeiros alternativos na entressafra, rotação de culturas e uso de cultivares de ciclo precoce para escapar do pico populacional da 3ª geração.',
      biological: 'Parasitoides de ovos Telenomus podisi (eficácia > 80% no parasitismo) e Trissolcus basalis, além de bioinseticidas à base de Beauveria bassiana e Metarhizium anisopliae.'
    },
    nutritionalRelations: 'Plantas com alto teor de Nitrogênio e deficiência de Potássio apresentam grãos com maior teor de aminoácidos amídicos, atraindo massivamente adultos de percevejo. O Potássio (K) adequado promove o espessamento do tegumento do grão e da casca da vagem, dificultando a penetração do estilete.',
    criticalPeriods: ['R3 a R7 (Desenvolvimento de Vagens a Enchimento de Grãos na Soja e Feijão)', 'V1 a V4 (Milho inicial)'],
    naturalEnemies: ['Telenomus podisi', 'Trissolcus basalis', 'Beauveria bassiana', 'Podisus nigrispinus', 'Geocoris spp.'],
    monitoringMethods: 'Amostragem com pano de batida (1.0m) em no mínimo 10 pontos por talhão. Amostragem matutina ou no final da tarde quando os percevejos ficam no topo do dossel.',
    managementStrategies: 'Liberação de Telenomus podisi no início do florescimento (R1), aplicação de bioinseticidas (Beauveria) e controle químico quando atingir o nível de ação rigorosamente antes do R6.',
    actionThresholds: [
      { stage: 'Soja (Produção de Sementes R3-R6)', threshold: 1, unit: 'percevejo (adulto/ninfa >0.5cm) por pano de batida' },
      { stage: 'Soja (Grão Comercial R3-R6)', threshold: 2, unit: 'percevejos por pano de batida' },
      { stage: 'Feijão (Formação de Vagens)', threshold: 1, unit: 'percevejo por metro linear' }
    ]
  },
  {
    id: 'bemisia_tabaci',
    scientificName: 'Bemisia tabaci',
    commonName: 'Mosca-branca (Biótipo B / Middle East-Asia Minor 1 - MEAM1)',
    order: 'Hemiptera',
    family: 'Aleyrodidae',
    classificationDetails: 'Complexo de espécies cripticas Bemisia tabaci. Biótipos B (MEAM1) e Q (MED) são altamente danosos e resistentes a inseticidas.',
    biologicalCycle: '18 a 25 dias a 28°C. Ovo (4-7d), Ninfas 4 instares (10-14d), Pupa/Pupário (3-4d), Adulto (15-20d).',
    cycleDetails: {
      eggDays: '4 a 7 dias (ovos presos por um pedicelo na página inferior das folhas).',
      nymphOrLarvaDays: '10 a 14 dias (1º instar é "crawler" móvel; 2º, 3º e 4º instares fixos e siftonadores de seiva).',
      pupaDays: '3 a 4 dias (4º instar tardio/pupário com olhos vermelhos visíveis).',
      adultDays: '15 a 25 dias (pequenos hemípteros brancos de 1 mm de comprimento com cera foliar).',
      totalCycleDays: '21 dias a 27°C',
      reproductionInfo: 'Fêmeas arrhenótocas põem de 100 a 300 ovos. Reprodução sexuada e partenogenética.'
    },
    hosts: ['Soja', 'Algodão', 'Feijão', 'Milho'],
    otherHosts: ['Tomate', 'Melancia', 'Batata', 'Pimentão', 'Mandioca', 'Caruru', 'Joá', 'Melão'],
    geographicalDistribution: 'Cosmopolita em regiões tropicais, subtropicais e cultivos protegidos.',
    damage: 'Sugestão contínua de seiva elaborada causando debilitamento nutricional da planta, injeção de toxinas (prateamento de folhas), excreção de "honeydew" (mela açucarada) que desenvolve o fungo da Fumagina (Capnodium spp.) e transmissão de viroses devastadoras.',
    economicDamageDetails: {
      directDamage: 'Depleção de fotoassimilados, clorose foliar intensa e queima de folhas.',
      indirectDamage: 'Desenvolvimento de fumagina sobre as folhas e maçãs do algodão, bloqueando a fotossíntese e manchando a pluma (algodão pegajoso/sticky cotton).',
      yieldLossPercentage: 'Perdas de 30% a 70% em grãos e desvalorização comercial total da pluma do algodão.',
      vectorDiseases: 'Transmite o Begomovirus (Mosaico Dourado do Feijoeiro, Mosaico Dourado da Soja) e Crinivirus.'
    },
    etiologyBioecology: 'Clima quente e seco favorece explosões populacionais. As ninfas e adultos colonizam a face abaxial (inferior) das folhas, dificultando a atratividade e cobertura da pulverização.',
    controlMethods: {
      chemical: 'Inseticidas reguladores de crescimento de ninfas (Pyriproxyfen, Buprofezin), diamidas, cetoenóis (Spiromesifen, Spirotetramat), Flupyradifurone, Afidopiropeno e Dinotefuran.',
      physical: 'Instalação de armadilhas cromotrópicas amarelas para captura massiva e detecção inicial de migrantes.',
      cultural: 'Vazio sanitário rigoroso, eliminação de tigueras e restos culturais, cultivo de barreiras vegetais mais altas (ex: milho em bordadura) e rotação com gramíneas.',
      biological: 'Fungos entomopatogênicos Cordyceps fumosorosea (=Isaria fumosorosea), Beauveria bassiana e parasitoides de ninfas Encarsia formosa e Eretmocerus eremicus.'
    },
    nutritionalRelations: 'Plantas com nutrição desequilibrada em Nitrogênio elevado produzem seiva rica em aminas solubilizadas, multiplicando a taxa de oviposição da mosca-branca. O suprimento adequado de Cálcio (Ca) e Boro (B) fortalece as lamela médias e epiderme, dificultando a inserção dos estiletes das ninfas.',
    criticalPeriods: ['V3 a R5 (Soja e Feijão)', 'Botoamento a Abertura de Maçãs (Algodão)'],
    naturalEnemies: ['Cordyceps fumosorosea', 'Beauveria bassiana', 'Encarsia formosa', 'Eretmocerus eremicus', 'Chrysoperla externa'],
    monitoringMethods: 'Inspeção do terço médio e inferior da planta. Contagem de ninfas e adultos na face inferior de 20 folíolos por ponto amostrado. Uso de armadilhas amarelas adesivas.',
    managementStrategies: 'Aplicação preventiva de bioinseticidas (Cordyceps) no início do aparecimento de adultos, rotação de MoA no controle químico e pulverizações direcionadas com alto volume de calda e adjuvantes siliconados.',
    actionThresholds: [
      { stage: 'Soja / Feijão', threshold: 10, unit: 'ninfas por folíolo no terço médio' },
      { stage: 'Algodão (Vegetativo)', threshold: 5, unit: 'adultos por folha' },
      { stage: 'Algodão (Maçãs abertas)', threshold: 2, unit: 'adultos por folha (risco de mela na pluma)' }
    ]
  },
  {
    id: 'helicoverpa_armigera',
    scientificName: 'Helicoverpa armigera',
    commonName: 'Lagarta-das-maçãs / Lagarta-da-vagem',
    order: 'Lepidoptera',
    family: 'Noctuidae',
    classificationDetails: 'Subfamília Heliothinae. Praga quarentenária introduzida, extremamente polífaga e com alta capacidade de desenvolver resistência a moléculas químicas e proteínas Bt.',
    biologicalCycle: '30 a 45 dias. Ovo (3-5d), Larva 6 instares (18-25d), Pupa no solo (10-14d), Adulto (10-15d).',
    cycleDetails: {
      eggDays: '3 a 5 dias (ovos isolados em botões florais, brotos e folhas jovens).',
      nymphOrLarvaDays: '18 a 25 dias (canibalismo entre larvas maiores; preferência por estruturas reprodutivas).',
      pupaDays: '10 a 14 dias (no solo; pode entrar em diapausa sob condições adversas).',
      adultDays: '10 a 15 dias (mariposas noturnas voam longas distâncias).',
      totalCycleDays: '35 dias a 25°C',
      reproductionInfo: 'Uma fêmea coloca de 1.000 a 3.000 ovos individualmente.'
    },
    hosts: ['Algodão', 'Soja', 'Feijão', 'Milho'],
    otherHosts: ['Tomate', 'Girassol', 'Grão-de-bico', 'Citros', 'Sorghum', 'Sorgo', 'Pimentão'],
    geographicalDistribution: 'Cosmopolita (Europa, África, Ásia, Oceania e introduzida nas Américas desde 2013).',
    damage: 'Ataque voraz e prioritário às estruturas reprodutivas: perfuração de botões florais, maçãs do algodoeiro, espigas de milho e vagens de soja e feijão. A larva introduz a parte anterior do corpo no órgão reprodutivo para se alimentar dos grãos/pluma em formação.',
    economicDamageDetails: {
      directDamage: 'Destruição direta de sementes, vagens e maçãs; queda prematura de botões florais.',
      indirectDamage: 'Entrada de patógenos oportunistas (podridões de maçãs e espigas por fungos e bactérias).',
      yieldLossPercentage: 'Perdas econômicas severas de 40% a 90% na produtividade da lavoura.',
      vectorDiseases: 'Transmite agentes de podridões de estruturas reprodutivas.'
    },
    etiologyBioecology: 'As mariposas são atraídas por plantas no início do florescimento. As larvas de 3º instar em diante escondem-se no interior das estruturas vegetais durante o dia, dificultando o alcance de inseticidas de contato.',
    controlMethods: {
      chemical: 'Chlorantraniliprole, Cyanantraniliprole, Indoxacarbe, Spinetoram, Emamectina Benzoato e Chlorfenapyr. Uso estrito de inseticidas registrados e monitoramento de resistência.',
      physical: 'Catação manual em pequenas áreas e uso de armadilhas de feromônio sintético específico.',
      cultural: 'Vazio sanitário, destruição de soqueiras de algodão, plantas guaxe/tiguera e rotação com culturas não atrativas.',
      biological: 'Baculovirus Helicoverpa (HearNPV), Bacillus thuringiensis (kurstaki / aizawai), Trichogramma pretiosum e predadores como Podisus e Orius insidiosus.'
    },
    nutritionalRelations: 'Plantas com alto teor de Fósforo (P) no período reprodutivo ativam metabólitos de atração para postura de ovos. O Silício (Si) acumulado nas brácteas do algodão e cascas de vagens diminui a taxa de sobrevivência de larvas recém-eclodidas devido à abrasão das peças bucais.',
    criticalPeriods: ['Botoamento a Maçãs (Algodão)', 'R1 a R6 (Florescimento e Vagens na Soja e Feijão)', 'R1 (Emissão de estigmas no Milho)'],
    naturalEnemies: ['Baculovirus HearNPV', 'Trichogramma pretiosum', 'Bacillus thuringiensis', 'Orius insidiosus', 'Podisus nigrispinus'],
    monitoringMethods: 'Vistoria minuciosa de 100 plantas por talhão divididos em 20 pontos. Inspeção de botões florais, flores e vagens. Uso de armadilhas com feromônio de Helicoverpa armigera.',
    managementStrategies: 'Aplicação de HearNPV no aparecimento das primeiras pequenas lagartas (< 7 mm), rotação de inseticidas com diferentes MOAs e integração com liberadores de Trichogramma.',
    actionThresholds: [
      { stage: 'Algodão (Reprodutivo)', threshold: 1, unit: 'lagarta por metro linear ou 5% de botões atacados' },
      { stage: 'Soja / Feijão (Vagens R3-R5)', threshold: 1, unit: 'lagarta por metro de fileira' },
      { stage: 'Milho (Estigmatação)', threshold: 2, unit: '% de espigas com ovos no cabelo do milho' }
    ]
  },
  {
    id: 'dichelops_melacanthus',
    scientificName: 'Diceraeus melacanthus / Dichelops furcatus',
    commonName: 'Percevejo-barriga-verde',
    order: 'Hemiptera',
    family: 'Pentatomidae',
    classificationDetails: 'Subfamília Pentatominae. Hemíptero sugador com espinhos no pronoto de cor verde-brilhante no abdômen.',
    biologicalCycle: '25 a 35 dias. Ovo (5-7d), Ninfa 5 instares (18-24d), Adulto (40-60d).',
    cycleDetails: {
      eggDays: '5 a 7 dias (ovos esverdeados depositados em pequenas fileiras na palhada ou folhas).',
      nymphOrLarvaDays: '18 a 24 dias (ninfas de formato ovalado que buscam refúgio na base das plântulas).',
      pupaDays: 'Inexistente (Metamorfose incompleta).',
      adultDays: '40 a 60 dias (adultos marrons com abdômen verde claro vivo).',
      totalCycleDays: '30 dias a 26°C',
      reproductionInfo: 'Oviposição média de 80 a 180 ovos por fêmea.'
    },
    hosts: ['Milho', 'Soja', 'Feijão', 'Algodão'],
    otherHosts: ['Trigo', 'Cevada', 'Sorgo', 'Aveia', 'Brachiaria / Pastagens', 'Cevada'],
    geographicalDistribution: 'América do Sul (Brasil, Argentina, Paraguai e Uruguai).',
    damage: 'Ataque fulminante no colo de plântulas recém-emergidas de milho, soja e trigo. Injeta saliva tóxica no meristema apical causando enrolamento foliar ("charuto"), perfurações simétricas com halo amarelado e enfezamento ("perfilhamento profilático") com morte da planta.',
    economicDamageDetails: {
      directDamage: 'Destruição do ponto de crescimento (meristema) em plântulas de milho e trigo.',
      indirectDamage: 'Redução estande inicial de plantas e desuniformidade de emergência.',
      yieldLossPercentage: 'Perdas severas de até 60% na produtividade do milho safrinha se atacado até V3.',
      vectorDiseases: 'Não é vetor primário de vírus, mas portas de entrada para patógenos do solo.'
    },
    etiologyBioecology: 'A praga se abriga massivamente na palhada do sistema de Plantio Direto durante a colheita da soja e ataca a cultura subsequente (milho safrinha ou trigo) imediatamente na emergência.',
    controlMethods: {
      chemical: 'Tratamento de Sementes (TS) com Neonicotinoides (Imidacloprido, Thiamethoxam, Fipronil) e pulverização foliar área total com Neonicotinoides + Piretroides imediatamente após a emergência (VE a V2).',
      physical: 'Eliminação mecânica ou dessecação antecipada da cobertura vegetal para expor os percevejos aos predadores.',
      cultural: 'Dessecação pré-plantio antecipada (14 a 21 dias antes da semeadura) com adição de inseticida (manejo outonal/pré-semeadura).',
      biological: 'Parasitoides de ovos Telenomus podisi e fungo entomopatogênico Metarhizium anisopliae aplicado na palhada.'
    },
    nutritionalRelations: 'Solos enriquecidos em Potássio (K) e Matéria Orgânica favorecem o vigor e rápida velocidade de emergência das plântulas, encurtando a janela de vulnerabilidade (VE a V3). A aplicação de Zinco (Zn) via semente estimula o enraizamento rápido, reduzindo os efeitos do ataque no meristema.',
    criticalPeriods: ['VE a V4 (Milho)', 'Perfilhamento (Trigo)', 'Emergência a V3 (Soja e Feijão)'],
    naturalEnemies: ['Telenomus podisi', 'Metarhizium anisopliae', 'Podisus spp.', 'Carabídeos (besouros predadores)'],
    monitoringMethods: 'Inspeção direta da palhada e colo das plântulas nas primeiras horas da manhã (antes das 9h). Amostragem de 1 m² de palhada por ponto.',
    managementStrategies: 'Tratamento de sementes obrigatório com inseticida sistêmico + dessecação antecipada com inseticida de manejo + pulverização de área total no estágio VE/V1.',
    actionThresholds: [
      { stage: 'Milho (Emergência VE-V2)', threshold: 0.8, unit: 'percevejo por metro linear de linha de plantio' },
      { stage: 'Trigo (Emergência a Perfilhamento)', threshold: 1, unit: 'percevejo por m²' },
      { stage: 'Soja / Feijão (Emergência V2)', threshold: 1, unit: 'percevejo por metro linear' }
    ]
  },
  {
    id: 'chrysodeixis_includens',
    scientificName: 'Chrysodeixis includens',
    commonName: 'Lagarta-falsa-medideira',
    order: 'Lepidoptera',
    family: 'Noctuidae',
    classificationDetails: 'Subfamília Plusiinae. Lagarta desfolhadora com apenas dois pares de falsas pernas abdominais, locomovendo-se dobrando o corpo (medindo palmos).',
    biologicalCycle: '25 a 35 dias. Ovo (3-4d), Larva 6 instares (14-20d), Pupa em teia rendilhada sob a folha (7-9d), Adulto (10-12d).',
    cycleDetails: {
      eggDays: '3 a 4 dias (ovos esféricos branco-esverdeados depositados isoladamente nas folhas).',
      nymphOrLarvaDays: '14 a 20 dias (cor verde-clara com linhas longitudinais brancas e dois pares de propernas).',
      pupaDays: '7 a 9 dias (protegida por um casulo de teia sedosa transparente sob a página inferior das folhas).',
      adultDays: '10 a 12 dias (mariposa de coloração marrom-dourada com duas manchas prateadas reluzentes nas asas anteriores).',
      totalCycleDays: '28 dias a 26°C',
      reproductionInfo: 'Oviposição de até 700 ovos por fêmea.'
    },
    hosts: ['Soja', 'Algodão', 'Feijão', 'Milho'],
    otherHosts: ['Girassol', 'Fumo', 'Batata-doce', 'Mandioca', 'Tomate', 'Quiabo'],
    geographicalDistribution: 'Américas (do Sul, Central e do Norte).',
    damage: 'Raspagem e consumo do parênquima foliar mantendo as nervuras principais e secundárias intactas, conferindo à folha um aspecto rendilhado característico. O ataque ocorre tipicamente do terço inferior para o topo da planta.',
    economicDamageDetails: {
      directDamage: 'Redução drástica da área foliar fotossinteticamente ativa no dossel médio e inferior.',
      indirectDamage: 'Deficiência na taxa de enchimento de grãos devido à perda do índice de área foliar (IAF).',
      yieldLossPercentage: 'Perdas de produtividade de 15% a 35% na soja e algodão.',
      vectorDiseases: 'Não é vetor de viroses.'
    },
    etiologyBioecology: 'A praga é favorecida pelo microclima denso e úmido no interior do dossel das plantas após o fechamento das linhas. O uso desequilibrado de inseticidas de amplo espectro elimina seus inimigos naturais e gera surtos secundários.',
    controlMethods: {
      chemical: 'Diamidas antranílicas (Chlorantraniliprole), Espinosinas (Spinetoram), Indoxacarbe, Methoxyfenozide e Tebufenozide. Exige uso de tecnologia de aplicação com penetração no terço inferior.',
      physical: 'Instalação de armadilhas luminosas para monitoramento do voo das mariposas.',
      cultural: 'Escolha de cultivares com arquitetura foliar ereta que permitam maior iluminação e penetração de pulverização.',
      biological: 'Baculovirus Chrysodeixis (ChinNPV), Bacillus thuringiensis (Bt), fungo Nomuraea rileyi (doença branca/giz) e Trichogramma pretiosum.'
    },
    nutritionalRelations: 'Plantas com excesso de Nitrogênio formam dossel muito denso e folhas macias ricos em aminas solúveis, atraindo oviposição nas folhas inferiores. A adubação equilibrada com Potássio (K) e Cálcio (Ca) espessa as cutículas foliares. A aplicação foliar de Silício (Si) reduz a digestibilidade da matéria seca foliar pelas larvas.',
    criticalPeriods: ['R1 a R6 (Florescimento ao Enchimento de Vagens na Soja e Feijão)', 'Formação de Maçãs (Algodão)'],
    naturalEnemies: ['Baculovirus ChinNPV', 'Nomuraea rileyi', 'Trichogramma pretiosum', 'Copidosoma floridanum (parasitoide poliembrionário)', 'Microplitis demolitor'],
    monitoringMethods: 'Amostragem com pano de batida tradicional ou pano vertical em 10 a 20 pontos por talhão. Avaliação visual da porcentagem de desfolha rendilhada no terço inferior e médio.',
    managementStrategies: 'Pulverização biológica precoce com ChinNPV ou Bt nas primeiras infestações. Em populações altas, pulverizar inseticidas fisiológicos específicos garantindo deposição no fundo do dossel.',
    actionThresholds: [
      { stage: 'Soja / Feijão (Vegetativo)', threshold: 30, unit: '% de desfolha média' },
      { stage: 'Soja / Feijão (Reprodutivo R1-R6)', threshold: 15, unit: '% de desfolha ou 12 lagartas > 1.5 cm/pano de batida' },
      { stage: 'Algodão (Reprodutivo)', threshold: 10, unit: '% de desfolha' }
    ]
  },
  {
    id: 'anthonomus_grandis',
    scientificName: 'Anthonomus grandis',
    commonName: 'Bicudo-do-algodoeiro',
    order: 'Coleoptera',
    family: 'Curculionidae',
    classificationDetails: 'Subfamília Curculioninae. Besouro curculionídeo caracterizado por um rostro (bicudo) alongado e espinhos nos fêmures anteriores.',
    biologicalCycle: '18 a 22 dias sob clima tropical. Ovo (3-4d), Larva 3 instares no interior do botão (7-12d), Pupa (3-5d), Adulto (20-40d).',
    cycleDetails: {
      eggDays: '3 a 4 dias (ovo depositado individualmente em orifício cavado no botão floral ou maçã).',
      nymphOrLarvaDays: '7 a 12 dias (larva apodiforme curculioniforme branca que se alimenta internamente das anteras/óvulos).',
      pupaDays: '3 a 5 dias (ocorre no interior do próprio botão floral caído ou retido).',
      adultDays: '20 a 45 dias (besouro cinza-acastanhado de 4-8 mm de comprimento).',
      totalCycleDays: '20 dias a 28°C',
      reproductionInfo: 'Fêmea pode perfurar e ovipositar em mais de 200 botões florais.'
    },
    hosts: ['Algodão'],
    otherHosts: ['Quiabo', 'Hibisco', 'Malvaviscus', 'Cienfuegosia', 'Malváceas silvestres em bordaduras'],
    geographicalDistribution: 'Américas (principal praga da cotonicultura no Brasil e América Latina).',
    damage: 'Perfuração de alimentação e de postura nos botões florais e maçãs. Causa o amarelamento, abertura das brácteas ("botão em estrela") e queda maciça dos botões florais, além da destruição das fibras e sementes nas maçãs jovens.',
    economicDamageDetails: {
      directDamage: 'Destruição direta dos botões florais (perda completa do órgão reprodutivo) e apodrecimento de maçãs.',
      indirectDamage: 'Queda na qualidade de fibra e inviabilização econômica da lavoura.',
      yieldLossPercentage: 'Perdas devastadoras de até 75% a 90% da produção de algodão em pluma.',
      vectorDiseases: 'Inocula fungos causadores da podridão das maçãs.'
    },
    etiologyBioecology: 'Adultos emergem da palhada e matas vizinhas no início do botoamento. A larva desenvolve-se inteiramente protegida dentro do botão floral, o que torna o inseticida ineficaz contra larvas; o controle deve focar rigorosamente nos adultos.',
    controlMethods: {
      chemical: 'Inseticidas organofosforados de choque (Malathion, Acefato), piretroides (Beta-Ciflutrina) e fenilpirazóis (Fipronil) aplicados em tubos de mata-bicudo e em pulverizações sequenciais.',
      physical: 'Uso obrigatório de armadilhas de feromônio sintético (Grandlure) nas bordaduras para monitoramento e controle supressivo.',
      cultural: 'Destruição total da soqueira do algodão pós-colheita (obrigatória por lei no Vazio Sanitário), plantas guaxes e eliminação de hospedeiros secundários.',
      biological: 'Parasitoides de larvas Catolaccus grandis, Bracon mellitor e bioinseticidas à base de Beauveria bassiana.'
    },
    nutritionalRelations: 'Plantas de algodão com superadubação de Nitrogênio desenvolvem crescimento vegetativo excessivo (embuchamento) e período de botoamento prolongado, estendendo a Janela de Ataque do bicudo. A adubação equilibrada com Potássio (K), Boro (B) e reguladores de crescimento reduz o período de vulnerabilidade reprodutiva.',
    criticalPeriods: ['Botoamento Floral a Abertura de Maçãs (Algodão B1 a M)'],
    naturalEnemies: ['Grandlure (feromônio)', 'Catolaccus grandis', 'Beauveria bassiana', 'Bracon mellitor', 'Solenopsis invicta (formiga)'],
    monitoringMethods: 'Inspeção de 25 botões florais por ponto em no mínimo 20 pontos por talhão (500 botões/talhão). Uso de armadilhas de feromônio Grandlure dispostas no perímetro dos talhões a cada 150m.',
    managementStrategies: 'Instalação de armadilhas no pré-plantio; pulverização de bordadura nos primeiros botões; controle sequencial (3 pulverizações com intervalo de 3 dias) ao atingir o nível de ação e destruição rigorosa de soqueiras.',
    actionThresholds: [
      { stage: 'Algodão (Botoamento Inicial B1)', threshold: 5, unit: '% de botões com orifícios de postura ou alimentação' },
      { stage: 'Algodão (Pleno Botoamento/Maçãs)', threshold: 10, unit: '% de botões atacados' }
    ]
  },
  {
    id: 'tetranychus_urticae',
    scientificName: 'Tetranychus urticae',
    commonName: 'Ácaro-rajado',
    order: 'Tetranychidae',
    family: 'Tetranychidae',
    classificationDetails: 'Acari Prostigmata. Ácaro fitófago produtor de teias abundantes com duas manchas escuras dorsais no abdômen.',
    biologicalCycle: '7 a 14 dias a 30°C. Ovo (2-4d), Larva 6 pernas (1-2d), Protoninfa (1-2d), Deutoninfa (1-2d), Adulto (10-20d).',
    cycleDetails: {
      eggDays: '2 a 4 dias (ovos esféricos translúcidos depositados sob teias na face inferior das folhas).',
      nymphOrLarvaDays: '4 a 6 dias (fases de larva, protoninfa e deutoninfa intercaladas por períodos de quiescência).',
      pupaDays: 'Inexistente (Ácaro prostigmata).',
      adultDays: '12 a 22 dias (fêmeas ovais esverdeadas com duas manchas escuras no dorso).',
      totalCycleDays: '9 dias sob temperatura de 30°C',
      reproductionInfo: 'Fêmea põe de 100 a 200 ovos. Arrenotokia (ovos não fertilizados geram machos).'
    },
    hosts: ['Algodão', 'Soja', 'Feijão', 'Milho'],
    otherHosts: ['Morango', 'Tomate', 'Mamoeiro', 'Rosa', 'Café', 'Amendoim', 'Melancia'],
    geographicalDistribution: 'Cosmopolita em todas as zonas agrícolas do mundo.',
    damage: 'Perfuração de células epidérmicas na face inferior da folha para sucção do conteúdo celular. Origina pontilhados cloróticos amarelados que evoluem para manchas avermelhadas/bronzeadas, necrose, teia densa e desfolha precoce e intensa.',
    economicDamageDetails: {
      directDamage: 'Destruição dos cloroplastos, redução da fotossíntese e colapso hídrico celular.',
      indirectDamage: 'Desfolha precoce impedindo o enchimento de grãos e maturação das maçãs do algodão.',
      yieldLossPercentage: 'Perdas de 20% a 50% em soja e algodão sob estresse hídrico.',
      vectorDiseases: 'Não transmite viroses conhecidas.'
    },
    etiologyBioecology: 'Períodos de seca prolongada, baixas umidades relativas do ar (< 50%) e temperaturas elevadas (> 28°C) impulsionam explosões populacionais. O uso de piretroides de amplo espectro elimina ácaros predadores fitoseídeos, desencadeando ressurgência.',
    controlMethods: {
      chemical: 'Acaricidas específicos como Abamectina, Spiromesifen, Fenpyroximate, Cyflumetofen, Chlorfenapyr, Hexythiazox e Etoxazole.',
      physical: 'Irrigação por aspersão para lavagem física das teias e redução da temperatura do microclima.',
      cultural: 'Manutenção da umidade do solo, eliminação de plantas daninhas hospedeiras nas cabeceiras e avanço uniforme de semeadura.',
      biological: 'Preservação e liberação de ácaros predadores da família Phytoseiidae (Neoseiulus californicus, Phytoseiulus macropilis e Phytoseiulus persimilis).'
    },
    nutritionalRelations: 'Plantas sob estresse hídrico com excesso de Nitrogênio e deficiência de Potássio acumulam aminoácidos livres e açúcares solúveis que multiplicam a fecundidade dos ácaros em até 3 vezes. A adubação equilibrada com Silício (Si) e Potássio (K) aumenta a rigidez foliar e espessura da cutícula, inibindo o alcance dos quelíceras do ácaro.',
    criticalPeriods: ['Estiagens e veranicos em qualquer estágio fenológico', 'Formação de Maçãs (Algodão)', 'R2 a R5 (Soja e Feijão)'],
    naturalEnemies: ['Neoseiulus californicus', 'Phytoseiulus macropilis', 'Chrysoperla externa', 'Stethorus spp. (joaninha acarófaga)'],
    monitoringMethods: 'Vistoria da face abaxial (inferior) de folhas do terço médio e inferior com auxílio de lupa de 10x em 20 pontos/talhão.',
    managementStrategies: 'Uso exclusivo de acaricidas seletivos preservando Phytoseiidae; aplicação de acaricidas ovicidas/ninficidas no início dos reboleiros e pulverizações com alto volume de água e espalhantes adesivos siliconados.',
    actionThresholds: [
      { stage: 'Algodão', threshold: 10, unit: '% de plantas com sintomas iniciais de mancha bronzeada' },
      { stage: 'Soja / Feijão', threshold: 20, unit: '% de plantas infestadas ou presenças de reboleira' }
    ]
  },
  {
    id: 'elasmopalpus_lignosellus',
    scientificName: 'Elasmopalpus lignosellus',
    commonName: 'Lagarta-elasmo / Broca-do-colo',
    order: 'Lepidoptera',
    family: 'Pyralidae',
    classificationDetails: 'Subfamília Phycitinae. Pequena lagarta agilíssima que se abriga em um casulo de teia e grãos de areia fixado ao colo da planta no solo.',
    biologicalCycle: '20 a 30 dias sob altas temperaturas. Ovo (3-5d), Larva 6 instares (12-18d), Pupa no solo (7-10d), Adulto (8-10d).',
    cycleDetails: {
      eggDays: '3 a 5 dias (ovos depositados no solo ou no colo da plântula).',
      nymphOrLarvaDays: '12 a 18 dias (lagarta de cor esverdeada-azulada com anéis transversais castanhos, extremamente ágil ao toque).',
      pupaDays: '7 a 10 dias (em casulo silíceo no solo).',
      adultDays: '8 a 10 dias (pequena mariposa cinzenta com asas fechadas em forma de tubo).',
      totalCycleDays: '25 dias a 29°C',
      reproductionInfo: 'Fêmea coloca cerca de 100 a 200 ovos perto da base de gramíneas e leguminosas.'
    },
    hosts: ['Milho', 'Soja', 'Feijão', 'Algodão'],
    otherHosts: ['Arroz de sequeiro', 'Sorgo', 'Cana-de-açúcar', 'Amendoim', 'Trigo', 'Pastagens (Brachiaria)'],
    geographicalDistribution: 'Américas (destaque para regiões de solos leves e de Cerrado no Brasil).',
    damage: 'Penetração e perfuração do colo da plântula na região de transição raiz-caule a 1 cm abaixo do solo, construindo uma galeria ascendente. Provoca o sintoma de "coração morto" (secamento da folha central), murchamento e morte das plântulas.',
    economicDamageDetails: {
      directDamage: 'Destruição do sistema vascular e ponto de crescimento no colo da plântula.',
      indirectDamage: 'Perda irreparável de estande inicial de plantas, exigindo replantio parcial ou total.',
      yieldLossPercentage: 'Redução de estande de 30% a 100% em solos leves sob veranico.',
      vectorDiseases: 'Abertura de portas de entrada para patógenos de solo como Rhizoctonia e Pythium.'
    },
    etiologyBioecology: 'Praga típica de solos arenosos, quentes e secos. Períodos de estiagem logo após a emergência das culturas (veranicos de início de safra) deflagram surtos severos.',
    controlMethods: {
      chemical: 'Tratamento de Sementes (TS) reforçado com Fipronil, Imidacloprido + Thiodicarb ou Chlorantraniliprole. Pulverização de sulco de plantio ou área total em jato dirigido à base da planta pré-emergência/emergência.',
      physical: 'Irrigação por pivô (a umidade do solo força a saída da lagarta do colo ou causa sua mortalidade).',
      cultural: 'Manutenção de cobertura morta densa (Plantio Direto de alta palhada retém umidade no solo e inibe a oviposição) e plantio em época com bom regime de chuvas.',
      biological: 'Fungos Metarhizium anisopliae e Beauveria bassiana aplicados ao solo, e parasitoides de ovos Trichogramma.'
    },
    nutritionalRelations: 'Solos com bom teor de Matéria Orgânica e Fósforo (P) aceleram o vigor inicial das raízes, diminuindo o tempo de vulnerabilidade do colo. O Silício (Si) aplicado via solo enrijece o tecido epidérmico basal da haste, dificultando a mastigação e abertura da galeria pela lagarta.',
    criticalPeriods: ['VE a V4 (Emergência a 4 folhas no Milho, Soja, Feijão e Algodão)'],
    naturalEnemies: ['Metarhizium anisopliae', 'Orgilus elasmopalpi', 'Pristomerus spinator', 'Carabídeos e Formigas predadoras'],
    monitoringMethods: 'Inspeção diária do estande de emergência. Acompanhamento de plântulas murchas ou secas no centro do talhão, escavando o colo e procurando o casulo de teia com areia.',
    managementStrategies: 'Tratamento de semente específico e obrigatório em anos de previsão de veranico; semeadura no limpo sob alta palhada e pulverização complementar de sulco em áreas de histórico arenoso.',
    actionThresholds: [
      { stage: 'Milho / Soja / Feijão / Algodão (VE-V3)', threshold: 3, unit: '% de plântulas atacadas com coração morto' }
    ]
  },
  {
    id: 'dalbulus_maidis',
    scientificName: 'Dalbulus maidis',
    commonName: 'Cigarrinha-do-milho',
    order: 'Hemiptera',
    family: 'Cicadellidae',
    classificationDetails: 'Subfamília Deltocephalinae. Inseto sugador especialista exclusivo da cultura do milho e de seus ancestrais (Teosinto).',
    biologicalCycle: '16 a 24 dias sob temperatura ambiente de 26°C. Ovo (5-8d), Ninfas 5 instares (10-15d), Adulto (30-50d).',
    cycleDetails: {
      eggDays: '5 a 8 dias (ovos endofíticos inseridos na nervura central da folha do milho).',
      nymphOrLarvaDays: '10 a 15 dias (ninfas amareladas extremamente ágeis com movimento lateral em caranguejo).',
      pupaDays: 'Inexistente (Inseto hemimetábolo).',
      adultDays: '30 a 60 dias (adultos amarelo-palha de 3 mm com duas manchas escuras no topo da cabeça).',
      totalCycleDays: '20 dias a 27°C',
      reproductionInfo: 'Uma fêmea pode ovipositar entre 400 e 600 ovos durante a vida.'
    },
    hosts: ['Milho'],
    otherHosts: ['Teosinto (Zea mays ssp. parviglumis)', 'Sorgo (hospedeiro secundário temporário de sobrevivência)'],
    geographicalDistribution: 'Américas (estendendo-se do Sul dos EUA até a Argentina; epidêmica no Brasil).',
    damage: 'Transmissão persistente e propagativa dos molares do complexo de enfezamentos: Enfezamento Pálido (Spiroplasma kunkelii), Enfezamento Vermelho (Maize bush stunt phytoplasma - Fitoplasma) e o Vírus do Rayado Fino (MRFV). As plantas infectadas apresentam estrias cloróticas, avermelhamento foliar, encurtamento de entrenós, espigas múltiplas estéreis e quebra de colmo.',
    economicDamageDetails: {
      directDamage: 'Sugestão de seiva e sucção continuada em cartuchos e folhas jovens.',
      indirectDamage: 'Transmissão dos patógenos do Complexo de Enfezamentos e vírus do Rayado Fino.',
      yieldLossPercentage: 'Perdas catastróficas de 50% a 90% na produtividade do milho safrinha.',
      vectorDiseases: 'Vetor exclusivo do Spiroplasma kunkelii, Phytoplasma do enfezamento e Vírus do Rayado Fino.'
    },
    etiologyBioecology: 'A cigarrinha multiplica-se vigorosamente na ponte verde mantida pelo milho tiguera (voluntário) entre a safra de verão e a safrinha. Adultos voam a longas distâncias buscando cartuchos de milho novo.',
    controlMethods: {
      chemical: 'Tratamento de Sementes com Neonicotinoides (Clothianidin, Imidacloprido, Thiamethoxam) e pulverizações foliares sequenciais no vegetativo com Neonicotinoides, Pyrethroids, Flupyradifurone e Acetamiprido.',
      physical: 'Instalação de armadilhas adesivas amarelas na bordadura para monitoramento da chegada de migrantes.',
      cultural: 'Erradicação total do milho tiguera (ponte verde) na entressafra, concentração máxima da época de semeadura regional e uso de híbridos de milho tolerantes aos enfezamentos.',
      biological: 'Bioinseticidas à base de Beauveria bassiana e Cordyceps fumosorosea, associados à proteção da vespinha parasitoide de ovos Anagrus breviphragma.'
    },
    nutritionalRelations: 'Plantas com nutrição desequilibrada em Nitrogênio e deficientes em Potássio e Zinco manifestam sintomas de enfezamento muito mais severos e precoces, acelerando a necrose do colmo. O aporte de Silício (Si) reduz o tempo de alimentação do inseto no floema.',
    criticalPeriods: ['V1 a V8 (Janela crítica de transmissão dos mollicutes no Milho)'],
    naturalEnemies: ['Anagrus breviphragma', 'Beauveria bassiana', 'Cordyceps fumosorosea', 'Gonatopus spp.', 'Chrysoperla externa'],
    monitoringMethods: 'Inspeção direta dentro do cartucho do milho nas primeiras horas do dia (antes das 9h). Monitoramento com armadilhas adesivas amarelas no perímetro do talhão.',
    managementStrategies: 'Manejo regional unificado: eliminação rigorosa de tiguera na entressafra, TS inseticida sistêmico, plantio de híbridos tolerantes e 3 a 4 aplicações combinadas (biológico + químico) de V1 a V6.',
    actionThresholds: [
      { stage: 'Milho (Vegetativo V1 a V6)', threshold: 1, unit: 'cigarrinha por cartucho de planta' },
      { stage: 'Milho (Monitoramento Armadilha)', threshold: 5, unit: 'cigarrinhas por armadilha amarela/dia' }
    ]
  },
  {
    id: 'diabrotica_speciosa',
    scientificName: 'Diabrotica speciosa',
    commonName: 'Vaquinha-dos-matos / Larva-alfinete',
    order: 'Coleoptera',
    family: 'Chrysomelidae',
    classificationDetails: 'Subfamília Galerucinae. Besouro desfolhador verde com seis manchas amarelas nos élitros; a larva vive no solo e ataca raízes.',
    biologicalCycle: '30 a 40 dias. Ovo (6-8d), Larva 3 instares no solo (15-20d), Pupa no solo (6-8d), Adulto (30-60d).',
    cycleDetails: {
      eggDays: '6 a 8 dias (ovos amarelados depositados no solo ao redor da base da planta).',
      nymphOrLarvaDays: '15 a 20 dias (larva alongada de cor branca com cabeça e placa anal escuras - "larva-alfinete").',
      pupaDays: '6 a 8 dias (em câmara pupal no solo).',
      adultDays: '30 a 60 dias (besouro verde de 5-6 mm de comprimento com manchas amarelas).',
      totalCycleDays: '32 dias a 25°C',
      reproductionInfo: 'Uma fêmea oviposita entre 300 e 800 ovos no solo.'
    },
    hosts: ['Milho', 'Soja', 'Feijão', 'Algodão'],
    otherHosts: ['Batata', 'Tomate', 'Trigo', 'Girassol', 'Hortaliças em geral', 'Melancia'],
    geographicalDistribution: 'América do Sul (amplamente distribuída no Brasil, Argentina e Uruguai).',
    damage: 'Os adultos consomem as folhas (perfurações arredondadas), brotos e cabelos do milho (estigmas). As larvas no solo ("larva-alfinete") brocam e destroem as raízes nutridoras e de sustentação do milho, causando tombamento de plantas (sintoma "pescoço-de-ganso").',
    economicDamageDetails: {
      directDamage: 'Destruição das raízes por larvas e desfolha/corte de cabelos da espiga por adultos.',
      indirectDamage: 'Tombamento de plantas de milho dificultando a colheita mecânica e impedindo a polinização.',
      yieldLossPercentage: 'Perdas de 15% a 40% em milho e feijão.',
      vectorDiseases: 'Transmite o Comovirus (Mosaico Severo do Feijoeiro).'
    },
    etiologyBioecology: 'A espécie desenvolve-se continuamente ao longo do ano em locais com sucessão de feijão, milho e batata. As larvas exigem umidade no solo para sobrevivência.',
    controlMethods: {
      chemical: 'Tratamento de Sementes com inseticidas de ação sistêmica no solo (Fipronil, Imidacloprido, Thiamethoxam) e pulverização foliar para controle de adultos com Piretroides + Organofosforados.',
      physical: 'Uso de armadilhas luminosas e amostragem de solo para detectar larvas.',
      cultural: 'Rotação de culturas com espécies não hospedeiras de larvas (ex: Crotalária), época de semeadura adequada e cultivo do solo para exposição de ovos/pupas ao sol.',
      biological: 'Fungos entomopatogênicos Beauveria bassiana e Metarhizium anisopliae aplicados no solo contra larvas, e nematóides entomopatogênicos (Steinernema spp.).'
    },
    nutritionalRelations: 'Plantas com adubação rica em Fósforo (P) e Cálcio (Ca) regeneram o sistema radicular com maior rapidez contra os danos da larva-alfinete. O Silício (Si) acumulado nas raízes e folhas reduz a digestibilidade para larvas e besouros.',
    criticalPeriods: ['VE a V6 (Fase larval de ataque às raízes no Milho)', 'Florescimento (Corte de estigmas no Milho)', 'Emergência a V4 (Feijão e Soja)'],
    naturalEnemies: ['Beauveria bassiana', 'Metarhizium anisopliae', 'Celatoria bosqi (mosca parasitoide)', 'Centistes gaimari'],
    monitoringMethods: 'Inspeção foliar de adultos com pano de batida ou contagem direta. Vistoria do solo (bloco de solo 20x20x20cm) lavando as raízes para contagem de larvas-alfinete.',
    managementStrategies: 'Tratamento de sementes focado na proteção radicular inicial; pulverização de adultos durante o florescimento do milho se houver mais de 2 besouros por espiga cortando cabelos.',
    actionThresholds: [
      { stage: 'Milho (Emissão de Estigmas/Cabelo)', threshold: 2, unit: 'vaquinhas por planta cortando estigmas antes da polinização' },
      { stage: 'Feijão / Soja (Vegetativo)', threshold: 20, unit: '% de desfolha por adultos' }
    ]
  }
];


export const NATURAL_ENEMIES_CATALOG: NaturalEnemy[] = [
  { id: 'trichogramma', commonName: 'Vespinha', scientificName: 'Trichogramma pretiosum', type: 'Parasitoide', targetPests: ['spodoptera_frugiperda'] },
  { id: 'telenomus', commonName: 'Vespinha do ovo', scientificName: 'Telenomus podisi', type: 'Parasitoide', targetPests: ['euschistus_heros'] },
  { id: 'beauveria', commonName: 'Fungo Branco', scientificName: 'Beauveria bassiana', type: 'Fungo Entomopatogênico', targetPests: ['euschistus_heros', 'bemisia_tabaci'] }
];

export const INITIAL_PEST_FIELDS: PestField[] = [
  {
    id: 'field_soja_01',
    farmName: 'Fazenda Modelo',
    fieldName: 'Talhão 01 - Soja',
    areaHa: 45.5,
    crop: 'Soja',
    cultivar: 'TMG 7062 IPRO',
    plantingDate: '2025-10-15',
    currentPhenologicalStage: 'R3 (Início de Formação de Vagens)',
    inspections: [
      {
        id: 'insp_1',
        date: '2025-11-10',
        fieldId: 'field_soja_01',
        pointCode: 'P-01',
        responsible: 'Agrônomo Lucas',
        pestId: 'euschistus_heros',
        stage: 'Adulto',
        quantityObserved: 3,
        plantsEvaluated: 10,
        infestationPercentage: 30,
        severity: 'Média',
        notes: 'Encontrados percevejos no pano de batida.',
        photos: [],
      },
      {
        id: 'insp_2',
        date: '2025-11-20',
        fieldId: 'field_soja_01',
        pointCode: 'P-02',
        responsible: 'Agrônomo Lucas',
        pestId: 'euschistus_heros',
        stage: 'Adulto',
        quantityObserved: 1,
        plantsEvaluated: 10,
        infestationPercentage: 10,
        severity: 'Baixa',
        notes: 'Redução após aplicação.',
        photos: [],
      }
    ],
    traps: [
      {
        id: 'trap_1',
        code: 'ARM-01',
        fieldId: 'field_soja_01',
        type: 'Adesiva',
        gpsLocation: '-12.54, -55.72',
        heightCm: 120,
        installationDate: '2025-10-20',
        lastReplacementDate: '2025-11-05',
        targetPestId: 'bemisia_tabaci',
        totalCaptured: 14,
      }
    ],
    managements: [
      {
        id: 'man_1',
        date: '2025-11-15',
        fieldId: 'field_soja_01',
        type: 'Químico',
        product: 'Neonicotinoide + Piretroide',
        dose: '0.3 L/ha',
        equipment: 'Autopropelido 30m',
        climateConditions: 'Vento 4km/h, Temp 26°C, UR 68%',
      }
    ]
  },
  {
    id: 'field_milho_02',
    farmName: 'Fazenda Modelo',
    fieldName: 'Talhão 02 - Milho Safrinha',
    areaHa: 60.0,
    crop: 'Milho',
    cultivar: 'DKB 360 PRO3',
    plantingDate: '2026-02-01',
    currentPhenologicalStage: 'V4 (4 Folhas Desenvolvidas)',
    inspections: [],
    traps: [],
    managements: []
  }
];

// Motor de Regras Sem IA: Calcula tendência populacional
export function calculatePopulationTrend(inspections: PestInspection[], pestId: string): PopulationTrend {
  if (!inspections || !Array.isArray(inspections)) return 'Estável';
  const sorted = inspections
    .filter(i => i?.pestId === pestId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  if (sorted.length < 2) return 'Estável';
  
  const last = sorted[sorted.length - 1].quantityObserved;
  const previous = sorted[sorted.length - 2].quantityObserved;
  
  if (last > previous * 1.2) return 'Crescente';
  if (last < previous * 0.8) return 'Decrescente';
  return 'Estável';
}

// Verifica alerta fenológico cruzado com a praga
export function checkPhenologyAlert(pest: PestSpecies, currentStage?: string): boolean {
  if (!pest || !currentStage || !pest.criticalPeriods) return false;
  return pest.criticalPeriods.some(period => 
    currentStage.toLowerCase().includes(period.substring(0, 2).toLowerCase()) ||
    period.toLowerCase().includes(currentStage.substring(0, 2).toLowerCase())
  );
}
