/**
 * Tipos e Modelos de Domínio — GeaAgro Estatística
 * Módulo integrado ao ecossistema GeaAgro (OPFS + WASM / GeaAgroOfflineDB).
 */

export type TipoDelineamento =
  | 'DIC'
  | 'DBC'
  | 'DQL'
  | 'FATORIAL'
  | 'PARCELA_SUBDIVIDIDA'
  | 'PARCELA_SUBDIVIDIDA_TEMPO'
  | 'FAIXAS'
  | 'MEDIDAS_REPETIDAS'
  | 'MODELO_MISTO'
  | 'ANINHADO';

export type TipoVariavel =
  | 'quantitativa_continua'
  | 'quantitativa_discreta'
  | 'qualitativa_nominal'
  | 'qualitativa_ordinal'
  | 'categorica';

export type PapelVariavel =
  | 'resposta'
  | 'tratamento'
  | 'fator_a'
  | 'fator_b'
  | 'fator_c'
  | 'bloco'
  | 'linha'
  | 'coluna'
  | 'repeticao'
  | 'parcela'
  | 'subparcela'
  | 'tempo'
  | 'unidade_experimental'
  | 'covariavel'
  | 'dose'
  | 'ignorar';

export type CelulaValor = number | string | null;

export type TransformacaoDados =
  | 'nenhuma'
  | 'log10'
  | 'ln'
  | 'raiz'
  | 'raiz_mais_05'
  | 'arcoseno_raiz'
  | 'box_cox';

export interface EstatisticaProjeto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  pesquisador: string;
  instituicao: string;
  culturaOuArea: string;
  localidade: string;
  tags: string[];
  status: 'ativo' | 'arquivado';
  criadoEm: string;
  atualizadoEm: string;
}

export interface DelineamentoMapeamento {
  respostaCols: string[];
  tratamentoCol?: string;
  fatoresCols?: string[];
  blocoCol?: string;
  linhaCol?: string;
  colunaCol?: string;
  repeticaoCol?: string;
  parcelaCol?: string;
  subparcelaCol?: string;
  tempoCol?: string;
  unidadeCol?: string;
  efeitoAleatorioCol?: string;
  fatorAninhadoCol?: string;
  fatorPaiCol?: string;
}

export interface EstatisticaExperimento {
  id: string;
  projetoId: string;
  nome: string;
  descricao: string;
  objetivo: string;
  delineamento: TipoDelineamento;
  mapeamento: DelineamentoMapeamento;
  alphaPadrao: number;
  status: 'rascunho' | 'pronto' | 'analisado' | 'arquivado';
  criadoEm: string;
  atualizadoEm: string;
}

export interface EstatisticaVariavel {
  id: string;
  experimentoId: string;
  nome: string;
  rotulo: string;
  unidade: string;
  tipo: TipoVariavel;
  papel: PapelVariavel;
  transformacao: TransformacaoDados;
  boxCoxLambda?: number;
  origemColuna?: string;
  observacao?: string;
  criadoEm: string;
}

export interface DataValidationIssue {
  linha: number;
  coluna: string;
  tipo: 'ausente' | 'na_explicito' | 'texto_em_numerica' | 'duplicata' | 'zero_alerta';
  mensagem: string;
  valorBruto: any;
}

export interface DataValidationReport {
  totalLinhas: number;
  totalColunas: number;
  celulasVazias: number;
  celulasNA: number;
  celulasZero: number;
  celulasInvalidasNumericas: number;
  linhasDuplicadas: number[];
  desbalanceado: boolean;
  observacoesPorGrupo: Record<string, number>;
  problemas: DataValidationIssue[];
  compatibilidadeDelineamento: {
    compativel: boolean;
    motivos: string[];
    avisos: string[];
  };
}

export interface EstatisticaConjuntoDados {
  id: string;
  experimentoId: string;
  formato: 'longo' | 'largo';
  colunas: string[];
  linhasWorking: Record<string, CelulaValor>[];
  rawArtifactKey: string | null;
  rawFileName: string | null;
  rawMimeType: string | null;
  rawChecksum: number | null;
  workingChecksum: number;
  temDadosOriginaisPreservados: boolean;
  transformacaoAtiva?: {
    variavel: string;
    metodo: TransformacaoDados;
    lambda?: number;
    aplicadaEm: string;
  } | null;
  validacao: DataValidationReport;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export type CategoriaAnalise =
  | 'descritiva'
  | 'anova'
  | 'comparacao_medias'
  | 'regressao'
  | 'correlacao'
  | 'pressupostos'
  | 'nao_parametrica'
  | 'multivariada'
  | 'especial';

export interface EstatisticaAnalise {
  id: string;
  experimentoId: string;
  categoria: CategoriaAnalise;
  subtipo: string;
  parametros: Record<string, any>;
  criadoEm: string;
}

export interface EstatisticaResultado {
  id: string;
  analiseId: string;
  experimentoId: string;
  categoria: CategoriaAnalise;
  titulo: string;
  subtipo: string;
  dados: any;
  interpretacaoDeterministica: string[];
  avisosTecnicos: string[];
  checksumDados: number;
  criadoEm: string;
}

export interface ConfiguracaoGraficoCientifico {
  tipo:
    | 'barras'
    | 'colunas'
    | 'linhas'
    | 'dispersao'
    | 'boxplot'
    | 'histograma'
    | 'regressao'
    | 'residuos'
    | 'qqplot'
    | 'heatmap'
    | 'biplot'
    | 'dendrograma';
  titulo: string;
  subtitulo: string;
  eixoX: string;
  eixoY: string;
  unidadeX: string;
  unidadeY: string;
  mostrarLegenda: boolean;
  mostrarIC: boolean;
  mostrarRotulos: boolean;
  mostrarEquacao: boolean;
  paleta: 'scientific_emerald' | 'monochrome_paper' | 'high_contrast_colorblind' | 'cobalt_amber';
  casasDecimais: number;
}

export interface EstatisticaGrafico {
  id: string;
  experimentoId: string;
  resultadoId?: string;
  nome: string;
  configuracao: ConfiguracaoGraficoCientifico;
  dadosPlotagem: any;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EstatisticaHistoricoRegistro {
  id: string;
  projetoId?: string;
  experimentoId?: string;
  acao:
    | 'criacao'
    | 'edicao'
    | 'duplicacao'
    | 'arquivamento'
    | 'exclusao'
    | 'importacao'
    | 'transformacao'
    | 'analise'
    | 'grafico'
    | 'relatorio'
    | 'backup';
  entidade: string;
  descricao: string;
  timestamp: string;
}

export interface EstatisticaBackupMetadata {
  id: string;
  titulo: string;
  projetosCount: number;
  experimentosCount: number;
  resultadosCount: number;
  artefatosOpfsCount: number;
  checksumIntegrado: number;
  criadoEm: string;
}

export interface EstatisticaUiPreferences {
  casasDecimais: number;
  alphaPadrao: number;
  exibirFormulas: boolean;
  paletaGraficoPadrao: ConfiguracaoGraficoCientifico['paleta'];
  ultimoProjetoId?: string;
  ultimoExperimentoId?: string;
}
