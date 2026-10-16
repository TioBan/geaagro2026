import {
  PericiaAvaliacaoBenfeitoria,
  PericiaAvaliacaoMaquinaEquipamento,
  PericiaAvaliacaoVeiculo,
  PericiaAvaliacaoSemovente,
  PericiaAvaliacaoRecursoNatural,
  PericiaAvaliacaoFruto,
  PericiaAvaliacaoDireito,
  PericiaAvaliacaoImovel,
  PericiaAtivoInventario,
  CategoriaAtivoRural,
  EstadoConservacaoAtivo,
} from '../types/pericia';

// ==========================================
// 1. BENFEITORIAS (NBR 14653-3)
// ==========================================
export const createDefaultBenfeitorias = (): PericiaAvaliacaoBenfeitoria[] => [
  {
    id: 'benf-01',
    tipo: 'nao_reprodutiva',
    categoria: 'Edificações / Casa Sede',
    descricao: 'Residência sede em alvenaria convencional, laje de concreto, piso cerâmico de alta resistência, esquadrias de alumínio, varanda perimetral e área gourmet.',
    quantidade: 380,
    unidade: 'm²',
    padraoConstrutivo: 'Médio / Superior',
    idadeAnos: 8,
    vidaUtilAnos: 60,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 2600,
    fatorDepreciacao: 0.82,
    valorDepreciadoBrl: 810160,
    observacoes: 'Excelente estado de conservação, pintura recente e instalações hidrossanitárias revisadas.',
    incluirNoLaudo: true,
  },
  {
    id: 'benf-02',
    tipo: 'nao_reprodutiva',
    categoria: 'Galpões e Oficinas',
    descricao: 'Galpão metálico para guarda e manutenção de maquinários agrícolas, piso de concreto armado usinado 15 cm com malha dupla, fechamento em telhas de aluzinco.',
    quantidade: 750,
    unidade: 'm²',
    padraoConstrutivo: 'Industrial',
    idadeAnos: 6,
    vidaUtilAnos: 50,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 1100,
    fatorDepreciacao: 0.85,
    valorDepreciadoBrl: 701250,
    observacoes: 'Pé-direito livre de 6 metros, vão livre sem colunas intermediárias, com bancada de oficina mecânica.',
    incluirNoLaudo: true,
  },
  {
    id: 'benf-03',
    tipo: 'nao_reprodutiva',
    categoria: 'Instalações de Pecuária (Currais / Silos)',
    descricao: 'Curral antiestresse em madeira de lei (aroeira/ipê) e cordoalha de aço, com brete hidráulico de contenção, balança digital eletrônica de 3.000 kg e embarcadouro.',
    quantidade: 1,
    unidade: 'unidade',
    padraoConstrutivo: 'Superior',
    idadeAnos: 5,
    vidaUtilAnos: 35,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 280000,
    fatorDepreciacao: 0.88,
    valorDepreciadoBrl: 246400,
    observacoes: 'Capacidade dinâmica para manejo de até 800 cabeças/dia, seringa redonda e 6 divisórias de apartação.',
    incluirNoLaudo: true,
  },
  {
    id: 'benf-04',
    tipo: 'nao_reprodutiva',
    categoria: 'Cercas e Divisórias',
    descricao: 'Cerca perimetral e divisória interna de 5 fios de arame farpado galvanizado, mourões de eucalipto tratado a cada 3 metros e esticadores de concreto.',
    quantidade: 14500,
    unidade: 'm linear',
    padraoConstrutivo: 'Médio',
    idadeAnos: 7,
    vidaUtilAnos: 25,
    estadoConservacao: 'regular',
    custoNovoUnitarioBrl: 28,
    fatorDepreciacao: 0.72,
    valorDepreciadoBrl: 292320,
    observacoes: 'Linhas perimetrais desobstruídas e com aceiros de proteção contra queimadas.',
    incluirNoLaudo: true,
  },
  {
    id: 'benf-05',
    tipo: 'nao_reprodutiva',
    categoria: 'Obras Hidráulicas / Poços e Açudes',
    descricao: 'Poço artesiano profundo tubular (140 m), bomba submersa trifásica 7.5 cv, vazão outorgada de 24.000 L/h, interligado a reservatório metálico tipo taça de 50.000 L.',
    quantidade: 1,
    unidade: 'unidade',
    padraoConstrutivo: 'Superior',
    idadeAnos: 4,
    vidaUtilAnos: 30,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 145000,
    fatorDepreciacao: 0.89,
    valorDepreciadoBrl: 129050,
    observacoes: 'Água potável de excelente qualidade com laudo microbiológico semestral.',
    incluirNoLaudo: true,
  },
  {
    id: 'benf-06',
    tipo: 'reprodutiva',
    categoria: 'Pastagens Cultivadas / Formadas',
    descricao: 'Pastagem artificialmente formada e adubada com capim Brachiaria brizantha cv. Marandu e Mombaça, com calagem, fosfatagem e piqueteamento rotacionado.',
    quantidade: 220,
    unidade: 'ha',
    padraoConstrutivo: 'Médio / Superior',
    idadeAnos: 4,
    vidaUtilAnos: 15,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 3800,
    fatorDepreciacao: 0.80,
    valorDepreciadoBrl: 668800,
    observacoes: 'Alta densidade de forragem, sem infestação de plantas daninhas ou cupinzeiros.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 2. MÁQUINAS E EQUIPAMENTOS
// ==========================================
export const createDefaultMaquinasEquipamentos = (): PericiaAvaliacaoMaquinaEquipamento[] => [
  {
    id: 'maq-01',
    tipo: 'Colheitadeira de Grãos',
    marca: 'Case IH',
    modelo: 'Axial-Flow 7250 Automation',
    anoFabricacao: 2022,
    potenciaCapacidade: '468 cv / Plataforma Draper 35 pés',
    horimetroOuUso: '1.420 horas',
    estadoConservacao: 'excelente',
    valorNovoBrl: 3450000,
    valorAtualMercadoBrl: 2680000,
    observacoes: 'Piloto automático, telemetria AFS Connect e manutenções rigorosamente em concessionária.',
    incluirNoLaudo: true,
  },
  {
    id: 'maq-02',
    tipo: 'Trator de Pneus Agrícola',
    marca: 'John Deere',
    modelo: '7230J 4WD',
    anoFabricacao: 2021,
    potenciaCapacidade: '230 cv',
    horimetroOuUso: '2.890 horas',
    estadoConservacao: 'bom',
    valorNovoBrl: 1180000,
    valorAtualMercadoBrl: 840000,
    observacoes: 'Transmissão AutoQuad Plus, rodado duplo traseiro e pneus com 70% de vida útil restante.',
    incluirNoLaudo: true,
  },
  {
    id: 'maq-03',
    tipo: 'Pulverizador Autopropelido',
    marca: 'Jacto',
    modelo: 'Uniport 3030',
    anoFabricacao: 2020,
    potenciaCapacidade: '243 cv / Barras 32 metros / Tanque 3.000 L',
    horimetroOuUso: '3.150 horas',
    estadoConservacao: 'bom',
    valorNovoBrl: 1850000,
    valorAtualMercadoBrl: 1220000,
    observacoes: 'Bicos com controle de abertura individual ponto a ponto e sistema de telemetria Otmis.',
    incluirNoLaudo: true,
  },
  {
    id: 'maq-04',
    tipo: 'Plantadeira Adubadeira de Precisão',
    marca: 'Kuhn',
    modelo: 'Estrela 24 Linhas (Espaçamento 45 cm)',
    anoFabricacao: 2022,
    potenciaCapacidade: '24 linhas / Dosadores pneumáticos a vácuo',
    horimetroOuUso: '2 safras operadas',
    estadoConservacao: 'excelente',
    valorNovoBrl: 720000,
    valorAtualMercadoBrl: 560000,
    observacoes: 'Linhas pantográficas de corte com corte de seção automático e caixa central de sementes.',
    incluirNoLaudo: true,
  },
  {
    id: 'maq-05',
    tipo: 'Pivô Central de Irrigação',
    marca: 'Valley',
    modelo: 'Série 8000 - 6 Torres Móveis',
    anoFabricacao: 2019,
    potenciaCapacidade: '72 hectares de lâmina d’água / Bomba KSB 125 cv',
    horimetroOuUso: 'Operação sazonal de inverno',
    estadoConservacao: 'bom',
    valorNovoBrl: 950000,
    valorAtualMercadoBrl: 650000,
    observacoes: 'Painel Icon10 de acionamento remoto via telemetria celular e outorga ativa.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 3. VEÍCULOS
// ==========================================
export const createDefaultVeiculos = (): PericiaAvaliacaoVeiculo[] => [
  {
    id: 'veic-01',
    tipo: 'Caminhão Graneleiro Traçado 6x4',
    marca: 'Volvo',
    modelo: 'FH 540 Globetrotter 6x4',
    anoModelo: '2021/2022',
    placaOuChassi: 'RBD-4J20',
    combustivel: 'Diesel S10',
    quilometragemOuEstado: '185.000 km • Bom estado',
    referenciaFipeBrl: 670000,
    valorAvaliadoBrl: 645000,
    observacoes: 'Engatado com caçamba basculante graneleira Randon 2021 com lona fácil para escoamento de grãos.',
    incluirNoLaudo: true,
  },
  {
    id: 'veic-02',
    tipo: 'Camionete 4x4 Cabine Dupla',
    marca: 'Toyota',
    modelo: 'Hilux SRX 2.8 4x4 Diesel Automática',
    anoModelo: '2022/2023',
    placaOuChassi: 'BRA-8F91',
    combustivel: 'Diesel S10',
    quilometragemOuEstado: '62.000 km • Excelente',
    referenciaFipeBrl: 245000,
    valorAvaliadoBrl: 238000,
    observacoes: 'Uso gerencial da fazenda, revisões em concessionária, protetor de caçamba e capota marítima.',
    incluirNoLaudo: true,
  },
  {
    id: 'veic-03',
    tipo: 'Utilitário de Campo / Operacional',
    marca: 'Fiat',
    modelo: 'Strada Endurance 1.4 Cabine Simples',
    anoModelo: '2021/2021',
    placaOuChassi: 'KLI-2980',
    combustivel: 'Flex',
    quilometragemOuEstado: '94.000 km • Regular',
    referenciaFipeBrl: 72000,
    valorAvaliadoBrl: 68000,
    observacoes: 'Veículo de apoio operacional e abastecimento de insumos com engate de reboque.',
    incluirNoLaudo: true,
  },
  {
    id: 'veic-04',
    tipo: 'Motocicleta Rural de Lida',
    marca: 'Honda',
    modelo: 'NXR 160 Bros ESD',
    anoModelo: '2022/2022',
    placaOuChassi: 'PRO-1144',
    combustivel: 'Flex',
    quilometragemOuEstado: '21.000 km • Bom estado',
    referenciaFipeBrl: 19500,
    valorAvaliadoBrl: 18500,
    observacoes: 'Utilizada pelo capataz para rondas de pastagens, fiscalização de bebedouros e cercas.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 4. SEMOVENTES
// ==========================================
export const createDefaultSemoventes = (): PericiaAvaliacaoSemovente[] => [
  {
    id: 'sem-01',
    especie: 'Bovino de Corte',
    categoria: 'Matrizes Adultas / Vacas Nelore Paridas e Prenhes',
    raca: 'Nelore / Aneloradas',
    quantidadeCabecas: 280,
    pesoMedioKgOuArrobas: '460 kg (15,3 @)',
    valorUnitarioCabecaBrl: 4200,
    valorTotalBrl: 1176000,
    finalidadeZootecnica: 'Cria comercial com inseminação artificial por IATF',
    observacoes: 'Plantel com alta precocidade reprodutiva, sanidade integral (brucelose e aftosa em dia).',
    incluirNoLaudo: true,
  },
  {
    id: 'sem-02',
    especie: 'Bovino de Corte',
    categoria: 'Bezerros Desmamados Machos e Fêmeas',
    raca: 'Cruzamento Industrial (Nelore x Angus)',
    quantidadeCabecas: 190,
    pesoMedioKgOuArrobas: '225 kg (7,5 @)',
    valorUnitarioCabecaBrl: 2400,
    valorTotalBrl: 456000,
    finalidadeZootecnica: 'Recria de alto desempenho',
    observacoes: 'Lote uniforme, idade média de 8 meses, castrados e desverminados.',
    incluirNoLaudo: true,
  },
  {
    id: 'sem-03',
    especie: 'Bovino de Corte',
    categoria: 'Novilhas Nelore P.O. de Reposição',
    raca: 'Nelore P.O. com RGN',
    quantidadeCabecas: 60,
    pesoMedioKgOuArrobas: '360 kg (12 @)',
    valorUnitarioCabecaBrl: 6500,
    valorTotalBrl: 390000,
    finalidadeZootecnica: 'Reposição de matrizes e melhoramento genético',
    observacoes: 'Fêmeas registradas na Associação Brasileira dos Criadores de Zebu (ABCZ).',
    incluirNoLaudo: true,
  },
  {
    id: 'sem-04',
    especie: 'Bovino de Corte',
    categoria: 'Touros Reprodutores Nelore P.O.',
    raca: 'Nelore Mocho P.O. (Avaliação Genealógica PMGZ)',
    quantidadeCabecas: 8,
    pesoMedioKgOuArrobas: '820 kg (27,3 @)',
    valorUnitarioCabecaBrl: 18000,
    valorTotalBrl: 144000,
    finalidadeZootecnica: 'Monta natural e repasse em lotes de IATF',
    observacoes: 'Touros com exame andrológico positivo e DEPs superiores para ganho de peso e carcaça.',
    incluirNoLaudo: true,
  },
  {
    id: 'sem-05',
    especie: 'Equino de Trabalho',
    categoria: 'Cavalos de Lida e Manejo de Gado',
    raca: 'Quarto de Milha Mestiço',
    quantidadeCabecas: 12,
    pesoMedioKgOuArrobas: '420 kg',
    valorUnitarioCabecaBrl: 6000,
    valorTotalBrl: 72000,
    finalidadeZootecnica: 'Trabalho de campo e manejo diário do gado',
    observacoes: 'Animais mansos de rédea, domados, com atestado negativo de mormo e anemia infecciosa.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 5. RECURSOS NATURAIS
// ==========================================
export const createDefaultRecursosNaturais = (): PericiaAvaliacaoRecursoNatural[] => [
  {
    id: 'rec-01',
    tipoRecurso: 'Excedente de Reserva Legal (CRA / Servidão Ambiental)',
    descricaoLocalizacao: 'Maciço florestal nativo preservado em bioma Cerrado/Mata Seca que excede o percentual obrigatório de 20% da propriedade.',
    volumeOuAreaEstimada: '145 hectares de excedente florestal',
    situacaoLicenciamento: 'Inscrito e homologado no CAR (Cadastro Ambiental Rural)',
    valorUnitarioBrl: 6500,
    valorTotalAvaliadoBrl: 942500,
    observacoes: 'Área com potencial para compensação ambiental de Reserva Legal de terceiros (Cotas de Reserva Ambiental - CRA) ou geração de créditos de carbono.',
    incluirNoLaudo: true,
  },
  {
    id: 'rec-02',
    tipoRecurso: 'Outorga de Captação de Recursos Hídricos Subterrâneos e Superficiais',
    descricaoLocalizacao: 'Direito de uso dos recursos hídricos com captação no Córrego Limítrofe com barramento licenciado para irrigação de pivô.',
    volumeOuAreaEstimada: 'Vazão contínua de 160.000 L/hora',
    situacaoLicenciamento: 'Portaria de Outorga de Direito de Uso vigente até 2032',
    valorUnitarioBrl: 220000,
    valorTotalAvaliadoBrl: 220000,
    observacoes: 'Garante a viabilidade da terceira safra (feijão/hortaliças no período seco) conferindo expressivo valor agregado à gleba.',
    incluirNoLaudo: true,
  },
  {
    id: 'rec-03',
    tipoRecurso: 'Jazida Mineral de Cascalho / Saibro para Uso Agropecuário',
    descricaoLocalizacao: 'Afloramento de cascalho laterítico no Talhão 08, utilizado para manutenção de estradas internas da fazenda.',
    volumeOuAreaEstimada: 'Reserva lavrável cubada de 28.000 m³',
    situacaoLicenciamento: 'Registro de Licença para Extração de Uso Próprio (Art. 2º da Lei 6.567/78)',
    valorUnitarioBrl: 14,
    valorTotalAvaliadoBrl: 392000,
    observacoes: 'Economia direta no cascalhamento de 22 km de estradas internas e pátios operacionais da propriedade.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 6. FRUTOS (SAFRAS PENDENTES / CULTURAS TEMPORÁRIAS)
// ==========================================
export const createDefaultFrutos = (): PericiaAvaliacaoFruto[] => [
  {
    id: 'fruto-01',
    cultura: 'Soja em Grãos (Safra de Verão)',
    areaCultivadaHa: 420,
    estagioVegetativo: 'R5.3 (Enchimento de grãos com 85 dias de ciclo emergido)',
    produtividadeEsperada: '68 sacas de 60 kg / hectare',
    metodoAvaliacao: 'custo_investido_invertido',
    custoInvestidoAteDataBrl: 2850000,
    valorEsperadoColheitaBrl: 3712800,
    valorAvaliadoBrl: 3120000,
    observacoes: 'Lavouras com excelente vigor vegetativo e stand uniforme de plantas, com 82% dos custos totais de produção já invertidos até a data pericial.',
    incluirNoLaudo: true,
  },
  {
    id: 'fruto-02',
    cultura: 'Milho Safrinha / Segunda Época',
    areaCultivadaHa: 180,
    estagioVegetativo: 'V4 a V6 (4 a 6 folhas desenvolvidas com 22 dias após emergência)',
    produtividadeEsperada: '105 sacas de 60 kg / hectare',
    metodoAvaliacao: 'custo_investido_invertido',
    custoInvestidoAteDataBrl: 640000,
    valorEsperadoColheitaBrl: 945000,
    valorAvaliadoBrl: 640000,
    observacoes: 'Custo de implantação (semente tratada, dessecação pré-plantio, adubação de base no sulco) integralmente contabilizado na data da perícia.',
    incluirNoLaudo: true,
  },
];

// ==========================================
// 7. DIREITOS E GRAVAMES
// ==========================================
export const createDefaultDireitos = (): PericiaAvaliacaoDireito[] => [
  {
    id: 'dir-01',
    tipoDireito: 'servidao_passagem',
    denominacao: 'Faixa de Servidão Administrativa de Linha de Transmissão de Energia Elétrica (LT 500 kV)',
    titularOuConcessionaria: 'Transmissora de Energia Sul-Sudeste S.A.',
    documentoRegistro: 'Averbada sob o AV-08 na Matrícula Imobiliária nº 14.820 do CRI Local',
    prazoVigencia: 'Servidão perpétua com faixa de segurança de 45 metros de largura',
    naturezaImpacto: 'negativo_gravame_desvalorizacao',
    valorAvaliadoBrl: 185000,
    detalhes: 'Ocupa área física de 4,8 hectares com restrição de cultivo sob os cabos condutores (impossibilidade de irrigação por pivô central e trânsito de colheitadeiras de grande porte sob a torre). Gravame depreciativo considerado.',
    incluirNoLaudo: true,
  },
  {
    id: 'dir-02',
    tipoDireito: 'contrato_arrendamento',
    denominacao: 'Contrato Ativo de Arrendamento Agrícola para Produção de Grãos',
    titularOuConcessionaria: 'Agropecuária Vale dos Ipês Ltda (Arrendatária)',
    documentoRegistro: 'Instrumento particular registrado em Cartório de Títulos e Documentos',
    prazoVigencia: 'Vigente por mais 3 safras agrícolas consecutivas (término em 2028/2029)',
    naturezaImpacto: 'positivo_valorizacao',
    valorAvaliadoBrl: 324000,
    detalhes: 'Arrendamento sobre 120 hectares gerando renda garantida de 18 sacas de soja/ha/ano, com adimplemento rigoroso e índice de capitalização favorável.',
    incluirNoLaudo: true,
  },
  {
    id: 'dir-03',
    tipoDireito: 'direito_minerario',
    denominacao: 'Requerimento de Pesquisa Mineral ANM nº 860.420/2022',
    titularOuConcessionaria: 'Mineração Vale do Cerrado S.A.',
    documentoRegistro: 'Processo Ativo junto à Agência Nacional de Mineração (ANM)',
    prazoVigencia: 'Alvará de Pesquisa válido por 3 anos',
    naturezaImpacto: 'neutro_informativo',
    valorAvaliadoBrl: 0,
    detalhes: 'Pesquisa mineral preliminar sem impacto nas atividades agropecuárias ou no valor de mercado nesta fase processual.',
    incluirNoLaudo: false,
  },
];

// ==========================================
// CALCULOS E TOTAIS CONSOLIDADOS
// ==========================================
export interface ResumoValoresImovelRural {
  valorTerraNuaBrl: number;
  valorBenfeitoriasBrl: number;
  valorMaquinasEquipamentosBrl: number;
  valorVeiculosBrl: number;
  valorSemoventesBrl: number;
  valorRecursosNaturaisBrl: number;
  valorFrutosBrl: number;
  valorDireitosBrl: number; // saldo líquido (positivos somam, negativos reduzem)
  valorTotalImovelBrl: number;
  
  // Contagens
  totalBenfeitorias: number;
  totalMaquinas: number;
  totalVeiculos: number;
  totalSemoventesCabecas: number;
  totalRecursos: number;
  totalFrutosHa: number;
  totalDireitos: number;

  // Percentuais no valor total
  percentTerraNua: number;
  percentBenfeitorias: number;
  percentMaquinas: number;
  percentVeiculos: number;
  percentSemoventes: number;
  percentRecursosNaturais: number;
  percentFrutos: number;
  percentDireitos: number;
}

export const calcularResumoValoresImovel = (
  avaliacao: PericiaAvaliacaoImovel,
  areaTotalImovelHa: number
): ResumoValoresImovelRural => {
  // 1. Terra Nua
  let valorTerraNua = 0;
  if (avaliacao.aproveitamentoTerras?.classesTerras && avaliacao.aproveitamentoTerras.classesTerras.length > 0) {
    valorTerraNua = avaliacao.aproveitamentoTerras.classesTerras.reduce(
      (acc, curr) => acc + (curr.valorTotalEstimadoBrl || 0),
      0
    );
  } else if (avaliacao.precificacaoTerraNua && avaliacao.precificacaoTerraNua.length > 0) {
    const unitValues = avaliacao.precificacaoTerraNua.map(item => {
      const area = item.areaTotalHa > 0 ? item.areaTotalHa : 1;
      return item.valorBrl / area;
    });
    const avg = unitValues.reduce((acc, curr) => acc + curr, 0) / unitValues.length;
    valorTerraNua = avg * (areaTotalImovelHa || 850);
  }

  // 2. Benfeitorias
  const benfeitoriasAtivas = avaliacao.incluirBenfeitorias !== false && avaliacao.benfeitorias
    ? avaliacao.benfeitorias.filter(b => b.incluirNoLaudo)
    : [];
  const valorBenfeitorias = benfeitoriasAtivas.reduce(
    (acc, curr) => acc + (curr.valorDepreciadoBrl || 0),
    0
  );

  // 3. Máquinas e Equipamentos
  const maquinasAtivas = avaliacao.incluirMaquinasEquipamentos !== false && avaliacao.maquinasEquipamentos
    ? avaliacao.maquinasEquipamentos.filter(m => m.incluirNoLaudo)
    : [];
  const valorMaquinas = maquinasAtivas.reduce(
    (acc, curr) => acc + (curr.valorAtualMercadoBrl || 0),
    0
  );

  // 4. Veículos
  const veiculosAtivos = avaliacao.incluirVeiculos !== false && avaliacao.veiculos
    ? avaliacao.veiculos.filter(v => v.incluirNoLaudo)
    : [];
  const valorVeiculos = veiculosAtivos.reduce(
    (acc, curr) => acc + (curr.valorAvaliadoBrl || 0),
    0
  );

  // 5. Semoventes
  const semoventesAtivos = avaliacao.incluirSemoventes !== false && avaliacao.semoventes
    ? avaliacao.semoventes.filter(s => s.incluirNoLaudo)
    : [];
  const valorSemoventes = semoventesAtivos.reduce(
    (acc, curr) => acc + (curr.valorTotalBrl || 0),
    0
  );
  const totalCabecas = semoventesAtivos.reduce((acc, curr) => acc + (curr.quantidadeCabecas || 0), 0);

  // 6. Recursos Naturais
  const recursosAtivos = avaliacao.incluirRecursosNaturais !== false && avaliacao.recursosNaturais
    ? avaliacao.recursosNaturais.filter(r => r.incluirNoLaudo)
    : [];
  const valorRecursos = recursosAtivos.reduce(
    (acc, curr) => acc + (curr.valorTotalAvaliadoBrl || 0),
    0
  );

  // 7. Frutos
  const frutosAtivos = avaliacao.incluirFrutos !== false && avaliacao.frutos
    ? avaliacao.frutos.filter(f => f.incluirNoLaudo)
    : [];
  const valorFrutos = frutosAtivos.reduce(
    (acc, curr) => acc + (curr.valorAvaliadoBrl || 0),
    0
  );
  const totalFrutosHa = frutosAtivos.reduce((acc, curr) => acc + (curr.areaCultivadaHa || 0), 0);

  // 8. Direitos
  const direitosAtivos = avaliacao.incluirDireitos !== false && avaliacao.direitos
    ? avaliacao.direitos.filter(d => d.incluirNoLaudo)
    : [];
  let valorDireitos = 0;
  direitosAtivos.forEach(d => {
    if (d.naturezaImpacto === 'positivo_valorizacao') {
      valorDireitos += d.valorAvaliadoBrl || 0;
    } else if (d.naturezaImpacto === 'negativo_gravame_desvalorizacao') {
      valorDireitos -= d.valorAvaliadoBrl || 0;
    }
  });

  const valorTotalImovel = Math.max(
    0,
    valorTerraNua +
      valorBenfeitorias +
      valorMaquinas +
      valorVeiculos +
      valorSemoventes +
      valorRecursos +
      valorFrutos +
      valorDireitos
  );

  const calcPercent = (val: number) => {
    if (valorTotalImovel <= 0) return 0;
    return Math.round((Math.max(0, val) / valorTotalImovel) * 1000) / 10;
  };

  return {
    valorTerraNuaBrl: valorTerraNua,
    valorBenfeitoriasBrl: valorBenfeitorias,
    valorMaquinasEquipamentosBrl: valorMaquinas,
    valorVeiculosBrl: valorVeiculos,
    valorSemoventesBrl: valorSemoventes,
    valorRecursosNaturaisBrl: valorRecursos,
    valorFrutosBrl: valorFrutos,
    valorDireitosBrl: valorDireitos,
    valorTotalImovelBrl: valorTotalImovel,

    totalBenfeitorias: benfeitoriasAtivas.length,
    totalMaquinas: maquinasAtivas.length,
    totalVeiculos: veiculosAtivos.length,
    totalSemoventesCabecas: totalCabecas,
    totalRecursos: recursosAtivos.length,
    totalFrutosHa: totalFrutosHa,
    totalDireitos: direitosAtivos.length,

    percentTerraNua: calcPercent(valorTerraNua),
    percentBenfeitorias: calcPercent(valorBenfeitorias),
    percentMaquinas: calcPercent(valorMaquinas),
    percentVeiculos: calcPercent(valorVeiculos),
    percentSemoventes: calcPercent(valorSemoventes),
    percentRecursosNaturais: calcPercent(valorRecursos),
    percentFrutos: calcPercent(valorFrutos),
    percentDireitos: calcPercent(valorDireitos),
  };
};

// ==========================================
// 9. INVENTÁRIO DE ATIVOS UNIFICADO (MÁQUINAS, EQUIPAMENTOS E VEÍCULOS)
// ==========================================
export const createDefaultInventarioAtivos = (): PericiaAtivoInventario[] => [
  // MÁQUINAS
  {
    id: 'ativo-maq-01',
    categoria: 'maquina',
    subtipo: 'Colheitadeira de Grãos',
    marca: 'Case IH',
    modelo: 'Axial-Flow 7250 Automation',
    numeroSerie: 'YNG029148-BR',
    placaOuRegistro: 'RENAVAM 0129384812 / Frota #01',
    anoFabricacao: 2022,
    anoModelo: '2022/2022',
    horimetroOuKm: '1.420 horas',
    potenciaCapacidade: '468 cv • Plataforma Draper 35 pés',
    combustivel: 'Diesel S10',
    estadoConservacao: 'excelente',
    valorNovoReposicaoBrl: 3450000,
    valorMercadoAtualizadoBrl: 2680000,
    referenciaMercado: 'Pesquisa Concessionária Pivot Case IH & Molicar',
    localizacaoFisica: 'Galpão Principal - Sede',
    statusOperacional: 'em_operacao',
    fotoUrl: 'https://images.unsplash.com/photo-1592985708470-a26df1cc7181?w=700&auto=format&fit=crop&q=80',
    observacoes: 'Equipamento com piloto automático AFS Pro 700, esteiras com 85% de borracha, manutenções 100% comprovadas em concessionária.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-maq-02',
    categoria: 'maquina',
    subtipo: 'Trator de Pneus Agrícola',
    marca: 'John Deere',
    modelo: '7230J 4WD',
    numeroSerie: '1BM7230JALC019842',
    placaOuRegistro: 'Patrimônio #TR-04',
    anoFabricacao: 2021,
    anoModelo: '2021/2021',
    horimetroOuKm: '2.890 horas',
    potenciaCapacidade: '230 cv • Rodado Duplo Traseiro',
    combustivel: 'Diesel S10',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 1180000,
    valorMercadoAtualizadoBrl: 840000,
    referenciaMercado: 'Cotação Maqnelson John Deere Set/2024',
    localizacaoFisica: 'Talhão 04 - Em operação de preparo',
    statusOperacional: 'em_operacao',
    fotoUrl: 'https://images.unsplash.com/photo-1592985708470-a26df1cc7181?w=700&auto=format&fit=crop&q=80',
    observacoes: 'Pneus dianteiros novos (90%) e traseiros com 65%. Sem vazamentos no bloco ou comando hidráulico.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-maq-03',
    categoria: 'maquina',
    subtipo: 'Pulverizador Autopropelido',
    marca: 'Jacto',
    modelo: 'Uniport 3030',
    numeroSerie: 'JAC-3030-2020-0491',
    placaOuRegistro: 'Patrimônio #PV-01',
    anoFabricacao: 2020,
    anoModelo: '2020/2020',
    horimetroOuKm: '3.150 horas',
    potenciaCapacidade: '243 cv • Barras 32 m • Tanque 3.000 L',
    combustivel: 'Diesel',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 1850000,
    valorMercadoAtualizadoBrl: 1220000,
    referenciaMercado: 'Tabela de Usados Jacto e Revendas GO',
    localizacaoFisica: 'Pátio de Abastecimento - Sede',
    statusOperacional: 'em_operacao',
    observacoes: 'Bicos com corte bico a bico PWM e GPS Otmis. Bomba centrífuga de pulverização revisada.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-maq-04',
    categoria: 'maquina',
    subtipo: 'Trator Médio de Apoio',
    marca: 'Massey Ferguson',
    modelo: 'MF 6713 Dyna-4',
    numeroSerie: 'MF6713-BR-99014',
    placaOuRegistro: 'Patrimônio #TR-02',
    anoFabricacao: 2019,
    anoModelo: '2019/2019',
    horimetroOuKm: '4.800 horas',
    potenciaCapacidade: '135 cv • 4x4',
    combustivel: 'Diesel',
    estadoConservacao: 'regular',
    valorNovoReposicaoBrl: 520000,
    valorMercadoAtualizadoBrl: 330000,
    referenciaMercado: 'Média de mercado Centro-Oeste / Balcão Agrícola',
    localizacaoFisica: 'Oficina da Fazenda',
    statusOperacional: 'em_manutencao',
    observacoes: 'Em manutenção preventiva programada do sincronizador de marchas. Estrutura mecânica íntegra.',
    incluirNoLaudo: true,
  },

  // EQUIPAMENTOS
  {
    id: 'ativo-eq-01',
    categoria: 'equipamento',
    subtipo: 'Plantadeira Adubadeira de Precisão',
    marca: 'Kuhn',
    modelo: 'Estrela 24 Linhas (45 cm)',
    numeroSerie: 'KH-EST24-2022-811',
    placaOuRegistro: 'Patrimônio #PL-01',
    anoFabricacao: 2022,
    anoModelo: '2022/2022',
    horimetroOuKm: '2 safras operadas (~1.600 ha)',
    potenciaCapacidade: '24 linhas pneumáticas a vácuo',
    combustivel: 'Acionamento Hidráulico / Isobus',
    estadoConservacao: 'excelente',
    valorNovoReposicaoBrl: 720000,
    valorMercadoAtualizadoBrl: 560000,
    referenciaMercado: 'Tabela de Implementos Kuhn Brasil 2024',
    localizacaoFisica: 'Galpão de Implementos',
    statusOperacional: 'em_operacao',
    observacoes: 'Linhas pantográficas sem folgas, discos de corte com 85% de diâmetro e caixas de semente íntegras.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-eq-02',
    categoria: 'equipamento',
    subtipo: 'Pivô Central de Irrigação',
    marca: 'Valley',
    modelo: 'Série 8000 - 6 Torres Móveis',
    numeroSerie: 'VAL-8000-6T-2019-14',
    placaOuRegistro: 'Outorga ANA/SEMA #1849/2019',
    anoFabricacao: 2019,
    anoModelo: '2019/2019',
    horimetroOuKm: 'Operação sazonal (aprox. 3.200 h acumuladas)',
    potenciaCapacidade: 'Área irrigada: 72 ha • Conjunto Moto-Bomba 125 cv',
    combustivel: 'Energia Elétrica Trifásica 380V',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 950000,
    valorMercadoAtualizadoBrl: 650000,
    referenciaMercado: 'Orçamento Valmont Valley 2024 depreciado',
    localizacaoFisica: 'Gleba Sul - Pivô 01',
    statusOperacional: 'em_operacao',
    observacoes: 'Pneu das torres calibrados, vãos sem deformação estrutural, aspersores rotatórios I-Wob funcionais.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-eq-03',
    categoria: 'equipamento',
    subtipo: 'Grade Aradora Intermediária Pesada',
    marca: 'Marchesan / Tatu',
    modelo: 'GAPCR 28 Discos x 32"',
    numeroSerie: 'TATU-GAPCR-2021-098',
    placaOuRegistro: 'Patrimônio #GD-03',
    anoFabricacao: 2021,
    anoModelo: '2021/2021',
    horimetroOuKm: '3 safras de uso',
    potenciaCapacidade: '28 discos recortados de 32" • Eixo 2.1/8"',
    combustivel: 'Acoplamento barra de tração',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 180000,
    valorMercadoAtualizadoBrl: 135000,
    referenciaMercado: 'Revendas Autorizadas Marchesan GO',
    localizacaoFisica: 'Galpão de Implementos',
    statusOperacional: 'em_operacao',
    observacoes: 'Mancais a banho de óleo revisados sem folga axial. Discos com desgaste uniforme inferior a 15%.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-eq-04',
    categoria: 'equipamento',
    subtipo: 'Distribuidor de Calcário e Adubo',
    marca: 'Stara',
    modelo: 'Bruttus 12000 por Gravidade',
    numeroSerie: 'STA-BRU12K-2021-44',
    placaOuRegistro: 'Patrimônio #DIST-02',
    anoFabricacao: 2021,
    anoModelo: '2021/2021',
    horimetroOuKm: '3 safras de uso',
    potenciaCapacidade: 'Capacidade 12.000 kg • Faixa 6,7 m',
    combustivel: 'Tração trator',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 210000,
    valorMercadoAtualizadoBrl: 155000,
    referenciaMercado: 'Cotações Stara Centro-Oeste',
    localizacaoFisica: 'Galpão de Implementos',
    statusOperacional: 'em_operacao',
    observacoes: 'Esteiras de distribuição de borracha íntegras, reservatório sem corrosão por fertilizantes.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-eq-05',
    categoria: 'equipamento',
    subtipo: 'Grupo Gerador a Diesel Silenciado',
    marca: 'Stemac',
    modelo: '150 kVA Motor Cummins C-Series',
    numeroSerie: 'STM-150-CUM-2018-77',
    placaOuRegistro: 'Patrimônio #GER-01',
    anoFabricacao: 2018,
    anoModelo: '2018/2018',
    horimetroOuKm: '850 horas de emergência',
    potenciaCapacidade: '150 kVA Standby / 135 kVA Prime • Trifásico 380/220V',
    combustivel: 'Diesel',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 140000,
    valorMercadoAtualizadoBrl: 95000,
    referenciaMercado: 'Mercado de geradores de energia usados SP/GO',
    localizacaoFisica: 'Casa de Força - Sede',
    statusOperacional: 'em_operacao',
    observacoes: 'Quadro de transferência automática (QTA) em perfeito funcionamento, bateria trocada em 2025.',
    incluirNoLaudo: true,
  },

  // VEÍCULOS
  {
    id: 'ativo-veic-01',
    categoria: 'veiculo',
    subtipo: 'Caminhão Graneleiro Traçado 6x4',
    marca: 'Volvo',
    modelo: 'FH 540 Globetrotter 6x4',
    numeroSerie: '9BVFH540NZB881920',
    placaOuRegistro: 'Placa: RBD-4J20 • RENAVAM 0128491823',
    anoFabricacao: 2021,
    anoModelo: '2021/2022',
    horimetroOuKm: '185.000 km',
    potenciaCapacidade: '540 cv • Bitrem Graneleiro Randon',
    combustivel: 'Diesel S10',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 980000,
    valorMercadoAtualizadoBrl: 645000,
    referenciaMercado: 'Tabela FIPE Código 524031-1 (Ref. Set/2024: R$ 670.000)',
    localizacaoFisica: 'Garagem de Veículos Pesados',
    statusOperacional: 'em_operacao',
    observacoes: 'Com caçamba graneleira Randon 2021. Pneus recapados em 1º ciclo na tração e novos na direção.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-veic-02',
    categoria: 'veiculo',
    subtipo: 'Camionete 4x4 Cabine Dupla',
    marca: 'Toyota',
    modelo: 'Hilux SRX 2.8 16V 4x4 Automática',
    numeroSerie: '8AJBA3CD4P0912441',
    placaOuRegistro: 'Placa: BRA-8F91 • RENAVAM 0134928114',
    anoFabricacao: 2022,
    anoModelo: '2022/2023',
    horimetroOuKm: '62.000 km',
    potenciaCapacidade: '204 cv • Capacidade de Carga 1.000 kg',
    combustivel: 'Diesel S10',
    estadoConservacao: 'excelente',
    valorNovoReposicaoBrl: 330000,
    valorMercadoAtualizadoBrl: 238000,
    referenciaMercado: 'Tabela FIPE Código 002164-4 (Ref. Set/2024: R$ 245.000)',
    localizacaoFisica: 'Sede da Fazenda / Uso Gerencial',
    statusOperacional: 'em_operacao',
    observacoes: 'Veículo exclusivo de gerência agronômica. Todas as revisões registradas no manual do proprietário.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-veic-03',
    categoria: 'veiculo',
    subtipo: 'Utilitário de Campo / Operacional',
    marca: 'Fiat',
    modelo: 'Strada Endurance 1.4 Fire Cabine Simples',
    numeroSerie: '9BD28104AM8839120',
    placaOuRegistro: 'Placa: KLI-2980 • RENAVAM 0119837190',
    anoFabricacao: 2021,
    anoModelo: '2021/2021',
    horimetroOuKm: '94.000 km',
    potenciaCapacidade: '88 cv • Caçamba com Protetor',
    combustivel: 'Flex (Etanol/Gasolina)',
    estadoConservacao: 'regular',
    valorNovoReposicaoBrl: 105000,
    valorMercadoAtualizadoBrl: 68000,
    referenciaMercado: 'Tabela FIPE Código 001538-5 (Ref. Set/2024: R$ 72.000)',
    localizacaoFisica: 'Apoio da Lavoura / Abastecimento',
    statusOperacional: 'em_operacao',
    observacoes: 'Veículo de apoio de campo com pequenos amassados na lateral direita da caçamba; mecânica funcional.',
    incluirNoLaudo: true,
  },
  {
    id: 'ativo-veic-04',
    categoria: 'veiculo',
    subtipo: 'Motocicleta de Lida Rural',
    marca: 'Honda',
    modelo: 'NXR 160 Bros ESD',
    numeroSerie: '9C2KD0810NR004192',
    placaOuRegistro: 'Placa: PRO-1144 • RENAVAM 0122948110',
    anoFabricacao: 2022,
    anoModelo: '2022/2022',
    horimetroOuKm: '21.000 km',
    potenciaCapacidade: '162 cc • Partida Elétrica',
    combustivel: 'Flex',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 22000,
    valorMercadoAtualizadoBrl: 16500,
    referenciaMercado: 'Tabela FIPE Código 811124-7 (Ref. Set/2024: R$ 17.200)',
    localizacaoFisica: 'Curral / Retiro 02',
    statusOperacional: 'em_operacao',
    observacoes: 'Utilizada para conferência de cerca e manejo de pastagem. Pneus tipo misto em bom estado.',
    incluirNoLaudo: true,
  },
];

// Helper to convert unified Ativos into legacy Maquinas and Veiculos for backward compatibility
export const sincronizarInventarioParaComponentes = (
  ativos: PericiaAtivoInventario[]
): {
  maquinas: PericiaAvaliacaoMaquinaEquipamento[];
  veiculos: PericiaAvaliacaoVeiculo[];
} => {
  const maquinas: PericiaAvaliacaoMaquinaEquipamento[] = ativos
    .filter(a => a.categoria === 'maquina' || a.categoria === 'equipamento')
    .map(a => ({
      id: a.id,
      tipo: a.subtipo,
      marca: a.marca,
      modelo: a.modelo,
      numeroSerie: a.numeroSerie,
      anoFabricacao: a.anoFabricacao,
      potenciaCapacidade: a.potenciaCapacidade,
      horimetroOuUso: a.horimetroOuKm,
      estadoConservacao:
        a.estadoConservacao === 'excelente'
          ? 'excelente'
          : a.estadoConservacao === 'regular'
          ? 'regular'
          : a.estadoConservacao === 'sucateado'
          ? 'sucateado'
          : 'bom',
      valorNovoBrl: a.valorNovoReposicaoBrl,
      valorAtualMercadoBrl: a.valorMercadoAtualizadoBrl,
      observacoes: a.observacoes,
      incluirNoLaudo: a.incluirNoLaudo,
    }));

  const veiculos: PericiaAvaliacaoVeiculo[] = ativos
    .filter(a => a.categoria === 'veiculo')
    .map(a => ({
      id: a.id,
      tipo: a.subtipo,
      marca: a.marca,
      modelo: a.modelo,
      numeroSerie: a.numeroSerie,
      anoModelo: a.anoModelo || `${a.anoFabricacao}/${a.anoFabricacao}`,
      placaOuChassi: a.placaOuRegistro || a.numeroSerie,
      combustivel: a.combustivel,
      quilometragemOuEstado: `${a.horimetroOuKm || ''} • ${a.estadoConservacao}`.trim(),
      referenciaFipeBrl: a.valorNovoReposicaoBrl ? Math.round(a.valorMercadoAtualizadoBrl * 1.05) : undefined,
      valorAvaliadoBrl: a.valorMercadoAtualizadoBrl,
      observacoes: a.observacoes,
      incluirNoLaudo: a.incluirNoLaudo,
    }));

  return { maquinas, veiculos };
};

// Helper to convert existing Maquinas and Veiculos into unified Ativos
export const converterMaquinasEVeiculosParaAtivos = (
  maquinas: PericiaAvaliacaoMaquinaEquipamento[] = [],
  veiculos: PericiaAvaliacaoVeiculo[] = []
): PericiaAtivoInventario[] => {
  const ativosMaq: PericiaAtivoInventario[] = maquinas.map((m, idx) => {
    const isEquipamento =
      m.tipo.toLowerCase().includes('implemento') ||
      m.tipo.toLowerCase().includes('plantadeira') ||
      m.tipo.toLowerCase().includes('grade') ||
      m.tipo.toLowerCase().includes('pivô') ||
      m.tipo.toLowerCase().includes('distribuidor') ||
      m.tipo.toLowerCase().includes('gerador') ||
      m.tipo.toLowerCase().includes('bomba');

    return {
      id: m.id || `ativo-maq-${idx + 1}`,
      categoria: isEquipamento ? 'equipamento' : 'maquina',
      subtipo: m.tipo,
      marca: m.marca,
      modelo: m.modelo,
      numeroSerie: m.numeroSerie || `SER-${m.anoFabricacao || 2022}-${(idx + 1).toString().padStart(4, '0')}`,
      placaOuRegistro: `Patrimônio #${(idx + 1).toString().padStart(3, '0')}`,
      anoFabricacao: m.anoFabricacao || 2021,
      anoModelo: `${m.anoFabricacao || 2021}/${m.anoFabricacao || 2021}`,
      horimetroOuKm: m.horimetroOuUso || '1.800 horas',
      potenciaCapacidade: m.potenciaCapacidade,
      estadoConservacao: m.estadoConservacao === 'sucateado' ? 'sucateado' : m.estadoConservacao,
      valorNovoReposicaoBrl: m.valorNovoBrl || Math.round(m.valorAtualMercadoBrl * 1.3),
      valorMercadoAtualizadoBrl: m.valorAtualMercadoBrl || 0,
      statusOperacional: m.estadoConservacao === 'sucateado' ? 'inoperante' : 'em_operacao',
      observacoes: m.observacoes,
      incluirNoLaudo: m.incluirNoLaudo !== false,
    };
  });

  const ativosVeic: PericiaAtivoInventario[] = veiculos.map((v, idx) => ({
    id: v.id || `ativo-veic-${idx + 1}`,
    categoria: 'veiculo',
    subtipo: v.tipo,
    marca: v.marca,
    modelo: v.modelo,
    numeroSerie: v.numeroSerie || v.placaOuChassi || `CHASS-${idx + 1}`,
    placaOuRegistro: v.placaOuChassi ? `Placa / Chassi: ${v.placaOuChassi}` : undefined,
    anoFabricacao: parseInt(v.anoModelo?.split('/')[0] || '2021', 10) || 2021,
    anoModelo: v.anoModelo,
    horimetroOuKm: v.quilometragemOuEstado,
    combustivel: v.combustivel,
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: v.referenciaFipeBrl || Math.round(v.valorAvaliadoBrl * 1.1),
    valorMercadoAtualizadoBrl: v.valorAvaliadoBrl || 0,
    referenciaMercado: v.referenciaFipeBrl ? `Tabela FIPE (R$ ${v.referenciaFipeBrl.toLocaleString('pt-BR')})` : undefined,
    statusOperacional: 'em_operacao',
    observacoes: v.observacoes,
    incluirNoLaudo: v.incluirNoLaudo !== false,
  }));

  return [...ativosMaq, ...ativosVeic];
};

// Helper to estimate realistic market depreciation based on age and conservation state
export const estimarValorMercadoAtivo = (
  valorNovo: number,
  anoFabricacao: number,
  estadoConservacao: EstadoConservacaoAtivo,
  categoria: CategoriaAtivoRural
): {
  depreciacaoPercent: number;
  valorEstimadoBrl: number;
  fatorConservacao: number;
} => {
  const currentYear = new Date().getFullYear();
  const idade = Math.max(0, currentYear - anoFabricacao);

  const taxaAnual = categoria === 'veiculo' ? 0.09 : 0.07;
  const depreciacaoIdade = Math.min(0.70, idade * taxaAnual);

  let fatorConservacao = 1.0;
  switch (estadoConservacao) {
    case 'novo':
      fatorConservacao = 1.05;
      break;
    case 'excelente':
      fatorConservacao = 1.00;
      break;
    case 'bom':
      fatorConservacao = 0.90;
      break;
    case 'regular':
      fatorConservacao = 0.75;
      break;
    case 'reparos_necessarios':
      fatorConservacao = 0.55;
      break;
    case 'sucateado':
      fatorConservacao = 0.20;
      break;
  }

  const fatorResidualTotal = Math.max(0.08, (1 - depreciacaoIdade) * fatorConservacao);
  const valorEstimadoBrl = Math.round(valorNovo * fatorResidualTotal);
  const depreciacaoPercent = Math.round((1 - valorEstimadoBrl / valorNovo) * 1000) / 10;

  return {
    depreciacaoPercent: Math.max(0, depreciacaoPercent),
    valorEstimadoBrl,
    fatorConservacao,
  };
};
