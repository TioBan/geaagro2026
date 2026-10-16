import {
  OperationalWindowIndex,
  HourlyForecastItem,
  DailyForecastItem,
  CropWeatherThreshold,
  WeatherAlertItem,
  FarmWeatherStation,
  HistoricalRainMonth,
} from '../types/weather';
import { CROP_PLANTING_RECOMMENDATIONS_250 } from './crops250Data';

export const operationalWindowIndices: OperationalWindowIndex[] = [
  {
    id: 'op-spray',
    operationName: 'Pulverização de Defensivos & Adubação Foliar',
    iconName: 'SprayCan',
    rating: 'ideal',
    score: 92,
    summary: 'Condições excelentes no período da manhã até 09:30 e após as 17:00. Vento calmo a moderado e umidade relativa elevada.',
    bestHourWindowToday: '06:00 às 09:30 e 17:00 às 19:30',
    favorableFactors: [
      'Velocidade do vento entre 4 e 7 km/h (faixa ideal: 3 a 10 km/h)',
      'Umidade relativa do ar em 72% (ideal acima de 55%)',
      'Temperatura amena de 22°C (evita evaporação rápida das gotas)',
      'Sem risco de chuva nas próximas 6 horas (ótima fixação)',
    ],
    limitingFactors: [
      'Entre 12:00 e 15:00 a UR cai para 48% com temperatura de 31°C (pausar aplicação no pico solar)',
    ],
    technicalAdvice: 'Utilizar bicos de indução de ar para gotas médias a grossas se houver rajadas esparsas. Adicionar adjuvante siliconado antideriva.',
  },
  {
    id: 'op-planting',
    operationName: 'Plantio & Semeadura Direta',
    iconName: 'Sprout',
    rating: 'ideal',
    score: 88,
    summary: 'Solo com umidade na capacidade de campo na camada de 0-20 cm e previsão de chuvas regulares moderadas em 48h.',
    bestHourWindowToday: 'Dia todo (07:00 às 18:00)',
    favorableFactors: [
      'Umidade do solo em 28% (capacidade de campo ideal)',
      'Temperatura do solo em 24°C (ótima germinação e emergência)',
      'Chuva leve de 12 mm prevista para depois de amanhã para assentar o sulco',
    ],
    limitingFactors: [
      'Monitorar profundidade de deposição da semente em talhões com maior teor de argila',
    ],
    technicalAdvice: 'Velocidade da semeadora regulada em 5,5 km/h para garantir espaçamento longitudinal perfeito.',
  },
  {
    id: 'op-harvest',
    operationName: 'Colheita Mecânica de Grãos & Fibras',
    iconName: 'Tractor',
    rating: 'atencao',
    score: 65,
    summary: 'Possível colheita no período da tarde, mas com atenção à umidade do orvalho matinal e risco de pancadas isoladas no fim do dia.',
    bestHourWindowToday: '11:00 às 16:30',
    favorableFactors: [
      'Umidade relativa baixa no início da tarde facilitando o trilhamento',
      'Piso dos talhões firme para tráfego de colheitadeiras sem formação de trilhos de roda',
    ],
    limitingFactors: [
      'Presença de orvalho intenso nas primeiras horas da manhã (UR > 85% até 09:30)',
      'Probabilidade de pancada isolada de 5 mm às 17h',
    ],
    technicalAdvice: 'Medir umidade dos grãos no medidor portátil às 11h. Interromper se umidade do grão ultrapassar 15%.',
  },
  {
    id: 'op-irrigation',
    operationName: 'Manejo de Irrigação (Pivô / Gotejo / Aspersão)',
    iconName: 'Droplets',
    rating: 'atencao',
    score: 58,
    summary: 'Demanda hídrica moderada (ET₀ = 4.2 mm/dia). Irrigação necessária apenas para culturas de alta exigência em fase reprodutiva.',
    bestHourWindowToday: 'Período Noturno (20:00 às 05:00) - Tarifa Verde',
    favorableFactors: [
      'Vento muito fraco à noite (<3 km/h), garantindo coeficiente de uniformidade de aplicação (CUC > 90%)',
      'Menor perda por evaporação direta e deriva',
      'Economia de energia elétrica na tarifa especial de irrigação noturna',
    ],
    limitingFactors: [
      'Chuva acumulada de 18 mm nos últimos 4 dias reduziu o déficit nos talhões de baixada',
    ],
    technicalAdvice: 'Checar tensiômetros na camada de 30 cm antes de ligar o pivô. Lâmina recomendada de 6 mm para talhões de textura média.',
  },
  {
    id: 'op-fertilizer',
    operationName: 'Adubação em Cobertura & Aplicação de Calcário / Gesso',
    iconName: 'Sparkles',
    rating: 'ideal',
    score: 90,
    summary: 'Janela muito propícia para ureia protegida ou NPK em cobertura, com solo úmido e chuva leve prevista para incorporação sem lixiviação.',
    bestHourWindowToday: '07:00 às 17:00',
    favorableFactors: [
      'Solo com umidade superficial adequada para rápida solubilização dos grânulos',
      'Sem previsão de chuvas torrenciais (>35 mm) que provocariam escorrimento superficial (runoff)',
      'Vento calmo que não interfere na faixa de distribuição a lanço',
    ],
    limitingFactors: [
      'Evitar aplicar ureia comum desprotegida sob temperaturas superiores a 32°C para conter volatilização de amônia',
    ],
    technicalAdvice: 'Para calagem ou gessagem a lanço, manter velocidade do vento <8 km/h para evitar deriva de partículas finas.',
  },
];

export const hourlyForecastData: HourlyForecastItem[] = [
  {
    time: '06:00',
    tempC: 18.2,
    humidityPercent: 88,
    rainProbabilityPercent: 5,
    rainMm: 0,
    windSpeedKmh: 3.5,
    windGustKmh: 5.0,
    windDirection: 'SE',
    uvIndex: 0,
    solarRadiationWm2: 120,
    dewPointC: 16.2,
    conditionIcon: 'SunDim',
    conditionDescription: 'Névoa úmida / Orvalho matinal',
    sprayingRating: 'atencao',
  },
  {
    time: '08:00',
    tempC: 21.5,
    humidityPercent: 76,
    rainProbabilityPercent: 10,
    rainMm: 0,
    windSpeedKmh: 5.2,
    windGustKmh: 8.0,
    windDirection: 'SE',
    uvIndex: 2,
    solarRadiationWm2: 380,
    dewPointC: 17.0,
    conditionIcon: 'Sun',
    conditionDescription: 'Ensolarado / Janela de Ouro',
    sprayingRating: 'ideal',
  },
  {
    time: '10:00',
    tempC: 25.8,
    humidityPercent: 64,
    rainProbabilityPercent: 10,
    rainMm: 0,
    windSpeedKmh: 6.8,
    windGustKmh: 11.5,
    windDirection: 'E',
    uvIndex: 5,
    solarRadiationWm2: 690,
    dewPointC: 18.4,
    conditionIcon: 'Sun',
    conditionDescription: 'Céu aberto com sol forte',
    sprayingRating: 'ideal',
  },
  {
    time: '12:00',
    tempC: 29.4,
    humidityPercent: 51,
    rainProbabilityPercent: 15,
    rainMm: 0,
    windSpeedKmh: 8.5,
    windGustKmh: 14.0,
    windDirection: 'NE',
    uvIndex: 8,
    solarRadiationWm2: 920,
    dewPointC: 18.1,
    conditionIcon: 'Sun',
    conditionDescription: 'Sol intenso / Pico térmico',
    sprayingRating: 'atencao',
  },
  {
    time: '14:00',
    tempC: 31.2,
    humidityPercent: 46,
    rainProbabilityPercent: 20,
    rainMm: 0,
    windSpeedKmh: 11.2,
    windGustKmh: 17.0,
    windDirection: 'N',
    uvIndex: 9,
    solarRadiationWm2: 880,
    dewPointC: 18.0,
    conditionIcon: 'Sun',
    conditionDescription: 'Calor e baixa umidade',
    sprayingRating: 'nao_recomendado',
  },
  {
    time: '16:00',
    tempC: 28.6,
    humidityPercent: 58,
    rainProbabilityPercent: 25,
    rainMm: 0.2,
    windSpeedKmh: 8.0,
    windGustKmh: 13.0,
    windDirection: 'SE',
    uvIndex: 4,
    solarRadiationWm2: 450,
    dewPointC: 19.3,
    conditionIcon: 'CloudSun',
    conditionDescription: 'Nuvens esparsas',
    sprayingRating: 'ideal',
  },
  {
    time: '18:00',
    tempC: 24.1,
    humidityPercent: 72,
    rainProbabilityPercent: 20,
    rainMm: 0,
    windSpeedKmh: 4.8,
    windGustKmh: 7.5,
    windDirection: 'S',
    uvIndex: 0,
    solarRadiationWm2: 80,
    dewPointC: 18.6,
    conditionIcon: 'Sunset',
    conditionDescription: 'Anoitecer calmo e fresco',
    sprayingRating: 'ideal',
  },
  {
    time: '20:00',
    tempC: 21.0,
    humidityPercent: 82,
    rainProbabilityPercent: 10,
    rainMm: 0,
    windSpeedKmh: 3.2,
    windGustKmh: 5.0,
    windDirection: 'S',
    uvIndex: 0,
    solarRadiationWm2: 0,
    dewPointC: 17.8,
    conditionIcon: 'Moon',
    conditionDescription: 'Céu estrelado',
    sprayingRating: 'atencao',
  },
];

export const daily15ForecastData: DailyForecastItem[] = [
  {
    date: '19/08 (Hoje)',
    dayOfWeek: 'Hoje',
    tempMinC: 17.5,
    tempMaxC: 31.2,
    tempAvgC: 24.3,
    humidityAvgPercent: 64,
    rainProbabilityPercent: 20,
    rainExpectedMm: 0.2,
    windSpeedAvgKmh: 7.5,
    windGustMaxKmh: 17.0,
    conditionDescription: 'Sol com nuvens e tempo estável',
    conditionIcon: 'Sun',
    etoMmDay: 4.2,
    frostRisk: 'nenhum',
    heatStressRisk: 'moderado',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'atencao',
      irrigation: 'atencao',
    },
  },
  {
    date: '20/08 (Amanhã)',
    dayOfWeek: 'Quarta',
    tempMinC: 18.0,
    tempMaxC: 30.5,
    tempAvgC: 24.0,
    humidityAvgPercent: 68,
    rainProbabilityPercent: 35,
    rainExpectedMm: 2.5,
    windSpeedAvgKmh: 6.8,
    windGustMaxKmh: 15.0,
    conditionDescription: 'Sol com aumento de nuvens à tarde',
    conditionIcon: 'CloudSun',
    etoMmDay: 3.9,
    frostRisk: 'nenhum',
    heatStressRisk: 'baixo',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'atencao',
    },
  },
  {
    date: '21/08',
    dayOfWeek: 'Quinta',
    tempMinC: 19.2,
    tempMaxC: 27.0,
    tempAvgC: 22.8,
    humidityAvgPercent: 78,
    rainProbabilityPercent: 85,
    rainExpectedMm: 16.5,
    windSpeedAvgKmh: 11.5,
    windGustMaxKmh: 28.0,
    conditionDescription: 'Pancadas de chuva benéficas',
    conditionIcon: 'CloudRain',
    etoMmDay: 2.8,
    frostRisk: 'nenhum',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'nao_recomendado',
      planting: 'atencao',
      harvest: 'nao_recomendado',
      irrigation: 'nao_recomendado',
    },
  },
  {
    date: '22/08',
    dayOfWeek: 'Sexta',
    tempMinC: 16.8,
    tempMaxC: 26.2,
    tempAvgC: 21.0,
    humidityAvgPercent: 74,
    rainProbabilityPercent: 40,
    rainExpectedMm: 4.0,
    windSpeedAvgKmh: 8.2,
    windGustMaxKmh: 18.0,
    conditionDescription: 'Chuva fraca na madrugada e abertura de sol',
    conditionIcon: 'CloudSun',
    etoMmDay: 3.4,
    frostRisk: 'nenhum',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'atencao',
      planting: 'ideal',
      harvest: 'atencao',
      irrigation: 'nao_recomendado',
    },
  },
  {
    date: '23/08',
    dayOfWeek: 'Sábado',
    tempMinC: 15.2,
    tempMaxC: 28.0,
    tempAvgC: 21.5,
    humidityAvgPercent: 62,
    rainProbabilityPercent: 10,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 6.0,
    windGustMaxKmh: 12.0,
    conditionDescription: 'Céu claro e ventos calmos',
    conditionIcon: 'Sun',
    etoMmDay: 4.5,
    frostRisk: 'nenhum',
    heatStressRisk: 'baixo',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '24/08',
    dayOfWeek: 'Domingo',
    tempMinC: 16.0,
    tempMaxC: 29.5,
    tempAvgC: 23.0,
    humidityAvgPercent: 58,
    rainProbabilityPercent: 5,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 5.5,
    windGustMaxKmh: 11.0,
    conditionDescription: 'Tempo firme e ensolarado',
    conditionIcon: 'Sun',
    etoMmDay: 4.8,
    frostRisk: 'nenhum',
    heatStressRisk: 'baixo',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '25/08',
    dayOfWeek: 'Segunda',
    tempMinC: 17.5,
    tempMaxC: 31.0,
    tempAvgC: 24.2,
    humidityAvgPercent: 54,
    rainProbabilityPercent: 10,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 7.2,
    windGustMaxKmh: 14.0,
    conditionDescription: 'Tempo seco com elevação térmica',
    conditionIcon: 'Sun',
    etoMmDay: 5.1,
    frostRisk: 'nenhum',
    heatStressRisk: 'moderado',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '26/08',
    dayOfWeek: 'Terça',
    tempMinC: 18.5,
    tempMaxC: 32.0,
    tempAvgC: 25.0,
    humidityAvgPercent: 50,
    rainProbabilityPercent: 20,
    rainExpectedMm: 0.5,
    windSpeedAvgKmh: 9.0,
    windGustMaxKmh: 19.0,
    conditionDescription: 'Calor e ventos do quadrante Norte',
    conditionIcon: 'Sun',
    etoMmDay: 5.4,
    frostRisk: 'nenhum',
    heatStressRisk: 'alto',
    dominantOperationStatus: {
      spray: 'atencao',
      planting: 'atencao',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '27/08',
    dayOfWeek: 'Quarta',
    tempMinC: 19.0,
    tempMaxC: 26.5,
    tempAvgC: 22.0,
    humidityAvgPercent: 82,
    rainProbabilityPercent: 90,
    rainExpectedMm: 24.0,
    windSpeedAvgKmh: 14.0,
    windGustMaxKmh: 35.0,
    conditionDescription: 'Frente fria com chuva volumosa e trovoadas',
    conditionIcon: 'CloudRain',
    etoMmDay: 2.2,
    frostRisk: 'nenhum',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'nao_recomendado',
      planting: 'nao_recomendado',
      harvest: 'nao_recomendado',
      irrigation: 'nao_recomendado',
    },
  },
  {
    date: '28/08',
    dayOfWeek: 'Quinta',
    tempMinC: 13.5,
    tempMaxC: 22.0,
    tempAvgC: 17.5,
    humidityAvgPercent: 70,
    rainProbabilityPercent: 30,
    rainExpectedMm: 3.0,
    windSpeedAvgKmh: 12.0,
    windGustMaxKmh: 24.0,
    conditionDescription: 'Declínio acentuado de temperatura e vento sul',
    conditionIcon: 'Wind',
    etoMmDay: 3.0,
    frostRisk: 'baixo',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'atencao',
      planting: 'atencao',
      harvest: 'atencao',
      irrigation: 'nao_recomendado',
    },
  },
  {
    date: '29/08',
    dayOfWeek: 'Sexta',
    tempMinC: 10.8,
    tempMaxC: 23.5,
    tempAvgC: 16.8,
    humidityAvgPercent: 60,
    rainProbabilityPercent: 5,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 6.5,
    windGustMaxKmh: 12.0,
    conditionDescription: 'Madrugada fria com sol pleno de dia',
    conditionIcon: 'Sun',
    etoMmDay: 3.8,
    frostRisk: 'moderado',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '30/08',
    dayOfWeek: 'Sábado',
    tempMinC: 12.0,
    tempMaxC: 25.0,
    tempAvgC: 18.5,
    humidityAvgPercent: 62,
    rainProbabilityPercent: 10,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 6.0,
    windGustMaxKmh: 11.0,
    conditionDescription: 'Tempo estável e ensolarado',
    conditionIcon: 'Sun',
    etoMmDay: 4.1,
    frostRisk: 'nenhum',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '31/08',
    dayOfWeek: 'Domingo',
    tempMinC: 14.0,
    tempMaxC: 27.0,
    tempAvgC: 20.5,
    humidityAvgPercent: 65,
    rainProbabilityPercent: 15,
    rainExpectedMm: 0,
    windSpeedAvgKmh: 7.0,
    windGustMaxKmh: 13.0,
    conditionDescription: 'Sol com variação de nuvens',
    conditionIcon: 'CloudSun',
    etoMmDay: 4.3,
    frostRisk: 'nenhum',
    heatStressRisk: 'nenhum',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '01/09',
    dayOfWeek: 'Segunda',
    tempMinC: 15.5,
    tempMaxC: 28.5,
    tempAvgC: 22.0,
    humidityAvgPercent: 66,
    rainProbabilityPercent: 20,
    rainExpectedMm: 1.0,
    windSpeedAvgKmh: 8.0,
    windGustMaxKmh: 15.0,
    conditionDescription: 'Aquecimento gradual e tempo bom',
    conditionIcon: 'Sun',
    etoMmDay: 4.5,
    frostRisk: 'nenhum',
    heatStressRisk: 'baixo',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'ideal',
      irrigation: 'ideal',
    },
  },
  {
    date: '02/09',
    dayOfWeek: 'Terça',
    tempMinC: 16.0,
    tempMaxC: 29.0,
    tempAvgC: 22.5,
    humidityAvgPercent: 64,
    rainProbabilityPercent: 25,
    rainExpectedMm: 2.0,
    windSpeedAvgKmh: 7.5,
    windGustMaxKmh: 14.0,
    conditionDescription: 'Sol com pancadas de chuva no final da tarde',
    conditionIcon: 'CloudSun',
    etoMmDay: 4.4,
    frostRisk: 'nenhum',
    heatStressRisk: 'baixo',
    dominantOperationStatus: {
      spray: 'ideal',
      planting: 'ideal',
      harvest: 'atencao',
      irrigation: 'atencao',
    },
  },
];

const HANDCRAFTED_CROPS: CropWeatherThreshold[] = [
  // --- GRÃOS & CEREAIS ---
  {
    id: 'crop-soja',
    cropName: 'Soja (Glycine max)',
    scientificName: 'Glycine max (L.) Merr.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 20, max: 30 },
    criticalFrostTempC: 1.5,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 60, max: 85 },
    dailyWaterRequirementMm: { min: 4.5, max: 7.0 },
    currentGrowthStage: 'R1 - Início do Florescimento (Fase Crítica)',
    activeCropAlerts: [
      'Alerta de Molhamento Foliar: 14 horas contínuas de orvalho favorecem germinação de esporos da Ferrugem Asiática (Phakopsora pachyrhizi).',
      'Monitorar umidade do solo: demanda hídrica máxima de 6,5 mm/dia durante R1 a R5.',
    ],
    climateRiskScore: 28,
    kcValue: 1.15,
  },
  {
    id: 'crop-milho',
    cropName: 'Milho Safrinha / Grão',
    scientificName: 'Zea mays L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 22, max: 32 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 55, max: 80 },
    dailyWaterRequirementMm: { min: 5.0, max: 8.0 },
    currentGrowthStage: 'VT / R1 - Pendoamento e Espigamento',
    activeCropAlerts: [
      'Temperatura acima de 34°C com umidade <40% durante a antese pode provocar desidratação do pólen (chochamento de espigas).',
    ],
    climateRiskScore: 35,
    kcValue: 1.20,
  },
  {
    id: 'crop-feijao',
    cropName: 'Feijão Comum',
    scientificName: 'Phaseolus vulgaris L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 18, max: 28 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 32.0,
    idealSoilMoisturePercent: { min: 60, max: 85 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'R7 - Formação de Vagens',
    activeCropAlerts: [
      'Suscetível a mofo-branco sob alta umidade relativa (>80%) e temperaturas amena (15-22°C).',
    ],
    climateRiskScore: 32,
    kcValue: 1.10,
  },
  {
    id: 'crop-trigo',
    cropName: 'Trigo (Sequeiro / Irrigado)',
    scientificName: 'Triticum aestivum L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 15, max: 24 },
    criticalFrostTempC: -2.0,
    criticalHeatStressTempC: 30.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 3.5, max: 5.5 },
    currentGrowthStage: 'Perfilhamento a Emborrachamento',
    activeCropAlerts: [
      'Temperaturas quentes (>28°C) aceleram ciclo e reduzem o peso de mil grãos.',
    ],
    climateRiskScore: 25,
    kcValue: 1.15,
  },
  {
    id: 'crop-arroz',
    cropName: 'Arroz Irrigado / Sequeiro',
    scientificName: 'Oryza sativa L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 22, max: 32 },
    criticalFrostTempC: 10.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 80, max: 100 },
    dailyWaterRequirementMm: { min: 6.0, max: 10.0 },
    currentGrowthStage: 'Diferenciação da Panícula (V8-R1)',
    activeCropAlerts: [
      'Temperaturas noturnas <15°C durante a microsporogênese causam esterilidade de espiguetas.',
    ],
    climateRiskScore: 20,
    kcValue: 1.25,
  },
  {
    id: 'crop-sorgo',
    cropName: 'Sorgo Granífero / Forrageiro',
    scientificName: 'Sorghum bicolor (L.) Moench',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 25, max: 35 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 40.0,
    idealSoilMoisturePercent: { min: 40, max: 75 },
    dailyWaterRequirementMm: { min: 3.5, max: 6.0 },
    currentGrowthStage: 'Florescimento e Enchimento de Grãos',
    activeCropAlerts: [
      'Excelente tolerância ao estresse hídrico; atentar para ataque de pulgão-amarelo sob seca prolongada.',
    ],
    climateRiskScore: 15,
    kcValue: 1.05,
  },
  {
    id: 'crop-girassol',
    cropName: 'Girassol',
    scientificName: 'Helianthus annuus L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 20, max: 30 },
    criticalFrostTempC: -1.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'R4 - Abertura do Capítulo',
    activeCropAlerts: [
      'Ventos fortes acima de 45 km/h durante a maturação causam acamamento das plantas.',
    ],
    climateRiskScore: 22,
    kcValue: 1.10,
  },
  {
    id: 'crop-amendoim',
    cropName: 'Amendoim das Águas / Secas',
    scientificName: 'Arachis hypogaea L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 22, max: 30 },
    criticalFrostTempC: 1.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 55, max: 80 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.0 },
    currentGrowthStage: 'Pegamento de Ginóforos (Espetamento)',
    activeCropAlerts: [
      'Solo muito seco ou compactado impede a penetração do ginóforo e formação de vagens.',
    ],
    climateRiskScore: 24,
    kcValue: 1.10,
  },
  {
    id: 'crop-cevada',
    cropName: 'Cevada Cervejeira',
    scientificName: 'Hordeum vulgare L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 14, max: 22 },
    criticalFrostTempC: -3.0,
    criticalHeatStressTempC: 28.0,
    idealSoilMoisturePercent: { min: 50, max: 70 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Enchimento de Grãos',
    activeCropAlerts: [
      'Altas temperaturas antecipam a maturação e alteram o teor de proteína do grão, prejudicando a qualidade malteira.',
    ],
    climateRiskScore: 30,
    kcValue: 1.10,
  },
  {
    id: 'crop-aveia',
    cropName: 'Aveia (Branca / Preta)',
    scientificName: 'Avena sativa L.',
    category: 'Grãos & Cereais',
    optimalTempRange: { min: 12, max: 22 },
    criticalFrostTempC: -4.0,
    criticalHeatStressTempC: 28.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Crescimento Vegetativo / Emborrachamento',
    activeCropAlerts: [
      'Chuva na fase de colheita causa acamamento e germinação na espiga.',
    ],
    climateRiskScore: 20,
    kcValue: 1.00,
  },

  // --- HORTALIÇAS & OLERÍCOLAS ---
  {
    id: 'crop-hortalicas',
    cropName: 'Hortaliças & Folhosas (Alface/Brócolis)',
    scientificName: 'Lactuca sativa / Brassica oleracea',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 16, max: 25 },
    criticalFrostTempC: 3.5,
    criticalHeatStressTempC: 30.0,
    idealSoilMoisturePercent: { min: 70, max: 90 },
    dailyWaterRequirementMm: { min: 3.5, max: 5.5 },
    currentGrowthStage: 'Desenvolvimento Vegetativo Contínuo',
    activeCropAlerts: [
      'Radiação solar UV alta (índice 9 às 14h): acionar sombrites ou irrigação por microaspersão para resfriamento foliar.',
    ],
    climateRiskScore: 50,
    kcValue: 1.05,
  },
  {
    id: 'crop-tomate',
    cropName: 'Tomate (Mesa / Industrial)',
    scientificName: 'Solanum lycopersicum L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 18, max: 28 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 34.0,
    idealSoilMoisturePercent: { min: 65, max: 85 },
    dailyWaterRequirementMm: { min: 4.0, max: 7.0 },
    currentGrowthStage: 'Floração e Frutificação Inicial',
    activeCropAlerts: [
      'Flutuação brusca de umidade do solo provoca podridão apical ("fundo preto") por deficiência induzida de Cálcio.',
    ],
    climateRiskScore: 45,
    kcValue: 1.15,
  },
  {
    id: 'crop-batata',
    cropName: 'Batata-Inglesa / Tuberosa',
    scientificName: 'Solanum tuberosum L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 15, max: 22 },
    criticalFrostTempC: 0.0,
    criticalHeatStressTempC: 29.0,
    idealSoilMoisturePercent: { min: 70, max: 85 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.0 },
    currentGrowthStage: 'Tuberização e Enchimento dos Tubérculos',
    activeCropAlerts: [
      'Temperaturas de solo >25°C paralisam a tuberização e induzem brotação secundária.',
    ],
    climateRiskScore: 40,
    kcValue: 1.15,
  },
  {
    id: 'crop-cebola',
    cropName: 'Cebola',
    scientificName: 'Allium cepa L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 15, max: 25 },
    criticalFrostTempC: 1.0,
    criticalHeatStressTempC: 32.0,
    idealSoilMoisturePercent: { min: 60, max: 80 },
    dailyWaterRequirementMm: { min: 3.5, max: 5.5 },
    currentGrowthStage: 'Bulbificação',
    activeCropAlerts: [
      'Requer fotoperíodo longo e temperaturas moderadas para bulbificação uniforme.',
    ],
    climateRiskScore: 35,
    kcValue: 1.05,
  },
  {
    id: 'crop-alho',
    cropName: 'Alho Nobre / Tropicalizado',
    scientificName: 'Allium sativum L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 12, max: 22 },
    criticalFrostTempC: -1.0,
    criticalHeatStressTempC: 30.0,
    idealSoilMoisturePercent: { min: 60, max: 80 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Diferenciação dos Dentes (Bulbificação)',
    activeCropAlerts: [
      'Exige acúmulo de horas de frio pré-plantio (vernalização) para evitar o pseudo-perfilhamento (superalhameto).',
    ],
    climateRiskScore: 38,
    kcValue: 1.00,
  },
  {
    id: 'crop-cenoura',
    cropName: 'Cenoura',
    scientificName: 'Daucus carota L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 15, max: 24 },
    criticalFrostTempC: 1.0,
    criticalHeatStressTempC: 30.0,
    idealSoilMoisturePercent: { min: 65, max: 85 },
    dailyWaterRequirementMm: { min: 3.5, max: 5.5 },
    currentGrowthStage: 'Engrossamento da Raiz Tuberosa',
    activeCropAlerts: [
      'Solo encharcado causa deformação de raízes e bifurcação; solo seco provoca rachaduras.',
    ],
    climateRiskScore: 30,
    kcValue: 1.05,
  },
  {
    id: 'crop-pimentao',
    cropName: 'Pimentão',
    scientificName: 'Capsicum annuum L.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 20, max: 28 },
    criticalFrostTempC: 3.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 65, max: 85 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'Frutificação e Colheita Contínua',
    activeCropAlerts: [
      'Temperaturas acima de 33°C induzem abortamento floral massivo.',
    ],
    climateRiskScore: 42,
    kcValue: 1.10,
  },
  {
    id: 'crop-melancia',
    cropName: 'Melancia & Melão',
    scientificName: 'Citrullus lanatus / Cucumis melo',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 24, max: 32 },
    criticalFrostTempC: 5.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 55, max: 75 },
    dailyWaterRequirementMm: { min: 4.5, max: 7.5 },
    currentGrowthStage: 'Desenvolvimento e Maturação dos Frutos',
    activeCropAlerts: [
      'Suspender irrigação no período de pré-colheita para aumentar o brix (teor de açúcar).',
    ],
    climateRiskScore: 28,
    kcValue: 1.00,
  },
  {
    id: 'crop-morango',
    cropName: 'Morango',
    scientificName: 'Fragaria x ananassa Duch.',
    category: 'Hortaliças & Olerícolas',
    optimalTempRange: { min: 14, max: 22 },
    criticalFrostTempC: -1.0,
    criticalHeatStressTempC: 28.0,
    idealSoilMoisturePercent: { min: 70, max: 90 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Floração e Frutificação',
    activeCropAlerts: [
      'Nesses dias quentes, proteger frutos contra queimadura de sol com tela de sombreamento (30%).',
    ],
    climateRiskScore: 48,
    kcValue: 0.95,
  },

  // --- FRUTÍFERAS ---
  {
    id: 'crop-frutiferas',
    cropName: 'Citros / Laranja / Limão',
    scientificName: 'Citrus sinensis / Citrus limon',
    category: 'Frutíferas',
    optimalTempRange: { min: 20, max: 30 },
    criticalFrostTempC: -1.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 60, max: 80 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.0 },
    currentGrowthStage: 'Floração e Pegamento de Frutinhos',
    activeCropAlerts: [
      'Verificar sintomas de Huanglongbing (HLB/Greening) intensificados por estresse hídrico no pomar.',
    ],
    climateRiskScore: 22,
    kcValue: 0.80,
  },
  {
    id: 'crop-cafe',
    cropName: 'Café Arábica / Conilon',
    scientificName: 'Coffea arabica / Coffea canephora',
    category: 'Frutíferas',
    optimalTempRange: { min: 18, max: 24 },
    criticalFrostTempC: 3.0,
    criticalHeatStressTempC: 32.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 3.5, max: 5.5 },
    currentGrowthStage: 'Expansão dos Frutos (Chumbinho)',
    activeCropAlerts: [
      'Risco de Geada na Baixada: Monitorar temperatura mínima em fundos de vale úmidos.',
      'Condições favoráveis para Cercosporiose e Bicho-mineiro em dias quentes intercalados com chuva.',
    ],
    climateRiskScore: 42,
    kcValue: 0.95,
  },
  {
    id: 'crop-uva',
    cropName: 'Uva (Mesa / Vinífera)',
    scientificName: 'Vitis vinifera L.',
    category: 'Frutíferas',
    optimalTempRange: { min: 18, max: 28 },
    criticalFrostTempC: 0.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 3.5, max: 6.0 },
    currentGrowthStage: 'Brotamento e Inflorescência',
    activeCropAlerts: [
      'Alta umidade foliar associada a temperaturas de 20-25°C cria clima ideal para Míldio (Plasmopara viticola).',
    ],
    climateRiskScore: 38,
    kcValue: 0.85,
  },
  {
    id: 'crop-manga',
    cropName: 'Manga (Tommy / Palmer)',
    scientificName: 'Mangifera indica L.',
    category: 'Frutíferas',
    optimalTempRange: { min: 24, max: 32 },
    criticalFrostTempC: 5.0,
    criticalHeatStressTempC: 40.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 4.5, max: 7.0 },
    currentGrowthStage: 'Indução Floral e Floração',
    activeCropAlerts: [
      'Exige estresse hídrico moderado prévio para indução floral uniforme em áreas irrigadas do Semiárido.',
    ],
    climateRiskScore: 20,
    kcValue: 0.85,
  },
  {
    id: 'crop-banana',
    cropName: 'Banana (Prata / Nanica)',
    scientificName: 'Musa x paradisiaca L.',
    category: 'Frutíferas',
    optimalTempRange: { min: 22, max: 30 },
    criticalFrostTempC: 6.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 70, max: 90 },
    dailyWaterRequirementMm: { min: 5.0, max: 8.0 },
    currentGrowthStage: 'Emissão do Cacho e Enchimento dos Dedos',
    activeCropAlerts: [
      'Sensível a ventos fortes acima de 30 km/h (desfolhamento e tombamento de pseudocaules).',
    ],
    climateRiskScore: 30,
    kcValue: 1.20,
  },
  {
    id: 'crop-abacaxi',
    cropName: 'Abacaxi (Pérola / MD2)',
    scientificName: 'Ananas comosus (L.) Merr.',
    category: 'Frutíferas',
    optimalTempRange: { min: 22, max: 32 },
    criticalFrostTempC: 5.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 45, max: 70 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Desenvolvimento do Fruto',
    activeCropAlerts: [
      'Sol forte constante requer proteção dos frutos com papel ou palha contra queimadura de casca.',
    ],
    climateRiskScore: 18,
    kcValue: 0.75,
  },
  {
    id: 'crop-abacate',
    cropName: 'Abacate (Avocado / Breda)',
    scientificName: 'Persea americana Mill.',
    category: 'Frutíferas',
    optimalTempRange: { min: 18, max: 28 },
    criticalFrostTempC: 0.0,
    criticalHeatStressTempC: 33.0,
    idealSoilMoisturePercent: { min: 60, max: 80 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'Floração e Pegamento de Frutos',
    activeCropAlerts: [
      'Alta sensibilidade do sistema radicular ao encharcamento (Phytophthora cinnamomi).',
    ],
    climateRiskScore: 28,
    kcValue: 0.85,
  },
  {
    id: 'crop-maracuja',
    cropName: 'Maracujá Azedo / Doce',
    scientificName: 'Passiflora edulis Sims',
    category: 'Frutíferas',
    optimalTempRange: { min: 21, max: 30 },
    criticalFrostTempC: 4.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 60, max: 80 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'Frutificação Contínua',
    activeCropAlerts: [
      'Frio prolongado abaixo de 15°C inibe o voo das mamangavas e reduz politização efetiva.',
    ],
    climateRiskScore: 32,
    kcValue: 0.90,
  },
  {
    id: 'crop-mamao',
    cropName: 'Mamão (Papaya / Formosa)',
    scientificName: 'Carica papaya L.',
    category: 'Frutíferas',
    optimalTempRange: { min: 22, max: 28 },
    criticalFrostTempC: 8.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 65, max: 85 },
    dailyWaterRequirementMm: { min: 4.5, max: 7.0 },
    currentGrowthStage: 'Floração e Colheita Contínua',
    activeCropAlerts: [
      'Temperaturas elevadas associadas a déficit hídrico causam esterilidade feminina e sexagem indesejada.',
    ],
    climateRiskScore: 35,
    kcValue: 1.00,
  },
  {
    id: 'crop-cacau',
    cropName: 'Cacau (Cabruca / Tecno)',
    scientificName: 'Theobroma cacao L.',
    category: 'Frutíferas',
    optimalTempRange: { min: 22, max: 28 },
    criticalFrostTempC: 10.0,
    criticalHeatStressTempC: 33.0,
    idealSoilMoisturePercent: { min: 70, max: 90 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.0 },
    currentGrowthStage: 'Desenvolvimento de Bilros e Frutos Matures',
    activeCropAlerts: [
      'Períodos de alta umidade continuada favorecem Vassoura-de-Bruxa e Podridão-Parda.',
    ],
    climateRiskScore: 30,
    kcValue: 1.00,
  },

  // --- FIBRAS & BIOENERGIA ---
  {
    id: 'crop-algodao',
    cropName: 'Algodão Herbáceo',
    scientificName: 'Gossypium hirsutum L.',
    category: 'Fibras & Bioenergia',
    optimalTempRange: { min: 22, max: 32 },
    criticalFrostTempC: 4.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 50, max: 75 },
    dailyWaterRequirementMm: { min: 4.0, max: 7.5 },
    currentGrowthStage: 'Abertura de Capulhos / Maturação',
    activeCropAlerts: [
      'Exigência de tempo seco e baixa umidade relativa para evitar apodrecimento de maçãs e desvalorização da fibra.',
    ],
    climateRiskScore: 30,
    kcValue: 0.85,
  },
  {
    id: 'crop-cana',
    cropName: 'Cana-de-Açúcar',
    scientificName: 'Saccharum officinarum L.',
    category: 'Fibras & Bioenergia',
    optimalTempRange: { min: 24, max: 34 },
    criticalFrostTempC: 0.5,
    criticalHeatStressTempC: 39.0,
    idealSoilMoisturePercent: { min: 45, max: 80 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.5 },
    currentGrowthStage: 'Maturação / Acúmulo de Sacarose',
    activeCropAlerts: [
      'Déficit hídrico moderado atual é benéfico para a concentração de ATR (Açúcar Total Recuperável).',
    ],
    climateRiskScore: 15,
    kcValue: 0.90,
  },
  {
    id: 'crop-mandioca',
    cropName: 'Mandioca / Aipim',
    scientificName: 'Manihot esculenta Crantz',
    category: 'Fibras & Bioenergia',
    optimalTempRange: { min: 23, max: 30 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 40, max: 75 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.5 },
    currentGrowthStage: 'Tuberização e Acúmulo de Amido',
    activeCropAlerts: [
      'Rústica e tolerante à seca; evitar solos com acúmulo de água no subsolo.',
    ],
    climateRiskScore: 12,
    kcValue: 0.80,
  },
  {
    id: 'crop-mamona',
    cropName: 'Mamona (Mamoneira)',
    scientificName: 'Ricinus communis L.',
    category: 'Fibras & Bioenergia',
    optimalTempRange: { min: 22, max: 32 },
    criticalFrostTempC: 1.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 40, max: 70 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Formação dos Racemos',
    activeCropAlerts: [
      'Excesso de chuvas na fase de colheita causa mofo-cinzento nos racemos.',
    ],
    climateRiskScore: 18,
    kcValue: 0.85,
  },
  {
    id: 'crop-gergelim',
    cropName: 'Gergelim',
    scientificName: 'Sesamum indicum L.',
    category: 'Fibras & Bioenergia',
    optimalTempRange: { min: 25, max: 35 },
    criticalFrostTempC: 5.0,
    criticalHeatStressTempC: 40.0,
    idealSoilMoisturePercent: { min: 40, max: 70 },
    dailyWaterRequirementMm: { min: 3.0, max: 5.0 },
    currentGrowthStage: 'Florescimento e Enchimento de Cápsulas',
    activeCropAlerts: [
      'Altíssima tolerância à seca no Cerrado e Semiárido.',
    ],
    climateRiskScore: 14,
    kcValue: 0.80,
  },

  // --- PASTAGENS & SILVICULTURA ---
  {
    id: 'crop-pastagem',
    cropName: 'Pastagens (Brachiaria / Marandu)',
    scientificName: 'Urochloa brizantha cv. Marandu',
    category: 'Pastagens & Silvicultura',
    optimalTempRange: { min: 22, max: 35 },
    criticalFrostTempC: 2.0,
    criticalHeatStressTempC: 40.0,
    idealSoilMoisturePercent: { min: 40, max: 80 },
    dailyWaterRequirementMm: { min: 3.0, max: 6.0 },
    currentGrowthStage: 'Brotação e Crescimento Pós-Pastejo',
    activeCropAlerts: [
      'Precipitação esperada irá reativar o perfilhamento e rebrotação foliar vigorosa.',
    ],
    climateRiskScore: 12,
    kcValue: 0.90,
  },
  {
    id: 'crop-eucalipto',
    cropName: 'Eucalipto (Silvicultura)',
    scientificName: 'Eucalyptus grandis x E. urophylla',
    category: 'Pastagens & Silvicultura',
    optimalTempRange: { min: 18, max: 28 },
    criticalFrostTempC: -2.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 40, max: 80 },
    dailyWaterRequirementMm: { min: 3.5, max: 6.0 },
    currentGrowthStage: 'Crescimento de Tronco (Incremento Médio Anual)',
    activeCropAlerts: [
      'Atenção ao risco de incêndios florestais em dias com umidade relativa <25% e ventos >20 km/h.',
    ],
    climateRiskScore: 15,
    kcValue: 0.95,
  },
  {
    id: 'crop-seringueira',
    cropName: 'Seringueira (Látice)',
    scientificName: 'Hevea brasiliensis (Willd. ex A.Juss.) Müll.Arg.',
    category: 'Pastagens & Silvicultura',
    optimalTempRange: { min: 22, max: 30 },
    criticalFrostTempC: 3.0,
    criticalHeatStressTempC: 36.0,
    idealSoilMoisturePercent: { min: 60, max: 85 },
    dailyWaterRequirementMm: { min: 4.0, max: 6.0 },
    currentGrowthStage: 'Sangria de Látice',
    activeCropAlerts: [
      'Chuva no momento da sangria dilui o látice na tigela e paralisa o recolhimento.',
    ],
    climateRiskScore: 22,
    kcValue: 1.00,
  },

  // --- ESPECIALIDADES & AROMÁTICAS ---
  {
    id: 'crop-pimenta',
    cropName: 'Pimenta-do-Reino',
    scientificName: 'Piper nigrum L.',
    category: 'Especialidades & Aromáticas',
    optimalTempRange: { min: 23, max: 30 },
    criticalFrostTempC: 8.0,
    criticalHeatStressTempC: 35.0,
    idealSoilMoisturePercent: { min: 70, max: 85 },
    dailyWaterRequirementMm: { min: 4.5, max: 6.5 },
    currentGrowthStage: 'Enchimento dos Espilhos',
    activeCropAlerts: [
      'Exige irrigação pontual no gotejo sob veranicos para evitar murcha de espilhos.',
    ],
    climateRiskScore: 26,
    kcValue: 1.05,
  },
  {
    id: 'crop-acai',
    cropName: 'Açaí (Palmeira de Várzea/Terra Firme)',
    scientificName: 'Euterpe oleracea Mart.',
    category: 'Especialidades & Aromáticas',
    optimalTempRange: { min: 24, max: 32 },
    criticalFrostTempC: 10.0,
    criticalHeatStressTempC: 38.0,
    idealSoilMoisturePercent: { min: 75, max: 95 },
    dailyWaterRequirementMm: { min: 5.0, max: 8.0 },
    currentGrowthStage: 'Maturação dos Cachos',
    activeCropAlerts: [
      'Demanda altíssima de água no solo; irrigação localizada contínua em terra firme.',
    ],
    climateRiskScore: 18,
    kcValue: 1.15,
  },
];

// Helper to determine category & default weather thresholds for any crop from 250 catalog
function generateWeatherThresholdForCrop(rec: {
  cropId: string;
  cropName: string;
  scientificName?: string;
}): CropWeatherThreshold {
  const sciName = rec.scientificName || rec.cropName;
  const lowerName = (rec.cropName + ' ' + sciName).toLowerCase();

  let category: 'Grãos & Cereais' | 'Hortaliças & Olerícolas' | 'Frutíferas' | 'Fibras & Bioenergia' | 'Pastagens & Silvicultura' | 'Especialidades & Aromáticas' = 'Especialidades & Aromáticas';
  let optimalTempRange = { min: 18, max: 28 };
  let criticalFrostTempC = 2.0;
  let criticalHeatStressTempC = 34.0;
  let idealSoilMoisturePercent = { min: 60, max: 80 };
  let dailyWaterRequirementMm = { min: 3.5, max: 6.0 };
  let kcValue = 1.00;
  let currentGrowthStage = 'Desenvolvimento Vegetativo / Florescimento';
  let activeCropAlerts = [
    `Monitorar umidade do solo e balanço térmico para ${rec.cropName}.`,
  ];
  let climateRiskScore = 20;

  if (
    lowerName.includes('soja') || lowerName.includes('milho') || lowerName.includes('feijão') ||
    lowerName.includes('trigo') || lowerName.includes('arroz') || lowerName.includes('sorgo') ||
    lowerName.includes('girassol') || lowerName.includes('amendoim') || lowerName.includes('cevada') ||
    lowerName.includes('aveia') || lowerName.includes('centeio') || lowerName.includes('gergelim') ||
    lowerName.includes('quinoa') || lowerName.includes('chia') || lowerName.includes('linhaça') ||
    lowerName.includes('canola') || lowerName.includes('milheto') || lowerName.includes('triticale') ||
    lowerName.includes('crotalária') || lowerName.includes('vicia') || lowerName.includes('grão') ||
    lowerName.includes('lentilha') || lowerName.includes('ervilha') || lowerName.includes('guandu') ||
    lowerName.includes('fava') || lowerName.includes('tremoço') || lowerName.includes('painço')
  ) {
    category = 'Grãos & Cereais';
    optimalTempRange = { min: 20, max: 30 };
    criticalFrostTempC = 1.5;
    criticalHeatStressTempC = 35.0;
    idealSoilMoisturePercent = { min: 55, max: 80 };
    dailyWaterRequirementMm = { min: 4.0, max: 6.5 };
    kcValue = 1.10;
    currentGrowthStage = 'Desenvolvimento Vegetativo e Florescimento';
    activeCropAlerts = [
      `Manter calibração de umidade de solo no período crítico de florescimento e enchimento de grãos.`,
    ];
    climateRiskScore = 24;
  } else if (
    lowerName.includes('alface') || lowerName.includes('tomate') || lowerName.includes('batata') ||
    lowerName.includes('cebola') || lowerName.includes('alho') || lowerName.includes('cenoura') ||
    lowerName.includes('pimentão') || lowerName.includes('melancia') || lowerName.includes('melão') ||
    lowerName.includes('morango') || lowerName.includes('abóbora') || lowerName.includes('abobrinha') ||
    lowerName.includes('acelga') || lowerName.includes('agrião') || lowerName.includes('aipo') ||
    lowerName.includes('alcachofra') || lowerName.includes('almeirão') || lowerName.includes('aspargo') ||
    lowerName.includes('beterraba') || lowerName.includes('berinjela') || lowerName.includes('couve') ||
    lowerName.includes('espinafre') || lowerName.includes('mandioquinha') || lowerName.includes('pepino') ||
    lowerName.includes('rábano') || lowerName.includes('repolho') || lowerName.includes('rúcula') ||
    lowerName.includes('sálvia') || lowerName.includes('salsa') || lowerName.includes('coentro') ||
    lowerName.includes('hortelã') || lowerName.includes('manjericão') || lowerName.includes('chicória') ||
    lowerName.includes('chuchu') || lowerName.includes('maxixe') || lowerName.includes('jiló') ||
    lowerName.includes('quiabo') || lowerName.includes('yacon') || lowerName.includes('rabanete') ||
    lowerName.includes('nabo')
  ) {
    category = 'Hortaliças & Olerícolas';
    optimalTempRange = { min: 16, max: 25 };
    criticalFrostTempC = 2.5;
    criticalHeatStressTempC = 31.0;
    idealSoilMoisturePercent = { min: 65, max: 85 };
    dailyWaterRequirementMm = { min: 3.5, max: 5.5 };
    kcValue = 1.05;
    currentGrowthStage = 'Desenvolvimento de Canteiro / Crescimento Foliar';
    activeCropAlerts = [
      `Atenção à irrigação por microaspersão em horários de pico térmico (>30°C) para evitar queimadura foliar.`,
    ];
    climateRiskScore = 35;
  } else if (
    lowerName.includes('abacate') || lowerName.includes('abacaxi') || lowerName.includes('acerola') ||
    lowerName.includes('ameixa') || lowerName.includes('atemóia') || lowerName.includes('amora') ||
    lowerName.includes('azeitona') || lowerName.includes('banana') || lowerName.includes('cacau') ||
    lowerName.includes('café') || lowerName.includes('caqui') || lowerName.includes('carambola') ||
    lowerName.includes('cereja') || lowerName.includes('citros') || lowerName.includes('laranja') ||
    lowerName.includes('limão') || lowerName.includes('tangerina') || lowerName.includes('coco') ||
    lowerName.includes('figo') || lowerName.includes('goiaba') || lowerName.includes('jabuticaba') ||
    lowerName.includes('jaca') || lowerName.includes('kiwi') || lowerName.includes('maçã') ||
    lowerName.includes('mamão') || lowerName.includes('manga') || lowerName.includes('maracujá') ||
    lowerName.includes('marmelo') || lowerName.includes('nectarina') || lowerName.includes('nêspera') ||
    lowerName.includes('nóz') || lowerName.includes('pecã') || lowerName.includes('pêssego') ||
    lowerName.includes('pitanga') || lowerName.includes('pitaya') || lowerName.includes('romã') ||
    lowerName.includes('uva') || lowerName.includes('graviola') || lowerName.includes('cupuaçu') ||
    lowerName.includes('caju') || lowerName.includes('guaraná') || lowerName.includes('seriguela') ||
    lowerName.includes('physalis') || lowerName.includes('mirtilo') || lowerName.includes('framboesa')
  ) {
    category = 'Frutíferas';
    optimalTempRange = { min: 18, max: 28 };
    criticalFrostTempC = 1.0;
    criticalHeatStressTempC = 35.0;
    idealSoilMoisturePercent = { min: 55, max: 75 };
    dailyWaterRequirementMm = { min: 4.0, max: 6.5 };
    kcValue = 0.85;
    currentGrowthStage = 'Floração e Enchimento de Frutos';
    activeCropAlerts = [
      `Monitorar flutuações hídricas no solo para evitar rachadura de frutos ou abortamento de flores.`,
    ];
    climateRiskScore = 25;
  } else if (
    lowerName.includes('algodão') || lowerName.includes('cana') || lowerName.includes('mandioca') ||
    lowerName.includes('mamona') || lowerName.includes('sisal') || lowerName.includes('agave') ||
    lowerName.includes('juta') || lowerName.includes('cânhamo')
  ) {
    category = 'Fibras & Bioenergia';
    optimalTempRange = { min: 22, max: 33 };
    criticalFrostTempC = 1.0;
    criticalHeatStressTempC = 38.0;
    idealSoilMoisturePercent = { min: 45, max: 75 };
    dailyWaterRequirementMm = { min: 3.5, max: 6.0 };
    kcValue = 0.85;
    currentGrowthStage = 'Desenvolvimento Vegetativo e Acúmulo de Reservas';
    activeCropAlerts = [
      `Cultura com boa tolerância a períodos secos, evitar acúmulo excessivo de água no perfil do solo.`,
    ];
    climateRiskScore = 18;
  } else if (
    lowerName.includes('brachiaria') || lowerName.includes('urochloa') || lowerName.includes('eucalipto') ||
    lowerName.includes('pinus') || lowerName.includes('seringueira') || lowerName.includes('bambu') ||
    lowerName.includes('alfafa') || lowerName.includes('capim') || lowerName.includes('stylosanthes') ||
    lowerName.includes('panicum') || lowerName.includes('tifton') || lowerName.includes('paspalum') ||
    lowerName.includes('acácia') || lowerName.includes('teca') || lowerName.includes('paricá') ||
    lowerName.includes('mogno') || lowerName.includes('cedro') || lowerName.includes('ipê') ||
    lowerName.includes('araucária') || lowerName.includes('pastagem')
  ) {
    category = 'Pastagens & Silvicultura';
    optimalTempRange = { min: 20, max: 32 };
    criticalFrostTempC = -1.0;
    criticalHeatStressTempC = 38.0;
    idealSoilMoisturePercent = { min: 40, max: 75 };
    dailyWaterRequirementMm = { min: 3.0, max: 5.5 };
    kcValue = 0.90;
    currentGrowthStage = 'Crescimento Vegetativo Contínuo';
    activeCropAlerts = [
      `Alta rusticidade ao clima local; monitorar umidade do ar (<25%) para prevenção de queimadas.`,
    ];
    climateRiskScore = 15;
  }

  return {
    id: `crop-${rec.cropId}`,
    cropName: rec.cropName,
    scientificName: sciName,
    category,
    optimalTempRange,
    criticalFrostTempC,
    criticalHeatStressTempC,
    idealSoilMoisturePercent,
    dailyWaterRequirementMm,
    currentGrowthStage,
    activeCropAlerts,
    climateRiskScore,
    kcValue,
  };
}

// Build map of handcrafted crop IDs and normalized names
const handcraftedCropIds = new Set(HANDCRAFTED_CROPS.map(c => c.id));
const handcraftedCropNames = new Set(HANDCRAFTED_CROPS.map(c => c.cropName.toLowerCase()));

// Map remaining items from 250 catalog dynamically
const autoGeneratedCrops: CropWeatherThreshold[] = CROP_PLANTING_RECOMMENDATIONS_250
  .filter(rec => !handcraftedCropIds.has(`crop-${rec.cropId}`) && !handcraftedCropNames.has(rec.cropName.toLowerCase()))
  .map(generateWeatherThresholdForCrop);

export const cropWeatherThresholdsCatalog: CropWeatherThreshold[] = [
  ...HANDCRAFTED_CROPS,
  ...autoGeneratedCrops,
].sort((a, b) => a.cropName.localeCompare(b.cropName, 'pt-BR'));

export const weatherAlertsCatalog: WeatherAlertItem[] = [
  {
    id: 'alt-clima-01',
    title: 'Janela de Pulverização Altamente Favorável',
    type: 'baixa_umidade',
    severity: 'informativo',
    timestamp: 'Hoje às 06:00',
    validUntil: 'Hoje às 09:30',
    affectedPlots: ['Talhão 01 - Soja', 'Talhão 04 - Milho', 'Talhão 08 - Café'],
    description: 'Vento em 5.2 km/h, temperatura de 21.5°C e UR em 76%. Condição perfeita para aplicação de fungicidas sistêmicos sem risco de deriva ou evaporação.',
    recommendedAction: 'Iniciar operação nos talhões prioritários com vazão calibrada e bicos de leque duplo antideriva.',
    resolved: false,
  },
  {
    id: 'alt-clima-02',
    title: 'Alerta de Frente Fria com Queda Térmica',
    type: 'geada',
    severity: 'moderado',
    timestamp: 'Hoje às 10:30',
    validUntil: '29/08 às 08:00',
    affectedPlots: ['Talhão 08 - Café (Baixada)', 'Talhão 10 - Hortaliças'],
    description: 'Previsão de entrada de massa de ar polar entre 28 e 29 de agosto, com mínimas podendo atingir 10°C na sede e 5°C em fundos de vale úmidos.',
    recommendedAction: 'Suspender podas e adubações nitrogenadas pesadas. Manter solo limpo e sem restos culturais soltos que bloqueiem a irradiação noturna do calor do solo.',
    resolved: false,
  },
  {
    id: 'alt-clima-03',
    title: 'Previsão de Chuva Acumulada de 24 mm',
    type: 'chuva_intensa',
    severity: 'informativo',
    timestamp: 'Hoje às 08:00',
    validUntil: '27/08 às 23:59',
    affectedPlots: ['Todos os talhões da propriedade'],
    description: 'Sistema frontal trará precipitação homogênea de 24 mm na próxima quarta-feira. Excelente para recarga hídrica do perfil do solo.',
    recommendedAction: 'Aproveitar os dias anteriores para concluir colheitas pendentes e adubações de cobertura que necessitam de chuva para incorporação.',
    resolved: false,
  },
];

export const initialFarmWeatherStation: FarmWeatherStation = {
  id: 'station-01',
  name: 'Estação Meteorológica Automática - Sede da Fazenda',
  model: 'GeaAgro Vantage Pro3 Solar IoT',
  latitude: -21.1767,
  longitude: -47.8208,
  batteryStatusPercent: 98,
  signalQualityPercent: 100,
  lastTelemetryTimestamp: 'Há 3 minutos (11:42)',
  currentAirTempC: 26.4,
  currentHumidityPercent: 62,
  currentWindSpeedKmh: 6.2,
  currentWindGustKmh: 10.5,
  currentWindDirectionDeg: 135, // SE
  currentRainRateMmHr: 0,
  rainAccumulatedTodayMm: 0,
  rainAccumulatedMonthMm: 48.5,
  currentSolarRadiationWm2: 740,
  currentAtmosphericPressureHpa: 1014.2,
  soilMoistureSensors: {
    depth10cmPercent: 26.5,
    depth30cmPercent: 31.0,
    depth60cmPercent: 34.2,
  },
};

export const historicalRainMonthlyData: HistoricalRainMonth[] = [
  { month: 'Jan', currentYearMm: 280, previousYearMm: 310, historical30YearAvgMm: 265 },
  { month: 'Fev', currentYearMm: 210, previousYearMm: 195, historical30YearAvgMm: 220 },
  { month: 'Mar', currentYearMm: 165, previousYearMm: 180, historical30YearAvgMm: 170 },
  { month: 'Abr', currentYearMm: 75, previousYearMm: 60, historical30YearAvgMm: 80 },
  { month: 'Mai', currentYearMm: 45, previousYearMm: 35, historical30YearAvgMm: 50 },
  { month: 'Jun', currentYearMm: 20, previousYearMm: 15, historical30YearAvgMm: 25 },
  { month: 'Jul', currentYearMm: 12, previousYearMm: 10, historical30YearAvgMm: 18 },
  { month: 'Ago (Atual)', currentYearMm: 48.5, previousYearMm: 22, historical30YearAvgMm: 28 },
  { month: 'Set', currentYearMm: 0, previousYearMm: 55, historical30YearAvgMm: 60 },
  { month: 'Out', currentYearMm: 0, previousYearMm: 140, historical30YearAvgMm: 130 },
  { month: 'Nov', currentYearMm: 0, previousYearMm: 205, historical30YearAvgMm: 195 },
  { month: 'Dez', currentYearMm: 0, previousYearMm: 275, historical30YearAvgMm: 260 },
];
