import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { PRIVACY_POLICY_DATA, DPO_CONTACT_EMAIL } from '../../data/privacyPolicyData';
import { LgpdConsentData } from '../LgpdConsentModal';

interface AboutPrivacyTabProps {
  consentStatus: LgpdConsentData | null;
  onReAccept: () => void;
  onRevoke: () => void;
}

export const AboutPrivacyTab: React.FC<AboutPrivacyTabProps> = ({
  consentStatus,
  onReAccept,
  onRevoke,
}) => {
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const handleRevokeConfirm = () => {
    onRevoke();
    setShowRevokeConfirm(false);
  };

  return (
    <div className="space-y-5" data-testid="about-privacy-section" id="about-privacy-section">
      {/* Status LGPD */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Conformidade LGPD (Lei nº 13.709/2018)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Registro local de consentimento para tratamento de dados cadastrais e agronômicos.
              </p>
            </div>
          </div>

          <div className="text-xs font-medium inline-flex items-center gap-1.5 shrink-0">
            {consentStatus?.accepted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Consentimento ativo</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-400">Pendente de aceite</span>
              </>
            )}
          </div>
        </div>

        {consentStatus?.accepted ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs tabular-nums">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Data e Hora do Aceite
              </span>
              <span className="font-medium text-slate-900 dark:text-white mt-0.5 block">
                {new Date(consentStatus.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Versão Homologada
              </span>
              <span className="font-medium text-slate-900 dark:text-white mt-0.5 block">
                {consentStatus.version} (PWA Offline)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Armazenamento
              </span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                Local no dispositivo · Proteção ativa
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span>O aceite dos termos ainda não foi confirmado neste dispositivo.</span>
            <button
              type="button"
              onClick={onReAccept}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Registrar Aceite LGPD
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            DPO:{' '}
            <strong className="font-medium text-slate-700 dark:text-zinc-200">
              {DPO_CONTACT_EMAIL}
            </strong>
          </span>

          {consentStatus?.accepted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReAccept}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reconfirmar</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-xs cursor-pointer transition-colors"
              >
                Revogar Consentimento
              </button>
            </div>
          )}
        </div>

        {showRevokeConfirm && (
          <div className="p-3.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/70 space-y-2 text-xs text-rose-900 dark:text-rose-200">
            <p className="font-semibold">
              Confirmar revogação do consentimento LGPD?
            </p>
            <p className="text-[11px]">
              O termo de concordância será solicitado novamente na próxima inicialização do sistema.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                className="h-7 px-2.5 rounded-md bg-rose-600 text-white font-medium hover:bg-rose-700 cursor-pointer"
              >
                Sim, Revogar
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Política Completa */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {PRIVACY_POLICY_DATA.title}
          </h3>
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Documento HTML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          {PRIVACY_POLICY_DATA.sections.map(sec => (
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
              {sec.subsections && (
                <div className="space-y-2.5 pt-1.5">
                  {sec.subsections.map((sub, idx) => (
                    <div
                      key={idx}
                      className="pt-2 border-t border-slate-100 dark:border-zinc-800/80"
                    >
                      <strong className="text-slate-900 dark:text-white block text-xs font-medium">
                        {sub.title}
                      </strong>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {sub.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
