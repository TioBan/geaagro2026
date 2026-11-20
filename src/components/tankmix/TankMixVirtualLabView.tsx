import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  RotateCcw,
  Bookmark,
  Tractor,
  Search,
  X,
} from 'lucide-react';
import {
  TankMixProduct,
  TankSelectedProduct,
  WaterQualityParameters,
} from '../../types/tankMix';
import {
  TANKMIX_PRODUCTS_DATABASE,
  FORMULATION_DATABASE,
  calculateTankMixEvaluation,
  getJarTestProtocol,
} from '../../data/tankMixData';

interface Props {
  allProducts?: TankMixProduct[];
  selectedProducts: TankSelectedProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<TankSelectedProduct[]>>;
  waterQuality?: WaterQualityParameters;
  tankVolumeL?: number;
  setTankVolumeL?: (vol: number) => void;
  sprayVolumeLHa?: number;
  setSprayVolumeLHa?: (vol: number) => void;
  onSaveRecipe?: (name: string, description: string) => void;
  onOpenTraceabilityModal?: () => void;
  onNavigateToWaterQuality?: () => void;
}

const CLASS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'herbicida', label: 'Herbicidas' },
  { id: 'fungicida', label: 'Fungicidas' },
  { id: 'inseticida', label: 'Inseticidas' },
  { id: 'adjuvante', label: 'Adjuvantes' },
  { id: 'fertilizante_foliar', label: 'Foliares' },
  { id: 'condicionador_calda', label: 'Condicionadores' },
];

export const TankMixVirtualLabView: React.FC<Props> = ({
  allProducts = [],
  selectedProducts = [],
  setSelectedProducts,
  waterQuality = {
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
  },
  tankVolumeL = 2000,
  setTankVolumeL = () => {},
  sprayVolumeLHa = 100,
  setSprayVolumeLHa = () => {},
  onSaveRecipe = () => {},
  onOpenTraceabilityModal = () => {},
  onNavigateToWaterQuality = () => {},
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('todos');
  const [selectedFormulationFilter, setSelectedFormulationFilter] = useState<string>('todas');
  const [showJarTestModal, setShowJarTestModal] = useState(false);
  const [showSaveRecipePrompt, setShowSaveRecipePrompt] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [isAgitatorOn, setIsAgitatorOn] = useState(true);

  const catalogSource = allProducts.length > 0 ? allProducts : TANKMIX_PRODUCTS_DATABASE;

  // Compute live tank evaluation
  const evaluation = calculateTankMixEvaluation(selectedProducts, waterQuality, tankVolumeL, sprayVolumeLHa);

  const handleAddProduct = (product: TankMixProduct) => {
    if (!product || !product.id) return;
    if ((selectedProducts || []).some(p => p?.productId === product.id || p?.product?.id === product.id)) return;
    setSelectedProducts(prev => [
      ...(prev || []),
      {
        productId: product.id,
        product,
        dose: product.defaultDose,
        doseUnit: product.doseUnit,
        additionOrder: (prev || []).length + 1,
      },
    ]);
    setShowProductModal(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => (prev || []).filter(p => (p?.productId || p?.product?.id) !== productId));
  };

  const handleUpdateDose = (productId: string, dose: number) => {
    setSelectedProducts(prev =>
      (prev || []).map(p =>
        p?.productId === productId || p?.product?.id === productId
          ? { ...p, dose: Math.max(0.01, dose) }
          : p
      )
    );
  };

  const filteredCatalog = (catalogSource || []).filter(p => {
    if (!p || !p.id) return false;
    const q = (productSearch || '').toLowerCase();
    const matchSearch =
      (p.commercialName || '').toLowerCase().includes(q) ||
      (p.activeIngredient || '').toLowerCase().includes(q) ||
      (p.formulation || '').toLowerCase().includes(q);
    const matchClass = selectedClassFilter === 'todos' || p.agrochemicalClass === selectedClassFilter;
    const matchFormulation = selectedFormulationFilter === 'todas' || p.formulation === selectedFormulationFilter;
    return matchSearch && matchClass && matchFormulation;
  });

  const hasPrecipitate = (evaluation?.detectedRules || []).some(r => r?.precipitateRisk);
  const hasPhaseSeparation = (evaluation?.detectedRules || []).some(r => r?.phaseSeparationRisk);
  const hasEc = (evaluation?.loadedProducts || []).some(
    p => p?.product?.formulation === 'EC' || p?.product?.formulation === 'EW'
  );
  const hasCopper = (evaluation?.loadedProducts || []).some(p => p?.product?.id === 'oxicloreto_de_cobre_wp');
  const hasMancozebe = (evaluation?.loadedProducts || []).some(p => p?.product?.id === 'mancozebe_750_wg');

  let fluidColorClass = 'bg-sky-100/80 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700';
  if (hasCopper) fluidColorClass = 'bg-teal-500/75 dark:bg-teal-600/70 border-teal-600 dark:border-teal-500';
  else if (hasMancozebe) fluidColorClass = 'bg-amber-100/90 dark:bg-amber-900/45 border-amber-300 dark:border-amber-700';
  else if (hasEc) fluidColorClass = 'bg-emerald-100/80 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700';

  const jarTest = getJarTestProtocol(evaluation.loadedProducts, sprayVolumeLHa);

  const icgLabel =
    selectedProducts.length === 0
      ? 'Aguardando insumos'
      : evaluation.worstRating === 'compativel'
      ? 'Compatibilidade elevada'
      : evaluation.worstRating === 'compativel_restricoes'
      ? 'Compatível com cuidados'
      : evaluation.worstRating === 'restricao_severa'
      ? 'Restrição severa'
      : 'Incompatível';

  const icgTextTone =
    selectedProducts.length === 0
      ? 'text-slate-500 dark:text-zinc-400'
      : evaluation.icgScore >= 85
      ? 'text-emerald-700 dark:text-emerald-400'
      : evaluation.icgScore >= 70
      ? 'text-amber-700 dark:text-amber-400'
      : evaluation.icgScore >= 50
      ? 'text-orange-700 dark:text-orange-400'
      : 'text-rose-700 dark:text-rose-400';

  const icgBarTone =
    selectedProducts.length === 0
      ? 'bg-slate-300 dark:bg-zinc-700'
      : evaluation.icgScore >= 85
      ? 'bg-emerald-500'
      : evaluation.icgScore >= 70
      ? 'bg-amber-500'
      : evaluation.icgScore >= 50
      ? 'bg-orange-500'
      : 'bg-rose-500';

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Seção e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Simulador de Tanque de Pulverização
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Validação físico-química em tempo real · Sequência técnica WALES
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {evaluation.jarTestRequired && selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowJarTestModal(true)}
              className="h-8 px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 shrink-0" />
              <span>Teste de Jarra (1L)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSaveRecipePrompt(true)}
            disabled={selectedProducts.length === 0}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Salvar Receita</span>
          </button>

          <button
            type="button"
            onClick={onOpenTraceabilityModal}
            disabled={selectedProducts.length === 0}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Tractor className="w-3.5 h-3.5 shrink-0" />
            <span>Registrar Aplicação</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProducts([])}
            disabled={selectedProducts.length === 0}
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 inline-flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
            title="Esvaziar tanque"
            aria-label="Esvaziar tanque"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Faixa de Parâmetros do Tanque */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5">
          <label
            htmlFor="tankmix-capacity"
            className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1.5"
          >
            Capacidade do tanque
          </label>
          <select
            id="tankmix-capacity"
            value={tankVolumeL}
            onChange={e => setTankVolumeL(Number(e.target.value))}
            className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value={20}>20 L · Costal manual</option>
            <option value={40}>40 L · Drone de pulverização</option>
            <option value={600}>600 L · Barra tratorizada</option>
            <option value={800}>800 L · Barra tratorizada</option>
            <option value={2000}>2.000 L · Turbo / Barra</option>
            <option value={3000}>3.000 L · Autopropelido</option>
            <option value={4000}>4.000 L · Autopropelido grande</option>
          </select>
        </div>

        <div className="p-3.5">
          <label
            htmlFor="tankmix-rate"
            className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1.5"
          >
            Taxa de aplicação
          </label>
          <div className="flex items-center gap-2">
            <input
              id="tankmix-rate"
              type="number"
              min={5}
              max={1000}
              value={sprayVolumeLHa}
              onChange={e => setSprayVolumeLHa(Math.max(5, Number(e.target.value)))}
              className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">L/ha</span>
          </div>
        </div>

        <div className="p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Área coberta por tanque
          </span>
          <div className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
            {evaluation.totalHectaresPerTank}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">ha / carga</span>
          </div>
        </div>

        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Água base da fazenda
            </span>
            <button
              type="button"
              onClick={onNavigateToWaterQuality}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap cursor-pointer"
            >
              Ajustar
            </button>
          </div>
          <div className="text-xs text-slate-700 dark:text-zinc-300 mt-1 tabular-nums">
            pH <strong className="font-semibold text-slate-900 dark:text-zinc-100">{waterQuality.ph.toFixed(1)}</strong>
            <span className="mx-1.5 text-slate-300 dark:text-zinc-700">·</span>
            Dureza <strong className="font-semibold text-slate-900 dark:text-zinc-100">{waterQuality.hardnessMgL}</strong> mg/L
          </div>
        </div>
      </div>

      {/* Área Principal: Esquerda (Simulador + Alertas) | Direita (Produtos + Ordem WALES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  Simulação Hidrodinâmica
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAgitatorOn(!isAgitatorOn)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  isAgitatorOn
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                Agitador: {isAgitatorOn ? 'Ligado' : 'Desligado'}
              </button>
            </div>

            {/* Tanque Visual */}
            <div className="p-5 flex flex-col items-center">
              <div className="relative w-56 h-72 bg-slate-100 dark:bg-zinc-950 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 p-2.5 flex flex-col justify-end overflow-hidden">
                <div className="absolute right-2 top-3 bottom-3 flex flex-col justify-between text-[10px] font-mono tabular-nums text-slate-400 dark:text-zinc-500 select-none pointer-events-none z-20">
                  <span>{tankVolumeL} L</span>
                  <span>{(tankVolumeL * 0.75).toFixed(0)} L</span>
                  <span>{(tankVolumeL * 0.5).toFixed(0)} L</span>
                  <span>{(tankVolumeL * 0.25).toFixed(0)} L</span>
                  <span>0 L</span>
                </div>

                {/* Eixo e hélice */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-56 bg-slate-500 dark:bg-zinc-600 rounded-full z-10 flex flex-col justify-end items-center pb-6">
                  <div
                    className={`w-14 h-2.5 bg-slate-600 dark:bg-zinc-500 rounded-xs transition-transform ${
                      isAgitatorOn && selectedProducts.length > 0 ? 'animate-spin' : ''
                    }`}
                  />
                </div>

                {/* Superfície */}
                {selectedProducts.length > 0 && (
                  <div className="w-full h-4 bg-white/80 dark:bg-zinc-800/80 rounded-t-lg z-20 flex items-center justify-center border-b border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                      Superfície da calda
                    </span>
                  </div>
                )}

                {/* Separação de fase */}
                {hasPhaseSeparation && (
                  <div className="w-full h-5 bg-amber-400/90 dark:bg-amber-500/85 z-20 flex items-center justify-center border-b border-amber-600">
                    <span className="text-[10px] font-semibold text-amber-950">
                      Nata / Separação de fase
                    </span>
                  </div>
                )}

                {/* Líquido */}
                <div
                  className={`w-full transition-all duration-500 rounded-b-xl border-t relative overflow-hidden flex flex-col justify-between ${
                    selectedProducts.length === 0
                      ? 'h-16 bg-sky-100/60 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
                      : `h-56 ${fluidColorClass}`
                  }`}
                >
                  <div className="p-2 text-center text-[11px] font-medium text-slate-800 dark:text-zinc-100 z-10">
                    {selectedProducts.length === 0 ? (
                      <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                        Água pura (pH {waterQuality.ph.toFixed(1)})
                      </span>
                    ) : (
                      <span className="tabular-nums">
                        Calda ({selectedProducts.length} {selectedProducts.length === 1 ? 'insumo' : 'insumos'})
                      </span>
                    )}
                  </div>

                  {hasPrecipitate && (
                    <div className="w-full py-1 bg-rose-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1 z-20">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Precipitado decantado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicador ICG */}
            <div className="px-4 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Índice de Compatibilidade (ICG)
                </span>
                <span className={`text-xs font-semibold tabular-nums ${icgTextTone}`}>
                  {selectedProducts.length === 0 ? icgLabel : `${evaluation.icgScore}% · ${icgLabel}`}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${icgBarTone}`}
                  style={{ width: selectedProducts.length === 0 ? '0%' : `${evaluation.icgScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Alertas de Incompatibilidade */}
          {(evaluation.detectedRules || []).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Interações Físico-Químicas Detectadas ({evaluation.detectedRules.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {evaluation.detectedRules.map(rule => {
                  const iconColor =
                    rule.rating === 'incompativel'
                      ? 'text-rose-600 dark:text-rose-400'
                      : rule.rating === 'restricao_severa'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-amber-600 dark:text-amber-400';

                  return (
                    <div key={rule.id} className="p-4 space-y-1.5 text-xs">
                      <div className="flex items-start gap-2 font-semibold text-slate-900 dark:text-zinc-100">
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                        <span>{rule.issueSummary}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                        {rule.technicalDetails}
                      </p>
                      <div className="pl-6 pt-1 text-slate-800 dark:text-zinc-200">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Ação recomendada:</span>{' '}
                        {rule.recommendedAction}
                      </div>
                      {rule.scientificReference && (
                        <div className="pl-6 text-[11px] text-slate-400 dark:text-zinc-500">
                          Fonte: {rule.scientificReference}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="lg:col-span-7 space-y-5">
          {/* Produtos no Tanque */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Produtos na Calda
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Ajuste a dose por hectare para calcular o total por carga automaticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Adicionar Defensivo</span>
              </button>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="px-6 py-10 text-center space-y-2.5">
                <FlaskConical className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                    O tanque está vazio
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Adicione herbicidas, fungicidas, inseticidas, adjuvantes ou fertilizantes foliares para simular a mistura.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Escolher Produto</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {selectedProducts.map((sp, index) => {
                  const prodId = sp?.productId || sp?.product?.id || '';
                  const product =
                    sp?.product ||
                    (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === prodId) ||
                    (allProducts || []).find(p => p?.id === prodId);
                  if (!product) return null;

                  const totalForTank = (sp.dose * evaluation.totalHectaresPerTank).toFixed(2);
                  const totalUnit = sp.doseUnit.includes('kg') || sp.doseUnit.includes('g') ? 'kg' : 'L';

                  return (
                    <div
                      key={prodId || `sp_${index}`}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                            {product.commercialName}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400">
                            {product.formulation}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
                            {product.agrochemicalClass.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                          i.a.: {product.activeIngredient} · {product.actionMechanism}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-500 dark:text-zinc-400">Dose</label>
                          <input
                            type="number"
                            step={0.05}
                            min={0.01}
                            value={sp.dose}
                            onChange={e => handleUpdateDose(prodId, Number(e.target.value))}
                            className="w-16 h-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md px-1.5 text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 text-center"
                          />
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400 min-w-[34px]">
                            {sp.doseUnit}
                          </span>
                        </div>

                        <div className="text-right min-w-[82px]">
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500">Por tanque</div>
                          <div className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {totalForTank} <span className="font-normal text-slate-500 dark:text-zinc-400">{totalUnit}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(prodId)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                          title="Remover produto"
                          aria-label={`Remover ${product.commercialName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ordem de Adição WALES */}
          {selectedProducts.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Ordem Técnica de Adição
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Sequência WALES
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Abastecimento inicial de água (50% a 70%)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Encher o tanque com água limpa e acionar a agitação contínua antes de inserir os insumos.
                    </p>
                  </div>
                </div>

                {evaluation.sortedByMixingOrder.map((item, idx) => (
                  <div key={item.product.id} className="px-4 py-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-semibold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 2}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {item.product.commercialName}{' '}
                          <span className="font-mono font-normal text-slate-500 dark:text-zinc-400">
                            ({item.product.formulation})
                          </span>
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {(item.dose * evaluation.totalHectaresPerTank).toFixed(2)}{' '}
                          {item.doseUnit.includes('kg') || item.doseUnit.includes('g') ? 'kg' : 'L'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {item.product.formulation === 'WP' || item.product.formulation === 'WG'
                          ? 'Realizar pré-diluição em balde com água se necessário e aguardar 3 minutos de agitação.'
                          : item.product.agrochemicalClass === 'condicionador_calda'
                          ? 'Condicionador: adicionar no início para neutralizar cátions e ajustar o pH da água.'
                          : `Adicionar lentamente com agitação constante (formulação ${item.product.formulation}).`}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    {(evaluation.sortedByMixingOrder || []).length + 2}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Completar volume do tanque (100%)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Completar com água e manter o agitador ligado por pelo menos 5 minutos antes da pulverização.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Seleção de Produtos */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Adicionar Insumo ao Tanque
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Selecione defensivos, adjuvantes ou fertilizantes foliares
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome comercial, ingrediente ativo ou formulação..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex flex-wrap items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-zinc-800 rounded-lg">
                  {CLASS_FILTERS.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedClassFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        selectedClassFilter === cat.id
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedFormulationFilter}
                  onChange={e => setSelectedFormulationFilter(e.target.value)}
                  aria-label="Filtrar por formulação"
                  className="h-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="todas">Todas formulações</option>
                  {FORMULATION_DATABASE.map(f => (
                    <option key={f.code} value={f.code}>
                      {f.code} · {f.fullName.split('(')[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400 text-xs">
                  Nenhum produto encontrado com estes filtros.
                </div>
              ) : (
                filteredCatalog
                  .filter(product => product && product.id)
                  .map(product => {
                    const isAdded = (selectedProducts || []).some(
                      p => p?.productId === product.id || p?.product?.id === product.id
                    );
                    return (
                      <div
                        key={product.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {product.commercialName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                              {product.formulation}
                            </span>
                            <span className="text-slate-300 dark:text-zinc-700 text-xs">·</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
                              {product.agrochemicalClass.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate tabular-nums">
                            {product.activeIngredient} · Dose padrão: {product.defaultDose} {product.doseUnit}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          disabled={isAdded}
                          className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            isAdded
                              ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          }`}
                        >
                          {isAdded ? 'No tanque' : 'Adicionar'}
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Teste de Jarra */}
      {showJarTestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Protocolo de Teste de Jarra (1 Litro)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Proporções calculadas para validação em frasco graduado antes do preparo no tanque
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJarTestModal(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="px-3.5 py-2.5 rounded-lg border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>Instrução prática:</strong> Utilize um béquer ou jarro transparente de 1.000 mL com a mesma água que abastecerá o pulverizador.
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Ordem de adição no jarro (1 L)
                </div>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {jarTest.steps.map(step => (
                    <div key={step.stepNumber} className="px-3.5 py-2.5 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-semibold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {step.productName}{' '}
                          <span className="font-mono font-normal text-slate-500 dark:text-zinc-400">
                            ({step.formulation})
                          </span>
                        </div>
                        <div className="text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {step.jarDoseText}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{step.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Tempos de leitura e avaliação
                </h4>
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
                  {jarTest.checkpoints.map(cp => (
                    <div key={cp.timeMinutes} className="p-3 text-xs">
                      <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {cp.timeMinutes} min
                      </span>
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">{cp.criteria}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowJarTestModal(false)}
                className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Salvar Receita */}
      {showSaveRecipePrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Salvar Receita de Calda
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveRecipePrompt(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Nome da receita
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dessecação Buva e Amargoso"
                  value={recipeName}
                  onChange={e => setRecipeName(e.target.value)}
                  className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Observações técnicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Aplicar nas primeiras horas da manhã com umidade > 60%..."
                  value={recipeNotes}
                  onChange={e => setRecipeNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveRecipePrompt(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!recipeName) return;
                  onSaveRecipe(recipeName, recipeNotes);
                  setShowSaveRecipePrompt(false);
                  setRecipeName('');
                  setRecipeNotes('');
                }}
                disabled={!recipeName}
                className="h-8 px-3.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 cursor-pointer"
              >
                Salvar Receita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
