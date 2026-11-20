import React, { useRef, useState } from 'react';
import {
  Camera,
  FileText,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Edit3,
} from 'lucide-react';
import { Farm, SoilSample } from '../../types/agronomy';
import { SoilSampleForm, SoilSampleFormState } from './SoilSampleForm';

export interface OcrUploadedFile {
  name: string;
  type: string;
  previewUrl?: string;
}

interface SoilOcrViewProps {
  useOfflineOcr: boolean;
  setUseOfflineOcr: (offline: boolean) => void;
  ocrLoading: boolean;
  ocrFile: OcrUploadedFile | null;
  ocrRawSummary: string | null;
  extractedFields: Set<string>;
  onSelectFile: (file: File) => void;
  formData: SoilSampleFormState;
  setFormData: React.Dispatch<React.SetStateAction<SoilSampleFormState>>;
  kUnit: 'cmolc' | 'mg';
  onKUnitChange: (unit: 'cmolc' | 'mg') => void;
  liveIndices: Partial<SoilSample>;
  selectedFarm: Farm;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const SoilOcrView: React.FC<SoilOcrViewProps> = ({
  useOfflineOcr,
  setUseOfflineOcr,
  ocrLoading,
  ocrFile,
  ocrRawSummary,
  extractedFields,
  onSelectFile,
  formData,
  setFormData,
  kUnit,
  onKUnitChange,
  liveIndices,
  selectedFarm,
  onSubmit,
  onCancel,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Área de Envio de Laudo */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Leitura Inteligente de Laudos (Foto ou PDF)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Envie a imagem ou PDF do laboratório para preencher nutrientes, frações e índices automaticamente.
            </p>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setUseOfflineOcr(false)}
              className={`h-7 px-2.5 rounded-sm text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                !useOfflineOcr
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Online (IA)</span>
            </button>
            <button
              type="button"
              onClick={() => setUseOfflineOcr(true)}
              className={`h-7 px-2.5 rounded-sm text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                useOfflineOcr
                  ? 'bg-slate-800 dark:bg-zinc-700 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline (Básico)</span>
            </button>
          </div>
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
              onSelectFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className={`border border-dashed rounded-lg px-5 py-7 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-950/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onSelectFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          {ocrLoading ? (
            <div className="py-3 space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Extraindo dados químicos do laudo...
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Identificando pH, M.O., bases trocáveis, micronutrientes e granulometria.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Clique para selecionar ou arraste a Foto / PDF do laudo aqui
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Formatos aceitos: JPG, PNG, WEBP e PDF (até 20 MB).
              </p>

              {ocrFile && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {ocrFile.previewUrl && (
                    <img
                      src={ocrFile.previewUrl}
                      alt={`Pré-visualização de ${ocrFile.name}`}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded border border-slate-200 dark:border-zinc-700 object-cover"
                    />
                  )}
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-xs">{ocrFile.name}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {ocrRawSummary && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-md p-3 text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
            <div className="font-semibold">Resumo da extração</div>
            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90">
              {ocrRawSummary}
            </p>
          </div>
        )}
      </div>

      {/* Revisão e Edição dos Dados Extraídos */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              Revisão dos Dados Extraídos
            </span>
            {extractedFields.size > 0 && (
              <>
                <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                  ·
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
                  {extractedFields.size} campos preenchidos automaticamente
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-8 px-2.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trocar arquivo</span>
          </button>
        </div>

        <SoilSampleForm
          formData={formData}
          setFormData={setFormData}
          kUnit={kUnit}
          onKUnitChange={onKUnitChange}
          liveIndices={liveIndices}
          selectedFarm={selectedFarm}
          extractedFields={extractedFields}
          submitLabel="Salvar Análise e Calcular Índices"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};
