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
  wearGrade:
    | 'Normal / Fisiológico'
    | 'Pontas de Esmalte Leves'
    | 'Pontas de Esmalte Severas'
    | 'Onda / Degrau'
    | 'Boca em Tesoura'
    | 'Gancho Rostral/Caudal'
    | 'Leve'
    | 'Moderado'
    | 'Severo';
  proceduresPerformed: string[];
  malocclusionsFound?: string;
  findings?: string;
  incisorAngle?: string;
  sedationUsed?: string;
  costBrl?: number;
  nextReviewDate: string;
  nextRevisionDate?: string;
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
  horseshoeType: HorseshoeType | string;
  material?: 'Aço' | 'Alumínio' | 'Poliuretano' | 'Sem Ferradura (Apenas Casqueamento)';
  frontHoofAngleDegrees?: number;
  hindHoofAngleDegrees?: number;
  intervalDays?: number;
  correctiveShoeing?: boolean;
  correctionsMade?: string;
  padsUsed?: string;
  nailType?: string;
  nextShoeingDate: string;
  nextDueDate?: string;
  costBrl: number;
  hoofCondition: 'Excelente' | 'Bom' | 'Quebradiço' | 'Broca / Pododermatite' | 'Sensível / Laminite Prévia';
  photos?: string[];
  notes?: string;
}

export interface EquineVitals {
  heartRateRestBpm?: number;
  restingHeartRateBpm?: number;
  heartRatePeakBpm?: number;
  peakHeartRateBpm?: number;
  heartRateRec5MinBpm?: number;
  heartRateRec10MinBpm?: number;
  respRateMovMin?: number;
  rectalTempC?: number;
  temperatureCelsius?: number;
  mucousMembranes?: 'Rosada e Brilhante (Normal)' | 'Pálida (Anemia/Choque)' | 'Hiperêmica / Congesta (Febre/Endotoxemia)' | 'Ictérica (Fígado/Hemólise)' | 'Cianótica (Hipóxia Severa)';
  capillaryRefillTimeSec?: number;
  hydrationScore?: 'Hidratado (<2s prega)' | 'Desidratação Leve (2-3s)' | 'Desidratação Moderada (3-5s)' | 'Desidratação Grave (>5s)';
  intestinalMotility?: 'Normal nos 4 quadrantes (+/+)' | 'Hipomotilidade (+/-)' | 'Atonia / Silêncio Abdominal (-/-)' | 'Hipermotilidade (++ / Cólica espasmódica)';
}

export interface EquineTrainingRecord {
  id: string;
  animalId: string;
  date: string;
  discipline: EquineDiscipline | string;
  riderName: string;
  trainerName?: string;
  durationMinutes: number;
  distanceKm?: number;
  avgSpeedKmh?: number;
  maxSpeedKmh?: number;
  trackType?: 'Pista de Areia' | 'Pista de Grama' | 'Redondel' | 'Pista Coberta' | 'Trilha / Campo' | 'Esteira Aquática';
  effortLevel: 'Leve / Aquecimento' | 'Leve' | 'Moderado' | 'Intenso' | 'Simulação de Prova / Máximo' | 'Máximo / Competição';
  vitals: EquineVitals;
  performanceScore?: number;
  recoveryEvaluation?: 'Excelente (<10 min)' | 'Boa (10-15 min)' | 'Lenta (15-30 min)' | 'Fadiga / Alerta';
  exercisesDone?: string;
  behaviorRating?: 'Concentrado e Dócil' | 'Energético / Responsivo' | 'Resistente / Tenso' | 'Cansado';
  notes?: string;
}

export interface EquineCompetitionRecord {
  id: string;
  animalId: string;
  eventName: string;
  city: string;
  state: string;
  date: string;
  discipline?: EquineDiscipline | string;
  category: string;
  riderOrHandler: string;
  resultTime?: string;
  scoreOrTime?: string;
  scoreOrFaults?: string;
  placement: string;
  prizeMoneyBrl: number;
  trophyOrRibbon?: string;
  trophyOrMedal?: string;
  pointsAcquired?: number;
  photos?: string[];
  videoUrl?: string;
  observations?: string;
  notes?: string;
}

export interface EquineNutritionFeed {
  id: string;
  name: string;
  category: 'Pastagem' | 'Feno' | 'Silagem' | 'Ração Concentrada' | 'Suplemento / Mineral' | 'Aditivo / Óleo';
  dryMatterPct: number;
  crudeProteinPct: number;
  digestibleEnergyMcalKg: number;
  neutralDetergentFiberPct: number;
  calciumPct: number;
  phosphorusPct: number;
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
  totalDryMatterKg: number;
  dryMatterPctBodyWeight: number;
  totalCrudeProteinGrams: number;
  totalDigestibleEnergyMcal: number;
  totalCalciumGrams: number;
  totalPhosphorusGrams: number;
  caPRatio: number;
  nrcCrudeProteinGrams: number;
  nrcDigestibleEnergyMcal: number;
  nrcCalciumGrams: number;
  nrcPhosphorusGrams: number;
  balanceEvaluation: 'Dieta Equilibrada' | 'Déficit Energético' | 'Déficit Proteico' | 'Excesso de Concentrado (Risco de Cólica/Laminite)' | 'Desbalanço Ca:P';
  notes?: string;
}

export type EquineFacilityType =
  | 'Baia Individual'
  | 'Baia Maternidade'
  | 'Piquete com Pastagem'
  | 'Piquete de Lazer / Pasto'
  | 'Pista de Treinamento'
  | 'Pista de Prova'
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
  type: EquineFacilityType | string;
  dimensionsMeters?: string;
  capacityAnimals?: number;
  currentOccupancy?: number;
  currentAnimalIds?: string[];
  currentOccupantAnimalId?: string;
  pastureType?: string;
  waterSource?: 'Bebedouro Automático' | 'Bebedouro Alvenaria' | 'Açude / Cocho';
  beddingType?: string;
  status?: 'Disponível / Livre' | 'Ocupado' | 'Em Limpeza / Desinfecção' | 'Em Manutenção';
  hygieneStatus?: 'Limpo / Desinfetado' | 'Necessita Troca de Cama' | 'Em Manutenção' | string;
  lastCleanedDate?: string;
  notes?: string;
}

export type EquineExpenseCategory =
  | 'Alimentação & Feno'
  | 'Alimentação & Volumoso'
  | 'Veterinário & Clínico'
  | 'Sanidade & Veterinário'
  | 'Medicamentos & Vacinas'
  | 'Ferrageamento & Casqueamento'
  | 'Odontologia'
  | 'Inscrições em Provas & Competições'
  | 'Inscrições & Provas'
  | 'Treinamento & Doma'
  | 'Treinador & Pista'
  | 'Transporte & Fretes'
  | 'Seguro Animal'
  | 'Reprodução & Sêmen'
  | 'Genética & Reprodução'
  | 'Instalações & Manutenção'
  | 'Instalações & Cama de Baia'
  | 'Arreios & Materiais'
  | 'Receitas de Premiações (Entrada)'
  | 'Venda de Coberturas (Entrada)'
  | 'Venda de Animal (Entrada)'
  | 'Outros';

export interface EquineExpenseRecord {
  id: string;
  animalId?: string;
  date: string;
  category: EquineExpenseCategory | string;
  type?: 'Despesa' | 'Receita';
  description: string;
  amountBrl: number;
  payeeOrRecipient?: string;
  costCenter?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface EquineInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold?: number;
  minimumQuantity?: number;
  unitCostBrl?: number;
  costPerUnitBrl?: number;
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
