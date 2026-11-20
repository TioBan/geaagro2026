import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { TERMS_OF_USE_DATA } from '../../data/termsOfUseData';

export const AboutTermsTab: React.FC = () => {
  return (
    <section
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4"
      data-testid="about-terms-section"
      id="about-terms-section"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {TERMS_OF_USE_DATA.title}
        </h3>
        <a
          href="/terms-of-use.html"
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Documento HTML</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-1 text-xs">
        <strong className="font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Aviso de Responsabilidade Técnica (A.R.T. / CREA)</span>
        </strong>
        <p className="text-[11px] leading-relaxed">
          Nenhuma recomendação gerada pelo software substitui a prescrição obrigatória de{' '}
          <strong>Receituário Agronômico</strong> assinado por Engenheiro Agrônomo habilitado,
          acompanhado da devida <strong>Anotação de Responsabilidade Técnica (ART)</strong>{' '}
          registrada perante o CREA.
        </p>
      </div>

      <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
        {TERMS_OF_USE_DATA.sections.map(sec => (
          <div key={sec.id} className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              {sec.number}. {sec.title}
            </h4>
            <p>{sec.content}</p>
            {sec.bullets && (
              <ul className="list-disc list-inside space-y-1 pl-1">
                {sec.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
