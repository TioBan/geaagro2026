import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
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
  agronomist?: Agronomist;
  company?: Company;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const { totalFarmsCount, totalAreaHa, totalCultivatedAreaHa } = useMemo(() => {
    let count = 0;
    let total = 0;
    let cultivated = 0;
    for (const f of farms) {
      if (!f?.id) continue;
      count += 1;
      total += Number(f.totalAreaHa) || 0;
      cultivated += Number(f.cultivatedAreaHa) || 0;
    }
    return { totalFarmsCount: count, totalAreaHa: total, totalCultivatedAreaHa: cultivated };
  }, [farms]);

  const { activeCrop, registeredCropName } = useMemo(() => {
    const plotWithCrop = farm?.plots?.find((p) => p?.currentCrop && p.currentCrop.trim().length > 0);
    const rawCropName = plotWithCrop?.currentCrop?.trim();
    if (!rawCropName) {
      return { activeCrop: undefined, registeredCropName: undefined };
    }
    const normalized = rawCropName.toLowerCase();
    const matched = CROPS_CATALOG.find(
      (c) =>
        c.name.toLowerCase().includes(normalized) ||
        normalized.includes(c.id.replace(/_/g, ' ')) ||
        c.id.toLowerCase() === normalized
    );
    return {
      activeCrop: matched,
      registeredCropName: matched ? matched.name : rawCropName,
    };
  }, [farm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2.5 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Fechar aviso"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 ml-1 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Cabeçalho Consolidado */}
      <DashboardHeaderBanner
        producer={producer}
        totalFarmsCount={totalFarmsCount}
        totalAreaHa={totalAreaHa}
        totalCultivatedAreaHa={totalCultivatedAreaHa}
      />

      {/* 2. Indicadores Consolidados & Base de Cálculo */}
      <DashboardKpiSection
        farmId={farm?.id}
        totalCultivatedAreaHa={totalCultivatedAreaHa}
        totalAreaHa={totalAreaHa}
        activeCropName={registeredCropName}
        activeCropTargetVPercent={activeCrop?.targetVPercent}
        activeCropYieldTarget={activeCrop?.defaultYieldTarget}
        activeCropYieldUnit={activeCrop?.expectedYieldUnit}
        onNavigateToCosts={() => {
          setActiveTab('custos');
          setActiveSubTab?.('painel_geral');
        }}
        onNavigateToCadastros={() => {
          setActiveTab('cadastros');
        }}
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

      {/* 4. Resumo das Fazendas & Última Análise */}
      <DashboardFarmsSummary
        farms={farms}
        activeFarm={farm}
        producers={producers}
        soilSamples={soilSamples}
        setSelectedFarmId={setSelectedFarmId}
        setActiveTab={setActiveTab}
      />

      {/* 5. Recomendações Pendentes de Campo */}
      <DashboardRecommendationsSection
        farms={farms}
        setSelectedFarmId={setSelectedFarmId}
        setActiveTab={setActiveTab}
        onShowToast={setToastMessage}
      />

      {/* 6. Diagnósticos & Climatologia */}
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
