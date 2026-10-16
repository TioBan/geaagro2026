export interface PendingRecommendation {
  id: string;
  farmId: string;
  plotId: string;
  type: 'adubacao' | 'calagem' | 'gessagem';
  crop: string;
  description: string;
  dosage: string;
  product: string;
  dateCreated: string;
  status: 'pendente' | 'em_revisao' | 'aplicada' | 'revisada';
}
