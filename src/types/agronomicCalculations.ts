export type CalculationSubmenu =
  | 'plantabilidade'
  | 'regulagens_adubo'
  | 'produtividade'
  | 'analise_solo'
  | 'calagem'
  | 'gessagem'
  | 'correcao_nutricao'
  | 'manutencao_adubacao'
  | 'foliar_ts'
  | 'pulverizacao'
  | 'pulverizacao_drone'
  | 'mecanizacao'
  | 'hidrico_iaf';

export interface CalculatorField {
  key: string;
  label: string;
  placeholder?: string;
  unit?: string;
  type?: 'number' | 'select' | 'text';
  step?: string | number;
  options?: { value: string; label: string }[];
  defaultValue?: number | string;
}

export interface CalculationResult {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  color?: 'emerald' | 'teal' | 'blue' | 'amber' | 'violet' | 'rose' | 'slate' | 'cyan';
  description?: string;
}

export interface CalculatorItem {
  id: string;
  name: string;
  category: CalculationSubmenu;
  description: string;
  formulaDescription: string;
  tags: string[];
  fields?: CalculatorField[];
  sampleData?: Record<string, number | string>;
}

