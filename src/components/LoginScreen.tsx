import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Eye,
  X,
  BrainCircuit,
  Send,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { LgpdConsentModal } from './LgpdConsentModal';
import { GeaAgroLogo } from './GeaAgroLogo';
import { AgroEasterEggModal } from './AgroEasterEggModal';

interface LoginScreenProps {
  onLogin: () => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AgroTheme {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  phrase: string;
  author: string;
  hudReadout?: string;
}

const AGRO_THEMES: AgroTheme[] = [
  {
    id: 'meloidogyne_microscope',
    title: 'Nematóide-das-Galhas (Meloidogyne spp.)',
    category: 'Nematologia & Microscopia',
    imageUrl: '/meloidogyne_microscope.jpg',
    phrase:
      'Morfologia óptica de Meloidogyne spp. em aumento laboratorial. As fêmeas globosas induzem a formação de células gigantes nutritivas e galhas nas raízes, comprometendo o transporte xilemático de água e nutrientes na lavoura.',
    author: 'Diagnóstico Laboratorial — Nema IA',
    hudReadout: 'Taxon: Meloidogyne spp. · Fêmea Adulta / J2 Infeccioso',
  },
  {
    id: 'cercospora_foliar',
    title: 'Cercosporiose Foliar (Cercospora spp.)',
    category: 'Fitopatologia & Doenças Fúngicas',
    imageUrl: '/nursery_cercospora.jpg',
    phrase:
      'Lesões foliares necróticas circulares a alongadas com centro acinzentado e halo clorótico causadas pelo fungo Cercospora spp. O patógeno esporula sob alta umidade relativa (>85%) e temperaturas entre 22°C e 30°C.',
    author: 'Fitopatologia & Manejo de Fungicidas',
    hudReadout: 'Fungo Fitopatogênico: Cercospora spp. · Mancha Foliar Necrótica',
  },
  {
    id: 'botrytis_cinerea',
    title: 'Mofo Cinzento (Botrytis cinerea)',
    category: 'Fitopatologia & Sanidade Vegetal',
    imageUrl: '/botrytis_cinerea_leaf.jpg',
    phrase:
      'Necrose aquosa foliar em formato de "V" acompanhada por densa frutificação micelial e conidióforos acinzentados de Botrytis cinerea. O patógeno atua como necrotrófico agressivo sob alta umidade e temperaturas amenas (15°C a 20°C).',
    author: 'Diagnóstico de Doenças de Parte Aérea',
    hudReadout: 'Patógeno: Botrytis cinerea · Esporulação Micelial',
  },
  {
    id: 'pythium_damping',
    title: 'Tombamento de Plântulas (Pythium spp.)',
    category: 'Patógenos de Solo & Tratamento de Sementes',
    imageUrl: '/pythium_damping_off.jpg',
    phrase:
      'Estrangulamento e podridão aquosa na região do colo (damping-off pós-emergência) provocados pelo oomiceto Pythium spp. Frequente em solos compactados com encharcamento nos primeiros dias após a emergência.',
    author: 'Manejo Sanitário de Solo e Sementes',
    hudReadout: 'Patógeno: Pythium spp. · Damping-off de Colo e Raiz',
  },
  {
    id: 'rhizoctonia_solani',
    title: 'Rizoctoniose e Queima (Rhizoctonia solani)',
    category: 'Fitopatologia de Raiz e Colo',
    imageUrl: '/nursery_rhizoctonia.jpg',
    phrase:
      'Lesões necróticas deprimidas de coloração castanho-avermelhada no colo e queima de tecidos jovens por Rhizoctonia solani. O fungo sobrevive na forma de escleródios e micélio resistente na matéria orgânica do solo.',
    author: 'Epidemiologia & Controle de Fungos de Solo',
    hudReadout: 'Patógeno: Rhizoctonia solani · Podridão Cortical',
  },
  {
    id: 'iron_chlorosis_canopy',
    title: 'Clorose Férrica Generalizada no Dossel',
    category: 'Nutrição Mineral & Correção de Solo',
    imageUrl: '/iron_chlorosis_plant.jpg',
    phrase:
      'Amarelecimento acentuado e perda de vigor no terço superior do dossel vegetativo decorrente da indisponibilidade de Ferro (Fe) provocada por pH elevado (>7,2), solos calcários ou excesso de calcário sem equilíbrio de micronutrientes.',
    author: 'Manejo Nutricional e Fertilidade do Solo',
    hudReadout: 'Sintoma de Campo: Carência de Ferro em Folhas Jovens',
  },
  {
    id: 'meloidogyne_roots',
    title: 'Galhas Radiculares (Dano por Meloidogyne)',
    category: 'Sintomatologia Nematológica Radicular',
    imageUrl: '/meloidogyne_root_damage.jpg',
    phrase:
      'Engrossamento desordenado e formação de galhas no cilindro vascular radicular provocados pelo parasitismo sedentário de Meloidogyne incognita/javanica, causando enfezamento, clorose e redução da produtividade.',
    author: 'Diagnose de Campo & Amostragem Nematológica',
    hudReadout: 'Sintoma: Galhas e Desorganização Vascular Radicular',
  },
  {
    id: 'pratylenchus_damage',
    title: 'Nematóide-das-Lesões (Pratylenchus brachyurus)',
    category: 'Nematologia & Microscopia',
    imageUrl: '/pratylenchus_brachyurus_microscope.jpg',
    phrase:
      'Morfologia do nematóide endoparasita migrador Pratylenchus brachyurus. Ele penetra e se move pelas células do córtex radicular liberando enzimas que causam extensas lesões necróticas escuras e podridão de raízes.',
    author: 'Manejo Integrado de Nematóides de Soja e Milho',
    hudReadout: 'Taxon: Pratylenchus brachyurus · Endoparasita Migrador',
  },
  {
    id: 'iron_chlorosis_leaf',
    title: 'Deficiência de Ferro (Clorose Férrica Foliar)',
    category: 'Diagnose Foliar & Clorose Férrica',
    imageUrl: '/iron_chlorosis_leaf.jpg',
    phrase:
      'Reticulado verde fino proeminente sobre limbo foliar intensamente clorótico nas folhas novas (clorose férrica internerval). O Ferro (Fe) é imóvel no floema e essencial na síntese de clorofila; corrigir com quelatos (Fe-EDTA/EDDHA) ou manejo de pH.',
    author: 'Diagnose Foliar & Nutrição Mineral de Plantas',
    hudReadout: 'Diagnose Foliar: Deficiência de Ferro · Clorose Internerval',
  },
  {
    id: 'nitrogen_deficiency',
    title: 'Deficiência de Nitrogênio (Clorose em "V")',
    category: 'Nutrição Mineral & Macronutrientes',
    imageUrl: '/nutr_nitrogen_deficiency.jpg',
    phrase:
      'Clorose que progride do ápice para a base da nervura principal em formato de "V" invertido nas folhas mais velhas. Por ser móvel, o Nitrogênio (N) é translocado das folhas baixeiras para os tecidos jovens.',
    author: 'Diagnose Nutricional de Macronutrientes',
    hudReadout: 'Carência: Nitrogênio (N) · Clorose em Folhas Senescentes',
  },
  {
    id: 'potassium_deficiency',
    title: 'Deficiência de Potássio (Queima Marginal)',
    category: 'Nutrição Mineral & Macronutrientes',
    imageUrl: '/nutr_potassium_deficiency.jpg',
    phrase:
      'Clorose seguida de necrose e dessecação nas margens e bordas das folhas inferiores (queima marginal). O Potássio (K) atua na regulação osmótica, abertura estomática e translocação de fotoassimilados.',
    author: 'Fisiologia & Adubação Potássica',
    hudReadout: 'Carência: Potássio (K) · Necrose Marginal de Folhas Baixeiras',
  },
  {
    id: 'phosphorus_deficiency',
    title: 'Deficiência de Fósforo (Antocianose)',
    category: 'Nutrição Mineral & Macronutrientes',
    imageUrl: '/nutr_phosphorus_deficiency.jpg',
    phrase:
      'Coloração arroxeada/avermelhada nas folhas mais velhas e colmos provocada pelo acúmulo de açúcares solúveis que estimulam a síntese de antocianina sob carência de Fósforo (P), essencial para transferência de energia (ATP).',
    author: 'Fertilidade do Solo & Nutrição Fosfatada',
    hudReadout: 'Carência: Fósforo (P) · Pigmentação Antociânica',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'resumo' | 'privacidade' | 'termos'>('resumo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);

  const [consultationInput, setConsultationInput] = useState('');
  const [consultationHistory, setConsultationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; linkThemeId?: string }>
  >([
    {
      role: 'assistant',
      text: 'Olá! Sou a Nema IA, a inteligência agronômica do GeaAgro. Posso auxiliar em fitossanidade, identificação de nematoides (Meloidogyne, Pratylenchus), sintomas de deficiência nutricional foliar e manejo integrado. Em que posso ajudar?',
    },
  ]);

  const selectedTheme = AGRO_THEMES[currentThemeIndex] || AGRO_THEMES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setIsPhotoModalOpen(false);
        setIsConsultationOpen(false);
        setIsTermsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const handleClosePhotoModal = () => setIsPhotoModalOpen(false);

  const openThemeById = (themeId: string) => {
    const foundIdx = AGRO_THEMES.findIndex((t) => t.id === themeId);
    if (foundIdx !== -1) {
      setCurrentThemeIndex(foundIdx);
      setIsPhotoModalOpen(true);
    }
  };

  const handleNextTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % AGRO_THEMES.length);
  };

  const handlePrevTheme = () => {
    setCurrentThemeIndex((prev) => (prev - 1 + AGRO_THEMES.length) % AGRO_THEMES.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 350);
  };

  const handleSendConsultation = (customQuestion?: string) => {
    const q = (customQuestion || consultationInput).trim();
    if (!q) return;

    const userMsg = { role: 'user' as const, text: q };
    let assistantReply = '';
    let linkTheme: string | undefined;

    const lower = q.toLowerCase();
    if (
      lower.includes('ferro') ||
      lower.includes('clorose') ||
      lower.includes('foliar') ||
      lower.includes('amarelamento')
    ) {
      assistantReply =
        'Diagnose de Deficiência de Ferro (Clorose Férrica): Manifesta-se em folhas jovens do terço superior com reticulado de nervuras finas verde-escuras sobre limbo amarelado. Frequente em solos com pH elevado (>7,0) ou compactação radicular. Recomendação: aplicação foliar de quelatos de ferro (Fe-EDTA ou Fe-EDDHA, 100 a 200 g Fe/ha) e ajuste de pH na rizosfera.';
      linkTheme = 'iron_chlorosis_leaf';
    } else if (
      lower.includes('nematoide') ||
      lower.includes('galha') ||
      lower.includes('meloidogyne')
    ) {
      assistantReply =
        'Diagnose Nematológica: A infecção por Meloidogyne spp. causa galhas e deformações no cilindro vascular radicular, prejudicando o fluxo de água e nutrientes. Recomendação: rotação com Crotalaria spectabilis, controle biológico (Bacillus subtilis / Purpureocillium lilacinum) e descompactação do solo.';
      linkTheme = 'meloidogyne_microscope';
    } else if (
      lower.includes('cercospora') ||
      lower.includes('fungo') ||
      lower.includes('mancha')
    ) {
      assistantReply =
        'Diagnose Fitopatológica: Lesões causadas por Cercospora spp. apresentam centro necrótico acinzentado e halo clorótico. Manejo: fungicidas multissítios (Mancozebe) associados a triazóis e estrobilurinas sob alta umidade (>85%).';
      linkTheme = 'cercospora_foliar';
    } else {
      assistantReply = `Análise técnica para "${q}": Recomenda-se cruzar análise química de solo com sintomatologia foliar visual, realizando amostragem no florescimento pleno (R1–R2) e conferência de pH em CaCl₂ para identificar eventuais bloqueios de absorção.`;
    }

    setConsultationHistory((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', text: assistantReply, linkThemeId: linkTheme },
    ]);
    setConsultationInput('');
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-12 bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans antialiased">
      {/* COLUNA ESQUERDA: Acesso & Consultas Rápidas */}
      <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-between min-h-screen bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 px-6 sm:px-10 py-6">
        {/* Topo */}
        <header className="flex items-center justify-between gap-3">
          <GeaAgroLogo showText showSubtitle size="sm" />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center transition-colors cursor-pointer"
              title="Ver atlas fotográfico e explicação agronômica"
              aria-label="Ver atlas fotográfico e explicação agronômica"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center transition-colors cursor-pointer"
              title={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
              aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Formulário Central */}
        <main className="my-auto py-8 w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Acessar GeaAgro
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Entre para abrir o painel de laudos, compêndio de defensivos, MIP e cálculos agronômicos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
              >
                E-mail ou usuário agronômico
              </label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: produtor@geaagro.com.br"
                className="w-full h-9 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-lg placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-slate-700 dark:text-zinc-300"
                >
                  Senha de acesso
                </label>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">Opcional</span>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-lg placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
              <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Lembrar acesso</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotNote((prev) => !prev)}
                className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline cursor-pointer whitespace-nowrap"
              >
                Esqueceu a senha?
              </button>
            </div>

            {showForgotNote && (
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-2 text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                O acesso local não exige senha obrigatória. Clique em{' '}
                <strong className="font-medium text-slate-900 dark:text-zinc-100">
                  Entrar no sistema
                </strong>{' '}
                para prosseguir imediatamente.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no sistema</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seção Discreta de Consulta & Diagnósticos Rápidos */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <button
              type="button"
              id="btn-conversa-nema-ia"
              data-testid="btn-conversa-nema-ia"
              onClick={() => setIsConsultationOpen(true)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-between gap-3 text-left cursor-pointer"
              title="Abrir consulta técnica com Nema IA"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    Conversa com Nema IA
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    Consultoria fitossanitária, nematologia e diagnose foliar
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            </button>

            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Referências fotográficas rápidas
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  id="btn-foliar-iron-deficiency"
                  onClick={() => openThemeById('iron_chlorosis_leaf')}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Clorose Férrica (Fe)
                </button>
                <button
                  type="button"
                  onClick={() => openThemeById('meloidogyne_microscope')}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Nematóide das Galhas
                </button>
                <button
                  type="button"
                  onClick={() => openThemeById('cercospora_foliar')}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cercosporiose Foliar
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Rodapé Limpo */}
        <footer className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <button
                type="button"
                id="btn-login-privacy"
                onClick={() => {
                  setTermsTab('privacidade');
                  setIsTermsModalOpen(true);
                }}
                className="text-slate-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline cursor-pointer"
              >
                Privacidade
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                id="btn-login-terms"
                onClick={() => {
                  setTermsTab('termos');
                  setIsTermsModalOpen(true);
                }}
                className="text-slate-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline cursor-pointer"
              >
                Termos de uso
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                id="btn-login-lgpd"
                onClick={() => {
                  setTermsTab('resumo');
                  setIsTermsModalOpen(true);
                }}
                className="text-slate-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline cursor-pointer"
              >
                LGPD
              </button>
            </div>

            <div className="inline-flex items-center gap-1 text-slate-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>Ambiente local seguro</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 dark:text-zinc-500 tabular-nums">
            <span>GeaAgro v4.2.3.8</span>
            <span>
              Desenvolvido por{' '}
              <a
                href="https://www.instagram.com/fatiima.leao/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                title="Instagram: @fatiima.leao"
              >
                Fátima Leão
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* COLUNA DIREITA: Atlas Fotográfico Agronômico (Sem balões flutuantes) */}
      <aside className="hidden md:flex md:col-span-7 lg:col-span-7 relative overflow-hidden bg-zinc-950 flex-col justify-between">
        {selectedTheme && (
          <>
            <img
              src={selectedTheme.imageUrl}
              alt={selectedTheme.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/splash.jpg';
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-300"
            />

            {/* Measured Scrim para contraste AA */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25 pointer-events-none" />

            {/* Barra Superior Discreta */}
            <div className="relative z-10 flex items-center justify-between px-8 pt-6">
              <span className="text-xs font-medium text-zinc-200 tabular-nums">
                Atlas Fotográfico · {String(currentThemeIndex + 1).padStart(2, '0')} /{' '}
                {String(AGRO_THEMES.length).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevTheme}
                  className="h-8 w-8 rounded-lg bg-black/45 hover:bg-black/65 border border-white/15 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Foto anterior"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTheme}
                  className="h-8 w-8 rounded-lg bg-black/45 hover:bg-black/65 border border-white/15 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Próxima foto"
                  title="Próxima foto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="h-8 px-2.5 rounded-lg bg-black/45 hover:bg-black/65 border border-white/15 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  title="Ampliar foto e explicação agronômica"
                  aria-label="Ampliar foto e explicação agronômica"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ampliar</span>
                </button>
              </div>
            </div>

            {/* Legenda Editorial Ancorada no Scrim */}
            <div className="relative z-10 px-8 pb-8 pt-16 max-w-2xl space-y-2 text-white">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-emerald-300 font-medium">
                <span>{selectedTheme.category}</span>
                {selectedTheme.hudReadout && (
                  <>
                    <span className="text-white/40" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-zinc-300 font-normal">{selectedTheme.hudReadout}</span>
                  </>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                {selectedTheme.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {selectedTheme.phrase}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 text-xs text-zinc-300">
                <span>Fonte: {selectedTheme.author}</span>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="text-emerald-300 hover:text-emerald-200 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Ver explicação completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ========================================================= */}
      {/* 1. MODAL DE ATLAS FOTOGRÁFICO & EXPLICAÇÃO AGRONÔMICA     */}
      {/* ========================================================= */}
      {isPhotoModalOpen && selectedTheme && (
        <div
          id="agronomic-explanation-modal"
          data-testid="agronomic-explanation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            id="backdrop-agronomic-explanation"
            data-testid="agronomic-explanation-backdrop"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px] cursor-pointer"
            onClick={handleClosePhotoModal}
            aria-label="Fechar ao clicar no fundo"
          />

          <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {selectedTheme.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Foto {currentThemeIndex + 1} de {AGRO_THEMES.length}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {selectedTheme.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="btn-modal-prev-theme"
                  onClick={handlePrevTheme}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <button
                  type="button"
                  id="btn-modal-next-theme"
                  onClick={handleNextTheme}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="btn-close-photo-modal"
                  data-testid="close-modal-btn"
                  onClick={handleClosePhotoModal}
                  aria-label="Fechar"
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Seletor Compacto de Caso */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="select-agro-theme"
                className="text-xs font-medium text-slate-600 dark:text-zinc-400 shrink-0"
              >
                Caso clínico / imagem:
              </label>
              <select
                id="select-agro-theme"
                value={currentThemeIndex}
                onChange={(e) => setCurrentThemeIndex(Number(e.target.value))}
                className="flex-1 h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {AGRO_THEMES.map((theme, idx) => (
                  <option key={theme.id} value={idx}>
                    {idx + 1}. {theme.title} — {theme.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagem */}
            <div className="relative bg-zinc-950 h-[38vh] sm:h-[46vh] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={selectedTheme.imageUrl}
                alt={selectedTheme.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/splash.jpg';
                }}
                className="w-full h-full object-contain sm:object-cover"
              />
            </div>

            {/* Explicação Técnica */}
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  Explicação técnica agronômica
                </span>
                {selectedTheme.hudReadout && (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedTheme.hudReadout}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {selectedTheme.phrase}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Fonte:{' '}
                  <strong className="font-medium text-slate-800 dark:text-zinc-200">
                    {selectedTheme.author}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setIsConsultationOpen(true);
                    }}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Consultar Nema IA</span>
                  </button>
                  <button
                    type="button"
                    id="btn-close-explanation-footer"
                    data-testid="close-explanation-btn"
                    onClick={handleClosePhotoModal}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL DE CONSULTORIA AGRONÔMICA (NEMA IA)              */}
      {/* ========================================================= */}
      {isConsultationOpen && (
        <div
          id="symptom-advisory-overlay"
          data-testid="symptom-advisory-overlay"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsConsultationOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col max-h-[86vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  Nema IA — Assessoria Agronômica e Sintomas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                  Consultoria fitossanitária, nematologia e diagnose foliar integrada.
                </p>
              </div>
              <button
                type="button"
                id="btn-close-advisory"
                data-testid="close-advisory-btn"
                onClick={() => setIsConsultationOpen(false)}
                aria-label="Fechar"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tópicos Rápidos */}
            <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 shrink-0 mr-1">
                Tópicos:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSendConsultation('Diagnose foliar de deficiência de ferro e clorose férrica')
                }
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                Deficiência de Ferro
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendConsultation('Como identificar nematoide das galhas Meloidogyne?')
                }
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                Meloidogyne spp.
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendConsultation('Manejo de manchas foliares e Cercospora')
                }
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                Cercosporiose Foliar
              </button>
            </div>

            {/* Histórico de Mensagens */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 grow">
              {consultationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.linkThemeId && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Referência fotográfica disponível
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConsultationOpen(false);
                            openThemeById(msg.linkThemeId!);
                          }}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver foto e diagnose</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Campo de Pergunta */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendConsultation();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={consultationInput}
                  onChange={(e) => setConsultationInput(e.target.value)}
                  placeholder="Pergunte sobre sintomas foliares, nematoides, pragas ou calagem..."
                  className="grow h-9 px-3 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Consultar</span>
                </button>
              </form>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Referências técnicas embasadas em Embrapa, IAC e SBCS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL DE TERMOS, PRIVACIDADE & LGPD */}
      <LgpdConsentModal
        isOpen={isTermsModalOpen}
        initialTab={termsTab}
        onClose={() => setIsTermsModalOpen(false)}
        onAcceptSuccess={() => {
          setIsTermsModalOpen(false);
          onLogin();
        }}
      />

      {/* Easter Egg 20 Agro Quotes Modal */}
      <AgroEasterEggModal />
    </div>
  );
};

export default LoginScreen;
