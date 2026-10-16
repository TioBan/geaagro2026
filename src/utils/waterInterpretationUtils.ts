import {
  WaterAnalysisRecord,
  ComplianceStatus,
} from '../types/waterAnalysis';

// ============================================================================
// 1. AVALIAÇÃO SEGUNDO RESOLUÇÃO CONAMA Nº 357/2005 (ÁGUAS DOCES)
// ============================================================================
// Enquadramento para Irrigação:
// - Classe 1: Irrigação de hortaliças que são consumidas cruas e de frutas que se desenvolvam rentes ao solo e ingeridas cruas sem película.
// - Classe 2: Irrigação de hortaliças, plantas frutíferas e de parques/jardins com contato direto do público.
// - Classe 3: Irrigação de culturas arbóreas, cerealíferas e forrageiras.

export interface ConamaParameterRow {
  key: string;
  parameterName: string;
  category: 'microbiologico' | 'fisico' | 'quimico_inorganico' | 'metais_pesados';
  unit: string;
  measuredValue: number | string;
  class1Limit: string;
  class1Status: ComplianceStatus;
  class2Limit: string;
  class2Status: ComplianceStatus;
  class3Limit: string;
  class3Status: ComplianceStatus;
  notes: string;
}

export interface ConamaSummary {
  recommendedClass: 'classe_1' | 'classe_2' | 'classe_3' | 'inconforme';
  complianceByClass: {
    classe_1: { compliancePercentage: number; compliantCount: number; totalEvaluated: number };
    classe_2: { compliancePercentage: number; compliantCount: number; totalEvaluated: number };
    classe_3: { compliancePercentage: number; compliantCount: number; totalEvaluated: number };
  };
  suitability: {
    rawVegetables: boolean; // Classe 1 (hortaliças cruas)
    fruitTreesAndParks: boolean; // Classe 2 (frutíferas)
    grainsAndForages: boolean; // Classe 3 (grãos e pastagens)
  };
  criticalDeviations: { parameter: string; description: string; value: number | string; limit: string }[];
  parameters: ConamaParameterRow[];
}

export function evaluateConamaCompliance(analysis: WaterAnalysisRecord): ConamaSummary {
  const { physical, chemical, biological, heavyMetals } = analysis;
  const parameters: ConamaParameterRow[] = [];
  const criticalDeviations: { parameter: string; description: string; value: number | string; limit: string }[] = [];

  // Helper evaluator
  const evalNumber = (
    key: string,
    name: string,
    cat: ConamaParameterRow['category'],
    unit: string,
    measured: number,
    limit1: number,
    limit2: number,
    limit3: number,
    comp: '<=' | '>=' | 'range',
    notes: string,
    minVal?: number
  ) => {
    let s1: ComplianceStatus = 'conforme';
    let s2: ComplianceStatus = 'conforme';
    let s3: ComplianceStatus = 'conforme';

    if (comp === '<=') {
      s1 = measured <= limit1 ? 'conforme' : measured <= limit1 * 1.15 ? 'atencao' : 'inconforme';
      s2 = measured <= limit2 ? 'conforme' : measured <= limit2 * 1.15 ? 'atencao' : 'inconforme';
      s3 = measured <= limit3 ? 'conforme' : measured <= limit3 * 1.15 ? 'atencao' : 'inconforme';
    } else if (comp === '>=') {
      s1 = measured >= limit1 ? 'conforme' : measured >= limit1 * 0.85 ? 'atencao' : 'inconforme';
      s2 = measured >= limit2 ? 'conforme' : measured >= limit2 * 0.85 ? 'atencao' : 'inconforme';
      s3 = measured >= limit3 ? 'conforme' : measured >= limit3 * 0.85 ? 'atencao' : 'inconforme';
    } else if (comp === 'range') {
      const min = minVal ?? 6.0;
      s1 = measured >= min && measured <= limit1 ? 'conforme' : 'inconforme';
      s2 = measured >= min && measured <= limit2 ? 'conforme' : 'inconforme';
      s3 = measured >= min && measured <= limit3 ? 'conforme' : 'inconforme';
    }

    const class1LimitText = comp === 'range' ? `${minVal} a ${limit1}` : `${comp === '<=' ? '≤' : '≥'} ${limit1} ${unit}`;
    const class2LimitText = comp === 'range' ? `${minVal} a ${limit2}` : `${comp === '<=' ? '≤' : '≥'} ${limit2} ${unit}`;
    const class3LimitText = comp === 'range' ? `${minVal} a ${limit3}` : `${comp === '<=' ? '≤' : '≥'} ${limit3} ${unit}`;

    if (s1 === 'inconforme' || s2 === 'inconforme' || s3 === 'inconforme') {
      criticalDeviations.push({
        parameter: name,
        description: s1 === 'inconforme' ? 'Excede o limite para hortaliças cruas (Classe 1)' : 'Excede limite CONAMA 357',
        value: `${measured} ${unit}`,
        limit: class1LimitText,
      });
    }

    parameters.push({
      key,
      parameterName: name,
      category: cat,
      unit,
      measuredValue: measured,
      class1Limit: class1LimitText,
      class1Status: s1,
      class2Limit: class2LimitText,
      class2Status: s2,
      class3Limit: class3LimitText,
      class3Status: s3,
      notes,
    });
  };

  // 1. Microbiológicos
  evalNumber(
    'ecoli',
    'Escherichia coli / Termotolerantes',
    'microbiologico',
    'NMP/100mL',
    biological?.escherichiaColiNmp100ml ?? 0,
    200,
    1000,
    4000,
    '<=',
    'Parâmetro sanitário decisivo para hortaliças consumidas cruas (Cl. 1: máx 200 NMP/100mL).'
  );

  // 2. Físicos e Químicos Básicos
  evalNumber(
    'ph',
    'Potencial Hidrogeniônico (pH)',
    'quimico_inorganico',
    'pH',
    chemical?.ph ?? 7.0,
    9.0,
    9.0,
    9.0,
    'range',
    'Faixa regulamentar CONAMA 357 para águas doces (6,0 a 9,0).',
    6.0
  );

  evalNumber(
    'turbidity',
    'Turbidez',
    'fisico',
    'NTU',
    physical?.turbidityNtu ?? 0,
    40,
    100,
    100,
    '<=',
    'Restringe penetração luminosa e gera risco de entupimento em bicos/emissores.'
  );

  evalNumber(
    'tds',
    'Sólidos Dissolvidos Totais (TDS)',
    'fisico',
    'mg/L',
    physical?.totalDissolvedSolidsMgL ?? 0,
    500,
    500,
    500,
    '<=',
    'Limite geral CONAMA para água doce de 500 mg/L.'
  );

  evalNumber(
    'dissolved_oxygen',
    'Oxigênio Dissolvido (OD)',
    'quimico_inorganico',
    'mg/L O₂',
    chemical?.dissolvedOxygenMgL ?? 6.0,
    6.0,
    5.0,
    4.0,
    '>=',
    'Indica aeração e higidez da água na captação.'
  );

  evalNumber(
    'bod5',
    'Demanda Bioquímica de Oxigênio (DBO₅)',
    'quimico_inorganico',
    'mg/L O₂',
    chemical?.bod5MgL ?? 2.0,
    3.0,
    5.0,
    10.0,
    '<=',
    'Indica carga de matéria orgânica biodegradável no manancial.'
  );

  // 3. Íons e Nutrientes Minerais
  evalNumber(
    'nitrate',
    'Nitrato (N-NO₃⁻)',
    'quimico_inorganico',
    'mg/L N',
    Math.round((chemical?.nitrateNo3MgL ?? 0) * 0.226 * 100) / 100, // conversão NO3 para N-NO3
    10.0,
    10.0,
    10.0,
    '<=',
    'Limite de 10,0 mg/L N-NO₃ para proteção de aquíferos e saúde.'
  );

  evalNumber(
    'nitrite',
    'Nitrito (N-NO₂⁻)',
    'quimico_inorganico',
    'mg/L N',
    Math.round((chemical?.nitriteNo2MgL ?? 0) * 0.304 * 100) / 100,
    1.0,
    1.0,
    1.0,
    '<=',
    'Indica poluição orgânica recente e potencial toxicidade.'
  );

  evalNumber(
    'chlorides',
    'Cloretos (Cl⁻)',
    'quimico_inorganico',
    'mg/L',
    chemical?.chloridesClMgL ?? 0,
    250,
    250,
    250,
    '<=',
    'CONAMA 357 fixa máx. 250 mg/L para corpos de água doce.'
  );

  evalNumber(
    'sulfates',
    'Sulfatos (SO₄²⁻)',
    'quimico_inorganico',
    'mg/L',
    chemical?.sulfatesSo4MgL ?? 0,
    250,
    250,
    250,
    '<=',
    'Máximo de 250 mg/L para todas as classes de água doce.'
  );

  evalNumber(
    'iron',
    'Ferro Dissolvido (Fe)',
    'quimico_inorganico',
    'mg/L',
    chemical?.ironFeMgL ?? 0,
    0.3,
    0.3,
    5.0,
    '<=',
    'Classe 1 e 2 exigem Fe ≤ 0,3 mg/L para evitar incrustação férrica e manchas.'
  );

  evalNumber(
    'manganese',
    'Manganês Total (Mn)',
    'quimico_inorganico',
    'mg/L',
    chemical?.manganeseMnMgL ?? 0,
    0.1,
    0.1,
    0.5,
    '<=',
    'Limite de 0,1 mg/L em Classe 1 e 2 para evitar biofilme e precipitado escuro.'
  );

  evalNumber(
    'boron',
    'Boro Total (B)',
    'quimico_inorganico',
    'mg/L',
    chemical?.boronBMgL ?? 0,
    0.5,
    0.5,
    0.75,
    '<=',
    'CONAMA 357 restringe boro em irrigação devido ao risco de fitotoxicidade foliar.'
  );

  evalNumber(
    'aluminum',
    'Alumínio Dissolvido (Al)',
    'quimico_inorganico',
    'mg/L',
    chemical?.aluminumAlMgL ?? 0,
    0.1,
    0.1,
    0.2,
    '<=',
    'Alumínio solúvel tóxico para ápices radiculares jovens.'
  );

  evalNumber(
    'copper',
    'Cobre Dissolvido (Cu)',
    'quimico_inorganico',
    'mg/L',
    chemical?.copperCuMgL ?? 0,
    0.009,
    0.009,
    0.013,
    '<=',
    'Limite rígido CONAMA para proteção de ecossistemas aquáticos.'
  );

  evalNumber(
    'zinc',
    'Zinco Total (Zn)',
    'quimico_inorganico',
    'mg/L',
    chemical?.zincZnMgL ?? 0,
    0.18,
    0.18,
    5.0,
    '<=',
    'Limite de 0,18 mg/L em Classe 1 e 2.'
  );

  // 4. Metais Pesados
  evalNumber(
    'lead',
    'Chumbo Total (Pb)',
    'metais_pesados',
    'mg/L',
    heavyMetals?.leadPbMgL ?? 0,
    0.01,
    0.01,
    0.033,
    '<=',
    'Metal pesado cumulativo; restrição sanitária severa.'
  );

  evalNumber(
    'cadmium',
    'Cádmio Total (Cd)',
    'metais_pesados',
    'mg/L',
    heavyMetals?.cadmiumCdMgL ?? 0,
    0.001,
    0.001,
    0.01,
    '<=',
    'Altamente tóxico para culturas e organismos vivos.'
  );

  evalNumber(
    'arsenic',
    'Arsênio Total (As)',
    'metais_pesados',
    'mg/L',
    heavyMetals?.arsenicAsMgL ?? 0,
    0.01,
    0.01,
    0.033,
    '<=',
    'Metalóide de alta toxicidade e persistência.'
  );

  // Compliance statistics
  const totalEvaluated = parameters.length;
  const c1Ok = parameters.filter(r => r.class1Status === 'conforme').length;
  const c2Ok = parameters.filter(r => r.class2Status === 'conforme').length;
  const c3Ok = parameters.filter(r => r.class3Status === 'conforme').length;

  const compliancePercentage1 = Math.round((c1Ok / totalEvaluated) * 100);
  const compliancePercentage2 = Math.round((c2Ok / totalEvaluated) * 100);
  const compliancePercentage3 = Math.round((c3Ok / totalEvaluated) * 100);

  const rawVegetables = parameters.every(r => r.class1Status !== 'inconforme');
  const fruitTreesAndParks = parameters.every(r => r.class2Status !== 'inconforme');
  const grainsAndForages = parameters.every(r => r.class3Status !== 'inconforme');

  let recommendedClass: ConamaSummary['recommendedClass'] = 'inconforme';
  if (rawVegetables) recommendedClass = 'classe_1';
  else if (fruitTreesAndParks) recommendedClass = 'classe_2';
  else if (grainsAndForages) recommendedClass = 'classe_3';

  return {
    recommendedClass,
    complianceByClass: {
      classe_1: {
        compliancePercentage: compliancePercentage1,
        compliantCount: c1Ok,
        totalEvaluated,
      },
      classe_2: {
        compliancePercentage: compliancePercentage2,
        compliantCount: c2Ok,
        totalEvaluated,
      },
      classe_3: {
        compliancePercentage: compliancePercentage3,
        compliantCount: c3Ok,
        totalEvaluated,
      },
    },
    suitability: {
      rawVegetables,
      fruitTreesAndParks,
      grainsAndForages,
    },
    criticalDeviations,
    parameters,
  };
}

// ============================================================================
// 2. AVALIAÇÃO AGRONÔMICA PARA USO AGRÍCOLA (FAO 29 - AYERS & WESTCOT)
// ============================================================================

export interface Fao29ParameterRow {
  key: string;
  parameterName: string;
  category: string;
  unit: string;
  measuredValue: string | number;
  noRestrictionRange: string;
  moderateRestrictionRange: string;
  severeRestrictionRange: string;
  currentRestriction: 'nenhuma' | 'moderada' | 'severa';
  agronomicImpact: string;
  managementTip: string;
}

export interface Fao29Summary {
  overallRestriction: 'nenhuma' | 'moderada' | 'severa';
  leachingFractionRequired: number; // Fração de lixiviação %
  parameters: Fao29ParameterRow[];
}

export function evaluateFaoAgronomicStandards(analysis: WaterAnalysisRecord): Fao29Summary {
  const { physical, chemical, calculated } = analysis;
  const ecDsM = (physical?.electricalConductivityMicroS ?? 0) / 1000;
  const sar = calculated?.sar ?? 1.0;
  const params: Fao29ParameterRow[] = [];

  // 1. Salinidade Geral
  let salRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (ecDsM > 3.0) salRest = 'severa';
  else if (ecDsM >= 0.7) salRest = 'moderada';

  params.push({
    key: 'fao_ec',
    parameterName: 'Condutividade Elétrica da Água (CEw / Salinidade)',
    category: 'Salinidade Geral',
    measuredValue: `${ecDsM.toFixed(2)} dS/m (${physical?.electricalConductivityMicroS ?? 0} µS/cm)`,
    unit: 'dS/m',
    currentRestriction: salRest,
    noRestrictionRange: '< 0,7 dS/m',
    moderateRestrictionRange: '0,7 a 3,0 dS/m',
    severeRestrictionRange: '> 3,0 dS/m',
    agronomicImpact:
      salRest === 'nenhuma'
        ? 'Água de excelente qualidade osmótica; absorção hídrica plena pelas raízes.'
        : salRest === 'moderada'
        ? 'Exige atenção ao potencial osmótico; pode reduzir rendimento de culturas sensíveis.'
        : 'Alto risco osmótico; queima apical, perda severa de produtividade e salinização rápida do solo.',
    managementTip:
      salRest === 'nenhuma'
        ? 'Manejo padrão de irrigação sem necessidade de fração extra.'
        : salRest === 'moderada'
        ? 'Aplicar fração de lixiviação de 10% a 15% e selecionar culturas moderadamente tolerantes.'
        : 'Obrigatória fração de lixiviação > 20%, drenagem eficiente do solo e gessagem periódica.',
  });

  // 2. Infiltração (Relação SAR vs CEw)
  let infRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (sar < 3) {
    if (ecDsM < 0.2) infRest = 'severa';
    else if (ecDsM <= 0.7) infRest = 'moderada';
    else infRest = 'nenhuma';
  } else if (sar < 6) {
    if (ecDsM < 0.3) infRest = 'severa';
    else if (ecDsM <= 1.2) infRest = 'moderada';
    else infRest = 'nenhuma';
  } else if (sar < 12) {
    if (ecDsM < 0.5) infRest = 'severa';
    else if (ecDsM <= 1.9) infRest = 'moderada';
    else infRest = 'nenhuma';
  } else if (sar < 20) {
    if (ecDsM < 1.2) infRest = 'severa';
    else if (ecDsM <= 2.9) infRest = 'moderada';
    else infRest = 'nenhuma';
  } else {
    if (ecDsM < 2.5) infRest = 'severa';
    else if (ecDsM <= 5.0) infRest = 'moderada';
    else infRest = 'nenhuma';
  }

  params.push({
    key: 'fao_infiltration',
    parameterName: 'Taxa de Infiltração no Solo (Balanço RAS × CEw)',
    category: 'Permeabilidade',
    measuredValue: `RAS ${sar.toFixed(2)} vs CE ${ecDsM.toFixed(2)} dS/m`,
    unit: 'índice',
    currentRestriction: infRest,
    noRestrictionRange: 'RAS < 3: CE > 0,7 | RAS 3-6: CE > 1,2',
    moderateRestrictionRange: 'RAS < 3: CE 0,2-0,7 | RAS 3-6: CE 0,3-1,2',
    severeRestrictionRange: 'RAS < 3: CE < 0,2 | RAS 3-6: CE < 0,3',
    agronomicImpact:
      infRest === 'nenhuma'
        ? 'Boa permeabilidade e aeração do solo; floculação estável das argilas.'
        : infRest === 'moderada'
        ? 'Risco de selamento superficial e encrostamento da camada arável.'
        : 'Severa dispersão de argilas na superfície com impedimento drástico da infiltração de água e asfixia radicular.',
    managementTip:
      infRest === 'nenhuma'
        ? 'Manter cobertura morta vegetal para preservar a estrutura do solo.'
        : 'Aplicar gesso agrícola (CaSO₄) na superfície do solo ou injetar sais de cálcio na água para elevar o teor de Ca e combater a dispersão.',
  });

  // 3. Toxicidade de Íons Específicos
  // Sódio Radicular
  let naRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (sar > 9) naRest = 'severa';
  else if (sar >= 3) naRest = 'moderada';

  params.push({
    key: 'fao_na_sar',
    parameterName: 'Sódio Radicular (RAS para irrigação localizada)',
    category: 'Toxidez Específica',
    measuredValue: `RAS ${sar.toFixed(2)} (${chemical?.sodiumNaMgL ?? 0} mg/L Na)`,
    unit: 'RAS',
    currentRestriction: naRest,
    noRestrictionRange: 'RAS < 3',
    moderateRestrictionRange: 'RAS 3 a 9',
    severeRestrictionRange: 'RAS > 9',
    agronomicImpact:
      naRest === 'nenhuma'
        ? 'Sem risco de toxidez por sódio absorvido via raiz.'
        : 'Risco de necrose marginal em folhas velhas de frutíferas (citros, abacate, videira).',
    managementTip: 'Adicionar fontes de cálcio solúvel para manter relação Ca/Na elevada na rizosfera.',
  });

  // Sódio Foliar (Aspersão)
  const sodiumVal = chemical?.sodiumNaMgL ?? 0;
  let naSprinklerRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (sodiumVal > 115) naSprinklerRest = 'severa';
  else if (sodiumVal > 69) naSprinklerRest = 'moderada';

  params.push({
    key: 'fao_na_sprinkler',
    parameterName: 'Sódio em Aspersão Foliar (Absorção Direta)',
    category: 'Toxidez Foliar',
    measuredValue: `${sodiumVal} mg/L Na`,
    unit: 'mg/L',
    currentRestriction: naSprinklerRest,
    noRestrictionRange: '< 69 mg/L (< 3 meq/L)',
    moderateRestrictionRange: '69 a 115 mg/L',
    severeRestrictionRange: '> 115 mg/L (> 5 meq/L)',
    agronomicImpact:
      naSprinklerRest === 'nenhuma'
        ? 'Seguro para molhamento foliar durante aspersão em pleno sol.'
        : 'Risco elevado de queima de bordos e desfolha precoce sob calor intenso e vento seco.',
    managementTip: 'Priorizar irrigação noturna por aspersão ou migrar para gotejamento localizado.',
  });

  // Cloreto (Localizada / Raiz)
  const chlorideVal = chemical?.chloridesClMgL ?? 0;
  let clRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (chlorideVal > 350) clRest = 'severa';
  else if (chlorideVal >= 140) clRest = 'moderada';

  params.push({
    key: 'fao_cl_root',
    parameterName: 'Cloretos (Cl⁻) - Absorção Radicular',
    category: 'Toxidez Específica',
    measuredValue: `${chlorideVal} mg/L Cl⁻`,
    unit: 'mg/L',
    currentRestriction: clRest,
    noRestrictionRange: '< 140 mg/L (< 4 meq/L)',
    moderateRestrictionRange: '140 a 350 mg/L',
    severeRestrictionRange: '> 350 mg/L (> 10 meq/L)',
    agronomicImpact:
      clRest === 'nenhuma'
        ? 'Concentração segura para todas as culturas, inclusive frutíferas sensíveis.'
        : 'Acúmulo de cloreto nas pontas e margens foliares com queima e dessecação de tecidos.',
    managementTip: 'Evitar adubações com KCl (Cloreto de Potássio); substituir por Sulfato ou Nitrato de Potássio.',
  });

  // Boro
  const boronVal = chemical?.boronBMgL ?? 0;
  let bRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (boronVal > 3.0) bRest = 'severa';
  else if (boronVal >= 0.7) bRest = 'moderada';

  params.push({
    key: 'fao_boron',
    parameterName: 'Boro Total (B) - Fitotoxicidade',
    category: 'Toxidez Específica',
    measuredValue: `${boronVal} mg/L B`,
    unit: 'mg/L',
    currentRestriction: bRest,
    noRestrictionRange: '< 0,7 mg/L',
    moderateRestrictionRange: '0,7 a 3,0 mg/L',
    severeRestrictionRange: '> 3,0 mg/L',
    agronomicImpact:
      bRest === 'nenhuma'
        ? 'Nível adequado e seguro; sem risco de toxidez.'
        : 'Clorose internerval seguida de manchas necróticas em folhas maduras em culturas suscetíveis.',
    managementTip: 'Selecionar culturas tolerantes a boro (ex: algodão, beterraba, alfafa) e evitar adubos boratados.',
  });

  // 4. Efeitos Diversos e Obstrução
  // Bicarbonatos
  const hco3Val = chemical?.bicarbonatesHco3MgL ?? 0;
  let hco3Rest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (hco3Val > 500) hco3Rest = 'severa';
  else if (hco3Val >= 90) hco3Rest = 'moderada';

  params.push({
    key: 'fao_bicarbonate',
    parameterName: 'Bicarbonatos (HCO₃⁻) & Alcalinidade',
    category: 'Efeitos Diversos',
    measuredValue: `${hco3Val} mg/L HCO₃⁻`,
    unit: 'mg/L',
    currentRestriction: hco3Rest,
    noRestrictionRange: '< 90 mg/L (< 1,5 meq/L)',
    moderateRestrictionRange: '90 a 500 mg/L',
    severeRestrictionRange: '> 500 mg/L (> 8,5 meq/L)',
    agronomicImpact:
      hco3Rest === 'nenhuma'
        ? 'Baixa alcalinidade; excelente para fertirrigação e caldas de pulverização.'
        : 'Induz clorose férrica nas plantas e causa precipitação de carbonato de cálcio (CaCO₃) nos gotejadores.',
    managementTip: 'Acidificação contínua da água de fertirrigação com Ácido Fosfórico ou Ácido Nítrico até pH 5,8-6,2.',
  });

  // Ferro Dissolvido
  const ironVal = chemical?.ironFeMgL ?? 0;
  let feRest: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  if (ironVal > 1.5) feRest = 'severa';
  else if (ironVal >= 0.2) feRest = 'moderada';

  params.push({
    key: 'fao_iron_clogging',
    parameterName: 'Ferro Dissolvido (Fe) - Risco de Obstrução',
    category: 'Obstrução de Emissores',
    measuredValue: `${ironVal} mg/L Fe`,
    unit: 'mg/L',
    currentRestriction: feRest,
    noRestrictionRange: '< 0,2 mg/L',
    moderateRestrictionRange: '0,2 a 1,5 mg/L',
    severeRestrictionRange: '> 1,5 mg/L',
    agronomicImpact:
      feRest === 'nenhuma'
        ? 'Sem risco de precipitação ou formação de biofilme ferro-oxidante.'
        : 'Oxidação rápida em Fe³⁺ formando hidróxido férrico gelatinoso avermelhado que obstrui gotejadores.',
    managementTip: 'Instalar aeração em cascata + decantação + retrolavagem frequente de filtros de areia.',
  });

  // Fração de Lixiviação
  const targetEce = 2.0;
  const lf = (ecDsM / (5 * targetEce - ecDsM)) * 100;
  const leachingFractionRequired = Math.max(0, Math.min(45, Math.round(lf * 10) / 10));

  let overallRestriction: 'nenhuma' | 'moderada' | 'severa' = 'nenhuma';
  const allRestrictions = params.map(p => p.currentRestriction);
  if (allRestrictions.includes('severa')) {
    overallRestriction = 'severa';
  } else if (allRestrictions.includes('moderada')) {
    overallRestriction = 'moderada';
  }

  return {
    overallRestriction,
    leachingFractionRequired,
    parameters: params,
  };
}

// ============================================================================
// 3. CALCULADORA DE FERTIRRIGAÇÃO (APORTE NUTRICIONAL DA ÁGUA)
// ============================================================================

export interface FertigationNutrientRow {
  nutrientName: string;
  element: string;
  concentrationMgL: number;
  kgPer1000m3: number;
  kgPerHectareAtLamina: number;
  commercialFertilizerEquivalent: string;
}

export function calculateFertigationCredits(
  analysis: WaterAnalysisRecord,
  laminaMm: number = 100 // 1 mm = 10 m³/ha
): FertigationNutrientRow[] {
  const { chemical } = analysis;
  const volumeM3PerHa = laminaMm * 10;

  const totalN = chemical?.totalNitrogenMgL ?? (chemical?.nitrateNo3MgL ?? 0) * 0.226 + (chemical?.ammoniumNh4MgL ?? 0) * 0.776;
  const calcium = chemical?.calciumCaMgL ?? 0;
  const magnesium = chemical?.magnesiumMgL ?? 0;
  const potassiumK = chemical?.potassiumKMgL ?? 0;
  const k2o = potassiumK * 1.2046;
  const sulfates = chemical?.sulfatesSo4MgL ?? 0;
  const s = sulfates * 0.3338;
  const phosphorus = chemical?.phosphorusPMgL ?? 0;
  const p2o5 = phosphorus * 2.2914;

  return [
    {
      nutrientName: 'Nitrogênio Nítrico / Amoniacal (N)',
      element: 'N',
      concentrationMgL: Math.round(totalN * 10) / 10,
      kgPer1000m3: Math.round(totalN * 1.0 * 10) / 10,
      kgPerHectareAtLamina: Math.round(((totalN * volumeM3PerHa) / 1000) * 10) / 10,
      commercialFertilizerEquivalent: `Ureia 46% (~${Math.round((((totalN * volumeM3PerHa) / 1000) / 0.46) * 10) / 10} kg/ha)`,
    },
    {
      nutrientName: 'Cálcio Solúvel (Ca)',
      element: 'Ca',
      concentrationMgL: Math.round(calcium * 10) / 10,
      kgPer1000m3: Math.round(calcium * 1.0 * 10) / 10,
      kgPerHectareAtLamina: Math.round(((calcium * volumeM3PerHa) / 1000) * 10) / 10,
      commercialFertilizerEquivalent: `Nitrato de Cálcio 19% (~${Math.round((((calcium * volumeM3PerHa) / 1000) / 0.19) * 10) / 10} kg/ha)`,
    },
    {
      nutrientName: 'Magnésio Solúvel (Mg)',
      element: 'Mg',
      concentrationMgL: Math.round(magnesium * 10) / 10,
      kgPer1000m3: Math.round(magnesium * 1.0 * 10) / 10,
      kgPerHectareAtLamina: Math.round(((magnesium * volumeM3PerHa) / 1000) * 10) / 10,
      commercialFertilizerEquivalent: `Sulfato de Magnésio 9,6% (~${Math.round((((magnesium * volumeM3PerHa) / 1000) / 0.096) * 10) / 10} kg/ha)`,
    },
    {
      nutrientName: 'Potássio Solúvel (K₂O)',
      element: 'K₂O',
      concentrationMgL: Math.round(k2o * 10) / 10,
      kgPer1000m3: Math.round(k2o * 1.0 * 10) / 10,
      kgPerHectareAtLamina: Math.round(((k2o * volumeM3PerHa) / 1000) * 10) / 10,
      commercialFertilizerEquivalent: `Cloreto de Potássio 60% (~${Math.round((((k2o * volumeM3PerHa) / 1000) / 0.6) * 10) / 10} kg/ha)`,
    },
    {
      nutrientName: 'Enxofre Sulfatado (S-SO₄)',
      element: 'S',
      concentrationMgL: Math.round(s * 10) / 10,
      kgPer1000m3: Math.round(s * 1.0 * 10) / 10,
      kgPerHectareAtLamina: Math.round(((s * volumeM3PerHa) / 1000) * 10) / 10,
      commercialFertilizerEquivalent: `Sulfato de Amônio 24% (~${Math.round((((s * volumeM3PerHa) / 1000) / 0.24) * 10) / 10} kg/ha)`,
    },
    {
      nutrientName: 'Fósforo Solúvel (P₂O₅)',
      element: 'P₂O₅',
      concentrationMgL: Math.round(p2o5 * 100) / 100,
      kgPer1000m3: Math.round(p2o5 * 1.0 * 100) / 100,
      kgPerHectareAtLamina: Math.round(((p2o5 * volumeM3PerHa) / 1000) * 100) / 100,
      commercialFertilizerEquivalent: `MAP Purificado 61% (~${Math.round((((p2o5 * volumeM3PerHa) / 1000) / 0.61) * 100) / 100} kg/ha)`,
    },
  ];
}

// ============================================================================
// 4. ACIDIFICAÇÃO E NEUTRALIZAÇÃO DE BICARBONATOS
// ============================================================================

export interface AcidDoseRow {
  acidName: string;
  formula: string;
  purityPercentage: number;
  volumeMlM3: number;
  volumeLPer100m3: number;
  nutrientAddedType: string;
  nutrientAddedValue: number;
}

export interface AcidNeutralizationPlan {
  currentHco3MgL: number;
  currentHco3MeqL: number;
  currentPh: number;
  hco3ToNeutralizeMgL: number;
  hco3ToNeutralizeMeqL: number;
  targetResidualHco3MgL: number;
  estimatedFinalPh: number;
  acidDoses: AcidDoseRow[];
}

export function calculateAcidNeutralization(
  analysis: WaterAnalysisRecord,
  targetResidualHco3MgL: number = 35
): AcidNeutralizationPlan {
  const currentHco3 = analysis.chemical?.bicarbonatesHco3MgL ?? 100;
  const currentPh = analysis.chemical?.ph ?? 7.4;
  const currentHco3MeqL = Math.round((currentHco3 / 61.01) * 100) / 100;

  const hco3ToNeutralizeMgL = Math.max(0, currentHco3 - targetResidualHco3MgL);
  const hco3ToNeutralizeMeqL = Math.round((hco3ToNeutralizeMgL / 61.01) * 100) / 100;

  // Se já estiver abaixo do residual alvo
  const meq = hco3ToNeutralizeMeqL;

  // 1. Ácido Fosfórico 85% (Densidade 1.68 g/mL) -> 68.6 µL / meq
  const fosforicoMlPerM3 = Math.round(meq * 68.6 * 10) / 10;
  const fosforicoL100m3 = Math.round((fosforicoMlPerM3 * 100 / 1000) * 100) / 100;
  const p2o5Added = Math.round(fosforicoMlPerM3 * 1.68 * 0.85 * (141.94 / (2 * 97.99)) * 10) / 10;

  // 2. Ácido Nítrico 58% (Densidade 1.36 g/mL) -> 79.9 µL / meq
  const nitricoMlPerM3 = Math.round(meq * 79.9 * 10) / 10;
  const nitricoL100m3 = Math.round((nitricoMlPerM3 * 100 / 1000) * 100) / 100;
  const nAdded = Math.round(nitricoMlPerM3 * 1.36 * 0.58 * (14.0 / 63.01) * 10) / 10;

  // 3. Ácido Sulfúrico 98% (Densidade 1.84 g/mL) -> 27.2 µL / meq
  const sulfuricoMlPerM3 = Math.round(meq * 27.2 * 10) / 10;
  const sulfuricoL100m3 = Math.round((sulfuricoMlPerM3 * 100 / 1000) * 100) / 100;
  const sAdded = Math.round(sulfuricoMlPerM3 * 1.84 * 0.98 * (32.06 / 98.08) * 10) / 10;

  const estimatedFinalPh = hco3ToNeutralizeMgL > 0 ? 5.8 : Math.min(6.5, currentPh);

  return {
    currentHco3MgL: currentHco3,
    currentHco3MeqL,
    currentPh,
    hco3ToNeutralizeMgL,
    hco3ToNeutralizeMeqL,
    targetResidualHco3MgL,
    estimatedFinalPh,
    acidDoses: [
      {
        acidName: 'Ácido Fosfórico Comercial (H₃PO₄ 85%)',
        formula: 'H₃PO₄',
        purityPercentage: 85,
        volumeMlM3: fosforicoMlPerM3,
        volumeLPer100m3: fosforicoL100m3,
        nutrientAddedType: 'P₂O₅',
        nutrientAddedValue: p2o5Added,
      },
      {
        acidName: 'Ácido Nítrico Comercial (HNO₃ 58%)',
        formula: 'HNO₃',
        purityPercentage: 58,
        volumeMlM3: nitricoMlPerM3,
        volumeLPer100m3: nitricoL100m3,
        nutrientAddedType: 'N-NO₃',
        nutrientAddedValue: nAdded,
      },
      {
        acidName: 'Ácido Sulfúrico Comercial (H₂SO₄ 98%)',
        formula: 'H₂SO₄',
        purityPercentage: 98,
        volumeMlM3: sulfuricoMlPerM3,
        volumeLPer100m3: sulfuricoL100m3,
        nutrientAddedType: 'S (Enxofre)',
        nutrientAddedValue: sAdded,
      },
    ],
  };
}

// ============================================================================
// 5. COMPATIBILIDADE DE FERTILIZANTES E RISCOS
// ============================================================================

export interface FertigationCompatibilityAlertFormatted {
  title: string;
  severity: 'baixo' | 'moderado' | 'alto';
  chemicalEquation: string;
  diagnosisExplanation: string;
  preventiveAction: string;
  description: string;
  recommendation: string;
}

export function evaluateFertigationCompatibility(
  analysis: WaterAnalysisRecord
): FertigationCompatibilityAlertFormatted[] {
  const { chemical } = analysis;
  const alerts: FertigationCompatibilityAlertFormatted[] = [];

  const calcium = chemical?.calciumCaMgL ?? 0;
  const sulfates = chemical?.sulfatesSo4MgL ?? 0;
  const ph = chemical?.ph ?? 7.0;
  const bicarbonates = chemical?.bicarbonatesHco3MgL ?? 0;

  // 1. Cálcio + Sulfato
  if (calcium > 50 || sulfates > 80) {
    const isHigh = calcium > 80 || sulfates > 150;
    alerts.push({
      title: 'Risco de Precipitação de Gesso (CaSO₄·2H₂O)',
      severity: isHigh ? 'alto' : 'moderado',
      chemicalEquation: 'Ca²⁺ + SO₄²⁻ + 2 H₂O → CaSO₄·2H₂O ↓',
      diagnosisExplanation: `Água contém ${calcium} mg/L de Cálcio e ${sulfates} mg/L de Sulfatos. A injeção combinada de fontes concentradas de Ca e SO₄ pode formar gesso insolúvel.`,
      preventiveAction: 'Separar em Tanques A (Cálcio) e B (Sulfatos), mantendo a calda diluída abaixo de 2 g/L.',
      description: `Água com ${calcium} mg/L Ca²⁺ e ${sulfates} mg/L SO₄²⁻. Injeção de adubos sulfatados com cálcio livre gera precipitados nos gotejadores.`,
      recommendation: 'Utilizar injeção separada em Tanques A e B e manter pH ajustado entre 5,8 e 6,2.',
    });
  }

  // 2. Cálcio + Fosfato
  if (calcium > 30 && ph > 7.0) {
    alerts.push({
      title: 'Risco de Precipitação de Fosfatos de Cálcio (Ca₃(PO₄)₂)',
      severity: ph > 7.5 ? 'alto' : 'moderado',
      chemicalEquation: '3 Ca²⁺ + 2 HPO₄²⁻ → Ca₃(PO₄)₂ ↓ + 2 H⁺',
      diagnosisExplanation: `Com pH ${ph} e Cálcio em ${calcium} mg/L, qualquer injeção de MAP ou Ácido Fosfórico sem acidificação prévia pode precipitar fosfatos insolúveis.`,
      preventiveAction: 'Acidificar a água para pH < 6,2 antes da injeção de fontes fosfatadas.',
      description: `pH ${ph} e Cálcio ${calcium} mg/L facilitam a formação de fosfato tricálcico insolúvel.`,
      recommendation: 'Acidificar a água de fertirrigação para pH < 6,2 antes da injeção de fertilizantes com fósforo.',
    });
  }

  // 3. Bicarbonatos e Precipitação de Micronutrientes
  if (bicarbonates > 120 && ph > 7.2) {
    alerts.push({
      title: 'Inativação e Precipitação de Micronutrientes Metálicos (Fe, Mn, Zn, Cu)',
      severity: 'alto',
      chemicalEquation: 'Fe²⁺ / Fe³⁺ + OH⁻ / CO₃²⁻ → Fe(OH)₃ ↓ (lodo)',
      diagnosisExplanation: `Alcalinidade de ${bicarbonates} mg/L HCO₃⁻ e pH ${ph} inativa sulfatos de micronutrientes, impedindo a absorção radicular.`,
      preventiveAction: 'Utilizar micronutrientes exclusivamente quelatados (Fe-EDDHA, Fe-DTPA, Zn-EDTA).',
      description: `Alcalinidade de ${bicarbonates} mg/L HCO₃⁻ precipita fontes convencionais de ferro e zinco.`,
      recommendation: 'Usar fontes quelatadas (Fe-EDDHA / Fe-DTPA) e neutralizar o excesso de bicarbonatos via Tanque C.',
    });
  }

  return alerts;
}
