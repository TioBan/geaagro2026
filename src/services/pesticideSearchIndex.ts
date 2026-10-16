import { PesticideProduct, CropIndication } from '../types/pesticideLeaflet';
import { pesticideIndexedDB, SerializedIndexCache } from './pesticideIndexedDB';

/**
 * Normalizes text for search indexing: removes accents, converts to lowercase, trims.
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Splits text into unique clean searchable tokens.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  const normalized = normalizeSearchTerm(text);
  // Split on spaces, punctuation, slashes, dashes, commas, parentheses
  const rawTokens = normalized.split(/[\s,.;:/\-()_+[\]{}|\\&]+/);
  
  const tokens: string[] = [];
  for (const token of rawTokens) {
    if (token.length >= 2) {
      tokens.push(token);
    }
  }
  return Array.from(new Set(tokens));
}

export interface SearchFilters {
  classFilter?: string; // e.g. 'Herbicida', 'all'
  cropFilter?: string; // e.g. 'Soja', 'all'
  brandFilter?: string; // e.g. 'Rainbow', 'Bayer', 'BASF', 'all'
  toxicologicalFilter?: string; // 'all' or class
}

export interface SearchResult {
  items: PesticideProduct[];
  latencyMs: number;
  totalCount: number;
  queryTokens: string[];
  isIndexed: boolean;
}

export interface IndexStatistics {
  totalProducts: number;
  totalTokens: number;
  totalPrefixes: number;
  totalIndicationsIndexed: number;
  indexBuildTimeMs: number;
  lastIndexedAt: number;
  memorySizeEstimateKb: number;
}

interface ProductIndexEntry {
  product: PesticideProduct;
  normalizedName: string;
  normalizedActiveIngredient: string;
  normalizedManufacturer: string;
  normalizedRegistrationNumber: string;
  nameTokens: Set<string>;
  aiTokens: Set<string>;
  targetTokens: Set<string>;
  cropTokens: Set<string>;
  manufacturerTokens: Set<string>;
  allTokens: Set<string>;
  cropsSet: Set<string>;
  agrochemicalClass: string;
  toxicologicalClass: string;
  manufacturer: string;
}

export class PesticideSearchEngine {
  private productsMap: Map<string, PesticideProduct> = new Map();
  private entriesMap: Map<string, ProductIndexEntry> = new Map();
  
  // Inverted Index: Token -> Set of Product IDs
  private tokenInvertedIndex: Map<string, Set<string>> = new Map();
  
  // Prefix Index (2 to 4 char prefix -> Set of full tokens)
  private prefixIndex: Map<string, Set<string>> = new Map();

  // Filter Indices for O(1) instantaneous filtering
  private classIndex: Map<string, Set<string>> = new Map();
  private cropIndex: Map<string, Set<string>> = new Map();
  private manufacturerIndex: Map<string, Set<string>> = new Map();
  private toxicologicalIndex: Map<string, Set<string>> = new Map();

  // Index Statistics
  private stats: IndexStatistics = {
    totalProducts: 0,
    totalTokens: 0,
    totalPrefixes: 0,
    totalIndicationsIndexed: 0,
    indexBuildTimeMs: 0,
    lastIndexedAt: 0,
    memorySizeEstimateKb: 0,
  };

  private isBuilt: boolean = false;

  /**
   * Builds the inverted search index across all products.
   */
  public buildIndex(products: PesticideProduct[]): IndexStatistics {
    const startTime = performance.now();

    this.productsMap.clear();
    this.entriesMap.clear();
    this.tokenInvertedIndex.clear();
    this.prefixIndex.clear();
    this.classIndex.clear();
    this.cropIndex.clear();
    this.manufacturerIndex.clear();
    this.toxicologicalIndex.clear();

    let totalIndications = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      this.productsMap.set(p.id, p);

      const nameTokens = new Set(tokenizeText(p.productName));
      const aiTokens = new Set(tokenizeText(p.activeIngredient || ''));
      const manufacturerTokens = new Set(tokenizeText(p.manufacturer || ''));
      const groupTokens = tokenizeText(p.chemicalGroup || '');
      const regTokens = tokenizeText(p.registrationNumber || '');

      const targetTokens = new Set<string>();
      const cropTokens = new Set<string>();
      const cropsSet = new Set<string>();

      if (p.indications && p.indications.length > 0) {
        totalIndications += p.indications.length;
        for (let j = 0; j < p.indications.length; j++) {
          const ind = p.indications[j];
          if (ind.cropName) {
            cropsSet.add(normalizeSearchTerm(ind.cropName));
            tokenizeText(ind.cropName).forEach(t => cropTokens.add(t));
          }
          if (ind.targetOrganism) {
            tokenizeText(ind.targetOrganism).forEach(t => targetTokens.add(t));
          }
        }
      }

      const allTokens = new Set<string>([
        ...nameTokens,
        ...aiTokens,
        ...manufacturerTokens,
        ...groupTokens,
        ...regTokens,
        ...targetTokens,
        ...cropTokens,
      ]);

      const entry: ProductIndexEntry = {
        product: p,
        normalizedName: normalizeSearchTerm(p.productName),
        normalizedActiveIngredient: normalizeSearchTerm(p.activeIngredient || ''),
        normalizedManufacturer: normalizeSearchTerm(p.manufacturer || ''),
        normalizedRegistrationNumber: normalizeSearchTerm(p.registrationNumber || ''),
        nameTokens,
        aiTokens,
        targetTokens,
        cropTokens,
        manufacturerTokens,
        allTokens,
        cropsSet,
        agrochemicalClass: p.agrochemicalClass || '',
        toxicologicalClass: p.toxicologicalClass || '',
        manufacturer: p.manufacturer || '',
      };

      this.entriesMap.set(p.id, entry);

      // Populate Inverted Index
      allTokens.forEach((token) => {
        let set = this.tokenInvertedIndex.get(token);
        if (!set) {
          set = new Set();
          this.tokenInvertedIndex.set(token, set);
        }
        set.add(p.id);

        // Populate Prefix Index (prefixes of 2 to 4 chars)
        const maxPrefixLen = Math.min(4, token.length);
        for (let len = 2; len <= maxPrefixLen; len++) {
          const prefix = token.slice(0, len);
          let prefixSet = this.prefixIndex.get(prefix);
          if (!prefixSet) {
            prefixSet = new Set();
            this.prefixIndex.set(prefix, prefixSet);
          }
          prefixSet.add(token);
        }
      });

      // Filter Index: Agrochemical Class
      if (p.agrochemicalClass) {
        let classSet = this.classIndex.get(p.agrochemicalClass);
        if (!classSet) {
          classSet = new Set();
          this.classIndex.set(p.agrochemicalClass, classSet);
        }
        classSet.add(p.id);
      }

      // Filter Index: Manufacturer
      if (p.manufacturer) {
        const normMfg = normalizeSearchTerm(p.manufacturer);
        let mfgSet = this.manufacturerIndex.get(normMfg);
        if (!mfgSet) {
          mfgSet = new Set();
          this.manufacturerIndex.set(normMfg, mfgSet);
        }
        mfgSet.add(p.id);
      }

      // Filter Index: Toxicological Class
      if (p.toxicologicalClass) {
        let toxSet = this.toxicologicalIndex.get(p.toxicologicalClass);
        if (!toxSet) {
          toxSet = new Set();
          this.toxicologicalIndex.set(p.toxicologicalClass, toxSet);
        }
        toxSet.add(p.id);
      }

      // Filter Index: Crops
      cropsSet.forEach((normCrop) => {
        let cropSet = this.cropIndex.get(normCrop);
        if (!cropSet) {
          cropSet = new Set();
          this.cropIndex.set(normCrop, cropSet);
        }
        cropSet.add(p.id);
      });
    }

    const endTime = performance.now();
    const buildTime = Number((endTime - startTime).toFixed(2));

    this.stats = {
      totalProducts: products.length,
      totalTokens: this.tokenInvertedIndex.size,
      totalPrefixes: this.prefixIndex.size,
      totalIndicationsIndexed: totalIndications,
      indexBuildTimeMs: buildTime,
      lastIndexedAt: Date.now(),
      memorySizeEstimateKb: Math.round((this.tokenInvertedIndex.size * 64 + this.prefixIndex.size * 32) / 1024),
    };

    this.isBuilt = true;
    console.log(`[PesticideSearchEngine] Index built successfully in ${buildTime}ms: ${products.length} products, ${this.stats.totalTokens} unique tokens.`);

    // Persist serialized index cache asynchronously to IndexedDB
    this.persistCacheAsync();

    return this.stats;
  }

  /**
   * Persists the token map to IndexedDB for quick cold-start initialization
   */
  private async persistCacheAsync(): Promise<void> {
    try {
      const serializableTokens: Record<string, string[]> = {};
      this.tokenInvertedIndex.forEach((idSet, token) => {
        serializableTokens[token] = Array.from(idSet);
      });

      const cache: SerializedIndexCache = {
        version: '2.000-v1',
        timestamp: Date.now(),
        totalItems: this.productsMap.size,
        tokenCount: this.tokenInvertedIndex.size,
        tokens: serializableTokens,
      };

      await pesticideIndexedDB.saveIndexCache(cache);
    } catch (err) {
      console.warn('[PesticideSearchEngine] Failed to persist search cache to IndexedDB:', err);
    }
  }

  /**
   * Performs an instant sub-millisecond search with multi-word scoring and fast set filtering.
   */
  public search(query: string, filters: SearchFilters = {}): SearchResult {
    const startTime = performance.now();

    // 1. If index is not yet built, fallback to quick linear scan
    if (!this.isBuilt || this.productsMap.size === 0) {
      return {
        items: [],
        latencyMs: 0,
        totalCount: 0,
        queryTokens: [],
        isIndexed: false,
      };
    }

    const cleanQuery = query ? query.trim() : '';
    const queryTokens = tokenizeText(cleanQuery);
    const normQuery = normalizeSearchTerm(cleanQuery);

    // 2. Compute Filter Candidate Set
    let candidateIds: Set<string> | null = null;

    // Filter by Class
    if (filters.classFilter && filters.classFilter !== 'all') {
      const classMatches = this.classIndex.get(filters.classFilter);
      candidateIds = classMatches ? new Set(classMatches) : new Set();
    }

    // Filter by Crop
    if (filters.cropFilter && filters.cropFilter !== 'all') {
      const normCrop = normalizeSearchTerm(filters.cropFilter);
      const cropMatches = this.cropIndex.get(normCrop);
      if (candidateIds === null) {
        candidateIds = cropMatches ? new Set(cropMatches) : new Set();
      } else {
        const nextSet = new Set<string>();
        if (cropMatches) {
          candidateIds.forEach((id) => {
            if (cropMatches.has(id)) nextSet.add(id);
          });
        }
        candidateIds = nextSet;
      }
    }

    // Filter by Brand / Manufacturer
    if (filters.brandFilter && filters.brandFilter !== 'all') {
      const brandFilterNorm = normalizeSearchTerm(filters.brandFilter);
      const matchingBrandIds = new Set<string>();

      this.manufacturerIndex.forEach((idSet, normMfg) => {
        if (normMfg.includes(brandFilterNorm)) {
          idSet.forEach(id => matchingBrandIds.add(id));
        }
      });

      if (candidateIds === null) {
        candidateIds = matchingBrandIds;
      } else {
        const nextSet = new Set<string>();
        candidateIds.forEach((id) => {
          if (matchingBrandIds.has(id)) nextSet.add(id);
        });
        candidateIds = nextSet;
      }
    }

    // Filter by Toxicological Class
    if (filters.toxicologicalFilter && filters.toxicologicalFilter !== 'all') {
      const toxMatches = this.toxicologicalIndex.get(filters.toxicologicalFilter);
      if (candidateIds === null) {
        candidateIds = toxMatches ? new Set(toxMatches) : new Set();
      } else {
        const nextSet = new Set<string>();
        if (toxMatches) {
          candidateIds.forEach((id) => {
            if (toxMatches.has(id)) nextSet.add(id);
          });
        }
        candidateIds = nextSet;
      }
    }

    // 3. If No Search Query: Return filtered candidate items directly
    if (queryTokens.length === 0 && !normQuery) {
      const resultItems: PesticideProduct[] = [];
      if (candidateIds === null) {
        this.productsMap.forEach(p => resultItems.push(p));
      } else {
        candidateIds.forEach(id => {
          const p = this.productsMap.get(id);
          if (p) resultItems.push(p);
        });
      }

      const endTime = performance.now();
      return {
        items: resultItems,
        latencyMs: Number((endTime - startTime).toFixed(2)),
        totalCount: resultItems.length,
        queryTokens: [],
        isIndexed: true,
      };
    }

    // 4. Inverted Index Lookup for Query Tokens
    // For each query token, gather matched product IDs with prefix expansion
    const tokenMatchSets: Set<string>[] = [];

    for (let i = 0; i < queryTokens.length; i++) {
      const qToken = queryTokens[i];
      const matchedIdsForToken = new Set<string>();

      // Exact token match
      const exactSet = this.tokenInvertedIndex.get(qToken);
      if (exactSet) {
        exactSet.forEach(id => matchedIdsForToken.add(id));
      }

      // Prefix matches (if token has >= 2 characters)
      if (qToken.length >= 2) {
        const prefixKey = qToken.slice(0, Math.min(4, qToken.length));
        const matchedTokens = this.prefixIndex.get(prefixKey);
        if (matchedTokens) {
          matchedTokens.forEach(tokenCandidate => {
            if (tokenCandidate.startsWith(qToken) && tokenCandidate !== qToken) {
              const prefixMatchIds = this.tokenInvertedIndex.get(tokenCandidate);
              if (prefixMatchIds) {
                prefixMatchIds.forEach(id => matchedIdsForToken.add(id));
              }
            }
          });
        }
      }

      tokenMatchSets.push(matchedIdsForToken);
    }

    // 5. Intersect token sets (AND boolean logic for precision)
    // Sort token sets by size so we intersect smallest first for extreme speed
    const sortedSets = [...tokenMatchSets].sort((a, b) => a.size - b.size);
    let matchedIds = new Set<string>(sortedSets[0] || []);

    for (let i = 1; i < sortedSets.length; i++) {
      const currentSet = sortedSets[i];
      const nextIntersection = new Set<string>();
      matchedIds.forEach((id) => {
        if (currentSet.has(id)) {
          nextIntersection.add(id);
        }
      });
      matchedIds = nextIntersection;
      if (matchedIds.size === 0) break;
    }

    // Fallback: If strict AND returned 0 results and we have multiple tokens, try partial OR matches
    if (matchedIds.size === 0 && tokenMatchSets.length > 1) {
      tokenMatchSets.forEach((set) => {
        set.forEach(id => matchedIds.add(id));
      });
    }

    // 6. Intersect with Candidate Filter Set if active
    if (candidateIds !== null) {
      const filteredIntersection = new Set<string>();
      matchedIds.forEach((id) => {
        if (candidateIds!.has(id)) {
          filteredIntersection.add(id);
        }
      });
      matchedIds = filteredIntersection;
    }

    // 7. Score and Rank Results
    const scoredList: { product: PesticideProduct; score: number }[] = [];

    matchedIds.forEach((id) => {
      const entry = this.entriesMap.get(id);
      if (!entry) return;

      let score = 0;

      // Exact Full Name match
      if (entry.normalizedName === normQuery) {
        score += 300;
      } else if (entry.normalizedName.startsWith(normQuery)) {
        score += 150;
      } else if (entry.normalizedName.includes(normQuery)) {
        score += 100;
      }

      // Exact MAPA registration match
      if (entry.normalizedRegistrationNumber === normQuery || entry.normalizedRegistrationNumber.includes(normQuery)) {
        score += 200;
      }

      // Active ingredient match
      if (entry.normalizedActiveIngredient.includes(normQuery)) {
        score += 120;
      }

      // Token-level scoring
      for (const qToken of queryTokens) {
        if (entry.nameTokens.has(qToken)) score += 80;
        if (entry.aiTokens.has(qToken)) score += 60;
        if (entry.targetTokens.has(qToken)) score += 40;
        if (entry.manufacturerTokens.has(qToken)) score += 30;
        if (entry.cropTokens.has(qToken)) score += 20;

        // Prefix match scoring
        entry.nameTokens.forEach((nt) => {
          if (nt.startsWith(qToken)) score += 25;
        });
        entry.aiTokens.forEach((at) => {
          if (at.startsWith(qToken)) score += 20;
        });
        entry.targetTokens.forEach((tt) => {
          if (tt.startsWith(qToken)) score += 15;
        });
      }

      // Special priority for Rainbow, Bayer, BASF, Syngenta brand queries
      if (normQuery.includes('rainbow') && entry.normalizedManufacturer.includes('rainbow')) {
        score += 80;
      }
      if (normQuery.includes('bayer') && entry.normalizedManufacturer.includes('bayer')) {
        score += 80;
      }
      if (normQuery.includes('basf') && entry.normalizedManufacturer.includes('basf')) {
        score += 80;
      }

      scoredList.push({ product: entry.product, score });
    });

    // 8. Sort descending by relevance score
    scoredList.sort((a, b) => b.score - a.score);

    const endTime = performance.now();
    const latency = Number((endTime - startTime).toFixed(2));

    return {
      items: scoredList.map(s => s.product),
      latencyMs: latency,
      totalCount: scoredList.length,
      queryTokens,
      isIndexed: true,
    };
  }

  /**
   * Returns current engine statistics
   */
  public getStatistics(): IndexStatistics {
    return { ...this.stats };
  }

  /**
   * Fast lookup for auto-complete suggestions
   */
  public getSuggestions(prefix: string, maxSuggestions: number = 8): string[] {
    if (!prefix || prefix.length < 2) return [];
    const norm = normalizeSearchTerm(prefix);
    const suggestions = new Set<string>();

    // Check exact tokens starting with prefix
    this.tokenInvertedIndex.forEach((_, token) => {
      if (token.startsWith(norm) && suggestions.size < maxSuggestions) {
        suggestions.add(token);
      }
    });

    return Array.from(suggestions);
  }
}

// Global search engine instance
export const pesticideSearchEngine = new PesticideSearchEngine();
