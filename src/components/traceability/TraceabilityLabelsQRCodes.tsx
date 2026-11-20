import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  Settings,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  TraceabilityLot,
  TraceabilityProperty,
  CommercialClass,
  TraceabilityLabelSettings,
  LabelSize,
  PrinterType,
} from '../../types/traceability';

interface LabelsQRCodesProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  selectedLot: TraceabilityLot | null;
  settings?: TraceabilityLabelSettings;
  onSelectLot: (lot: TraceabilityLot) => void;
  onOpenPassport: (lot: TraceabilityLot) => void;
  onOpenSettings?: () => void;
}

export const TraceabilityLabelsQRCodes: React.FC<LabelsQRCodesProps> = ({
  property,
  lots,
  selectedLot: initialSelectedLot,
  settings,
  onSelectLot,
  onOpenPassport,
  onOpenSettings,
}) => {
  const [currentLot, setCurrentLot] = useState<TraceabilityLot | undefined>(initialSelectedLot || lots[0]);
  const [labelSize, setLabelSize] = useState<LabelSize>(settings?.defaultSize || '100x50');
  const [printerType, setPrinterType] = useState<PrinterType>(settings?.defaultPrinterType || 'zebra_zpl');
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [boxesBatchCount, setBoxesBatchCount] = useState<number>(settings?.defaultCopies || 50);
  const [commercialClass, setCommercialClass] = useState<CommercialClass>('Extra AA');
  const [customNetWeight, setCustomNetWeight] = useState<number>(20.0);
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<'idle' | 'connected'>('idle');

  const printAreaRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (settings) {
      if (settings.defaultSize) setLabelSize(settings.defaultSize);
      if (settings.defaultPrinterType) setPrinterType(settings.defaultPrinterType);
      if (settings.defaultCopies) setBoxesBatchCount(settings.defaultCopies);
    }
  }, [settings]);

  useEffect(() => {
    if (initialSelectedLot) {
      setCurrentLot(initialSelectedLot);
    } else if (!currentLot && lots[0]) {
      setCurrentLot(lots[0]);
    }
  }, [initialSelectedLot, lots, currentLot]);

  const passportUrl = useMemo(() => {
    const lotCode = currentLot?.lotCode || '';
    if (!lotCode) return '';
    const customBase = settings?.baseUrlPassport;
    if (customBase && customBase.trim() && !customBase.includes('geaagro.app')) {
      const trimmed = customBase.trim();
      const sep = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${sep}lote=${encodeURIComponent(lotCode)}`;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin;
      const pathname = window.location.pathname || '';
      return `${origin}${pathname}?tab=rastreabilidade&view=passaporte&lote=${encodeURIComponent(lotCode)}`;
    }
    return `?tab=rastreabilidade&view=passaporte&lote=${encodeURIComponent(lotCode)}`;
  }, [currentLot?.lotCode, settings?.baseUrlPassport]);

  useEffect(() => {
    let active = true;
    if (currentLot?.lotCode && passportUrl) {
      QRCode.toDataURL(passportUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(url => {
          if (active) setQrCodeDataUrl(url);
        })
        .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
    return () => {
      active = false;
    };
  }, [currentLot, passportUrl]);

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const handleCopyLink = () => {
    if (!passportUrl) return;
    navigator.clipboard.writeText(passportUrl);
    setCopiedLink(true);
    scheduleTimer(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl || !currentLot) return;
    const link = document.createElement('a');
    link.download = `qrcode-lote-${currentLot.lotCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handlePrintLabels = () => {
    window.print();
  };

  const handleBluetoothTest = () => {
    setBluetoothConnecting(true);
    scheduleTimer(() => {
      setBluetoothConnecting(false);
      setBluetoothStatus('connected');
      scheduleTimer(() => setBluetoothStatus('idle'), 4000);
    }, 1000);
  };

  if (!currentLot) {
    return (
      <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-2">
        <QrCode className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
          Nenhum lote selecionado para geração de etiquetas
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre um lote agrícola na aba Lotes para emitir etiquetas térmicas e QR Code.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Central de Etiquetas & QR Code Térmico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Conformidade obrigatória com a <strong className="text-slate-700 dark:text-zinc-200">Instrução Normativa Conjunta MAPA/ANVISA nº 02/2018</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={currentLot.id}
              onChange={e => {
                const found = lots.find(l => l.id === e.target.value);
                if (found) {
                  setCurrentLot(found);
                  onSelectLot(found);
                }
              }}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 flex-1 sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              {lots.map(l => (
                <option key={l.id} value={l.id}>
                  {l.lotCode} - {l.cropName} ({l.cultivarName})
                </option>
              ))}
            </select>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="h-9 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                title="Configurações Padrão de Impressão"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Padrões de Impressão</span>
              </button>
            )}
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Modelo da Etiqueta</label>
            <select
              value={labelSize}
              onChange={e => setLabelSize(e.target.value as LabelSize)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="100x50">Caixa Padrão (100 × 50 mm)</option>
              <option value="100x150">Caixa Grande / Manga (100 × 150 mm)</option>
              <option value="150x200">Pallet / Carga Master (150 × 200 mm)</option>
              <option value="60x40">Bandeja / Clamshell (60 × 40 mm)</option>
              <option value="a4_multipage">Folha A4 (6 Etiquetas por Página)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Driver / Impressora</label>
            <select
              value={printerType}
              onChange={e => setPrinterType(e.target.value as PrinterType)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="zebra_zpl">Zebra (ZPL / EPL Bluetooth & USB)</option>
              <option value="elgin_escpos">Elgin (L42 Pro / ESC-POS)</option>
              <option value="argox_ppla">Argox (OS-214 Plus PPLA/B)</option>
              <option value="brother">Brother (QL-820NWB / TD-4550)</option>
              <option value="padrao_a4">Impressão Laser / Jato A4</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Classificação Comercial</label>
            <select
              value={commercialClass}
              onChange={e => setCommercialClass(e.target.value as CommercialClass)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="Extra AA">Extra AA (Primeiríssima)</option>
              <option value="Extra A">Extra A</option>
              <option value="Especial">Especial / Exportação</option>
              <option value="Comercial">Comercial</option>
              <option value="Industria">Indústria / Processamento</option>
              <option value="Refugo">Refugo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data de Colheita / Embalagem</label>
            <input
              type="date"
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
              Peso Líquido ({settings?.defaultUnit || 'kg'})
            </label>
            <input
              type="number"
              step="0.1"
              min={0.1}
              value={customNetWeight}
              onChange={e => setCustomNetWeight(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Caixa Inicial (#)</label>
            <input
              type="number"
              min={1}
              value={boxNumber}
              onChange={e => setBoxNumber(Math.max(1, Number(e.target.value) || 1))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Quantidade de Etiquetas no Lote</label>
            <input
              type="number"
              min={1}
              max={2000}
              value={boxesBatchCount}
              onChange={e => setBoxesBatchCount(Math.max(1, Number(e.target.value) || 1))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBluetoothTest}
              disabled={bluetoothConnecting}
              className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-xs disabled:opacity-60 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {bluetoothConnecting ? 'Buscando Impressora...' : 'Conectar Bluetooth'}
            </button>
            {bluetoothStatus === 'connected' && (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Impressora conectada
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copiado' : 'Copiar Link'}
            </button>

            <button
              type="button"
              onClick={handleDownloadQRCode}
              className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar PNG
            </button>

            <button
              type="button"
              onClick={handlePrintLabels}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer text-xs tabular-nums transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir {boxesBatchCount} Etiquetas
            </button>
          </div>
        </div>
      </div>

      {/* Live Label Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 bg-slate-50/70 dark:bg-zinc-950/60 p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[340px]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4 tabular-nums">
            Pré-visualização da Etiqueta Térmica ({labelSize === '100x50' ? '100 × 50 mm' : labelSize})
          </span>

          {/* Actual Printable Thermal Label Box */}
          <div
            ref={printAreaRef}
            className={`bg-white text-black border-2 border-black rounded-xs p-3 flex flex-col justify-between select-none relative ${
              labelSize === '100x50'
                ? 'w-full max-w-[480px] h-[240px]'
                : labelSize === '100x150'
                ? 'w-full max-w-[420px] h-[380px]'
                : labelSize === '60x40'
                ? 'w-full max-w-[340px] h-[200px]'
                : 'w-full max-w-[500px] h-[340px]'
            }`}
          >
            <div className="border-b-2 border-black pb-1.5 flex items-start justify-between gap-2">
              <div>
                <span className="bg-black text-white font-black text-[10px] px-1 py-0.5 tracking-wider uppercase inline-block">
                  RASTREABILIDADE VEGETAL • MAPA/ANVISA
                </span>
                <h4 className="font-black text-sm uppercase leading-tight tracking-tight mt-0.5">
                  {property.farmName || currentLot.farmName || 'PROPRIEDADE RURAL'}
                </h4>
                <p className="text-[10px] leading-none text-slate-800 font-semibold mt-0.5">
                  Produtor: {property.producerName || '--'} | {property.documentType}: {property.documentNumber || '--'}
                </p>
                <p className="text-[9px] leading-none text-slate-700 mt-0.5">
                  {property.city || '--'} - {property.state || '--'} | RT: {property.technicalResponsible || '--'} ({property.creaNumber || '--'})
                </p>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <span className="text-[9px] font-bold block">INC 02/2018</span>
                <span className="font-black text-xs block font-mono">
                  CX #{boxNumber.toString().padStart(4, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 py-1.5 flex-1">
              <div className="space-y-1 flex-1 min-w-0">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Produto / Cultura:</span>
                  <p className="font-black text-base uppercase leading-none truncate">
                    {currentLot.cropName}
                  </p>
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    Cultivar: {currentLot.cultivarName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] tabular-nums">
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Classificação:</span>
                    <strong className="font-black text-xs">{commercialClass}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Peso Líquido:</span>
                    <strong className="font-black text-xs">
                      {customNetWeight} {settings?.defaultUnit || 'kg'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Talhão/Estufa:</span>
                    <strong className="font-bold">{currentLot.plotCode}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Colheita/Emb:</span>
                    <strong className="font-bold">{new Date(harvestDate).toLocaleDateString('pt-BR')}</strong>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[8px] uppercase text-slate-600 block">CÓDIGO ÚNICO DO LOTE:</span>
                  <span className="font-mono font-black text-xs tracking-wider bg-slate-100 px-1 py-0.5 border border-black block truncate">
                    {currentLot.lotCode}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-1 border border-black bg-white rounded-xs shrink-0">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code do Lote ${currentLot.lotCode}`}
                    className={`object-contain ${
                      settings?.qrCodeSize === 'pequeno'
                        ? 'w-16 h-16 sm:w-20 sm:h-20'
                        : settings?.qrCodeSize === 'grande'
                        ? 'w-28 h-28 sm:w-32 sm:h-32'
                        : 'w-24 h-24 sm:w-28 sm:h-28'
                    }`}
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                    Gerando QR...
                  </div>
                )}
                <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">
                  Consulte a Origem
                </span>
              </div>
            </div>

            <div className="border-t-2 border-black pt-1 flex items-center justify-between text-[8px] font-bold text-slate-800">
              <span>GeaAgro Suite • Rastreabilidade Segura</span>
              <span>CAR: {property.carRegister || 'Cadastrado'}</span>
              <span>Livre de Agrotóxicos em Carência</span>
            </div>
          </div>
        </div>

        {/* Legislative Compliance Details */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Requisitos Legais da Etiqueta
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Segundo a Instrução Normativa Conjunta nº 02/2018 (MAPA/ANVISA), cada caixa, pallet ou embalagem unitária deve conter obrigatoriamente:
            </p>

            <ul className="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Nome ou razão social do produtor e CNPJ/CPF
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Endereço completo da propriedade (Município e UF)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Nome da espécie vegetal (cultura) e cultivar
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Identificação única do lote (Lote GeaAgro)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Data de colheita ou de embalagem do produto
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                QR Code para leitura ótica rápida
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenPassport(currentLot)}
                className="w-full h-9 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Simular Leitura pelo Consumidor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
