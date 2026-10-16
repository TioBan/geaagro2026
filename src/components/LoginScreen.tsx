import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sprout, 
  Lock, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  Sun, 
  Moon, 
  Tractor, 
  ShieldCheck, 
  Eye, 
  X, 
  Sparkles, 
  BrainCircuit, 
  Send, 
  CheckCircle2, 
  Scale,
  Leaf,
  Bug
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
  overlayClass?: string;
  hudReadout?: string;
  keywords?: string[];
}

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



  // Consultation interactive state
  const [consultationInput, setConsultationInput] = useState('');
  const [consultationHistory, setConsultationHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; linkThemeId?: string }>>([
    {
      role: 'assistant',
      text: 'Olá! Sou a Nema IA, a inteligência agronômica do GeaAgro. Posso prestar assessoria técnica fitossanitária, identificação de nematoides (Meloidogyne, Pratylenchus), sintomas de deficiência nutricional foliar (como clorose férrica e carência de micronutrientes) e manejo integrado de lavouras. Em que posso auxiliá-lo?'
    }
  ]);

  // Real agricultural photos pre-bundled locally in /public (100% offline!)
  const AGRO_THEMES: AgroTheme[] = [
    {
      id: "meloidogyne_microscope",
      title: "Nematóide-das-Galhas (Meloidogyne spp.)",
      category: "Nematologia & Microscopia",
      imageUrl: "/meloidogyne_microscope.jpg",
      phrase: "Morfologia óptica de Meloidogyne spp. em aumento laboratorial. As fêmeas globosas induzem a formação de células gigantes nutritivas e galhas nas raízes, comprometendo o transporte xilemático de água e nutrientes na lavoura.",
      author: "Diagnóstico Laboratorial - Nema IA",
      overlayClass: "mix-blend-color-dodge opacity-85 bg-emerald-950/20",
      hudReadout: "Taxon: Meloidogyne spp. • Fêmea Adulta / J2 Infeccioso",
      keywords: ["nematóide", "meloidogyne", "galhas", "raízes"]
    },
    {
      id: "cercospora_foliar",
      title: "Cercosporiose Foliar (Cercospora spp.)",
      category: "Fitopatologia & Doenças Fúngicas",
      imageUrl: "/nursery_cercospora.jpg",
      phrase: "Lesões foliares necróticas circulares a alongadas com centro acinzentado e halo clorótico causadas pelo fungo Cercospora spp. O patógeno esporula sob alta umidade relativa (>85%) e temperaturas entre 22°C e 30°C, reduzindo a área fotossintética ativa.",
      author: "Fitopatologia & Manejo de Fungicidas",
      hudReadout: "Fungo Fitopatogênico: Cercospora spp. • Mancha Foliar Necrótica",
      keywords: ["cercospora", "cercosporiose", "fungo", "mancha foliar"]
    },
    {
      id: "botrytis_cinerea",
      title: "Mofo Cinzento (Botrytis cinerea)",
      category: "Fitopatologia & Sanidade Vegetal",
      imageUrl: "/botrytis_cinerea_leaf.jpg",
      phrase: "Necrose aquosa foliar em formato de 'V' acompanhada por densa frutificação micelial e conidióforos acinzentados de Botrytis cinerea. O patógeno atua como necrotrófico agressivo sob alta umidade e temperaturas amenas (15°C a 20°C).",
      author: "Diagnóstico de Doenças de Parte Aérea",
      hudReadout: "Patógeno: Botrytis cinerea • Esporulação Micelial"
    },
    {
      id: "pythium_damping",
      title: "Tombamento de Plântulas (Pythium spp.)",
      category: "Patógenos de Solo & Tratamento de Sementes",
      imageUrl: "/pythium_damping_off.jpg",
      phrase: "Estrangulamento e podridão aquosa na região do colo (damping-off pós-emergência) provocados pelo oomiceto Pythium spp. Ocorre frequentemente em solos compactados com encharcamento e drenagem deficiente nos primeiros dias após a emergência.",
      author: "Manejo Sanitário de Solo e Sementes",
      hudReadout: "Patógeno: Pythium spp. • Damping-off de Colo e Raiz"
    },
    {
      id: "rhizoctonia_solani",
      title: "Rizoctoniose e Queima (Rhizoctonia solani)",
      category: "Fitopatologia de Raiz e Colo",
      imageUrl: "/nursery_rhizoctonia.jpg",
      phrase: "Lesões necróticas deprimidas de coloração castanho-avermelhada no colo e queima de tecidos jovens por Rhizoctonia solani. O fungo sobrevive na forma de escleródios e micélio resistente na matéria orgânica do solo.",
      author: "Epidemiologia & Controle de Fungos de Solo",
      hudReadout: "Patógeno: Rhizoctonia solani • Podridão Cortical"
    },
    {
      id: "iron_chlorosis_canopy",
      title: "Clorose Férrica Generalizada no Dossel",
      category: "Nutrição Mineral & Correção de Solo",
      imageUrl: "/iron_chlorosis_plant.jpg",
      phrase: "Amarelecimento acentuado e perda de vigor no terço superior do dossel vegetativo decorrente da indisponibilidade de Ferro (Fe) provocada por pH elevado (>7.2), solos calcários ou excesso de calcário sem equilíbrio com micronutrientes.",
      author: "Manejo Nutricional e Fertilidade do Solo",
      hudReadout: "Sintoma de Campo: Carência de Ferro em Folhas Jovens",
      keywords: ["ferro", "clorose", "dossel", "deficiência de ferro"]
    },
    {
      id: "meloidogyne_roots",
      title: "Galhas Radiculares (Dano por Meloidogyne)",
      category: "Sintomatologia Nematológica Radicular",
      imageUrl: "/meloidogyne_root_damage.jpg",
      phrase: "Engrossamento desordenado e formação de galhas no cilindro vascular radicular provocados pelo parasitismo sedentário de Meloidogyne incognita/javanica, causando enfezamento, clorose e redução drástica da produtividade da lavoura.",
      author: "Diagnose de Campo & Amostragem Nematológica",
      hudReadout: "Sintoma: Galhas e Desorganização Vascular Radicular"
    },
    {
      id: "pratylenchus_damage",
      title: "Nematóide-das-Lesões (Pratylenchus brachyurus)",
      category: "Nematologia & Microscopia",
      imageUrl: "/pratylenchus_brachyurus_microscope.jpg",
      phrase: "Morfologia do nematóide endoparasita migrante Pratylenchus brachyurus. Ele penetra e se move pelas células do córtex radicular liberando enzimas que causam extensas lesões necróticas escuras e podridão de raízes.",
      author: "Manejo Integrado de Nematóides de Soja e Milho",
      hudReadout: "Taxon: Pratylenchus brachyurus • Endoparasita Migrador"
    },
    {
      id: "iron_chlorosis_leaf",
      title: "Deficiência de Ferro (Clorose Férrica Foliar)",
      category: "Diagnose Foliar & Clorose Férrica",
      imageUrl: "/iron_chlorosis_leaf.jpg",
      phrase: "Diagnose Foliar de Deficiência de Ferro (Fe): Reticulado verde fino proeminente sobre limbo foliar intensamente clorótico/amarelado nas folhas novas (clorose férrica internerval). O Ferro (Fe) é nutriente imóvel no floema, essencial na síntese da clorofila e transporte de elétrons na fotossíntese. Correção com quelatos de ferro (Fe-EDTA/EDDHA) ou correção do pH do solo.",
      author: "Diagnose Foliar & Nutrição Mineral de Plantas",
      hudReadout: "Diagnose Foliar: Deficiência de Ferro • Clorose Férrica Internerval",
      keywords: ["ferro", "deficiência de ferro", "clorose", "foliar", "diagnose foliar", "clorose férrica", "micronutrientes"]
    },
    {
      id: "nitrogen_deficiency",
      title: "Deficiência de Nitrogênio (Clorose em 'V')",
      category: "Nutrição Mineral & Macronutrientes",
      imageUrl: "/nutr_nitrogen_deficiency.jpg",
      phrase: "Clorose que progride do ápice para a base da nervura principal em formato clássico de 'V' invertido nas folhas mais velhas. Sendo um nutriente móvel, o Nitrogênio (N) é translocado das folhas baixeiras para os tecidos jovens em crescimento.",
      author: "Diagnose Nutricional de Macronutrientes",
      hudReadout: "Carência: Nitrogênio (N) • Clorose em Folhas Senescentes"
    },
    {
      id: "potassium_deficiency",
      title: "Deficiência de Potássio (Queima Marginal)",
      category: "Nutrição Mineral & Macronutrientes",
      imageUrl: "/nutr_potassium_deficiency.jpg",
      phrase: "Clorose seguida de necrose e dessecação nas margens e bordas das folhas inferiores (queima marginal). O Potássio (K) atua na regulação osmótica, abertura e fechamento estomático e translocação de fotoassimilados para grãos.",
      author: "Fisiologia & Adubação Potássica",
      hudReadout: "Carência: Potássio (K) • Necrose Marginal de Folhas Baixeiras"
    },
    {
      id: "phosphorus_deficiency",
      title: "Deficiência de Fósforo (Antocianose)",
      category: "Nutrição Mineral & Macronutrientes",
      imageUrl: "/nutr_phosphorus_deficiency.jpg",
      phrase: "Coloração arroxeada/avermelhada nas folhas mais velhas e colmos provocada pelo acúmulo excessivo de açúcares solúveis que estimulam a síntese de antocianina sob carência de Fósforo (P), nutriente chave para transferência de energia celular (ATP).",
      author: "Fertilidade do Solo & Nutrição Fosfatada",
      hudReadout: "Carência: Fósforo (P) • Pigmentação Antociânica e Raízes Finas"
    }
  ];

  // Derive selectedTheme purely from currentThemeIndex to eliminate any sync issues
  const selectedTheme = AGRO_THEMES[currentThemeIndex] || AGRO_THEMES[0];

  // Global Escape Key handler for closing all modals and overlays
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

  const handleClosePhotoModal = () => {
    setIsPhotoModalOpen(false);
  };

  const openThemeById = (themeId: string) => {
    const foundIdx = AGRO_THEMES.findIndex(t => t.id === themeId);
    if (foundIdx !== -1) {
      setCurrentThemeIndex(foundIdx);
      setIsPhotoModalOpen(true);
    }
  };

  const handleNextTheme = () => {
    setCurrentThemeIndex(prev => (prev + 1) % AGRO_THEMES.length);
  };

  const handlePrevTheme = () => {
    setCurrentThemeIndex(prev => (prev - 1 + AGRO_THEMES.length) % AGRO_THEMES.length);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 600);
  };

  const handleSendConsultation = (customQuestion?: string) => {
    const q = (customQuestion || consultationInput).trim();
    if (!q) return;

    const userMsg = { role: 'user' as const, text: q };
    let assistantReply = '';
    let linkTheme: string | undefined = undefined;

    const lower = q.toLowerCase();
    if (lower.includes('ferro') || lower.includes('clorose') || lower.includes('foliar') || lower.includes('amarelamento')) {
      assistantReply = 'Diagnose de Deficiência de Ferro (Clorose Férrica): O sintoma característico manifesta-se em folhas jovens no terço superior, com reticulado de nervuras finas verde-escuras sobre limbo foliar intensamente amarelado ou esbranquiçado. Ocorre frequentemente em solos com pH elevado (>7,0), calcários ou sob compactação radicular. Recomendação: aplicação foliar emergencial de quelatos de ferro (Fe-EDTA ou Fe-EDDHA na dose de 100 a 200 g Fe/ha) e correção de pH da rizosfera.';
      linkTheme = 'iron_chlorosis_leaf';
    } else if (lower.includes('nematoide') || lower.includes('galha') || lower.includes('meloidogyne')) {
      assistantReply = 'Diagnose Nematológica: A infecção por Meloidogyne spp. acarreta a formação de galhas e deformações no cilindro vascular radicular, prejudicando o fluxo xilemático. Recomendação: rotação com Crotalária spectabilis, controle biológico com Bacillus subtilis / Purpureocillium lilacinum e descompactação de solo.';
      linkTheme = 'meloidogyne_microscope';
    } else if (lower.includes('cercospora') || lower.includes('fungo') || lower.includes('mancha')) {
      assistantReply = 'Diagnose Fitopatológica: Lesões foliares causadas por Cercospora spp. exibem necrose com centro acinzentado e halo clorótico translúcido. Manejo: fungicidas protetores (Mancozebe) associados a triazóis e estrobirulinas em períodos de alta umidade (>85%).';
      linkTheme = 'cercospora_foliar';
    } else {
      assistantReply = `Análise Nema IA para "${q}": Os sintomas relatados indicam a necessidade de conferência cruzada entre análise química de solo e sintomatologia visual foliar. Recomenda-se amostragem foliar na fase de florescimento pleno (R1-R2) e verificação do pH em CaCl₂ para verificar bloqueios de absorção de micronutrientes.`;
    }

    setConsultationHistory(prev => [
      ...prev,
      userMsg,
      { role: 'assistant', text: assistantReply, linkThemeId: linkTheme }
    ]);
    setConsultationInput('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8faf9] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 transition-colors duration-300 select-none">
      
      {/* LEFT PANEL: Form and App Shell Controls */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-zinc-800/80 shadow-2xl md:shadow-none min-h-screen">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <GeaAgroLogo showText showSubtitle size="md" />

          <div className="flex items-center gap-1.5">
            {/* View Photo Button in Top Header */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center backdrop-blur-md"
              title="Ver Foto do Fundo e Explicação Agronômica"
              aria-label="Ver Foto do Fundo e Explicação Agronômica"
            >
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-all cursor-pointer border border-slate-200 dark:border-zinc-800 active:scale-95"
              title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Main Center Auth Form */}
        <div className="my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-sm mx-auto w-full"
          >
            <div className="space-y-1.5 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Olá! Bem-vindo a GeaAgro!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Digite suas credenciais corporativas para acessar o painel de laudos, bulário e consultoria.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  E-mail ou Usuário Agronômico
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: produtor@geaagro.com.br"
                  className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  Senha de acesso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 text-sm bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold select-none">opcional</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                <label className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900" />
                  Lembrar acesso
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setTermsTab('termos'); setIsTermsModalOpen(true); }}
                    className="text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer"
                    title="Ver Termos de Uso"
                  >
                    Termos &amp; Privacidade
                  </button>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <a href="#forgot" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait mt-5"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Conversa Com Nema IA Entry Point - IN-APP CONSULTATION EXPERIENCE */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 dark:border-zinc-800/80 w-full"></div>
                  <span className="bg-white dark:bg-zinc-950 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Conversa com a Nema IA
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-conversa-nema-ia"
                  data-testid="btn-conversa-nema-ia"
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 font-bold transition-all flex items-center justify-between group shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] text-left"
                  title="Abrir Consulta com Nema IA"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-emerald-700/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 group-hover:scale-105 group-hover:border-emerald-500/60 shadow-xs shadow-emerald-950/20 transition-all relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 to-transparent pointer-events-none" />
                      <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400 relative z-10" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 leading-tight">
                        Conversa Com Nema IA
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">
                        Consultoria fitossanitária e nematologia
                      </span>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform shrink-0 ml-2" />
                </button>
              </div>

              {/* Direct Diagnostic Quick-Links: Foliar, Nematodes, Disease */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1.5">
                  Diagnósticos Prontos &amp; Fotos Reais:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    id="btn-foliar-iron-deficiency"
                    onClick={() => openThemeById('iron_chlorosis_leaf')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Abrir Diagnose Foliar: Deficiência de Ferro"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Diagnose Foliar: Deficiência de Ferro (Clorose)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openThemeById('meloidogyne_microscope')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Abrir Nematologia"
                  >
                    <Bug className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Nematóide das Galhas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openThemeById('cercospora_foliar')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Abrir Cercospora"
                  >
                    <Leaf className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Cercosporiose Foliar</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Footer Section with Terms, Privacy Policy & Developers */}
        <div className="flex flex-col gap-2.5 text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-login-privacy"
                onClick={() => { setTermsTab('privacidade'); setIsTermsModalOpen(true); }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Política de Privacidade
              </button>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <button
                type="button"
                id="btn-login-terms"
                onClick={() => { setTermsTab('termos'); setIsTermsModalOpen(true); }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Termos de Uso
              </button>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <button
                type="button"
                id="btn-login-lgpd"
                onClick={() => { setTermsTab('resumo'); setIsTermsModalOpen(true); }}
                className="hover:underline cursor-pointer"
              >
                Consentimento LGPD
              </button>
            </div>

            <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Conexão Segura</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-zinc-900/60">
            <span>GeaAgro v4.2.2</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-1 flex-wrap">
              <span>🌱 Desenvolvido por</span>
              <a
                href="https://www.instagram.com/fatiima.leao/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                title="Instagram: @fatiima.leao"
              >
                Fátima Leão
              </a>
              <span>&amp;</span>
              <a
                href="https://www.instagram.com/lucas.agrobr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                title="Instagram: @lucas.agrobr"
              >
                Lucas Mendes
              </a>
              <span>❤️</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: High-Quality Real Offline Photos */}
      <div className="hidden md:block md:w-[55%] lg:w-[60%] relative overflow-hidden bg-emerald-950">
        {selectedTheme && (
          <>
            {/* Desktop Fullscreen Photo Viewer Button */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute top-6 right-6 z-10 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group flex items-center justify-center"
              title="Ampliar Foto &amp; Explicação Agronômica"
              aria-label="Ampliar Foto &amp; Explicação Agronômica"
            >
              <Eye className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </button>

            {/* Real Photographic Background */}
            <img
              src={selectedTheme.imageUrl}
              alt={selectedTheme.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/splash.jpg';
              }}
              className={`absolute inset-0 w-full h-full object-cover brightness-[0.70] transition-all duration-700 scale-102 hover:scale-105 ${selectedTheme.overlayClass || ''}`}
            />

            {/* Tech HUD overlay grid */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent z-1"></div>
            <div className="absolute inset-0 border-[24px] border-emerald-950/10 pointer-events-none z-1"></div>

            {/* Information card overlapping background */}
            <div className="absolute bottom-10 left-10 right-10 z-2 text-white flex flex-col justify-end space-y-4 max-w-2xl">
              <motion.div
                key={selectedTheme.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/65 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15 shadow-2xl space-y-3.5 cursor-pointer hover:border-emerald-500/40 transition-all"
                onClick={() => setIsPhotoModalOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Tractor className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                      {selectedTheme.category} • {selectedTheme.title}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30 font-bold">
                    <Eye className="w-3 h-3" /> Clique para ampliar
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold italic text-zinc-100 leading-snug">
                  "{selectedTheme.phrase}"
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/10">
                  <span className="font-semibold text-emerald-300">
                    Fonte: {selectedTheme.author}
                  </span>
                  <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {selectedTheme.hudReadout || "FOTO REAL LOCAL"}
                  </span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. FULLSCREEN PHOTO & AGRONOMIC EXPLANATION MODAL         */}
      {/* ========================================================= */}
      {isPhotoModalOpen && selectedTheme && (
        <div 
          id="agronomic-explanation-modal"
          data-testid="agronomic-explanation-modal"
          className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto"
        >
          {/* Backdrop layer with click-to-dismiss */}
          <div
            id="backdrop-agronomic-explanation"
            data-testid="agronomic-explanation-backdrop"
            className="fixed inset-0 bg-black/95 backdrop-blur-md -z-10 cursor-pointer"
            onClick={handleClosePhotoModal}
            aria-label="Fechar ao clicar no fundo"
          />

          {/* Modal Top Header */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-5xl mx-auto z-10 bg-black/75 backdrop-blur-lg p-3 sm:p-4 rounded-2xl border border-white/15 gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                    {selectedTheme.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Foto {currentThemeIndex + 1} de {AGRO_THEMES.length}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {selectedTheme.title}
                </h3>
              </div>
            </div>

            {/* Navigation & Close Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-modal-prev-theme"
                onClick={handlePrevTheme}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title="Foto Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              
              <button
                type="button"
                id="btn-modal-next-theme"
                onClick={handleNextTheme}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title="Próxima Foto"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-close-photo-modal"
                data-testid="close-modal-btn"
                onClick={handleClosePhotoModal}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer active:scale-95 ml-1 flex items-center gap-1.5 font-bold text-xs"
                title="Fechar Visualização"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>
          </div>

          {/* Diagnosis Case Selector Dropdown inside Viewer */}
          <div className="w-full max-w-5xl mx-auto z-10 py-1.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/75 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/15 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Selecione o Caso Clínico / Imagem:</span>
              </div>

              <div className="relative flex-1">
                <select
                  id="select-agro-theme"
                  value={currentThemeIndex}
                  onChange={(e) => setCurrentThemeIndex(Number(e.target.value))}
                  className="w-full bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs sm:text-sm font-bold py-2.5 pl-3.5 pr-10 rounded-xl border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                >
                  {AGRO_THEMES.map((theme, idx) => (
                    <option key={theme.id} value={idx} className="bg-zinc-950 text-white py-2 font-medium">
                      {idx + 1}. {theme.title} — ({theme.category})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Full Image Container */}
          <div className="relative my-auto max-w-5xl w-full mx-auto h-[45vh] sm:h-[55vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950 flex items-center justify-center my-3">
            <img
              src={selectedTheme.imageUrl}
              alt={selectedTheme.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/splash.jpg';
              }}
              className={`w-full h-full object-contain sm:object-cover brightness-95 transition-all duration-500 ${selectedTheme.overlayClass || ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

            {/* Photo counter badge */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Foto {currentThemeIndex + 1} de {AGRO_THEMES.length}</span>
            </div>

            {/* Keyword tags overlay */}
            <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 max-w-xs justify-end">
              {selectedTheme.id === 'iron_chlorosis_leaf' ? (
                <>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/80 text-white text-[10px] font-extrabold uppercase">Diagnose Foliar</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/80 text-white text-[10px] font-extrabold uppercase">Deficiência de Ferro</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">Clorose Férrica</span>
                </>
              ) : (
                <span className="px-2 py-0.5 rounded bg-black/70 text-emerald-300 border border-white/10 text-[10px] font-bold">
                  {selectedTheme.category}
                </span>
              )}
            </div>
          </div>

          {/* Technical Explanation HUD Footer */}
          <div className="w-full max-w-5xl mx-auto z-10 space-y-2">
            <motion.div
              key={selectedTheme.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-black/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/20 shadow-2xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Explicação Técnica Agronômica
                  </span>
                </div>
                <span className="text-[11px] text-zinc-300 font-mono bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/30 font-bold">
                  {selectedTheme.hudReadout || "FOTO REAL LOCAL"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold italic leading-relaxed text-zinc-100">
                "{selectedTheme.phrase}"
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-zinc-400 font-medium">
                <div>
                  <span>Fonte / Conceito: </span>
                  <strong className="text-emerald-300">{selectedTheme.author}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setIsConsultationOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-md"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Consultar Nema IA sobre este sintoma</span>
                  </button>

                  <button
                    type="button"
                    id="btn-close-explanation-footer"
                    data-testid="close-explanation-btn"
                    onClick={handleClosePhotoModal}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
                    title="Fechar Explicação e Retornar"
                    aria-label="Fechar"
                  >
                    <X className="w-3.5 h-3.5 text-rose-400" />
                    <span>Fechar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. IN-APP AI AGRONOMIC ADVISOR & SYMPTOM ADVISORY OVERLAY */}
      {/* ========================================================= */}
      {isConsultationOpen && (
        <div
          id="symptom-advisory-overlay"
          data-testid="symptom-advisory-overlay"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsConsultationOpen(false);
            }
          }}
        >
          <div 
            className="bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[90vh] text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-zinc-950 p-5 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent pointer-events-none" />
                  <BrainCircuit className="w-6 h-6 text-emerald-400 relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      Nema IA — Assessoria Agronômica &amp; Sintomas
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Consultoria fitossanitária, nematologia e diagnose foliar integrada do GeaAgro.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-advisory"
                data-testid="close-advisory-btn"
                onClick={() => setIsConsultationOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer font-bold text-xs flex items-center gap-1.5 active:scale-95 ml-2"
                title="Fechar Assessoria"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">Tópicos rápidos:</span>
              <button
                type="button"
                onClick={() => handleSendConsultation("Diagnose foliar de deficiência de ferro e clorose férrica")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer shrink-0"
              >
                🌱 Deficiência de Ferro &amp; Clorose
              </button>
              <button
                type="button"
                onClick={() => handleSendConsultation("Como identificar nematoide das galhas Meloidogyne?")}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold cursor-pointer shrink-0"
              >
                🔬 Meloidogyne spp. (Galhas)
              </button>
              <button
                type="button"
                onClick={() => handleSendConsultation("Manejo de manchas foliares e Cercospora")}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold cursor-pointer shrink-0"
              >
                🍂 Cercosporiose Foliar
              </button>
            </div>

            {/* Messages Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 grow max-h-[50vh]">
              {consultationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.linkThemeId && (
                      <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-emerald-400 font-bold">
                          Foto real &amp; laudo disponível no sistema:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConsultationOpen(false);
                            openThemeById(msg.linkThemeId!);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Foto e Diagnose</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      VC
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input & Footer Action */}
            <div className="p-3 sm:p-4 bg-zinc-900 border-t border-zinc-800 shrink-0 space-y-2">
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
                  className="grow h-11 px-4 text-xs sm:text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="h-11 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Consultar</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Base técnica embasada em referências da Embrapa, IAC e SBCS.</span>
                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(false)}
                  className="text-zinc-400 hover:text-white underline cursor-pointer font-bold"
                >
                  Fechar Assessoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TERMS & PRIVACY POLICY CONSENT MODAL (REACHABLE ON LOGIN) */}
      {/* ========================================================= */}
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
