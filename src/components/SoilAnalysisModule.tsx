import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import {
  FlaskConical,
  Upload,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  Info,
  TrendingUp,
  List,
  Compass,
  Edit3,
  X,
} from 'lucide-react';
import { SoilSample, Farm } from '../types/agronomy';
import {
  validateAndParseSoilCsv,
  ImportValidationResult,
} from '../utils/spreadsheetTemplate';
import { calculateSoilIndices } from '../utils/agronomicCalculations';
import { useSoilCoordinates } from '../hooks/useSoilCoordinates';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { SoilSamplesList } from './soil/SoilSamplesList';
import type { SoilSampleFormState } from './soil/SoilSampleForm';
import type { OcrUploadedFile } from './soil/SoilOcrView';

const SoilSamplingMapView = lazyWithRetry(() =>
  import('./soil/SoilSamplingMapView').then((m) => ({ default: m.SoilSamplingMapView }))
);
const SoilSampleForm = lazyWithRetry(() =>
  import('./soil/SoilSampleForm').then((m) => ({ default: m.SoilSampleForm }))
);
const SoilCsvImportView = lazyWithRetry(() =>
  import('./soil/SoilCsvImportView').then((m) => ({ default: m.SoilCsvImportView }))
);
const SoilOcrView = lazyWithRetry(() =>
  import('./soil/SoilOcrView').then((m) => ({ default: m.SoilOcrView }))
);

async function loadTesseractFromCdn(): Promise<any> {
  const w = window as unknown as { Tesseract?: any };
  if (w.Tesseract) return w.Tesseract;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-tesseract-cdn="true"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      if (w.Tesseract) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Falha ao carregar motor OCR')),
        { once: true }
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    script.dataset.tesseractCdn = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar motor OCR'));
    document.head.appendChild(script);
  });
  return w.Tesseract;
}

type SoilView = 'list' | 'mapping' | 'ocr' | 'manual' | 'import';

interface SoilAnalysisModuleProps {
  soilSamples: SoilSample[];
  setSoilSamples: React.Dispatch<React.SetStateAction<SoilSample[]>>;
  selectedFarm: Farm;
  onSelectSampleForRecommendation?: (sample: SoilSample) => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const createEmptyFormState = (defaultPlotId: string): SoilSampleFormState => ({
  code: '',
  plotId: defaultPlotId,
  depth: '0-20',
  date: new Date().toISOString().split('T')[0],
  lab: '',
  protocol: '',
  ph: '',
  phH2O: '',
  phSmp: '',
  mo: '',
  al: '',
  hAl: '',
  p: '',
  pMehlich3: '',
  pResina: '',
  pRem: '',
  pRem3: '',
  k: '',
  ca: '',
  mg: '',
  s: '',
  b: '',
  cu: '',
  fe: '',
  mn: '',
  zn: '',
  molibdenio: '',
  si: '',
  co: '',
  ni: '',
  se: '',
  na: '',
  clay: '',
  sand: '',
  silt: '',
  hasBioAS: false,
  arylsulfatase: '',
  betaGlucosidase: '',
  acidPhosphatase: '',
  iqsBio: '',
  bioasHealthClass: '',
  bioasInterpretation: '',
  notes: '',
});

const ViewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-6 text-xs text-slate-500 dark:text-zinc-400">
    Carregando visualização...
  </div>
);

export const SoilAnalysisModule: React.FC<SoilAnalysisModuleProps> = ({
  soilSamples,
  setSoilSamples,
  selectedFarm,
  onSelectSampleForRecommendation,
  activeSubTab,
  setActiveSubTab,
}) => {
  const { syncSamplesWithCoordinates } = useSoilCoordinates();
  const [activeView, setActiveView] = useState<SoilView>('list');

  const syncedSoilSamples = useMemo(() => {
    return syncSamplesWithCoordinates(soilSamples || [], selectedFarm?.id || '');
  }, [soilSamples, selectedFarm?.id, syncSamplesWithCoordinates]);

  useEffect(() => {
    if (!activeSubTab) return;
    if (activeSubTab === 'leitura_ia' || activeSubTab === 'ocr') {
      setActiveView('ocr');
    } else if (activeSubTab === 'cadastro_manual' || activeSubTab === 'manual') {
      setActiveView('manual');
    } else if (activeSubTab === 'importar_csv' || activeSubTab === 'import') {
      setActiveView('import');
    } else if (
      activeSubTab === 'mapeamento' ||
      activeSubTab === 'mapping' ||
      activeSubTab === 'georreferenciamento'
    ) {
      setActiveView('mapping');
    } else if (
      activeSubTab === 'amostras' ||
      activeSubTab === 'laudos' ||
      activeSubTab === 'list'
    ) {
      setActiveView('list');
    }
  }, [activeSubTab]);

  const handleSwitchView = (view: SoilView) => {
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
  const [filterPlotId, setFilterPlotId] = useState<string>('all');
  const [filterDepth, setFilterDepth] = useState<string>('all');
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [useOfflineOcr, setUseOfflineOcr] = useState(false);
  const [ocrFile, setOcrFile] = useState<OcrUploadedFile | null>(null);
  const [ocrRawSummary, setOcrRawSummary] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set());

  const notificationTimerRef = useRef<number | null>(null);
  const ocrPreviewUrlRef = useRef<string | null>(null);

  const revokeOcrPreview = () => {
    if (ocrPreviewUrlRef.current) {
      URL.revokeObjectURL(ocrPreviewUrlRef.current);
      ocrPreviewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) window.clearTimeout(notificationTimerRef.current);
      revokeOcrPreview();
    };
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (notificationTimerRef.current) window.clearTimeout(notificationTimerRef.current);
    setNotification({ msg, type });
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000);
  };

  const [formData, setFormData] = useState<SoilSampleFormState>(() =>
    createEmptyFormState(selectedFarm?.plots?.[0]?.id || '')
  );
  const [kUnit, setKUnit] = useState<'cmolc' | 'mg'>('cmolc');

  useEffect(() => {
    const firstPlotId = selectedFarm?.plots?.[0]?.id || '';
    setFilterPlotId('all');
    setFormData((prev) => {
      const plotStillExists = (selectedFarm?.plots || []).some((p) => p.id === prev.plotId);
      return plotStillExists ? prev : { ...prev, plotId: firstPlotId };
    });
  }, [selectedFarm?.id]);

  const handleKUnitChange = (newUnit: 'cmolc' | 'mg') => {
    if (newUnit === kUnit) return;
    const currentVal = formData.k;
    if (currentVal !== '' && !Number.isNaN(Number(currentVal))) {
      const num = Number(currentVal);
      const converted =
        newUnit === 'mg'
          ? Number((num * 391).toFixed(1))
          : Number((num / 391).toFixed(3));
      setFormData((prev) => ({ ...prev, k: converted }));
    }
    setKUnit(newUnit);
  };

  const effectiveKCmolc =
    kUnit === 'mg'
      ? formData.k !== '' && !Number.isNaN(Number(formData.k))
        ? Number(formData.k) / 391
        : 0
      : formData.k !== '' && !Number.isNaN(Number(formData.k))
      ? Number(formData.k)
      : 0;

  const liveIndices = useMemo(
    () =>
      calculateSoilIndices({
        phCaCl2: Number(formData.ph) || 0,
        organicMatterGdm3: Number(formData.mo) || 0,
        pMehlich1MgDm3: Number(formData.p) || 0,
        pResinaMgDm3: formData.pResina !== '' ? Number(formData.pResina) : undefined,
        caCmolcDm3: Number(formData.ca) || 0,
        mgCmolcDm3: Number(formData.mg) || 0,
        kCmolcDm3: effectiveKCmolc,
        kMgDm3:
          kUnit === 'mg'
            ? formData.k !== ''
              ? Number(formData.k)
              : 0
            : Number((effectiveKCmolc * 391).toFixed(1)),
        alCmolcDm3: Number(formData.al) || 0,
        hAlCmolcDm3: Number(formData.hAl) || 0,
        clayPercent: Number(formData.clay) || 0,
        hasBioAS: formData.hasBioAS,
        arylsulfataseMgPnpKgH:
          formData.hasBioAS && formData.arylsulfatase !== ''
            ? Number(formData.arylsulfatase)
            : undefined,
        betaGlucosidaseMgPnpKgH:
          formData.hasBioAS && formData.betaGlucosidase !== ''
            ? Number(formData.betaGlucosidase)
            : undefined,
        acidPhosphataseMgPnpKgH:
          formData.hasBioAS && formData.acidPhosphatase !== ''
            ? Number(formData.acidPhosphatase)
            : undefined,
        iqsBioScore:
          formData.hasBioAS && formData.iqsBio !== '' ? Number(formData.iqsBio) : undefined,
        bioasHealthClass:
          formData.hasBioAS && formData.bioasHealthClass
            ? (formData.bioasHealthClass as SoilSample['bioasHealthClass'])
            : undefined,
      }),
    [formData, kUnit, effectiveKCmolc]
  );

  const resetForm = () => {
    setKUnit('cmolc');
    setFormData(createEmptyFormState(selectedFarm?.plots?.[0]?.id || ''));
    setEditingSampleId(null);
    revokeOcrPreview();
    setOcrFile(null);
    setOcrRawSummary(null);
    setExtractedFields(new Set());
  };

  const handleStartEdit = (sample: SoilSample) => {
    setEditingSampleId(sample.id);
    setKUnit('cmolc');
    setFormData({
      code: sample.sampleCode,
      plotId: sample.plotId,
      depth: sample.depth === '20-40' || sample.depth === '0-40' ? sample.depth : '0-20',
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
      molibdenio: sample.moMgDm3 ?? '',
      si: sample.siMgDm3 ?? '',
      co: sample.coMgDm3 ?? '',
      ni: sample.niMgDm3 ?? '',
      se: sample.seMgDm3 ?? '',
      na: sample.naCmolcDm3 ?? '',
      clay: sample.clayPercent,
      sand: sample.sandPercent,
      silt: sample.siltPercent,
      hasBioAS: Boolean(
        sample.hasBioAS ||
          sample.arylsulfataseMgPnpKgH ||
          sample.betaGlucosidaseMgPnpKgH ||
          sample.acidPhosphataseMgPnpKgH
      ),
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

  const handleOcrFileSelect = async (file: File) => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'application/pdf',
    ];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      showNotification(
        'Formato inválido. Envie uma imagem (PNG, JPG, WEBP) ou documento PDF.',
        'error'
      );
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showNotification('O arquivo excede o limite de 20 MB.', 'error');
      return;
    }

    revokeOcrPreview();
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    if (previewUrl) ocrPreviewUrlRef.current = previewUrl;
    setOcrFile({ name: file.name, type: file.type, previewUrl });
    setOcrLoading(true);
    setOcrRawSummary(null);

    try {
      if (useOfflineOcr) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          showNotification(
            'O modo offline não suporta PDF. Envie uma imagem (JPG/PNG) ou utilize o modo Online (IA).',
            'error'
          );
          setOcrLoading(false);
          return;
        }

        try {
          const Tesseract = await loadTesseractFromCdn();
          const result = await Tesseract.recognize(file, 'por');
          const text: string = result.data.text || '';

          const detected = new Set<string>();
          setFormData((prev) => {
            const next = { ...prev };
            const extractValue = (pattern: RegExp) => {
              const match = text.match(pattern);
              if (match && match[1]) {
                const val = Number(match[1].replace(',', '.'));
                return Number.isNaN(val) ? null : val;
              }
              return null;
            };

            const ph = extractValue(/pH\s*(?:CaCl2)?.*?(\d+[,.]\d+)/i);
            if (ph !== null) { next.ph = ph; detected.add('ph'); }
            const phH2O = extractValue(/pH\s*(?:H2O|água|agua).*?(\d+[,.]\d+)/i);
            if (phH2O !== null) { next.phH2O = phH2O; detected.add('phH2O'); }
            const phSmp = extractValue(/(?:pH\s*SMP|SMP).*?(\d+[,.]\d+)/i);
            if (phSmp !== null) { next.phSmp = phSmp; detected.add('phSmp'); }
            const mo =
              extractValue(/M\.?O\.?.*?(\d+[,.]\d+)/i) ||
              extractValue(/Mat[ée]ria\s*Org[âa]nica.*?(\d+[,.]\d+)/i);
            if (mo !== null) { next.mo = mo; detected.add('mo'); }
            const p =
              extractValue(/P\s*\(Mehlich.*?\).*?(\d+[,.]\d+)/i) ||
              extractValue(/\bP\b.*?(\d+[,.]\d+)/i);
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

            const aryl =
              extractValue(/Arilsulfatase.*?(\d+[,.]\d+)/i) ||
              extractValue(/Aryl.*?(\d+[,.]\d+)/i);
            if (aryl !== null) {
              next.arylsulfatase = aryl;
              next.hasBioAS = true;
              detected.add('arylsulfatase');
            }
            const beta =
              extractValue(/Beta[\s-]?glicosidase.*?(\d+[,.]\d+)/i) ||
              extractValue(/Beta.*?(\d+[,.]\d+)/i);
            if (beta !== null) {
              next.betaGlucosidase = beta;
              next.hasBioAS = true;
              detected.add('betaGlucosidase');
            }
            const fosf = extractValue(/Fosfatase.*?(\d+[,.]\d+)/i);
            if (fosf !== null) {
              next.acidPhosphatase = fosf;
              next.hasBioAS = true;
              detected.add('acidPhosphatase');
            }

            next.notes = `[Processamento Offline] Valores extraídos localmente. Trecho: ${text
              .substring(0, 100)
              .replace(/\n/g, ' ')}...`;
            detected.add('notes');
            return next;
          });

          setExtractedFields(detected);
          setOcrRawSummary(
            'Leitura offline concluída. Revise todos os campos preenchidos antes de salvar.'
          );
          showNotification('Dados extraídos localmente. Revise os campos abaixo.', 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Falha desconhecida';
          showNotification(`Erro no processamento offline: ${message}`, 'error');
        } finally {
          setOcrLoading(false);
        }
        return;
      }

      // Online AI extraction
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = String(reader.result || '').split(',')[1];
          const mimeType =
            file.type ||
            (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

          const response = await fetch('/api/extract-soil-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileData: base64Data, mimeType, fileName: file.name }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Falha ao processar o laudo.');
          }

          const data = result.data || {};
          const detected = new Set<string>();

          setFormData((prev) => {
            const next = { ...prev };
            const assignNum = <K extends keyof SoilSampleFormState>(
              key: K,
              raw: unknown
            ) => {
              if (raw != null && !Number.isNaN(Number(raw))) {
                next[key] = Number(raw) as SoilSampleFormState[K];
                detected.add(String(key));
              }
            };

            if (data.sampleCode) { next.code = data.sampleCode; detected.add('code'); }
            if (data.labName) { next.lab = data.labName; detected.add('lab'); }
            if (data.labProtocol) { next.protocol = data.labProtocol; detected.add('protocol'); }
            if (data.collectionDate) { next.date = data.collectionDate; detected.add('date'); }
            if (data.depth && String(data.depth).includes('20-40')) {
              next.depth = '20-40';
              detected.add('depth');
            } else if (data.depth) {
              next.depth = '0-20';
              detected.add('depth');
            }

            assignNum('ph', data.phCaCl2);
            assignNum('phH2O', data.phH2O);
            assignNum('phSmp', data.phSmp);
            assignNum('mo', data.organicMatterGdm3);
            assignNum('p', data.pMehlich1MgDm3);
            assignNum('pMehlich3', data.pMehlich3MgDm3);
            assignNum('pResina', data.pResinaMgDm3);
            assignNum('pRem', data.pRemanescenteMgL);
            assignNum('pRem3', data.pRemanescente3MgL);
            assignNum('k', data.kCmolcDm3);
            assignNum('ca', data.caCmolcDm3);
            assignNum('mg', data.mgCmolcDm3);
            assignNum('al', data.alCmolcDm3);
            assignNum('hAl', data.hAlCmolcDm3);
            assignNum('s', data.sSO4MgDm3);
            assignNum('b', data.bMgDm3);
            assignNum('cu', data.cuMgDm3);
            assignNum('fe', data.feMgDm3);
            assignNum('mn', data.mnMgDm3);
            assignNum('zn', data.znMgDm3);
            assignNum('molibdenio', data.moMgDm3);
            assignNum('si', data.siMgDm3);
            assignNum('co', data.coMgDm3);
            assignNum('ni', data.niMgDm3);
            assignNum('se', data.seMgDm3);
            assignNum('na', data.naCmolcDm3);
            assignNum('clay', data.clayPercent);
            assignNum('sand', data.sandPercent);
            assignNum('silt', data.siltPercent);

            if (
              data.hasBioAS ||
              data.arylsulfataseMgPnpKgH != null ||
              data.betaGlucosidaseMgPnpKgH != null ||
              data.acidPhosphataseMgPnpKgH != null
            ) {
              next.hasBioAS = true;
              detected.add('hasBioAS');
              assignNum('arylsulfatase', data.arylsulfataseMgPnpKgH);
              assignNum('betaGlucosidase', data.betaGlucosidaseMgPnpKgH);
              assignNum('acidPhosphatase', data.acidPhosphataseMgPnpKgH);
              assignNum('iqsBio', data.iqsBioScore);
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
          showNotification('Laudo extraído com sucesso. Revise os campos abaixo.', 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Falha no processamento';
          showNotification(`Erro ao extrair dados: ${message}`, 'error');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.onerror = () => {
        setOcrLoading(false);
        showNotification('Não foi possível ler o arquivo selecionado.', 'error');
      };
    } catch {
      setOcrLoading(false);
      showNotification('Erro ao carregar o arquivo.', 'error');
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      showNotification(
        'Selecione um arquivo CSV delimitado por ponto e vírgula (;) ou vírgula (,).',
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const result = validateAndParseSoilCsv(
        text,
        selectedFarm?.id || '',
        selectedFarm?.plots?.[0]?.id
      );
      setImportResult(result);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validToImport = (importResult?.samples || []).filter((s) => s.status !== 'invalid');
    if (validToImport.length === 0) return;
    const sanitized = validToImport.map((s, idx) => ({
      ...s,
      id: s.id && !s.id.startsWith('soil-') ? s.id : `amostra-${Date.now()}-${idx}`,
    }));

    setSoilSamples((prev) => {
      const existingIds = new Set(sanitized.map((s) => s.id));
      const filtered = prev.filter((p) => !existingIds.has(p.id));
      return [...sanitized, ...filtered];
    });

    showNotification(`${sanitized.length} amostras importadas e validadas com sucesso.`);
    setImportResult(null);
    handleSwitchView('list');
  };

  const handleSaveSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showNotification('Informe o código de identificação da amostra.', 'error');
      return;
    }

    const finalKCmolc =
      kUnit === 'mg'
        ? formData.k !== '' && !Number.isNaN(Number(formData.k))
          ? Number((Number(formData.k) / 391).toFixed(3))
          : 0
        : formData.k !== '' && !Number.isNaN(Number(formData.k))
        ? Number(formData.k)
        : 0;

    // Prefix 'amostra-' guarantees persistence across reload (App.tsx filters out legacy mock 'soil-' IDs)
    const sampleId =
      editingSampleId && !editingSampleId.startsWith('soil-')
        ? editingSampleId
        : `amostra-${Date.now()}`;

    const sampleBase: SoilSample = {
      id: sampleId,
      farmId: selectedFarm?.id || '',
      plotId: formData.plotId || selectedFarm?.plots?.[0]?.id || '',
      sampleCode: formData.code.trim(),
      collectionDate: formData.date,
      depth: formData.depth,
      labName: formData.lab.trim(),
      labProtocol: formData.protocol.trim(),
      phCaCl2: Number(formData.ph) || 0,
      phH2O: formData.phH2O !== '' ? Number(formData.phH2O) : undefined,
      phSmp: formData.phSmp !== '' ? Number(formData.phSmp) : undefined,
      organicMatterGdm3: Number(formData.mo) || 0,
      pMehlich1MgDm3: Number(formData.p) || 0,
      pMehlich3MgDm3: formData.pMehlich3 !== '' ? Number(formData.pMehlich3) : undefined,
      pResinaMgDm3: formData.pResina !== '' ? Number(formData.pResina) : undefined,
      pRemanescenteMgL: formData.pRem !== '' ? Number(formData.pRem) : undefined,
      pRemanescente3MgL: formData.pRem3 !== '' ? Number(formData.pRem3) : undefined,
      kCmolcDm3: finalKCmolc,
      kMgDm3: Number((finalKCmolc * 391).toFixed(1)),
      caCmolcDm3: Number(formData.ca) || 0,
      mgCmolcDm3: Number(formData.mg) || 0,
      alCmolcDm3: Number(formData.al) || 0,
      hAlCmolcDm3: Number(formData.hAl) || 0,
      sSO4MgDm3: Number(formData.s) || 0,
      bMgDm3: Number(formData.b) || 0,
      cuMgDm3: Number(formData.cu) || 0,
      feMgDm3: Number(formData.fe) || 0,
      mnMgDm3: Number(formData.mn) || 0,
      znMgDm3: Number(formData.zn) || 0,
      moMgDm3: formData.molibdenio !== '' ? Number(formData.molibdenio) : undefined,
      siMgDm3: formData.si !== '' ? Number(formData.si) : undefined,
      coMgDm3: formData.co !== '' ? Number(formData.co) : undefined,
      niMgDm3: formData.ni !== '' ? Number(formData.ni) : undefined,
      seMgDm3: formData.se !== '' ? Number(formData.se) : undefined,
      naCmolcDm3: formData.na !== '' ? Number(formData.na) : undefined,
      clayPercent: Number(formData.clay) || 0,
      sandPercent: Number(formData.sand) || 0,
      siltPercent: Number(formData.silt) || 0,
      hasBioAS: formData.hasBioAS,
      arylsulfataseMgPnpKgH:
        formData.hasBioAS && formData.arylsulfatase !== ''
          ? Number(formData.arylsulfatase)
          : undefined,
      betaGlucosidaseMgPnpKgH:
        formData.hasBioAS && formData.betaGlucosidase !== ''
          ? Number(formData.betaGlucosidase)
          : undefined,
      acidPhosphataseMgPnpKgH:
        formData.hasBioAS && formData.acidPhosphatase !== ''
          ? Number(formData.acidPhosphatase)
          : undefined,
      iqsBioScore:
        formData.hasBioAS && formData.iqsBio !== '' ? Number(formData.iqsBio) : undefined,
      bioasHealthClass:
        formData.hasBioAS && formData.bioasHealthClass
          ? (formData.bioasHealthClass as SoilSample['bioasHealthClass'])
          : undefined,
      bioasInterpretation: formData.hasBioAS ? formData.bioasInterpretation : undefined,
      status: 'valid',
      validationErrors: [],
      notes:
        formData.notes ||
        (activeView === 'ocr'
          ? 'Amostra extraída por leitura inteligente e validada.'
          : 'Amostra cadastrada no módulo de análise de solo.'),
    };

    const indexedSample = calculateSoilIndices(sampleBase) as SoilSample;

    if (editingSampleId) {
      setSoilSamples((prev) =>
        prev.map((s) => (s.id === editingSampleId ? indexedSample : s))
      );
      showNotification(`Amostra ${formData.code} atualizada e recalculada.`);
    } else {
      setSoilSamples((prev) => [indexedSample, ...prev]);
      showNotification(`Amostra ${formData.code} cadastrada e índices calculados.`);
    }

    resetForm();
    handleSwitchView('list');
  };

  const handleDeleteSample = (id: string) => {
    setSoilSamples((prev) => prev.filter((s) => s.id !== id));
    showNotification('Amostra de solo removida.');
  };

  const farmSamples = useMemo(
    () => syncedSoilSamples.filter((s) => s.farmId === selectedFarm?.id),
    [syncedSoilSamples, selectedFarm?.id]
  );

  const filteredSamples = useMemo(
    () =>
      farmSamples
        .filter((s) => filterPlotId === 'all' || s.plotId === filterPlotId)
        .filter((s) => filterDepth === 'all' || s.depth === filterDepth),
    [farmSamples, filterPlotId, filterDepth]
  );

  const summaryStats = useMemo(() => {
    const count = farmSamples.length;
    if (count === 0) {
      return { count: 0, avgPh: null, avgV: null, avgP: null, bioCount: 0 };
    }
    const avgPh = farmSamples.reduce((acc, s) => acc + (s.phCaCl2 || 0), 0) / count;
    const avgV = farmSamples.reduce((acc, s) => acc + (s.vPercent || 0), 0) / count;
    const avgP = farmSamples.reduce((acc, s) => acc + (s.pMehlich1MgDm3 || 0), 0) / count;
    const bioCount = farmSamples.filter(
      (s) =>
        s.hasBioAS ||
        s.arylsulfataseMgPnpKgH != null ||
        s.betaGlucosidaseMgPnpKgH != null
    ).length;
    return { count, avgPh, avgV, avgP, bioCount };
  }, [farmSamples]);

  const TABS: Array<{
    id: SoilView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }> = [
    {
      id: 'list',
      label: 'Amostras e Laudos',
      icon: List,
      onClick: () => handleSwitchView('list'),
    },
    {
      id: 'mapping',
      label: 'Mapeamento no Talhão',
      icon: Compass,
      onClick: () => handleSwitchView('mapping'),
    },
    {
      id: 'ocr',
      label: 'Leitura IA / OCR',
      icon: Sparkles,
      onClick: () => {
        resetForm();
        handleSwitchView('ocr');
      },
    },
    {
      id: 'manual',
      label: editingSampleId && activeView === 'manual' ? 'Editando Amostra' : 'Cadastro Manual',
      icon: Plus,
      onClick: () => {
        resetForm();
        handleSwitchView('manual');
      },
    },
    {
      id: 'import',
      label: 'Importar CSV',
      icon: Upload,
      onClick: () => handleSwitchView('import'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Notificação */}
      {notification && (
        <div
          className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 ${
            notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
              : notification.type === 'info'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {notification.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Fechar aviso"
            className="p-0.5 opacity-70 hover:opacity-100 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cabeçalho Compacto Hairline */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                Análise de Solo
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {selectedFarm?.name || 'Fazenda ativa'} · {(selectedFarm?.plots || []).length}{' '}
              {(selectedFarm?.plots || []).length === 1 ? 'talhão' : 'talhões'} · Fertilidade, BioAS e amostragem georreferenciada
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (setActiveSubTab) {
                  setActiveSubTab('historico');
                }
                window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'historico' }));
              }}
              className="h-8 px-3 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Comparativo Evolutivo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                handleSwitchView('manual');
              }}
              className="h-8 px-3 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Amostra</span>
            </button>
          </div>
        </div>

        {/* Faixa de KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 tabular-nums">
          <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Amostras</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {summaryStats.count}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH CaCl2 Médio</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {summaryStats.avgPh != null ? summaryStats.avgPh.toFixed(2) : '—'}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">V% Médio</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {summaryStats.avgV != null ? `${summaryStats.avgV.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">P Mehlich-1 Médio</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {summaryStats.avgP != null ? `${summaryStats.avgP.toFixed(1)} mg/dm³` : '—'}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Laudos BioAS</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {summaryStats.bioCount}
            </span>
          </div>
        </div>

        {/* Navegação de Subabas em Linha Única */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-100 dark:border-zinc-800">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtelas */}
      {activeView === 'list' && (
        <SoilSamplesList
          samples={filteredSamples}
          selectedFarm={selectedFarm}
          filterPlotId={filterPlotId}
          setFilterPlotId={setFilterPlotId}
          filterDepth={filterDepth}
          setFilterDepth={setFilterDepth}
          onEdit={handleStartEdit}
          onDelete={handleDeleteSample}
          onSelectForRecommendation={onSelectSampleForRecommendation}
          onNavigateView={(view) => {
            resetForm();
            handleSwitchView(view);
          }}
        />
      )}

      {activeView === 'mapping' && (
        <Suspense fallback={<ViewFallback />}>
          <SoilSamplingMapView
            selectedFarm={selectedFarm}
            soilSamples={syncedSoilSamples}
            onNavigateToManualSample={(prefilled) => {
              resetForm();
              setFormData((prev) => ({
                ...prev,
                code: prefilled.sampleCode || prev.code,
                plotId: prefilled.plotId || prev.plotId,
                depth:
                  prefilled.depth === '20-40' || prefilled.depth === '0-40'
                    ? prefilled.depth
                    : '0-20',
                date: prefilled.collectionDate || prev.date,
                notes: prefilled.notes
                  ? `Ponto de Coleta Georreferenciado: ${prefilled.notes}`
                  : prev.notes,
              }));
              handleSwitchView('manual');
            }}
          />
        </Suspense>
      )}

      {activeView === 'ocr' && (
        <Suspense fallback={<ViewFallback />}>
          <SoilOcrView
            useOfflineOcr={useOfflineOcr}
            setUseOfflineOcr={setUseOfflineOcr}
            ocrLoading={ocrLoading}
            ocrFile={ocrFile}
            ocrRawSummary={ocrRawSummary}
            extractedFields={extractedFields}
            onSelectFile={handleOcrFileSelect}
            formData={formData}
            setFormData={setFormData}
            kUnit={kUnit}
            onKUnitChange={handleKUnitChange}
            liveIndices={liveIndices}
            selectedFarm={selectedFarm}
            onSubmit={handleSaveSample}
            onCancel={() => {
              resetForm();
              handleSwitchView('list');
            }}
          />
        </Suspense>
      )}

      {activeView === 'manual' && (
        <Suspense fallback={<ViewFallback />}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
              <div className="flex items-center gap-2 text-xs">
                {editingSampleId ? (
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {editingSampleId
                    ? `Editando Amostra ${formData.code}`
                    : 'Cadastro Manual de Análise de Solo'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Os índices de CTC, V%, m% e relações são calculados em tempo real.
              </span>
            </div>

            <SoilSampleForm
              formData={formData}
              setFormData={setFormData}
              kUnit={kUnit}
              onKUnitChange={handleKUnitChange}
              liveIndices={liveIndices}
              selectedFarm={selectedFarm}
              editingSampleId={editingSampleId}
              submitLabel={
                editingSampleId ? 'Salvar Alterações da Amostra' : 'Salvar Amostra e Calcular'
              }
              onSubmit={handleSaveSample}
              onCancel={() => {
                resetForm();
                handleSwitchView('list');
              }}
            />
          </div>
        </Suspense>
      )}

      {activeView === 'import' && (
        <Suspense fallback={<ViewFallback />}>
          <SoilCsvImportView
            importResult={importResult}
            onFileUpload={handleFileUpload}
            onConfirmImport={handleConfirmImport}
          />
        </Suspense>
      )}
    </div>
  );
};

export default SoilAnalysisModule;
