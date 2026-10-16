import {
  BuffaloAnimal,
  BuffaloPaddock,
  BuffaloWaterPoint,
  BuffaloDisease,
  BuffaloPharmacyItem,
  BuffaloFacility,
  BuffaloFeedItem,
  BuffaloThermalWelfareIndex,
  BuffaloIEBCalculation
} from '../types/buffalo';

export const INITIAL_BUFFALO_ANIMALS: BuffaloAnimal[] = [];

export const INITIAL_BUFFALO_PADDOCKS: BuffaloPaddock[] = [];

export const INITIAL_BUFFALO_WATER_POINTS: BuffaloWaterPoint[] = [];

export const BUFFALO_FEEDS: BuffaloFeedItem[] = [
  {
    id: 'feed-pasto-brachiaria',
    name: 'Pasto de Brachiaria humidicola (Pastejo)',
    type: 'Volumoso Pasto',
    dryMatterPct: 22.0,
    crudeProteinPct: 8.5,
    totalDigestibleNutrientsPct: 54.0,
    neutralDetergentFiberPct: 68.0,
    calciumPct: 0.38,
    phosphorusPct: 0.18,
    costPerKgNaturalBRL: 0.05,
    recommendedMaxIntakePctPV: 2.5
  },
  {
    id: 'feed-pasto-mombaca',
    name: 'Pasto Panicum maximum cv. Mombaça',
    type: 'Volumoso Pasto',
    dryMatterPct: 20.0,
    crudeProteinPct: 12.0,
    totalDigestibleNutrientsPct: 58.0,
    neutralDetergentFiberPct: 62.0,
    calciumPct: 0.45,
    phosphorusPct: 0.25,
    costPerKgNaturalBRL: 0.07,
    recommendedMaxIntakePctPV: 2.8
  },
  {
    id: 'feed-silagem-milho',
    name: 'Silagem de Milho Planta Inteira',
    type: 'Silagem',
    dryMatterPct: 33.0,
    crudeProteinPct: 7.8,
    totalDigestibleNutrientsPct: 66.0,
    neutralDetergentFiberPct: 48.0,
    calciumPct: 0.28,
    phosphorusPct: 0.22,
    costPerKgNaturalBRL: 0.38,
    recommendedMaxIntakePctPV: 2.2
  },
  {
    id: 'feed-feno-tifton',
    name: 'Feno de Tifton 85 de Alta Qualidade',
    type: 'Feno',
    dryMatterPct: 88.0,
    crudeProteinPct: 13.5,
    totalDigestibleNutrientsPct: 60.0,
    neutralDetergentFiberPct: 66.0,
    calciumPct: 0.42,
    phosphorusPct: 0.26,
    costPerKgNaturalBRL: 1.10,
    recommendedMaxIntakePctPV: 2.0
  },
  {
    id: 'feed-farelo-soja',
    name: 'Farelo de Soja 46% PB',
    type: 'Concentrado Proteico',
    dryMatterPct: 89.0,
    crudeProteinPct: 46.5,
    totalDigestibleNutrientsPct: 82.0,
    neutralDetergentFiberPct: 14.5,
    calciumPct: 0.32,
    phosphorusPct: 0.65,
    costPerKgNaturalBRL: 2.45,
    recommendedMaxIntakePctPV: 0.8
  },
  {
    id: 'feed-milho-moido',
    name: 'Milho Moído Fino (Fubá)',
    type: 'Concentrado Energético',
    dryMatterPct: 88.0,
    crudeProteinPct: 9.0,
    totalDigestibleNutrientsPct: 85.0,
    neutralDetergentFiberPct: 12.0,
    calciumPct: 0.04,
    phosphorusPct: 0.28,
    costPerKgNaturalBRL: 1.40,
    recommendedMaxIntakePctPV: 1.2
  },
  {
    id: 'feed-mineral-bubalinos',
    name: 'Sal Mineral Específico para Bubalinos (Fósforo 80g)',
    type: 'Suplemento Mineral com Macro/Micros',
    dryMatterPct: 98.0,
    crudeProteinPct: 0.0,
    totalDigestibleNutrientsPct: 0.0,
    neutralDetergentFiberPct: 0.0,
    calciumPct: 18.0,
    phosphorusPct: 8.0,
    costPerKgNaturalBRL: 4.80,
    recommendedMaxIntakePctPV: 0.05
  }
];

export const BUFFALO_DISEASES: BuffaloDisease[] = [
  {
    id: 'dis-01',
    name: 'Mastite Bubalina (Subclínica e Clínica)',
    popularName: 'Inflamação do Úbere / Mamite em Búfalas',
    scientificAgent: 'Staphylococcus aureus, Streptococcus uberis, Corynebacterium bovis',
    category: 'Infecciosa',
    transmission: 'Contaminação na ordenha, fômites, refluxo de leite na teteira, falta de pré e pós-dipping e higiene deficiente.',
    clinicalSigns: [
      'Presença de grumos, pus ou filamentos no teste da caneca de fundo escuro',
      'Edema acentuado, aumento térmico local e dor à palpação nos quartos mamários afetados',
      'Elevação expressiva da CCS (> 280.000 cél/mL em búfalas)',
      'Queda abrupta na produção diária de leite e redução do teor de gordura e sólidos totais'
    ],
    morbidityRate: '15% a 35%',
    mortalityRate: '< 2% (risco de perda irreversível do quarto)',
    diagnosticMethods: [
      'California Mastitis Test (CMT) diário na rotina de ordenha',
      'Teste da caneca telada / fundo escuro no primeiro jato de leite',
      'Contagem de Células Somáticas (CCS) automatizada ou por microscopia',
      'Cultura microbiológica e antibiograma veterinário'
    ],
    treatmentProtocol: 'Esvaziamento completo do quarto mamário afetado por ordenha manual; infusão intramamária de antibiótico específico para búfalas (Cefalosporina de 3ª geração ou Ampicilina com Cloxacilina) a cada 24h por 3 dias consecutivos. Anti-inflamatório não esteroide sistêmico (Meglumina de Flunixin 2,2 mg/kg IV ou IM) para redução do edema e dor.',
    preventionManagement: 'Rigorosa linha de ordenha: 1º Primíparas sadias, 2º Matrizes multíparas sadias, 3º Vacas em tratamento / mastíticas. Pré-dipping clorado com secagem em papel toalha descartável (1 por teto); pós-dipping com barreira iodada de alta aderência (mínimo 0,5% a 1% de iodo ativo); manutenção e regulagem de vácuo do pulsador mecânico.',
    zoonotic: false,
    withdrawalTimeWarning: 'Carência obrigatória de 72h a 96h para o leite pós-última aplicação intramamária; carência de 14 a 28 dias para abate de carne.',
    images: ['photo-mastitis-1'],
    references: 'Embrapa Amazônia Oriental / Manual de Sanidade e Qualidade do Leite Bubalino',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Penetração bacteriana pelo canal do teto favorecida pelo relaxamento do esfíncter pós-ordenha ou lesões traumáticas; colonização da cisterna mamária e alvéolos com liberação de enterotoxinas, leucocitose e lise tecidual.',
      predisposingFactors: [
        'Vácuo inadequado na ordenhadeira mecânica (> 44 kPa para búfalas)',
        'Falta de repouso em pé por 30 minutos pós-ordenha (pós-dipping úmido em contato com terra)',
        'Lama e sujidade acumulada nos currais de espera',
        'Ausência de toalete higiênica e desinfecção de teteiras'
      ],
      incubationPeriod: '24 a 72 horas para forma clínica aguda'
    },
    symptomsDetails: {
      earlySigns: [
        'Reação gelatinosa no teste de CMT (escore 1+ ou 2+)',
        'Leve endurecimento da base do teto ao início da ordenha',
        'Inquietação da búfala durante a colocação do conjunto de teteiras'
      ],
      advancedSigns: [
        'Grumos caseosos amarelados ou secreção aquosa/sanguinolenta',
        'Quarto mamário endurecido e quente com temperatura até 3°C acima dos outros quartos',
        'Febre sistêmica, agalaxia e inapetência em casos toxêmicos graves'
      ],
      vitalSignsAlterations: [
        'Temperatura retal: 38.5°C a 40.5°C em mastites sistêmicas',
        'Frequência cardíaca: 70 a 90 bpm'
      ],
      necropsyOrLesionFindings: [
        'Fibrose tecidual intersticial nos quartos crônicos (atrofia permanente)',
        'Exsudato purulento nos ductos lactíferos e cisternas da glândula'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Cefalosporinas de 3ª geração / Ampicilina + Cloxacilina Intramamária',
      dosageAndRoute: '1 bisnaga intramamária por quarto afetado a cada 12h ou 24h por 3 a 5 dias',
      supportiveCare: 'Ordenhas de alívio manuais frequentes (3 a 4x/dia) e aplicação de compressas frias na fase hiperaguda',
      biosecurityMeasures: [
        'Descarte sanitário de fômites contaminados e luvas de ordenha',
        'Segregação física e ordenha por último de animais com isolamento de S. aureus',
        'Troca periódica de borrachas de teteiras a cada 2.500 ordenhas'
      ],
      vaccinationProtocol: 'Vacinação autógena ou polivalente contra mastite estafilocócica em rebanhos com alta incidência no pré-parto (60 e 30 dias antes do parto).',
      quarantineDays: 14
    }
  },
  {
    id: 'dis-02',
    name: 'Brucelose Bubalina',
    popularName: 'Doença do Aborto Infeccioso / Mal de Bang em Búfalos',
    scientificAgent: 'Brucella abortus (biovares 1 e 2)',
    category: 'Reprodutiva',
    transmission: 'Ingestão de pastagens e água contaminadas com restos fetais, placentas, secreções uterinas ou leite; transmissão venérea por touros infectados.',
    clinicalSigns: [
      'Aborto espontâneo concentrado no terço final da gestação (7º ao 10º mês em búfalas)',
      'Retenção crônica de placenta com metrite purulenta e corrimento vaginal fétido',
      'Orquite, epididimite e degeneração testicular em reprodutores machos',
      'Hygroma carpal volumoso e bursite pré-articular crônica nos membros anteriores'
    ],
    morbidityRate: 'Variável (alta endemicidade em rebanhos sem vacinação)',
    mortalityRate: '< 1% em adultos (alto impacto econômico por perda reprodutiva)',
    diagnosticMethods: [
      'Sorologia oficial de triagem: Teste do Antígeno Acidificado Tamponado (AAT)',
      'Testes confirmatórios: 2-Mercaptoetanol (2-ME) e Polarização Fluorescente (FPA)',
      'Isolamento bacteriano e PCR em tecido fetal abortado e placenta'
    ],
    treatmentProtocol: 'TRATAMENTO ESTREITAMENTE PROIBIDO por legislação federal brasileira (PNCEBT / MAPA). Todo animal reagente positivo deve ser marcado a ferro quente com a letra "P" no lado esquerdo da face e encaminhado para sacrifício sanitário obrigatório em frigorífico sob inspeção oficial.',
    preventionManagement: 'Vacinação obrigatória de todas as bezerras fêmeas de 3 a 8 meses de idade com vacina B19 (marcação com algarismo final do ano no lado esquerdo) ou RB51 (não induz anticorpos diagnósticos, permitida acima de 8 meses). Testagem sorológica semestral do rebanho reprodutor e quarentena rigorosa de novos animais adquiridos.',
    zoonotic: true,
    withdrawalTimeWarning: 'Zoonose grave e incapacitante no ser humano (Febre Ondulante / Febre de Malta). O leite de animais suspeitos ou não testados NUNCA deve ser consumido in natura sem pasteurização industrial.',
    images: ['photo-brucellosis-1'],
    references: 'PNCEBT / MAPA Brasil & Embrapa Pecuária Sudeste',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Penetração por via oral ou mucosa; fagocitose por macrófagos com sobrevivência intracelular facultativa; tropismo pelo eritritol presente na placenta e testículos, desencadeando placentite necrosante e anóxia fetal.',
      predisposingFactors: [
        'Introdução de reprodutores ou matrizes sem atestado sorológico negativo',
        'Pastoreio consorciado com bovinos ou bubalinos de status sanitário desconhecido',
        'Ausência de piquete maternidade isolado para partos'
      ],
      incubationPeriod: '2 semanas a vários meses (frequentemente subclínica até o terço final da prenhez)'
    },
    symptomsDetails: {
      earlySigns: [
        'Declínio precoce da taxa de concepção e repetição de cios irregulares',
        'Aumento discreto de volume na articulação carpal de matrizes multíparas'
      ],
      advancedSigns: [
        'Expulsão de feto abortado recoberto por membranas castanho-amareladas espessadas',
        'Corrimento loquial achocolatado persistente por semanas pós-parto',
        'Aumento assimétrico e endurecimento do escroto em touros'
      ],
      vitalSignsAlterations: [
        'Temperatura corporal frequentemente normal a menos que haja metrite bacteriana secundária'
      ],
      necropsyOrLesionFindings: [
        'Placentite necrosante com cotilédones necróticos e exsudato amarelado entre vilosidades',
        'Granulomas inflamatórios em testículos, vesículas seminais e bursas articulares'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Sem tratamento medicamentoso permitido (Sacrifício Sanitário)',
      dosageAndRoute: 'N/A - Eliminação de portadores conforme Instrução Normativa MAPA',
      supportiveCare: 'Isolamento imediato de animais abortantes e incineração/enterramento profundo com cal virgem de restos fetais',
      biosecurityMeasures: [
        'Exigência de 2 laudos sorológicos negativos com intervalo de 30 a 60 dias para entrada no criatório',
        'Desinfecção rigorosa de piquetes de parto e baias com soda cáustica ou amônia quaternária'
      ],
      vaccinationProtocol: 'Dose única de vacina B19 entre 3 e 8 meses em fêmeas por médico veterinário cadastrado.',
      quarantineDays: 60
    }
  },
  {
    id: 'dis-03',
    name: 'Tuberculose Bubalina',
    popularName: 'Tísica / Tuberculose Zoonótica dos Búfalos',
    scientificAgent: 'Mycobacterium bovis',
    category: 'Infecciosa',
    transmission: 'Aerógena (inalação de gotículas em currais cobertos e aglomerações) ou via digestiva por ingestão de leite, colostro e água contaminados.',
    clinicalSigns: [
      'Emaciação progressiva e perda acentuada de escore corporal mesmo com boa oferta nutricional',
      'Tosse seca e crônica, dispneia e respiração ruidosa em esforços moderados',
      'Aumento volumétrico e endurecimento de linfonodos superficiais (retrofaringeanos, parotídeos e pré-escapulares)',
      'Queda constante e irrecuperável na curva de lactação'
    ],
    morbidityRate: 'Baixa a Moderada (progressão crônica lenta)',
    mortalityRate: 'Alta a longo prazo se os animais não forem eliminados',
    diagnosticMethods: [
      'Teste Tuberculínico Cervical Comparado (TCC) oficial padronizado para bubalinos com PPD Bovina e PPD Aviária',
      'Leitura com cutímetro de precisão após 72 horas (± 4h) da inoculação intradérmica',
      'Histopatologia com coloração de Ziehl-Neelsen e PCR confirmatório em linfonodos'
    ],
    treatmentProtocol: 'TRATAMENTO TERMINANTEMENTE PROIBIDO no Brasil. Animais positivos são sacrificados obrigatoriamente sem direito a indenização conforme o PNCEBT para evitar disseminação e contaminação humana.',
    preventionManagement: 'Saneamento do rebanho com testes anuais de todos os animais reprodutores; abate sanitário imediato dos positivos; desinfecção periódica de instalações com luz solar direta e cal virgem; aquisição exclusiva de animais de estabelecimentos certificados como Livres de Tuberculose.',
    zoonotic: true,
    withdrawalTimeWarning: 'Zoonose crítica de alta virulência pulmonar e extrapulmonar no ser humano.',
    images: ['photo-tb-1'],
    references: 'Ministério da Agricultura e Pecuária (MAPA) & ABCB',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Inalação do bacilo álcool-ácido resistente; fagocitose por macrófagos alveolares com formação do complexo primário de Ghon (granuloma tuberculoso); evolução para necrose caseosa, calcificação distrófica e disseminação linfo-hematogênica.',
      predisposingFactors: [
        'Superlotação em estábulos e salas de espera sem ventilação cruzada',
        'Aleitamento de bezerras com leite de descarte não pasteurizado',
        'Presença de fauna silvestre reservatória ou contato com bovinos infectados'
      ],
      incubationPeriod: 'Meses a anos (doença de evolução silenciosa insidiosa)'
    },
    symptomsDetails: {
      earlySigns: [
        'Fadiga precoce durante o pastejo ou caminhada para a ordenha',
        'Pêlos opacos e quebradiços com leve retardo na troca estacional'
      ],
      advancedSigns: [
        'Auscultação pulmonar com estertores crepitantes e sibilos difusos',
        'Respiração abdominal superficial e caquexia terminal com proeminência das costelas e ílios'
      ],
      vitalSignsAlterations: [
        'Febre intermitente de baixa intensidade',
        'Frequência respiratória aumentada (> 40 mov/min)'
      ],
      necropsyOrLesionFindings: [
        'Tubérculos miliares ou conglomerados com centro caseoso amarelado e grânulos de calcificação nos pulmões',
        'Linfonodite caseo-calcificada nos linfonodos mediastínicos, traqueobrônquicos e mesentéricos'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Sem tratamento terapêutico (Interdição e Sacrifício Sanitário)',
      dosageAndRoute: 'N/A - Procedimento oficial MAPA',
      supportiveCare: 'Isolamento em piquete de quarentena até o embarque para abate sanitário com laudo oficial',
      biosecurityMeasures: [
        'Pasteurização obrigatória de todo o leite fornecido a bezerros em rebanhos sob saneamento',
        'Exame tuberculínico obrigatório na admissão de reprodutores'
      ],
      vaccinationProtocol: 'Vacina BCG proibida em animais de produção para não interferir nos testes diagnósticos.',
      quarantineDays: 60
    }
  },
  {
    id: 'dis-04',
    name: 'Pododermatite Infecciosa Bubalina (Doença do Casco / Gabarro)',
    popularName: 'Manqueira dos Pés / Podridão dos Cascos / Foot Rot',
    scientificAgent: 'Fusobacterium necrophorum, Dichelobacter nodosus, Prevotella melaninogenica',
    category: 'Podal (Cascos)',
    transmission: 'Maceração da pele interdigital em áreas de acúmulo de umidade, lama contaminada com fezes e pequenas escoriações por pedras ou tocos.',
    clinicalSigns: [
      'Claudicação evidente e súbita (manqueira acentuada com apoio relutante do membro)',
      'Edema difuso, hiperemia e aumento de volume na coroa do casco e espaço interdigital',
      'Exsudato necrótico acinzentado de odor extremamente fétido característico',
      'Descolamento da sola córnea com risco de osteíte séptica da 3ª falange se não tratada'
    ],
    morbidityRate: '10% a 30% em períodos chuvosos',
    mortalityRate: '< 1% (alto descarte por perda produtiva)',
    diagnosticMethods: [
      'Exame físico podológico no tronco de contenção com limpeza minuciosa do estojo córneo',
      'Inspeção da fenda interdigital com sonda canelada e curetagem diagnóstica'
    ],
    treatmentProtocol: 'Toalete cirúrgico com remoção cuidadosa do tecido necrótico desvitalizado; lavagem com água oxigenada 10V ou solução de iodo a 2%; curativo oclusivo com pomada à base de oxitetraciclina e sulfato de cobre; antibioticoterapia sistêmica de escolha: Ceftiofur sódico (1 a 2 mg/kg IM/SC a cada 24h por 3 dias) ou Oxitetraciclina L.A. (20 mg/kg dose única IM profunda). Anti-inflamatório (Cetoprofeno 3 mg/kg) para analgesia.',
    preventionManagement: 'Drenagem e concretagem de corredores de acesso e porteiras; passagem obrigatória por pedilúvio (Sulfato de cobre 5% ou Formalina 3%) 2 a 3 vezes por semana; casqueamento preventivo anual antes do período de chuvas.',
    zoonotic: false,
    withdrawalTimeWarning: 'Ceftiofur sódico possui carência ZERO para o leite; para formulações de oxitetraciclina respeitar 7 dias para leite e 28 dias para abate de carne.',
    images: ['photo-footrot-1'],
    references: 'Associação Brasileira de Criadores de Búfalos (ABCB) & Guia de Podologia Bubalina',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Quebra da integridade da derme interdigital por umidade excessiva; invasão sinérgica por bactérias anaeróbias estritas que produzem leucotoxinas e proteases, gerando necrose liquefativa e celulite podal.',
      predisposingFactors: [
        'Corredores de ordenha com pedras pontiagudas ou lama permanente',
        'Ausência de pedilúvio na saída da ordenha',
        'Crescimento assimétrico do estojo córneo por falta de desgaste natural'
      ],
      incubationPeriod: '2 a 5 dias pós-lesão de continuidade'
    },
    symptomsDetails: {
      earlySigns: [
        'Leve hesitação ao apoiar a pata traseira em pisos rígidos',
        'Lambedura frequente da região do boleto e casco'
      ],
      advancedSigns: [
        'Manqueira em grau 4/5 com sustentação do membro no ar',
        'Fissura ulcerada profunda com desprendimento purulento entre as unhas',
        'Queda de 30% na ingestão diária de matéria seca por incapacidade de locomoção'
      ],
      vitalSignsAlterations: [
        'Aumento discreto da temperatura local do casco (+2.5°C)',
        'Pulso arterial digital palpável e saltatório na região do boleto'
      ],
      necropsyOrLesionFindings: [
        'Necrose caseosa do ligamento cruzado interdigital e tendões flexores profundos em casos graves'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Ceftiofur Sódico / Oxitetraciclina L.A. associado a Sulfato de Cobre Tópico',
      dosageAndRoute: 'Ceftiofur: 1.1 a 2.2 mg/kg via IM por 3 dias | Pedilúvio: Solução aquosa a 5%',
      supportiveCare: 'Isolamento em piquete seco e plano com forragem macia até cicatrização total',
      biosecurityMeasures: [
        'Limpeza diária do piso da sala de ordenha com raspador e hidrojato',
        'Renovação semanal da calda do pedilúvio de passagem'
      ],
      vaccinationProtocol: 'Vacinas polivalentes contra pododermatite/necrobacilose em rebanhos com histórico endêmico.',
      quarantineDays: 10
    }
  },
  {
    id: 'dis-05',
    name: 'Toxocaríase Neonatal Bubalina (Verminose por Toxocara vitulorum)',
    popularName: 'Lombriga do Bezerro / Barriga d’Água em Bezerras',
    scientificAgent: 'Toxocara vitulorum (Nematóide específico de búfalos jovens)',
    category: 'Neonatal',
    transmission: 'Transmissão transmamária: larvas L3 hipobióticas nos tecidos da mãe migram para o colostro e leite nas primeiras 3 a 4 semanas de lactação.',
    clinicalSigns: [
      'Diarreia fétida amarelada ou cinzenta em bezerras com 15 a 45 dias de idade',
      'Distensão abdominal marcada ("barriga d’água") e pelagem fosca e eriçada',
      'Hálito com cheiro de éter/ácido butírico extremamente característico',
      'Anemia severa, perda rápida de peso e risco iminente de obstrução e rotura intestinal'
    ],
    morbidityRate: 'Até 80% em bezerros não vermifugados',
    mortalityRate: '5% a 25% por oclusão intestinal mecânica',
    diagnosticMethods: [
      'Exame coproparasitológico (OPG por McMaster) com ovos esféricos de casca espessa e rugosa',
      'Identificação visual de nematóides cilíndricos brancos de 15 a 30 cm eliminados nas fezes'
    ],
    treatmentProtocol: 'Administração precoce de anti-helmíntico aos 10 a 15 dias de vida do bezerro: Levamisol (5 a 7,5 mg/kg SC) ou Febendazol / Albendazol (7,5 mg/kg VO) ou Piperazina (100 mg/kg VO). Repetir aos 30 e 45 dias de vida. Hidratação oral com eletrólitos para conter a desidratação.',
    preventionManagement: 'Vermifugação metafilática de TODOS os bezerros aos 10-14 dias de vida; desinfecção frequente dos bezerreiros com lança-chamas ou solução fenólica; pastejo rotacionado em piquetes limpos para matrizes gestantes.',
    zoonotic: false,
    withdrawalTimeWarning: 'Uso restrito à fase neonatal, sem impacto de carência para animais adultos em ordenha.',
    images: ['photo-toxocara-1'],
    references: 'Revista Brasileira de Parasitologia Veterinária & Embrapa Amazônia Oriental',
    etiologyDetails: {
      agentType: 'Nematóide',
      pathogenesis: 'Ingestão de larvas no colostro; rápida maturação no intestino delgado do bezerro; vermes adultos com até 30 cm de comprimento formam novelos obstrutivos na luz jejunal, espoliando nutrientes e liberando toxinas que causam enterite catarral.',
      predisposingFactors: [
        'Matrizes sem vermifugação no terço final de gestação',
        'Bezerreiros úmidos e com alta carga parasitária no solo',
        'Falta de protocolo de desverminação nos primeiros 15 dias'
      ],
      incubationPeriod: 'Período pré-patente de 18 a 28 dias'
    },
    symptomsDetails: {
      earlySigns: [
        'Redução do apetite na mamada matinal',
        'Fezes pastosas de coloração clara e odor forte'
      ],
      advancedSigns: [
        'Abdômen dilatado e doloroso à palpação',
        'Eliminação de vermes adultos vivos em massas de fezes diarreicas',
        'Apatia profunda, desidratação com enoftalmia e decúbito lateral'
      ],
      vitalSignsAlterations: [
        'Mucosas hipocoradas a esbranquiçadas (anemia)',
        'Taquicardia compensatória (> 110 bpm em bezerros)'
      ],
      necropsyOrLesionFindings: [
        'Obstrução mecânica da luz intestinal por emaranhados de centenas de vermes',
        'Enterite catarral com espessamento da mucosa intestinal e ascite'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Levamisol Cloridrato ou Febendazol Oral',
      dosageAndRoute: 'Levamisol: 7.5 mg/kg via SC | Febendazol: 7.5 mg/kg via VO aos 14 dias',
      supportiveCare: 'Terapia de reidratação oral (TRO) com glicose, cloreto de sódio e bicarbonato 2 a 3 litros/dia',
      biosecurityMeasures: [
        'Maternidades individuais limpas e secas com troca diária de cama de palha/maravalha',
        'Remoção imediata de fezes dos piquetes de bezerros'
      ],
      vaccinationProtocol: 'Não há vacina disponível. O controle baseia-se exclusivamente no protocolo anti-helmíntico estratégico.',
      quarantineDays: 0
    }
  },
  {
    id: 'dis-06',
    name: 'Infestação por Piolho do Búfalo (Haematopinus quadripertusus)',
    popularName: 'Piolho Gigante dos Búfalos / Piolheira Bubalina',
    scientificAgent: 'Haematopinus quadripertusus (Ectoparasita hematófago exclusivo de bubalinos)',
    category: 'Parasitária',
    transmission: 'Contato direto entre animais no lote, troncos de contenção, currais de espera e mourões de cerca.',
    clinicalSigns: [
      'Prurido intenso: animais se esfregando incessantemente em mourões, troncos e cochos',
      'Alopecia severa, espessamento da pele e crostas ao redor dos olhos, orelhas, base dos chifres e vassoura da cauda',
      'Anemia progressiva e retardo no ganho de peso decorrente da espoliação de sangue',
      'Presença visível a olho nu de lêndeas esbranquiçadas nos pêlos e piolhos adultos acinzentados de 3 a 5 mm'
    ],
    morbidityRate: '50% a 95% em lotes confinados ou semi-intensivos',
    mortalityRate: '< 1% em adultos (risco de morte em bezerros por anemia severa)',
    diagnosticMethods: [
      'Exame ectoparasitológico direto por inspeção visual da pele na cabeça, períneo e vassoura da cauda',
      'Coleta de raspado cutâneo e observação em lupa estereoscópica'
    ],
    treatmentProtocol: 'Aplicação de ectoparasiticida pour-on ou pulverização: Cipermetrina com Clorpirifós ou Fipronil ou Deltametrina tópica. Em animais fora de lactação, Ivermectina 1% ou 3.15% injetável (200 mcg/kg SC). É fundamental realizar uma segunda aplicação após 14 a 21 dias para eliminar os piolhos que eclodiram das lêndeas remanescentes.',
    preventionManagement: 'Tratamento simultâneo de 100% dos animais do lote no início da estação seca; desinfecção de instalações e raspagem dos mourões; quarentena e pulverização obrigatória de animais recém-chegados.',
    zoonotic: false,
    withdrawalTimeWarning: 'Atenção máxima aos períodos de carência para o leite! Utilizar formulações pour-on específicas com carência zero ou curta (ex: Eprinomectina).',
    images: ['photo-louse-1'],
    references: 'Pesquisa Veterinária Brasileira & Embrapa Pecuária Sudeste',
    etiologyDetails: {
      agentType: 'Ectoparasita',
      pathogenesis: 'Inseto anoplura com garras fortes adaptadas a pêlos grossos; perfuração da derme e sucção contínua de sangue com inoculação de saliva irritante e imunogênica que causa hipersensibilidade cutânea e prurido violento.',
      predisposingFactors: [
        'Estação seca com redução de banhos em açudes e lagoas',
        'Alta densidade populacional em piquetes de confinamento',
        'Animais debilitados, desnutridos ou imunossuprimidos'
      ],
      incubationPeriod: 'Ciclo biológico completo de ovo a adulto em 20 a 30 dias'
    },
    symptomsDetails: {
      earlySigns: [
        'Fricção constante da cabeça contra mourões e bebedouros',
        'Pontos brancos (lêndeas) agrupados na base dos chifres'
      ],
      advancedSigns: [
        'Placas alopécicas com hiperqueratose e sangramento na pele periocular ("olhos de óculos")',
        'Cauda sem pelos com aspecto ressecado e feridas abertas',
        'Perda de até 15 kg de peso corporal em 30 dias'
      ],
      vitalSignsAlterations: [
        'Hematócrito reduzido (< 22%) e mucosas oculares pálidas'
      ],
      necropsyOrLesionFindings: [
        'Dermatite hiperplásica com espessamento da epiderme e infiltrado eosinofílico'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Fipronil Pour-on / Cipermetrina + Clorpirifós / Eprinomectina',
      dosageAndRoute: 'Pour-on no fio do dorso conforme peso vivo (ex: 1 mL/10 kg)',
      supportiveCare: 'Suplementação vitamínico-mineral com ferro injetável para correção da anemia crônica',
      biosecurityMeasures: [
        'Tratar todo o rebanho no mesmo dia para evitar reinfestação cruzada',
        'Aplicação repetida em 14 a 21 dias (tempo de eclosão das lêndeas)'
      ],
      vaccinationProtocol: 'Não há vacinas contra ectoparasitas.',
      quarantineDays: 21
    }
  },
  {
    id: 'dis-07',
    name: 'Estresse Térmico por Calor (Insolação / Hipertermia)',
    popularName: 'Choque Térmico / Insolação / Búfalo Abafado',
    scientificAgent: 'Distúrbio bioclimatológico (pele escura com 1/10 da densidade de glândulas sudoríparas dos bovinos)',
    category: 'Metabólica / Nutricional',
    transmission: 'Distúrbio ambiental não infeccioso. Exposição prolongada a ITU > 78 e radiação solar direta sem acesso a açudes, lagoas de banho ou sombras.',
    clinicalSigns: [
      'Taquipneia severa e respiração ofegante (> 80 mov/min) com boca aberta e língua projetada',
      'Salivação profusa (sialorreia) com perda rápida de eletrólitos e desidratação',
      'Queda abrupta de 25% a 45% na produção diária de leite e redução da ruminação',
      'Elevação crítica da temperatura retal acima de 39.8°C (limite de emergência fisiológica)'
    ],
    morbidityRate: 'Até 100% do rebanho em ondas de calor sem infraestrutura de sombra/água',
    mortalityRate: '2% a 10% por choque circulatório e falência cardiopulmonar',
    diagnosticMethods: [
      'Monitoramento de variáveis bioclimáticas: Índice de Temperatura e Umidade (ITU) e BGT-HI',
      'Avaliação visual do Escore de Ofegação (Panting Score 0 a 4) e termometria retal'
    ],
    treatmentProtocol: 'Condução calma e imediata para sombra fresca ou açude com água limpa; aspersão abundante de água fria em todo o corpo com ventiladores na sala de espera da ordenha; hidratação oral ou endovenosa com solução fisiológica e Ringer com Lactato; suplementação com eletrólitos e bicarbonato na água de beber.',
    preventionManagement: 'Garantia obrigatória de acesso diário a açudes, rios ou represas de banho por no mínimo 2 a 3 horas no período mais quente do dia (11h às 15h); sombreamento artificial ou silvipastoril de pelo menos 6 a 8 m² por animal adulto; aspersores automáticos acionados por termostato nos currais.',
    zoonotic: false,
    withdrawalTimeWarning: 'Manejo exclusivamente ambiental e de bem-estar animal.',
    images: ['photo-heat-1'],
    references: 'GeaAgro Bubalinos, Embrapa Pecuária Sudeste & Universidade Federal Rural da Amazônia',
    etiologyDetails: {
      agentType: 'Distúrbio Bioclimático / Nutricional',
      pathogenesis: 'Búfalos possuem camada córnea espessa, melanina densa e poucas glândulas sudoríparas (apenas 100 a 200/cm² vs 1000/cm² em zebuínos); incapacidade de dissipar calor por sudorese; dependência extrema de termorregulação por imersão em água e convecção/evaporação cutânea.',
      predisposingFactors: [
        'Piquetes desprovidos de árvores ou sombrites',
        'Açudes secos ou interditados em épocas de estiagem',
        'Manejo forçado e caminhadas longas em horários de pico solar'
      ],
      incubationPeriod: 'Sintomas imediatos em 30 a 60 minutos sob sol pleno'
    },
    symptomsDetails: {
      earlySigns: [
        'Agrupamento de animais buscando sombras parciais de cercas',
        'Frequência respiratória acima de 45 movimentos por minuto'
      ],
      advancedSigns: [
        'Língua pendente com saliva espumosa contínua e olhos esbugalhados',
        'Temperatura retal ultrapassando 41.0°C com andar cambaleante e decúbito estafado',
        'Cessação completa da motilidade ruminal e timpanismo secundário'
      ],
      vitalSignsAlterations: [
        'Temperatura retal: 40.0°C a 42.0°C',
        'Frequência respiratória: 80 a 120 mov/min'
      ],
      necropsyOrLesionFindings: [
        'Congestão pulmonar aguda e hemorragias petequiais no epicárdio por colapso térmico'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Terapia Hídrica e Resfriamento por Aspersão / Imersão',
      dosageAndRoute: 'Ducha fria contínua por 20 a 30 minutos e hidratação com Ringer Lactato IV se prostrado',
      supportiveCare: 'Eletrólitos solúveis na água (K+, Na+, Cl-) e bicarbonato de sódio a 1% na ração',
      biosecurityMeasures: [
        'Planejamento silvipastoril com árvores nativas em todos os piquetes',
        'Controle diário de índice ITU e automação de aspersão'
      ],
      vaccinationProtocol: 'Não se aplica.',
      quarantineDays: 0
    }
  },
  {
    id: 'dis-08',
    name: 'Septicemia Hemorrágica Bubalina (Pasteurelose / Barbone)',
    popularName: 'Barbone dos Búfalos / Febre dos Transportes / Garrotilho Bubalino',
    scientificAgent: 'Pasteurella multocida (sorotipos B:2 e E:2)',
    category: 'Infecciosa',
    transmission: 'Inalação de aerossóis e secreções nasais de animais portadores sãos; água estagnada e cochos comunitários; desencadeada por estresse de transporte ou chuvas bruscas.',
    clinicalSigns: [
      'Febre hiperaguda muito elevada (41°C a 42°C) com prostração extrema',
      'Edema gelatinoso subcutâneo quente e doloroso na garganta, laringe, submandibular e barbela',
      'Dispneia severa com estridor respiratório e cianose de língua e mucosas (morte por asfixia)',
      'Salivação contínua espumosa e corrimento nasal mucopurulento sanguinolento'
    ],
    morbidityRate: '30% a 70% em surtos não vacinados',
    mortalityRate: 'Até 90% em casos não tratados nas primeiras 12 horas',
    diagnosticMethods: [
      'Sinais clínicos clássicos de edema cervical e febre alta fulminante',
      'Isolamento de Pasteurella multocida a partir de sangue venoso ou líquido do edema',
      'PCR específico para confirmação rápida do sorotipo B:2'
    ],
    treatmentProtocol: 'EMERGÊNCIA VETERINÁRIA ABSOLUTA. Antibioticoterapia venosa imediata nas primeiras horas: Oxitetraciclina (10 a 20 mg/kg IV) ou Enrofloxacino (5 a 10 mg/kg IV/SC) ou Sulfadiazina com Trimetoprima (15 a 24 mg/kg IV/IM). Anti-inflamatório esteroide (Dexametasona 0,5 mg/kg IV) ou Flunixin Meglumina para contenção imediata do edema de glote obstrutivo.',
    preventionManagement: 'Vacinação semestral ou anual de todo o rebanho com vacina contra Septicemia Hemorrágica (bacterina morta oleosa); evitar transporte prolongado sem paradas; quarentena preventiva e desinfecção de piquetes.',
    zoonotic: false,
    withdrawalTimeWarning: 'Respeitar período de carência dos antimicrobianos (Enrofloxacino: 28 dias carne / proscrito em leite para consumo direto sem carência).',
    images: ['photo-pasteurellosis-1'],
    references: 'Manual de Doenças Infecciosas dos Búfalos & OIE / WOAH',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Bactéria colonizadora da tonsila e trato respiratório superior que se torna invasiva sob estresse; liberação de lipopolissacarídeos endotóxicos com choque endotóxico, aumento da permeabilidade capilar e infiltração sero-hemorrágica difusa.',
      predisposingFactors: [
        'Oscilações bruscas de temperatura e umidade com ventos frios',
        'Transporte em caminhões boiadeiros sem hidratação prévia',
        'Desmame e aglomeração de animais jovens'
      ],
      incubationPeriod: '1 a 3 dias (evolução clínica rápida de 12 a 36h até o óbito)'
    },
    symptomsDetails: {
      earlySigns: [
        'Febre repentina de 41.5°C com pelos eriçados e tremores musculares',
        'Ligeiro inchaço na região do ângulo da mandíbula'
      ],
      advancedSigns: [
        'Edema monstruoso da barbela descendo até o peito',
        'Estridor laringotraqueal alto com animal esticando o pescoço para respirar',
        'Cianose de mucosas orais e morte fulminante por sufocamento'
      ],
      vitalSignsAlterations: [
        'Temperatura retal: 41.0°C a 42.0°C',
        'Frequência respiratória: 60 a 90 mov/min superficiais'
      ],
      necropsyOrLesionFindings: [
        'Infiltração gelatinosa e hemorrágica abundante no tecido conjuntivo cervical',
        'Petéquias e sufusões pericárdicas e pleurais com broncopneumonia fibrinosa'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Enrofloxacino / Oxitetraciclina IV associado a Meglumina de Flunixin',
      dosageAndRoute: 'Enrofloxacino 5 mg/kg IV lenta a cada 24h por 3 dias | Flunixin 2.2 mg/kg IV',
      supportiveCare: 'Traqueostomia de emergência caso haja obstrução completa da laringe por edema',
      biosecurityMeasures: [
        'Isolamento e tratamento em bloco de todos os animais em contato',
        'Incineração de carcaças para evitar contaminação ambiental'
      ],
      vaccinationProtocol: 'Vacina bacterina contra Septicemia Hemorrágica: 1ª dose aos 4 meses, reforço após 30 dias e revacinação anual antes do período chuvoso.',
      quarantineDays: 21
    }
  },
  {
    id: 'dis-09',
    name: 'Fasciolose Hepática Bubalina',
    popularName: 'Barata do Fígado / Sagüirô / Doença da Várzea',
    scientificAgent: 'Fasciola hepatica (Trematódeo digenético)',
    category: 'Parasitária',
    transmission: 'Ingestão de metacercárias encistadas em gramíneas de várzeas e pastagens alagadas com presença do caramujo hospedeiro intermediário (Lymnaea columella).',
    clinicalSigns: [
      'Emagrecimento progressivo com fraqueza muscular e queda na produção leiteira',
      'Edema submandibular proeminente ("papo mole") por hipoalbuminemia severa',
      'Icterícia leve a moderada de mucosas oculares e vulvares',
      'Fezes amolecidas e mucosas alternadas com constipação'
    ],
    morbidityRate: '20% a 60% em áreas endêmicas de baixadas alagadiças',
    mortalityRate: '2% a 15% em infecções maciças crônicas',
    diagnosticMethods: [
      'Exame coproparasitológico por sedimentação de Dennis, Stone e Swanson (ovos dourados com opérculo)',
      'Necropsia com visualização direta dos trematódeos folhosos nos canais biliares',
      'Enzimologia sérica com elevação de GGT e AST'
    ],
    treatmentProtocol: 'Administração de fasciolicida específico: Triclabendazol (12 mg/kg VO - ativo contra formas jovens e adultas) ou Closantel (10 mg/kg SC/VO) ou Nitroxinil (10 mg/kg SC) ou Albendazol (10 a 15 mg/kg VO em dose para trematódeos). Realizar duas aplicações estratégicas anuais.',
    preventionManagement: 'Drenagem de áreas com acúmulo excessivo de água; controle biológico de caramujos hospedeiros com patos e gansos em lagoas controladas; evitar pastejo em várzeas nas primeiras horas da manhã; rotação de pastagens com áreas secas.',
    zoonotic: true,
    withdrawalTimeWarning: 'Respeitar rigorosamente a carência sanitária dos fasciolicidas para leite e carne (Closantel: 28 dias carne / restrição em leite).',
    images: ['photo-fasciola-1'],
    references: 'Revista Brasileira de Medicina Veterinária & Embrapa',
    etiologyDetails: {
      agentType: 'Nematóide',
      pathogenesis: 'Ingestão de metacercárias; desencistamento no intestino e migração de formas jovens pelo peritônio e parênquima hepático causando hemorragia traumática; alojamento nos ductos biliares com colangite hiperplásica crônica, fibrose e cirrose.',
      predisposingFactors: [
        'Criação de búfalos em áreas pantanosas com presença do caramujo Lymnaea',
        'Ausência de exames coprológicos periódicos de sedimentação',
        'Estação pós-inundação com alta concentração de metacercárias na vegetação'
      ],
      incubationPeriod: 'Período pré-patente de 8 a 12 semanas'
    },
    symptomsDetails: {
      earlySigns: [
        'Perda sutil de apetite e redução da taxa de gordura no leite',
        'Pêlos ressecados e quebradiços'
      ],
      advancedSigns: [
        'Edema submandibular flutuante e frio que aumenta à tarde',
        'Caquexia extrema, apatia e anemia com hematócrito < 18%'
      ],
      vitalSignsAlterations: [
        'Taquicardia moderada e mucosas ictéricas e pálidas'
      ],
      necropsyOrLesionFindings: [
        'Fígado com bordas arredondadas, ductos biliares espessados e calcificados ("tubos de cachimbo") repletos de vermes folhosos castanho-escuros'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Triclabendazol ou Closantel Sódico',
      dosageAndRoute: 'Triclabendazol: 12 mg/kg via oral | Closantel: 10 mg/kg via SC',
      supportiveCare: 'Suplementação proteico-mineral com fontes ricas em ferro e vitamina B12',
      biosecurityMeasures: [
        'Isolamento e cerca de áreas permanentemente encharcadas com alta densidade de moluscos',
        'Tratamento estratégico no início e no final do período chuvoso'
      ],
      vaccinationProtocol: 'Não há vacinas contra fasciolose.',
      quarantineDays: 14
    }
  },
  {
    id: 'dis-10',
    name: 'Tristeza Parasitária Bubalina (TPB - Anaplasmose & Babesiose)',
    popularName: 'Febre do Carrapato / Amarelão / Mal da Ponta de Cauda',
    scientificAgent: 'Anaplasma marginale (Rickettsia) e Babesia bigemina / B. bovis (Protozoários)',
    category: 'Infecciosa',
    transmission: 'Picada do carrapato Rhipicephalus microplus, moscas hematófagas (Stomoxys calcitrans) e agulhas/agulhões de vacinação contaminados.',
    clinicalSigns: [
      'Febre aguda muito alta (> 41°C) com tremores musculares e prostração',
      'Icterícia intensa nas mucosas conjuntival, oral e vulvar (coloração amarela-alaranjada)',
      'Hemoglobinúria ("urina escura cor de café") principalmente nos casos de Babesiose',
      'Anemia hemolítica fulminante, agalaxia súbita e abortamento em fêmeas gestantes'
    ],
    morbidityRate: '15% a 40% em animais introduzidos em áreas de instabilidade enzoótica',
    mortalityRate: '10% a 30% se não diagnosticada e tratada precocemente',
    diagnosticMethods: [
      'Esfregaço de sangue de ponta de cauda ou orelha com coloração rápida tipo Panótico ou Giemsa',
      'Microscopia óptica (1000x): identificação de Anaplasma na periferia das hemácias ou pares de Babesia piriformes intracelulares',
      'Micro-hematócrito para avaliação do grau de anemia'
    ],
    treatmentProtocol: 'Para Anaplasmose: Oxitetraciclina L.A. (20 mg/kg IM profunda) ou Enrofloxacino (5 mg/kg SC). Para Babesiose: Diaceturato de Diminazeno (3,5 mg/kg IM profunda) ou Dipropionato de Imidocarb (1,2 a 2,5 mg/kg SC/IM). Anti-inflamatório (Meglumina de Flunixin 2,2 mg/kg) e suporte de transfusão sanguínea em casos de hematócrito < 12%.',
    preventionManagement: 'Controle estratégico de ectoparasitas vetores (carrapatos e moscas); uso estrito de agulhas descartáveis individuais em vacinações em massa; premunição ou monitoramento sorológico na introdução de animais suscetíveis.',
    zoonotic: false,
    withdrawalTimeWarning: 'Imidocarb possui longo período de carência para abate (até 90 dias) e descarte de leite conforme bula comercial.',
    images: ['photo-tpb-1'],
    references: 'Manual de Sanidade Animal Embrapa & Colégio Brasileiro de Parasitologia Veterinária',
    etiologyDetails: {
      agentType: 'Protozoário',
      pathogenesis: 'Multiplicação de rickettsias/protozoários nos eritrócitos com hemólise intravascular e extravascular maciça no baço; liberação de hemoglobina livre gerando sobrecarga renal, icterícia pré-hepática e anóxia tecidual generalizada.',
      predisposingFactors: [
        'Transferência de animais de áreas livres de carrapato para áreas endêmicas',
        'Uso coletivo de agulhas de injeção em rebanhos com portadores inaparentes',
        'Estresse de parto e desnutrição com reativação de infecções latentes'
      ],
      incubationPeriod: 'Anaplasmose: 20 a 45 dias | Babesiose: 7 a 14 dias'
    },
    symptomsDetails: {
      earlySigns: [
        'Febre súbita acima de 40.5°C e isolamento do animal do restante do lote',
        'Queda total e repentina na produção de leite'
      ],
      advancedSigns: [
        'Mucosas amarelo-canário (icterícia severa) e urina vermelho-escura',
        'Sintomas nervosos (incoordenação motora e agressividade na Babesia bovis)',
        'Taquicardia pronunciada e respiração ofegante por hipóxia anêmica'
      ],
      vitalSignsAlterations: [
        'Temperatura retal: 40.5°C a 41.8°C',
        'Hematócrito: abaixo de 15% (normal em búfalos: 30-40%)'
      ],
      necropsyOrLesionFindings: [
        'Esplenomegalia com baço aumentado, polpa friável e fígado hipertrofiado amarelado'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Dipropionato de Imidocarb ou Diaceturato de Diminazeno + Oxitetraciclina',
      dosageAndRoute: 'Imidocarb: 1.2 mg/kg via SC (Babesiose) ou 2.5 mg/kg (Anaplasmose)',
      supportiveCare: 'Complexos com ferro e vitamina B12 (Cianocobalamina) e protetores hepáticos',
      biosecurityMeasures: [
        'Troca de agulhas a cada animal em manejos profiláticos',
        'Banhos carrapaticidas com rotação de princípios ativos conforme teste de eficácia'
      ],
      vaccinationProtocol: 'Vacinação com cepas atenuadas em bezerras em regiões de instabilidade enzoótica.',
      quarantineDays: 30
    }
  },
  {
    id: 'dis-11',
    name: 'Leptospirose Bubalina',
    popularName: 'Doença da Urina Vermelha / Aborto por Leptospira',
    scientificAgent: 'Leptospira interrogans (sorovares Hardjo, Pomona, Grippotyphosa, Icterohaemorrhagiae)',
    category: 'Reprodutiva',
    transmission: 'Contato com urina de roedores e animais infectados em água parada, lagoas contaminadas, pastos alagados e mucosa genital durante a cópula.',
    clinicalSigns: [
      'Surto de abortos em fêmeas prenhes (concentrados no 2º e 3º trimestres)',
      'Nascimento de bezerros prematuros, fracos ou natimortos',
      'Hemoglobinúria com urina de coloração avermelhada/vinho em bezerros e matrizes',
      'Síndrome da Queda do Leite com secreção mamária espessa, amarelada e com rajas de sangue ("leite com colostro tardio")'
    ],
    morbidityRate: '20% a 50%',
    mortalityRate: '< 5% em adultos; até 20% em bezerros afetados com nefrite aguda',
    diagnosticMethods: [
      'Sorodiagnóstico padrão-ouro: Teste de Soroaglutinação Microscópica (SAM) com painel de sorovares',
      'PCR em amostras de urina coletadas pós-administração de Furosemida',
      'Microscopia de campo escuro para identificação de espiroquetas móveis'
    ],
    treatmentProtocol: 'Antibioticoterapia de eliminação de portadores renais: Dihidroestreptomicina (25 mg/kg IM dose única) ou Oxitetraciclina L.A. (20 mg/kg IM profunda repetida após 5 dias) ou Ceftiofur (2.2 mg/kg IM por 5 dias). Suporte renal com fluidoterapia.',
    preventionManagement: 'Vacinação semestral de todo o rebanho reprodutor com vacina polivalente inativada contendo os sorovares prevalentes na região; controle rigoroso de roedores nos depósitos de ração; cercamento de poças de água estagnada e quarentena de reprodutores.',
    zoonotic: true,
    withdrawalTimeWarning: 'Zoonose de alta relevância ocupacional para ordenhadores e tratadores rurais.',
    images: ['photo-leptospira-1'],
    references: 'Ministério da Agricultura e Pecuária (MAPA) & OIE',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Penetração de espiroquetas através de mucosas íntegras ou pele macerada por água; leptospiremia sistêmica transitória seguida de colonização crônica do epitélio tubular renal e trato reprodutivo, gerando nefrite intersticial e lise eritrocitária.',
      predisposingFactors: [
        'Permanência diária em açudes com fezes/urina acumuladas e sem renovação de água',
        'Presença de ratos e capivaras compartilhando mananciais de água',
        'Ausência de calendário vacinal semestral'
      ],
      incubationPeriod: '4 a 14 dias'
    },
    symptomsDetails: {
      earlySigns: [
        'Febre transitória leve (39.5°C a 40.0°C) acompanhada de depressão moderada',
        'Queda abrupta de 50% na secreção láctea em todo o lote de matrizes'
      ],
      advancedSigns: [
        'Urina com espuma e coloração vinho/castanha escura (hemoglobinúria)',
        'Abortamento de fetos autolisados no terço médio a final da prenhez',
        'Flacidez dos quartos mamários com leite colostral alaranjado sem mastite bacteriana típica'
      ],
      vitalSignsAlterations: [
        'Temperatura retal elevada na fase aguda',
        'Mucosas pálidas e subictéricas'
      ],
      necropsyOrLesionFindings: [
        'Nefrite intersticial difusa com múltiplos focos esbranquiçados na superfície cortical dos rins'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Dihidroestreptomicina ou Oxitetraciclina L.A.',
      dosageAndRoute: 'Estreptomicina: 25 mg/kg IM em dose única | Oxitetraciclina L.A.: 20 mg/kg IM',
      supportiveCare: 'Fluidos isotônicos e restrição temporária de banho em açudes fechados durante o surto',
      biosecurityMeasures: [
        'Desratização permanente de silos, galpões e fábricas de ração',
        'Uso de luvas e botas impermeáveis pela equipe da ordenha'
      ],
      vaccinationProtocol: 'Vacina polivalente contra Leptospirose a cada 6 meses em todas as matrizes e touros reprodutores.',
      quarantineDays: 30
    }
  },
  {
    id: 'dis-12',
    name: 'Clostridiose (Carbúnculo Sintomático / Manqueira & Enterotoxemia)',
    popularName: 'Manqueira Infecciosa / Perna Preta / Morte Súbita dos Búfalos',
    scientificAgent: 'Clostridium chauvoei, Clostridium perfringens (tipos C e D), Clostridium septicum',
    category: 'Infecciosa',
    transmission: 'Ingestão de esporos altamente resistentes presentes no solo e pastagens; germinação em tecidos musculares traumatizados com anóxia local.',
    clinicalSigns: [
      'Claudicação hiperaguda severa em membros posteriores ou anteriores',
      'Inchaço muscular volumoso, quente e doloroso que se torna frio e indolor',
      'Crepitação audível e palpável à compressão digital da musculatura (enfisema gasoso subcutâneo)',
      'Febre alta, tremores, toxemia fulminante e óbito rápido em 12 a 24 horas'
    ],
    morbidityRate: '5% a 20% (casos esporádicos ou pequenos surtos em animais jovens)',
    mortalityRate: '95% a 100% dos animais clinicamente afetados',
    diagnosticMethods: [
      'Exame clínico com constatação de crepitação enfisematosa típica na palpação muscular',
      'Necropsia com coleta de fragmentos musculares protegidos e exame de Imunofluorescência Direta (IFD)',
      'PCR multiplex para diferenciação de espécies clostridiais'
    ],
    treatmentProtocol: 'Frequentemente ineficaz devido à rápida toxemia e destruição tecidual. Em casos precoces: Megadoses de Penicilina Cristalina/Potássica (20.000 a 40.000 UI/kg IV/IM a cada 12h) associada a Penicilina Benzatina e infiltração de oxigênio ou toalete cirúrgica muscular ampla; anti-inflamatório não esteroide para controle do choque endotóxico.',
    preventionManagement: 'Vacinação anual sistemática de 100% do rebanho com vacina polivalente clostridial (vacina de 8 a 10 cepas); primeira dose aos 3 a 4 meses com reforço obrigatório após 30 dias; incineração total e enterramento de cadáveres com cal virgem; não revolver pastos com histórico de mortes.',
    zoonotic: false,
    withdrawalTimeWarning: 'Carência dos antibióticos utilizados; carcaças de animais positivos NUNCA devem ser destinadas ao consumo humano ou farinha de carne.',
    images: ['photo-clostridium-1'],
    references: 'Manual Veterinário de Doenças Clostridiais & ABCB',
    etiologyDetails: {
      agentType: 'Bactéria',
      pathogenesis: 'Ingestão de esporos que atravessam a mucosa intestinal e se instalam em estado latente nas grandes massas musculares; microtraumatismos criam anaerobiose que ativa a germinação bacteriana; produção massiva de toxinas alfa (lecitinases) que causam mionecrose necrotizante fulminante com produção de gás.',
      predisposingFactors: [
        'Animais jovens em fase de crescimento acelerado (6 a 24 meses)',
        'Contusões em troncos, cercas ou transporte',
        'Revolvimento de terra em pastagens antigas sem histórico de vacinação'
      ],
      incubationPeriod: '1 a 3 dias pós-trauma desencadeante'
    },
    symptomsDetails: {
      earlySigns: [
        'Animal atrasado no lote e mancando intensamente de uma das patas traseiras',
        'Temperatura retal elevada (41.0°C) e recusa de forragem'
      ],
      advancedSigns: [
        'Tumefação esponjosa na coxa/garupa com som crepitante (como pisar em folhas secas)',
        'Pele sobre a lesão seca, apergaminhada e fria',
        'Coma e morte súbita em poucas horas por choque toxêmico'
      ],
      vitalSignsAlterations: [
        'Temperatura corporal inicialmente alta, caindo para hipotermia pré-morte',
        'Frequência cardíaca > 100 bpm com pulso fraco'
      ],
      necropsyOrLesionFindings: [
        'Músculo enegrecido, seco e esponjoso com bolhas de gás e odor rançoso característico de manteiga azeda'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Penicilina G Potássica / Procaína em altas doses',
      dosageAndRoute: '30.000 UI/kg via IM profunda ou IV a cada 12h nos estágios iniciais',
      supportiveCare: 'Fluido com bicarbonato para acidose e analgésicos potentes',
      biosecurityMeasures: [
        'Incineração obrigatória de cadáveres para não esporular e contaminar o solo',
        'Desinfecção de agulhas e bisturis com autoclave ou fervura prolongada'
      ],
      vaccinationProtocol: 'Vacina polivalente contra clostridioses (Polivac): Bezerros aos 4 meses, reforço aos 5 meses e revacinação anual de todo o rebanho.',
      quarantineDays: 14
    }
  },
  {
    id: 'dis-13',
    name: 'Eimeriose / Coccidiose Neonatal Bubalina',
    popularName: 'Curso de Sangue dos Bezerros / Coccidiose Bubalina',
    scientificAgent: 'Eimeria bareillyi, Eimeria zuernii, Eimeria bovis',
    category: 'Neonatal',
    transmission: 'Ingestão de oocistos esporulados em água, pastagens e currais contaminados com fezes de outros bezerros ou matrizes portadoras.',
    clinicalSigns: [
      'Diarreia profusa fétida com presença marcante de estrias de sangue vivo e coágulos',
      'Tenesmo fecal acentuado (esforço doloroso para defecar com arqueamento da coluna)',
      'Desidratação rápida com enoftalmia (olhos fundos) e perda de elasticidade da pele',
      'Fraqueza severa, decúbito e risco de prolapso retal por esforço evacuatório'
    ],
    morbidityRate: '30% a 70% em bezerreiros com alta lotação',
    mortalityRate: '5% a 20% em bezerros jovens sem suporte hidroeletrolítico',
    diagnosticMethods: [
      'Exame coproparasitológico por técnica de flutuação com solução hipersaturada de NaCl / açúcar',
      'Contagem de oocistos por grama de fezes (OOPG) e identificação micrométrica de E. bareillyi'
    ],
    treatmentProtocol: 'Anticoccidiano de precisão: Toltrazuril (15 a 20 mg/kg VO em dose única) ou Diclazuril (1 mg/kg VO) ou Sulfadimetoxina / Sulfametazina (50 mg/kg VO/IV no primeiro dia, seguido de 25 mg/kg por 4 dias). Terapia de reidratação oral e protetores de mucosa (caulim/pectina).',
    preventionManagement: 'Higiene e desinfecção rigorosa de bezerreiros com piso cimentado e uso de cal virgem; redução da densidade de animais por lote; fornecimento de bebedouros suspensos que evitem contaminação fecal; toltrazuril preventivo em lotes de alto risco aos 21 dias de vida.',
    zoonotic: false,
    withdrawalTimeWarning: 'Respeitar período de carência do toltrazuril e sulfas conforme bula.',
    images: ['photo-coccidia-1'],
    references: 'Revista Brasileira de Parasitologia Veterinária & Embrapa',
    etiologyDetails: {
      agentType: 'Protozoário',
      pathogenesis: 'Ingestão de oocistos esporulados; invasão dos enterócitos do íleo, ceco e cólon com reprodução assexuada (merogonia) e sexuada (gametogonia); lise celular massiva com destruição das criptas intestinais, hemorragia epitelial e necrose da mucosa.',
      predisposingFactors: [
        'Superlotação em bezerreiros coletivos sem rotação de baias',
        'Desmame precoce e estresse alimentar com queda de imunidade',
        'Acúmulo de umidade e camas de feno úmidas'
      ],
      incubationPeriod: 'Período pré-patente de 14 a 21 dias'
    },
    symptomsDetails: {
      earlySigns: [
        'Fezes semi-líquidas escuras e cauda suja com crostas fecais',
        'Redução na ingestão de colostro/leite e pelos eriçados'
      ],
      advancedSigns: [
        'Defecação contínua de muco com coágulos de sangue e pedaços de fibrina',
        'Coluna arqueada durante a defecação com emissão de grunhidos de dor',
        'Incoordenação motora e convulsões terminais em casos de coccidioneurotoxicose'
      ],
      vitalSignsAlterations: [
        'Temperatura corporal normal a subnormal (hipotermia por desidratação)',
        'Frequência cardíaca elevada (> 110 bpm)'
      ],
      necropsyOrLesionFindings: [
        'Tiflocolite hemorrágica difusa com placas de fibrina e mucosa do ceco e cólon recoberta por pseudomembranas diftéricas'
      ]
    },
    controlDetails: {
      drugOfChoice: 'Toltrazuril 5% Oral em Dose Única ou Diclazuril',
      dosageAndRoute: 'Toltrazuril: 15 a 20 mg/kg via oral (3 mL para cada 10 kg de peso vivo)',
      supportiveCare: 'Hidratação com soluções ricas em glicose, sódio e bicarbonato e vitamina K para hemostasia',
      biosecurityMeasures: [
        'Limpeza diária com vassoura de fogo (lança-chamas) em bezerreiros de alvenaria',
        'Uso de cochos e bebedouros de altura mínima de 40 cm do chão'
      ],
      vaccinationProtocol: 'Não há vacinas comerciais. Controle baseado em biosseguridade e coccidiostáticos na ração.',
      quarantineDays: 14
    }
  }
];

export const INITIAL_BUFFALO_PHARMACY: BuffaloPharmacyItem[] = [];

export const INITIAL_BUFFALO_FACILITIES: BuffaloFacility[] = [];

export const INITIAL_THERMAL_WELFARE: BuffaloThermalWelfareIndex = {
  date: new Date().toISOString().split('T')[0],
  ambientTemperatureC: 28.5,
  relativeHumidityPct: 68,
  blackGlobeTemperatureC: 31.2,
  windSpeedKmH: 8.5,
  thiCalculated: 77.4,
  bgthiCalculated: 81.2,
  stressLevel: 'Normal / Conforto Pleno',
  waterBathAvailabilityHours: 4.5,
  shadeAvailabilityM2PerHead: 7.8,
  herdRuminationPct: 82,
  herdPantingPct: 4,
  recommendations: [
    'Manter portão do Açude 01 aberto para banho livre entre 11h e 14h30.',
    'Acionar nebulizadores da sala de espera da ordenha 10 minutos antes da entrada do Lote A.',
    'Verificar nível de água fresca nos bebedouros de alta vazão.'
  ]
};

// Funções de Cálculo Especializadas para Búfalos

/**
 * Calcula o Índice de Eficiência da Bubalinocultura (IEB) da GeaAgro
 */
export function calculateIEB(animals: BuffaloAnimal[], paddocks: BuffaloPaddock[], thermalIndex: BuffaloThermalWelfareIndex): BuffaloIEBCalculation {
  if (!animals || animals.length === 0) {
    return {
      overallScore: 75,
      classification: 'Satisfatório',
      reproductiveEfficiencyScore: 75,
      productiveEfficiencyScore: 75,
      healthBiosecurityScore: 80,
      thermalWelfareScore: 85,
      foragePastureManagementScore: 70,
      economicCostScore: 75,
      strengths: ['Rebanho com bom potencial genético'],
      opportunities: ['Cadastrar mais pesagens e controles leiteiros'],
      actionPlan: ['Realizar pesagem mensal e monitoramento de CCS']
    };
  }

  // 1. Reprodução (25%)
  const safeAnimals = animals || [];
  const safePaddocks = paddocks || [];
  const pregnantOrLactating = safeAnimals.filter(a => a.status === 'Em Lactação' || a.status === 'Gestante' || (a.category?.includes('Matriz') && a.parityCount > 0)).length;
  const totalFemales = safeAnimals.filter(a => a.sex === 'Fêmea').length || 1;
  const reproRatio = Math.min(100, Math.round((pregnantOrLactating / totalFemales) * 100));
  const animalsWithIEP = safeAnimals.filter(a => a.calvingIntervalDays);
  const avgIEP = animalsWithIEP.reduce((acc, a) => acc + (a.calvingIntervalDays || 410), 0) / (animalsWithIEP.length || 1);
  const iepScore = avgIEP <= 400 ? 95 : avgIEP <= 430 ? 85 : 70;
  const reproScore = Math.round((reproRatio * 0.6) + (iepScore * 0.4));

  // 2. Produção (25%)
  const lactating = safeAnimals.filter(a => a.status === 'Em Lactação' && a.averageDailyMilkLiters);
  const avgMilk = lactating.length > 0 ? lactating.reduce((acc, a) => acc + (a.averageDailyMilkLiters || 0), 0) / lactating.length : 12;
  const milkScore = Math.min(100, Math.round((avgMilk / 15) * 90));

  // 3. Sanidade (15%)
  const totalHealthEvents = safeAnimals.reduce((acc, a) => acc + (a.healthRecords?.length || 0), 0);
  const healthScore = totalHealthEvents > 0 ? 92 : 85;

  // 4. Conforto Térmico & Bem-estar (15%)
  let welfareScore = 88;
  if (thermalIndex?.stressLevel === 'Normal / Conforto Pleno') welfareScore = 95;
  else if (thermalIndex?.stressLevel === 'Alerta Leve') welfareScore = 82;
  else if (thermalIndex?.stressLevel === 'Estresse Moderado') welfareScore = 65;
  else welfareScore = 45;

  // 5. Pastagens & Forragens (10%)
  const avgStocking = safePaddocks.reduce((acc, p) => acc + (p.currentStockingRateUaHa || 0), 0) / (safePaddocks.length || 1);
  const pastureScore = avgStocking >= 2.0 && avgStocking <= 3.5 ? 92 : 78;

  // 6. Custos & Rentabilidade (10%)
  const economicScore = 86;

  const overall = Math.round(
    (reproScore * 0.25) +
    (milkScore * 0.25) +
    (healthScore * 0.15) +
    (welfareScore * 0.15) +
    (pastureScore * 0.10) +
    (economicScore * 0.10)
  );

  let classification: BuffaloIEBCalculation['classification'] = 'Satisfatório';
  if (overall >= 90) classification = 'Excelente / Elite';
  else if (overall >= 80) classification = 'Muito Bom';
  else if (overall >= 70) classification = 'Satisfatório';
  else if (overall >= 60) classification = 'Abaixo da Média';
  else classification = 'Crítico';

  return {
    overallScore: overall,
    classification,
    reproductiveEfficiencyScore: reproScore,
    productiveEfficiencyScore: milkScore,
    healthBiosecurityScore: healthScore,
    thermalWelfareScore: welfareScore,
    foragePastureManagementScore: pastureScore,
    economicCostScore: economicScore,
    strengths: [
      'Excelente teor de gordura (média > 7.8%) e rendimento queijeiro da Mozzarella',
      'Manejo térmico com acesso estruturado a açudes de banho e áreas sombreadas',
      'Protocolos de sanidade preventiva (Clostridioses, Brucelose e Tuberculose) em dia'
    ],
    opportunities: [
      'Redução do Intervalo entre Partos (IEP) com ampliação dos protocolos de IATF com eCG',
      'Aprimoramento da suplementação mineral nos meses de transição seca-águas'
    ],
    actionPlan: [
      'Inseminar matrizes com escore corporal >= 3.2 aos 60 dias pós-parto',
      'Aumentar o monitoramento de CCS semanal nas búfalas do Lote A'
    ]
  };
}

/**
 * Calcula rendimento queijeiro de Mozzarella de Búfala D.O.P.
 * Fórmula clássica de Rendimento: Litros necessários por kg de Mozzarella = 100 / (1.1 * %Gordura + 2.1 * %Proteína - 2.5)
 */
export function calculateMozzarellaYieldLitersPerKg(fatPct: number, proteinPct: number): number {
  const yieldPct = (1.1 * fatPct) + (2.1 * proteinPct) - 2.5;
  if (yieldPct <= 0) return 4.8;
  return Number((100 / yieldPct).toFixed(2));
}

/**
 * Calcula o ITU (Índice de Temperatura e Umidade) específico
 */
export function calculateTHIBuffalo(tempC: number, rhPct: number): number {
  return Number(((0.8 * tempC) + ((rhPct / 100) * (tempC - 14.4)) + 46.4).toFixed(1));
}
