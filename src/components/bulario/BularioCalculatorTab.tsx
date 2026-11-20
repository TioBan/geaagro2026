import React from 'react';
import {
  FileText,
  Copy,
  ShieldAlert,
  Package,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PesticideProduct, CropIndication } from '../../types/pesticideLeaflet';

export interface DosageCalcResult {
  isValid: boolean;
  errorMessage?: string;
  product?: PesticideProduct;
  indication?: CropIndication;
  treatedAreaHa?: number;
  dosePerHaConverted?: number;
  totalProductNeeded?: number;
  formattedUnitLabel?: string;
  sprayVolumeLha?: number;
  totalSprayVolumeL?: number;
  tankVol?: number;
  numberOfTankLoads?: number;
  productPerTank?: number;
  packageBreakdown?: { packageSize: number; quantity: number }[];
  gracePeriodDays?: number;
  reentryIntervalHours?: number;
  warnings?: string[];
}

interface BularioCalculatorTabProps {
  products: PesticideProduct[];
  farmName: string;
  calcProductId: string;
  setCalcProductId: (id: string) => void;
  calcCropName: string;
  setCalcCropName: (crop: string) => void;
  calcAreaHa: number | '';
  setCalcAreaHa: (val: number | '') => void;
  calcTankVolumeL: number | '';
  setCalcTankVolumeL: (val: number | '') => void;
  selectedCalcProduct: PesticideProduct | null;
  calcResult: DosageCalcResult;
  onEmitInReceituario: () => void;
  onCopySummary: () => void;
}

const stripLeadingEmoji = (text: string): string =>
  text.replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\s]+/gu, '').trim();

export const BularioCalculatorTab: React.FC<BularioCalculatorTabProps> = ({
  products,
  farmName,
  calcProductId,
  setCalcProductId,
  calcCropName,
  setCalcCropName,
  calcAreaHa,
  setCalcAreaHa,
  calcTankVolumeL,
  setCalcTankVolumeL,
  selectedCalcProduct,
  calcResult,
  onEmitInReceituario,
  onCopySummary,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Cabeçalho da Calculadora */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Calculadora de Dosagem e Calda
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Dimensionamento de produto comercial, volume de calda, abastecimentos e embalagens ({farmName}).
          </p>
        </div>

        {calcResult.isValid && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEmitInReceituario}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Emitir receituário</span>
            </button>
            <button
              type="button"
              onClick={onCopySummary}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar resumo</span>
            </button>
          </div>
        )}
      </div>

      {/* Entradas de Parâmetros */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        <div className="space-y-1">
          <label
            htmlFor="bulario-calc-product"
            className="block font-medium text-slate-700 dark:text-zinc-300"
          >
            1. Defensivo agrícola
          </label>
          <select
            id="bulario-calc-product"
            value={calcProductId}
            onChange={(e) => setCalcProductId(e.target.value)}
            className="w-full h-9 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName} ({p.agrochemicalClass} · MAPA {p.registrationNumber})
              </option>
            ))}
          </select>
          {selectedCalcProduct && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
              {selectedCalcProduct.manufacturer} · {selectedCalcProduct.formulation}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="bulario-calc-crop"
            className="block font-medium text-slate-700 dark:text-zinc-300"
          >
            2. Cultura alvo indicada
          </label>
          {selectedCalcProduct && (selectedCalcProduct.indications || []).length > 0 ? (
            <select
              id="bulario-calc-crop"
              value={calcCropName}
              onChange={(e) => setCalcCropName(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {(selectedCalcProduct.indications || []).map((ind) => (
                <option key={ind.id} value={ind.cropName}>
                  {ind.cropName} ({ind.recommendedDosage} {ind.dosageUnit})
                </option>
              ))}
            </select>
          ) : (
            <div className="h-9 px-2.5 flex items-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-[11px] text-rose-700 dark:text-rose-300 font-medium">
              Sem culturas cadastradas
            </div>
          )}
          {selectedCalcProduct && calcCropName && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
              Alvo:{' '}
              {selectedCalcProduct.indications.find((i) => i.cropName === calcCropName)
                ?.targetOrganism || 'Geral'}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="bulario-calc-area"
            className="block font-medium text-slate-700 dark:text-zinc-300"
          >
            3. Área de aplicação <span className="text-slate-400 font-normal">(ha)</span>
          </label>
          <input
            id="bulario-calc-area"
            type="number"
            step="0.5"
            min="0.1"
            placeholder="Ex: 50"
            value={calcAreaHa}
            onChange={(e) => setCalcAreaHa(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-9 px-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
            Área total do talhão
          </span>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="bulario-calc-tank"
            className="block font-medium text-slate-700 dark:text-zinc-300"
          >
            4. Capacidade do tanque <span className="text-slate-400 font-normal">(L)</span>
          </label>
          <input
            id="bulario-calc-tank"
            type="number"
            step="100"
            placeholder="Ex: 2000"
            value={calcTankVolumeL}
            onChange={(e) =>
              setCalcTankVolumeL(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full h-9 px-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
            Base para cálculo de abastecimentos
          </span>
        </div>
      </div>

      {/* Resultado ou Validação */}
      {!calcResult.isValid ? (
        <div className="border-t border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 px-5 py-4 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Não foi possível calcular a dosagem</strong>
            <p className="mt-0.5">{stripLeadingEmoji(calcResult.errorMessage || '')}</p>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 dark:border-zinc-800 divide-y divide-slate-200 dark:divide-zinc-800">
          {/* Faixa de KPIs do Dimensionamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
            <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Quantidade total do defensivo
              </span>
              <strong className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                {calcResult.totalProductNeeded} {calcResult.formattedUnitLabel}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                Dose: {calcResult.indication?.recommendedDosage} {calcResult.indication?.dosageUnit}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Calda total necessária
              </span>
              <strong className="text-xl font-semibold text-slate-900 dark:text-zinc-100 block mt-1">
                {calcResult.totalSprayVolumeL?.toLocaleString('pt-BR')} L
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                Taxa: {calcResult.sprayVolumeLha} L/ha
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Tanques de pulverização
              </span>
              <strong className="text-xl font-semibold text-slate-900 dark:text-zinc-100 block mt-1">
                ~{calcResult.numberOfTankLoads} cargas
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                Tanque de {calcResult.tankVol} L
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Dosagem por tanque
              </span>
              <strong className="text-xl font-semibold text-teal-700 dark:text-teal-400 block mt-1">
                {calcResult.productPerTank} {calcResult.formattedUnitLabel}
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                Por tanque cheio
              </span>
            </div>
          </div>

          {/* Embalagens & Segurança lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 text-xs">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Sugestão otimizada de embalagens
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Combinação recomendada para suprir {calcResult.totalProductNeeded}{' '}
                {calcResult.formattedUnitLabel} com menor sobra:
              </p>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {calcResult.packageBreakdown && calcResult.packageBreakdown.length > 0 ? (
                  calcResult.packageBreakdown.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <span className="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Embalagem de {pkg.packageSize} L/kg
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {pkg.quantity} {pkg.quantity === 1 ? 'un.' : 'un.'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-2 text-slate-500">Embalagens padrão de 20 L e 5 L.</p>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                  Carência e reentrada (MAPA)
                </h3>
              </div>
              <div className="space-y-2.5 text-[11px]">
                {(calcResult.warnings || []).map((warn, i) => {
                  const isInfo = warn.startsWith('ℹ️');
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-slate-700 dark:text-zinc-300 leading-relaxed"
                    >
                      {isInfo ? (
                        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span>{stripLeadingEmoji(warn)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
