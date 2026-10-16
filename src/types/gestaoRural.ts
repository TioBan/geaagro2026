export interface PropriedadeRural {
  id: string;
  nome: string;
  proprietario: string;
  documento: string; // CPF ou CNPJ
  tipoDocumento: 'CPF' | 'CNPJ';
  inscricaoEstadual: string;
  endereco: string;
  municipio: string;
  estado: string;
  codigoIbge: string;
  latitude: number;
  longitude: number;
  areaTotalHa: number;
  reservaLegalHa: number;
  appHa: number; // Área de Preservação Permanente
  areaAgricolaHa: number;
  areaIrrigadaHa: number;
  areaPastagemHa: number;
  areaFlorestaHa: number;
  areaInfraestruturaHa: number;
  responsavelTecnico: string;
  creaNumero: string;
  observacoes: string;
  updatedAt: string;
}

export interface TalhaoRural {
  id: string;
  propriedadeId: string;
  codigo: string;
  nome: string;
  areaHa: number;
  coordenadasGPS: Array<{ lat: number; lng: number }>;
  tipoSolo: string;
  texturaSolo: 'arenoso' | 'medio' | 'argiloso' | 'muito_argiloso';
  teorArgilaPct: number;
  historicoUso: string;
  culturaAtual: string;
  culturaAnterior: string;
  sistemaCultivo: 'Plantio Direto' | 'Convencional' | 'Cultivo Mínimo';
  irrigado: boolean;
  tipoSistemaIrrigacao?: string;
  altitudeMeters: number;
  declividadePct: number;
  fotosUrls: string[];
  observacoes: string;
}

export interface SafraAgragricola {
  id: string;
  propriedadeId: string;
  nomeSafra: string; // ex: "Safra 2025/2026"
  anoAgricola: string;
  cultura: string;
  cultivar: string;
  talhaoId: string;
  talhaoNome: string;
  areaHa: number;
  sistemaCultivo: string;
  cicloDias: number;
  dataPrevistaPlantio: string;
  dataRealizadaPlantio?: string;
  dataPrevistaColheita: string;
  dataRealizadaColheita?: string;
  metaProdutividadeSacasHa: number;
  produtividadeRealizadaSacasHa?: number;
  status: 'planejada' | 'em_andamento' | 'colhida' | 'cancelada';
}

export interface TarefaCronograma {
  id: string;
  safraId: string;
  talhaoId: string;
  talhaoNome: string;
  titulo: string;
  tipoOperacao: string;
  dataPrevista: string;
  dataExecucao?: string;
  responsavel: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  checklist: Array<{ id: string; item: string; concluido: boolean }>;
  observacoes: string;
}

export interface OperacaoCampoRecord {
  id: string;
  safraId: string;
  talhaoId: string;
  talhaoNome: string;
  tipoOperacao:
    | 'Preparo do solo'
    | 'Subsolagem'
    | 'Escarificação'
    | 'Plantio'
    | 'Adubação'
    | 'Fertirrigação'
    | 'Pulverização'
    | 'Capina'
    | 'Poda'
    | 'Tutoramento'
    | 'Irrigação'
    | 'Colheita'
    | 'Transporte';
  dataHoraInicio: string;
  dataHoraFim: string;
  maquinaId?: string;
  maquinaNome?: string;
  operadorId?: string;
  operadorNome?: string;
  produtoUtilizado?: string;
  dosePorHa?: number;
  unidadeDose?: string;
  quantidadeTotalProduto?: number;
  areaAplicadaHa: number;
  temperaturaC?: number;
  umidadeArPct?: number;
  velocidadeVentoKmH?: number;
  consumoCombustivelLiters?: number;
  fotosUrls?: string[];
  coordenadasLat?: number;
  coordenadasLng?: number;
  custoTotalOperacaoR$: number;
  observacoes: string;
}

export interface ItemEstoqueRural {
  id: string;
  codigo: string;
  nome: string;
  categoria:
    | 'Fertilizantes'
    | 'Defensivos'
    | 'Sementes'
    | 'Combustíveis'
    | 'Lubrificantes'
    | 'Peças'
    | 'EPIs'
    | 'Ferramentas';
  lote: string;
  dataValidade: string;
  fornecedorNome: string;
  quantidadeAtual: number;
  unidadeMedida: 'kg' | 'L' | 'sc' | 'un' | 'm3' | 'ton';
  precoUnitarioR$: number;
  estoqueMinimo: number;
  localArmazenamento: string;
  statusAlerta: 'normal' | 'minimo' | 'vencendo' | 'vencido';
  historicoMovimentacao: Array<{
    id: string;
    data: string;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    motivo: string;
    operacaoId?: string;
  }>;
}

export interface FornecedorRural {
  id: string;
  nomeEmpresa: string;
  nomeFantasia: string;
  cnpjCpf: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  categoriasProdutos: string[];
  avaliacaoNota: number; // 1 a 5
  observacoes: string;
}

export interface CompraInsumoRecord {
  id: string;
  numeroPedido: string;
  fornecedorId: string;
  fornecedorNome: string;
  dataPedido: string;
  dataEntregaPrevista: string;
  dataEntregaRealizada?: string;
  valorTotalR$: number;
  condicaoPagamento: string;
  status: 'orcamento' | 'aprovado' | 'faturado' | 'recebido' | 'cancelado';
  itens: Array<{
    produtoId: string;
    produtoNome: string;
    quantidade: number;
    unidade: string;
    precoUnitarioR$: number;
    subtotalR$: number;
  }>;
}

export interface VendaComercializacaoRecord {
  id: string;
  numeroContrato: string;
  compradorNome: string;
  compradorDocumento: string;
  cultura: string;
  safraId: string;
  safraNome: string;
  quantidadeSacasOuKg: number;
  unidade: 'sc' | 'kg' | 'ton';
  precoUnitarioR$: number;
  valorBrutoTotalR$: number;
  umidadePct: number;
  impurezaPct: number;
  classificacaoQualidade: string;
  notaFiscalNumero: string;
  valorFreteR$: number;
  valorComissaoR$: number;
  receitaLiquidaR$: number;
  dataVenda: string;
  dataVencimentoPagamento: string;
  statusRecebimento: 'pendente' | 'parcial' | 'recebido';
}

export interface ContaFinanceiraRecord {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string; // Ex: Fertilizantes, Defensivos, Mão de obra, Venda de Soja
  descricao: string;
  valorR$: number;
  dataVencimento: string;
  dataPagamentoRecebimento?: string;
  status: 'pendente' | 'pago' | 'recebido' | 'atrasado';
  safraId?: string;
  talhaoId?: string;
  fornecedorClienteNome: string;
  numeroDocumentoOuNota?: string;
  meioPagamento: 'PIX' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Cartão';
}

export interface MaquinaImplementoRecord {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'Trator' | 'Pulverizador' | 'Plantadeira' | 'Colheitadeira' | 'Caminhão' | 'Implemento' | 'Utilitário';
  marcaModelo: string;
  anoFabricacao: number;
  horimetroOuKmAtual: number;
  consumoMedioLitersHour: number;
  status: 'ativo' | 'em_manutencao' | 'inativo';
  proximaManutencaoHorimetro: number;
  custoManutencaoAcumuladoR$: number;
  observacoes: string;
}

export interface ManutencaoPreventivaRecord {
  id: string;
  maquinaId: string;
  maquinaNome: string;
  tipoManutencao: 'Preventiva' | 'Corretiva' | 'Revisão Periódica';
  dataManutencao: string;
  horimetroNoAto: number;
  descricaoServico: string;
  pecasSubstituidas: string;
  oficinaOutrabalhador: string;
  custoTotalR$: number;
}

export interface FuncionarioRuralRecord {
  id: string;
  nome: string;
  cpf: string;
  cargoFuncao: string;
  salarioBaseR$: number;
  dataAdmissao: string;
  treinamentosEPIs: string[];
  episEntregues: Array<{ item: string; dataEntrega: string; validade: string }>;
  jornadaHorasDiarias: number;
  horasExtrasMes: number;
  status: 'ativo' | 'ferias' | 'afastado' | 'desligado';
  talhoesAtribuidos: string[];
}

export interface SistemaIrrigacaoFertirrigacao {
  id: string;
  nome: string;
  tipo: 'Gotejamento' | 'Microaspersão' | 'Pivô Central' | 'Aspersão Convencional';
  vazaoM3H: number;
  pressaoOperacaoBar: number;
  laminaDiariaMm: number;
  tempoOperacaoHoras: number;
  frequenciaDias: number;
  fertilizantesInjetados: Array<{ nome: string; concentracaoKgM3: number }>;
  compatibilidadeQuimicaStatus: 'Alta' | 'Atenção' | 'Incompatível';
  observacoes: string;
}

export interface LeituraEstacaoMeteorologica {
  id: string;
  dataHora: string;
  chuvaMm: number;
  temperaturaMaxC: number;
  temperaturaMinC: number;
  umidadeRelativaPct: number;
  velocidadeVentoKmH: number;
  radiacaoSolarMJ: number;
  et0DiariaMm: number;
  etcCalculadaMm: number;
  condicaoGeral: 'Ensolarado' | 'Parcialmente Nublado' | 'Chuvoso' | 'Tempestade' | 'Veranico';
}

export interface IndicadorBIRuralData {
  safraId: string;
  safraNome: string;
  produtividadeMediaSacasHa: number;
  custoTotalPorHaR$: number;
  receitaTotalPorHaR$: number;
  lucroLiquidoPorHaR$: number;
  margemLucroPct: number;
  roiPct: number;
  fertilizanteUtilizadoKgHa: number;
  defensivoUtilizadoLitersHa: number;
  consumoCombustivelLitersHa: number;
  consumoAguaM3Ha: number;
  horasMaquinaHa: number;
  eficienciaOperacionalPct: number;
}

export interface MensagemAssistenteIARural {
  id: string;
  remetente: 'usuario' | 'ia';
  texto: string;
  timestamp: string;
  sugestoesAcao?: string[];
  dadosGraficoAnalitico?: any;
}
