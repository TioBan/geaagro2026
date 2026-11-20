import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  downloadSoilCsvTemplate,
  ImportValidationResult,
} from '../../utils/spreadsheetTemplate';

interface SoilCsvImportViewProps {
  importResult: ImportValidationResult | null;
  onFileUpload: (file: File) => void;
  onConfirmImport: () => void;
}

export const SoilCsvImportView: React.FC<SoilCsvImportViewProps> = ({
  importResult,
  onFileUpload,
  onConfirmImport,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Importação em Lote de Análises de Solo (CSV)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Envie a planilha no padrão CSV. O validador químico verifica até 50 amostras antes de salvar.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSoilCsvTemplate}
          className="h-8 px-3 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar planilha modelo (.csv)</span>
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            onFileUpload(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg px-5 py-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
            : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileUpload(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
        <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
          Arraste o arquivo CSV aqui ou clique para selecionar
        </p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Suporta até 50 amostras por envio, separadas por ponto e vírgula (;) ou vírgula (,).
        </p>
      </div>

      {importResult && (() => {
        const importableSamples = (importResult.samples || []).filter((s) => s.status !== 'invalid');
        const errorIssues = (importResult.issues || []).filter((i) => i.type === 'error');
        const warningIssues = (importResult.issues || []).filter((i) => i.type === 'warning');

        return (
          <div className="space-y-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Validação:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {importableSamples.length} válidas
                </span>
                {errorIssues.length > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {errorIssues.length} erros
                    </span>
                  </>
                )}
                {warningIssues.length > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {warningIssues.length} alertas
                    </span>
                  </>
                )}
              </div>

              <button
                id="btn-confirm-import-data"
                type="button"
                disabled={importableSamples.length === 0}
                onClick={onConfirmImport}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar {importableSamples.length} Amostras Válidas</span>
              </button>
            </div>

            {errorIssues.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-md p-3 text-xs space-y-1">
                <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Inconsistências encontradas nas linhas</span>
                </div>
                <ul className="list-disc list-inside text-rose-700 dark:text-rose-300/90 space-y-0.5 text-[11px]">
                  {errorIssues.map((issue, i) => (
                    <li key={i}>
                      {issue.rowNumber > 0 ? `Linha ${issue.rowNumber} (${issue.sampleCode}): ` : ''}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {warningIssues.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-3 text-xs space-y-1">
                <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Avisos de validação</span>
                </div>
                <ul className="list-disc list-inside text-amber-700 dark:text-amber-300/90 space-y-0.5 text-[11px]">
                  {warningIssues.map((issue, i) => (
                    <li key={i}>
                      {issue.rowNumber > 0 ? `Linha ${issue.rowNumber} (${issue.sampleCode}): ` : ''}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
