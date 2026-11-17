export type FinalidadeAvaliacao =
  | 'compra_venda'
  | 'garantia_bancaria'
  | 'credito_rural'
  | 'inventario_partilha'
  | 'desapropriacao'
  | 'seguro_agricola'
  | 'operacoes_societarias'
  | 'revisao_patrimonial'
  | 'pericia_judicial'
  | 'assistencia_tecnica'
  | 'outros';

export type MetodoAvaliacaoPrincipal =
  | 'comparativo_direto'
  | 'capitalizacao_renda'
  | 'evolutivo'
  | 'quantificacao_custo';

export type GrauNormativo = 'Grau I' | 'Grau II' | 'Grau III';

export type EstadoConservacaoRossHeidecke =
  | 'A' // Novo / Excelente (0%)
  | 'B' // Entre novo e regular / Muito bom (1.0%)
  | 'C' // Regular / Bom (3.2%)
  | 'D' // Entre regular e reparos simples (8.1%)
  | 'E' // Necessitando de reparos simples (18.1%)
  | 'F' // Entre reparos simples e importantes (32.1%)
  | 'G' // Necessitando de reparos importantes (52.1%)
  | 'H'; // Sem valor de aproveitamento / Demolição (100%)

export type CategoriaBenfeitoria =
  | 'construcao'
  | 'pecuaria'
  | 'infraestrutura'
  | 'irrigacao'
  | 'outros';

export type ClasseCapacidadeUso =
  | 'Classe I'
  | 'Classe II'
  | 'Classe III'
  | 'Classe IV'
  | 'Classe V'
  | 'Classe VI'
  | 'Classe VII'
  | 'Classe VIII';

export type AptidaoAgricolaEmbrapa =
  | '1 - Boa para Lavouras'
  | '2 - Regular para Lavouras'
  | '3 - Restrita para Lavouras'
  | '4 - Apta para Pastagem Plantada'
  | '5 - Apta para Silvicultura'
  | '6 - Preservação da Fauna e Flora';

export interface CoordenadaGps {
  latitude: number;
  longitude: number;
  altitude?: number;
  precisaoM?: number;
}

export interface GlebaSetor {
  id: string;
  nome: string;
  areaHa: number;
  tipoUso: string;
  topografia: string;
  soloPredominante: string;
  observacoes?: string;
}

export interface CaracterizacaoTerritorial {
  areaTotalHa: number;
  areaAgricultavelHa: number;
  areaPastagensHa: number;
  areaLavourasHa: number;
  areaSilviculturaHa: number;
  areaReservaLegalHa: number;
  areaAppHa: number;
  areaVegetacaoNativaHa: number;
  areaIrrigadaHa: number;
  areaInfraestruturaHa: number;
  areaAlagavelHa: number;
  areaRestricoesUsoHa: number;
  areaImprodutivaHa: number;
  areaServidaoHa: number;
  glebas: GlebaSetor[];
}

export interface CaracterizacaoRegional {
  microrregiao: string;
  distanciaCentroUrbanoKm: number;
  distanciaCooperativaArmazemKm: number;
  acessoRodoviario: 'Pavimentado' | 'Terra com cascalho' | 'Terra sem conservação' | 'Misto';
  condicoesEstradas: 'Ótima' | 'Boa' | 'Regular' | 'Ruim';
  disponibilidadeEnergia: 'Monofásica' | 'Trifásica' | 'Inexistente' | 'Solar fotovoltaica';
  logisticaEscoamento: string;
  mercadosConsumidores: string;
  servicosAgricolasDisponiveis: string;
  caracteristicasEconomicas: string;
}

export interface CaracterizacaoSoloTopografia {
  classeSolo: string;
  textura: 'Muito Argilosa (>60%)' | 'Argilosa (35-60%)' | 'Média (15-35%)' | 'Arenosa (<15%)';
  profundidadeEfetiva: 'Muito profunda (>2m)' | 'Profunda (1-2m)' | 'Moderada (0.5-1m)' | 'Rasa (<0.5m)';
  fertilidadeQuimica: 'Alta' | 'Média' | 'Baixa';
  acidezPh: 'Baixa (pH > 6.0)' | 'Média (pH 5.2 - 6.0)' | 'Elevada (pH < 5.2)';
  materiaOrganica: 'Alta (>35 g/dm³)' | 'Média (20-35 g/dm³)' | 'Baixa (<20 g/dm³)';
  capacidadeRetencaoAgua: 'Alta' | 'Média' | 'Baixa';
  drenagem: 'Excessiva' | 'Boa' | 'Moderada' | 'Imperfeita' | 'Pobre';
  pedregosidade: 'Nula' | 'Ligeira' | 'Moderada' | 'Pedregosa';
  compactacaoErosao: string;
  relevo: 'Plano (0-3%)' | 'Suave Ondulado (3-8%)' | 'Ondulado (8-20%)' | 'Forte Ondulado (20-45%)' | 'Montanhoso (>45%)';
  declividadeMediaPct: number;
  mecanizacaoAptidao: 'Totalmente mecanizável' | 'Parcialmente mecanizável' | 'Não mecanizável';
}

export interface AptidaoCapacidadeUsoInfo {
  classeCapacidadeUso: ClasseCapacidadeUso;
  aptidaoAgricolaEmbrapa: AptidaoAgricolaEmbrapa;
  culturasExploradas: string[];
  historicoProdutividade: {
    cultura: string;
    safra: string;
    produtividadeMedia: number;
    unidade: string;
  }[];
  potencialIrrigacao: 'Alto' | 'Médio' | 'Baixo' | 'Inexistente';
  recursosHidricos: string[];
  praticasConservacionistas: string;
}

export interface PropriedadeRuralAvaliacao {
  id: string;
  codigoInterno: string;
  nome: string;
  proprietarioNome: string;
  proprietarioCpfCnpj: string;
  proprietarioContato: string;
  municipio: string;
  estado: string;
  endereco: string;
  coordenadasGps: CoordenadaGps;
  areaTotalHa: number;
  numeroMatricula: string;
  cartorioRegistro: string;
  numeroCar: string;
  numeroCcir: string;
  numeroItr: string;
  responsavelTecnicoNome: string;
  responsavelTecnicoCrea: string;
  dataCadastro: string;
  fotografias: {
    id: string;
    url: string;
    legenda: string;
    dataHora: string;
    coordenadas?: CoordenadaGps;
  }[];
  observacoesGerais: string;
  territorial: CaracterizacaoTerritorial;
  regional: CaracterizacaoRegional;
  solosTopografia: CaracterizacaoSoloTopografia;
  aptidao: AptidaoCapacidadeUsoInfo;
}

export interface SolicitanteAvaliacao {
  id: string;
  solicitanteNome: string;
  solicitanteCpfCnpj: string;
  solicitanteContato: string;
  solicitanteEndereco: string;
  contratanteNome: string;
  contratanteCpfCnpj: string;
  finalidade: FinalidadeAvaliacao;
  dataReferencia: string;
  objetoAvaliacao: string;
  pressupostosCondicoesLimitantes: string;
  profissionalResponsavel: string;
  creaNumero: string;
  artNumero: string;
}

export interface BenfeitoriaItem {
  id: string;
  propriedadeId: string;
  categoria: CategoriaBenfeitoria;
  nome: string;
  dimensaoM2: number;
  quantidade: number;
  anoConstrucao: number;
  idadeAparenteAnos: number;
  vidaUtilAnos: number;
  estadoConservacao: EstadoConservacaoRossHeidecke;
  padraoConstrutivo: 'Alto' | 'Normal/Médio' | 'Econômico' | 'Rústico/Provisório';
  custoReproducaoNovoUnitarioR$: number;
  custoReproducaoNovoTotalR$: number;
  fatorDepreciacaoRossHeideckePct: number;
  valorDepreciadoFinalR$: number;
  fotos: string[];
  observacoes: string;
}

export interface ImovelComparativoMercado {
  id: string;
  codigo: string;
  identificacao: string;
  municipio: string;
  estado: string;
  coordenadas: CoordenadaGps;
  areaTotalHa: number;
  valorInformadoR$: number;
  tipoValor: 'anunciado' | 'negociado_efetivo';
  dataInformacao: string;
  precoPorHectareR$: number;
  tipoExploracao: string;
  aptidaoAgricola: string;
  topografia: string;
  disponibilidadeHidrica: string;
  benfeitoriasDescricao: string;
  acessibilidade: string;
  distanciaAsfaltoKm: number;
  distanciaCidadeKm: number;
  fonteInformacao: string;
  confiabilidade: 'Alta' | 'Média' | 'Baixa';
  statusInclusao: 'incluido' | 'descartado_outlier' | 'em_analise';
  justificativaStatus?: string;
  fotos: string[];
  // Fatores de Homogeneização aplicados
  fatores?: {
    fatorOferta: number;
    fatorDimensao: number;
    fatorTopografia: number;
    fatorAcesso: number;
    fatorAgua: number;
    fatorAptidao: number;
    fatorTotal: number;
    valorHomogeneizadoPorHaR$: number;
  };
}

export interface VistoriaChecklistItem {
  id: string;
  categoria: 'terras' | 'benfeitorias' | 'ambiental' | 'recursos_hidricos' | 'acessos' | 'conflitos';
  item: string;
  status: 'conforme' | 'atencao' | 'critico' | 'nao_aplicavel';
  observacao: string;
}

export interface PontoInteresseVistoria {
  id: string;
  nome: string;
  descricao: string;
  coordenadas: CoordenadaGps;
  foto?: string;
  categoria: 'limite' | 'benfeitoria' | 'nascente' | 'solo_erosao' | 'acesso' | 'ponto_foto';
}

export interface VistoriaTecnica {
  id: string;
  propriedadeId: string;
  dataVistoria: string;
  horaVistoria: string;
  vistoriadorNome: string;
  vistoriadorCrea: string;
  condicoesClimaticas: string;
  checklist: VistoriaChecklistItem[];
  pontosInteresse: PontoInteresseVistoria[];
  fotografiasGeorreferenciadas: {
    id: string;
    url: string;
    legenda: string;
    dataHora: string;
    coordenadas: CoordenadaGps;
    azimuteGraus?: number;
  }[];
  notasGerais: string;
  assinaturaVistoriador?: string;
}

export interface DocumentoDueDiligence {
  id: string;
  propriedadeId: string;
  tipo:
    | 'matricula'
    | 'escritura'
    | 'car'
    | 'ccir'
    | 'itr'
    | 'certidao_onus'
    | 'licenca_ambiental'
    | 'outorga_agua'
    | 'contrato_arrendamento'
    | 'planta_georreferenciada'
    | 'art_crea'
    | 'outro';
  numeroDocumento: string;
  dataEmissao: string;
  orgaoEmissor: string;
  dataValidade?: string;
  statusConferencia: 'pendente' | 'conferido_valido' | 'declarado_sem_comprovacao' | 'vencido' | 'irregular';
  observacoes: string;
  arquivoNome?: string;
  tamanhoKb?: number;
}

export interface EstatisticaTratamento {
  quantidadeAmostras: number;
  mediaR$PorHa: number;
  medianaR$PorHa: number;
  modaR$PorHa?: number;
  desvioPadraoR$PorHa: number;
  varianciaR$PorHa: number;
  coeficienteVariacaoPct: number;
  minimoR$PorHa: number;
  maximoR$PorHa: number;
  amplitudeR$PorHa: number;
  quartil1R$PorHa: number;
  quartil3R$PorHa: number;
  intervaloConfianca80Min: number;
  intervaloConfianca80Max: number;
  intervaloToleranciaMin15Pct: number;
  intervaloToleranciaMax15Pct: number;
  grauFundamentacaoApurado: GrauNormativo;
  grauPrecisaoApurado: GrauNormativo;
  outliersExcluidos: string[];
  // Regressão simples Preço/ha x Área
  regressao?: {
    equacao: string;
    r2: number;
    r2Ajustado: number;
    fSnedecor: number;
    significativo: boolean;
  };
}

export interface MetodoCapitalizacaoRendaConfig {
  receitasAnuais: { id: string; descricao: string; valorR$: number; tipo: string }[];
  custosOperacionaisR$: number;
  despesasAdministrativasR$: number;
  impostosTaxasR$: number;
  investimentoManutencaoR$: number;
  fluxoCaixaLiquidoAnualR$: number;
  taxaDescontoAnualPct: number;
  taxaCapitalizacaoPct: number;
  horizonteAnos: number;
  valorResidualFinalR$: number;
  valorPresenteLiquidoR$: number;
  analiseSensibilidade: {
    cenario: string;
    variacaoReceitaPct: number;
    taxaDescontoPct: number;
    vplR$: number;
  }[];
}

export interface MetodoEvolutivoConfig {
  valorTerraNuaR$: number;
  valorBenfeitoriasR$: number;
  valorInstalacoesEquipamentosR$: number;
  fatorComercializacaoFc: number; // Típico 0.90 a 1.10
  valorTotalEvolutivoR$: number;
  justificativaFc: string;
}

export interface SimuladorCenarioMelhoria {
  id: string;
  propriedadeId: string;
  titulo: string;
  descricao: string;
  tipoMelhoria: 'irrigacao' | 'pastagem' | 'fertilidade' | 'armazem' | 'infraestrutura' | 'outros';
  investimentoEstimadoR$: number;
  prazoMeses: number;
  incrementoProdutividadePct: number;
  acrescimoValorMercadoEstimadoR$: number;
  retornoSobreInvestimentoPct: number;
  premissasTecnicas: string;
  riscosAssociados: string;
}

export interface IndicadoresExclusivosGeaAgro {
  iprScore: number; // Índice de Potencial Rural (0-100)
  iprClassificacao: 'Excelente' | 'Bom' | 'Médio' | 'Restrito';
  icvScore: number; // Índice de Conservação das Benfeitorias (0-100)
  icvClassificacao: 'Ótimo' | 'Bom' | 'Regular' | 'Crítico';
  igmScore: number; // Índice GeaAgro de Mercado (0-100)
  igmClassificacao: 'Alta Consistência' | 'Moderada' | 'Dispersão Elevada';
  igtScore: number; // Índice GeaAgro de Caracterização Territorial (0-100)
  igtClassificacao: 'Pleno' | 'Equilibrado' | 'Subutilizado';
  pontosFortes: string[];
  pontosAtencao: string[];
  recomendacoesValidadas: string[];
}

export interface AvaliacaoCompletaImovel {
  id: string;
  codigoLaudo: string;
  propriedadeId: string;
  solicitanteId: string;
  dataAvaliacao: string;
  dataReferenciaMercado: string;
  metodoPrincipal: MetodoAvaliacaoPrincipal;
  status: 'em_andamento' | 'vistoria_concluida' | 'calculada' | 'laudo_emitido' | 'arquivada';
  valorTotalHomogeneizadoR$: number;
  valorTotalBenfeitoriasR$: number;
  valorFinalImovelR$: number;
  intervaloAdmissivelMinR$: number;
  intervaloAdmissivelMaxR$: number;
  grauFundamentacao: GrauNormativo;
  grauPrecisao: GrauNormativo;
  conclusaoLaudo: string;
  ressalvasLimitacoes: string[];
  indicadores: IndicadoresExclusivosGeaAgro;
  estatistica?: EstatisticaTratamento;
  capitalizacaoRenda?: MetodoCapitalizacaoRendaConfig;
  metodoEvolutivo?: MetodoEvolutivoConfig;
  historicoVersoes: {
    versao: string;
    data: string;
    autor: string;
    resumoAlteracao: string;
  }[];
}
