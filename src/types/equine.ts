export type EquineSpecies = 'Equino' | 'Asinino' | 'Muar';

export type EquineBreed =
  | 'Mangalarga Marchador'
  | 'Quarto de Milha'
  | 'Crioulo'
  | 'Puro Sangue Inglês (PSI)'
  | 'Puro Sangue Árabe'
  | 'Brasileiro de Hipismo (BH)'
  | 'Campolina'
  | 'Paint Horse'
  | 'Appaloosa'
  | 'Lusitano'
  | 'Andaluz'
  | 'Pampa'
  | 'Mangalarga Paulista'
  | 'Bredão / Cruzado'
  | 'Outra';

export type EquineCoatColor =
  | 'Alazã'
  | 'Castanha'
  | 'Tordilha'
  | 'Baia'
  | 'Preta'
  | 'Rosilha'
  | 'Pampa'
  | 'Palomino'
  | 'Lobuna'
  | 'Gateada'
  | 'Zaina'
  | 'Alazã Tostada'
  | 'Ruã'
  | 'Outra';

export type EquineSex = 'Garanhão' | 'Égua' | 'Castrado';

export type EquineCategory =
  | 'Garanhão'
  | 'Matriz'
  | 'Doadora de Embrião'
  | 'Receptora de Embrião'
  | 'Potro ao Pé'
  | 'Potro Desmamado'
  | 'Potro em Recria'
  | 'Treinamento / Esporte'
  | 'Trabalho / Lida'
  | 'Aposentado / Lazer';

export type EquineStatus =
  | 'Ativo no Haras'
  | 'Em Treinamento Externo'
  | 'Em Competição'
  | 'Em Tratamento / Hospital'
  | 'Vendido'
  | 'Baixa / Óbito'
  | 'Em Trânsito';

export type EquineDiscipline =
  | 'Mangalarga Marchador / Concurso de Marcha'
  | 'Três Tambores'
  | 'Seis Balizas'
  | 'Hipismo Clássico / Salto'
  | 'Corrida / Turfe'
  | 'Enduro Equestre'
  | 'Prova de Laço / Roping'
  | 'Vaquejada'
  | 'Polo Equestre'
  | 'Adestramento / Dressage'
  | 'Concurso Completo de Equitação (CCE)'
  | 'Rédeas / Western'
  | 'Lida de Campo / Pecuária'
  | 'Cavalgada / Lazer';

export interface EquinePedigreeNode {
  name: string;
  registrationNumber?: string;
  breed?: string;
  coatColor?: string;
  titles?: string;
}

export interface EquinePedigree {
  sire?: EquinePedigreeNode; // Pai
  dam?: EquinePedigreeNode;  // Mãe
  paternalGrandsire?: EquinePedigreeNode; // Avô Paterno
  paternalGranddam?: EquinePedigreeNode;  // Avó Paterna
  maternalGrandsire?: EquinePedigreeNode; // Avô Materno
  maternalGranddam?: EquinePedigreeNode;  // Avó Materna
  paternalGreatGrandsire1?: EquinePedigreeNode; // Bisavô Paterno 1
  paternalGreatGranddam1?: EquinePedigreeNode;  // Bisavó Paterna 1
  paternalGreatGrandsire2?: EquinePedigreeNode; // Bisavô Paterno 2
  paternalGreatGranddam2?: EquinePedigreeNode;  // Bisavó Paterna 2
  maternalGreatGrandsire1?: EquinePedigreeNode; // Bisavô Materno 1
  maternalGreatGranddam1?: EquinePedigreeNode;  // Bisavó Materna 1
  maternalGreatGrandsire2?: EquinePedigreeNode; // Bisavô Materno 2
  maternalGreatGranddam2?: EquinePedigreeNode;  // Bisavó Materna 2
}

export interface EquineAnimal {
  id: string;
  name: string;
  nickname?: string;
  registrationNumber: string; // Registro na Associação
  microchip: string;
  rfid?: string;
  qrCode: string;
  species: EquineSpecies;
  breed: EquineBreed;
  coatColor: EquineCoatColor;
  sex: EquineSex;
  birthDate: string;
  category: EquineCategory;
  status: EquineStatus;
  weightKg: number;
  heightM: number; // Altura na cernelha (ex: 1.54)
  chestCircumferenceCm: number; // Perímetro torácico (ex: 182)
  shinCircumferenceCm?: number; // Perímetro da canela (ex: 19.5)
  bodyLengthCm?: number; // Comprimento corporal (ex: 156)
  bodyScore: number; // 1 a 9 (Escala Henneke)
  breeder: string; // Criador
  owner: string; // Proprietário atual
  photoUrl: string;
  passportNumber: string;
  association: string; // Ex: ABCCMM, ABQM, ABCCC, CBH
  pedigree: EquinePedigree;
  inbreedingCoefficient?: number; // Consanguinidade %
  facilityId?: string; // Baia ou piquete
  discipline: EquineDiscipline;
  isPregnant?: boolean;
  expectedFoalingDate?: string;
  dailyFeedIntakeKg?: number;
  marketValueBrl?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquineBiometricsRecord {
  id: string;
  animalId: string;
  date: string;
  weightKg: number;
  heightM: number;
  bodyScore: number; // 1-9
  chestCircumferenceCm: number;
  shinCircumferenceCm?: number;
  bodyLengthCm?: number;
  estimatedWeightKg?: number; // Calculado via fórmula barimétrica
  measuredBy: string;
  notes?: string;
}

export type EquineReproductionType =
  | 'Monta Natural'
  | 'Inseminação Artificial (IA) Sêmen Fresco'
  | 'Inseminação Artificial (IA) Sêmen Refrigerado'
  | 'Inseminação Artificial (IA) Sêmen Congelado'
  | 'Transferência de Embrião (TE)'
  | 'Coleta de Sêmen'
  | 'Congelamento de Sêmen';

export interface EquineReproductionRecord {
  id: string;
  femaleId: string;
  maleId: string;
  type: EquineReproductionType;
  date: string;
  donorId?: string; // Caso seja TE (Doadora)
  recipientId?: string; // Caso seja TE (Receptora)
  semenBatch?: string;
  semenConcentrationMillionMl?: number;
  semenMotilityPct?: number;
  semenVigor?: number; // 1 a 5
  strawsCollected?: number; // Palhetas
  strawsAvailable?: number;
  pregnancyDiagnoses?: {
    id: string;
    date: string;
    daysPostBreeding: number; // 14, 28, 45, 60
    result: 'Positivo' | 'Negativo' | 'Inconclusivo' | 'Vesícula Embrionária' | 'Embrião com Batimento';
    veterinarian: string;
    notes?: string;
  }[];
  expectedFoalingDate?: string; // Gestação média equina ~335 a 345 dias
  actualFoalingDate?: string;
  foalId?: string;
  foalSex?: 'Macho' | 'Fêmea';
  foalCoat?: EquineCoatColor;
  foalStatus?: 'Vivo e Saudável' | 'Natimorto' | 'Óbito Pós-Parto';
  outcome: 'Aguardando DG' | 'Gestante Confirmada' | 'Vazia' | 'Parto Concluído' | 'Aborto' | 'Embrião Não Fixado';
  weaningDate?: string;
  costBrl?: number;
  veterinarian: string;
  notes?: string;
}

export type EquineHealthType =
  | 'Vacinação'
  | 'Vermifugação'
  | 'Exame Laboratorial'
  | 'Exame de Imagem'
  | 'Tratamento Clínico'
  | 'Internação'
  | 'Procedimento Cirúrgico'
  | 'Tratamento de Lesão'
  | 'Alergia / Reação Adversa'
  | 'Curativo / Fisioterapia';

export interface EquineHealthRecord {
  id: string;
  animalId: string;
  date: string;
  type: EquineHealthType;
  title: string;
  productOrDrug: string;
  activeIngredient?: string;
  dose: string;
  route: 'Intramuscular (IM)' | 'Intravenosa (IV)' | 'Subcutânea (SC)' | 'Oral' | 'Tópico / Dérmico' | 'Intra-articular' | 'Inalação';
  batchNumber?: string;
  veterinarian: string;
  nextDueDate?: string;
  withdrawalPeriodDays?: number; // Período de carência
  costBrl?: number;
  status: 'Concluído' | 'Agendado' | 'Em Tratamento';
  photos?: string[];
  notes?: string;
}

export interface EquineDentalRecord {
  id: string;
  animalId: string;
  date: string;
  veterinarian: string;
  wearGrade: 'Normal / Fisiológico' | 'Pontas de Esmalte Leves' | 'Pontas de Esmalte Severas' | 'Onda / Degrau' | 'Boca em Tesoura' | 'Gancho Rostral/Caudal';
  proceduresPerformed: string[]; // ex: ['Flutuação / Nivelamento Elétrico', 'Extração de Dente de Lobo (105/205)', 'Correção de Ganchos', 'Tratamento Periodontal']
  malocclusionsFound?: string;
  incisorAngle?: string;
  sedationUsed?: string;
  costBrl?: number;
  nextReviewDate: string; // Geralmente a cada 6 ou 12 meses
  notes?: string;
}

export type HorseshoeType =
  | 'Ferradura de Alumínio (Esporte/Corrida)'
  | 'Ferradura de Aço Convencional'
  | 'Ferradura Polo / Fina'
  | 'Ferradura Corretiva Heart-bar (Barra Coração)'
  | 'Ferradura Banana / Rocked Toe'
  | 'Ferradura Rolada (Roller Shoe)'
  | 'Ferradura com Tala e Rampa'
  | 'Casqueamento Descalço (Barefoot)'
  | 'Ferradura de Poliuretano / Borracha'
  | 'Palmilha de Absorção de Impacto';

export interface EquineFarrieryRecord {
  id: string;
  animalId: string;
  date: string;
  farrierName: string;
  horseshoeType: HorseshoeType;
  material: 'Aço' | 'Alumínio' | 'Poliuretano' | 'Sem Ferradura (Apenas Casqueamento)';
  frontHoofAngleDegrees?: number; // Ângulo normal ~48° a 55°
  hindHoofAngleDegrees?: number;  // Ângulo normal ~52° a 58°
  correctionsMade: string; // Ex: "Correção de desvio látero-medial em mão esquerda, recuo de pinça"
  padsUsed?: string;
  nailType?: string;
  nextShoeingDate: string; // Ciclo padrão: 30 a 45 dias
  costBrl: number;
  hoofCondition: 'Excelente' | 'Bom' | 'Quebradiço' | 'Broca / Pododermatite' | 'Sensível / Laminite Prévia';
  photos?: string[];
  notes?: string;
}

export interface EquineVitals {
  heartRateRestBpm: number; // Normal: 28 - 44 bpm
  heartRatePeakBpm?: number; // Pico no treino: até 180-220 bpm
  heartRateRec5MinBpm?: number; // Recuperação 5 min: ideal < 64 bpm
  heartRateRec10MinBpm?: number; // Recuperação 10 min: ideal < 50 bpm
  respRateMovMin: number; // Normal: 8 - 16 mov/min
  rectalTempC: number; // Normal: 37.2°C - 38.3°C
  mucousMembranes: 'Rosada e Brilhante (Normal)' | 'Pálida (Anemia/Choque)' | 'Hiperêmica / Congesta (Febre/Endotoxemia)' | 'Ictérica (Fígado/Hemólise)' | 'Cianótica (Hipóxia Severa)';
  capillaryRefillTimeSec: number; // TPC normal: 1 a 2 segundos
  hydrationScore: 'Hidratado (<2s prega)' | 'Desidratação Leve (2-3s)' | 'Desidratação Moderada (3-5s)' | 'Desidratação Grave (>5s)';
  intestinalMotility: 'Normal nos 4 quadrantes (+/+)' | 'Hipomotilidade (+/-)' | 'Atonia / Silêncio Abdominal (-/-)' | 'Hipermotilidade (++ / Cólica espasmódica)';
}

export interface EquineTrainingRecord {
  id: string;
  animalId: string;
  date: string;
  discipline: EquineDiscipline;
  riderName: string;
  trainerName?: string;
  durationMinutes: number;
  distanceKm?: number;
  avgSpeedKmh?: number;
  maxSpeedKmh?: number;
  trackType: 'Pista de Areia' | 'Pista de Grama' | 'Redondel' | 'Pista Coberta' | 'Trilha / Campo' | 'Esteira Aquática';
  effortLevel: 'Leve / Aquecimento' | 'Moderado' | 'Intenso' | 'Simulação de Prova / Máximo';
  vitals: EquineVitals;
  recoveryEvaluation: 'Excelente (<10 min)' | 'Boa (10-15 min)' | 'Lenta (15-30 min)' | 'Fadiga / Alerta';
  exercisesDone: string;
  behaviorRating: 'Concentrado e Dócil' | 'Energético / Responsivo' | 'Resistente / Tenso' | 'Cansado';
  notes?: string;
}

export interface EquineCompetitionRecord {
  id: string;
  animalId: string;
  eventName: string;
  city: string;
  state: string;
  date: string;
  discipline: EquineDiscipline;
  category: string;
  riderOrHandler: string;
  resultTime?: string; // Ex: "17.120s"
  scoreOrFaults?: string; // Ex: "0 faltas / 74.5 pontos"
  placement:
    | '1º Lugar / Campeão'
    | '2º Lugar / Reservado Campeão'
    | '3º Lugar'
    | '4º Lugar'
    | '5º Lugar'
    | 'Finalista / Top 10'
    | 'Classificado'
    | 'Desclassificado / Eliminado';
  prizeMoneyBrl: number;
  trophyOrRibbon?: string;
  pointsAcquired?: number;
  photos?: string[];
  videoUrl?: string;
  observations?: string;
}

export interface EquineNutritionFeed {
  id: string;
  name: string;
  category: 'Pastagem' | 'Feno' | 'Silagem' | 'Ração Concentrada' | 'Suplemento / Mineral' | 'Aditivo / Óleo';
  dryMatterPct: number; // % MS
  crudeProteinPct: number; // % PB
  digestibleEnergyMcalKg: number; // ED Mcal/kg MS
  neutralDetergentFiberPct: number; // % FDN
  calciumPct: number; // % Ca
  phosphorusPct: number; // % P
  costPerKgBrl: number;
}

export interface EquineNutritionPlan {
  id: string;
  animalId: string;
  targetCategory: EquineCategory;
  animalWeightKg: number;
  workIntensity: 'Manutenção' | 'Trabalho Leve' | 'Trabalho Moderado' | 'Trabalho Pesado / Prova' | 'Gestação Terço Final' | 'Lactação Inicial' | 'Crescimento / Potro';
  dailyRoughageKg: number;
  roughageFeedName: string;
  dailyConcentrateKg: number;
  concentrateFeedName: string;
  supplementsDaily: string;
  mineralSaltGrams: number;
  waterIntakeLitersEstimate: number;
  // Calculados
  totalDryMatterKg: number; // Geralmente 2.0% a 2.5% do peso vivo
  dryMatterPctBodyWeight: number;
  totalCrudeProteinGrams: number;
  totalDigestibleEnergyMcal: number;
  totalCalciumGrams: number;
  totalPhosphorusGrams: number;
  caPRatio: number; // Ideal entre 1.5:1 e 2.0:1
  // Requisitos NRC Equinos
  nrcCrudeProteinGrams: number;
  nrcDigestibleEnergyMcal: number;
  nrcCalciumGrams: number;
  nrcPhosphorusGrams: number;
  balanceEvaluation: 'Dieta Equilibrada' | 'Déficit Energético' | 'Déficit Proteico' | 'Excesso de Concentrado (Risco de Cólica/Laminite)' | 'Desbalanço Ca:P';
  notes?: string;
}

export type EquineFacilityType =
  | 'Baia Individual'
  | 'Piquete com Pastagem'
  | 'Pista de Treinamento'
  | 'Redondel'
  | 'Maternidade'
  | 'Centro de Reprodução'
  | 'Farmácia Veterinária'
  | 'Depósito de Ração e Feno'
  | 'Duchador / Lavador'
  | 'Ferradoria';

export interface EquineFacility {
  id: string;
  name: string;
  type: EquineFacilityType;
  dimensionsMeters?: string; // Ex: "4x4m" ou "2.5 hectares"
  capacityAnimals: number;
  currentOccupancy: number;
  currentAnimalIds: string[];
  pastureType?: string; // Ex: "Tifton 85", "Coastcross"
  waterSource?: 'Bebedouro Automático' | 'Bebedouro Alvenaria' | 'Açude / Cocho';
  beddingType?: 'Maravalha de Pinus' | 'Casca de Arroz' | 'Piso Emborrachado' | 'Sem Cama / Pasto';
  status: 'Disponível / Livre' | 'Ocupado' | 'Em Limpeza / Desinfecção' | 'Em Manutenção';
  lastCleanedDate?: string;
  notes?: string;
}

export type EquineExpenseCategory =
  | 'Alimentação & Feno'
  | 'Veterinário & Clínico'
  | 'Medicamentos & Vacinas'
  | 'Ferrageamento & Casqueamento'
  | 'Odontologia'
  | 'Inscrições em Provas & Competições'
  | 'Treinamento & Doma'
  | 'Transporte & Fretes'
  | 'Seguro Animal'
  | 'Reprodução & Sêmen'
  | 'Instalações & Manutenção'
  | 'Arreios & Materiais'
  | 'Receitas de Premiações (Entrada)'
  | 'Venda de Coberturas (Entrada)'
  | 'Venda de Animal (Entrada)';

export interface EquineExpenseRecord {
  id: string;
  animalId?: string; // Opcional (se for custo geral do haras ou de um cavalo específico)
  date: string;
  category: EquineExpenseCategory;
  type: 'Despesa' | 'Receita';
  description: string;
  amountBrl: number;
  payeeOrRecipient: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface EquineInventoryItem {
  id: string;
  name: string;
  category: 'Medicamento' | 'Vacina / Soro' | 'Ração / Concentrado' | 'Feno / Volumoso' | 'Suplemento / Mineral' | 'Ferradura / Cravo' | 'Material de Enfermagem' | 'Arreio / Equipamento';
  quantity: number;
  unit: 'frasco' | 'ampola' | 'saco 40kg' | 'fardo 15kg' | 'kg' | 'dose' | 'jogo (4un)' | 'unidade' | 'litro';
  minThreshold: number;
  unitCostBrl: number;
  batchNumber?: string;
  expiryDate?: string;
  location: string;
  notes?: string;
}

export interface EquineDiseaseGuide {
  id: string;
  name: string;
  scientificName?: string;
  category: 'Gastrointestinal' | 'Locomotor / Podologia' | 'Infecciosa / Viral' | 'Bacteriana' | 'Protozoária' | 'Respiratória' | 'Dermatológica';
  urgency: 'Emergência Veterinária Máxima' | 'Alta Urgência' | 'Moderada' | 'Crônica / Manejo';
  mapaCompulsoryNotification: boolean; // Mormo e AIE são notificação obrigatória
  symptoms: string[];
  causesAndPathogenesis: string;
  clinicalSigns: string;
  treatmentProtocol: string;
  preventiveMeasures: string;
  firstAidAdvice: string;
  references: string;
  photoUrl?: string;
}

export interface EquinePhotoRecord {
  id: string;
  animalId: string;
  date: string;
  title: string;
  category:
    | 'Nascimento / Potro'
    | 'Treinos & Concursos'
    | 'Competições & Pódios'
    | 'Lesões & Curativos'
    | 'Cascos & Ferrageamento'
    | 'Dentes & Odontologia'
    | 'Evolução Corporal / Pelagem'
    | 'Geral';
  photoUrl: string;
  notes?: string;
}

export interface EquineExamRecord {
  id: string;
  animalId: string;
  date: string;
  title: string;
  examType:
    | 'Hemograma Completo'
    | 'Bioquímica Sérica (GGT, AST, CK, Creatinina, Ureia)'
    | 'AIE (Coggins - MAPA)'
    | 'Mormo (Fixação de Complemento / ELISA)'
    | 'Ultrassonografia Tendínea / Articular'
    | 'Ultrassonografia Reprodutiva'
    | 'Radiografia (Raio-X de Membros / Casco)'
    | 'Ressonância Magnética / Tomografia'
    | 'Endoscopia de Vias Aéreas Superiores'
    | 'Gastroscopia (EGUS / Úlcera Gástrica)'
    | 'Exame Coprológico (OPG - Ovos por Grama)'
    | 'Cultura Bacteriana & Antibiograma';
  laboratory: string;
  veterinarian: string;
  resultSummary: string;
  isNormal: boolean;
  fileAttachmentUrl?: string;
  costBrl?: number;
  notes?: string;
}
