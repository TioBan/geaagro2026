import {
  PropriedadeRural,
  TalhaoRural,
  SafraAgragricola,
  TarefaCronograma,
  OperacaoCampoRecord,
  ItemEstoqueRural,
  FornecedorRural,
  CompraInsumoRecord,
  VendaComercializacaoRecord,
  ContaFinanceiraRecord,
  MaquinaImplementoRecord,
  ManutencaoPreventivaRecord,
  FuncionarioRuralRecord,
  SistemaIrrigacaoFertirrigacao,
  LeituraEstacaoMeteorologica,
  ConfigCulturaIntegrada,
} from '../types/gestaoRural';
import { DEFAULT_CONFIG_CULTURA } from '../data/cropCommercializationPresets';

const STORAGE_KEYS = {
  propriedade: 'geaagro_gestao_propriedade',
  configCultura: 'geaagro_gestao_config_cultura',
  talhoes: 'geaagro_gestao_talhoes',
  safras: 'geaagro_gestao_safras',
  cronograma: 'geaagro_gestao_cronograma',
  operacoes: 'geaagro_gestao_operacoes',
  estoque: 'geaagro_gestao_estoque',
  fornecedores: 'geaagro_gestao_fornecedores',
  compras: 'geaagro_gestao_compras',
  vendas: 'geaagro_gestao_vendas',
  financeiro: 'geaagro_gestao_financeiro',
  maquinas: 'geaagro_gestao_maquinas',
  manutencoes: 'geaagro_gestao_manutencoes',
  funcionarios: 'geaagro_gestao_funcionarios',
  irrigacao: 'geaagro_gestao_irrigacao',
  clima: 'geaagro_gestao_clima',
} as const;

export interface GestaoRuralDataset {
  propriedade: PropriedadeRural;
  configCultura: ConfigCulturaIntegrada;
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  cronograma: TarefaCronograma[];
  operacoes: OperacaoCampoRecord[];
  estoque: ItemEstoqueRural[];
  fornecedores: FornecedorRural[];
  compras: CompraInsumoRecord[];
  vendas: VendaComercializacaoRecord[];
  financeiro: ContaFinanceiraRecord[];
  maquinas: MaquinaImplementoRecord[];
  manutencoes: ManutencaoPreventivaRecord[];
  funcionarios: FuncionarioRuralRecord[];
  irrigacao: SistemaIrrigacaoFertirrigacao[];
  clima: LeituraEstacaoMeteorologica[];
}

export const DEFAULT_PROPRIEDADE: PropriedadeRural = {
  id: 'prop-principal',
  nome: 'Minha Propriedade',
  configCultura: DEFAULT_CONFIG_CULTURA,
  proprietario: '',
  documento: '',
  tipoDocumento: 'CPF',
  inscricaoEstadual: '',
  endereco: '',
  municipio: '',
  estado: '',
  codigoIbge: '',
  latitude: 0,
  longitude: 0,
  areaTotalHa: 0,
  reservaLegalHa: 0,
  appHa: 0,
  areaAgricolaHa: 0,
  areaIrrigadaHa: 0,
  areaPastagemHa: 0,
  areaFlorestaHa: 0,
  areaInfraestruturaHa: 0,
  responsavelTecnico: '',
  creaNumero: '',
  observacoes: '',
  updatedAt: new Date().toISOString(),
};

const createEmptyDataset = (): GestaoRuralDataset => ({
  propriedade: { ...DEFAULT_PROPRIEDADE },
  configCultura: { ...DEFAULT_CONFIG_CULTURA },
  talhoes: [],
  safras: [],
  cronograma: [],
  operacoes: [],
  estoque: [],
  fornecedores: [],
  compras: [],
  vendas: [],
  financeiro: [],
  maquinas: [],
  manutencoes: [],
  funcionarios: [],
  irrigacao: [],
  clima: [],
});

function readStoredValue<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export function clearGestaoRuralStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('[GestaoRuralStorage] Error clearing storage:', e);
  }
}

export function loadGestaoRuralStorage(): GestaoRuralDataset {
  try {
    const parsedProp = readStoredValue<PropriedadeRural>(STORAGE_KEYS.propriedade, { ...DEFAULT_PROPRIEDADE });
    const parsedConfig = readStoredValue<ConfigCulturaIntegrada>(
      STORAGE_KEYS.configCultura,
      parsedProp.configCultura || { ...DEFAULT_CONFIG_CULTURA }
    );
    parsedProp.configCultura = parsedConfig;

    return {
      propriedade: parsedProp,
      configCultura: parsedConfig,
      talhoes: readStoredValue(STORAGE_KEYS.talhoes, []),
      safras: readStoredValue(STORAGE_KEYS.safras, []),
      cronograma: readStoredValue(STORAGE_KEYS.cronograma, []),
      operacoes: readStoredValue(STORAGE_KEYS.operacoes, []),
      estoque: readStoredValue(STORAGE_KEYS.estoque, []),
      fornecedores: readStoredValue(STORAGE_KEYS.fornecedores, []),
      compras: readStoredValue(STORAGE_KEYS.compras, []),
      vendas: readStoredValue(STORAGE_KEYS.vendas, []),
      financeiro: readStoredValue(STORAGE_KEYS.financeiro, []),
      maquinas: readStoredValue(STORAGE_KEYS.maquinas, []),
      manutencoes: readStoredValue(STORAGE_KEYS.manutencoes, []),
      funcionarios: readStoredValue(STORAGE_KEYS.funcionarios, []),
      irrigacao: readStoredValue(STORAGE_KEYS.irrigacao, []),
      clima: readStoredValue(STORAGE_KEYS.clima, []),
    };
  } catch (e) {
    console.error('[GestaoRuralStorage] Error parsing offline storage:', e);
    return createEmptyDataset();
  }
}

export function saveGestaoRuralStorage(data: Partial<GestaoRuralDataset>) {
  try {
    (Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>).forEach(field => {
      const value = data[field];
      if (value !== undefined) {
        localStorage.setItem(STORAGE_KEYS[field], JSON.stringify(value));
      }
    });
  } catch (e) {
    console.error('[GestaoRuralStorage] Error writing to offline storage:', e);
  }
}

export function getCropEmoji(cultura?: string): string {
  const c = (cultura || '').toLowerCase();
  if (c.includes('banana')) return '🍌';
  if (c.includes('soja')) return '🌱';
  if (c.includes('milho')) return '🌽';
  if (c.includes('café')) return '☕';
  if (c.includes('citros') || c.includes('laranja')) return '🍊';
  if (c.includes('tomate')) return '🍅';
  if (c.includes('uva')) return '🍇';
  if (c.includes('mandioca')) return '🥔';
  return '🌾';
}
