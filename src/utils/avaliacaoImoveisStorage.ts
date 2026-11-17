import {
  PropriedadeRuralAvaliacao,
  SolicitanteAvaliacao,
  BenfeitoriaItem,
  ImovelComparativoMercado,
  VistoriaTecnica,
  DocumentoDueDiligence,
  SimuladorCenarioMelhoria,
  AvaliacaoCompletaImovel
} from '../types/avaliacaoImoveis';
import {
  calcularEstatisticasTratamento,
  calcularIndicadoresExclusivosGeaAgro
} from './avaliacaoImoveisCalculos';

const STORAGE_KEYS = {
  PROPRIEDADES: 'geaagro_propriedades_avaliacao_v1',
  SOLICITANTES: 'geaagro_solicitantes_avaliacao_v1',
  BENFEITORIAS: 'geaagro_benfeitorias_avaliacao_v1',
  COMPARATIVOS: 'geaagro_comparativos_mercado_v1',
  VISTORIAS: 'geaagro_vistorias_avaliacao_v1',
  DUE_DILIGENCE: 'geaagro_due_diligence_avaliacao_v1',
  SIMULADORES: 'geaagro_simuladores_avaliacao_v1',
  AVALIACOES: 'geaagro_avaliacoes_completas_v1',
  SELECTED_PROP_ID: 'geaagro_avaliacao_selected_prop_id'
};

// ==========================================
// DADOS INICIAIS PADRÃO VAZIOS (FORMULÁRIOS LIMPOS)
// ==========================================

export const PROPRIEDADE_PADRAO_SEED: PropriedadeRuralAvaliacao = {
  id: 'prop-01',
  codigoInterno: '',
  nome: '',
  proprietarioNome: '',
  proprietarioCpfCnpj: '',
  proprietarioContato: '',
  municipio: '',
  estado: '',
  endereco: '',
  coordenadasGps: {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    precisaoM: 0
  },
  areaTotalHa: 0,
  numeroMatricula: '',
  cartorioRegistro: '',
  numeroCar: '',
  numeroCcir: '',
  numeroItr: '',
  responsavelTecnicoNome: '',
  responsavelTecnicoCrea: '',
  dataCadastro: new Date().toISOString().split('T')[0],
  fotografias: [],
  observacoesGerais: '',
  territorial: {
    areaTotalHa: 0,
    areaAgricultavelHa: 0,
    areaPastagensHa: 0,
    areaLavourasHa: 0,
    areaSilviculturaHa: 0,
    areaReservaLegalHa: 0,
    areaAppHa: 0,
    areaVegetacaoNativaHa: 0,
    areaIrrigadaHa: 0,
    areaInfraestruturaHa: 0,
    areaAlagavelHa: 0,
    areaRestricoesUsoHa: 0,
    areaImprodutivaHa: 0,
    areaServidaoHa: 0,
    glebas: []
  },
  regional: {
    microrregiao: '',
    distanciaCentroUrbanoKm: 0,
    distanciaCooperativaArmazemKm: 0,
    acessoRodoviario: 'Pavimentado',
    condicoesEstradas: 'Boa',
    disponibilidadeEnergia: 'Trifásica',
    logisticaEscoamento: '',
    mercadosConsumidores: '',
    servicosAgricolasDisponiveis: '',
    caracteristicasEconomicas: ''
  },
  solosTopografia: {
    classeSolo: '',
    textura: 'Argilosa (35-60%)',
    profundidadeEfetiva: 'Profunda (1-2m)',
    fertilidadeQuimica: 'Média',
    acidezPh: 'Média (pH 5.2 - 6.0)',
    materiaOrganica: 'Média (20-35 g/dm³)',
    capacidadeRetencaoAgua: 'Média',
    drenagem: 'Boa',
    pedregosidade: 'Nula',
    compactacaoErosao: '',
    relevo: 'Plano (0-3%)',
    declividadeMediaPct: 0,
    mecanizacaoAptidao: 'Totalmente mecanizável'
  },
  aptidao: {
    classeCapacidadeUso: 'Classe I',
    aptidaoAgricolaEmbrapa: '1 - Boa para Lavouras',
    culturasExploradas: [],
    historicoProdutividade: [],
    potencialIrrigacao: 'Médio',
    recursosHidricos: [],
    praticasConservacionistas: ''
  }
};

export const SOLICITANTE_PADRAO_SEED: SolicitanteAvaliacao = {
  id: 'sol-01',
  solicitanteNome: '',
  solicitanteCpfCnpj: '',
  solicitanteContato: '',
  solicitanteEndereco: '',
  contratanteNome: '',
  contratanteCpfCnpj: '',
  finalidade: 'compra_venda',
  dataReferencia: new Date().toISOString().split('T')[0],
  objetoAvaliacao: '',
  pressupostosCondicoesLimitantes: '',
  profissionalResponsavel: '',
  creaNumero: '',
  artNumero: ''
};

export const VISTORIA_PADRAO_SEED: VistoriaTecnica = {
  id: 'vistoria-01',
  propriedadeId: 'prop-01',
  dataVistoria: new Date().toISOString().split('T')[0],
  horaVistoria: '08:00',
  vistoriadorNome: '',
  vistoriadorCrea: '',
  condicoesClimaticas: '',
  checklist: [],
  pontosInteresse: [],
  fotografiasGeorreferenciadas: [],
  notasGerais: ''
};

// ==========================================
// MÉTODOS DE ACESSO AO LOCALSTORAGE (CRUD)
// ==========================================

export function carregarPropriedades(): PropriedadeRuralAvaliacao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPRIEDADES);
    if (!raw) {
      salvarPropriedades([PROPRIEDADE_PADRAO_SEED]);
      return [PROPRIEDADE_PADRAO_SEED];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [PROPRIEDADE_PADRAO_SEED];
  } catch (e) {
    console.error('Erro ao ler propriedades:', e);
    return [PROPRIEDADE_PADRAO_SEED];
  }
}

export function salvarPropriedades(props: PropriedadeRuralAvaliacao[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROPRIEDADES, JSON.stringify(props));
  } catch (e) {
    console.error('Erro ao salvar propriedades:', e);
  }
}

export function carregarPropriedadeSelecionadaId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.SELECTED_PROP_ID);
    return id || PROPRIEDADE_PADRAO_SEED.id;
  } catch {
    return PROPRIEDADE_PADRAO_SEED.id;
  }
}

export function salvarPropriedadeSelecionadaId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROP_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function carregarSolicitante(propId: string): SolicitanteAvaliacao {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SOLICITANTES}_${propId}`);
    if (raw) return JSON.parse(raw);
    return SOLICITANTE_PADRAO_SEED;
  } catch {
    return SOLICITANTE_PADRAO_SEED;
  }
}

export function salvarSolicitante(propId: string, sol: SolicitanteAvaliacao): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SOLICITANTES}_${propId}`, JSON.stringify(sol));
  } catch (e) {
    console.error(e);
  }
}

export function carregarBenfeitorias(propId: string): BenfeitoriaItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.BENFEITORIAS}_${propId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (propId === PROPRIEDADE_PADRAO_SEED.id) {
      salvarBenfeitorias(propId, []);
    }
    return [];
  } catch {
    return [];
  }
}

export function salvarBenfeitorias(propId: string, itens: BenfeitoriaItem[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.BENFEITORIAS}_${propId}`, JSON.stringify(itens));
  } catch (e) {
    console.error(e);
  }
}

export function carregarComparativos(): ImovelComparativoMercado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPARATIVOS);
    if (!raw) {
      salvarComparativos([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return [];
  }
}

export function salvarComparativos(comparativos: ImovelComparativoMercado[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPARATIVOS, JSON.stringify(comparativos));
  } catch (e) {
    console.error(e);
  }
}

export function carregarVistoria(propId: string): VistoriaTecnica {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.VISTORIAS}_${propId}`);
    if (raw) return JSON.parse(raw);
    if (propId === PROPRIEDADE_PADRAO_SEED.id) {
      salvarVistoria(propId, VISTORIA_PADRAO_SEED);
      return VISTORIA_PADRAO_SEED;
    }
    return {
      id: `vistoria-${Date.now()}`,
      propriedadeId: propId,
      dataVistoria: new Date().toISOString().split('T')[0],
      horaVistoria: '08:00',
      vistoriadorNome: '',
      vistoriadorCrea: '',
      condicoesClimaticas: 'Bom',
      checklist: [],
      pontosInteresse: [],
      fotografiasGeorreferenciadas: [],
      notasGerais: ''
    };
  } catch {
    return VISTORIA_PADRAO_SEED;
  }
}

export function salvarVistoria(propId: string, vistoria: VistoriaTecnica): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.VISTORIAS}_${propId}`, JSON.stringify(vistoria));
  } catch (e) {
    console.error(e);
  }
}

export function carregarDueDiligence(propId: string): DocumentoDueDiligence[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DUE_DILIGENCE}_${propId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (propId === PROPRIEDADE_PADRAO_SEED.id) {
      salvarDueDiligence(propId, []);
    }
    return [];
  } catch {
    return [];
  }
}

export function salvarDueDiligence(propId: string, docs: DocumentoDueDiligence[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.DUE_DILIGENCE}_${propId}`, JSON.stringify(docs));
  } catch (e) {
    console.error(e);
  }
}

export function carregarSimuladores(propId: string): SimuladorCenarioMelhoria[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SIMULADORES}_${propId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (propId === PROPRIEDADE_PADRAO_SEED.id) {
      salvarSimuladores(propId, []);
    }
    return [];
  } catch {
    return [];
  }
}

export function salvarSimuladores(propId: string, sims: SimuladorCenarioMelhoria[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.SIMULADORES}_${propId}`, JSON.stringify(sims));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Gera ou recupera uma avaliação completa calculada para a propriedade ativa
 */
export function carregarAvaliacaoCompleta(propId: string): AvaliacaoCompletaImovel {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.AVALIACOES}_${propId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  // Se não existir, gera uma avaliação inicial calculada
  const props = carregarPropriedades();
  const prop = props.find((p) => p.id === propId) || PROPRIEDADE_PADRAO_SEED;
  const benfeitorias = carregarBenfeitorias(propId);
  const comparativos = carregarComparativos().filter((c) => c.statusInclusao === 'incluido');
  const estatistica = calcularEstatisticasTratamento(comparativos, { areaAvaliandoHa: prop.areaTotalHa || 500 });
  const indicadores = calcularIndicadoresExclusivosGeaAgro(prop, benfeitorias, comparativos);

  const valorTerraNuaR$ = prop.areaTotalHa * estatistica.mediaR$PorHa;
  const valorBenfeitoriasR$ = benfeitorias.reduce((acc, b) => acc + (b.valorDepreciadoFinalR$ || 0), 0);
  const valorFinalImovelR$ = valorTerraNuaR$ + valorBenfeitoriasR$;

  const hojeIso = new Date().toISOString().split('T')[0];

  const avaliacao: AvaliacaoCompletaImovel = {
    id: `aval-${propId}`,
    codigoLaudo: `LAUDO-NBR-${new Date().getFullYear()}-${prop.codigoInterno.replace(/[^0-9]/g, '').slice(0, 4) || '101'}`,
    propriedadeId: propId,
    solicitanteId: 'sol-01',
    dataAvaliacao: hojeIso,
    dataReferenciaMercado: hojeIso,
    metodoPrincipal: 'comparativo_direto',
    status: 'calculada',
    valorTotalHomogeneizadoR$: valorTerraNuaR$,
    valorTotalBenfeitoriasR$: valorBenfeitoriasR$,
    valorFinalImovelR$: valorFinalImovelR$,
    intervaloAdmissivelMinR$: valorFinalImovelR$ * 0.85,
    intervaloAdmissivelMaxR$: valorFinalImovelR$ * 1.15,
    grauFundamentacao: estatistica.grauFundamentacaoApurado,
    grauPrecisao: estatistica.grauPrecisaoApurado,
    conclusaoLaudo: `O valor de mercado estimado para o imóvel rural denominado ${prop.nome}, com área total de ${prop.areaTotalHa.toLocaleString('pt-BR')} hectares e benfeitorias, em condições vigentes de mercado, é fixado em R$ ${valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    ressalvasLimitacoes: [
      'Avaliação estritamente patrimonial e mercadológica conforme ABNT NBR 14653-3:2019.',
      'Não substitui laudo ambiental formal nem perícia de demarcação geodésica presencial.',
      'Válida para as condições de mercado da data de referência indicada.'
    ],
    indicadores,
    estatistica,
    historicoVersoes: [
      {
        versao: '1.0',
        data: new Date().toISOString().split('T')[0],
        autor: 'GeaAgro NBR 14653 Engine',
        resumoAlteracao: 'Emissão e cálculo inicial do laudo patrimonial'
      }
    ]
  };

  salvarAvaliacaoCompleta(propId, avaliacao);
  return avaliacao;
}

export function salvarAvaliacaoCompleta(propId: string, aval: AvaliacaoCompletaImovel): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.AVALIACOES}_${propId}`, JSON.stringify(aval));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Reseta totalmente os dados salvos em localStorage do módulo de Avaliação de Imóveis Rurais
 */
export function resetarTodosOsDadosAvaliacao(): void {
  try {
    const evaluationPrefixes = Object.values(STORAGE_KEYS);
    evaluationPrefixes.forEach((key) => {
      localStorage.removeItem(key);
    });
    // Remove apenas chaves dinâmicas com sufixos pertencentes ao módulo de Avaliação de Imóveis
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && evaluationPrefixes.some((prefix) => k.startsWith(`${prefix}_`))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Erro ao resetar dados de avaliação:', e);
  }
}

