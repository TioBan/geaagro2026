import { PesticideProduct, CropIndication } from '../types/pesticideLeaflet';

/**
 * Normalizes a product name for exact collision detection (lowercase, trim, collapse whitespace, strip accents)
 */
export function normalizePesticideName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes MAPA registration number (removes non-digits or standardizes format)
 */
export function normalizeRegistrationNumber(reg: string): string {
  return reg ? reg.trim().replace(/^0+/, '') : '';
}

export interface DuplicateReport {
  totalProducts: number;
  uniqueNamesCount: number;
  uniqueRegistrationsCount: number;
  duplicateNames: { name: string; count: number; ids: string[]; products: PesticideProduct[] }[];
  duplicateRegistrations: { regNumber: string; count: number; ids: string[]; productNames: string[] }[];
  isValid: boolean;
  rainbowProductsCount: number;
  manufacturersCount: number;
  totalDuplicateGroups: number;
  totalDuplicateItems: number;
  hasDuplicates: boolean;
  duplicateGroups: Array<{ key: string; count: number; products: PesticideProduct[] }>;
}

export interface CropCoverageReport {
  totalProducts: number;
  totalIndications: number;
  standardCropsCount: number;
  standardCropsList: string[];
  productsWithAllCropsCount: number;
  complianceRatePercent: number;
  is100PercentCompliant: boolean;
  missingCropsByProduct: { productId: string; productName: string; missingCrops: string[] }[];
  invalidDosagesCount: number;
  invalidDosagesList: { productId: string; productName: string; cropName: string; dosage: number }[];
  cropStats: Array<{
    cropName: string;
    productsCount: number;
    avgDosage: number;
    classesBreakdown: Record<string, number>;
  }>;
}

/**
 * Standard agricultural crops implemented across the entire platform
 */
export const STANDARD_AGRICULTURAL_CROPS = [
  'Soja',
  'Milho',
  'Algodão',
  'Café',
  'Feijão',
  'Trigo',
  'Citros',
  'Cana-de-açúcar',
  'Pastagens',
  'Tomate',
  'Batata',
  'Uva',
  'Arroz',
  'Sorgo',
  'Girassol',
  'Amendoim',
  'Cebola',
  'Alho',
  'Manga',
  'Banana',
  'Maçã',
  'Melancia',
  'Melão',
  'Pimentão',
  'Eucalipto',
  'Aveia',
  'Cevada',
  'Cenoura',
  'Morango',
  'Mandioca',
  'Maracujá',
  'Mamão',
  'Abacaxi',
  'Fumo',
];

/**
 * Inspects a list of pesticide products for duplicates in names, IDs, or MAPA registrations
 */
export function analyzePesticideDuplicates(products: PesticideProduct[]): DuplicateReport {
  const nameMap = new Map<string, PesticideProduct[]>();
  const regMap = new Map<string, PesticideProduct[]>();
  const idMap = new Map<string, PesticideProduct[]>();
  const manufacturers = new Set<string>();
  let rainbowCount = 0;

  for (const p of products) {
    // Track manufacturers
    if (p.manufacturer) {
      manufacturers.add(p.manufacturer.trim());
      if (p.manufacturer.toLowerCase().includes('rainbow') || p.productName.toLowerCase().includes('rainbow')) {
        rainbowCount++;
      }
    }

    // Name check
    const normName = normalizePesticideName(p.productName || '');
    if (normName) {
      const existing = nameMap.get(normName) || [];
      existing.push(p);
      nameMap.set(normName, existing);
    }

    // Registration check
    const normReg = normalizeRegistrationNumber(p.registrationNumber || '');
    if (normReg) {
      const existing = regMap.get(normReg) || [];
      existing.push(p);
      regMap.set(normReg, existing);
    }

    // ID check
    const id = p.id;
    if (id) {
      const existing = idMap.get(id) || [];
      existing.push(p);
      idMap.set(id, existing);
    }
  }

  const duplicateNames = Array.from(nameMap.entries())
    .filter(([_, list]) => list.length > 1)
    .map(([_, list]) => ({
      name: list[0].productName,
      count: list.length,
      ids: list.map(item => item.id),
      products: list,
    }));

  const duplicateRegistrations = Array.from(regMap.entries())
    .filter(([_, list]) => list.length > 1)
    .map(([reg, list]) => ({
      regNumber: list[0].registrationNumber || reg,
      count: list.length,
      ids: list.map(item => item.id),
      productNames: list.map(item => item.productName),
    }));

  const duplicateGroups: Array<{ key: string; count: number; products: PesticideProduct[] }> = [];

  duplicateNames.forEach(item => {
    duplicateGroups.push({
      key: `Nome: ${item.name}`,
      count: item.count,
      products: item.products,
    });
  });

  duplicateRegistrations.forEach(item => {
    // avoid repeating if exact same list
    if (!duplicateNames.some(dn => dn.products.some(p => p.registrationNumber === item.regNumber))) {
      duplicateGroups.push({
        key: `Registro MAPA: ${item.regNumber}`,
        count: item.count,
        products: regMap.get(item.regNumber) || [],
      });
    }
  });

  const totalDuplicateGroups = duplicateGroups.length;
  const totalDuplicateItems = duplicateNames.reduce((acc, curr) => acc + (curr.count - 1), 0) +
    duplicateRegistrations.reduce((acc, curr) => acc + (curr.count - 1), 0);

  const isValid = duplicateNames.length === 0 && duplicateRegistrations.length === 0;

  return {
    totalProducts: products.length,
    uniqueNamesCount: nameMap.size,
    uniqueRegistrationsCount: regMap.size,
    duplicateNames,
    duplicateRegistrations,
    isValid,
    rainbowProductsCount: rainbowCount,
    manufacturersCount: manufacturers.size,
    totalDuplicateGroups,
    totalDuplicateItems,
    hasDuplicates: !isValid,
    duplicateGroups,
  };
}

/**
 * Validates that all standard crops are present in every pesticide, and verifies dosages
 */
export function analyzeCropAndDosageCoverage(
  products: PesticideProduct[],
  standardCrops: string[] = STANDARD_AGRICULTURAL_CROPS
): CropCoverageReport {
  let totalIndications = 0;
  const missingCropsByProduct: { productId: string; productName: string; missingCrops: string[] }[] = [];
  const invalidDosagesList: { productId: string; productName: string; cropName: string; dosage: number }[] = [];

  const cropCountsMap = new Map<string, { count: number; totalDosage: number; classes: Record<string, number> }>();
  for (const crop of standardCrops) {
    cropCountsMap.set(crop.toLowerCase(), { count: 0, totalDosage: 0, classes: {} });
  }

  let productsWithAllCropsCount = 0;

  for (const product of products) {
    const productIndications = product.indications || [];
    totalIndications += productIndications.length;

    const productCropsSet = new Set<string>();
    for (const ind of productIndications) {
      const lowerCrop = (ind.cropName || '').trim().toLowerCase();
      productCropsSet.add(lowerCrop);

      // Check dosage validity
      if (typeof ind.recommendedDosage !== 'number' || ind.recommendedDosage <= 0 || !ind.dosageUnit) {
        invalidDosagesList.push({
          productId: product.id,
          productName: product.productName,
          cropName: ind.cropName,
          dosage: ind.recommendedDosage,
        });
      }

      // Track crop stats
      const stats = cropCountsMap.get(lowerCrop);
      if (stats) {
        stats.count += 1;
        stats.totalDosage += typeof ind.recommendedDosage === 'number' ? ind.recommendedDosage : 0;
        const agroClass = product.agrochemicalClass || 'Outros';
        stats.classes[agroClass] = (stats.classes[agroClass] || 0) + 1;
      }
    }

    const missingForThisProd: string[] = [];
    for (const stdCrop of standardCrops) {
      if (!productCropsSet.has(stdCrop.toLowerCase())) {
        missingForThisProd.push(stdCrop);
      }
    }

    if (missingForThisProd.length === 0) {
      productsWithAllCropsCount++;
    } else {
      missingCropsByProduct.push({
        productId: product.id,
        productName: product.productName,
        missingCrops: missingForThisProd,
      });
    }
  }

  const complianceRatePercent = products.length > 0
    ? Math.round((productsWithAllCropsCount / products.length) * 10000) / 100
    : 100;

  const cropStats = standardCrops.map(crop => {
    const stats = cropCountsMap.get(crop.toLowerCase()) || { count: 0, totalDosage: 0, classes: {} };
    return {
      cropName: crop,
      productsCount: stats.count,
      avgDosage: stats.count > 0 ? Math.round((stats.totalDosage / stats.count) * 100) / 100 : 0,
      classesBreakdown: stats.classes,
    };
  });

  return {
    totalProducts: products.length,
    totalIndications,
    standardCropsCount: standardCrops.length,
    standardCropsList: standardCrops,
    productsWithAllCropsCount,
    complianceRatePercent,
    is100PercentCompliant: missingCropsByProduct.length === 0 && invalidDosagesList.length === 0,
    missingCropsByProduct,
    invalidDosagesCount: invalidDosagesList.length,
    invalidDosagesList,
    cropStats,
  };
}

/**
 * Deduplicates an array of products strictly by unique normalized name and registration
 */
export function deduplicatePesticideCatalog(products: PesticideProduct[]): PesticideProduct[] {
  const seenNames = new Set<string>();
  const seenRegistrations = new Set<string>();
  const seenIds = new Set<string>();
  const uniqueList: PesticideProduct[] = [];

  for (const product of products) {
    const normName = normalizePesticideName(product.productName);
    const normReg = normalizeRegistrationNumber(product.registrationNumber);
    const normId = product.id;

    if (seenNames.has(normName)) {
      continue; // Skip duplicate name
    }
    if (normReg && seenRegistrations.has(normReg)) {
      continue; // Skip duplicate MAPA registration
    }
    if (normId && seenIds.has(normId)) {
      continue; // Skip duplicate ID
    }

    seenNames.add(normName);
    if (normReg) seenRegistrations.add(normReg);
    if (normId) seenIds.add(normId);

    uniqueList.push(product);
  }

  return uniqueList;
}

/**
 * Validates if a new product being added in the form collides with any existing product
 */
export function checkPesticideCollision(
  products: PesticideProduct[],
  newProductName: string,
  newRegNumber: string,
  excludeId?: string
): { hasCollision: boolean; reason?: string; conflictingProduct?: PesticideProduct } {
  const normName = normalizePesticideName(newProductName);
  const normReg = normalizeRegistrationNumber(newRegNumber);

  for (const prod of products) {
    if (excludeId && prod.id === excludeId) continue;

    if (normName && normalizePesticideName(prod.productName) === normName) {
      return {
        hasCollision: true,
        reason: `Já existe um defensivo cadastrado com o nome "${prod.productName}" (Fabricante: ${prod.manufacturer}, Registro: ${prod.registrationNumber}).`,
        conflictingProduct: prod,
      };
    }

    if (normReg && normalizeRegistrationNumber(prod.registrationNumber) === normReg) {
      return {
        hasCollision: true,
        reason: `Já existe um defensivo com o número de registro MAPA "${prod.registrationNumber}" cadastrado (${prod.productName} - ${prod.manufacturer}).`,
        conflictingProduct: prod,
      };
    }
  }

  return { hasCollision: false };
}

