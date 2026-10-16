import {
  SoilDisease,
  SuspectedDiseaseMatch,
  IgssResult,
  SoilChemicalParams,
  WeatherRiskAlert,
  SoilDiseaseOccurrence,
  SoilProperty,
  SoilField,
} from '../types/soilDiseases';
import { NATIONAL_SOIL_DISEASES } from '../data/soilDiseasesDatabase';

const STORAGE_KEYS = {
  PROPERTIES: 'geaagro_soil_disease_properties_v1',
  FIELDS: 'geaagro_soil_disease_fields_v1',
  OCCURRENCES: 'geaagro_soil_disease_occurrences_v1',
  SAMPLES: 'geaagro_soil_disease_samples_v1',
};

/**
 * Motor de Interpretação Baseado em Regras (Sem IA)
 * Compara os sintomas selecionados pelo usuário com o banco técnico de doenças.
 */
export function matchDiseasesFromSymptoms(
  selectedSymptoms: string[],
  crop?: string
): SuspectedDiseaseMatch[] {
  if (!selectedSymptoms || selectedSymptoms.length === 0) {
    return [];
  }

  const matches: SuspectedDiseaseMatch[] = [];

  NATIONAL_SOIL_DISEASES.forEach((disease) => {
    // Collect all symptoms for this disease across organs
    const diseaseSymptoms: string[] = [
      ...(disease.symptomsByOrgan.root || []),
      ...(disease.symptomsByOrgan.collar || []),
      ...(disease.symptomsByOrgan.stem || []),
      ...(disease.symptomsByOrgan.leaf || []),
      ...(disease.symptomsByOrgan.seedling || []),
    ];

    let matchCount = 0;
    const matchedSymptomNames: string[] = [];

    selectedSymptoms.forEach((s) => {
      const isMatched = diseaseSymptoms.some(
        (ds) =>
          ds.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(ds.toLowerCase())
      );
      if (isMatched) {
        matchCount++;
        matchedSymptomNames.push(s);
      }
    });

    // Check host compatibility
    const isHostCompatible =
      !crop || disease.hosts.some((h) => h.toLowerCase() === crop.toLowerCase());

    if (matchCount > 0) {
      // Calculate score based on proportion of matched symptoms
      const baseRatio = matchCount / selectedSymptoms.length;
      let score = Math.round(baseRatio * 85);

      if (isHostCompatible) {
        score += 15;
      } else {
        score -= 20;
      }

      score = Math.max(10, Math.min(99, score));

      let confidence: 'Baixa' | 'Média' | 'Alta' = 'Baixa';
      if (score >= 75) confidence = 'Alta';
      else if (score >= 45) confidence = 'Média';

      const reasoning = `Compatível com ${matchCount} dos ${selectedSymptoms.length} sintomas observados (${matchedSymptomNames.join(
        ', '
      )}). Hospedeiro ${crop || 'Geral'}: ${
        isHostCompatible ? 'Confirmado' : 'Não usual'
      }.`;

      matches.push({
        diseaseId: disease.id,
        diseaseName: disease.commonName,
        scientificName: disease.scientificName,
        group: disease.group,
        confidence,
        compatibilityScore: score,
        reasoning,
      });
    }
  });

  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Calculadora do Índice GeaAgro de Sanidade do Solo (IGSS)
 */
export function calculateIgssScore(params: {
  occurrencesCount: number;
  highSeverityCount: number;
  organicMatterGdm3: number;
  phH2o: number;
  cropRotationHistoryCount: number;
  usesBiologicals: boolean;
  hasGoodDrainage: boolean;
  tillageSystem: string;
}): IgssResult {
  // 1. Histórico Sanitário (Max 30)
  let sanitaryScore = 30;
  if (params.highSeverityCount > 0) {
    sanitaryScore -= params.highSeverityCount * 8;
  }
  if (params.occurrencesCount > 0) {
    sanitaryScore -= params.occurrencesCount * 3;
  }
  sanitaryScore = Math.max(0, sanitaryScore);

  // 2. Matéria Orgânica (Max 20)
  let omScore = 10;
  if (params.organicMatterGdm3 >= 35) omScore = 20;
  else if (params.organicMatterGdm3 >= 25) omScore = 16;
  else if (params.organicMatterGdm3 >= 18) omScore = 12;
  else if (params.organicMatterGdm3 < 12) omScore = 5;

  // 3. Equilíbrio Químico e pH (Max 15)
  let chemScore = 8;
  if (params.phH2o >= 6.0 && params.phH2o <= 6.8) chemScore = 15;
  else if (params.phH2o >= 5.5 && params.phH2o < 6.0) chemScore = 11;
  else if (params.phH2o < 5.2) chemScore = 4;

  // 4. Drenagem e Estrutura (Max 10)
  let drainageScore = params.hasGoodDrainage ? 10 : 3;

  // 5. Diversidade e Rotação (Max 15)
  let rotationScore = 5;
  if (params.cropRotationHistoryCount >= 4) rotationScore = 15;
  else if (params.cropRotationHistoryCount >= 2) rotationScore = 10;

  // 6. Manejo com Biológicos (Max 10)
  let bioScore = params.usesBiologicals ? 10 : 3;

  const overallScore = Math.min(
    100,
    Math.max(
      10,
      sanitaryScore + omScore + chemScore + drainageScore + rotationScore + bioScore
    )
  );

  let classification: 'Excelente' | 'Boa' | 'Atenção' | 'Alto Risco' = 'Atenção';
  if (overallScore >= 85) classification = 'Excelente';
  else if (overallScore >= 70) classification = 'Boa';
  else if (overallScore >= 50) classification = 'Atenção';
  else classification = 'Alto Risco';

  const recommendations: string[] = [];
  const predisposingFactors: string[] = [];

  if (omScore < 15) {
    recommendations.push(
      'Incrementar aporte de biomassa no solo com plantio de gramíneas de cobertura (Mix Urochloa + Crotalaria) para elevar a Matéria Orgânica.'
    );
    predisposingFactors.push('Baixo teor de Matéria Orgânica (< 25 g/dm³), reduzindo a supressividade microbiológica natural.');
  }

  if (chemScore < 10) {
    recommendations.push(
      'Realizar calagem corretiva para elevar o pH do solo acima de 6.0, inibindo patógenos fúngicos acidófilos como Fusarium e Rhizoctonia.'
    );
    predisposingFactors.push('pH ácido do solo (< 5.5), ambiente ideal para emergência de fungos radiculares.');
  }

  if (!params.usesBiologicals) {
    recommendations.push(
      'Adotar bioinsumos promotores de crescimento e supressores (Trichoderma harzianum + Bacillus subtilis) na semeadura.'
    );
  }

  if (!params.hasGoodDrainage) {
    recommendations.push(
      'Realizar descompactação física/subsolagem e abrir drenos para conter acúmulo de água e infestação por Oomicetos (Phytophthora/Pythium).'
    );
    predisposingFactors.push('Solo sujeito a saturação hídrica e encharcamento temporário.');
  }

  return {
    overallScore,
    classification,
    breakdown: {
      sanitaryHistoryScore: sanitaryScore,
      organicMatterScore: omScore,
      chemicalBalanceScore: chemScore,
      drainageStructureScore: drainageScore,
      cropDiversityScore: rotationScore,
      managementBiologicalsScore: bioScore,
    },
    recommendations,
    predisposingFactors,
  };
}

/**
 * Interpretação de Fatores Predisponentes com Base na Análise Quimica de Solo
 */
export function interpretSoilPredisposingFactors(chem: SoilChemicalParams): string[] {
  const factors: string[] = [];

  if (chem.phCacl2 < 5.0 || chem.phH2o < 5.5) {
    factors.push(
      'pH Ácido (pH H₂O < 5.5): Favorece e solubiliza fitopatógenos como Fusarium e Rhizoctonia, além de desestruturar a absorção iônica.'
    );
  }

  if (chem.organicMatterGdm3 < 20) {
    factors.push(
      'Baixo Teor de Matéria Orgânica (< 20 g/dm³): Solo com baixa diversidade microbiológica e menor capacidade de biocontrole natural.'
    );
  }

  if (chem.aluminumSaturationMpct > 15) {
    factors.push(
      'Saturação por Alumínio Elevada (m% > 15%): O Al³⁺ tóxico engrossa os ápices radiculares, paralisando a expansão e facilitando a entrada de nematóides.'
    );
  }

  if (chem.clayPct < 18) {
    factors.push(
      'Textura Arenosa (< 18% de Argila): Elevada suscetibilidade a estresse hídrico rápido e alta proliferação de Macrophomina e Pratylenchus.'
    );
  }

  // Diagnostics de Macronutrientes
  if (chem.caCmolc < 2.0) {
    factors.push(
      'Deficiência de Cálcio (Ca < 2.0 cmolc/dm³): Pectatos de cálcio reduzidos na lamela média celular, deixando o tecido radicular vulnerável ao ataque de Pythium, Rhizoctonia e Fusarium.'
    );
  }

  if (chem.kCmolc !== undefined && chem.kCmolc < 0.2) {
    factors.push(
      'Baixo Potássio (K < 0.2 cmolc/dm³): Compromete a regulação estomática e o acúmulo de compostos fenólicos defensivos nas raízes.'
    );
  }

  if (chem.sMgdm3 !== undefined && chem.sMgdm3 < 10) {
    factors.push(
      'Deficiência de Enxofre (S < 10 mg/dm³): Prejudica a síntese de aminoácidos sulfurados (cisteína/metionina) e fitoalexinas essenciais para imunidade vegetativa.'
    );
  }

  // Diagnostics de Micronutrientes
  if (chem.bMgdm3 !== undefined && chem.bMgdm3 < 0.3) {
    factors.push(
      'Deficiência de Boro (B < 0.3 mg/dm³): Provoca microfissuras e descontinuidade nas paredes celulares radiculares, servindo de porta de entrada para nematoides e podridões.'
    );
  }

  if (chem.mnMgdm3 !== undefined && chem.mnMgdm3 < 5.0) {
    factors.push(
      'Manganês Deficiente (Mn < 5.0 mg/dm³): Inibe a via dos fenilpropanoides e a síntese de lignina nas raízes, aumentando drasticamente a severidade de Rhizoctonia solani.'
    );
  }

  if (chem.siMgdm3 !== undefined && chem.siMgdm3 < 8.0) {
    factors.push(
      'Baixo Silício (Si < 8.0 mg/dm³): Menor deposição da barreira mecânica de sílica amorfa sob a cutícula e endoderme radicular, facilitando a penetração de hifas fúngicas.'
    );
  }

  if (chem.cuMgdm3 !== undefined && chem.cuMgdm3 < 0.8) {
    factors.push(
      'Cobre Baixo (Cu < 0.8 mg/dm³): Reduz a atividade de enzimas polifenoloxidase e polimerização de polímeros defensivos de cicatrização.'
    );
  }

  return factors;
}

/**
 * Cálculo de Alertas Climáticos de Risco para Doenças do Solo
 */
export function calculateWeatherRiskAlerts(
  tempC: number,
  rainfallMm: number,
  humidityPct: number
): WeatherRiskAlert[] {
  const alerts: WeatherRiskAlert[] = [];

  NATIONAL_SOIL_DISEASES.forEach((disease) => {
    const fc = disease.technicalInfo.favorableConditions;
    let isTempFavorable = tempC >= fc.tempMinC && tempC <= fc.tempMaxC;
    let isWaterFavorable = rainfallMm > 25 || humidityPct > 80;

    if (isTempFavorable && isWaterFavorable) {
      alerts.push({
        diseaseId: disease.id,
        diseaseName: disease.commonName,
        riskLevel: 'Crítico',
        reasons: [
          `Temperatura atual (${tempC}°C) na faixa ideal (${fc.tempIdeal}).`,
          `Chuva/Umidade recente (${rainfallMm}mm / ${humidityPct}%) cria solo saturado propício à infecção.`,
        ],
      });
    } else if (isTempFavorable || isWaterFavorable) {
      alerts.push({
        diseaseId: disease.id,
        diseaseName: disease.commonName,
        riskLevel: 'Favorável',
        reasons: [`Condições ambientais moderadas para infecção radicular.`],
      });
    }
  });

  return alerts;
}

// Storage helpers
export function loadPropertiesFromStorage(): SoilProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading properties from storage', e);
  }
  return [];
}

export function savePropertiesToStorage(properties: SoilProperty[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  } catch (e) {
    console.error('Error saving properties to storage', e);
  }
}

export function loadFieldsFromStorage(): SoilField[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FIELDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading fields from storage', e);
  }
  return [];
}

export function saveFieldsToStorage(fields: SoilField[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields));
  } catch (e) {
    console.error('Error saving fields to storage', e);
  }
}

export function loadOccurrencesFromStorage(): SoilDiseaseOccurrence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OCCURRENCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading occurrences from storage', e);
  }
  return [];
}

export function saveOccurrencesToStorage(occurrences: SoilDiseaseOccurrence[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.OCCURRENCES, JSON.stringify(occurrences));
  } catch (e) {
    console.error('Error saving occurrences to storage', e);
  }
}

/**
 * Gerador de Relatório Profissional em PDF / Impressão
 */
export function printSoilDiseaseReport(
  occ: SoilDiseaseOccurrence,
  prop?: SoilProperty,
  field?: SoilField
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const diseaseMatch = occ.suspectedDiseases[0];
  const fullDiseaseInfo = NATIONAL_SOIL_DISEASES.find(
    (d) => d.id === diseaseMatch?.diseaseId
  );

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Técnico - Doenças do Solo - ${occ.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; color: #1a2a1a; line-height: 1.5; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2d5a27; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 26px; font-weight: bold; color: #2d5a27; }
        .subtitle { font-size: 14px; color: #555; }
        .title-box { background: #f4f8f3; border-left: 5px solid #2d5a27; padding: 12px 16px; margin-bottom: 20px; }
        h1 { font-size: 20px; margin: 0 0 5px 0; color: #2d5a27; }
        h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #2d5a27; margin-top: 25px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .card { background: #fafafa; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
        .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
        .value { font-size: 14px; font-weight: 600; color: #111; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-alta { background: #fee2e2; color: #991b1b; }
        .badge-media { background: #fef3c7; color: #92400e; }
        .badge-baixa { background: #e0e7ff; color: #3730a3; }
        .badge-confirmado { background: #dcfce7; color: #166534; }
        ul { margin: 5px 0; padding-left: 20px; }
        li { margin-bottom: 4px; font-size: 13px; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; pt-10px; font-size: 11px; text-align: center; color: #777; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">GeaAgro Suite</div>
          <div class="subtitle">Diagnóstico & Sanidade de Solo e Fitopatologia Nacional</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; font-size: 12px;">LAUDO TÉCNICO OFICIAL</div>
          <div style="font-size: 11px; color: #666;">Data: ${new Date(occ.date).toLocaleDateString('pt-BR')}</div>
        </div>
      </div>

      <div class="title-box">
        <h1>Relatório Fitossanitário: ${occ.crop} (${occ.fieldName})</h1>
        <div style="font-size: 13px; color: #444;">Propriedade: ${prop?.farmName || 'Fazenda Registrada'} | Responsável: ${prop?.technicalResponsible || 'Engenheiro Agrônomo'}</div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="label">Propriedade & Localização</div>
          <div class="value">${prop?.farmName || 'Fazenda GeaAgro'} - ${prop?.municipality || 'Cascavel'}/${prop?.state || 'PR'}</div>
          <div style="font-size: 12px; margin-top: 4px;">CREA: ${prop?.crea || 'N/A'} | GPS: ${occ.gpsPoint?.lat || -24.9560}, ${occ.gpsPoint?.lng || -53.4560}</div>
        </div>
        <div class="card">
          <div class="label">Talhão & Cultura</div>
          <div class="value">${field?.name || occ.fieldName} (${field?.areaHa || 100} ha)</div>
          <div style="font-size: 12px; margin-top: 4px;">Cultura: ${occ.crop} (${occ.cultivar}) | Sistema: ${field?.croppingSystem || 'Plantio Direto'}</div>
        </div>
      </div>

      <h2>1. Status e Nível de Diagnóstico</h2>
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 100px;">
          <div>
            <span class="label">Estágio de Diagnóstico:</span> 
            <span class="badge ${occ.stage === 'DIAGNOSTICO_CONFIRMADO' ? 'badge-confirmado' : 'badge-media'}">${occ.stage}</span>
          </div>
          <div>
            <span class="label">Severidade no Talhão:</span> 
            <span class="badge badge-alta">${occ.severity} (${occ.affectedAreaHa} ha afetados / ${occ.incidencePct}% incidência)</span>
          </div>
        </div>

        ${
          occ.confirmedDiagnosis
            ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px; margin-top: 10px;">
            <div style="font-weight: bold; color: #166534; font-size: 13px;">DIAGNÓSTICO CONFIRMADO POR LABORATÓRIO:</div>
            <div style="font-size: 12px; margin-top: 4px;">
              <b>Laboratório:</b> ${occ.confirmedDiagnosis.laboratory} | <b>Laudo Nº:</b> ${occ.confirmedDiagnosis.reportNumber}<br/>
              <b>Patógeno Identificado:</b> ${occ.confirmedDiagnosis.pathogenIdentified}<br/>
              <b>Método:</b> ${occ.confirmedDiagnosis.method} | <b>Data Confirmação:</b> ${occ.confirmedDiagnosis.confirmationDate}
            </div>
          </div>
        `
            : `
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 10px; margin-top: 10px;">
            <div style="font-weight: bold; color: #92400e; font-size: 13px;">TRIAGEM DE CAMPO (Diagnóstico Preliminar):</div>
            <div style="font-size: 12px; margin-top: 4px;">
              <b>Principal Suspeita:</b> ${diseaseMatch?.diseaseName || 'Não especificado'} (<i>${diseaseMatch?.scientificName || ''}</i>)<br/>
              <b>Nível de Compatibilidade de Sintomas:</b> ${diseaseMatch?.compatibilityScore || 0}% (${diseaseMatch?.confidence || 'Média'})<br/>
              <b>Nota de Segurança:</b> Diagnóstico definitivo de confirmação requer envio de amostras radiculares para laudo laboratorial.
            </div>
          </div>
        `
        }
      </div>

      <h2>2. Sintomas Observados em Campo</h2>
      <div class="card">
        <ul>
          ${occ.symptoms.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      ${
        fullDiseaseInfo
          ? `
      <h2>3. Recomendações Técnicas de Manejo Integrado</h2>
      <div class="grid">
        <div class="card">
          <div class="label" style="color: #2d5a27;">Manejo Preventivo & Cultural</div>
          <ul>
            ${fullDiseaseInfo.technicalInfo.preventiveManagement.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <div class="label" style="color: #15803d;">Manejo Biológico & Bioinsumos</div>
          <ul>
            ${fullDiseaseInfo.technicalInfo.biologicalManagement.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="grid">
        <div class="card">
          <div class="label" style="color: #b91c1c;">Manejo Químico Recomendado</div>
          <ul>
            ${fullDiseaseInfo.technicalInfo.chemicalManagement.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <div class="label" style="color: #d97706;">Manejo Nutricional & Solo</div>
          <ul>
            ${fullDiseaseInfo.technicalInfo.nutritionalManagement.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      </div>
      `
          : ''
      }

      <div class="footer">
        Gerado automaticamente pelo Sistema GeaAgro Suite - Módulo de Sanidade e Doenças do Solo (100% Offline)<br/>
        Consulte sempre um Engenheiro Agrônomo devidamente habilitado antes da aplicação de defensivos químicos.
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
