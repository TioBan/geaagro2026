import { PesticideProduct } from '../types/pesticideLeaflet';
import { SIPCAM_CATALOG_PART1 } from './sipcamCatalogPart1';
import { SIPCAM_CATALOG_PART2 } from './sipcamCatalogPart2';

/**
 * Catálogo Consolidado Oficial de Defensivos Agrícolas - Sipcam Nichino Brasil S.A.
 * Sede: Uberaba/MG
 * Total de Formulações Registradas: 33 produtos
 * Fonte: MAPA / AGROFIT
 */
export const SIPCAM_OFFICIAL_CATALOG: PesticideProduct[] = [
  ...SIPCAM_CATALOG_PART1,
  ...SIPCAM_CATALOG_PART2,
];
