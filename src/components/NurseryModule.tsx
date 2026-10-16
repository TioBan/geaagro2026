// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Sprout,
  Droplets,
  Thermometer,
  Bug,
  BookOpen,
  DollarSign,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  RefreshCw,
  Sliders,
  Eye,
  X,
  Wind,
  Sun,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Flower2,
  FlaskConical,
  Leaf,
  Building,
  Warehouse,
} from 'lucide-react';
import {
  ProductionBatch,
  GreenhouseEnvironment,
  NurseryCrop,
  FertigationRecipe,
  PestDiseaseRecord,
  VisualNutritionalSymptom,
  NurseryCustomerOrder,
} from '../types/nursery';
import { OfflineImageDiagnosticModule } from './OfflineImageDiagnosticModule';
import { NurseryPestsDiseasesLibrary } from './NurseryPestsDiseasesLibrary';
import { NurseryNutritionalDiagnostic } from './NurseryNutritionalDiagnostic';
import { NurseryCropPhytoDetailModal } from './NurseryCropPhytoDetailModal';
import {
  nurseryCropsCatalog,
  initialProductionBatches,
  initialGreenhouses,
  fertigationRecipesCatalog,
  pestDiseaseRecordsData,
  visualNutritionalSymptomsGuide,
  initialCustomerOrders,
  initialNurseryFinancials,
} from '../data/nurseryData';

export type NurserySubTab =
  | 'gemeo_digital'
  | 'producao'
  | 'atlas_fitossanitario'
  | 'diagnostico_offline'
  | 'irrigacao'
  | 'ambiente'
  | 'fitossanitario'
  | 'nutricional'
  | 'comercial'
  | 'financeiro'
  | 'biblioteca';

interface NurseryModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: NurserySubTab) => void;
}

export const NurseryModule: React.FC<NurseryModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<NurserySubTab>('gemeo_digital');
  const activeSubTab = (externalSubTab as NurserySubTab) || internalSubTab;
  const setActiveSubTab = (tab: NurserySubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  // State Management with LocalStorage persistence
  const [batches, setBatches] = useState<ProductionBatch[]>(() => {
    try {
      const s = localStorage.getItem('geaagro_nursery_batches_v1');
      return s ? JSON.parse(s) : initialProductionBatches;
    } catch {
      return initialProductionBatches;
    }
  });

  const [greenhouses, setGreenhouses] = useState<GreenhouseEnvironment[]>(() => {
    try {
      const s = localStorage.getItem('geaagro_nursery_greenhouses_v1');
      return s ? JSON.parse(s) : initialGreenhouses;
    } catch {
      return initialGreenhouses;
    }
  });

  const [orders, setOrders] = useState<NurseryCustomerOrder[]>(() => {
    try {
      const s = localStorage.getItem('geaagro_nursery_orders_v1');
      return s ? JSON.parse(s) : initialCustomerOrders;
    } catch {
      return initialCustomerOrders;
    }
  });

  const [pestRecords, setPestRecords] = useState<PestDiseaseRecord[]>(() => {
    try {
      const s = localStorage.getItem('geaagro_nursery_pest_records_v1');
      return s ? JSON.parse(s) : pestDiseaseRecordsData;
    } catch {
      return pestDiseaseRecordsData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_nursery_batches_v1', JSON.stringify(batches));
    } catch (e) {
      console.error(e);
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_nursery_greenhouses_v1', JSON.stringify(greenhouses));
    } catch (e) {
      console.error(e);
    }
  }, [greenhouses]);

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_nursery_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_nursery_pest_records_v1', JSON.stringify(pestRecords));
    } catch (e) {
      console.error(e);
    }
  }, [pestRecords]);

  const [selectedCrop, setSelectedCrop] = useState<NurseryCrop>(() => nurseryCropsCatalog[0] || ({} as NurseryCrop));
  const [searchCropTerm, setSearchCropTerm] = useState('');
  const [cropCategoryFilter, setCropCategoryFilter] = useState<'todos' | 'hortalica' | 'frutifera' | 'florestal' | 'flor' | 'aromatica'>('todos');
  const [selectedPhytoCrop, setSelectedPhytoCrop] = useState<NurseryCrop | null>(null);
  
  // Fertigation Recipes Filter & Search State
  const [fertSearchTerm, setFertSearchTerm] = useState('');
  const [fertCategoryFilter, setFertCategoryFilter] = useState<string>('todas');
  
  // Selected Batch for Details Modal
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);

  // New Batch Modal Form State
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [newBatchCropId, setNewBatchCropId] = useState(() => nurseryCropsCatalog[0]?.id || '');
  const [newBatchCultivar, setNewBatchCultivar] = useState(() => nurseryCropsCatalog[0]?.cultivars?.[0] || '');
  const [newBatchTrayType, setNewBatchTrayType] = useState<'128' | '200' | '288' | '450' | 'tubete_55' | 'tubete_120'>('200');
  const [newBatchTrayCount, setNewBatchTrayCount] = useState(50);
  const [newBatchGreenhouse, setNewBatchGreenhouse] = useState(greenhouses[0]?.name || 'Estufa 01');
  const [newBatchBench, setNewBatchBench] = useState('Bancada H-01');
  const [newBatchSubstrate, setNewBatchSubstrate] = useState('Carolina Soil Padrão');
  const [newBatchEstimatedGerm, setNewBatchEstimatedGerm] = useState(95);

  // New Greenhouse Modal Form State
  const [isAddGreenhouseOpen, setIsAddGreenhouseOpen] = useState(false);
  const [newGhName, setNewGhName] = useState('');
  const [newGhType, setNewGhType] = useState<'hortalicas' | 'flores' | 'camara_germinacao' | 'silvicultura' | 'rustificacao'>('hortalicas');
  const [newGhCapacity, setNewGhCapacity] = useState(400);
  const [newGhTemp, setNewGhTemp] = useState(24.5);
  const [newGhHumidity, setNewGhHumidity] = useState(72);

  // New Order Modal Form State
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderCity, setNewOrderCity] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderCropName, setNewOrderCropName] = useState(nurseryCropsCatalog[0]?.name || 'Alface');
  const [newOrderBatchCode, setNewOrderBatchCode] = useState('');
  const [newOrderQuantity, setNewOrderQuantity] = useState(1000);
  const [newOrderTotalPrice, setNewOrderTotalPrice] = useState(250);
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState('');

  // New Pest Record Modal Form State
  const [isAddPestOpen, setIsAddPestOpen] = useState(false);
  const [newPestName, setNewPestName] = useState('');
  const [newPestBatchCode, setNewPestBatchCode] = useState('');
  const [newPestGreenhouse, setNewPestGreenhouse] = useState('');
  const [newPestType, setNewPestType] = useState<'praga' | 'fungo' | 'bacteria' | 'virus' | 'nutricional'>('praga');
  const [newPestSeverity, setNewPestSeverity] = useState<'baixa' | 'moderada' | 'alta' | 'critica'>('baixa');
  const [newPestTreatment, setNewPestTreatment] = useState('');
  const [newPestControlType, setNewPestControlType] = useState<'biologico' | 'quimico' | 'cultural' | 'fisico'>('biologico');
  const [newPestTech, setNewPestTech] = useState('Eng. Agrônomo');

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Aggregated KPIs for Digital Twin
  const totalPlantsInProduction = useMemo(() => {
    return batches
      .filter(b => b.status !== 'entregue')
      .reduce((sum, b) => sum + (b.estimatedReadyPlants || b.totalSeedsSown * (b.germinationRatePercent / 100)), 0);
  }, [batches]);

  const activeBatchesCount = useMemo(() => {
    return batches.filter(b => b.status !== 'entregue').length;
  }, [batches]);

  const avgGerminationRate = useMemo(() => {
    if (batches.length === 0) return 0;
    const sum = batches.reduce((acc, b) => acc + b.germinationRatePercent, 0);
    return (sum / batches.length).toFixed(1);
  }, [batches]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'em_producao' || o.status === 'reservado').length;
  }, [orders]);

  const totalOccupiedTrays = useMemo(() => {
    return greenhouses.reduce((sum, g) => sum + g.currentOccupiedTrays, 0);
  }, [greenhouses]);

  const totalCapacityTrays = useMemo(() => {
    return greenhouses.reduce((sum, g) => sum + g.totalCapacityTrays, 0);
  }, [greenhouses]);

  const capacityOccupancyPercent = useMemo(() => {
    if (totalCapacityTrays === 0) return 0;
    return Math.round((totalOccupiedTrays / totalCapacityTrays) * 100);
  }, [totalOccupiedTrays, totalCapacityTrays]);

  // Operational alerts calculated dynamically
  const activeAlerts = useMemo(() => {
    const list: { id: string; title: string; desc: string; type: 'warning' | 'critical' | 'info' }[] = [];
    greenhouses.forEach(gh => {
      if (gh.currentTemp > 31) {
        list.push({
          id: `gh-temp-${gh.id}`,
          title: `${gh.name} - Temperatura Elevada (${gh.currentTemp}°C)`,
          desc: `VPD em ${gh.currentVpdKpa} kPa. Verificar nebulização e ventilação.`,
          type: 'critical',
        });
      }
      gh.alerts?.forEach((a, idx) => {
        list.push({
          id: `gh-alert-${gh.id}-${idx}`,
          title: gh.name,
          desc: a.message,
          type: a.severity as any,
        });
      });
    });
    batches.forEach(b => {
      if (b.germinationRatePercent < 80 && b.status !== 'entregue') {
        list.push({
          id: `b-germ-${b.id}`,
          title: `Lote ${b.batchCode} (${b.cropName}) - Baixa germinação`,
          desc: `Taxa em ${b.germinationRatePercent}%. Verificar microaspersores e lote de sementes.`,
          type: 'warning',
        });
      }
    });
    return list;
  }, [greenhouses, batches]);

  // Filtered Fertigation Recipes
  const filteredFertRecipes = useMemo(() => {
    return fertigationRecipesCatalog.filter(rec => {
      const q = fertSearchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        rec.name.toLowerCase().includes(q) ||
        rec.npkRatio.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        (rec.cropCategory && rec.cropCategory.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (fertCategoryFilter === 'todas') return true;
      if (fertCategoryFilter === 'enraizamento') return rec.stage === 'semeadura_enraizamento';
      if (fertCategoryFilter === 'vegetativo') return rec.stage === 'desenvolvimento_vegetativo';
      if (fertCategoryFilter === 'aclimatacao') return rec.stage === 'aclimatacao_rustificacao';
      if (fertCategoryFilter === 'solanaceas_cucurbitaceas') return rec.stage === 'solanaceas_cucurbitaceas';
      if (fertCategoryFilter === 'frutiferas_cafe') return rec.stage === 'frutiferas_cafe';
      if (fertCategoryFilter === 'clonagem_silvicultura') return rec.stage === 'clonagem_silvicultura';
      if (fertCategoryFilter === 'flores_ervas') return rec.stage === 'florescimento' || rec.stage === 'ervas_aromaticas';
      if (fertCategoryFilter === 'hidroponia_floating') return rec.stage === 'hidroponia_floating';
      if (fertCategoryFilter === 'brassicas') return rec.stage === 'brassicas_folhosas';
      return true;
    });
  }, [fertSearchTerm, fertCategoryFilter]);

  // Handle Add New Batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const crop = nurseryCropsCatalog.find(c => c.id === newBatchCropId) || nurseryCropsCatalog[0];
    const cellsPerTrayMap: Record<string, number> = {
      '128': 128,
      '200': 200,
      '288': 288,
      '450': 450,
      'tubete_55': 54,
      'tubete_120': 40,
    };
    const cellsPerTray = cellsPerTrayMap[newBatchTrayType] || 200;
    const totalSeeds = newBatchTrayCount * cellsPerTray;
    const germDecimal = newBatchEstimatedGerm / 100;
    const lossDecimal = 0.03; // 3% padrão
    const readyEstimated = Math.round(totalSeeds * germDecimal * (1 - lossDecimal));

    const today = new Date().toISOString().split('T')[0];
    const germDays = crop.germinationDaysMax || 4;
    const cycleDays = crop.nurseryCycleDaysMax || 28;

    const germDate = new Date(Date.now() + germDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const readyDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      batchCode: `LOTE-${Math.floor(265 + Math.random() * 800)}`,
      cropId: crop.id,
      cropName: crop.name,
      cultivar: newBatchCultivar,
      trayType: newBatchTrayType,
      trayCount: newBatchTrayCount,
      cellsPerTray,
      totalSeedsSown: totalSeeds,
      sowingDate: today,
      expectedGerminationDate: germDate,
      expectedReadyDate: readyDate,
      greenhouse: newBatchGreenhouse,
      benchLocation: newBatchBench,
      germinationRatePercent: newBatchEstimatedGerm,
      lossRatePercent: 3.0,
      estimatedReadyPlants: readyEstimated,
      reservedPlants: 0,
      availableForSalePlants: readyEstimated,
      status: 'semeadura',
      unitCostBrl: crop.category === 'flor' ? 0.35 : 0.08,
      unitSellingPriceBrl: crop.category === 'flor' ? 0.90 : 0.22,
      substrateType: newBatchSubstrate,
      seedLotNumber: `SEM-${crop.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      irrigationHistory: [],
      sanitaryHistory: [],
      nutritionalHistory: [],
      notes: 'Lote recém-semeado no viveiro.',
    };

    setBatches(prev => [newBatch, ...prev]);
    setIsAddBatchOpen(false);
    showNotification(`Lote ${newBatch.batchCode} (${crop.name} - ${newBatch.totalSeedsSown.toLocaleString('pt-BR')} mudas) cadastrado com sucesso!`);
  };

  // Handle Add New Greenhouse
  const handleCreateGreenhouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGhName.trim()) return;
    const newGh: GreenhouseEnvironment = {
      id: `gh-${Date.now()}`,
      name: newGhName.trim(),
      type: newGhType,
      totalCapacityTrays: Number(newGhCapacity) || 100,
      currentOccupiedTrays: 0,
      activeBatchesCount: 0,
      currentTemp: Number(newGhTemp) || 24.0,
      currentHumidity: Number(newGhHumidity) || 70,
      currentLux: 42000,
      currentVpdKpa: 0.95,
      ventilationStatus: 'aberto_50',
      foggingStatus: 'inativo',
      shadingScreenStatus: 'aberto',
      alerts: [],
    };
    setGreenhouses(prev => [...prev, newGh]);
    setIsAddGreenhouseOpen(false);
    setNewGhName('');
    showNotification(`Estufa "${newGh.name}" cadastrada com sucesso!`);
  };

  // Handle Add New Order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer.trim()) return;
    const qty = Number(newOrderQuantity) || 500;
    const tot = Number(newOrderTotalPrice) || 150;
    const unitPrice = qty > 0 ? tot / qty : 0.3;
    const newOrd: NurseryCustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrderCustomer.trim(),
      customerPhone: newOrderPhone.trim() || '(00) 00000-0000',
      customerCity: newOrderCity.trim() || 'Região Local',
      cropName: newOrderCropName,
      cultivar: '',
      reservedBatchCode: newOrderBatchCode.trim() || (batches[0]?.batchCode || 'A Definir'),
      quantityPlants: qty,
      unitPriceBrl: unitPrice,
      totalPriceBrl: tot,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDateTarget: newOrderDeliveryDate || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      status: 'em_producao',
      paymentStatus: 'pendente',
      deliveryMode: 'retirada_viveiro',
    };
    setOrders(prev => [newOrd, ...prev]);
    setIsAddOrderOpen(false);
    setNewOrderCustomer('');
    setNewOrderCity('');
    setNewOrderPhone('');
    showNotification(`Pedido ${newOrd.orderNumber} para "${newOrd.customerName}" criado com sucesso!`);
  };

  // Handle Add New Pest Record
  const handleCreatePestRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPestName.trim()) return;
    const newRecord: PestDiseaseRecord = {
      id: `pest-${Date.now()}`,
      batchId: batches[0]?.id || 'lote-geral',
      detectionDate: new Date().toISOString().split('T')[0],
      batchCode: newPestBatchCode.trim() || (batches[0]?.batchCode || 'Geral'),
      greenhouse: newPestGreenhouse.trim() || (greenhouses[0]?.name || 'Geral'),
      pestOrDiseaseName: newPestName.trim(),
      type: newPestType === 'nutricional' ? 'fisiopatia' : newPestType,
      severity: newPestSeverity === 'critica' || newPestSeverity === 'alta' ? 'severo' : newPestSeverity === 'moderada' ? 'moderado' : 'baixo',
      treatmentApplied: newPestTreatment.trim() || 'Monitoramento preventivo com armadilha amarela.',
      controlType: newPestControlType,
      responsibleTechnician: newPestTech.trim() || 'Eng. Agrônomo',
      status: 'em_tratamento',
    };
    setPestRecords(prev => [newRecord, ...prev]);
    setIsAddPestOpen(false);
    setNewPestName('');
    setNewPestTreatment('');
    showNotification(`Registro sanitário de "${newRecord.pestOrDiseaseName}" incluído com sucesso!`);
  };

  // Dynamic Financials
  const financialTotals = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + (o.totalPriceBrl || 0), 0);
    const cost = batches.reduce((sum, b) => sum + (b.totalSeedsSown * (b.unitCostBrl || 0.08)), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
    const totalPlantsSold = orders.reduce((sum, o) => sum + (o.quantityPlants || 0), 0);
    return { revenue, cost, profit, margin, totalPlantsSold };
  }, [orders, batches]);

  // Water consumption dynamic
  const todayWaterLiters = useMemo(() => {
    if (totalPlantsInProduction === 0) return 0;
    return Math.round(totalPlantsInProduction * 0.0243);
  }, [totalPlantsInProduction]);

  // Filtered Crops for Library
  const filteredCrops = useMemo(() => {
    return nurseryCropsCatalog.filter(c => {
      const q = searchCropTerm.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.scientificName.toLowerCase().includes(q) ||
        c.cultivars.some(cv => cv.toLowerCase().includes(q)) ||
        (c.mainPests || []).some(p => p.toLowerCase().includes(q)) ||
        (c.mainDiseases || []).some(d => d.toLowerCase().includes(q)) ||
        (c.detailedPestsAndDiseases || []).some(
          dp =>
            dp.name.toLowerCase().includes(q) ||
            dp.scientificName.toLowerCase().includes(q) ||
            dp.activeIngredients.some(
              ai =>
                ai.name.toLowerCase().includes(q) ||
                ai.chemicalGroup.toLowerCase().includes(q) ||
                ai.commercialProducts.some(cp => cp.toLowerCase().includes(q))
            )
        );
      const matchCategory = cropCategoryFilter === 'todos' || c.category === cropCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [searchCropTerm, cropCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-zinc-950 text-white rounded-xl p-5 sm:p-6 shadow-sm border border-emerald-700/50 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-emerald-200/70 text-xs font-medium">Hortaliças & Flores Profissionais</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              Produção de Mudas & Gêmeo Digital
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Plataforma agronômica integrada para viveiristas: controle de lotes, fertirrigação com CE/pH, estufas inteligentes, diagnose nutricional e gestão comercial.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setIsAddBatchOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Lote de Produção
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* SUBTAB 1: GÊMEO DIGITAL & DASHBOARD */}
      {activeSubTab === 'gemeo_digital' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main 4 KPIs as requested */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mudas em Produção
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalPlantsInProduction.toLocaleString('pt-BR')}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{activeBatchesCount} {activeBatchesCount === 1 ? 'lote em andamento' : 'lotes em andamento'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Lotes Ativos
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {activeBatchesCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {greenhouses.length} {greenhouses.length === 1 ? 'estufa cadastrada' : 'estufas cadastradas'}
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Germinação Média
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {batches.length > 0 ? `${avgGerminationRate}%` : '-'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {batches.length > 0 ? 'Média ponderada dos lotes' : 'Nenhum lote ativo'}
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Pedidos Pendentes
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {pendingOrdersCount}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                {orders.length} {orders.length === 1 ? 'pedido total' : 'pedidos totais'}
              </p>
            </div>
          </div>

          {/* Operational Alerts */}
          {activeAlerts.length > 0 ? (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-200">
                  Alertas Operacionais do Viveiro ({activeAlerts.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeAlerts.map(alt => (
                  <div
                    key={alt.id}
                    className={`bg-white dark:bg-black border p-3 rounded-lg flex items-start gap-2.5 ${
                      alt.type === 'critical'
                        ? 'border-red-300 dark:border-red-900/50'
                        : 'border-amber-200 dark:border-amber-900/50'
                    }`}
                  >
                    <span className="text-base">{alt.type === 'critical' ? '🔴' : '⚠️'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {alt.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {alt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  Nenhum alerta operacional crítico. Todas as estruturas e lotes operando dentro dos padrões agronômicos.
                </p>
              </div>
            </div>
          )}

          {/* Greenhouse Digital Twin Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gêmeo Digital das Estufas & Capacidade Ocupada ({capacityOccupancyPercent}%)
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {totalOccupiedTrays} / {totalCapacityTrays} bandejas instaladas
                </span>
                <button
                  onClick={() => setIsAddGreenhouseOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Estufa
                </button>
              </div>
            </div>

            {greenhouses.length === 0 ? (
              <div className="bg-slate-50/80 dark:bg-zinc-900/40 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-8 text-center">
                <Building className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Nenhuma estufa cadastrada</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Cadastre suas estufas ou módulos de cultivo para monitorar sensores de temperatura, umidade, VPD e ocupação de bandejas.
                </p>
                <button
                  onClick={() => setIsAddGreenhouseOpen(true)}
                  className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeira Estufa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {greenhouses.map(gh => {
                  const occupancy = gh.totalCapacityTrays > 0 ? Math.round((gh.currentOccupiedTrays / gh.totalCapacityTrays) * 100) : 0;
                  const isHot = gh.currentTemp > 30;
                  return (
                    <div
                      key={gh.id}
                      className={`bg-white dark:bg-black border rounded-xl p-4 shadow-2xs flex flex-col justify-between ${
                        isHot
                          ? 'border-amber-400 dark:border-amber-800'
                          : 'border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 leading-snug">
                            {gh.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              gh.foggingStatus === 'ativo'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {gh.foggingStatus === 'ativo' ? 'Fog Ativo' : 'Clima Estável'}
                          </span>
                        </div>

                        {/* Environmental Sensors */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Temperatura</span>
                            <span className={`text-sm font-bold ${isHot ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                              {gh.currentTemp}°C
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Umidade Rel.</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                              {gh.currentHumidity}%
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">VPD (Déficit)</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                              {gh.currentVpdKpa} kPa
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Luminosidade</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                              {(gh.currentLux / 1000).toFixed(0)}k Lux
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Occupancy Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                          <span>Ocupação</span>
                          <span>{gh.currentOccupiedTrays} / {gh.totalCapacityTrays} ({occupancy}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancy > 90
                                ? 'bg-amber-500'
                                : 'bg-emerald-600 dark:bg-emerald-400'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Navigation Cards as requested */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {[
              { id: 'producao', label: '🌱 Produção', desc: 'Lotes e Semeadura' },
              { id: 'diagnostico_offline', label: '🔍 Diagnóstico', desc: 'Sem IA' },
              { id: 'irrigacao', label: '💧 Irrigação', desc: 'Programação de Rega' },
              { id: 'irrigacao', label: '🧪 Fertirrigação', desc: 'Receitas CE/pH' },
              { id: 'fitossanitario', label: '🦠 Sanidade', desc: 'Manejo MIP' },
              { id: 'comercial', label: '📦 Estoque', desc: 'Mudas Prontas' },
              { id: 'financeiro', label: '💰 Financeiro', desc: 'Custos e Margem' },
              { id: 'comercial', label: '🚚 Entregas', desc: 'Roteiro de Envio' },
              { id: 'biblioteca', label: '📚 Biblioteca', desc: '15 Culturas' },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSubTab(btn.id as any)}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 p-3 rounded-xl text-left transition-all hover:shadow-sm cursor-pointer"
              >
                <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-100 leading-tight">
                  {btn.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                  {btn.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: LOTES DE PRODUÇÃO */}
      {activeSubTab === 'producao' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Controle de Lotes de Produção & Semeadura
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Acompanhamento diário da semeadura, germinação, perdas e estimativa automática de mudas disponíveis.
                </p>
              </div>

              <button
                onClick={() => setIsAddBatchOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Lote
              </button>
            </div>

            {/* Batches Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Lote / Cultura</th>
                    <th className="py-2.5 px-3">Bandeja / Semeadura</th>
                    <th className="py-2.5 px-3 text-center">Germinação</th>
                    <th className="py-2.5 px-3 text-center">Perdas</th>
                    <th className="py-2.5 px-3 text-right">Mudas Prontas (Est.)</th>
                    <th className="py-2.5 px-3 text-right">Disponíveis</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-zinc-400">
                        <Sprout className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhum lote de produção cadastrado</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Clique em "Cadastrar Lote" para registrar a semeadura de mudas.</p>
                      </td>
                    </tr>
                  ) : (
                    batches.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-zinc-100">{b.batchCode}</div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{b.cropName} - {b.cultivar}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">{b.greenhouse} ({b.benchLocation})</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-700 dark:text-zinc-300">{b.trayCount} bandejas ({b.trayType} cél.)</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">Semeadura: {b.sowingDate}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">Previsão: {b.expectedReadyDate}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              b.germinationRatePercent < 80
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {b.germinationRatePercent}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400 font-medium">
                          {b.lossRatePercent}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                          {b.estimatedReadyPlants.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {b.availableForSalePlants.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'pronto_expedicao'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : b.status === 'aclimatacao'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : b.status === 'desenvolvimento'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedBatch(b)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline p-1 cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2.2: ATLAS & BIBLIOTECA DE PRAGAS E DOENÇAS (FOTOS REAIS 100% OFFLINE) */}
      {activeSubTab === 'atlas_fitossanitario' && (
        <div className="animate-fade-in">
          <NurseryPestsDiseasesLibrary onNavigateToDiagnostic={() => setActiveSubTab('diagnostico_offline')} />
        </div>
      )}

      {/* SUBTAB 2.5: DIAGNÓSTICO VISUAL OFFLINE (SEM IA / BANCO LOCAL) */}
      {activeSubTab === 'diagnostico_offline' && (
        <div className="animate-fade-in">
          <OfflineImageDiagnosticModule />
        </div>
      )}

      {/* SUBTAB 3: IRRIGAÇÃO & FERTIRRIGAÇÃO */}
      {activeSubTab === 'irrigacao' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Consumo de Água Estimado
              </span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {batches.length > 0 ? `${todayWaterLiters.toLocaleString('pt-BR')} L` : '0 Litros'}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {batches.length > 0 ? `Baseado em ${totalPlantsInProduction.toLocaleString('pt-BR')} mudas ativas` : 'Nenhum lote ativo em produção'}
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Condutividade Elétrica Alvo
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                1.2 - 1.6 mS/cm
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Monitorado via condutivímetro digital
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                pH da Solução Nutritiva
              </span>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                5.8 - 6.2
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Acidificação com Ácido Fosfórico / Nítrico
              </p>
            </div>
          </div>

          {/* Fertigation Recipes */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Receitas de Fertirrigação Cadastradas & Concentrações Alvo
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Formulações nutricionais de alta precisão balanceadas por fase fenológica e cultura ({filteredFertRecipes.length} de {fertigationRecipesCatalog.length} receitas)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar receita, cultura, NPK..."
                  value={fertSearchTerm}
                  onChange={e => setFertSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {fertSearchTerm && (
                  <button
                    onClick={() => setFertSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {[
                { id: 'todas', label: 'Todas as Fases', count: fertigationRecipesCatalog.length },
                { id: 'enraizamento', label: '🌱 Semeadura & Enraizamento', count: fertigationRecipesCatalog.filter(r => r.stage === 'semeadura_enraizamento').length },
                { id: 'vegetativo', label: '🥬 Folhosas & Vegetativo', count: fertigationRecipesCatalog.filter(r => r.stage === 'desenvolvimento_vegetativo').length },
                { id: 'solanaceas_cucurbitaceas', label: '🍅 Solanáceas & Cucurbitáceas', count: fertigationRecipesCatalog.filter(r => r.stage === 'solanaceas_cucurbitaceas').length },
                { id: 'brassicas', label: '🥦 Brássicas (Anti-Talo Oco)', count: fertigationRecipesCatalog.filter(r => r.stage === 'brassicas_folhosas').length },
                { id: 'frutiferas_cafe', label: '☕ Frutíferas & Café', count: fertigationRecipesCatalog.filter(r => r.stage === 'frutiferas_cafe').length },
                { id: 'clonagem_silvicultura', label: '🌲 Silvicultura & Clones', count: fertigationRecipesCatalog.filter(r => r.stage === 'clonagem_silvicultura').length },
                { id: 'flores_ervas', label: '🌸 Flores & Aromáticas', count: fertigationRecipesCatalog.filter(r => r.stage === 'florescimento' || r.stage === 'ervas_aromaticas').length },
                { id: 'hidroponia_floating', label: '🌊 Hidroponia & Floating', count: fertigationRecipesCatalog.filter(r => r.stage === 'hidroponia_floating').length },
                { id: 'aclimatacao', label: '☀️ Rustificação (Pré-Venda)', count: fertigationRecipesCatalog.filter(r => r.stage === 'aclimatacao_rustificacao').length },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFertCategoryFilter(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    fertCategoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Recipes Grid */}
            {filteredFertRecipes.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                <Droplets className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Nenhuma receita encontrada para os filtros selecionados.</p>
                <button
                  onClick={() => { setFertSearchTerm(''); setFertCategoryFilter('todas'); }}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 underline font-medium"
                >
                  Limpar filtros de busca
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFertRecipes.map(rec => (
                  <div
                    key={rec.id}
                    className="bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {rec.cropCategory && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-sm">
                                {rec.cropCategory}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded-sm">
                              {rec.stage.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                            {rec.name}
                          </h4>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                            NPK Alvo: {rec.npkRatio}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md block">
                            CE {rec.targetEC} mS/cm
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mt-1">
                            pH {rec.targetPh}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="bg-white dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Dose de Preparo:</span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">{rec.preparationDoseGPer100L} g / 100 L de água</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Frequência / Aplicação:</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-right">{rec.frequency}</span>
                        </div>
                      </div>

                      {/* Compatibility / Technical Notes if any */}
                      {rec.compatibilityNotes && (
                        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-2 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">{rec.compatibilityNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Nutrient balance in PPM */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 flex justify-between items-center">
                        <span>Aporte de Elementos (mg/L ou ppm)</span>
                        <button
                          onClick={() => showNotification(`Receita "${rec.name}" copiada: Dose de ${rec.preparationDoseGPer100L}g/100L | CE ${rec.targetEC} | pH ${rec.targetPh}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold lowercase tracking-normal text-[10px]"
                        >
                          copiar parâmetros
                        </button>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-[10px] text-center font-mono">
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">N</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.n}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">P</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.p}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">K</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.k}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">Ca</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.ca}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">Mg</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.mg}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">S</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.s}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">Fe</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.fe}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">B</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.b}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">Zn</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.zn}</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-[9px] text-slate-400 block">Mn</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{rec.elementsPpm.mn ?? '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: AMBIENTE PROTEGIDO & ESTUFAS */}
      {activeSubTab === 'ambiente' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-amber-500" />
                  Monitoramento Climático & Automação de Estufas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Controle de temperatura, umidade relativa, déficit de pressão de vapor (VPD) e atuadores.
                </p>
              </div>
              <button
                onClick={() => setIsAddGreenhouseOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Estufa
              </button>
            </div>

            {greenhouses.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                <Warehouse className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhuma estufa cadastrada</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Clique em "Cadastrar Estufa" para monitorar sensores e automatismos climáticos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {greenhouses.map(gh => (
                  <div
                    key={gh.id}
                    className="bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {gh.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {gh.activeBatchesCount} lotes em andamento
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                        Sensores Online
                      </span>
                    </div>

                    {/* Sensor Gauges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Temperatura</span>
                        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">{gh.currentTemp}°C</span>
                      </div>
                      <div className="bg-white dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Umidade</span>
                        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">{gh.currentHumidity}%</span>
                      </div>
                      <div className="bg-white dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">VPD</span>
                        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">{gh.currentVpdKpa} kPa</span>
                      </div>
                      <div className="bg-white dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Luminosidade</span>
                        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">{(gh.currentLux / 1000).toFixed(0)}k Lux</span>
                      </div>
                    </div>

                    {/* Actuators Control Status */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-slate-400" />
                          Cortinas de Ventilação:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {gh.ventilationStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          Sistema de Nebulização (Fog):
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {gh.foggingStatus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          Tela Termorrefletora (Aluminet):
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {gh.shadingScreenStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: FITOSSANITÁRIO (MIP) */}
      {activeSubTab === 'fitossanitario' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Atlas Card Banner */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Atlas & Biblioteca de Doenças e Pragas</h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Consulte fotos reais de campo, diagnose diferencial, condições favoráveis e produtos para controle.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('atlas_fitossanitario')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Bug className="w-3.5 h-3.5" />
              Explorar Atlas com Fotos Reais
            </button>
          </div>

          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Manejo Integrado de Pragas & Doenças (MIP Viveiro)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Monitoramento preventivo, armadilhas adesivas e controle biológico prioritário.
                </p>
              </div>
              <button
                onClick={() => setIsAddPestOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Ocorrência
              </button>
            </div>

            {pestRecords.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                <ShieldCheck className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhuma ocorrência fitossanitária registrada</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Viveiro livre de infestações ativas. Clique em "Registrar Ocorrência" para novos monitoramentos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pestRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {rec.pestOrDiseaseName}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          {rec.controlType}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Status: {rec.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">
                        <strong className="font-medium text-slate-700 dark:text-zinc-200">Tratamento:</strong> {rec.treatmentApplied}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                        <span>Lote: {rec.batchCode} ({rec.greenhouse})</span>
                        <span>• Data: {rec.detectionDate}</span>
                        <span>• Resp.: {rec.responsibleTechnician}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 6: NUTRICIONAL & SINTOMAS VISUAIS (100% OFFLINE FOTOGRÁFICO) */}
      {activeSubTab === 'nutricional' && (
        <NurseryNutritionalDiagnostic />
      )}

      {/* SUBTAB 7: COMERCIAL & PEDIDOS */}
      {activeSubTab === 'comercial' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Carteira de Clientes, Reservas & Pedidos Futuros
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Gerenciamento de entregas programadas e vinculação direta aos lotes de produção.
                </p>
              </div>
              <button
                onClick={() => setIsAddOrderOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Pedido / Reserva
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Pedido / Cliente</th>
                    <th className="py-2.5 px-3">Cultura / Lote Vinculado</th>
                    <th className="py-2.5 px-3 text-right">Qtd. Mudas</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-center">Data Entrega</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 dark:text-zinc-400">
                        <Package className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhum pedido ou reserva registrado</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Clique em "Novo Pedido / Reserva" para registrar vendas de mudas.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-zinc-100">{o.orderNumber}</div>
                          <div className="text-slate-700 dark:text-zinc-300 font-medium">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">{o.customerCity} • {o.customerPhone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-400">{o.cropName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">Lote Reservado: {o.reservedBatchCode}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                          {o.quantityPlants.toLocaleString('pt-BR')} un
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                          R$ {o.totalPriceBrl.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-zinc-300">
                          {o.deliveryDateTarget}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              o.status === 'pronto'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: FINANCEIRO & CUSTOS POR LOTE */}
      {activeSubTab === 'financeiro' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Faturamento Bruto Projetado
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                R$ {financialTotals.projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {orders.length} pedidos e reservas ativas
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Custos Operacionais Estimados
              </span>
              <div className="text-2xl font-bold text-slate-800 dark:text-zinc-200 mt-1">
                R$ {financialTotals.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Custo direto de insumos dos lotes em produção
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Resultado Operacional Estimado
              </span>
              <div className={`text-2xl font-bold mt-1 ${financialTotals.netProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500'}`}>
                R$ {financialTotals.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Margem: {financialTotals.marginPercent}%
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Composição Média de Custos na Produção de Mudas
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Sementes</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">37.5%</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Substrato</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">22.4%</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Mão de Obra</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">16.2%</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Fertilizantes</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">10.5%</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Bandejas/Emb.</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">7.9%</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Energia / Água</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">5.5%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: BIBLIOTECA TÉCNICA (32+ CULTURAS) */}
      {activeSubTab === 'biblioteca' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Base de Conhecimento Especializada
                  </span>
                  <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    {nurseryCropsCatalog.length} Culturas Mapeadas
                  </span>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  Biblioteca Técnica Agronômica para Viveiristas ({nurseryCropsCatalog.length} Culturas)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  Catálogo técnico completo para produção de mudas: germinação, bandejas, ambiente climático, condutividade elétrica, pH, além da <strong>lista completa de pragas e doenças com os princípios ativos químicos autorizados e controle biológico</strong>.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar cultura, praga, doença ou princípio ativo..."
                    value={searchCropTerm}
                    onChange={e => setSearchCropTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none w-full sm:w-64"
                  />
                </div>

                <select
                  value={cropCategoryFilter}
                  onChange={e => setCropCategoryFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="todos">Todas as Categorias ({nurseryCropsCatalog.length})</option>
                  <option value="hortalica">🥬 Hortaliças & Folhosas</option>
                  <option value="frutifera">🍎 Frutíferas & Perenes</option>
                  <option value="florestal">🌲 Florestais & Silvicultura</option>
                  <option value="flor">🌸 Flores & Ornamentais</option>
                  <option value="aromatica">🌿 Aromáticas & Medicinais</option>
                </select>
              </div>
            </div>

            {/* Category summary pills */}
            <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
              {[
                { id: 'todos', label: 'Todas as Culturas', count: nurseryCropsCatalog.length },
                { id: 'hortalica', label: 'Hortaliças', count: nurseryCropsCatalog.filter(c => c.category === 'hortalica').length },
                { id: 'frutifera', label: 'Frutíferas', count: nurseryCropsCatalog.filter(c => c.category === 'frutifera').length },
                { id: 'florestal', label: 'Florestais', count: nurseryCropsCatalog.filter(c => c.category === 'florestal').length },
                { id: 'flor', label: 'Flores', count: nurseryCropsCatalog.filter(c => c.category === 'flor').length },
                { id: 'aromatica', label: 'Aromáticas', count: nurseryCropsCatalog.filter(c => c.category === 'aromatica').length },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCropCategoryFilter(cat.id as any)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    cropCategoryFilter === cat.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCrops.map(crop => {
                const phytoCount = (crop.detailedPestsAndDiseases || []).length;
                return (
                  <div
                    key={crop.id}
                    className="bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {crop.category === 'flor' ? (
                              <Flower2 className="w-4 h-4 text-pink-500 shrink-0" />
                            ) : crop.category === 'florestal' ? (
                              <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
                            ) : crop.category === 'frutifera' ? (
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {crop.name}
                          </h4>
                          <p className="text-[11px] italic text-slate-500 dark:text-zinc-400">
                            {crop.scientificName}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            crop.category === 'flor'
                              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300'
                              : crop.category === 'frutifera'
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                              : crop.category === 'florestal'
                              ? 'bg-lime-100 dark:bg-lime-950/70 text-lime-800 dark:text-lime-300'
                              : crop.category === 'aromatica'
                              ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {crop.category}
                        </span>
                      </div>

                      {/* Quick Specs */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                        <div className="bg-white dark:bg-black p-2 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Germinação</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {crop.germinationDaysMin} a {crop.germinationDaysMax} dias
                          </span>
                        </div>
                        <div className="bg-white dark:bg-black p-2 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Tempo Viveiro</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {crop.nurseryCycleDaysMin} a {crop.nurseryCycleDaysMax} dias
                          </span>
                        </div>
                        <div className="bg-white dark:bg-black p-2 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Temp. Ideal</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {crop.idealTempMin}°C a {crop.idealTempMax}°C
                          </span>
                        </div>
                        <div className="bg-white dark:bg-black p-2 rounded border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">CE / pH Ideal</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {crop.idealECMin}-{crop.idealECMax} mS | pH {crop.idealPhMin}-{crop.idealPhMax}
                          </span>
                        </div>
                      </div>

                      {/* Cultivars */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                          Cultivares Cadastrados:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {crop.cultivars.map((cv, i) => (
                            <span
                              key={i}
                              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-1.5 py-0.5 rounded"
                            >
                              {cv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pests & Diseases Overview */}
                      <div className="mt-2.5 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
                        <div>
                          <strong className="text-slate-800 dark:text-zinc-200">Pragas Principais:</strong>{' '}
                          {(crop.mainPests || []).join(', ')}
                        </div>
                        <div>
                          <strong className="text-slate-800 dark:text-zinc-200">Doenças Principais:</strong>{' '}
                          {(crop.mainDiseases || []).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Phytosanitary Guide Button with Active Ingredients */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-2 rounded-lg text-[10px] text-emerald-950 dark:text-emerald-300">
                        <strong>Dica de Aclimatação:</strong> {crop.hardeningTips}
                      </div>

                      <button
                        onClick={() => setSelectedPhytoCrop(crop)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        Guia Fitossanitário & Princípios Ativos {phytoCount > 0 ? `(${phytoCount})` : ''}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PRODUCTION BATCH */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Cadastrar Novo Lote de Mudas
              </h3>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Espécie / Cultura
                  </label>
                  <select
                    value={newBatchCropId}
                    onChange={e => {
                      const cId = e.target.value;
                      setNewBatchCropId(cId);
                      const sel = nurseryCropsCatalog.find(c => c.id === cId);
                      if (sel && sel.cultivars[0]) {
                        setNewBatchCultivar(sel.cultivars[0]);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 font-medium text-slate-800 dark:text-zinc-100"
                  >
                    {nurseryCropsCatalog.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Cultivar
                  </label>
                  <input
                    type="text"
                    value={newBatchCultivar}
                    onChange={e => setNewBatchCultivar(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Tipo de Bandeja
                  </label>
                  <select
                    value={newBatchTrayType}
                    onChange={e => setNewBatchTrayType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="128">128 células (Solanáceas / Cucurbitáceas)</option>
                    <option value="200">200 células (Folhosas / Brassicas)</option>
                    <option value="288">288 células (Flores micropeletizadas)</option>
                    <option value="450">450 células (Tabaco / Eucalipto)</option>
                    <option value="tubete_55">Tubetes 55 cm³</option>
                    <option value="tubete_120">Tubetes 120 cm³</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Qtd. de Bandejas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBatchTrayCount}
                    onChange={e => setNewBatchTrayCount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Estufa de Destino
                  </label>
                  <select
                    value={newBatchGreenhouse}
                    onChange={e => setNewBatchGreenhouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    {greenhouses.map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Bancada
                  </label>
                  <input
                    type="text"
                    value={newBatchBench}
                    onChange={e => setNewBatchBench(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Substrato Utilizado
                  </label>
                  <input
                    type="text"
                    value={newBatchSubstrate}
                    onChange={e => setNewBatchSubstrate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Germinação Estimada (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newBatchEstimatedGerm}
                    onChange={e => setNewBatchEstimatedGerm(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">Cálculo Automático:</span>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  Total de sementes semeadas: {(newBatchTrayCount * (newBatchTrayType === '128' ? 128 : newBatchTrayType === '288' ? 288 : 200)).toLocaleString('pt-BR')} mudas potenciais.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Criar Lote de Produção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BATCH DETAILS */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  Prontuário do Lote
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {selectedBatch.batchCode} - {selectedBatch.cropName} ({selectedBatch.cultivar})
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Semeadura</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedBatch.sowingDate}</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Previsão Pronta</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedBatch.expectedReadyDate}</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Mudas Prontas (Est.)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedBatch.estimatedReadyPlants.toLocaleString('pt-BR')} un
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Disponível p/ Venda</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {selectedBatch.availableForSalePlants.toLocaleString('pt-BR')} un
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Localização:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedBatch.greenhouse} - {selectedBatch.benchLocation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Lote da Semente:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedBatch.seedLotNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Substrato:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedBatch.substrateType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Custo / Preço Unitário:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  R$ {selectedBatch.unitCostBrl.toFixed(2)} / R$ {selectedBatch.unitSellingPriceBrl.toFixed(2)}
                </span>
              </div>
            </div>

            {selectedBatch.notes && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg text-xs text-amber-950 dark:text-amber-200">
                <strong>Observações:</strong> {selectedBatch.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FITOSSANITÁRIO DETALHADO & PRINCÍPIOS ATIVOS POR CULTURA */}
      {selectedPhytoCrop && (
        <NurseryCropPhytoDetailModal
          crop={selectedPhytoCrop}
          onClose={() => setSelectedPhytoCrop(null)}
        />
      )}

      {/* MODAL: CADASTRAR ESTUFA */}
      {isAddGreenhouseOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Cadastrar Nova Estufa
              </h3>
              <button
                onClick={() => setIsAddGreenhouseOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGreenhouse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nome / Identificação da Estufa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Estufa 01 - Germinação"
                  value={newGhName}
                  onChange={e => setNewGhName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Capacidade (Mudas)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={newGhCapacity}
                    onChange={e => setNewGhCapacity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Temperatura Atual (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newGhTemp}
                    onChange={e => setNewGhTemp(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Umidade Atual (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newGhHumidity}
                    onChange={e => setNewGhHumidity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Tipo de Ambiente
                  </label>
                  <select
                    value={newGhType}
                    onChange={e => setNewGhType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="hortalicas">Hortaliças</option>
                    <option value="flores">Flores & Ornamentais</option>
                    <option value="camara_germinacao">Câmara de Germinação</option>
                    <option value="silvicultura">Silvicultura / Florestal</option>
                    <option value="rustificacao">Aclimatação & Rustificação</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddGreenhouseOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Salvar Estufa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR NOVO PEDIDO */}
      {isAddOrderOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Registrar Pedido / Reserva de Mudas
              </h3>
              <button
                onClick={() => setIsAddOrderOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nome do Produtor / Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sítio São José (Prod. Carlos)"
                  value={newOrderCustomer}
                  onChange={e => setNewOrderCustomer(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Holambra / SP"
                    value={newOrderCity}
                    onChange={e => setNewOrderCity(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(19) 99876-5432"
                    value={newOrderPhone}
                    onChange={e => setNewOrderPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Cultura Encomendada
                  </label>
                  <select
                    value={newOrderCropName}
                    onChange={e => setNewOrderCropName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    {nurseryCropsCatalog.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Quantidade de Mudas
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newOrderQuantity}
                    onChange={e => setNewOrderQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrderTotalPrice}
                    onChange={e => setNewOrderTotalPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Data Prevista de Entrega
                  </label>
                  <input
                    type="date"
                    value={newOrderDeliveryDate}
                    onChange={e => setNewOrderDeliveryDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Registrar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR OCORRÊNCIA FITOSSANITÁRIA */}
      {isAddPestOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Registrar Monitoramento / Manejo Fitossanitário
              </h3>
              <button
                onClick={() => setIsAddPestOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePestRecord} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Praga ou Doença Diagnosticada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mosca-Branca (Bemisia tabaci)"
                  value={newPestName}
                  onChange={e => setNewPestName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Tipo de Controle
                  </label>
                  <select
                    value={newPestControlType}
                    onChange={e => setNewPestControlType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="biologico">Biológico</option>
                    <option value="quimico">Químico</option>
                    <option value="cultural">Cultural</option>
                    <option value="fisico">Físico</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Responsável Técnico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. Agrônomo"
                    value={newPestTech}
                    onChange={e => setNewPestTech(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Tratamento / Ação Aplicada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Liberação de parasitoides / Aplicação de Azadiractina"
                  value={newPestTreatment}
                  onChange={e => setNewPestTreatment(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddPestOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Registrar Monitoramento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
