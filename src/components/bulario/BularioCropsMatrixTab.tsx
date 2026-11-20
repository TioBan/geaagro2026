import React, { useMemo } from 'react';
import { Search, X, Calculator, FileText, Info, ShieldCheck } from 'lucide-react';
import { PesticideProduct } from '../../types/pesticideLeaflet';
import { STANDARD_AGRICULTURAL_CROPS } from '../../utils/pesticideDeduplication';

interface CropStatItem {
  cropName: string;
  productsCount: number;
  avgDosage: number;
}

interface BularioCropsMatrixTabProps {
  products: PesticideProduct[];
  cropCoverageReport: {
    totalProducts: number;
    totalIndications: number;
    standardCropsCount: number;
    complianceRatePercent: number;
    cropStats: CropStatItem[];
  };
  selectedMatrixCrop: string;
  setSelectedMatrixCrop: (crop: string) => void;
  selectedMatrixClass: string;
  setSelectedMatrixClass: (cls: string) => void;
  matrixSearchTerm: string;
  setMatrixSearchTerm: (q: string) => void;
  matrixVisibleCount: number;
  setMatrixVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  onOpenCropAuditModal: () => void;
  onSelectForCalculator: (productId: string, cropName: string) => void;
  onSelectForReceituario: (productId: string, cropName: string) => void;
  onOpenDetailModal: (product: PesticideProduct) => void;
}

const CLASS_TEXT_COLORS: Record<string, string> = {
  Fungicida: 'text-blue-700 dark:text-blue-400',
  Inseticida: 'text-amber-700 dark:text-amber-400',
  Herbicida: 'text-rose-700 dark:text-rose-400',
  Acaricida: 'text-orange-700 dark:text-orange-400',
  Nematicida: 'text-violet-700 dark:text-violet-400',
  'Tratamento de Sementes': 'text-teal-700 dark:text-teal-400',
  Biológico: 'text-emerald-700 dark:text-emerald-400',
  Fisioativador: 'text-sky-700 dark:text-sky-400',
  Adjuvante: 'text-slate-600 dark:text-zinc-400',
};

export const BularioCropsMatrixTab: React.FC<BularioCropsMatrixTabProps> = ({
  products,
  cropCoverageReport,
  selectedMatrixCrop,
  setSelectedMatrixCrop,
  selectedMatrixClass,
  setSelectedMatrixClass,
  matrixSearchTerm,
  setMatrixSearchTerm,
  matrixVisibleCount,
  setMatrixVisibleCount,
  onOpenCropAuditModal,
  onSelectForCalculator,
  onSelectForReceituario,
  onOpenDetailModal,
}) => {
  const currentCropStats = useMemo(
    () =>
      cropCoverageReport.cropStats.find(
        (s) => s.cropName.toLowerCase() === selectedMatrixCrop.toLowerCase()
      ),
    [cropCoverageReport.cropStats, selectedMatrixCrop]
  );

  const matrixProductsForCrop = useMemo(() => {
    const q = matrixSearchTerm.trim().toLowerCase();
    return products
      .map((p) => {
        const ind = p.indications.find(
          (i) => i.cropName.toLowerCase() === selectedMatrixCrop.toLowerCase()
        );
        return { product: p, indication: ind };
      })
      .filter((item): item is { product: PesticideProduct; indication: NonNullable<typeof item.indication> } =>
        Boolean(item.indication)
      )
      .filter(({ product: p, indication: ind }) => {
        if (selectedMatrixClass !== 'all' && p.agrochemicalClass !== selectedMatrixClass) {
          return false;
        }
        if (q) {
          return (
            p.productName.toLowerCase().includes(q) ||
            p.registrationNumber.includes(q) ||
            (p.activeIngredient && p.activeIngredient.toLowerCase().includes(q)) ||
            p.manufacturer.toLowerCase().includes(q) ||
            (ind.targetOrganism && ind.targetOrganism.toLowerCase().includes(q)) ||
            (p.chemicalGroup && p.chemicalGroup.toLowerCase().includes(q))
          );
        }
        return true;
      });
  }, [products, selectedMatrixCrop, selectedMatrixClass, matrixSearchTerm]);

  const visibleMatrixProducts = useMemo(
    () => matrixProductsForCrop.slice(0, matrixVisibleCount),
    [matrixProductsForCrop, matrixVisibleCount]
  );

  const defaultSprayLabel =
    selectedMatrixCrop === 'Café'
      ? '400 L/ha'
      : selectedMatrixCrop === 'Citros'
      ? '1.000 L/ha'
      : selectedMatrixCrop === 'Tomate' || selectedMatrixCrop === 'Batata'
      ? '500 L/ha'
      : '150 L/ha';

  return (
    <div className="space-y-4">
      {/* Faixa de KPIs da Matriz */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Matriz de Culturas &amp; Dosagens
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Consulta cruzada de alvos, dosagens calibradas e carências por cultura.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCropAuditModal}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Auditoria de cobertura</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
          <div className="bg-white dark:bg-zinc-900 px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Defensivos auditados
            </span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {cropCoverageReport.totalProducts.toLocaleString('pt-BR')}
            </strong>
          </div>
          <div className="bg-white dark:bg-zinc-900 px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Indicações calibradas
            </span>
            <strong className="text-base font-semibold text-teal-700 dark:text-teal-400">
              {cropCoverageReport.totalIndications.toLocaleString('pt-BR')}
            </strong>
          </div>
          <div className="bg-white dark:bg-zinc-900 px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Cultura ativa · Dose média
            </span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {selectedMatrixCrop} · {currentCropStats?.avgDosage || 0.85} L/kg
            </strong>
          </div>
          <div className="bg-white dark:bg-zinc-900 px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Calda referência · Conformidade
            </span>
            <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
              {defaultSprayLabel} · {cropCoverageReport.complianceRatePercent}%
            </strong>
          </div>
        </div>
      </div>

      {/* Barra Única de Seleção de Cultura, Busca e Classe */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select
            aria-label="Selecionar cultura agrícola"
            value={selectedMatrixCrop}
            onChange={(e) => setSelectedMatrixCrop(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {STANDARD_AGRICULTURAL_CROPS.map((crop) => {
              const stat = cropCoverageReport.cropStats.find(
                (s) => s.cropName.toLowerCase() === crop.toLowerCase()
              );
              return (
                <option key={crop} value={crop}>
                  {crop} ({stat?.productsCount || products.length})
                </option>
              );
            })}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Buscar em ${selectedMatrixCrop} (produto, ativo, alvo)...`}
              value={matrixSearchTerm}
              onChange={(e) => setMatrixSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {matrixSearchTerm && (
              <button
                type="button"
                onClick={() => setMatrixSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            aria-label="Filtrar por classe agronômica"
            value={selectedMatrixClass}
            onChange={(e) => setSelectedMatrixClass(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
        </div>

        <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
          {visibleMatrixProducts.length.toLocaleString('pt-BR')} de{' '}
          {matrixProductsForCrop.length.toLocaleString('pt-BR')} registros
        </span>
      </div>

      {/* Tabela Densa de Indicações */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3.5">Defensivo &amp; Fabricante</th>
                <th className="py-2.5 px-3.5">Princípio ativo</th>
                <th className="py-2.5 px-3.5">Classe</th>
                <th className="py-2.5 px-3.5">Alvo em {selectedMatrixCrop}</th>
                <th className="py-2.5 px-3.5 text-right">Dosagem</th>
                <th className="py-2.5 px-3.5 text-right">Calda</th>
                <th className="py-2.5 px-3.5 text-right">Carência</th>
                <th className="py-2.5 px-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {visibleMatrixProducts.map(({ product: p, indication: ind }) => {
                const classColor =
                  CLASS_TEXT_COLORS[p.agrochemicalClass] || 'text-slate-600 dark:text-zinc-400';

                return (
                  <tr
                    key={`${p.id}-${ind.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 max-w-[220px]">
                      <button
                        type="button"
                        onClick={() => onOpenDetailModal(p)}
                        className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 truncate block text-left max-w-full cursor-pointer"
                      >
                        {p.productName}
                      </button>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block tabular-nums">
                        {p.manufacturer} · MAPA {p.registrationNumber}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 max-w-[180px]">
                      <span
                        className="text-slate-700 dark:text-zinc-200 truncate block font-medium"
                        title={p.activeIngredient}
                      >
                        {p.activeIngredient}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate block">
                        {p.formulation}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className={`font-medium ${classColor}`}>{p.agrochemicalClass}</span>
                    </td>

                    <td className="py-2.5 px-3.5 max-w-[220px]">
                      <span
                        className="text-slate-700 dark:text-zinc-200 line-clamp-2"
                        title={ind.targetOrganism}
                      >
                        {ind.targetOrganism}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                      {ind.recommendedDosage} {ind.dosageUnit}
                    </td>

                    <td className="py-2.5 px-3.5 text-right text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                      {ind.recommendedSprayVolumeLha || 150} L/ha
                    </td>

                    <td className="py-2.5 px-3.5 text-right text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                      {ind.gracePeriodDays === 0 ? 'Isento' : `${ind.gracePeriodDays} d`}
                    </td>

                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectForCalculator(p.id, selectedMatrixCrop)}
                          className="h-7 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Calcular calda para ${p.productName}`}
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Calcular</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectForReceituario(p.id, selectedMatrixCrop)}
                          className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Prescrever ${p.productName}`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>Receita</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(p)}
                          className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                          title="Ver ficha técnica"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {matrixProductsForCrop.length > matrixVisibleCount && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
              Exibindo {matrixVisibleCount.toLocaleString('pt-BR')} de{' '}
              {matrixProductsForCrop.length.toLocaleString('pt-BR')} recomendações
            </span>
            <button
              type="button"
              onClick={() => setMatrixVisibleCount((prev) => prev + 40)}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Carregar mais (+40)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
