/**
 * GeaAgro Recupera - Motor de Cálculos e Regras Agronômicas Auditáveis
 * Embasamento técnico: Embrapa, IAC (Boletim 100), SBCS (5ª Aproximação),
 * Guia de Adubação e Calagem do Cerrado (Sousa & Lobato), NBR 14653 e literatura de conservação de solos.
 */

import {
  CalculoCalagemResultado,
  CalculoGessagemResultado,
  CalculoAdubacaoResultado,
  CalculoSementesResultado,
  CalculoMudasResultado,
  IgraDimensoes,
  MemoriaCalculo
} from '../types/recupera';

// ========================================================
// 1. CALCULADORA DE CALAGEM COM MEMÓRIA DE CÁLCULO
// ========================================================

export interface ParametrosCalagem {
  ctcPh7T: number; // T em cmolc/dm³
  vAtualPct: number; // V1 %
  vDesejadoPct: number; // V2 % (ex: 60% ou 70%)
  prntPct: number; // PRNT do calcário comercial (ex: 85%)
  profundidadeCm: number; // profundidade de incorporação (ex: 20 cm)
  areaHa: number;
  custoPorToneladaR$?: number;
  metodo?: 'saturacao_bases' | 'neutralizacao_aluminio';
  // Parâmetros opcionais para o método de neutralização de Al
  alCmolcDm3?: number;
  caMgCmolcDm3?: number;
  texturaSolo?: 'arenosa' | 'media' | 'argilosa';
}

export function calcularCalagemRecupera(params: ParametrosCalagem): CalculoCalagemResultado {
  const {
    ctcPh7T,
    vAtualPct,
    vDesejadoPct,
    prntPct = 85,
    profundidadeCm = 20,
    areaHa,
    custoPorToneladaR$ = 180,
    metodo = 'saturacao_bases',
    alCmolcDm3 = 0,
    caMgCmolcDm3 = 1.5,
    texturaSolo = 'argilosa'
  } = params;

  let ncSemPrnt = 0;
  const passos: string[] = [];

  if (metodo === 'saturacao_bases') {
    // Fórmula clássica IAC / Embrapa: NC (t/ha) = [ (V2 - V1) * T ] / 100
    const deltaV = Math.max(0, vDesejadoPct - vAtualPct);
    ncSemPrnt = (deltaV * ctcPh7T) / 100;

    passos.push(`1. Variação de saturação por bases: ΔV = V2 (${vDesejadoPct}%) - V1 (${vAtualPct.toFixed(1)}%) = ${deltaV.toFixed(1)}%`);
    passos.push(`2. Cálculo base de necessidade: NC = (ΔV × CTC a pH 7.0) / 100 = (${deltaV.toFixed(1)} × ${ctcPh7T.toFixed(2)}) / 100 = ${ncSemPrnt.toFixed(2)} t/ha`);
  } else {
    // Método Neutralização de Al3+ e Elevação de Ca+Mg
    // NC = Y * Al + [X - (Ca + Mg)]
    let Y = 2.0; // fator tampão por textura
    if (texturaSolo === 'arenosa') Y = 1.0;
    else if (texturaSolo === 'media') Y = 1.5;

    const xRequerido = 2.0; // Requerimento mínimo de Ca+Mg para culturas
    const faltaCaMg = Math.max(0, xRequerido - caMgCmolcDm3);
    ncSemPrnt = (Y * alCmolcDm3) + faltaCaMg;

    passos.push(`1. Fator tampão Y para solo ${texturaSolo}: ${Y}`);
    passos.push(`2. Neutralização do Al3+: Y × Al = ${Y} × ${alCmolcDm3} = ${(Y * alCmolcDm3).toFixed(2)} t/ha`);
    passos.push(`3. Elevação de Ca+Mg: X - (Ca+Mg) = ${xRequerido} - ${caMgCmolcDm3} = ${faltaCaMg.toFixed(2)} t/ha`);
    passos.push(`4. NC bruta = ${(Y * alCmolcDm3).toFixed(2)} + ${faltaCaMg.toFixed(2)} = ${ncSemPrnt.toFixed(2)} t/ha`);
  }

  // Ajuste por PRNT
  const fatorPrnt = 100 / Math.max(50, prntPct);
  // Ajuste por Profundidade de incorporação (padrão é 20 cm)
  const fatorProfundidade = profundidadeCm / 20;

  const doseCorrigida = Math.max(0, ncSemPrnt * fatorPrnt * fatorProfundidade);
  const totalToneladas = doseCorrigida * areaHa;
  const custoTotal = totalToneladas * custoPorToneladaR$;

  passos.push(`3. Correção por PRNT (${prntPct}%): Fator PRNT = 100 / ${prntPct} = ${fatorPrnt.toFixed(3)}`);
  passos.push(`4. Correção por profundidade (${profundidadeCm} cm): Fator Profundidade = ${profundidadeCm} / 20 = ${fatorProfundidade.toFixed(2)}`);
  passos.push(`5. Dose recomendada: ${ncSemPrnt.toFixed(2)} × ${fatorPrnt.toFixed(3)} × ${fatorProfundidade.toFixed(2)} = ${doseCorrigida.toFixed(2)} t/ha`);
  passos.push(`6. Volume total para ${areaHa.toFixed(1)} ha: ${doseCorrigida.toFixed(2)} t/ha × ${areaHa.toFixed(1)} ha = ${totalToneladas.toFixed(2)} toneladas`);

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Calagem Agronômica (RAD/PRAD)',
    formula: metodo === 'saturacao_bases'
      ? 'Dose (t/ha) = [ (V2 - V1) × T / 100 ] × (100 / PRNT) × (Profundidade / 20)'
      : 'Dose (t/ha) = [ Y × Al + (X - Ca - Mg) ] × (100 / PRNT) × (Profundidade / 20)',
    metodo: metodo === 'saturacao_bases' ? 'Elevação da Saturação por Bases (V%)' : 'Neutralização de Alumínio e Elevação de Ca+Mg',
    parametrosEntrada: {
      ctcPh7T,
      vAtualPct,
      vDesejadoPct,
      prntPct,
      profundidadeCm,
      areaHa,
      custoPorToneladaR$
    },
    passosCalculo: passos,
    resultado: `${doseCorrigida.toFixed(2)} t/ha (Total: ${totalToneladas.toFixed(2)} t)`,
    referenciaBibliografica: 'Embrapa Solos / IAC Boletim Técnico 100 / SBCS.',
    limitacoes: 'A aplicação superficial sem incorporação (ex: pastagens não gradeadas) deve limitar a dose máxima a 2,0 a 2,5 t/ha por aplicação anual.'
  };

  return {
    metodoEscolhido: metodo,
    necessidadeCalcarioTHa: Number(ncSemPrnt.toFixed(2)),
    doseCalcarioCorrigidaTHa: Number(doseCorrigida.toFixed(2)),
    quantidadeTotalToneladas: Number(totalToneladas.toFixed(2)),
    prntUtilizadoPct: prntPct,
    vDesejadoPct,
    vAtualPct,
    profundidadeCm,
    tipoCalcarioRecomendado: vAtualPct < 40 ? 'Calcário Dolomítico (MgO > 12%)' : 'Calcário Calcítico ou Magnesiano',
    custoEstimadoTotalR$: Number(custoTotal.toFixed(2)),
    memoria
  };
}

// ========================================================
// 2. CALCULADORA DE GESSAGEM COM MEMÓRIA DE CÁLCULO
// ========================================================

export interface ParametrosGessagem {
  argilaPct: number; // Teor de argila na camada subsuperficial 20-40 cm
  ctcEfetivaSubsolo?: number; // t em cmolc/dm³ na camada 20-40 cm
  caSubsoloCmolcDm3?: number; // Ca na camada 20-40 cm
  alSubsoloCmolcDm3?: number; // Al na camada 20-40 cm
  mSubsoloPct?: number; // m% (saturação por Al) na camada 20-40 cm
  areaHa: number;
  custoPorToneladaR$?: number;
  metodo?: 'teor_argila' | 'ctc_efetiva';
  finalidade?: 'pastagem' | 'cultura_anual' | 'reflorestamento';
}

export function calcularGessagemRecupera(params: ParametrosGessagem): CalculoGessagemResultado {
  const {
    argilaPct,
    ctcEfetivaSubsolo = 2.0,
    caSubsoloCmolcDm3 = 0.3,
    alSubsoloCmolcDm3 = 0.6,
    mSubsoloPct = 25,
    areaHa,
    custoPorToneladaR$ = 280,
    metodo = 'teor_argila',
    finalidade = 'pastagem'
  } = params;

  // Critérios de necessidade de gessagem no subsolo (20-40 cm) conforme Embrapa / Sousa & Lobato
  const criterioCa = caSubsoloCmolcDm3 < 0.5;
  const criterioAl = alSubsoloCmolcDm3 > 0.5;
  const criterioM = mSubsoloPct > 20;
  const criterioAtendido = criterioCa || criterioAl || criterioM;

  let doseKgHa = 0;
  const passos: string[] = [];

  passos.push(`1. Diagnóstico do subsolo (20-40 cm): Ca = ${caSubsoloCmolcDm3} cmolc/dm³ (Crítico < 0.5); Al = ${alSubsoloCmolcDm3} cmolc/dm³; m = ${mSubsoloPct}% (Crítico > 20%)`);
  passos.push(`2. Critério subsuperficial atendido? ${criterioAtendido ? 'SIM — Há impedimento químico radicular' : 'NÃO — Subsolo sem toxidez severa de Al'}`);

  if (metodo === 'teor_argila') {
    // Guia de Adubação do Cerrado (Sousa & Lobato):
    // Cultura Anual: NG (kg/ha) = 50 × Argila(%)
    // Pastagens: NG (kg/ha) = 30 a 40 × Argila(%)
    // Culturas Perenes / Florestais: NG (kg/ha) = 60 × Argila(%)
    let fatorArgila = 50;
    if (finalidade === 'pastagem') fatorArgila = 35;
    else if (finalidade === 'reflorestamento') fatorArgila = 60;

    doseKgHa = fatorArgila * argilaPct;
    passos.push(`3. Método Teor de Argila para ${finalidade}: Fator = ${fatorArgila} kg/ha por % de argila`);
    passos.push(`4. Dose = ${fatorArgila} × ${argilaPct}% argila = ${doseKgHa.toFixed(0)} kg/ha (${(doseKgHa / 1000).toFixed(2)} t/ha)`);
  } else {
    // Método CTC efetiva (Vitti et al.): NG (kg/ha) = [ (0.6 × CTCe) - Ca ] × 640
    const necessidadeCmolc = Math.max(0, (0.6 * ctcEfetivaSubsolo) - caSubsoloCmolcDm3);
    doseKgHa = necessidadeCmolc * 640;
    passos.push(`3. Método CTC Efetiva: [(0.6 × CTCe) - Ca] × 640 = [(0.6 × ${ctcEfetivaSubsolo}) - ${caSubsoloCmolcDm3}] × 640`);
    passos.push(`4. Dose = ${doseKgHa.toFixed(0)} kg/ha (${(doseKgHa / 1000).toFixed(2)} t/ha)`);
  }

  // Se não atende critério estrito, manter recomendação preventiva mínima se solo for muito argiloso
  if (!criterioAtendido) {
    doseKgHa = Math.min(doseKgHa, 800);
    passos.push(`Nota: Como não houve barreira química severa no subsolo, limitou-se à dose condicionadora preventiva de ${doseKgHa} kg/ha.`);
  }

  const doseTHa = doseKgHa / 1000;
  const totalToneladas = doseTHa * areaHa;
  const custoTotal = totalToneladas * custoPorToneladaR$;

  passos.push(`5. Volume total para ${areaHa.toFixed(1)} ha: ${doseTHa.toFixed(2)} t/ha × ${areaHa.toFixed(1)} ha = ${totalToneladas.toFixed(2)} toneladas`);

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Gessagem Agrícola para Recuperação Radicular',
    formula: metodo === 'teor_argila'
      ? 'Dose Gesso (kg/ha) = Fator_Finalidade × % Argila (Sousa & Lobato)'
      : 'Dose Gesso (kg/ha) = [ (0.6 × CTCe) - Ca ] × 640',
    metodo: metodo === 'teor_argila' ? 'Teor de Argila do Subsolo (Cerrado)' : 'CTC Efetiva Subsuperficial (Vitti)',
    parametrosEntrada: {
      argilaPct,
      ctcEfetivaSubsolo,
      caSubsoloCmolcDm3,
      alSubsoloCmolcDm3,
      mSubsoloPct,
      areaHa,
      finalidade
    },
    passosCalculo: passos,
    resultado: `${doseKgHa.toFixed(0)} kg/ha (${doseTHa.toFixed(2)} t/ha)`,
    referenciaBibliografica: 'Sousa, D.M.G.; Lobato, E. Cerrado: Correção do solo e adubação. Embrapa Informação Tecnológica.',
    limitacoes: 'O gesso agrícola não substitui o calcário (não eleva o pH nem neutraliza H+), devendo ser aplicado para carrear cálcio e sulfato em profundidade (>20 cm).'
  };

  return {
    metodoEscolhido: metodo,
    doseGessoKgHa: Number(doseKgHa.toFixed(0)),
    doseGessoTHa: Number(doseTHa.toFixed(2)),
    quantidadeTotalToneladas: Number(totalToneladas.toFixed(2)),
    criterioSubsuperficialAtendido: criterioAtendido,
    justificativaSubsuperficial: criterioAtendido
      ? `Indicada presença de acidez/falta de cálcio no subsolo (Ca: ${caSubsoloCmolcDm3} cmolc/dm³, Al: ${alSubsoloCmolcDm3} cmolc/dm³). O gesso promoverá aprofundamento radicular.`
      : 'Sem barreira química impeditiva urgente; aplicação condicionadora de perfil.',
    custoEstimadoTotalR$: Number(custoTotal.toFixed(2)),
    memoria
  };
}

// ========================================================
// 3. CALCULADORA DE ADUBAÇÃO NPK E MICRONUTRIENTES
// ========================================================

export interface ParametrosAdubacao {
  areaHa: number;
  tipoRecuperacao: 'pastagem_reforma' | 'pastagem_renovacao' | 'florestal_nativas' | 'plantas_cobertura';
  teorFosforoMgDm3: number;
  teorPotassioCmolcDm3: number;
  teorArgilaPct: number;
  custoFormuladoPorToneladaR$?: number;
}

export function calcularAdubacaoRecupera(params: ParametrosAdubacao): CalculoAdubacaoResultado {
  const {
    areaHa,
    tipoRecuperacao,
    teorFosforoMgDm3,
    teorPotassioCmolcDm3,
    teorArgilaPct,
    custoFormuladoPorToneladaR$ = 3400
  } = params;

  let doseN = 50;
  let doseP2O5 = 90;
  let doseK2O = 60;
  let formulado = 'NPK 08-28-16';

  // Interpretação de fósforo em função do teor de argila
  if (teorFosforoMgDm3 < 4) {
    doseP2O5 = teorArgilaPct > 40 ? 120 : 90;
  } else if (teorFosforoMgDm3 < 8) {
    doseP2O5 = 70;
  } else {
    doseP2O5 = 40;
  }

  // Interpretação de potássio
  if (teorPotassioCmolcDm3 < 0.15) {
    doseK2O = 80;
  } else if (teorPotassioCmolcDm3 < 0.30) {
    doseK2O = 50;
  } else {
    doseK2O = 30;
  }

  if (tipoRecuperacao === 'florestal_nativas') {
    doseN = 30;
    doseP2O5 = 60;
    doseK2O = 40;
    formulado = 'NPK 04-14-08 (Adubação em covas)';
  } else if (tipoRecuperacao === 'plantas_cobertura') {
    doseN = 20; // muitas são leguminosas fixadoras
    doseP2O5 = 60;
    doseK2O = 40;
    formulado = 'NPK 04-20-20';
  }

  // Cálculo da dose do formulado comercial baseado no nutriente limitante (geralmente P2O5)
  const percP2O5 = formulado.includes('28') ? 0.28 : (formulado.includes('20') ? 0.20 : 0.14);
  const doseFormuladoKgHa = Math.round(doseP2O5 / percP2O5);
  const totalKg = doseFormuladoKgHa * areaHa;
  const custoTotal = (totalKg / 1000) * custoFormuladoPorToneladaR$;

  const micros = [
    { nutriente: 'Zinco (Zn)', doseKgHa: 3.0 },
    { nutriente: 'Boro (B)', doseKgHa: 1.5 },
    { nutriente: 'Cobre (Cu)', doseKgHa: 1.0 },
    { nutriente: 'Manganês (Mn)', doseKgHa: 2.0 }
  ];

  const passos: string[] = [
    `1. Nível de Fósforo disponível (${teorFosforoMgDm3} mg/dm³) com ${teorArgilaPct}% argila: Demanda de P₂O₅ = ${doseP2O5} kg/ha`,
    `2. Nível de Potássio trocável (${teorPotassioCmolcDm3} cmolc/dm³): Demanda de K₂O = ${doseK2O} kg/ha`,
    `3. Nitrogênio de arranque para estabelecimento: Demanda de N = ${doseN} kg/ha`,
    `4. Formulado comercial indicado: ${formulado}`,
    `5. Dose do adubo comercial: ${doseP2O5} kg P₂O₅ ÷ ${(percP2O5 * 100).toFixed(0)}% = ${doseFormuladoKgHa} kg/ha`,
    `6. Volume total para ${areaHa.toFixed(1)} ha = ${totalKg.toLocaleString('pt-BR')} kg (${(totalKg / 1000).toFixed(2)} t)`
  ];

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Adubação Mineral de Recuperação',
    formula: 'Dose Fertilizante (kg/ha) = Demanda P₂O₅ (kg/ha) ÷ % P₂O₅ no Adubo Comercial',
    metodo: 'Tabelas de Recomendação de Adubação e Calagem da SBCS / Embrapa',
    parametrosEntrada: { areaHa, tipoRecuperacao, teorFosforoMgDm3, teorPotassioCmolcDm3, teorArgilaPct },
    passosCalculo: passos,
    resultado: `${doseFormuladoKgHa} kg/ha de ${formulado} (Total: ${(totalKg / 1000).toFixed(2)} t)`,
    referenciaBibliografica: 'Sociedade Brasileira de Ciência do Solo - Comissão de Fertilidade do Solo.',
    limitacoes: 'O fósforo deve ser incorporado ou localizado junto à linha/cova devido à sua baixa mobilidade no solo e alta adsorção em solos argilosos tropicais.'
  };

  return {
    doseN_kgHa: doseN,
    doseP2O5_kgHa: doseP2O5,
    doseK2O_kgHa: doseK2O,
    doseCa_kgHa: 40,
    doseMg_kgHa: 20,
    doseS_kgHa: 25,
    micronutrientesKgHa: micros,
    formuladoSugerido: formulado,
    doseFormuladoKgHa,
    quantidadeTotalAduboKg: totalKg,
    custoAdubacaoTotalR$: Number(custoTotal.toFixed(2)),
    memoria
  };
}

// ========================================================
// 4. CALCULADORA DE SEMENTES E VALOR CULTURAL (VC%)
// ========================================================

export interface ParametrosSementes {
  especieCultivar: string;
  purezaPct: number;
  germinacaoPct: number;
  taxaPadrãoRecomendadaKgHa: number; // kg/ha com VC 100%
  areaHa: number;
  custoSementePorKgR$?: number;
  metodoSemeadura?: 'a_lanco' | 'em_linha' | 'sobressemeadura';
}

export function calcularSementesRecupera(params: ParametrosSementes): CalculoSementesResultado {
  const {
    especieCultivar,
    purezaPct,
    germinacaoPct,
    taxaPadrãoRecomendadaKgHa,
    areaHa,
    custoSementePorKgR$ = 42,
    metodoSemeadura = 'a_lanco'
  } = params;

  // VC% = (P% * G%) / 100
  const valorCulturalPct = (purezaPct * germinacaoPct) / 100;

  // Ajuste por método: semeadura a lanço exige 20 a 30% a mais de sementes
  let fatorMetodo = 1.0;
  if (metodoSemeadura === 'a_lanco') fatorMetodo = 1.25;
  else if (metodoSemeadura === 'sobressemeadura') fatorMetodo = 1.35;

  // Taxa de semeadura real ajustada por VC%: Taxa = (TaxaPadrão * 100 / VC%) * FatorMetodo
  const taxaAjustadaKgHa = valorCulturalPct > 0
    ? (taxaPadrãoRecomendadaKgHa * (100 / valorCulturalPct)) * fatorMetodo
    : 0;

  const totalSementesKg = taxaAjustadaKgHa * areaHa;
  const custoTotal = totalSementesKg * custoSementePorKgR$;
  const populacaoEsperada = Math.round(taxaAjustadaKgHa * 2.8); // estimativa média de plântulas/m²

  const passos: string[] = [
    `1. Cálculo do Valor Cultural (VC%): VC = (Pureza × Germinação) / 100 = (${purezaPct}% × ${germinacaoPct}%) / 100 = ${valorCulturalPct.toFixed(1)}%`,
    `2. Fator de método de semeadura (${metodoSemeadura.replace('_', ' ')}): ${fatorMetodo.toFixed(2)}x`,
    `3. Taxa ajustada: (Taxa Padrão [${taxaPadrãoRecomendadaKgHa} kg/ha] × 100 ÷ ${valorCulturalPct.toFixed(1)}%) × ${fatorMetodo.toFixed(2)} = ${taxaAjustadaKgHa.toFixed(1)} kg/ha`,
    `4. Volume total para ${areaHa.toFixed(1)} ha: ${taxaAjustadaKgHa.toFixed(1)} kg/ha × ${areaHa.toFixed(1)} ha = ${totalSementesKg.toFixed(1)} kg`
  ];

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Sementes com Base no Valor Cultural (VC%)',
    formula: 'Taxa Real (kg/ha) = (Taxa Padrão × 100 / VC%) × Fator Método',
    metodo: 'Regra de Três com Correção de Pureza e Germinação Oficial MAPA',
    parametrosEntrada: { especieCultivar, purezaPct, germinacaoPct, taxaPadrãoRecomendadaKgHa, areaHa, metodoSemeadura },
    passosCalculo: passos,
    resultado: `${taxaAjustadaKgHa.toFixed(1)} kg/ha (Total: ${totalSementesKg.toFixed(1)} kg)`,
    referenciaBibliografica: 'Embrapa Gado de Corte - Recomendações de Semeadura de Espécies Forrageiras.',
    limitacoes: 'Sementes semeadas a lanço sem incorporação leve por grade niveladora fechada ou rolo compactador sofrem predação por formigas e dessecação.'
  };

  return {
    especieCultivar,
    purezaPct,
    germinacaoPct,
    valorCulturalPct: Number(valorCulturalPct.toFixed(1)),
    taxaSemeaduraRecomendadaKgHa: taxaPadrãoRecomendadaKgHa,
    taxaSemeaduraAjustadaKgHa: Number(taxaAjustadaKgHa.toFixed(1)),
    areaHa,
    quantidadeTotalSementesKg: Number(totalSementesKg.toFixed(1)),
    populacaoEsperadaPlantasM2: populacaoEsperada,
    custoEstimadoR$: Number(custoTotal.toFixed(2)),
    memoria
  };
}

// ========================================================
// 5. CALCULADORA DE MUDAS PARA REVEGETAÇÃO E PRAD
// ========================================================

export interface ParametrosMudas {
  especieNome: string;
  grupoEcologico: 'pioneira' | 'secundaria_inicial' | 'secundaria_tardia' | 'climax';
  espacamentoLinhaM: number;
  espacamentoEntrePlantasM: number;
  areaHa: number;
  percentualReplantioPct?: number;
  custoPorMudaR$?: number;
}

export function calcularMudasRecupera(params: ParametrosMudas): CalculoMudasResultado {
  const {
    especieNome,
    grupoEcologico,
    espacamentoLinhaM,
    espacamentoEntrePlantasM,
    areaHa,
    percentualReplantioPct = 15,
    custoPorMudaR$ = 6.50
  } = params;

  // Densidade por hectare = 10.000 / (E_linha * E_planta)
  const areaPorPlantaM2 = espacamentoLinhaM * espacamentoEntrePlantasM;
  const densidadeMudasHa = areaPorPlantaM2 > 0 ? Math.round(10000 / areaPorPlantaM2) : 0;

  const mudasPlantio = densidadeMudasHa * areaHa;
  const mudasReplantio = Math.round(mudasPlantio * (percentualReplantioPct / 100));
  const mudasTotal = mudasPlantio + mudasReplantio;
  const custoTotal = mudasTotal * custoPorMudaR$;

  const passos: string[] = [
    `1. Área útil ocupada por muda: ${espacamentoLinhaM}m × ${espacamentoEntrePlantasM}m = ${areaPorPlantaM2.toFixed(2)} m²/planta`,
    `2. Densidade teórica por hectare: 10.000 m² ÷ ${areaPorPlantaM2.toFixed(2)} m² = ${densidadeMudasHa} mudas/ha`,
    `3. Mudas de plantio inicial para ${areaHa.toFixed(1)} ha: ${densidadeMudasHa} × ${areaHa.toFixed(1)} = ${mudasPlantio.toLocaleString('pt-BR')} mudas`,
    `4. Margem de segurança de replantio (${percentualReplantioPct}%): ${mudasReplantio.toLocaleString('pt-BR')} mudas adicionais`,
    `5. Quantidade total a adquirir: ${mudasTotal.toLocaleString('pt-BR')} mudas nativas`
  ];

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Densidade de Mudas Nativas para PRAD',
    formula: 'Mudas Totais = [ (10.000 ÷ (E_linha × E_planta)) × Área_ha ] × (1 + Replantio/100)',
    metodo: 'Módulo Florestal Clássico - Densidade de Plantio em Malha Regular',
    parametrosEntrada: { especieNome, grupoEcologico, espacamentoLinhaM, espacamentoEntrePlantasM, areaHa, percentualReplantioPct },
    passosCalculo: passos,
    resultado: `${densidadeMudasHa} mudas/ha (Total: ${mudasTotal.toLocaleString('pt-BR')} mudas)`,
    referenciaBibliografica: 'Kageyama, P.Y. et al. Restauração de Ecossistemas Tropicais / SMA-SP Resoluções de Recuperação.',
    limitacoes: 'Mudas devem ter altura mínima de 30 cm e torrão bem enraizado. Recomenda-se consórcio 50% pioneiras e 50% não-pioneiras.'
  };

  return {
    especieNome,
    grupoEcologico,
    espacamentoLinhaM,
    espacamentoEntrePlantasM,
    densidadeMudasHa,
    areaHa,
    percentualReplantioPct,
    quantidadeMudasPlantio: mudasPlantio,
    quantidadeMudasReplantio: mudasReplantio,
    quantidadeTotalMudas: mudasTotal,
    custoEstimadoR$: Number(custoTotal.toFixed(2)),
    memoria
  };
}

// ========================================================
// 6. CONSERVAÇÃO DO SOLO: CURVAS DE NÍVEL E TERRACEAMENTO
// ========================================================

export interface ParametrosConservacaoSolo {
  declividadePct: number;
  tipoSolo: 'muito_permeavel' | 'permeavel' | 'pouco_permeavel' | 'impermeavel';
  praticaConservacionista: 'plantio_direto' | 'preparo_convencional' | 'pastagem_manejada';
}

export interface ResultadoConservacaoSolo {
  espacamentoVerticalMetros: number;
  espacamentoHorizontalMetros: number;
  numeroTracosEstimadoPorKm: number;
  tipoTerracoRecomendado: string;
  larguraFaixaRetencaoM: number;
  memoria: MemoriaCalculo;
}

export function calcularCurvasNivelRecupera(params: ParametrosConservacaoSolo): ResultadoConservacaoSolo {
  const { declividadePct, tipoSolo, praticaConservacionista } = params;

  // Fórmula de Bentley / Lombardi Neto adaptada:
  // EV (m) = [ 0.30 × (D% + 2) ] × Fator_Solo × Fator_Manejo
  let fatorSolo = 1.0;
  if (tipoSolo === 'muito_permeavel') fatorSolo = 1.25;
  else if (tipoSolo === 'pouco_permeavel') fatorSolo = 0.85;
  else if (tipoSolo === 'impermeavel') fatorSolo = 0.70;

  let fatorManejo = 1.0;
  if (praticaConservacionista === 'plantio_direto') fatorManejo = 1.20;
  else if (praticaConservacionista === 'preparo_convencional') fatorManejo = 0.80;

  const evBase = 0.30 * (declividadePct + 2);
  const evFinal = Math.max(0.6, evBase * fatorSolo * fatorManejo);

  // Espaçamento horizontal (EH) = (EV * 100) / D%
  const ehFinal = declividadePct > 0 ? (evFinal * 100) / declividadePct : 100;
  const numTracosKm = Math.round(1000 / ehFinal);

  let tipoTerraco = 'Terraço embutido ou de base larga (mecanizável)';
  if (declividadePct > 12) {
    tipoTerraco = 'Terraço de base estreita ou cordão em contorno em pastagens';
  } else if (declividadePct < 3) {
    tipoTerraco = 'Curvas de nível simples / faixas vegetadas de contenção';
  }

  const passos = [
    `1. Espaçamento vertical base: EV = 0.30 × (${declividadePct}% + 2) = ${evBase.toFixed(2)} m`,
    `2. Fator de permeabilidade do solo (${tipoSolo}): ${fatorSolo.toFixed(2)}x`,
    `3. Fator do manejo agrícola (${praticaConservacionista}): ${fatorManejo.toFixed(2)}x`,
    `4. Espaçamento Vertical Corrigido: EV = ${evFinal.toFixed(2)} metros`,
    `5. Espaçamento Horizontal entre terraços: EH = (${evFinal.toFixed(2)} × 100) ÷ ${declividadePct}% = ${ehFinal.toFixed(1)} metros`,
    `6. Densidade estimada: ~${numTracosKm} canais/terraços a cada 1.000m de rampa`
  ];

  const memoria: MemoriaCalculo = {
    titulo: 'Memória de Cálculo de Dimensionamento de Terraços e Curvas de Nível',
    formula: 'EV (m) = [ 0.30 × (Declividade% + 2) ] × F_solo × F_manejo; EH (m) = (EV × 100) ÷ Declividade%',
    metodo: 'Fórmula de Bentley modificada por Lombardi Neto / IAC',
    parametrosEntrada: { declividadePct, tipoSolo, praticaConservacionista },
    passosCalculo: passos,
    resultado: `Espaçamento Vertical = ${evFinal.toFixed(2)} m | Horizontal = ${ehFinal.toFixed(1)} m`,
    referenciaBibliografica: 'Lombardi Neto, F. et al. Terraceamento Agrícola. Manual Técnico CATI / IAC.',
    limitacoes: 'Em declividades superiores a 15-20%, terraços mecânicos são desaconselhados devido ao risco de deslizamentos; priorizar reflorestamento e biomantas.'
  };

  return {
    espacamentoVerticalMetros: Number(evFinal.toFixed(2)),
    espacamentoHorizontalMetros: Number(ehFinal.toFixed(1)),
    numeroTracosEstimadoPorKm: numTracosKm,
    tipoTerracoRecomendado: tipoTerraco,
    larguraFaixaRetencaoM: Math.min(6, Math.max(2, ehFinal * 0.1)),
    memoria
  };
}

// ========================================================
// 7. IGRA — ÍNDICE GEAAGRO DE RECUPERAÇÃO DA ÁREA (5 DIMENSÕES)
// ========================================================

export function calcularIgraConsolidado(
  dimensoes: {
    fisica: number;
    quimica: number;
    biologica: number;
    vegetativa: number;
    produtiva: number;
  },
  pesosCustom?: {
    pesoFisica?: number;
    pesoQuimica?: number;
    pesoBiologica?: number;
    pesoVegetativa?: number;
    pesoProdutiva?: number;
  }
): IgraDimensoes {
  const pFis = pesosCustom?.pesoFisica ?? 0.20;
  const pQui = pesosCustom?.pesoQuimica ?? 0.20;
  const pBio = pesosCustom?.pesoBiologica ?? 0.20;
  const pVeg = pesosCustom?.pesoVegetativa ?? 0.25;
  const pPro = pesosCustom?.pesoProdutiva ?? 0.15;

  const scoreConsolidado = (
    (dimensoes.fisica * pFis) +
    (dimensoes.quimica * pQui) +
    (dimensoes.biologica * pBio) +
    (dimensoes.vegetativa * pVeg) +
    (dimensoes.produtiva * pPro)
  );

  let estagio: IgraDimensoes['classificacaoEstagio'] = 'Critico';
  let diagnosticoResumo = '';

  if (scoreConsolidado >= 85) {
    estagio = 'Recuperado';
    diagnosticoResumo = 'Área com solo estabilizado, cobertura densa e alta atividade ecológica/produtiva recuperada.';
  } else if (scoreConsolidado >= 70) {
    estagio = 'Avancado';
    diagnosticoResumo = 'Fase avançada de recuperação: processos erosivos contidos e biomassa vegetal consolidada.';
  } else if (scoreConsolidado >= 50) {
    estagio = 'Em_Recuperacao';
    diagnosticoResumo = 'Recuperação em curso com resposta inicial positiva; requer continuidade dos tratos e monitoramento.';
  } else if (scoreConsolidado >= 35) {
    estagio = 'Inicial';
    diagnosticoResumo = 'Estágio inicial de intervenção; presença de fragilidades químicas e estruturais a serem corrigidas.';
  } else {
    estagio = 'Critico';
    diagnosticoResumo = 'Degradação severa. Solo desprotegido, compactado ou erodido; necessita intervenção agronômica imediata.';
  }

  const gaps: string[] = [];
  if (dimensoes.fisica < 50) gaps.push('Dimensão Física: Presença de compactação, baixa infiltração ou feições erosivas ativas.');
  if (dimensoes.quimica < 50) gaps.push('Dimensão Química: Baixa saturação por bases (V%), toxidez de alumínio ou desequilíbrio nutricional.');
  if (dimensoes.biologica < 50) gaps.push('Dimensão Biológica: Baixa matéria orgânica, ausência de macrofauna ou vida microbiana deprimida.');
  if (dimensoes.vegetativa < 50) gaps.push('Dimensão Vegetativa: Falhas na cobertura vegetal, solo exposto ou infestação severa de daninhas.');
  if (dimensoes.produtiva < 50) gaps.push('Dimensão Produtiva: Baixa capacidade de suporte de pastejo ou biomassa insuficiente para sustentabilidade.');

  return {
    dimensaoFisica: Number(dimensoes.fisica.toFixed(1)),
    dimensaoQuimica: Number(dimensoes.quimica.toFixed(1)),
    dimensaoBiologica: Number(dimensoes.biologica.toFixed(1)),
    dimensaoVegetativa: Number(dimensoes.vegetativa.toFixed(1)),
    dimensaoProdutiva: Number(dimensoes.produtiva.toFixed(1)),
    pesoFisica: pFis,
    pesoQuimica: pQui,
    pesoBiologica: pBio,
    pesoVegetativa: pVeg,
    pesoProdutiva: pPro,
    scoreConsolidado: Number(scoreConsolidado.toFixed(1)),
    classificacaoEstagio: estagio,
    diagnosticoResumo,
    gapsIdentificados: gaps
  };
}
