import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  LayoutGrid,
  List,
  Calculator,
  FileText,
  Info,
  Trash2,
  ArrowUp,
  Search,
  RotateCcw,
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

const CLASS_TEXT_COLORS: Record<string, string> = {
  Fungicida: 'text-blue-700 dark:text-blue-400',
  Inseticida: 'text-amber-700 dark:text-amber-400',
  Herbicida: 'text-rose-700 dark:text-rose-400',
  Acaricida: 'text-orange-700 dark:text-orange-400',
  Nematicida: 'text-violet-700 dark:text-violet-400',
  'Tratamento de Sementes': 'text-teal-700 dark:text-teal-400',
  Biológico: 'text-emerald-700 dark:text-emerald-400',
  Fisioativador: 'text-sky-700 dark:text-sky-400',
  Adjuvante: 'text-slate-600 dark:text-zinc-400',
};

export const VirtualizedPesticideCatalog: React.FC<VirtualizedPesticideCatalogProps> = React.memo(({
  products,
  searchTerm,
  onClearFilters,
  onSelectProductForCalc,
  onSelectProductForReceituario,
  onOpenDetailModal,
  onDeleteProduct,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products, searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 480);

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      if (scrollHeight - (scrollY + clientHeight) < 600) {
        setVisibleCount((prev) =>
          prev < products.length ? Math.min(products.length, prev + PAGE_SIZE) : prev
        );
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            prev < products.length ? Math.min(products.length, prev + PAGE_SIZE) : prev
          );
        }
      },
      { root: null, rootMargin: '400px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [products.length, visibleCount]);

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

  const displayedProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  if ((products || []).length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
        <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum defensivo encontrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Nenhum produto corresponde aos filtros selecionados. Limpe os critérios para visualizar o catálogo completo.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={onClearFilters}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Barra de Controle e Salto Alfabético */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 tabular-nums">
            <span>
              Exibindo{' '}
              <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                {displayedProducts.length.toLocaleString('pt-BR')}
              </strong>{' '}
              de{' '}
              <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                {products.length.toLocaleString('pt-BR')}
              </strong>{' '}
              defensivos
            </span>
          </div>

          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>
        </div>

        {alphabetJumps.length > 3 && (
          <div className="px-3.5 py-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-0.5 overflow-x-auto">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mr-1.5 shrink-0">
              Índice A–Z:
            </span>
            {alphabetJumps.map(([letter, index]) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleJumpToLetter(index)}
                title={`Ir para "${letter}" (${products[index]?.productName})`}
                className="w-6 h-6 rounded-md text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0 inline-flex items-center justify-center cursor-pointer"
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista ou Grade de Defensivos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {displayedProducts.map((p) => {
            const classColor =
              CLASS_TEXT_COLORS[p.agrochemicalClass] || 'text-slate-600 dark:text-zinc-400';

            return (
              <article
                id={`product-card-${p.id}`}
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="space-y-2.5">
                  {/* Metadados limpos sem cápsulas */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className={`font-semibold ${classColor}`}>
                        {p.agrochemicalClass}
                      </span>
                      {p.isCustom && (
                        <>
                          <span className="text-slate-300 dark:text-zinc-600" aria-hidden="true">·</span>
                          <span className="text-violet-600 dark:text-violet-400 font-medium">
                            Personalizado
                          </span>
                        </>
                      )}
                    </div>
                    <span
                      className="font-mono text-slate-400 dark:text-zinc-500 tabular-nums shrink-0"
                      title="Registro Oficial MAPA"
                    >
                      MAPA {p.registrationNumber}
                    </span>
                  </div>

                  {/* Título e Fabricante */}
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(p)}
                      className="text-left text-sm font-semibold text-slate-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {p.productName}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {p.manufacturer}
                    </p>
                  </div>

                  {/* Especificações essenciais */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5 text-xs">
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                        Ingrediente ativo
                      </span>
                      <span className="text-slate-700 dark:text-zinc-300 font-medium line-clamp-1">
                        {p.activeIngredient}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                        Culturas e dosagens
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed tabular-nums line-clamp-2">
                        {(p.indications || []).slice(0, 3).map((ind, idx) => (
                          <React.Fragment key={ind.id}>
                            {idx > 0 && (
                              <span className="text-slate-300 dark:text-zinc-600 mx-1" aria-hidden="true">
                                ·
                              </span>
                            )}
                            <span>{ind.cropName}</span>{' '}
                            <strong className="font-semibold text-slate-800 dark:text-zinc-100">
                              {ind.recommendedDosage} {ind.dosageUnit}
                            </strong>
                          </React.Fragment>
                        ))}
                        {(p.indications?.length || 0) > 3 && (
                          <span className="text-slate-400 dark:text-zinc-500 ml-1">
                            (+{(p.indications?.length || 0) - 3})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ações proporcionais */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectProductForCalc(p.id, p.indications[0]?.cropName || 'Soja')
                      }
                      className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 shrink-0" />
                      <span>Calcular</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectProductForReceituario(p.id, p.indications[0]?.cropName || '')
                      }
                      className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Receituário</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(p)}
                      className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors cursor-pointer"
                      title="Ver ficha técnica"
                      aria-label={`Ver ficha técnica de ${p.productName}`}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(p.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center justify-center transition-colors cursor-pointer"
                      title="Excluir defensivo"
                      aria-label={`Excluir ${p.productName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3.5">Produto &amp; Fabricante</th>
                  <th className="py-2.5 px-3.5">Classe</th>
                  <th className="py-2.5 px-3.5">Ingrediente ativo</th>
                  <th className="py-2.5 px-3.5 hidden lg:table-cell">Principais doses</th>
                  <th className="py-2.5 px-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {displayedProducts.map((p) => {
                  const classColor =
                    CLASS_TEXT_COLORS[p.agrochemicalClass] || 'text-slate-600 dark:text-zinc-400';

                  return (
                    <tr
                      id={`product-card-${p.id}`}
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 max-w-[240px]">
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(p)}
                          className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate block text-left max-w-full cursor-pointer"
                        >
                          {p.productName}
                        </button>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 tabular-nums">
                          {p.manufacturer} · MAPA {p.registrationNumber}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className={`text-xs font-medium ${classColor}`}>
                          {p.agrochemicalClass}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 max-w-[220px]">
                        <span
                          className="text-slate-700 dark:text-zinc-300 truncate block"
                          title={p.activeIngredient}
                        >
                          {p.activeIngredient}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 hidden lg:table-cell max-w-[260px] text-[11px] text-slate-600 dark:text-zinc-300 tabular-nums">
                        <span className="truncate block">
                          {(p.indications || [])
                            .slice(0, 2)
                            .map((ind) => `${ind.cropName} ${ind.recommendedDosage} ${ind.dosageUnit}`)
                            .join(' · ')}
                          {(p.indications?.length || 0) > 2 && ` (+${(p.indications?.length || 0) - 2})`}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onSelectProductForCalc(p.id, p.indications?.[0]?.cropName || 'Soja')
                            }
                            className="h-7 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Calcular dosagem"
                          >
                            <Calculator className="w-3 h-3" />
                            <span className="hidden sm:inline">Calcular</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onSelectProductForReceituario(p.id, p.indications[0]?.cropName || '')
                            }
                            className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Emitir receituário"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="hidden sm:inline">Receita</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(p)}
                            className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Ver ficha técnica"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="w-7 h-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Excluir defensivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rodapé de Paginação Progressiva */}
      <div ref={sentinelRef} className="pt-1">
        {visibleCount < products.length ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
              Mostrando {displayedProducts.length.toLocaleString('pt-BR')} de{' '}
              {products.length.toLocaleString('pt-BR')} defensivos
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadMore}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Carregar mais (+{PAGE_SIZE})
              </button>
              <button
                type="button"
                onClick={handleLoadAll}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Exibir todos
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center py-2 text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
            Todos os {products.length.toLocaleString('pt-BR')} defensivos exibidos
          </p>
        )}
      </div>

      {/* Botão discreto para voltar ao topo */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          title="Voltar ao topo"
          className="fixed bottom-5 right-5 z-40 h-8 px-3 rounded-lg bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white border border-slate-700 dark:border-zinc-700 shadow-sm text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Topo</span>
        </button>
      )}
    </div>
  );
});
