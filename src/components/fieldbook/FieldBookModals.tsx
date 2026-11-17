import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Bug,
  CheckCircle2,
  Edit,
  FileText,
  Flower2,
  Info,
  Plus,
  ShieldCheck,
  Tractor,
  X,
} from 'lucide-react';
import { Farm } from '../../types/agronomy';
import { Field, FieldOperation, GlobalGapAuditData } from '../../types/fieldbook';
import { ProductionBatch } from '../../types/nursery';

export interface NewOperationInput {
  fieldId: string;
  type: FieldOperation['type'];
  status: FieldOperation['status'];
  date: string;
  responsible: string;
  notes?: string;
  machine?: string;
  product?: string;
  dose?: number;
  target?: string;
}

export interface TransplantConfirmPayload {
  batch: ProductionBatch;
  fieldId: string;
  seedlingCount: number;
  transplantDate: string;
  responsible: string;
  notes: string;
  spacing?: string;
}

interface FieldBookModalsProps {
  farm?: Farm;
  fields: Field[];
  globalGapAudit: GlobalGapAuditData;
  isIggsModalOpen: boolean;
  onCloseIggsModal: () => void;
  isGlobalGapModalOpen: boolean;
  onCloseGlobalGapModal: () => void;
  onSwitchToEditGlobalGapModal: () => void;
  isNewOperationModalOpen: boolean;
  initialOpFieldId?: string;
  initialOpType?: FieldOperation['type'];
  onCloseNewOperationModal: () => void;
  onCreateOperation: (input: NewOperationInput) => void;
  isEditGlobalGapModalOpen: boolean;
  onCloseEditGlobalGapModal: () => void;
  onSaveGlobalGapAudit: (updatedAudit: GlobalGapAuditData) => void;
  isTransplantModalOpen: boolean;
  selectedTransplantBatch: ProductionBatch | null;
  initialTransplantFieldId?: string;
  onCloseTransplantModal: () => void;
  onConfirmTransplant: (payload: TransplantConfirmPayload) => void;
}

export const FieldBookModals: React.FC<FieldBookModalsProps> = ({
  fields,
  globalGapAudit,
  isIggsModalOpen,
  onCloseIggsModal,
  isGlobalGapModalOpen,
  onCloseGlobalGapModal,
  onSwitchToEditGlobalGapModal,
  isNewOperationModalOpen,
  initialOpFieldId,
  initialOpType,
  onCloseNewOperationModal,
  onCreateOperation,
  isEditGlobalGapModalOpen,
  onCloseEditGlobalGapModal,
  onSaveGlobalGapAudit,
  isTransplantModalOpen,
  selectedTransplantBatch,
  initialTransplantFieldId,
  onCloseTransplantModal,
  onConfirmTransplant,
}) => {
  // New operation form state
  const [opFieldId, setOpFieldId] = useState<string>(initialOpFieldId || fields[0]?.id || '');
  const [opType, setOpType] = useState<FieldOperation['type']>(initialOpType || 'spraying');
  const [opStatus, setOpStatus] = useState<FieldOperation['status']>('planned');
  const [opDate, setOpDate] = useState<string>('');
  const [opResponsible, setOpResponsible] = useState<string>('');
  const [opNotes, setOpNotes] = useState<string>('');
  const [opMachine, setOpMachine] = useState<string>('');
  const [opProduct, setOpProduct] = useState<string>('');
  const [opDose, setOpDose] = useState<string>('');
  const [opTarget, setOpTarget] = useState<string>('');

  useEffect(() => {
    if (isNewOperationModalOpen) {
      setOpFieldId(initialOpFieldId || fields[0]?.id || '');
      setOpType(initialOpType || 'spraying');
    }
  }, [isNewOperationModalOpen, initialOpFieldId, initialOpType, fields]);

  // Edit GlobalG.A.P. audit form state
  const [editCertBody, setEditCertBody] = useState(globalGapAudit.certificationBody);
  const [editAuditorName, setEditAuditorName] = useState(globalGapAudit.auditorName);
  const [editAuditDate, setEditAuditDate] = useState(globalGapAudit.auditDate);
  const [editExpiryDate, setEditExpiryDate] = useState(globalGapAudit.expiryDate);
  const [editCertificateNumber, setEditCertificateNumber] = useState(globalGapAudit.certificateNumber);
  const [editFarmName, setEditFarmName] = useState(globalGapAudit.farmName);
  const [editOverallPct, setEditOverallPct] = useState(globalGapAudit.complianceScore.overallPct.toString());
  const [editMajorMustsPct, setEditMajorMustsPct] = useState(globalGapAudit.complianceScore.majorMustsPct.toString());
  const [editMinorMustsPct, setEditMinorMustsPct] = useState(globalGapAudit.complianceScore.minorMustsPct.toString());
  const [editLabName, setEditLabName] = useState(globalGapAudit.residueAnalysis.labName);
  const [editReportNumber, setEditReportNumber] = useState(globalGapAudit.residueAnalysis.reportNumber);

  useEffect(() => {
    if (isEditGlobalGapModalOpen) {
      setEditCertBody(globalGapAudit.certificationBody);
      setEditAuditorName(globalGapAudit.auditorName);
      setEditAuditDate(globalGapAudit.auditDate);
      setEditExpiryDate(globalGapAudit.expiryDate);
      setEditCertificateNumber(globalGapAudit.certificateNumber);
      setEditFarmName(globalGapAudit.farmName);
      setEditOverallPct(globalGapAudit.complianceScore.overallPct.toString());
      setEditMajorMustsPct(globalGapAudit.complianceScore.majorMustsPct.toString());
      setEditMinorMustsPct(globalGapAudit.complianceScore.minorMustsPct.toString());
      setEditLabName(globalGapAudit.residueAnalysis.labName);
      setEditReportNumber(globalGapAudit.residueAnalysis.reportNumber);
    }
  }, [isEditGlobalGapModalOpen, globalGapAudit]);

  // Transplant form state
  const [transplantFieldId, setTransplantFieldId] = useState<string>(initialTransplantFieldId || fields[0]?.id || '');
  const [transplantSeedlingCount, setTransplantSeedlingCount] = useState<string>('');
  const [transplantDate, setTransplantDate] = useState<string>('');
  const [transplantSpacing, setTransplantSpacing] = useState<string>('');
  const [transplantResponsible, setTransplantResponsible] = useState<string>('');
  const [transplantNotes, setTransplantNotes] = useState<string>('');

  useEffect(() => {
    if (isTransplantModalOpen && selectedTransplantBatch) {
      setTransplantFieldId(initialTransplantFieldId || fields[0]?.id || '');
      setTransplantSeedlingCount(
        selectedTransplantBatch.estimatedReadyPlants ? selectedTransplantBatch.estimatedReadyPlants.toString() : ''
      );
      setTransplantDate('');
      setTransplantSpacing('');
      setTransplantResponsible('');
      setTransplantNotes('');
    }
  }, [isTransplantModalOpen, selectedTransplantBatch, initialTransplantFieldId, fields]);

  const handleSaveOperationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateOperation({
      fieldId: opFieldId,
      type: opType,
      status: opStatus,
      date: opDate || new Date().toISOString().split('T')[0],
      responsible: opResponsible.trim() || 'Não informado',
      notes: opNotes.trim() || undefined,
      machine: opMachine.trim() || undefined,
      product: opProduct.trim() || undefined,
      dose: opDose ? parseFloat(opDose) : undefined,
      target: opTarget.trim() || undefined,
    });

    setOpResponsible('');
    setOpNotes('');
    setOpMachine('');
    setOpProduct('');
    setOpDose('');
    setOpTarget('');
    setOpDate('');
  };

  const handleSaveAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOverall = parseFloat(editOverallPct);
    const parsedMajor = parseFloat(editMajorMustsPct);
    const parsedMinor = parseFloat(editMinorMustsPct);

    onSaveGlobalGapAudit({
      ...globalGapAudit,
      certificationBody: editCertBody.trim(),
      auditorName: editAuditorName.trim(),
      auditDate: editAuditDate,
      expiryDate: editExpiryDate,
      certificateNumber: editCertificateNumber.trim(),
      farmName: editFarmName.trim(),
      standardVersion: globalGapAudit.standardVersion?.trim() || 'IFA v6.0 - Smart',
      complianceScore: {
        ...globalGapAudit.complianceScore,
        overallPct: Number.isFinite(parsedOverall) ? parsedOverall : 0,
        majorMustsPct: Number.isFinite(parsedMajor) ? parsedMajor : 0,
        minorMustsPct: Number.isFinite(parsedMinor) ? parsedMinor : 0,
      },
      residueAnalysis: {
        ...globalGapAudit.residueAnalysis,
        labName: editLabName.trim(),
        reportNumber: editReportNumber.trim(),
      },
    });
  };

  const handleConfirmTransplantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransplantBatch) return;

    const count = parseInt(transplantSeedlingCount, 10) || selectedTransplantBatch.estimatedReadyPlants || 0;
    onConfirmTransplant({
      batch: selectedTransplantBatch,
      fieldId: transplantFieldId || fields[0]?.id || '',
      seedlingCount: count,
      transplantDate: transplantDate || new Date().toISOString().split('T')[0],
      responsible: transplantResponsible.trim() || 'Não informado',
      notes: transplantNotes.trim(),
      spacing: transplantSpacing.trim() || undefined,
    });
  };

  return (
    <>
      {isIggsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-purple-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Índice IGGS</h3>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 font-extrabold px-2 py-0.5 rounded-full border border-purple-400/30 uppercase tracking-wide">
                      0 a 100 Pontos
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 font-medium">
                    Índice GeaAgro de Gestão da Safra • Avaliação &amp; Rastreabilidade Agronômica
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseIggsModal}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-zinc-300">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
                  <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>O que significa esta pontuação?</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  O <strong>IGGS (Índice GeaAgro de Gestão da Safra)</strong> é o indicador consolidado que mede o grau de eficiência gerencial, conformidade agronômica e rastreabilidade técnica dos talhões de uma propriedade rural.
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Ele atua como um <strong>selo de conformidade de campo</strong> para auditorias sanitárias, certificações socioambientais, bancos e cooperativas (acesso a crédito verde) e atendimento ao MAPA e ANVISA em relação ao controle de resíduos de pesticidas e rastreabilidade da produção.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Como o IGGS é Avaliado? (4 Pilares de 25 Pontos Cada)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        1. Rastreabilidade &amp; Apontamentos
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Avalia o lançamento regular e tempestivo das operações de campo no caderno digital: preparo, dessecação, plantio, adubação, tratamentos fitossanitários e colheita por talhão com responsável técnico e data.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        2. Conformidade e Receituário
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Mede o cumprimento das receitas agronômicas oficiais, observando dosagem/ha recomendada, intervalo de segurança (carência antes da colheita), prazo de reentrada no talhão e rotação de grupos químicos (FRAC, IRAC, HRAC).
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tractor className="w-3.5 h-3.5 text-blue-600" />
                        3. Eficiência Operacional &amp; Clima
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Analisa a produtividade da frota agrícola, horas-máquina trabalhadas x ociosas, consumo de combustível e a realização de pulverizações dentro da Janela Operacional Ideal (IJO: vento 3-10 km/h, umidade &gt; 55%, temp &lt; 30°C).
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5 text-amber-600" />
                        4. Monitoramento MIP &amp; Solo
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Acompanha a periodicidade das vistorias de pragas e doenças no talhão (MIP), estande de plantas e a presença de laudos químicos, físicos e foliares de solo vinculados ao histórico do talhão no GeaAgro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Níveis de Classificação do IGGS</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>90 a 100 pts</span>
                    </div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px] block">🟢 Nível Ouro</span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Excelência gerencial, rastreabilidade auditável completa.</p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>75 a 89 pts</span>
                    </div>
                    <span className="font-bold text-blue-900 dark:text-blue-200 text-[11px] block">🔵 Nível Prata</span>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400">Boa gestão agronômica com pequenas pendências de registro.</p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-extrabold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>60 a 74 pts</span>
                    </div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px] block">🟡 Nível Bronze</span>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">Regularidade mediana, requer mais pontualidade nas entradas.</p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-red-800 dark:text-red-300 font-extrabold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Abaixo de 60 pts</span>
                    </div>
                    <span className="font-bold text-red-900 dark:text-red-200 text-[11px] block">🔴 Nível Crítico</span>
                    <p className="text-[10px] text-red-700 dark:text-red-400">Risco regulatório e lacunas na rastreabilidade dos tratamentos.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  💡 Como aumentar a pontuação IGGS da sua fazenda?
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 text-[11px]">
                  <li>Registre diariamente no <strong>Caderno de Campo</strong> cada operação realizada com data, máquina e operador.</li>
                  <li>Emita sempre o <strong>Receituário Agronômico</strong> antes das aplicações e vincule o número do laudo ao talhão.</li>
                  <li>Consulte o módulo de <strong>Clima &amp; Pluviol</strong> antes da pulverização para garantir IJO dentro dos parâmetros.</li>
                  <li>Mantenha as análises químicas do solo e laudos foliares atualizados na aba de <strong>Análise de Solo</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 p-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={onCloseIggsModal}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isGlobalGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Relatório de Auditoria GLOBALG.A.P.</h3>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
                      IFA v6.0 - Smart
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-medium">
                    {globalGapAudit.certificateNumber || 'Não cadastrado'}
                    {globalGapAudit.farmName ? ` • ${globalGapAudit.farmName}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onCloseGlobalGapModal();
                    onSwitchToEditGlobalGapModal();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Auditoria</span>
                </button>
                <button
                  onClick={onCloseGlobalGapModal}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-zinc-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Conformidade Consolidada</span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{globalGapAudit.complianceScore.overallPct}%</p>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    {globalGapAudit.certificateNumber ? 'Selo de Qualidade Registrado' : 'Aguardando preenchimento'}
                  </span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
                    Obrigatórias Maiores (Major Musts)
                  </span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-200">{globalGapAudit.complianceScore.majorMustsPct}%</p>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 block">Exigido: 100%</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase block">Validade do Certificado</span>
                  <p className="text-sm font-black text-purple-900 dark:text-purple-200 mt-1">
                    {globalGapAudit.expiryDate
                      ? `Até ${globalGapAudit.expiryDate.includes('-') ? globalGapAudit.expiryDate.split('-').reverse().join('/') : globalGapAudit.expiryDate}`
                      : 'Não informada'}
                  </p>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 block">Auditoria Anual de Renovação</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Organismo Certificador Credenciado:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{globalGapAudit.certificationBody || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Auditor Responsável:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{globalGapAudit.auditorName || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Data da Auditoria de Renovação:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    {globalGapAudit.auditDate
                      ? globalGapAudit.auditDate.includes('-')
                        ? globalGapAudit.auditDate.split('-').reverse().join('/')
                        : globalGapAudit.auditDate
                      : 'Não informada'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2 border-slate-200 dark:border-zinc-800">
                  Resumo dos Módulos Verificados na Propriedade
                </h4>
                {globalGapAudit.chapters.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">Nenhum capítulo verificado cadastrado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {globalGapAudit.chapters.map(ch => (
                      <div
                        key={ch.id}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-lg border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-[11px]">
                            {ch.code} - {ch.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {ch.verifiedCount}/{ch.totalCount} pontos em conformidade
                          </span>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">{ch.scorePct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Auditoria registrada no Caderno Digital GeaAgro.</span>
              <button
                onClick={onCloseGlobalGapModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewOperationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Nova Operação Agronômica</h3>
                  <p className="text-xs text-emerald-200 font-medium">Cadastrar intervenção de campo e manejo agronômico</p>
                </div>
              </div>

              <button
                onClick={onCloseNewOperationModal}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOperationSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-zinc-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Talhão Alvo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opFieldId}
                    onChange={e => setOpFieldId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required={fields.length > 0}
                  >
                    <option value="">
                      {fields.length === 0 ? 'Nenhum talhão cadastrado (Operação geral)' : 'Selecione um talhão...'}
                    </option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.areaHa} ha - {f.crop})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Tipo de Operação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opType}
                    onChange={e => setOpType(e.target.value as FieldOperation['type'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="soil_prep">Preparo do Solo (Gradagem / Subsolagem)</option>
                    <option value="planting">Plantio / Semeadura</option>
                    <option value="fertility">Adubação / Nutrição de Solo</option>
                    <option value="spraying">Pulverização / Defensivos</option>
                    <option value="irrigation">Irrigação / Manejo Hídrico</option>
                    <option value="harvest">Colheita</option>
                    <option value="monitoring">Monitoramento de Pragas (MIP)</option>
                    <option value="nursery_sowing">Semeadura em Viveiro</option>
                    <optgroup label="🐃 Bovinocultura & Bubalinos">
                      <option value="buffalo_milking">Bubalino - Controle Leiteiro</option>
                      <option value="buffalo_sanitary">Bubalino - Vacinação e Controle Sanitário</option>
                    </optgroup>
                    <optgroup label="🐐 Caprinocultura">
                      <option value="caprine_vaccination">Caprino - Vacinação Estratégica</option>
                      <option value="caprine_milk">Caprino - Controle Leiteiro / Pesagem</option>
                    </optgroup>
                    <optgroup label="🐴 Equinocultura">
                      <option value="equine_farriery">Equino - Casqueamento e Ferrageamento</option>
                      <option value="equine_vaccination">Equino - Vacinação e Exames</option>
                    </optgroup>
                    <optgroup label="🐖 Suinocultura">
                      <option value="swine_weaning">Suíno - Desmame de Lotes</option>
                      <option value="swine_feeding">Suíno - Manejo Alimentar / Ração</option>
                    </optgroup>
                    <option value="other">Outra Intervenção</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Data da Operação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={opDate}
                    onChange={e => setOpDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Status da Operação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opStatus}
                    onChange={e => setOpStatus(e.target.value as FieldOperation['status'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="completed">Concluído (Realizada)</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="planned">Planejado (Agendada)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Responsável / Operador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={opResponsible}
                    onChange={e => setOpResponsible(e.target.value)}
                    placeholder="Ex: João Silva (Tratorista)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Máquina / Maquinário</label>
                  <input
                    type="text"
                    value={opMachine}
                    onChange={e => setOpMachine(e.target.value)}
                    placeholder="Ex: John Deere 8320R, Uniport 3030..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    {opType === 'planting' ? 'Semente / Cultivar' : opType === 'fertility' ? 'Fertilizante / Adubo' : 'Insumo / Defensivo'}
                  </label>
                  <input
                    type="text"
                    value={opProduct}
                    onChange={e => setOpProduct(e.target.value)}
                    placeholder="Ex: Glifosato 480, NPK 04-14-08, Monsoy 8349..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Dose / Taxa de Aplicação</label>
                  <input
                    type="text"
                    value={opDose}
                    onChange={e => setOpDose(e.target.value)}
                    placeholder="Ex: 2.5 L/ha, 300 kg/ha..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Alvo ou Objetivo Agronômico</label>
                <input
                  type="text"
                  value={opTarget}
                  onChange={e => setOpTarget(e.target.value)}
                  placeholder="Ex: Dessecação pré-plantio, controle de Spodoptera, adubação de cobertura..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Observações Técnicas / Rastreabilidade</label>
                <textarea
                  value={opNotes}
                  onChange={e => setOpNotes(e.target.value)}
                  rows={3}
                  placeholder="Registre prazos de carência (PHI), condições climáticas ou detalhes de rastreabilidade para auditoria..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseNewOperationModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar Operação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditGlobalGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <Edit className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Preencher / Editar Auditoria GLOBALG.A.P.</h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Atualize os dados do organismo certificador, auditor e prazos de validade
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseEditGlobalGapModal}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuditSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-zinc-300 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Organismo Certificador Credenciado</label>
                  <input
                    type="text"
                    value={editCertBody}
                    onChange={e => setEditCertBody(e.target.value)}
                    placeholder="Ex: Control Union Certifications B.V. (ISO 17065)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Entidade de certificação parceira credenciada no IAE / Inmetro.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Auditor Cadastrado GLOBALG.A.P.</label>
                  <input
                    type="text"
                    value={editAuditorName}
                    onChange={e => setEditAuditorName(e.target.value)}
                    placeholder="Ex: Eng. Agrônomo Roberto Carlos Mendes (Auditor Cadastrado GLOBALG.A.P.)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Data da Auditoria de Renovação</label>
                    <input
                      type="date"
                      value={editAuditDate}
                      onChange={e => setEditAuditDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Validade do Certificado</label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={e => setEditExpiryDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Número GGN (GLOBALG.A.P. Number)</label>
                    <input
                      type="text"
                      value={editCertificateNumber}
                      onChange={e => setEditCertificateNumber(e.target.value)}
                      placeholder="Ex: GGN 4063487291034"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Nome da Propriedade / Fazenda</label>
                    <input
                      type="text"
                      value={editFarmName}
                      onChange={e => setEditFarmName(e.target.value)}
                      placeholder="Ex: Fazenda Santa Maria - Sede"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Conformidade Geral (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editOverallPct}
                      onChange={e => setEditOverallPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Major Musts (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editMajorMustsPct}
                      onChange={e => setEditMajorMustsPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Minor Musts (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editMinorMustsPct}
                      onChange={e => setEditMinorMustsPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Laboratório de Análise LMR</label>
                    <input
                      type="text"
                      value={editLabName}
                      onChange={e => setEditLabName(e.target.value)}
                      placeholder="Ex: Eurofins AgroAnalítica do Brasil"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">Nº do Laudo / Relatório LMR</label>
                    <input
                      type="text"
                      value={editReportNumber}
                      onChange={e => setEditReportNumber(e.target.value)}
                      placeholder="Ex: LA-2026-88492-MRL"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseEditGlobalGapModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Dados da Auditoria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransplantModalOpen && selectedTransplantBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-teal-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                  <Flower2 className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Transplante de Mudas de Viveiro para Campo</h3>
                  <p className="text-xs text-teal-200">
                    Rastreabilidade Integrada: Lote {selectedTransplantBatch.batchCode} → Caderno de Campo
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseTransplantModal}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransplantSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                    Lote Selecionado: {selectedTransplantBatch.batchCode}
                  </span>
                  <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold rounded text-[10px]">
                    {selectedTransplantBatch.status === 'pronto_expedicao' ? 'Pronto p/ Expedição' : 'Em Aclimatação'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-zinc-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cultura / Cultivar:</span>
                    <strong>
                      {selectedTransplantBatch.cropName} ({selectedTransplantBatch.cultivar})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Estufa / Bancada:</span>
                    <strong>
                      {selectedTransplantBatch.greenhouse} ({selectedTransplantBatch.benchLocation})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mudas Prontas:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-black">
                      {(selectedTransplantBatch.estimatedReadyPlants ?? 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tipo de Bandeja:</span>
                    <strong>{selectedTransplantBatch.trayType} células</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Talhão de Destino *</label>
                  <select
                    value={transplantFieldId}
                    onChange={e => setTransplantFieldId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="">{fields.length === 0 ? 'Nenhum talhão cadastrado' : 'Selecione um talhão...'}</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.areaHa} ha - Solo {f.soilType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Quantidade de Mudas a Transplantar *</label>
                  <input
                    type="number"
                    min="1"
                    value={transplantSeedlingCount}
                    onChange={e => setTransplantSeedlingCount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500"
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Data do Transplante *</label>
                  <input
                    type="date"
                    value={transplantDate}
                    onChange={e => setTransplantDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">Espaçamento de Plantio (Linha x Planta)</label>
                  <input
                    type="text"
                    value={transplantSpacing}
                    onChange={e => setTransplantSpacing(e.target.value)}
                    placeholder="Ex: 0.50m x 1.20m (16.600 pl/ha)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Agrônomo / Técnico Responsável pelo Transplante
                </label>
                <input
                  type="text"
                  value={transplantResponsible}
                  onChange={e => setTransplantResponsible(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Condições de Plantio &amp; Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={transplantNotes}
                  onChange={e => setTransplantNotes(e.target.value)}
                  placeholder="Ex: Solo subsolado e gradeado, adubação de base incorporada, irrigação por gotejamento acionada 2h antes do transplante para saturação da leira."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseTransplantModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar &amp; Apontar no Caderno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldBookModals;
