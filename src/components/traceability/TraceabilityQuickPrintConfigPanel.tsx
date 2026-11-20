import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Printer,
  QrCode,
  Scale,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Cpu,
  Check,
} from 'lucide-react';
import {
  TraceabilityLabelSettings,
  QRCodeSize,
  PrintFormat,
  TraceabilityUnit,
  LabelSize,
  PrinterDpi,
  PrinterType,
} from '../../types/traceability';
import { DEFAULT_TRACEABILITY_LABEL_SETTINGS } from '../../data/traceabilityData';

interface TraceabilityQuickPrintConfigPanelProps {
  settings: TraceabilityLabelSettings;
  onUpdateSettings: (newSettings: TraceabilityLabelSettings) => void;
  isOpenDefault?: boolean;
}

const QR_SIZE_META: Record<QRCodeSize, { title: string; scale: string }> = {
  pequeno: { title: 'Pequeno', scale: '80px' },
  medio: { title: 'Médio', scale: '120px' },
  grande: { title: 'Grande', scale: '160px' },
};

const UNIT_OPTIONS: { unit: TraceabilityUnit; label: string }[] = [
  { unit: 'kg', label: 'kg (Quilos)' },
  { unit: 'cx', label: 'cx (Caixas)' },
  { unit: 'sc', label: 'sc (Sacas)' },
  { unit: 'un', label: 'un (Unidades)' },
  { unit: 't', label: 't (Toneladas)' },
  { unit: 'g', label: 'g (Gramas)' },
];

export const TraceabilityQuickPrintConfigPanel: React.FC<TraceabilityQuickPrintConfigPanelProps> = ({
  settings,
  onUpdateSettings,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [tempSettings, setTempSettings] = useState<TraceabilityLabelSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setTempSettings({ ...settings });
  }, [settings]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const triggerSavedFeedback = () => {
    setSavedFeedback(true);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleSave = () => {
    onUpdateSettings(tempSettings);
    try {
      localStorage.setItem('geaagro_traceability_label_settings', JSON.stringify(tempSettings));
    } catch (e) {
      console.error('Erro ao persistir configurações:', e);
    }
    triggerSavedFeedback();
  };

  const handleReset = () => {
    setTempSettings({ ...DEFAULT_TRACEABILITY_LABEL_SETTINGS });
    onUpdateSettings(DEFAULT_TRACEABILITY_LABEL_SETTINGS);
    try {
      localStorage.setItem('geaagro_traceability_label_settings', JSON.stringify(DEFAULT_TRACEABILITY_LABEL_SETTINGS));
    } catch (e) {
      console.error('Erro ao persistir configurações:', e);
    }
    triggerSavedFeedback();
  };

  const currentQrSize: QRCodeSize = tempSettings.qrCodeSize || 'medio';
  const currentFormat: PrintFormat =
    tempSettings.printFormat || (tempSettings.defaultPrinterType === 'padrao_a4' ? 'pdf' : 'termica');
  const currentUnit: TraceabilityUnit = tempSettings.defaultUnit || 'kg';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Compact Header Bar */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-zinc-950/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
              Configuração Rápida de Etiquetas
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              Preferências padrão para etiquetas térmicas e PDF
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isOpen && (
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300">
                QR: <span className="text-emerald-700 dark:text-emerald-400 capitalize">{currentQrSize}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300">
                Saída: <span className="text-emerald-700 dark:text-emerald-400 uppercase">{currentFormat}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300">
                Unid.: <span className="text-emerald-700 dark:text-emerald-400 uppercase">{currentUnit}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 tabular-nums">
                {tempSettings.defaultSize} mm
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ml-auto"
          >
            {isOpen ? (
              <>
                <span>Recolher</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              </>
            ) : (
              <>
                <span>Ajustar</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Quick Settings Content */}
      {isOpen && (
        <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Tamanho do QR Code */}
            <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Tamanho do QR Code</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Dimensão óptica para leitura na colheita e ponto de venda.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {(['pequeno', 'medio', 'grande'] as QRCodeSize[]).map(size => {
                  const isSelected = currentQrSize === size;
                  const info = QR_SIZE_META[size];
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTempSettings(prev => ({ ...prev, qrCodeSize: size }))}
                      className={`p-2 rounded-lg text-left transition-colors border cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold">{info.title}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </div>
                      <span className={`text-[10px] mt-0.5 tabular-nums ${isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {info.scale}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Formato de Impressão */}
            <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Formato Padrão de Saída</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Documento PDF (A4/navegador) ou etiqueta térmica industrial.
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setTempSettings(prev => ({
                      ...prev,
                      printFormat: 'pdf',
                      defaultPrinterType: 'padrao_a4',
                    }))
                  }
                  className={`p-2 rounded-lg text-left transition-colors border cursor-pointer flex flex-col justify-between ${
                    currentFormat === 'pdf'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      PDF / A4
                    </span>
                    {currentFormat === 'pdf' && <Check className="w-3 h-3 shrink-0" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 ${currentFormat === 'pdf' ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                    Folha padrão ou laser
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTempSettings(prev => ({
                      ...prev,
                      printFormat: 'termica',
                      defaultPrinterType: prev.defaultPrinterType === 'padrao_a4' ? 'zebra_zpl' : prev.defaultPrinterType,
                    }))
                  }
                  className={`p-2 rounded-lg text-left transition-colors border cursor-pointer flex flex-col justify-between ${
                    currentFormat === 'termica'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      Térmica
                    </span>
                    {currentFormat === 'termica' && <Check className="w-3 h-3 shrink-0" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 ${currentFormat === 'termica' ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                    Zebra ZPL / Elgin / Argox
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Unidade de Medida Padrão */}
            <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-3.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Unidade de Medida Padrão</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Unidade exibida na pesagem, embalagem e romaneio.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {UNIT_OPTIONS.map(({ unit, label }) => {
                  const isSelected = currentUnit === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setTempSettings(prev => ({ ...prev, defaultUnit: unit }))}
                      className={`h-7 rounded-md text-center transition-colors border cursor-pointer font-semibold text-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                      title={label}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Dimensão da Etiqueta
              </label>
              <select
                value={tempSettings.defaultSize}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultSize: e.target.value as LabelSize }))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="100x50">100 × 50 mm (Padrão Caixas Ceasa)</option>
                <option value="100x150">100 × 150 mm (Logística / Pallet)</option>
                <option value="60x40">60 × 40 mm (Mini bandeja / Fruta)</option>
                <option value="150x200">150 × 200 mm (Pallet Master)</option>
                <option value="a4_multipage">Folha A4 Multipáginas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Protocolo / Impressora
              </label>
              <select
                value={tempSettings.defaultPrinterType}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultPrinterType: e.target.value as PrinterType }))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="zebra_zpl">Zebra ZPL II (Térmica Industrial)</option>
                <option value="elgin_escpos">Elgin / Bematech ESC/POS</option>
                <option value="argox_ppla">Argox PPLA / PPLB</option>
                <option value="brother">Brother P-Touch / ESC/P</option>
                <option value="padrao_a4">PDF / Impressora Convencional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Resolução Térmica
              </label>
              <select
                value={tempSettings.defaultDpi}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultDpi: Number(e.target.value) as PrinterDpi }))}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value={203}>203 DPI (8 pontos/mm - Padrão)</option>
                <option value={300}>300 DPI (12 pontos/mm - Alta)</option>
                <option value={600}>600 DPI (24 pontos/mm - Ultra)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Cópias Padrão / Lote
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={tempSettings.defaultCopies}
                onChange={e =>
                  setTempSettings(prev => ({ ...prev, defaultCopies: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                }
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
            <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              Ativo: <strong className="text-slate-700 dark:text-zinc-200">QR {currentQrSize.toUpperCase()}</strong> ({QR_SIZE_META[currentQrSize].scale}) •{' '}
              <strong className="text-slate-700 dark:text-zinc-200">{currentFormat.toUpperCase()}</strong> •{' '}
              <strong className="text-slate-700 dark:text-zinc-200">{currentUnit.toUpperCase()}</strong> •{' '}
              <strong className="text-slate-700 dark:text-zinc-200">{tempSettings.defaultSize} mm</strong>
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
                title="Restaurar configurações de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Padrões
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="h-8 px-3.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Preferências
              </button>
            </div>
          </div>

          {savedFeedback && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Preferências de impressão salvas com sucesso no banco de dados local.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
