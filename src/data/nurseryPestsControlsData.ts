import {
  CropPestDiseaseDetail,
  ActiveIngredientControl,
  BiologicalControlAgent,
  PhysicalMechanicalControl,
  CulturalControlMeasure,
} from '../types/nursery';

// =========================================================================================
// BANCO FITOSSANITÁRIO INTEGRADO DO VIVEIRISTA (MIP / MID)
// 4 PILARES: QUÍMICO, FÍSICO/MECÂNICO, BIOLÓGICO E CULTURAL
// =========================================================================================

export const cropPestsAndDiseasesDatabase: Record<string, CropPestDiseaseDetail[]> = {
  // ---------------------------------------------------------------------------------------
  // 1. ALFACE (Lactuca sativa)
  // ---------------------------------------------------------------------------------------
  'crop-alface': [
    {
      id: 'alf-praga-01',
      name: 'Tripes do Prateamento (Vetor de Vira-Cabeça / GNSV)',
      scientificName: 'Frankliniella schultzei / Thrips tabaci',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Cotilédones', 'Folhas jovens', 'Gema apical'],
      symptomsAndDamage: 'Prateamento foliar com pontuações escuras fecais, encarquilhamento de folhas apicais e transmissão do vírus vira-cabeça (Tospovírus / Orthotospovirus), provocando necrose apical e perda de 100% da plântula.',
      economicThresholdInNursery: 'Tolerância zero para vetor em estufa de mudas (1 exemplar na armadilha azul exige ação imediata).',
      activeIngredients: [
        {
          name: 'Espinosade (Spinosad)',
          chemicalGroup: 'Espinocinas (Grupo 5 IRAC)',
          commercialProducts: ['Tracer', 'Success'],
          recommendedDosage: '15 a 20 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          resistanceManagement: 'Alternar com neonicotinoides e diamidas; máximo de 2 aplicações por ciclo de bandeja.',
          phytotoxicityNotes: 'Alta segurança em plântulas tenras; aplicar ao entardecer para evitar fotodegradação rápida.',
          observations: 'Atua nos receptores nicotínicos da acetilcolina em sítio alostérico.',
        },
        {
          name: 'Acetamiprido',
          chemicalGroup: 'Neonicotinoide (Grupo 4A IRAC)',
          commercialProducts: ['Mospilan', 'Kaiso'],
          recommendedDosage: '20 a 25 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          resistanceManagement: 'Não repetir neonicotinoides consecutivamente.',
          phytotoxicityNotes: 'Não misturar com adubos foliares concentrados em dias quentes.',
        },
        {
          name: 'Abamectina',
          chemicalGroup: 'Avermectina (Grupo 6 IRAC)',
          commercialProducts: ['Vertimec 18 EC', 'Abamex'],
          recommendedDosage: '40 a 60 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          phytotoxicityNotes: 'Utilizar adjuvante siliconado em dose mínima (25 mL/100 L) para evitar queima de cotilédone.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Beauveria bassiana (cepa IBCB 66)',
          agentType: 'fungo_entomopatogenico',
          targetStage: 'Ninfas e adultos de tripes',
          commercialExamples: ['Boveril WP', 'Bovemax', 'BeauveControl'],
          dosage: '100 a 150 g / 100 L de calda (1x10⁸ conídios/mL)',
          modeOfUse: 'Pulverização foliar em gota média com cobertura total no entardecer.',
          applicationConditions: 'Umidade relativa > 70% e temperatura amena (< 28°C).',
        },
        {
          agentName: 'Orius insidiosus (Percevejo predador pirata)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas e adultos de tripes',
          commercialExamples: ['Orius-System', 'Koppert Thripor'],
          dosage: '1 a 2 predadores / m² de bancada',
          modeOfUse: 'Liberação preventiva em caixas coletoras nas pontas das bancadas.',
          applicationConditions: 'Estufa telada livre de inseticidas neurotóxicos de choque.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Armadilhas adesivas azuis fototrópicas',
          category: 'armadilha_monitoramento',
          specifications: 'Placas 10x25 cm azuis instaladas 15 cm acima do dossel das bandejas, densidade de 1 placa para cada 15 m² de estufa.',
          mechanism: 'A frequência de luz azul (450-470 nm) atrai ativamente os adultos de Frankliniella, retendo-os em cola de longa duração e monitorando infestações primárias.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Telas anti-insetos de monofilamento 50 mesh nas laterais e zenitais',
          category: 'barreira_fisica',
          specifications: 'Malha 50x25 mesh (orifícios < 0.25 mm) instalada em todas as aberturas de ventilação.',
          mechanism: 'Bloqueio físico mecânico que impede o vôo migratório de tripes e pequenos vetores vindos de lavouras vizinhas.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
        {
          methodName: 'Roguing mecânico com saco plástico selado',
          category: 'roguing_descarte',
          specifications: 'Eliminação individualizada de plântulas com suspeita de tospovírus nos primeiros 10 dias.',
          mechanism: 'Ensacar a muda dentro da célula antes do arranquio para evitar que os tripes voem para células vizinhas durante o descarte.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Vazio sanitário e eliminação de plantas hospedeiras no entorno',
          category: 'vazio_sanitario',
          actionGuideline: 'Erradicar caruru (Amaranthus), picão-preto (Bidens) e serralha (Sonchus) num raio de 50 metros ao redor da estufa de mudas.',
          impactOnDiseaseOrPest: 'Quebra o reservatório de vírus vira-cabeça e impede reinfestações contínuas de ninfas de tripes.',
        },
        {
          practiceName: 'Desinfecção sistemática de bancadas e piso',
          category: 'desinfeccao_bandejas',
          actionGuideline: 'Lavar bancadas com amônia quaternária 5ª geração (200 mL/100 L) ou hipoclorito 2% no intervalo entre lotes.',
          impactOnDiseaseOrPest: 'Elimina pupas que caem nos interstícios da bancada para completar a fase de solo.',
        },
      ],
      culturalPreventivePractices: [
        'Instalação de telas 50 mesh em todas as aberturas da estufa.',
        'Inspeção bidiária das armadilhas azuis.',
        'Evitar trânsito de funcionários vindos da lavoura para a área de semeadura.',
      ],
      favorableClimate: {
        tempMin: 22,
        tempMax: 30,
        humidityMin: 45,
        description: 'Clima quente e seco favorece ciclo biológico ultra rápido do tripes (7 a 11 dias de ovo a adulto).',
      },
    },
    {
      id: 'alf-doenca-01',
      name: 'Míldio da Alface',
      scientificName: 'Bremia lactucae',
      type: 'doenca',
      agentCategory: 'oomiceto',
      plantPartsAffected: ['Cotilédones', 'Folhas jovens', 'Face abaxial'],
      symptomsAndDamage: 'Manchas angulares verde-claras a amarelas limitadas pelas nervuras na face superior; eflorescência aveludada esbranquiçada de esporângios na face inferior. Causa colapso e morte de mudas em 48 a 72 horas em períodos de cerração.',
      economicThresholdInNursery: 'Prevenção mandatória em épocas frias e úmidas; qualquer lesão detectada exige isolamento imediato.',
      activeIngredients: [
        {
          name: 'Metalaxil-M + Mancozebe',
          chemicalGroup: 'Acilalanina + Ditiocarbamato (Grupo 4 + M03 FRAC)',
          commercialProducts: ['Ridomil Gold MZ', 'Armero'],
          recommendedDosage: '200 a 250 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          resistanceManagement: 'Máximo 2 aplicações por lote para não selecionar raças insensíveis a fenilamidas.',
          phytotoxicityNotes: 'Não aplicar com sol direto ou temperatura superior a 26°C.',
        },
        {
          name: 'Dimetomorfe',
          chemicalGroup: 'Amida do Ácido Cinâmico (Grupo 40 FRAC)',
          commercialProducts: ['Acrobat MZ', 'Forum'],
          recommendedDosage: '150 a 180 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          resistanceManagement: 'Alternar com fosfitos e carboxamidas.',
        },
        {
          name: 'Fosfito de Potássio (00-30-20)',
          chemicalGroup: 'Fosfonatos (Indutor de Fitoalexinas - Grupo BM01)',
          commercialProducts: ['Reforce Fosfito', 'Fosfik'],
          recommendedDosage: '150 a 200 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 0,
          phytotoxicityNotes: 'Estimula síntese de fitoalexinas e espessamento de parede sem gerar fitotoxidez.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Bacillus subtilis (linhagem QST 713)',
          agentType: 'bacteria_antagonista',
          targetStage: 'Esporângios e zoósporos de Bremia',
          commercialExamples: ['Serenade ASO', 'Rizoderma'],
          dosage: '200 a 300 mL / 100 L de calda',
          modeOfUse: 'Aplicação foliar preventiva a cada 5 a 7 dias cobrindo ambas as faces da folha.',
          applicationConditions: 'Compatível com calda de cobre em baixas doses; aplicar antes de períodos chuvosos.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Ventilação forçada e circulação de ar anti-condensação',
          category: 'sanitizacao_superficies',
          specifications: 'Ventiladores circuladores axiais horizontais acionados entre 02h00 e 08h00 da manhã.',
          mechanism: 'Movimenta a camada de ar limítrofe sobre as folhas, impedindo a formação de gotículas de água livre condensada, indispensáveis para a germinação dos esporos.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Espaçamento dinâmico de bandejas na bancada',
          category: 'barreira_fisica',
          specifications: 'Afastamento de 5 a 8 cm entre bandejas a partir do 14º dia pós-germinação.',
          mechanism: 'Melhora a penetração de luz e vento lateral, reduzindo microclima abafado no colo das mudas.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Gestão rigorosa de horário de irrigação e VPD',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Realizar irrigações até no máximo 14h30 para que a folhagem esteja completamente seca antes do anoitecer.',
          impactOnDiseaseOrPest: 'Elimina o período de molhamento foliar noturno contínuo (> 6 horas) que deflagra a infecção por Bremia.',
        },
        {
          practiceName: 'Equilíbrio nutricional de Cálcio e Silício',
          category: 'nutricao_equilibrio',
          actionGuideline: 'Fornecer cálcio via fertirrigação (Nitrato de Cálcio 80 mg/L Ca) e Silicato de Potássio foliar aos 12 dias.',
          impactOnDiseaseOrPest: 'Endurece a cutícula e a lamela média celular, dificultando a penetração dos haustórios fúngicos.',
        },
      ],
      culturalPreventivePractices: [
        'Uso de cultivares com genes de resistência (DM1 a DM38).',
        'Suspensão imediata de rega ao entardecer.',
        'Limpeza total de bandejas com hipoclorito a 2% antes do reuso.',
      ],
      favorableClimate: {
        tempMin: 10,
        tempMax: 18,
        humidityMin: 85,
        description: 'Noites frescas com formação de orvalho e neblina pela manhã proporcionam pico de esporulação.',
      },
    },
    {
      id: 'alf-doenca-02',
      name: 'Tombamento de Mudas / Damping-off',
      scientificName: 'Pythium ultimum / Rhizoctonia solani',
      type: 'doenca',
      agentCategory: 'oomiceto',
      plantPartsAffected: ['Colo da plântula', 'Raízes finas'],
      symptomsAndDamage: 'Estrangulamento aquoso translúcido na região do colo junto ao substrato; plântula tomba como se tivesse sido cortada na base, com apodrecimento radicular em reboleiras circulares.',
      economicThresholdInNursery: 'Prevenção mandatória na semeadura. Qualquer muda tombada deve ser descartada junto com a célula vizinha.',
      activeIngredients: [
        {
          name: 'Cloridrato de Propamocarbe',
          chemicalGroup: 'Carbamato (Grupo 28 FRAC)',
          commercialProducts: ['Previcur N', 'Proplant'],
          recommendedDosage: '150 a 200 mL / 100 L de água (aplicar 1 L de calda por m² de bandeja)',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 3,
          phytotoxicityNotes: 'Aplicar logo após a semeadura ou na repicagem; extremamente seguro para plântulas.',
        },
        {
          name: 'Fludioxonil + Metalaxil-M',
          chemicalGroup: 'Fenilpirrol + Acilalanina (Grupo 12 + 4 FRAC)',
          commercialProducts: ['Maxim Advanced', 'Maxim XL'],
          recommendedDosage: '10 a 15 mL / 100 L de calda no drench ou tratamento prévio de sementes',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 0,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Trichoderma harzianum (cepa ESALQ-1306 / T-22)',
          agentType: 'fungo_antagonista',
          targetStage: 'Colonização rizosférica e micoparasitismo',
          commercialExamples: ['Trichodermil SC', 'Quality WG', 'Eco-T'],
          dosage: '50 a 100 mL / 100 L de calda (aplicado no drench da 1ª rega)',
          modeOfUse: 'Aplicar na primeira rega pós-semeadura no substrato úmido.',
          applicationConditions: 'Não aplicar fungicidas cúpricos ou de amplo espectro nas 48h anteriores ou posteriores.',
        },
        {
          agentName: 'Bacillus velezensis / B. amyloliquefaciens',
          agentType: 'bacteria_antagonista',
          targetStage: 'Produção de iturinas e surfactinas antifúngicas',
          commercialExamples: ['Rizoderma BV', 'Ballad Plus'],
          dosage: '100 a 150 mL / 100 L no drench',
          modeOfUse: 'Aplicar no substrato antes de cobrir a semente.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Sanitização térmica e vaporização de bandejas plásticas',
          category: 'solarizacao_vaporizacao',
          specifications: 'Imersão das bandejas plásticas limpas em tanque com água aquecida a 75-80°C por 5 minutos, ou túnel de vapor.',
          mechanism: 'Desnatura proteínas e destrói oósporos e escleródios dormentes incrustados no plástico rígido.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Bancadas metálicas suspensas a 70 cm do solo',
          category: 'barreira_fisica',
          specifications: 'Bancadas teladas ou em perfil galvanizado com drenagem livre sem acúmulo de poças.',
          mechanism: 'Impede o contato de raízes que saem do fundo da bandeja com o chão de terra ou brita contaminada.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Uso exclusivo de substrato comercial virgem estéril',
          category: 'sanidade_sementes',
          actionGuideline: 'Não misturar terra de barranco ou composto orgânico não maturado ao substrato comercial padrão.',
          impactOnDiseaseOrPest: 'Garante ausência absoluta de inóculo primário de Pythium e nematóides no início do ciclo.',
        },
        {
          practiceName: 'Controle de drenagem e aeração do substrato',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Manter densidade do substrato entre 120 e 180 kg/m³ com boa proporção de casca de arroz carbonizada ou vermiculita.',
          impactOnDiseaseOrPest: 'Evita saturação hídrica e hipóxia radicular que atraem zoósporos flagelados de Pythium.',
        },
      ],
      culturalPreventivePractices: [
        'Desinfecção rigorosa de caixas e bandejas com amônia quaternária.',
        'Não reaproveitar substrato descartado.',
        'Irrigação com água clorada (1 a 2 ppm de cloro livre).',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 2. TOMATE (Solanum lycopersicum)
  // ---------------------------------------------------------------------------------------
  'crop-tomate': [
    {
      id: 'tom-praga-01',
      name: 'Mosca-Branca (Vetor de Begomovírus / Geminivírus e Crinivírus)',
      scientificName: 'Bemisia tabaci biótipo B / MEAM1',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Face inferior das folhas cotiledonares e definitivas', 'Ponteiro'],
      symptomsAndDamage: 'Sucção de seiva, enfraquecimento acentuado, secreção abundante de honeydew com proliferação de fumagina e inoculação viral irreversível de Begomovírus (mosaico dourado, nanismo e distorção foliar severa).',
      economicThresholdInNursery: 'Tolerância zero absoluta no viveiro de mudas.',
      activeIngredients: [
        {
          name: 'Ciantraniliprole (Cyantraniliprole)',
          chemicalGroup: 'Diamida Antranílica (Grupo 28 IRAC)',
          commercialProducts: ['Verimark', 'Benevia'],
          recommendedDosage: '30 a 40 mL / 100 L de calda em drench ou pulverização fina',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 1,
          resistanceManagement: 'Aplicar uma vez em drench no viveiro garantindo até 25 dias de efeito residual pós-transplante.',
          phytotoxicityNotes: 'Altíssima tolerância por plântulas e absorção rápida pela raiz.',
          observations: 'Paralisa a alimentação do inseto em minutos, bloqueando a transmissão de vírus.',
        },
        {
          name: 'Flupiradifurona (Flupyradifurone)',
          chemicalGroup: 'Butenolida (Grupo 4D IRAC)',
          commercialProducts: ['Sivanto Prime'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 1,
          phytotoxicityNotes: 'Não causa fitotoxicidade e possui ação rápida de choque contra adultos migrantes.',
        },
        {
          name: 'Piriproxifem (Pyriproxyfen)',
          chemicalGroup: 'Mimetizador do Hormônio Juvenil (Grupo 7C IRAC)',
          commercialProducts: ['Tiger 100 EC', 'Epingle'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          observations: 'Esteriliza fêmeas e impede eclosão de ninfas e mudas de ínstar.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Cordyceps fumosorosea (antiga Isaria fumosorosea)',
          agentType: 'fungo_entomopatogenico',
          targetStage: 'Ovos, ninfas e adultos de mosca-branca',
          commercialExamples: ['NoFly WP', 'Isaria Max', 'Lalguard Fumi'],
          dosage: '150 a 200 g / 100 L de calda',
          modeOfUse: 'Pulverização com gotas finas atingindo a face inferior das folhas.',
          applicationConditions: 'Ao entardecer com UR > 65% e temperatura inferior a 30°C.',
        },
        {
          agentName: 'Encarsia formosa / Eretmocerus mundus (Microvespas parasitoides)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas de 2º a 4º ínstar',
          commercialExamples: ['En-Strip', 'Er-Mundus', 'Koppert Enermix'],
          dosage: '2 a 4 vespinhas / m² de estufa',
          modeOfUse: 'Pendurar cartelas de pupas parasitadas nas hastes centrais da bancada.',
          applicationConditions: 'Estufa livre de inseticidas neurotóxicos fosforados ou piretroides.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Antecâmara de acesso duplo (dupla porta com pressão positiva)',
          category: 'barreira_fisica',
          specifications: 'Vestíbulo de entrada de 3x2 m com duas portas intertravadas que nunca abrem simultaneamente, com ventilador soprando ar para fora.',
          mechanism: 'Barreira aerodinâmica e física que impede que adultos de mosca-branca entrem com as rajadas de vento na abertura da porta.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
        {
          methodName: 'Telas antiafídicas de alta densidade 50 mesh nas janelas e lanternim',
          category: 'barreira_fisica',
          specifications: 'Tela de polietileno monofilamento com abertura máxima de 0.26 mm.',
          mechanism: 'Impede a entrada física de insetos sugadores alados.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Armadilhas adesivas amarelas para monitoramento constante',
          category: 'armadilha_monitoramento',
          specifications: 'Placas amarelas de 20x30 cm a cada 20 m², posicionadas logo acima das plântulas.',
          mechanism: 'A cor amarela (580 nm) tem atração cromática máxima sobre adultos de Bemisia tabaci, permitindo detecção imediata do 1º exemplar.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Quarentena e inspeção visual prévia de lotes enxertados',
          category: 'vazio_sanitario',
          actionGuideline: 'Manter lotes recém-enxertados ou garfos em estufa de pegamento estritamente fechada por 7 dias com monitoramento com lupa 20x.',
          impactOnDiseaseOrPest: 'Evita a introdução silenciosa de posturas ou ninfas em mudas de alto valor comercial.',
        },
        {
          practiceName: 'Vazio de cultivo e corte de plantas voluntárias de tomate no entorno',
          category: 'vazio_sanitario',
          actionGuideline: 'Erradicar joá-de-capote (Nicandra) e maria-pretinha (Solanum americanum) no raio de 100 m da estufa.',
          impactOnDiseaseOrPest: 'Interrompe a ponte verde viral de Begomovírus e Crinivírus (ToCV).',
        },
      ],
      culturalPreventivePractices: [
        'Uso de vestimenta branca ou cinza (nunca roupas amarelas na estufa).',
        'Monitoramento diário das placas amarelas antes das 09h.',
        'Descarte imediato de plântulas com qualquer sintoma de mosaico ou clorose internerval.',
      ],
      favorableClimate: {
        tempMin: 25,
        tempMax: 35,
        humidityMin: 40,
        description: 'Temperaturas elevadas e tempo seco aceleram a oviposição (mais de 200 ovos por fêmea) e encurtam o ciclo para menos de 18 dias.',
      },
    },
    {
      id: 'tom-doenca-01',
      name: 'Requeima do Tomateiro (Mela / Requeima Precoce)',
      scientificName: 'Phytophthora infestans',
      type: 'doenca',
      agentCategory: 'oomiceto',
      plantPartsAffected: ['Caule', 'Cotilédones', 'Folhas jovens', 'Ponteiro'],
      symptomsAndDamage: 'Manchas grandes verde-escuras oleosas que rapidamente tornam-se necróticas e pardas; nas bordas das lesões na face inferior surge um halo esbranquiçado de esporângios. Destrói o lote de mudas em menos de 48 horas em estufa.',
      economicThresholdInNursery: 'Tolerância zero absoluta; doença destrutiva explosiva.',
      activeIngredients: [
        {
          name: 'Ciazofamida',
          chemicalGroup: 'Cianoimidazol (Grupo 21 FRAC)',
          commercialProducts: ['Ranman'],
          recommendedDosage: '30 a 40 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          resistanceManagement: 'Excelente protetor específico contra zoósporos; alternar com mandipropamida.',
          phytotoxicityNotes: 'Perfeita seletividade para plântulas tenras.',
        },
        {
          name: 'Mandipropamida',
          chemicalGroup: 'Amida do Ácido Mandélico (Grupo 40 FRAC)',
          commercialProducts: ['Revus'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          phytotoxicityNotes: 'Fixa rapidamente na cera cuticular foliar em 15 minutos.',
        },
        {
          name: 'Fosetil-Alumínio',
          chemicalGroup: 'Fosfonato sistêmico (Grupo 33 FRAC)',
          commercialProducts: ['Aliette'],
          recommendedDosage: '200 a 250 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          observations: 'Translocação sistêmica acrópeta e basípeta protegendo brotos em expansão.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Bacillus subtilis (linhagem QST 713)',
          agentType: 'bacteria_antagonista',
          targetStage: 'Inibição de germinação de zoósporos de Phytophthora',
          commercialExamples: ['Serenade ASO', 'Ballad Plus'],
          dosage: '250 a 300 mL / 100 L de calda',
          modeOfUse: 'Pulverização preventiva a cada 5 dias em períodos chuvosos.',
          applicationConditions: 'Aplicar preventivamente antes da chuva e queda de temperatura.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Aquecimento ambiental de emergência / Ventilação cruzada forçada',
          category: 'sanitizacao_superficies',
          specifications: 'Acionamento de aquecedores ou exaustores para elevar a temperatura acima de 22°C e baixar UR abaixo de 80%.',
          mechanism: 'Inibe a diferenciação de esporângios em zoósporos móveis que dependem de película d\'água livre a 12-18°C.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Filme plástico difusor com aditivo anti-gotejamento (Anti-Drip)',
          category: 'barreira_fisica',
          specifications: 'Cobertura com filme de 150 micras aditivado para condensação laminar.',
          mechanism: 'Evita a formação de gotas que despencam do teto sobre as bandejas de mudas, eliminando focos primários de infecção.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Irrigação com água tratada e sem aspersão vespertina',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Irrigar exclusivamente pela manhã via microaspersão fina ou sub-irrigação, secando até o meio-dia.',
          impactOnDiseaseOrPest: 'Cessa as 4 a 6 horas ininterruptas de molhamento foliar necessárias para infecção de P. infestans.',
        },
        {
          practiceName: 'Nutrição com reforço de Silício e Cálcio',
          category: 'nutricao_equilibrio',
          actionGuideline: 'Pulverizar silicato de potássio (100 mL/100 L) aos 15 dias de germinação.',
          impactOnDiseaseOrPest: 'Deposição de sílica polimerizada sob a cutícula bloqueia o tubo germinativo do patógeno.',
        },
      ],
      culturalPreventivePractices: [
        'Descarte imediato de qualquer bandeja com sintoma de queima.',
        'Desinfecção de carrinhos de transporte com amônia quaternária.',
        'Não permitir a entrada de mudas sem certificado de sanidade.',
      ],
      favorableClimate: {
        tempMin: 12,
        tempMax: 20,
        humidityMin: 90,
        description: 'Clima frio e muito úmido com neblina constante favorece a produção massiva de zoósporos flagelados nadadores.',
      },
    },
    {
      id: 'tom-doenca-02',
      name: 'Cancro Bacteriano do Tomateiro',
      scientificName: 'Clavibacter michiganensis subsp. michiganensis',
      type: 'doenca',
      agentCategory: 'bacteria',
      plantPartsAffected: ['Vasos vasculares', 'Bordas de folíolos', 'Cotilédones'],
      symptomsAndDamage: 'Amarelecimento unilateral e murcha de folíolos ("queima de bordo"), escurecimento do feixe vascular no colo e surgimento de cancro com exsudato em estádio mais avançado. Transmissível via semente e pelas mãos de enxertadores.',
      economicThresholdInNursery: 'Tolerância zero absoluta. Lote contaminado deve ser incinerado.',
      activeIngredients: [
        {
          name: 'Oxicloreto de Cobre',
          chemicalGroup: 'Inorgânico cúprico (Grupo M01 FRAC)',
          commercialProducts: ['Cobox', 'Difere'],
          recommendedDosage: '80 a 120 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 0,
          phytotoxicityNotes: 'Usar dose estritamente baixa em plântulas tenras para evitar fitotoxidez.',
        },
        {
          name: 'Sulfato de Cobre Pentahidratado',
          chemicalGroup: 'Cúprico quelatizado suave',
          commercialProducts: ['Mastercop'],
          recommendedDosage: '40 a 60 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 0,
          phytotoxicityNotes: 'Excelente solubilidade sem queima de folhas jovens.',
        },
        {
          name: 'Kasugamicina',
          chemicalGroup: 'Hexopiranosil antibiótico (Grupo 24 FRAC)',
          commercialProducts: ['Kasumin'],
          recommendedDosage: '150 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          resistanceManagement: 'Usar no máximo 2 vezes por ciclo apenas em emergência.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Bacillus velezensis / Bacillus amyloliquefaciens',
          agentType: 'bacteria_antagonista',
          targetStage: 'Colonização competitiva da filosfera e rizosfera',
          commercialExamples: ['Serenade', 'Rizoderma'],
          dosage: '150 a 200 mL / 100 L de calda',
          modeOfUse: 'Aplicação foliar preventiva a cada 7 dias.',
          applicationConditions: 'Pode ser associado a fertilizantes foliares aminoácidos.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Termoterapia úmida de sementes (Água quente termostatizada)',
          category: 'termoterapia',
          specifications: 'Imersão das sementes de tomate em água a exatamente 50°C durante 25 minutos, seguido de resfriamento imediato em água gelada corrente.',
          mechanism: 'A temperatura de 50°C inativa a bactéria incrustada no tegumento e no interior da semente sem reduzir o poder germinativo.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
        {
          methodName: 'Esterilização por calor ou álcool 70% das lâminas de enxertia',
          category: 'sanitizacao_superficies',
          specifications: 'Desinfecção das lâminas de bisturi a cada bandeja de mudas enxertadas.',
          mechanism: 'Impede a transmissão cruzada da bactéria no corte dos feixes condutores do hipocótilo.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Aquisição exclusiva de sementes testadas e certificadas livres de Cmm',
          category: 'sanidade_sementes',
          actionGuideline: 'Exigir laudo fitossanitário com PCR negativo para Clavibacter michiganensis no lote de sementes importadas ou nacionais.',
          impactOnDiseaseOrPest: 'Corta a principal via de entrada da doença na empresa viveirista.',
        },
        {
          practiceName: 'Desinfecção de mãos com álcool em gel e luvas descartáveis',
          category: 'higiene_pessoal',
          actionGuideline: 'Obrigatoriedade de luvas de látex e higienização com álcool a cada troca de bancada pelos enxertadores.',
          impactOnDiseaseOrPest: 'Interrompe a contaminação mecânica durante a manipulação das mudas.',
        },
      ],
      culturalPreventivePractices: [
        'Uso exclusivo de sementes termotratadas ou testadas por PCR.',
        'Incineração ou enterro profundo com cal de bandejas suspeitas.',
        'Isolamento estrito da câmara de cicatrização pós-enxertia.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 3. PIMENTÃO (Capsicum annuum)
  // ---------------------------------------------------------------------------------------
  'crop-pimentao': [
    {
      id: 'pim-praga-01',
      name: 'Ácaro-Branco do Pimentão (Ácaro-da-Russa)',
      scientificName: 'Polyphagotarsonemus latus',
      type: 'praga',
      agentCategory: 'acaro',
      plantPartsAffected: ['Brotos novos', 'Ponteiro', 'Folhas apicais tenras'],
      symptomsAndDamage: 'As folhas apicais nascem retorcidas, estreitadas, com bordas viradas para baixo e face inferior com aspecto vítreo bronzeado brilhante; paralisa o crescimento do ponteiro da muda.',
      economicThresholdInNursery: 'Qualquer enrugamento apical com visualização sob estereomicroscópio.',
      activeIngredients: [
        {
          name: 'Abamectina',
          chemicalGroup: 'Avermectinas (Grupo 6 IRAC)',
          commercialProducts: ['Vertimec 18 EC', 'Abamex'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          phytotoxicityNotes: 'Aplicar no entardecer com bicos cônicos de alta pressão (gotas muito finas no broto).',
        },
        {
          name: 'Espiromesifeno (Spiromesifen)',
          chemicalGroup: 'Ácido Tetrônico (Grupo 23 IRAC)',
          commercialProducts: ['Oberon'],
          recommendedDosage: '50 a 60 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          observations: 'Excelente ação sobre ovos e ninfas com longo período de proteção.',
        },
        {
          name: 'Clorfenapir',
          chemicalGroup: 'Pirrol (Grupo 13 IRAC)',
          commercialProducts: ['Pirate'],
          recommendedDosage: '50 a 70 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          resistanceManagement: 'Alternar com avermectinas; máximo de 1 aplicação por ciclo de muda.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Neoseiulus californicus (Ácaro predador fitoseídeo)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas e adultos de ácaro-branco',
          commercialExamples: ['Spical-Plus', 'Californicus-System'],
          dosage: '1 sachê liberador por cada 4 a 6 bandejas na bancada',
          modeOfUse: 'Pendurar sachês com saída lenta nas extremidades das bancadas.',
          applicationConditions: 'Tolera altas temperaturas e umidades moderadas da estufa.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Barreira física de tela antiafídeo 50 mesh',
          category: 'barreira_fisica',
          specifications: 'O ácaro-branco utiliza moscas-brancas para forésia (transporte aéreo pegando carona nas pernas da mosca). A tela impede a entrada do vetor.',
          mechanism: 'Bloqueio mecânico de moscas-brancas impede a entrada forética do ácaro-branco na estufa.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Podas de limpeza / Descarte focal das pontas deformadas',
          category: 'roguing_descarte',
          specifications: 'Remoção com tesoura desinfetada de qualquer ponteiro com sintomas iniciais.',
          mechanism: 'Elimina as colônias concentradas nos tecidos meristemáticos em expansão.',
          efficiencyRating: 'moderada',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Manejo de umidade e nebulização (Fogging)',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Acionar fogging em pulsos curtos para manter UR em 70-75% durante as horas mais quentes do dia.',
          impactOnDiseaseOrPest: 'Desfavorece o surto explosivo do ácaro-branco que prefere estufas quentes e secas.',
        },
        {
          practiceName: 'Nutrição com equilíbrio de nitrogênio',
          category: 'nutricao_equilibrio',
          actionGuideline: 'Evitar excesso de adubos nitrogenados na fase de 4 folhas definitivas.',
          impactOnDiseaseOrPest: 'Tecidos túrgidos e ricos em aminoácidos livres estimulam a fecundidade das fêmeas do ácaro.',
        },
      ],
      culturalPreventivePractices: [
        'Manter bancadas limpas e sem ervas daninhas hospedeiras.',
        'Inspeção periódica com lupa de bolso 30x nos brotos apicais.',
      ],
    },
    {
      id: 'pim-doenca-01',
      name: 'Murcha de Fitóftora do Pimentão',
      scientificName: 'Phytophthora capsici',
      type: 'doenca',
      agentCategory: 'oomiceto',
      plantPartsAffected: ['Colo', 'Raízes', 'Caule'],
      symptomsAndDamage: 'Lesão anelar escura de coloração verde-oliva a negra no colo da plântula; a muda murcha subitamente permanecendo verde (sem amarelecer previamente) e morre.',
      economicThresholdInNursery: 'Tolerância zero. Doença de solo destrutiva.',
      activeIngredients: [
        {
          name: 'Metalaxil-M + Mancozebe',
          chemicalGroup: 'Acilalanina + Ditiocarbamato (Grupo 4 + M03 FRAC)',
          commercialProducts: ['Ridomil Gold MZ'],
          recommendedDosage: '200 g / 100 L de calda em drench',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 7,
        },
        {
          name: 'Ciazofamida',
          chemicalGroup: 'Cianoimidazol (Grupo 21 FRAC)',
          commercialProducts: ['Ranman'],
          recommendedDosage: '30 a 40 mL / 100 L de calda no drench',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 3,
        },
        {
          name: 'Cloridrato de Propamocarbe',
          chemicalGroup: 'Carbamato (Grupo 28 FRAC)',
          commercialProducts: ['Previcur N'],
          recommendedDosage: '150 a 200 mL / 100 L de calda no drench',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Trichoderma asperellum / Trichoderma harzianum',
          agentType: 'fungo_antagonista',
          targetStage: 'Colonização radicular preventiva',
          commercialExamples: ['Quality WG', 'Trichodermil'],
          dosage: '50 a 80 mL / 100 L de calda no drench pós-semeadura',
          modeOfUse: 'Aplicar na 1ª rega de encharcamento da bandeja.',
          applicationConditions: 'Substrato aerado com pH entre 5.8 e 6.5.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Sanitização das bandejas com hipoclorito a 2% e enxágue pressurizado',
          category: 'sanitizacao_superficies',
          specifications: 'Imersão das bandejas por 15 minutos em tanque desinfetante.',
          mechanism: 'Inativa oósporos de parede espessa que sobrevivem nos cantos das células plásticas.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Substrato bem drenado e bandejas com furos de drenagem desobstruídos',
          category: 'barreira_fisica',
          specifications: 'Verificação periódica dos orifícios basais de todas as bandejas.',
          mechanism: 'Impede o empoçamento e a natação dos zoósporos de P. capsici.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Irrigação controlada sem encharcamento',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Irrigar somente quando o peso da bandeja diminuir cerca de 40%, evitando substrato permanentemente saturado.',
          impactOnDiseaseOrPest: 'Corta a atração quimiotrópica dos zoósporos de Phytophthora em direção aos exsudatos radiculares.',
        },
      ],
      culturalPreventivePractices: [
        'Uso de porta-enxertos resistentes quando solicitado pelo produtor.',
        'Bancadas elevadas a 70 cm do solo.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 4. CAFEEIRO (Coffea arabica / Coffea canephora)
  // ---------------------------------------------------------------------------------------
  'crop-cafe': [
    {
      id: 'caf-praga-01',
      name: 'Bicho-Mineiro do Cafeeiro',
      scientificName: 'Leucoptera coffeella',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Primeiro e segundo par de folhas definitivas'],
      symptomsAndDamage: 'Minas circulares ou ovais de cor marrom na face superior das folhas ("folhas com queimaduras secas"); dentro da mina encontra-se a lagarta e fezes. Causa desfolha intensa e paralisação do crescimento da muda no tubete.',
      economicThresholdInNursery: 'Qualquer folha com mina viva.',
      activeIngredients: [
        {
          name: 'Clorantraniliprole',
          chemicalGroup: 'Diamida Antranílica (Grupo 28 IRAC)',
          commercialProducts: ['Premio', 'Altacor'],
          recommendedDosage: '15 a 20 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          resistanceManagement: 'Alternar com espinosinas e cartape.',
        },
        {
          name: 'Cartape (Cloridrato de Cartape)',
          chemicalGroup: 'Análogo da Nereistoxina (Grupo 14 IRAC)',
          commercialProducts: ['Cartap BR 500', 'Cartap Max'],
          recommendedDosage: '100 a 120 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          phytotoxicityNotes: 'Ação rápida de choque paralisando a alimentação da larva na mina.',
        },
        {
          name: 'Flupiradifurona',
          chemicalGroup: 'Butenolida (Grupo 4D IRAC)',
          commercialProducts: ['Sivanto Prime'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Bacillus thuringiensis var. kurstaki',
          agentType: 'bacteria_antagonista',
          targetStage: 'Lagartas minadoras no início da penetração',
          commercialExamples: ['Dipel WP', 'XenTari'],
          dosage: '100 g / 100 L de calda',
          modeOfUse: 'Pulverização preventiva a cada 7 dias.',
          applicationConditions: 'Aplicar antes das 09h ou após as 16h.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Telas de sombreamento e proteção lateral 50 mesh',
          category: 'barreira_fisica',
          specifications: 'Fechamento lateral completo do viveiro de tubetes.',
          mechanism: 'Impede o voo das mariposas adultas de Leucoptera oriundas de cafezais adultos da região.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Catação manual de folhas minadas (Roguing foliar)',
          category: 'roguing_descarte',
          specifications: 'Remoção e esmagamento manual das folhas com minas ativas.',
          mechanism: 'Mata as lagartas e crisálidas antes que empupem e se multipliquem.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Irrigação por aspersão nas horas mais quentes do dia',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Acionar aspersão rápida de 3 minutos às 13h.',
          impactOnDiseaseOrPest: 'Molha as asas das mariposas e atrapalha a oviposição do bicho-mineiro que prefere tempo seco e ensolarado.',
        },
      ],
      culturalPreventivePractices: [
        'Eliminação de cafeeiros abandonados na vizinhança.',
        'Tubetes suspensos em bancadas metálicas a 90 cm.',
      ],
    },
    {
      id: 'caf-doenca-01',
      name: 'Cercosporiose do Cafeeiro (Mancha de Olho-Pardo)',
      scientificName: 'Cercospora coffeicola',
      type: 'doenca',
      agentCategory: 'fungo',
      plantPartsAffected: ['Folhas cotiledonares e definitivas'],
      symptomsAndDamage: 'Manchas circulares marrons com centro cinza-claro cercado por halo amarelo característico ("olho-pardo"); provoca desfolha precoce drástica das mudas e atraso de meses na expedição.',
      economicThresholdInNursery: 'Mais de 3% de folhas afetadas exige intervenção imediata.',
      activeIngredients: [
        {
          name: 'Piraclostrobina + Boscalida',
          chemicalGroup: 'Estrobilurina + Carboxamida (Grupo 11 + 7 FRAC)',
          commercialProducts: ['Bellis'],
          recommendedDosage: '50 a 60 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          resistanceManagement: 'Máximo de 2 pulverizações por ciclo de tubete.',
        },
        {
          name: 'Azoxistrobina + Ciproconazol',
          chemicalGroup: 'Estrobilurina + Triazol (Grupo 11 + 3 FRAC)',
          commercialProducts: ['Priori Xtra'],
          recommendedDosage: '30 a 40 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 14,
        },
        {
          name: 'Oxicloreto de Cobre',
          chemicalGroup: 'Inorgânico cúprico (Grupo M01 FRAC)',
          commercialProducts: ['Cobox'],
          recommendedDosage: '150 a 200 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 0,
          phytotoxicityNotes: 'Ação protetora de contato; forma película que inibe germinação de conídios.',
        },
      ],
      biologicalControls: [
        {
          agentName: 'Bacillus subtilis (linhagem QST 713)',
          agentType: 'bacteria_antagonista',
          targetStage: 'Inibição de conídios de Cercospora',
          commercialExamples: ['Serenade ASO'],
          dosage: '200 mL / 100 L de calda',
          modeOfUse: 'Pulverizações quinzenais preventivas.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Controle de radiação solar com tela termorrefletora aluminizada (Aluminet)',
          category: 'barreira_fisica',
          specifications: 'Sombreamento de 50% nas primeiras 4 semanas após emissão das folhas cotiledonares ("orelha-de-onça").',
          mechanism: 'A toxina cercosporina produzida pelo fungo é ativada pela luz solar direta excessiva; o sombreamento atenua a severidade das lesões.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Adubação equilibrada com Nitrogênio e Potássio',
          category: 'nutricao_equilibrio',
          actionGuideline: 'Evitar desbalanço nutricional; a deficiência de N ou desequilíbrio N:K é o principal gatilho fisiológico da cercosporiose.',
          impactOnDiseaseOrPest: 'Plantas bem nutridas apresentam resistência natural contra o desenvolvimento de lesões de Cercospora.',
        },
      ],
      culturalPreventivePractices: [
        'Rustificação gradual das mudas retirando a tela somente nos últimos 30 dias.',
        'Descarte de mudas raquíticas.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 5. EUCALIPTO (Eucalyptus grandis / E. urophylla)
  // ---------------------------------------------------------------------------------------
  'crop-eucalipto': [
    {
      id: 'euc-doenca-01',
      name: 'Mofo-Cinzento em Miniestacas de Eucalipto',
      scientificName: 'Botrytis cinerea',
      type: 'doenca',
      agentCategory: 'fungo',
      plantPartsAffected: ['Folhas do ápice da estaca', 'Bases de enraizamento'],
      symptomsAndDamage: 'Lesões pardas aquosas cobertas por densa felpa cinza de conidióforos em ambiente de casa de vegetação (alta umidade e temperatura); causa apodrecimento das estacas antes do enraizamento com perdas de até 80% do lote.',
      economicThresholdInNursery: 'Primeiros focos visíveis na câmara de nebulização.',
      activeIngredients: [
        {
          name: 'Fluopiram + Trifloxistrobina',
          chemicalGroup: 'Carboxamida + Estrobilurina (Grupo 7 + 11 FRAC)',
          commercialProducts: ['Luna Sensation'],
          recommendedDosage: '50 a 60 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
          resistanceManagement: 'Alternar com fenhexamida e pirimetanil.',
        },
        {
          name: 'Fenhexamida',
          chemicalGroup: 'Hidroxianilida (Grupo 17 FRAC)',
          commercialProducts: ['Teldor'],
          recommendedDosage: '100 a 120 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 1,
        },
        {
          name: 'Pirimetanil',
          chemicalGroup: 'Anilinopirimidina (Grupo 9 FRAC)',
          commercialProducts: ['Mythos'],
          recommendedDosage: '100 a 150 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Trichoderma harzianum (cepa ESALQ-1306)',
          agentType: 'fungo_antagonista',
          targetStage: 'Competição por espaço e nutrientes na estaca',
          commercialExamples: ['Trichodermil SC'],
          dosage: '100 mL / 100 L no banho das miniestacas antes do estaqueamento',
          modeOfUse: 'Imersão rápida das bases das estacas.',
        },
        {
          agentName: 'Clonostachys rosea',
          agentType: 'fungo_antagonista',
          targetStage: 'Micoparasita específico de Botrytis cinerea',
          commercialExamples: ['EndoFight', 'Bio-Clono'],
          dosage: '50 g / 100 L pulverizado na casa de vegetação',
          modeOfUse: 'Pulverização semanal nas bancadas de enraizamento.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Controle eletrônico computadorizado de pulsos de nebulização (Fogging por VPD)',
          category: 'sanitizacao_superficies',
          specifications: 'Acionar fogging somente quando o VPD ultrapassar 0.4 kPa, evitando saturação líquida permanente sobre a folha da miniestaca.',
          mechanism: 'Mantém a turgidez da folha sem criar película contínua de água livre que favorece o tubo germinativo do Botrytis.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Roguing manual contínuo de estacas mortas com pinça esterilizada',
          category: 'roguing_descarte',
          specifications: 'Ronda matinal diária retirando tubetes com estacas infectadas.',
          mechanism: 'Elimina as fontes de inóculo esporulante ativo.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Sanitização rigorosa das tesouras de poda do minijardim clonal',
          category: 'desinfeccao_bandejas',
          actionGuideline: 'Mergulhar tesouras em solução de álcool 70% ou hipoclorito 1% a cada minicepa podada.',
          impactOnDiseaseOrPest: 'Impede a disseminação sistêmica de Botrytis e bactérias das minicepas para as estacas filhas.',
        },
      ],
      culturalPreventivePractices: [
        'Desinfecção de bandejas de tubetes com vapor d\'água a 80°C.',
        'Substrato estéril à base de turfa e casca de arroz carbonizada.',
      ],
    },
    {
      id: 'euc-praga-01',
      name: 'Psilídeo-de-Concha do Eucalipto',
      scientificName: 'Glycaspis brimblecombei',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Folhas jovens e brotos de tubetes'],
      symptomsAndDamage: 'Ninfas constroem pequenas conchas brancas cerosas cônicas (lerps) sob as quais se abrigam sugando seiva; causam desfolha apical e seca das pontas das mudas.',
      economicThresholdInNursery: 'Primeiras conchas brancas detectadas nas mudas.',
      activeIngredients: [
        {
          name: 'Tiametoxam',
          chemicalGroup: 'Neonicotinoide (Grupo 4A IRAC)',
          commercialProducts: ['Actara 250 WG'],
          recommendedDosage: '20 a 30 g / 100 L de calda no drench',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 7,
        },
        {
          name: 'Espirotetramate',
          chemicalGroup: 'Ácido Tetrâmico sistêmico bidirecional (Grupo 23 IRAC)',
          commercialProducts: ['Movento'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Psyllaephagus bliteus (Vespinha parasitoide específica)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas dentro das conchas',
          commercialExamples: ['Bio-Psyllaephagus'],
          dosage: 'Liberação de 5 a 10 casais / 100 m² de viveiro florestal',
          modeOfUse: 'Liberação em gaiolas ou direto no pátio de aclimatação.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Armadilhas adesivas amarelas nos corredores do viveiro',
          category: 'armadilha_monitoramento',
          specifications: '1 armadilha a cada 25 metros lineares de bancada florestal.',
          mechanism: 'Monitora e captura adultos alados migrantes de talhões florestais.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Irrigação sob pressão para lavagem mecânica das conchas',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Irrigar com gotas médias para desalojar as conchas cerosas das ninfas jovens.',
          impactOnDiseaseOrPest: 'Expõe as ninfas desprotegidas ao dessecamento pelo sol e ataque de predadores.',
        },
      ],
      culturalPreventivePractices: [
        'Vistoria semanal nos lotes de aclimatação ao sol.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 6. CITROS (Citrus sinensis / Poncirus trifoliata)
  // ---------------------------------------------------------------------------------------
  'crop-citros': [
    {
      id: 'cit-praga-01',
      name: 'Psilídeo-dos-Citros (Vetor do HLB / Greening)',
      scientificName: 'Diaphorina citri',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Brotos novos e folíolos tenros em tubetões'],
      symptomsAndDamage: 'Posturas em brotações novas; ninfas com secreções filamentosas cerosas brancas e transmissão da bactéria Candidatus Liberibacter asiaticus (HLB/Greening), condenando 100% do lote sob legislação de defesa vegetal.',
      economicThresholdInNursery: 'Tolerância zero absoluta. Viveiro com tela antiafídeo obrigatória por lei.',
      activeIngredients: [
        {
          name: 'Imidacloprido / Tiametoxam',
          chemicalGroup: 'Neonicotinoide (Grupo 4A IRAC)',
          commercialProducts: ['Confidor', 'Actara'],
          recommendedDosage: '50 a 70 g / 100 L no drench do tubetão',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 14,
          resistanceManagement: 'Obrigatório drench pré-expedição para garantir muda protegida no campo por 60 dias.',
        },
        {
          name: 'Ciflumetofeno + Acetamiprido',
          chemicalGroup: 'Neonicotinoide misto',
          commercialProducts: ['Mospilan'],
          recommendedDosage: '30 g / 100 L de calda foliar',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Tamarixia radiata (Ectoparasitoide específico de ninfas)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas de 4º e 5º ínstar de Diaphorina',
          commercialExamples: ['Tamarixia-Citros'],
          dosage: '4 a 6 vespinhas / m²',
          modeOfUse: 'Liberações de manutenção no entorno do telado.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Estufa telada com dupla porta e tela anti-inseto 50 mesh à prova de psilídeo',
          category: 'barreira_fisica',
          specifications: 'Estrutura fechada hermeticamente em conformidade com as normas do MAPA/CDA para produção de mudas cítricas certificadas.',
          mechanism: 'Impede o contato físico de qualquer inseto vetor com os porta-enxertos e borbulhas.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Certificação genética e sanitária de borbulhas borbulheiras',
          category: 'sanidade_sementes',
          actionGuideline: 'Utilizar borbulhas indexadas e testadas por PCR para HLB, CVC e Tristeza.',
          impactOnDiseaseOrPest: 'Garante material propagativo livre de patógenos vasculares.',
        },
      ],
      culturalPreventivePractices: [
        'Uso de pedilúvio com amônia na entrada.',
        'Inspeção com lupa em cada brotação antes da enxertia.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 7. ORQUÍDEAS (Phalaenopsis / Cattleya / Dendrobium)
  // ---------------------------------------------------------------------------------------
  'crop-orquideas': [
    {
      id: 'orq-praga-01',
      name: 'Cochonilha-de-Carapaça e Cochonilha-Farinhenta',
      scientificName: 'Diaspis boisduvalii / Pseudococcus calceolariae',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Pseudobulbos', 'Folhas basais', 'Raízes aéreas'],
      symptomsAndDamage: 'Crosta de escamas esbranquiçadas ou massas cotonosas; sucção de seiva, amarelecimento foliar e desenvolvimento de fumagina preta sobre as folhas.',
      economicThresholdInNursery: 'Primeiros focos visíveis em plantas de aclimatização in vitro.',
      activeIngredients: [
        {
          name: 'Espirotetramate (Spirotetramat)',
          chemicalGroup: 'Ácido Tetrâmico sistêmico bidirecional (Grupo 23 IRAC)',
          commercialProducts: ['Movento'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 7,
          phytotoxicityNotes: 'Não queima flores nem brotos tenros; atinge pragas escondidas no coleto das raízes.',
        },
        {
          name: 'Acetamiprido',
          chemicalGroup: 'Neonicotinoide (Grupo 4A IRAC)',
          commercialProducts: ['Mospilan'],
          recommendedDosage: '25 g / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Cryptolaemus montrouzieri (Joaninha predadora australiana)',
          agentType: 'parasitoide_predador',
          targetStage: 'Ninfas e adultos de cochonilhas',
          commercialExamples: ['Cryptobug'],
          dosage: '2 a 3 joaninhas / m² de bancada',
          modeOfUse: 'Liberação direta nas bancadas de aclimatização.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Limpeza mecânica manual com escova macia e sabão de coco neutro a 1%',
          category: 'roguing_descarte',
          specifications: 'Pincelamento cuidadoso nos pseudobulbos de mudas jovens.',
          mechanism: 'Remove fisicamente a carapaça hidrofóbica e as massas de ovos sem lesar os tecidos vegetais.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Isolamento em quarentena de mudas recém-saídas de frascos in vitro',
          category: 'vazio_sanitario',
          actionGuideline: 'Manter mudas aclimatizadas em sala isolada por 21 dias antes de integrar ao pavilhão geral.',
          impactOnDiseaseOrPest: 'Impede contaminações cruzadas silenciosas.',
        },
      ],
      culturalPreventivePractices: [
        'Esterilização por chama das ferramentas de divisão de mudas.',
      ],
    },
  ],

  // ---------------------------------------------------------------------------------------
  // 8. MORANGUEIRO (Fragaria x ananassa)
  // ---------------------------------------------------------------------------------------
  'crop-morango': [
    {
      id: 'mor-praga-01',
      name: 'Ácaro-Rajado do Morango',
      scientificName: 'Tetranychus urticae',
      type: 'praga',
      agentCategory: 'acaro',
      plantPartsAffected: ['Face inferior dos folíolos de estolões'],
      symptomsAndDamage: 'Pontuações amareladas finas na face superior, teias sedosas densas na face inferior, bronzeamento foliar completo e secamento precoce de brotos enraizados.',
      economicThresholdInNursery: 'Mais de 1 ácaro por folha amostrada em tubetes de plugue.',
      activeIngredients: [
        {
          name: 'Ciflumetofeno (Cyflumetofen)',
          chemicalGroup: 'Benzoilacetonitrila (Grupo 25A IRAC)',
          commercialProducts: ['Nealta'],
          recommendedDosage: '100 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 1,
          phytotoxicityNotes: 'Altamente seletivo para ácaros fitoseídeos benéficos.',
        },
        {
          name: 'Acequinocila',
          chemicalGroup: 'Derivado de Naftoquinona (Grupo 20B IRAC)',
          commercialProducts: ['Kanemite'],
          recommendedDosage: '150 a 200 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Neoseiulus californicus / Phytoseiulus persimilis',
          agentType: 'parasitoide_predador',
          targetStage: 'Ovos, larvas, ninfas e adultos de ácaro-rajado',
          commercialExamples: ['Spical', 'Spidex Vital'],
          dosage: '10 a 20 ácaros predadores / m²',
          modeOfUse: 'Polvilhamento das garrafas com vermiculita sobre as bandejas.',
          applicationConditions: 'Phytoseiulus exige umidade > 70%; Californicus resiste ao calor e ar seco.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Nebulização periódica para elevação de umidade relativa',
          category: 'sanitizacao_superficies',
          specifications: 'Microaspersão fina em pulsos de 1 minuto acionada nos horários mais secos (11h às 15h).',
          mechanism: 'A alta umidade (> 75%) retarda a taxa reprodutiva de Tetranychus urticae e impede a formação de teias protetoras densas.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Remoção e queima de folhas basais senescentes de estolões',
          category: 'roguing_descarte',
          actionGuideline: 'Desbrotar folhas velhas antes de estaquear os plugues.',
          impactOnDiseaseOrPest: 'Elimina os principais abrigos das fêmeas invernantes.',
        },
      ],
      culturalPreventivePractices: [
        'Utilizar exclusivamente mudas matrizes micropropagadas in-vitro livres de vírus e ácaros.',
      ],
    },
  ],
};

// =========================================================================================
// GERADOR DINÂMICO E COMPLETO PARA GARANTIR 100% DE COBERTURA NAS 34 CULTURAS DO CATÁLOGO
// =========================================================================================

export function getDetailedPestsDiseasesForCrop(cropId: string): CropPestDiseaseDetail[] {
  // Se já temos a cultura cadastrada manualmente em detalhe máximo, retornamos ela
  if (cropPestsAndDiseasesDatabase[cropId] && cropPestsAndDiseasesDatabase[cropId].length > 0) {
    return cropPestsAndDiseasesDatabase[cropId];
  }

  // Se for outra cultura do catálogo (ex: Cenoura, Pepino, Rosa, Alecrim, etc.), geramos o dossiê fitossanitário agronômico
  // baseado no padrão MIP 4 Pilares da categoria agronômica correspondente
  return generateStandardPhytoDossierForCrop(cropId);
}

function generateStandardPhytoDossierForCrop(cropId: string): CropPestDiseaseDetail[] {
  // Configuração por categoria e tipo
  const isCucurbita = cropId.includes('pepino') || cropId.includes('melao') || cropId.includes('melancia');
  const isBrassica = cropId.includes('repolho') || cropId.includes('brocolis') || cropId.includes('couve');
  const isFlorestal = cropId.includes('pinus') || cropId.includes('mogno') || cropId.includes('erva-mate');
  const isFrutifera = cropId.includes('mamao') || cropId.includes('maracuja') || cropId.includes('banana') || cropId.includes('videira') || cropId.includes('goiaba');
  const isFlor = cropId.includes('rosa') || cropId.includes('crisantemo') || cropId.includes('petunia') || cropId.includes('begonia') || cropId.includes('tagetes');
  const isAromatica = cropId.includes('alecrim') || cropId.includes('manjericao') || cropId.includes('hortela') || cropId.includes('lavanda');

  if (isCucurbita) {
    return [
      {
        id: `${cropId}-praga-01`,
        name: 'Broca-das-Cucurbitáceas / Mosca-Branca',
        scientificName: 'Diaphania nitidalis / Bemisia tabaci',
        type: 'praga',
        agentCategory: 'inseto',
        plantPartsAffected: ['Cotilédones', 'Gema apical', 'Folhas verdadeiras'],
        symptomsAndDamage: 'Raspagem de tecidos e broqueamento precoce do colo e ponteiro da plântula; sucção de seiva e transmissão de vírus do mosaico (PRSV-W / ZYMV).',
        economicThresholdInNursery: 'Presença detectada em placas adesivas amarelas.',
        activeIngredients: [
          {
            name: 'Clorantraniliprole',
            chemicalGroup: 'Diamida Antranílica (Grupo 28 IRAC)',
            commercialProducts: ['Altacor', 'Premio'],
            recommendedDosage: '15 a 20 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 1,
          },
          {
            name: 'Acetamiprido',
            chemicalGroup: 'Neonicotinoide (Grupo 4A IRAC)',
            commercialProducts: ['Mospilan'],
            recommendedDosage: '25 g / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 3,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Bacillus thuringiensis var. kurstaki',
            agentType: 'bacteria_antagonista',
            targetStage: 'Lagartas pequenas de Diaphania',
            commercialExamples: ['Agree WG', 'Dipel'],
            dosage: '100 g / 100 L de calda',
            modeOfUse: 'Pulverizar ao entardecer cobrindo o colo da muda.',
          },
          {
            agentName: 'Beauveria bassiana',
            agentType: 'fungo_entomopatogenico',
            targetStage: 'Ninfas e adultos de mosca-branca',
            commercialExamples: ['Boveril'],
            dosage: '150 g / 100 L',
            modeOfUse: 'Pulverização foliar em alta umidade.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Telas anti-insetos 50 mesh nas laterais e lanternim',
            category: 'barreira_fisica',
            specifications: 'Malha 50x25 para barrar entrada de microlepidópteros e moscas-brancas.',
            mechanism: 'Bloqueio mecânico nas aberturas da estufa.',
            efficiencyRating: 'preventiva_obrigatoria',
          },
          {
            methodName: 'Armadilhas adesivas amarelas',
            category: 'armadilha_monitoramento',
            specifications: '1 placa amarela a cada 20 m² de bancada.',
            mechanism: 'Atração por comprimento de onda amarelo (580 nm).',
            efficiencyRating: 'alta',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Eliminação de cucurbitáceas voluntárias no raio de 50 m',
            category: 'vazio_sanitario',
            actionGuideline: 'Arrancar bucha, cabaça e melancia brava nas proximidades.',
            impactOnDiseaseOrPest: 'Quebra o hospedeiro de Diaphania e vírus.',
          },
        ],
        culturalPreventivePractices: [
          'Monitoramento bidiário das brotações apicais.',
          'Uso de substrato comercial estéril.',
        ],
      },
      {
        id: `${cropId}-doenca-01`,
        name: 'Oídio e Míldio das Cucurbitáceas',
        scientificName: 'Podosphaera xanthii / Pseudoperonospora cubensis',
        type: 'doenca',
        agentCategory: 'fungo',
        plantPartsAffected: ['Folhas cotiledonares e definitivas'],
        symptomsAndDamage: 'Manchas pulverulentas esbranquiçadas (oídio) na face superior ou manchas angulares amareladas oleosas (míldio) que provocam necrose precoce e queima das folhas.',
        economicThresholdInNursery: 'Prevenção mandatória ou primeiros sintomas.',
        activeIngredients: [
          {
            name: 'Mandipropamida',
            chemicalGroup: 'Amida do Ácido Mandélico (Grupo 40 FRAC)',
            commercialProducts: ['Revus'],
            recommendedDosage: '40 a 50 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 3,
          },
          {
            name: 'Difenoconazol',
            chemicalGroup: 'Triazol (Grupo 3 FRAC)',
            commercialProducts: ['Score'],
            recommendedDosage: '30 a 40 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 3,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Bacillus subtilis QST 713',
            agentType: 'bacteria_antagonista',
            targetStage: 'Filosfera preventiva',
            commercialExamples: ['Serenade ASO'],
            dosage: '250 mL / 100 L de calda',
            modeOfUse: 'Aplicação foliar preventiva a cada 7 dias.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Ventilação cruzada para evitar ar estagnado',
            category: 'sanitizacao_superficies',
            specifications: 'Abertura total de cortinas laterais durante o dia e uso de ventiladores.',
            mechanism: 'Reduz umidade estagnada no dossel.',
            efficiencyRating: 'alta',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Irrigação matinal sem molhamento das folhas ao entardecer',
            category: 'gestao_irrigacao_vpd',
            actionGuideline: 'Irrigar no máximo até as 11h.',
            impactOnDiseaseOrPest: 'Seca a folhagem antes do período noturno.',
          },
        ],
        culturalPreventivePractices: [
          'Espaçamento adequado de bandejas para aeração.',
        ],
      },
    ];
  }

  if (isBrassica) {
    return [
      {
        id: `${cropId}-praga-01`,
        name: 'Traça-das-Crucíferas',
        scientificName: 'Plutella xylostella',
        type: 'praga',
        agentCategory: 'inseto',
        plantPartsAffected: ['Folhas jovens e cotilédones'],
        symptomsAndDamage: 'Pequenas lagartas verdes raspando a epiderme inferior das folhas, criando orifícios transparentes que rasgam e destroem a área fotossintética da muda.',
        economicThresholdInNursery: 'Primeiras perfurações visíveis.',
        activeIngredients: [
          {
            name: 'Clorantraniliprole',
            chemicalGroup: 'Diamida Antranílica (Grupo 28 IRAC)',
            commercialProducts: ['Premio'],
            recommendedDosage: '15 a 20 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 3,
          },
          {
            name: 'Espinosade',
            chemicalGroup: 'Espinocina (Grupo 5 IRAC)',
            commercialProducts: ['Tracer'],
            recommendedDosage: '20 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 3,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Bacillus thuringiensis var. aizawai / kurstaki',
            agentType: 'bacteria_antagonista',
            targetStage: 'Lagartas de 1º a 3º ínstar',
            commercialExamples: ['Agree WG', 'XenTari'],
            dosage: '100 g / 100 L de calda',
            modeOfUse: 'Pulverizar semanalmente ao entardecer.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Telas anti-insetos 50 mesh',
            category: 'barreira_fisica',
            specifications: 'Vedação total da estufa de folhosas.',
            mechanism: 'Impede o pouso de microlepidópteros fêmeas.',
            efficiencyRating: 'preventiva_obrigatoria',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Rotação rigorosa de modos de ação químicos e bioinsumos',
            category: 'vazio_sanitario',
            actionGuideline: 'Não repetir o mesmo grupo químico em lotes consecutivos.',
            impactOnDiseaseOrPest: 'Evita a seleção de populações super-resistentes de Plutella.',
          },
        ],
        culturalPreventivePractices: [
          'Vistoria diária das folhas com foco na face abaxial.',
        ],
      },
      {
        id: `${cropId}-doenca-01`,
        name: 'Podridão-Negra das Brássicas',
        scientificName: 'Xanthomonas campestris pv. campestris',
        type: 'doenca',
        agentCategory: 'bacteria',
        plantPartsAffected: ['Margens das folhas cotiledonares e definitivas'],
        symptomsAndDamage: 'Lesões cloróticas em forma de "V" a partir da margem da folha com escurecimento vascular negro das nervuras e perda das plântulas.',
        economicThresholdInNursery: 'Tolerância zero em sementes e mudas.',
        activeIngredients: [
          {
            name: 'Oxicloreto de Cobre',
            chemicalGroup: 'Inorgânico cúprico (Grupo M01 FRAC)',
            commercialProducts: ['Cobox', 'Difere'],
            recommendedDosage: '80 a 120 g / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 0,
          },
          {
            name: 'Kasugamicina',
            chemicalGroup: 'Hexopiranosil (Grupo 24 FRAC)',
            commercialProducts: ['Kasumin'],
            recommendedDosage: '150 mL / 100 L de calda',
            applicationMethod: 'pulverizacao_foliar',
            gracePeriodDays: 7,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Bacillus velezensis / B. subtilis',
            agentType: 'bacteria_antagonista',
            targetStage: 'Inibição bacteriana competitiva',
            commercialExamples: ['Serenade', 'Rizoderma'],
            dosage: '150 mL / 100 L de calda',
            modeOfUse: 'Pulverizações semanais.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Termoterapia úmida de sementes a 50°C por 20 minutos',
            category: 'termoterapia',
            specifications: 'Banho-maria termostatizado com resfriamento rápido.',
            mechanism: 'Erradica bactérias aderidas às sementes sem matar o embrião.',
            efficiencyRating: 'preventiva_obrigatoria',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Irrigação sem respingos violentos entre bandejas',
            category: 'gestao_irrigacao_vpd',
            actionGuideline: 'Utilizar bicos com gotas ultradifundidas.',
            impactOnDiseaseOrPest: 'Impede que a bactéria respingue de uma célula doente para as vizinhas sadias.',
          },
        ],
        culturalPreventivePractices: [
          'Uso exclusivo de sementes certificadas.',
        ],
      },
    ];
  }

  if (isFlorestal) {
    return [
      {
        id: `${cropId}-doenca-01`,
        name: 'Tombamento e Podridão de Colo em Tubetes Florestais',
        scientificName: 'Fusarium oxysporum / Cylindrocladium candelabrum / Pythium spp.',
        type: 'doenca',
        agentCategory: 'fungo',
        plantPartsAffected: ['Colo', 'Raiz pivotante', 'Substrato'],
        symptomsAndDamage: 'Lesão estrangulante escura no colo do tubete, murcha de ponteiros e apodrecimento radicular com perda em reboleira de tubetes.',
        economicThresholdInNursery: 'Prevenção mandatória no enchimento de tubetes.',
        activeIngredients: [
          {
            name: 'Fludioxonil + Metalaxil-M',
            chemicalGroup: 'Fenilpirrol + Acilalanina (Grupo 12 + 4 FRAC)',
            commercialProducts: ['Maxim XL'],
            recommendedDosage: '10 a 15 mL / 100 L de calda em drench',
            applicationMethod: 'drench_substrato',
            gracePeriodDays: 0,
          },
          {
            name: 'Tiofanato-Metílico',
            chemicalGroup: 'Benzimidazol (Grupo 1 FRAC)',
            commercialProducts: ['Cercobin 700 WP'],
            recommendedDosage: '100 g / 100 L de calda',
            applicationMethod: 'drench_substrato',
            gracePeriodDays: 7,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Trichoderma asperellum / T. harzianum',
            agentType: 'fungo_antagonista',
            targetStage: 'Micoparasitismo e indução de resistência',
            commercialExamples: ['Quality WG', 'Trichodermil'],
            dosage: '100 mL / 100 L de água na primeira rega',
            modeOfUse: 'Drench sobre os tubetes após a semeadura.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Sanitização térmica dos tubetes plásticos rígidos a 80°C',
            category: 'solarizacao_vaporizacao',
            specifications: 'Lavagem mecânica com lavadora de alta pressão e banho a 80°C por 3 minutos.',
            mechanism: 'Elimina clamidósporos e microscleródios incrustados no plástico.',
            efficiencyRating: 'alta',
          },
          {
            methodName: 'Bancadas metálicas suspensas com poda aérea de raízes',
            category: 'barreira_fisica',
            specifications: 'Mudas suspensas a 90 cm do solo permitindo ar livre sob os tubetes.',
            mechanism: 'O ar seco queima a ponta da raiz que sai do tubete, promovendo ramificação e impedindo contaminação pelo piso.',
            efficiencyRating: 'preventiva_obrigatoria',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Substrato certificado com aeração e sem terra virgem',
            category: 'sanidade_sementes',
            actionGuideline: 'Casca de pinus compostada e vermiculita estéril.',
            impactOnDiseaseOrPest: 'Ambiente aerado sem patógenos radiculares.',
          },
        ],
        culturalPreventivePractices: [
          'Descarte térmico de mudas sintomáticas em sacos fechados.',
        ],
      },
      {
        id: `${cropId}-praga-01`,
        name: 'Formigas-Cortadeiras / Fungus Gnats no Substrato',
        scientificName: 'Atta sexdens / Bradysia spp.',
        type: 'praga',
        agentCategory: 'inseto',
        plantPartsAffected: ['Folíolos tenros / Raízes finas'],
        symptomsAndDamage: 'Corte noturno de folhas por formigas ou larvas translúcidas de fungus gnats destruindo os pelos absorventes no interior do tubete.',
        economicThresholdInNursery: 'Qualquer sinal de corte ou larvas no substrato.',
        activeIngredients: [
          {
            name: 'Fipronil / Tiametoxam',
            chemicalGroup: 'Pirazol / Neonicotinoide',
            commercialProducts: ['Regent', 'Actara'],
            recommendedDosage: 'Iscas atrativas no entorno / 20 g / 100 L drench',
            applicationMethod: 'drench_substrato',
            gracePeriodDays: 14,
          },
        ],
        biologicalControls: [
          {
            agentName: 'Stratiolaelaps scimitus (Ácaro predador Hypoaspis miles)',
            agentType: 'parasitoide_predador',
            targetStage: 'Larvas de Fungus Gnats no substrato',
            commercialExamples: ['Hypo-System'],
            dosage: '100 a 250 predadores / m² de bancada',
            modeOfUse: 'Polvilhamento sobre a superfície dos tubetes.',
          },
        ],
        physicalControls: [
          {
            methodName: 'Barreira adesiva com graxa nas pernas das bancadas',
            category: 'barreira_fisica',
            specifications: 'Anel de graxa mineral impermeável em cada pé metálico da bancada.',
            mechanism: 'Impede a subida mecânica de formigas cortadeiras durante a noite.',
            efficiencyRating: 'alta',
          },
        ],
        culturalControls: [
          {
            practiceName: 'Controle de algas e musgos na superfície do tubete',
            category: 'gestao_irrigacao_vpd',
            actionGuideline: 'Reduzir frequência de regas e melhorar ventilação.',
            impactOnDiseaseOrPest: 'Algas são o principal alimento atrativo para postura de Fungus Gnats.',
          },
        ],
        culturalPreventivePractices: [
          'Ronda noturna com lanterna.',
        ],
      },
    ];
  }

  // Padrão Geral Especializado (Frutíferas, Flores, Aromáticas e outras hortaliças)
  return [
    {
      id: `${cropId}-praga-geral`,
      name: `Tripes, Pulgões e Ácaros de Viveiro em ${cropId.replace('crop-', '')}`,
      scientificName: 'Aphis gossypii / Frankliniella spp. / Tetranychus spp.',
      type: 'praga',
      agentCategory: 'inseto',
      plantPartsAffected: ['Brotos apicais', 'Face inferior das folhas', 'Caule tenro'],
      symptomsAndDamage: 'Sucção de seiva, encarquilhamento foliar, prateamento e secreção de melada com atração de formigas e fumagina.',
      economicThresholdInNursery: 'Primeiras colônias avistadas na bancada.',
      activeIngredients: [
        {
          name: 'Acetamiprido / Flupiradifurona',
          chemicalGroup: 'Neonicotinoide / Butenolida (Grupos 4A / 4D IRAC)',
          commercialProducts: ['Mospilan', 'Sivanto'],
          recommendedDosage: '20 a 30 g ou mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
        {
          name: 'Abamectina',
          chemicalGroup: 'Avermectina (Grupo 6 IRAC)',
          commercialProducts: ['Vertimec 18 EC'],
          recommendedDosage: '40 a 50 mL / 100 L de calda',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 3,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Beauveria bassiana (IBCB 66)',
          agentType: 'fungo_entomopatogenico',
          targetStage: 'Ninfas e adultos sugadores',
          commercialExamples: ['Boveril WP'],
          dosage: '100 a 150 g / 100 L de calda',
          modeOfUse: 'Pulverização foliar ao entardecer.',
        },
        {
          agentName: 'Chrysoperla externa (Crisopídeo / Bicho-lixeiro predador)',
          agentType: 'parasitoide_predador',
          targetStage: 'Pulgões e ninfas de ácaros',
          commercialExamples: ['Chrysoperla Bio'],
          dosage: '2 a 5 larvas predadoras / m²',
          modeOfUse: 'Liberação direta nas bancadas.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Armadilhas adesivas amarelas e azuis combinadas',
          category: 'armadilha_monitoramento',
          specifications: '1 placa amarela e 1 azul intercaladas a cada 15 m² de bancada.',
          mechanism: 'Monitora pulgões/moscas (amarela) e tripes (azul).',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Telas anti-insetos 50 mesh nas laterais da estufa',
          category: 'barreira_fisica',
          specifications: 'Fechamento integral de aberturas de ventilação.',
          mechanism: 'Bloqueia insetos migratórios.',
          efficiencyRating: 'preventiva_obrigatoria',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Inspeção e limpeza com sabão neutro vegetal',
          category: 'desinfeccao_bandejas',
          actionGuideline: 'Lavar bancadas com amônia quaternária 200 mL/100 L.',
          impactOnDiseaseOrPest: 'Quebra abrigos e ninfas dormentes.',
        },
      ],
      culturalPreventivePractices: [
        'Eliminação de hospedeiras e restos de poda no entorno.',
      ],
    },
    {
      id: `${cropId}-doenca-geral`,
      name: `Tombamento e Manchas Foliares Fúngicas em ${cropId.replace('crop-', '')}`,
      scientificName: 'Pythium spp. / Rhizoctonia solani / Cercospora spp.',
      type: 'doenca',
      agentCategory: 'fungo',
      plantPartsAffected: ['Colo da muda', 'Raízes', 'Folhas jovens'],
      symptomsAndDamage: 'Estrangulamento aquoso do colo, amarelecimento foliar e necrose de raízes em formação.',
      economicThresholdInNursery: 'Prevenção mandatória na germinação.',
      activeIngredients: [
        {
          name: 'Metalaxil-M + Mancozebe / Cloridrato de Propamocarbe',
          chemicalGroup: 'Acilalanina + Ditiocarbamato / Carbamato (FRAC 4 + M03 / 28)',
          commercialProducts: ['Ridomil Gold MZ', 'Previcur N'],
          recommendedDosage: '150 a 200 g ou mL / 100 L no drench',
          applicationMethod: 'drench_substrato',
          gracePeriodDays: 3,
        },
        {
          name: 'Oxicloreto de Cobre',
          chemicalGroup: 'Inorgânico cúprico (Grupo M01 FRAC)',
          commercialProducts: ['Cobox'],
          recommendedDosage: '100 a 150 g / 100 L foliar',
          applicationMethod: 'pulverizacao_foliar',
          gracePeriodDays: 0,
        },
      ],
      biologicalControls: [
        {
          agentName: 'Trichoderma harzianum / Bacillus subtilis',
          agentType: 'fungo_antagonista',
          targetStage: 'Colonização rizosférica e antibiose',
          commercialExamples: ['Trichodermil', 'Serenade ASO'],
          dosage: '100 mL / 100 L no drench',
          modeOfUse: 'Aplicar na 1ª rega pós-semeadura.',
        },
      ],
      physicalControls: [
        {
          methodName: 'Sanitização térmica de bandejas com água quente a 75-80°C',
          category: 'solarizacao_vaporizacao',
          specifications: 'Imersão de bandejas limpas por 5 minutos.',
          mechanism: 'Destrói oósporos e escleródios dormentes no plástico.',
          efficiencyRating: 'alta',
        },
        {
          methodName: 'Ventilação para manter VPD acima de 0.8 kPa',
          category: 'sanitizacao_superficies',
          specifications: 'Circulação contínua evitando condensação foliar.',
          mechanism: 'Impede a germinação de esporos na lâmina d\'água.',
          efficiencyRating: 'alta',
        },
      ],
      culturalControls: [
        {
          practiceName: 'Irrigação matinal sem umedecimento noturno da folhagem',
          category: 'gestao_irrigacao_vpd',
          actionGuideline: 'Encerrar regas até as 14h.',
          impactOnDiseaseOrPest: 'Dormitório de plantas com folhas 100% secas.',
        },
      ],
      culturalPreventivePractices: [
        'Uso exclusivo de substrato comercial esterilizado.',
      ],
    },
  ];
}
