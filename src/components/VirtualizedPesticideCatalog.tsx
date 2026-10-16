import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  LayoutGrid,
  List,
  Sparkles,
  Award,
  Building2,
  Calculator,
  FileText,
  Info,
  Trash2,
  ArrowUp,
  Zap,
  ShieldAlert,
  Search,
  CheckCircle2,
  Layers,
  Activity,
  Sprout,
  Leaf,
  Bug,
  Droplets,
  FlaskConical,
  ShieldCheck,
  Shield,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { PesticideProduct } from '../types/pesticideLeaflet';

interface VirtualizedPesticideCatalogProps {
  products: PesticideProduct[];
  searchTerm: string;
  onClearFilters: () => void;
  onSelectProductForCalc: (productId: string, cropName: string) => void;
  onSelectProductForReceituario: (productId: string, cropName: string) => void;
  onOpenDetailModal: (product: PesticideProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

const PAGE_SIZE = 36;

export const VirtualizedPesticideCatalog: React.FC<VirtualizedPesticideCatalogProps> = ({
  products,
  searchTerm,
  onClearFilters,
  onSelectProductForCalc,
  onSelectProductForReceituario,
  onOpenDetailModal,
  onDeleteProduct,
}) => {
  // View mode: 'grid' (cards) or 'table' (dense tabular list)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Progressive infinite scroll pagination state
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Sentinel ref for Intersection Observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when products array changes (filters applied, search query, etc.)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products, searchTerm]);

  // Handle window scroll for "Scroll to Top" button and backup scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 400);

      // Check if near bottom of window as fallback for intersection observer
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      if (scrollHeight - (scrollY + clientHeight) < 600) {
        setVisibleCount((prev) => {
          if (prev < products.length) {
            return Math.min(products.length, prev + PAGE_SIZE);
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  // Intersection Observer on bottom sentinel to load next batch automatically on scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < products.length) {
              return Math.min(products.length, prev + PAGE_SIZE);
            }
            return prev;
          });
        }
      },
      {
        root: null, // viewport
        rootMargin: '400px', // trigger 400px before reaching bottom for seamless infinite scroll
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [products.length, visibleCount]);

  // Alphabetical map for quick jump bar (A-Z)
  const alphabetJumps = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p, idx) => {
      const firstChar = p.productName.charAt(0).toUpperCase();
      if (/^[A-Z]$/.test(firstChar) && !map.has(firstChar)) {
        map.set(firstChar, idx);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  // Quick jump to letter: ensure items up to that index are loaded then scroll into view
  const handleJumpToLetter = useCallback(
    (index: number) => {
      if (index >= visibleCount) {
        setVisibleCount(Math.min(products.length, index + PAGE_SIZE));
      }
      setTimeout(() => {
        const targetProduct = products[index];
        if (targetProduct) {
          const el = document.getElementById(`product-card-${targetProduct.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 50);
    },
    [products, visibleCount]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(products.length, prev + PAGE_SIZE));
  }, [products.length]);

  const handleLoadAll = useCallback(() => {
    setVisibleCount(products.length);
  }, [products.length]);

  // Products currently sliced for display
  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  // If no products match
  if ((products || []).length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-2xs">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-black text-base text-slate-800 dark:text-slate-200">
          Nenhum defensivo agrícola encontrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Não encontramos produtos correspondentes aos filtros selecionados. Tente limpar os filtros de busca ou cadastre um novo produto.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Limpar Todos os Filtros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Telemetry & View Controls Bar */}
      <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        {/* Real-time Display Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Exibindo {displayedProducts.length} de {products.length} defensivos
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-500" /> Rolagem fluida contínua
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-0.5 flex items-center shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Visualização em Grade de Cards"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grade de Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Visualização em Lista / Tabela Compacta"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela Compacta</span>
            </button>
          </div>
        </div>
      </div>

      {/* A-Z Quick Jump Alphabet Ribbon */}
      {alphabetJumps.length > 3 && (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-500" /> Salto A-Z:
          </span>
          {alphabetJumps.map(([letter, index]) => (
            <button
              key={letter}
              type="button"
              onClick={() => handleJumpToLetter(index)}
              title={`Rolar até "${letter}" (${products[index]?.productName})`}
              className="w-6 h-6 rounded-lg text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all shrink-0 flex items-center justify-center cursor-pointer active:scale-90"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Main Catalog View Container (Smooth Natural Flow) */}
      <div className="w-full">
        {viewMode === 'grid' ? (
          /* Grid Mode: Responsive Multi-Column Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedProducts.map((p) => {
              const isFungicide = p.agrochemicalClass === 'Fungicida';
              const isInsecticide = p.agrochemicalClass === 'Inseticida';
              const isHerbicide = p.agrochemicalClass === 'Herbicida';
              const isBiological = p.agrochemicalClass === 'Biológico';
              const isNematicide = p.agrochemicalClass === 'Nematicida';
              const isSeedTreatment = p.agrochemicalClass === 'Tratamento de Sementes';
              const isPhysio = p.agrochemicalClass === 'Fisioativador';

              const mLower = p.manufacturer.toLowerCase();
              const pLower = p.productName.toLowerCase();
              const isIhara = mLower.includes('ihara') || pLower.includes('ihara');
              const isTecnomyl = mLower.includes('tecnomyl') || pLower.includes('tecnomyl');
              const isCropchem = mLower.includes('cropchem') || pLower.includes('cropchem');
              const isAdama = mLower.includes('adama') || pLower.includes('adama');
              const isAgrobiologica = mLower.includes('agrobiológica') || mLower.includes('agrobiologica');
              const isFMC = mLower.includes('fmc') || pLower.includes('fmc');
              const isPilarquim = mLower.includes('pilarquim');
              const isCCAB = mLower.includes('ccab');
              const isVittia = mLower.includes('vittia');
              const isRainbow = mLower.includes('rainbow') || pLower.includes('rainbow');
              const isBayer = mLower.includes('bayer');
              const isBasf = mLower.includes('basf');

              let badgeBg =
                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
              let ClassIcon = Droplets;
              if (isFungicide) {
                badgeBg = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
                ClassIcon = Shield;
              } else if (isInsecticide) {
                badgeBg = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
                ClassIcon = Bug;
              } else if (isHerbicide) {
                badgeBg = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
                ClassIcon = Droplets;
              } else if (isBiological) {
                badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
                ClassIcon = Leaf;
              } else if (isNematicide) {
                badgeBg = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
                ClassIcon = ShieldAlert;
              } else if (isSeedTreatment) {
                badgeBg = 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
                ClassIcon = Sprout;
              } else if (isPhysio) {
                badgeBg = 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800';
                ClassIcon = Activity;
              }

              return (
                <div
                  id={`product-card-${p.id}`}
                  key={p.id}
                  className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    {/* Top Bar Card */}
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${badgeBg}`}
                        >
                          <ClassIcon className="w-2.5 h-2.5 shrink-0" />
                          {p.agrochemicalClass}
                        </span>
                        {isIhara && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            IHARA
                          </span>
                        )}
                        {isTecnomyl && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            <Building2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            TECNOMYL
                          </span>
                        )}
                        {isCropchem && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            <Award className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                            CROPCHEM
                          </span>
                        )}
                        {isAdama && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            <Sparkles className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                            ADAMA
                          </span>
                        )}
                        {isAgrobiologica && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
                            <Leaf className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                            AGROBIOLÓGICA
                          </span>
                        )}
                        {isFMC && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-100 text-red-900 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                            <Award className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
                            FMC
                          </span>
                        )}
                        {isPilarquim && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                            <ShieldCheck className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                            PILARQUIM BR
                          </span>
                        )}
                        {isCCAB && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                            <CheckCircle2 className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                            CCAB AGRO
                          </span>
                        )}
                        {isVittia && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                            <Sprout className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            VITTIA
                          </span>
                        )}
                        {isRainbow && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            RAINBOW
                          </span>
                        )}
                        {isBayer && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            <Award className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            BAYER
                          </span>
                        )}
                        {isBasf && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                            <Sparkles className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                            BASF
                          </span>
                        )}
                        {p.isCustom && (
                          <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            Personalizado
                          </span>
                        )}
                      </div>

                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md shrink-0"
                        title="Registro Oficial no Ministério da Agricultura (MAPA)"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        MAPA #{p.registrationNumber}
                      </span>
                    </div>

                    {/* Product Name & Manufacturer */}
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {p.productName}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{p.manufacturer}</span>
                    </p>

                    {/* Active Ingredient */}
                    <div className="mt-2.5 p-2 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                        <FlaskConical className="w-2.5 h-2.5 text-slate-400" />
                        Ingrediente Ativo:
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {p.activeIngredient}
                      </p>
                    </div>

                    {/* Indications Preview Pills */}
                    <div className="mt-2.5 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Sprout className="w-2.5 h-2.5 text-emerald-500" />
                        Culturas & Dosagens Calibradas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(p.indications || []).slice(0, 3).map((i) => (
                          <span
                            key={i.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200/50 dark:border-emerald-800/50"
                          >
                            <Sprout className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{i.cropName}:</span>
                            <strong>
                              {i.recommendedDosage} {i.dosageUnit}
                            </strong>
                          </span>
                        ))}
                        {(p.indications?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold text-[10px] border border-slate-200 dark:border-zinc-700/80">
                            +{(p.indications?.length || 0) - 3} culturas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectProductForCalc(p.id, p.indications[0]?.cropName || 'Soja')
                        }
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        Calcular
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectProductForReceituario(p.id, p.indications[0]?.cropName || '')
                        }
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receituário
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDetailModal(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                        title="Ver Ficha Técnica Completa"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Excluir Defensivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / Compact Mode */
          <div className="space-y-2">
            {displayedProducts.map((p) => {
              const isFungicide = p.agrochemicalClass === 'Fungicida';
              const isInsecticide = p.agrochemicalClass === 'Inseticida';
              const isHerbicide = p.agrochemicalClass === 'Herbicida';
              const isBiological = p.agrochemicalClass === 'Biológico';

              let badgeBg = 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
              let ClassIcon = Droplets;
              if (isFungicide) {
                badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                ClassIcon = Shield;
              } else if (isInsecticide) {
                badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                ClassIcon = Bug;
              } else if (isHerbicide) {
                badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                ClassIcon = Droplets;
              } else if (isBiological) {
                badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                ClassIcon = Leaf;
              }

              return (
                <div
                  id={`product-card-${p.id}`}
                  key={p.id}
                  className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/60 transition-all"
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full md:w-auto">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase shrink-0 ${badgeBg}`}
                    >
                      <ClassIcon className="w-2.5 h-2.5 shrink-0" />
                      {p.agrochemicalClass}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {p.productName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold shrink-0">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          MAPA #{p.registrationNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate flex items-center gap-1">
                          <FlaskConical className="w-2.5 h-2.5 text-slate-400" />
                          <strong>i.a.:</strong> {p.activeIngredient}
                        </span>
                        <span>•</span>
                        <span className="truncate flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5 text-slate-400" />
                          {p.manufacturer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dosage summary */}
                  <div className="hidden lg:flex items-center gap-1.5 shrink-0 max-w-xs">
                    {(p.indications || []).slice(0, 2).map((ind) => (
                      <span
                        key={ind.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-md border border-emerald-200 dark:border-emerald-800"
                      >
                        <Sprout className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {ind.cropName}: {ind.recommendedDosage} {ind.dosageUnit}
                      </span>
                    ))}
                    {(p.indications?.length || 0) > 2 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{(p.indications?.length || 0) - 2}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectProductForCalc(p.id, p.indications?.[0]?.cropName || 'Soja')
                      }
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Calcular Calda"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Calcular</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectProductForReceituario(p.id, p.indications[0]?.cropName || '')
                      }
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Gerar Receituário"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receituário</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(p)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                      title="Ver Ficha Técnica"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                      title="Excluir Defensivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sentinel element for infinite scroll automatic triggering */}
      <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-2">
        {visibleCount < products.length ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full py-4 bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ChevronDown className="w-4 h-4 text-emerald-500 animate-bounce" />
              Exibindo {displayedProducts.length} de {products.length} produtos
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>Carregar mais (+{PAGE_SIZE})</span>
              </button>
              <button
                type="button"
                onClick={handleLoadAll}
                className="px-3 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>Carregar Todos ({products.length})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-bold text-slate-400 dark:text-zinc-600 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Todos os {products.length} defensivos foram carregados</span>
          </div>
        )}
      </div>

      {/* Floating "Scroll to Top" button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          title="Voltar ao Topo do Catálogo"
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 font-black text-xs ring-4 ring-emerald-500/20"
        >
          <ArrowUp className="w-5 h-5" />
          <span className="hidden sm:inline">Topo</span>
        </button>
      )}
    </div>
  );
};
