import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RotateCcw,
  Lock,
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
    <div className="space-y-6 animate-fade-in" data-testid="about-privacy-section" id="about-privacy-section">
      {/* User Consent Card */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                consentStatus?.accepted
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                Status de Conformidade LGPD (Lei nº 13.709/2018)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Sua aceitação garante a legitimidade do tratamento de dados cadastrais e agronômicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {consentStatus?.accepted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Consentimento Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-extrabold border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Pendente de Aceite
              </span>
            )}
          </div>
        </div>

        {consentStatus?.accepted ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800">
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Data e Hora do Aceite</span>
              <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {new Date(consentStatus.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Versão dos Termos Homologada</span>
              <span className="font-extrabold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                {consentStatus.version} (Conformidade PWA Offline)
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Armazenamento e Criptografia</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                Local IndexedDB / Proteção Ativa
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <span>O aceite dos termos ainda não foi confirmado neste dispositivo.</span>
            <button
              onClick={onReAccept}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer transition-all"
            >
              Registrar Aceite LGPD
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Encarregado de Proteção de Dados (DPO): <strong className="text-slate-700 dark:text-zinc-300">{DPO_CONTACT_EMAIL}</strong>
          </span>

          {consentStatus?.accepted && (
            <div className="flex gap-2">
              <button
                onClick={onReAccept}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reconfirmar Termos
              </button>
              <button
                onClick={() => setShowRevokeConfirm(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                Revogar Consentimento
              </button>
            </div>
          )}
        </div>

        {showRevokeConfirm && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2 text-xs text-rose-900 dark:text-rose-200">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Tem certeza que deseja revogar o consentimento LGPD?
            </p>
            <p className="text-[11px]">
              Ao revogar, o modal de concordância obrigatória será reexibido na próxima reinicialização do sistema.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRevokeConfirm(false)}
                className="px-3 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
              >
                Sim, Revogar Consentimento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full LGPD Policy Text from Structured Data */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3 flex-wrap">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{PRIVACY_POLICY_DATA.title}</span>
          </h3>
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all"
          >
            <span>Visualizar Documento HTML</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          {PRIVACY_POLICY_DATA.sections.map((sec) => (
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
              {sec.subsections &&
                sec.subsections.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mt-2"
                  >
                    <strong className="text-slate-900 dark:text-zinc-100 block mb-1 text-xs">
                      {sub.title}
                    </strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">{sub.text}</p>
                  </div>
                ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
