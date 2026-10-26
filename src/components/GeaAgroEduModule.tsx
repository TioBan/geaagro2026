import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Youtube,
  Globe,
  BookOpen,
  Search,
  ExternalLink,
  Video,
  Calculator,
  Brain,
  Sparkles,
  CheckCircle2,
  FileText,
  Play,
  Layers,
  Share2,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Tv,
  X,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';

interface GeaAgroEduModuleProps {
  onNavigateTab?: (tab: string, subTab?: string) => void;
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

interface EduContentItem {
  id: string;
  type: 'youtube' | 'blog_artigo' | 'blog_calculo' | 'blog_mapa_mental';
  typeLabel: string;
  title: string;
  description: string;
  url: string;
  category: 'software' | 'solo' | 'calculos' | 'mapas' | 'defesa';
  categoryLabel: string;
  readOrWatchTime: string;
  featured?: boolean;
}

const EDU_CONTENT: EduContentItem[] = [
  // Conteúdos do Canal do YouTube (@Lucasgeaagrobr)
  {
    id: 'yt-1',
    type: 'youtube',
    typeLabel: 'Vídeo Tutorial • YouTube',
    title: 'Como operar o GeaAgro CRM no Smartphone (Instalação PWA & Uso Offline)',
    description:
      'Guia prático passo a passo demonstrando como instalar nosso software como aplicativo nativo na tela inicial do celular e lançar análises e operações no campo sem sinal de internet.',
    url: 'https://www.youtube.com/@Lucasgeaagrobr',
    category: 'software',
    categoryLabel: 'Tutoriais do App',
    readOrWatchTime: '8 min de vídeo',
    featured: true,
  },
  {
    id: 'yt-2',
    type: 'youtube',
    typeLabel: 'Vídeo Tutorial • YouTube',
    title: 'Interpretação Automática de Análise de Solo com Inteligência Artificial e OCR',
    description:
      'Demonstração em vídeo mostrando como fotografar ou anexar laudos em PDF para extrair automaticamente CTC, V%, teores de nutrientes e gerar diagnósticos rápidos.',
    url: 'https://www.youtube.com/@Lucasgeaagrobr',
    category: 'solo',
    categoryLabel: 'Manejo de Solo',
    readOrWatchTime: '12 min de vídeo',
    featured: true,
  },
  {
    id: 'yt-3',
    type: 'youtube',
    typeLabel: 'Vídeo Tutorial • YouTube',
    title: 'Cálculo de Adubação, Calagem (8 Métodos) e Gessagem Agrícola no App',
    description:
      'Como utilizar o simulador de recomendação nutricional para milho, soja, café, pastagens e citros, ajustando metas de produtividade e fontes de adubos.',
    url: 'https://www.youtube.com/@Lucasgeaagrobr',
    category: 'calculos',
    categoryLabel: 'Nutrição Vegetal',
    readOrWatchTime: '15 min de vídeo',
  },
  {
    id: 'yt-4',
    type: 'youtube',
    typeLabel: 'Vídeo Tutorial • YouTube',
    title: 'Geoprocessamento, Desenho de Talhões via GPS e Análise de Satélite (NDVI)',
    description:
      'Aprenda a mapear propriedades rurais, importar arquivos KML, avaliar o índice de vigor vegetativo e emitir laudos técnicos georreferenciados.',
    url: 'https://www.youtube.com/@Lucasgeaagrobr',
    category: 'software',
    categoryLabel: 'Precisão & Satélite',
    readOrWatchTime: '10 min de vídeo',
  },
  {
    id: 'yt-5',
    type: 'youtube',
    typeLabel: 'Vídeo Tutorial • YouTube',
    title: 'Caderno de Campo Digital & Rastreabilidade para Atender Exigências do MAPA',
    description:
      'Tutorial sobre o lançamento de registros operacionais, carência de defensivos e geração do Passaporte Digital com QR Code para hortifrúti.',
    url: 'https://www.youtube.com/@Lucasgeaagrobr',
    category: 'defesa',
    categoryLabel: 'Rastreabilidade',
    readOrWatchTime: '9 min de vídeo',
  },

  // Conteúdos do Site/Blog Oficial (https://geaagrobrasil.blogspot.com.br)
  {
    id: 'blog-1',
    type: 'blog_artigo',
    typeLabel: 'Artigo Técnico • Blogspot',
    title: 'Fundamentos Química do Solo: Relação Ca/Mg/K e Equilíbrio de Cátions na CTC',
    description:
      'Artigo detalhado sobre como interpretar a saturação por bases, o papel do cálcio, magnésio e potássio na estruturação do solo e a prevenção de antagonismos de absorção.',
    url: 'https://geaagrobrasil.blogspot.com.br',
    category: 'solo',
    categoryLabel: 'Química do Solo',
    readOrWatchTime: '6 min de leitura',
    featured: true,
  },
  {
    id: 'blog-2',
    type: 'blog_calculo',
    typeLabel: 'Cálculos Agrícolas • Blogspot',
    title: 'Fórmulas Práticas de Adubação, Conversão de Nutrientes e Necessidade de Gesso (NG)',
    description:
      'Síntese matemática com todas as equações consagradas (Embrapa, IAC, CFSEMG, UFV) para cálculo de calagem, fosfatagem, neutralização de Al3+ e adubação de manutenção.',
    url: 'https://geaagrobrasil.blogspot.com.br',
    category: 'calculos',
    categoryLabel: 'Fórmulas & Tabelas',
    readOrWatchTime: '8 min de leitura',
    featured: true,
  },
  {
    id: 'blog-3',
    type: 'blog_mapa_mental',
    typeLabel: 'Mapa Mental • Blogspot',
    title: 'Guia Visual: Chave Dicotômica de Diagnose Nutricional em Folhas Velhas vs Folhas Novas',
    description:
      'Mapa mental em alta resolução para identificação visual rápida de deficiências de N, P, K, Mg (folhas baixeiras) e Ca, B, Fe, Zn (folhas do ponteiro).',
    url: 'https://geaagrobrasil.blogspot.com.br',
    category: 'mapas',
    categoryLabel: 'Mapas Mentais',
    readOrWatchTime: 'Infográfico Rápido',
  },
  {
    id: 'blog-4',
    type: 'blog_artigo',
    typeLabel: 'Artigo Técnico • Blogspot',
    title: 'Manejo Integrado de Pragas (MIP) e Nematoides: Amostragem e Nível de Dano Econômico',
    description:
      'Diretrizes científicas para amostragem de nematoides de cisto (Heterodera) e das galhas (Meloidogyne), além de rotação de culturas com crotalárias.',
    url: 'https://geaagrobrasil.blogspot.com.br',
    category: 'defesa',
    categoryLabel: 'Fitossanidade',
    readOrWatchTime: '10 min de leitura',
  },
];

export const GeaAgroEduModule: React.FC<GeaAgroEduModuleProps> = ({
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'youtube' | 'blog_artigo' | 'blog_calculo' | 'blog_mapa_mental'>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeMentalMapModal, setActiveMentalMapModal] = useState<boolean>(false);

  // Links oficiais
  const YOUTUBE_URL = 'https://www.youtube.com/@Lucasgeaagrobr';
  const BLOG_URL = 'https://geaagrobrasil.blogspot.com.br';

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const filteredContent = useMemo(() => {
    return EDU_CONTENT.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query);

      const matchesType =
        selectedType === 'all' || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast de Cópia de Link */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-[1300] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up border border-slate-700">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">Link de {copiedLink} copiado com sucesso!</span>
        </div>
      )}

      {/* Hero Banner Principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-extrabold text-emerald-300">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>GeaAgro Edu • Hub de Conhecimento & Capacitação</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Aprenda a Maximizar Seus Resultados no Campo
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              O <strong>GeaAgro Edu</strong> é nosso portal de capacitação técnica. Unimos tutoriais em vídeo detalhando o funcionamento de cada módulo dos nossos softwares no YouTube, artigos agronômicos no nosso blog, planilhas e mapas mentais para rápida tomada de decisão.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Youtube className="w-4 h-4" />
                <span>Canal no YouTube (@Lucasgeaagrobr)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>Portal de Artigos & Blog Oficial</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Card de Destaque Rápido dos Dois Pilares */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shrink-0 space-y-4 max-w-sm w-full">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Pilares da GeaAgro Edu</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-400" />
                  <span>Vídeos & Tutoriais no YouTube</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Aprenda a operar nossas ferramentas de software com demonstrações práticas em tela.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Site & Blogspot Centralizado</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Artigos técnicos, fórmulas de adubação, tabelas da Embrapa e mapas mentais explicativos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Apresentação Detalhada dos 2 Canais de Aprendizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pilar 1: Canal do YouTube */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                Conteúdo em Vídeo
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Canal Oficial no YouTube (@Lucasgeaagrobr)
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                No nosso canal do YouTube disponibilizamos vídeos explicativos com o passo a passo dos softwares desenvolvidos pela GeaAgro (como este aplicativo CRM, simuladores de solo e cadernos digitais), mostrando na prática como funcionam e como aplicá-los na rotina da fazenda.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>O que você encontra no canal:</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-zinc-300 text-[11px] list-disc list-inside">
                <li>Demonstrações de uso dos módulos do GeaAgro CRM</li>
                <li>Tutoriais de interpretação de análise de solo e calagem</li>
                <li>Mapeamento de talhões via GPS, KML e imagens de satélite</li>
                <li>Dicas de boas práticas na emissão de laudos técnicos</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Youtube className="w-4 h-4" />
              <span>Acessar @Lucasgeaagrobr</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => handleCopyLink(YOUTUBE_URL, 'Canal do YouTube')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Copiar link do YouTube"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pilar 2: Portal Técnico & Blogspot */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                Central de Artigos
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Site & Blog Oficial (GeaAgro Brasil)
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                Nosso site oficial é onde fica tudo centralizado: acervo completo de artigos técnicos profundos, tabelas de recomendação de adubação, cálculos agrícolas, mapas mentais educativos para diagnose e orientações do MAPA e Embrapa.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>O que você encontra no Blog:</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-zinc-300 text-[11px] list-disc list-inside">
                <li>Artigos técnicos sobre química e física do solo</li>
                <li>Cálculos e planilhas para adubação, calagem e gessagem</li>
                <li>Mapas mentais ilustrados para diagnóstico nutricional</li>
                <li>Informativos de legislação, rastreabilidade e defensivos</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>Acessar geaagrobrasil.blogspot.com.br</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setActiveMentalMapModal(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Abrir síntese visual de mapas mentais no app"
            >
              <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Resumos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca de Conteúdo */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Catálogo de Tutoriais, Artigos e Mapas Mentais</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Explore nossos materiais educativos organizados por formato e tema agronômico.
            </p>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tutorial, cálculo ou mapa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Botoes de Filtro de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            Todos os Conteúdos
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('youtube')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'youtube'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500 group-hover:text-white" />
            <span>Vídeos no YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('blog_artigo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'blog_artigo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Artigos do Blog</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('blog_calculo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'blog_calculo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Cálculos Agrícolas</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('blog_mapa_mental')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'blog_mapa_mental'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Mapas Mentais</span>
          </button>
        </div>

        {/* Grid de Cards dos Conteúdos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredContent.map(item => {
            const isYt = item.type === 'youtube';

            return (
              <div
                key={item.id}
                className="bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group"
              >
                <div className="space-y-2.5">
                  {/* Cabeçalho do Card (Tipo + Categoria) */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        isYt ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isYt ? <Youtube className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      <span>{item.typeLabel}</span>
                    </span>

                    <span className="text-slate-400 dark:text-zinc-500">
                      {item.readOrWatchTime}
                    </span>
                  </div>

                  {/* Título */}
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {item.title}
                  </h4>

                  {/* Descrição */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Rodapé do Card com Ação */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                    {item.categoryLabel}
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isYt
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    <span>{isYt ? 'Assistir' : 'Ler no Blog'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              Nenhum conteúdo encontrado para sua busca
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Tente pesquisar por outros termos como "solo", "calagem", "tutoriais" ou limpe os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Restaurar Todos os Conteúdos
            </button>
          </div>
        )}
      </div>

      {/* Modal Interno de Síntese de Mapas Mentais & Fórmulas Rápidas */}
      {activeMentalMapModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800/60 overflow-hidden space-y-0 transform transition-all animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Mapas Mentais & Fórmulas Rápidas do GeaAgro Edu
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Síntese técnica de consulta rápida para o dia a dia agronômico
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMentalMapModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-zinc-300">
              {/* Seção 1: Fórmulas de Adubação */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Fórmulas de Calagem e Correção de Solo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      Saturação por Bases (Método V%)
                    </div>
                    <code className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 block bg-white dark:bg-zinc-900 p-2 rounded border border-slate-200 dark:border-zinc-800">
                      NC (t/ha) = [(V2 - V1) × CTC] / PRNT
                    </code>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      V2 = V% desejado da cultura; V1 = V% atual do laudo; CTC = T em cmolc/dm³.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      Necessidade de Gessagem Agrícola (NG)
                    </div>
                    <code className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 block bg-white dark:bg-zinc-900 p-2 rounded border border-slate-200 dark:border-zinc-800">
                      NG (kg/ha) = 50 × Argila (%)
                    </code>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Para culturas anuais (Embrapa/IAC) quando Al3+ &gt; 0.3 cmolc/dm³ no subsolo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 2: Diagnose Nutricional Foliar */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Mapa Mental: Mobilidade dos Nutrientes na Planta</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                    <div className="font-bold text-amber-900 dark:text-amber-300 text-xs">
                      🍂 Sintomas em Folhas Velhas (Nutrientes Móveis)
                    </div>
                    <p className="text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
                      <strong>Nitrogênio (N)</strong>: Amarelecimento uniforme.<br />
                      <strong>Fósforo (P)</strong>: Tom arroxeado/avermelhado.<br />
                      <strong>Potássio (K)</strong>: Queima e necrose nas margens.<br />
                      <strong>Magnésio (Mg)</strong>: Clorose internerval (nervuras verdes).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                      🌱 Sintomas em Folhas Novas (Nutrientes Imóveis)
                    </div>
                    <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                      <strong>Cálcio (Ca)</strong>: Deformação e morte dos brotos terminais.<br />
                      <strong>Boro (B)</strong>: Deformação do meristema e quebra fácil.<br />
                      <strong>Ferro (Fe)</strong>: Amarelecimento total de folhas jovens.<br />
                      <strong>Zinco (Zn)</strong>: Encurtamento de internódios (folhas pequenas).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                Conteúdo extraído do Blog Oficial GeaAgro Brasil
              </span>
              <a
                href={BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Ver Blog Completo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
