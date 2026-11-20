import React from 'react';
import {
  ShieldCheck,
  WifiOff,
  Sparkles,
  FlaskConical,
  Tractor,
  Droplets,
  Beef,
  Bird,
  Bug,
  CloudRain,
  GraduationCap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AboutFeaturesAndStandardsProps {
  setActiveTab?: (tab: string) => void;
}

const SYSTEM_HIGHLIGHTS = [
  {
    icon: FlaskConical,
    title: 'Solos & Bioanálise BioAS',
    desc: 'Interpretação química (8 métodos de calagem) e bioanálise enzimática Embrapa (Arilsulfatase, Beta-glicosidase, Fosfatase e IQS Bio).',
  },
  {
    icon: Sparkles,
    title: 'Nema IA & Diagnóstico',
    desc: 'Auditoria fitossanitária com Inteligência Artificial e OCR para leitura de laudos laboratoriais.',
  },
  {
    icon: Tractor,
    title: 'Caderno de Campo',
    desc: 'Gestão de talhões, operações de campo, rastreabilidade de safras e auditoria agronômica.',
  },
  {
    icon: Droplets,
    title: 'Água, Brix & Fertirrigação',
    desc: 'Simulador de tanques A/B, compatibilidade iônica, salinidade USSL e índice de saúde foliar (ISF).',
  },
  {
    icon: Beef,
    title: 'Bovinocultura',
    desc: 'Gêmeo digital animal e de pastagem, GMD, reprodução IATF e controle sanitário do rebanho.',
  },
  {
    icon: Bird,
    title: 'Avicultura',
    desc: 'Gêmeos digitais de lote e galpão, controle ambiental, pesagens, curvas de crescimento e IEA.',
  },
  {
    icon: Bug,
    title: 'MIP & Fitossanidade',
    desc: 'Manejo Integrado de Pragas, radar fitossanitário, níveis de ação e bulário integrado MAPA.',
  },
  {
    icon: CloudRain,
    title: 'Clima & Pluviometria',
    desc: 'Monitoramento meteorológico, janela operacional (IJO), balanço hídrico e índice IEC.',
  },
  {
    icon: GraduationCap,
    title: 'GeaAgro Edu',
    desc: 'Portal educacional com artigos técnicos, pesquisas agronômicas e publicações científicas.',
    externalUrl: 'https://geaagrobrasil.blogspot.com/',
  },
];

const STANDARDS = [
  'Embrapa Cerrados & Embrapa Solos (Normas BioAS e Fertilidade)',
  'Boletim Técnico 100 — Instituto Agronômico de Campinas (IAC)',
  '5ª Aproximação SBCS (Comissão de Fertilidade do Solo)',
  'Tabelas de Recomendação UFV/EPAMIG (5ª Aproximação MG)',
  'Ministério da Agricultura e Pecuária (MAPA) — Sementes e Defensivos',
  'USSL Staff (1954) — Salinidade e Qualidade de Água para Irrigação',
];

export const AboutFeaturesAndStandards: React.FC<AboutFeaturesAndStandardsProps> = ({
  setActiveTab,
}) => {
  return (
    <div className="space-y-5">
      {/* 3 Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
        {[
          {
            icon: ShieldCheck,
            title: 'Rigor Científico',
            desc: 'Algoritmos alinhados às diretrizes oficiais da Embrapa, IAC, SBCS e MAPA para recomendações técnicas precisas.',
          },
          {
            icon: WifiOff,
            title: '100% Offline-First',
            desc: 'Arquitetura PWA resiliente com banco local OPFS + WASM para operação completa no campo sem internet.',
          },
          {
            icon: Sparkles,
            title: 'Inteligência Aplicada',
            desc: 'Leitura assistida de laudos via OCR com validação agronômica e diagnósticos técnicos integrados.',
          },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Módulos Integrados */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Módulos Integrados na Suíte 4.2.3.8
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Ecossistema modular unificado para agrônomos, consultores e produtores rurais.
            </p>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
            20+ módulos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_HIGHLIGHTS.map(mod => {
            const Icon = mod.icon;
            if (mod.externalUrl) {
              return (
                <a
                  key={mod.title}
                  href={mod.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{mod.title}</span>
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </a>
              );
            }
            return (
              <div
                key={mod.title}
                className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{mod.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bases Científicas */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
          Bases Científicas e Normativas Homologadas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
          {STANDARDS.map(st => (
            <div key={st} className="flex items-start gap-2 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{st}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Especificações */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white">
            Especificações da Versão 4.2.3.8
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            v4.2.3.8-prod
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Tecnologia Core
            </span>
            <span className="font-medium text-slate-900 dark:text-white">React + TypeScript</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Interface
            </span>
            <span className="font-medium text-slate-900 dark:text-white">Tailwind CSS</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Banco Local
            </span>
            <span className="font-medium text-slate-900 dark:text-white">OPFS + WASM Offline</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Automação
            </span>
            <span className="font-medium text-slate-900 dark:text-white">OCR + IA Agronômica</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} GeaAgro CRM 4.2.3.8 — Todos os direitos reservados.</p>
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ir para o Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
