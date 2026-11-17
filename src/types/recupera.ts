/**
 * GeaAgro Recupera - Modelos de Dados e Tipos TypeScript
 * Aplicativo para Diagnóstico, Planejamento, Dimensionamento, Execução
 * e Monitoramento da Recuperação de Áreas Degradadas (RAD / PRAD).
 */

export type GrauSeveridadeDegradacao = 'leve' | 'moderada' | 'severa' | 'muito_severa';

export type TipoDegradacaoPrincipal =
  | 'pastagem_degradada'
  | 'solo_compactado'
  | 'erosao_laminar_sulcos'
  | 'ravina_vocoroca'
  | 'baixa_fertilidade_acidez'
  | 'salinizacao_sodicidade'
  | 'perda_materia_organica'
  | 'app_degradada'
  | 'reserva_legal_degradada'
  | 'nascente_assoreada'
  | 'vegetacao_nativa_suprimida';

export type TipoProjetoRecuperacao =
  | 'recuperacao_pastagens'
  | 'solos_compactados'
  | 'areas_erosivas'
  | 'recuperacao_fertilidade'
  | 'solos_salinos_sodicos'
  | 'aumento_materia_organica'
  | 'plantas_cobertura'
  | 'adubacao_verde'
  | 'sistemas_agroflorestais'
  | 'integracao_lavoura_pecuaria'
  | 'integracao_lavoura_pecuaria_floresta'
  | 'regeneracao_natural'
  | 'recuperacao_app'
  | 'recuperacao_reserva_legal'
  | 'recuperacao_areas_agricolas'
  | 'recuperacao_ambiental';

export interface CoordenadasGps {
  latitude: number;
  longitude: number;
  altitude?: number;
  precisaoM?: number;
}

export interface PontoInteresseGps {
  id: string;
  tipo: 'erosao' | 'vocoroca' | 'amostra_solo' | 'monitoramento' | 'nascente' | 'benfeitoria' | 'marco';
  titulo: string;
  descricao?: string;
  latitude: number;
  longitude: number;
  fotoUrl?: string;
  dataRegistro: string;
}

export interface AreaDegradadaItem {
  id: string;
  propriedadeId: string;
  nomeTalhao: string;
  codigoIdentificacao: string;
  areaHa: number;
  tipoUtilizacaoAnterior: string;
  tipoUtilizacaoAtual: string;
  tipoDegradacao: TipoDegradacaoPrincipal;
  grauSeveridade: GrauSeveridadeDegradacao;
  dataIdentificacao: string;
  historicoUsoManejo: string;
  coordenadasCentroid: CoordenadasGps;
  verticesPoligono: CoordenadasGps[];
  responsavelTecnico: string;
  creaNumero: string;
  fotografias: string[];
  statusRecuperacao: 'diagnostico' | 'planejamento' | 'em_execucao' | 'em_monitoramento' | 'recuperada';
  observacoes: string;
}

export interface PropriedadeRecupera {
  id: string;
  nome: string;
  produtorNome: string;
  produtorCpfCnpj: string;
  municipio: string;
  estado: string;
  carNumero: string;
  ccirNumero: string;
  matricula: string;
  areaTotalHa: number;
  areaPreservacaoPermanenteHa: number;
  areaReservaLegalHa: number;
  areaProdutivaHa: number;
  coordenadasSede: CoordenadasGps;
  responsavelTecnico: string;
  creaNumero: string;
  artNumero: string;
  historicoGeral: string;
  fotografias: string[];
  observacoes: string;
}

// ==========================================
// FASE 2: DIAGNÓSTICO TÉCNICO COMPLETO
// ==========================================

export interface DiagnosticoFisicoSolo {
  compactacaoPresente: boolean;
  profundidadeCamadaCompactadaCm: number;
  resistenciaPenetracaoMpa: number;
  adensamentoPresente: boolean;
  infiltracaoAguaMmH: number;
  selamentoSuperficial: boolean;
  perdaEstruturaAgregados: boolean;
  erosaoLaminar: boolean;
  erosaoSulcos: boolean;
  ravinasPresentes: boolean;
  numeroRavinas: number;
  vocorocasPresentes: boolean;
  dimensoesVocorocas: string;
  exposicaoHorizontesSubsuperficiais: boolean;
  observacoes: string;
}

export interface DiagnosticoQuimicoSolo {
  acidezElevada: boolean;
  phAgua: number;
  saturacaoBasesVpct: number;
  saturacaoAluminioMpct: number;
  baixaFertilidade: boolean;
  teorFosforoMgDm3: number;
  teorPotassioCmolcDm3: number;
  teorCalcioCmolcDm3: number;
  teorMagnesioCmolcDm3: number;
  teorMateriaOrganicaGDm3: number;
  salinidadeCondutividadeEletricaDsM: number;
  sodicidadePstPct: number;
  deficienciaMicronutrientes: string[];
  observacoes: string;
}

export interface DiagnosticoBiologicoSolo {
  baixaAtividadeBiologica: boolean;
  respiracaoBasalMicrobiana: string;
  presencaMacrofaunaMinhocas: 'ausente' | 'baixa' | 'moderada' | 'abundante';
  desenvolvimentoRadicular: 'superficial' | 'restrito_a_linha' | 'ramificado_profundo';
  coberturaVegetalVivaPct: number;
  coberturaPalhadaMortaPct: number;
  nematoidesFitoparasitasSuspeita: boolean;
  observacoes: string;
}

export interface DiagnosticoPastagem {
  especieForrageiraAtual: string;
  percentualFalhasCoberturaPct: number;
  percentualSoloExpostoPct: number;
  densidadePerfilhosM2: number;
  vigorRebrota: 'muito_fraco' | 'fraco' | 'moderado' | 'bom';
  alturaMediaPastoCm: number;
  disponibilidadeMassaSecaKgHa: number;
  infestacaoPlantasDaninhasPct: number;
  principaisDaninhas: string[];
  nivelPisoteioDegradacao: 'baixo' | 'moderado' | 'severo';
  capacidadeSuporteAtualUaHa: number;
  capacidadeSuportePotencialUaHa: number;
  observacoes: string;
}

export interface DiagnosticoAmbiental {
  intervencaoApp: boolean;
  larguraAppPreservadaM: number;
  larguraAppExigidaM: number;
  degradacaoReservaLegal: boolean;
  supressaoVegetacaoNativaHa: number;
  distanciaNascentesM: number;
  estadoNascentes: 'preservada' | 'assoreada' | 'degradada_sem_mata' | 'inexistente';
  processosAssoreamentoCursosAgua: boolean;
  presencaEspeciesExoticasInvasoras: boolean;
  especiesInvasoras: string[];
  necessidadeIsolamentoCercamentoM: number;
  observacoes: string;
}

export interface DiagnosticoTecnicoCompleto {
  id: string;
  areaId: string;
  dataDiagnostico: string;
  responsavelTecnico: string;
  creaNumero: string;
  fisico: DiagnosticoFisicoSolo;
  quimico: DiagnosticoQuimicoSolo;
  biologico: DiagnosticoBiologicoSolo;
  pastagem: DiagnosticoPastagem;
  ambiental: DiagnosticoAmbiental;
  classificacaoGeral: GrauSeveridadeDegradacao;
  pontuacaoDegradacao: number; // 0 a 100
  justificativaTecnica: string;
  acoesImediatasRecomendadas: string[];
  anexosFotograficos: string[];
}

export interface AnaliseSoloItem {
  id: string;
  areaId: string;
  dataColeta: string;
  laboratorio: string;
  numeroLaudo: string;
  profundidade: '0-20 cm' | '20-40 cm' | '40-60 cm';
  texturaSolo: 'arenosa' | 'media' | 'argilosa' | 'muito_argilosa';
  argilaPct: number;
  siltePct: number;
  areiaPct: number;
  phAgua: number;
  phCacl2: number;
  materiaOrganicaGDm3: number;
  pResinaMgDm3: number;
  pMehlichMgDm3: number;
  kCmolcDm3: number;
  caCmolcDm3: number;
  mgCmolcDm3: number;
  alCmolcDm3: number;
  hAlCmolcDm3: number;
  sbCmolcDm3: number;
  ctcEfetivaT: number;
  ctcPh7T: number;
  saturacaoBasesVpct: number;
  saturacaoAluminioMpct: number;
  enxofreS: number;
  boroB: number;
  cobreCu: number;
  ferroFe: number;
  manganesMn: number;
  zincoZn: number;
  densidadeSoloGcm3?: number;
  resistenciaPenetracaoMpa?: number;
  arquivoAnexoUrl?: string;
  observacoes: string;
}

// ==========================================
// FASE 3: CALCULADORAS AGRONÔMICAS
// ==========================================

export interface MemoriaCalculo {
  titulo: string;
  formula: string;
  metodo: string;
  parametrosEntrada: Record<string, any>;
  passosCalculo: string[];
  resultado: string;
  referenciaBibliografica: string;
  limitacoes: string;
}

export interface CalculoCalagemResultado {
  metodoEscolhido: 'saturacao_bases' | 'neutralizacao_aluminio';
  necessidadeCalcarioTHa: number;
  doseCalcarioCorrigidaTHa: number; // corrigida por PRNT e profundidade
  quantidadeTotalToneladas: number;
  prntUtilizadoPct: number;
  vDesejadoPct: number;
  vAtualPct: number;
  profundidadeCm: number;
  tipoCalcarioRecomendado: string;
  custoEstimadoTotalR$: number;
  memoria: MemoriaCalculo;
}

export interface CalculoGessagemResultado {
  metodoEscolhido: 'teor_argila' | 'ctc_efetiva';
  doseGessoKgHa: number;
  doseGessoTHa: number;
  quantidadeTotalToneladas: number;
  criterioSubsuperficialAtendido: boolean;
  justificativaSubsuperficial: string;
  custoEstimadoTotalR$: number;
  memoria: MemoriaCalculo;
}

export interface CalculoAdubacaoResultado {
  doseN_kgHa: number;
  doseP2O5_kgHa: number;
  doseK2O_kgHa: number;
  doseCa_kgHa: number;
  doseMg_kgHa: number;
  doseS_kgHa: number;
  micronutrientesKgHa: { nutriente: string; doseKgHa: number }[];
  formuladoSugerido: string;
  doseFormuladoKgHa: number;
  quantidadeTotalAduboKg: number;
  custoAdubacaoTotalR$: number;
  memoria: MemoriaCalculo;
}

export interface CalculoSementesResultado {
  especieCultivar: string;
  purezaPct: number;
  germinacaoPct: number;
  valorCulturalPct: number;
  taxaSemeaduraRecomendadaKgHa: number;
  taxaSemeaduraAjustadaKgHa: number;
  areaHa: number;
  quantidadeTotalSementesKg: number;
  populacaoEsperadaPlantasM2: number;
  custoEstimadoR$: number;
  memoria: MemoriaCalculo;
}

export interface CalculoMudasResultado {
  especieNome: string;
  grupoEcologico: 'pioneira' | 'secundaria_inicial' | 'secundaria_tardia' | 'climax';
  espacamentoLinhaM: number;
  espacamentoEntrePlantasM: number;
  densidadeMudasHa: number;
  areaHa: number;
  percentualReplantioPct: number;
  quantidadeMudasPlantio: number;
  quantidadeMudasReplantio: number;
  quantidadeTotalMudas: number;
  custoEstimadoR$: number;
  memoria: MemoriaCalculo;
}

// ==========================================
// FASE 4: PROJETOS E ESTRATÉGIAS DE RECUPERAÇÃO
// ==========================================

export interface OperacaoRecuperacao {
  id: string;
  ordem: number;
  etapa: 'preparo_solo' | 'correcao_adubacao' | 'conservacao_mecanica' | 'implantacao_vegetal' | 'manejo_tratos' | 'isolamento_cercas';
  titulo: string;
  descricao: string;
  maquinarioEquipamento: string;
  insumosUtilizados: string;
  maoDeObraHomemDia: number;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  custoPrevistoR$: number;
  custoRealizadoR$: number;
}

export interface ProjetoRecuperacao {
  id: string;
  areaId: string;
  propriedadeId: string;
  codigoProjeto: string;
  titulo: string;
  tipoProjeto: TipoProjetoRecuperacao;
  dataElaboracao: string;
  dataInicio: string;
  prazoMeses: number;
  responsavelTecnico: string;
  creaNumero: string;
  artNumero: string;
  objetivoPrincipal: string;
  justificativaTecnica: string;
  areaTratadaHa: number;
  estrategiaAdotada: string;
  operacoes: OperacaoRecuperacao[];
  orcamentoTotalPrevistoR$: number;
  orcamentoTotalRealizadoR$: number;
  statusProjeto: 'planejado' | 'em_implantacao' | 'em_manutencao' | 'recuperado' | 'concluido';
  indicadoresSucesso: string[];
  anexosUrls: string[];
}

export interface PlantaCoberturaInfo {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  familia:
    | 'Gramínea (Poaceae)'
    | 'Leguminosa (Fabaceae)'
    | 'Crucífera (Brassicaceae)'
    | 'Poligonácea (Polygonaceae)'
    | 'Asterácea (Asteraceae)';
  ciclo: 'Anual' | 'Bianual' | 'Perene';
  sistemaRadicular: 'Fasciculado denso e profundo' | 'Pivotante vigoroso e descompactador' | 'Ramificado superficial';
  producaoBiomassaSecaTHaMin: number;
  producaoBiomassaSecaTHaMax: number;
  relacaoCN: string;
  epocaSemeadura: string;
  exigenciaHidrica: 'Baixa' | 'Média' | 'Alta';
  adaptacaoClimatica: string;
  taxaSemeaduraKgHa: number;
  profundidadeSemeaduraCm: string;
  beneficiosSolo: string[];
  consorciosRecomendados: string[];
}

// ==========================================
// FASE 5: MAPAS, GPS E MONITORAMENTO (IGRA)
// ==========================================

export interface MonitoramentoVisita {
  id: string;
  areaId: string;
  projetoId?: string;
  dataVisita: string;
  responsavel: string;
  coordenadasGps: CoordenadasGps;
  coberturaVegetalVivaPct: number;
  coberturaPalhadaPct: number;
  soloExpostoPct: number;
  densidadePlantasM2: number;
  alturaMediaVegetacaoCm: number;
  biomassaSecaEstimadaTHa: number;
  presencaPlantasDaninhasPct: number;
  sinaisErosaoAtiva: boolean;
  estabilidadeBordasRavinas: string;
  infiltracaoEstimada: string;
  capacidadeSuporteAtualUaHa?: number;
  observacoesGerais: string;
  fotografiasAntesDepois: {
    data: string;
    fase: 'antes' | 'durante' | 'depois';
    url: string;
    legenda: string;
  }[];
  igraScore: number; // 0 a 100
}

/**
 * IGRA — Índice GeaAgro de Recuperação da Área
 * 5 Dimensões Técnicas Ponderadas (0 a 100 cada)
 */
export interface IgraDimensoes {
  dimensaoFisica: number;      // 0 a 100 (estrutura, infiltração, erosão, compactação)
  dimensaoQuimica: number;     // 0 a 100 (fertilidade, V%, pH, Al, MO)
  dimensaoBiologica: number;   // 0 a 100 (macrofauna, atividade microbiana, raízes)
  dimensaoVegetativa: number;  // 0 a 100 (cobertura %, biomassa, vigor, ausência daninhas)
  dimensaoProdutiva: number;   // 0 a 100 (capacidade de suporte, produtividade, estabilidade)
  pesoFisica: number;          // Padrão: 0.20
  pesoQuimica: number;         // Padrão: 0.20
  pesoBiologica: number;       // Padrão: 0.20
  pesoVegetativa: number;      // Padrão: 0.25
  pesoProdutiva: number;       // Padrão: 0.15
  scoreConsolidado: number;    // 0 a 100
  classificacaoEstagio: 'Critico' | 'Inicial' | 'Em_Recuperacao' | 'Avancado' | 'Recuperado';
  diagnosticoResumo: string;
  gapsIdentificados: string[];
}

// ==========================================
// FASE 6: GESTÃO, CUSTOS, CRONOGRAMA E RELATÓRIOS
// ==========================================

export interface ItemCustoRecuperacao {
  id: string;
  areaId: string;
  projetoId: string;
  categoria: 'insumos' | 'maquinas_combustivel' | 'mao_de_obra' | 'servicos_terceiros' | 'transporte' | 'manutencao_replantio';
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitarioR$: number;
  valorTotalPrevistoR$: number;
  valorTotalRealizadoR$: number;
  dataLancamento: string;
  comprovanteNumero?: string;
  statusPagamento: 'pendente' | 'realizado';
}

export interface AtividadeCronograma {
  id: string;
  projetoId: string;
  titulo: string;
  etapaGeral: string;
  responsavelNome: string;
  dataInicio: string;
  dataFim: string;
  progressoPct: number;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada';
  custoPrevistoR$: number;
  custoRealizadoR$: number;
  observacoes: string;
}

export type TipoRelatorioPdf =
  | 'diagnostico_inicial'
  | 'analise_solo_fertilidade'
  | 'projeto_tecnico_completo'
  | 'plano_recuperacao_pastagens'
  | 'plano_conservacao_solo'
  | 'projeto_recuperacao_ambiental_prad'
  | 'memorial_descritivo'
  | 'cronograma_atividades'
  | 'orcamento_detalhado'
  | 'relatorio_fotografico'
  | 'laudo_monitoramento_igra'
  | 'comparativo_temporal_antes_depois'
  | 'termo_encerramento_recuperacao';

// ==========================================
// FASE 7: SINCRONIZAÇÃO E STATUS
// ==========================================

export interface StatusSincronizacaoRecupera {
  ultimaSincronizacao: string | null;
  registrosLocaisPendentes: number;
  registrosSincronizados: number;
  conflitosPendentes: number;
  modoOfflineAtivo: boolean;
  versaoBancoLocal: string;
}
