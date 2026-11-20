import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Calculator,
  Plus,
  CheckCircle2,
  FileText,
  Sprout,
  RefreshCw,
  ShieldCheck,
  Database,
  X,
  RotateCcw,
} from 'lucide-react';

import {
  PesticideProduct,
  CropIndication,
  AgrochemicalClass,
  ToxicologicalClass,
  FormulationType,
} from '../types/pesticideLeaflet';

import {
  checkPesticideCollision,
  analyzeCropAndDosageCoverage,
  STANDARD_AGRICULTURAL_CROPS,
} from '../utils/pesticideDeduplication';
import { usePesticideSearch } from '../hooks/usePesticideSearch';
import { VirtualizedPesticideCatalog } from './VirtualizedPesticideCatalog';
import { Company, Agronomist, RuralProducer, Farm } from '../types/agronomy';
import { BularioModals, BularioConfirmDialogState } from './bulario/BularioModals';
import { BularioCropsMatrixTab } from './bulario/BularioCropsMatrixTab';
import { BularioCalculatorTab, DosageCalcResult } from './bulario/BularioCalculatorTab';
import { BularioAddProductTab, NewIndicationDraft } from './bulario/BularioAddProductTab';
import { BularioReceituarioTab } from './bulario/BularioReceituarioTab';

interface PesticideBularioModuleProps {
  farmName?: string;
  onApplyRecommendationToFieldBook?: (pesticideName: string, crop: string, dosage: string) => void;
  activeFarm?: Farm;
  activeProducer?: RuralProducer;
  activeAgronomist?: Agronomist;
  activeCompany?: Company;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
  farms?: Farm[];
  producers?: RuralProducer[];
  selectedFarmId?: string;
  setSelectedFarmId?: (id: string) => void;
  setFarms?: React.Dispatch<React.SetStateAction<Farm[]>>;
  setProducers?: React.Dispatch<React.SetStateAction<RuralProducer[]>>;
  setActiveTab?: (tab: string) => void;
}

type BularioSubTab = 'catalog' | 'culturas_dosagens' | 'calculator' | 'receituario' | 'add_product';

const QUICK_SEARCH_TERMS = [
  'Glifosato',
  'Fox Xpro',
  'Ferrugem-asiática',
  'Spodoptera',
  'Capim-amargoso',
  'Percevejo-marrom',
  'Nematóide',
  'Biológico',
];

export const PesticideBularioModule: React.FC<PesticideBularioModuleProps> = ({
  farmName = 'Fazenda Santa Maria',
  activeFarm,
  activeProducer,
  activeAgronomist,
  activeCompany,
  activeSubTab: externalActiveSubTab,
  setActiveSubTab: externalSetActiveSubTab,
  farms,
  producers,
  selectedFarmId,
  setSelectedFarmId,
  setFarms,
  setProducers,
  setActiveTab,
}) => {
  // Search & Filter States for Catalog
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');

  const searchFilters = useMemo(
    () => ({
      classFilter: selectedClassFilter,
      cropFilter: selectedCropFilter,
      brandFilter: selectedBrandFilter,
    }),
    [selectedClassFilter, selectedCropFilter, selectedBrandFilter]
  );

  const {
    products,
    filteredProducts,
    searchResult,
    isDbReady,
    indexStats,
    storageDiagnostics,
    duplicateReport,
    rebuildIndex,
    resetToDefaultCatalog,
    deleteProductById,
    upsertProduct,
    runDeduplication,
  } = usePesticideSearch(searchTerm, searchFilters);

  const [localActiveSubTab, setLocalActiveSubTab] = useState<BularioSubTab>('catalog');
  const activeSubTab: BularioSubTab = (externalActiveSubTab as BularioSubTab) || localActiveSubTab;
  const setActiveSubTab = (val: BularioSubTab) => {
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(val);
    } else {
      setLocalActiveSubTab(val);
    }
  };

  // Matrix State
  const [selectedMatrixCrop, setSelectedMatrixCrop] = useState<string>('Soja');
  const [selectedMatrixClass, setSelectedMatrixClass] = useState<string>('all');
  const [matrixSearchTerm, setMatrixSearchTerm] = useState<string>('');
  const [matrixVisibleCount, setMatrixVisibleCount] = useState<number>(40);

  useEffect(() => {
    setMatrixVisibleCount(40);
  }, [selectedMatrixCrop, selectedMatrixClass, matrixSearchTerm]);

  // Sorted Manufacturers List
  const availableManufacturersList = useMemo(() => {
    const countsMap = new Map<string, number>();
    for (const p of products) {
      const mfgRaw = p.manufacturer ? p.manufacturer.trim() : '';
      if (mfgRaw) {
        countsMap.set(mfgRaw, (countsMap.get(mfgRaw) || 0) + 1);
      }
    }
    return Array.from(countsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [products]);

  // Modals & Notifications
  const [showDuplicateAuditModal, setShowDuplicateAuditModal] = useState(false);
  const [showCropAuditModal, setShowCropAuditModal] = useState(false);
  const [showIndexAuditModal, setShowIndexAuditModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState<PesticideProduct | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<BularioConfirmDialogState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetCatalog = () => {
    setConfirmDialog({
      title: 'Restaurar catálogo oficial',
      message:
        'Deseja restaurar o catálogo oficial de defensivos para o padrão completo indexado em IndexedDB?',
      confirmLabel: 'Restaurar catálogo',
      variant: 'primary',
      onConfirm: async () => {
        await resetToDefaultCatalog();
        showToast('Catálogo oficial de defensivos restaurado e reindexado.');
      },
    });
  };

  const handleRunDeduplication = () => {
    const diff = runDeduplication();
    if (diff > 0) {
      showToast(
        `${diff} registro(s) duplicado(s) removido(s). Catálogo consolidado com ${(products || []).length - diff} defensivos.`
      );
    } else {
      showToast(
        `Catálogo íntegro com ${(products || []).length} defensivos e nenhuma duplicidade detectada.`
      );
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setConfirmDialog({
      title: 'Excluir defensivo',
      message: `Tem certeza que deseja excluir "${prod.productName}" do compêndio?`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        await deleteProductById(productId);
        if (detailProduct?.id === productId) setDetailProduct(null);
        showToast(`Produto "${prod.productName}" removido.`);
      },
    });
  };

  const cropCoverageReport = useMemo(
    () => analyzeCropAndDosageCoverage(products, STANDARD_AGRICULTURAL_CROPS),
    [products]
  );

  const availableCropsList = useMemo(() => {
    const cropSet = new Set<string>();
    products.forEach((p) => {
      p.indications.forEach((i) => cropSet.add(i.cropName));
    });
    return Array.from(cropSet).sort();
  }, [products]);

  // =========================================================================
  // RECEITUÁRIO AGRONÔMICO STATE & LOGIC
  // =========================================================================
  const [recipes, setRecipes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agronutri_receitas_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved recipes', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('agronutri_receitas_v1', JSON.stringify(recipes));
  }, [recipes]);

  const [recCompanyName, setRecCompanyName] = useState(
    'AgroNutri Consultoria & Insumos Agrícolas Ltda.'
  );
  const [recCompanyCNPJ, setRecCompanyCNPJ] = useState('12.345.678/0001-99');
  const [recCompanyCREA, setRecCompanyCREA] = useState('CREA-PJ/SP 987654');
  const [recCompanyAddress, setRecCompanyAddress] = useState(
    'Av. da Tecnologia Agrícola, 500 - Ribeirão Preto/SP'
  );
  const [recCompanyContact, setRecCompanyContact] = useState(
    '(16) 3600-1122 | receita@agronutri.com.br'
  );

  const [recRtName, setRecRtName] = useState('Dr. Roberto Mendes de Souza');
  const [recRtCREA, setRecRtCREA] = useState('CREA-SP 50612345/D');
  const [recRtCPF, setRecRtCPF] = useState('123.456.789-00');
  const [recRtEmail, setRecRtEmail] = useState('roberto.mendes@agronutri.com.br');
  const [recRtPhone, setRecRtPhone] = useState('(16) 99888-7766');

  const [recFarmNameForm, setRecFarmNameForm] = useState(farmName || 'Fazenda Santa Maria');
  const [recFarmLocation, setRecFarmLocation] = useState(
    'Rodovia SP-225, Km 42, Gleba B - São Carlos/SP'
  );
  const [recFarmOwner, setRecFarmOwner] = useState('Lucas Mendes da Silva');
  const [recFarmCPF, setRecFarmCPF] = useState('987.654.321-11');
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  const handleSaveToCadastroTecnico = () => {
    if (activeFarm?.id && setFarms) {
      setFarms((prev) =>
        prev.map((f) => (f?.id === activeFarm.id ? { ...f, name: recFarmNameForm } : f))
      );
    }
    if (activeProducer?.id && setProducers) {
      setProducers((prev) =>
        prev.map((p) =>
          p?.id === activeProducer.id
            ? { ...p, name: recFarmOwner, document: recFarmCPF }
            : p
        )
      );
    }
    setSyncNotification(`Dados da fazenda "${recFarmNameForm}" sincronizados no Cadastro Técnico.`);
    setTimeout(() => setSyncNotification(null), 4000);
  };

  useEffect(() => {
    if (activeCompany) {
      setRecCompanyName(activeCompany.name);
      setRecCompanyCNPJ(activeCompany.cnpj);
      setRecCompanyCREA(activeCompany.creaRegister || 'CREA-PJ/SP 987654');
      setRecCompanyAddress(
        activeCompany.address
          ? `${activeCompany.address}, ${activeCompany.city || ''}/${activeCompany.state || ''}`
          : `${activeCompany.city || ''}/${activeCompany.state || ''}`
      );
      setRecCompanyContact(`${activeCompany.phone || ''} | ${activeCompany.email || ''}`);
    }
  }, [activeCompany]);

  useEffect(() => {
    if (activeAgronomist) {
      setRecRtName(activeAgronomist.name);
      setRecRtCREA(
        activeAgronomist.crea
          ? `CREA-${activeAgronomist.creaState || 'SP'} ${activeAgronomist.crea}`
          : 'CREA-SP 50612345/D'
      );
      setRecRtCPF(activeAgronomist.cpf);
      setRecRtEmail(activeAgronomist.email);
      setRecRtPhone(activeAgronomist.phone);
    }
  }, [activeAgronomist]);

  useEffect(() => {
    if (activeFarm) {
      setRecFarmNameForm(activeFarm.name);
      const coords =
        activeFarm.latitude && activeFarm.longitude
          ? `Coordenadas: ${activeFarm.latitude}, ${activeFarm.longitude} - `
          : '';
      setRecFarmLocation(`${coords}${activeFarm.city || ''}/${activeFarm.state || ''}`);
    }
  }, [activeFarm]);

  useEffect(() => {
    if (activeProducer) {
      setRecFarmOwner(activeProducer.name);
      setRecFarmCPF(activeProducer.document);
      setRecProducerName(activeProducer.name);
    }
  }, [activeProducer]);

  const [recSelectedCrop, setRecSelectedCrop] = useState('');
  const [recSelectedProduct, setRecSelectedProduct] = useState('');
  const [recSelectedDosage, setRecSelectedDosage] = useState('');
  const [recApplicationEpoch, setRecApplicationEpoch] = useState(
    'Fase pós-emergência inicial da cultura e pragas.'
  );
  const [recReturnLocation, setRecReturnLocation] = useState(
    'Central de Devolução de Embalagens Vazias ARPEV - Rodovia SP-322, Km 12, Sertãozinho/SP'
  );
  const [recNotesForm, setRecNotesForm] = useState(
    'Respeitar os EPIs obrigatórios descritos na bula. Não aplicar sob ventos fortes (>10 km/h) ou altas temperaturas (>30°C).'
  );
  const [recProducerName, setRecProducerName] = useState('Lucas Mendes da Silva');
  const [recPurchasedQty, setRecPurchasedQty] = useState<number>(20);
  const [recWaterVolumeLha, setRecWaterVolumeLha] = useState<number>(150);
  const [selectedIndicationDosage, setSelectedIndicationDosage] = useState<number>(0.5);
  const [selectedIndicationUnit, setSelectedIndicationUnit] = useState<string>('L/ha');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isCustomCropMode, setIsCustomCropMode] = useState(false);
  const [selectedRecipeForView, setSelectedRecipeForView] = useState<any | null>(null);

  const { computedHectares, computedTotalWater } = useMemo(() => {
    let dosageVal = selectedIndicationDosage || 0.5;
    let unitStr = (selectedIndicationUnit || 'L/ha').toLowerCase();

    if (recSelectedDosage) {
      const match = recSelectedDosage.match(/([\d.,]+)\s*([a-zA-Zá-úÁ-Ú%\/0-9]+)/);
      if (match) {
        const parsedDosage = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(parsedDosage) && parsedDosage > 0) {
          dosageVal = parsedDosage;
        }
        unitStr = match[2].toLowerCase();
      }
    }

    let hectares = 0;
    if (dosageVal > 0) {
      if (unitStr.includes('ml/ha')) {
        hectares = recPurchasedQty / (dosageVal / 1000);
      } else if (unitStr.includes('g/ha') && !unitStr.includes('kg/ha')) {
        hectares = recPurchasedQty / (dosageVal / 1000);
      } else {
        hectares = recPurchasedQty / dosageVal;
      }
    }

    return {
      computedHectares: hectares,
      computedTotalWater: hectares * recWaterVolumeLha,
    };
  }, [
    recPurchasedQty,
    recWaterVolumeLha,
    selectedIndicationDosage,
    selectedIndicationUnit,
    recSelectedDosage,
  ]);

  const activeProductObj = useMemo(() => {
    if (!recSelectedProduct) return null;
    const clean = recSelectedProduct.toLowerCase().trim();
    return products.find((p) => p.productName.toLowerCase().trim() === clean) || null;
  }, [recSelectedProduct, products]);

  const filteredProductSuggestions = useMemo(() => {
    if (!recSelectedProduct || recSelectedProduct.trim().length < 1) return [];
    const query = recSelectedProduct.toLowerCase();
    const pool = products || [];
    const exactOrPrefix = pool.filter((p) => p.productName.toLowerCase().startsWith(query));
    const contains = pool.filter(
      (p) =>
        !p.productName.toLowerCase().startsWith(query) &&
        p.productName.toLowerCase().includes(query)
    );
    return [...exactOrPrefix, ...contains].slice(0, 10);
  }, [recSelectedProduct, products]);

  // Signature Canvases
  const [isDrawingProducer, setIsDrawingProducer] = useState(false);
  const [isDrawingRT, setIsDrawingRT] = useState(false);
  const canvasProducerRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRTRef = useRef<HTMLCanvasElement | null>(null);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isRT: boolean
  ) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = isRT ? canvasRTRef.current : canvasProducerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = isRT ? '#059669' : '#1e293b';
    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isRT) setIsDrawingRT(true);
    else setIsDrawingProducer(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isRT: boolean
  ) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    if (!(isRT ? isDrawingRT : isDrawingProducer)) return;

    const canvas = isRT ? canvasRTRef.current : canvasProducerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (isRT: boolean) => {
    if (isRT) setIsDrawingRT(false);
    else setIsDrawingProducer(false);
  };

  const clearCanvas = (isRT: boolean) => {
    const canvas = isRT ? canvasRTRef.current : canvasProducerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePrefillFromBulario = (productId: string, cropName: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('Selecione um produto válido no catálogo.');
      return;
    }
    setRecSelectedProduct(product.productName);
    setIsCustomCropMode(false);
    setShowProductDropdown(false);

    const indication =
      product.indications.find((i) => i.cropName.toLowerCase() === cropName.toLowerCase()) ||
      product.indications[0];
    if (indication) {
      setRecSelectedCrop(indication.cropName);
      setRecSelectedDosage(`${indication.recommendedDosage} ${indication.dosageUnit}`);
      setSelectedIndicationDosage(indication.recommendedDosage);
      setSelectedIndicationUnit(indication.dosageUnit);
      if (indication.recommendedSprayVolumeLha) {
        setRecWaterVolumeLha(indication.recommendedSprayVolumeLha);
      }
      setRecApplicationEpoch(
        indication.applicationPhase ||
          'Conforme estágio vegetativo recomendado na bula oficial MAPA.'
      );
      setRecNotesForm(
        `Utilizar EPIs obrigatórios. Alvo homologado: ${indication.targetOrganism}. Carência: ${indication.gracePeriodDays} dias. Reentrada: ${product.reentryIntervalHours}h. ${indication.notes || ''}`.trim()
      );
    } else if (product.notes) {
      setRecNotesForm(product.notes);
    } else {
      setRecNotesForm(
        `Utilizar EPI obrigatório. Respeitar intervalo de reentrada de ${product.reentryIntervalHours} horas.`
      );
    }

    showToast(`Dados de "${product.productName}" carregados no receituário.`);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recSelectedProduct.trim()) {
      showToast('Informe o nome do produto.');
      return;
    }
    if (!recSelectedCrop.trim()) {
      showToast('Informe a cultura.');
      return;
    }
    if (!recSelectedDosage.trim()) {
      showToast('Informe a dosagem.');
      return;
    }

    const producerSig = canvasProducerRef.current ? canvasProducerRef.current.toDataURL() : '';
    const rtSig = canvasRTRef.current ? canvasRTRef.current.toDataURL() : '';
    const verificationCode =
      'REC-' +
      Math.random().toString(36).substring(2, 10).toUpperCase() +
      '-' +
      Date.now().toString().slice(-4);

    const newRecipe = {
      id: `recipe-${Date.now()}`,
      createdAt: new Date().toISOString(),
      verificationCode,
      companyName: recCompanyName,
      companyCNPJ: recCompanyCNPJ,
      companyCREA: recCompanyCREA,
      companyAddress: recCompanyAddress,
      companyContact: recCompanyContact,
      rtName: recRtName,
      rtCREA: recRtCREA,
      rtCPF: recRtCPF,
      rtEmail: recRtEmail,
      rtPhone: recRtPhone,
      farmName: recFarmNameForm,
      farmLocation: recFarmLocation,
      farmOwner: recFarmOwner,
      farmCPF: recFarmCPF,
      crop: recSelectedCrop,
      productName: recSelectedProduct,
      productManufacturer: activeProductObj?.manufacturer || '',
      productRegistration: activeProductObj?.registrationNumber || '',
      dosage: recSelectedDosage,
      applicationEpoch: recApplicationEpoch,
      returnLocation: recReturnLocation,
      notes: recNotesForm,
      producerName: recProducerName,
      producerSignature: producerSig,
      rtSignature: rtSig,
      purchasedQty: recPurchasedQty,
      purchasedUnit:
        selectedIndicationUnit.toLowerCase().includes('kg') ||
        selectedIndicationUnit.toLowerCase().includes('g') ||
        selectedIndicationUnit.toLowerCase().includes('wp')
          ? 'kg'
          : 'L',
      waterVolumeLha: recWaterVolumeLha,
      computedHectares,
      computedTotalWater,
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    showToast('Receituário agronômico emitido e assinado.');

    setTimeout(() => {
      clearCanvas(false);
      clearCanvas(true);
    }, 100);

    setRecSelectedCrop('');
    setRecSelectedProduct('');
    setRecSelectedDosage('');
  };

  const handleDeleteRecipe = (id: string) => {
    setConfirmDialog({
      title: 'Excluir receituário',
      message: 'Deseja realmente excluir este receituário agronômico do histórico?',
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        showToast('Receituário excluído.');
      },
    });
  };

  // =========================================================================
  // CALCULATOR STATE & LOGIC
  // =========================================================================
  const [calcProductId, setCalcProductId] = useState<string>(products[0]?.id || '');
  const [calcCropName, setCalcCropName] = useState<string>('');
  const [calcAreaHa, setCalcAreaHa] = useState<number | ''>(50);
  const [calcTankVolumeL, setCalcTankVolumeL] = useState<number | ''>(2000);

  const selectedCalcProduct = useMemo(
    () => products.find((p) => p.id === calcProductId) || null,
    [products, calcProductId]
  );

  useEffect(() => {
    if (selectedCalcProduct && (selectedCalcProduct.indications || []).length > 0) {
      const exists = (selectedCalcProduct.indications || []).some(
        (i) => i.cropName === calcCropName
      );
      if (!exists && selectedCalcProduct.indications?.[0]) {
        setCalcCropName(selectedCalcProduct.indications[0].cropName);
      }
    } else {
      setCalcCropName('');
    }
  }, [selectedCalcProduct, calcCropName]);

  const calcResult: DosageCalcResult = useMemo(() => {
    if (!selectedCalcProduct) {
      return {
        isValid: false,
        errorMessage: 'Selecione um defensivo agrícola cadastrado no bulário.',
      };
    }
    if (!selectedCalcProduct.indications || selectedCalcProduct.indications.length === 0) {
      return {
        isValid: false,
        errorMessage: `O produto "${selectedCalcProduct.productName}" não possui culturas indicadas cadastradas.`,
      };
    }
    if (!calcCropName) {
      return {
        isValid: false,
        errorMessage: 'Selecione a cultura para calcular a dosagem.',
      };
    }

    const selectedIndication = selectedCalcProduct.indications.find(
      (i) => i.cropName === calcCropName
    );
    if (!selectedIndication) {
      return {
        isValid: false,
        errorMessage: `A combinação entre "${selectedCalcProduct.productName}" e "${calcCropName}" não consta na bula.`,
      };
    }
    if (calcAreaHa === '' || Number(calcAreaHa) <= 0) {
      return {
        isValid: false,
        errorMessage: 'Informe uma área de tratamento em hectares maior que zero.',
      };
    }

    const area = Number(calcAreaHa);
    const dosage = selectedIndication.recommendedDosage;
    const unit = selectedIndication.dosageUnit;
    const sprayVolumeLha = selectedIndication.recommendedSprayVolumeLha || 100;
    const tankVol =
      calcTankVolumeL !== '' && Number(calcTankVolumeL) > 0 ? Number(calcTankVolumeL) : 2000;

    let totalProductNeeded = 0;
    let formattedUnitLabel: string = unit;
    let dosePerHaConverted = dosage;

    if (unit === 'L/ha' || unit === 'kg/ha') {
      totalProductNeeded = dosage * area;
      dosePerHaConverted = dosage;
      formattedUnitLabel = unit === 'L/ha' ? 'Litros' : 'Kg';
    } else if (unit === 'mL/ha' || unit === 'g/ha') {
      const rawTotal = dosage * area;
      dosePerHaConverted = dosage / 1000;
      if (rawTotal >= 1000) {
        totalProductNeeded = rawTotal / 1000;
        formattedUnitLabel = unit === 'mL/ha' ? 'Litros' : 'Kg';
      } else {
        totalProductNeeded = rawTotal;
        formattedUnitLabel = unit === 'mL/ha' ? 'mL' : 'g';
      }
    } else if (
      unit === 'L/100L de água' ||
      unit === 'mL/100L de água' ||
      unit === 'g/100L de água'
    ) {
      let dosePerLiter = dosage / 100;
      if (unit === 'mL/100L de água' || unit === 'g/100L de água') {
        dosePerLiter = dosePerLiter / 1000;
      }
      dosePerHaConverted = dosePerLiter * sprayVolumeLha;
      totalProductNeeded = dosePerHaConverted * area;
      formattedUnitLabel =
        unit === 'L/100L de água' || unit === 'mL/100L de água' ? 'Litros' : 'Kg';
    } else if (unit === 'L/100kg de semente' || unit === 'mL/100kg de semente') {
      const litersPer100kg = unit === 'mL/100kg de semente' ? dosage / 1000 : dosage;
      dosePerHaConverted = litersPer100kg * 0.6;
      totalProductNeeded = dosePerHaConverted * area;
      formattedUnitLabel = 'Litros (TS)';
    }

    const totalSprayVolumeL = sprayVolumeLha * area;
    const numberOfTankLoads = Math.ceil((totalSprayVolumeL / tankVol) * 10) / 10;
    const productPerTank = numberOfTankLoads > 0 ? totalProductNeeded / numberOfTankLoads : 0;

    const packageBreakdown: { packageSize: number; quantity: number }[] = [];
    const sortedSizes =
      selectedCalcProduct.packageSizes && selectedCalcProduct.packageSizes.length > 0
        ? [...selectedCalcProduct.packageSizes].sort((a, b) => b - a)
        : [20, 5, 1];

    let remaining = totalProductNeeded;
    sortedSizes.forEach((size) => {
      if (remaining >= size) {
        packageBreakdown.push({ packageSize: size, quantity: Math.floor(remaining / size) });
        remaining = remaining % size;
      }
    });
    if (remaining > 0.001) {
      const smallest = sortedSizes[sortedSizes.length - 1];
      const existing = packageBreakdown.find((p) => p.packageSize === smallest);
      if (existing) existing.quantity += 1;
      else packageBreakdown.push({ packageSize: smallest, quantity: 1 });
    }

    const warnings: string[] = [];
    if (selectedIndication.gracePeriodDays === 0) {
      warnings.push('ℹ️ Produto isento de período de carência (0 dias).');
    } else {
      warnings.push(
        `Carência: respeitar ${selectedIndication.gracePeriodDays} dias entre a última aplicação e a colheita de ${calcCropName}.`
      );
    }
    warnings.push(
      `Reentrada: aguardar ${selectedCalcProduct.reentryIntervalHours} horas (ou secagem completa da calda) antes de entrar na área sem EPI.`
    );

    return {
      isValid: true,
      product: selectedCalcProduct,
      indication: selectedIndication,
      treatedAreaHa: area,
      dosePerHaConverted,
      totalProductNeeded: Number(totalProductNeeded.toFixed(2)),
      formattedUnitLabel,
      sprayVolumeLha,
      totalSprayVolumeL: Math.round(totalSprayVolumeL),
      tankVol,
      numberOfTankLoads,
      productPerTank: Number(productPerTank.toFixed(2)),
      packageBreakdown,
      gracePeriodDays: selectedIndication.gracePeriodDays,
      reentryIntervalHours: selectedCalcProduct.reentryIntervalHours,
      warnings,
    };
  }, [selectedCalcProduct, calcCropName, calcAreaHa, calcTankVolumeL]);

  const handleCopySummary = () => {
    if (!calcResult.isValid) return;
    const text = `RECOMENDAÇÃO DE APLICAÇÃO DE DEFENSIVO
Fazenda: ${farmName}
Produto: ${calcResult.product?.productName} (MAPA ${calcResult.product?.registrationNumber})
Princípio Ativo: ${calcResult.product?.activeIngredient}
Cultura Alvo: ${calcResult.indication?.cropName}
Alvo Biológico: ${calcResult.indication?.targetOrganism}
Área Tratada: ${calcResult.treatedAreaHa} ha
Dosagem: ${calcResult.indication?.recommendedDosage} ${calcResult.indication?.dosageUnit}
----------------------------------
Quantidade Total: ${calcResult.totalProductNeeded} ${calcResult.formattedUnitLabel}
Calda Total: ${calcResult.totalSprayVolumeL?.toLocaleString('pt-BR')} L (${calcResult.sprayVolumeLha} L/ha)
Tanques: ~${calcResult.numberOfTankLoads} de ${calcResult.tankVol} L (${calcResult.productPerTank} ${calcResult.formattedUnitLabel}/tanque)
Carência: ${calcResult.gracePeriodDays} dias | Reentrada: ${calcResult.reentryIntervalHours} h`;

    navigator.clipboard.writeText(text);
    showToast('Resumo da dosagem copiado para a área de transferência.');
  };

  // =========================================================================
  // NEW PRODUCT FORM STATE & LOGIC
  // =========================================================================
  const [newProductName, setNewProductName] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newActiveIngredient, setNewActiveIngredient] = useState('');
  const [newChemicalGroup, setNewChemicalGroup] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newClass, setNewClass] = useState<AgrochemicalClass>('Fungicida');
  const [newToxicClass, setNewToxicClass] = useState<ToxicologicalClass>('Classe IV - Pouco Tóxico');
  const [newFormulation, setNewFormulation] = useState<FormulationType>('SC - Suspensão Concentrada');
  const [newReentryHours, setNewReentryHours] = useState<number>(24);
  const [newModeOfAction, setNewModeOfAction] = useState('');
  const [newPackageSizes, setNewPackageSizes] = useState<string>('1, 5, 20');
  const [newNotes, setNewNotes] = useState('');

  const [newIndications, setNewIndications] = useState<NewIndicationDraft[]>([
    {
      cropName: 'Soja',
      recommendedDosage: 0.5,
      dosageUnit: 'L/ha',
      targetOrganism: 'Ferrugem-asiática / Doenças foliares',
      applicationPhase: 'Preventivo',
      gracePeriodDays: 30,
      recommendedSprayVolumeLha: 100,
    },
  ]);

  const handleAddIndicationRow = () => {
    setNewIndications((prev) => [
      ...prev,
      {
        cropName: 'Milho',
        recommendedDosage: 0.4,
        dosageUnit: 'L/ha',
        targetOrganism: 'Pragas / Doenças principais',
        applicationPhase: 'V4-V8',
        gracePeriodDays: 15,
        recommendedSprayVolumeLha: 150,
      },
    ]);
  };

  const handleRemoveIndicationRow = (index: number) => {
    if (newIndications.length <= 1) {
      showToast('O produto deve ter pelo menos uma cultura indicada.');
      return;
    }
    setNewIndications((prev) => prev.filter((_, i) => i !== index));
  };

  const newProductCollision = useMemo(() => {
    if (!newProductName.trim() && !newRegNumber.trim()) return null;
    return checkPesticideCollision(products, newProductName, newRegNumber);
  }, [products, newProductName, newRegNumber]);

  const persistNewProduct = async () => {
    const parsedPackageSizes = newPackageSizes
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const formattedIndications: CropIndication[] = newIndications.map((ind, idx) => ({
      id: `ind-custom-${Date.now()}-${idx}`,
      cropName: ind.cropName.trim() || 'Cultura Geral',
      recommendedDosage: Number(ind.recommendedDosage) || 1,
      dosageUnit: ind.dosageUnit,
      targetOrganism: ind.targetOrganism.trim() || 'Alvo Geral',
      applicationPhase: ind.applicationPhase.trim() || 'Conforme a bula',
      gracePeriodDays: Number(ind.gracePeriodDays) || 0,
      recommendedSprayVolumeLha: Number(ind.recommendedSprayVolumeLha) || 100,
    }));

    const newProductObj: PesticideProduct = {
      id: `prod-custom-${Date.now()}`,
      productName: newProductName.trim(),
      registrationNumber: newRegNumber.trim(),
      activeIngredient: newActiveIngredient.trim(),
      chemicalGroup: newChemicalGroup.trim() || 'Não especificado',
      manufacturer: newManufacturer.trim() || 'Fabricante Nacional',
      agrochemicalClass: newClass,
      toxicologicalClass: newToxicClass,
      formulation: newFormulation,
      reentryIntervalHours: Number(newReentryHours) || 24,
      modeOfAction: newModeOfAction.trim() || 'Conforme Bula Oficial',
      packageSizes: parsedPackageSizes.length > 0 ? parsedPackageSizes : [1, 5, 20],
      notes: newNotes.trim(),
      indications: formattedIndications,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    await upsertProduct(newProductObj);
    showToast(`Produto "${newProductObj.productName}" cadastrado e indexado.`);

    setNewProductName('');
    setNewRegNumber('');
    setNewActiveIngredient('');
    setNewChemicalGroup('');
    setNewManufacturer('');
    setNewNotes('');

    setActiveSubTab('catalog');
    setCalcProductId(newProductObj.id);
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      showToast('Informe o nome do produto defensivo.');
      return;
    }
    if (!newRegNumber.trim()) {
      showToast('Informe o número de registro no MAPA.');
      return;
    }
    if (!newActiveIngredient.trim()) {
      showToast('Informe o ingrediente ativo.');
      return;
    }

    if (newProductCollision && newProductCollision.hasCollision) {
      const reasonLabel = newProductCollision.reason?.includes('Registro')
        ? `o mesmo registro MAPA (${newProductCollision.conflictingProduct?.registrationNumber})`
        : `o mesmo nome (${newProductCollision.conflictingProduct?.productName})`;
      setConfirmDialog({
        title: 'Confirmar cadastro com duplicidade',
        message: `Já existe um produto cadastrado com ${reasonLabel} (${newProductCollision.conflictingProduct?.manufacturer}). Deseja cadastrar mesmo assim?`,
        confirmLabel: 'Cadastrar mesmo assim',
        variant: 'primary',
        onConfirm: () => {
          void persistNewProduct();
        },
      });
      return;
    }

    await persistNewProduct();
  };

  const hasActiveCatalogFilters =
    Boolean(searchTerm.trim()) ||
    selectedClassFilter !== 'all' ||
    selectedCropFilter !== 'all' ||
    selectedBrandFilter !== 'all';

  const clearAllCatalogFilters = () => {
    setSearchTerm('');
    setSelectedClassFilter('all');
    setSelectedCropFilter('all');
    setSelectedBrandFilter('all');
  };

  const navTabs: {
    id: BularioSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'catalog', label: 'Catálogo & Bulas', icon: BookOpen, count: products.length },
    {
      id: 'culturas_dosagens',
      label: 'Matriz de Culturas',
      icon: Sprout,
      count: STANDARD_AGRICULTURAL_CROPS.length,
    },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
    { id: 'receituario', label: 'Receituário', icon: FileText, count: recipes.length },
    { id: 'add_product', label: 'Cadastrar', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      {/* Cabeçalho Compacto do Módulo */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Compêndio de Defensivos
              </h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Bulas MAPA, Dosagens &amp; Receituário
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{products.length.toLocaleString('pt-BR')} defensivos</span>
              <span aria-hidden="true">·</span>
              <span>{STANDARD_AGRICULTURAL_CROPS.length} culturas</span>
              <span aria-hidden="true">·</span>
              <span>{recipes.length} {recipes.length === 1 ? 'receita' : 'receitas'}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  duplicateReport.hasDuplicates
                    ? 'text-amber-700 dark:text-amber-400 font-medium'
                    : 'text-emerald-700 dark:text-emerald-400 font-medium'
                }
              >
                {duplicateReport.hasDuplicates
                  ? `${duplicateReport.totalDuplicateItems} duplicidade(s)`
                  : 'Catálogo íntegro'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowDuplicateAuditModal(true)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Auditar duplicidades e integridade"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Auditoria</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIndexAuditModal(true)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Índice de busca e banco offline"
            >
              <Database className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span className="hidden sm:inline">Banco offline</span>
            </button>

            <button
              type="button"
              onClick={handleResetCatalog}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Restaurar catálogo padrão MAPA"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span className="hidden md:inline">Restaurar</span>
            </button>
          </div>
        </div>

        {/* Navegação Horizontal (Underline Tabs) */}
        <nav
          aria-label="Seções do compêndio de defensivos"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-2.5 py-2.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {tab.count.toLocaleString('pt-BR')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Área Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Feedback Inline Discreto */}
        {toastMessage && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Fechar aviso"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ABA 1: CATÁLOGO & BULAS */}
        {activeSubTab === 'catalog' && (
          <div className="space-y-3.5">
            {/* Painel de Busca e Filtros */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                {/* Campo de busca */}
                <div className="relative md:col-span-5">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por produto, ingrediente ativo, alvo ou registro MAPA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 pl-8 pr-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Limpar busca"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Classe */}
                <select
                  aria-label="Filtrar por classe"
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="md:col-span-2 h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="all">Todas as classes</option>
                  <option value="Herbicida">Herbicidas</option>
                  <option value="Fungicida">Fungicidas</option>
                  <option value="Inseticida">Inseticidas</option>
                  <option value="Acaricida">Acaricidas</option>
                  <option value="Nematicida">Nematicidas</option>
                  <option value="Tratamento de Sementes">Tratamento de Sementes</option>
                  <option value="Biológico">Biológicos</option>
                  <option value="Fisioativador">Fisioativadores</option>
                  <option value="Adjuvante">Adjuvantes</option>
                </select>

                {/* Cultura */}
                <select
                  aria-label="Filtrar por cultura"
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                  className="md:col-span-2 h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="all">Culturas ({availableCropsList.length})</option>
                  {availableCropsList.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>

                {/* Fabricante */}
                <select
                  aria-label="Filtrar por fabricante"
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="md:col-span-3 h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="all">
                    Fabricantes ({availableManufacturersList.length})
                  </option>
                  {availableManufacturersList.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Atalhos rápidos discretos + botão limpar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-slate-400 dark:text-zinc-500 shrink-0 mr-1">
                    Sugestões:
                  </span>
                  {QUICK_SEARCH_TERMS.map((term) => {
                    const isActive = searchTerm.toLowerCase() === term.toLowerCase();
                    return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchTerm(isActive ? '' : term)}
                        className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white font-medium'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>

                {hasActiveCatalogFilters && (
                  <button
                    type="button"
                    onClick={clearAllCatalogFilters}
                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar filtros</span>
                  </button>
                )}
              </div>
            </div>

            <VirtualizedPesticideCatalog
              products={filteredProducts}
              searchTerm={searchTerm}
              onClearFilters={clearAllCatalogFilters}
              onSelectProductForCalc={(productId, cropName) => {
                setCalcProductId(productId);
                setCalcCropName(cropName);
                setActiveSubTab('calculator');
              }}
              onSelectProductForReceituario={(productId, cropName) => {
                handlePrefillFromBulario(productId, cropName);
                setActiveSubTab('receituario');
              }}
              onOpenDetailModal={(product) => setDetailProduct(product)}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}

        {/* ABA 2: MATRIZ DE CULTURAS & DOSAGENS */}
        {activeSubTab === 'culturas_dosagens' && (
          <BularioCropsMatrixTab
            products={products}
            cropCoverageReport={cropCoverageReport}
            selectedMatrixCrop={selectedMatrixCrop}
            setSelectedMatrixCrop={setSelectedMatrixCrop}
            selectedMatrixClass={selectedMatrixClass}
            setSelectedMatrixClass={setSelectedMatrixClass}
            matrixSearchTerm={matrixSearchTerm}
            setMatrixSearchTerm={setMatrixSearchTerm}
            matrixVisibleCount={matrixVisibleCount}
            setMatrixVisibleCount={setMatrixVisibleCount}
            onOpenCropAuditModal={() => setShowCropAuditModal(true)}
            onSelectForCalculator={(productId, cropName) => {
              setCalcProductId(productId);
              setCalcCropName(cropName);
              setActiveSubTab('calculator');
            }}
            onSelectForReceituario={(productId, cropName) => {
              handlePrefillFromBulario(productId, cropName);
              setActiveSubTab('receituario');
            }}
            onOpenDetailModal={(product) => setDetailProduct(product)}
          />
        )}

        {/* ABA 3: CALCULADORA DE DOSAGEM */}
        {activeSubTab === 'calculator' && (
          <BularioCalculatorTab
            products={products}
            farmName={farmName}
            calcProductId={calcProductId}
            setCalcProductId={setCalcProductId}
            calcCropName={calcCropName}
            setCalcCropName={setCalcCropName}
            calcAreaHa={calcAreaHa}
            setCalcAreaHa={setCalcAreaHa}
            calcTankVolumeL={calcTankVolumeL}
            setCalcTankVolumeL={setCalcTankVolumeL}
            selectedCalcProduct={selectedCalcProduct}
            calcResult={calcResult}
            onEmitInReceituario={() => {
              if (calcResult.product && calcResult.indication) {
                handlePrefillFromBulario(calcResult.product.id, calcResult.indication.cropName);
                if ((calcResult.totalProductNeeded || 0) > 0) {
                  setRecPurchasedQty(calcResult.totalProductNeeded!);
                }
                if ((calcResult.sprayVolumeLha || 0) > 0) {
                  setRecWaterVolumeLha(calcResult.sprayVolumeLha!);
                }
                setActiveSubTab('receituario');
              }
            }}
            onCopySummary={handleCopySummary}
          />
        )}

        {/* ABA 4: CADASTRAR NOVO DEFENSIVO */}
        {activeSubTab === 'add_product' && (
          <BularioAddProductTab
            newProductName={newProductName}
            setNewProductName={setNewProductName}
            newRegNumber={newRegNumber}
            setNewRegNumber={setNewRegNumber}
            newManufacturer={newManufacturer}
            setNewManufacturer={setNewManufacturer}
            newActiveIngredient={newActiveIngredient}
            setNewActiveIngredient={setNewActiveIngredient}
            newChemicalGroup={newChemicalGroup}
            setNewChemicalGroup={setNewChemicalGroup}
            newClass={newClass}
            setNewClass={setNewClass}
            newToxicClass={newToxicClass}
            setNewToxicClass={setNewToxicClass}
            newFormulation={newFormulation}
            setNewFormulation={setNewFormulation}
            newReentryHours={newReentryHours}
            setNewReentryHours={setNewReentryHours}
            newPackageSizes={newPackageSizes}
            setNewPackageSizes={setNewPackageSizes}
            newModeOfAction={newModeOfAction}
            setNewModeOfAction={setNewModeOfAction}
            newNotes={newNotes}
            setNewNotes={setNewNotes}
            newIndications={newIndications}
            setNewIndications={setNewIndications}
            newProductCollision={newProductCollision}
            onAddIndicationRow={handleAddIndicationRow}
            onRemoveIndicationRow={handleRemoveIndicationRow}
            onCancel={() => setActiveSubTab('catalog')}
            onSubmit={handleSaveNewProduct}
          />
        )}

        {/* ABA 5: RECEITUÁRIO AGRONÔMICO */}
        {activeSubTab === 'receituario' && (
          <BularioReceituarioTab
            recipes={recipes}
            activeFarm={activeFarm}
            farms={farms}
            producers={producers}
            selectedFarmId={selectedFarmId}
            setSelectedFarmId={setSelectedFarmId}
            setActiveTab={setActiveTab}
            recCompanyName={recCompanyName}
            setRecCompanyName={setRecCompanyName}
            recCompanyCNPJ={recCompanyCNPJ}
            setRecCompanyCNPJ={setRecCompanyCNPJ}
            recCompanyCREA={recCompanyCREA}
            setRecCompanyCREA={setRecCompanyCREA}
            recCompanyAddress={recCompanyAddress}
            setRecCompanyAddress={setRecCompanyAddress}
            recCompanyContact={recCompanyContact}
            setRecCompanyContact={setRecCompanyContact}
            recRtName={recRtName}
            setRecRtName={setRecRtName}
            recRtCREA={recRtCREA}
            setRecRtCREA={setRecRtCREA}
            recRtCPF={recRtCPF}
            setRecRtCPF={setRecRtCPF}
            recRtEmail={recRtEmail}
            setRecRtEmail={setRecRtEmail}
            recRtPhone={recRtPhone}
            setRecRtPhone={setRecRtPhone}
            recFarmNameForm={recFarmNameForm}
            setRecFarmNameForm={setRecFarmNameForm}
            recFarmLocation={recFarmLocation}
            setRecFarmLocation={setRecFarmLocation}
            recFarmOwner={recFarmOwner}
            setRecFarmOwner={setRecFarmOwner}
            recFarmCPF={recFarmCPF}
            setRecFarmCPF={setRecFarmCPF}
            syncNotification={syncNotification}
            onSaveToCadastroTecnico={handleSaveToCadastroTecnico}
            recSelectedProduct={recSelectedProduct}
            setRecSelectedProduct={setRecSelectedProduct}
            recSelectedCrop={recSelectedCrop}
            setRecSelectedCrop={setRecSelectedCrop}
            recSelectedDosage={recSelectedDosage}
            setRecSelectedDosage={setRecSelectedDosage}
            recApplicationEpoch={recApplicationEpoch}
            setRecApplicationEpoch={setRecApplicationEpoch}
            recReturnLocation={recReturnLocation}
            setRecReturnLocation={setRecReturnLocation}
            recNotesForm={recNotesForm}
            setRecNotesForm={setRecNotesForm}
            recProducerName={recProducerName}
            setRecProducerName={setRecProducerName}
            recPurchasedQty={recPurchasedQty}
            setRecPurchasedQty={setRecPurchasedQty}
            recWaterVolumeLha={recWaterVolumeLha}
            setRecWaterVolumeLha={setRecWaterVolumeLha}
            selectedIndicationUnit={selectedIndicationUnit}
            setSelectedIndicationDosage={setSelectedIndicationDosage}
            setSelectedIndicationUnit={setSelectedIndicationUnit}
            computedHectares={computedHectares}
            computedTotalWater={computedTotalWater}
            activeProductObj={activeProductObj}
            filteredProductSuggestions={filteredProductSuggestions}
            showProductDropdown={showProductDropdown}
            setShowProductDropdown={setShowProductDropdown}
            isCustomCropMode={isCustomCropMode}
            setIsCustomCropMode={setIsCustomCropMode}
            canvasProducerRef={canvasProducerRef}
            canvasRTRef={canvasRTRef}
            startDrawing={startDrawing}
            draw={draw}
            stopDrawing={stopDrawing}
            clearCanvas={clearCanvas}
            onSaveRecipe={handleSaveRecipe}
            onViewRecipe={(r) => setSelectedRecipeForView(r)}
            onDeleteRecipe={handleDeleteRecipe}
          />
        )}
      </main>

      {/* Modais unificados */}
      <BularioModals
        detailProduct={detailProduct}
        onCloseDetailProduct={() => setDetailProduct(null)}
        onUseProductInReceituario={(prod) => {
          handlePrefillFromBulario(prod.id, prod.indications[0]?.cropName || '');
          setDetailProduct(null);
          setActiveSubTab('receituario');
        }}
        onUseProductInCalculator={(prod) => {
          setCalcProductId(prod.id);
          if ((prod.indications || []).length > 0 && prod.indications?.[0]) {
            setCalcCropName(prod.indications[0].cropName);
          }
          setDetailProduct(null);
          setActiveSubTab('calculator');
        }}
        selectedRecipeForView={selectedRecipeForView}
        onCloseRecipeView={() => setSelectedRecipeForView(null)}
        showDuplicateAuditModal={showDuplicateAuditModal}
        onCloseDuplicateAuditModal={() => setShowDuplicateAuditModal(false)}
        duplicateReport={duplicateReport}
        onRunDeduplication={handleRunDeduplication}
        showCropAuditModal={showCropAuditModal}
        onCloseCropAuditModal={() => setShowCropAuditModal(false)}
        cropCoverageReport={cropCoverageReport}
        showIndexAuditModal={showIndexAuditModal}
        onCloseIndexAuditModal={() => setShowIndexAuditModal(false)}
        searchResult={searchResult}
        indexStats={indexStats}
        storageDiagnostics={storageDiagnostics}
        isDbReady={isDbReady}
        totalProductsCount={products.length}
        onRebuildIndex={() => {
          const dur = rebuildIndex();
          showToast(`Índice reconstruído em ${dur} ms.`);
        }}
        confirmDialog={confirmDialog}
        onCloseConfirmDialog={() => setConfirmDialog(null)}
      />
    </div>
  );
};

export default PesticideBularioModule;
