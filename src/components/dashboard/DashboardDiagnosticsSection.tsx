import React, { Suspense, lazy } from 'react';
import { Farm, SoilSample, LeafSample, CropNutritionalTarget } from '../../types/agronomy';
import { AIFarmScoreWidget } from '../AIFarmScoreWidget';
import { SmartWidgets } from '../SmartWidgets';
import { WeatherSummaryWidget } from '../WeatherSummaryWidget';
import { ClimateAlertWidget } from '../ClimateAlertWidget';

const BaseSaturationChart = lazy(() =>
  import('../BaseSaturationChart').then(m => ({ default: m.BaseSaturationChart }))
);
const FinancialEfficiencyChart = lazy(() =>
  import('../FinancialEfficiencyChart').then(m => ({ default: m.FinancialEfficiencyChart }))
);

const ChartSkeleton = () => (
  <div className="h-72 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse" />
);

interface DashboardDiagnosticsSectionProps {
  farm: Farm;
  soilSamples: SoilSample[];
  leafSamples: LeafSample[];
  activeCrop?: CropNutritionalTarget;
  setActiveTab: (tab: string) => void;
}

export const DashboardDiagnosticsSection: React.FC<DashboardDiagnosticsSectionProps> = ({
  farm,
  soilSamples,
  leafSamples,
  activeCrop,
  setActiveTab,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Diagnósticos e climatologia
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Indicadores integrados de solo, nutrição foliar, alertas e eficiência da propriedade {farm.name}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <AIFarmScoreWidget farm={farm} soilSamples={soilSamples} leafSamples={leafSamples} />
        <SmartWidgets farm={farm} />
        <WeatherSummaryWidget farm={farm} onClickDetails={() => setActiveTab('meteorologia')} />
        <ClimateAlertWidget farm={farm} onNavigatePhenology={() => setActiveTab('fenologia')} />

        <Suspense fallback={<ChartSkeleton />}>
          <div className="space-y-4">
            <BaseSaturationChart
              farm={farm}
              soilSamples={soilSamples}
              targetVPercent={activeCrop?.targetVPercent || 70}
            />
            <FinancialEfficiencyChart farm={farm} soilSamples={soilSamples} />
          </div>
        </Suspense>
      </div>
    </section>
  );
};
