/**
 * Motor de Interpolação Espacial e Processador de Taxa Variável (VRA) - GeaAgro CRM
 * Suporta IDW (Inverse Distance Weighting), Krigagem Ordinária (Ordinary Kriging),
 * Gerador de Mapas de Prescrição, Exportação GeoJSON e ISOXML ISO 11783-10 (TASKDATA.XML).
 */

export interface SamplePoint {
  id: string;
  x: number; // Longitude ou UTM X
  y: number; // Latitude ou UTM Y
  valor: number; // Teor do nutriente (ex: P mg/dm³, K cmolc/dm³, pH, V%)
  code?: string;
  notes?: string;
}

export interface GridBounding {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  resolutionMeters?: number; // Tamanho da célula (padrão ~15m)
  boundaryCoordinates?: [number, number][]; // Polígono do talhão para recorte
}

export interface GridCell {
  id: string;
  col: number;
  row: number;
  x: number; // Centro Longitude
  y: number; // Centro Latitude
  valorEstimado: number;
  variancia?: number; // Para Krigagem
  insideBoundary: boolean;
}

export type SemivariogramModel = 'spherical' | 'exponential' | 'gaussian';

export interface KrigingParameters {
  modelo: SemivariogramModel;
  nugget: number; // Efeito Pepita (C0)
  sill: number;   // Patamar (C0 + C)
  range: number;  // Alcance em metros (a)
}

export interface DoseInterval {
  id: string;
  minVal: number;
  maxVal: number;
  dose: number;
  unit: 'KG_HA' | 'T_HA';
  label: string;
  color: string;
}

export interface PrescriptionFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    ID: string;
    DOSE_TARGET: number;
    UNIT: 'KG_HA' | 'T_HA';
    NUTRIENT: string;
    VALOR_INTERPOLADO: number;
    AREA_HA: number;
    CLASS_LABEL: string;
    COLOR: string;
    TOTAL_INPUT_KG_TON: number;
  };
}

export interface PrescriptionMapResult {
  type: 'FeatureCollection';
  features: PrescriptionFeature[];
  metadata: {
    nutrient: string;
    nutrientName?: string;
    method: 'IDW' | 'Kriging';
    totalAreaHa: number;
    totalInputRequired: number;
    inputUnit: 'KG_HA' | 'T_HA';
    meanValue: number;
    minValue: number;
    maxValue: number;
    gridResolutionMeters: number;
    intervalCount: number;
    intervals?: DoseInterval[];
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES GEODÉSICAS
// ============================================================================

/**
 * Calcula a distância em metros entre duas coordenadas Geográficas (Haversine)
 */
export function calculateGeodesicDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Teste Ray-Casting para verificar se Ponto (x=lng, y=lat) está dentro de um Polígono
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return true;
  const [x, y] = point; // [lng, lat]
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1]; // lon
    const yi = polygon[i][0]; // lat
    const xj = polygon[j][1]; // lon
    const yj = polygon[j][0]; // lat

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

// ============================================================================
// MÓDULO 1: MOTOR DE INTERPOLAÇÃO ESPACIAL
// ============================================================================

/**
 * 1. Interpolação IDW (Inverse Distance Weighting)
 */
export function interpolateIDW(
  amostras: SamplePoint[],
  gridBounding: GridBounding,
  power = 2,
  maxVizinhos = 12
): GridCell[] {
  if (!amostras || amostras.length === 0) return [];

  const resMeters = gridBounding.resolutionMeters || 15;
  // Aproximação de graus para metros (~111.000m por grau)
  const stepLat = resMeters / 111000;
  const avgLat = (gridBounding.minY + gridBounding.maxY) / 2;
  const stepLng = resMeters / (111000 * Math.cos((avgLat * Math.PI) / 180));

  const cells: GridCell[] = [];
  let colIndex = 0;

  for (let y = gridBounding.minY; y <= gridBounding.maxY; y += stepLat) {
    let rowIndex = 0;
    for (let x = gridBounding.minX; x <= gridBounding.maxX; x += stepLng) {
      const isInside = gridBounding.boundaryCoordinates
        ? isPointInPolygon([x, y], gridBounding.boundaryCoordinates)
        : true;

      if (!isInside) {
        rowIndex++;
        continue;
      }

      // Calcular distâncias de todas as amostras até o centro desta célula
      const distances = amostras.map((s) => {
        const d = calculateGeodesicDistanceMeters(y, x, s.y, s.x);
        return { sample: s, dist: d };
      });

      // Checagem de divisão por zero: se a célula coincide exatamente com um ponto de amostra (< 0.5m)
      const exactMatch = distances.find((item) => item.dist < 0.5);
      if (exactMatch) {
        cells.push({
          id: `cell_${colIndex}_${rowIndex}`,
          col: colIndex,
          row: rowIndex,
          x,
          y,
          valorEstimado: exactMatch.sample.valor,
          insideBoundary: true,
        });
        rowIndex++;
        continue;
      }

      // Ordenar e pegar os K vizinhos mais próximos
      distances.sort((a, b) => a.dist - b.dist);
      const vizinhos = distances.slice(0, Math.min(maxVizinhos, distances.length));

      let sumWeights = 0;
      let weightedSum = 0;

      for (const item of vizinhos) {
        const w = 1 / Math.pow(item.dist, power);
        sumWeights += w;
        weightedSum += item.sample.valor * w;
      }

      const valorEstimado = sumWeights > 0 ? weightedSum / sumWeights : 0;

      cells.push({
        id: `cell_${colIndex}_${rowIndex}`,
        col: colIndex,
        row: rowIndex,
        x,
        y,
        valorEstimado: Number(valorEstimado.toFixed(3)),
        insideBoundary: true,
      });

      rowIndex++;
    }
    colIndex++;
  }

  return cells;
}

/**
 * Função de Semivariograma Teórico (Esférico, Exponencial, Gaussiano)
 */
export function calculateSemivariance(
  h: number,
  params: KrigingParameters
): number {
  const { modelo, nugget, sill, range } = params;
  const C = Math.max(0, sill - nugget);

  if (h === 0) return 0;
  if (h >= range) return nugget + C;

  if (modelo === 'spherical') {
    return nugget + C * ((1.5 * h) / range - 0.5 * Math.pow(h / range, 3));
  } else if (modelo === 'exponential') {
    return nugget + C * (1 - Math.exp(-h / range));
  } else if (modelo === 'gaussian') {
    return nugget + C * (1 - Math.exp(-Math.pow(h / range, 2)));
  }

  return nugget + C;
}

/**
 * Resolver de Sistema Linear de Equações A * x = B via Eliminação de Gauss com Pivoteamento Parcial
 */
export function solveLinearSystem(A: number[][], B: number[]): number[] | null {
  const n = B.length;
  // Criar matriz aumentada M = [A | B]
  const M: number[][] = A.map((row, i) => [...row, B[i]]);

  for (let i = 0; i < n; i++) {
    // Pivoteamento parcial para estabilidade numérica
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    if (Math.abs(M[maxRow][i]) < 1e-12) {
      // Matriz singular ou quase singular
      return null;
    }

    // Trocar linhas
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    // Eliminação
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Substituição regressiva
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}

/**
 * 2. Interpolação Krigagem Ordinária (Ordinary Kriging)
 */
export function interpolateKriging(
  amostras: SamplePoint[],
  gridBounding: GridBounding,
  params: KrigingParameters = {
    modelo: 'spherical',
    nugget: 0.1,
    sill: 1.0,
    range: 300,
  }
): GridCell[] {
  if (!amostras || amostras.length === 0) return [];

  const N = amostras.length;
  const resMeters = gridBounding.resolutionMeters || 15;
  const stepLat = resMeters / 111000;
  const avgLat = (gridBounding.minY + gridBounding.maxY) / 2;
  const stepLng = resMeters / (111000 * Math.cos((avgLat * Math.PI) / 180));

  // Montar Matriz A de Krigagem de dimensão (N+1) x (N+1)
  const A: number[][] = Array.from({ length: N + 1 }, () => new Array(N + 1).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const d = calculateGeodesicDistanceMeters(
        amostras[i].y,
        amostras[i].x,
        amostras[j].y,
        amostras[j].x
      );
      A[i][j] = calculateSemivariance(d, params);
    }
    A[i][N] = 1;
    A[N][i] = 1;
  }
  A[N][N] = 0;

  const cells: GridCell[] = [];
  let colIndex = 0;

  for (let y = gridBounding.minY; y <= gridBounding.maxY; y += stepLat) {
    let rowIndex = 0;
    for (let x = gridBounding.minX; x <= gridBounding.maxX; x += stepLng) {
      const isInside = gridBounding.boundaryCoordinates
        ? isPointInPolygon([x, y], gridBounding.boundaryCoordinates)
        : true;

      if (!isInside) {
        rowIndex++;
        continue;
      }

      // Montar Vetor B de tamanho (N+1)
      const B: number[] = new Array(N + 1).fill(1);
      let exactSampleMatch: SamplePoint | null = null;

      for (let i = 0; i < N; i++) {
        const d = calculateGeodesicDistanceMeters(y, x, amostras[i].y, amostras[i].x);
        if (d < 0.5) {
          exactSampleMatch = amostras[i];
          break;
        }
        B[i] = calculateSemivariance(d, params);
      }

      if (exactSampleMatch) {
        cells.push({
          id: `krig_cell_${colIndex}_${rowIndex}`,
          col: colIndex,
          row: rowIndex,
          x,
          y,
          valorEstimado: exactSampleMatch.valor,
          variancia: 0,
          insideBoundary: true,
        });
        rowIndex++;
        continue;
      }

      // Resolver sistema de Krigagem A * weights = B
      const weights = solveLinearSystem(A, B);

      if (!weights) {
        // Se a matriz for singular, fallback seguro para IDW local
        const idwCell = interpolateIDW(amostras, {
          minX: x,
          maxX: x,
          minY: y,
          maxY: y,
          resolutionMeters: resMeters,
        });
        cells.push({
          id: `krig_cell_${colIndex}_${rowIndex}`,
          col: colIndex,
          row: rowIndex,
          x,
          y,
          valorEstimado: idwCell[0]?.valorEstimado || 0,
          variancia: params.nugget,
          insideBoundary: true,
        });
      } else {
        let valorEstimado = 0;
        let variancia = weights[N]; // Multiplicador de Lagrange

        for (let i = 0; i < N; i++) {
          valorEstimado += weights[i] * amostras[i].valor;
          variancia += weights[i] * B[i];
        }

        cells.push({
          id: `krig_cell_${colIndex}_${rowIndex}`,
          col: colIndex,
          row: rowIndex,
          x,
          y,
          valorEstimado: Number(Math.max(0, valorEstimado).toFixed(3)),
          variancia: Number(Math.max(0, variancia).toFixed(4)),
          insideBoundary: true,
        });
      }

      rowIndex++;
    }
    colIndex++;
  }

  return cells;
}

// ============================================================================
// MÓDULO 2: PROCESSADOR DE TAXA VARIÁVEL (PRESCRIÇÃO VRA)
// ============================================================================

/**
 * Converte células de matriz em Polígonos de Grade GeoJSON
 */
function createGridCellPolygon(
  x: number,
  y: number,
  stepLng: number,
  stepLat: number
): number[][][] {
  const halfX = stepLng / 2;
  const halfY = stepLat / 2;

  const minX = x - halfX;
  const maxX = x + halfX;
  const minY = y - halfY;
  const maxY = y + halfY;

  return [
    [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
      [minX, minY],
    ],
  ];
}

/**
 * Gera o Mapa de Prescrição em Taxa Variável (VRA)
 */
export function generatePrescriptionMap(
  gridInterpolado: GridCell[],
  intervalosDose: DoseInterval[],
  regraAgronomica = 'Prescrição VRA GeaAgro',
  nutrientName = 'Fósforo (P)'
): PrescriptionMapResult {
  if (!gridInterpolado || gridInterpolado.length === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
      metadata: {
        nutrient: nutrientName,
        method: 'IDW',
        totalAreaHa: 0,
        totalInputRequired: 0,
        inputUnit: 'KG_HA',
        meanValue: 0,
        minValue: 0,
        maxValue: 0,
        gridResolutionMeters: 15,
        intervalCount: intervalosDose.length,
      },
    };
  }

  // Estimar passo da grade em graus para polígonos
  const stepLng = Math.abs(
    (gridInterpolado[1]?.x || gridInterpolado[0].x) - gridInterpolado[0].x
  ) || 0.00015;
  const stepLat = stepLng;

  // Tamanho aproximado da célula em ha (15m x 15m = 225m² = 0.0225 ha)
  const avgLat = gridInterpolado[0].y;
  const widthM = stepLng * 111000 * Math.cos((avgLat * Math.PI) / 180);
  const heightM = stepLat * 111000;
  const cellAreaHa = Number(((widthM * heightM) / 10000).toFixed(4)) || 0.0225;

  let sumVal = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;
  let totalInput = 0;
  let primaryUnit: 'KG_HA' | 'T_HA' = 'KG_HA';

  const features: PrescriptionFeature[] = gridInterpolado.map((cell, idx) => {
    const val = cell.valorEstimado;
    sumVal += val;
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;

    // Encontrar faixa de dose correspondente
    const matchingInterval = intervalosDose.find(
      (inter) => val >= inter.minVal && val <= inter.maxVal
    ) || intervalosDose[intervalosDose.length - 1] || {
      id: 'default',
      minVal: 0,
      maxVal: 999,
      dose: 0,
      unit: 'KG_HA',
      label: 'Sem Aplicação',
      color: '#94a3b8',
    };

    primaryUnit = matchingInterval.unit;
    const dose = matchingInterval.dose;
    const inputForCell = (dose * cellAreaHa); // kg ou ton para a célula
    totalInput += inputForCell;

    const geometry = createGridCellPolygon(cell.x, cell.y, stepLng, stepLat);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: geometry,
      },
      properties: {
        ID: `zone_${idx + 1}`,
        DOSE_TARGET: dose,
        UNIT: matchingInterval.unit,
        NUTRIENT: nutrientName,
        VALOR_INTERPOLADO: val,
        AREA_HA: cellAreaHa,
        CLASS_LABEL: matchingInterval.label,
        COLOR: matchingInterval.color,
        TOTAL_INPUT_KG_TON: Number(inputForCell.toFixed(2)),
      },
    };
  });

  const totalAreaHa = Number((features.length * cellAreaHa).toFixed(2));
  const meanValue = Number((sumVal / (features.length || 1)).toFixed(2));

  return {
    type: 'FeatureCollection',
    features,
    metadata: {
      nutrient: nutrientName,
      nutrientName: nutrientName,
      method: gridInterpolado[0]?.variancia !== undefined ? 'Kriging' : 'IDW',
      totalAreaHa,
      totalInputRequired: Number(totalInput.toFixed(2)),
      inputUnit: primaryUnit,
      meanValue,
      minValue: Number(minVal.toFixed(2)),
      maxValue: Number(maxVal.toFixed(2)),
      gridResolutionMeters: Math.round(widthM) || 15,
      intervalCount: intervalosDose.length,
      intervals: intervalosDose,
    },
  };
}

// ============================================================================
// MÓDULO 3: EXPORTAÇÃO DE DADOS (GEOJSON & ISOXML ISO 11783-10)
// ============================================================================

/**
 * 1. Exportar Mapa de Prescrição VRA para GeoJSON
 */
export function exportToGeoJSON(prescriptionData: PrescriptionMapResult): string {
  return JSON.stringify(prescriptionData, null, 2);
}

/**
 * 2. Exportar Estrutura ISOXML (ISO 11783-10 TASKDATA.XML) para Computadores de Bordo
 */
export function exportToISOXMLStructure(
  prescriptionData: PrescriptionMapResult,
  taskName = 'PRESC_VRA_GEAAGRO'
): string {
  const meta = prescriptionData.metadata;
  const features = prescriptionData.features;

  const sanitizeName = taskName.replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
  const dateStr = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ISO11783_TaskData VersionMajor="4" VersionMinor="0" ManagementSoftwareManufacturer="GeaAgro CRM" ManagementSoftwareVersion="4.2.3.5" DataTransferOrigin="1">
  <XSC A="XSC1" B="GeaAgro Brasil" C="4.2.3.5" />
  <CTR A="CTR1" B="Proprietario Agrícola" />
  <FRM A="FRM1" B="Fazenda Ativa" />
  <PDT A="PDT1" B="${meta.nutrient} VRA" C="0" D="1" />
  
  <!-- Definição da Tarefa Agrícola ISO 11783-10 -->
  <TSK A="TSK1" B="${sanitizeName}" C="1" D="1" E="0">
    <TZN A="1" B="Zona Padrão VRA">
      <PDV A="0001" B="${Math.round(meta.totalInputRequired / (meta.totalAreaHa || 1))}" C="PDT1" D="1" />
    </TZN>
`;

  // Grid Data ISOXML
  features.forEach((feat, index) => {
    const props = feat.properties;
    const coords = feat.geometry.coordinates[0];
    const centerLng = (coords[0][0] + coords[2][0]) / 2;
    const centerLat = (coords[0][1] + coords[2][1]) / 2;

    xml += `    <TZN A="${index + 2}" B="${props.CLASS_LABEL}">
      <PDV A="0001" B="${Math.round(props.DOSE_TARGET)}" C="PDT1" D="1" />
      <POL>
        <EXT>
`;
    coords.forEach(([lng, lat]) => {
      xml += `          <PNT A="${lat.toFixed(7)}" B="${lng.toFixed(7)}" />\n`;
    });
    xml += `        </EXT>
      </POL>
    </TZN>\n`;
  });

  xml += `  </TSK>
</ISO11783_TaskData>`;

  return xml;
}

// ============================================================================
// SEMIVARIOGRAMA EMPÍRICO & AJUSTE DE MODELO TEÓRICO
// ============================================================================

export interface SemivariogramPoint {
  distance: number; // h em metros
  semivariance: number; // gamma(h)
  pairCount: number; // N(h)
}

/**
 * Calcula o Semivariograma Empírico (Pontos Experimentais)
 * agrupando os pares de pontos por lags de distância h.
 */
export function calculateEmpiricalSemivariogram(
  amostras: SamplePoint[],
  numBins = 10
): SemivariogramPoint[] {
  if (!amostras || amostras.length < 2) return [];

  const pairs: { dist: number; semivar: number }[] = [];
  let maxDist = 0;

  for (let i = 0; i < amostras.length; i++) {
    for (let j = i + 1; j < amostras.length; j++) {
      const d = calculateGeodesicDistanceMeters(
        amostras[i].y,
        amostras[i].x,
        amostras[j].y,
        amostras[j].x
      );
      const semivar = 0.5 * Math.pow(amostras[i].valor - amostras[j].valor, 2);
      pairs.push({ dist: d, semivar });
      if (d > maxDist) maxDist = d;
    }
  }

  if (maxDist === 0 || pairs.length === 0) return [];

  // Considera até 70% da distância máxima (regra de Matheron)
  const maxLag = maxDist * 0.7;
  const binWidth = maxLag / numBins;

  const bins: { sumDist: number; sumSemivar: number; count: number }[] = Array.from(
    { length: numBins },
    () => ({ sumDist: 0, sumSemivar: 0, count: 0 })
  );

  pairs.forEach(({ dist, semivar }) => {
    if (dist <= maxLag) {
      const binIdx = Math.min(Math.floor(dist / binWidth), numBins - 1);
      bins[binIdx].sumDist += dist;
      bins[binIdx].sumSemivar += semivar;
      bins[binIdx].count += 1;
    }
  });

  return bins
    .filter((b) => b.count > 0)
    .map((b) => ({
      distance: Number((b.sumDist / b.count).toFixed(1)),
      semivariance: Number((b.sumSemivar / b.count).toFixed(3)),
      pairCount: b.count,
    }));
}

/**
 * Ajusta automaticamente os parâmetros do semivariograma (Nugget, Sill, Range)
 * minimizando o erro ponderado em relação aos pontos empíricos.
 */
export function fitOptimalSemivariogram(
  amostras: SamplePoint[],
  modelo: SemivariogramModel = 'spherical'
): KrigingParameters {
  const empirical = calculateEmpiricalSemivariogram(amostras);
  if (empirical.length === 0) {
    return { modelo, nugget: 0.1, sill: 1.2, range: 250 };
  }

  const maxDist = Math.max(...empirical.map((e) => e.distance));
  const maxVar = Math.max(...empirical.map((e) => e.semivariance));
  const minVar = Math.min(...empirical.map((e) => e.semivariance));

  let bestNugget = Math.max(0, minVar * 0.2);
  let bestSill = Math.max(bestNugget + 0.1, maxVar);
  let bestRange = maxDist * 0.6 || 250;
  let bestErr = Infinity;

  // Grid Search sobre candidatos de parâmetros
  const nuggetCandidates = [0, minVar * 0.1, minVar * 0.3, minVar * 0.5];
  const sillCandidates = [maxVar * 0.8, maxVar * 1.0, maxVar * 1.2, maxVar * 1.5];
  const rangeCandidates = [maxDist * 0.3, maxDist * 0.5, maxDist * 0.7, maxDist * 0.9, maxDist * 1.1];

  for (const n of nuggetCandidates) {
    for (const s of sillCandidates) {
      if (s <= n) continue;
      for (const r of rangeCandidates) {
        if (r <= 0) continue;
        const testParams: KrigingParameters = { modelo, nugget: n, sill: s, range: r };
        let err = 0;
        for (const pt of empirical) {
          const pred = calculateSemivariance(pt.distance, testParams);
          err += Math.pow(pred - pt.semivariance, 2) * pt.pairCount;
        }
        if (err < bestErr) {
          bestErr = err;
          bestNugget = n;
          bestSill = s;
          bestRange = r;
        }
      }
    }
  }

  return {
    modelo,
    nugget: Number(bestNugget.toFixed(2)),
    sill: Number(bestSill.toFixed(2)),
    range: Number(bestRange.toFixed(1)),
  };
}

// ============================================================================
// EXEMPLO PRÁTICO SINTÉTICO (10 PONTOS DE FÓSFORO P)
// ============================================================================

/**
 * Cria 10 pontos sintéticos de amostragem de Fósforo (P) georreferenciados
 */
export function generateSyntheticPhosphorusSamples(
  boundaryCoordinates?: [number, number][]
): SamplePoint[] {
  let baseLat = -12.5448; // Sorriso MT por padrão
  let baseLng = -55.7214;

  if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
    let sumLat = 0;
    let sumLng = 0;
    boundaryCoordinates.forEach(([lat, lng]) => {
      sumLat += lat;
      sumLng += lng;
    });
    baseLat = sumLat / boundaryCoordinates.length;
    baseLng = sumLng / boundaryCoordinates.length;
  }

  // Raio de dispersão ~300 metros
  const delta = 0.0025;

  const sampleValues = [8.5, 12.0, 15.4, 22.1, 28.5, 34.0, 41.2, 9.8, 18.6, 26.0];

  return sampleValues.map((val, i) => {
    const angle = (i / sampleValues.length) * 2 * Math.PI;
    const radius = delta * (0.3 + (i % 3) * 0.3);
    const lat = Number((baseLat + Math.sin(angle) * radius).toFixed(6));
    const lng = Number((baseLng + Math.cos(angle) * radius).toFixed(6));

    return {
      id: `synth_p_${i + 1}`,
      code: `P-${(i + 1).toString().padStart(2, '0')}`,
      x: lng,
      y: lat,
      valor: val,
      notes: `Amostra Sintética P: ${val} mg/dm³`,
    };
  });
}
