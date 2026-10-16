import {
  EquineAnimal,
  EquineDiseaseGuide,
  EquineNutritionFeed,
  EquineFacility,
  EquineInventoryItem,
  EquineBiometricsRecord,
  EquineReproductionRecord,
  EquineHealthRecord,
  EquineDentalRecord,
  EquineFarrieryRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineExpenseRecord,
  EquineExamRecord,
  EquinePhotoRecord,
} from '../types/equine';

export const INITIAL_EQUINE_ANIMALS: EquineAnimal[] = [];

export const INITIAL_EQUINE_FACILITIES: EquineFacility[] = [];

export const INITIAL_EQUINE_INVENTORY: EquineInventoryItem[] = [];

export const INITIAL_EQUINE_BIOMETRICS: EquineBiometricsRecord[] = [];

export const INITIAL_EQUINE_REPRODUCTION: EquineReproductionRecord[] = [];

export const INITIAL_EQUINE_HEALTH: EquineHealthRecord[] = [];

export const INITIAL_EQUINE_DENTAL: EquineDentalRecord[] = [];

export const INITIAL_EQUINE_FARRIERY: EquineFarrieryRecord[] = [];

export const INITIAL_EQUINE_TRAININGS: EquineTrainingRecord[] = [];

export const INITIAL_EQUINE_COMPETITIONS: EquineCompetitionRecord[] = [];

export const INITIAL_EQUINE_EXPENSES: EquineExpenseRecord[] = [];

export const INITIAL_EQUINE_EXAMS: EquineExamRecord[] = [];

export const INITIAL_EQUINE_PHOTOS: EquinePhotoRecord[] = [];

export const EQUINE_FEEDS_CATALOG: EquineNutritionFeed[] = [
  {
    id: 'feed-01',
    name: 'Feno de Coastcross (Cynodon dactylon)',
    category: 'Feno',
    dryMatterPct: 89.0,
    crudeProteinPct: 11.5,
    digestibleEnergyMcalKg: 2.15,
    neutralDetergentFiberPct: 65.0,
    calciumPct: 0.42,
    phosphorusPct: 0.24,
    costPerKgBrl: 1.25,
  },
  {
    id: 'feed-02',
    name: 'Feno de Alfafa (Medicago sativa) 1º Corte',
    category: 'Feno',
    dryMatterPct: 90.0,
    crudeProteinPct: 18.5,
    digestibleEnergyMcalKg: 2.45,
    neutralDetergentFiberPct: 44.0,
    calciumPct: 1.35,
    phosphorusPct: 0.28,
    costPerKgBrl: 2.10,
  },
  {
    id: 'feed-03',
    name: 'Pastagem de Tifton 85 (Pastejo Rotacionado)',
    category: 'Pastagem',
    dryMatterPct: 24.0,
    crudeProteinPct: 13.0,
    digestibleEnergyMcalKg: 2.20,
    neutralDetergentFiberPct: 62.0,
    calciumPct: 0.40,
    phosphorusPct: 0.26,
    costPerKgBrl: 0.08,
  },
  {
    id: 'feed-04',
    name: 'Ração Concentrada Equinos Performance 14% PB',
    category: 'Ração Concentrada',
    dryMatterPct: 89.5,
    crudeProteinPct: 14.0,
    digestibleEnergyMcalKg: 3.35,
    neutralDetergentFiberPct: 18.0,
    calciumPct: 0.95,
    phosphorusPct: 0.65,
    costPerKgBrl: 3.40,
  },
  {
    id: 'feed-05',
    name: 'Ração Concentrada Potros Crescimento 18% PB',
    category: 'Ração Concentrada',
    dryMatterPct: 90.0,
    crudeProteinPct: 18.0,
    digestibleEnergyMcalKg: 3.45,
    neutralDetergentFiberPct: 16.0,
    calciumPct: 1.20,
    phosphorusPct: 0.80,
    costPerKgBrl: 4.10,
  },
  {
    id: 'feed-06',
    name: 'Óleo Vegetal de Linhaça / Soja Enriquecido',
    category: 'Aditivo / Óleo',
    dryMatterPct: 99.0,
    crudeProteinPct: 0.0,
    digestibleEnergyMcalKg: 8.90,
    neutralDetergentFiberPct: 0.0,
    calciumPct: 0.0,
    phosphorusPct: 0.0,
    costPerKgBrl: 14.50,
  },
  {
    id: 'feed-07',
    name: 'Suplemento Mineral & Vitamínico Equino Alta Performance',
    category: 'Suplemento / Mineral',
    dryMatterPct: 98.0,
    crudeProteinPct: 4.0,
    digestibleEnergyMcalKg: 0.50,
    neutralDetergentFiberPct: 2.0,
    calciumPct: 14.0,
    phosphorusPct: 7.5,
    costPerKgBrl: 9.80,
  }
];

export const EQUINE_DISEASES_BANK: EquineDiseaseGuide[] = [
  {
    id: 'dis-colica',
    name: 'Síndrome Cólica Equina (Abdômen Agudo)',
    scientificName: 'Espasmódica, Timpanismo, Impactação, Torção ou Deslocamento Intestinal',
    category: 'Gastrointestinal',
    urgency: 'Emergência Veterinária Máxima',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Cavar o chão com os cascos',
      'Olhar repetidamente para os flancos',
      'Deitar e rolar com violência',
      'Sudorese profusa e taquicardia (>60 bpm)',
      'Ausência total de motilidade intestinal (borborigmos ausentes)'
    ],
    causesAndPathogenesis: 'Alterações bruscas na dieta, excesso de concentrado amiláceo, privação hídrica, estresse de transporte ou parasitismo maciço por Strongylus vulgaris.',
    clinicalSigns: 'Dor visceral aguda, mucosas congestas ou cianóticas, refluxo gástrico em sondagem nasogástrica.',
    treatmentProtocol: 'Sondagem nasogástrica imediata descompressiva, fluidoterapia intravenosa vigorosa (Ringer Lactato), analgesia com flunixin meglumine e avaliação para laparotomia exploratória urgente.',
    preventiveMeasures: 'Fornecimento regular de volumoso de qualidade (>1.5% do peso vivo em matéria seca), acesso irrestrito a água limpa, transição alimentar gradual mínima de 10 dias e desparasitação periódica orientada por OPG.',
    firstAidAdvice: 'Caminhar calmamente com o animal para evitar que se debata ou role. Nunca administrar analgésicos antes da chegada do médico veterinário para não mascarar sinais cirúrgicos.',
    references: 'White, N. A. (2009). The Equine Acute Abdomen. Lea & Febiger / CBCAV.'
  },
  {
    id: 'dis-laminite',
    name: 'Laminite Equina (Aguamento)',
    scientificName: 'Inflamação e isquemia das lâminas dérmicas e epidérmicas do casco',
    category: 'Locomotor / Podologia',
    urgency: 'Emergência Veterinária Máxima',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Postura típica de alívio: membros anteriores estendidos à frente e posteriores sob o corpo',
      'Pulso digital aumentado e quente nas artérias digitais palmares',
      'Relutância extrema em andar ou girar',
      'Sensibilidade positiva ao teste com pinça de casco na região da pinça'
    ],
    causesAndPathogenesis: 'Sobrecarga de carboidratos solúveis (frutanos/amido), endotoxemia por cólica ou metrite séptica, Síndrome Metabólica Equina (SME) ou hiperadrenocorticismo (PPID).',
    clinicalSigns: 'Dor intensa nos membros anteriores, elevação de temperatura da muralha e eventual afundamento ou rotação da terceira falange visível ao Raio-X.',
    treatmentProtocol: 'Crioterapia contínua imersiva em gelo (pelo menos 48h nas fases iniciais), anti-inflamatórios não-esteroidais (flunixin ou fenilbutazona), suporte mecânico de ranilha com botas ou palmilhas ergométricas.',
    preventiveMeasures: 'Controle rigoroso do aporte de grãos e açúcares, pastejo controlado em horários de menor teor de frutanos, manejo de peso corporal.',
    firstAidAdvice: 'Confinar em baia com cama espessa de maravalha ou areia (20 cm). Aplicar bolsas de gelo com água cobrindo do boleto ao casco imediatamente.',
    references: 'Pollitt, C. C. (2014). Equine Laminitis: Current Concepts. Australian RIRDC.'
  },
  {
    id: 'dis-aie',
    name: 'Anemia Infecciosa Equina (AIE)',
    scientificName: 'Lentivirus (família Retroviridae)',
    category: 'Infecciosa / Viral',
    urgency: 'Alta Urgência',
    mapaCompulsoryNotification: true,
    symptoms: [
      'Febre intermitente e recorrente (40-41°C)',
      'Anemia progressiva com icterícia ou palidez de mucosas',
      'Edemas ventrais em membros, peito e prepúcio/úbere',
      'Perda de peso progressiva e letargia'
    ],
    causesAndPathogenesis: 'Transmissão mecânica por dípteros hematófagos (Tabanídeos - mutucas e Stomoxys calcitrans) ou uso iatrogênico de agulhas e instrumentos contaminados.',
    clinicalSigns: 'Forma aguda: febre hemorrágica; forma crônica: anemia e debilidade; forma inaparente: portador assintomático soropositivo.',
    treatmentProtocol: 'Não há tratamento ou vacina permitida no Brasil. Animal positivo confirmado por teste oficial de Imunodifusão em Gel de Ágar (Coggins) deve ser eutanasiado conforme normas do MAPA.',
    preventiveMeasures: 'Exames semestrais de Coggins, trânsito apenas com Guia de Trânsito Animal (GTA) e laudo negativo válido, uso estrito de agulhas descartáveis individuais e controle de mutucas.',
    firstAidAdvice: 'Isolar imediatamente o animal de todo o plantel em piquete a mais de 200 metros e notificar o órgão de defesa sanitária animal estadual.',
    references: 'Instrução Normativa MAPA nº 45/2004 e atualização MAPA nº 6/2018.'
  },
  {
    id: 'dis-mormo',
    name: 'Mormo Equino',
    scientificName: 'Burkholderia mallei (Bactéria Gram-negativa)',
    category: 'Bacteriana',
    urgency: 'Emergência Veterinária Máxima',
    mapaCompulsoryNotification: true,
    symptoms: [
      'Corrimento nasal mucopurulento bilateral ou unilateral',
      'Nódulos e úlceras estreladas na mucosa nasal com cicatrizes',
      'Linfadenite e enfartamento de linfonodos submandibulares',
      'Nódulos e cordões linfáticos cutâneos ulcerados em membros'
    ],
    causesAndPathogenesis: 'Zoonose grave de alta letalidade. Transmissão por ingestão de água e alimentos contaminados com secreções, fômites ou aerossóis.',
    clinicalSigns: 'Formas respiratória, cutânea e crônica ulcerativa.',
    treatmentProtocol: 'Tratamento é expressamente proibido por lei federal no Brasil. Doença de notificação compulsória imediata ao MAPA, com interdição do estabelecimento e sacrifício dos positivos.',
    preventiveMeasures: 'Exigência rigorosa de exame oficial negativo (Fixação de Complemento ou ELISA) para trânsito e aglomerações, quarentena para novas entradas.',
    firstAidAdvice: 'Não manipular secreções sem EPI completo (luvas, máscara N95, óculos) pelo risco zoonótico. Isolar e comunicar a Defesa Agropecuária imediatamente.',
    references: 'Portaria MAPA SDA nº 35/2018 - Programa Nacional de Sanidade dos Equídeos (PNSE).'
  },
  {
    id: 'dis-garrotilho',
    name: 'Garrotilho (Adenite Equina)',
    scientificName: 'Streptococcus equi subsp. equi',
    category: 'Bacteriana',
    urgency: 'Alta Urgência',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Febre súbita (39.5 a 41°C)',
      'Corrimento nasal purulento abundante e espesso',
      'Tosse dolorosa e disfagia',
      'Abscessos volumosos e dolorosos nos linfonodos submandibulares e retrofaríngeos que fistulam'
    ],
    causesAndPathogenesis: 'Infecção bacteriana das vias aéreas superiores, altamente contagiosa entre animais jovens (<5 anos) por contato direto ou fômites.',
    clinicalSigns: 'Aumento de volume mandibular/faríngeo com calor e flutuação antes do rompimento, estridor respiratório se compressão traqueal.',
    treatmentProtocol: 'Favorecer a maturação dos abscessos com compressas mornas ou pomadas ictioladas, drenagem e lavagem com clorexidina. Antibioticoterapia (penicilina potássica/procaína) sob orientação veterinária.',
    preventiveMeasures: 'Vacinação anual do plantel jovem, quarentena de 21 dias para recém-chegados, desinfecção de cochos e baldes.',
    firstAidAdvice: 'Isolar os animais febris em área separada. Nunca compartilhar raspadeiras, cabrestos ou bebedouros.',
    references: 'Sweeney, C. R. et al. (2005). Streptococcus equi Infections in Horses: Guidelines for Treatment, Control, and Prevention. J Vet Intern Med.'
  },
  {
    id: 'dis-tetano',
    name: 'Tétano Equino',
    scientificName: 'Clostridium tetani (Neurotoxina tetanospasmina)',
    category: 'Bacteriana',
    urgency: 'Emergência Veterinária Máxima',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Prolapso característico da terceira pálpebra ao menor estímulo luminoso ou sonoro',
      'Rigidez muscular generalizada ("postura em cavalete")',
      'Trismo mandibular (incapacidade de abrir a boca)',
      'Orelhas eretas, narinas dilatadas e cauda em bandeira',
      'Espasmos musculares severos com hipersensibilidade'
    ],
    causesAndPathogenesis: 'Contaminação de ferimentos profundos, perfurações de casco por pregos, feridas cirúrgicas ou coto umbilical em ambiente anaeróbico por esporos do solo.',
    clinicalSigns: 'Tetania progressiva, espasmos diafragmáticos com risco iminente de parada respiratória.',
    treatmentProtocol: 'Soro antitetânico em altas doses (IV e intratecal), penicilina benzatina/cristalina para erradicar o foco, desbridamento cirúrgico e oxigenação da ferida, sedação com acepromazina e diazepam.',
    preventiveMeasures: 'Vacinação regular com toxoide antitetânico (anual em adultos e reforço pré-parto em éguas). Em ferimentos acidentais em animais com histórico vacinal incerto, aplicar soro antitetânico preventivo imediatamente.',
    firstAidAdvice: 'Manter o animal em baia escura, silenciosa, com forração profunda e algodão nos ouvidos para minimizar estímulos táteis e auditivos enquanto aguarda o veterinário.',
    references: 'Green, S. L. et al. (1994). Tetanus in horses: 70 cases (1977-1990). JAVMA.'
  },
  {
    id: 'dis-piroplasmose',
    name: 'Piroplasmose Equina (Babesiose / Theileria equi)',
    scientificName: 'Theileria equi & Babesia caballi (Protozoários Intraeritrocitários)',
    category: 'Protozoária',
    urgency: 'Alta Urgência',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Febre alta súbita e intermitente (39.5 a 41.5°C)',
      'Icterícia conjuntival e gengival intensa (mucosas amarelo-ouro)',
      'Hemoglobinúria característica (urina escura cor de vinho ou café)',
      'Fraqueza, letargia profunda e taquipneia compensatória'
    ],
    causesAndPathogenesis: 'Transmissão por carrapatos vetores (Amblyomma sculptum / Dermacentor nitens) e agulhas contaminadas. Multiplicação parasitária dentro das hemácias provocando lise intravascular maciça.',
    clinicalSigns: 'Anemia hemolítica grave, esplenomegalia, hiperbilirrubinemia, azotemia pré-renal e risco de choque anóxico.',
    treatmentProtocol: 'Dipropionato de Imidocarb (4.0 mg/kg IM em dose única ou protocolo de esterilização) ou Diminazeno sob estrita supervisão veterinária, acompanhado de fluidoterapia e suporte hepatoprotetor.',
    preventiveMeasures: 'Controle sistemático de carrapatos nas pastagens e baias, quarentena, carrapaticidas tópicos à base de cipermetrina/piretroides e agulhas individuais descartáveis.',
    firstAidAdvice: 'Confinar o animal em local fresco e arejado, suspender imediatamente qualquer treino ou exercício físico e coletar sangue para esfregaço de ponta de orelha.',
    references: 'Friedhoff, K. T. et al. (1990). Equine Piroplasmosis: An Overview. Rev Sci Tech Off Int Epiz.'
  },
  {
    id: 'dis-tendinite',
    name: 'Tendinite do Flexor Digital Superficial ("Banana Bow")',
    scientificName: 'Ruptura e desorganização fibrilar do Tendão Flexor Digital Superficial (TFDS)',
    category: 'Locomotor / Podologia',
    urgency: 'Alta Urgência',
    mapaCompulsoryNotification: false,
    symptoms: [
      'Aumento de volume convexo no aspecto palmar da canela ("arco palmar")',
      'Calor acentuado e dor aguda à palpação digital do cordão tendíneo',
      'Claudicação evidente ao trote com encurtamento da fase de apoio',
      'Resistência à flexão passiva do membro locomotor'
    ],
    causesAndPathogenesis: 'Sobrecarga mecânica em terrenos duros ou irregulares, fadiga elástica do tendão em provas de velocidade/salto, ferrageamento inadequado com pinça longa e talão baixo.',
    clinicalSigns: 'Edema inflamatório agudo com área anecóica ("core lesion") identificada na ultrassonografia com ruptura das pontes de colágeno tipo I.',
    treatmentProtocol: 'Crioterapia intensiva (bolsas de gelo 20 minutos 3 a 4 vezes ao dia nas primeiras 72h), bandagens compressivas de suporte, anti-inflamatórios e infiltração intralesional de PRP ou células-tronco guiada por US.',
    preventiveMeasures: 'Aquecimento gradual antes de treinos, balanceamento podal rigoroso mantendo eixo podofalângico correto e caneleiras de proteção biomecânica.',
    firstAidAdvice: 'Aplicar imediatamente gelo imersivo e bandagem de suporte elástica. Não aplicar pomadas rubefacientes ou calor nas primeiras 72 horas pós-lesão.',
    references: 'Dyson, S. J. & Ross, M. W. (2011). Diagnosis and Management of Lameness in the Horse. Elsevier.'
  }
];
