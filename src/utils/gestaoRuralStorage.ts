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
  IndicadorBIRuralData,
} from '../types/gestaoRural';

const STORAGE_KEYS = {
  PROPRIEDADE: 'geaagro_gestao_propriedade',
  TALHOES: 'geaagro_gestao_talhoes',
  SAFRAS: 'geaagro_gestao_safras',
  CRONOGRAMA: 'geaagro_gestao_cronograma',
  OPERACOES: 'geaagro_gestao_operacoes',
  ESTOQUE: 'geaagro_gestao_estoque',
  FORNECEDORES: 'geaagro_gestao_fornecedores',
  COMPRAS: 'geaagro_gestao_compras',
  VENDAS: 'geaagro_gestao_vendas',
  FINANCEIRO: 'geaagro_gestao_financeiro',
  MAQUINAS: 'geaagro_gestao_maquinas',
  MANUTENCOES: 'geaagro_gestao_manutencoes',
  FUNCIONARIOS: 'geaagro_gestao_funcionarios',
  IRRIGACAO: 'geaagro_gestao_irrigacao',
  CLIMA: 'geaagro_gestao_clima',
};

// Initial Clean Datasets for ERP Offline 360 (Without demo data)
export const DEFAULT_PROPRIEDADE: PropriedadeRural = {
  id: 'prop-principal',
  nome: 'Minha Propriedade',
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

export const DEFAULT_TALHOES: TalhaoRural[] = [];
export const DEFAULT_SAFRAS: SafraAgragricola[] = [];
export const DEFAULT_CRONOGRAMA: TarefaCronograma[] = [];
export const DEFAULT_OPERACOES: OperacaoCampoRecord[] = [];
export const DEFAULT_ESTOQUE: ItemEstoqueRural[] = [];
export const DEFAULT_FORNECEDORES: FornecedorRural[] = [];
export const DEFAULT_COMPRAS: CompraInsumoRecord[] = [];
export const DEFAULT_VENDAS: VendaComercializacaoRecord[] = [];
export const DEFAULT_FINANCEIRO: ContaFinanceiraRecord[] = [];
export const DEFAULT_MAQUINAS: MaquinaImplementoRecord[] = [];
export const DEFAULT_MANUTENCOES: ManutencaoPreventivaRecord[] = [];
export const DEFAULT_FUNCIONARIOS: FuncionarioRuralRecord[] = [];
export const DEFAULT_IRRIGACAO: SistemaIrrigacaoFertirrigacao[] = [];
export const DEFAULT_CLIMA: LeituraEstacaoMeteorologica[] = [];

export function clearGestaoRuralStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('[GestaoRuralStorage] Error clearing storage:', e);
  }
}


// Offline-First LocalStorage Data Loader & Sync Engine
export function loadGestaoRuralStorage() {
  try {
    const prop = localStorage.getItem(STORAGE_KEYS.PROPRIEDADE);
    const tal = localStorage.getItem(STORAGE_KEYS.TALHOES);
    const saf = localStorage.getItem(STORAGE_KEYS.SAFRAS);
    const cro = localStorage.getItem(STORAGE_KEYS.CRONOGRAMA);
    const ope = localStorage.getItem(STORAGE_KEYS.OPERACOES);
    const est = localStorage.getItem(STORAGE_KEYS.ESTOQUE);
    const forn = localStorage.getItem(STORAGE_KEYS.FORNECEDORES);
    const comp = localStorage.getItem(STORAGE_KEYS.COMPRAS);
    const vend = localStorage.getItem(STORAGE_KEYS.VENDAS);
    const fin = localStorage.getItem(STORAGE_KEYS.FINANCEIRO);
    const maq = localStorage.getItem(STORAGE_KEYS.MAQUINAS);
    const man = localStorage.getItem(STORAGE_KEYS.MANUTENCOES);
    const fun = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
    const irr = localStorage.getItem(STORAGE_KEYS.IRRIGACAO);
    const cli = localStorage.getItem(STORAGE_KEYS.CLIMA);

    return {
      propriedade: prop ? JSON.parse(prop) : DEFAULT_PROPRIEDADE,
      talhoes: tal ? JSON.parse(tal) : DEFAULT_TALHOES,
      safras: saf ? JSON.parse(saf) : DEFAULT_SAFRAS,
      cronograma: cro ? JSON.parse(cro) : DEFAULT_CRONOGRAMA,
      operacoes: ope ? JSON.parse(ope) : DEFAULT_OPERACOES,
      estoque: est ? JSON.parse(est) : DEFAULT_ESTOQUE,
      fornecedores: forn ? JSON.parse(forn) : DEFAULT_FORNECEDORES,
      compras: comp ? JSON.parse(comp) : DEFAULT_COMPRAS,
      vendas: vend ? JSON.parse(vend) : DEFAULT_VENDAS,
      financeiro: fin ? JSON.parse(fin) : DEFAULT_FINANCEIRO,
      maquinas: maq ? JSON.parse(maq) : DEFAULT_MAQUINAS,
      manutencoes: man ? JSON.parse(man) : DEFAULT_MANUTENCOES,
      funcionarios: fun ? JSON.parse(fun) : DEFAULT_FUNCIONARIOS,
      irrigacao: irr ? JSON.parse(irr) : DEFAULT_IRRIGACAO,
      clima: cli ? JSON.parse(cli) : DEFAULT_CLIMA,
    };
  } catch (e) {
    console.error('[GestaoRuralStorage] Error parsing offline storage:', e);
    return {
      propriedade: DEFAULT_PROPRIEDADE,
      talhoes: DEFAULT_TALHOES,
      safras: DEFAULT_SAFRAS,
      cronograma: DEFAULT_CRONOGRAMA,
      operacoes: DEFAULT_OPERACOES,
      estoque: DEFAULT_ESTOQUE,
      fornecedores: DEFAULT_FORNECEDORES,
      compras: DEFAULT_COMPRAS,
      vendas: DEFAULT_VENDAS,
      financeiro: DEFAULT_FINANCEIRO,
      maquinas: DEFAULT_MAQUINAS,
      manutencoes: DEFAULT_MANUTENCOES,
      funcionarios: DEFAULT_FUNCIONARIOS,
      irrigacao: DEFAULT_IRRIGACAO,
      clima: DEFAULT_CLIMA,
    };
  }
}

export function saveGestaoRuralStorage(data: Partial<ReturnType<typeof loadGestaoRuralStorage>>) {
  try {
    if (data.propriedade) localStorage.setItem(STORAGE_KEYS.PROPRIEDADE, JSON.stringify(data.propriedade));
    if (data.talhoes) localStorage.setItem(STORAGE_KEYS.TALHOES, JSON.stringify(data.talhoes));
    if (data.safras) localStorage.setItem(STORAGE_KEYS.SAFRAS, JSON.stringify(data.safras));
    if (data.cronograma) localStorage.setItem(STORAGE_KEYS.CRONOGRAMA, JSON.stringify(data.cronograma));
    if (data.operacoes) localStorage.setItem(STORAGE_KEYS.OPERACOES, JSON.stringify(data.operacoes));
    if (data.estoque) localStorage.setItem(STORAGE_KEYS.ESTOQUE, JSON.stringify(data.estoque));
    if (data.fornecedores) localStorage.setItem(STORAGE_KEYS.FORNECEDORES, JSON.stringify(data.fornecedores));
    if (data.compras) localStorage.setItem(STORAGE_KEYS.COMPRAS, JSON.stringify(data.compras));
    if (data.vendas) localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(data.vendas));
    if (data.financeiro) localStorage.setItem(STORAGE_KEYS.FINANCEIRO, JSON.stringify(data.financeiro));
    if (data.maquinas) localStorage.setItem(STORAGE_KEYS.MAQUINAS, JSON.stringify(data.maquinas));
    if (data.manutencoes) localStorage.setItem(STORAGE_KEYS.MANUTENCOES, JSON.stringify(data.manutencoes));
    if (data.funcionarios) localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(data.funcionarios));
    if (data.irrigacao) localStorage.setItem(STORAGE_KEYS.IRRIGACAO, JSON.stringify(data.irrigacao));
    if (data.clima) localStorage.setItem(STORAGE_KEYS.CLIMA, JSON.stringify(data.clima));
  } catch (e) {
    console.error('[GestaoRuralStorage] Error writing to offline storage:', e);
  }
}
