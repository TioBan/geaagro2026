import { NurseryPestDiseaseLibraryItem } from '../types/nursery';

export const nurseryPestsDiseasesLibraryData: NurseryPestDiseaseLibraryItem[] = [
  {
    id: 'npd-pythium-01',
    name: 'Tombamento de Plântulas (Damping-off por Pythium)',
    scientificName: 'Pythium ultimum / Pythium aphanidermatum',
    category: 'oomiceto',
    affectedCrops: ['Alface', 'Tomate', 'Pimentão', 'Pepino', 'Brássicas', 'Flores', 'Eucalipto', 'Cafeeiro', 'Mamoeiro'],
    plantPart: 'colo_raiz',
    symptomsDescription: 'Estrangulamento castanho-aquoso no colo da plântula na linha do substrato, resultando no tombamento súbito e colapso das plântulas em reboleiras na bandeja. As raízes apresentam necrose escura e perda de radicelas absorventes.',
    favorableConditions: 'Substrato excessivamente encharcado, drenagem deficiente, aeração radicular baixa (<10%) e temperaturas entre 18°C e 28°C.',
    damageSeverity: 'critica',
    economicImpact: 'Perda total de bandejas inteiras em menos de 48 horas se não houver manejo de umidade e sanitização preventiva.',
    preventiveManagement: [
      'Utilizar substrato comercial certificado esterilizado ou autoclavado.',
      'Evitar lâminas de irrigação excessivas nas primeiras 72 horas pós-semeadura.',
      'Garantir bancadas suspensas a pelo menos 60 cm do piso britado.'
    ],
    biologicalControl: [
      'Trichoderma harzianum / Trichoderma asperellum (10^9 UFC/g) incorporado no substrato.',
      'Bacillus subtilis linhagem QST 713 via fertirrigação preventiva no enraizamento.',
      'Streptomyces lydicus aplicado no sulco de semeadura.'
    ],
    chemicalControl: [
      'Metalaxil-M + Mancozebe (tratamento de sementes ou drench inicial).',
      'Propamocarbe (Cloridrato de Propamocarbe) em drench localizado nas reboleiras.',
      'Fosfito de Potássio foliar/radicular para indução de fitoalexinas.'
    ],
    organicControl: [
      'Extrato concentrado de alho e própolis verde a 0,5% aplicado via drench.',
      'Biofertilizante líquido aerado enriquecido com cinza vegetal e micro-organismos eficientes (EM-1).',
      'Calda de Cavalinha (Equisetum arvense) rica em sílica orgânica fortalecedora da parede celular.'
    ],
    physicalControl: [
      'Solarização prévia do substrato em lonas transparentes sob sol pleno por 30 a 45 dias.',
      'Termoterapia e desinfecção física de bandejas com água quente a 75°C por 10 minutos.',
      'Autoclavação a 121°C (1 atm) para substratos reutilizados de sementeira.'
    ],
    realPhotoUrl: '/pythium_damping_off.jpg',
    photoCaption: 'Colapso súbito e tombamento de plântulas em bandeja com estrangulamento característico no colo junto ao substrato úmido.',
    photoTag: 'Damping-off em Bandeja',
    secondaryPhotoUrl: '/pythium_roots.jpg',
    secondaryPhotoCaption: 'Necrose escura e desintegração aquosa do sistema radicular e tecidos corticais basais.',
    secondaryPhotoTag: 'Podridão Radicular'
  },
  {
    id: 'npd-botrytis-02',
    name: 'Mofo-Cinzento (Podridão de Botrytis)',
    scientificName: 'Botrytis cinerea',
    category: 'fungo',
    affectedCrops: ['Tomate', 'Pimentão', 'Alface', 'Morangueiro', 'Petúnia', 'Begônia', 'Crisântemo', 'Eucalipto'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Lesões aquosas de cor marrom-claro que rapidamente se cobrem com uma densa camada aveludada e felpuda de esporulação cinzenta (conidióforos). Ataque frequente em tecidos senescentes, ferimentos e na junção do pecíolo com o caule.',
    favorableConditions: 'Umidade relativa do ar acima de 90%, molhamento foliar prolongado (>6 horas contínuas), baixa circulação de ar e temperaturas amenas (15°C a 22°C).',
    damageSeverity: 'alta',
    economicImpact: 'Queima severa de ápices vegetativos e mortalidade de mudas recém-germinadas em viveiros fechados.',
    preventiveManagement: [
      'Manejo ativo de ventilação nas estufas (abertura de cortinas e uso de exaustores / ventiladores).',
      'Evitar irrigações no final da tarde para garantir folhas 100% secas antes do anoitecer.',
      'Espaçamento adequado entre bandejas para evitar sombreamento e microclima úmido.'
    ],
    biologicalControl: [
      'Bacillus subtilis / Bacillus amyloliquefaciens em pulverização preventiva a cada 5 a 7 dias.',
      'Clonostachys rosea / Trichoderma atroviride para antagonismo fúngico de contato.',
      'Aureobasidium pullulans (levedura biocontroladora competidora por nutrientes).'
    ],
    chemicalControl: [
      'Fenhexamida (Hidroxianilida - específico antibotrytis com carência curta).',
      'Iprodiona ou Procimidona (Dicarboximidas).',
      'Pirimetanil ou Ciprodinil + Fludioxonil.'
    ],
    organicControl: [
      'Óleo essencial de Melaleuca (Melaleuca alternifolia) a 0,25% com espalhante orgânico.',
      'Bicarbonato de Potássio (3g/L) com sabão de coco neutro (alteração do pH superficial foliar).',
      'Extrato fluido de Propolis e extrato de semente de toranja (Citrus paradisi).'
    ],
    physicalControl: [
      'Aquecimento noturno da estufa com queimadores ou circuladores para romper ponto de orvalho.',
      'Excisão cirúrgica manual e remoção imediata em sacos plásticos vedados das plântulas atacadas.',
      'Instalação de lâmpadas UV-C móveis noturnas para inativação de conídios suspensos.'
    ],
    realPhotoUrl: '/botrytis_cinerea_leaf.jpg',
    photoCaption: 'Esporulação densa e aveludada de conidióforos cinzentos cobrindo lesões foliares sob alta umidade em estufa.',
    photoTag: 'Mofo Cinzento Foliar',
    secondaryPhotoUrl: '/botrytis_cinerea_stem.jpg',
    secondaryPhotoCaption: 'Cancro e estrangulamento da haste com esporos cinzentos em plântula de viveiro.',
    secondaryPhotoTag: 'Cancro da Haste'
  },
  {
    id: 'npd-bremia-03',
    name: 'Míldio de Plântulas & Folhosas',
    scientificName: 'Bremia lactucae / Peronospora spp. / Pseudoperonospora cubensis',
    category: 'oomiceto',
    affectedCrops: ['Alface', 'Rúcula', 'Espinafre', 'Pepino', 'Melão', 'Brássicas'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Manchas cloróticas angulares e amareladas na face superior das folhas e cotilédones, delimitadas pelas nervuras principais. Na face inferior correspondente, surge uma eflorescência aveludada branca a esbranquiçada formada por esporângios.',
    favorableConditions: 'Temperaturas amenas (10°C a 18°C), presença de filme d\'água livre na superfície foliar e umidade relativa superior a 85%.',
    damageSeverity: 'alta',
    economicImpact: 'Inviabilização comercial de lotes inteiros de mudas de alface e folhosas devido à queima foliar precoce.',
    preventiveManagement: [
      'Uso preferencial de cultivares geneticamente resistentes às principais raças de Bremia.',
      'Manejo rigoroso de irrigação por microaspersão para reduzir tempo de folha molhada.',
      'Aquecimento térmico noturno ou aeração cruzada em dias frios e nublados.'
    ],
    biologicalControl: [
      'Bacillus pumilus / Bacillus subtilis em aplicações semanais preventivas.',
      'Pseudozyma flocculosa (fungo antagonista de oomicetos).',
      'Trichoderma harzianum aplicado em névoa foliar.'
    ],
    chemicalControl: [
      'Dimetomorfe + Mancozebe (ação sistêmica translaminar específica para oomicetos).',
      'Mandipropamida (Grupo CAA / FRAC 40).',
      'Propamocarbe + Fluopicolide.'
    ],
    organicControl: [
      'Calda Bordalesa suave a 0,3% (Sulfato de Cobre + Cal Hidratada) em mudas bem desenvolvidas.',
      'Extrato purificado de Alho (Allium sativum) associado a emulsão de óleo de neem.',
      'Silicato de Potássio foliar para indução de barreira física mecânica de sílica.'
    ],
    physicalControl: [
      'Redução da densidade de semeio e maior espaçamento entre células de bandejas.',
      'Uso de ventilação mecânica cruzada forçada para secagem rápida do limbo foliar após regas.',
      'Filmes agrícolas plásticos com bloqueio térmico infravermelho e difusão de luz.'
    ],
    realPhotoUrl: '/nursery_downy_mildew.jpg',
    photoCaption: 'Lesões angulares cloróticas na face superior e esporulação aveludada branca na face inferior de folhas em bandeja de cultivo.',
    photoTag: 'Esporulação de Míldio'
  },
  {
    id: 'npd-powdery-04',
    name: 'Oídio em Mudas & Flores',
    scientificName: 'Podosphaera xanthii / Erysiphe cichoracearum / Oidium spp.',
    category: 'fungo',
    affectedCrops: ['Pepino', 'Melão', 'Tomate', 'Pimentão', 'Rosa', 'Petúnia', 'Crisântemo', 'Morangueiro'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Depósitos pulverulentos de cor branca brilhante, semelhantes a talco ou farinha, distribuídos em pequenos focos ou cobrindo totalmente os cotilédones e primeiras folhas verdadeiras. Causa deformação foliar e clorose intensa.',
    favorableConditions: 'Clima seco a moderado na estufa (umidade de 50% a 70%), sombreamento excessivo, temperaturas entre 20°C e 28°C e ausência de chuva/molhamento foliar direto.',
    damageSeverity: 'moderada',
    economicImpact: 'Redução drástica da fotossíntese e enfraquecimento das mudas antes do transplantio a campo.',
    preventiveManagement: [
      'Aumentar a iluminação na estufa e evitar sombreamento excessivo de telas térmicas em dias claros.',
      'Manter ventilação constante para evitar ar estagnado sobre as bancadas.',
      'Monitoramento visual diário com lupa de bolso 10x.'
    ],
    biologicalControl: [
      'Ampelomyces quisqualis (fungo hiperparasita específico de oídio).',
      'Bacillus subtilis / Bacillus amyloliquefaciens.',
      'Leccanicillium lecanii em pulverizações focadas.'
    ],
    chemicalControl: [
      'Enxofre elementar solúvel micronizado (doses suaves para mudas jovens).',
      'Azoxistrobina + Difenoconazol (Estrobilurina + Triazol).',
      'Ciproconazol ou Tebuconazol.'
    ],
    organicControl: [
      'Leite cru bovino diluído a 10% em água (proteínas e lactoferrina geram peróxido sob luz solar).',
      'Bicarbonato de Sódio ou de Potássio (5g/L) com óleo vegetal emulsificado.',
      'Extrato de Melaleuca (Tea Tree Oil) a 0,2%.'
    ],
    physicalControl: [
      'Lavagem periódica sob pressão controlada da superfície foliar para romper hifas de oídio.',
      'Uso de filme plástico UV-transparente para maximizar radiação ultravioleta natural antifúngica.',
      'Remoção cirúrgica de cotilédones severamente pulverulentos.'
    ],
    realPhotoUrl: '/nursery_powdery_mildew.jpg',
    photoCaption: 'Massa pulverulenta branca cobrindo os cotilédones e limbo foliar de mudas jovens em estufa protegida.',
    photoTag: 'Pó Branco de Oídio'
  },
  {
    id: 'npd-phytophthora-05',
    name: 'Requeima & Murcha de Fitóftora',
    scientificName: 'Phytophthora infestans / Phytophthora nicotianae / P. capsici',
    category: 'oomiceto',
    affectedCrops: ['Tomate', 'Pimentão', 'Berinjela', 'Citros', 'Cafeeiro', 'Morangueiro', 'Mamoeiro'],
    plantPart: 'caule_haste',
    symptomsDescription: 'Lesões castanho-escuras, irregulares e de aspecto aquoso (óleo molhado) no caule, pecíolo e folhas. No caule ocorre necrose anelar deprimida que causa murcha irreversível da ponta da muda sem perda imediata da cor verde.',
    favorableConditions: 'Temperaturas amenas a quentes (18°C a 24°C), umidade relativa saturada (>95%) e filme de água contínuo na superfície das folhas e hastes.',
    damageSeverity: 'critica',
    economicImpact: 'Epidemias explosivas com destruição de milhares de mudas em menos de 24 a 36 horas.',
    preventiveManagement: [
      'Eliminação imediata de qualquer muda com sintoma e raio de 1 metro ao redor.',
      'Higienização completa dos pisos com cal virgem ou solução de amônia quaternária.',
      'Uso de água de irrigação de fonte limpa (poço artesiano protegido).'
    ],
    biologicalControl: [
      'Bacillus velezensis / Trichoderma virens em regas programadas desde a germinação.',
      'Pseudomonas putida cepa antagonista de oomicetos.',
      'Fosfitos de potássio ou cobre para indução da síntese de fitoalexinas.'
    ],
    chemicalControl: [
      'Cimoxanil + Mancozebe.',
      'Zoxamida + Mancozebe.',
      'Fluopicolide + Propamocarbe.',
      'Oxatiapiprolina (inibidor de oxisteróis).'
    ],
    organicControl: [
      'Calda Viçosa (Cobre + Zinco + Magnésio + Boro + Cal) em dosagem preventiva reduzida.',
      'Extrato fermentado de Urtiga (Urtica dioica) e biofertilizante enriquecido com Silício.',
      'Extrato concentrado de Cúrcuma e Própolis como fungistático natural.'
    ],
    physicalControl: [
      'Instalação de rodapé sanitário em alvenaria e pedrisco lavado com hipoclorito no piso.',
      'Substituição e descarte seguro de tubetes e bandejas contaminados sem reaproveitamento.',
      'Filtragem da água de irrigação com elementos filtrantes de quartzo e lâmpada UV-C.'
    ],
    realPhotoUrl: '/nursery_phytophthora.jpg',
    photoCaption: 'Lesão castanho-escura aquosa no caule com colapso e murcha rápida do ápice vegetativo em tubete.',
    photoTag: 'Murcha de Fitóftora'
  },
  {
    id: 'npd-xanthomonas-06',
    name: 'Mancha-Bacteriana & Cancro Bacteriano',
    scientificName: 'Xanthomonas campestris / Xanthomonas vesicatoria / X. citri',
    category: 'bacteria',
    affectedCrops: ['Tomate', 'Pimentão', 'Brássicas', 'Citros', 'Begônia', 'Mamoeiro'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Pequenas pontuações anulares encharcadas (aspecto oleoso) de 1 a 3 mm, que evoluem para manchas circulares ou angulares marrons escuras com halo clorótico amarelo nítido ao redor. Em brássicas causa a clássica lesão em "V" a partir da borda foliar.',
    favorableConditions: 'Alta temperatura (24°C a 32°C), umidade relativa alta e respingos diretos de gotas de irrigação por aspersão.',
    damageSeverity: 'alta',
    economicImpact: 'Disseminação sistêmica rápida entre bandejas vizinhas pelos respingos de água, contaminando lotes comerciais.',
    preventiveManagement: [
      'Utilizar sementes termicamente tratadas (50°C por 25 min) ou certificadas livres de patógenos.',
      'Adotar sistema de microaspersão de gota ultrafina ou irrigação por sub-irrigação.',
      'Evitar o manuseio e raleio de mudas com a folhagem molhada.'
    ],
    biologicalControl: [
      'Bacillus amyloliquefaciens (cepas antagonistas bacterianas).',
      'Bacteriófagos específicos contra Xanthomonas (biocontrole lítico de alta especificidade).',
      'Pseudomonas fluorescens competidora de nicho foliar.'
    ],
    chemicalControl: [
      'Oxicloreto de Cobre ou Hidróxido de Cobre em doses preventivas submáximas.',
      'Kasugamicina (antibiótico agrícola específico para bacteriose com registro MAPA).',
      'Sulfato de Cobre Tribásico.'
    ],
    organicControl: [
      'Extrato fluido de Semente de Cítricos (Grapefruit extract) rico em bioflavonoides bactericidas.',
      'Calda Bordalesa 0,2% combinada com extrato aquoso de alho.',
      'Vinagre de maçã diluído a 0,5% (Acidificação suave do filoplano).'
    ],
    physicalControl: [
      'Termoterapia de sementes em banho-maria mantido a 50°C por 25 minutos.',
      'Barreiras físicas de acrílico/policarbonato entre bancadas para bloquear respingos horizontais.',
      'Esterilização ultravioleta (UV-C) da lâmina de água em sistemas de subirrigação.'
    ],
    realPhotoUrl: '/nursery_xanthomonas.jpg',
    photoCaption: 'Pontuações necróticas circulares com halo amarelo intenso características de infecção bacteriana em folhas jovens.',
    photoTag: 'Mancha Bacteriana'
  },
  {
    id: 'npd-pectobacterium-07',
    name: 'Podridão Mole & Talo Negro',
    scientificName: 'Pectobacterium carotovorum / Dickeya dadantii',
    category: 'bacteria',
    affectedCrops: ['Alface', 'Tomate', 'Pimentão', 'Couve', 'Orquídeas', 'Begônia'],
    plantPart: 'caule_haste',
    symptomsDescription: 'Desintegração úmida, viscosa e fétida da base do caule e medula interna (talo negro). As plântulas colapsam rapidamente com odor desagradável característico de fermentação péctica bacteriana.',
    favorableConditions: 'Excesso de nitrogênio na fertirrigação (tecidos estiolados e macios), ferimentos causados por ferramentas ou insetos, encharcamento e temperaturas acima de 28°C.',
    damageSeverity: 'alta',
    economicImpact: 'Perda irreparável de bandejas de alface e solanáceas nas bancadas de viveiro.',
    preventiveManagement: [
      'Equilibrar a relação Nitrogênio:Cálcio na fertirrigação para garantir paredes celulares espessas.',
      'Eliminar bandejas com sintomas sem tocar nas mudas sadias vizinhas.',
      'Limpeza de bancadas com hipoclorito a 2% entre ciclos de produção.'
    ],
    biologicalControl: [
      'Bacillus subtilis e Pseudomonas fluorescens aplicados via substrato para competição de nicho.',
      'Bacteriófagos específicos contra Pectobacterium.',
      'Silício solúvel (Silicato de Potássio) para fortalecimento mecânico da epiderme.'
    ],
    chemicalControl: [
      'Cobre Quelatizado / Sulfato de Cobre Tribásico.',
      'Oxicloreto de Cobre foliar em aplicação preventiva.',
      'Kasugamicina em foco inicial.'
    ],
    organicControl: [
      'Extrato concentrado de Própolis (10 ml/L) via drench no colo.',
      'Extrato de Mamona e Calda Sulfocálcica diluída a 0,2%.',
      'Aplicação de Cinza de Madeira peneirada na base do caule (efeito dessecante e alcalinizante).'
    ],
    physicalControl: [
      'Sanitização mecânica com lavadora de alta pressão e Hipoclorito de Sódio a 2%.',
      'Secagem forçada com sopradores térmicos de bancadas limpas antes do novo lote.',
      'Eliminação com pinça esterilizada no fogo das mudas infectadas.'
    ],
    realPhotoUrl: '/nursery_pectobacterium.jpg',
    photoCaption: 'Necrose negra e amolecimento aquoso mucilaginoso na região basal da haste junto ao substrato.',
    photoTag: 'Talo Negro & Podridão Mole'
  },
  {
    id: 'npd-tswv-08',
    name: 'Vira-Cabeça / Tospovirose em Mudas',
    scientificName: 'Tomato Spotted Wilt Virus (TSWV / GRSV / CSNV)',
    category: 'virus',
    affectedCrops: ['Tomate', 'Pimentão', 'Alface', 'Petúnia', 'Crisântemo', 'Mamoeiro'],
    plantPart: 'toda_planta',
    symptomsDescription: 'Bronzeamento e queima apical das folhas novas, pontuações necróticas escuras, anéis concêntricos cloróticos, enrolamento do meristema apical (curvatura em cajado / vira-cabeça) e paralisação total do crescimento vegetativo.',
    favorableConditions: 'Presença e circulação do inseto vetor (Tripes Frankliniella occidentalis), temperaturas quentes (22°C a 30°C) e estufas sem telas antiafídeos/antitripes.',
    damageSeverity: 'critica',
    economicImpact: 'Inviabilização absoluta da muda: uma única muda contaminada levada ao campo pode devastar lavouras inteiras.',
    preventiveManagement: [
      'Fechamento total das estufas com telas de malha ultradensa (50 mesh anti-tripes).',
      'Instalação de antecâmara com portas duplas e cortina de ar na entrada das estufas.',
      'Monitoramento semanal com armadilhas adesivas azuis (1 armadilha a cada 50 m²).',
      'Descarte imediato em sacos fechados de qualquer muda suspeita.'
    ],
    biologicalControl: [
      'Controle biológico maciço do vetor com percevejo predador Orius insidiosus.',
      'Ácaros predadores Neoseiulus cucumeris / Amblyseius swirskii para predação de ninfas de tripes.',
      'Beauveria bassiana para controle microbiológico dos insetos vetores.'
    ],
    chemicalControl: [
      'Não há viricidas químicos: o controle é 100% focado no vetor (Espinetoram, Ciantraniliprole, Acetamiprido).',
      'Tratamento preventivo das mudas no pré-transplantio.',
      'Imidacloprido / Thiamethoxam drench no substrato.'
    ],
    organicControl: [
      'Extrato concentrado de Neem (Azadiractina 1%) para repulsão do vetor tripes.',
      'Extrato de Pimenta Malagueta + Alho para dissuasão de alimentação do vetor.',
      'Óleo mineral orgânico de alta pureza (0,5%) para barreira mecânica nos estiletes de sugadores.'
    ],
    physicalControl: [
      'Tela anti-tripes de 50 mesh em todas as aberturas da estufa com inspeção semanal.',
      'Eliminação completa de vegetação espontânea num raio de 30 metros ao redor da estufa.',
      'Instalação de porta dupla com câmara de vácuo/ar forçado na entrada do viveiro.'
    ],
    realPhotoUrl: '/nursery_tswv_virus.jpg',
    photoCaption: 'Bronzeamento, pontuações necróticas severas e enrolamento do ápice em muda jovem de tomateiro.',
    photoTag: 'Vira-Cabeça (Tospovírus)'
  },
  {
    id: 'npd-thrips-09',
    name: 'Tripes-das-Mudas & Flores',
    scientificName: 'Frankliniella occidentalis / Thrips tabaci',
    category: 'praga_inseto',
    affectedCrops: ['Tomate', 'Pimentão', 'Pepino', 'Alface', 'Crisântemo', 'Morangueiro', 'Cafeeiro'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Prateamento e estrias esbranquiçadas na epiderme foliar causadas pela raspagem e sucção de seiva, pontilhada com pequenas fezes escuras e brilhantes. Causa deformação foliar e transmite o vírus do vira-cabeça.',
    favorableConditions: 'Clima quente e seco (25°C a 32°C), baixa umidade do ar e presença de flores ou ervas daninhas hospedeiras nos arredores da estufa.',
    damageSeverity: 'critica',
    economicImpact: 'Extremamente destrutivo pelo duplo impacto: dano mecânico foliar e transmissão fatal de tospoviroses.',
    preventiveManagement: [
      'Manter piso limpo, britado e livre de qualquer erva daninha num raio de 20 metros.',
      'Uso de armadilhas cromotrópicas adesivas de cor AZUL.',
      'Uso de telas laterais de malha 50 mesh anti-tripes.'
    ],
    biologicalControl: [
      'Orius insidiosus (percevejo predador voraz de adultos e ninfas).',
      'Amblyseius swirskii / Amblydromalus manihoti (ácaros predadores).',
      'Beauveria bassiana (cepa IBCB 66) ou Metarhizium anisopliae.'
    ],
    chemicalControl: [
      'Espinetoram (Espinosina de alta eficiência).',
      'Ciantraniliprole (Diamida antranílica).',
      'Tiametoxam / Acetamiprido.'
    ],
    organicControl: [
      'Sabão potássico saponificado com extrato de Neem a 1%.',
      'Extrato fluido de Piretro natural (Pyrethrum) ativado com óleo vegetal.',
      'Terra de Diatomáceas micronizada pulverizada nas folhas (efeito abrasivo e desidratante).'
    ],
    physicalControl: [
      'Armadilhas adesivas de cor AZUL brilhante instaladas a 10 cm acima das bandejas.',
      'Nebulização intermitente para elevação da umidade relativa (>75%), inibindo a mobilidade do tripes.',
      'Mulching prateado/aluminizado refletor nas bancadas para desorientar o voo dos adultos.'
    ],
    realPhotoUrl: '/nursery_thrips_damage.jpg',
    photoCaption: 'Prateamento foliar com micro-pontuações fecais escuras e inseto adulto de tripes alongado na superfície.',
    photoTag: 'Tripes em Folha Jovem'
  },
  {
    id: 'npd-whitefly-10',
    name: 'Mosca-Branca das Sementeiras',
    scientificName: 'Bemisia tabaci (biótipos B / MEAM1 e Q / MED)',
    category: 'praga_inseto',
    affectedCrops: ['Tomate', 'Pimentão', 'Cucurbitáceas', 'Mamoeiro', 'Begônia', 'Melancia'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Presença de pequenos insetos brancos alados na face inferior das folhas que voam em nuvem ao toque. Ninfas sésseis translúcidas sob os cotilédones excretam honeydew, induzindo fumagina e transmitindo Begomovírus.',
    favorableConditions: 'Temperaturas elevadas (26°C a 35°C), baixa umidade e cultivo protegido sem barreira física.',
    damageSeverity: 'critica',
    economicImpact: 'Transmissão irreversível do mosaico-dourado e geminivírus para lavouras de solanáceas.',
    preventiveManagement: [
      'Armadilhas adesivas cromotrópicas AMARELAS instaladas logo acima da altura das bandejas.',
      'Vistorias diárias na face abaxial das folhas com espelho ou lupa.',
      'Telas de retenção física nas entradas de ar da estufa.'
    ],
    biologicalControl: [
      'Encarsia formosa / Eretmocerus mundus (microvespas parasitóides de ninfas).',
      'Chrysoperla externa (crisopídeos predadores generalistas).',
      'Beauveria bassiana / Cordyceps fumosorosea (Isaria fumosorosea).'
    ],
    chemicalControl: [
      'Piriproxifem (regulador de crescimento juvenil de insetos / IGR).',
      'Espirotetramate (sistêmico via xilema e floema).',
      'Ciantraniliprole ou Sulfoxaflor.'
    ],
    organicControl: [
      'Óleo de Neem frio prensado a 1% com espalhante biodegradável.',
      'Extrato de Timbó / Rotenona orgânica.',
      'Sabão de Coco neutro a 1,5% para lavagem mecânica e asfixia de ninfas sésseis.'
    ],
    physicalControl: [
      'Armadilhas cromotrópicas amarelas contínuas ao longo de toda a estufa.',
      'Cortina de ar contínua sopra-insetos na porta de acesso dos funcionários.',
      'Cobertura temporária das bancadas com manta de tecido não-tecido (TNT agrícola 17g/m²).'
    ],
    realPhotoUrl: '/nursery_whitefly_adults.jpg',
    photoCaption: 'Adultos alados de mosca-branca e ninfas translúcidas sugando seiva na face inferior de folha de muda.',
    photoTag: 'Mosca-Branca em Mudas'
  },
  {
    id: 'npd-fungusgnat-11',
    name: 'Mosca-dos-Fungos & Larva-do-Substrato (Fungus Gnat)',
    scientificName: 'Bradysia difformis / Bradysia coprophila',
    category: 'praga_inseto',
    affectedCrops: ['Eucalipto', 'Cafeeiro', 'Tomate', 'Pimentão', 'Alface', 'Orquídeas', 'Flores'],
    plantPart: 'colo_raiz',
    symptomsDescription: 'Pequenos mosquitos escuros (2 a 4 mm) voando sobre as bandejas úmidas. Suas larvas translúcidas vivem no substrato e devoram pelos absorventes, raízes secundárias e o colo das plântulas, transmitindo Pythium e Fusarium.',
    favorableConditions: 'Substrato orgânico permanentemente encharcado com proliferação de algas e fungos superficiais.',
    damageSeverity: 'alta',
    economicImpact: 'Mortalidade radicular invisível de até 40% das mudas e transmissão ativa de oósporos fúngicos.',
    preventiveManagement: [
      'Permitir secagem da superfície do substrato entre as irrigações.',
      'Eliminar acúmulo de algas verdes nas bancadas e bandejas.',
      'Armadilhas adesivas amarelas na altura do substrato.'
    ],
    biologicalControl: [
      'Bacillus thuringiensis subsp. israelensis (BTI) aplicado via drench no substrato.',
      'Nematoides entomopatogênicos (Steinernema feltiae).',
      'Ácaros predadores de solo Stratiolaelaps scimitus (Hypoaspis miles).'
    ],
    chemicalControl: [
      'Diflubenzuron ou Triflumuron (inibidores de síntese de quitina aplicados via drench).',
      'Ciantraniliprole drench.',
      'Thiamethoxam drench.'
    ],
    organicControl: [
      'Extrato de Neem em drench radicular (Azadiractina 0,5%).',
      'Infusão concentrada de Fumo de Rolo com Sabão neutro no substrato.',
      'Aplicação de Areia de Quartzo grossa seca ou Casca de Arroz carbonizada na superfície da célula (barreira para oviposição).'
    ],
    physicalControl: [
      'Camada de cobertura física superficial (mulch inerte) no tubete para impedir a postura de ovos pela fêmea.',
      'Armadilhas adesivas amarelas horizontais colocadas no nível dos tubetes.',
      'Uso de bancadas vazadas com alta aeração inferior para drenagem rápida.'
    ],
    realPhotoUrl: '/nursery_fungus_gnat.jpg',
    photoCaption: 'Larva translúcida de cabeça preta e adulto de Fungus Gnat danificando raízes jovens em substrato de turfa.',
    photoTag: 'Fungus Gnat & Larva'
  },
  {
    id: 'npd-aphid-12',
    name: 'Pulgão-das-Mudas & Brotos',
    scientificName: 'Myzus persicae / Aphis gossypii',
    category: 'praga_inseto',
    affectedCrops: ['Alface', 'Pimentão', 'Tomate', 'Citros', 'Mamoeiro', 'Melancia', 'Flores'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Colônias densas de insetos sugadores verdes ou amarelos concentradas nas brotações apicais tenras e sob as folhas novas. Provocam encarquilhamento, atrofia das folhas, deformação do broto e excreção de melaço.',
    favorableConditions: 'Clima ameno a moderado (18°C a 26°C), ausência de chuvas diretas e alta taxa de adubação nitrogenada.',
    damageSeverity: 'alta',
    economicImpact: 'Paralisação do desenvolvimento foliar e vetor de dezenas de vírus do mosaico (CMV, PVY, TuMV).',
    preventiveManagement: [
      'Inspeção sistemática das gemas apicais antes da liberação das mudas para venda.',
      'Armadilhas adesivas amarelas na estufa.',
      'Controle rigoroso de formigas doceiras que protegem os pulgões.'
    ],
    biologicalControl: [
      'Aphidius colemani / Aphidius ervi (microvespas que momificam os pulgões).',
      'Joaninhas (Cycloneda sanguinea) e larvas de Crisopídeos (Chrysoperla externa).',
      'Lecanicillium lecanii (fungo entomopatogênico).'
    ],
    chemicalControl: [
      'Flonicamida (bloqueador seletivo de alimentação de sugadores).',
      'Acetamiprido ou Tiametoxam.',
      'Pimatrozina.'
    ],
    organicControl: [
      'Calda de Fumo com Sabão de Coco (aplicação focada sob a folhagem).',
      'Óleo de Neem emulsionado a 1%.',
      'Extrato de Urtiga concentrado (repelente e fortalecedor de epiderme).'
    ],
    physicalControl: [
      'Jato de água sob pressão fraca focado na colônia para deslodar mecanicamente os pulgões.',
      'Telas anti-afídeos laterais de 50 mesh.',
      'Armadilhas amarelas d\'água (bacias amarelas com água e detergente neutro).'
    ],
    realPhotoUrl: '/nursery_aphids_colony.jpg',
    photoCaption: 'Colônia densa de pulgões verdes sugando o broto apical e provocando encarquilhamento foliar em muda.',
    photoTag: 'Pulgões no Ápice'
  },
  {
    id: 'npd-mite-13',
    name: 'Ácaro-Rajado em Mudas',
    scientificName: 'Tetranychus urticae',
    category: 'acaro',
    affectedCrops: ['Tomate', 'Pimentão', 'Morangueiro', 'Pepino', 'Feijão', 'Mamoeiro', 'Petúnia'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Micro-pontuações cloróticas amareladas no limbo foliar que progridem para bronzeamento e dessecação. Em infestações avançadas, observam-se finas teias de seda unindo os cotilédones e ápices vegetativos com colônias ativas.',
    favorableConditions: 'Ambientes muito quentes (temperaturas > 28°C) e com umidade relativa do ar extremamente baixa (< 45%) sob estufas plásticas.',
    damageSeverity: 'alta',
    economicImpact: 'Seca prematura de cotilédones e desfolha precoce de mudas jovens.',
    preventiveManagement: [
      'Manejo de umidade relativa na estufa com sistema de micro-nebulização (fog) nos horários quentes.',
      'Evitar poeira nas vias de circulação internas da estufa.',
      'Vistoria com lupa de 20x na face abaxial das folhas basais e medianas.'
    ],
    biologicalControl: [
      'Neoseiulus californicus (ácaro predador adaptado a temperaturas elevadas).',
      'Phytoseiulus macropilis / Phytoseiulus persimilis (predador ávido em focos agudos).',
      'Beauveria bassiana em pulverização fina focando a face inferior das folhas.'
    ],
    chemicalControl: [
      'Abamectina (Avermectina de ação translaminar).',
      'Cipetrometifeno ou Espirodiclofeno.',
      'Hexitiazox (ovicida e larvicida de ácaros tetraniquídeos).'
    ],
    organicControl: [
      'Enxofre Calda Sulfocálcica a 0,3% (atenção para aplicar nas horas frias do dia).',
      'Óleo essencial de Clandestina / Alho e Melaleuca.',
      'Extrato vegetal de neem e óleo de algodão.'
    ],
    physicalControl: [
      'Elevação imediata da umidade relativa do ar via nebulização sobre a copa das mudas (>75% inibe a colocação de ovos do ácaro-rajado).',
      'Limpeza e lavagem das vias de acesso para eliminação de poeira e poeira suspensa.',
      'Descarte em saco plástico fechado das bandejas foco com teias sedosas intensas.'
    ],
    realPhotoUrl: '/nursery_spider_mite.jpg',
    photoCaption: 'Ácaros minúsculos com manchas dorsais e teias sedosas finas causando clorose em muda jovem.',
    photoTag: 'Ácaro-Rajado & Teias'
  },
  {
    id: 'npd-cutworm-14',
    name: 'Lagarta-Rosca & Cortadora de Plântulas',
    scientificName: 'Agrotis ipsilon / Spodoptera frugiperda',
    category: 'praga_inseto',
    affectedCrops: ['Tomate', 'Pimentão', 'Milho', 'Alface', 'Couve', 'Eucalipto', 'Cafeeiro'],
    plantPart: 'caule_haste',
    symptomsDescription: 'Plântulas recém-emergidas com a haste totalmente seccionada/cortada rente ao substrato durante a noite. A lagarta de coloração cinzento-ardósia fica enterrada no substrato durante o dia, enrolando-se em espiral quando desenterrada.',
    favorableConditions: 'Substrato orgânico mantido descoberto, presença de mariposas adultas atraídas pela iluminação noturna da estufa.',
    damageSeverity: 'alta',
    economicImpact: 'Corte mecânico letal de centenas de plântulas em uma única noite por uma pequena população de lagartas.',
    preventiveManagement: [
      'Vedação perfeita das aberturas da estufa com telas para impedir a entrada de mariposas adultas à noite.',
      'Uso de armadilhas luminosas ou armadilhas de feromônio sexual no perímetro exterior das estufas.',
      'Inspeção manual cuidadosa de bandejas com mudas cortadas.'
    ],
    biologicalControl: [
      'Bacillus thuringiensis var. kurstaki / aizawai (Bt) pulverizado ao entardecer.',
      'Baculovírus Spodoptera (SfMNPV).',
      'Trichogramma pretiosum (parasitóide de ovos de mariposas).'
    ],
    chemicalControl: [
      'Clorantraniliprole ou Flubendiamida (Diamidas antranílicas de alta seletividade).',
      'Benzoato de Emamectina.',
      'Espinetoram.'
    ],
    organicControl: [
      'Isca atrativa orgânica (Farelo de Trigo + Melaço de Cana + Bt ou Neem) distribuída ao redor das bancadas.',
      'Extrato concentrado de Neem via drench ao entardecer.',
      'Extrato de pimenta com sabão potássico.'
    ],
    physicalControl: [
      'Cata manual noturna das lagartas com o auxílio de lanterna de luz vermelha.',
      'Anéis protetores de plástico/papelão ao redor do colo de plântulas valiosas em vasos.',
      'Desligamento das luzes internas do viveiro ao anoitecer para evitar atração de mariposas.'
    ],
    realPhotoUrl: '/nursery_cutworm_stem.jpg',
    photoCaption: 'Lagarta enrolada junto ao substrato após seccionar a haste basal da plântula em célula de bandeja.',
    photoTag: 'Lagarta Cortadora'
  },
  {
    id: 'npd-rhizoctonia-15',
    name: 'Mela & Tombamento por Rhizoctonia',
    scientificName: 'Rhizoctonia solani (Teleomorfo: Thanatephorus cucumeris)',
    category: 'fungo',
    affectedCrops: ['Cafeeiro', 'Eucalipto', 'Tomate', 'Brássicas', 'Alface', 'Morangueiro'],
    plantPart: 'colo_raiz',
    symptomsDescription: 'Lesões castanho-avermelhadas afundadas e secas no colo da plântula (cancro de canela). Em condições de alta umidade, observa-se micélio castanho em forma de teia de aranha (mela) "trançando" as folhas entre células vizinhas de bandejas.',
    favorableConditions: 'Temperaturas elevadas no substrato (25°C a 32°C), excesso de matéria orgânica não-compostada e alta densidade de plantas.',
    damageSeverity: 'critica',
    economicImpact: 'Mela rápida de folhas em manchões contínuos dentro de bandejas de viveiro.',
    preventiveManagement: [
      'Utilizar substratos bem compostados e aerados.',
      'Evitar superpopulação de plântulas por célula.',
      'Desinfecção de bancadas e caixas de transporte.'
    ],
    biologicalControl: [
      'Trichoderma asperellum / Trichoderma harzianum em drench no substrato.',
      'Bacillus subtilis cepa AP-3.',
      'Streptomyces sp. antagonista de micélio fúngico.'
    ],
    chemicalControl: [
      'Fludioxonil + Metalaxil-M.',
      'Azoxistrobina + Difenoconazol.',
      'Tiofanato-Metílico em drench.'
    ],
    organicControl: [
      'Biofertilizante líquido rico em Trichoderma nativo e cinzas vegetais.',
      'Extrato de alho com óleo vegetal de girassol.',
      'Calda Sulfocálcica fraca (0,2%) direcionada ao substrato.'
    ],
    physicalControl: [
      'Passagem de ar quente seco entre as bancadas para interromper o crescimento do micélio em teia.',
      'Solarização do substrato em canteiros com lona plástica de 150 micras por 40 dias.',
      'Descarte e queima do material vegetal infectado em incinerador agrícola.'
    ],
    realPhotoUrl: '/nursery_rhizoctonia.jpg',
    photoCaption: 'Micélio castanho em formato de teia e lesão necrótica afundada no colo de plântula em bandeja de viveiro.',
    photoTag: 'Mela de Rhizoctonia',
    secondaryPhotoUrl: '/pythium_roots.jpg',
    secondaryPhotoCaption: 'Necrose e apodrecimento seco da casca do colo em plântulas jovens.',
    secondaryPhotoTag: 'Cancro de Colo'
  },
  {
    id: 'npd-cercospora-16',
    name: 'Cercosporiose de Mudas (Olho-de-Pombo)',
    scientificName: 'Cercospora coffeicola / Cercospora beticola',
    category: 'fungo',
    affectedCrops: ['Cafeeiro', 'Alface', 'Pimentão', 'Morangueiro'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Manchas foliares circulares com centro claro/cinzento e auréola marrom-avermelhada circundada por halo amarelo reluzente (aspecto de "olho de pombo"). Causa desfolha precoce drástica em mudas de café.',
    favorableConditions: 'Insolação excessiva aliada a estresse nutricional (principalmente deficiência de Nitrogênio e Potássio) e molhamento foliar intermitente.',
    damageSeverity: 'alta',
    economicImpact: 'Desfolha completa das mudas de café em viveiro, atrasando a expedição em até 6 meses.',
    preventiveManagement: [
      'Adubação equilibrada N:K via fertirrigação contínua.',
      'Manejo correto do sombreamento (telas de 50% de sombra na fase inicial).',
      'Evitar estresse hídrico nas mudas.'
    ],
    biologicalControl: [
      'Bacillus subtilis pulverizado quinzenalmente.',
      'Trichoderma harzianum foliar.',
      'Bioinseticidas microbiológicos promotores de crescimento.'
    ],
    chemicalControl: [
      'Ciproconazol + Azoxistrobina.',
      'Pyraclostrobin + Fluxapyroxad.',
      'Tebuconazol ou Difenoconazol.'
    ],
    organicControl: [
      'Calda Bordalesa a 0,5% aplicada preventivamente a cada 14 dias.',
      'Extrato de Própolis com micro-elementos (Boro e Zinco).',
      'Biofertilizante foliar supermagro filtrado.'
    ],
    physicalControl: [
      'Ajuste das telas de sombreamento para reduzir o estresse por radiação direta UV.',
      'Cata manual e descarte das primeiras folhas basais apresentando manchas de olho-de-pombo.',
      'Uso de cobertura morta inerte no saquinho/tubete.'
    ],
    realPhotoUrl: '/nursery_cercospora.jpg',
    photoCaption: 'Lesões circulares com centro cinzento claro e halo amarelo (olho-de-pombo) em folhas de muda de café.',
    photoTag: 'Olho-de-Pombo em Café',
    secondaryPhotoUrl: '/botrytis_cinerea_leaf.jpg',
    secondaryPhotoCaption: 'Evolução da necrose foliar e queima precoce em folhas cotiledonares.',
    secondaryPhotoTag: 'Queima Foliar'
  },
  {
    id: 'npd-cylindrocladium-17',
    name: 'Mancha de Cilindrocládio & Podridão de Estacas',
    scientificName: 'Calonectria pteridis / Cylindrocladium candelabrum',
    category: 'fungo',
    affectedCrops: ['Eucalipto', 'Cafeeiro', 'Nativas'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Lesões foliares de cor castanho-escura que evoluem para manchões secos de grande extensão com pontuações esbranquiçadas (esporulação). Em jardim clonal causam desfolha intensa e podridão da base de miniestacas.',
    favorableConditions: 'Temperaturas altas (25°C a 30°C), umidade saturada na câmara de enraizamento (>95%) e lâmina de água acumulada sobre as folhas.',
    damageSeverity: 'critica',
    economicImpact: 'Perda massiva de miniestacas no jardim clonal de eucalipto.',
    preventiveManagement: [
      'Desinfecção rigorosa de tesouras e lâminas de poda com álcool 70° ou amônia quaternária.',
      'Redução do tempo de nebulização na câmara de enraizamento assim que o calo se formar.',
      'Coleta de miniestacas apenas de plantas-mãe sadias.'
    ],
    biologicalControl: [
      'Trichoderma harzianum incorporado no substrato turfoso.',
      'Bacillus velezensis em pulverização foliar nas matrizes.',
      'Clonostachys rosea.'
    ],
    chemicalControl: [
      'Tiofanato-Metílico + Fludioxonil.',
      'Azoxistrobina + Tebunconazol.',
      'Clorotalonil preventivo.'
    ],
    organicControl: [
      'Óleo essencial de Melaleuca (0,3%) pulverizado nos minijardins clonais.',
      'Extrato aquoso de Alho com Cobre orgânico quelatizado.',
      'Extrato de Semente de Toranja (Citrus paradisi).'
    ],
    physicalControl: [
      'Esterilização física de ferramentas de poda por imersão em água fervente a 100°C por 3 minutos.',
      'Uso de temporizadores diários inteligentes com sensores de molhamento foliar (folha eletrônica) na nebulização.',
      'Excisão imediata e incineração de brotos com manchas necróticas.'
    ],
    realPhotoUrl: '/nursery_cylindrocladium.jpg',
    photoCaption: 'Necrose e podridão castanha na base da miniestaca de eucalipto e queima foliar em câmara de enraizamento.',
    photoTag: 'Cilindrocládio em Eucalipto',
    secondaryPhotoUrl: '/botrytis_cinerea_stem.jpg',
    secondaryPhotoCaption: 'Podridão úmida descendente da estaca de propagação.',
    secondaryPhotoTag: 'Podridão de Estaca'
  },
  {
    id: 'npd-diaphorina-18',
    name: 'Psilídeo-dos-Citros (Vetor do HLB / Greening)',
    scientificName: 'Diaphorina citri',
    category: 'praga_inseto',
    affectedCrops: ['Citros'],
    plantPart: 'folhas_cotiledones',
    symptomsDescription: 'Pequenos insetos (2 a 3 mm) que se posicionam em ângulo de 45° em relação ao broto vegetal ao sugarem seiva. Ninfas amarelas secretam fios cerosos brancos em espiral. É o vetor transmissor da bactéria Candidatus Liberibacter (Greening / HLB).',
    favorableConditions: 'Presença de brotações novas e tenras nas mudas de citros e temperaturas entre 24°C e 30°C.',
    damageSeverity: 'critica',
    economicImpact: 'Contaminação com HLB (Greening), resultando na erradicação compulsória do lote de mudas por lei federal.',
    preventiveManagement: [
      'Produção 100% OBRIGATÓRIA em estufas agrícolas fechadas com tela antiafídica de 50 mesh.',
      'Instalação de antecâmara com porta dupla e cortina de ar na entrada do viveiro cítrico.',
      'Eliminação de mirtas (Murraya paniculata) no entorno do viveiro.'
    ],
    biologicalControl: [
      'Tamarixia radiata (vespinha parasitóide específica de ninfas de psilídeo).',
      'Chrysoperla externa predando ninfas.',
      'Isaria fumosorosea (Cordyceps fumosorosea) ou Beauveria bassiana.'
    ],
    chemicalControl: [
      'Imidacloprido / Thiamethoxam via drench no tubete/citrovaso.',
      'Dimetoato ou Malationa.',
      'Bifentrina ou Lambda-Cialotrina.'
    ],
    organicControl: [
      'Óleo mineral de alta pureza (1%) pulverizado na brotação para impedir postura de ovos.',
      'Óleo vegetal de Neem emulsionado com sabão de potássio.',
      'Extrato concentrado de Anona (graviola/atemoia) com ação inseticida natural.'
    ],
    physicalControl: [
      'Viveiro telado certificado anti-psilídeo com malha igual ou superior a 50 mesh sem rasgos.',
      'Armadilhas adesivas amarelas na altura das brotações apicais para detecção prévia.',
      'Inspeção com lupa manual de 20x em 100% dos brotos das mudas preparadas para enxertia.'
    ],
    realPhotoUrl: '/nursery_diaphorina.jpg',
    photoCaption: 'Adultos de psilídeo pousados em ângulo de 45° e ninfas cerosas em broto novo de porta-enxerto cítrico.',
    photoTag: 'Psilídeo-dos-Citros',
    secondaryPhotoUrl: '/nursery_whitefly_adults.jpg',
    secondaryPhotoCaption: 'Ninfas sésseis com secreções açucaradas e cerosas no limbo foliar.',
    secondaryPhotoTag: 'Ninfas de Psilídeo'
  },
  {
    id: 'npd-nematode-19',
    name: 'Nematoides-de-Galha em Mudas',
    scientificName: 'Meloidogyne incognita / Meloidogyne javanica',
    category: 'nematoide',
    affectedCrops: ['Tomate', 'Pimentão', 'Cafeeiro', 'Melancia', 'Mamoeiro', 'Pepino'],
    plantPart: 'colo_raiz',
    symptomsDescription: 'Presença de engrossamentos e galhas esféricas nodulares nas raízes das mudas. O sistema radicular fica reduzido, sem radicelas absorventes. Na parte aérea, a muda apresenta amarelecimento, raquitismo e murcha nas horas quentes.',
    favorableConditions: 'Uso de solo ou substrato não-esterilizado, água de irrigação de captação de superfície contaminada e temperaturas no substrato acima de 26°C.',
    damageSeverity: 'critica',
    economicImpact: 'Interdição e destruição de todo o lote de mudas contaminado por exigência fitossanitária.',
    preventiveManagement: [
      'Proibição absoluta do uso de terra de barranco não-tratada no substrato.',
      'Uso exclusivo de substratos comerciais certificados (turfa/casca de pínus).',
      'Análise nematológica prévia de lote de substrato e água de irrigação.'
    ],
    biologicalControl: [
      'Purpureocillium lilacinum (fungo parasita de ovos e fêmeas de nematoides).',
      'Bacillus methylotrophicus / Bacillus firmus via drench radicular.',
      'Trichoderma chlamydosporium.'
    ],
    chemicalControl: [
      'Fluopyram (Nematicida específico de nova geração).',
      'Abamectina drench no substrato.',
      'Cadusafos ou Terbufos (onde permitido).'
    ],
    organicControl: [
      'Torta de Mamona incorporada ao substrato (liberação de ricina e nematicidas naturais).',
      'Extrato de Tagetes (Cravo-de-defunto) rico em alfa-tertienil nematicida.',
      'Chá de Crotalária spectabilis aplicado via rega.'
    ],
    physicalControl: [
      'Vaporização / Tratamento térmico do substrato a 80°C por 30 minutos em autoclaves/caldeiras.',
      'Solarização do substrato úmido em túneis plásticos durante os meses de verão.',
      'Suspensão total de bancadas a 80cm do piso com isolamento de plástico no chão.'
    ],
    realPhotoUrl: '/meloidogyne_root_damage.jpg',
    photoCaption: 'Galhas nodulares esféricas e redução drástica de radicelas absorventes no sistema radicular de muda em viveiro.',
    photoTag: 'Galhas Radiculares',
    secondaryPhotoUrl: '/meloidogyne_microscope.jpg',
    secondaryPhotoCaption: 'Fêmea globosa de Meloidogyne sob microscopia ótica com massa de ovos.',
    secondaryPhotoTag: 'Microscopia de Fêmea'
  }
];
