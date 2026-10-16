import { 
  SufficiencyRanges, 
  NutrientLibraryItem, 
  LeafSample, 
  NutritionalTwin,
  NutrientClass,
  LeafLabResults
} from '../types/foliar';

export const FOLIAR_SUFFICIENCY_RANGES: SufficiencyRanges[] = [
  {
    crop: 'Soja',
    phenologicalStage: 'R1 - R2 (Início do florescimento)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 35, minLow: 35.1, maxLow: 44.9, minAdequate: 45, maxAdequate: 55, minHigh: 55.1, maxHigh: 65, minVeryHigh: 65.1, maxVeryHigh: 100 },
      P: { minVeryLow: 0, maxVeryLow: 2.0, minLow: 2.1, maxLow: 2.4, minAdequate: 2.5, maxAdequate: 5.0, minHigh: 5.1, maxHigh: 7.0, minVeryHigh: 7.1, maxVeryHigh: 20 },
      K: { minVeryLow: 0, maxVeryLow: 12, minLow: 12.1, maxLow: 16.9, minAdequate: 17, maxAdequate: 25, minHigh: 25.1, maxHigh: 30, minVeryHigh: 30.1, maxVeryHigh: 50 },
      Ca: { minVeryLow: 0, maxVeryLow: 3.5, minLow: 3.6, maxLow: 5.9, minAdequate: 6.0, maxAdequate: 10.0, minHigh: 10.1, maxHigh: 15.0, minVeryHigh: 15.1, maxVeryHigh: 30 },
      Mg: { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 5.0, minHigh: 5.1, maxHigh: 8.0, minVeryHigh: 8.1, maxVeryHigh: 15 },
      S:  { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 2.4, minAdequate: 2.5, maxAdequate: 4.0, minHigh: 4.1, maxHigh: 6.0, minVeryHigh: 6.1, maxVeryHigh: 10 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 15, minLow: 15.1, maxLow: 24.9, minAdequate: 25, maxAdequate: 50, minHigh: 50.1, maxHigh: 80, minVeryHigh: 80.1, maxVeryHigh: 200 },
      Cu: { minVeryLow: 0, maxVeryLow: 4, minLow: 4.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 30, minHigh: 30.1, maxHigh: 50, minVeryHigh: 50.1, maxVeryHigh: 100 },
      Fe: { minVeryLow: 0, maxVeryLow: 30, minLow: 30.1, maxLow: 49.9, minAdequate: 50, maxAdequate: 150, minHigh: 150.1, maxHigh: 300, minVeryHigh: 300.1, maxVeryHigh: 600 },
      Mn: { minVeryLow: 0, maxVeryLow: 15, minLow: 15.1, maxLow: 19.9, minAdequate: 20, maxAdequate: 100, minHigh: 100.1, maxHigh: 200, minVeryHigh: 200.1, maxVeryHigh: 500 },
      Zn: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 19.9, minAdequate: 20, maxAdequate: 50, minHigh: 50.1, maxHigh: 100, minVeryHigh: 100.1, maxVeryHigh: 300 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.1, minLow: 0.2, maxLow: 0.4, minAdequate: 0.5, maxAdequate: 2.0, minHigh: 2.1, maxHigh: 5.0, minVeryHigh: 5.1, maxVeryHigh: 10 },
    }
  },
  {
    crop: 'Milho',
    phenologicalStage: 'VT - R1 (Pendoamento e Polinização)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 26.9, minAdequate: 27, maxAdequate: 35, minHigh: 35.1, maxHigh: 42, minVeryHigh: 42.1, maxVeryHigh: 70 },
      P: { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 1.9, minAdequate: 2.0, maxAdequate: 4.0, minHigh: 4.1, maxHigh: 5.5, minVeryHigh: 5.6, maxVeryHigh: 12 },
      K: { minVeryLow: 0, maxVeryLow: 12, minLow: 12.1, maxLow: 16.9, minAdequate: 17, maxAdequate: 25, minHigh: 25.1, maxHigh: 32, minVeryHigh: 32.1, maxVeryHigh: 50 },
      Ca: { minVeryLow: 0, maxVeryLow: 2.0, minLow: 2.1, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 8.0, minHigh: 8.1, maxHigh: 12.0, minVeryHigh: 12.1, maxVeryHigh: 25 },
      Mg: { minVeryLow: 0, maxVeryLow: 1.2, minLow: 1.3, maxLow: 1.9, minAdequate: 2.0, maxAdequate: 5.0, minHigh: 5.1, maxHigh: 7.0, minVeryHigh: 7.1, maxVeryHigh: 15 },
      S:  { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.4, minAdequate: 1.5, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 8 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 25, minHigh: 25.1, maxHigh: 40, minVeryHigh: 40.1, maxVeryHigh: 100 },
      Cu: { minVeryLow: 0, maxVeryLow: 3, minLow: 3.1, maxLow: 5.9, minAdequate: 6, maxAdequate: 20, minHigh: 20.1, maxHigh: 35, minVeryHigh: 35.1, maxVeryHigh: 80 },
      Fe: { minVeryLow: 0, maxVeryLow: 30, minLow: 30.1, maxLow: 49.9, minAdequate: 50, maxAdequate: 250, minHigh: 250.1, maxHigh: 400, minVeryHigh: 400.1, maxVeryHigh: 800 },
      Mn: { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 39.9, minAdequate: 40, maxAdequate: 150, minHigh: 150.1, maxHigh: 250, minVeryHigh: 250.1, maxVeryHigh: 500 },
      Zn: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 14.9, minAdequate: 15, maxAdequate: 50, minHigh: 50.1, maxHigh: 80, minVeryHigh: 80.1, maxVeryHigh: 200 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.05, minLow: 0.06, maxLow: 0.09, minAdequate: 0.1, maxAdequate: 0.5, minHigh: 0.51, maxHigh: 1.5, minVeryHigh: 1.51, maxVeryHigh: 5 },
    }
  },
  {
    crop: 'Café',
    phenologicalStage: 'Jan - Mar (Enchimento dos Frutos)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 25.9, minAdequate: 26, maxAdequate: 32, minHigh: 32.1, maxHigh: 38, minVeryHigh: 38.1, maxVeryHigh: 60 },
      P: { minVeryLow: 0, maxVeryLow: 0.8, minLow: 0.9, maxLow: 1.1, minAdequate: 1.2, maxAdequate: 2.0, minHigh: 2.1, maxHigh: 3.0, minVeryHigh: 3.1, maxVeryHigh: 8 },
      K: { minVeryLow: 0, maxVeryLow: 14, minLow: 14.1, maxLow: 17.9, minAdequate: 18, maxAdequate: 24, minHigh: 24.1, maxHigh: 30, minVeryHigh: 30.1, maxVeryHigh: 50 },
      Ca: { minVeryLow: 0, maxVeryLow: 6.0, minLow: 6.1, maxLow: 9.9, minAdequate: 10.0, maxAdequate: 15.0, minHigh: 15.1, maxHigh: 20.0, minVeryHigh: 20.1, maxVeryHigh: 35 },
      Mg: { minVeryLow: 0, maxVeryLow: 2.0, minLow: 2.1, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 5.0, minHigh: 5.1, maxHigh: 7.0, minVeryHigh: 7.1, maxVeryHigh: 15 },
      S:  { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.4, minAdequate: 1.5, maxAdequate: 2.5, minHigh: 2.6, maxHigh: 4.0, minVeryHigh: 4.1, maxVeryHigh: 8 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 44.9, minAdequate: 45, maxAdequate: 80, minHigh: 80.1, maxHigh: 120, minVeryHigh: 120.1, maxVeryHigh: 250 },
      Cu: { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 40, minHigh: 40.1, maxHigh: 70, minVeryHigh: 70.1, maxVeryHigh: 150 },
      Fe: { minVeryLow: 0, maxVeryLow: 35, minLow: 35.1, maxLow: 59.9, minAdequate: 60, maxAdequate: 200, minHigh: 200.1, maxHigh: 350, minVeryHigh: 350.1, maxVeryHigh: 700 },
      Mn: { minVeryLow: 0, maxVeryLow: 30, minLow: 30.1, maxLow: 49.9, minAdequate: 50, maxAdequate: 200, minHigh: 200.1, maxHigh: 350, minVeryHigh: 350.1, maxVeryHigh: 600 },
      Zn: { minVeryLow: 0, maxVeryLow: 8, minLow: 8.1, maxLow: 11.9, minAdequate: 12, maxAdequate: 30, minHigh: 30.1, maxHigh: 60, minVeryHigh: 60.1, maxVeryHigh: 150 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.05, minLow: 0.06, maxLow: 0.09, minAdequate: 0.1, maxAdequate: 0.8, minHigh: 0.81, maxHigh: 2.0, minVeryHigh: 2.01, maxVeryHigh: 6 },
    }
  },
  {
    crop: 'Feijão',
    phenologicalStage: 'R5 (Início do Florescimento)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 22, minLow: 22.1, maxLow: 29.9, minAdequate: 30, maxAdequate: 45, minHigh: 45.1, maxHigh: 55, minVeryHigh: 55.1, maxVeryHigh: 90 },
      P: { minVeryLow: 0, maxVeryLow: 1.8, minLow: 1.9, maxLow: 2.4, minAdequate: 2.5, maxAdequate: 4.5, minHigh: 4.6, maxHigh: 6.0, minVeryHigh: 6.1, maxVeryHigh: 15 },
      K: { minVeryLow: 0, maxVeryLow: 14, minLow: 14.1, maxLow: 19.9, minAdequate: 20, maxAdequate: 30, minHigh: 30.1, maxHigh: 38, minVeryHigh: 38.1, maxVeryHigh: 60 },
      Ca: { minVeryLow: 0, maxVeryLow: 6.0, minLow: 6.1, maxLow: 9.9, minAdequate: 10.0, maxAdequate: 25.0, minHigh: 25.1, maxHigh: 35.0, minVeryHigh: 35.1, maxVeryHigh: 50 },
      Mg: { minVeryLow: 0, maxVeryLow: 1.8, minLow: 1.9, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 8.0, minHigh: 8.1, maxHigh: 12.0, minVeryHigh: 12.1, maxVeryHigh: 20 },
      S:  { minVeryLow: 0, maxVeryLow: 1.2, minLow: 1.3, maxLow: 1.9, minAdequate: 2.0, maxAdequate: 3.5, minHigh: 3.6, maxHigh: 5.0, minVeryHigh: 5.1, maxVeryHigh: 10 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 18, minLow: 18.1, maxLow: 29.9, minAdequate: 30, maxAdequate: 60, minHigh: 60.1, maxHigh: 90, minVeryHigh: 90.1, maxVeryHigh: 200 },
      Cu: { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 30, minHigh: 30.1, maxHigh: 50, minVeryHigh: 50.1, maxVeryHigh: 100 },
      Fe: { minVeryLow: 0, maxVeryLow: 30, minLow: 30.1, maxLow: 49.9, minAdequate: 50, maxAdequate: 200, minHigh: 200.1, maxHigh: 350, minVeryHigh: 350.1, maxVeryHigh: 700 },
      Mn: { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 29.9, minAdequate: 30, maxAdequate: 150, minHigh: 150.1, maxHigh: 250, minVeryHigh: 250.1, maxVeryHigh: 500 },
      Zn: { minVeryLow: 0, maxVeryLow: 12, minLow: 12.1, maxLow: 19.9, minAdequate: 20, maxAdequate: 60, minHigh: 60.1, maxHigh: 100, minVeryHigh: 100.1, maxVeryHigh: 250 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.2, minLow: 0.3, maxLow: 0.7, minAdequate: 0.8, maxAdequate: 2.5, minHigh: 2.6, maxHigh: 5.0, minVeryHigh: 5.1, maxVeryHigh: 12 },
    }
  },
  {
    crop: 'Algodão',
    phenologicalStage: 'F1 (Florescimento Pleno)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 34.9, minAdequate: 35, maxAdequate: 45, minHigh: 45.1, maxHigh: 55, minVeryHigh: 55.1, maxVeryHigh: 80 },
      P: { minVeryLow: 0, maxVeryLow: 2.0, minLow: 2.1, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 5.0, minHigh: 5.1, maxHigh: 7.0, minVeryHigh: 7.1, maxVeryHigh: 15 },
      K: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 14.9, minAdequate: 15, maxAdequate: 25, minHigh: 25.1, maxHigh: 32, minVeryHigh: 32.1, maxVeryHigh: 50 },
      Ca: { minVeryLow: 0, maxVeryLow: 12.0, minLow: 12.1, maxLow: 19.9, minAdequate: 20.0, maxAdequate: 35.0, minHigh: 35.1, maxHigh: 45.0, minVeryHigh: 45.1, maxVeryHigh: 65 },
      Mg: { minVeryLow: 0, maxVeryLow: 2.5, minLow: 2.6, maxLow: 3.9, minAdequate: 4.0, maxAdequate: 8.0, minHigh: 8.1, maxHigh: 12.0, minVeryHigh: 12.1, maxVeryHigh: 20 },
      S:  { minVeryLow: 0, maxVeryLow: 1.8, minLow: 1.9, maxLow: 2.9, minAdequate: 3.0, maxAdequate: 6.0, minHigh: 6.1, maxHigh: 8.5, minVeryHigh: 8.6, maxVeryHigh: 15 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 18, minLow: 18.1, maxLow: 29.9, minAdequate: 30, maxAdequate: 60, minHigh: 60.1, maxHigh: 95, minVeryHigh: 95.1, maxVeryHigh: 200 },
      Cu: { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 25, minHigh: 25.1, maxHigh: 45, minVeryHigh: 45.1, maxVeryHigh: 100 },
      Fe: { minVeryLow: 0, maxVeryLow: 35, minLow: 35.1, maxLow: 59.9, minAdequate: 60, maxAdequate: 200, minHigh: 200.1, maxHigh: 350, minVeryHigh: 350.1, maxVeryHigh: 700 },
      Mn: { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 39.9, minAdequate: 40, maxAdequate: 150, minHigh: 150.1, maxHigh: 250, minVeryHigh: 250.1, maxVeryHigh: 500 },
      Zn: { minVeryLow: 0, maxVeryLow: 12, minLow: 12.1, maxLow: 19.9, minAdequate: 20, maxAdequate: 60, minHigh: 60.1, maxHigh: 100, minVeryHigh: 100.1, maxVeryHigh: 250 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.1, minLow: 0.11, maxLow: 0.19, minAdequate: 0.2, maxAdequate: 1.0, minHigh: 1.01, maxHigh: 3.0, minVeryHigh: 3.01, maxVeryHigh: 8 },
    }
  },
  {
    crop: 'Citrus',
    phenologicalStage: 'Primavera (Ramos de 6 meses)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 18, minLow: 18.1, maxLow: 22.9, minAdequate: 23, maxAdequate: 27, minHigh: 27.1, maxHigh: 32, minVeryHigh: 32.1, maxVeryHigh: 50 },
      P: { minVeryLow: 0, maxVeryLow: 0.8, minLow: 0.9, maxLow: 1.1, minAdequate: 1.2, maxAdequate: 1.8, minHigh: 1.9, maxHigh: 2.5, minVeryHigh: 2.6, maxVeryHigh: 6 },
      K: { minVeryLow: 0, maxVeryLow: 7, minLow: 7.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 15, minHigh: 15.1, maxHigh: 20, minVeryHigh: 20.1, maxVeryHigh: 35 },
      Ca: { minVeryLow: 0, maxVeryLow: 22.0, minLow: 22.1, maxLow: 34.9, minAdequate: 35.0, maxAdequate: 45.0, minHigh: 45.1, maxHigh: 55.0, minVeryHigh: 55.1, maxVeryHigh: 80 },
      Mg: { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 2.4, minAdequate: 2.5, maxAdequate: 4.5, minHigh: 4.6, maxHigh: 6.5, minVeryHigh: 6.6, maxVeryHigh: 12 },
      S:  { minVeryLow: 0, maxVeryLow: 1.2, minLow: 1.3, maxLow: 1.9, minAdequate: 2.0, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 10 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 34.9, minAdequate: 35, maxAdequate: 100, minHigh: 100.1, maxHigh: 150, minVeryHigh: 150.1, maxVeryHigh: 300 },
      Cu: { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 20, minHigh: 20.1, maxHigh: 40, minVeryHigh: 40.1, maxVeryHigh: 100 },
      Fe: { minVeryLow: 0, maxVeryLow: 30, minLow: 30.1, maxLow: 49.9, minAdequate: 50, maxAdequate: 120, minHigh: 120.1, maxHigh: 200, minVeryHigh: 200.1, maxVeryHigh: 450 },
      Mn: { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 34.9, minAdequate: 35, maxAdequate: 90, minHigh: 90.1, maxHigh: 150, minVeryHigh: 150.1, maxVeryHigh: 350 },
      Zn: { minVeryLow: 0, maxVeryLow: 20, minLow: 20.1, maxLow: 34.9, minAdequate: 35, maxAdequate: 80, minHigh: 80.1, maxHigh: 130, minVeryHigh: 130.1, maxVeryHigh: 300 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.1, minLow: 0.11, maxLow: 0.19, minAdequate: 0.2, maxAdequate: 1.0, minHigh: 1.01, maxHigh: 3.0, minVeryHigh: 3.01, maxVeryHigh: 8 },
    }
  },
  {
    crop: 'Cana-de-Açúcar',
    phenologicalStage: 'Fase de Grande Crescimento (Folha +3)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 14, minLow: 14.1, maxLow: 17.9, minAdequate: 18, maxAdequate: 23, minHigh: 23.1, maxHigh: 28, minVeryHigh: 28.1, maxVeryHigh: 45 },
      P: { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.4, minAdequate: 1.5, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 10 },
      K: { minVeryLow: 0, maxVeryLow: 7, minLow: 7.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 16, minHigh: 16.1, maxHigh: 22, minVeryHigh: 22.1, maxVeryHigh: 35 },
      Ca: { minVeryLow: 0, maxVeryLow: 1.2, minLow: 1.3, maxLow: 1.9, minAdequate: 2.0, maxAdequate: 6.0, minHigh: 6.1, maxHigh: 9.0, minVeryHigh: 9.1, maxVeryHigh: 20 },
      Mg: { minVeryLow: 0, maxVeryLow: 0.7, minLow: 0.8, maxLow: 0.99, minAdequate: 1.0, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 10 },
      S:  { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.4, minAdequate: 1.5, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 8 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 5, minLow: 5.1, maxLow: 9.9, minAdequate: 10, maxAdequate: 30, minHigh: 30.1, maxHigh: 50, minVeryHigh: 50.1, maxVeryHigh: 120 },
      Cu: { minVeryLow: 0, maxVeryLow: 3, minLow: 3.1, maxLow: 5.9, minAdequate: 6, maxAdequate: 15, minHigh: 15.1, maxHigh: 30, minVeryHigh: 30.1, maxVeryHigh: 70 },
      Fe: { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 39.9, minAdequate: 40, maxAdequate: 200, minHigh: 200.1, maxHigh: 350, minVeryHigh: 350.1, maxVeryHigh: 700 },
      Mn: { minVeryLow: 0, maxVeryLow: 15, minLow: 15.1, maxLow: 24.9, minAdequate: 25, maxAdequate: 150, minHigh: 150.1, maxHigh: 250, minVeryHigh: 250.1, maxVeryHigh: 500 },
      Zn: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 14.9, minAdequate: 15, maxAdequate: 40, minHigh: 40.1, maxHigh: 70, minVeryHigh: 70.1, maxVeryHigh: 150 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.05, minLow: 0.06, maxLow: 0.09, minAdequate: 0.1, maxAdequate: 0.5, minHigh: 0.51, maxHigh: 1.5, minVeryHigh: 1.51, maxVeryHigh: 5 },
    }
  },
  {
    crop: 'Trigo',
    phenologicalStage: 'E3 (Emborrachamento / Folha Bandeira)',
    macros: {
      N: { minVeryLow: 0, maxVeryLow: 18, minLow: 18.1, maxLow: 24.9, minAdequate: 25, maxAdequate: 35, minHigh: 35.1, maxHigh: 42, minVeryHigh: 42.1, maxVeryHigh: 65 },
      P: { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 2.09, minAdequate: 2.1, maxAdequate: 3.5, minHigh: 3.6, maxHigh: 5.0, minVeryHigh: 5.1, maxVeryHigh: 10 },
      K: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 14.9, minAdequate: 15, maxAdequate: 30, minHigh: 30.1, maxHigh: 38, minVeryHigh: 38.1, maxVeryHigh: 55 },
      Ca: { minVeryLow: 0, maxVeryLow: 1.5, minLow: 1.6, maxLow: 2.49, minAdequate: 2.5, maxAdequate: 10.0, minHigh: 10.1, maxHigh: 15.0, minVeryHigh: 15.1, maxVeryHigh: 30 },
      Mg: { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.49, minAdequate: 1.5, maxAdequate: 4.0, minHigh: 4.1, maxHigh: 6.0, minVeryHigh: 6.1, maxVeryHigh: 12 },
      S:  { minVeryLow: 0, maxVeryLow: 1.0, minLow: 1.1, maxLow: 1.49, minAdequate: 1.5, maxAdequate: 3.0, minHigh: 3.1, maxHigh: 4.5, minVeryHigh: 4.6, maxVeryHigh: 9 },
    },
    micros: {
      B:  { minVeryLow: 0, maxVeryLow: 3, minLow: 3.1, maxLow: 5.9, minAdequate: 6, maxAdequate: 15, minHigh: 15.1, maxHigh: 25, minVeryHigh: 25.1, maxVeryHigh: 80 },
      Cu: { minVeryLow: 0, maxVeryLow: 3, minLow: 3.1, maxLow: 4.9, minAdequate: 5, maxAdequate: 15, minHigh: 15.1, maxHigh: 30, minVeryHigh: 30.1, maxVeryHigh: 70 },
      Fe: { minVeryLow: 0, maxVeryLow: 25, minLow: 25.1, maxLow: 39.9, minAdequate: 40, maxAdequate: 150, minHigh: 150.1, maxHigh: 250, minVeryHigh: 250.1, maxVeryHigh: 600 },
      Mn: { minVeryLow: 0, maxVeryLow: 15, minLow: 15.1, maxLow: 24.9, minAdequate: 25, maxAdequate: 100, minHigh: 100.1, maxHigh: 180, minVeryHigh: 180.1, maxVeryHigh: 400 },
      Zn: { minVeryLow: 0, maxVeryLow: 10, minLow: 10.1, maxLow: 17.9, minAdequate: 18, maxAdequate: 40, minHigh: 40.1, maxHigh: 70, minVeryHigh: 70.1, maxVeryHigh: 150 },
      Mo: { minVeryLow: 0, maxVeryLow: 0.05, minLow: 0.06, maxLow: 0.09, minAdequate: 0.1, maxAdequate: 0.5, minHigh: 0.51, maxHigh: 1.5, minVeryHigh: 1.51, maxVeryHigh: 5 },
    }
  }
];

export const NUTRIENT_LIBRARY: NutrientLibraryItem[] = [
  {
    symbol: 'N', name: 'Nitrogênio', type: 'Macro',
    functions: 'Constituinte de aminoácidos, proteínas, enzimas e clorofila. Fundamental para o crescimento vegetativo.',
    mobility: 'Alta',
    deficiencySymptoms: 'Amarelecimento generalizado (clorose) iniciando nas folhas mais velhas. Plantas raquíticas.',
    excessSymptoms: 'Crescimento vegetativo excessivo, acamamento, atraso na maturação, suscetibilidade a doenças.',
    fertilizerSources: 'Ureia, Sulfato de Amônio, Nitrato de Amônio, MAP, DAP.',
    interactions: 'Excesso pode inibir a absorção de K e Cu. Sinergismo com P.',
    peakDemandStage: 'Florescimento e enchimento de grãos (R1-R5).',
    references: 'Malavolta (2006); EMBRAPA.'
  },
  {
    symbol: 'P', name: 'Fósforo', type: 'Macro',
    functions: 'Transferência de energia (ATP), desenvolvimento do sistema radicular, florescimento e maturação.',
    mobility: 'Média',
    deficiencySymptoms: 'Coloração arroxeada nas folhas velhas, encurtamento do sistema radicular e atraso na maturação.',
    excessSymptoms: 'Precipita e inibe a absorção de micronutrientes, especialmente Zinco (Zn) e Ferro (Fe).',
    fertilizerSources: 'Superfosfato Simples, Superfosfato Triplo, MAP, DAP, Fosfato Natural.',
    interactions: 'Antagonismo severo com Zn e Fe em altas concentrações.',
    peakDemandStage: 'Desenvolvimento inicial de raízes e florescimento (V3-R1).',
    references: 'EMBRAPA; Malavolta (2006).'
  },
  {
    symbol: 'K', name: 'Potássio', type: 'Macro',
    functions: 'Regulação estomática, ativação enzimática, transporte de carboidratos, tolerância a estresses hídricos e térmicos.',
    mobility: 'Alta',
    deficiencySymptoms: 'Clorose e necrose nas margens das folhas mais velhas. Grãos chochos e menor peso de 1000 grãos.',
    excessSymptoms: 'Inibição competitiva na absorção de Cálcio (Ca) e Magnésio (Mg).',
    fertilizerSources: 'Cloreto de Potássio (KCl), Sulfato de Potássio, Nitrato de Potássio.',
    interactions: 'Antagonismo severo com Ca e Mg se em excesso.',
    peakDemandStage: 'Enchimento de grãos.',
    references: 'Malavolta (2006); IPNI.'
  },
  {
    symbol: 'Ca', name: 'Cálcio', type: 'Macro',
    functions: 'Constituinte da parede celular (pectatos), integridade de membranas e crescimento do meristema radicular e apical.',
    mobility: 'Imóvel',
    deficiencySymptoms: 'Necrose em órgãos jovens em expansão, morte do broto apical, abortamento de flores/frutos.',
    excessSymptoms: 'Inibe a absorção de Potássio (K), Magnésio (Mg) e Boro (B).',
    fertilizerSources: 'Nitrato de Cálcio, Calcário Calcítico, Gesso Agrícola.',
    interactions: 'Antagonismo com K e Mg no complexo de troca.',
    peakDemandStage: 'Crescimento vegetativo e início do florescimento.',
    references: 'Malavolta (2006); EMBRAPA.'
  },
  {
    symbol: 'Mg', name: 'Magnésio', type: 'Macro',
    functions: 'Átomo central da clorofila e ativador do transporte de fotoassimilados foliares para os grãos/raízes.',
    mobility: 'Alta',
    deficiencySymptoms: 'Clorose internervosa nas folhas velhas (padrão espinha de peixe).',
    excessSymptoms: 'Pode induzir deficiência secundária de Cálcio e Potássio.',
    fertilizerSources: 'Sulfato de Magnésio, Calcário Dolomítico, K-Mag.',
    interactions: 'Antagonismo competitivo com K e Ca.',
    peakDemandStage: 'Fase de alta taxa fotossintética e enchimento de grãos.',
    references: 'EMBRAPA.'
  },
  {
    symbol: 'S', name: 'Enxofre', type: 'Macro',
    functions: 'Constituinte dos aminoácidos cisteína e metionina, essencial para síntese proteica e nodulação.',
    mobility: 'Média',
    deficiencySymptoms: 'Clorose amarelada uniforme nas folhas NOVAS (diferente do Nitrogênio).',
    excessSymptoms: 'Pode acidificar o solo e causar queimadura foliar em altas concentrações.',
    fertilizerSources: 'Gesso Agrícola, Sulfato de Amônio, Enxofre Elemental, Superfosfato Simples.',
    interactions: 'Sinergismo com N para produção de proteínas.',
    peakDemandStage: 'Desenvolvimento vegetativo e enchimento de grãos.',
    references: 'Malavolta (2006).'
  },
  {
    symbol: 'B', name: 'Boro', type: 'Micro',
    functions: 'Germinação do tubo polínico, formação da parede celular e transporte de açúcares.',
    mobility: 'Imóvel',
    deficiencySymptoms: 'Morte da gema apical, folhas novas deformadas e quebradiças, falhas na polinização.',
    excessSymptoms: 'Clorose e necrose nas margens das folhas mais velhas.',
    fertilizerSources: 'Ácido Bórico, Octaborato de Sódio, Bórax, Ulexita.',
    interactions: 'O excesso de Ca no solo pode induzir deficiência de B.',
    peakDemandStage: 'Pré-florescimento e florescimento (R1).',
    references: 'EMBRAPA.'
  },
  {
    symbol: 'Zn', name: 'Zinco', type: 'Micro',
    functions: 'Precursor do triptofano e da auxina (hormônio de crescimento). Expansão foliar e Alongamento de entrenós.',
    mobility: 'Baixa',
    deficiencySymptoms: 'Encurtamento dos entrenós (plantas anãs), rosetamento e bandas cloróticas paralelas nas folhas novas.',
    excessSymptoms: 'Tóxico, causa clorose avermelhada e bloqueio de Ferro e Manganês.',
    fertilizerSources: 'Sulfato de Zinco, Zinco Quelatado EDTA, Óxido de Zinco.',
    interactions: 'Inibido por altas doses de Fósforo (P) no solo.',
    peakDemandStage: 'Fase vegetativa inicial (V2-V6).',
    references: 'Malavolta (2006).'
  },
  {
    symbol: 'Mn', name: 'Manganês', type: 'Micro',
    functions: 'Fotólise da água na fotossíntese e síntese de lignina para defesa vegetal.',
    mobility: 'Baixa',
    deficiencySymptoms: 'Pontilhados e manchas cloróticas internervais nas folhas novas/intermediárias.',
    excessSymptoms: 'Manchas necrotizadas marrons e necrose foliar em solos muito ácidos.',
    fertilizerSources: 'Sulfato de Manganês, Manganês Quelatado.',
    interactions: 'Imobilizado temporariamente por aplicação de herbicidas sistêmicos (ex: Glifosato).',
    peakDemandStage: 'Desenvolvimento vegetativo e fotossintético.',
    references: 'EMBRAPA.'
  },
  {
    symbol: 'Fe', name: 'Ferro', type: 'Micro',
    functions: 'Síntese da clorofila e transferência de elétrons na respiração celular e fotossíntese.',
    mobility: 'Imóvel',
    deficiencySymptoms: 'Clorose reticulada intensa nas folhas mais jovens (nervuras verdes e limbo amarelo/esbranquiçado).',
    excessSymptoms: 'Bronzeamento foliar e bloqueio na absorção de P e K.',
    fertilizerSources: 'Sulfato Ferroso, Quelatos de Ferro (Fe-EDTA, Fe-EDDHMA).',
    interactions: 'Antagonismo com Zinco e Manganês.',
    peakDemandStage: 'Fase vegetativa acelerada.',
    references: 'Malavolta (2006).'
  },
  {
    symbol: 'Cu', name: 'Cobre', type: 'Micro',
    functions: 'Transporte de elétrons na fotossíntese, respiração e lignificação dos tecidos de sustentação.',
    mobility: 'Baixa',
    deficiencySymptoms: 'Folhas novas enroladas, flácidas e deformadas. Queima das pontas foliares.',
    excessSymptoms: 'Inibição do crescimento radicular e bloqueio de Ferro.',
    fertilizerSources: 'Sulfato de Cobre, Oxicloreto de Cobre, Cobre Quelatado.',
    interactions: 'Antagonismo com N, P e Zn.',
    peakDemandStage: 'Fase de perfilhamento e crescimento de ramos.',
    references: 'EMBRAPA.'
  },
  {
    symbol: 'Mo', name: 'Molibdênio', type: 'Micro',
    functions: 'Cofator das enzimas Nitrogenase (FBN) e Nitrato Redutase (assimilação de N).',
    mobility: 'Média',
    deficiencySymptoms: 'Sintomas idênticos à deficiência de N (clorose) e queima das margens foliares.',
    excessSymptoms: 'Pouco tóxico à planta, mas pode afetar animais em pastagem se excessivo.',
    fertilizerSources: 'Molibdato de Sódio, Molibdato de Amônio.',
    interactions: 'Inibido por solos ácidos (pH < 5,2). Sinergismo com Co e N.',
    peakDemandStage: 'Vegetativo inicial (V3-V5) e nodulação.',
    references: 'EMBRAPA; Malavolta (2006).'
  }
];

export interface NutrientManagementInfo {
  symbol: string;
  name: string;
  unit: string;
  type: 'Macro' | 'Micro';
  deficiency: {
    explanation: string;
    causes: string;
    foliarManagement: string;
    soilManagement: string;
    bestPractices: string;
  };
  excess: {
    explanation: string;
    causes: string;
    management: string;
  };
}

export const NUTRIENT_MANAGEMENT_GUIDE: Record<string, NutrientManagementInfo> = {
  K: {
    symbol: 'K', name: 'Potássio', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'O Potássio regula a abertura estomática, pressão de turgor, síntese protéica e translocação de fotoassimilados para os grãos/frutos. Sua deficiência compromete drasticamente a retenção hídrica, provoca o chochamento de grãos e reduz o Peso de Mil Grãos (PMS).',
      causes: 'Baixa reserva trocável no solo, solos arenosos sujeitos à lixiviação, estresse hídrico prolongado ou antagonismo por excesso de Cálcio e Magnésio no solo.',
      foliarManagement: 'Adubação foliar de emergência com Sulfato de Potássio (K₂SO₄) a 2,0 - 3,0 kg/ha ou Nitrato de Potássio (KNO₃) a 2,5 - 4,0 kg/ha em calda de 100-150 L/ha, acrescida de aminoácidos livres (0.5 L/ha) e espalhante siliconado.',
      soilManagement: 'Adubação de cobertura com Cloreto de Potássio (KCl) a lanço (80 a 120 kg/ha de K₂O) parcelada em 2 etapas. Ajustar a saturação por K na CTC para 3% a 5%.',
      bestPractices: 'Realizar pulverizações foliares nos horários de menor temperatura e alta umidade hídrica (>65%). Evitar mistura com altas concentrações de Ca solúvel no mesmo tanque.'
    },
    excess: {
      explanation: 'O excesso foliar/radicular de Potássio provoca inibição competitiva por sítios de absorção catiônica nas raízes e membranas, bloqueando a captação de Magnésio (Mg) e Cálcio (Ca).',
      causes: 'Superdosagem de KCl na adubação de base ou cobertura.',
      management: 'Suspender temporariamente fertilizações potássicas e pulverizar Sulfato de Magnésio via foliar (1.5 - 2.0%) para reestabelecer a relação K:Mg.'
    }
  },
  B: {
    symbol: 'B', name: 'Boro', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Elemento imóvel, indispensável para a integridade da parede celular, divisão meristemática e germinação do tubo polínico. A carência causa abortamento massivo de flores/vagens, deformação das folhas jovens e morte do broto apical.',
      causes: 'Solos arenosos com baixa matéria orgânica, seca durante a fase reprodutiva ou excesso de calagem que eleva o pH acima de 6,5 imobilizando o Boro.',
      foliarManagement: 'Pulverização foliar de Octaborato de Sódio (150 a 250 g B/ha) ou Ácido Bórico (1,0 a 1,5 kg/ha) associada a sorbitol/polióis para maximizar a mobilidade foliar. Aplicar em V6 e repetir em R1 (pré-florescimento).',
      soilManagement: 'Aplicação via solo de boratos de liberação gradativa (Ulexita) na dose de 1,5 a 2,5 kg B/ha incorporados no plantio ou a lanço.',
      bestPractices: 'Manter a calda de pulverização em pH levemente ácido (5,5 a 6,5). Garantir boa cobertura de gotas no terço superior da planta.'
    },
    excess: {
      explanation: 'Faixa de segurança muito estreita. Causa toxicidade severa com queimaduras e necroses amareladas nas margens e pontas das folhas mais velhas.',
      causes: 'Erro de cálculo em dosagens de adubação foliar ou sobreposição de faixas de aplicação.',
      management: 'Interromper adubações boradas. Manter bom fluxo hídrico para favorecer a lixiviação do excesso no perfil do solo.'
    }
  },
  N: {
    symbol: 'N', name: 'Nitrogênio', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'Constituinte básico de aminoácidos, proteínas, enzimas e clorofila. A deficiência reduz o índice de área foliar, diminui a taxa fotossintética e provoca clorose uniforme iniciando nas folhas inferiores (velhas).',
      causes: 'Baixa matéria orgânica no solo, falhas na inoculação/FBN em leguminosas, ou lixiviação de Nitrato por chuvas volumosas.',
      foliarManagement: 'Aplicação foliar de Ureia de baixo teor de biureto a 1,0 - 1,5% v/v (10-15 g/L) ou N-Fluido enriquecido com aminoácidos livres e cobalto/molibdênio (1,0 - 2,0 L/ha).',
      soilManagement: 'Adubação de cobertura com Ureia protegida (inibidor de urease) ou Sulfato de Amônio (40 - 80 kg N/ha). Em leguminosas, realizar coinoculação com Azospirillum.',
      bestPractices: 'Aplicar ureia em solo úmido ou antecedendo precipitação para evitar perdas por volatilização de amônia.'
    },
    excess: {
      explanation: 'Provoca crescimento vegetativo desproporcional, tecidos celulares tenros e sucumbentes, acamamento de plantas e alta suscetibilidade a fúngicas e pragas sugadoras.',
      causes: 'Superdosagem de adubação nitrogenada em cobertura.',
      management: 'Suspender adubação nitrogenada e pulverizar Potássio (K) e Boro (B) via foliar para direcionar os fotoassimilados para enchimento de estruturas reprodutivas.'
    }
  },
  P: {
    symbol: 'P', name: 'Fósforo', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'Atua na estocagem e transferência de energia (ATP), desenvolvimento inicial de raízes, florescimento e maturação de grãos. Provoca coloração arroxeada nas folhas velhas e encurtamento do sistema radicular.',
      causes: 'Fixação de Fósforo por óxidos de Ferro e Alumínio em solos ácidos sem calagem adequada.',
      foliarManagement: 'Pulverização foliar de MAP solúvel (1,5 - 2,0 kg/ha) ou Fosfito de Potássio (1,0 - 1,5 L/ha) no vegetativo V3-V6 e pré-florescimento.',
      soilManagement: 'Adubação fosfatada concentrada no sulco de plantio (MAP/DAP/Superfosfato) e calagem corretiva do solo para liberar o P fixado.',
      bestPractices: 'Aplicar fontes foliares de alta solubilidade nas fases de arranque radicular e diferenciação floral.'
    },
    excess: {
      explanation: 'Precipita e bloqueia a absorção de micronutrientes catiônicos, especialmente Zinco (Zn) e Ferro (Fe).',
      causes: 'Adubação fosfatada excessiva e localizada.',
      management: 'Interromper adubação fosfatada e suprir Zinco e Ferro via foliar na forma de chelatos EDTA.'
    }
  },
  Ca: {
    symbol: 'Ca', name: 'Cálcio', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'Elemento imóvel, forma os pectatos da parede celular e garante a integridade de membranas. A carência gera necrose em tecidos jovens, morte da gema apical e colapso do sistema radicular.',
      causes: 'Baixa saturação por Ca no solo, baixa taxa de transpiração da lavoura ou antagonismo por excesso de Potássio e Magnésio.',
      foliarManagement: 'Adubação foliar com Nitrato de Cálcio solúvel ou Cálcio Complexado com aminoácidos (1,5 - 2,5 L/ha) direcionada aos brotos e órgãos reprodutivos.',
      soilManagement: 'Calagem com calcário calcítico/dolomítico e aplicação de Gesso Agrícola (CaSO₄) para condicionar a subsuperfície do solo.',
      bestPractices: 'Garantir boa transpiração foliar e evitar misturar Ca solúvel com sulfatos/fosfatos no mesmo tanque.'
    },
    excess: {
      explanation: 'Eleva o pH do solo e provoca inibição competitiva na absorção de Potássio (K), Magnésio (Mg) e Boro (B).',
      causes: 'Super-calagem descalculada.',
      management: 'Equilibrar a nutrição aplicando Potássio e Magnésio via solo e foliar.'
    }
  },
  Mg: {
    symbol: 'Mg', name: 'Magnésio', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'Átomo central da clorofila e responsável pelo carregamento de açúcares foliares para os grãos/frutos. Causa clorose internervosa caracteristicamente nas folhas velhas (padrão espinha de peixe).',
      causes: 'Solos com baixa saturação por Mg, uso exclusivo de calcário calcítico ou excesso de adubação potássica (KCl).',
      foliarManagement: 'Pulverização foliar de Sulfato de Magnésio (MgSO₄·7H₂O) a 1,5 - 2,5% (2 a 3 kg/ha) ou Magnésio Quelatado.',
      soilManagement: 'Calagem com Calcário Dolomítico (mínimo 12% MgO) ou aplicação de K-Mag / Sulfato Duplo de K e Mg.',
      bestPractices: 'Aplicar via foliar na fase de maior taxa fotossintética e início de enchimento de grãos.'
    },
    excess: {
      explanation: 'Pode induzir deficiências secundárias de Cálcio e Potássio por competição na absorção radicular.',
      causes: 'Aplicações massivas de magnesita ou calcário magnesiano puro.',
      management: 'Adequar o balanço de bases via adubação com Cálcio e Potássio.'
    }
  },
  S: {
    symbol: 'S', name: 'Enxofre', unit: 'g/kg', type: 'Macro',
    deficiency: {
      explanation: 'Constituinte dos aminoácidos cisteína e metionina. A carência reduz a síntese proteica e causa clorose amarelada uniforme nas folhas NOVAS (diferente do N).',
      causes: 'Baixa matéria orgânica, uso de adubos concentrados sem S (Ureia, TSP) e solos intemperizados.',
      foliarManagement: 'Pulverização foliar com Enxofre Elemental micronizado (0,5 - 1,0 kg S/ha) ou Sulfato de Magnésio/Amônio solúvel.',
      soilManagement: 'Aplicação de Gesso Agrícola (15-18% S), Sulfato de Amônio ou Superfosfato Simples em cobertura ou plantio.',
      bestPractices: 'Evitar associação de enxofre elemental com óleos na calda para prevenir fitotoxicidade foliar.'
    },
    excess: {
      explanation: 'Pode acidificar o solo e causar queimadura foliar em caldas muito concentradas.',
      causes: 'Dosagem excessiva de enxofre pódium/solúvel.',
      management: 'Ajuste de pH via calagem e irrigação.'
    }
  },
  Zn: {
    symbol: 'Zn', name: 'Zinco', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Precursor do aminoácido triptofano e do hormônio auxina. A falta trava a expansão celular, encurta os entrenós (plantas anãs) e gera rosetamento foliar.',
      causes: 'Solos alcalinos ou super-calcados, teores elevados de Fósforo no solo ou solos arenosos.',
      foliarManagement: 'Pulverização foliar com Sulfato de Zinco ou Zinco Quelatado EDTA (150 a 300 g Zn/ha) nas fases iniciais V2-V6.',
      soilManagement: 'Aplicação de Sulfato de Zinco via solo (3 - 5 kg Zn/ha) ou enriquecimento no tratamento de sementes.',
      bestPractices: 'Não misturar Zinco concentrado com fertilizantes fosfatados no mesmo tanque de pulverização.'
    },
    excess: {
      explanation: 'Tóxico para a planta, causa clorose avermelhada e bloqueio na absorção de Ferro e Manganês.',
      causes: 'Superdosagem em tratamento de sementes ou pulverizações folares repetidas.',
      management: 'Aplicação foliar de Ferro e Manganês para mitigar os sintomas de toxicidade.'
    }
  },
  Mn: {
    symbol: 'Mn', name: 'Manganês', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Essencial para a quebra da água na fotossíntese (complexo fotólise) e síntese de lignina. Causa pontilhados e manchas cloróticas internervais nas folhas novas.',
      causes: 'Solos com pH alto (>6,5) ou imobilização temporária por herbicidas sistêmicos (como Glifosato).',
      foliarManagement: 'Pulverização foliar de Sulfato de Manganês (200 - 400 g Mn/ha) ou Manganês Aminoácido. Manter calda levemente ácida (pH 5,5 - 6,0).',
      soilManagement: 'Aplicação de Sulfato de Manganês no solo em sulco ou acidificação localizada.',
      bestPractices: 'Se aplicado em área com glifosato, utilizar fontes de Manganês fortemente quelatadas (EDTA/aminoácidos) ou respeitar intervalo de 3 a 5 dias.'
    },
    excess: {
      explanation: 'Comum em solos muito ácidos (pH < 5,0), causando manchas marrons necrotizadas e desfolha.',
      causes: 'Acidez acentuada do solo.',
      management: 'Realizar calagem imediata no solo para elevar o pH para 5,8 - 6,2 e imobilizar o Manganês solúvel.'
    }
  },
  Fe: {
    symbol: 'Fe', name: 'Ferro', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Crucial para a síntese da clorofila e transporte de elétrons na fotossíntese. Causa clorose reticulada intensa nas folhas mais jovens (nervuras bem verdes e limbo amarelado/esbranquiçado).',
      causes: 'Solos alcalinos/calcários, solos encharcados com anoxia radicular, ou excesso de Zinco e Manganês no solo.',
      foliarManagement: 'Pulverização foliar de Quelato de Ferro (Fe-EDTA ou Fe-EDDHMA) a 100 - 200 g Fe/ha.',
      soilManagement: 'Melhorar a drenagem do solo e aplicar quelatos de Ferro no solo em solos alcalinos.',
      bestPractices: 'Aplicar via foliar no final da tarde ou dias nublados para evitar degradação do quelato por luz solar.'
    },
    excess: {
      explanation: 'Provoca bronzeamento foliar e inibe a absorção de Fósforo e Potássio.',
      causes: 'Acúmulo de Ferro solúvel em solos encharcados sem oxigênio.',
      management: 'Promover drenagem eficiente do solo para re-oxigenar o sistema radicular.'
    }
  },
  Cu: {
    symbol: 'Cu', name: 'Cobre', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Atua no transporte de elétrons e na lignificação dos tecidos de sustentação. Causa dobras, enrolamento e flacidez nos ramos e pontas de folhas novas.',
      causes: 'Solos com altíssimo teor de matéria orgânica ou adubação excessiva de Nitrogênio/Fósforo.',
      foliarManagement: 'Pulverização de Cobre Quelatado ou Oxicloreto de Cobre (50 - 100 g Cu/ha) no início do vegetativo.',
      soilManagement: 'Aplicação de Sulfato de Cobre no solo (2 - 4 kg Cu/ha) com efeito residual duradouro.',
      bestPractices: 'Respeitar rigidamente as dosagens recomendadas para evitar fitotoxicidade foliar.'
    },
    excess: {
      explanation: 'Acúmulo tóxico que paralisa o crescimento radicular e bloqueia a absorção de Ferro.',
      causes: 'Uso contínuo e repetido de defensivos agrícolas à base de Cobre.',
      management: 'Elevar a matéria orgânica e calagem do solo para imobilizar o Cobre em excesso.'
    }
  },
  Mo: {
    symbol: 'Mo', name: 'Molibdênio', unit: 'mg/kg', type: 'Micro',
    deficiency: {
      explanation: 'Cofator das enzimas Nitrogenase (fixação biológica do N) e Nitrato Redutase. A falta impede a conversão do N, gerando sintomas de amarelecimento idênticos à deficiência de Nitrogênio.',
      causes: 'Solos ácidos (pH < 5,2) onde o Molibdênio fica fortemente retido em óxidos de ferro.',
      foliarManagement: 'Pulverização foliar de Molibdato de Sódio ou de Amônio (12 - 25 g Mo/ha) conjugado com Cobalto (Co) no vegetativo V3-V5.',
      soilManagement: 'Calagem para elevar o pH do solo acima de 5,8, liberando o Molibdênio natural retido.',
      bestPractices: 'Integrar com o tratamento de sementes e inoculação com Bradyrhizobium.'
    },
    excess: {
      explanation: 'Pouco tóxico às culturas, mas teores excessivos na forragem podem provocar molibdenose em ruminantes.',
      causes: 'Superdosagem em pulverizações foliares.',
      management: 'Evitar superdosagens em áreas destinadas ao pasto ou forragem.'
    }
  }
};


export const INITIAL_LEAF_SAMPLES: LeafSample[] = [];

// Helper para obter a faixa de suficiência por cultura e estádio
export function getNutrientSufficiencyRange(crop?: string, stage?: string): SufficiencyRanges {
  if (!crop) return FOLIAR_SUFFICIENCY_RANGES[0];
  const cNorm = crop.toLowerCase().trim();
  
  // 1. Busca por cultura e estádio coincidente
  if (stage) {
    const sNorm = stage.toLowerCase().trim();
    const exact = FOLIAR_SUFFICIENCY_RANGES.find(
      r => r.crop.toLowerCase() === cNorm && (r.phenologicalStage.toLowerCase().includes(sNorm) || sNorm.includes(r.phenologicalStage.toLowerCase()))
    );
    if (exact) return exact;
  }

  // 2. Busca flexível por cultura
  const cropMatch = FOLIAR_SUFFICIENCY_RANGES.find(
    r => r.crop.toLowerCase() === cNorm || cNorm.includes(r.crop.toLowerCase()) || r.crop.toLowerCase().includes(cNorm)
  );
  if (cropMatch) return cropMatch;

  // Fallback para primeira regra (Soja)
  return FOLIAR_SUFFICIENCY_RANGES[0];
}

// Motor de Regras: Interpretação de resultados sem IA
export function interpretNutrient(value: number, symbol: string, type: 'macros' | 'micros', crop: string, stage: string): NutrientClass {
  const range = getNutrientSufficiencyRange(crop, stage);
  if (!range) return 'Adequado';
  
  const limits = range[type][symbol as keyof typeof range['macros'] & keyof typeof range['micros']] as any;
  if (!limits) return 'Adequado';
  
  if (value <= limits.maxVeryLow) return 'Muito Baixo';
  if (value <= limits.maxLow) return 'Baixo';
  if (value <= limits.maxAdequate) return 'Adequado';
  if (value <= limits.maxHigh) return 'Alto';
  return 'Muito Alto';
}

// Cálculo de relações
export function calculateRatios(results?: LeafLabResults) {
  if (!results) {
    return { NP: 0, NK: 0, CaMg: 0, KMg: 0, KCa: 0 };
  }
  const N = results.N || 0;
  const P = results.P || 1;
  const K = results.K || 1;
  const Ca = results.Ca || 1;
  const Mg = results.Mg || 1;
  return {
    NP: Number((P ? N / P : 0).toFixed(1)),
    NK: Number((K ? N / K : 0).toFixed(1)),
    CaMg: Number((Mg ? Ca / Mg : 0).toFixed(1)),
    KMg: Number((Mg ? K / Mg : 0).toFixed(1)),
    KCa: Number((Ca ? K / Ca : 0).toFixed(2))
  };
}

export interface RatioDetailStatus {
  title: string;
  badge: string;
  cause: string;
  physiologicalImpact: string;
  practicalConsequences: string[];
  careAndPrecautions?: string[];
  action: string;
}

export interface RatioDetail {
  key: string;
  name: string;
  elements: string;
  minIdeal: number;
  maxIdeal: number;
  definition: string;
  highStatus: RatioDetailStatus;
  lowStatus: RatioDetailStatus;
  idealStatus: RatioDetailStatus;
}

export const RATIO_EXPLANATION_DETAILS: Record<string, RatioDetail> = {
  NK: {
    key: 'NK',
    name: 'Relação Nitrogênio / Potássio (N:K)',
    elements: 'N (Nitrogênio) / K (Potássio)',
    minIdeal: 1.8,
    maxIdeal: 2.4,
    definition: 'Mede a paridade entre a taxa de acúmulo de biomassa vegetativa e proteínas (N) e o cátion responsável pela osmorregulação, turgescência estomática e translocação de fotossintatos (K).',
    highStatus: {
      title: 'Excesso de Nitrogênio ou Falta Relativa de Potássio (Relação N:K Alta)',
      badge: 'ALTO (> 2.4)',
      cause: 'Sobredosagem de adubação nitrogenada de cobertura (ureia/nitrato) ou deficiência/bloqueio na absorção de Potássio no solo.',
      physiologicalImpact: 'Acúmulo de compostos nitrogenados solúveis (N-NO₃⁻/aminoácidos livres) e redução na síntese de lignina e celulose na parede celular, diminuindo o controle de transpiração e turgor das células-guarda dos estômatos.',
      practicalConsequences: [
        'Tecidos foliares tenros e suculentos, highly atrativos para pragas sugadoras (pulgões, mosca-branca, ácaros).',
        'Maior risco de acamamento de plantas (lodging) sob ventos e chuvas fortes.',
        'Sensibilidade extrema ao estresse hídrico e térmico durante as horas mais quentes do dia.',
        'Perda na translocação de açúcares para os grãos/frutos, reduzindo o Peso de Mil Sementes (PMS).'
      ],
      careAndPrecautions: [
        'CUIDADO: Interromper temporariamente novas aplicações de Nitrogênio (ureia/nitrato) em cobertura.',
        'CUIDADO: Monitorar semanalmente a incidência de pragas sugadoras (pulgões, mosca-branca) e doenças fúngicas foliares.',
        'CUIDADO: Evitar irrigações pesadas ou aplicação de herbicidas hormonais que possam agravar o tombamento de plantas.',
        'CUIDADO: Não aplicar adubos foliares com alto índice salino sem ajustar o volume de calda e o pH (manter pH da calda entre 5.5 e 6.5).'
      ],
      action: 'Interromper adubações nitrogenadas e realizar pulverização foliar emergencial de Potássio solúvel (Nitrato de Potássio KNO₃ a 0,8%-1,0% ou Sulfato de Potássio K₂SO₄ a 0,5%-1,0%).'
    },
    lowStatus: {
      title: 'Carência de Nitrogênio ou Excesso Relativo de Potássio (Relação N:K Baixa)',
      badge: 'BAIXO (< 1.8)',
      cause: 'Adubação potássica concentrada (KCl/K₂SO₄) sem o acompanhamento proporcional de Nitrogênio em cobertura.',
      physiologicalImpact: 'Diminuição na taxa de síntese de clorofila e enzimas metabólicas (Rubisco), reduzindo o acúmulo de biomassa e o vigor vegetativo.',
      practicalConsequences: [
        'Amarelamento prematuro de folhas velhas e perda da área foliar fotossinteticamente ativa.',
        'Encurtamento do ciclo produtivo e redução do número de nós férteis por planta.',
        'Subaproveitamento da capacidade de conversão da radiação solar em matéria seca.'
      ],
      careAndPrecautions: [
        'CUIDADO: Evitar aplicar potássio adicional via solo enquanto a cota de Nitrogênio não for corrigida.',
        'CUIDADO: Monitorar a clorose das folhas do baixeiro para não confundir com deficiência severa de enxofre ou magnésio.',
        'CUIDADO: Em períodos de seca, evitar uréia granulada de solo sem incorporação ou sem chuva prevista.'
      ],
      action: 'Realizar adubação foliar com Ureia de baixo teor de biureto (0,8% a 1,2%) combinada com aminoácidos para rápida assimilação nitrogenada.'
    },
    idealStatus: {
      title: 'Balanço Fisiológico Perfeito N:K',
      badge: 'IDEAL (1.8 - 2.4)',
      cause: 'Suprimento equilibrado de Nitrogênio e Potássio no solo e na lâmina foliar.',
      physiologicalImpact: 'Máxima eficiência no uso da água com perfeito fechamento/abertura estomática e fluxo contínuo de carboidratos para os órgãos de reserva.',
      practicalConsequences: [
        'Folhas firmes com boa lignificação e alta resistência natural a patógenos e pragas.',
        'Plena tolerância a veranicos de curta duração e alta eficiência de enchimento de grãos/frutos.'
      ],
      careAndPrecautions: [
        'CUIDADO: Manter o acompanhamento nas trocas de fases fenológicas (ex: vegetativo para florada).',
        'CUIDADO: Evitar mudanças bruscas na formulação de adubação via fertirrigação.'
      ],
      action: 'Manter a programação de adubação e monitorar novamente no estágio reprodutivo (R2/R3).'
    }
  },
  CaMg: {
    key: 'CaMg',
    name: 'Relação Cálcio / Magnésio (Ca:Mg)',
    elements: 'Ca (Cálcio) / Mg (Magnésio)',
    minIdeal: 2.0,
    maxIdeal: 3.0,
    definition: 'Avalia a proporção entre o elemento estrutural da lamela média celular e membranas (Cálcio) e o elemento central da molécula de clorofila ativador da fotossíntese (Magnésio).',
    highStatus: {
      title: 'Predomínio de Cálcio sobre o Magnésio (Relação Ca:Mg Alta)',
      badge: 'ALTO (> 3.0)',
      cause: 'Aplicação de calcário calcítico (alto teor de Ca e baixo de Mg) ou alta taxa transpiratória impulsionando o Cálcio via xilema.',
      physiologicalImpact: 'Antagonismo competitivo onde o Ca²⁺ em excesso ocupa os sítios celulares e inibe a captação e transporte de Mg²⁺ para os cloroplastos.',
      practicalConsequences: [
        'Surgimento de clorose interveinal nas folhas velhas (amarelamento entre as nervuras verdes).',
        'Redução na taxa de fotossíntese líquida e retenção indevida de açúcares na lâmina foliar.',
        'Menor síntese de óleos e proteínas nos órgãos de acúmulo.'
      ],
      action: 'Aplicações foliares de Sulfato de Magnésio (MgSO₄ a 1,0%) ou Nitrato de Magnésio para suprir diretamente os cloroplastos.'
    },
    lowStatus: {
      title: 'Carência de Cálcio em relação ao Magnésio (Relação Ca:Mg Baixa)',
      badge: 'BAIXO (< 2.0)',
      cause: 'Solos derivados de rochas magnesianas ou adubação magnésica excessiva sem acompanhamento de fontes solúveis de Cálcio.',
      physiologicalImpact: 'Perda de integridade estrutural das paredes celulares (pectatos de cálcio), fragilizando meristemas e pontos de crescimento ativo.',
      practicalConsequences: [
        'Deformação de folhas jovens (encarquilhamento e margens dobradas).',
        'Necrose de meristemas apicais, abortamento de flores e alta incidência de fundo preto / podridão apical.',
        'Menor resistência do produto colhido no transporte e armazenamento (shelf-life reduzido).'
      ],
      action: 'Pulverização foliar de Cloreto de Cálcio (0,3%-0,5%) ou Nitrato de Cálcio direcionada aos tecidos em expansão e órgãos reprodutivos.'
    },
    idealStatus: {
      title: 'Balanço Fisiológico Perfeito Ca:Mg',
      badge: 'IDEAL (2.0 - 3.0)',
      cause: 'Relação equilibrada entre calcário dolomítico e adubação no perfil do solo.',
      physiologicalImpact: 'Estrutura celular rígida aliada a alta capacidade de fixação de carbono e fotossíntese contínua.',
      practicalConsequences: [
        'Tecidos vegetais resistentes, florada vigorosa e frutos com excelente sanidade física e pós-colheita.'
      ],
      action: 'Preservar o manejo de calagem e nutrição adotado.'
    }
  },
  PZn: {
    key: 'PZn',
    name: 'Relação Fósforo / Zinco (P:Zn)',
    elements: 'P (Fósforo) / Zn (Zinco)',
    minIdeal: 70,
    maxIdeal: 120,
    definition: 'Interação crucial entre o gerador de energia celular (ATP/Fósforo) e o ativador enzimático pré-cursor do hormônio de crescimento auxina (Zinco).',
    highStatus: {
      title: 'Indução de Deficiência de Zinco por Excesso de Fósforo (Relação P:Zn Alta)',
      badge: 'ALTO (> 120)',
      cause: 'Excesso de adubação fosfatada no sulco de plantio ou aplicações foliares concentradas de P sem adição de micronutrientes.',
      physiologicalImpact: 'O excesso de Fósforo imobiliza o Zinco formando complexos insolúveis de fosfato de zinco nas raízes e folhas, inibindo a enzima triptofano sintase.',
      practicalConsequences: [
        'Bloqueio da síntese do hormônio auxina (AIA), levando ao encurtamento acentuado de internódios (\'rosetamento\').',
        'Folhas pequenas, estreitas e eretas (\'little leaf\'), com faixas cloróticas paralelas às nervuras.',
        'Atraso acentuado na maturidade da lavoura e perda de dominância apical.'
      ],
      action: 'Aplicação emergencial foliar de Zinco quelatado (Zn-EDTA a 0,1%-0,2% ou Sulfato de Zinco a 0,15%).'
    },
    lowStatus: {
      title: 'Carência de Fósforo ou Excesso Relativo de Zinco (Relação P:Zn Baixa)',
      badge: 'BAIXO (< 70)',
      cause: 'Baixa disponibilidade de P por fixação no solo (solos argilosos/ácidos com Fe e Al) ou temperatura de solo baixa no início do ciclo.',
      physiologicalImpact: 'Incapacidade de transferência de energia celular (conversão de ADP em ATP), paralisando o transporte ativo de nutrientes.',
      practicalConsequences: [
        'Coloração arroxeada/violácea nas margens e nervuras de folhas velhas.',
        'Desenvolvimento radicular extremamente restrito e menor fixação de nós produtivos.'
      ],
      action: 'Aplicação foliar de Fósforo solúvel de alta assimilação (Fosfito de Potássio ou MAP purificado a 0,3%-0,5%).'
    },
    idealStatus: {
      title: 'Balanço Fisiológico Perfeito P:Zn',
      badge: 'IDEAL (70 - 120)',
      cause: 'Harmonia entre a adubação fosfatada de plantio e a nutrição com micronutrientes.',
      physiologicalImpact: 'Energia metabólica abundante para divisão celular e síntese equilibrada do hormônio de elongação auxina.',
      practicalConsequences: [
        'Internódios com comprimento normal, arquitetura de planta ereta e floração abundante e síncrona.'
      ],
      action: 'Manter a estratégia de adubação fosfatada e com micronutrientes.'
    }
  },
  KMg: {
    key: 'KMg',
    name: 'Relação Potássio / Magnésio (K:Mg)',
    elements: 'K (Potássio) / Mg (Magnésio)',
    minIdeal: 4.0,
    maxIdeal: 6.0,
    definition: 'Expressa a competição antagônica entre o principal cátion monovalente (K⁺) e o cátion bivalente fotossintético (Mg²⁺) pelos canais de absorção e transporte floemático.',
    highStatus: {
      title: 'Antagonismo Potássico Severo sobre o Magnésio (Relação K:Mg Alta)',
      badge: 'ALTO (> 6.0)',
      cause: 'Sobredosagem de cloreto de potássio (KCl) ou adubação foliar potássica pesada em curto período.',
      physiologicalImpact: 'O K⁺ em grande quantidade satura as bombas celulares e inibe a captação do Mg²⁺ para o estroma dos cloroplastos, paralisando a fixação de CO₂ pela enzima Rubisco.',
      practicalConsequences: [
        'Clorose interveinal pronunciada e necrose marginal em folhas maduras.',
        'Acúmulo estagnado de amido e açúcares na folha, com incapacidade de envio para os frutos/grãos.',
        'Perda de peso específico nos grãos e diminuição do teor de óleo em oleaginosas.'
      ],
      action: 'Suspender temporariamente a adubação com Potássio e aplicar Sulfato de Magnésio via foliar (10 g/L de água).'
    },
    lowStatus: {
      title: 'Deficiência de Potássio ou Excesso de Magnésio (Relação K:Mg Baixa)',
      badge: 'BAIXO (< 4.0)',
      cause: 'Esgotamento das reservas de Potássio no solo na fase de enchimento de grãos sem reposição foliar adequada.',
      physiologicalImpact: 'Falha no controle estomático, perda do turgor celular e menor fluidez no fluxo de seiva elaborada pelo floema.',
      practicalConsequences: [
        'Margens foliares com queimadura necrótica avermelhada/marrom.',
        'Choramento de frutos e grãos chochos/leves sem preenchimento completo.',
        'Vulnerabilidade a tombamento e murcha rápida em dias de sol forte.'
      ],
      action: 'Aplicação foliar urgente de Potássio solúvel de absorção foliar rápida (Nitrato de Potássio ou Citrato de Potássio a 0,8%-1,0%).'
    },
    idealStatus: {
      title: 'Balanço Fisiológico Perfeito K:Mg',
      badge: 'IDEAL (4.0 - 6.0)',
      cause: 'Proporção equilibrada entre K e Mg na lâmina foliar.',
      physiologicalImpact: 'Fluxo contínuo de carboidratos através do floema das folhas fonte diretamente para os órgãos dreno (frutos, grãos, tubérculos).',
      practicalConsequences: [
        'Máxima conversão de fotossintatos em produtividade real com elevada densidade de grãos.'
      ],
      action: 'Manter a condução nutricional vigente.'
    }
  },
  NP: {
    key: 'NP',
    name: 'Relação Nitrogênio / Fósforo (N:P)',
    elements: 'N (Nitrogênio) / P (Fósforo)',
    minIdeal: 14.0,
    maxIdeal: 18.0,
    definition: 'Mede o equilíbrio entre o acúmulo de biomassa e síntese proteica (N) e a disponibilidade de energia química e ácidos nucleicos para divisão celular (P).',
    highStatus: {
      title: 'Excesso de Nitrogênio ou Deficiência Relativa de Fósforo (N:P Alto)',
      badge: 'ALTO (> 18.0)',
      cause: 'Alta adubação de N com limitação de P no solo devido à fixação por óxidos de Ferro e Alumínio.',
      physiologicalImpact: 'Formação de biomassa fraca por falta de nucleotídeos (ATP/GTP) para consolidar a divisão celular.',
      practicalConsequences: [
        'Crescimento desordenado e fragilidade de caule.',
        'Baixo pegamento de flores e vagens.'
      ],
      action: 'Suplementação foliar com Fósforo solúvel e estimulantes radiculares.'
    },
    lowStatus: {
      title: 'Carência de Nitrogênio ou Excesso Relativo de Fósforo (N:P Baixo)',
      badge: 'BAIXO (< 14.0)',
      cause: 'Baixa absorção de N em solos secos ou frios.',
      physiologicalImpact: 'Deficiência na síntese de proteínas e clorofila.',
      practicalConsequences: [
        'Enfezamento e amarelecimento precoce da planta.',
        'Perda de potencial produtivo.'
      ],
      action: 'Pulverização foliar de Nitrogênio solúvel com aminoácidos.'
    },
    idealStatus: {
      title: 'Balanço N:P Ótimo',
      badge: 'IDEAL (14.0 - 18.0)',
      cause: 'Equilíbrio pleno entre crescimento vegetativo e disponibilidade energética.',
      physiologicalImpact: 'Alta taxa metabólica celular.',
      practicalConsequences: [
        'Desenvolvimento equilibrado e alta sanidade foliar.'
      ],
      action: 'Manter adubação de rotina.'
    }
  },
  NS: {
    key: 'NS',
    name: 'Relação Nitrogênio / Enxofre (N:S)',
    elements: 'N (Nitrogênio) / S (Enxofre)',
    minIdeal: 15.0,
    maxIdeal: 18.0,
    definition: 'Fundamento para a síntese dos aminoácidos sulfurados (Metionina e Cisteína), essenciais para a estruturação das proteínas e acúmulo de reservas de qualidade nos grãos.',
    highStatus: {
      title: 'Falta de Enxofre para Acoplamento com o Nitrogênio (N:S Alto)',
      badge: 'ALTO (> 18.0)',
      cause: 'Adubação concentrada em Nitrogênio puro (ureia) sem inclusão de fontes de Enxofre.',
      physiologicalImpact: 'Acúmulo nocivo de N não-proteico solúvel e aminas livres devido à impossibilidade de formar ligação dissulfeto nas proteínas.',
      practicalConsequences: [
        'Amarelecimento uniforme em folhas jovens.',
        'Queda do teor proteico dos grãos.'
      ],
      action: 'Aplicação foliar imediata de Enxofre elementar solúvel ou Sulfatos (Sulfato de Magnésio / Sulfato de Amônio).'
    },
    lowStatus: {
      title: 'Excesso de Enxofre ou Falta de Nitrogênio (N:S Baixo)',
      badge: 'BAIXO (< 15.0)',
      cause: 'Aplicações elevadas de enxofre em pó ou gesso agrícola com limitação de N.',
      physiologicalImpact: 'Subaproveitamento do Enxofre absorvido.',
      practicalConsequences: [
        'Desenvolvimento vegetativo restrito.'
      ],
      action: 'Complementar adubação nitrogenada em cobertura.'
    },
    idealStatus: {
      title: 'Balanço N:S Ótimo',
      badge: 'IDEAL (15.0 - 18.0)',
      cause: 'Nutrição sulfurada e nitrogenada equilibradas.',
      physiologicalImpact: 'Síntese contínua de proteínas estruturais e funcionais.',
      practicalConsequences: [
        'Grãos e frutos com elevado valor proteico e nutricional.'
      ],
      action: 'Manter o manejo nutricional.'
    }
  },
  FeMn: {
    key: 'FeMn',
    name: 'Relação Ferro / Manganês (Fe:Mn)',
    elements: 'Fe (Ferro) / Mn (Manganês)',
    minIdeal: 1.5,
    maxIdeal: 2.5,
    definition: 'Regula os processos de oxirredução no transporte de elétrons na fotossíntese (Fotossistema II) e respiração celular.',
    highStatus: {
      title: 'Excesso de Ferro e Inibição do Manganês (Fe:Mn Alto)',
      badge: 'ALTO (> 2.5)',
      cause: 'Solos ácidos com excesso de Ferro solúvel ou deficiência induzida de Manganês por calagem excessiva.',
      physiologicalImpact: 'Inibição da fotólise da água pela oxidação do Manganês no complexo de evolução de oxigênio.',
      practicalConsequences: [
        'Manchas cloróticas finas e retardo respiratório nas folhas.'
      ],
      action: 'Pulverização foliar de Manganês quelatado (Mn-EDTA).'
    },
    lowStatus: {
      title: 'Toxidez de Manganês e Inibição do Ferro (Fe:Mn Baixo)',
      badge: 'BAIXO (< 1.5)',
      cause: 'Solos muito ácidos ou sob encharcamento anaeróbico, solubilizando Mn²⁺ em níveis tóxicos.',
      physiologicalImpact: 'Acúmulo de dióxido de manganês tóxico nas tecidos velhos, bloqueando a assimilação do Ferro.',
      practicalConsequences: [
        'Pontos necróticos pretos/marrons ao longo do limbo foliar.'
      ],
      action: 'Calagem para elevar o pH do solo e aplicação foliar de Ferro quelatado (Fe-EDTA).'
    },
    idealStatus: {
      title: 'Balanço Fe:Mn Ótimo',
      badge: 'IDEAL (1.5 - 2.5)',
      cause: 'Equilíbrio redox na solução celular.',
      physiologicalImpact: 'Perfeito transporte de elétrons e oxigênio.',
      practicalConsequences: [
        'Folhas verde-escuras, lisas e sem lesões necróticas.'
      ],
      action: 'Manter a condução de campo.'
    }
  }
};

