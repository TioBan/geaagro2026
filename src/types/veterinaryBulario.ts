export type VeterinaryCategory =
  | 'Antimicrobiano'
  | 'Anti-inflamatório'
  | 'Antiparasitário'
  | 'Hormônio Reprodutivo'
  | 'Anestésico / Sedativo'
  | 'Suplemento / Vitamínico'
  | 'Vacina / Biológico'
  | 'Tópico / Dermatológico'
  | 'Desinfetante / Antisséptico'
  | 'Terapêutica Geral';

export type ProductCategory = VeterinaryCategory;

export type VeterinarySpecies =
  | 'Bovinos'
  | 'Equinos'
  | 'Suínos'
  | 'Ovinos'
  | 'Caprinos'
  | 'Bubalinos'
  | 'Aves'
  | 'Cães'
  | 'Gatos'
  | 'Cadelas'
  | 'Gatas'
  | 'Coelhos'
  | 'Bezerros'
  | 'Animais Silvestres'
  | 'Instalações';

export interface DoseCalculationRule {
  species: string;
  doseMgPerKg?: number;
  mlPer10Kg?: number;
  mlPer50Kg?: number;
  mlPer100Kg?: number;
  fixedDosePerAnimal?: string;
  notes?: string;
}

export interface VeterinaryProduct {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string;
  category: VeterinaryCategory;
  targetSpecies: VeterinarySpecies[];
  indications: string;
  dosage: string;
  dosageCalculation?: DoseCalculationRule[];
  administrationRoute: string;
  gracePeriodMeat: string;
  gracePeriodMilk: string;
  gracePeriodEggs?: string;
  contraindications: string;
  adverseReactions?: string;
  manufacturer: string;
  mapaRegistration: string;
  storage?: string;
  presentation?: string;
  requiresPrescription?: boolean;
}

export interface PrescriptionItem {
  id?: string;
  productId: string;
  productName: string;
  activeIngredient: string;
  presentation?: string;
  manufacturer?: string;
  targetSpecies: string;
  animalIdentifier?: string;
  bodyWeightKg?: number;
  calculatedDose: string;
  route: string;
  frequency: string;
  durationDays: number;
  totalQuantityNeeded: string;
  instructions: string;
  meatGracePeriod?: string;
  milkGracePeriod?: string;
  eggsGracePeriod?: string;
  notes?: string;
}

export type PrescriptionType = 
  | 'simples'           // Receituário Veterinário Simples
  | 'controle_especial'  // Receituário de Controle Especial (2 Vias)
  | 'notificacao_receita' // Notificação de Receita Veterinária (Portaria 344)
  | 'orientacao_manejo';  // Laudo / Guia de Orientação Profilática

export type PrescriptionStatus = 'emitida' | 'em_tratamento' | 'concluida' | 'cancelada';

export interface VeterinaryPrescription {
  id: string;
  prescriptionNumber: string;
  date: string;
  validUntil: string;
  prescriptionType: PrescriptionType;
  status: PrescriptionStatus;
  
  // Dados do Médico Veterinário (Prescritor)
  veterinarianName: string;
  veterinarianCpf?: string;
  crmvNumber: string;
  crmvState: string;
  veterinarianPhone?: string;
  veterinarianEmail?: string;
  clinicAddress?: string;
  signatureImage?: string;

  // Dados da Empresa / Consultoria Emissora
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string;
  
  // Dados da Propriedade & Produtor / Tutor
  farmId?: string;
  farmName: string;
  producerId?: string;
  producerName: string;
  producerCpfCnpj?: string;
  producerPhone?: string;
  location: string;
  cityState: string;
  
  // Dados do Animal ou Lote de Animais
  species: VeterinarySpecies | string;
  breed?: string;
  categoryOrSex?: string;
  animalCount?: number;
  animalIdentifier: string; // Brinco, SISBOV, Lote, Nome, etc.
  estimatedWeightKg?: number;
  age?: string;
  
  // Diagnóstico e Itens Prescritos
  clinicalDiagnosis: string;
  anamneseNotes?: string;
  items: PrescriptionItem[];
  
  // Carência e Observações Gerais
  meatGracePeriodSummary?: string;
  milkGracePeriodSummary?: string;
  eggsGracePeriodSummary?: string;
  generalInstructions?: string;
  disposalInstructions?: string;
  
  // Identificação para Controle Especial (Comprador/Farmácia)
  buyerName?: string;
  buyerDocument?: string;
  buyerAddress?: string;
  buyerPhone?: string;
  pharmacyDispensationNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalProtocolTemplate {
  id: string;
  title: string;
  category: string;
  targetSpecies: VeterinarySpecies[];
  description: string;
  suggestedDiagnosis: string;
  prescriptionType: PrescriptionType;
  items: Omit<PrescriptionItem, 'id'>[];
  generalNotes: string;
}

