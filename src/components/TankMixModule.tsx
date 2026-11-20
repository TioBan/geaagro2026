import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  FlaskConical,
  Zap,
  Droplets,
  BookOpen,
  Boxes,
  CloudSun,
  Tractor,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  TankMixProduct,
  TankSelectedProduct,
  WaterQualityParameters,
  WeatherCondition,
  SprayerEquipment,
  SprayApplicationRecord,
} from '../types/tankMix';
import {
  TANKMIX_PRODUCTS_DATABASE,
  DEFAULT_SPRAYERS,
  calculateTankMixEvaluation,
} from '../data/tankMixData';
import { addTankMixApplicationToFieldBook } from '../utils/tankmixFieldBookSync';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const TankMixVirtualLabView = lazyWithRetry(() =>
  import('./tankmix/TankMixVirtualLabView').then(m => ({ default: m.TankMixVirtualLabView }))
);
const TankMixCompatibilityMatrixView = lazyWithRetry(() =>
  import('./tankmix/TankMixCompatibilityMatrixView').then(m => ({ default: m.TankMixCompatibilityMatrixView }))
);
const TankMixWaterQualityView = lazyWithRetry(() =>
  import('./tankmix/TankMixWaterQualityView').then(m => ({ default: m.TankMixWaterQualityView }))
);
const TankMixFormulationsLibraryView = lazyWithRetry(() =>
  import('./tankmix/TankMixFormulationsLibraryView').then(m => ({ default: m.TankMixFormulationsLibraryView }))
);
const TankMixProductsCatalogView = lazyWithRetry(() =>
  import('./tankmix/TankMixProductsCatalogView').then(m => ({ default: m.TankMixProductsCatalogView }))
);
const TankMixWeatherApplicationView = lazyWithRetry(() =>
  import('./tankmix/TankMixWeatherApplicationView').then(m => ({ default: m.TankMixWeatherApplicationView }))
);
const TankMixSprayersView = lazyWithRetry(() =>
  import('./tankmix/TankMixSprayersView').then(m => ({ default: m.TankMixSprayersView }))
);
const TankMixTraceabilityView = lazyWithRetry(() =>
  import('./tankmix/TankMixTraceabilityView').then(m => ({ default: m.TankMixTraceabilityView }))
);
const TankMixReportsView = lazyWithRetry(() =>
  import('./tankmix/TankMixReportsView').then(m => ({ default: m.TankMixReportsView }))
);

interface TankMixModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  farmName?: string;
  activeFarm?: unknown;
}

const SUB_TABS = [
  { id: 'virtual_lab', label: 'Laboratório Virtual', icon: FlaskConical },
  { id: 'compatibility_matrix', label: 'Matriz', icon: Zap },
  { id: 'water_quality', label: 'Água', icon: Droplets },
  { id: 'formulations_library', label: 'Formulações', icon: BookOpen },
  { id: 'products_catalog', label: 'Defensivos', icon: Boxes },
  { id: 'weather_app', label: 'Clima & ΔT', icon: CloudSun },
  { id: 'sprayers', label: 'Pulverizadores', icon: Tractor },
  { id: 'traceability', label: 'Rastreabilidade', icon: ShieldCheck },
  { id: 'reports', label: 'Laudo & Receita', icon: FileText },
] as const;

export const TankMixModule: React.FC<TankMixModuleProps> = ({
  activeSubTab: propSubTab,
  setActiveSubTab,
  farmName = 'Fazenda Modelo',
}) => {
  const [localSubTab, setLocalSubTab] = useState<string>('compatibility_matrix');
  const resolvedPropTab =
    !propSubTab || propSubTab === 'dashboard' ? undefined : propSubTab;
  const currentSubTab = resolvedPropTab ?? localSubTab;

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Products state (includes pre-loaded + custom user-created)
  const [products, setProducts] = useState<TankMixProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return TANKMIX_PRODUCTS_DATABASE;
  });

  // Selected products currently in virtual spray tank
  const [selectedProducts, setSelectedProducts] = useState<TankSelectedProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_current_tank');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isLegacyDemo =
            Array.isArray(parsed) &&
            parsed.length === 3 &&
            parsed.some(
              (p: TankSelectedProduct) =>
                p?.productId === 'roundup_transorb' || p?.product?.id === 'roundup_transorb'
            );
          if (!isLegacyDemo && Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // Water quality state
  const [waterQuality, setWaterQuality] = useState<WaterQualityParameters>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_water_quality');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      ph: 6.2,
      electricalConductivityUsCm: 180,
      hardnessMgL: 65,
      alkalinityMgL: 45,
      temperatureC: 24,
      calciumMgL: 18,
      magnesiumMgL: 5,
      ironMgL: 0.1,
      manganeseMgL: 0.05,
      bicarbonatesMgL: 40,
      classification: 'Mole',
    };
  });

  // Weather state
  const [weather, setWeather] = useState<WeatherCondition>(() => ({
    temperatureC: 24,
    relativeHumidityPct: 68,
    windSpeedKmH: 7,
    deltaT: 3.8,
    applicationWindowStatus: 'ideal',
    rainForecastHours: 12,
    windowNotes: 'Condições excelentes. Delta T na faixa ótima e vento favorável.',
  }));

  // Sprayers state
  const [sprayers, setSprayers] = useState<SprayerEquipment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_sprayers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_SPRAYERS;
  });

  // Tank capacity and spray volume state
  const [tankVolumeL, setTankVolumeL] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_volume_l');
      if (saved) return Number(saved) || 2000;
    }
    return 2000;
  });

  const [sprayVolumeLHa, setSprayVolumeLHa] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_spray_volume_lha');
      if (saved) return Number(saved) || 100;
    }
    return 100;
  });

  // Spray traceability application history
  const [applications, setApplications] = useState<SprayApplicationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_applications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isLegacyMock = Array.isArray(parsed) && parsed.length === 1 && parsed[0]?.id === 'app_sample_1';
          if (!isLegacyMock && Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // Auto-persist changes
  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_volume_l', String(tankVolumeL));
  }, [tankVolumeL]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_spray_volume_lha', String(sprayVolumeLHa));
  }, [sprayVolumeLHa]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_current_tank', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_water_quality', JSON.stringify(waterQuality));
  }, [waterQuality]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_sprayers', JSON.stringify(sprayers));
  }, [sprayers]);

  useEffect(() => {
    localStorage.setItem('geaagro_tankmix_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    if (!statusNotice) return;
    const timer = window.setTimeout(() => setStatusNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [statusNotice]);

  // Recalculate evaluation dynamically when products, water, or tank parameters change
  const currentEvaluation = useMemo(
    () => calculateTankMixEvaluation(selectedProducts, waterQuality, tankVolumeL, sprayVolumeLHa),
    [selectedProducts, waterQuality, tankVolumeL, sprayVolumeLHa]
  );

  const handleSubTabChange = (tabId: string) => {
    setLocalSubTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  const handleAddCustomProduct = (newProd: TankMixProduct) => {
    setProducts(prev => [newProd, ...prev]);
    setStatusNotice(`Produto "${newProd.commercialName}" adicionado ao catálogo.`);
  };

  const handleSelectProductForLab = (product: TankMixProduct) => {
    const alreadyIn = selectedProducts.find(p => (p.productId || p.product?.id) === product.id);
    if (!alreadyIn) {
      const nextOrder = selectedProducts.length + 1;
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          product,
          dose: product.defaultDose,
          doseUnit: product.doseUnit,
          additionOrder: nextOrder,
        },
      ]);
    }
    handleSubTabChange('virtual_lab');
  };

  const handleSelectSprayerForLab = (sprayer: SprayerEquipment) => {
    if (sprayer.tankCapacityLiters) setTankVolumeL(sprayer.tankCapacityLiters);
    if (sprayer.applicationRateLHa) setSprayVolumeLHa(sprayer.applicationRateLHa);
    handleSubTabChange('virtual_lab');
  };

  const handleAddApplicationRecord = (record: SprayApplicationRecord) => {
    setApplications(prev => [record, ...prev]);

    // Synchronize to Caderno de Campo Operations History
    try {
      addTankMixApplicationToFieldBook({
        farmId: record.farmId || 'farm-1',
        fieldId: record.plotId || 'field-1',
        responsible: record.operatorName || 'Operador de Máquinas',
        date: record.date || new Date().toISOString().split('T')[0],
        sprayOrderCode: record.id?.replace('app_', 'ORD-') || `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
        carrierVolumeHa: record.totalSprayVolumeLHa || 100,
        totalVolumeLiters: (record.totalSprayVolumeLHa || 100) * (record.areaHa || 50),
        waterPh: record.waterPh || waterQuality.ph || 5.8,
        waterHardnessPpm: record.waterHardnessMgL || waterQuality.hardnessMgL || 60,
        sprayTip: record.nozzleModel || 'Leque Amplo Antideriva (AIXI)',
        driftRiskLevel: 'baixo',
        products: (record.productsUsed || []).map((p, idx) => ({
          productName: p.productName || 'Defensivo Agrícola',
          dose: `${p.dosePerHa} ${p.doseUnit}`,
          additionOrder: idx + 1,
          category: 'Fitossanitário',
          target: record.notes || 'Controle Fitossanitário',
          safetyInterval: record.safetyIntervalDays || 14,
        })),
        notes: record.notes || `Aplicação TankMix no ${record.plotName || 'Talhão Geral'}`,
      });
    } catch (err) {
      console.error('Erro ao sincronizar TankMix com Caderno de Campo:', err);
    }

    setStatusNotice('Aplicação registrada na rastreabilidade e sincronizada com o Caderno de Campo.');
    handleSubTabChange('traceability');
  };

  const handleDeleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const handleRegisterCurrentTankApplication = () => {
    if (selectedProducts.length === 0) {
      handleSubTabChange('traceability');
      return;
    }
    const today = new Date();
    const maxSafetyDays = Math.max(
      ...currentEvaluation.loadedProducts.map(lp => lp.product.safetyIntervalDays || 14),
      14
    );
    const harvestDate = new Date(today.getTime() + maxSafetyDays * 86400000).toISOString().split('T')[0];
    const reentryDate = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const defaultSprayer = sprayers[0];
    const areaHa = currentEvaluation.totalHectaresPerTank || 20;

    handleAddApplicationRecord({
      id: `app_${Date.now()}`,
      farmId: 'farm_1',
      farmName,
      plotId: 'plot_1',
      plotName: 'Talhão 01',
      crop: 'Soja',
      cultivar: 'Padrão',
      areaHa,
      growthStage: 'V4 / R1',
      date: today.toISOString().split('T')[0],
      startTime: '07:00',
      endTime: '10:30',
      operatorName: 'Operador Responsável',
      equipmentId: defaultSprayer?.id || 'sprayer_1',
      equipmentName: defaultSprayer?.name || 'Pulverizador Autopropelido',
      nozzleModel: defaultSprayer?.nozzleType || 'Leque com Indução de Ar 110-02',
      totalSprayVolumeLHa: sprayVolumeLHa,
      totalTankVolumeL: tankVolumeL,
      tankLoadsCount: 1,
      productsUsed: currentEvaluation.loadedProducts.map(lp => ({
        productId: lp.product.id,
        productName: lp.product.commercialName,
        formulation: lp.product.formulation,
        class: lp.product.agrochemicalClass,
        dosePerHa: lp.dose,
        doseUnit: lp.doseUnit,
        totalAmountUsed: Number((lp.dose * areaHa).toFixed(2)),
        amountUnit: lp.doseUnit.includes('kg') || lp.doseUnit.includes('g') ? 'kg' : 'L',
      })),
      waterPh: waterQuality.ph,
      waterHardnessMgL: waterQuality.hardnessMgL,
      weather,
      icgScore: currentEvaluation.icgScore,
      icgRating: currentEvaluation.worstRating,
      detectedAlerts: currentEvaluation.activeAlerts,
      mixingOrderFollowed: true,
      jarTestConducted: currentEvaluation.jarTestRequired,
      safetyIntervalDays: maxSafetyDays,
      reentryDate,
      harvestSafetyDate: harvestDate,
      epiChecklistOk: true,
      tripleRinseDone: true,
      notes: 'Aplicação registrada via Simulador de Tanque TankMix.',
      photos: [],
      createdAt: today.toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      {/* Cabeçalho Compacto do Módulo */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 pt-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                TankMix : Compatibilidade de Defensivos
              </h1>
              <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Calda, Água, Clima &amp; Rastreabilidade
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>{selectedProducts.length} {selectedProducts.length === 1 ? 'produto no tanque' : 'produtos no tanque'}</span>
              <span aria-hidden="true">·</span>
              <span>Tanque {tankVolumeL} L ({sprayVolumeLHa} L/ha)</span>
              <span aria-hidden="true">·</span>
              <span>Água pH {waterQuality.ph.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentSubTab !== 'virtual_lab' ? (
              <button
                type="button"
                onClick={() => handleSubTabChange('virtual_lab')}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                <span>Simular Calda</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubTabChange('reports')}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Ver Laudo</span>
              </button>
            )}
          </div>
        </div>

        {/* Navegação Horizontal Limpa (Underline Tabs) */}
        <nav
          aria-label="Seções do TankMix"
          className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-zinc-800/80 -mb-px"
        >
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSubTabChange(tab.id)}
                className={`px-2.5 py-2.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === 'virtual_lab' && selectedProducts.length > 0 && (
                  <span className="text-[11px] font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    ({selectedProducts.length})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {statusNotice && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/70 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        <Suspense
          fallback={
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-zinc-400">
              Carregando módulo TankMix...
            </div>
          }
        >
          {currentSubTab === 'virtual_lab' && (
            <TankMixVirtualLabView
              allProducts={products}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              waterQuality={waterQuality}
              tankVolumeL={tankVolumeL}
              setTankVolumeL={setTankVolumeL}
              sprayVolumeLHa={sprayVolumeLHa}
              setSprayVolumeLHa={setSprayVolumeLHa}
              onSaveRecipe={name => {
                setStatusNotice(`Receita "${name}" salva localmente.`);
              }}
              onOpenTraceabilityModal={handleRegisterCurrentTankApplication}
              onNavigateToWaterQuality={() => handleSubTabChange('water_quality')}
            />
          )}

          {currentSubTab === 'compatibility_matrix' && <TankMixCompatibilityMatrixView />}

          {currentSubTab === 'water_quality' && (
            <TankMixWaterQualityView waterQuality={waterQuality} setWaterQuality={setWaterQuality} />
          )}

          {currentSubTab === 'formulations_library' && <TankMixFormulationsLibraryView />}

          {currentSubTab === 'products_catalog' && (
            <TankMixProductsCatalogView
              products={products}
              onAddCustomProduct={handleAddCustomProduct}
              onSelectProductForLab={handleSelectProductForLab}
            />
          )}

          {currentSubTab === 'weather_app' && (
            <TankMixWeatherApplicationView weather={weather} setWeather={setWeather} />
          )}

          {currentSubTab === 'sprayers' && (
            <TankMixSprayersView
              sprayers={sprayers}
              setSprayers={setSprayers}
              onSelectSprayerForLab={handleSelectSprayerForLab}
            />
          )}

          {currentSubTab === 'traceability' && (
            <TankMixTraceabilityView
              applications={applications}
              onDeleteApplication={handleDeleteApplication}
            />
          )}

          {currentSubTab === 'reports' && (
            <TankMixReportsView
              selectedProducts={selectedProducts}
              evaluation={currentEvaluation}
              waterQuality={waterQuality}
              weather={weather}
              farmName={farmName}
              plotName="Talhão Principal"
            />
          )}
        </Suspense>
      </main>
    </div>
  );
};

export default TankMixModule;
