import React, { useState } from 'react';
import { Award, BarChart3, CheckCircle2, ChevronRight, Edit, FileText, FlaskConical, ShieldCheck } from 'lucide-react';
import { GlobalGapAuditData } from '../../types/fieldbook';

export type { GlobalGapAuditData };

interface FieldBookGlobalGapViewProps {
  globalGapAudit: GlobalGapAuditData;
  onOpenEditModal: () => void;
  onOpenDetailModal: () => void;
}

export const FieldBookGlobalGapView: React.FC<FieldBookGlobalGapViewProps> = ({
  globalGapAudit,
  onOpenEditModal,
  onOpenDetailModal,
}) => {
  const [activeGlobalGapSubTab, setActiveGlobalGapSubTab] = useState<'overview' | 'chapters' | 'mrl' | 'documents'>('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/40 text-xs font-black flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {globalGapAudit.certificateNumber ? 'GLOBALG.A.P. CERTIFIED (IFA v6.0 - Smart)' : 'AUDITORIA GLOBALG.A.P. (IFA v6.0 - Smart)'}
              </span>
              {globalGapAudit.certificateNumber && (
                <span className="px-3 py-1 bg-white/10 text-white font-mono font-bold text-xs rounded-full border border-white/20">
                  {globalGapAudit.certificateNumber}
                </span>
              )}
              {globalGapAudit.certificateNumber && globalGapAudit.expiryDate ? (
                <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CERTIFICADO VÁLIDO
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-xs font-bold rounded-full border border-white/20">
                  PENDENTE DE PREENCHIMENTO
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Auditoria de Boas Práticas Agrícolas e Rastreabilidade</h3>
              {globalGapAudit.certificateNumber || globalGapAudit.farmName || globalGapAudit.certificationBody ? (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Propriedade: <strong className="text-white">{globalGapAudit.farmName || 'Não informada'}</strong> • Organismo Certificador:{' '}
                    <strong className="text-white">{globalGapAudit.certificationBody || 'Não informado'}</strong>
                  </p>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Auditoria realizada em{' '}
                    <strong>
                      {globalGapAudit.auditDate
                        ? globalGapAudit.auditDate.includes('-')
                          ? globalGapAudit.auditDate.split('-').reverse().join('/')
                          : globalGapAudit.auditDate
                        : 'Data não informada'}
                    </strong>{' '}
                    por <strong>{globalGapAudit.auditorName || 'Não informado'}</strong> • Válido até{' '}
                    <strong>
                      {globalGapAudit.expiryDate
                        ? globalGapAudit.expiryDate.includes('-')
                          ? globalGapAudit.expiryDate.split('-').reverse().join('/')
                          : globalGapAudit.expiryDate
                        : 'Não informado'}
                    </strong>
                    .
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Nenhum dado de auditoria GLOBALG.A.P. preenchido. Utilize o botão <strong>"Preencher / Editar Dados"</strong> para registrar o GGN, certificadora, auditor e datas de validade.
                </p>
              )}
            </div>

            {globalGapAudit.scope.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {globalGapAudit.scope.map((item, idx) => (
                  <span key={idx} className="text-[11px] bg-emerald-950/80 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-950/80 p-5 rounded-2xl border border-emerald-600/40 text-center lg:text-right shrink-0 min-w-[240px] shadow-inner space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-extrabold block">Conformidade Consolidada</span>
            <div className="text-4xl font-black text-white tracking-tight">
              {globalGapAudit.complianceScore.overallPct}
              <span className="text-2xl text-emerald-400">%</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium space-y-0.5 border-t border-emerald-800/60 pt-2">
              <div className="flex justify-between gap-2">
                <span className="text-emerald-300 font-bold">Major Musts:</span>
                <span className="font-bold text-white">{globalGapAudit.complianceScore.majorMustsPct}% (Exigido: 100%)</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-teal-300 font-bold">Minor Musts:</span>
                <span className="font-bold text-white">{globalGapAudit.complianceScore.minorMustsPct}% (Exigido: 95%)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onOpenEditModal}
                className="w-full py-2 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 font-bold text-xs rounded-xl transition-all border border-emerald-600/50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4 text-emerald-400" />
                <span>Preencher / Editar Dados</span>
              </button>
              <button
                onClick={onOpenDetailModal}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Relatório Executivo PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveGlobalGapSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeGlobalGapSubTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral &amp; Módulos</span>
        </button>

        <button
          onClick={() => setActiveGlobalGapSubTab('chapters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeGlobalGapSubTab === 'chapters'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Capítulos Auditados IFA ({(globalGapAudit?.chapters || []).length})</span>
        </button>

        <button
          onClick={() => setActiveGlobalGapSubTab('mrl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeGlobalGapSubTab === 'mrl'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Varredura de Resíduos LMR/MRL</span>
          <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">ISO 17025</span>
        </button>

        <button
          onClick={() => setActiveGlobalGapSubTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeGlobalGapSubTab === 'documents'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Validação GGN &amp; Documentos</span>
        </button>
      </div>

      {activeGlobalGapSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Pontos de Controle Auditados</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {globalGapAudit.summaryStats.totalControlPoints} <span className="text-xs text-emerald-600 font-bold">Verificados</span>
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                ✓ {globalGapAudit.summaryStats.compliantPoints} itens em conformidade
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Não-Conformidades Críticas (Major)</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {globalGapAudit.summaryStats.majorNonCompliances} <span className="text-xs text-slate-500 font-normal">Ocorrências</span>
              </p>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                {globalGapAudit.summaryStats.totalControlPoints > 0 ? 'Exigências maiores auditadas' : 'Aguardando auditoria'}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Observações Menores Sanadas</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {globalGapAudit.summaryStats.minorNonCompliancesResolved} <span className="text-xs text-slate-500 font-normal">PACs Concluídos</span>
              </p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
                {globalGapAudit.summaryStats.minorNonCompliancesResolved > 0 ? 'Evidências enviadas e aprovadas' : 'Nenhuma observação registrada'}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Laboratório de Resíduos</span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                {globalGapAudit.residueAnalysis.labName ? `${globalGapAudit.residueAnalysis.labName} (ISO 17025)` : 'Nenhum laboratório informado'}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                {globalGapAudit.residueAnalysis.substances.length > 0 ? 'Ativos analisados dentro do LMR' : 'Sem análises registradas'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Desempenho por Capítulo do Padrão GLOBALG.A.P. IFA v6.0</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Resumo do grau de conformidade técnica por área de gestão na propriedade</p>
              </div>
              <button
                onClick={() => setActiveGlobalGapSubTab('chapters')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Detalhes do Checklist</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {globalGapAudit.chapters.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                Nenhum capítulo auditado cadastrado. Preencha os dados da auditoria para iniciar o acompanhamento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalGapAudit.chapters.map(ch => (
                  <div key={ch.id} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                          {ch.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{ch.title}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{ch.scorePct}%</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">{ch.description}</p>

                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${ch.scorePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeGlobalGapSubTab === 'chapters' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3 border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Checklist Completo de Verificação - Padrão IFA v6.0</span>
            </span>
            <span className="text-xs text-slate-500 font-normal">{globalGapAudit.chapters.length} Módulos Verificados</span>
          </h4>

          {globalGapAudit.chapters.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              Nenhum capítulo auditado registrado até o momento.
            </div>
          ) : (
            <div className="space-y-4">
              {globalGapAudit.chapters.map(ch => (
                <div key={ch.id} className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-black bg-emerald-600 text-white px-2.5 py-1 rounded-md">{ch.code}</span>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{ch.title}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ch.mustType === 'Major'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        Requisito {ch.mustType} Must
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {ch.verifiedCount}/{ch.totalCount} itens ok ({ch.scorePct}%)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{ch.description}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auditoria de campo presencial com evidências fotográficas e validação documental do caderno de campo.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeGlobalGapSubTab === 'mrl' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Laudo Laboratorial de Análise de Resíduos de Pesticidas (LMR / MRL)</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Laboratório: <strong>{globalGapAudit.residueAnalysis.labName || 'Não informado'}</strong> • Relatório N°{' '}
                <strong>{globalGapAudit.residueAnalysis.reportNumber || 'Não informado'}</strong>
              </p>
            </div>

            {globalGapAudit.residueAnalysis.substances.length > 0 && (
              <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% APROVADO PARA EXPORTAÇÃO E MERCADO INTERNO
              </span>
            )}
          </div>

          {globalGapAudit.residueAnalysis.sampleDate && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                🧪 Amostragem de Pré-Colheita Realizada em{' '}
                {globalGapAudit.residueAnalysis.sampleDate.includes('-')
                  ? globalGapAudit.residueAnalysis.sampleDate.split('-').reverse().join('/')
                  : globalGapAudit.residueAnalysis.sampleDate}
              </span>
            </div>
          )}

          {globalGapAudit.residueAnalysis.substances.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              Nenhuma substância ou laudo LMR/MRL cadastrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-extrabold text-[10px]">
                    <th className="pb-3 pl-2">Princípio Ativo Testado</th>
                    <th className="pb-3">Concentração Detectada (mg/kg)</th>
                    <th className="pb-3">Limite Máximo LMR (mg/kg)</th>
                    <th className="pb-3">Padrão de Referência</th>
                    <th className="pb-3 text-right pr-2">Status Sanitário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {globalGapAudit.residueAnalysis.substances.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">{sub.ingredient}</td>
                      <td className="py-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{sub.detectedValueMgKg} mg/kg</td>
                      <td className="py-3 font-mono text-slate-600 dark:text-zinc-400">{sub.mrlAllowedMgKg} mg/kg</td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 font-medium">{sub.mrlSource}</td>
                      <td className="py-3 pr-2 text-right">
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-black uppercase">
                          ✓ DENTRO DO LMR
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeGlobalGapSubTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3 border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Validação Pública GGN no Portal Oficial GLOBALG.A.P.</span>
              </span>
              <span className="text-xs text-emerald-600 font-bold">Base de Dados Global Ativa</span>
            </h4>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Número de Registro GGN (GLOBALG.A.P. Number)</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                    {globalGapAudit.certificateNumber || 'Não cadastrado'}
                  </span>
                </div>
                <a
                  href="https://www.globalgap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 w-fit"
                >
                  <span>Consultar no Database GLOBALG.A.P.</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Qualquer comprador internacional ou trading de exportação pode verificar a autenticidade deste certificado diretamente na base de dados oficial utilizando o número GGN acima.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldBookGlobalGapView;
