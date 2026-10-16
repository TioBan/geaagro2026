import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Share2,
  HelpCircle,
  Zap,
  ShieldAlert,
  Thermometer,
  Snowflake,
  Wind,
  Droplets,
  Gauge,
  Sun,
  CloudRain,
  Sparkles,
  BarChart2,
  CloudSun,
  ArrowRight,
  Check,
  Layers,
  FileText,
  Lightbulb,
} from 'lucide-react';
import {
  CLIMATOLOGY_LIBRARY_TOPICS,
  ClimatologyTopic,
} from '../data/climatologyLibraryData';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Snowflake: Snowflake,
  Wind: Wind,
  Droplets: Droplets,
  Gauge: Gauge,
  Sun: Sun,
  CloudRain: CloudRain,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  Thermometer: Thermometer,
  BarChart2: BarChart2,
  CloudSun: CloudSun,
};

export const ClimatologyLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeStudyTab, setActiveStudyTab] = useState<'conceito' | 'fisiologia' | 'formulas' | 'manejo' | 'checklist' | 'faq'>('conceito');
  const [studiedTopics, setStudiedTopics] = useState<Record<string, boolean>>({});
  const [favoriteTopics, setFavoriteTopics] = useState<Record<string, boolean>>({});
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const cats = new Set(CLIMATOLOGY_LIBRARY_TOPICS.map(t => t.category));
    return ['Todas', ...Array.from(cats)];
  }, []);

  const filteredTopics = useMemo(() => {
    return CLIMATOLOGY_LIBRARY_TOPICS.filter(topic => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        topic.title.toLowerCase().includes(term) ||
        topic.shortDesc.toLowerCase().includes(term) ||
        topic.tags.some(tag => tag.toLowerCase().includes(term)) ||
        topic.technicalConcept.toLowerCase().includes(term);

      const matchesCat = selectedCategory === 'Todas' || topic.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const currentExpandedTopic = useMemo(() => {
    return CLIMATOLOGY_LIBRARY_TOPICS.find(t => t.id === expandedTopicId) || null;
  }, [expandedTopicId]);

  const toggleStudied = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStudiedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheckitem = (key: string) => {
    setCompletedChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const studiedCount = useMemo(() => {
    return Object.values(studiedTopics).filter(Boolean).length;
  }, [studiedTopics]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-sky-800/40 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-sky-400" />
                Biblioteca Técnica Agrometeorológica
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                {studiedCount} de {CLIMATOLOGY_LIBRARY_TOPICS.length} Tópicos Estudados
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Guias Acadêmicos & Manuais de Campo para Climatologia
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore tópicos aprofundados sobre microclima, balanço hídrico, janela de pulverização e fisiologia do estresse térmico. Clique nos cards para expandir todo o conteúdo didático e checklists de campo.
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center shrink-0 min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Progresso do Conhecimento</span>
            <div className="text-2xl font-black text-sky-300 my-1">
              {Math.round((studiedCount / CLIMATOLOGY_LIBRARY_TOPICS.length) * 100)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(studiedCount / CLIMATOLOGY_LIBRARY_TOPICS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título, palavra-chave, DPV, geada, derivas, ET₀..."
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium shrink-0">
            Exibindo <strong className="text-slate-900 dark:text-white font-bold">{filteredTopics.length}</strong> guias
          </span>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-sky-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map(topic => {
          const IconComponent = ICON_MAP[topic.iconName] || BookOpen;
          const isStudied = !!studiedTopics[topic.id];
          const isFav = !!favoriteTopics[topic.id];

          return (
            <div
              key={topic.id}
              onClick={() => setExpandedTopicId(topic.id)}
              className={`bg-white dark:bg-black border rounded-xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isStudied
                  ? 'border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-sky-500/50'
              }`}
            >
              <div className="space-y-3">
                {/* Badge & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                    {topic.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={e => toggleFavorite(topic.id, e)}
                      title={isFav ? 'Remover favorito' : 'Marcar favorito'}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${
                        isFav ? 'text-amber-500' : 'text-slate-300 dark:text-zinc-600'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={e => toggleStudied(topic.id, e)}
                      title={isStudied ? 'Marcar como não lido' : 'Marcar como estudado'}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${
                        isStudied ? 'text-emerald-500' : 'text-slate-300 dark:text-zinc-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                      {topic.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {topic.readTime}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                  {topic.shortDesc}
                </p>

                {/* Bullet Points Highlights */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                  {topic.summaryBulletPoints.slice(0, 2).map((bp, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                      <span className="line-clamp-1">{bp}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {topic.tags.map(t => (
                    <span
                      key={t}
                      className="text-[9px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Expandir para Estudo & Compreensão
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                {isStudied && (
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Estudado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPANDED STUDY DRAWER / MODAL */}
      {currentExpandedTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative border-b border-slate-800 shrink-0">
              <button
                onClick={() => setExpandedTopicId(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {currentExpandedTopic.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {currentExpandedTopic.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {currentExpandedTopic.title}
                  </h3>
                </div>

                {/* Mark Studied / Favorite inside Modal Header */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFavorite(currentExpandedTopic.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      favoriteTopics[currentExpandedTopic.id]
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                    {favoriteTopics[currentExpandedTopic.id] ? 'Favoritado' : 'Favoritar'}
                  </button>

                  <button
                    onClick={() => toggleStudied(currentExpandedTopic.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      studiedTopics[currentExpandedTopic.id]
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 border-sky-600 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {studiedTopics[currentExpandedTopic.id] ? 'Concluído' : 'Marcar como Lido'}
                  </button>
                </div>
              </div>
            </div>

            {/* Study Navigation Tabs */}
            <div className="bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-2 flex overflow-x-auto gap-1 shrink-0">
              {[
                { id: 'conceito', label: '1. Conceito Técnico', icon: FileText },
                { id: 'fisiologia', label: '2. Fisiologia & Dano', icon: Zap },
                { id: 'formulas', label: '3. Fórmulas & Limiares', icon: Gauge },
                { id: 'manejo', label: '4. Diretrizes de Manejo', icon: Lightbulb },
                { id: 'checklist', label: '5. Checklist de Campo', icon: CheckCircle2 },
                { id: 'faq', label: '6. Estudo de Caso / Q&A', icon: HelpCircle },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeStudyTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStudyTab(tab.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-black text-sky-600 dark:text-sky-400 shadow-2xs border border-slate-200 dark:border-zinc-800'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Study Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-zinc-200">
              {/* TAB 1: CONCEITO TÉCNICO */}
              {activeStudyTab === 'conceito' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 p-4 rounded-xl space-y-2">
                    <h4 className="font-black text-sm text-sky-900 dark:text-sky-200 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-sky-600" />
                      Resumo Executivo para Estudo Rápido:
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {currentExpandedTopic.summaryBulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sky-950 dark:text-sky-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white border-b pb-2">
                      Detalhamento Técnico e Fundamentação Científica
                    </h4>
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-zinc-300">
                      {currentExpandedTopic.technicalConcept}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FISIOLOGIA E DANO */}
              {activeStudyTab === 'fisiologia' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl space-y-2">
                    <h4 className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Mecanismo de Dano Celular & Teto Produtivo
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-amber-950 dark:text-amber-200">
                      {currentExpandedTopic.physiologicalImpacts}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: FÓRMULAS E LIMIARES */}
              {activeStudyTab === 'formulas' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white border-b pb-2">
                    Fórmulas Matemáticas, Constantes & Limiares Agrometeorológicos
                  </h4>

                  {currentExpandedTopic.formulasAndThresholds && currentExpandedTopic.formulasAndThresholds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {currentExpandedTopic.formulasAndThresholds.map((f, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl space-y-2"
                        >
                          <span className="font-black text-xs text-sky-700 dark:text-sky-300 uppercase block">
                            {f.name}
                          </span>
                          {f.formula && (
                            <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 font-mono text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {f.formula}
                            </div>
                          )}
                          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                            {f.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Nenhuma fórmula matemática direta cadastrada para este tópico.</p>
                  )}
                </div>
              )}

              {/* TAB 4: DIRETRIZES DE MANEJO */}
              {activeStudyTab === 'manejo' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Recomendações Práticas de Manejo Agronômico
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {currentExpandedTopic.practicalManagement.map((m, i) => (
                      <div
                        key={i}
                        className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                          {m}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CHECKLIST DE CAMPO */}
              {activeStudyTab === 'checklist' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Checklist Interativo de Inspeção no Campo
                    </h4>
                    <span className="text-xs text-slate-500">Marque os itens ao inspecionar a lavoura</span>
                  </div>

                  <div className="space-y-2">
                    {currentExpandedTopic.fieldChecklist.map((item, i) => {
                      const itemKey = `${currentExpandedTopic.id}-check-${i}`;
                      const isChecked = !!completedChecklist[itemKey];

                      return (
                        <div
                          key={i}
                          onClick={() => toggleCheckitem(itemKey)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isChecked
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-400'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: FAQ & Q&A */}
              {activeStudyTab === 'faq' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-sky-600" />
                    Perguntas Frequentes & Estudos de Caso Fisiológicos
                  </h4>

                  <div className="space-y-3">
                    {currentExpandedTopic.faq.map((qa, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2"
                      >
                        <h5 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-sky-600 dark:text-sky-400 font-extrabold">P{i + 1}:</span>
                          {qa.question}
                        </h5>
                        <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-black p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                            Resposta Agronômica:
                          </strong>
                          {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Marque como estudado para atualizar seu progresso acadêmico.
                </span>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setExpandedTopicId(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar Guia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
