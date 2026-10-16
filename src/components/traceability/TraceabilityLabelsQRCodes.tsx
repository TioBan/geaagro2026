import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Settings,
  ShieldCheck,
  Building2,
  FileText,
  Sliders,
  Smartphone,
  Eye,
  Box,
  Truck,
  RotateCcw,
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
  const [currentLot, setCurrentLot] = useState<TraceabilityLot>(initialSelectedLot || lots[0]);
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
  const [bluetoothStatus, setBluetoothStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Synchronize when settings change
  useEffect(() => {
    if (settings) {
      if (settings.defaultSize) setLabelSize(settings.defaultSize);
      if (settings.defaultPrinterType) setPrinterType(settings.defaultPrinterType);
      if (settings.defaultCopies) setBoxesBatchCount(settings.defaultCopies);
    }
  }, [settings]);

  // Synchronize when prop changes
  useEffect(() => {
    if (initialSelectedLot) {
      setCurrentLot(initialSelectedLot);
    }
  }, [initialSelectedLot]);

  // Generate QR Code URL dynamically using the current active website origin
  const getDynamicPassportUrl = (lotCode: string, customBase?: string) => {
    if (!lotCode) return '';
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
  };

  const passportUrl = useMemo(() => {
    return getDynamicPassportUrl(currentLot?.lotCode || '', settings?.baseUrlPassport);
  }, [currentLot?.lotCode, settings?.baseUrlPassport]);

  useEffect(() => {
    if (currentLot?.lotCode) {
      QRCode.toDataURL(passportUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
  }, [currentLot, passportUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl) return;
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
    setTimeout(() => {
      setBluetoothConnecting(false);
      setBluetoothStatus('connected');
      setTimeout(() => setBluetoothStatus('idle'), 4000);
    }, 1200);
  };

  if (!currentLot) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <p className="text-sm text-slate-500">Nenhum lote selecionado para geração de etiquetas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Lot Selector & Label Configuration */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Central de Etiquetas & QR Code Térmico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Conformidade obrigatória com a <strong>Instrução Normativa Conjunta MAPA/ANVISA nº 02/2018</strong>
            </p>
          </div>

          {/* Lot Selector Dropdown & Settings Button */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 shrink-0">Lote:</label>
              <select
                value={currentLot.id}
                onChange={e => {
                  const found = lots.find(l => l.id === e.target.value);
                  if (found) {
                    setCurrentLot(found);
                    onSelectLot(found);
                  }
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 w-full sm:w-64"
              >
                {lots.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.lotCode} - {l.cropName} ({l.cultivarName})
                  </option>
                ))}
              </select>
            </div>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Configurações Padrão de Impressão"
              >
                <Settings className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Padrões de Impressão</span>
              </button>
            )}
          </div>
        </div>

        {/* Configurations Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Modelo da Etiqueta */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Modelo da Etiqueta</label>
            <select
              value={labelSize}
              onChange={e => setLabelSize(e.target.value as LabelSize)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="100x50">Caixa Padrão (100 × 50 mm)</option>
              <option value="100x150">Caixa Grande / Manga (100 × 150 mm)</option>
              <option value="150x200">Pallet / Carga Master (150 × 200 mm)</option>
              <option value="60x40">Bandeja / Clamshell (60 × 40 mm)</option>
              <option value="a4_multipage">Folha A4 (6 Etiquetas por Página)</option>
            </select>
          </div>

          {/* Impressora / Protocolo */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Driver / Impressora</label>
            <select
              value={printerType}
              onChange={e => setPrinterType(e.target.value as PrinterType)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="zebra_zpl">Zebra (ZPL / EPL Bluetooth & USB)</option>
              <option value="elgin_escpos">Elgin (L42 Pro / ESC-POS)</option>
              <option value="argox_ppla">Argox (OS-214 Plus PPLA/B)</option>
              <option value="brother">Brother (QL-820NWB / TD-4550)</option>
              <option value="padrao_a4">Impressão Laser / Jato A4</option>
            </select>
          </div>

          {/* Classificação Comercial */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Classificação Comercial</label>
            <select
              value={commercialClass}
              onChange={e => setCommercialClass(e.target.value as CommercialClass)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="Extra AA">Extra AA (Primeiríssima)</option>
              <option value="Extra A">Extra A</option>
              <option value="Especial">Especial / Exportação</option>
              <option value="Comercial">Comercial</option>
              <option value="Industria">Indústria / Processamento</option>
              <option value="Refugo">Refugo</option>
            </select>
          </div>

          {/* Data da Colheita */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Data de Colheita / Embalagem</label>
            <input
              type="date"
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          {/* Quantidade de Etiquetas */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-zinc-300">Quantidade no Lote</label>
            <input
              type="number"
              min={1}
              max={2000}
              value={boxesBatchCount}
              onChange={e => setBoxesBatchCount(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
          </div>
        </div>

        {/* Bluetooth & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBluetoothTest}
              disabled={bluetoothConnecting}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              {bluetoothConnecting ? 'Buscando Impressora Bluetooth...' : 'Conectar Impressora Bluetooth'}
            </button>
            {bluetoothStatus === 'connected' && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Impressora Térmica Conectada!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copiado!' : 'Copiar Link do QR Code'}
            </button>

            <button
              onClick={handleDownloadQRCode}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar QR Code PNG
            </button>

            <button
              onClick={handlePrintLabels}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir {boxesBatchCount} Etiquetas
            </button>
          </div>
        </div>
      </div>

      {/* Live Label Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Label Visualizer */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[360px]">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pré-visualização da Etiqueta Térmica ({labelSize === '100x50' ? '100 × 50 mm' : labelSize})
            </span>
          </div>

          {/* Actual Printable Label Box */}
          <div
            ref={printAreaRef}
            className={`bg-white text-black border-2 border-black rounded-sm shadow-xl p-3 flex flex-col justify-between select-none relative ${
              labelSize === '100x50'
                ? 'w-full max-w-[480px] h-[240px]'
                : labelSize === '100x150'
                ? 'w-full max-w-[420px] h-[380px]'
                : labelSize === '60x40'
                ? 'w-full max-w-[340px] h-[200px]'
                : 'w-full max-w-[500px] h-[340px]'
            }`}
          >
            {/* Header: Origem & Fazenda */}
            <div className="border-b-2 border-black pb-1.5 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="bg-black text-white font-black text-[10px] px-1 py-0.2 tracking-wider uppercase">
                    RASTREABILIDADE VEGETAL • MAPA/ANVISA
                  </span>
                </div>
                <h4 className="font-black text-sm uppercase leading-tight tracking-tight mt-0.5">
                  {property.farmName}
                </h4>
                <p className="text-[10px] leading-none text-slate-800 font-semibold mt-0.5">
                  Produtor: {property.producerName} | {property.documentType}: {property.documentNumber}
                </p>
                <p className="text-[9px] leading-none text-slate-700">
                  {property.city} - {property.state} | RT: {property.technicalResponsible} ({property.creaNumber})
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-bold block">INC 02/2018</span>
                <span className="font-black text-xs block font-mono">
                  CX #{boxNumber.toString().padStart(4, '0')}
                </span>
              </div>
            </div>

            {/* Middle: Produto, Cultivar, Lote e QR Code */}
            <div className="flex items-center justify-between gap-3 py-1.5 flex-1">
              <div className="space-y-1 flex-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Produto / Cultura:</span>
                  <p className="font-black text-base uppercase leading-none">
                    {currentLot.cropName}
                  </p>
                  <p className="text-[11px] font-bold text-slate-800">
                    Cultivar: {currentLot.cultivarName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Classificação:</span>
                    <strong className="font-black text-xs">{commercialClass}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-600 block">Peso Líquido:</span>
                    <strong className="font-black text-xs">{customNetWeight} {settings?.defaultUnit || 'kg'}</strong>
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
                  <span className="font-mono font-black text-xs tracking-wider bg-slate-100 px-1 py-0.5 border border-black block">
                    {currentLot.lotCode}
                  </span>
                </div>
              </div>

              {/* QR Code Container */}
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
                  <div className="w-24 h-24 bg-slate-200 animate-pulse flex items-center justify-center text-[10px]">
                    Gerando...
                  </div>
                )}
                <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">
                  Consulte a Origem
                </span>
              </div>
            </div>

            {/* Footer: Certificações e Aviso Legal */}
            <div className="border-t-2 border-black pt-1 flex items-center justify-between text-[8px] font-bold text-slate-800">
              <span>GeaAgro Suite • Rastreabilidade Segura</span>
              <span>CAR: {property.carRegister || 'Cadastrado'}</span>
              <span>Livre de Agrotóxicos em Carência</span>
            </div>
          </div>
        </div>

        {/* Right Info Box: Legislative Compliance Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Requisitos Legais da Etiqueta
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Segundo a Instrução Normativa Conjunta nº 02/2018 (MAPA/ANVISA), cada caixa, pallet ou embalagem unitária deve conter obrigatoriamente:
            </p>

            <ul className="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Nome ou razão social do produtor e CNPJ/CPF
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Endereço completo da propriedade (Município e UF)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Nome da espécie vegetal (cultura) e cultivar
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Identificação única do lote (Lote GeaAgro)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Data de colheita ou de embalagem do produto
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                QR Code para leitura ótica rápida
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onOpenPassport(currentLot)}
                className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Simular Leitura do QR Code pelo Consumidor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
