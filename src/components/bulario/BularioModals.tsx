import React from 'react';
import {
  X,
  Printer,
  FileText,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PesticideProduct } from '../../types/pesticideLeaflet';
import {
  DuplicateReport,
  STANDARD_AGRICULTURAL_CROPS,
} from '../../utils/pesticideDeduplication';
import { IndexStatistics, SearchResult } from '../../services/pesticideSearchIndex';
import { StorageDiagnostics } from '../../services/pesticideIndexedDB';

export interface BularioConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface CropCoverageReport {
  totalProducts: number;
  totalIndications: number;
  standardCropsCount: number;
  complianceRatePercent: number;
  cropStats: {
    cropName: string;
    productsCount: number;
    avgDosage: number;
  }[];
}

interface BularioModalsProps {
  detailProduct: PesticideProduct | null;
  onCloseDetailProduct: () => void;
  onUseProductInReceituario: (product: PesticideProduct) => void;
  onUseProductInCalculator: (product: PesticideProduct) => void;

  selectedRecipeForView: any | null;
  onCloseRecipeView: () => void;

  showDuplicateAuditModal: boolean;
  onCloseDuplicateAuditModal: () => void;
  duplicateReport: DuplicateReport;
  onRunDeduplication: () => void;

  showCropAuditModal: boolean;
  onCloseCropAuditModal: () => void;
  cropCoverageReport: CropCoverageReport;

  showIndexAuditModal: boolean;
  onCloseIndexAuditModal: () => void;
  searchResult: SearchResult;
  indexStats: IndexStatistics;
  storageDiagnostics: StorageDiagnostics | null;
  isDbReady: boolean;
  totalProductsCount: number;
  onRebuildIndex: () => void;

  confirmDialog: BularioConfirmDialogState | null;
  onCloseConfirmDialog: () => void;
}

export const BularioModals: React.FC<BularioModalsProps> = ({
  detailProduct,
  onCloseDetailProduct,
  onUseProductInReceituario,
  onUseProductInCalculator,
  selectedRecipeForView,
  onCloseRecipeView,
  showDuplicateAuditModal,
  onCloseDuplicateAuditModal,
  duplicateReport,
  onRunDeduplication,
  showCropAuditModal,
  onCloseCropAuditModal,
  cropCoverageReport,
  showIndexAuditModal,
  onCloseIndexAuditModal,
  searchResult,
  indexStats,
  storageDiagnostics,
  isDbReady,
  totalProductsCount,
  onRebuildIndex,
  confirmDialog,
  onCloseConfirmDialog,
}) => {
  return (
    <>
      {/* 1. Modal de Confirmação (substitui window.confirm) */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulario-confirm-title"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <h3
                id="bulario-confirm-title"
                className="text-sm font-semibold text-slate-900 dark:text-zinc-100"
              >
                {confirmDialog.title}
              </h3>
              <button
                type="button"
                onClick={onCloseConfirmDialog}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {confirmDialog.message}
            </div>
            <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseConfirmDialog}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  onCloseConfirmDialog();
                  fn();
                }}
                className={`h-8 px-3 rounded-lg text-white text-xs font-medium cursor-pointer transition-colors ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Ficha Técnica do Defensivo */}
      {detailProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl text-xs">
            {/* Cabeçalho */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {detailProduct.agrochemicalClass}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    MAPA nº {detailProduct.registrationNumber}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {detailProduct.productName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {detailProduct.manufacturer}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseDetailProduct}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Fechar ficha técnica"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo rolável */}
            <div className="overflow-y-auto divide-y divide-slate-200 dark:divide-zinc-800">
              {/* Especificações em grade plana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200/70 dark:bg-zinc-800">
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Ingrediente ativo
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {detailProduct.activeIngredient}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Grupo químico
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {detailProduct.chemicalGroup}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Classe toxicológica
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {detailProduct.toxicologicalClass}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Formulação
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {detailProduct.formulation}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Reentrada sem EPI
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {detailProduct.reentryIntervalHours} horas
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Modo de ação
                  </span>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {detailProduct.modeOfAction || 'Conforme bula oficial'}
                  </strong>
                </div>
              </div>

              {/* Tabela de Indicações */}
              <div className="px-5 py-4 space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Indicações de bula por cultura ({detailProduct.indications.length})
                </h3>
                <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        <th className="py-2 px-3">Cultura</th>
                        <th className="py-2 px-3">Dose</th>
                        <th className="py-2 px-3">Alvo biológico</th>
                        <th className="py-2 px-3 text-right">Carência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {detailProduct.indications.map((i) => (
                        <tr key={i.id}>
                          <td className="py-2 px-3 font-medium text-emerald-700 dark:text-emerald-400">
                            {i.cropName}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                            {i.recommendedDosage} {i.dosageUnit}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">
                            {i.targetOrganism}
                          </td>
                          <td className="py-2 px-3 text-right text-amber-700 dark:text-amber-400 font-medium tabular-nums whitespace-nowrap">
                            {i.gracePeriodDays} dias
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diretrizes de Manejo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200/70 dark:bg-zinc-800 text-[11px]">
                <div className="bg-white dark:bg-zinc-900 px-5 py-3.5 space-y-1">
                  <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                    Tecnologia de aplicação
                  </strong>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Pontas de jato plano de baixa deriva (gotas médias a grossas), calda entre 100 e 200 L/ha em aplicação terrestre. Evitar ventos acima de 10 km/h e UR abaixo de 55%.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3.5 space-y-1">
                  <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                    EPIs obrigatórios
                  </strong>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Macacão impermeável, luvas de nitrila, botas de borracha, óculos de ampla visão e respirador com filtro P2/P3.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3.5 space-y-1">
                  <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                    Manejo de resistência (FRAC/IRAC/HRAC)
                  </strong>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Alternar com produtos de mecanismos de ação distintos e respeitar o limite máximo de aplicações por ciclo.
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-3.5 space-y-1">
                  <strong className="text-slate-900 dark:text-zinc-100 font-semibold block">
                    Reentrada e carência
                  </strong>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Aguardar {detailProduct.reentryIntervalHours} horas para reentrada sem EPI e respeitar o intervalo de segurança por cultura antes da colheita.
                  </p>
                </div>
              </div>

              {detailProduct.notes && (
                <div className="px-5 py-3.5 bg-amber-50/50 dark:bg-amber-950/15 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong className="font-semibold">Observações da bula:</strong> {detailProduct.notes}
                </div>
              )}
            </div>

            {/* Rodapé de Ações */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onUseProductInReceituario(detailProduct)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Emitir receituário</span>
              </button>

              <button
                type="button"
                onClick={() => onUseProductInCalculator(detailProduct)}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Usar na calculadora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Documento Formal de Impressão do Receituário */}
      {selectedRecipeForView && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto text-slate-900"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl my-6 max-h-[92vh] flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-2 print:hidden shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-900 truncate">
                  Receita Técnica {selectedRecipeForView.verificationCode}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onCloseRecipeView}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 inline-flex items-center justify-center cursor-pointer"
                  aria-label="Fechar documento"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .printable-prescription, .printable-prescription * {
                  visibility: visible !important;
                }
                .printable-prescription {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  display: block !important;
                  background-color: white !important;
                  color: black !important;
                }
              }
            `}</style>

            <div className="p-5 overflow-y-auto">
              <div className="printable-prescription bg-white p-6 sm:p-8 border-2 border-slate-900 rounded-lg space-y-5 text-[11px] font-sans text-black">
                {/* Cabeçalho do Documento */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-4 gap-4">
                  <div>
                    <h1 className="text-sm font-bold uppercase text-slate-900 tracking-wide">
                      {selectedRecipeForView.companyName}
                    </h1>
                    <p className="text-[10px] text-slate-700 mt-0.5">
                      <strong>CNPJ:</strong> {selectedRecipeForView.companyCNPJ} |{' '}
                      <strong>CREA PJ:</strong> {selectedRecipeForView.companyCREA}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {selectedRecipeForView.companyAddress} | {selectedRecipeForView.companyContact}
                    </p>
                  </div>
                  <div className="border border-slate-900 px-3 py-2 text-center rounded min-w-[190px]">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wide">
                      Código de Autenticação
                    </span>
                    <strong className="text-xs font-mono text-slate-900 font-bold block mt-0.5">
                      {selectedRecipeForView.verificationCode}
                    </strong>
                    <span className="text-[9px] text-slate-700 font-semibold block mt-0.5">
                      Assinado digitalmente
                    </span>
                  </div>
                </div>

                {/* Título Legal */}
                <div className="text-center py-2 bg-slate-100 border border-slate-900 rounded">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Receituário Agronômico de Defensivos Agrícolas
                  </h2>
                  <span className="text-[9px] text-slate-600">
                    Em conformidade com o Artigo 13 da Lei Federal nº 7.802 de 11 de julho de 1989
                  </span>
                </div>

                {/* RT & Propriedade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-300 pb-4">
                  <div>
                    <h3 className="font-bold uppercase text-slate-900 text-[10px] mb-1">
                      I. Responsável Técnico (RT)
                    </h3>
                    <div className="space-y-0.5 text-slate-800">
                      <p><strong>Engenheiro Agrônomo:</strong> {selectedRecipeForView.rtName}</p>
                      <p><strong>Registro CREA / UF:</strong> {selectedRecipeForView.rtCREA}</p>
                      <p><strong>CPF:</strong> {selectedRecipeForView.rtCPF}</p>
                      <p>
                        <strong>E-mail:</strong> {selectedRecipeForView.rtEmail} |{' '}
                        <strong>Fone:</strong> {selectedRecipeForView.rtPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold uppercase text-slate-900 text-[10px] mb-1">
                      II. Propriedade Agrícola &amp; Proprietário
                    </h3>
                    <div className="space-y-0.5 text-slate-800">
                      <p><strong>Fazenda:</strong> {selectedRecipeForView.farmName}</p>
                      <p><strong>Localização:</strong> {selectedRecipeForView.farmLocation}</p>
                      <p><strong>Proprietário:</strong> {selectedRecipeForView.farmOwner}</p>
                      <p><strong>CPF/CNPJ:</strong> {selectedRecipeForView.farmCPF}</p>
                    </div>
                  </div>
                </div>

                {/* Tabela de Recomendação */}
                <div>
                  <h3 className="font-bold uppercase text-slate-900 text-[10px] mb-1.5">
                    III. Recomendação Técnica de Defensivos
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-900 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                        <th className="py-2 px-2.5 border-r border-slate-900">Cultura</th>
                        <th className="py-2 px-2.5 border-r border-slate-900">Produto Comercial</th>
                        <th className="py-2 px-2.5 border-r border-slate-900">Dosagem</th>
                        <th className="py-2 px-2.5 border-r border-slate-900">Calda</th>
                        <th className="py-2 px-2.5 border-r border-slate-900">Rendimento</th>
                        <th className="py-2 px-2.5">Época de Aplicação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-slate-800">
                        <td className="py-2.5 px-2.5 border-r border-slate-900 font-semibold">
                          {selectedRecipeForView.crop}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-900">
                          <div className="font-bold text-slate-900">
                            {selectedRecipeForView.productName}
                          </div>
                          {(selectedRecipeForView.productManufacturer || selectedRecipeForView.manufacturer) && (
                            <div className="text-[9px] text-slate-700">
                              Detentor: {selectedRecipeForView.productManufacturer || selectedRecipeForView.manufacturer}
                            </div>
                          )}
                          {(selectedRecipeForView.productRegistration || selectedRecipeForView.registrationNumber) && (
                            <div className="text-[9px] font-mono text-slate-600">
                              MAPA {selectedRecipeForView.productRegistration || selectedRecipeForView.registrationNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-900 font-bold text-emerald-800 tabular-nums">
                          {selectedRecipeForView.dosage}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-900 font-medium tabular-nums">
                          {selectedRecipeForView.waterVolumeLha
                            ? `${selectedRecipeForView.waterVolumeLha} L/ha`
                            : '150 L/ha'}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-900 tabular-nums">
                          {selectedRecipeForView.computedHectares ? (
                            <div>
                              <span className="font-bold text-emerald-800">
                                {selectedRecipeForView.computedHectares.toFixed(1)} ha
                              </span>
                              <span className="text-[9px] text-slate-600 block">
                                Compra: {selectedRecipeForView.purchasedQty}{' '}
                                {selectedRecipeForView.purchasedUnit || 'L'}
                              </span>
                              <span className="text-[9px] text-slate-600 block">
                                Calda: {Math.round(selectedRecipeForView.computedTotalWater || 0).toLocaleString('pt-BR')} L
                              </span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2.5 px-2.5">{selectedRecipeForView.applicationEpoch}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Logística e Instruções */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-300 pb-4">
                  <div>
                    <h3 className="font-bold uppercase text-slate-900 text-[10px] mb-1">
                      IV. Logística Reversa de Embalagens Vazias
                    </h3>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-[10px] leading-relaxed text-slate-700">
                      <p className="font-semibold text-slate-900">{selectedRecipeForView.returnLocation}</p>
                      <p className="text-[9px] text-slate-500 mt-1">
                        Devolução obrigatória das embalagens vazias e tampas no prazo máximo de 1 ano da compra.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold uppercase text-slate-900 text-[10px] mb-1">
                      V. Instruções Técnicas &amp; Segurança
                    </h3>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-[10px] leading-relaxed text-slate-700">
                      {selectedRecipeForView.notes}
                    </div>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="text-center space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase block">
                      Assinatura de Recebimento do Produtor
                    </span>
                    <div className="h-[88px] border border-slate-300 bg-slate-50 rounded flex items-center justify-center overflow-hidden">
                      {selectedRecipeForView.producerSignature ? (
                        <img
                          src={selectedRecipeForView.producerSignature}
                          alt="Assinatura Produtor"
                          className="max-h-[78px] object-contain max-w-full"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Assinatura física ou pendente
                        </span>
                      )}
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <strong className="text-slate-900 block text-[10px]">
                        {selectedRecipeForView.producerName}
                      </strong>
                      <span className="text-[9px] text-slate-500 block">Produtor Responsável</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase block">
                      Assinatura Digital do Responsável Técnico
                    </span>
                    <div className="h-[88px] border border-emerald-400 bg-emerald-50/20 rounded flex items-center justify-center overflow-hidden">
                      {selectedRecipeForView.rtSignature ? (
                        <img
                          src={selectedRecipeForView.rtSignature}
                          alt="Assinatura RT"
                          className="max-h-[78px] object-contain max-w-full mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold italic">
                          Assinatura vinculada CREA
                        </span>
                      )}
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <strong className="text-slate-900 block text-[10px]">
                        {selectedRecipeForView.rtName}
                      </strong>
                      <span className="text-[9px] text-slate-500 block">
                        Engenheiro Agrônomo — {selectedRecipeForView.rtCREA}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé */}
                <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] text-slate-500">
                  <span>
                    Chave eletrônica: <strong className="font-mono">{selectedRecipeForView.id.toUpperCase()}</strong>
                  </span>
                  <span>Emitido em {new Date(selectedRecipeForView.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Auditoria de Duplicidades */}
      {showDuplicateAuditModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl text-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Auditoria de integridade e duplicidades
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Verificação de registros MAPA, nomes comerciais e princípios ativos repetidos.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseDuplicateAuditModal}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-200 dark:divide-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Catálogo</span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {duplicateReport.totalProducts.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Nomes únicos</span>
                  <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {duplicateReport.uniqueNamesCount.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Grupos</span>
                  <strong
                    className={`text-base font-semibold ${
                      duplicateReport.totalDuplicateGroups === 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {duplicateReport.totalDuplicateGroups}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Duplicados</span>
                  <strong
                    className={`text-base font-semibold ${
                      duplicateReport.totalDuplicateItems === 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {duplicateReport.totalDuplicateItems}
                  </strong>
                </div>
              </div>

              <div className="p-5">
                {duplicateReport.totalDuplicateGroups === 0 ? (
                  <div className="flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Catálogo íntegro — nenhuma duplicidade encontrada</strong>
                      <p className="text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Todos os {duplicateReport.totalProducts.toLocaleString('pt-BR')} defensivos possuem registros únicos no bulário.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Foram detectados <strong>{duplicateReport.totalDuplicateGroups}</strong> grupo(s) redundantes. Utilize a desduplicação para consolidar os registros.
                      </p>
                    </div>
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-lg divide-y divide-slate-100 dark:divide-zinc-800 max-h-56 overflow-y-auto">
                      {duplicateReport.duplicateGroups.map((group, idx) => (
                        <div key={idx} className="px-3.5 py-2.5 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                              {idx + 1}. {group.key}
                            </strong>
                            <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 tabular-nums">
                              {group.count} ocorrências
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {group.products
                              .map((p) => `${p.productName} (${p.manufacturer}, MAPA ${p.registrationNumber})`)
                              .join(' · ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              {duplicateReport.totalDuplicateGroups > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onRunDeduplication();
                    onCloseDuplicateAuditModal();
                  }}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Desduplicar agora
                </button>
              )}
              <button
                type="button"
                onClick={onCloseDuplicateAuditModal}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Cobertura de Culturas */}
      {showCropAuditModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl text-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Cobertura de culturas e dosagens
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Verificação das recomendações cadastradas nas {STANDARD_AGRICULTURAL_CROPS.length} culturas padrão.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseCropAuditModal}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-200 dark:divide-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Defensivos</span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {cropCoverageReport.totalProducts.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Indicações</span>
                  <strong className="text-base font-semibold text-teal-700 dark:text-teal-400">
                    {cropCoverageReport.totalIndications.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Culturas</span>
                  <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {cropCoverageReport.standardCropsCount} / {STANDARD_AGRICULTURAL_CROPS.length}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Conformidade</span>
                  <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {cropCoverageReport.complianceRatePercent}%
                  </strong>
                </div>
              </div>

              <div className="p-5">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        <th className="py-2 px-3">Cultura</th>
                        <th className="py-2 px-3 text-right">Dose média</th>
                        <th className="py-2 px-3 text-right">Produtos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                      {cropCoverageReport.cropStats.map((stat, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">
                            {stat.cropName}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-300">
                            {stat.avgDosage} L ou kg/ha
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                            {stat.productsCount.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end">
              <button
                type="button"
                onClick={onCloseCropAuditModal}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Índice e Armazenamento Local */}
      {showIndexAuditModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-xl w-full overflow-hidden shadow-xl text-xs">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Índice de busca e banco offline
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Estado atual da persistência local e do índice invertido em memória.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseIndexAuditModal}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Resposta</span>
                  <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {searchResult.latencyMs} ms
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Indexados</span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {indexStats.totalProducts.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Termos</span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {indexStats.totalTokens.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Armazenamento</span>
                  <strong className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                    {storageDiagnostics?.engine || 'IndexedDB'}
                  </strong>
                </div>
              </div>

              <div className="px-5 py-4 space-y-2 text-slate-600 dark:text-zinc-300 tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Banco local</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isDbReady ? 'Conectado' : 'Inicializando'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Registros salvos</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100">
                    {(storageDiagnostics?.totalProductsCount ?? totalProductsCount).toLocaleString('pt-BR')} defensivos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Última indexação</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100">
                    {indexStats.indexBuildTimeMs} ms ·{' '}
                    {new Date(indexStats.lastIndexedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onRebuildIndex}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconstruir índice</span>
              </button>
              <button
                type="button"
                onClick={onCloseIndexAuditModal}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
