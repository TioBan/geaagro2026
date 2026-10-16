import {
  OfflineDiagnosticRecord,
  DichotomousQuestion,
  VisualCharacteristicsFeatures,
  DiagnosticComparisonResult,
} from '../types/offlineDiagnostic';

export const dichotomousQuestionsList: DichotomousQuestion[] = [
  {
    id: 'q_leaf_yellow',
    questionText: '1. As folhas apresentam amarelamento (clorose)?',
    helpTip: 'Observe se há perda da cor verde nas folhas basais ou apicais.',
    relatedFeatureKey: 'leafColor',
  },
  {
    id: 'q_interveinal_chlorosis',
    questionText: '2. O amarelamento ocorre no limbo foliar mantendo as nervuras verdes (clorose internerval)?',
    helpTip: 'Típico de deficiências de Ferro (folhas novas) ou Magnésio (folhas velhas).',
    relatedFeatureKey: 'veinColor',
  },
  {
    id: 'q_leaf_burn',
    questionText: '3. Há queima, ressecamento ou necrose nas bordas das folhas (tip-burn / necrose marginal)?',
    helpTip: 'Comum em deficiência de Cálcio, excesso de salinidade (CE alta) ou falta de Potássio.',
    relatedFeatureKey: 'leafBurnMargin',
  },
  {
    id: 'q_leaf_shape_deformed',
    questionText: '4. As folhas estão encarquilhadas, em forma de copo/gancho ou deformadas?',
    helpTip: 'Pode indicar ataque de ácaros, deficiência de cálcio/boro ou vírus.',
    relatedFeatureKey: 'leafShape',
  },
  {
    id: 'q_spots_lesions',
    questionText: '5. Existem manchas visíveis, lesões necróticas ou círculos concêntricos nas folhas?',
    helpTip: 'Sinal frequente de fungos foliares como Alternaria, Septoria ou Cercospora.',
    relatedFeatureKey: 'hasSpots',
  },
  {
    id: 'q_damping_off',
    questionText: '6. Há estrangulamento aquoso e tombamento de plântulas junto ao colo do substrato (damping-off)?',
    helpTip: 'Característica marcante de Pythium, Rhizoctonia ou Phytophthora em sementeiras.',
    relatedFeatureKey: 'hasDampingOff',
  },
  {
    id: 'q_mold_mycelium',
    questionText: '7. Existe presença de mofo, pó esbranquiçado ou micélio cinzento sobre as plântulas?',
    helpTip: 'Comum em infecções por Botrytis (mofo cinzento) ou Oídio em estufas úmidas.',
    relatedFeatureKey: 'hasMoldOrMycelium',
  },
  {
    id: 'q_visible_insects',
    questionText: '8. Há insetos pequenos, ninfas, pontuações prateadas ou teias visíveis sob as folhas?',
    helpTip: 'Presença direta de tripes, mosca-branca, pulgões ou ácaros fitófagos.',
    relatedFeatureKey: 'visibleInsects',
  },
  {
    id: 'q_dark_roots',
    questionText: '9. As raízes estão escuras, marrons, gelatinosas ou sem pelos absorventes?',
    helpTip: 'Indica podridão radicular, asfixia por encharcamento ou queima por excesso de sais.',
    relatedFeatureKey: 'rootColor',
  },
  {
    id: 'q_substrate_white_crust',
    questionText: '10. O substrato apresenta crosta branca salina superficial ou acúmulo de algas verdes/musgos?',
    helpTip: 'Evidência de excesso de fertirrigação (CE alta) ou irrigação excessiva sem aeração.',
    relatedFeatureKey: 'substrateCondition',
  },
];

export const offlineDiagnosticDatabase: OfflineDiagnosticRecord[] = [
  {
    id: 'diag-pyth-01',
    code: 'DIAG-PYTH-01',
    problemName: 'Tombamento de Plântulas (Damping-off / Pythium spp.)',
    scientificNameOrCause: 'Pythium ultimum / Rhizoctonia solani',
    category: 'doenca',
    cropsApplicable: ['Alface', 'Tomate', 'Pimentão', 'Couve', 'Repolho', 'Brócolis', 'Melancia', 'Pepino', 'Petúnia', 'Begônia', 'Todas'],
    growthStage: 'cotiledones',
    plantAreaAffected: 'colo_caule',
    severity: 'critico',
    recoveryTimeEstimated: 'Irreversível nas plântulas tombadas (Eliminar foco e proteger adjacentes em 48h)',
    features: {
      leafColor: 'verde_normal',
      veinColor: 'verde',
      hasDampingOff: true,
      hasWilting: true,
      rootColor: 'marrom_escuro',
      rootDevelopment: 'apodrecido_na_ponta',
      substrateCondition: 'encharcado',
    },
    keyQuestionMatches: [
      { questionId: 'q_damping_off', expectedAnswer: true },
      { questionId: 'q_dark_roots', expectedAnswer: true },
      { questionId: 'q_leaf_yellow', expectedAnswer: false },
      { questionId: 'q_visible_insects', expectedAnswer: false },
    ],
    technicalDescription: 'Lesão aquosa e estrangulamento escuro na região do colo da plântula junto à superfície do substrato, provocando tombamento rápido em reboleiras enquanto a folhagem ainda está verde.',
    visualSymptomsList: [
      'Estrangulamento castanho ou encharcado na base do caule',
      'Tombamento súbito da plântula sobre o substrato',
      'Morte de raízes secundárias com pontas marrons e amolecidas',
      'Disseminação circular em reboleiras na bandeja',
    ],
    possibleCauses: [
      'Substrato encharcado com baixa aeração e drenagem deficiente',
      'Reutilização de bandejas sem desinfecção prévia com hipoclorito ou amônia quaternária',
      'Temperatura amena a quente combinada com umidade relativa >90%',
      'Sementeira excessivamente adensada',
    ],
    preventiveMeasures: [
      'Desinfetar bandejas plásticas com hipoclorito a 2% por 20 minutos antes do uso',
      'Utilizar substrato comercial estéril com boa fração de aeração (ex: Carolina Soil com perlita)',
      'Inocular preventivamente *Trichoderma harzianum* ou *Bacillus subtilis* na semeadura',
      'Evitar regas no final da tarde que mantenham o colo úmido durante a noite',
    ],
    correctiveMeasures: [
      'Suspender imediatamente a irrigação e permitir aeração das bancadas',
      'Remover e descartar as células e plântulas afetadas com cuidado para não espalhar esporos',
      'Aplicar drench com fungicida sistêmico registrado (Metalaxil-M + Mancozebe ou Fosetyl-Al) ou biofungicida concentrado',
      'Elevar a bancada e ligar a ventilação forçada da estufa',
    ],
    referenceImageColor: 'emerald',
    referenceIllustration: 'Plântula deitada com colo estrangulado e afinado, folhas ainda verdes, base da raiz escura.',
    realPhotoUrl: '/pythium_damping_off.jpg',
    realPhotos: [
      {
        url: '/pythium_damping_off.jpg',
        title: 'Tombamento de Plântulas em Bandeja (Damping-off pós-emergência)',
        caption: 'Colapso súbito e tombamento de plântulas jovens com estrangulamento castanho-aquoso no colo junto ao substrato úmido.',
        tag: 'Sintoma Típico em Campo'
      },
      {
        url: '/pythium_roots.jpg',
        title: 'Podridão Radicular e Necrose do Colo (Pythium ultimum)',
        caption: 'Necrose escura e desintegração aquosa do sistema radicular e tecidos corticais basais sob alta umidade.',
        tag: 'Lesão no Colo & Raiz'
      }
    ],
  },
  {
    id: 'diag-botr-02',
    code: 'DIAG-BOTR-02',
    problemName: 'Mofo-Cinzento (Botrytis cinerea)',
    scientificNameOrCause: 'Botrytis cinerea',
    category: 'doenca',
    cropsApplicable: ['Tomate', 'Pimentão', 'Petúnia', 'Begônia', 'Amor-perfeito', 'Impatiens', 'Crisântemo', 'Alface'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'toda_planta',
    severity: 'severo',
    recoveryTimeEstimated: '5 a 8 dias após controle climático e sanitário',
    features: {
      hasMoldOrMycelium: true,
      moldColor: 'cinzento',
      hasSpots: true,
      spotType: 'irregular_aquosa',
      hasNecrosis: true,
      leafColor: 'verde_normal',
    },
    keyQuestionMatches: [
      { questionId: 'q_mold_mycelium', expectedAnswer: true },
      { questionId: 'q_spots_lesions', expectedAnswer: true },
      { questionId: 'q_visible_insects', expectedAnswer: false },
      { questionId: 'q_damping_off', expectedAnswer: false },
    ],
    technicalDescription: 'Desenvolvimento de micélio cinzento aveludado e pulverulento sobre tecidos senescentes, cotilédones caídos, hastes e folhas jovens, com podridão mole e úmida.',
    visualSymptomsList: [
      'Massa cinzenta fofa (conidióforos) cobrindo folhas e caules',
      'Lesões necróticas castanhas aquosas nas hastes',
      'Colapso e murchamento de folhas com aspecto de podridão',
    ],
    possibleCauses: [
      'Alta umidade relativa constante (>85%) e condensação de água nas folhas',
      'Falta de ventilação sob bancadas e estufa excessivamente fechada à noite',
      'Restos de cotilédones caídos apodrecendo sobre o substrato',
    ],
    preventiveMeasures: [
      'Aumentar o espaçamento entre bandejas e acionar ventilação para circulação de ar',
      'Evitar molhar as folhas após as 15h para que passem a noite secas',
      'Limpeza rigorosa das bancadas recolhendo folhas velhas desprendidas',
      'Aplicação preventiva de *Bacillus subtilis* ou *Trichoderma asperellum*',
    ],
    correctiveMeasures: [
      'Abrir cortinas laterais e acionar exaustores para reduzir umidade relativa para <70%',
      'Catação manual com descarte seguro das partes severamente afetadas',
      'Pulverização com fungicida específico antibotrytis (Pirimetanil, Iprodiona ou Ciprodinil) se autorizado',
    ],
    referenceImageColor: 'slate',
    referenceIllustration: 'Folha jovem recoberta por mofo cinzento aveludado com necrose na junção do pecíolo.',
    realPhotoUrl: '/botrytis_cinerea_leaf.jpg',
    realPhotos: [
      {
        url: '/botrytis_cinerea_leaf.jpg',
        title: 'Mofo-Cinzento em Folhas e Tecidos Jovens (Botrytis cinerea)',
        caption: 'Esporulação densa e aveludada de conidióforos cinzentos cobrindo lesões foliares necróticas sob alta umidade em estufa.',
        tag: 'Esporulação Típica em Folha'
      },
      {
        url: '/botrytis_cinerea_stem.jpg',
        title: 'Lesão e Podridão de Haste por Botrytis (Cancro do Colo)',
        caption: 'Massa cinzenta fofa de esporos com colapso do caule e pecíolo em plântula de viveiro.',
        tag: 'Cancro e Podridão da Haste'
      }
    ],
  },
  {
    id: 'diag-nutr-n-03',
    code: 'DIAG-NUTR-N-03',
    problemName: 'Deficiência de Nitrogênio (N)',
    scientificNameOrCause: 'Carência de Nitrato/Amônio na solução nutritiva',
    category: 'deficiencia_nutricional',
    cropsApplicable: ['Alface', 'Tomate', 'Pimentão', 'Couve', 'Repolho', 'Brócolis', 'Melancia', 'Pepino', 'Tagetes', 'Todas'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'folhas_velhas',
    severity: 'moderado',
    recoveryTimeEstimated: '3 a 5 dias após adubação nítrica',
    features: {
      leafColor: 'amarelo_uniforme',
      veinColor: 'amarelada',
      leafShape: 'normal',
      hasSpots: false,
      hasNecrosis: false,
      hasWilting: false,
    },
    keyQuestionMatches: [
      { questionId: 'q_leaf_yellow', expectedAnswer: true },
      { questionId: 'q_interveinal_chlorosis', expectedAnswer: false },
      { questionId: 'q_leaf_burn', expectedAnswer: false },
      { questionId: 'q_visible_insects', expectedAnswer: false },
    ],
    technicalDescription: 'Clorose (amarelecimento) uniforme e generalizada que se inicia nas folhas mais velhas da base e progride para toda a planta. Nervuras e limbo ficam amarelos, com paralisação do crescimento e caules delgados.',
    visualSymptomsList: [
      'Folhas inferiores perdem o verde escuro e ficam amarelo-claras',
      'Nervuras e lâmina foliar amareladas por igual sem padrão mosaico',
      'Crescimento vegetativo estagnado e porte fibroso/duro',
      'Pecíolos e caules com leve pigmentação avermelhada/arroxeada',
    ],
    possibleCauses: [
      'Substrato sem carga inicial de fertilizantes ou com alta relação C/N imobilizando N',
      'Lixiviação excessiva de nutrientes por regas muito frequentes',
      'Condutividade elétrica (CE) da fertirrigação muito baixa (<0.6 mS/cm)',
    ],
    preventiveMeasures: [
      'Utilizar substratos enriquecidos com fertilizantes de liberação lenta ou controle de EC',
      'Manter condutividade elétrica da fertirrigação entre 1.2 e 1.6 mS/cm para folhosas',
    ],
    correctiveMeasures: [
      'Aplicação de Nitrato de Cálcio (0.8 a 1.2 g/L) via fertirrigação',
      'Pulverização foliar de Ureia de baixo biureto a 0.2% nas primeiras horas da manhã',
      'Ajustar o cronograma nutricional da estufa',
    ],
    referenceImageColor: 'amber',
    referenceIllustration: 'Plântula com folhas inferiores totalmente amarelo-pálidas e folhas superiores verde-claras.',
    realPhotoUrl: '/nutr_nitrogen_deficiency.jpg',
    realPhotos: [
      {
        url: '/nutr_nitrogen_deficiency.jpg',
        title: 'Clorose Uniforme Generalizada por Deficiência de Nitrogênio',
        caption: 'Amarelecimento uniforme em folhas baixeiras com redução drástica do vigor e caules delgados.',
        tag: 'Clorose Uniforme'
      }
    ],
  },
  {
    id: 'diag-nutr-ca-04',
    code: 'DIAG-NUTR-CA-04',
    problemName: 'Deficiência de Cálcio / Tip-Burn (Morte de Meristema Apical)',
    scientificNameOrCause: 'Falta de absorção/translocação de Ca²+ no fluxo transpiratório',
    category: 'deficiencia_nutricional',
    cropsApplicable: ['Alface', 'Tomate', 'Pimentão', 'Couve', 'Repolho', 'Petúnia', 'Orquídeas'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'folhas_jovens',
    severity: 'severo',
    recoveryTimeEstimated: '4 a 6 dias nas novas brotações (folhas necrosadas não regeneram)',
    features: {
      leafBurnMargin: true,
      leafShape: 'em_copo_ou_gancho',
      hasNecrosis: true,
      rootDevelopment: 'apodrecido_na_ponta',
    },
    keyQuestionMatches: [
      { questionId: 'q_leaf_burn', expectedAnswer: true },
      { questionId: 'q_leaf_shape_deformed', expectedAnswer: true },
      { questionId: 'q_spots_lesions', expectedAnswer: false },
      { questionId: 'q_visible_insects', expectedAnswer: false },
    ],
    technicalDescription: 'Necrose e queima nas bordas das folhas mais jovens do ápice (tip-burn). As folhas nascem deformadas, com bordas enroladas para baixo em forma de colher ou gancho. Meristema apical pode necrosar.',
    visualSymptomsList: [
      'Bordas das folhas apicais queimadas e secas (tip-burn)',
      'Folhas novas deformadas em formato de concha ou gancho',
      'Morte da gema terminal',
      'Raízes curtas com pontas escurecidas e aspecto de vassoura',
    ],
    possibleCauses: [
      'Alta umidade relativa noturna e baixa transpiração diurna impedindo o transporte de Ca via xilema',
      'Excesso de Potássio (K+), Magnésio (Mg²+) ou Amônio (NH4+) competindo com o Cálcio',
      'Salinidade elevada no substrato ou falta de Cálcio na solução',
      'VPD da estufa fora da faixa ideal (muito alto >1.6 kPa ou muito baixo <0.4 kPa)',
    ],
    preventiveMeasures: [
      'Garantir relação Ca:Mg:K adequada na fertirrigação (ideal 2:1:1 em meq/L)',
      'Manter ventilação ativa nas primeiras horas da manhã para induzir fluxo transpiratório',
      'Monitorar condutividade elétrica e evitar estresse hídrico',
    ],
    correctiveMeasures: [
      'Pulverização foliar direta nas brotações apicais com Cloreto de Cálcio a 0.2% ou Quelato de Cálcio com Boro',
      'Elevar a concentração de Nitrato de Cálcio na solução para 120-150 ppm de Ca',
      'Regular o clima da estufa mantendo VPD entre 0.8 e 1.2 kPa',
    ],
    referenceImageColor: 'red',
    referenceIllustration: 'Folhas do centro da muda com bordas pretas queimadas e curvadas para dentro em formato de gancho.',
    realPhotoUrl: '/nutr_calcium_deficiency.jpg',
    realPhotos: [
      {
        url: '/nutr_calcium_deficiency.jpg',
        title: 'Tip-Burn e Deformação de Bordas por Deficiência de Cálcio',
        caption: 'Necrose marginal nas brotações apicais jovens com curvatura em formato de gancho.',
        tag: 'Tip-Burn Apical'
      }
    ],
  },
  {
    id: 'diag-nutr-fe-05',
    code: 'DIAG-NUTR-FE-05',
    problemName: 'Clorose Férrica / Deficiência de Ferro por pH Alto',
    scientificNameOrCause: 'Indisponibilidade de Fe devido a pH do substrato > 6.5',
    category: 'deficiencia_nutricional',
    cropsApplicable: ['Tomate', 'Petúnia', 'Begônia', 'Amor-perfeito', 'Pimentão', 'Alface', 'Orquídeas'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'folhas_jovens',
    severity: 'moderado',
    recoveryTimeEstimated: '3 a 5 dias após acidificação e quelato',
    features: {
      leafColor: 'amarelo_internerval',
      veinColor: 'verde',
      leafShape: 'normal',
      hasSpots: false,
    },
    keyQuestionMatches: [
      { questionId: 'q_leaf_yellow', expectedAnswer: true },
      { questionId: 'q_interveinal_chlorosis', expectedAnswer: true },
      { questionId: 'q_leaf_burn', expectedAnswer: false },
      { questionId: 'q_spots_lesions', expectedAnswer: false },
    ],
    technicalDescription: 'Clorose internerval marcante nas folhas mais jovens do ponteiro. O limbo foliar fica amarelo-claro a esbranquiçado, enquanto toda a rede fina de nervuras permanece intensamente verde.',
    visualSymptomsList: [
      'Folhas apicais novas com limbo amarelo e nervuras verdes contrastantes',
      'Em casos severos, as folhas novas ficam quase brancas como papel',
      'Folhas velhas basais mantêm-se verdes normais',
    ],
    possibleCauses: [
      'pH da água de irrigação ou do substrato acima de 6.4 (precipitação de ferro)',
      'Substrato alcalinizado por excesso de calcário ou bicarbonatos na água',
      'Encharcamento e falta de oxigenação nas raízes',
    ],
    preventiveMeasures: [
      'Monitorar e corrigir o pH da fertirrigação para 5.6 - 6.0 usando ácido fosfórico ou nítrico',
      'Utilizar fontes de ferro quelatizado estáveis em ampla faixa de pH (Fe-DTPA ou Fe-EDDHA)',
    ],
    correctiveMeasures: [
      'Acidificar imediatamente a solução nutritiva para pH 5.5',
      'Aplicar drench com Quelato de Ferro Fe-EDDHA (0.5 g/L) ou Fe-DTPA',
      'Pulverização foliar com sulfato ferroso a 0.1% como medida de socorro emergencial',
    ],
    referenceImageColor: 'yellow',
    referenceIllustration: 'Folha jovem do topo com rede de nervuras verde-escura perfeita sobre fundo amarelo-limão.',
    realPhotoUrl: '/iron_chlorosis_leaf.jpg',
    realPhotos: [
      {
        url: '/iron_chlorosis_leaf.jpg',
        title: 'Clorose Férrica Internerval em Folha Jovem (Deficiência de Ferro)',
        caption: 'Clorose internerval típica com limbo amarelo-limão contrastando com a rede de nervuras intensamente verde.',
        tag: 'Clorose Internerval Típica'
      },
      {
        url: '/iron_chlorosis_plant.jpg',
        title: 'Gradiente Foliar de Indisponibilidade de Fe por pH Alto',
        caption: 'Sintomas concentrados no broto apical novo (imobilidade do ferro na planta) em contraste com folhas basais verdes.',
        tag: 'Gradiente Apical em Muda'
      }
    ],
  },
  {
    id: 'diag-salin-06',
    code: 'DIAG-SALIN-06',
    problemName: 'Fitotoxidez por Salinidade / Excesso de Sais (CE Elevada)',
    scientificNameOrCause: 'Acúmulo excessivo de fertilizantes / CE drenagem > 2.8 mS/cm',
    category: 'fitotoxicidade',
    cropsApplicable: ['Alface', 'Begônia', 'Amor-perfeito', 'Petúnia', 'Tomate', 'Pepino', 'Todas'],
    growthStage: 'qualquer_fase',
    plantAreaAffected: 'toda_planta',
    severity: 'severo',
    recoveryTimeEstimated: '2 a 4 dias após lavagem (lixiviação)',
    features: {
      leafBurnMargin: true,
      hasWilting: true,
      substrateCondition: 'salinizacao_branca_superficie',
      rootColor: 'marrom_escuro',
      rootDevelopment: 'apodrecido_na_ponta',
    },
    keyQuestionMatches: [
      { questionId: 'q_substrate_white_crust', expectedAnswer: true },
      { questionId: 'q_leaf_burn', expectedAnswer: true },
      { questionId: 'q_dark_roots', expectedAnswer: true },
    ],
    technicalDescription: 'Queima necrótica nas bordas das folhas, murchamento fisiológico mesmo com substrato úmido (seca osmótica), raízes escuras e formação de eflorescência salina branca na superfície das células.',
    visualSymptomsList: [
      'Halo de necrose e queima seca nas pontas e margens das folhas',
      'Murchamento das plântulas em horários de sol quente mesmo irrigadas',
      'Crosta esbranquiçada visível sobre o substrato ou borda da bandeja',
      'Raízes escuras, queimadas e quebradiças',
    ],
    possibleCauses: [
      'Superdosagem de fertilizantes solúveis na fertirrigação',
      'Taxa de lixiviação zero (água aplicada em quantidade insuficiente para lavar o fundo da célula)',
      'Substrato comercial com adubação de base excessiva para plântulas jovens',
    ],
    preventiveMeasures: [
      'Calibrar rigorosamente o condutivímetro semanalmente com solução padrão 1.413 mS/cm',
      'Garantir fração de lixiviação de 15% a 20% a cada fertirrigação',
      'Adequar a CE conforme a tolerância da cultura (Begônia: max 1.2 mS; Tomate: max 1.8 mS)',
    ],
    correctiveMeasures: [
      'Realizar lavagem abundante imediata (flushing) das bandejas com água pura sem adubo',
      'Medir a CE da água drenada até atingir valor inferior a 1.2 mS/cm',
      'Suspender fertirrigação por 48 horas e retornar com metade da dose habitual',
    ],
    referenceImageColor: 'orange',
    referenceIllustration: 'Borda da bandeja com cristais brancos de sal e folhas com anel marrom seco na periferia.',
    realPhotoUrl: '/nutr_salinity_excess.jpg',
    realPhotos: [
      {
        url: '/nutr_salinity_excess.jpg',
        title: 'Fitotoxidez por Salinidade e Eflorescência Salina',
        caption: 'Queima das margens foliares e crosta esbranquiçada de sais acumulados no substrato das bandejas.',
        tag: 'Fitotoxidez por Sais'
      }
    ],
  },
  {
    id: 'diag-pest-trip-07',
    code: 'DIAG-PEST-TRIP-07',
    problemName: 'Ataque de Tripes (Frankliniella schultzei / Thrips tabaci)',
    scientificNameOrCause: 'Thysanoptera: Thripidae (Vetor do vírus Vira-Cabeça / TSWV)',
    category: 'praga',
    cropsApplicable: ['Tomate', 'Pimentão', 'Alface', 'Crisântemo', 'Petúnia', 'Tagetes', 'Todas'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'folhas_jovens',
    severity: 'severo',
    recoveryTimeEstimated: '4 a 7 dias após controle populacional',
    features: {
      visibleInsects: true,
      insectType: 'tripes',
      hasSpots: true,
      spotType: 'pontuacoes_necroticas',
      leafShape: 'encarquilhada',
    },
    keyQuestionMatches: [
      { questionId: 'q_visible_insects', expectedAnswer: true },
      { questionId: 'q_leaf_shape_deformed', expectedAnswer: true },
      { questionId: 'q_spots_lesions', expectedAnswer: true },
    ],
    technicalDescription: 'Manchas e estrias prateadas com aspecto brilhante nas folhas, acompanhadas de minúsculos pontos pretos (fezes do inseto), folhas jovens encarquilhadas e risco iminente de transmissão de Tospovírus (Vira-cabeça).',
    visualSymptomsList: [
      'Prateamento metálico característico na superfície das folhas',
      'Pequenos pontos negros fecais sobre as áreas prateadas',
      'Folhas novas deformadas e pontas encurvadas',
      'Presença de insetos diminutos e alongados correndo no verso da folha',
    ],
    possibleCauses: [
      'Entrada de tripes externos trazidos pelo vento ou vegetação vizinha',
      'Estufa sem tela antiafídica/antitripes (50 mesh) ou com aberturas danificadas',
      'Ausência de monitoramento preventivo com armadilhas adesivas azuis',
    ],
    preventiveMeasures: [
      'Instalar armadilhas adesivas azuis a cada 20 m² de estufa ao nível das bancadas',
      'Utilizar telas de proteção 50 mesh nas janelas e antecâmara com portas duplas',
      'Liberação preventiva de ácaros predadores (*Neoseiulus cucumeris* ou *Amblyseius swirskii*)',
    ],
    correctiveMeasures: [
      'Pulverização com bioinseticida à base de *Beauveria bassiana* ou *Metarhizium anisopliae*',
      'Aplicação de inseticida botânico à base de Azadiractina (Óleo de Neem 100% puro a 0.5%)',
      'Eliminar imediatamente plântulas com sintomas de vira-cabeça (manchas anelares e bronzeamento)',
    ],
    referenceImageColor: 'cyan',
    referenceIllustration: 'Folha com aspecto prateado fosco brilhante pontilhada de dejetos pretos e bordo repuxado.',
    realPhotoUrl: '/nursery_thrips_damage.jpg',
    realPhotos: [
      {
        url: '/nursery_thrips_damage.jpg',
        title: 'Prateamento e Danos de Tripes em Folhas Jovens',
        caption: 'Aspecto prateado com microlesões decorrentes da raspagem e sucção de seiva por tripes.',
        tag: 'Dano Típico de Tripes'
      }
    ],
  },
  {
    id: 'diag-pest-mosc-08',
    code: 'DIAG-PEST-MOSC-08',
    problemName: 'Ataque de Mosca-Branca (Bemisia tabaci)',
    scientificNameOrCause: 'Hemiptera: Aleyrodidae (Vetor de Begomovírus e Crinivírus)',
    category: 'praga',
    cropsApplicable: ['Tomate', 'Pimentão', 'Melancia', 'Pepino', 'Begônia', 'Petúnia', 'Todas'],
    growthStage: 'qualquer_fase',
    plantAreaAffected: 'toda_planta',
    severity: 'severo',
    recoveryTimeEstimated: '5 a 8 dias para supressão da população',
    features: {
      visibleInsects: true,
      insectType: 'mosca_branca',
      hasWilting: false,
      leafColor: 'verde_normal',
    },
    keyQuestionMatches: [
      { questionId: 'q_visible_insects', expectedAnswer: true },
      { questionId: 'q_leaf_yellow', expectedAnswer: false },
      { questionId: 'q_damping_off', expectedAnswer: false },
    ],
    technicalDescription: 'Pequenos insetos alados brancos que voam em nuvem ao sacudir a bandeja, ninfas ovais translúcidas fixas na face abaxial (inferior) das folhas e excreção de melaço (honeydew) que favorece fumagina.',
    visualSymptomsList: [
      'Adultos brancos de 1 mm voando ao tocar nas mudas',
      'Ninfas imóveis translúcidas fixas na parte de baixo da folha',
      'Folhas pegajosas com secreção brilhante de melaço',
      'Amarelecimento mosqueado e clorose prateada em cucurbitáceas',
    ],
    possibleCauses: [
      'Culturas vizinhas em fase de colheita provocando migração em massa',
      'Ambiente quente e seco na estufa favorável à multiplicação rápida',
      'Ausência de barreira de tela 50 mesh',
    ],
    preventiveMeasures: [
      'Instalar armadilhas adesivas amarelas na altura das bandejas',
      'Uso de telas antiafídicas de malha fina 50 mesh nas laterais e teto da estufa',
      'Inspeção diária na face inferior das folhas nas primeiras horas da manhã',
    ],
    correctiveMeasures: [
      'Aplicação de bioinseticidas fúngicos (*Beauveria bassiana* ou *Cordyceps fumosorosea*)',
      'Pulverização de sabão potássico (1% a 2%) ou extrato de nim nas horas frescas',
      'Descarte imediato de plantas suspeitas de Geminivírus (mosaico dourado e encrespamento)',
    ],
    referenceImageColor: 'blue',
    referenceIllustration: 'Face inferior da folha com pontinhos brancos voando e ninfas circulares translúcidas.',
    realPhotoUrl: '/nursery_whitefly_adults.jpg',
    realPhotos: [
      {
        url: '/nursery_whitefly_adults.jpg',
        title: 'Adultos e Posturas de Mosca-Branca na Face Abaxial',
        caption: 'Adultos de Bemisia tabaci colonizando a parte inferior da lâmina foliar em mudas protegidas.',
        tag: 'Colônia de Mosca-Branca'
      }
    ],
  },
  {
    id: 'diag-fisio-est-09',
    code: 'DIAG-FISIO-EST-09',
    problemName: 'Estiolamento de Plântulas (Falta de Luz / Superpopulação)',
    scientificNameOrCause: 'Falta de radiação fotossinteticamente ativa (PAR) / Efeito sombra',
    category: 'problema_fisiologico',
    cropsApplicable: ['Tomate', 'Pimentão', 'Couve', 'Repolho', 'Alface', 'Tagetes', 'Todas'],
    growthStage: 'primeiro_par',
    plantAreaAffected: 'colo_caule',
    severity: 'moderado',
    recoveryTimeEstimated: '3 a 5 dias (aumentar iluminação para engrossar o caule)',
    features: {
      leafColor: 'verde_normal',
      veinColor: 'verde',
      leafShape: 'normal',
      hasDampingOff: false,
      hasNecrosis: false,
      hasWilting: false,
    },
    keyQuestionMatches: [
      { questionId: 'q_damping_off', expectedAnswer: false },
      { questionId: 'q_leaf_yellow', expectedAnswer: false },
      { questionId: 'q_spots_lesions', expectedAnswer: false },
      { questionId: 'q_visible_insects', expectedAnswer: false },
    ],
    technicalDescription: 'Haste hipocótilo anormalmente longa, delgada, frágil e esbranquiçada, com folhas pequenas e distantes. A muda fica tombadiça pela fraqueza física do caule sem necrose infecciosa.',
    visualSymptomsList: [
      'Caule extremamente comprido, fino e pálido buscando a luz',
      'Folhas cotiledonares pequenas e pouco desenvolvidas',
      'Plântula que tomba pelo próprio peso da copa mas sem lesão no colo',
      'Ausência de manchas ou necrose no tecido',
    ],
    possibleCauses: [
      'Permanência excessiva na câmara de germinação após a emergência dos cotilédones',
      'Filme plástico da estufa sujo ou tela de sombreamento excessivamente densa (>70%)',
      'Superadensamento de bandejas sem espaçamento entre células',
    ],
    preventiveMeasures: [
      'Transferir as bandejas para bancadas bem iluminadas imediatamente na emissão de 20% das plântulas',
      'Utilizar filmes difusores com alta transmissão luminosa',
      'Limpeza periódica do plástico da estufa',
    ],
    correctiveMeasures: [
      'Mover as bandejas para área de pleno sol ou luz difusa forte',
      'Reduzir a tela de sombreamento para permitir maior incidência de radiação solar',
      'Aplicar fertirrigação com maior proporção de Potássio e Cálcio para estimular lignificação',
    ],
    referenceImageColor: 'emerald',
    referenceIllustration: 'Haste hipocótilo muito comprida e fina sustentando duas pequenas folhas no topo.',
  },
  {
    id: 'diag-doen-mild-10',
    code: 'DIAG-DOEN-MILD-10',
    problemName: 'Míldio em Plântulas (Bremia lactucae / Pseudoperonospora)',
    scientificNameOrCause: 'Oomiceto foliar biotrófico',
    category: 'doenca',
    cropsApplicable: ['Alface', 'Repolho', 'Brócolis', 'Couve', 'Pepino', 'Melancia', 'Impatiens'],
    growthStage: 'segundo_terceiro_par',
    plantAreaAffected: 'folhas_jovens',
    severity: 'severo',
    recoveryTimeEstimated: '5 a 7 dias após controle de umidade e aplicação de calda protetora',
    features: {
      hasSpots: true,
      spotType: 'halo_amarelado',
      hasMoldOrMycelium: true,
      moldColor: 'branco_algodonoso',
      leafColor: 'verde_normal',
    },
    keyQuestionMatches: [
      { questionId: 'q_spots_lesions', expectedAnswer: true },
      { questionId: 'q_mold_mycelium', expectedAnswer: true },
      { questionId: 'q_leaf_yellow', expectedAnswer: true },
      { questionId: 'q_visible_insects', expectedAnswer: false },
    ],
    technicalDescription: 'Manchas angulares cloróticas amarelo-claras na face superior da folha delimitadas pelas nervuras, com esporulação aveludada esbranquiçada na face inferior correspondente.',
    visualSymptomsList: [
      'Manchas amareladas angulares na face de cima da folha',
      'Duvagem/mofo branco aveludado na face de baixo da folha',
      'Necrose posterior dos tecidos afetados',
      'Paralisação do desenvolvimento das plântulas',
    ],
    possibleCauses: [
      'Folhas molhadas por mais de 4 horas consecutivas',
      'Temperaturas amenas (12°C a 20°C) combinadas com umidade relativa >90%',
      'Irrigações noturnas ou microaspersão desregulada',
    ],
    preventiveMeasures: [
      'Manejar a irrigação para secar a folha antes do entardecer',
      'Aumentar ventilação da estufa durante as primeiras horas da manhã',
      'Uso de cultivares resistentes com genes Dm (para alface) ou resistentes a míldio',
    ],
    correctiveMeasures: [
      'Aplicar fungicidas específicos registrados (Dimetomorfe, Mandipropamida ou Fosfito de Potássio)',
      'Pulverização preventiva com *Bacillus amyloliquefaciens*',
      'Eliminar bandejas altamente infectadas para preservar o resto da estufa',
    ],
    referenceImageColor: 'lime',
    referenceIllustration: 'Manchas quadradas amarelas na folha superior com penugem branca fina na face inferior.',
    realPhotoUrl: '/nursery_downy_mildew.jpg',
    realPhotos: [
      {
        url: '/nursery_downy_mildew.jpg',
        title: 'Míldio em Mudas: Lesões Angulares Amareladas',
        caption: 'Manchas angulares delimitadas por nervuras com esporulação aveludada esbranquiçada.',
        tag: 'Sintomatologia de Míldio'
      }
    ],
  },
];

/**
 * 100% OFFLINE SPECIALIST MATCHING ENGINE
 * Pure mathematical scoring based on deterministic feature comparison and dichotomous key weights.
 * NO external APIs, NO generative models, completely deterministic & transparent.
 */
export function runOfflineDiagnosticComparison(
  selectedCrop: string,
  selectedStage: string,
  observedFeatures: VisualCharacteristicsFeatures,
  answeredQuestions: Record<string, boolean>
): DiagnosticComparisonResult[] {
  const results: DiagnosticComparisonResult[] = [];

  for (const record of offlineDiagnosticDatabase) {
    let score = 0;
    let maxPossibleScore = 0;
    const matchedFeatures: string[] = [];
    const unmatchedFeatures: string[] = [];

    // 1. Crop Applicability Check (+20 pts)
    maxPossibleScore += 20;
    const isCropMatch =
      record.cropsApplicable.includes('Todas') ||
      record.cropsApplicable.some(c => c.toLowerCase() === selectedCrop.toLowerCase());
    if (isCropMatch) {
      score += 20;
      matchedFeatures.push(`Compatível com cultura: ${selectedCrop}`);
    } else {
      unmatchedFeatures.push(`Ocorrência rara em ${selectedCrop}`);
    }

    // 2. Growth Stage Check (+10 pts)
    maxPossibleScore += 10;
    if (record.growthStage === 'qualquer_fase' || record.growthStage === selectedStage) {
      score += 10;
      matchedFeatures.push(`Fase da muda compatível`);
    } else {
      score += 3; // Parcial
    }

    // 3. Leaf Color Match (+15 pts)
    if (observedFeatures.leafColor) {
      maxPossibleScore += 15;
      if (record.features.leafColor === observedFeatures.leafColor) {
        score += 15;
        matchedFeatures.push(`Cor das folhas: ${observedFeatures.leafColor.replace('_', ' ')}`);
      } else if (record.features.leafColor === 'verde_normal') {
        score += 5;
      } else {
        unmatchedFeatures.push(`Padrão de cor foliar difere`);
      }
    }

    // 4. Vein Color / Interveinal Chlorosis (+15 pts)
    if (observedFeatures.veinColor) {
      maxPossibleScore += 15;
      if (record.features.veinColor === observedFeatures.veinColor) {
        score += 15;
        matchedFeatures.push(`Coloração de nervuras compatível`);
      }
    }

    // 5. Leaf Burn / Margin Necrosis (+15 pts)
    if (observedFeatures.leafBurnMargin !== undefined) {
      maxPossibleScore += 15;
      if (record.features.leafBurnMargin === observedFeatures.leafBurnMargin) {
        score += 15;
        matchedFeatures.push(
          observedFeatures.leafBurnMargin ? `Presença de queima de bordas / tip-burn` : `Sem queima marginal`
        );
      }
    }

    // 6. Damping-Off / Tombamento (+25 pts - Critério de peso alto)
    if (observedFeatures.hasDampingOff !== undefined) {
      maxPossibleScore += 25;
      if (record.features.hasDampingOff === observedFeatures.hasDampingOff) {
        score += 25;
        if (observedFeatures.hasDampingOff) {
          matchedFeatures.push(`Sintoma de estrangulamento/tombamento no colo`);
        }
      }
    }

    // 7. Mold / Mycelium (+20 pts)
    if (observedFeatures.hasMoldOrMycelium !== undefined) {
      maxPossibleScore += 20;
      if (record.features.hasMoldOrMycelium === observedFeatures.hasMoldOrMycelium) {
        score += 20;
        if (observedFeatures.hasMoldOrMycelium) {
          matchedFeatures.push(`Presença de mofo ou micélio superficial`);
        }
      }
    }

    // 8. Visible Insects (+20 pts)
    if (observedFeatures.visibleInsects !== undefined) {
      maxPossibleScore += 20;
      if (record.features.visibleInsects === observedFeatures.visibleInsects) {
        score += 20;
        if (observedFeatures.visibleInsects) {
          matchedFeatures.push(`Presença confirmada de insetos/pragas`);
        }
      }
    }

    // 9. Root Color & Condition (+15 pts)
    if (observedFeatures.rootColor) {
      maxPossibleScore += 15;
      if (record.features.rootColor === observedFeatures.rootColor) {
        score += 15;
        matchedFeatures.push(`Condição radicular: ${observedFeatures.rootColor.replace('_', ' ')}`);
      }
    }

    // 10. Substrate Condition (+10 pts)
    if (observedFeatures.substrateCondition) {
      maxPossibleScore += 10;
      if (record.features.substrateCondition === observedFeatures.substrateCondition) {
        score += 10;
        matchedFeatures.push(`Estado do substrato compatível`);
      }
    }

    // 11. Dichotomous Key Questions Impact (+10 pts each answered question)
    for (const qMatch of record.keyQuestionMatches) {
      if (answeredQuestions[qMatch.questionId] !== undefined) {
        maxPossibleScore += 10;
        if (answeredQuestions[qMatch.questionId] === qMatch.expectedAnswer) {
          score += 10;
          matchedFeatures.push(`Resposta da chave dicotômica: Pergunta ${qMatch.questionId}`);
        } else {
          score -= 5; // Penalidade por resposta divergente na chave
          unmatchedFeatures.push(`Divergência na pergunta ${qMatch.questionId}`);
        }
      }
    }

    // Ensure non-negative and normalize
    score = Math.max(0, score);
    const compatibilityPercent = maxPossibleScore > 0 ? Math.min(99, Math.round((score / maxPossibleScore) * 100)) : 50;

    let confidenceLevel: 'alta' | 'moderada' | 'baixa' = 'baixa';
    if (compatibilityPercent >= 80) confidenceLevel = 'alta';
    else if (compatibilityPercent >= 55) confidenceLevel = 'moderada';

    results.push({
      record,
      compatibilityPercent,
      matchedFeatures,
      unmatchedFeatures,
      confidenceLevel,
    });
  }

  // Sort descending by compatibility %
  return results.sort((a, b) => b.compatibilityPercent - a.compatibilityPercent);
}
