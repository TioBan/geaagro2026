import { useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
import { PesticideProduct } from '../types/pesticideLeaflet';
import { INITIAL_PESTICIDES_CATALOG } from '../data/pesticidesData';
import {
  pesticideIndexedDB,
  StorageDiagnostics,
} from '../services/pesticideIndexedDB';
import {
  pesticideSearchEngine,
  SearchFilters,
  SearchResult,
  IndexStatistics,
} from '../services/pesticideSearchIndex';
import {
  deduplicatePesticideCatalog,
  analyzePesticideDuplicates,
  DuplicateReport,
} from '../utils/pesticideDeduplication';

export interface UsePesticideSearchReturn {
  products: PesticideProduct[];
  setProducts: Dispatch<SetStateAction<PesticideProduct[]>>;
  filteredProducts: PesticideProduct[];
  searchResult: SearchResult;
  isDbReady: boolean;
  isIndexing: boolean;
  indexStats: IndexStatistics;
  storageDiagnostics: StorageDiagnostics | null;
  duplicateReport: DuplicateReport;
  rebuildIndex: () => number;
  resetToDefaultCatalog: () => Promise<void>;
  deleteProductById: (productId: string) => Promise<void>;
  upsertProduct: (product: PesticideProduct) => Promise<void>;
  runDeduplication: () => number;
  refreshDiagnostics: () => Promise<void>;
}

export function usePesticideSearch(
  searchTerm: string,
  filters: SearchFilters
): UsePesticideSearchReturn {
  const [products, setProductsState] = useState<PesticideProduct[]>(() => INITIAL_PESTICIDES_CATALOG);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexStats, setIndexStats] = useState<IndexStatistics>(() => pesticideSearchEngine.getStatistics());
  const [storageDiagnostics, setStorageDiagnostics] = useState<StorageDiagnostics | null>(null);

  // 1. Initial hydration from IndexedDB on component mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsIndexing(true);
        // Initialize or load from IndexedDB
        const loadedProducts = await pesticideIndexedDB.initialize(INITIAL_PESTICIDES_CATALOG);
        
        if (isMounted) {
          setProductsState(loadedProducts);
          // Build Inverted Index
          const stats = pesticideSearchEngine.buildIndex(loadedProducts);
          setIndexStats(stats);
          setIsDbReady(true);
          setIsIndexing(false);

          // Retrieve diagnostics
          const diag = await pesticideIndexedDB.getDiagnostics();
          if (isMounted) {
            setStorageDiagnostics(diag);
          }
        }
      } catch (err) {
        console.warn('[usePesticideSearch] Initialization error:', err);
        if (isMounted) {
          // Fallback to initial static catalog
          setProductsState(INITIAL_PESTICIDES_CATALOG);
          const stats = pesticideSearchEngine.buildIndex(INITIAL_PESTICIDES_CATALOG);
          setIndexStats(stats);
          setIsDbReady(true);
          setIsIndexing(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Custom setProducts wrapper to keep IndexedDB and Inverted Index in sync
  const setProducts: Dispatch<SetStateAction<PesticideProduct[]>> = useCallback(
    (action: SetStateAction<PesticideProduct[]>) => {
      setProductsState((prev: PesticideProduct[]) => {
        const next = typeof action === 'function' ? action(prev) : action;
        // Asynchronously persist to IndexedDB and rebuild index
        setTimeout(async () => {
          await pesticideIndexedDB.saveAllProducts(next);
          const stats = pesticideSearchEngine.buildIndex(next);
          setIndexStats(stats);
          const diag = await pesticideIndexedDB.getDiagnostics();
          setStorageDiagnostics(diag);
        }, 10);
        return next;
      });
    },
    []
  );

  // 3. Instant Search execution with sub-millisecond Inverted Index
  const searchResult = useMemo<SearchResult>(() => {
    return pesticideSearchEngine.search(searchTerm, filters);
  }, [searchTerm, filters.classFilter, filters.cropFilter, filters.brandFilter, filters.toxicologicalFilter, indexStats.lastIndexedAt]);

  const filteredProducts = searchResult.items;

  // 4. Duplicate Report memoized
  const duplicateReport = useMemo<DuplicateReport>(() => {
    return analyzePesticideDuplicates(products);
  }, [products]);

  // 5. Force Rebuild Index
  const rebuildIndex = useCallback((): number => {
    setIsIndexing(true);
    const stats = pesticideSearchEngine.buildIndex(products);
    setIndexStats(stats);
    setIsIndexing(false);
    return stats.indexBuildTimeMs;
  }, [products]);

  // 6. Reset to default 1,800 official catalog
  const resetToDefaultCatalog = useCallback(async () => {
    setIsIndexing(true);
    const defaultData = await pesticideIndexedDB.resetToDefault(INITIAL_PESTICIDES_CATALOG);
    setProductsState(defaultData);
    const stats = pesticideSearchEngine.buildIndex(defaultData);
    setIndexStats(stats);
    const diag = await pesticideIndexedDB.getDiagnostics();
    setStorageDiagnostics(diag);
    setIsIndexing(false);
  }, []);

  // 7. Delete Product by ID
  const deleteProductById = useCallback(
    async (productId: string) => {
      const nextList = products.filter((p: PesticideProduct) => p.id !== productId);
      setProductsState(nextList);
      await pesticideIndexedDB.deleteProduct(productId);
      const stats = pesticideSearchEngine.buildIndex(nextList);
      setIndexStats(stats);
      const diag = await pesticideIndexedDB.getDiagnostics();
      setStorageDiagnostics(diag);
    },
    [products]
  );

  // 8. Upsert single product
  const upsertProduct = useCallback(
    async (product: PesticideProduct) => {
      const existingIdx = products.findIndex((p: PesticideProduct) => p.id === product.id);
      let nextList: PesticideProduct[];
      if (existingIdx >= 0) {
        nextList = [...products];
        nextList[existingIdx] = product;
      } else {
        nextList = [product, ...products];
      }
      setProductsState(nextList);
      await pesticideIndexedDB.saveProduct(product);
      const stats = pesticideSearchEngine.buildIndex(nextList);
      setIndexStats(stats);
      const diag = await pesticideIndexedDB.getDiagnostics();
      setStorageDiagnostics(diag);
    },
    [products]
  );

  // 9. Run automated deduplication
  const runDeduplication = useCallback(() => {
    const cleanList = deduplicatePesticideCatalog(products);
    const removedCount = products.length - cleanList.length;
    if (removedCount > 0) {
      setProducts(cleanList);
    }
    return removedCount;
  }, [products, setProducts]);

  // 10. Refresh Diagnostics
  const refreshDiagnostics = useCallback(async () => {
    const diag = await pesticideIndexedDB.getDiagnostics();
    setStorageDiagnostics(diag);
  }, []);

  return {
    products,
    setProducts,
    filteredProducts,
    searchResult,
    isDbReady,
    isIndexing,
    indexStats,
    storageDiagnostics,
    duplicateReport,
    rebuildIndex,
    resetToDefaultCatalog,
    deleteProductById,
    upsertProduct,
    runDeduplication,
    refreshDiagnostics,
  };
}
