export type PericiaStatus =
  | 'aberta'
  | 'planejamento'
  | 'aguardando_vistoria'
  | 'em_analise'
  | 'em_calculo'
  | 'aguardando_documentacao'
  | 'laudo_elaboracao'
  | 'concluida'
  | 'arquivada';

export type TipoPericia =
  | 'agronomica'
  | 'agricola'
  | 'ambiental'
  | 'producao'
  | 'danos'
  | 'perdas'
  | 'maquinas'
  | 'imovel_rural'
  | 'benfeitorias'
  | 'seguro_rural'
  | 'judicial'
  | 'extrajudicial'
  | 'assistencia_tecnica'
  | 'vistoria_tecnica'
  | 'outros';

export interface PericiaParteEnvolvida {
  id: string;
  nome: string;
  cpfCnpj: string;
  contato: string;
  endereco: string;
  papel:
    | 'contratante'
    | 'proprietario'
    | 'produtor'
    | 'causador'
    | 'seguradora'
    | 'banco'
    | 'parte_autora'
    | 'parte_rea'
    | 'assistente_tecnico'
    | 'testemunha'
    | 'outros';
  observacoes?: string;
}

export interface PericiaQuesito {
  id: string;
  numero: number;
  pergunta: string;
  resposta: string;
  evidenciaVinculadaId?: string;
  documentoVinculadoId?: string;
  observacoes?: string;
  respondido: boolean;
}

export interface PericiaDocumentoInicial {
  id: string;
  nome: string;
  tipo:
    | 'contrato'
    | 'nota_fiscal'
    | 'receita_agronomica'
    | 'mapa'
    | 'doc_imovel'
    | 'analise_lab'
    | 'laudo_anterior'
    | 'comercializacao'
    | 'seguro'
    | 'registro_aplicacao'
    | 'fotografia'
    | 'outro';
  data: string;
  fonte: string;
  descricao: string;
  arquivoNome?: string;
  observacoes?: string;
}

export interface PericiaCoordenadas {
  lat: number;
  lng: number;
  altitude?: number;
  precisaoMeters?: number;
}

export interface PericiaPontoGPS {
  id: string;
  identificador: string; // Ex: V01, P01, M01, Ponto A
  descricao?: string;
  tipo: 'vertice_perimetro' | 'ponto_amostra' | 'foto' | 'marco_fisico' | 'sede' | 'outro';
  lat: number;
  lng: number;
  altitude?: number;
  precisaoMeters?: number;
}

export interface PericiaGeorreferenciamento {
  sistemaReferencia: string; // "SIRGAS 2000", "WGS 84", etc.
  fusoUtm?: string; // Ex: "Fuso 22S", "Fuso 23S"
  centroide: PericiaCoordenadas;
  pontos: PericiaPontoGPS[];
  arquivoImportadoNome?: string;
  arquivoImportadoTipo?: 'kml' | 'kmz' | 'geojson' | 'gpx' | 'csv' | 'manual';
  areaCalculadaHa?: number;
  perimetroCalculadoMeters?: number;
  observacoesGeodesicas?: string;
}

export interface PericiaVistoria {
  id: string;
  data: string;
  hora: string;
  responsavel: string;
  local: string;
  coordenadas: PericiaCoordenadas;
  condicoesClimaticas: {
    temperaturaC: number;
    umidadePercent: number;
    chuvaRecente: string;
    vento: string;
    condicaoSolo: string;
  };
  cultura: string;
  cultivar: string;
  estagioFenologico: string;
  areaVistoriadaHa: number;
  objetivo: string;
  observacoes: string;
}

export interface PericiaFotografia {
  id: string;
  numero: number;
  data: string;
  hora: string;
  coordenadas: PericiaCoordenadas;
  local: string;
  descricao: string;
  talhao: string;
  tipoEvidencia:
    | 'planta_afetada'
    | 'lesao'
    | 'sintoma'
    | 'area_danificada'
    | 'estrutura'
    | 'maquina'
    | 'outros';
  fotoUrl: string;
  tagsAnotacao: string[];
}

export interface PericiaAudioVideo {
  id: string;
  tipo: 'audio' | 'video';
  titulo: string;
  data: string;
  hora: string;
  local: string;
  usuario: string;
  descricao: string;
  url?: string;
}

export interface PericiaAmostra {
  id: string;
  codigo: string;
  data: string;
  hora: string;
  coordenadas: PericiaCoordenadas;
  talhao: string;
  profundidadeCm?: string;
  material:
    | 'solo'
    | 'folha'
    | 'planta'
    | 'fruto'
    | 'agua'
    | 'nematoides'
    | 'fitopatologia'
    | 'entomologia'
    | 'outro';
  responsavel: string;
  laboratorio: string;
  resultado: string;
  observacoes?: string;
}

export interface PericiaChecklistFieldItem {
  id: string;
  item: string;
  concluido: boolean;
  categoria: string;
  observacao?: string;
}

export interface PericiaFieldDiaryItem {
  id: string;
  hora: string;
  data: string;
  atividade: string;
  usuario: string;
  observacao: string;
}

export interface PericiaEvidenceItem {
  id: string;
  codigoUnico: string;
  fato: string;
  fonte: string;
  local: string;
  data: string;
  tipoRef: 'foto' | 'documento' | 'amostra' | 'audio_video' | 'outro';
  refId?: string;
  analise: string;
  calculoAssociadoId?: string;
  quesitoAssociadoId?: string;
  conclusao: string;
}

export interface PericiaHipoteseTecnica {
  id: string;
  descricao: string;
  evidenciasSustentacao: string[];
  probabilidade: 'alta' | 'media' | 'baixa' | 'descartada';
  status: 'em_investigacao' | 'confirmada' | 'descartada';
}

export interface PericiaAnaliseTecnica {
  caracterizacaoCultura: {
    cultura: string;
    cultivar: string;
    areaHa: number;
    idadeOuCiclo: string;
    estagioFenologico: string;
    populacaoPlantasHa: number;
    espacamento: string;
    sistemaCultivo: string;
    historicoManejo: string;
    produtividadeEsperadaKgHa: number;
    produtividadeObservadaKgHa: number;
  };
  analiseSoloNutricao: {
    phCaCl2: number;
    materiaOrganicaPercent: number;
    fosforoP: number;
    potassioK: number;
    calcioCa: number;
    magnesioMg: number;
    ctc: number;
    vPercent: number;
    mPercent: number;
    compactacaoSolo: string;
    observacoes: string;
    // Campos complementares de análise laboratorial de solo
    laboratorio?: string;
    numeroLaudo?: string;
    dataColeta?: string;
    profundidadeAmostra?: string;
    texturaSolo?: string;
    teorArgilaPercent?: number;
    aluminioAl?: number;
    hMaisAl?: number;
    enxofreS?: number;
    somaBases?: number;
    drenagemSolo?: string;
    parecerFertilidade?: string;
  };
  hipotesesTecnicas: PericiaHipoteseTecnica[];
  fitotoxicidade: {
    possuiFitotoxicidade: boolean;
    produtoUtilizado: string;
    ingredienteAtivo: string;
    doseAplicada: string;
    dataAplicacao: string;
    equipamentoUtilizado: string;
    climaNaAplicacao: string;
    sintomasConstatados: string;
    distribuicaoSintomas: string;
    areaAfetadaHa: number;
    historicoDerivaOuCalda: string;
  };
  pragasEDoencas: {
    id: string;
    nome: string;
    tipo: 'praga' | 'doenca';
    incidênciaPercent: number;
    severidadePercent: number;
    distribuicao: string;
    areaAfetadaHa: number;
    sintomas: string;
  }[];
  climaEventosAdversos: {
    id: string;
    tipoEvento: 'geada' | 'granizo' | 'seca' | 'chuva_excessiva' | 'alagamento' | 'vendaval' | 'queimada' | 'raio' | 'outro';
    dataEvento: string;
    intensidade: string;
    fonteDados: string;
    descricao: string;
  }[];
  irrigacao: {
    possuiIrrigacao: boolean;
    sistema: string;
    vazaoLh: string;
    pressaoBar: string;
    uniformidadePercent: number;
    falhasConstatadas: string;
  };
  diagnosticoEstruturado: {
    observacaoGeral: string;
    evidenciaChave: string;
    dadoTecnicoBase: string;
    analiseCausal: string;
    conclusaoTecnicaPreliminar: string;
  };
}

export interface PericiaCustosAdicionais {
  id: string;
  item: string;
  valorBrl: number;
  descricao: string;
}

export interface PericiaValoracaoAtivo {
  id: string;
  item: string;
  categoria: 'terra' | 'cultura' | 'benfeitoria' | 'maquina' | 'animal' | 'floresta' | 'outro';
  valorAvaliadoBrl: number;
  justificativa: string;
}

export interface PericiaDepreciacaoItem {
  id: string;
  bem: string;
  idadeAnos: number;
  vidaUtilAnos: number;
  estadoConservacao: 'excelente' | 'bom' | 'regular' | 'ruim' | 'pessimo';
  valorNovoBrl: number;
  valorResidualBrl: number;
  percentualDepreciacao: number;
  valorDepreciadoBrl: number;
  metodoJustificativa: string;
}

export interface PericiaScenarioValues {
  producaoKg: number;
  receitaBrl: number;
  custoBrl: number;
  margemBrl: number;
}

export interface PericiaMemoriaCalculo {
  id: string;
  tituloFormula: string;
  formulaExpressao: string;
  variaveis: Record<string, string | number>;
  resultadoFormatado: string;
  metodologia: string;
  fonteDados: string;
  dataCalculo: string;
}

export type PericiaCalculoDanos = PericiaCalculosDanosValoracao;
export type PericiaLaudoOficial = PericiaEncerramentoLaudo;

export interface PericiaCalculosDanosValoracao {
  tipoDanoPredominante: string;
  areaTotalHa: number;
  areaAfetadaHa: number;
  areaTotalAfetadaHa?: number;
  percentualAreaAfetada: number;
  severidadeMediaPercent: number;
  produtividadeEsperadaKgHa: number;
  produtividadeObservadaKgHa: number;
  produtividadeEsperadaSacasHa?: number;
  produtividadeObtidaSacasHa?: number;
  precoUnitarioSacaBrl?: number;
  perdaTotalSacas?: number;
  valorPerdaProducaoBrl?: number;
  danoEmergenteTotalBrl?: number;
  lucrosCessantesTotalBrl?: number;
  custosAdicionaisBrl?: number;
  custoReimplantioBrl?: number;
  perdaFisicaKgHa: number;
  perdaFisicaTotalKg: number;
  valorUnitarioBrlPorKg: number;
  perdaFinanceiraTotalBrl: number;
  custosAdicionais: PericiaCustosAdicionais[];
  totalCustosAdicionaisBrl: number;
  valoracaoAtivos: PericiaValoracaoAtivo[];
  depreciacaoItens: PericiaDepreciacaoItem[];
  cenarios: {
    esperado: PericiaScenarioValues;
    observado: PericiaScenarioValues;
    comRecuperacao: PericiaScenarioValues;
    perdaTotal: PericiaScenarioValues;
  };
  memoriaCalculo: PericiaMemoriaCalculo[];
  memoriaCalculoTexto?: string;
}

export interface PericiaEncerramentoLaudo {
  sinteseFatos: string;
  analiseCritica: string;
  conclusaoTexto: string;
  limitacoesTecnicas: string;
  responsavelTecnico: {
    nome: string;
    profissao: string;
    crea: string;
    artNumero: string;
    declaracaoAceite: boolean;
    dataAssinatura: string;
  };
  checklistEncerramento: { id: string; item: string; checado: boolean }[];
  encerrada: boolean;
  dataEncerramento?: string;
  hashIntegridadeSHA256?: string;
  versaoDocumento: number;
}

export interface PericiaAuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  campoModificado: string;
  valorAnterior: string;
  valorNovo: string;
}

export interface Pericia {
  id: string;
  codigoPericia: string;
  numeroInterno: string;
  nome: string;
  tipo: TipoPericia;
  status: PericiaStatus;
  contratanteNome: string;
  imovelNome: string;
  municipio: string;
  uf: string;
  responsavelTecnico: string;
  crea: string;
  artNumero: string;
  dataAbertura: string;
  prazoFinal: string;
  objetivo: string;
  descricaoInicial: string;
  observacoes: string;
  numeroProcesso?: string;
  autor?: string;
  reu?: string;
  
  // Submódulos Dados
  partesEnvolvidas: PericiaParteEnvolvida[];
  objetoDescricao: {
    oQueEstaSendoPericiado: string;
    qualOProblema: string;
    finalidade: string;
    periodoEnvolvido: string;
    localTalhao: string;
    cultura: string;
    areaAfetadaHa: number;
    eventoRelacionado: string;
  };
  quesitos: PericiaQuesito[];
  documentosIniciais: PericiaDocumentoInicial[];
  checklistPreliminar: { id: string; item: string; checado: boolean }[];
  
  // Vistoria & Evidências
  vistorias: PericiaVistoria[];
  fotografias: PericiaFotografia[];
  audiosVideos: PericiaAudioVideo[];
  amostras: PericiaAmostra[];
  checklistCampo: PericiaChecklistFieldItem[];
  diarioCampo: PericiaFieldDiaryItem[];
  cadeiaEvidencias: PericiaEvidenceItem[];
  
  // Análise Técnica & Diagnóstico
  analiseTecnica: PericiaAnaliseTecnica;
  
  // Cálculos e Danos
  calculosDanos: PericiaCalculosDanosValoracao;
  
  // Laudo & Encerramento
  encerrametoLaudo: PericiaEncerramentoLaudo;
  laudoOficial?: {
    titulo?: string;
    metodologia?: string;
    sinteseVistoria?: string;
    resultadoDiscussao?: string;
    conclusaoFinal?: string;
  };
  anexos?: PericiaAnexo[];
  
  // Auditoria
  historicoAuditoria: PericiaAuditLogEntry[];
  
  dadosRegiao?: {
    caracteristicas: string;
    dadosClimatologicos: {
      mes: string;
      minima: number;
      maxima: number;
      precipitacao: number;
    }[];
  };

  imovelAvaliado?: {
    imovelNome: string;
    matricula: string;
    areaTotal: number;
    areaAgricultavel: number;
    fotoAreaUrl?: string;
    fotosAdicionais?: string[];
    acesso: string;
    indicePluviometrico: string;
    topografia: string;
    caracteristicasSolo: string;
    aptidao: string;
    infraestrutura: string;
    produtividadeCulturas: string;
    benfeitorias: string;
  };

  avaliacaoImovel?: PericiaAvaliacaoImovel;
  georreferenciamento?: PericiaGeorreferenciamento;
  inventarioAtivos?: PericiaAtivoInventario[];
  
  criadoEm: string;
  atualizadoEm: string;
}

export interface PericiaAmostraTerraNua {
  id: string;
  amostra: string;
  areaTotalHa: number;
  aptidao: string;
  topografia: string;
  municipio: string;
  valorBrl: number;
  valorUnitario?: number;
  tipoNegocio: string;
  imobiliaria: string;
  contato?: string;
  linkOuFonte?: string;
  observacoes?: string;
  dataPesquisa?: string;
}

export interface PericiaAnexo {
  id: string;
  titulo: string;
  tipo: 'foto' | 'analise_solo' | 'documento' | 'outro';
  descricao?: string;
  arquivoUrl?: string; // photo/file url or base64
  data?: string;
  observacoes?: string;
  dadosSolo?: {
    laboratorio?: string;
    numeroLaudo?: string;
    dataColeta?: string;
    profundidadeCm?: string;
    phAgua?: number;
    phCacl2?: number;
    materiaOrganica?: number; // % ou g/dm³
    fosforoP?: number; // mg/dm³
    potassioK?: number; // mg/dm³ ou cmolc/dm³
    calcioCa?: number; // cmolc/dm³
    magnesioMg?: number; // cmolc/dm³
    aluminioAl?: number; // cmolc/dm³
    hMaisAl?: number; // cmolc/dm³
    ctc?: number; // cmolc/dm³
    vPercent?: number; // Saturação por bases (%)
    argilaPercent?: number; // %
    interpretacao?: string;
  };
}

export interface PericiaClasseTerraItem {
  id: string;
  classe: 'Classe I' | 'Classe II' | 'Classe III' | 'Classe IV' | 'Classe V' | 'Classe VI' | 'Classe VII' | 'Classe VIII';
  grupoUso: 'Grupo A - Cultiváveis' | 'Grupo B - Pastagem / Silvicultura' | 'Grupo C - Preservação / Inaproveitável';
  descricaoUso: string;
  areaHa: number;
  percentualArea: number;
  fatorHomogeneizacao: number; // 1.00 para Classe I, 0.85 para Classe II, etc.
  valorUnitarioEstimadoBrl: number;
  valorTotalEstimadoBrl: number;
  declividadePredominante?: string;
  restricoesManejo?: string;
}

export interface PericiaAproveitamentoImovel {
  areaTotalHa: number;
  areaAgricultavelLavouraHa: number;
  areaPastagemFormadaHa: number;
  areaPastagemNaturalHa: number;
  areaSilviculturaHa: number;
  areaBenfeitoriasEstruturasHa: number;
  areaReservaLegalHa: number;
  areaPreservacaoPermanenteHa: number;
  areaInaproveitavelOutrosHa: number;
  // Métricas calculadas
  areaAproveitavelTotalHa: number;
  coeficienteAproveitamentoPercent: number; // (areaAproveitavelTotalHa / areaTotalHa) * 100
  grauUtilizacaoTerraGutPercent?: number; // GUT %
  moduloFiscalHa?: number;
  quantidadeModulosFiscais?: number;
  fracaoMinimaParcelamentoHa?: number;
  observacoesAproveitamento?: string;
  classesTerras: PericiaClasseTerraItem[];
}

export interface PericiaAvaliacaoBenfeitoria {
  id: string;
  tipo: 'reprodutiva' | 'nao_reprodutiva';
  categoria: string; // ex: 'Edificações / Casas / Galpões', 'Instalações de Pecuária (Currais / Silos)', 'Cercas e Divisórias', 'Obras Hidráulicas (Açudes / Poços)', 'Eletrificação Rural', 'Pastagens Cultivadas / Florestas Plantadas'
  descricao: string;
  quantidade: number;
  unidade: string; // m², m linear, un, ha
  padraoConstrutivo?: string; // Provisório, Rústico, Econômico, Médio, Superior, Industrial
  idadeAnos?: number;
  vidaUtilAnos?: number;
  estadoConservacao?: 'novo' | 'bom' | 'regular' | 'reparos_simples' | 'reparos_importantes' | 'sem_valor';
  custoNovoUnitarioBrl: number;
  fatorDepreciacao?: number; // 0 a 1.0 (ex: 0.82)
  valorDepreciadoBrl: number;
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoMaquinaEquipamento {
  id: string;
  tipo: string; // 'Trator de Pneus', 'Colheitadeira', 'Pulverizador', 'Plantadeira', 'Pivô Central', 'Implemento', 'Gerador/Bomba'
  marca: string;
  modelo: string;
  numeroSerie?: string; // Número de série / plaqueta do fabricante
  anoFabricacao: number;
  potenciaCapacidade?: string; // ex: '210 cv', '30 pés', '3.000 L', '75 ha'
  horimetroOuUso?: string; // ex: '3.450 h', '1.200 h'
  estadoConservacao: 'excelente' | 'bom' | 'regular' | 'sucateado';
  valorNovoBrl: number;
  valorAtualMercadoBrl: number;
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoVeiculo {
  id: string;
  tipo: string; // 'Caminhão Graneleiro', 'Camionete 4x4', 'Utilitário', 'Motocicleta', 'Carreta Agrícola'
  marca: string;
  modelo: string;
  numeroSerie?: string; // Chassi / Número de série
  anoModelo: string; // '2023/2024'
  placaOuChassi?: string;
  combustivel?: string;
  quilometragemOuEstado?: string;
  referenciaFipeBrl?: number;
  valorAvaliadoBrl: number;
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export type CategoriaAtivoRural = 'maquina' | 'equipamento' | 'veiculo';
export type EstadoConservacaoAtivo =
  | 'novo'
  | 'excelente'
  | 'bom'
  | 'regular'
  | 'reparos_necessarios'
  | 'sucateado';

export interface PericiaAtivoInventario {
  id: string;
  categoria: CategoriaAtivoRural; // 'maquina' | 'equipamento' | 'veiculo'
  subtipo: string; // ex: 'Trator de Pneus', 'Colheitadeira', 'Grade Aradora', 'Pulverizador', 'Pivô Central', 'Caminhão Graneleiro', 'Camionete 4x4', etc.
  marca: string;
  modelo: string;
  numeroSerie: string; // Número de série do fabricante / Chassi / Plaqueta
  placaOuRegistro?: string; // Placa / Renavam / Registro MAPA / Tombamento interno
  anoFabricacao: number;
  anoModelo?: string; // ex: '2022/2023'
  horimetroOuKm?: string; // ex: '2.890 h' ou '62.000 km'
  potenciaCapacidade?: string; // ex: '230 cv', '30 pés', '3.000 L', '24 linhas'
  combustivel?: string; // 'Diesel', 'Gasolina', 'Elétrico', 'Flex'
  estadoConservacao: EstadoConservacaoAtivo;
  valorNovoReposicaoBrl: number; // Valor de novo / reposição
  valorMercadoAtualizadoBrl: number; // Valor de mercado atualizado apurado na perícia
  referenciaMercado?: string; // ex: 'Tabela FIPE 2024', 'Molicar', 'Concessionária Autorizada'
  localizacaoFisica?: string; // ex: 'Galpão de Máquinas Sede', 'Talhão 04', 'Oficina'
  statusOperacional: 'em_operacao' | 'em_manutencao' | 'parado' | 'inoperante';
  fotoUrl?: string;
  observacoes?: string;
  incluirNoLaudo: boolean;
  dataAvaliacao?: string;
}

export interface PericiaAvaliacaoSemovente {
  id: string;
  especie: string; // 'Bovino', 'Equino', 'Ovino', 'Caprino', 'Suíno'
  categoria: string; // 'Matrizes Nelore Paridas', 'Bezerros Desmamados', 'Novilhas', 'Bois Gordos', 'Reprodutores P.O.', 'Cavalos de Lida'
  raca: string;
  quantidadeCabecas: number;
  pesoMedioKgOuArrobas?: string; // '480 kg (16 @)'
  valorUnitarioCabecaBrl: number;
  valorTotalBrl: number;
  finalidadeZootecnica?: string; // 'Cria', 'Recria', 'Engorda', 'Genética/P.O.', 'Trabalho'
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoRecursoNatural {
  id: string;
  tipoRecurso: string; // 'Manejo Florestal Sustentável', 'Madeira em Pé', 'Jazida de Cascalho/Areia', 'Recurso Hídrico/Outorga', 'Excedente Reserva Legal (CRA/Carbono)'
  descricaoLocalizacao: string;
  volumeOuAreaEstimada: string; // '450 m³', '30.000 m³', '140 ha'
  situacaoLicenciamento?: string; // 'Licenciado', 'Outorgado', 'Em regularização'
  valorUnitarioBrl?: number;
  valorTotalAvaliadoBrl: number;
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoFruto {
  id: string;
  cultura: string; // 'Soja Safra', 'Milho Safrinha', 'Cana-de-Açúcar', 'Algodão', 'Café'
  areaCultivadaHa: number;
  estagioVegetativo: string; // 'R5.2 (Enchimento)', 'V6', 'Maturação'
  produtividadeEsperada: string; // '68 sc/ha', '110 sc/ha', '85 ton/ha'
  metodoAvaliacao: 'custo_investido_invertido' | 'fluxo_renda_descontada' | 'mercado_antecipado';
  custoInvestidoAteDataBrl?: number;
  valorEsperadoColheitaBrl?: number;
  valorAvaliadoBrl: number;
  observacoes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoDireito {
  id: string;
  tipoDireito: 'servidao_passagem' | 'contrato_arrendamento' | 'parceria_agricola' | 'direito_minerario' | 'comodato' | 'posse_pacifica' | 'outorga_hidrica' | 'outro';
  denominacao: string; // 'Servidão de Linha de Transmissão 500 kV', 'Arrendamento Agrícola Vigente', 'Direito Minerário ANM'
  titularOuConcessionaria: string;
  documentoRegistro?: string; // 'Matrícula 12.450 / R-3', 'Processo ANM 860.123'
  prazoVigencia?: string;
  naturezaImpacto: 'positivo_valorizacao' | 'negativo_gravame_desvalorizacao' | 'neutro_informativo';
  valorAvaliadoBrl: number; // valor positivo agrega ao patrimônio; se for ônus/gravame redutor, é subtraído
  detalhes?: string;
  incluirNoLaudo: boolean;
}

export interface PericiaAvaliacaoImovel {
  avaliacaoJudicial: string;
  comportamentoMercado: string;
  valorizantesDesvalorizantes: string;
  precificacaoTerraNua: PericiaAmostraTerraNua[];
  observacoesMetodologia?: string;
  aproveitamentoTerras?: PericiaAproveitamentoImovel;

  // 7 Opções de Componentes do Laudo (ABNT NBR 14653-3)
  incluirBenfeitorias?: boolean;
  benfeitorias?: PericiaAvaliacaoBenfeitoria[];

  incluirMaquinasEquipamentos?: boolean;
  maquinasEquipamentos?: PericiaAvaliacaoMaquinaEquipamento[];

  incluirVeiculos?: boolean;
  veiculos?: PericiaAvaliacaoVeiculo[];

  incluirSemoventes?: boolean;
  semoventes?: PericiaAvaliacaoSemovente[];

  incluirRecursosNaturais?: boolean;
  recursosNaturais?: PericiaAvaliacaoRecursoNatural[];

  incluirFrutos?: boolean;
  frutos?: PericiaAvaliacaoFruto[];

  incluirDireitos?: boolean;
  direitos?: PericiaAvaliacaoDireito[];

  inventarioAtivos?: PericiaAtivoInventario[];
  observacoesGeraisComponentes?: string;
}

