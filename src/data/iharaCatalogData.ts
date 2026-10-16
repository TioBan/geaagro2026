import { PesticideProduct } from '../types/pesticideLeaflet';
import { IHARA_CATALOG_PART1 } from './iharaCatalogPart1';
import { IHARA_CATALOG_PART2 } from './iharaCatalogPart2';

/**
 * Catálogo Oficial Completo Iharabras S.A. Indústrias Químicas - Sorocaba/SP
 * 68 formulações oficiais homologadas pelo MAPA (Ministério da Agricultura, Pecuária e Abastecimento)
 */
export const IHARA_OFFICIAL_CATALOG: PesticideProduct[] = [
  ...IHARA_CATALOG_PART1,
  ...IHARA_CATALOG_PART2,
];

export const IHARA_PRODUCTS_COUNT = IHARA_OFFICIAL_CATALOG.length; // 68
