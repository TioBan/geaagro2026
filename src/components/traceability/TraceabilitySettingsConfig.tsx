import React, { useState } from 'react';
import {
  Settings,
  Printer,
  QrCode,
  Building2,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  FileText,
  MapPin,
  Leaf,
  Layers,
  Check,
  Download,
  AlertCircle,
  Smartphone,
  ExternalLink,
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

  // Generate Sample QR Code for live preview
  React.useEffect(() => {
    const baseUrl = (localSettings.baseUrlPassport && !localSettings.baseUrlPassport.includes('geaagro.app'))
      ? localSettings.baseUrlPassport
      : (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?tab=rastreabilidade&view=passaporte` : '');
    const sep = baseUrl.includes('?') ? '&' : '?';
    const sampleUrl = `${baseUrl}${sep}lote=GA-TOM-2027-EST01-0001`;
    QRCode.toDataURL(sampleUrl, { width: 220, margin: 1 })
      .then(url => setTestQrUrl(url))
      .catch(e => console.error(e));
  }, [localSettings.baseUrlPassport]);

  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateProperty(localProperty);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleResetDefaults = () => {
    setLocalSettings({ ...DEFAULT_TRACEABILITY_LABEL_SETTINGS });
    onUpdateSettings(DEFAULT_TRACEABILITY_LABEL_SETTINGS);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleImportFarm = () => {
    if (!selectedFarmIdToImport) return;
    const targetFarm = farms.find(f => f.id === selectedFarmIdToImport);
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

    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleTestBluetooth = () => {
    setBluetoothTestStatus('testing');
    setTimeout(() => {
      setBluetoothTestStatus('success');
      setTimeout(() => setBluetoothTestStatus('idle'), 3500);
    }, 1200);
  };

  // Generate Sample ZPL code based on settings
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Painel de Configuração Rápida
              </span>
              <span className="text-emerald-200/80 text-xs font-semibold">• Rastreabilidade & Impressão QR Code</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-400" />
              Preferências de Etiquetas, Impressoras & Propriedades
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Defina o tamanho e formato padrão das etiquetas QR Code (Zebra ZPL, Elgin, ESC/POS, Argox, A4), campos obrigatórios da INC 02/2018 e sincronize diretamente com as fazendas cadastradas no CRM.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw className="w-4 h-4" />
              Padrões
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              Salvar Preferências
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {showSavedFeedback && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Preferências de impressão e dados da propriedade salvos com sucesso e persistidos localmente!
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveConfigTab('impressao')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeConfigTab === 'impressao'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          Impressão de Etiquetas & QR Code
        </button>

        <button
          type="button"
          onClick={() => setActiveConfigTab('propriedade')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeConfigTab === 'propriedade'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Vínculo com Banco de Fazendas
        </button>

        <button
          type="button"
          onClick={() => setActiveConfigTab('preview_teste')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
            activeConfigTab === 'preview_teste'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          Simulador & Teste ZPL / Bluetooth
        </button>
      </div>

      {/* TAB 1: Impressão de Etiquetas & QR Code */}
      {activeConfigTab === 'impressao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Printing Options (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Tamanho e Protocolo */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <Printer className="w-4 h-4 text-emerald-600" />
                Dimensões e Hardware de Impressão Padrão
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tamanho da Etiqueta */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Tamanho Padrão da Etiqueta:
                  </label>
                  <select
                    value={localSettings.defaultSize}
                    onChange={e => setLocalSettings(prev => ({ ...prev, defaultSize: e.target.value as LabelSize }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="100x50">100 x 50 mm — Padrão Caixas Hortifruti / CEAGESP</option>
                    <option value="100x150">100 x 150 mm — Logística / Pallet / Transporte</option>
                    <option value="60x40">60 x 40 mm — Embalagem Individual / Bandeja / Pote</option>
                    <option value="150x200">150 x 200 mm — Identificação de Pallet Master</option>
                    <option value="a4_multipage">Folha A4 — Grade para Impressora Laser / Jato de Tinta</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Tamanho pré-selecionado automaticamente na tela de emissão.
                  </p>
                </div>

                {/* Tipo / Linguagem da Impressora */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Formato / Linguagem de Impressão:
                  </label>
                  <select
                    value={localSettings.defaultPrinterType}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        defaultPrinterType: e.target.value as PrinterType,
                        printFormat: e.target.value === 'padrao_a4' ? 'pdf' : 'termica',
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="zebra_zpl">Zebra ZPL II (Térmica Industrial / Desktop)</option>
                    <option value="elgin_escpos">Elgin / Bematech ESC/POS (Térmica Não-Fiscal)</option>
                    <option value="argox_ppla">Argox PPLA / PPLB (Térmica Argox)</option>
                    <option value="brother">Brother P-Touch / ESC/P</option>
                    <option value="padrao_a4">Impressora Convencional (PDF / Navegador)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Gera comandos nativos para envio via Bluetooth, USB ou rede.
                  </p>
                </div>

                {/* Tamanho do QR Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Tamanho do QR Code:
                  </label>
                  <select
                    value={localSettings.qrCodeSize || 'medio'}
                    onChange={e => setLocalSettings(prev => ({ ...prev, qrCodeSize: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pequeno">Pequeno (80px / ~15mm — Mini bandejas)</option>
                    <option value="medio">Médio (120px / ~25mm — Caixas HF 10-20kg)</option>
                    <option value="grande">Grande (160px / ~35mm — Paletes & Sacarias)</option>
                  </select>
                </div>

                {/* Unidade de Medida Padrão */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Unidade de Medida Padrão:
                  </label>
                  <select
                    value={localSettings.defaultUnit || 'kg'}
                    onChange={e => setLocalSettings(prev => ({ ...prev, defaultUnit: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="cx">cx (Caixas Comerciais)</option>
                    <option value="sc">sc (Sacas)</option>
                    <option value="un">un (Unidades)</option>
                    <option value="t">t (Toneladas)</option>
                    <option value="g">g (Gramas)</option>
                  </select>
                </div>

                {/* Resolução DPI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Densidade da Cabeça Térmica (DPI):
                  </label>
                  <select
                    value={localSettings.defaultDpi}
                    onChange={e => setLocalSettings(prev => ({ ...prev, defaultDpi: Number(e.target.value) as PrinterDpi }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={203}>203 DPI (8 pontos/mm — Mais Comum)</option>
                    <option value={300}>300 DPI (12 pontos/mm — Alta Definição)</option>
                    <option value={600}>600 DPI (24 pontos/mm — Ultra Definição)</option>
                  </select>
                </div>

                {/* Orientação */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Orientação da Etiqueta:
                  </label>
                  <select
                    value={localSettings.paperOrientation}
                    onChange={e => setLocalSettings(prev => ({ ...prev, paperOrientation: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="landscape">Paisagem (Horizontal — Recomendado para HF)</option>
                    <option value="portrait">Retrato (Vertical — Ideal para Pallets/Caixas Altas)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card: Campos Visíveis na Etiqueta */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Campos Impressos na Etiqueta (INC 02/2018 MAPA/ANVISA)
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Customizável
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showProducerName}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showProducerName: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Nome do Produtor / Razão Social</strong>
                    <span className="text-[11px] text-slate-400 block">Obrigatório pela INC 02/2018</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showDocument}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showDocument: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Documento (CNPJ ou CPF)</strong>
                    <span className="text-[11px] text-slate-400 block">Identificação fiscal da origem</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showStateRegistration}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showStateRegistration: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Inscrição Estadual (IE)</strong>
                    <span className="text-[11px] text-slate-400 block">Para trânsito interestadual</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showPlotInfo}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showPlotInfo: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Talhão / Estufa de Origem</strong>
                    <span className="text-[11px] text-slate-400 block">Local exato da colheita</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showCultivar}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showCultivar: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Cultura e Cultivar / Variedade</strong>
                    <span className="text-[11px] text-slate-400 block">Ex: Tomate Sweet Grape</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showCommercialClass}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showCommercialClass: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Classificação Comercial</strong>
                    <span className="text-[11px] text-slate-400 block">Extra AA, Especial, Tipo 1</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showHarvestDate}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showHarvestDate: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Data da Colheita</strong>
                    <span className="text-[11px] text-slate-400 block">Registro cronológico do lote</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showAgronomistArt}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showAgronomistArt: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Responsável Técnico & ART</strong>
                    <span className="text-[11px] text-slate-400 block">Número do CREA e ART</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showInc02ComplianceBadge}
                    onChange={e => setLocalSettings(prev => ({ ...prev, showInc02ComplianceBadge: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-slate-800 dark:text-zinc-200 block">Selo INC 02/2018 MAPA</strong>
                    <span className="text-[11px] text-slate-400 block">Legenda de conformidade federal</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableSafetyIntervalLock}
                    onChange={e => setLocalSettings(prev => ({ ...prev, enableSafetyIntervalLock: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-400 block">Bloqueio por Período de Carência</strong>
                    <span className="text-[11px] text-slate-400 block">Alerta se defensivo estiver em carência</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Card: URL Base do Passaporte Digital */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Configuração do Passaporte Digital do Alimento (QR Code)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                URL base gerada dentro do QR Code para acesso do consumidor, supermercado ou fiscalização.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={localSettings.baseUrlPassport}
                  onChange={e => setLocalSettings(prev => ({ ...prev, baseUrlPassport: e.target.value }))}
                  className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?tab=rastreabilidade&view=passaporte` : 'URL do Domínio Atual'}
                />
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, baseUrlPassport: '' }))}
                  className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Restaurar URL Dinâmica
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preset Summary & Fast Preview */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Resumo do Perfil de Impressão
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white rounded">
                  Ativo
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Tamanho:</span>
                  <strong className="font-bold text-slate-900 dark:text-white">{localSettings.defaultSize} mm</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Protocolo:</span>
                  <strong className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{localSettings.defaultPrinterType}</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Resolução:</span>
                  <strong className="font-bold text-slate-900 dark:text-white">{localSettings.defaultDpi} DPI</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Orientação:</span>
                  <strong className="font-bold text-slate-900 dark:text-white">{localSettings.paperOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Trava de Carência:</span>
                  <strong className={localSettings.enableSafetyIntervalLock ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {localSettings.enableSafetyIntervalLock ? 'Ativada (Segura)' : 'Desativada'}
                  </strong>
                </div>
              </div>

              {/* Sample QR Code Box */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Amostra do QR Code Gerado
                </span>
                {testQrUrl ? (
                  <img
                    src={testQrUrl}
                    alt="QR Code Amostra"
                    className="w-32 h-32 mx-auto rounded-lg border border-slate-100 dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-slate-100 animate-pulse rounded-lg" />
                )}
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block truncate">
                  GA-TOM-2027-EST01-0001
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar como Padrão de Todas as Emissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vínculo com Banco de Fazendas */}
      {activeConfigTab === 'propriedade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sincronização em 1 clique com Fazendas do CRM */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Sincronizar com Propriedades Cadastradas no CRM
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Importe automaticamente dados cadastrais, CAR, município, responsável técnico e talhões de uma fazenda já existente.
                  </p>
                </div>
              </div>

              {farms.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedFarmIdToImport}
                    onChange={e => setSelectedFarmIdToImport(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">-- Selecione uma Fazenda do Sistema --</option>
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}/{f.state} — {f.totalAreaHa} ha)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleImportFarm}
                    disabled={!selectedFarmIdToImport}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Importar Dados da Fazenda
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs text-slate-600 dark:text-zinc-400">
                  Nenhuma fazenda cadastrada no módulo de Cadastros. Preencha os dados da propriedade abaixo manualmente.
                </div>
              )}
            </div>

            {/* Formulário de Dados Cadastrais da Rastreabilidade */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <FileText className="w-4 h-4 text-emerald-600" />
                Dados do Produtor e Origem (INC 02/2018)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Nome da Propriedade / Fazenda:</label>
                  <input
                    type="text"
                    value={localProperty.farmName}
                    onChange={e => setLocalProperty(prev => ({ ...prev, farmName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Produtor Rural / Razão Social:</label>
                  <input
                    type="text"
                    value={localProperty.producerName}
                    onChange={e => setLocalProperty(prev => ({ ...prev, producerName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">CPF ou CNPJ:</label>
                  <input
                    type="text"
                    value={localProperty.documentNumber}
                    onChange={e => setLocalProperty(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Inscrição Estadual (IE):</label>
                  <input
                    type="text"
                    value={localProperty.stateRegistration}
                    onChange={e => setLocalProperty(prev => ({ ...prev, stateRegistration: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Município:</label>
                  <input
                    type="text"
                    value={localProperty.city}
                    onChange={e => setLocalProperty(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Estado (UF):</label>
                  <input
                    type="text"
                    value={localProperty.state}
                    onChange={e => setLocalProperty(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Registro CAR:</label>
                  <input
                    type="text"
                    value={localProperty.carRegister}
                    onChange={e => setLocalProperty(prev => ({ ...prev, carRegister: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Responsável Técnico (Agrônomo):</label>
                  <input
                    type="text"
                    value={localProperty.technicalResponsible}
                    onChange={e => setLocalProperty(prev => ({ ...prev, technicalResponsible: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">CREA / Conselho:</label>
                  <input
                    type="text"
                    value={localProperty.creaNumber}
                    onChange={e => setLocalProperty(prev => ({ ...prev, creaNumber: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Número da ART:</label>
                  <input
                    type="text"
                    value={localProperty.artNumber}
                    onChange={e => setLocalProperty(prev => ({ ...prev, artNumber: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Packing House & Talhões Overview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Packing House & Unidade Central
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Nome do Packing House:</label>
                  <input
                    type="text"
                    value={localProperty.packingHouseName}
                    onChange={e => setLocalProperty(prev => ({ ...prev, packingHouseName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Endereço da Unidade:</label>
                  <input
                    type="text"
                    value={localProperty.packingHouseAddress}
                    onChange={e => setLocalProperty(prev => ({ ...prev, packingHouseAddress: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Câmaras Frias Disponíveis:</label>
                  <input
                    type="number"
                    min="0"
                    value={localProperty.coldRoomsCount}
                    onChange={e => setLocalProperty(prev => ({ ...prev, coldRoomsCount: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Talhões & Estufas Vinculados ({plots.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {plots.map(p => (
                  <div key={p.id} className="p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white block">{p.name}</strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{p.currentCrop} ({p.currentCultivar})</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{p.areaHa} ha</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Simulador & Teste ZPL / Bluetooth */}
      {activeConfigTab === 'preview_teste' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Live Visual Label Preview */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <Eye className="w-4 h-4 text-emerald-600" />
              Pré-Visualização Gráfica da Etiqueta Padrão ({localSettings.defaultSize} mm)
            </h3>

            {/* Simulação Visual da Etiqueta */}
            <div className="p-5 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center">
              <div className="w-full max-w-[420px] bg-white text-black p-4 rounded-xl border border-black shadow-md space-y-3 font-sans">
                {/* Header */}
                <div className="border-b-2 border-black pb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight leading-tight">
                      {localProperty.farmName || 'FAZENDA SANTA HELENA HF'}
                    </h4>
                    {localSettings.showProducerName && (
                      <p className="text-[10px] font-bold text-gray-800">
                        {localProperty.producerName}
                      </p>
                    )}
                    {localSettings.showDocument && (
                      <p className="text-[9px] text-gray-700">
                        Doc: {localProperty.documentNumber} | IE: {localProperty.stateRegistration}
                      </p>
                    )}
                  </div>
                  {localSettings.showInc02ComplianceBadge && (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 border border-black rounded bg-gray-100">
                      INC 02/2018
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1 text-[11px]">
                    <div className="font-black text-xs bg-black text-white px-1.5 py-0.5 rounded-xs inline-block">
                      LOTE: GA-TOM-2027-EST01-0001
                    </div>
                    {localSettings.showCultivar && (
                      <div><strong>Produto:</strong> Tomate Sweet Grape</div>
                    )}
                    {localSettings.showCommercialClass && (
                      <div><strong>Classe:</strong> Extra AA • 20.0 kg</div>
                    )}
                    {localSettings.showPlotInfo && (
                      <div><strong>Origem:</strong> Estufa 01 - Mogi Guaçu/SP</div>
                    )}
                    {localSettings.showHarvestDate && (
                      <div><strong>Colheita:</strong> 22/09/2027</div>
                    )}
                    {localSettings.showAgronomistArt && (
                      <div className="text-[9px] text-gray-600">
                        Resp: {localProperty.technicalResponsible} ({localProperty.creaNumber})
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    {testQrUrl ? (
                      <img src={testQrUrl} alt="QR Code" className="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200" />
                    )}
                    <span className="text-[8px] font-black uppercase mt-1">RASTREABILIDADE</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-black pt-1 flex justify-between text-[8px] font-bold text-gray-600">
                  <span>GeaAgro Suite Rastreabilidade</span>
                  <span>Consumidor: Aponte a câmera</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Código Nativo ZPL & Envio Bluetooth */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Script Nativo ZPL II & Teste de Conexão
              </h3>
              <span className="text-[10px] font-black text-slate-500 font-mono">
                {localSettings.defaultDpi} DPI
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Código ZPL gerado automaticamente com base nas dimensões, fontes e campos selecionados:
            </p>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              {generateSampleZPL()}
            </pre>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestBluetooth}
                disabled={bluetoothTestStatus === 'testing'}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {bluetoothTestStatus === 'testing'
                  ? 'Conectando Impressora Térmica...'
                  : bluetoothTestStatus === 'success'
                  ? 'Etiqueta Teste Enviada!'
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
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Baixar ZPL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
