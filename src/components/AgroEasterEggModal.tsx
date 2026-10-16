import React, { useState, useEffect, useMemo } from 'react';
import {
  Sprout,
  Shuffle,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote,
  Search,
  Tractor,
  Layers,
} from 'lucide-react';
import { AGRO_QUOTES, AgroQuote } from '../data/agroQuotesData';

export const AgroEasterEggModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'all'>('card');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedQuotes, setLikedQuotes] = useState<number[]>([]);

  // Listen to custom window events
  useEffect(() => {
    const handleOpen = () => {
      // Pick random quote on open
      const randomIndex = Math.floor(Math.random() * AGRO_QUOTES.length);
      setCurrentIndex(randomIndex);
      setViewMode('card');
      setIsOpen(true);
    };

    window.addEventListener('geaagro:open-agro-easter-egg', handleOpen);

    return () => {
      window.removeEventListener('geaagro:open-agro-easter-egg', handleOpen);
    };
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentQuote = AGRO_QUOTES[currentIndex] || AGRO_QUOTES[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % AGRO_QUOTES.length);
    setCopied(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + AGRO_QUOTES.length) % AGRO_QUOTES.length);
    setCopied(false);
  };

  const handleRandomize = () => {
    let nextIndex = Math.floor(Math.random() * AGRO_QUOTES.length);
    if (nextIndex === currentIndex && AGRO_QUOTES.length > 1) {
      nextIndex = (currentIndex + 1) % AGRO_QUOTES.length;
    }
    setCurrentIndex(nextIndex);
    setCopied(false);
  };

  const handleCopyQuote = (quoteObj: AgroQuote = currentQuote) => {
    const textToCopy = `"${quoteObj.quote}"\n— ${quoteObj.author} (${quoteObj.tag})\n\n🌱 GeaAgro CRM - Inteligência Agronômica`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const toggleLike = (id: number) => {
    setLikedQuotes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(AGRO_QUOTES.map((q) => q.category));
    return ['Todas', ...Array.from(set)];
  }, []);

  // Filtered quotes for the "all" list view
  const filteredQuotes = useMemo(() => {
    return AGRO_QUOTES.filter((q) => {
      const matchCat = selectedCategory === 'Todas' || q.category === selectedCategory;
      const matchSearch =
        searchTerm === '' ||
        q.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tag.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <>
      {/* Main Agro Quotes Modal */}
      {isOpen && (
        <div
          id="agro-easter-egg-modal-overlay"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            id="agro-easter-egg-modal-container"
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-zinc-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Animated Gradient Banner */}
            <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-5 sm:p-6 text-white overflow-hidden shrink-0">
              {/* Background ambient symbols */}
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-white/10 pointer-events-none select-none">
                <Tractor className="w-40 h-40" />
              </div>
              <div className="absolute -left-6 -bottom-6 text-white/10 pointer-events-none select-none">
                <Sprout className="w-32 h-32" />
              </div>

              {/* Close Button */}
              <button
                type="button"
                id="close-agro-easter-egg-modal"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 font-black">
                    <Tractor className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        Sabedoria Agronômica
                      </span>
                      <span className="text-xs text-emerald-200 font-semibold">
                        GeaAgro Brasil
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                      20 Frases do Agro
                    </h2>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle: Card vs All */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/15">
                <p className="text-xs text-emerald-100/90 hidden sm:block">
                  Homenagem ao campo brasileiro, à ciência agronômica e a quem alimenta o mundo.
                </p>
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'card'
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5" /> Frase em Destaque
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Ver Todas (20)
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {viewMode === 'card' ? (
                /* Card View Mode */
                <div className="space-y-6">
                  {/* Main Quote Card */}
                  <div className="relative bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-zinc-800/80 dark:via-zinc-800/40 dark:to-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-zinc-700 shadow-sm transition-all">
                    {/* Top Tag & ID */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {currentQuote.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                          {currentQuote.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400">
                        <span>Frase</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                          {currentQuote.id}
                        </span>
                        <span>/ 20</span>
                      </div>
                    </div>

                    {/* Big Decorative Quotation Mark */}
                    <div className="text-emerald-500/20 dark:text-emerald-400/10 absolute left-4 top-16 pointer-events-none select-none">
                      <Quote className="w-20 h-20 sm:w-24 sm:h-24" />
                    </div>

                    {/* The Quote Text */}
                    <div className="relative z-10 my-4">
                      <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 leading-relaxed tracking-tight italic">
                        "{currentQuote.quote}"
                      </p>
                    </div>

                    {/* Author & Agronomic Context */}
                    <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-zinc-700/80 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <Sprout className="w-4 h-4 text-emerald-600" />
                          <span>{currentQuote.author}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {currentQuote.context}
                        </p>
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={() => toggleLike(currentQuote.id)}
                        className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0 ${
                          likedQuotes.includes(currentQuote.id)
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-600'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-rose-600'
                        }`}
                        title="Favoritar Frase"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedQuotes.includes(currentQuote.id) ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                        <span className="hidden sm:inline">
                          {likedQuotes.includes(currentQuote.id) ? 'Favorita' : 'Curtir'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar: Randomize, Copy, Prev/Next */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition flex items-center justify-center cursor-pointer"
                        title="Frase Anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition flex items-center justify-center cursor-pointer"
                        title="Próxima Frase"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        id="agro-easter-egg-random-button"
                        onClick={handleRandomize}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                      >
                        <Shuffle className="w-4 h-4" /> Sortear Outra Frase
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyQuote()}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copiar Frase
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Quotes List View Mode */
                <div className="space-y-4">
                  {/* Search and Category Filter */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar frases, autores ou temas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quotes Cards Grid */}
                  <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredQuotes.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.id === currentQuote.id
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-750 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                #{item.id} {item.category}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 italic">
                              "{item.quote}"
                            </p>
                            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold mt-1">
                              — {item.author}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {item.context}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentIndex(item.id - 1);
                                setViewMode('card');
                              }}
                              className="p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-100 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                              title="Destacar no Card"
                            >
                              <Quote className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyQuote(item)}
                              className="p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-100 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                              title="Copiar Frase"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredQuotes.length === 0 && (
                      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
                        <p className="text-sm font-bold">Nenhuma frase encontrada para a busca.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
