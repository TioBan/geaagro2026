import React from 'react';
import {
  ShieldCheck,
  WifiOff,
  Sparkles,
  Layers,
  FlaskConical,
  Tractor,
  Droplets,
  Beef,
  Bird,
  Bug,
  CloudRain,
  GraduationCap,
  Award,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface AboutFeaturesAndStandardsProps {
  setActiveTab?: (tab: string) => void;
}

export const AboutFeaturesAndStandards: React.FC<AboutFeaturesAndStandardsProps> = ({ setActiveTab }) => {
  const systemHighlights = [
    {
      icon: FlaskConical,
      title: 'Solos & Bioanálise BioAS',
      desc: 'Interpretação química (8 métodos de calagem) e bioanálise enzimática oficial da Embrapa (Arilsulfatase, Beta-glicosidase, Fosfatase Ácida e IQS Bio).',
    },
    {
      icon: Sparkles,
      title: 'Nema IA & Diagnóstico',
      desc: 'Auditoria fitossanitária com Inteligência Artificial e OCR inteligente para leitura automática de laudos laboratoriais.',
    },
    {
      icon: Tractor,
      title: 'Caderno de Campo',
      desc: 'Gestão completa de talhões, operações de campo, rastreabilidade de safras e auditoria agronômica.',
    },
    {
      icon: Droplets,
      title: 'Água, Brix & Fertirrigação',
      desc: 'Simulador de tanques A/B, compatibilidade iônica, salinidade USSL e monitoramento de índice de saúde foliar (ISF).',
    },
    {
      icon: Beef,
      title: 'Bovinocultura',
      desc: 'Gêmeo digital animal e de pastagem, ganho médio diário (GMD), reprodução IATF e sanidade do rebanho.',
    },
    {
      icon: Bird,
      title: 'Avicultura',
      desc: 'Gêmeos digitais de lote e galpão, controle ambiental, pesagens, curvas de crescimento e índice IEA.',
    },
    {
      icon: Bug,
      title: 'MIP & Fitossanidade',
      desc: 'Manejo Integrado de Pragas, radar fitossanitário, níveis de ação e bulário integrado de defensivos MAPA.',
    },
    {
      icon: CloudRain,
      title: 'Clima & Pluviometria',
      desc: 'Monitoramento meteorológico, janela operacional (IJO), balanço hídrico por cultura e índice IEC de chuvas.',
    },
    {
      icon: GraduationCap,
      title: 'GeaAgro Edu',
      desc: 'Portal educacional com artigos técnicos, pesquisas agronômicas e publicações científicas.',
      externalUrl: 'https://geaagrobrasil.blogspot.com/',
    },
  ];

  const standards = [
    'Embrapa Cerrados & Embrapa Solos (Normas BioAS e Fertilidade)',
    'Boletim Técnico 100 - Instituto Agronômico de Campinas (IAC)',
    '5ª Aproximação SBCS (Comissão de Fertilidade do Solo)',
    'Tabelas de Recomendação UFV/EPAMIG (5ª Aproximação MG)',
    'Ministério da Agricultura e Pecuária (MAPA) - Legislação de Sementes e Defensivos',
    'USSL Staff (1954) - Salinidade e Qualidade de Água para Irrigação',
  ];

  return (
    <>
      {/* System Overview & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Rigor Científico</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Algoritmos baseados nas diretrizes oficiais da Embrapa, IAC, SBCS e MAPA, garantindo assertividade em cada laudo e recomendação técnica.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">100% Offline-First</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Arquitetura PWA resiliente com banco de dados local IndexedDB no dispositivo. Funciona plenamente no campo, mesmo sem sinal de internet.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Inteligência Artificial</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Leitor inteligente de laudos de solo via OCR com validação agronômica instantânea e Nema IA para auditoria e diagnósticos avançados.
          </p>
        </div>
      </div>

      {/* Modules Capabilities Grid */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Módulos Integrados na Suíte 4.2.3.4</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Ecossistema modular unificado para agrônomos, consultores técnicos e produtores rurais.
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            20+ Módulos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {systemHighlights.map((mod, idx) => {
            const Icon = mod.icon;
            if (mod.externalUrl) {
              return (
                <a
                  key={idx}
                  href={mod.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">{mod.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
                    {mod.desc}
                  </p>
                </a>
              );
            }
            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 space-y-1.5 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{mod.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standards & Technical Citations */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Bases Científicas e Normativas Homologadas</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
          {standards.map((st, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{st}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack & System Details */}
      <div className="bg-slate-900 dark:bg-black text-slate-100 rounded-xl p-6 border border-slate-800 dark:border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-white">Especificações da Versão 4.2.3.4</span>
          </div>
          <span className="text-[11px] font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-800">
            Build v4.2.3.4-prod
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Tecnologia Core</span>
            <span className="font-bold text-slate-200">React 18 + TypeScript</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Interface & Design</span>
            <span className="font-bold text-slate-200">Tailwind CSS + Lucide</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Banco Local</span>
            <span className="font-bold text-slate-200">IndexedDB (Offline PWA)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Inteligência Artificial</span>
            <span className="font-bold text-slate-200">Gemini IA + OCR</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-200">GeaAgro CRM 4.2.3.4</strong> — Todos os direitos reservados.
          </p>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ir para o Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
