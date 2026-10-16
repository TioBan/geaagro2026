import React, { useState, useEffect, useMemo } from 'react';
import { Farm, RuralProducer, Agronomist, Company, SoilSample, LeafSample } from '../types/agronomy';
import { CROPS_CATALOG } from '../data/agronomicStandards';
import {
  DashboardHeaderBanner,
  DashboardKpiSection,
  DashboardQuickAccessSection,
  DashboardFarmsSummary,
  DashboardRecommendationsSection,
  DashboardDiagnosticsSection,
} from './dashboard';

export interface DashboardModuleProps {
  farm: Farm;
  farms: Farm[];
  producer: RuralProducer;
  producers: RuralProducer[];
  agronomist: Agronomist;
  company: Company;
  soilSamples: SoilSample[];
  leafSamples: LeafSample[];
  setActiveTab: (tab: string) => void;
  setSelectedFarmId: (id: string) => void;
  setActiveSubTab?: (subTab: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  farm,
  farms = [],
  producer,
  producers = [],
  soilSamples = [],
  leafSamples = [],
  setActiveTab,
  setSelectedFarmId,
  setActiveSubTab,
}) => {
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Farm area and count calculations
  const totalFarmsCount = useMemo(() => farms.filter(f => f && f.id).length, [farms]);

  const totalAreaHa = useMemo(() => {
    return farms.reduce((acc, f) => acc + (Number(f?.totalAreaHa) || 0), 0);
  }, [farms]);

  const totalCultivatedAreaHa = useMemo(() => {
    return farms.reduce((acc, f) => acc + (Number(f?.cultivatedAreaHa) || 0), 0);
  }, [farms]);

  // Active crop resolution
  const activeCrop = useMemo(() => {
    const firstPlotCrop = farm?.plots?.[0]?.currentCrop;
    return (
      CROPS_CATALOG.find(c => c.name.toLowerCase().includes((firstPlotCrop || 'soja').toLowerCase())) ||
      CROPS_CATALOG[0]
    );
  }, [farm]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-600 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white text-xs ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Producer Header & Overview Metrics */}
      <DashboardHeaderBanner
        producer={producer}
        totalFarmsCount={totalFarmsCount}
        totalAreaHa={totalAreaHa}
        totalCultivatedAreaHa={totalCultivatedAreaHa}
      />

      {/* 2. KPI Cards & Interactive Calculation Methodology */}
      <DashboardKpiSection
        totalCultivatedAreaHa={totalCultivatedAreaHa}
        totalAreaHa={totalAreaHa}
        activeCropName={activeCrop?.name}
        activeCropTargetVPercent={activeCrop?.targetVPercent}
      />

      {/* 3. Acesso Rápido às Funcionalidades */}
      <DashboardQuickAccessSection
        onNavigate={(tab, subTab) => {
          setActiveTab(tab);
          if (subTab && setActiveSubTab) {
            setActiveSubTab(subTab);
          }
        }}
      />

      {/* 4. Farm Summaries & Latest Soil Samples */}
      <DashboardFarmsSummary
        farms={farms}
        activeFarm={farm}
        producers={producers}
        soilSamples={soilSamples}
        setSelectedFarmId={setSelectedFarmId}
        setActiveTab={setActiveTab}
      />

      {/* 5. Actionable Pending Recommendations */}
      <DashboardRecommendationsSection
        farms={farms}
        setSelectedFarmId={setSelectedFarmId}
        setActiveTab={setActiveTab}
        onShowToast={setToastMessage}
      />

      {/* 6. Diagnostic Tools & Climatology */}
      <DashboardDiagnosticsSection
        farm={farm}
        soilSamples={soilSamples}
        leafSamples={leafSamples}
        activeCrop={activeCrop}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default DashboardModule;
