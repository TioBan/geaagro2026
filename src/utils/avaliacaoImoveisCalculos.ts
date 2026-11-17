import {
  EstadoConservacaoRossHeidecke,
  ImovelComparativoMercado,
  EstatisticaTratamento,
  GrauNormativo,
  IndicadoresExclusivosGeaAgro,
  PropriedadeRuralAvaliacao,
  BenfeitoriaItem,
} from '../types/avaliacaoImoveis';

/**
 * Coeficientes de Ross-Heidecke (dh) para o estado de conservação
 */
export const COEFICIENTES_ROSS_HEIDECKE: Record<
  EstadoConservacaoRossHeidecke,
  { descricao: string; coeficienteReparo: number }
> = {
  A: { descricao: 'Novo / Excelente conservação', coeficienteReparo: 0.0 },
  B: { descricao: 'Muito bom / Entre novo e regular', coeficienteReparo: 0.01 },
  C: { descricao: 'Regular / Bom estado geral', coeficienteReparo: 0.032 },
  D: { descricao: 'Entre regular e reparos simples', coeficienteReparo: 0.081 },
  E: { descricao: 'Necessitando de reparos simples', coeficienteReparo: 0.181 },
  F: { descricao: 'Entre reparos simples e importantes', coeficienteReparo: 0.321 },
  G: { descricao: 'Necessitando de reparos importantes', coeficienteReparo: 0.521 },
  H: { descricao: 'Sem valor de aproveitamento / Sucata', coeficienteReparo: 1.0 },
};

/**
 * Calcula a depreciação pelo método de Ross-Heidecke (NBR 14653)
 * @param idadeAnos Idade aparente ou real da benfeitoria
 * @param vidaUtilAnos Vida útil total estimada
 * @param estado Estado de conservação segundo Heidecke (A a H)
 * @param valorResidualFracao Fração residual irredutível (ex: 0.10 a 0.20)
 * @returns { taxaDepreciacaoPct: number, fatorDepreciado: number }
 */
export function calcularDepreciacaoRossHeidecke(
  idadeAnos: number,
  vidaUtilAnos: number,
  estado: EstadoConservacaoRossHeidecke,
  valorResidualFracao = 0.15
): { taxaDepreciacaoPct: number; fatorDepreciado: number } {
  if (vidaUtilAnos <= 0) return { taxaDepreciacaoPct: 0, fatorDepreciado: 1.0 };

  const x = Math.min(1.0, Math.max(0, idadeAnos / vidaUtilAnos));
  // Depreciação física de Ross: 0.5 * (x + x^2)
  const dr = 0.5 * (x + Math.pow(x, 2));

  // Coeficiente de Heidecke
  const dh = COEFICIENTES_ROSS_HEIDECKE[estado]?.coeficienteReparo ?? 0.032;

  // Depreciação total combinada de Ross-Heidecke
  const dTotal = dr + dh * (1 - dr);
  const taxaDepreciacaoPct = Number((Math.min(1.0, Math.max(0, dTotal)) * 100).toFixed(2));

  // Aplicação do valor residual irredutível: Vd = Vn * [ (1 - R) * (1 - D) + R ]
  const fatorDepreciado = Number(((1 - valorResidualFracao) * (1 - dTotal) + valorResidualFracao).toFixed(4));

  return {
    taxaDepreciacaoPct,
    fatorDepreciado: Math.max(valorResidualFracao, Math.min(1.0, fatorDepreciado)),
  };
}

/**
 * Fatores de Homogeneização para o Método Comparativo Direto
 */
export interface ParametrosHomogeneizacao {
  areaAvaliandoHa: number;
  expoentePollock: number; // Típico: 0.125 a 0.25 (padrão 0.15)
  fatorOfertaPadrao: number; // 0.90 para anúncio, 1.00 para fechado
  topografiaAvaliando: 'Plano (0-3%)' | 'Suave Ondulado (3-8%)' | 'Ondulado (8-20%)' | 'Forte Ondulado (20-45%)' | 'Montanhoso (>45%)';
  acessoAvaliando: 'Pavimentado' | 'Terra com cascalho' | 'Terra sem conservação' | 'Misto';
  aguaAvaliando: 'Excelente' | 'Boa' | 'Regular' | 'Escassa';
  aptidaoAvaliando: 'Lavoura Alta' | 'Lavoura Média' | 'Pastagem Boa' | 'Silvicultura/Restrita';
}

export const FATORES_TOPOGRAFIA: Record<string, number> = {
  'Plano (0-3%)': 1.0,
  'Suave Ondulado (3-8%)': 0.95,
  'Ondulado (8-20%)': 0.85,
  'Forte Ondulado (20-45%)': 0.7,
  'Montanhoso (>45%)': 0.55,
};

export const FATORES_ACESSO: Record<string, number> = {
  Pavimentado: 1.0,
  'Terra com cascalho': 0.92,
  Misto: 0.85,
  'Terra sem conservação': 0.75,
};

export const FATORES_AGUA: Record<string, number> = {
  Excelente: 1.1,
  Boa: 1.0,
  Regular: 0.9,
  Escassa: 0.8,
};

export const FATORES_APTIDAO: Record<string, number> = {
  'Lavoura Alta': 1.1,
  'Lavoura Média': 1.0,
  'Pastagem Boa': 0.82,
  'Silvicultura/Restrita': 0.68,
};

/**
 * Homogeneíza uma amostra de mercado conforme a NBR 14653-3
 */
export function homogeneizarAmostra(
  amostra: ImovelComparativoMercado,
  params: ParametrosHomogeneizacao
): {
  fatorOferta: number;
  fatorDimensao: number;
  fatorTopografia: number;
  fatorAcesso: number;
  fatorAgua: number;
  fatorAptidao: number;
  fatorTotal: number;
  valorHomogeneizadoPorHaR$: number;
} {
  // 1. Fator de Oferta
  const fatorOferta = amostra.tipoValor === 'anunciado' ? params.fatorOfertaPadrao : 1.0;

  // 2. Fator de Dimensão (Fórmula de Pollock): (AreaAvaliando / AreaAmostra) ^ expoente
  let fatorDimensao = 1.0;
  if (params.areaAvaliandoHa > 0 && amostra.areaTotalHa > 0) {
    const ratio = params.areaAvaliandoHa / amostra.areaTotalHa;
    fatorDimensao = Number(Math.pow(ratio, params.expoentePollock).toFixed(4));
    // Limite de segurança técnica normativo (0.70 a 1.40)
    fatorDimensao = Math.max(0.7, Math.min(1.4, fatorDimensao));
  }

  // 3. Fator de Topografia
  const pesoTopAvaliando = FATORES_TOPOGRAFIA[params.topografiaAvaliando] ?? 1.0;
  const pesoTopAmostra = FATORES_TOPOGRAFIA[amostra.topografia] ?? 1.0;
  const fatorTopografia = Number((pesoTopAvaliando / pesoTopAmostra).toFixed(4));

  // 4. Fator de Acesso
  const pesoAcAvaliando = FATORES_ACESSO[params.acessoAvaliando] ?? 1.0;
  const pesoAcAmostra = FATORES_ACESSO[amostra.acessibilidade] ?? 0.9;
  const fatorAcesso = Number((pesoAcAvaliando / pesoAcAmostra).toFixed(4));

  // 5. Fator de Recursos Hídricos
  const pesoAgAvaliando = FATORES_AGUA[params.aguaAvaliando] ?? 1.0;
  const pesoAgAmostra = FATORES_AGUA[amostra.disponibilidadeHidrica] ?? 1.0;
  const fatorAgua = Number((pesoAgAvaliando / pesoAgAmostra).toFixed(4));

  // 6. Fator de Aptidão Agrícola
  const pesoAptAvaliando = FATORES_APTIDAO[params.aptidaoAvaliando] ?? 1.0;
  const pesoAptAmostra = FATORES_APTIDAO[amostra.aptidaoAgricola] ?? 1.0;
  const fatorAptidao = Number((pesoAptAvaliando / pesoAptAmostra).toFixed(4));

  // Fator Total Combinado
  const fatorTotal = Number(
    (fatorOferta * fatorDimensao * fatorTopografia * fatorAcesso * fatorAgua * fatorAptidao).toFixed(4)
  );

  const valorUnitarioBase =
    amostra.precoPorHectareR$ > 0
      ? amostra.precoPorHectareR$
      : amostra.areaTotalHa > 0
      ? amostra.valorInformadoR$ / amostra.areaTotalHa
      : 0;

  const valorHomogeneizadoPorHaR$ = Number((valorUnitarioBase * fatorTotal).toFixed(2));

  return {
    fatorOferta,
    fatorDimensao,
    fatorTopografia,
    fatorAcesso,
    fatorAgua,
    fatorAptidao,
    fatorTotal,
    valorHomogeneizadoPorHaR$,
  };
}

/**
 * Tratamento Estatístico Completo com Detecção de Outliers e NBR 14653-3
 */
export function calcularTratamentoEstatistico(
  amostras: ImovelComparativoMercado[],
  params: ParametrosHomogeneizacao
): EstatisticaTratamento {
  if (!amostras || amostras.length === 0) {
    return {
      quantidadeAmostras: 0,
      mediaR$PorHa: 0,
      medianaR$PorHa: 0,
      desvioPadraoR$PorHa: 0,
      varianciaR$PorHa: 0,
      coeficienteVariacaoPct: 0,
      minimoR$PorHa: 0,
      maximoR$PorHa: 0,
      amplitudeR$PorHa: 0,
      quartil1R$PorHa: 0,
      quartil3R$PorHa: 0,
      intervaloConfianca80Min: 0,
      intervaloConfianca80Max: 0,
      intervaloToleranciaMin15Pct: 0,
      intervaloToleranciaMax15Pct: 0,
      grauFundamentacaoApurado: 'Grau I',
      grauPrecisaoApurado: 'Grau I',
      outliersExcluidos: [],
    };
  }

  // 1. Homogeneização inicial de todos os elementos ativos
  const elementosAtivos = amostras.filter(a => a.statusInclusao !== 'descartado_outlier');
  const valoresCalculados = elementosAtivos.map(a => {
    const homog = homogeneizarAmostra(a, params);
    return {
      id: a.id,
      codigo: a.codigo,
      area: a.areaTotalHa,
      valorHomog: homog.valorHomogeneizadoPorHaR$,
    };
  });

  if (valoresCalculados.length === 0) {
    return calcularTratamentoEstatistico([], params);
  }

  // Primeira passagem: média e desvio preliminar para Chauvenet / 2 sigmas
  const rawValues = valoresCalculados.map(v => v.valorHomog);
  const rawMedia = rawValues.reduce((s, val) => s + val, 0) / rawValues.length;
  const rawVariance = rawValues.reduce((s, val) => s + Math.pow(val - rawMedia, 2), 0) / (rawValues.length || 1);
  const rawStdDev = Math.sqrt(rawVariance);

  // Critério de 2 Desvios Padrão para expurgo de outliers
  const outliers: string[] = [];
  const elementosFiltrados = valoresCalculados.filter(item => {
    const diff = Math.abs(item.valorHomog - rawMedia);
    const isOutlier = rawStdDev > 0 && diff > 2.0 * rawStdDev && valoresCalculados.length >= 5;
    if (isOutlier) {
      outliers.push(item.codigo);
      return false;
    }
    return true;
  });

  const finalValues = (elementosFiltrados.length > 0 ? elementosFiltrados : valoresCalculados)
    .map(v => v.valorHomog)
    .sort((a, b) => a - b);

  const n = finalValues.length;
  const media = finalValues.reduce((acc, v) => acc + v, 0) / n;
  const variancia = finalValues.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n > 1 ? n - 1 : 1);
  const desvioPadrao = Math.sqrt(variancia);
  const cvPct = media > 0 ? (desvioPadrao / media) * 100 : 0;

  // Mediana
  const mid = Math.floor(n / 2);
  const mediana = n % 2 !== 0 ? finalValues[mid] : (finalValues[mid - 1] + finalValues[mid]) / 2;

  // Quartis
  const q1 = finalValues[Math.floor(n * 0.25)] ?? finalValues[0];
  const q3 = finalValues[Math.floor(n * 0.75)] ?? finalValues[n - 1];

  const min = finalValues[0];
  const max = finalValues[n - 1];
  const amplitude = max - min;

  // Intervalo de Confiança a 80% (t-Student aproximado para N pequeno)
  const tStudent80 = n >= 12 ? 1.356 : n >= 8 ? 1.415 : n >= 5 ? 1.533 : 1.886;
  const erroPadraoMedia = n > 0 ? desvioPadrao / Math.sqrt(n) : 0;
  const intervaloConfianca80Min = Math.max(0, media - tStudent80 * erroPadraoMedia);
  const intervaloConfianca80Max = media + tStudent80 * erroPadraoMedia;

  // Campo de arbítrio / tolerância de 15%
  const intervaloToleranciaMin15Pct = media * 0.85;
  const intervaloToleranciaMax15Pct = media * 1.15;

  // Grau de Precisão e Fundamentação NBR 14653-3
  let grauPrecisao: GrauNormativo = 'Grau I';
  if (cvPct <= 15 && n >= 10) grauPrecisao = 'Grau III';
  else if (cvPct <= 20 && n >= 6) grauPrecisao = 'Grau II';

  let grauFundamentacao: GrauNormativo = 'Grau I';
  if (n >= 12 && cvPct <= 20) grauFundamentacao = 'Grau III';
  else if (n >= 6 && cvPct <= 25) grauFundamentacao = 'Grau II';

  // Regressão Linear Simples: Preço/ha (y) x Área Total (x)
  let regressao: EstatisticaTratamento['regressao'];
  if (n >= 4) {
    const xArr = elementosFiltrados.map(e => e.area);
    const yArr = elementosFiltrados.map(e => e.valorHomog);
    const xMean = xArr.reduce((a, b) => a + b, 0) / n;
    const yMean = yArr.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xArr[i] - xMean) * (yArr[i] - yMean);
      den += Math.pow(xArr[i] - xMean, 2);
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;

    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const yPred = intercept + slope * xArr[i];
      ssTot += Math.pow(yArr[i] - yMean, 2);
      ssRes += Math.pow(yArr[i] - yPred, 2);
    }
    const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    const r2Ajustado = n > 2 ? Math.max(0, 1 - (1 - r2) * ((n - 1) / (n - 2))) : r2;
    const fSnedecor = ssRes > 0 && n > 2 ? (ssTot - ssRes) / (ssRes / (n - 2)) : 0;

    regressao = {
      equacao: `y = ${slope >= 0 ? '+' : ''}${slope.toFixed(2)} · Área + ${intercept.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      r2: Number(r2.toFixed(3)),
      r2Ajustado: Number(r2Ajustado.toFixed(3)),
      fSnedecor: Number(fSnedecor.toFixed(2)),
      significativo: r2 >= 0.65 && fSnedecor > 4.5,
    };
  }

  return {
    quantidadeAmostras: n,
    mediaR$PorHa: Number(media.toFixed(2)),
    medianaR$PorHa: Number(mediana.toFixed(2)),
    desvioPadraoR$PorHa: Number(desvioPadrao.toFixed(2)),
    varianciaR$PorHa: Number(variancia.toFixed(2)),
    coeficienteVariacaoPct: Number(cvPct.toFixed(2)),
    minimoR$PorHa: Number(min.toFixed(2)),
    maximoR$PorHa: Number(max.toFixed(2)),
    amplitudeR$PorHa: Number(amplitude.toFixed(2)),
    quartil1R$PorHa: Number(q1.toFixed(2)),
    quartil3R$PorHa: Number(q3.toFixed(2)),
    intervaloConfianca80Min: Number(intervaloConfianca80Min.toFixed(2)),
    intervaloConfianca80Max: Number(intervaloConfianca80Max.toFixed(2)),
    intervaloToleranciaMin15Pct: Number(intervaloToleranciaMin15Pct.toFixed(2)),
    intervaloToleranciaMax15Pct: Number(intervaloToleranciaMax15Pct.toFixed(2)),
    grauFundamentacaoApurado: grauFundamentacao,
    grauPrecisaoApurado: grauPrecisao,
    outliersExcluidos: outliers,
    regressao,
  };
}

/**
 * Calcula os 4 Indicadores Exclusivos GeaAgro
 */
export function calcularIndicadoresGeaAgro(
  propriedade: PropriedadeRuralAvaliacao,
  benfeitorias: BenfeitoriaItem[],
  amostras: ImovelComparativoMercado[]
): IndicadoresExclusivosGeaAgro {
  const pontosFortes: string[] = [];
  const pontosAtencao: string[] = [];
  const recomendacoesValidadas: string[] = [];

  // 1. IPR - Índice de Potencial Rural (0-100)
  // Pesos: Solo (30%) + Relevo/Mecanização (25%) + Água (20%) + Logística/Acesso (15%) + Economia Regional (10%)
  let scoreSolo = 70;
  if (propriedade.solosTopografia?.fertilidadeQuimica === 'Alta') scoreSolo += 20;
  else if (propriedade.solosTopografia?.fertilidadeQuimica === 'Baixa') scoreSolo -= 20;
  if (propriedade.solosTopografia?.profundidadeEfetiva.includes('Muito profunda')) scoreSolo += 10;
  scoreSolo = Math.min(100, Math.max(10, scoreSolo));

  let scoreRelevo = 75;
  if (propriedade.solosTopografia?.relevo.includes('Plano')) scoreRelevo = 100;
  else if (propriedade.solosTopografia?.relevo.includes('Suave')) scoreRelevo = 90;
  else if (propriedade.solosTopografia?.relevo.includes('Ondulado')) scoreRelevo = 65;
  else scoreRelevo = 40;

  let scoreAgua = 70;
  if (propriedade.aptidao?.potencialIrrigacao === 'Alto') scoreAgua = 95;
  else if (propriedade.aptidao?.potencialIrrigacao === 'Médio') scoreAgua = 80;
  else if (propriedade.aptidao?.potencialIrrigacao === 'Baixo') scoreAgua = 60;
  else scoreAgua = 40;

  let scoreLogistica = 75;
  if (propriedade.regional?.acessoRodoviario === 'Pavimentado') scoreLogistica = 95;
  else if (propriedade.regional?.acessoRodoviario === 'Terra com cascalho') scoreLogistica = 80;
  else scoreLogistica = 55;
  if (propriedade.regional?.distanciaCentroUrbanoKm > 60) scoreLogistica -= 15;

  const iprScore = Math.round(
    scoreSolo * 0.3 + scoreRelevo * 0.25 + scoreAgua * 0.2 + scoreLogistica * 0.15 + 80 * 0.1
  );

  let iprClassificacao: IndicadoresExclusivosGeaAgro['iprClassificacao'] = 'Médio';
  if (iprScore >= 85) iprClassificacao = 'Excelente';
  else if (iprScore >= 70) iprClassificacao = 'Bom';
  else if (iprScore < 50) iprClassificacao = 'Restrito';

  if (iprScore >= 80) pontosFortes.push('Excelente aptidão pedoclimática e potencial produtivo mecanizado (IPR alto).');
  else pontosAtencao.push('Limitações de topografia, fertilidade ou logística demandam adequações no manejo.');

  // 2. ICV - Índice de Conservação das Benfeitorias (0-100)
  let icvScore = 80;
  if (benfeitorias.length > 0) {
    const pesosConservacao: Record<EstadoConservacaoRossHeidecke, number> = {
      A: 100,
      B: 90,
      C: 75,
      D: 60,
      E: 45,
      F: 30,
      G: 15,
      H: 0,
    };
    const somaNotas = benfeitorias.reduce((acc, b) => acc + (pesosConservacao[b.estadoConservacao] ?? 70), 0);
    icvScore = Math.round(somaNotas / benfeitorias.length);
  }

  let icvClassificacao: IndicadoresExclusivosGeaAgro['icvClassificacao'] = 'Regular';
  if (icvScore >= 85) icvClassificacao = 'Ótimo';
  else if (icvScore >= 70) icvClassificacao = 'Bom';
  else if (icvScore < 50) icvClassificacao = 'Crítico';

  if (icvScore >= 80) pontosFortes.push('Benfeitorias e infraestrutura com manutenção rigorosa e alta vida útil residual.');
  else pontosAtencao.push('Benfeitorias necessitam de reformas pontuais conforme apurado no método Ross-Heidecke.');

  // 3. IGM - Índice GeaAgro de Mercado (0-100)
  let igmScore = 75;
  if (amostras.length >= 10) igmScore += 15;
  else if (amostras.length >= 5) igmScore += 5;
  else igmScore -= 20;

  const validSamples = amostras.filter(a => a.statusInclusao === 'incluido');
  if (validSamples.length >= 6) {
    const values = validSamples.map(a => a.precoPorHectareR$ || 1);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length);
    const cv = (std / (avg || 1)) * 100;
    if (cv <= 15) igmScore += 10;
    else if (cv > 25) igmScore -= 10;
  }
  igmScore = Math.max(20, Math.min(100, igmScore));

  let igmClassificacao: IndicadoresExclusivosGeaAgro['igmClassificacao'] = 'Moderada';
  if (igmScore >= 80) igmClassificacao = 'Alta Consistência';
  else if (igmScore < 60) igmClassificacao = 'Dispersão Elevada';

  // 4. IGT - Índice GeaAgro de Caracterização Territorial (0-100)
  const total = propriedade.areaTotalHa || 100;
  const agricola = propriedade.territorial?.areaAgricultavelHa || total * 0.7;
  const ambiental = (propriedade.territorial?.areaAppHa || 0) + (propriedade.territorial?.areaReservaLegalHa || 0);

  const percAproveitamento = (agricola / total) * 100;
  const percAmbiental = (ambiental / total) * 100;

  let igtScore = 70;
  if (percAproveitamento >= 65 && percAproveitamento <= 80) igtScore += 20;
  if (percAmbiental >= 20) igtScore += 10; // Compliance código florestal
  igtScore = Math.min(100, Math.max(30, igtScore));

  let igtClassificacao: IndicadoresExclusivosGeaAgro['igtClassificacao'] = 'Equilibrado';
  if (igtScore >= 85) igtClassificacao = 'Pleno';
  else if (igtScore < 60) igtClassificacao = 'Subutilizado';

  recomendacoesValidadas.push('Manter o CAR atualizado e o cronograma de manutenção predial preventiva.');
  recomendacoesValidadas.push('Atualizar a pesquisa de dados de mercado a cada 90 dias para garantir o valor patrimonial contemporâneo.');

  return {
    iprScore,
    iprClassificacao,
    icvScore,
    icvClassificacao,
    igmScore,
    igmClassificacao,
    igtScore,
    igtClassificacao,
    pontosFortes,
    pontosAtencao,
    recomendacoesValidadas,
  };
}



export function calcularFatorOferta(
  tipoValor: 'anunciado' | 'negociado_efetivo',
  margemOferta = 0.9
): number {
  return tipoValor === 'anunciado' ? margemOferta : 1.0;
}

export function calcularFatorDimensaoPollock(
  areaAmostraHa: number,
  areaAvaliandoHa: number,
  expoente = 0.125
): number {
  if (areaAmostraHa <= 0 || areaAvaliandoHa <= 0) return 1.0;
  const ratio = areaAvaliandoHa / areaAmostraHa;
  const val = Math.pow(ratio, expoente);
  return Number(Math.max(0.7, Math.min(1.4, val)).toFixed(3));
}

export function calcularFatorTopografia(
  topografiaAmostra: string,
  topografiaAvaliando = 'Plano (0-3%)'
): number {
  const pAvaliando = FATORES_TOPOGRAFIA[topografiaAvaliando] ?? 1.0;
  const pAmostra = FATORES_TOPOGRAFIA[topografiaAmostra] ?? 1.0;
  return Number((pAvaliando / pAmostra).toFixed(3));
}

export function calcularFatorAcessibilidade(
  distanciaAsfaltoKmAmostra: number,
  distanciaAsfaltoKmAvaliando = 5
): number {
  const delta = distanciaAsfaltoKmAmostra - distanciaAsfaltoKmAvaliando;
  const fator = 1 + delta * 0.005;
  return Number(Math.max(0.7, Math.min(1.3, fator)).toFixed(3));
}

export function calcularEstatisticasTratamento(
  amostras: ImovelComparativoMercado[],
  params?: Partial<ParametrosHomogeneizacao>
): EstatisticaTratamento {
  const defaultParams: ParametrosHomogeneizacao = {
    areaAvaliandoHa: 500,
    expoentePollock: 0.125,
    fatorOfertaPadrao: 0.9,
    topografiaAvaliando: 'Plano (0-3%)',
    acessoAvaliando: 'Terra com cascalho',
    aguaAvaliando: 'Boa',
    aptidaoAvaliando: 'Lavoura Alta',
    ...params,
  };
  return calcularTratamentoEstatistico(amostras, defaultParams);
}

export function calcularIndicadoresExclusivosGeaAgro(
  propriedade: PropriedadeRuralAvaliacao,
  benfeitorias: BenfeitoriaItem[],
  estatisticaOuAmostras: EstatisticaTratamento | ImovelComparativoMercado[]
): IndicadoresExclusivosGeaAgro {
  if (Array.isArray(estatisticaOuAmostras)) {
    return calcularIndicadoresGeaAgro(propriedade, benfeitorias, estatisticaOuAmostras);
  }

  const base = calcularIndicadoresGeaAgro(propriedade, benfeitorias, []);
  const n = estatisticaOuAmostras.quantidadeAmostras || 0;
  const cv = estatisticaOuAmostras.coeficienteVariacaoPct || 0;

  let igmScore = 75;
  if (n >= 10) igmScore += 15;
  else if (n >= 5) igmScore += 5;
  else igmScore -= 20;

  if (n >= 6) {
    if (cv <= 15) igmScore += 10;
    else if (cv > 25) igmScore -= 10;
  }
  igmScore = Math.max(20, Math.min(100, igmScore));

  let igmClassificacao: IndicadoresExclusivosGeaAgro['igmClassificacao'] = 'Moderada';
  if (igmScore >= 80) igmClassificacao = 'Alta Consistência';
  else if (igmScore < 60) igmClassificacao = 'Dispersão Elevada';

  return {
    ...base,
    igmScore,
    igmClassificacao,
  };
}

export function calcularMetodoCapitalizacaoRenda(
  fluxoLiquidoAnualR$: number,
  taxaDescontoAnualPct: number,
  horizonteAnos: number,
  valorResidualFinalR$: number
): {
  valorPresenteLiquido: number;
  sensibilidade: { cenario: string; variacaoReceitaPct: number; taxaDescontoPct: number; vplR$: number }[];
} {
  const i = Math.max(0, taxaDescontoAnualPct || 0) / 100;
  let somaFluxoVP = 0;
  for (let t = 1; t <= horizonteAnos; t++) {
    somaFluxoVP += fluxoLiquidoAnualR$ / Math.pow(1 + i, t);
  }
  const vpResidual = horizonteAnos > 0 ? valorResidualFinalR$ / Math.pow(1 + i, horizonteAnos) : valorResidualFinalR$;
  const vpl = Math.round(somaFluxoVP + vpResidual);

  const sensibilidade = [
    {
      cenario: 'Cenário Otimista (+15% Receita)',
      variacaoReceitaPct: 15,
      taxaDescontoPct: taxaDescontoAnualPct,
      vplR$: Math.round(vpl * 1.15),
    },
    {
      cenario: 'Cenário Base (Estimativa Atual)',
      variacaoReceitaPct: 0,
      taxaDescontoPct: taxaDescontoAnualPct,
      vplR$: vpl,
    },
    {
      cenario: 'Cenário Conservador (-15% Receita)',
      variacaoReceitaPct: -15,
      taxaDescontoPct: taxaDescontoAnualPct,
      vplR$: Math.round(vpl * 0.85),
    },
  ];

  return { valorPresenteLiquido: vpl, sensibilidade };
}

export function calcularMetodoEvolutivo(
  valorTerraNuaR$: number,
  valorBenfeitoriasR$: number,
  fatorComercializacaoFc = 1.0
): { valorFinal: number } {
  const soma = valorTerraNuaR$ + valorBenfeitoriasR$;
  const valorFinal = Math.round(soma * fatorComercializacaoFc);
  return { valorFinal };
}

