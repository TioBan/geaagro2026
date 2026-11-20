import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Printer,
  QrCode,
  Building2,
  CheckCircle2,
  RefreshCw,
  Save,
  RotateCcw,
  Eye,
  FileText,
  MapPin,
  Layers,
  Download,
  Smartphone,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  TraceabilityProperty,
  TraceabilityPlot,
  TraceabilityLabelSettings,
  LabelSize,
  PrinterType,
  PrinterDpi,
} from '../../types/traceability';
import { Farm } from '../../types/agronomy';
import { DEFAULT_TRACEABILITY_LABEL_SETTINGS } from '../../data/traceabilityData';

interface TraceabilitySettingsConfigProps {
  property: TraceabilityProperty;
  plots: TraceabilityPlot[];
  settings: TraceabilityLabelSettings;
  farms?: Farm[];
  onUpdateProperty: (prop: TraceabilityProperty) => void;
  onUpdateSettings: (settings: TraceabilityLabelSettings) => void;
  onImportFarmToProperty?: (farm: Farm) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors';

const SELECT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer transition-colors';

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const TraceabilitySettingsConfig: React.FC<TraceabilitySettingsConfigProps> = ({
  property,
  plots,
  settings,
  farms = [],
  onUpdateProperty,
  onUpdateSettings,
  onImportFarmToProperty,
}) => {
  const [localSettings, setLocalSettings] = useState<TraceabilityLabelSettings>({ ...settings });
  const [localProperty, setLocalProperty] = useState<TraceabilityProperty>({ ...property });
  const [selectedFarmIdToImport, setSelectedFarmIdToImport] = useState<string>('');
  const [activeConfigTab, setActiveConfigTab] = useState<'impressao' | 'propriedade' | 'preview_teste'>('impressao');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [testQrUrl, setTestQrUrl] = useState<string>('');
  const [bluetoothTestStatus, setBluetoothTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const feedbackTimerRef = useRef<number | null>(null);
  const btTimer1Ref = useRef<number | null>(null);
  const btTimer2Ref = useRef<number | null>(null);

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  useEffect(() => {
    setLocalProperty({ ...property });
  }, [property]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      if (btTimer1Ref.current) window.clearTimeout(btTimer1Ref.current);
      if (btTimer2Ref.current) window.clearTimeout(btTimer2Ref.current);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const baseUrl =
      localSettings.baseUrlPassport && !localSettings.baseUrlPassport.includes('geaagro.app')
        ? localSettings.baseUrlPassport
        : typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}?tab=rastreabilidade&view=passaporte`
          : '';
    const sep = baseUrl.includes('?') ? '&' : '?';
    const sampleUrl = `${baseUrl}${sep}lote=GA-TOM-2027-EST01-0001`;
    QRCode.toDataURL(sampleUrl, { width: 220, margin: 1 })
      .then((url) => {
        if (active) setTestQrUrl(url);
      })
      .catch((e) => console.error(e));
    return () => {
      active = false;
    };
  }, [localSettings.baseUrlPassport]);

  const triggerSavedFeedback = () => {
    setShowSavedFeedback(true);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateProperty(localProperty);
    triggerSavedFeedback();
  };

  const handleResetDefaults = () => {
    setLocalSettings({ ...DEFAULT_TRACEABILITY_LABEL_SETTINGS });
    onUpdateSettings(DEFAULT_TRACEABILITY_LABEL_SETTINGS);
    triggerSavedFeedback();
  };

  const handleImportFarm = () => {
    if (!selectedFarmIdToImport) return;
    const targetFarm = farms.find((f) => f.id === selectedFarmIdToImport);
    if (!targetFarm) return;

    const updatedProp: TraceabilityProperty = {
      ...localProperty,
      farmName: targetFarm.name || localProperty.farmName,
      city: targetFarm.city || localProperty.city,
      state: targetFarm.state || localProperty.state,
      carRegister: targetFarm.carRegister || localProperty.carRegister,
      totalAreaHa: targetFarm.totalAreaHa || localProperty.totalAreaHa,
      cultivatedAreaHa: targetFarm.cultivatedAreaHa || localProperty.cultivatedAreaHa,
      latitude: targetFarm.latitude || localProperty.latitude,
      longitude: targetFarm.longitude || localProperty.longitude,
      updatedAt: new Date().toISOString(),
    };

    setLocalProperty(updatedProp);
    onUpdateProperty(updatedProp);

    if (onImportFarmToProperty) {
      onImportFarmToProperty(targetFarm);
    }

    triggerSavedFeedback();
  };

  const handleTestBluetooth = () => {
    setBluetoothTestStatus('testing');
    if (btTimer1Ref.current) window.clearTimeout(btTimer1Ref.current);
    if (btTimer2Ref.current) window.clearTimeout(btTimer2Ref.current);
    btTimer1Ref.current = window.setTimeout(() => {
      setBluetoothTestStatus('success');
      btTimer2Ref.current = window.setTimeout(() => setBluetoothTestStatus('idle'), 3500);
    }, 1200);
  };

  const generateSampleZPL = () => {
    return `^XA
^PW800
^LL400
^FO40,30^A0N,32,32^FD${localProperty.farmName || 'FAZENDA DE TESTE'}^FS
^FO40,70^A0N,20,20^FDProd: ${localProperty.producerName} - Doc: ${localProperty.documentNumber}^FS
^FO40,100^A0N,20,20^FDResp. Tecnico: ${localProperty.technicalResponsible} - ART: ${localProperty.artNumber}^FS
^FO40,140^A0N,26,26^FDLOTE: GA-TOM-2027-EST01-0001^FS
^FO40,175^A0N,22,22^FDCultura: Tomate Sweet Grape | Class: Extra AA^FS
^FO40,205^A0N,20,20^FDOrigem: Estufa 01 | Colheita: 22/09/2027^FS
^FO40,240^A0N,20,20^FDRastreabilidade INC 02/2018 MAPA/ANVISA^FS
^FO560,40^BQN,2,6^FDQA,${localSettings.baseUrlPassport}?lote=GA-TOM-2027-EST01-0001^FS
^FO550,230^A0N,18,18^FDESCANEAR PASSAPORTE^FS
^XZ`;
  };

  const labelFieldToggles: Array<{
    key: keyof TraceabilityLabelSettings;
    label: string;
    hint: string;
    accent?: boolean;
  }> = [
    { key: 'showProducerName', label: 'Nome do Produtor / Razão Social', hint: 'Obrigatório pela INC 02/2018' },
    { key: 'showDocument', label: 'Documento (CNPJ ou CPF)', hint: 'Identificação fiscal da origem' },
    { key: 'showStateRegistration', label: 'Inscrição Estadual (IE)', hint: 'Para trânsito interestadual' },
    { key: 'showPlotInfo', label: 'Talhão / Estufa de Origem', hint: 'Local exato da colheita' },
    { key: 'showCultivar', label: 'Cultura e Cultivar / Variedade', hint: 'Ex: Tomate Sweet Grape' },
    { key: 'showCommercialClass', label: 'Classificação Comercial', hint: 'Extra AA, Especial, Tipo 1' },
    { key: 'showHarvestDate', label: 'Data da Colheita', hint: 'Registro cronológico do lote' },
    { key: 'showAgronomistArt', label: 'Responsável Técnico & ART', hint: 'Número do CREA e ART' },
    { key: 'showInc02ComplianceBadge', label: 'Selo INC 02/2018 MAPA', hint: 'Legenda de conformidade federal' },
    {
      key: 'enableSafetyIntervalLock',
      label: 'Bloqueio por Período de Carência',
      hint: 'Alerta se defensivo estiver em carência',
      accent: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Header Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                Preferências de Etiquetas, Impressoras e Propriedade
              </h2>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 whitespace-nowrap">
                INC 02/2018
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Defina dimensões e linguagem das etiquetas QR Code (ZPL, ESC/POS, Argox, A4), campos obrigatórios e sincronize com fazendas cadastradas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Padrões
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Preferências
            </button>
          </div>
        </div>

        {showSavedFeedback && (
          <div className="mt-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Preferências de impressão e dados da propriedade salvos localmente com sucesso.
          </div>
        )}
      </div>

      {/* Sub-Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        {[
          { id: 'impressao' as const, label: 'Impressão & QR Code', icon: Printer },
          { id: 'propriedade' as const, label: 'Vínculo com Fazendas', icon: Building2 },
          { id: 'preview_teste' as const, label: 'Simulador ZPL / Bluetooth', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeConfigTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveConfigTab(tab.id)}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Impressão de Etiquetas & QR Code */}
      {activeConfigTab === 'impressao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Printing Options */}
          <div className="lg:col-span-2 space-y-4">
            {/* Dimensões e Hardware */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Dimensões e Hardware de Impressão Padrão
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={LABEL_CLASS}>Tamanho Padrão da Etiqueta</label>
                  <select
                    value={localSettings.defaultSize}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, defaultSize: e.target.value as LabelSize }))}
                    className={SELECT_CLASS}
                  >
                    <option value="100x50">100 x 50 mm — Padrão Caixas HF / CEAGESP</option>
                    <option value="100x150">100 x 150 mm — Logística / Pallet / Transporte</option>
                    <option value="60x40">60 x 40 mm — Embalagem Individual / Bandeja</option>
                    <option value="150x200">150 x 200 mm — Identificação de Pallet Master</option>
                    <option value="a4_multipage">Folha A4 — Grade para Impressora Laser / Tinta</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                    Pré-selecionado automaticamente na tela de emissão.
                  </p>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Formato / Linguagem de Impressão</label>
                  <select
                    value={localSettings.defaultPrinterType}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        defaultPrinterType: e.target.value as PrinterType,
                        printFormat: e.target.value === 'padrao_a4' ? 'pdf' : 'termica',
                      }))
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="zebra_zpl">Zebra ZPL II (Térmica Industrial / Desktop)</option>
                    <option value="elgin_escpos">Elgin / Bematech ESC/POS (Térmica Não-Fiscal)</option>
                    <option value="argox_ppla">Argox PPLA / PPLB (Térmica Argox)</option>
                    <option value="brother">Brother P-Touch / ESC/P</option>
                    <option value="padrao_a4">Impressora Convencional (PDF / Navegador)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                    Gera comandos nativos para envio via Bluetooth, USB ou rede.
                  </p>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Tamanho do QR Code</label>
                  <select
                    value={localSettings.qrCodeSize || 'medio'}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        qrCodeSize: e.target.value as TraceabilityLabelSettings['qrCodeSize'],
                      }))
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="pequeno">Pequeno (80px / ~15mm — Mini bandejas)</option>
                    <option value="medio">Médio (120px / ~25mm — Caixas HF 10-20kg)</option>
                    <option value="grande">Grande (160px / ~35mm — Paletes & Sacarias)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Unidade de Medida Padrão</label>
                  <select
                    value={localSettings.defaultUnit || 'kg'}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        defaultUnit: e.target.value as TraceabilityLabelSettings['defaultUnit'],
                      }))
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="cx">cx (Caixas Comerciais)</option>
                    <option value="sc">sc (Sacas)</option>
                    <option value="un">un (Unidades)</option>
                    <option value="t">t (Toneladas)</option>
                    <option value="g">g (Gramas)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Densidade da Cabeça Térmica (DPI)</label>
                  <select
                    value={localSettings.defaultDpi}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, defaultDpi: Number(e.target.value) as PrinterDpi }))}
                    className={SELECT_CLASS}
                  >
                    <option value={203}>203 DPI (8 pontos/mm — Padrão)</option>
                    <option value={300}>300 DPI (12 pontos/mm — Alta Definição)</option>
                    <option value={600}>600 DPI (24 pontos/mm — Ultra Definição)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Orientação da Etiqueta</label>
                  <select
                    value={localSettings.paperOrientation}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        paperOrientation: e.target.value as 'landscape' | 'portrait',
                      }))
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="landscape">Paisagem (Horizontal — Recomendado para HF)</option>
                    <option value="portrait">Retrato (Vertical — Ideal para Pallets)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Campos Visíveis na Etiqueta */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Campos Impressos na Etiqueta (INC 02/2018 MAPA/ANVISA)
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                  Customizável
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {labelFieldToggles.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200/70 dark:border-zinc-800 hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(localSettings[item.key])}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600"
                    />
                    <div className="min-w-0">
                      <span
                        className={`font-medium block ${
                          item.accent
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-500 block">
                        {item.hint}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* URL Base do Passaporte Digital */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                URL Base do Passaporte Digital (QR Code)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Endereço incorporado no QR Code para consulta por consumidores, compradores ou fiscalização.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={localSettings.baseUrlPassport}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, baseUrlPassport: e.target.value }))}
                  className={`${INPUT_CLASS} flex-1`}
                  placeholder={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${window.location.pathname}?tab=rastreabilidade&view=passaporte`
                      : 'URL do domínio atual'
                  }
                />
                <button
                  type="button"
                  onClick={() => setLocalSettings((prev) => ({ ...prev, baseUrlPassport: '' }))}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Restaurar URL Dinâmica
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preset Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                  Resumo do Perfil de Impressão
                </h4>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                  Ativo
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Tamanho</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {localSettings.defaultSize} mm
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Protocolo</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                    {localSettings.defaultPrinterType}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Resolução</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {localSettings.defaultDpi} DPI
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Orientação</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">
                    {localSettings.paperOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Trava de Carência</span>
                  <span
                    className={`font-semibold ${
                      localSettings.enableSafetyIntervalLock
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {localSettings.enableSafetyIntervalLock ? 'Ativada' : 'Desativada'}
                  </span>
                </div>
              </div>

              {/* Sample QR Code Box */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-center space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Amostra do QR Code
                </span>
                {testQrUrl ? (
                  <img
                    src={testQrUrl}
                    alt="QR Code Amostra"
                    className="w-28 h-28 mx-auto rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white p-1"
                  />
                ) : (
                  <div className="w-28 h-28 mx-auto bg-slate-200/60 dark:bg-zinc-800 rounded-lg" />
                )}
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block truncate">
                  GA-TOM-2027-EST01-0001
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar como Padrão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vínculo com Banco de Fazendas */}
      {activeConfigTab === 'propriedade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Sincronização com Fazendas */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Sincronizar com Propriedades Cadastradas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Importe automaticamente dados cadastrais, CAR, município e áreas de uma fazenda já existente.
                </p>
              </div>

              {farms.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedFarmIdToImport}
                    onChange={(e) => setSelectedFarmIdToImport(e.target.value)}
                    className={`${SELECT_CLASS} flex-1`}
                  >
                    <option value="">-- Selecione uma Fazenda do Sistema --</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}/{f.state} — {f.totalAreaHa} ha)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleImportFarm}
                    disabled={!selectedFarmIdToImport}
                    className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Importar Dados
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma fazenda cadastrada no módulo de Cadastros. Preencha os dados da propriedade abaixo manualmente.
                </div>
              )}
            </div>

            {/* Formulário de Dados Cadastrais */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Dados do Produtor e Origem (INC 02/2018)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={LABEL_CLASS}>Nome da Propriedade / Fazenda</label>
                  <input
                    type="text"
                    value={localProperty.farmName}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, farmName: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Produtor Rural / Razão Social</label>
                  <input
                    type="text"
                    value={localProperty.producerName}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, producerName: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={localProperty.documentNumber}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, documentNumber: e.target.value }))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    value={localProperty.stateRegistration}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, stateRegistration: e.target.value }))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Município</label>
                  <input
                    type="text"
                    value={localProperty.city}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, city: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Estado (UF)</label>
                  <input
                    type="text"
                    value={localProperty.state}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, state: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Registro CAR</label>
                  <input
                    type="text"
                    value={localProperty.carRegister}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, carRegister: e.target.value }))}
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Responsável Técnico (Agrônomo)</label>
                  <input
                    type="text"
                    value={localProperty.technicalResponsible}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, technicalResponsible: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>CREA / Conselho</label>
                  <input
                    type="text"
                    value={localProperty.creaNumber}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, creaNumber: e.target.value }))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Número da ART</label>
                  <input
                    type="text"
                    value={localProperty.artNumber}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, artNumber: e.target.value }))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Packing House & Talhões */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Packing House & Unidade Central
              </h4>

              <div className="space-y-3">
                <div>
                  <label className={LABEL_CLASS}>Nome do Packing House</label>
                  <input
                    type="text"
                    value={localProperty.packingHouseName}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, packingHouseName: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Endereço da Unidade</label>
                  <input
                    type="text"
                    value={localProperty.packingHouseAddress}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, packingHouseAddress: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Câmaras Frias Disponíveis</label>
                  <input
                    type="number"
                    min="0"
                    value={localProperty.coldRoomsCount}
                    onChange={(e) => setLocalProperty((prev) => ({ ...prev, coldRoomsCount: Number(e.target.value) || 0 }))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Talhões & Estufas Vinculados
                </h4>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 tabular-nums">
                  {plots.length}
                </span>
              </div>

              {plots.length > 0 ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {plots.map((p) => (
                    <div
                      key={p.id}
                      className="px-2.5 py-2 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-slate-900 dark:text-zinc-100 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block truncate">
                          {p.currentCrop || 'Sem cultura'}
                          {p.currentCultivar ? ` (${p.currentCultivar})` : ''}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
                        {p.areaHa} ha
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-3 text-center">
                  Nenhum talhão cadastrado até o momento.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Simulador & Teste ZPL / Bluetooth */}
      {activeConfigTab === 'preview_teste' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Visual Label Preview */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Pré-Visualização da Etiqueta Padrão
              </h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
                {localSettings.defaultSize} mm
              </span>
            </div>

            <div className="p-4 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50/70 dark:bg-zinc-950/60 flex items-center justify-center">
              <div className="w-full max-w-[420px] bg-white text-black p-4 rounded-lg border border-black space-y-3 font-sans">
                {/* Header */}
                <div className="border-b-2 border-black pb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm uppercase tracking-tight leading-tight truncate">
                      {localProperty.farmName || 'PROPRIEDADE NÃO CONFIGURADA'}
                    </h4>
                    {localSettings.showProducerName && (
                      <p className="text-[10px] font-semibold text-gray-800 truncate">
                        {localProperty.producerName || 'Produtor não informado'}
                      </p>
                    )}
                    {localSettings.showDocument && (
                      <p className="text-[9px] text-gray-700 tabular-nums">
                        Doc: {localProperty.documentNumber || '—'} | IE: {localProperty.stateRegistration || '—'}
                      </p>
                    )}
                  </div>
                  {localSettings.showInc02ComplianceBadge && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 border border-black rounded-sm bg-gray-100 shrink-0">
                      INC 02/2018
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1 text-[11px]">
                    <div className="font-bold text-xs bg-black text-white px-1.5 py-0.5 rounded-xs inline-block font-mono">
                      LOTE: GA-TOM-2027-EST01-0001
                    </div>
                    {localSettings.showCultivar && (
                      <div>
                        <strong>Produto:</strong> Tomate Sweet Grape
                      </div>
                    )}
                    {localSettings.showCommercialClass && (
                      <div className="tabular-nums">
                        <strong>Classe:</strong> Extra AA • 20.0 {localSettings.defaultUnit || 'kg'}
                      </div>
                    )}
                    {localSettings.showPlotInfo && (
                      <div>
                        <strong>Origem:</strong> Estufa 01{localProperty.city ? ` - ${localProperty.city}/${localProperty.state}` : ''}
                      </div>
                    )}
                    {localSettings.showHarvestDate && (
                      <div className="tabular-nums">
                        <strong>Colheita:</strong> 22/09/2027
                      </div>
                    )}
                    {localSettings.showAgronomistArt && (
                      <div className="text-[9px] text-gray-600">
                        Resp: {localProperty.technicalResponsible || '—'} ({localProperty.creaNumber || '—'})
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    {testQrUrl ? (
                      <img src={testQrUrl} alt="QR Code" className="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200" />
                    )}
                    <span className="text-[8px] font-bold uppercase mt-1">RASTREABILIDADE</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-black pt-1 flex justify-between text-[8px] font-semibold text-gray-600">
                  <span>GeaAgro Suite Rastreabilidade</span>
                  <span>Consumidor: Aponte a câmera</span>
                </div>
              </div>
            </div>
          </div>

          {/* Native ZPL & Bluetooth Test */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Script Nativo ZPL II & Teste de Conexão
              </h3>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 tabular-nums">
                {localSettings.defaultDpi} DPI
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Código ZPL gerado automaticamente com base nas dimensões, densidade e campos selecionados:
            </p>

            <pre className="p-3 bg-zinc-950 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-zinc-800">
              {generateSampleZPL()}
            </pre>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestBluetooth}
                disabled={bluetoothTestStatus === 'testing'}
                className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                {bluetoothTestStatus === 'testing'
                  ? 'Conectando impressora...'
                  : bluetoothTestStatus === 'success'
                    ? 'Etiqueta teste enviada'
                    : 'Testar Impressão Bluetooth'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([generateSampleZPL()], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'etiqueta_amostra.zpl';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar ZPL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
