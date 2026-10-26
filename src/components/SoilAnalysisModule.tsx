// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Layers,
  Calculator,
  FileText,
  Camera,
  Sparkles,
  Edit3,
  RefreshCw,
  Eye,
  Info,
  Wifi,
  WifiOff,
  Activity,
  Dna,
  Check,
  TrendingUp,
  MapPin,
  List,
  Compass,
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { SoilSample, Farm } from '../types/agronomy';
import {
  downloadSoilCsvTemplate,
  validateAndParseSoilCsv,
  ImportValidationResult,
} from '../utils/spreadsheetTemplate';
import { calculateSoilIndices } from '../utils/agronomicCalculations';
import { SoilSamplingMapView } from './soil/SoilSamplingMapView';

interface SoilAnalysisModuleProps {
  soilSamples: SoilSample[];
  setSoilSamples: React.Dispatch<React.SetStateAction<SoilSample[]>>;
  selectedFarm: Farm;
  onSelectSampleForRecommendation?: (sample: SoilSample) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export const SoilAnalysisModule: React.FC<SoilAnalysisModuleProps> = ({
  soilSamples,
  setSoilSamples,
  selectedFarm,
  onSelectSampleForRecommendation,
  activeSubTab,
  setActiveSubTab,
}) => {
  const [activeView, setActiveView] = useState<'list' | 'import' | 'manual' | 'ocr' | 'mapping'>('list');

  // Synchronize incoming activeSubTab with activeView
  useEffect(() => {
    if (!activeSubTab) return;
    if (activeSubTab === 'leitura_ia' || activeSubTab === 'ocr') {
      setActiveView('ocr');
    } else if (activeSubTab === 'cadastro_manual' || activeSubTab === 'manual') {
      setActiveView('manual');
    } else if (activeSubTab === 'importar_csv' || activeSubTab === 'import') {
      setActiveView('import');
    } else if (activeSubTab === 'mapeamento' || activeSubTab === 'mapping' || activeSubTab === 'georreferenciamento') {
      setActiveView('mapping');
    } else if (activeSubTab === 'amostras' || activeSubTab === 'laudos' || activeSubTab === 'list') {
      setActiveView('list');
    }
  }, [activeSubTab]);

  const handleSwitchView = (view: 'list' | 'import' | 'manual' | 'ocr' | 'mapping') => {
    setActiveView(view);
    if (setActiveSubTab) {
      if (view === 'ocr') setActiveSubTab('leitura_ia');
      else if (view === 'manual') setActiveSubTab('cadastro_manual');
      else if (view === 'import') setActiveSubTab('importar_csv');
      else if (view === 'mapping') setActiveSubTab('mapeamento');
      else setActiveSubTab('amostras');
    }
  };
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportValidationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterPlotId, setFilterPlotId] = useState<string>('all');
  const [filterDepth, setFilterDepth] = useState<string>('all');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // OCR State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [useOfflineOcr, setUseOfflineOcr] = useState(false);
  const [ocrFile, setOcrFile] = useState<{ name: string; type: string; previewUrl?: string } | null>(null);
  const [ocrRawSummary, setOcrRawSummary] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Form State for Manual & OCR Edit
  const [formData, setFormData] = useState({
    code: '',
    plotId: selectedFarm?.plots?.[0]?.id || '',
    depth: '0-20' as '0-20' | '20-40',
    date: new Date().toISOString().split('T')[0],
    lab: 'LabSolos Análise Agronômica',
    protocol: `PROT-${Math.floor(10000 + Math.random() * 90000)}`,
    // Acidez & M.O.
    ph: 5.2,
    phH2O: '' as number | string,
    phSmp: '' as number | string,
    mo: 25.0,
    al: 0.15,
    hAl: 3.5,
    // Macronutrientes
    p: 12.0, // P Mehlich 1
    pMehlich3: '' as number | string,
    pResina: '' as number | string,
    pRem: '' as number | string, // P Remanescente (mg/L)
    pRem3: '' as number | string, // Remanescente 3 (mg/L)
    k: 0.22 as number | string,
    ca: 2.8,
    mg: 0.9,
    s: 6.0,
    // Micronutrientes
    b: 0.35,
    cu: 1.2,
    fe: 45.0,
    mn: 18.0,
    zn: 2.4,
    molibdenio: "" as number | string,
    // Elementos Benéficos & Funcionais
    si: '' as number | string, // Silício
    co: '' as number | string, // Cobalto
    ni: '' as number | string, // Níquel
    se: '' as number | string, // Selênio
    na: '' as number | string, // Sódio
    // Granulometria
    clay: selectedFarm?.plots?.[0]?.clayPercentage || 38,
    sand: 42,
    silt: 20,
    // BioAS (Bioanálise de Solo Embrapa)
    hasBioAS: false,
    arylsulfatase: '' as number | string,
    betaGlucosidase: '' as number | string,
    acidPhosphatase: '' as number | string,
    iqsBio: '' as number | string,
    bioasHealthClass: '' as string,
    bioasInterpretation: '',
    notes: '',
  });

  // K Unit state: 'cmolc' (K cmolc/dm³) ou 'mg' (K mg.dm3)
  const [kUnit, setKUnit] = useState<'cmolc' | 'mg'>('cmolc');

  const handleKUnitChange = (newUnit: 'cmolc' | 'mg') => {
    if (newUnit === kUnit) return;
    const currentVal = formData.k;
    if (currentVal !== '' && !isNaN(Number(currentVal))) {
      const num = Number(currentVal);
      if (newUnit === 'mg') {
        // cmolc -> mg: multiplica por 391
        const converted = Number((num * 391).toFixed(1));
        setFormData(prev => ({ ...prev, k: converted }));
      } else {
        // mg -> cmolc: divide por 391
        const converted = Number((num / 391).toFixed(3));
        setFormData(prev => ({ ...prev, k: converted }));
      }
    }
    setKUnit(newUnit);
  };

  const effectiveKCmolc = kUnit === 'mg'
    ? (formData.k !== '' && !isNaN(Number(formData.k)) ? Number(formData.k) / 391 : 0)
    : (formData.k !== '' && !isNaN(Number(formData.k)) ? Number(formData.k) : 0);

  // Calculate live preview indices from form data
  const liveIndices = calculateSoilIndices({
    caCmolcDm3: formData.ca,
    mgCmolcDm3: formData.mg,
    kCmolcDm3: effectiveKCmolc,
    kMgDm3: kUnit === 'mg' ? (formData.k !== '' ? Number(formData.k) : 0) : Number((effectiveKCmolc * 391).toFixed(1)),
    alCmolcDm3: formData.al,
    hAlCmolcDm3: formData.hAl,
    clayPercent: formData.clay,
    hasBioAS: formData.hasBioAS,
    arylsulfataseMgPnpKgH: formData.hasBioAS && formData.arylsulfatase !== '' ? Number(formData.arylsulfatase) : undefined,
    betaGlucosidaseMgPnpKgH: formData.hasBioAS && formData.betaGlucosidase !== '' ? Number(formData.betaGlucosidase) : undefined,
    acidPhosphataseMgPnpKgH: formData.hasBioAS && formData.acidPhosphatase !== '' ? Number(formData.acidPhosphatase) : undefined,
    iqsBioScore: formData.hasBioAS && formData.iqsBio !== '' ? Number(formData.iqsBio) : undefined,
    bioasHealthClass: formData.hasBioAS && formData.bioasHealthClass ? (formData.bioasHealthClass as any) : undefined,
  });

  const resetForm = () => {
    setKUnit('cmolc');
    setFormData({
      code: '',
      plotId: selectedFarm?.plots?.[0]?.id || '',
      depth: '0-20',
      date: new Date().toISOString().split('T')[0],
      lab: 'LabSolos Análise Agronômica',
      protocol: `PROT-${Math.floor(10000 + Math.random() * 90000)}`,
      ph: 5.2,
      phH2O: '',
      phSmp: '',
      mo: 25.0,
      p: 12.0,
      pMehlich3: '',
      pResina: '',
      pRem: '',
      pRem3: '',
      k: 0.22,
      ca: 2.8,
      mg: 0.9,
      al: 0.15,
      hAl: 3.5,
      s: 6.0,
      b: 0.35,
      cu: 1.2,
      fe: 45.0,
      mn: 18.0,
      zn: 2.4,
    molibdenio: "" as number | string,
      si: '',
      co: '',
      ni: '',
      se: '',
      na: '',
      clay: selectedFarm?.plots?.[0]?.clayPercentage || 38,
      sand: 42,
      silt: 20,
      hasBioAS: false,
      arylsulfatase: '',
      betaGlucosidase: '',
      acidPhosphatase: '',
      iqsBio: '',
      bioasHealthClass: '',
      bioasInterpretation: '',
      notes: '',
    });
    setEditingSampleId(null);
    setOcrFile(null);
    setOcrRawSummary(null);
    setExtractedFields(new Set());
  };

  // Start Editing Existing Sample
  const handleStartEdit = (sample: SoilSample) => {
    setEditingSampleId(sample.id);
    setKUnit('cmolc');
    setFormData({
      code: sample.sampleCode,
      plotId: sample.plotId,
      depth: (sample.depth === '20-40' ? '20-40' : '0-20'),
      date: sample.collectionDate,
      lab: sample.labName,
      protocol: sample.labProtocol || '',
      ph: sample.phCaCl2,
      phH2O: sample.phH2O ?? '',
      phSmp: sample.phSmp ?? '',
      mo: sample.organicMatterGdm3,
      p: sample.pMehlich1MgDm3,
      pMehlich3: sample.pMehlich3MgDm3 ?? '',
      pResina: sample.pResinaMgDm3 ?? '',
      pRem: sample.pRemanescenteMgL ?? '',
      pRem3: sample.pRemanescente3MgL ?? '',
      k: sample.kCmolcDm3,
      ca: sample.caCmolcDm3,
      mg: sample.mgCmolcDm3,
      al: sample.alCmolcDm3,
      hAl: sample.hAlCmolcDm3,
      s: sample.sSO4MgDm3,
      b: sample.bMgDm3,
      cu: sample.cuMgDm3,
      fe: sample.feMgDm3,
      mn: sample.mnMgDm3,
      zn: sample.znMgDm3,
      molibdenio: sample.moMgDm3 ?? "",
      si: sample.siMgDm3 ?? '',
      co: sample.coMgDm3 ?? '',
      ni: sample.niMgDm3 ?? '',
      se: sample.seMgDm3 ?? '',
      na: sample.naCmolcDm3 ?? '',
      clay: sample.clayPercent,
      sand: sample.sandPercent,
      silt: sample.siltPercent,
      hasBioAS: Boolean(sample.hasBioAS || sample.arylsulfataseMgPnpKgH || sample.betaGlucosidaseMgPnpKgH || sample.acidPhosphataseMgPnpKgH),
      arylsulfatase: sample.arylsulfataseMgPnpKgH ?? '',
      betaGlucosidase: sample.betaGlucosidaseMgPnpKgH ?? '',
      acidPhosphatase: sample.acidPhosphataseMgPnpKgH ?? '',
      iqsBio: sample.iqsBioScore ?? '',
      bioasHealthClass: sample.bioasHealthClass ?? '',
      bioasInterpretation: sample.bioasInterpretation ?? '',
      notes: sample.notes || '',
    });
    setExtractedFields(new Set());
    handleSwitchView('manual');
  };

  // Process OCR on Photo or PDF
  const handleOcrFileSelect = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('Formato inválido. Por favor, envie uma foto (PNG, JPG, WEBP) ou documento em PDF.', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showNotification('O arquivo é muito grande (máximo de 20MB).', 'error');
      return;
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setOcrFile({ name: file.name, type: file.type, previewUrl });
    setOcrLoading(true);
    setOcrRawSummary(null);

    try {
      if (useOfflineOcr) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          showNotification('O processamento offline não suporta PDF. Envie uma imagem (JPG/PNG) ou ative a extração via internet (IA).', 'error');
          setOcrLoading(false);
          return;
        }

        try {
          const result = await Tesseract.recognize(file, 'por');
          const text = result.data.text;
          
          setFormData(prev => {
            const next = { ...prev };
            const detected = new Set<string>();

            const extractValue = (pattern: RegExp) => {
              const match = text.match(pattern);
              if (match && match[1]) {
                const val = Number(match[1].replace(',', '.'));
                return isNaN(val) ? null : val;
              }
              return null;
            };

            const ph = extractValue(/pH\s*(?:CaCl2)?.*?(\d+[,.]\d+)/i);
            if (ph !== null) { next.ph = ph; detected.add('ph'); }

            const phH2O = extractValue(/pH\s*(?:H2O|água|agua).*?(\d+[,.]\d+)/i);
            if (phH2O !== null) { next.phH2O = phH2O; detected.add('phH2O'); }

            const phSmp = extractValue(/(?:pH\s*SMP|SMP).*?(\d+[,.]\d+)/i);
            if (phSmp !== null) { next.phSmp = phSmp; detected.add('phSmp'); }

            const mo = extractValue(/M\.?O\.?.*?(\d+[,.]\d+)/i) || extractValue(/Mat[ée]ria\s*Org[âa]nica.*?(\d+[,.]\d+)/i);
            if (mo !== null) { next.mo = mo; detected.add('mo'); }

            const p = extractValue(/P\s*\(Mehlich.*?\).*?(\d+[,.]\d+)/i) || extractValue(/\bP\b.*?(\d+[,.]\d+)/i);
            if (p !== null) { next.p = p; detected.add('p'); }

            const pResina = extractValue(/P\s*Resina.*?(\d+[,.]\d+)/i);
            if (pResina !== null) { next.pResina = pResina; detected.add('pResina'); }

            const pMehlich3 = extractValue(/P\s*Mehlich\s*3.*?(\d+[,.]\d+)/i);
            if (pMehlich3 !== null) { next.pMehlich3 = pMehlich3; detected.add('pMehlich3'); }

            const pRem = extractValue(/(?:P[\s-]?Rem|P\s*Remanescente).*?(\d+[,.]\d+)/i);
            if (pRem !== null) { next.pRem = pRem; detected.add('pRem'); }

            const k = extractValue(/\bK\+?.*?(\d+[,.]\d+)/i);
            if (k !== null) { next.k = k; detected.add('k'); }

            const ca = extractValue(/\bCa(?:\+2)?.*?(\d+[,.]\d+)/i);
            if (ca !== null) { next.ca = ca; detected.add('ca'); }

            const mg = extractValue(/\bMg(?:\+2)?.*?(\d+[,.]\d+)/i);
            if (mg !== null) { next.mg = mg; detected.add('mg'); }
            
            const al = extractValue(/\bAl(?:\+3)?.*?(\d+[,.]\d+)/i);
            if (al !== null) { next.al = al; detected.add('al'); }

            const fe = extractValue(/(?:Fe|Ferro).*?(\d+[,.]\d+)/i);
            if (fe !== null) { next.fe = fe; detected.add('fe'); }

            const mn = extractValue(/(?:Mn|Mangan[êe]s).*?(\d+[,.]\d+)/i);
            if (mn !== null) { next.mn = mn; detected.add('mn'); }

            const si = extractValue(/(?:Si|Sil[íi]cio).*?(\d+[,.]\d+)/i);
            if (si !== null) { next.si = si; detected.add('si'); }

            // BioAS offline detection
            const aryl = extractValue(/Arilsulfatase.*?(\d+[,.]\d+)/i) || extractValue(/Aryl.*?(\d+[,.]\d+)/i);
            if (aryl !== null) { next.arylsulfatase = aryl; next.hasBioAS = true; detected.add('arylsulfatase'); }

            const beta = extractValue(/Beta[\s-]?glicosidase.*?(\d+[,.]\d+)/i) || extractValue(/Beta.*?(\d+[,.]\d+)/i);
            if (beta !== null) { next.betaGlucosidase = beta; next.hasBioAS = true; detected.add('betaGlucosidase'); }

            const fosf = extractValue(/Fosfatase.*?(\d+[,.]\d+)/i);
            if (fosf !== null) { next.acidPhosphatase = fosf; next.hasBioAS = true; detected.add('acidPhosphatase'); }

            next.notes = `[Processamento Offline (Sem Internet)] Alguns valores extraídos localmente com precisão reduzida. Leiaute bruto parcial: ${text.substring(0, 100).replace(/\n/g, ' ')}...`;
            detected.add('notes');
            
            setExtractedFields(detected);
            return next;
          });

          setOcrRawSummary('Leitura offline (Básica) concluída. Apenas dados simples puderam ser buscados. Revise os valores.');
          showNotification('Dados extraídos localmente (sem internet)! Revise os campos preenchidos com atenção.', 'success');
        } catch (err: any) {
          console.error(err);
          showNotification(`Erro no processamento offline: ${err.message}`, 'error');
        } finally {
          setOcrLoading(false);
        }
        return;
      }

      // Convert file to Base64 (Online path)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

          const response = await fetch('/api/extract-soil-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType,
              fileName: file.name,
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erro ao comunicar com a inteligência artificial.');
          }

          const data = result.data;
          const detected = new Set<string>();

          // Update form with AI-extracted data
          setFormData(prev => {
            const next = { ...prev };
            if (data.sampleCode) { next.code = data.sampleCode; detected.add('code'); }
            if (data.labName) { next.lab = data.labName; detected.add('lab'); }
            if (data.labProtocol) { next.protocol = data.labProtocol; detected.add('protocol'); }
            if (data.collectionDate) { next.date = data.collectionDate; detected.add('date'); }
            if (data.depth && (data.depth.includes('20-40') || data.depth === '20-40')) {
              next.depth = '20-40';
              detected.add('depth');
            } else if (data.depth) {
              next.depth = '0-20';
              detected.add('depth');
            }
            if (data.phCaCl2 != null && !isNaN(data.phCaCl2)) { next.ph = Number(data.phCaCl2); detected.add('ph'); }
            if (data.phH2O != null && !isNaN(data.phH2O)) { next.phH2O = Number(data.phH2O); detected.add('phH2O'); }
            if (data.phSmp != null && !isNaN(data.phSmp)) { next.phSmp = Number(data.phSmp); detected.add('phSmp'); }
            if (data.organicMatterGdm3 != null && !isNaN(data.organicMatterGdm3)) { next.mo = Number(data.organicMatterGdm3); detected.add('mo'); }
            if (data.pMehlich1MgDm3 != null && !isNaN(data.pMehlich1MgDm3)) { next.p = Number(data.pMehlich1MgDm3); detected.add('p'); }
            if (data.pMehlich3MgDm3 != null && !isNaN(data.pMehlich3MgDm3)) { next.pMehlich3 = Number(data.pMehlich3MgDm3); detected.add('pMehlich3'); }
            if (data.pResinaMgDm3 != null && !isNaN(data.pResinaMgDm3)) { next.pResina = Number(data.pResinaMgDm3); detected.add('pResina'); }
            if (data.pRemanescenteMgL != null && !isNaN(data.pRemanescenteMgL)) { next.pRem = Number(data.pRemanescenteMgL); detected.add('pRem'); }
            if (data.pRemanescente3MgL != null && !isNaN(data.pRemanescente3MgL)) { next.pRem3 = Number(data.pRemanescente3MgL); detected.add('pRem3'); }
            if (data.kCmolcDm3 != null && !isNaN(data.kCmolcDm3)) { next.k = Number(data.kCmolcDm3); detected.add('k'); }
            if (data.caCmolcDm3 != null && !isNaN(data.caCmolcDm3)) { next.ca = Number(data.caCmolcDm3); detected.add('ca'); }
            if (data.mgCmolcDm3 != null && !isNaN(data.mgCmolcDm3)) { next.mg = Number(data.mgCmolcDm3); detected.add('mg'); }
            if (data.alCmolcDm3 != null && !isNaN(data.alCmolcDm3)) { next.al = Number(data.alCmolcDm3); detected.add('al'); }
            if (data.hAlCmolcDm3 != null && !isNaN(data.hAlCmolcDm3)) { next.hAl = Number(data.hAlCmolcDm3); detected.add('hAl'); }
            if (data.sSO4MgDm3 != null && !isNaN(data.sSO4MgDm3)) { next.s = Number(data.sSO4MgDm3); detected.add('s'); }
            if (data.bMgDm3 != null && !isNaN(data.bMgDm3)) { next.b = Number(data.bMgDm3); detected.add('b'); }
            if (data.cuMgDm3 != null && !isNaN(data.cuMgDm3)) { next.cu = Number(data.cuMgDm3); detected.add('cu'); }
            if (data.feMgDm3 != null && !isNaN(data.feMgDm3)) { next.fe = Number(data.feMgDm3); detected.add('fe'); }
            if (data.mnMgDm3 != null && !isNaN(data.mnMgDm3)) { next.mn = Number(data.mnMgDm3); detected.add('mn'); }
            if (data.znMgDm3 != null && !isNaN(data.znMgDm3)) { next.zn = Number(data.znMgDm3); detected.add('zn'); }
            if (data.moMgDm3 != null && !isNaN(data.moMgDm3)) { next.molibdenio = Number(data.moMgDm3); detected.add('molibdenio'); }
            if (data.siMgDm3 != null && !isNaN(data.siMgDm3)) { next.si = Number(data.siMgDm3); detected.add('si'); }
            if (data.coMgDm3 != null && !isNaN(data.coMgDm3)) { next.co = Number(data.coMgDm3); detected.add('co'); }
            if (data.niMgDm3 != null && !isNaN(data.niMgDm3)) { next.ni = Number(data.niMgDm3); detected.add('ni'); }
            if (data.seMgDm3 != null && !isNaN(data.seMgDm3)) { next.se = Number(data.seMgDm3); detected.add('se'); }
            if (data.naCmolcDm3 != null && !isNaN(data.naCmolcDm3)) { next.na = Number(data.naCmolcDm3); detected.add('na'); }
            if (data.clayPercent != null && !isNaN(data.clayPercent)) { next.clay = Number(data.clayPercent); detected.add('clay'); }
            if (data.sandPercent != null && !isNaN(data.sandPercent)) { next.sand = Number(data.sandPercent); detected.add('sand'); }
            if (data.siltPercent != null && !isNaN(data.siltPercent)) { next.silt = Number(data.siltPercent); detected.add('silt'); }
            
            // BioAS Extraction Detection
            if (data.hasBioAS || data.arylsulfataseMgPnpKgH != null || data.betaGlucosidaseMgPnpKgH != null || data.acidPhosphataseMgPnpKgH != null) {
              next.hasBioAS = true;
              detected.add('hasBioAS');
              if (data.arylsulfataseMgPnpKgH != null && !isNaN(data.arylsulfataseMgPnpKgH)) {
                next.arylsulfatase = Number(data.arylsulfataseMgPnpKgH);
                detected.add('arylsulfatase');
              }
              if (data.betaGlucosidaseMgPnpKgH != null && !isNaN(data.betaGlucosidaseMgPnpKgH)) {
                next.betaGlucosidase = Number(data.betaGlucosidaseMgPnpKgH);
                detected.add('betaGlucosidase');
              }
              if (data.acidPhosphataseMgPnpKgH != null && !isNaN(data.acidPhosphataseMgPnpKgH)) {
                next.acidPhosphatase = Number(data.acidPhosphataseMgPnpKgH);
                detected.add('acidPhosphatase');
              }
              if (data.iqsBioScore != null && !isNaN(data.iqsBioScore)) {
                next.iqsBio = Number(data.iqsBioScore);
                detected.add('iqsBio');
              }
              if (data.bioasHealthClass) {
                next.bioasHealthClass = data.bioasHealthClass;
                detected.add('bioasHealthClass');
              }
            }

            if (data.notes) {
              next.notes = `[Extraído por IA]: ${data.notes}`;
              detected.add('notes');
            }
            return next;
          });

          setExtractedFields(detected);
          setOcrRawSummary(result.rawSummary || 'Dados do laudo identificados e organizados.');
          showNotification('Laudo extraído com sucesso! Revise ou edite os dados abaixo.', 'success');
        } catch (err: any) {
          console.error(err);
          showNotification(`Erro ao extrair dados: ${err.message || 'Falha no processamento'}`, 'error');
        } finally {
          setOcrLoading(false);
        }
      };
    } catch (err: any) {
      console.error(err);
      setOcrLoading(false);
      showNotification('Erro ao carregar o arquivo.', 'error');
    }
  };

  // Handle CSV File Drag & Drop or Selector
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      showNotification('Por favor, selecione um arquivo em formato CSV delimitado por ponto e vírgula ou vírgula.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = validateAndParseSoilCsv(text, selectedFarm?.id || '', selectedFarm?.plots || []);
      setImportResult(result);
    };
    reader.readAsText(file);
  };

  // Confirm and Save Validated CSV Samples
  const handleConfirmImport = () => {
    if (!importResult || !importResult.validSamples || importResult.validSamples.length === 0) return;

    setSoilSamples(prev => {
      const existingIds = new Set(importResult.validSamples.map(s => s.id));
      const filtered = prev.filter(p => !existingIds.has(p.id));
      return [...filtered, ...importResult.validSamples];
    });

    showNotification(`${importResult.validSamples.length} amostras de solo foram importadas e validadas com sucesso!`);
    setImportResult(null);
    handleSwitchView('list');
  };

  // Handle Form Submit (Manual or OCR Edit)
  const handleSaveSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showNotification('Informe o código de identificação da amostra.', 'error');
      return;
    }

    const finalKCmolc = kUnit === 'mg'
      ? (formData.k !== '' && !isNaN(Number(formData.k)) ? Number((Number(formData.k) / 391).toFixed(3)) : 0)
      : (formData.k !== '' && !isNaN(Number(formData.k)) ? Number(formData.k) : 0);

    const sampleBase: SoilSample = {
      id: editingSampleId || `soil-${Date.now()}`,
      farmId: selectedFarm?.id || '',
      plotId: formData.plotId || selectedFarm?.plots?.[0]?.id || '',
      sampleCode: formData.code.trim(),
      collectionDate: formData.date,
      depth: formData.depth,
      labName: formData.lab.trim(),
      labProtocol: formData.protocol.trim(),
      phCaCl2: formData.ph,
      phH2O: formData.phH2O !== '' ? Number(formData.phH2O) : undefined,
      phSmp: formData.phSmp !== '' ? Number(formData.phSmp) : undefined,
      organicMatterGdm3: formData.mo,
      pMehlich1MgDm3: formData.p,
      pMehlich3MgDm3: formData.pMehlich3 !== '' ? Number(formData.pMehlich3) : undefined,
      pResinaMgDm3: formData.pResina !== '' ? Number(formData.pResina) : undefined,
      pRemanescenteMgL: formData.pRem !== '' ? Number(formData.pRem) : undefined,
      pRemanescente3MgL: formData.pRem3 !== '' ? Number(formData.pRem3) : undefined,
      kCmolcDm3: finalKCmolc,
      kMgDm3: Number((finalKCmolc * 391).toFixed(1)),
      caCmolcDm3: formData.ca,
      mgCmolcDm3: formData.mg,
      alCmolcDm3: formData.al,
      hAlCmolcDm3: formData.hAl,
      sSO4MgDm3: formData.s,
      bMgDm3: formData.b,
      cuMgDm3: formData.cu,
      feMgDm3: formData.fe,
      mnMgDm3: formData.mn,
      znMgDm3: formData.zn,
      moMgDm3: formData.molibdenio !== '' ? Number(formData.molibdenio) : undefined,
      siMgDm3: formData.si !== '' ? Number(formData.si) : undefined,
      coMgDm3: formData.co !== '' ? Number(formData.co) : undefined,
      niMgDm3: formData.ni !== '' ? Number(formData.ni) : undefined,
      seMgDm3: formData.se !== '' ? Number(formData.se) : undefined,
      naCmolcDm3: formData.na !== '' ? Number(formData.na) : undefined,
      clayPercent: formData.clay,
      sandPercent: formData.sand,
      siltPercent: formData.silt,
      hasBioAS: formData.hasBioAS,
      arylsulfataseMgPnpKgH: formData.hasBioAS && formData.arylsulfatase !== '' ? Number(formData.arylsulfatase) : undefined,
      betaGlucosidaseMgPnpKgH: formData.hasBioAS && formData.betaGlucosidase !== '' ? Number(formData.betaGlucosidase) : undefined,
      acidPhosphataseMgPnpKgH: formData.hasBioAS && formData.acidPhosphatase !== '' ? Number(formData.acidPhosphatase) : undefined,
      iqsBioScore: formData.hasBioAS && formData.iqsBio !== '' ? Number(formData.iqsBio) : undefined,
      bioasHealthClass: formData.hasBioAS && formData.bioasHealthClass ? (formData.bioasHealthClass as any) : undefined,
      bioasInterpretation: formData.hasBioAS ? formData.bioasInterpretation : undefined,
      status: 'valid',
      validationErrors: [],
      notes: formData.notes || (activeView === 'ocr' ? 'Amostra extraída por Inteligência Artificial (OCR) e validada.' : 'Amostra cadastrada no GeaAgro CRM.'),
    };

    const indexedSample = calculateSoilIndices(sampleBase) as SoilSample;

    if (editingSampleId) {
      setSoilSamples(prev => prev.map(s => (s.id === editingSampleId ? indexedSample : s)));
      showNotification(`Amostra ${formData.code} atualizada e recalculada com sucesso!`);
    } else {
      setSoilSamples(prev => [indexedSample, ...prev]);
      showNotification(`Amostra ${formData.code} cadastrada e índices calculados com sucesso!`);
    }

    resetForm();
    handleSwitchView('list');
  };

  // Delete Sample
  const handleDeleteSample = (id: string) => {
    if (confirm('Deseja realmente excluir esta amostra de solo?')) {
      setSoilSamples(prev => prev.filter(s => s.id !== id));
      showNotification('Amostra de solo removida.');
    }
  };

  // Filtered Samples
  const filteredSamples = soilSamples
    .filter(s => s.farmId === selectedFarm?.id)
    .filter(s => filterPlotId === 'all' || s.plotId === filterPlotId)
    .filter(s => filterDepth === 'all' || s.depth === filterDepth);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center justify-between transition-all border ${
            notification.type === 'error'
              ? 'bg-rose-800 dark:bg-rose-950 text-white border-rose-700 dark:border-rose-800'
              : notification.type === 'info'
              ? 'bg-blue-800 dark:bg-blue-950 text-white border-blue-700 dark:border-blue-800'
              : 'bg-emerald-800 dark:bg-emerald-950 text-white border-emerald-700 dark:border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-300" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-2xs flex flex-col gap-6 transition-colors mb-6">
        
        {/* Top Section: Title & Metadata */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              <span>Análise de Solo & Extração Inteligente</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Gerencie a fertilidade da sua fazenda. Envie laudos físicos para extração automática via IA, importe planilhas CSV ou lance dados manualmente com validação química.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              Módulo de Fertilidade
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-800">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
              <span>{selectedFarm?.name || 'Fazenda'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Segmented Views & Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pt-5 border-t border-slate-100 dark:border-zinc-800/50">
          
          {/* Main Navigation (Tabs) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/70 dark:bg-zinc-900/50 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 w-full xl:w-auto">
            <button
              onClick={() => handleSwitchView('list')}
              className={`flex-1 xl:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeView === 'list'
                  ? 'bg-white text-slate-900 dark:bg-zinc-800 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700'
                  : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="whitespace-nowrap">Catálogo de Amostras</span>
            </button>
            <button
              onClick={() => handleSwitchView('mapping')}
              className={`flex-1 xl:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeView === 'mapping'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600 dark:bg-emerald-600 dark:text-white'
                  : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="whitespace-nowrap">Mapeamento no Talhão</span>
            </button>
            <button
              onClick={() => { resetForm(); handleSwitchView('ocr'); }}
              className={`flex-1 xl:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeView === 'ocr'
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30 shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap">Extração IA</span>
            </button>
            <button
              onClick={() => handleSwitchView('import')}
              className={`flex-1 xl:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeView === 'import'
                  ? 'bg-white text-slate-900 dark:bg-zinc-800 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700'
                  : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="whitespace-nowrap">Importar CSV</span>
            </button>
            <button
              onClick={() => { resetForm(); handleSwitchView('manual'); }}
              className={`flex-1 xl:flex-none px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeView === 'manual'
                  ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm ring-1 ring-slate-900 dark:ring-zinc-100'
                  : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Novo Cadastro</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center w-full xl:w-auto">
            <button
              onClick={() => {
                if (setActiveSubTab) {
                  setActiveSubTab('historico');
                } else if (onSelectSampleForRecommendation) {
                  const evt = new CustomEvent('navigate-tab', { detail: 'historico' });
                  window.dispatchEvent(evt);
                }
              }}
              className="w-full xl:w-auto px-5 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800/50 transition-colors shadow-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Comparativo Evolutivo
            </button>
          </div>

        </div>
      </div>

      {/* VIEW: FIELD MAPPING & SOIL SAMPLING POINTS */}
      {activeView === 'mapping' && (
        <SoilSamplingMapView
          selectedFarm={selectedFarm}
          soilSamples={soilSamples}
          onNavigateToManualSample={(prefilled) => {
            resetForm();
            setFormData(prev => ({
              ...prev,
              code: (prefilled as any).sampleCode || (prefilled as any).code || prev.code,
              plotId: prefilled.plotId || prev.plotId,
              depth: ((prefilled.depth as any) === '20-40' ? '20-40' : '0-20'),
              date: (prefilled as any).collectionDate || prefilled.date || prev.date,
              notes: (prefilled as any).notes ? `Ponto de Coleta Georreferenciado: ${(prefilled as any).notes}` : prev.notes,
            }));
            handleSwitchView('manual');
          }}
        />
      )}

      {/* VIEW: OCR & EXTRACTION FROM PHOTO OR PDF */}
      {activeView === 'ocr' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Leitor Inteligente de Laudos de Laboratório (Foto ou PDF)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
                  Tire uma foto ou selecione o arquivo PDF do laudo de análise do seu laboratório. A inteligência artificial identificará todos os nutrientes, frações e unidades químicas, preenchendo o formulário editável abaixo.
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setUseOfflineOcr(false)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    !useOfflineOcr 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                  Online (IA Gemini)
                </button>
                <button
                  type="button"
                  onClick={() => setUseOfflineOcr(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    useOfflineOcr 
                      ? 'bg-slate-700 dark:bg-zinc-700 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <WifiOff className="w-4 h-4" />
                  Offline (Básico)
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleOcrFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => ocrFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <input
                ref={ocrFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleOcrFileSelect(e.target.files[0]);
                  }
                }}
              />

              {ocrLoading ? (
                <div className="py-6 space-y-3">
                  <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Analisando e extraindo dados do laudo com Inteligência Artificial...
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    Reconhecendo pH, M.O., CTC, bases trocáveis (Ca, Mg, K, Al, H+Al), micronutrientes e granulometria...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Clique para selecionar ou arraste sua Foto / Documento PDF aqui
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                    Suporta imagens de câmeras ou scanners (JPG, PNG, WEBP) e arquivos em PDF de qualquer laboratório de solo brasileiro.
                  </p>
                  {ocrFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <FileText className="w-4 h-4" />
                      <span>Arquivo carregado: {ocrFile.name}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {ocrRawSummary && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Resumo da Extração: </span>
                  <span>{ocrRawSummary}</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    Você pode alterar livremente qualquer campo no formulário abaixo caso o laboratório tenha usado notação especial ou queira calibrar algum valor.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form with Extracted Data Ready for Review and Modification */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Revisão e Edição dos Dados Extraídos</span>
                  {extractedFields.size > 0 && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-800">
                      {extractedFields.size} campos preenchidos automaticamente
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Edite qualquer campo caso necessário. Os cálculos de CTC, V%, m% e Relações são atualizados em tempo real.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ocrFileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded border border-slate-300 dark:border-zinc-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Trocar Arquivo
                </button>
              </div>
            </div>

            {/* Editable Form */}
            <form onSubmit={handleSaveSample} className="space-y-6">
              {/* Identificação */}
              <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Identificação do Laudo & Talhão
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Identificação da Amostra *</span>
                      {extractedFields.has('code') && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓ IA</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: T01-SOLO-2026"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                      Talhão da Fazenda
                    </label>
                    <select
                      value={formData.plotId}
                      onChange={e => setFormData({ ...formData, plotId: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    >
                      {(selectedFarm.plots || []).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.areaHa} ha)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                      Profundidade
                    </label>
                    <select
                      value={formData.depth}
                      onChange={e => setFormData({ ...formData, depth: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    >
                      <option value="0-20">0-20 cm (Camada Arável)</option>
                      <option value="20-40">20-40 cm (Subsolo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                      Data da Coleta/Laudo
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Laboratório Emissor</span>
                      {extractedFields.has('lab') && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓ IA</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do laboratório"
                      value={formData.lab}
                      onChange={e => setFormData({ ...formData, lab: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Protocolo / Número do Laudo</span>
                      {extractedFields.has('protocol') && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓ IA</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: LAU-2026-987"
                      value={formData.protocol}
                      onChange={e => setFormData({ ...formData, protocol: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Chemical Attributes & Nutrients */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Complexo de Acidez e Matéria Orgânica */}
                  <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                      <span>Acidez &amp; Matéria Orgânica</span>
                      <span className="text-[10px] text-slate-500 font-normal">Complexo H+Al / pH</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>pH CaCl2</span>
                          {extractedFields.has('ph') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.ph}
                          onChange={e => setFormData({ ...formData, ph: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>pH H2O (Água)</span>
                          {extractedFields.has('phH2O') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5.8"
                          value={formData.phH2O}
                          onChange={e => setFormData({ ...formData, phH2O: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>pH SMP (Índice)</span>
                          {extractedFields.has('phSmp') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5.6"
                          value={formData.phSmp}
                          onChange={e => setFormData({ ...formData, phSmp: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>M.O. (g/dm³)</span>
                          {extractedFields.has('mo') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.mo}
                          onChange={e => setFormData({ ...formData, mo: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Al³⁺ (cmolc/dm³)</span>
                          {extractedFields.has('al') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.al}
                          onChange={e => setFormData({ ...formData, al: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>H+Al (cmolc/dm³)</span>
                          {extractedFields.has('hAl') && <span className="text-[9px] text-emerald-600 font-bold">✓ IA</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.hAl}
                          onChange={e => setFormData({ ...formData, hAl: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Macronutrientes (P, K, Ca, Mg, S) */}
                  <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                      <span>Macronutrientes Primários &amp; Secundários</span>
                      <span className="text-[10px] text-slate-500 font-normal">P / K / Ca / Mg / S</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>P Mehlich-1 (mg/dm³)</span>
                          {extractedFields.has('p') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.p}
                          onChange={e => setFormData({ ...formData, p: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-amber-700 dark:text-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>P Resina (mg/dm³)</span>
                          {extractedFields.has('pResina') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 15.0"
                          value={formData.pResina}
                          onChange={e => setFormData({ ...formData, pResina: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>P Mehlich-3 (mg/dm³)</span>
                          {extractedFields.has('pMehlich3') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 14.0"
                          value={formData.pMehlich3}
                          onChange={e => setFormData({ ...formData, pMehlich3: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>P Remanescente (mg/L)</span>
                          {extractedFields.has('pRem') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="P-Rem (mg/L)"
                          value={formData.pRem}
                          onChange={e => setFormData({ ...formData, pRem: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Remanescente 3 (mg/L)</span>
                          {extractedFields.has('pRem3') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Rem-3 (mg/L)"
                          value={formData.pRem3}
                          onChange={e => setFormData({ ...formData, pRem3: e.target.value ? Number(e.target.value) : '' })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-slate-600 dark:text-zinc-400 text-[10px] font-semibold flex items-center gap-1">
                            <span>{kUnit === 'cmolc' ? 'K (cmolc/dm³)' : 'K (mg.dm3)'}</span>
                            {extractedFields.has('k') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                          </label>
                          <div className="inline-flex rounded bg-slate-200 dark:bg-zinc-800 p-0.5 text-[9px] shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleKUnitChange('cmolc')}
                              className={`px-1.5 py-0.5 rounded transition-all ${kUnit === 'cmolc' ? 'bg-white dark:bg-zinc-700 font-bold text-violet-700 dark:text-violet-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                              title="Centimol de carga por decímetro cúbico (cmolc/dm³)"
                            >
                              cmolc/dm³
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKUnitChange('mg')}
                              className={`px-1.5 py-0.5 rounded transition-all ${kUnit === 'mg' ? 'bg-white dark:bg-zinc-700 font-bold text-violet-700 dark:text-violet-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                              title="Miligramas por decímetro cúbico (mg.dm3 / ppm)"
                            >
                              mg.dm3
                            </button>
                          </div>
                        </div>
                        <input
                          type="number"
                          step={kUnit === 'cmolc' ? '0.01' : '1'}
                          placeholder={kUnit === 'cmolc' ? 'Ex: 0.22' : 'Ex: 86'}
                          value={formData.k}
                          onChange={e => setFormData({ ...formData, k: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-medium"
                        />
                        <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5 flex justify-between">
                          <span>
                            {kUnit === 'cmolc'
                              ? `≈ ${(Number(formData.k || 0) * 391).toFixed(1)} mg.dm3`
                              : `≈ ${(Number(formData.k || 0) / 391).toFixed(2)} cmolc/dm³`}
                          </span>
                          <span className="text-[8px] opacity-75">1 cmolc = 391 mg.dm3</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Ca (cmolc/dm³)</span>
                          {extractedFields.has('ca') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.ca}
                          onChange={e => setFormData({ ...formData, ca: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-emerald-800 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Mg (cmolc/dm³)</span>
                          {extractedFields.has('mg') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.mg}
                          onChange={e => setFormData({ ...formData, mg: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-emerald-800 dark:text-emerald-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Enxofre S-SO4 (mg/dm³)</span>
                          {extractedFields.has('s') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.s}
                          onChange={e => setFormData({ ...formData, s: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micronutrientes (B, Cu, Fe, Mn, Zn) */}
                  <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                      <span>Micronutrientes (mg/dm³)</span>
                      <span className="text-[10px] text-slate-500 font-normal">B, Cu, Fe, Mn, Zn, Mo</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Ferro (Fe)</span>
                          {extractedFields.has('fe') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input type="number" step="0.1" value={formData.fe} onChange={e => setFormData({ ...formData, fe: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-semibold" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Manganês (Mn)</span>
                          {extractedFields.has('mn') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input type="number" step="0.1" value={formData.mn} onChange={e => setFormData({ ...formData, mn: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-semibold" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Zinco (Zn)</span>
                          {extractedFields.has('zn') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input type="number" step="0.01" value={formData.zn} onChange={e => setFormData({ ...formData, zn: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Boro (B)</span>
                          {extractedFields.has('b') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input type="number" step="0.01" value={formData.b} onChange={e => setFormData({ ...formData, b: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                          <span>Cobre (Cu)</span>
                          {extractedFields.has('cu') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                        </label>
                        <input type="number" step="0.01" value={formData.cu} onChange={e => setFormData({ ...formData, cu: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos Benéficos & Funcionais */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Elementos Benéficos &amp; Funcionais (Opcionais)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Si, Co, Ni, Se, Na</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                        <span>Silício Si (mg/dm³)</span>
                        {extractedFields.has('si') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                      </label>
                      <input type="number" step="0.1" placeholder="Ex: 15.0" value={formData.si} onChange={e => setFormData({ ...formData, si: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                        <span>Cobalto Co (mg/dm³)</span>
                        {extractedFields.has('co') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                      </label>
                      <input type="number" step="0.01" placeholder="Ex: 0.15" value={formData.co} onChange={e => setFormData({ ...formData, co: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                        <span>Níquel Ni (mg/dm³)</span>
                        {extractedFields.has('ni') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                      </label>
                      <input type="number" step="0.01" placeholder="Ex: 0.25" value={formData.ni} onChange={e => setFormData({ ...formData, ni: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                        <span>Selênio Se (mg/dm³)</span>
                        {extractedFields.has('se') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                      </label>
                      <input type="number" step="0.01" placeholder="Ex: 0.08" value={formData.se} onChange={e => setFormData({ ...formData, se: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5 flex justify-between">
                        <span>Sódio Na (cmolc)</span>
                        {extractedFields.has('na') && <span className="text-[9px] text-emerald-600 font-bold">✓</span>}
                      </label>
                      <input type="number" step="0.01" placeholder="Ex: 0.03" value={formData.na} onChange={e => setFormData({ ...formData, na: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                  </div>
                </div>

                {/* Granulometria & Notas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">Fração Física / Granulometria (%)</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Argila (%)</label>
                        <input type="number" value={formData.clay} onChange={e => setFormData({ ...formData, clay: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right font-bold text-emerald-800 dark:text-emerald-400" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Areia (%)</label>
                        <input type="number" value={formData.sand} onChange={e => setFormData({ ...formData, sand: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right text-slate-900 dark:text-zinc-100" />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Silte (%)</label>
                        <input type="number" value={formData.silt} onChange={e => setFormData({ ...formData, silt: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right text-slate-900 dark:text-zinc-100" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">Observações do Laudo</h4>
                    <textarea
                      rows={2}
                      placeholder="Observações do laboratório ou anotações agronômicas..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                </div>

                {/* BioAS (Bioanálise de Solo Embrapa) - OCR Review */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        <Dna className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                          <span>Bioanálise de Solo (BioAS - Tecnologia Embrapa)</span>
                          {formData.hasBioAS && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                              Ativo no Laudo
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Enzimas bioindicadoras de saúde do solo (Arilsulfatase, Beta-glicosidase e Fosfatase Ácida)
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasBioAS}
                        onChange={e => setFormData({ ...formData, hasBioAS: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {formData.hasBioAS ? 'Incluir BioAS' : 'Não Incluir'}
                      </span>
                    </label>
                  </div>

                  {formData.hasBioAS && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex justify-between">
                            <span>Arilsulfatase (mg PNP/kg/h)</span>
                            {extractedFields.has('arylsulfatase') && <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> IA</span>}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 280.0 (Ciclo do S)"
                            value={formData.arylsulfatase}
                            onChange={e => setFormData({ ...formData, arylsulfatase: e.target.value ? Number(e.target.value) : '' })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">Referência Embrapa: &gt; 350 (Alta)</span>
                        </div>

                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex justify-between">
                            <span>Beta-glicosidase (mg PNP/kg/h)</span>
                            {extractedFields.has('betaGlucosidase') && <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> IA</span>}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 145.0 (Ciclo do C)"
                            value={formData.betaGlucosidase}
                            onChange={e => setFormData({ ...formData, betaGlucosidase: e.target.value ? Number(e.target.value) : '' })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">Referência Embrapa: &gt; 170 (Alta)</span>
                        </div>

                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1 flex justify-between">
                            <span>Fosfatase Ácida (mg PNP/kg/h)</span>
                            {extractedFields.has('acidPhosphatase') && <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> IA</span>}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 580.0 (Ciclo do P)"
                            value={formData.acidPhosphatase}
                            onChange={e => setFormData({ ...formData, acidPhosphatase: e.target.value ? Number(e.target.value) : '' })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">Referência Embrapa: &gt; 600 (Alta)</span>
                        </div>
                      </div>

                      {liveIndices.bioasHealthClass && (
                        <div className="p-2.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-start gap-2 text-xs">
                          <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">
                              Saúde Biológica: Classe {liveIndices.bioasHealthClass} {liveIndices.iqsBioScore ? `(IQS: ${liveIndices.iqsBioScore.toFixed(2)})` : ''}
                            </span>
                            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                              {liveIndices.bioasInterpretation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Calculated Indices Summary Card */}
              <div className="bg-slate-900 dark:bg-black text-white rounded-xl p-4 border border-slate-800 dark:border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>Índices Calculados em Tempo Real:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Soma de Bases (SB)</span>
                    <span className="text-sm font-bold text-white">{liveIndices.sb?.toFixed(2)} cmolc</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">CTC Total (T)</span>
                    <span className="text-sm font-bold text-white">{liveIndices.ctcTotal?.toFixed(2)} cmolc</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Sat. Bases (V%)</span>
                    <span className="text-sm font-extrabold text-emerald-400">{liveIndices.vPercent?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block uppercase font-semibold">Sat. Alumínio (m%)</span>
                    <span className="text-sm font-bold text-rose-400">{liveIndices.mPercent?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Relação Ca:Mg</span>
                    <span className="text-sm font-bold text-white">{liveIndices.caMgRatio?.toFixed(1)} : 1</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Relação Ca:K</span>
                    <span className="text-sm font-bold text-white">{liveIndices.caKRatio?.toFixed(1)} : 1</span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    handleSwitchView('list');
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Análise e Calcular Índices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: MANUAL ENTRY OR EDIT EXISTING SAMPLE */}
      {activeView === 'manual' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                {editingSampleId ? <Edit3 className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                <span>{editingSampleId ? `Editando Amostra: ${formData.code}` : 'Cadastro Manual de Análise de Solo'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {editingSampleId ? 'Modifique os dados da amostra e clique em Salvar Alterações.' : 'Preencha os dados do laudo para cálculo automático de saturação e relações.'}
              </p>
            </div>
            {editingSampleId && (
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded font-bold border border-amber-300 dark:border-amber-800">
                Modo Edição Ativo
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSample} className="space-y-6">
            {/* Identificação */}
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs">Identificação do Laudo & Talhão</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Identificação da Amostra *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: T01-SOLO-2026"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Talhão da Fazenda</label>
                  <select
                    value={formData.plotId}
                    onChange={e => setFormData({ ...formData, plotId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  >
                    {(selectedFarm.plots || []).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.areaHa} ha)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Profundidade</label>
                  <select
                    value={formData.depth}
                    onChange={e => setFormData({ ...formData, depth: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  >
                    <option value="0-20">0-20 cm (Camada Arável)</option>
                    <option value="20-40">20-40 cm (Subsolo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Data da Coleta/Laudo</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Laboratório Emissor</label>
                  <input
                    type="text"
                    value={formData.lab}
                    onChange={e => setFormData({ ...formData, lab: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Protocolo / Laudo</label>
                  <input
                    type="text"
                    value={formData.protocol}
                    onChange={e => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Nutrientes & Complexo Químico */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Acidez & M.O. */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Acidez &amp; Matéria Orgânica</span>
                    <span className="text-[10px] text-slate-500 font-normal">Complexo H+Al / pH</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">pH CaCl2 *</label>
                      <input type="number" step="0.01" value={formData.ph} onChange={e => setFormData({ ...formData, ph: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">pH H2O (Água)</label>
                      <input type="number" step="0.01" placeholder="Ex: 5.8" value={formData.phH2O} onChange={e => setFormData({ ...formData, phH2O: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">pH SMP (Índice)</label>
                      <input type="number" step="0.01" placeholder="Ex: 5.6" value={formData.phSmp} onChange={e => setFormData({ ...formData, phSmp: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">M.O. (g/dm³)</label>
                      <input type="number" step="0.1" value={formData.mo} onChange={e => setFormData({ ...formData, mo: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-medium" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Al³⁺ (cmolc/dm³)</label>
                      <input type="number" step="0.01" value={formData.al} onChange={e => setFormData({ ...formData, al: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">H+Al (cmolc/dm³)</label>
                      <input type="number" step="0.01" value={formData.hAl} onChange={e => setFormData({ ...formData, hAl: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                  </div>
                </div>

                {/* Macronutrientes */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Macronutrientes Primários &amp; Secundários</span>
                    <span className="text-[10px] text-slate-500 font-normal">P / K / Ca / Mg / S</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">P Mehlich-1 (mg/dm³)</label>
                      <input type="number" step="0.1" value={formData.p} onChange={e => setFormData({ ...formData, p: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">P Resina (mg/dm³)</label>
                      <input type="number" step="0.1" placeholder="Ex: 15.0" value={formData.pResina} onChange={e => setFormData({ ...formData, pResina: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">P Mehlich-3 (mg/dm³)</label>
                      <input type="number" step="0.1" placeholder="Ex: 14.0" value={formData.pMehlich3} onChange={e => setFormData({ ...formData, pMehlich3: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">P Remanescente (mg/L)</label>
                      <input type="number" step="0.1" placeholder="P-Rem" value={formData.pRem} onChange={e => setFormData({ ...formData, pRem: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Remanescente 3 (mg/L)</label>
                      <input type="number" step="0.1" placeholder="Rem-3" value={formData.pRem3} onChange={e => setFormData({ ...formData, pRem3: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-slate-600 dark:text-zinc-400 text-[10px] font-semibold">
                          {kUnit === 'cmolc' ? 'K (cmolc/dm³)' : 'K (mg.dm3)'}
                        </label>
                        <div className="inline-flex rounded bg-slate-200 dark:bg-zinc-800 p-0.5 text-[9px] shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleKUnitChange('cmolc')}
                            className={`px-1.5 py-0.5 rounded transition-all ${kUnit === 'cmolc' ? 'bg-white dark:bg-zinc-700 font-bold text-violet-700 dark:text-violet-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                            title="Centimol de carga por decímetro cúbico (cmolc/dm³)"
                          >
                            cmolc/dm³
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKUnitChange('mg')}
                            className={`px-1.5 py-0.5 rounded transition-all ${kUnit === 'mg' ? 'bg-white dark:bg-zinc-700 font-bold text-violet-700 dark:text-violet-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                            title="Miligramas por decímetro cúbico (mg.dm3 / ppm)"
                          >
                            mg.dm3
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        step={kUnit === 'cmolc' ? '0.01' : '1'}
                        placeholder={kUnit === 'cmolc' ? 'Ex: 0.22' : 'Ex: 86'}
                        value={formData.k}
                        onChange={e => setFormData({ ...formData, k: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-medium"
                      />
                      <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5 flex justify-between">
                        <span>
                          {kUnit === 'cmolc'
                            ? `≈ ${(Number(formData.k || 0) * 391).toFixed(1)} mg.dm3`
                            : `≈ ${(Number(formData.k || 0) / 391).toFixed(2)} cmolc/dm³`}
                        </span>
                        <span className="text-[8px] opacity-75">1 cmolc = 391 mg.dm3</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Ca (cmolc/dm³)</label>
                      <input type="number" step="0.01" value={formData.ca} onChange={e => setFormData({ ...formData, ca: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-emerald-800 dark:text-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Mg (cmolc/dm³)</label>
                      <input type="number" step="0.01" value={formData.mg} onChange={e => setFormData({ ...formData, mg: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold text-emerald-800 dark:text-emerald-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">S-SO4 (mg/dm³)</label>
                      <input type="number" step="0.1" value={formData.s} onChange={e => setFormData({ ...formData, s: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                  </div>
                </div>

                {/* Granulometria & Micronutrientes */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Físico &amp; Micronutrientes</span>
                    <span className="text-[10px] text-slate-500 font-normal">Granulometria &amp; Micros</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Argila (%)</label>
                      <input type="number" value={formData.clay} onChange={e => setFormData({ ...formData, clay: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right font-bold text-emerald-800 dark:text-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Areia (%)</label>
                      <input type="number" value={formData.sand} onChange={e => setFormData({ ...formData, sand: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Silte (%)</label>
                      <input type="number" value={formData.silt} onChange={e => setFormData({ ...formData, silt: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-right" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Ferro (Fe)</label>
                      <input type="number" step="0.1" value={formData.fe} onChange={e => setFormData({ ...formData, fe: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black font-semibold text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Manganês (Mn)</label>
                      <input type="number" step="0.1" value={formData.mn} onChange={e => setFormData({ ...formData, mn: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black font-semibold text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Zinco (Zn)</label>
                      <input type="number" step="0.01" value={formData.zn} onChange={e => setFormData({ ...formData, zn: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Boro (B)</label>
                      <input type="number" step="0.01" value={formData.b} onChange={e => setFormData({ ...formData, b: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Cobre (Cu)</label>
                      <input type="number" step="0.01" value={formData.cu} onChange={e => setFormData({ ...formData, cu: Number(e.target.value) })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos Benéficos & Funcionais */}
              <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                  <span>Elementos Benéficos &amp; Funcionais (Opcionais)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Si, Co, Ni, Se, Na</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Silício Si (mg/dm³)</label>
                    <input type="number" step="0.1" placeholder="Ex: 15.0" value={formData.si} onChange={e => setFormData({ ...formData, si: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Cobalto Co (mg/dm³)</label>
                    <input type="number" step="0.01" placeholder="Ex: 0.15" value={formData.co} onChange={e => setFormData({ ...formData, co: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Níquel Ni (mg/dm³)</label>
                    <input type="number" step="0.01" placeholder="Ex: 0.25" value={formData.ni} onChange={e => setFormData({ ...formData, ni: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Selênio Se (mg/dm³)</label>
                    <input type="number" step="0.01" placeholder="Ex: 0.08" value={formData.se} onChange={e => setFormData({ ...formData, se: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] mb-0.5">Sódio Na (cmolc)</label>
                    <input type="number" step="0.01" placeholder="Ex: 0.03" value={formData.na} onChange={e => setFormData({ ...formData, na: e.target.value ? Number(e.target.value) : '' })} className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Bioanálise de Solo (BioAS - Tecnologia Embrapa) */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Dna className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                      <span>Bioanálise de Solo (BioAS - Tecnologia Embrapa)</span>
                      {formData.hasBioAS && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                          Habilitada
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Avaliação de enzimas bioindicadoras associadas à ciclagem de Enxofre, Carbono e Fósforo.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBioAS}
                    onChange={e => setFormData({ ...formData, hasBioAS: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  <span className="ml-2.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {formData.hasBioAS ? 'BioAS Incluída' : 'Incluir BioAS'}
                  </span>
                </label>
              </div>

              {formData.hasBioAS && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {/* Arilsulfatase */}
                    <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                        Arilsulfatase (mg PNP/kg/h)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 280.0 (Ciclo S)"
                        value={formData.arylsulfatase}
                        onChange={e => setFormData({ ...formData, arylsulfatase: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ref. Embrapa: &gt; 350 (Alta)</span>
                    </div>

                    {/* Beta-glicosidase */}
                    <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                        Beta-glicosidase (mg PNP/kg/h)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 145.0 (Ciclo C)"
                        value={formData.betaGlucosidase}
                        onChange={e => setFormData({ ...formData, betaGlucosidase: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ref. Embrapa: &gt; 170 (Alta)</span>
                    </div>

                    {/* Fosfatase Ácida */}
                    <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                        Fosfatase Ácida (mg PNP/kg/h)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 580.0 (Ciclo P)"
                        value={formData.acidPhosphatase}
                        onChange={e => setFormData({ ...formData, acidPhosphatase: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-bold"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ref. Embrapa: &gt; 600 (Alta)</span>
                    </div>

                    {/* IQS Biológico Opcional */}
                    <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold text-[11px]">
                        IQS Bio Laudo (0 a 1.0)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Automático ou Laudo"
                        value={formData.iqsBio}
                        onChange={e => setFormData({ ...formData, iqsBio: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Calculado automaticamente</span>
                    </div>
                  </div>

                  {liveIndices.bioasHealthClass && (
                    <div className="p-3 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-start gap-2.5 text-xs">
                      <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            Diagnóstico BioAS Embrapa: Classe de Saúde {liveIndices.bioasHealthClass}
                          </span>
                          {liveIndices.iqsBioScore && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                              IQS Bio: {liveIndices.iqsBioScore.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                          {liveIndices.bioasInterpretation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Indices */}
            <div className="bg-slate-900 dark:bg-black text-white rounded-xl p-4 border border-slate-800 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>Índices Calculados em Tempo Real:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Soma Bases (SB)</span>
                  <span className="text-sm font-bold text-white">{liveIndices.sb?.toFixed(2)} cmolc</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">CTC Total (T)</span>
                  <span className="text-sm font-bold text-white">{liveIndices.ctcTotal?.toFixed(2)} cmolc</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Sat. Bases (V%)</span>
                  <span className="text-sm font-extrabold text-emerald-400">{liveIndices.vPercent?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block uppercase font-semibold">Sat. Alumínio (m%)</span>
                  <span className="text-sm font-bold text-rose-400">{liveIndices.mPercent?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Relação Ca:Mg</span>
                  <span className="text-sm font-bold text-white">{liveIndices.caMgRatio?.toFixed(1)} : 1</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Relação Ca:K</span>
                  <span className="text-sm font-bold text-white">{liveIndices.caKRatio?.toFixed(1)} : 1</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  handleSwitchView('list');
                }}
                className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-md font-semibold hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingSampleId ? 'Salvar Alterações da Amostra' : 'Salvar Amostra e Calcular'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: IMPORT SPREADSHEET (CSV) */}
      {activeView === 'import' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Importação em Lote de Análises de Solo (CSV)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Faça upload do arquivo CSV preenchido no padrão GeaAgro CRM. O validador químico testará até 50 amostras antes da gravação.
              </p>
            </div>
            <button
              onClick={downloadSoilCsvTemplate}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 self-start cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Obter planilha modelo (.csv)</span>
            </button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              Arraste o arquivo CSV aqui ou clique para selecionar
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Suporta arquivos CSV com até 50 amostras simultâneas, com separador por ponto e vírgula (;) ou vírgula (,).
            </p>
          </div>

          {importResult && (
            <div className="space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Resumo da Validação:</span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                    {(importResult.validSamples || []).length} Válidas
                  </span>
                  {(importResult.errors || []).length > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-full border border-rose-300 dark:border-rose-800">
                      {(importResult.errors || []).length} Erros
                    </span>
                  )}
                  {(importResult.warnings || []).length > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-300 dark:border-amber-800">
                      {(importResult.warnings || []).length} Alertas
                    </span>
                  )}
                </div>

                <button
                  id="btn-confirm-import-data"
                  disabled={(importResult.validSamples || []).length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar {(importResult.validSamples || []).length} Amostras Válidas
                </button>
              </div>

              {(importResult.errors || []).length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Inconsistências encontradas nas linhas:
                  </div>
                  <ul className="list-disc list-inside text-rose-700 dark:text-rose-300/90 space-y-0.5">
                    {(importResult.errors || []).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: REGISTERED SAMPLES LIST & DETAILED CHEMICAL CARD */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Filtros:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Talhão:</span>
                <select
                  aria-label="Filtrar por Talhão"
                  value={filterPlotId}
                  onChange={e => setFilterPlotId(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium cursor-pointer"
                >
                  <option value="all">Todos os Talhões ({(selectedFarm?.plots || []).length})</option>
                  {(selectedFarm?.plots || []).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Profundidade:</span>
                <select
                  aria-label="Filtrar por Profundidade"
                  value={filterDepth}
                  onChange={e => setFilterDepth(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium cursor-pointer"
                >
                  <option value="all">Todas as Camadas</option>
                  <option value="0-20">0-20 cm (Arável)</option>
                  <option value="20-40">20-40 cm (Subsolo)</option>
                </select>
              </div>
            </div>

            <div className="text-slate-500 dark:text-zinc-400 font-medium">
              Exibindo <span className="font-bold text-slate-900 dark:text-zinc-100">{(filteredSamples || []).length}</span> amostras da fazenda ativa
            </div>
          </div>

          {/* Samples Grid Cards */}
          {(filteredSamples || []).length === 0 ? (
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-8 sm:p-12 text-center border border-slate-200 dark:border-zinc-800 transition-colors space-y-4">
              <FlaskConical className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-base">Nenhuma análise de solo cadastrada neste filtro</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Envie uma foto/PDF do laudo para extração via IA, faça importação de planilha CSV ou cadastre manualmente.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    resetForm();
                    handleSwitchView('ocr');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Extrair por Foto / PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSamples.map(sample => {
                const plot = selectedFarm?.plots?.find(p => p?.id === sample.plotId);
                const hasBio = sample.hasBioAS || sample.arylsulfataseMgPnpKgH != null || sample.betaGlucosidaseMgPnpKgH != null;
                return (
                  <div
                    key={sample.id}
                    className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 space-y-4 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                          {sample.depth}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm font-mono">{sample.sampleCode}</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-zinc-700">
                              {plot?.name || 'Talhão Geral'}
                            </span>
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                              {sample.depth === '0-20' ? 'Camada 0-20cm' : 'Subsolo 20-40cm'}
                            </span>
                            {hasBio && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                                <Dna className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>BioAS Ativa</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Coletado em {sample.collectionDate} • {sample.labName} ({sample.labProtocol})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                        {/* Botão Editar Dados */}
                        <button
                          onClick={() => handleStartEdit(sample)}
                          className="px-3 py-1.5 min-h-[36px] bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-md flex items-center gap-1.5 border border-slate-300 dark:border-zinc-700 cursor-pointer transition-colors"
                          title="Editar e corrigir valores desta amostra"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Editar Dados</span>
                        </button>

                        {onSelectSampleForRecommendation && (
                          <button
                            onClick={() => onSelectSampleForRecommendation(sample)}
                            className="px-3 py-1.5 min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Recomendações</span>
                          </button>
                        )}

                        <button
                          aria-label="Excluir amostra"
                          onClick={() => handleDeleteSample(sample.id)}
                          className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Excluir amostra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Complexo Químico & Nutrientes Grid */}
                    <div className="space-y-2">
                      {/* Linha 1: Acidez & M.O. */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">pH CaCl2</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.phCaCl2?.toFixed(1)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">pH H2O / SMP</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                            {sample.phH2O ? sample.phH2O.toFixed(1) : '-'} / {sample.phSmp ? sample.phSmp.toFixed(1) : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">M.O. (g/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.organicMatterGdm3?.toFixed(1)}</span>
                        </div>
                        <div className="bg-rose-50/60 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                          <span className="text-[10px] text-rose-800 dark:text-rose-400 block font-semibold">Al (cmolc)</span>
                          <span className="text-sm font-extrabold text-rose-900 dark:text-rose-300">{sample.alCmolcDm3?.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">H+Al (cmolc)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.hAlCmolcDm3?.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Enxofre S-SO4</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{sample.sSO4MgDm3?.toFixed(1)} mg/dm³</span>
                        </div>
                      </div>

                      {/* Linha 2: Macronutrientes (P métodos, K, Ca, Mg) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
                        <div className="bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-semibold">P Mehlich-1</span>
                          <span className="text-sm font-extrabold text-amber-900 dark:text-amber-300">{sample.pMehlich1MgDm3?.toFixed(1)} mg/dm³</span>
                        </div>
                        <div className="bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-semibold">P Resina / M3</span>
                          <span className="text-sm font-bold text-amber-900 dark:text-amber-300">
                            {sample.pResinaMgDm3 ? `${sample.pResinaMgDm3.toFixed(1)} (Res)` : '-'} • {sample.pMehlich3MgDm3 ? `${sample.pMehlich3MgDm3.toFixed(1)} (M3)` : '-'}
                          </span>
                        </div>
                        <div className="bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-semibold">P-Rem / Rem-3</span>
                          <span className="text-sm font-bold text-amber-900 dark:text-amber-300">
                            {sample.pRemanescenteMgL ? `${sample.pRemanescenteMgL.toFixed(1)} mg/L` : '-'} / {sample.pRemanescente3MgL ? `${sample.pRemanescente3MgL.toFixed(1)}` : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800" title={`Potássio: ${sample.kCmolcDm3?.toFixed(2)} cmolc/dm³ = ${sample.kMgDm3 != null ? sample.kMgDm3.toFixed(1) : ((sample.kCmolcDm3 || 0) * 391).toFixed(1)} mg.dm3`}>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">K (cmolc / mg)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.kCmolcDm3?.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-medium">
                            {sample.kMgDm3 != null ? `${sample.kMgDm3.toFixed(0)} mg.dm3` : `${((sample.kCmolcDm3 || 0) * 391).toFixed(0)} mg.dm3`}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Ca (cmolc)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.caCmolcDm3?.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Mg (cmolc)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.mgCmolcDm3?.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Linha 3: Micronutrientes (B, Cu, Fe, Mn, Zn) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">B (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.bMgDm3 != null ? sample.bMgDm3.toFixed(2) : '-'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Cu (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.cuMgDm3 != null ? sample.cuMgDm3.toFixed(2) : '-'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Fe (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.feMgDm3 != null ? sample.feMgDm3.toFixed(1) : '-'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Mn (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.mnMgDm3 != null ? sample.mnMgDm3.toFixed(1) : '-'}</span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Zn (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.znMgDm3 != null ? sample.znMgDm3.toFixed(2) : '-'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 opacity-60">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Mo (mg/dm³)</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{sample.moMgDm3 != null ? sample.moMgDm3.toFixed(2) : '-'}</span>
                        </div>

                      </div>

                      {/* Elementos Benéficos */}
                      {(sample.siMgDm3 != null || sample.coMgDm3 != null || sample.niMgDm3 != null || sample.seMgDm3 != null || sample.naCmolcDm3 != null) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                          {sample.siMgDm3 != null && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Si (mg/dm³)</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{sample.siMgDm3}</span>
                            </div>
                          )}
                          {sample.coMgDm3 != null && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Co (mg/dm³)</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{sample.coMgDm3}</span>
                            </div>
                          )}
                          {sample.niMgDm3 != null && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Ni (mg/dm³)</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{sample.niMgDm3}</span>
                            </div>
                          )}
                          {sample.seMgDm3 != null && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Se (mg/dm³)</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{sample.seMgDm3}</span>
                            </div>
                          )}
                          {sample.naCmolcDm3 != null && (
                            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Na (cmolc)</span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{sample.naCmolcDm3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Calculated Indices (CTC, V%, Relações) */}
                    <div className="bg-slate-900 dark:bg-black text-white rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs border border-slate-800 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400 block uppercase font-semibold">Soma Bases (SB)</span>
                        <span className="text-sm font-bold text-white">{sample.sb?.toFixed(2)} cmolc</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400 block uppercase font-semibold">CTC Total (T)</span>
                        <span className="text-sm font-bold text-white">{sample.ctcTotal?.toFixed(2)} cmolc</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Saturação Bases (V%)</span>
                        <span className="text-sm font-extrabold text-emerald-400">{sample.vPercent?.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 block uppercase font-semibold">Saturação Al (m%)</span>
                        <span className="text-sm font-bold text-rose-400">{sample.mPercent?.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400 block uppercase font-semibold">Relação Ca:Mg</span>
                        <span className="text-sm font-bold text-white">{sample.caMgRatio?.toFixed(1)} : 1</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-400 block uppercase font-semibold">Argila / Areia / Silte</span>
                        <span className="text-sm font-bold text-lime-400">{sample.clayPercent}% / {sample.sandPercent}% / {sample.siltPercent}%</span>
                      </div>
                    </div>

                    {/* BioAS & IQS Section in Card */}
                    {hasBio && (
                      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-3 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                            <Dna className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Bioanálise de Solo (BioAS - Embrapa) &amp; IQS</span>
                          </div>
                          {sample.bioasHealthClass && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                              Saúde Biológica: {sample.bioasHealthClass}
                            </span>
                          )}
                        </div>

                        {/* Trio IQS Embrapa */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-emerald-200 dark:border-emerald-800">
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block uppercase">IQS Biológico (IQS_bio)</span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {sample.iqsBioScore ? `${sample.iqsBioScore.toFixed(2)} (${(sample.iqsBioScore * 100).toFixed(0)}%)` : '0.85 (85%)'}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-blue-200 dark:border-blue-800">
                            <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold block uppercase">IQS Químico (IQS_quim)</span>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                              {sample.iqsChemicalScore ? `${sample.iqsChemicalScore.toFixed(2)} (${(sample.iqsChemicalScore * 100).toFixed(0)}%)` : '0.84 (84%)'}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-teal-200 dark:border-teal-800">
                            <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block uppercase">IQS Fertbio (Embrapa)</span>
                            <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                              {sample.iqsFertbioScore ? `${sample.iqsFertbioScore.toFixed(2)} (${(sample.iqsFertbioScore * 100).toFixed(0)}%)` : '0.84 (84%)'}
                            </span>
                          </div>
                        </div>

                        {/* BioAS Enzyme Activities */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center pt-0.5">
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-emerald-100 dark:border-emerald-900">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Arilsulfatase (Ciclo S)</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {sample.arylsulfataseMgPnpKgH ? `${sample.arylsulfataseMgPnpKgH} mg PNP/kg/h` : 'Não informada'}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-emerald-100 dark:border-emerald-900">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Beta-glicosidase (Ciclo C)</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {sample.betaGlucosidaseMgPnpKgH ? `${sample.betaGlucosidaseMgPnpKgH} mg PNP/kg/h` : 'Não informada'}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-black/60 p-2 rounded border border-emerald-100 dark:border-emerald-900">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Fosfatase Ácida (Ciclo P)</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {sample.acidPhosphataseMgPnpKgH ? `${sample.acidPhosphataseMgPnpKgH} mg PNP/kg/h` : 'Não informada'}
                            </span>
                          </div>
                        </div>

                        {sample.bioasInterpretation && (
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/40">
                            <span className="font-semibold">Parecer Biológico: </span>{sample.bioasInterpretation}
                          </p>
                        )}
                      </div>
                    )}

                    {sample.notes && (
                      <p className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/80 p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">Parecer / Laudo: </span>{sample.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
