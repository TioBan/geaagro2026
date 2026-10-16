import { PesticideProduct } from '../types/pesticideLeaflet';
import { SUMITOMO_CATALOG_PART1 } from './sumitomoCatalogPart1';
import { SUMITOMO_CATALOG_PART2 } from './sumitomoCatalogPart2';
import { SUMITOMO_CATALOG_PART3 } from './sumitomoCatalogPart3';
import { SUMITOMO_CATALOG_PART4 } from './sumitomoCatalogPart4';

/**
 * Catálogo Oficial Sumitomo Chemical consolidado
 * Fonte Oficial: Ministério da Agricultura e Pecuária (MAPA) / AGROFIT
 * Unidades Fabricantes:
 *  - Sumitomo Chemical Brasil Indústria Química S.A. - São Paulo/SP
 *  - Sumitomo Chemical Brasil Indústria Química S.A. - Maracanaú/CE
 */
export const SUMITOMO_OFFICIAL_CATALOG: PesticideProduct[] = [
  ...SUMITOMO_CATALOG_PART1,
  ...SUMITOMO_CATALOG_PART2,
  ...SUMITOMO_CATALOG_PART3,
  ...SUMITOMO_CATALOG_PART4,
];

export default SUMITOMO_OFFICIAL_CATALOG;
