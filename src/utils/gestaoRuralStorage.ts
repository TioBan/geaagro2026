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

// Initial Demo Datasets for ERP Offline 360
export const DEFAULT_PROPRIEDADE: PropriedadeRural = {
  id: 'prop-360-01',
  nome: 'Fazenda Santa Helena HF & Grãos',
  proprietario: 'Dr. Lucas Mendes & Família',
  documento: '12.345.678/0001-90',
  tipoDocumento: 'CNPJ',
  inscricaoEstadual: 'PR-90871234-55',
  endereco: 'Rodovia BR-369, Km 182 - Gleba Palhano',
  municipio: 'Londrina',
  estado: 'PR',
  codigoIbge: '4113700',
  latitude: -23.31028,
  longitude: -51.16278,
  areaTotalHa: 1250.0,
  reservaLegalHa: 250.0,
  appHa: 75.0,
  areaAgricolaHa: 850.0,
  areaIrrigadaHa: 320.0,
  areaPastagemHa: 50.0,
  areaFlorestaHa: 0.0,
  areaInfraestruturaHa: 30.0,
  responsavelTecnico: 'Eng. Agrônomo Carlos Eduardo Silva',
  creaNumero: 'CREA-PR 182390/D',
  observacoes: 'Propriedade modelo GeaAgro com certificação GlobalG.A.P. e agricultura de precisão.',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_TALHOES: TalhaoRural[] = [
  {
    id: 'tal-360-01',
    propriedadeId: 'prop-360-01',
    codigo: 'TL-01',
    nome: 'Talhão Pivô Sul 01',
    areaHa: 120.0,
    coordenadasGPS: [
      { lat: -23.3120, lng: -51.1650 },
      { lat: -23.3150, lng: -51.1600 },
      { lat: -23.3180, lng: -51.1630 },
      { lat: -23.3140, lng: -51.1680 },
    ],
    tipoSolo: 'Latossolo Vermelho Eutrófico',
    texturaSolo: 'argiloso',
    teorArgilaPct: 58.0,
    historicoUso: 'Rotação Soja / Milho Safrinha / Trigo sob Pivô Central desde 2018.',
    culturaAtual: 'Soja',
    culturaAnterior: 'Milho Safrinha',
    sistemaCultivo: 'Plantio Direto',
    irrigado: true,
    tipoSistemaIrrigacao: 'Pivô Central Valley',
    altitudeMeters: 620,
    declividadePct: 3.5,
    fotosUrls: [],
    observacoes: 'Excelente retenção hídrica; calagem e gessagem atualizadas.',
  },
  {
    id: 'tal-360-02',
    propriedadeId: 'prop-360-01',
    codigo: 'TL-02',
    nome: 'Talhão Sede Sequeiro 02',
    areaHa: 210.0,
    coordenadasGPS: [
      { lat: -23.3080, lng: -51.1550 },
      { lat: -23.3100, lng: -51.1500 },
      { lat: -23.3140, lng: -51.1530 },
      { lat: -23.3120, lng: -51.1580 },
    ],
    tipoSolo: 'Latossolo Vermelho Distrófico',
    texturaSolo: 'medio',
    teorArgilaPct: 34.0,
    historicoUso: 'Soja Verão / Consórcio Milho com Brachiaria ruziziensis.',
    culturaAtual: 'Soja',
    culturaAnterior: 'Brachiaria ruziziensis',
    sistemaCultivo: 'Plantio Direto',
    irrigado: false,
    altitudeMeters: 615,
    declividadePct: 4.2,
    fotosUrls: [],
    observacoes: 'Com palhada profunda de braquiária; controle de erodibilidade alto.',
  },
  {
    id: 'tal-360-03',
    propriedadeId: 'prop-360-01',
    codigo: 'TL-03',
    nome: 'Talhão Hortifruti Gotejo 03',
    areaHa: 45.0,
    coordenadasGPS: [
      { lat: -23.3050, lng: -51.1620 },
      { lat: -23.3070, lng: -51.1580 },
      { lat: -23.3090, lng: -51.1600 },
      { lat: -23.3070, lng: -51.1640 },
    ],
    tipoSolo: 'Nitossolo Vermelho Eutrófico',
    texturaSolo: 'argiloso',
    teorArgilaPct: 62.0,
    historicoUso: 'Tomate de Mesa / Pimentão em fertirrigação por gotejamento.',
    culturaAtual: 'Tomate',
    culturaAnterior: 'Pimentão',
    sistemaCultivo: 'Cultivo Mínimo',
    irrigado: true,
    tipoSistemaIrrigacao: 'Gotejamento Subsuperficial',
    altitudeMeters: 628,
    declividadePct: 2.1,
    fotosUrls: [],
    observacoes: 'Área com mulch plástico e fertirrigação automatizada NPK + Micronutrientes.',
  },
];

export const DEFAULT_SAFRAS: SafraAgragricola[] = [
  {
    id: 'safra-2025-2026',
    propriedadeId: 'prop-360-01',
    nomeSafra: 'Safra Verão 2025/2026',
    anoAgricola: '2025/2026',
    cultura: 'Soja',
    cultivar: 'TMG 7063 IPRO',
    talhaoId: 'tal-360-01',
    talhaoNome: 'Talhão Pivô Sul 01',
    areaHa: 120.0,
    sistemaCultivo: 'Plantio Direto',
    cicloDias: 115,
    dataPrevistaPlantio: '2025-10-15',
    dataRealizadaPlantio: '2025-10-14',
    dataPrevistaColheita: '2026-02-10',
    dataRealizadaColheita: '2026-02-08',
    metaProdutividadeSacasHa: 82.0,
    produtividadeRealizadaSacasHa: 86.4,
    status: 'colhida',
  },
  {
    id: 'safra-safrinha-2026',
    propriedadeId: 'prop-360-01',
    nomeSafra: 'Milho Safrinha 2026',
    anoAgricola: '2025/2026',
    cultura: 'Milho',
    cultivar: 'DKB 360 PRO4',
    talhaoId: 'tal-360-01',
    talhaoNome: 'Talhão Pivô Sul 01',
    areaHa: 120.0,
    sistemaCultivo: 'Plantio Direto sob Pivô',
    cicloDias: 130,
    dataPrevistaPlantio: '2026-02-20',
    dataRealizadaPlantio: '2026-02-18',
    dataPrevistaColheita: '2026-06-30',
    metaProdutividadeSacasHa: 135.0,
    status: 'em_andamento',
  },
];

export const DEFAULT_CRONOGRAMA: TarefaCronograma[] = [
  {
    id: 'tar-01',
    safraId: 'safra-safrinha-2026',
    talhaoId: 'tal-360-01',
    talhaoNome: 'Talhão Pivô Sul 01',
    titulo: 'Adubação de Cobertura Nitrogenada com Fertirrigação',
    tipoOperacao: 'Fertirrigação',
    dataPrevista: '2026-03-25',
    responsavel: 'Operador Marcos e Eng. Carlos',
    prioridade: 'alta',
    status: 'em_andamento',
    checklist: [
      { id: 'c1', item: 'Verificar condutividade elétrica e pH da calda', concluido: true },
      { id: 'c2', item: 'Checar pressão dos emissores do pivô', concluido: true },
      { id: 'c3', item: 'Injetar Nitrato de Amônio + Sulfato de Magnésio', concluido: false },
    ],
    observacoes: 'Injeção de 45 kg N/ha via pivô central na fase V6.',
  },
  {
    id: 'tar-02',
    safraId: 'safra-safrinha-2026',
    talhaoId: 'tal-360-01',
    talhaoNome: 'Talhão Pivô Sul 01',
    titulo: 'Aplicação de Fungicida Sistêmico e Inseticida no Milho',
    tipoOperacao: 'Pulverização',
    dataPrevista: '2026-04-10',
    responsavel: 'Operador Tiago (Pulverizador autopropelido)',
    prioridade: 'urgente',
    status: 'pendente',
    checklist: [
      { id: 'c4', item: 'Analisar condições climáticas (Vento < 10km/h, UR > 55%)', concluido: false },
      { id: 'c5', item: 'Inspecionar presença de cigarrinha e mancha de turcicum', concluido: false },
      { id: 'c6', item: 'Adicionar adjuvante de derivabilidade reduzida', concluido: false },
    ],
    observacoes: 'Aplicação preventiva para mancha foliar e controle de percevejo/cigarrinha.',
  },
];

export const DEFAULT_OPERACOES: OperacaoCampoRecord[] = [
  {
    id: 'op-01',
    safraId: 'safra-safrinha-2026',
    talhaoId: 'tal-360-01',
    talhaoNome: 'Talhão Pivô Sul 01',
    tipoOperacao: 'Plantio',
    dataHoraInicio: '2026-02-18T07:00:00.000Z',
    dataHoraFim: '2026-02-18T18:30:00.000Z',
    maquinaId: 'maq-01',
    maquinaNome: 'Trator John Deere 8370R + Plantadeira DB74',
    operadorId: 'func-01',
    operadorNome: 'Antônio Silva (Operador Sênior)',
    produtoUtilizado: 'Semente Milho DKB 360 PRO4 + Adubo MAP 10-52-00',
    dosePorHa: 350.0,
    unidadeDose: 'kg/ha',
    quantidadeTotalProduto: 42000.0,
    areaAplicadaHa: 120.0,
    temperaturaC: 28.5,
    umidadeArPct: 62.0,
    velocidadeVentoKmH: 7.2,
    consumoCombustivelLiters: 480.0,
    coordenadasLat: -23.312,
    coordenadasLng: -51.165,
    custoTotalOperacaoR$: 148500.0,
    observacoes: 'Plantio concluído na janela ótima do ZARC com estande perfeito de 68.000 pl/ha.',
  },
];

export const DEFAULT_ESTOQUE: ItemEstoqueRural[] = [
  {
    id: 'est-01',
    codigo: 'FERT-01',
    nome: 'Fertilizante NPK 02-20-20 Granulado',
    categoria: 'Fertilizantes',
    lote: 'LT-2026-88',
    dataValidade: '2027-12-31',
    fornecedorNome: 'Yara Brasil Fertilizantes',
    quantidadeAtual: 85000.0,
    unidadeMedida: 'kg',
    precoUnitarioR$: 3.2,
    estoqueMinimo: 20000.0,
    localArmazenamento: 'Galpão de Insumos A - Baia 2',
    statusAlerta: 'normal',
    historicoMovimentacao: [
      { id: 'm1', data: '2026-01-10', tipo: 'entrada', quantidade: 100000.0, motivo: 'Compra Nota Fiscal 45891' },
      { id: 'm2', data: '2026-02-18', tipo: 'saida', quantidade: 15000.0, motivo: 'Aplicação no Plantio Talhão 01' },
    ],
  },
  {
    id: 'est-02',
    codigo: 'DEF-01',
    nome: 'Fungicida Priori Xtra (Azoxistrobina + Ciproconazol)',
    categoria: 'Defensivos',
    lote: 'SY-9921',
    dataValidade: '2026-11-30',
    fornecedorNome: 'Syngenta Proteção de Cultivos',
    quantidadeAtual: 450.0,
    unidadeMedida: 'L',
    precoUnitarioR$: 145.0,
    estoqueMinimo: 100.0,
    localArmazenamento: 'Depósito de Defensivos Climatizado - Prateleira B',
    statusAlerta: 'vencendo',
    historicoMovimentacao: [
      { id: 'm3', data: '2026-01-15', tipo: 'entrada', quantidade: 500.0, motivo: 'Compra Pedido 1092' },
    ],
  },
  {
    id: 'est-03',
    codigo: 'COMB-01',
    nome: 'Óleo Diesel S10 Rodoviário / Agrícola',
    categoria: 'Combustíveis',
    lote: 'TANQUE-BASE-01',
    dataValidade: '2026-12-31',
    fornecedorNome: 'Distribuidora Vibra Energia / Petrobras',
    quantidadeAtual: 18500.0,
    unidadeMedida: 'L',
    precoUnitarioR$: 5.85,
    estoqueMinimo: 5000.0,
    localArmazenamento: 'Tanque Subterrâneo 30.000L - Posto Interno',
    statusAlerta: 'normal',
    historicoMovimentacao: [],
  },
];

export const DEFAULT_FORNECEDORES: FornecedorRural[] = [
  {
    id: 'forn-01',
    nomeEmpresa: 'Yara Brasil Fertilizantes S.A.',
    nomeFantasia: 'Yara Fertilizantes',
    cnpjCpf: '00.000.000/0001-91',
    telefone: '(43) 3371-9000',
    email: 'vendas.sul@yara.com.br',
    cidade: 'Londrina',
    estado: 'PR',
    categoriasProdutos: ['Fertilizantes NPK', 'Nutrição Foliar', 'Fertirrigação'],
    avaliacaoNota: 4.9,
    observacoes: 'Fornecedor de alta confiabilidade com entrega pontual na fazenda.',
  },
  {
    id: 'forn-02',
    nomeEmpresa: 'Syngenta Proteção de Cultivos Ltda',
    nomeFantasia: 'Syngenta Brasil',
    cnpjCpf: '11.222.333/0001-44',
    telefone: '(19) 3801-7000',
    email: 'atendimento@syngenta.com.br',
    cidade: 'Campinas',
    estado: 'SP',
    categoriasProdutos: ['Defensivos', 'Tratamento de Sementes'],
    avaliacaoNota: 4.8,
    observacoes: 'Contrato corporativo estendido com suporte técnico no campo.',
  },
];

export const DEFAULT_COMPRAS: CompraInsumoRecord[] = [
  {
    id: 'comp-01',
    numeroPedido: 'PED-2026-089',
    fornecedorId: 'forn-01',
    fornecedorNome: 'Yara Fertilizantes',
    dataPedido: '2026-01-05',
    dataEntregaPrevista: '2026-01-10',
    dataEntregaRealizada: '2026-01-10',
    valorTotalR$: 320000.0,
    condicaoPagamento: '30/60/90 Dias no Safra',
    status: 'recebido',
    itens: [
      {
        produtoId: 'est-01',
        produtoNome: 'Fertilizante NPK 02-20-20 Granulado',
        quantidade: 100000,
        unidade: 'kg',
        precoUnitarioR$: 3.2,
        subtotalR$: 320000.0,
      },
    ],
  },
];

export const DEFAULT_VENDAS: VendaComercializacaoRecord[] = [
  {
    id: 'vend-01',
    numeroContrato: 'CTR-SOJA-2026-112',
    compradorNome: 'Cargill Agrícola S.A.',
    compradorDocumento: '60.498.706/0001-57',
    cultura: 'Soja',
    safraId: 'safra-2025-2026',
    safraNome: 'Safra Verão 2025/2026',
    quantidadeSacasOuKg: 10368, // 86.4 sc/ha x 120 ha
    unidade: 'sc',
    precoUnitarioR$: 138.5,
    valorBrutoTotalR$: 1435968.0,
    umidadePct: 13.5,
    impurezaPct: 1.0,
    classificacaoQualidade: 'Tipo 1 Padrão Exportação',
    notaFiscalNumero: 'NF-e 001.982',
    valorFreteR$: 28500.0,
    valorComissaoR$: 0.0,
    receitaLiquidaR$: 1407468.0,
    dataVenda: '2026-02-12',
    dataVencimentoPagamento: '2026-02-28',
    statusRecebimento: 'recebido',
  },
];

export const DEFAULT_FINANCEIRO: ContaFinanceiraRecord[] = [
  {
    id: 'fin-01',
    tipo: 'receita',
    categoria: 'Venda de soja',
    descricao: 'Recebimento de Venda de Soja Contrato Cargill NF 001.982',
    valorR$: 1407468.0,
    dataVencimento: '2026-02-28',
    dataPagamentoRecebimento: '2026-02-28',
    status: 'recebido',
    safraId: 'safra-2025-2026',
    talhaoId: 'tal-360-01',
    fornecedorClienteNome: 'Cargill Agrícola S.A.',
    numeroDocumentoOuNota: 'NF-e 001.982',
    meioPagamento: 'PIX',
  },
  {
    id: 'fin-02',
    tipo: 'despesa',
    categoria: 'Fertilizantes',
    descricao: 'Pagamento Parcela 1/3 Yara NPK 02-20-20',
    valorR$: 106666.67,
    dataVencimento: '2026-02-10',
    dataPagamentoRecebimento: '2026-02-10',
    status: 'pago',
    safraId: 'safra-2025-2026',
    fornecedorClienteNome: 'Yara Fertilizantes',
    numeroDocumentoOuNota: 'PED-2026-089',
    meioPagamento: 'Boleto',
  },
  {
    id: 'fin-03',
    tipo: 'despesa',
    categoria: 'Combustível',
    descricao: 'Reabastecimento Tanque S10 Diesel 10.000L',
    valorR$: 58500.0,
    dataVencimento: '2026-04-05',
    status: 'pendente',
    fornecedorClienteNome: 'Vibra Energia',
    numeroDocumentoOuNota: 'NF 8820',
    meioPagamento: 'Transferência',
  },
];

export const DEFAULT_MAQUINAS: MaquinaImplementoRecord[] = [
  {
    id: 'maq-01',
    codigo: 'TR-01',
    nome: 'Trator John Deere 8370R Autopropelido',
    tipo: 'Trator',
    marcaModelo: 'John Deere 8370R - 370 CV',
    anoFabricacao: 2022,
    horimetroOuKmAtual: 2450,
    consumoMedioLitersHour: 28.5,
    status: 'ativo',
    proximaManutencaoHorimetro: 2500,
    custoManutencaoAcumuladoR$: 38500.0,
    observacoes: 'Equipado com piloto automático RTK e telemetria JDLink.',
  },
  {
    id: 'maq-02',
    codigo: 'PULV-01',
    nome: 'Pulverizador Autopropelido Jacto Imperador 3000',
    tipo: 'Pulverizador',
    marcaModelo: 'Jacto Imperador 3000 - Barras 30m',
    anoFabricacao: 2023,
    horimetroOuKmAtual: 1120,
    consumoMedioLitersHour: 18.0,
    status: 'ativo',
    proximaManutencaoHorimetro: 1250,
    custoManutencaoAcumuladoR$: 18200.0,
    observacoes: 'Controle bico a bico com sistema de corte de seção automático.',
  },
  {
    id: 'maq-03',
    codigo: 'COLH-01',
    nome: 'Colheitadeira Case IH Axial-Flow 8250',
    tipo: 'Colheitadeira',
    marcaModelo: 'Case IH Axial-Flow 8250 Automation',
    anoFabricacao: 2021,
    horimetroOuKmAtual: 1890,
    consumoMedioLitersHour: 42.0,
    status: 'ativo',
    proximaManutencaoHorimetro: 2000,
    custoManutencaoAcumuladoR$: 64000.0,
    observacoes: 'Plataforma de corte draper 40 pés e sensor de umidade de grãos.',
  },
];

export const DEFAULT_MANUTENCOES: ManutencaoPreventivaRecord[] = [
  {
    id: 'manut-01',
    maquinaId: 'maq-01',
    maquinaNome: 'Trator John Deere 8370R Autopropelido',
    tipoManutencao: 'Preventiva',
    dataManutencao: '2026-01-20',
    horimetroNoAto: 2250,
    descricaoServico: 'Troca de óleo do motor, filtro de combustível, filtro de ar e calibração de hidráulico.',
    pecasSubstituidas: 'Kit Filtros JD Original + Óleo Plus-50 II 15W-40',
    oficinaOutrabalhador: 'Oficina da Fazenda / Mecânico Roberto',
    custoTotalR$: 4200.0,
  },
];

export const DEFAULT_FUNCIONARIOS: FuncionarioRuralRecord[] = [
  {
    id: 'func-01',
    nome: 'Antônio Silva',
    cpf: '333.444.555-66',
    cargoFuncao: 'Operador de Máquinas Sênior / Tratorista',
    salarioBaseR$: 4800.0,
    dataAdmissao: '2019-03-15',
    treinamentosEPIs: ['NR-31 Agrotóxicos', 'NR-12 Segurança em Máquinas', 'Piloto GPS RTK'],
    episEntregues: [
      { item: 'Máscara com Filtro P3', dataEntrega: '2026-01-10', validade: '2026-07-10' },
      { item: 'Macacão Impermeável de Proteção', dataEntrega: '2026-01-10', validade: '2026-07-10' },
      { item: 'Bota de Borracha Nitrílica', dataEntrega: '2025-08-01', validade: '2026-08-01' },
    ],
    jornadaHorasDiarias: 8,
    horasExtrasMes: 12,
    status: 'ativo',
    talhoesAtribuidos: ['tal-360-01', 'tal-360-02'],
  },
  {
    id: 'func-02',
    nome: 'Marcos Vinícius de Oliveira',
    cpf: '777.888.999-00',
    cargoFuncao: 'Gerente Agrícola & Fertirrigação',
    salarioBaseR$: 8500.0,
    dataAdmissao: '2017-08-01',
    treinamentosEPIs: ['NR-31 Gestão', 'Manejo Hídrico de Precisão', 'Operação de Pivôs'],
    episEntregues: [
      { item: 'Óculos de Proteção UV', dataEntrega: '2025-09-15', validade: '2026-09-15' },
    ],
    jornadaHorasDiarias: 8,
    horasExtrasMes: 5,
    status: 'ativo',
    talhoesAtribuidos: ['tal-360-01', 'tal-360-03'],
  },
];

export const DEFAULT_IRRIGACAO: SistemaIrrigacaoFertirrigacao[] = [
  {
    id: 'irg-01',
    nome: 'Pivô Central Sul - Lança 01 (Valley 120ha)',
    tipo: 'Pivô Central',
    vazaoM3H: 280.0,
    pressaoOperacaoBar: 3.8,
    laminaDiariaMm: 8.5,
    tempoOperacaoHoras: 14.0,
    frequenciaDias: 1,
    fertilizantesInjetados: [
      { nome: 'Nitrato de Amônio Líquido (UAN-32)', concentracaoKgM3: 45.0 },
      { nome: 'Sulfato de Magnésio Solúvel', concentracaoKgM3: 12.0 },
    ],
    compatibilidadeQuimicaStatus: 'Alta',
    observacoes: 'Automação via painel inteligente acoplado à previsão de chuva do ZARC.',
  },
];

export const DEFAULT_CLIMA: LeituraEstacaoMeteorologica[] = [
  {
    id: 'clim-01',
    dataHora: '2026-03-24T12:00:00.000Z',
    chuvaMm: 14.5,
    temperaturaMaxC: 31.2,
    temperaturaMinC: 19.8,
    umidadeRelativaPct: 68.0,
    velocidadeVentoKmH: 8.4,
    radiacaoSolarMJ: 22.4,
    et0DiariaMm: 4.8,
    etcCalculadaMm: 5.5,
    condicaoGeral: 'Parcialmente Nublado',
  },
  {
    id: 'clim-02',
    dataHora: '2026-03-23T12:00:00.000Z',
    chuvaMm: 0.0,
    temperaturaMaxC: 32.8,
    temperaturaMinC: 20.1,
    umidadeRelativaPct: 58.0,
    velocidadeVentoKmH: 11.2,
    radiacaoSolarMJ: 24.1,
    et0DiariaMm: 5.2,
    etcCalculadaMm: 6.0,
    condicaoGeral: 'Ensolarado',
  },
];

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
