import React from 'react';
import { Sparkles } from 'lucide-react';
import { Farm, SoilSample, LeafSample, CropNutritionalTarget } from '../../types/agronomy';
import { AIFarmScoreWidget } from '../AIFarmScoreWidget';
import { SmartWidgets } from '../SmartWidgets';
import { WeatherSummaryWidget } from '../WeatherSummaryWidget';
import { ClimateAlertWidget } from '../ClimateAlertWidget';
import { BaseSaturationChart } from '../BaseSaturationChart';
import { FinancialEfficiencyChart } from '../FinancialEfficiencyChart';

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
    <div className="bg-slate-50/50 dark:bg-zinc-900/20 p-1.5 rounded-2xl border dark:border-zinc-900">
      <div className="p-3">
        <h3 className="text-xs font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Ferramentas Diagnósticas & Climatologia
        </h3>
      </div>
      <div className="space-y-6">
        <AIFarmScoreWidget farm={farm} soilSamples={soilSamples} leafSamples={leafSamples} />
        <SmartWidgets farm={farm} />

        <WeatherSummaryWidget farm={farm} onClickDetails={() => setActiveTab('meteorologia')} />
        <ClimateAlertWidget farm={farm} onNavigatePhenology={() => setActiveTab('fenologia')} />

        <div className="space-y-6">
          <BaseSaturationChart
            farm={farm}
            soilSamples={soilSamples}
            targetVPercent={activeCrop?.targetVPercent || 70}
          />

          <FinancialEfficiencyChart farm={farm} soilSamples={soilSamples} />
        </div>
      </div>
    </div>
  );
};
