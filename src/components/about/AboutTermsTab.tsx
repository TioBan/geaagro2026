import React from 'react';
import { Scale, AlertTriangle, ExternalLink } from 'lucide-react';
import { TERMS_OF_USE_DATA } from '../../data/termsOfUseData';

export const AboutTermsTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" data-testid="about-terms-section" id="about-terms-section">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3 flex-wrap">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{TERMS_OF_USE_DATA.title}</span>
          </h3>
          <a
            href="/terms-of-use.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold border border-amber-200 dark:border-amber-800 transition-all"
          >
            <span>Visualizar Documento HTML</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
            <strong className="font-bold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Aviso de Responsabilidade Técnica (A.R.T. / CREA):
            </strong>
            <p className="text-[11px] leading-relaxed">
              Nenhuma recomendação gerada pelo software substitui a prescrição obrigatória de{' '}
              <strong>Receituário Agronômico</strong> assinado por Engenheiro Agrônomo habilitado,
              acompanhado da devida <strong>Anotação de Responsabilidade Técnica (ART)</strong>{' '}
              registrada perante o Conselho Regional de Engenharia e Agronomia (CREA).
            </p>
          </div>

          {TERMS_OF_USE_DATA.sections.map((sec) => (
            <section key={sec.id} className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                {sec.number}. {sec.title}
              </h4>
              <p className="leading-relaxed">{sec.content}</p>
              {sec.bullets && (
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
