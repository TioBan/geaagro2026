import React from 'react';
import {
  Layers,
  ArrowRight,
  FlaskConical,
  Wheat,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import {
  SWINE_CARD_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
} from './swineUi';

interface SwineGeaSuiteIntegrationViewProps {
  onNavigateToTankMix?: () => void;
  onNavigateToPoultry?: () => void;
  onNavigateToBuffalo?: () => void;
}

export const SwineGeaSuiteIntegrationView: React.FC<SwineGeaSuiteIntegrationViewProps> = ({
  onNavigateToTankMix,
  onNavigateToPoultry,
  onNavigateToBuffalo,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4`}>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Sinergias & Conectividade com a Suíte GeaAgro</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-3xl">
          Integre a suinocultura aos módulos de fertirrigação agronômica (TankMix), avicultura, bubalinocultura e acompanhamento de custos produtivos.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col justify-between gap-3`}>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  TankMix · Fertirrigação com DLS
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Aproveitamento agronômico de Dejetos Líquidos de Suínos
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Aproveite efluentes tratados em biodigestores e esterqueiras para nutrição de lavouras de milho e soja, calculando diluição e balanço de N-P-K orgânico por hectare.
            </p>
          </div>

          {onNavigateToTankMix && (
            <button
              type="button"
              onClick={onNavigateToTankMix}
              className={`${SWINE_SECONDARY_BTN_CLASS} w-full justify-between`}
            >
              <span>Abrir Módulo TankMix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col justify-between gap-3`}>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Wheat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Avicultura · Fábrica de Ração Compartilhada
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Compra conjunta de grãos, farelo de soja e núcleos
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Consolide o consumo de milho a granel, farelo de soja e premix entre granjas avícolas e suinícolas para ganhar escala e otimizar estoque de fábrica.
            </p>
          </div>

          {onNavigateToPoultry && (
            <button
              type="button"
              onClick={onNavigateToPoultry}
              className={`${SWINE_SECONDARY_BTN_CLASS} w-full justify-between`}
            >
              <span>Abrir Módulo Avicultura</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col justify-between gap-3`}>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Bubalinocultura · Agroindústria
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Agregação de valor e verticalização artesanal
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Integração de cadeia para propriedades diversificadas com processamento artesanal, rastreabilidade de lotes e controle sanitário unificado.
            </p>
          </div>

          {onNavigateToBuffalo && (
            <button
              type="button"
              onClick={onNavigateToBuffalo}
              className={`${SWINE_SECONDARY_BTN_CLASS} w-full justify-between`}
            >
              <span>Abrir Módulo Bubalinocultura</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col justify-between gap-3`}>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Estrutura de Custo por Suíno Terminado
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Referência técnica de composição de custos
                </p>
              </div>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} p-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-600 dark:text-zinc-400`}>
              <span>Nutrição / Ração</span>
              <span className="text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">~72%</span>
              <span>Reposição / Leitão</span>
              <span className="text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">~14%</span>
              <span>Mão de Obra</span>
              <span className="text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">~6%</span>
              <span>Sanidade & Energia</span>
              <span className="text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">~8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
