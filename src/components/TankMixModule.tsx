// @ts-nocheck
import React, { useState, useEffect } from 'react';
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

import { TankMixVirtualLabView } from './tankmix/TankMixVirtualLabView';
import { TankMixCompatibilityMatrixView } from './tankmix/TankMixCompatibilityMatrixView';
import { TankMixWaterQualityView } from './tankmix/TankMixWaterQualityView';
import { TankMixFormulationsLibraryView } from './tankmix/TankMixFormulationsLibraryView';
import { TankMixProductsCatalogView } from './tankmix/TankMixProductsCatalogView';
import { TankMixWeatherApplicationView } from './tankmix/TankMixWeatherApplicationView';
import { TankMixSprayersView } from './tankmix/TankMixSprayersView';
import { TankMixTraceabilityView } from './tankmix/TankMixTraceabilityView';
import { TankMixReportsView } from './tankmix/TankMixReportsView';
import { addTankMixApplicationToFieldBook } from '../utils/tankmixFieldBookSync';

interface TankMixModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  farmName?: string;
  activeFarm?: any;
}

export const TankMixModule: React.FC<TankMixModuleProps> = ({
  activeSubTab = 'virtual_lab',
  setActiveSubTab,
  farmName = 'Fazenda Modelo',
  activeFarm,
}) => {
  const currentSubTab = !activeSubTab || activeSubTab === 'dashboard' ? 'compatibility_matrix' : activeSubTab;

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

  // Selected products currently in virtual spray tank (starts clean and professional without mock items)
  const [selectedProducts, setSelectedProducts] = useState<TankSelectedProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geaagro_tankmix_current_tank');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isLegacyDemo =
            Array.isArray(parsed) &&
            parsed.length === 3 &&
            parsed.some((p: any) => p?.productId === 'roundup_transorb' || p?.product?.id === 'roundup_transorb');
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
      classification: 'água mole',
    };
  });

  // Weather state
  const [weather, setWeather] = useState<WeatherCondition>(() => {
    return {
      temperatureC: 24,
      relativeHumidityPct: 68,
      windSpeedKmH: 7,
      deltaT: 3.8,
      applicationWindowStatus: 'ideal',
      rainForecastHours: 12,
      windowNotes: 'Condições excelentes. Delta T na faixa ótima e vento favorável.',
    };
  });

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

  // Auto-persist changes
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

  // Recalculate evaluation dynamically whenever products or water change
  const currentEvaluation = calculateTankMixEvaluation(selectedProducts, waterQuality);

  const handleSubTabChange = (tabId: string) => {
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  const handleAddCustomProduct = (newProd: TankMixProduct) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleSelectProductForLab = (product: TankMixProduct) => {
    const alreadyIn = selectedProducts.find(p => p.product.id === product.id);
    if (!alreadyIn) {
      const nextOrder = (selectedProducts || []).length + 1;
      setSelectedProducts(prev => [
        ...prev,
        {
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
        waterPh: record.waterQuality?.ph || 5.8,
        waterHardnessPpm: record.waterQuality?.hardnessMgL || 60,
        sprayTip: 'Leque Amplo Antideriva (AIXI)',
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

    handleSubTabChange('traceability');
  };

  const handleDeleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const subTabs = [
    { id: 'compatibility_matrix', label: 'Matriz de Compatibilidade', icon: Zap },
    { id: 'water_quality', label: 'Qualidade da Água', icon: Droplets },
    { id: 'formulations_library', label: 'Biblioteca de Formulações', icon: BookOpen },
    { id: 'products_catalog', label: 'Banco de Defensivos', icon: Boxes },
    { id: 'weather_app', label: 'Clima & Delta T', icon: CloudSun },
    { id: 'sprayers', label: 'Pulverizadores', icon: Tractor },
    { id: 'traceability', label: 'Rastreabilidade', icon: ShieldCheck },
    { id: 'reports', label: 'Laudo & Receitas', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Disclaimer & Title without badges */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/50 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 shrink-0">
          <FlaskConical className="w-8 h-8 text-emerald-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mt-1">TankMix : Compatibilidade de Defensivos</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-3xl leading-relaxed">
            Planejamento da compatibilidade físico-química e biológica de misturas em tanque, ordem de preparo de calda, diagnóstico de água, tecnologia de aplicação e rastreabilidade total por talhão.
          </p>
        </div>
      </div>

      {/* Subtabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSubTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab Contents */}

      {currentSubTab === 'virtual_lab' && (
        <TankMixVirtualLabView
          allProducts={products}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          waterQuality={waterQuality}
          setWaterQuality={setWaterQuality}
          tankVolumeL={tankVolumeL}
          setTankVolumeL={setTankVolumeL}
          sprayVolumeLHa={sprayVolumeLHa}
          setSprayVolumeLHa={setSprayVolumeLHa}
          onSaveRecipe={(name, description) => {
            console.log(`Receita salva: ${name} - ${description}`);
          }}
          onOpenTraceabilityModal={() => handleSubTabChange('traceability')}
          onNavigateToWaterQuality={() => handleSubTabChange('water_quality')}
          onRecordApplication={handleAddApplicationRecord}
          farmName={farmName}
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
          onAddApplication={handleAddApplicationRecord}
          onDeleteApplication={handleDeleteApplication}
          farms={[{ id: 'farm_1', name: farmName }]}
          currentFarmId="farm_1"
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

      {/* Botão "Abrir Laboratório Virtual" na parte inferior */}
      {currentSubTab !== 'virtual_lab' ? (
        <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 border border-emerald-600/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shrink-0">
              <FlaskConical className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Laboratório Virtual &amp; Simulador de Calda</h4>
              <p className="text-xs text-slate-300">
                Simulação de ordem de adição WALES, verificação de incompatibilidade física e química e registro com rastreabilidade.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSubTabChange('virtual_lab')}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-[1.01] cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-5 h-5 text-gray-950" />
            <span>Abrir Laboratório Virtual</span>
          </button>
        </div>
      ) : (
        <div className="flex justify-start mt-6">
          <button
            onClick={() => handleSubTabChange('compatibility_matrix')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <span>← Voltar aos Módulos TankMix</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TankMixModule;
