// @ts-nocheck
import React, { useRef, useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Bell,
  CheckCircle2,
  Settings,
  Palette,
  Eye,
  Sliders,
  Type,
  Maximize2,
  Award,
  BookOpen,
  CloudLightning,
  AlertTriangle,
  Download,
  Info,
  Share2,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Send,
  FileCheck,
  X,
  Phone,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip as ChartTooltip,
} from 'recharts';
import {
  Farm,
  RuralProducer,
  Agronomist,
  Company,
  SoilSample,
  CropNutritionalTarget,
  LeafSample,
} from '../types/agronomy';
import {
  calculateLiming,
  calculateGypsum,
  calculateFertilization,
  interpretLeafAnalysis,
} from '../utils/agronomicCalculations';
import { notifyTechnicalReportFinalized } from '../utils/notificationService';

interface TechnicalReportModuleProps {
  farm: Farm;
  producer: RuralProducer;
  agronomist: Agronomist;
  company: Company;
  soilSample: SoilSample;
  crop: CropNutritionalTarget;
  targetYield: number;
  leafSample?: LeafSample;
  limingPrnt?: number;
  incorporationDepth?: number;
}

type BrandTheme = 'emerald' | 'sky' | 'indigo' | 'forest' | 'amber' | 'rose';

export const TechnicalReportModule: React.FC<TechnicalReportModuleProps> = ({
  farm,
  producer,
  agronomist,
  company,
  soilSample,
  crop,
  targetYield,
  leafSample,
  limingPrnt = 85,
  incorporationDepth = 20,
}) => {
  const [notifSent, setNotifSent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [targetPhoneNumber, setTargetPhoneNumber] = useState<string>(producer.phone || '');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Advanced layout & Watermark settings states
  const [themeColor, setThemeColor] = useState<BrandTheme>('emerald');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('LAUDO OFICIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.12);
  const [watermarkSize, setWatermarkSize] = useState<number>(48);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(-28);
  const [watermarkColor, setWatermarkColor] = useState<string>('#64748b');
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>(
    'Recomenda-se realizar o acompanhamento sistemático de umidade e o monitoramento integrado de pragas e doenças ao longo de todo o desenvolvimento fenológico da cultura.'
  );

  const plot = (farm?.plots || []).find((p) => p.id === soilSample.plotId) || farm?.plots?.[0];

  const liming = calculateLiming(soilSample, plot, crop, limingPrnt, incorporationDepth);
  const gypsum = calculateGypsum(soilSample, undefined, plot, crop);
  const fertilization = calculateFertilization(soilSample, plot, crop, targetYield);
  const foliarDiagnosis = leafSample ? interpretLeafAnalysis(leafSample, crop, soilSample) : null;

  const reportDate = new Date().toLocaleDateString('pt-BR');
  const reportNumber = `LAU-${farm.city.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
  const artNumber = `ART-CREA-${agronomist.creaState}-2026-${Math.floor(
    1000000 + Math.random() * 9000000
  )}`;

  // Color mappings based on selected branding theme
  const themeStyles = useMemo(() => {
    const config = {
      emerald: {
        primary: '#059669',
        border: 'border-emerald-600',
        text: 'text-emerald-700 dark:text-emerald-400',
        textDark: 'text-emerald-950',
        bgLight: 'bg-emerald-50/70',
        divider: 'border-emerald-200',
        hex: '#059669',
      },
      sky: {
        primary: '#0284c7',
        border: 'border-sky-600',
        text: 'text-sky-700 dark:text-sky-400',
        textDark: 'text-sky-950',
        bgLight: 'bg-sky-50/70',
        divider: 'border-sky-200',
        hex: '#0284c7',
      },
      indigo: {
        primary: '#4f46e5',
        border: 'border-indigo-600',
        text: 'text-indigo-700 dark:text-indigo-400',
        textDark: 'text-indigo-950',
        bgLight: 'bg-indigo-50/70',
        divider: 'border-indigo-200',
        hex: '#4f46e5',
      },
      forest: {
        primary: '#15803d',
        border: 'border-green-700',
        text: 'text-green-700 dark:text-green-400',
        textDark: 'text-green-950',
        bgLight: 'bg-green-50/70',
        divider: 'border-green-200',
        hex: '#15803d',
      },
      amber: {
        primary: '#d97706',
        border: 'border-amber-600',
        text: 'text-amber-700 dark:text-amber-400',
        textDark: 'text-amber-950',
        bgLight: 'bg-amber-50/70',
        divider: 'border-amber-200',
        hex: '#d97706',
      },
      rose: {
        primary: '#dc2626',
        border: 'border-rose-600',
        text: 'text-rose-700 dark:text-rose-400',
        textDark: 'text-rose-950',
        bgLight: 'bg-rose-50/70',
        divider: 'border-rose-200',
        hex: '#dc2626',
      },
    };
    return config[themeColor];
  }, [themeColor]);

  // Recharts Soil Saturation Level data
  const soilChartData = useMemo(() => {
    return [
      {
        name: 'V% (Bases)',
        atual: Number(soilSample.vPercent?.toFixed(1) || 0),
        esperado: crop.targetVPercent,
        color: '#10b981',
      },
      {
        name: 'm% (Alumínio)',
        atual: Number(soilSample.mPercent?.toFixed(1) || 0),
        esperado: crop.targetMPercent || 15,
        color: '#f43f5e',
      },
      {
        name: 'M.O. (Orgânica)',
        atual: Number(soilSample.organicMatterGdm3.toFixed(1)),
        esperado: 25, // Standard reference value for healthy organic matter levels
        color: '#d97706',
      },
    ];
  }, [soilSample, crop]);

  const handleNotifyPush = async () => {
    setNotifSent(true);
    await notifyTechnicalReportFinalized({
      farmName: farm.name,
      cropName: crop.cropName,
      agronomistName: agronomist.name,
      reportNumber,
      plotName: plot?.name || 'Talhão Principal',
      yieldTarget: targetYield,
    });
    setTimeout(() => setNotifSent(false), 4000);
  };

  // Formatted summary text tailored for WhatsApp messaging
  const whatsappSummaryText = useMemo(() => {
    const foliarStatusText = foliarDiagnosis && leafSample
      ? `🍃 *DIAGNÓSTICO FOLIAR (${leafSample.growthStage}):*\n  • Deficiências em ${foliarDiagnosis.deficientCount} nutriente(s)\n`
      : '🍃 *DIAGNÓSTICO FOLIAR:* Amostragem foliar não registrada para este ciclo.\n';

    const topDressingText = fertilization.topDressingFertilizer
      ? `4️⃣ *Cobertura:* ${fertilization.topDressingFertilizer.formulaName} - ${fertilization.topDressingFertilizer.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha (${fertilization.topDressingFertilizer.timing})`
      : '';

    return `📋 *LAUDO TÉCNICO DE RECOMENDAÇÃO AGRONÔMICA*
*Nº:* ${reportNumber} | *Data:* ${reportDate}
*ART:* ${artNumber}

🌱 *PRODUTOR & PROPRIEDADE*
• *Produtor:* ${producer.name} (${producer.documentType}: ${producer.document})
• *Fazenda:* ${farm.name} (${farm.city}/${farm.state})
• *Talhão:* ${plot?.name || 'Talhão 01'} (${plot?.areaHa || 0} ha | Textura: ${plot?.texture || 'médio'} - ${plot?.clayPercentage || 30}% argila)
• *Cultura Objetivo:* ${crop.cropName} (Meta: ${targetYield} ${crop.expectedYieldUnit})

📊 *ANÁLISE QUÍMICA DO SOLO (${soilSample.sampleCode})*
• pH CaCl₂: ${soilSample.phCaCl2.toFixed(1)} | M.O.: ${soilSample.organicMatterGdm3.toFixed(1)} g/dm³
• V% Atual: ${soilSample.vPercent?.toFixed(1)}% (Alvo: ${crop.targetVPercent}%)
• m% Alumínio: ${soilSample.mPercent?.toFixed(1)}% | P: ${soilSample.pMehlich1MgDm3.toFixed(1)} mg/dm³ | K: ${soilSample.kCmolcDm3.toFixed(2)} cmolc/dm³

🧪 *PRESCRIÇÃO AGRONÔMICA*
1️⃣ *Calagem (${liming.limestoneTypeRecommended.toUpperCase()} PRNT ${liming.prntPercent}%):*
    ➜ ${liming.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha (${(liming.dose.kgPerHa / 1000).toFixed(2)} t/ha)
    ➜ ${liming.dose.gPerPlant.toFixed(1)} g/planta | ${liming.dose.gPerLinearMeter.toFixed(1)} g/m linear
2️⃣ *Gessagem Agrícola:*
    ➜ ${gypsum.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha (${gypsum.isNeeded ? 'Recomendado' : 'Não necessário'})
3️⃣ *Adubação de Base (Plantio):*
    ➜ ${fertilization.plantingFertilizer.formulaName}: ${fertilization.plantingFertilizer.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha (${fertilization.plantingFertilizer.dose.gPerPlant.toFixed(1)} g/planta)
${topDressingText}

${foliarStatusText}
💬 *Observações do Agrônomo:*
${customNotes}

👨‍🌾 *Responsável Técnico:*
${agronomist?.name || 'Engenheiro Agrônomo'} - Eng. Agrônomo (CREA-${agronomist?.creaState || 'UF'} nº ${agronomist?.crea || 'N/D'})
🏢 ${company?.name || 'GeaAgro Tech'} (${company?.city || 'Brasil'}/${company?.state || 'BR'})`;
  }, [
    reportNumber,
    reportDate,
    artNumber,
    producer,
    farm,
    plot,
    crop,
    targetYield,
    soilSample,
    liming,
    gypsum,
    fertilization,
    foliarDiagnosis,
    leafSample,
    customNotes,
    agronomist,
    company,
  ]);

  // High quality PDF generation helper (returns PDF instance, blob and filename)
  const generatePdfBlob = async (): Promise<{ pdf: any; blob: Blob; filename: string }> => {
    const [{ jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas').then((m) => m.default),
    ]);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pages = document.querySelectorAll('.report-pdf-page');

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i] as HTMLElement;

      const canvas = await html2canvas(pageEl, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    const cleanFarmName = farm.name.toUpperCase().replace(/\s+/g, '_');
    const filename = `LAUDO_${cleanFarmName}_${reportNumber}.pdf`;
    const blob = pdf.output('blob');
    return { pdf, blob, filename };
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const { pdf, filename } = await generatePdfBlob();
      pdf.save(filename);
      setToastMessage('Laudo PDF exportado com sucesso!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Falha ao exportar PDF agronômico:', err);
      alert('Ocorreu um erro ao gerar o PDF. Verifique se o navegador possui suporte.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = targetPhoneNumber.replace(/\D/g, '');
    if (cleanPhone && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = `55${cleanPhone}`;
    }
    const encodedText = encodeURIComponent(whatsappSummaryText);
    const whatsappUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleCopyWhatsAppText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappSummaryText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  const handleShareWhatsAppPDF = async () => {
    setIsGenerating(true);
    try {
      const { blob, filename } = await generatePdfBlob();
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Laudo Técnico Agronômico - ${farm.name}`,
          text: `Laudo nº ${reportNumber} emitido para ${producer.name} - ${farm.name}`,
        });
        setToastMessage('Laudo em PDF compartilhado com sucesso!');
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        // Fallback: Download file & open WhatsApp link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        handleOpenWhatsApp();
        setToastMessage('PDF baixado! O WhatsApp foi aberto para você anexar o laudo.');
        setTimeout(() => setToastMessage(null), 4500);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar PDF:', err);
        handleOpenWhatsApp();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header & Customization Controls Panel */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 space-y-5 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Emissor de Laudos Técnicos Digitais</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
              Personalize a identidade do laudo oficial, ajuste marcas d'água e exporte em alta definição PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleNotifyPush}
              className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                notifSent
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
              }`}
            >
              {notifSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Notificado!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-emerald-500" />
                  <span>Notificar (Push)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp / Compartilhar</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Gerando Laudo PDF...' : 'Gerar Laudo PDF'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Físico</span>
            </button>
          </div>
        </div>

        {/* Customization Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          
          {/* Theme & Layout Configs */}
          <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-slate-800 dark:text-zinc-200 uppercase flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800/80 pb-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              Identidade Visual & Layout
            </h4>
            
            <div className="space-y-2">
              <label className="font-bold text-slate-600 dark:text-zinc-400 block">Tema de Cor Principal:</label>
              <div className="grid grid-cols-6 gap-1.5">
                {(['emerald', 'sky', 'indigo', 'forest', 'amber', 'rose'] as BrandTheme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setThemeColor(theme)}
                    className={`h-7 rounded-md border-2 transition-all flex items-center justify-center font-black ${
                      themeColor === theme ? 'border-slate-800 dark:border-white scale-105' : 'border-transparent'
                    } ${
                      theme === 'emerald' ? 'bg-emerald-500 text-white' :
                      theme === 'sky' ? 'bg-sky-500 text-white' :
                      theme === 'indigo' ? 'bg-indigo-500 text-white' :
                      theme === 'forest' ? 'bg-green-600 text-white' :
                      theme === 'amber' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                    title={`Tema ${theme}`}
                  >
                    {theme[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="font-bold text-slate-600 dark:text-zinc-400">Exibir Gráficos de Teores:</label>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all flex items-center ${
                  showCharts ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>

          {/* Custom Watermark Configs */}
          <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-slate-800 dark:text-zinc-200 uppercase flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800/80 pb-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Marca d'água Personalizada
            </h4>

            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-600 dark:text-zinc-400">Ativar Marca d'água:</label>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all flex items-center ${
                  showWatermark ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Texto da Marca:
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value.toUpperCase())}
                disabled={!showWatermark}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Opacidade: {Math.round(watermarkOpacity * 100)}%</label>
                <input
                  type="range"
                  min="0.02"
                  max="0.30"
                  step="0.01"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  disabled={!showWatermark}
                  className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Rotação: {watermarkRotation}°</label>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={watermarkRotation}
                  onChange={(e) => setWatermarkRotation(Number(e.target.value))}
                  disabled={!showWatermark}
                  className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Custom Recommendations Notes */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-slate-800 dark:text-zinc-200 uppercase flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800/80 pb-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Observações & Notas do Agrônomo
            </h4>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 dark:text-zinc-400 block">Notas Personalizadas no Rodapé:</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                placeholder="Insira as observações finais para o produtor..."
              />
            </div>
          </div>

        </div>
      </div>

      {/* Visual Indicator of swipeability for mobile screens (UX-first responsiveness) */}
      <div className="lg:hidden flex items-center justify-between gap-3 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3.5 print:hidden">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
          <span>Arraste horizontalmente para inspecionar as páginas inteiras do laudo A4.</span>
        </div>
        <span className="text-[10px] bg-emerald-200/50 dark:bg-emerald-800/40 px-2 py-0.5 rounded-full select-none">A4 Pro</span>
      </div>

      {/* Printable Report / Document Sheets View (WYSIWYG layout in A4 dimensions) */}
      <div className="overflow-x-auto pb-4 flex flex-col items-center gap-8 bg-slate-100 dark:bg-zinc-950 p-6 rounded-xl border border-slate-200 dark:border-zinc-850">
        
        {/* --- PAGE 1: HEADER, METADATA & SOIL ANALYSIS --- */}
        <div
          className="report-pdf-page relative bg-white text-slate-900 border border-slate-300 dark:border-zinc-800 shadow-xl overflow-hidden p-[15mm] flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '297mm',
            minWidth: '210mm',
            minHeight: '297mm',
          }}
        >
          {/* Custom Watermark Overlay */}
          {showWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
              style={{ opacity: watermarkOpacity }}
            >
              <div
                className="font-black select-none uppercase tracking-widest text-center whitespace-nowrap"
                style={{
                  transform: `rotate(${watermarkRotation}deg)`,
                  fontSize: `${watermarkSize}px`,
                  color: watermarkColor,
                }}
              >
                {watermarkText}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Header */}
            <div className={`border-b-2 ${themeStyles.border} pb-4 flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                {company?.logoUrl ? (
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    <img
                      src={company.logoUrl}
                      alt={company.name || 'Logotipo da Empresa'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className={`w-11 h-11 rounded-xl bg-slate-950 text-white border border-slate-800 flex items-center justify-center font-bold text-xl shrink-0`}>
                    {(company?.name || 'GA').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                    {company?.name || 'GeaAgro Tech'}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    {company?.creaRegister ? `${company.creaRegister} • ` : ''}{company?.cnpj ? `CNPJ: ${company.cnpj} • ` : ''}{company?.city || 'Brasil'}-{company?.state || 'BR'}
                  </p>
                  <p className={`text-[10px] ${themeStyles.text} font-black uppercase tracking-wider`}>
                    LAUDO DE RECOMENDAÇÃO AGRONÔMICA & FERTILIDADE
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] leading-tight shrink-0 font-mono">
                <p className="font-bold text-slate-900">LAUDO: {reportNumber}</p>
                <p className="text-slate-500">Emissão: {reportDate}</p>
                <p className="text-slate-500">ART: {artNumber}</p>
              </div>
            </div>

            {/* Identificação de Agentes */}
            <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[8px] uppercase font-extrabold text-slate-500 block mb-1">PRODUTOR & FAZENDA</span>
                <p className="font-extrabold text-slate-900 text-xs">{producer?.name || 'Produtor Rural'}</p>
                <p className="text-slate-600">{producer?.documentType || 'CPF'}: {producer?.document || 'N/D'} • IE: {producer?.stateRegistration || 'Isento'}</p>
                <p className="font-bold text-slate-800 mt-1">Fazenda: {farm?.name || 'Fazenda'}</p>
                <p className="text-slate-600">{farm?.city || 'Município'}/{farm?.state || 'UF'} • CAR: {farm?.carRegister || 'Ativo'}</p>
              </div>

              <div>
                <span className="text-[8px] uppercase font-extrabold text-slate-500 block mb-1">TALHÃO & RESPONSABILIDADE TÉCNICA</span>
                <p className="font-extrabold text-slate-900 text-xs">Talhão: {plot?.name || 'Talhão 01'} ({plot?.areaHa || 0} ha)</p>
                <p className="text-slate-600">
                  Textura: <strong className="capitalize">{plot?.texture || 'Média'}</strong> ({plot?.clayPercentage || 30}% argila) • Espaçamento: {plot?.spacingBetweenRowsMeters || 0.5}m x {plot?.spacingBetweenPlantsMeters || 0.2}m
                </p>
                <p className="font-bold text-slate-800 mt-1">Eng. Agrônomo: {agronomist?.name || 'Responsável Técnico'}</p>
                <p className={`font-extrabold ${themeStyles.text}`}>CREA-{agronomist?.creaState || 'UF'} nº {agronomist?.crea || 'N/D'} • RNP: {agronomist?.rnp || 'N/D'}</p>
              </div>
            </div>

            {/* Planejamento Agrícola */}
            <div className={`${themeStyles.bgLight} border ${themeStyles.divider} rounded-lg p-2.5 flex items-center justify-between text-[11px] font-bold`}>
              <div className="text-slate-900">
                <span>Cultura Objetivo: </span>
                <span className={`${themeStyles.text}`}>{crop.cropName}</span>
                <span className="text-slate-500 font-medium"> ({crop.scientificName})</span>
              </div>
              <div className="text-slate-900">
                Meta Esperada: {targetYield} {crop.expectedYieldUnit}
              </div>
            </div>

            {/* Diagnóstico de Solo */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Diagnóstico Químico do Solo (Amostra: {soilSample.sampleCode} - {soilSample.depth}cm)</span>
              </h3>

              <table className="w-full border border-slate-200 text-[10px] text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700">
                    <th className="py-1.5 px-1 border border-slate-200">pH CaCl₂</th>
                    <th className="py-1.5 px-1 border border-slate-200">M.O. (g/dm³)</th>
                    <th className="py-1.5 px-1 border border-slate-200">P (mg/dm³)</th>
                    <th className="py-1.5 px-1 border border-slate-200" title="1 cmolc/dm³ = 391 mg.dm3">K (cmolc / mg.dm3)</th>
                    <th className="py-1.5 px-1 border border-slate-200">Ca (cmolc/dm³)</th>
                    <th className="py-1.5 px-1 border border-slate-200">Mg (cmolc/dm³)</th>
                    <th className="py-1.5 px-1 border border-slate-200">Al (cmolc/dm³)</th>
                    <th className="py-1.5 px-1 border border-slate-200">H+Al</th>
                    <th className="py-1.5 px-1 border border-slate-200">CTC (T)</th>
                    <th className="py-1.5 px-1 border border-slate-200">V% Atual</th>
                    <th className="py-1.5 px-1 border border-slate-200">m% Atual</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="font-medium text-slate-800">
                    <td className="py-1.5 px-1 border border-slate-200 font-black">{soilSample.phCaCl2.toFixed(1)}</td>
                    <td className="py-1.5 px-1 border border-slate-200">{soilSample.organicMatterGdm3.toFixed(1)}</td>
                    <td className="py-1.5 px-1 border border-slate-200 font-bold text-amber-700">{soilSample.pMehlich1MgDm3.toFixed(1)}</td>
                    <td className="py-1.5 px-1 border border-slate-200">
                      <span>{soilSample.kCmolcDm3.toFixed(2)}</span>
                      <span className="text-[8px] text-slate-500 block">({(soilSample.kMgDm3 != null ? soilSample.kMgDm3 : soilSample.kCmolcDm3 * 391).toFixed(0)} mg)</span>
                    </td>
                    <td className="py-1.5 px-1 border border-slate-200">{soilSample.caCmolcDm3.toFixed(2)}</td>
                    <td className="py-1.5 px-1 border border-slate-200">{soilSample.mgCmolcDm3.toFixed(2)}</td>
                    <td className="py-1.5 px-1 border border-slate-200 text-rose-600">{soilSample.alCmolcDm3.toFixed(2)}</td>
                    <td className="py-1.5 px-1 border border-slate-200">{soilSample.hAlCmolcDm3.toFixed(2)}</td>
                    <td className="py-1.5 px-1 border border-slate-200 font-semibold">{soilSample.ctcTotal?.toFixed(2)}</td>
                    <td className="py-1.5 px-1 border border-slate-200 font-black text-emerald-600">{soilSample.vPercent?.toFixed(1)}%</td>
                    <td className="py-1.5 px-1 border border-slate-200 font-bold text-rose-600">{soilSample.mPercent?.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grafico de Teores em Recharts */}
            {showCharts && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[9px] uppercase font-extrabold text-slate-500 block">EQUILÍBRIO QUÍMICO VS REQUISITOS DA CULTURA</span>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={soilChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="2 2" opacity={0.15} horizontal={false} />
                      <XAxis type="number" fontSize={9} stroke="#888888" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" fontSize={9} stroke="#888888" width={80} />
                      <Bar dataKey="atual" radius={[0, 4, 4, 0]} maxBarSize={15}>
                        {soilChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                      <Bar dataKey="esperado" fill="#cbd5e1" radius={[0, 4, 4, 0]} maxBarSize={8} opacity={0.4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 justify-center text-[8px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-xs bg-emerald-500" /> V% Atual / Esperado</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-xs bg-rose-500" /> m% Alumínio Atual / Tolerado</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-xs bg-amber-500" /> M.O. Atual / Ideal</span>
                </div>
              </div>
            )}

          </div>

          {/* Footer Page 1 */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>Emitido por {company?.name || 'GeaAgro Tech'} em {reportDate}</span>
            <span className="font-bold uppercase tracking-wider text-slate-500">Página 1 de 3</span>
          </div>
        </div>

        {/* --- PAGE 2: CORE PRESCRIPTIONS (LIMING, GYPSUM & FERTILIZATION) --- */}
        <div
          className="report-pdf-page relative bg-white text-slate-900 border border-slate-300 dark:border-zinc-800 shadow-xl overflow-hidden p-[15mm] flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '297mm',
            minWidth: '210mm',
            minHeight: '297mm',
          }}
        >
          {/* Custom Watermark Overlay */}
          {showWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
              style={{ opacity: watermarkOpacity }}
            >
              <div
                className="font-black select-none uppercase tracking-widest text-center whitespace-nowrap"
                style={{
                  transform: `rotate(${watermarkRotation}deg)`,
                  fontSize: `${watermarkSize}px`,
                  color: watermarkColor,
                }}
              >
                {watermarkText}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between text-[10px]">
              <span className={`font-black ${themeStyles.text} uppercase tracking-wider`}>Prescrição de Adubação e Corretivos</span>
              <span className="font-mono text-slate-500">Laudo: {reportNumber}</span>
            </div>

            {/* Prescrição em Três Unidades */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Prescrição Técnica Agronômica em Três Unidades Operacionais</span>
              </h3>

              <table className="w-full border-2 border-slate-800 text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold text-left">
                    <th className="py-2 px-2 border border-slate-800">Insumo / Operação</th>
                    <th className="py-2 px-2 border border-slate-800 text-right bg-slate-800">Dose (kg/ha)</th>
                    <th className="py-2 px-2 border border-slate-800 text-right">Dose (g/planta)</th>
                    <th className="py-2 px-2 border border-slate-800 text-right">Dose (g/m linear)</th>
                    <th className="py-2 px-2 border border-slate-800">Manejo Recomendado</th>
                  </tr>
                </thead>
                <tbody className="bg-white font-medium divide-y divide-slate-200 text-slate-800">
                  
                  {/* Calagem */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2">
                      <p className="font-black text-slate-900">1. Calagem (Calcário {liming.limestoneTypeRecommended.toUpperCase()})</p>
                      <p className="text-[8px] text-slate-500">PRNT {liming.prntPercent}% • Incorporação a {liming.soilIncorporationDepthCm} cm</p>
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-amber-900 bg-amber-50">
                      {liming.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha
                      <span className="block text-[8px] text-slate-500">({(liming.dose.kgPerHa / 1000).toFixed(2)} t/ha)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold">{liming.dose.gPerPlant.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-right font-bold">{liming.dose.gPerLinearMeter.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-[8px] leading-relaxed">
                      Aplicar em área total sem vento e incorporar uniformemente 60-90 dias antes do plantio.
                    </td>
                  </tr>

                  {/* Gessagem */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2">
                      <p className="font-black text-slate-900">2. Gessagem (Gesso Agrícola)</p>
                      <p className="text-[8px] text-slate-500">Condicionamento do subsolo ({plot?.clayPercentage || 30}% argila)</p>
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-sky-900 bg-sky-50">
                      {gypsum.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha
                      <span className="block text-[8px] text-slate-500">({(gypsum.dose.kgPerHa / 1000).toFixed(2)} t/ha)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold">{gypsum.dose.gPerPlant.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-right font-bold">{gypsum.dose.gPerLinearMeter.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-[8px] leading-relaxed">
                      {gypsum.isNeeded ? 'Aplicar a lanço em área total sem incorporação superficial.' : 'Não recomendado para o ciclo atual.'}
                    </td>
                  </tr>

                  {/* Adubação Base */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2">
                      <p className="font-black text-slate-900">3. Adubação de Base (Plantio)</p>
                      <p className="text-[8px] text-emerald-700 font-extrabold">{fertilization.plantingFertilizer.formulaName}</p>
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-900 bg-emerald-50">
                      {fertilization.plantingFertilizer.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold">{fertilization.plantingFertilizer.dose.gPerPlant.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-right font-bold">{fertilization.plantingFertilizer.dose.gPerLinearMeter.toFixed(1)} g</td>
                    <td className="py-2.5 px-2 text-[8px] leading-relaxed">
                      Distribuir no sulco de semeadura a 5cm ao lado e 5cm abaixo das sementes.
                    </td>
                  </tr>

                  {/* Adubação Cobertura */}
                  {fertilization.topDressingFertilizer && (
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-2">
                        <p className="font-black text-slate-900">4. Adubação de Cobertura</p>
                        <p className="text-[8px] text-indigo-700 font-extrabold">{fertilization.topDressingFertilizer.formulaName}</p>
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-indigo-900 bg-indigo-50">
                        {fertilization.topDressingFertilizer.dose.kgPerHa.toLocaleString('pt-BR')} kg/ha
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold">{fertilization.topDressingFertilizer.dose.gPerPlant.toFixed(1)} g</td>
                      <td className="py-2.5 px-2 text-right font-bold">{fertilization.topDressingFertilizer.dose.gPerLinearMeter.toFixed(1)} g</td>
                      <td className="py-2.5 px-2 text-[8px] leading-relaxed">
                        {fertilization.topDressingFertilizer.timing} (Dividido em {fertilization.topDressingFertilizer.splitApplications}x).
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* Metadados adicionais de absorção e parcelamento */}
            <div className="grid grid-cols-2 gap-3.5 text-[10px] leading-relaxed">
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <span className="font-extrabold text-amber-800 flex items-center gap-1 mb-1 uppercase tracking-wider text-[8px]">
                  <Info className="w-3.5 h-3.5" /> Recomendações de Distribuição Fósforo
                </span>
                <p className="text-slate-700 text-[9px]">
                  O fósforo possui baixíssima mobilidade no solo. Garanta que o adubo de plantio NPK seja depositado abaixo e ao lado da semente, estimulando as raízes novas a entrarem em contato rápido com a zona fertilizada.
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <span className="font-extrabold text-blue-800 flex items-center gap-1 mb-1 uppercase tracking-wider text-[8px]">
                  <CloudLightning className="w-3.5 h-3.5" /> Atenção à Lixiviação de Potássio e Nitrogênio
                </span>
                <p className="text-slate-700 text-[9px]">
                  Em solos arenosos ou de textura média, o potássio e o nitrogênio em doses superiores a 50 kg/ha devem ser rigidamente parcelados para mitigar as perdas por lavagem vertical do perfil (lixiviação).
                </p>
              </div>
            </div>

          </div>

          {/* Footer Page 2 */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>Emitido por {company?.name || 'GeaAgro Tech'} em {reportDate}</span>
            <span className="font-bold uppercase tracking-wider text-slate-500">Página 2 de 3</span>
          </div>
        </div>

        {/* --- PAGE 3: FOLIAR ANALYSIS DIAGNOSIS, CUSTOM NOTES & TECHNICAL SIGNATURE --- */}
        <div
          className="report-pdf-page relative bg-white text-slate-900 border border-slate-300 dark:border-zinc-800 shadow-xl overflow-hidden p-[15mm] flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '297mm',
            minWidth: '210mm',
            minHeight: '297mm',
          }}
        >
          {/* Custom Watermark Overlay */}
          {showWatermark && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
              style={{ opacity: watermarkOpacity }}
            >
              <div
                className="font-black select-none uppercase tracking-widest text-center whitespace-nowrap"
                style={{
                  transform: `rotate(${watermarkRotation}deg)`,
                  fontSize: `${watermarkSize}px`,
                  color: watermarkColor,
                }}
              >
                {watermarkText}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Page Header */}
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between text-[10px]">
              <span className={`font-black ${themeStyles.text} uppercase tracking-wider`}>Diagnóstico Foliar & Assinatura Técnica</span>
              <span className="font-mono text-slate-500">Laudo: {reportNumber}</span>
            </div>

            {/* Diagnose Foliar se disponível */}
            {foliarDiagnosis && leafSample ? (
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3. Parecer da Diagnose Foliar ({leafSample.sampleCode} - {leafSample.growthStage})</span>
                </h3>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] space-y-2 text-slate-700 leading-relaxed">
                  <p>
                    A diagnose foliar indica se os nutrientes absorvidos pelas raízes estão efetivamente suprindo a atividade metabólica da planta. 
                    No estágio <strong className="text-slate-900">{leafSample.growthStage}</strong>, foram detectadas deficiências em <strong className="text-rose-600 font-extrabold">{foliarDiagnosis.deficientCount} nutrientes</strong>.
                  </p>
                  
                  {/* Status checklist of leaf nutrients */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9px] pt-1">
                    {foliarDiagnosis.evaluations.map((evalItem) => (
                      <div key={evalItem.key} className="flex items-center gap-1 p-1 bg-white border border-slate-100 rounded">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          evalItem.status === 'severely_deficient' || evalItem.status === 'deficient' ? 'bg-rose-500' :
                          evalItem.status === 'excessive' || evalItem.status === 'high' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="font-bold text-slate-800 uppercase">{evalItem.name.split(' ')[0]}:</span>
                        <span className="text-[8px] text-slate-500">{evalItem.value.toFixed(1)} {evalItem.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3. Diagnose Foliar & Estado Nutricional</span>
                </h3>
                <p className="text-[10px] text-slate-500 italic bg-slate-50 p-3 rounded border border-dashed border-slate-200">
                  Nenhuma análise foliar registrada para este talhão na safra atual. Recomenda-se coletar amostras de folhas durante o pleno florescimento da cultura para aferição nutricional fina.
                </p>
              </div>
            )}

            {/* Custom Technical Notes block */}
            {customNotes && (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Parecer e Recomendações Técnicas Adicionais do Consultor</span>
                </h3>
                <div className="p-3 bg-amber-50/20 border border-amber-100 rounded-lg text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {customNotes}
                </div>
              </div>
            )}

            {/* Termos de conformidade e uso de defensivos */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[8px] leading-relaxed text-slate-500 space-y-1">
              <span className="font-extrabold text-slate-700 uppercase block">TERMOS DE RESPONSABILIDADE E CONFORMIDADE TÉCNICA</span>
              <p>• As dosagens e prescrições agronômicas recomendadas neste laudo baseiam-se unicamente nas amostras químicas de solo fornecidas pelo produtor rural para o talhão correspondente.</p>
              <p>• O uso de qualquer defensivo ou fertilizante deve ser acompanhado de receituário agronômico específico e seguir criteriosamente as normas de segurança do fabricante, uso de EPI e descarte correto de embalagens tríplice-lavadas.</p>
            </div>

            {/* Assinatura do Agronomo */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 items-end">
              <div className="text-[8px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1 font-bold text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Documento oficial registrado no CREA.</span>
                </p>
                <p>O produtor assume a total responsabilidade pela execução física no campo conforme dosagens estabelecidas.</p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="w-48 h-10 border-b border-slate-300 ml-auto flex items-end justify-center">
                  <span className="font-serif italic text-xs text-slate-600 leading-none">{agronomist?.signatureText || 'Assinatura Digital'}</span>
                </div>
                <p className="font-black text-[11px] text-slate-900 mt-1">{agronomist?.name || 'Responsável Técnico'}</p>
                <p className="text-[9px] text-emerald-700 font-bold leading-none">
                  Engenheiro Agrônomo • CREA-{agronomist?.creaState || 'UF'} nº {agronomist?.crea || 'N/D'}
                </p>
                <p className="text-[8px] text-slate-400 font-mono">RNP: {agronomist?.rnp || 'N/D'}</p>
              </div>
            </div>

          </div>

          {/* Footer Page 3 */}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>Emitido por {company?.name || 'GeaAgro Tech'} em {reportDate}</span>
            <span className="font-bold uppercase tracking-wider text-slate-500">Página 3 de 3</span>
          </div>
        </div>

      </div>

      {/* WhatsApp & PDF Export Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Exportar & Compartilhar Laudo Técnico</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Envie o resumo agronômico formatado e o laudo em PDF para o produtor via WhatsApp.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Phone Field */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Telefone do Produtor / Destinatário (com DDD):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetPhoneNumber}
                  onChange={(e) => setTargetPhoneNumber(e.target.value)}
                  placeholder="Ex: (11) 99876-5432 ou 5511998765432"
                  className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir Conversa</span>
                </button>
              </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleShareWhatsAppPDF}
                disabled={isGenerating}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer group disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {isGenerating ? 'Gerando PDF...' : 'Compartilhar Arquivo PDF'}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  Anexa PDF via Web Share / WhatsApp
                </span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isGenerating}
                className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer group disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-slate-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Baixar PDF Completo
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Salva laudo em PDF no dispositivo
                </span>
              </button>

              <button
                onClick={handleCopyWhatsAppText}
                className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer group"
              >
                {copiedText ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {copiedText ? 'Copiado!' : 'Copiar Resumo'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Copia texto com formatação
                </span>
              </button>
            </div>

            {/* Formatted Text Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Pré-visualização da Mensagem do WhatsApp:
                </span>
                <button
                  onClick={handleCopyWhatsAppText}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 dark:bg-zinc-900 text-[11px] font-mono leading-relaxed rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800 select-all">
                {whatsappSummaryText}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>Pronto para envio instantâneo via WhatsApp Web ou dispositivo móvel.</span>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-5 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
