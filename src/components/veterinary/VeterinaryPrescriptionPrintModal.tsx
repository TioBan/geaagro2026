import React, { useState } from 'react';
import { Printer, X, QrCode } from 'lucide-react';
import { VeterinaryPrescription } from '../../types/veterinaryBulario';
import { Company } from '../../types/agronomy';

interface VeterinaryPrescriptionPrintModalProps {
  prescription: VeterinaryPrescription;
  companies: Company[];
  currentCompany?: Company;
  onClose: () => void;
}

export const VeterinaryPrescriptionPrintModal: React.FC<VeterinaryPrescriptionPrintModalProps> = ({
  prescription,
  companies,
  currentCompany,
  onClose,
}) => {
  const [printViaMode, setPrintViaMode] = useState<'todas' | 'via1' | 'via2'>('todas');

  const targetCompany = prescription.companyId
    ? companies.find((c) => c.id === prescription.companyId)
    : currentCompany;

  const targetLogoUrl =
    prescription.companyLogoUrl || targetCompany?.logoUrl || currentCompany?.logoUrl;

  const targetCompanyName =
    prescription.companyName ||
    targetCompany?.tradingName ||
    targetCompany?.name ||
    currentCompany?.tradingName ||
    currentCompany?.name;

  const isSpecialControl = prescription.prescriptionType === 'controle_especial';

  const getDocumentTitle = () => {
    switch (prescription.prescriptionType) {
      case 'controle_especial':
        return 'RECEITUÁRIO DE CONTROLE ESPECIAL';
      case 'notificacao_receita':
        return 'NOTIFICAÇÃO DE RECEITA VETERINÁRIA';
      case 'orientacao_manejo':
        return 'GUIA DE ORIENTAÇÃO E MANEJO SANITÁRIO';
      default:
        return 'RECEITUÁRIO VETERINÁRIO';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-xl max-w-4xl w-full shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-4 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Toolbar (Hidden on print) */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
                Impressão Oficial A4 (CFMV / MAPA)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Receituário nº {prescription.prescriptionNumber}
              </p>
            </div>
          </div>

          {isSpecialControl && (
            <div className="inline-flex items-center gap-0.5 bg-slate-200/70 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
              {(
                [
                  { id: 'todas', label: 'As 2 Vias' },
                  { id: 'via1', label: '1ª Via (Farmácia)' },
                  { id: 'via2', label: '2ª Via (Produtor)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPrintViaMode(opt.id)}
                  className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    printViaMode === opt.id
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
              aria-label="Fechar visualização"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-zinc-950 flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            {/* VIA 1 */}
            {(printViaMode === 'todas' || printViaMode === 'via1') && (
              <div
                id="prescription-page-via-1"
                className="bg-white p-7 sm:p-9 rounded-lg border border-slate-300 text-slate-900 font-sans space-y-5 text-xs shadow-xs"
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {targetLogoUrl ? (
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={targetLogoUrl}
                          alt={targetCompanyName || 'Logotipo da Empresa'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(targetCompanyName || 'CV').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        {targetCompanyName || 'CONSELHO REGIONAL DE MEDICINA VETERINÁRIA'}
                      </span>
                      <h1 className="text-base font-bold uppercase text-slate-900 tracking-tight mt-0.5">
                        {getDocumentTitle()}
                      </h1>
                      <p className="text-[11px] text-slate-600">
                        {isSpecialControl
                          ? '1ª VIA — RETENÇÃO DA FARMÁCIA / ESTABELECIMENTO VETERINÁRIO'
                          : 'VIA ÚNICA DO PRODUTOR / ORIENTAÇÃO TÉCNICA'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-[10px] text-slate-500 block font-medium">NÚMERO OFICIAL</span>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {prescription.prescriptionNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">Data: {prescription.date}</span>
                  </div>
                </div>

                {/* Prescriber & Farm */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Médico Veterinário Emitente
                    </span>
                    <div className="font-bold text-slate-900 text-xs">{prescription.veterinarianName}</div>
                    <div className="font-semibold text-emerald-900">
                      CRMV-{prescription.crmvState} nº {prescription.crmvNumber}
                    </div>
                    {prescription.veterinarianCpf && (
                      <div className="text-slate-600 tabular-nums">CPF: {prescription.veterinarianCpf}</div>
                    )}
                    {prescription.veterinarianPhone && (
                      <div className="text-slate-600 tabular-nums">Tel.: {prescription.veterinarianPhone}</div>
                    )}
                    {prescription.clinicAddress && (
                      <div className="text-slate-500 text-[10px]">{prescription.clinicAddress}</div>
                    )}
                  </div>

                  <div className="space-y-0.5 border-l pl-4 border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Propriedade &amp; Produtor
                    </span>
                    <div className="font-bold text-slate-900 text-xs">{prescription.farmName}</div>
                    <div className="text-slate-700">
                      Produtor: <strong>{prescription.producerName}</strong>
                    </div>
                    {prescription.producerCpfCnpj && (
                      <div className="text-slate-600 tabular-nums">
                        CPF/CNPJ: {prescription.producerCpfCnpj}
                      </div>
                    )}
                    <div className="text-slate-500 text-[10px]">
                      Município: {prescription.location || prescription.cityState}
                    </div>
                  </div>
                </div>

                {/* Animal & Diagnosis */}
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Espécie</span>
                    <span className="font-semibold text-slate-900">{prescription.species}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Identificação / Lote</span>
                    <span className="font-semibold text-slate-900">{prescription.animalIdentifier}</span>
                  </div>
                  <div className="tabular-nums">
                    <span className="text-slate-500 block text-[10px]">Qtd. / Peso Médio</span>
                    <span className="font-semibold text-slate-900">
                      {prescription.animalCount || 1} cab · {prescription.estimatedWeightKg || '—'} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Diagnóstico</span>
                    <span className="font-semibold text-emerald-950">{prescription.clinicalDiagnosis}</span>
                  </div>
                </div>

                {/* Prescribed Items */}
                <div className="space-y-2.5">
                  <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-slate-900">
                      Prescrição Terapêutica (Uso Veterinário)
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                      {(prescription.items || []).length} item(ns)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {(prescription.items || []).map((it, idx) => (
                      <div key={it.id || idx} className="border-b border-slate-100 pb-2.5 last:border-0">
                        <div className="flex items-start justify-between gap-2 font-semibold text-xs">
                          <span className="text-slate-900">
                            {idx + 1}. {it.productName} ({it.activeIngredient})
                          </span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                            Qtd: {it.totalQuantityNeeded}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-700 space-y-0.5">
                          <div>
                            Posologia: <strong>{it.calculatedDose}</strong> · Via {it.route} · {it.frequency} ·{' '}
                            {it.durationDays} dia(s).
                          </div>
                          {it.instructions && (
                            <div className="text-[10px] text-slate-600 italic">{it.instructions}</div>
                          )}
                          {(it.meatGracePeriod || it.milkGracePeriod) && (
                            <div className="text-[10px] font-medium text-amber-900 mt-0.5">
                              Carência: Abate ({it.meatGracePeriod || 'Zero'}) · Leite ({it.milkGracePeriod || 'Zero'})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grace Period Declaration */}
                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-300 text-[10px] text-amber-950 space-y-1">
                  <div className="font-bold uppercase tracking-wide">
                    Declaração Obrigatória de Carência Sanitária (MAPA)
                  </div>
                  <div>
                    <strong>Carne / Abate:</strong> {prescription.meatGracePeriodSummary || 'Respeitar bula'} ·{' '}
                    <strong>Leite / Ordenha:</strong> {prescription.milkGracePeriodSummary || 'Respeitar bula'}
                  </div>
                  {prescription.generalInstructions && (
                    <div className="text-slate-700 pt-0.5">{prescription.generalInstructions}</div>
                  )}
                  <div className="text-[9px] text-amber-900">
                    O produtor declara estar ciente de que os produtos de origem animal tratados não poderão ser destinados ao consumo humano antes do cumprimento integral dos prazos de carência.
                  </div>
                </div>

                {/* Signature Footer */}
                <div className="pt-5 border-t border-slate-900 grid grid-cols-2 gap-6 items-end">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-11 h-11 text-slate-800 shrink-0" />
                    <div className="text-[9px] text-slate-500 leading-tight tabular-nums">
                      Padrão CFMV / MAPA
                      <br />
                      Protocolo: {prescription.prescriptionNumber}
                      <br />
                      Válido até: <strong>{prescription.validUntil}</strong>
                    </div>
                  </div>

                  <div className="text-center space-y-0.5">
                    <div className="border-b border-slate-400 w-48 mx-auto mb-1" />
                    <div className="font-bold text-xs text-slate-900">{prescription.veterinarianName}</div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Médico(a) Veterinário(a) · CRMV-{prescription.crmvState} nº {prescription.crmvNumber}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIA 2 (Controle Especial) */}
            {isSpecialControl && (printViaMode === 'todas' || printViaMode === 'via2') && (
              <div
                id="prescription-page-via-2"
                className="bg-white p-7 sm:p-9 rounded-lg border border-slate-400 text-slate-900 font-sans space-y-5 text-xs shadow-xs break-before-page"
              >
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {targetLogoUrl ? (
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={targetLogoUrl}
                          alt={targetCompanyName || 'Logotipo da Empresa'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(targetCompanyName || 'CV').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        {targetCompanyName || 'CONSELHO REGIONAL DE MEDICINA VETERINÁRIA'}
                      </span>
                      <h1 className="text-base font-bold uppercase text-slate-900 tracking-tight mt-0.5">
                        RECEITUÁRIO DE CONTROLE ESPECIAL
                      </h1>
                      <p className="text-[11px] text-slate-700 font-semibold">
                        2ª VIA — ORIENTAÇÃO DO PRODUTOR RURAL / TUTOR (NÃO RETER NA FARMÁCIA)
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-[10px] text-slate-500 block font-medium">NÚMERO OFICIAL</span>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {prescription.prescriptionNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">Data: {prescription.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Médico Veterinário Emitente
                    </span>
                    <div className="font-bold text-slate-900 text-xs">{prescription.veterinarianName}</div>
                    <div className="font-semibold text-slate-800">
                      CRMV-{prescription.crmvState} nº {prescription.crmvNumber}
                    </div>
                    {prescription.veterinarianCpf && (
                      <div className="text-slate-600 tabular-nums">CPF: {prescription.veterinarianCpf}</div>
                    )}
                  </div>
                  <div className="space-y-0.5 border-l pl-4 border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Propriedade &amp; Produtor
                    </span>
                    <div className="font-bold text-slate-900 text-xs">{prescription.farmName}</div>
                    <div className="text-slate-700">
                      Produtor: <strong>{prescription.producerName}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="border-b border-slate-800 pb-1">
                    <span className="font-bold text-xs uppercase tracking-wide text-slate-900">
                      Prescrição Terapêutica (Instruções ao Produtor)
                    </span>
                  </div>
                  {(prescription.items || []).map((it, idx) => (
                    <div key={it.id || idx} className="border-b border-slate-100 pb-2 last:border-0">
                      <div className="flex items-start justify-between gap-2 font-semibold text-xs">
                        <span className="text-slate-900">
                          {idx + 1}. {it.productName} ({it.activeIngredient})
                        </span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                          Qtd: {it.totalQuantityNeeded}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-700 space-y-0.5">
                        <div>
                          Posologia: <strong>{it.calculatedDose}</strong> · Via {it.route} · {it.frequency} ·{' '}
                          {it.durationDays} dia(s).
                        </div>
                        {it.instructions && (
                          <div className="text-[10px] text-slate-600 italic">{it.instructions}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buyer / Pharmacy Dispensation Identification */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5 text-[10px]">
                  <span className="font-bold uppercase tracking-wide text-slate-800 block">
                    Identificação do Comprador / Dispensação na Farmácia
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Nome: {prescription.buyerName || '_________________________________'}</div>
                    <div>CPF/RG: {prescription.buyerDocument || '______________________________'}</div>
                    <div>Endereço: {prescription.buyerAddress || '____________________________'}</div>
                    <div>Telefone: {prescription.buyerPhone || '_____________________________'}</div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-900 grid grid-cols-2 gap-6 items-end">
                  <div className="text-[9px] text-slate-500">
                    Mantenha esta via arquivada na propriedade para comprovação em fiscalizações sanitárias e rastreabilidade.
                  </div>
                  <div className="text-center space-y-0.5">
                    <div className="border-b border-slate-400 w-48 mx-auto mb-1" />
                    <div className="font-bold text-xs text-slate-900">{prescription.veterinarianName}</div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Médico(a) Veterinário(a) · CRMV-{prescription.crmvState} nº {prescription.crmvNumber}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500 dark:text-zinc-400">
            Documento formatado para impressão em papel A4
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
