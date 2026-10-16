import React, { useState } from 'react';
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
  Layers,
  Sparkles,
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

export const TraceabilityQuickPrintConfigPanel: React.FC<TraceabilityQuickPrintConfigPanelProps> = ({
  settings,
  onUpdateSettings,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [tempSettings, setTempSettings] = useState<TraceabilityLabelSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Keep tempSettings in sync if external settings change
  React.useEffect(() => {
    setTempSettings({ ...settings });
  }, [settings]);

  const handleSave = () => {
    onUpdateSettings(tempSettings);
    // Explicitly persist in localStorage
    try {
      localStorage.setItem('geaagro_traceability_label_settings', JSON.stringify(tempSettings));
    } catch (e) {
      console.error('Erro ao persistir configurações:', e);
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleReset = () => {
    setTempSettings({ ...DEFAULT_TRACEABILITY_LABEL_SETTINGS });
    onUpdateSettings(DEFAULT_TRACEABILITY_LABEL_SETTINGS);
    try {
      localStorage.setItem('geaagro_traceability_label_settings', JSON.stringify(DEFAULT_TRACEABILITY_LABEL_SETTINGS));
    } catch (e) {
      console.error('Erro ao persistir configurações:', e);
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const qrSizeLabels: Record<QRCodeSize, { title: string; desc: string; px: string; scale: string }> = {
    pequeno: { title: 'Pequeno', desc: '80px (~15mm) • Mini bandejas', px: 'w-16 h-16', scale: '80px' },
    medio: { title: 'Médio', desc: '120px (~25mm) • Padrão caixas HF', px: 'w-24 h-24', scale: '120px' },
    grande: { title: 'Grande', desc: '160px (~35mm) • Paletes & Sacarias', px: 'w-32 h-32', scale: '160px' },
  };

  const currentQrSize: QRCodeSize = tempSettings.qrCodeSize || 'medio';
  const currentFormat: PrintFormat = tempSettings.printFormat || (tempSettings.defaultPrinterType === 'padrao_a4' ? 'pdf' : 'termica');
  const currentUnit: TraceabilityUnit = tempSettings.defaultUnit || 'kg';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header Bar / Collapsed Summary */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Painel de Configuração Rápida de Etiquetas
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Preferências padrão para geração e impressão de etiquetas térmicas e PDF
            </p>
          </div>
        </div>

        {/* Quick Summary Badges & Toggle Button */}
        <div className="flex flex-wrap items-center gap-2">
          {!isOpen && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 font-medium">
              <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold">
                QR: <span className="text-emerald-600 dark:text-emerald-400 capitalize">{currentQrSize}</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold">
                Formato: <span className="text-emerald-600 dark:text-emerald-400 uppercase">{currentFormat}</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold">
                Unidade: <span className="text-emerald-600 dark:text-emerald-400 uppercase">{currentUnit}</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold">
                Tamanho: <span className="text-emerald-600 dark:text-emerald-400">{tempSettings.defaultSize} mm</span>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 transition shadow-2xs cursor-pointer ml-auto"
          >
            {isOpen ? (
              <>
                <span>Recolher</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              </>
            ) : (
              <>
                <span>Ajustar Preferências</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Quick Settings Content */}
      {isOpen && (
        <div className="p-5 space-y-6 animate-fade-in">
          {/* Main 3 Controls Grid: QR Code Size, Format, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Tamanho do QR Code */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Tamanho do QR Code
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Dimensão óptica do código para leitura na colheita e ponto de venda.
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['pequeno', 'medio', 'grande'] as QRCodeSize[]).map(size => {
                  const isSelected = currentQrSize === size;
                  const info = qrSizeLabels[size];

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTempSettings(prev => ({ ...prev, qrCodeSize: size }))}
                      className={`p-2 rounded-xl text-left transition border cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold capitalize">{info.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {info.scale}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Formato de Impressão (PDF ou Térmica) */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Formato Padrão de Saída
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Escolha entre documento PDF (A4/navegador) ou etiqueta térmica industrial.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setTempSettings(prev => ({
                      ...prev,
                      printFormat: 'pdf',
                      defaultPrinterType: 'padrao_a4',
                    }))
                  }
                  className={`p-2.5 rounded-xl text-left transition border cursor-pointer flex flex-col justify-between ${
                    currentFormat === 'pdf'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      PDF / A4
                    </span>
                    {currentFormat === 'pdf' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] mt-1 ${currentFormat === 'pdf' ? 'text-emerald-100' : 'text-slate-400'}`}>
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
                  className={`p-2.5 rounded-xl text-left transition border cursor-pointer flex flex-col justify-between ${
                    currentFormat === 'termica'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      Térmica
                    </span>
                    {currentFormat === 'termica' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] mt-1 ${currentFormat === 'termica' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Zebra ZPL / Elgin / Argox
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Unidade de Medida Padrão */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Unidade de Medida Padrão
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Unidade exibida na pesagem, embalagem e romaneio de transporte.
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { unit: 'kg', label: 'kg (Quilos)' },
                  { unit: 'cx', label: 'cx (Caixas)' },
                  { unit: 'sc', label: 'sc (Sacas)' },
                  { unit: 'un', label: 'un (Unidades)' },
                  { unit: 't', label: 't (Toneladas)' },
                  { unit: 'g', label: 'g (Gramas)' },
                ].map(({ unit, label }) => {
                  const isSelected = currentUnit === unit;

                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setTempSettings(prev => ({ ...prev, defaultUnit: unit as TraceabilityUnit }))}
                      className={`p-1.5 rounded-lg text-center transition border cursor-pointer font-bold text-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
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

          {/* Secondary Controls: Label Size, Protocol, DPI, Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Dimensões da Etiqueta */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Dimensão da Etiqueta:
              </label>
              <select
                value={tempSettings.defaultSize}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultSize: e.target.value as LabelSize }))}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="100x50">100 × 50 mm (Padrão Caixas Ceasa)</option>
                <option value="100x150">100 × 150 mm (Logística / Pallet)</option>
                <option value="60x40">60 × 40 mm (Mini bandeja / Fruta)</option>
                <option value="150x200">150 × 200 mm (Pallet Master)</option>
                <option value="a4_multipage">Folha A4 Multipáginas</option>
              </select>
            </div>

            {/* Protocolo Térmico */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Protocolo / Impressora:
              </label>
              <select
                value={tempSettings.defaultPrinterType}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultPrinterType: e.target.value as PrinterType }))}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="zebra_zpl">Zebra ZPL II (Térmica Industrial)</option>
                <option value="elgin_escpos">Elgin / Bematech ESC/POS</option>
                <option value="argox_ppla">Argox PPLA / PPLB</option>
                <option value="brother">Brother P-Touch / ESC/P</option>
                <option value="padrao_a4">PDF / Impressora Convencional</option>
              </select>
            </div>

            {/* Resolução DPI */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Resolução Térmica:
              </label>
              <select
                value={tempSettings.defaultDpi}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultDpi: Number(e.target.value) as PrinterDpi }))}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={203}>203 DPI (8 pontos/mm - Padrão)</option>
                <option value={300}>300 DPI (12 pontos/mm - Alta)</option>
                <option value={600}>600 DPI (24 pontos/mm - Ultra)</option>
              </select>
            </div>

            {/* Cópias Padrão */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Cópias Padrão / Lote:
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={tempSettings.defaultCopies}
                onChange={e => setTempSettings(prev => ({ ...prev, defaultCopies: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Live Preview Snippet & Save Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Configuração ativa: <strong>QR {currentQrSize.toUpperCase()}</strong> ({qrSizeLabels[currentQrSize].scale}) •{' '}
                <strong>{currentFormat.toUpperCase()}</strong> • Unidade <strong>{currentUnit.toUpperCase()}</strong> •{' '}
                <strong>{tempSettings.defaultSize} mm</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                title="Restaurar configurações de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Padrões
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-1 sm:flex-initial"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Preferências
              </button>
            </div>
          </div>

          {/* Saved Feedback Alert */}
          {savedFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Preferências de impressão salvas e persistidas no banco de dados local com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
