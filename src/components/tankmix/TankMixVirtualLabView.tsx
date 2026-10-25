import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Zap,
  Info,
  Layers,
  FileText,
  RotateCcw,
  Bookmark,
  Share2,
  ChevronRight,
  Droplets,
  Tractor,
  Sliders,
} from 'lucide-react';
import {
  TankMixProduct,
  TankSelectedProduct,
  WaterQualityParameters,
  CompatibilityRule,
  CompatibilityRating,
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
  setWaterQuality?: React.Dispatch<React.SetStateAction<WaterQualityParameters>>;
  tankVolumeL?: number;
  setTankVolumeL?: (vol: number) => void;
  sprayVolumeLHa?: number;
  setSprayVolumeLHa?: (vol: number) => void;
  onSaveRecipe?: (name: string, description: string) => void;
  onOpenTraceabilityModal?: () => void;
  onNavigateToWaterQuality?: () => void;
  onRecordApplication?: (record: any) => void;
  farmName?: string;
}

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

  // Compute live tank evaluation
  const evaluation = calculateTankMixEvaluation(selectedProducts, waterQuality, tankVolumeL, sprayVolumeLHa);

  // Helper to add product
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
        (p?.productId === productId || p?.product?.id === productId)
          ? { ...p, dose: Math.max(0.01, dose) }
          : p
      )
    );
  };

  // Filter products for modal
  const filteredCatalog = (TANKMIX_PRODUCTS_DATABASE || []).filter(p => {
    if (!p || !p.id) return false;
    const matchSearch =
      (p.commercialName || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
      (p.activeIngredient || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
      (p.formulation || '').toLowerCase().includes((productSearch || '').toLowerCase());
    const matchClass = selectedClassFilter === 'todos' || p.agrochemicalClass === selectedClassFilter;
    const matchFormulation = selectedFormulationFilter === 'todas' || p.formulation === selectedFormulationFilter;
    return matchSearch && matchClass && matchFormulation;
  });

  // Calculate visual appearance of tank fluid
  const hasPrecipitate = (evaluation?.detectedRules || []).some(r => r?.precipitateRisk);
  const hasPhaseSeparation = (evaluation?.detectedRules || []).some(r => r?.phaseSeparationRisk);
  const hasEc = (evaluation?.loadedProducts || []).some(p => p?.product?.formulation === 'EC' || p?.product?.formulation === 'EW');
  const hasCopper = (evaluation?.loadedProducts || []).some(p => p?.product?.id === 'oxicloreto_de_cobre_wp');
  const hasMancozebe = (evaluation?.loadedProducts || []).some(p => p?.product?.id === 'mancozebe_750_wg');

  let fluidColorClass = 'bg-cyan-100/70 border-cyan-300';
  if (hasCopper) fluidColorClass = 'bg-teal-500/80 border-teal-600';
  else if (hasMancozebe) fluidColorClass = 'bg-amber-100/90 border-amber-300';
  else if (hasEc) fluidColorClass = 'bg-emerald-50/90 border-emerald-200';

  const jarTest = getJarTestProtocol(evaluation.loadedProducts, tankVolumeL, sprayVolumeLHa);

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Config Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Laboratório Virtual Interativo
            </span>
            <span className="text-xs text-gray-500">• Validação Físico-Química em Tempo Real</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Simulador de Tanque de Pulverização</h1>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {evaluation.jarTestRequired && (selectedProducts || []).length > 0 && (
            <button
              onClick={() => setShowJarTestModal(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Protocolo Teste de Jarra (1L)</span>
            </button>
          )}

          <button
            onClick={() => setShowSaveRecipePrompt(true)}
            disabled={(selectedProducts || []).length === 0}
            className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            <Bookmark className="w-4 h-4 text-teal-600" />
            <span>Salvar Receita</span>
          </button>

          <button
            onClick={onOpenTraceabilityModal}
            disabled={(selectedProducts || []).length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            <Tractor className="w-4 h-4" />
            <span>Registrar Aplicação</span>
          </button>

          <button
            onClick={() => setSelectedProducts([])}
            disabled={(selectedProducts || []).length === 0}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30"
            title="Esvaziar Tanque"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tank Parameters Bar */}
      <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Capacidade do Tanque
          </label>
          <select
            value={tankVolumeL}
            onChange={e => setTankVolumeL(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value={20}>20 Litros (Costal Manual)</option>
            <option value={40}>40 Litros (Drone de Pulverização)</option>
            <option value={600}>600 Litros (Tratorizado Barra)</option>
            <option value={800}>800 Litros (Tratorizado Barra)</option>
            <option value={2000}>2.000 Litros (Turbo Atomizador / Barra)</option>
            <option value={3000}>3.000 Litros (Autopropelido)</option>
            <option value={4000}>4.000 Litros (Autopropelido Grande Porte)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Taxa de Aplicação (L/ha)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={1000}
              value={sprayVolumeLHa}
              onChange={e => setSprayVolumeLHa(Math.max(5, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-xs text-gray-400 font-medium">L/ha</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Área Coberta / Tanque
          </label>
          <div className="text-base font-extrabold text-white">
            {evaluation.totalHectaresPerTank}{' '}
            <span className="text-xs font-normal text-gray-400">ha / tanque cheio</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Água Base da Fazenda
            </label>
            <button
              onClick={onNavigateToWaterQuality}
              className="text-[11px] text-emerald-400 hover:underline font-medium"
            >
              Ajustar
            </button>
          </div>
          <div className="text-xs font-medium text-gray-300">
            pH <span className="font-bold text-white">{waterQuality.ph.toFixed(1)}</span> • Dureza{' '}
            <span className="font-bold text-white">{waterQuality.hardnessMgL}</span> mg/L
          </div>
        </div>
      </div>

      {/* Main Interactive Dual Pane: Left (Tank Animation & ICG) | Right (Products in Tank & Mix Order) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Virtual Tank Visualizer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>Simulação Hidrodinâmica da Calda</span>
              </h2>
              <button
                onClick={() => setIsAgitatorOn(!isAgitatorOn)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                  isAgitatorOn
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Agitador: {isAgitatorOn ? 'Ligado' : 'Desligado'}
              </button>
            </div>

            {/* Visual Tank Graphic */}
            <div className="relative w-64 h-80 bg-gray-100 rounded-3xl border-4 border-gray-400/80 p-3 shadow-inner flex flex-col justify-end overflow-hidden">
              {/* Level Markers on side */}
              <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between text-[9px] font-mono text-gray-400 select-none pointer-events-none">
                <span>{tankVolumeL} L (100%)</span>
                <span>{(tankVolumeL * 0.75).toFixed(0)} L (75%)</span>
                <span>{(tankVolumeL * 0.5).toFixed(0)} L (50%)</span>
                <span>{(tankVolumeL * 0.25).toFixed(0)} L (25%)</span>
                <span>0 L</span>
              </div>

              {/* Agitator shaft & blades */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-64 bg-gray-600 rounded-full z-10 flex flex-col justify-end items-center pb-8">
                <div
                  className={`w-16 h-3 bg-gray-700 rounded-sm shadow-md transition-transform ${
                    isAgitatorOn && (selectedProducts || []).length > 0 ? 'animate-spin' : ''
                  }`}
                />
              </div>

              {/* Foam Layer on Top */}
              {(selectedProducts || []).length > 0 && (
                <div className="w-full h-4 bg-white/80 backdrop-blur-sm rounded-t-xl z-20 flex items-center justify-center border-b border-gray-200">
                  <span className="text-[9px] font-bold text-gray-500">Superfície da Calda</span>
                </div>
              )}

              {/* Phase Separation (Oil on top) alert layer */}
              {hasPhaseSeparation && (
                <div className="w-full h-6 bg-amber-400/80 z-20 flex items-center justify-center border-b border-amber-600 animate-pulse">
                  <span className="text-[9px] font-extrabold text-amber-950">Nata / Separação de Fase</span>
                </div>
              )}

              {/* Liquid Body */}
              <div
                className={`w-full transition-all duration-700 rounded-b-2xl border-t-2 relative overflow-hidden flex flex-col justify-between ${
                  (selectedProducts || []).length === 0
                    ? 'h-16 bg-blue-100/50 border-blue-200'
                    : `h-64 ${fluidColorClass}`
                }`}
              >
                {/* Agitation wave animation */}
                {isAgitatorOn && (selectedProducts || []).length > 0 && (
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
                )}

                <div className="p-2 text-center text-xs font-bold text-gray-800 z-10">
                  {(selectedProducts || []).length === 0 ? (
                    <span className="text-gray-400">Água Pura ({waterQuality.ph} pH)</span>
                  ) : (
                    <span>Calda Homogeneizada ({(selectedProducts || []).length} produtos)</span>
                  )}
                </div>

                {/* Precipitates Sediments on bottom */}
                {hasPrecipitate && (
                  <div className="w-full h-5 bg-rose-700 text-white text-[9px] font-extrabold flex items-center justify-center z-20 animate-bounce">
                    ⚠️ Precipitado / Cristais Decantados!
                  </div>
                )}
              </div>
            </div>

            {/* ICG Gauge Score */}
            <div className="w-full mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Índice de Compatibilidade (ICG)</span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    (selectedProducts || []).length === 0
                      ? 'bg-gray-100 text-gray-600'
                      : evaluation.icgScore >= 85
                      ? 'bg-emerald-100 text-emerald-800'
                      : evaluation.icgScore >= 70
                      ? 'bg-amber-100 text-amber-800'
                      : evaluation.icgScore >= 50
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(selectedProducts || []).length === 0
                    ? 'Aguardando Insumos'
                    : `${evaluation.icgScore}% • ${
                        evaluation.worstRating === 'compativel'
                          ? 'Elevada'
                          : evaluation.worstRating === 'compativel_restricoes'
                          ? 'Com Cuidados'
                          : evaluation.worstRating === 'restricao_severa'
                          ? 'Restrições'
                          : 'Incompatível'
                      }`}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (selectedProducts || []).length === 0
                      ? 'bg-gray-300'
                      : evaluation.icgScore >= 85
                      ? 'bg-emerald-500'
                      : evaluation.icgScore >= 70
                      ? 'bg-amber-500'
                      : evaluation.icgScore >= 50
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: (selectedProducts || []).length === 0 ? '0%' : `${evaluation.icgScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Incompatibility Alerts */}
          {(evaluation.detectedRules || []).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Interações Físico-Químicas Detectadas
              </h3>
              {(evaluation.detectedRules || []).map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    rule.rating === 'incompativel'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : rule.rating === 'restricao_severa'
                      ? 'bg-orange-50 border-orange-200 text-orange-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{rule.issueSummary}</span>
                  </div>
                  <p className="mt-1 text-gray-700">{rule.technicalDetails}</p>
                  <div className="mt-2 pt-2 border-t border-gray-200/60 font-semibold text-gray-900">
                    Ação recomendada: <span className="font-normal">{rule.recommendedAction}</span>
                  </div>
                  {rule.scientificReference && (
                    <div className="mt-1 text-[10px] text-gray-500 italic">
                      Fonte: {rule.scientificReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Products Added in Tank + Mixing Sequence WALES */}
        <div className="lg:col-span-7 space-y-6">
          {/* Products List in Tank */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Produtos Adicionados na Calda</h2>
                <p className="text-xs text-gray-500">
                  Defina as doses por hectare. O sistema calcula automaticamente o total por tanque.
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Defensivo</span>
              </button>
            </div>

            {(selectedProducts || []).length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <FlaskConical className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">O tanque está vazio</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Clique em "Adicionar Defensivo" para selecionar herbicidas, fungicidas, inseticidas, adjuvantes ou fertilizantes foliares.
                </p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Escolher Produto</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedProducts || []).map((sp, index) => {
                  const prodId = sp?.productId || sp?.product?.id || '';
                  const product =
                    sp?.product ||
                    (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === prodId) ||
                    (allProducts || []).find(p => p?.id === prodId);
                  if (!product) return null;

                  // Total amount for the whole tank:
                  // Total Dose = Dose/ha * TotalHectares
                  const totalForTank = (sp.dose * evaluation.totalHectaresPerTank).toFixed(2);

                  return (
                    <div
                      key={prodId || `sp_${index}`}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{product.commercialName}</span>
                          <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">
                            {product.formulation}
                          </span>
                          <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium capitalize">
                            {product.agrochemicalClass.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          i.a.: {product.activeIngredient} • {product.actionMechanism}
                        </div>
                      </div>

                      {/* Dosage Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                          <label className="text-[11px] text-gray-500 font-medium">Dose:</label>
                          <input
                            type="number"
                            step={0.05}
                            min={0.01}
                            value={sp.dose}
                            onChange={e => handleUpdateDose(prodId, Number(e.target.value))}
                            className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          />
                          <span className="text-xs font-semibold text-gray-700">{sp.doseUnit}</span>
                        </div>

                        <div className="text-right min-w-[100px]">
                          <div className="text-[11px] text-gray-400">Total no Tanque</div>
                          <div className="text-xs font-extrabold text-emerald-700">
                            {totalForTank}{' '}
                            <span className="font-normal text-gray-600">
                              {sp.doseUnit.includes('kg') || sp.doseUnit.includes('g') ? 'kg' : 'L'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveProduct(prodId)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sequential Mixing Order (Ordem de Adição W-A-L-E-S) */}
          {(selectedProducts || []).length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-gray-900 text-base">Ordem Técnica de Adição no Tanque</h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Sequência WALES Oficial
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {/* Step 0: Water Base */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Abastecimento de Água Inicial (50% a 70%)</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Encher o tanque com pelo menos 60% da água limpa e ligar a agitação mecânica/hidráulica antes de colocar qualquer produto.
                    </p>
                  </div>
                </div>

                {/* Ordered Products Steps */}
                {evaluation.sortedByMixingOrder.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-colors flex items-start gap-3 shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 2}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          {item.product.commercialName} ({item.product.formulation})
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {(item.dose * evaluation.totalHectaresPerTank).toFixed(2)}{' '}
                          {item.doseUnit.includes('kg') || item.doseUnit.includes('g') ? 'kg' : 'L'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {item.product.formulation === 'WP' || item.product.formulation === 'WG'
                          ? 'Realizar pré-diluição em balde com água se necessário e aguardar 3 minutos de agitação.'
                          : item.product.agrochemicalClass === 'condicionador_calda'
                          ? 'Condicionador: Adicionar no início para neutralizar cátions e tamponar o pH da água.'
                          : `Adicionar lentamente com agitação constante. Formulação ${item.product.formulation}.`}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Final Step: Complete Water */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {(evaluation.sortedByMixingOrder || []).length + 2}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Completar o Volume Total do Tanque (100%)</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Completar o volume restante com água e manter o agitador ligado por no mínimo 5 minutos antes do início da pulverização.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Seleção e Busca de Produtos */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Adicionar Insumo ao Tanque</h3>
                <p className="text-xs text-gray-500">Selecione defensivos, adjuvantes ou fertilizantes foliares</p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
              <input
                type="text"
                placeholder="Buscar por nome comercial, ingrediente ativo ou formulação..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'herbicida', label: 'Herbicidas' },
                    { id: 'fungicida', label: 'Fungicidas' },
                    { id: 'inseticida', label: 'Inseticidas' },
                    { id: 'adjuvante', label: 'Adjuvantes' },
                    { id: 'fertilizante_foliar', label: 'Foliares' },
                    { id: 'condicionador_calda', label: 'Condicionadores' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedClassFilter(cat.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        selectedClassFilter === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                  <span className="font-semibold text-[11px] text-gray-500">Formulação:</span>
                  <select
                    value={selectedFormulationFilter}
                    onChange={e => setSelectedFormulationFilter(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="todas">Todas as Siglas</option>
                    {FORMULATION_DATABASE.map(f => (
                      <option key={f.code} value={f.code}>
                        {f.code} - {f.fullName.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100">
              {(filteredCatalog || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">Nenhum produto encontrado com estes filtros.</div>
              ) : (
                (filteredCatalog || []).filter(product => product && product.id).map(product => {
                  const isAdded = (selectedProducts || []).some(p => p?.productId === product.id);
                  return (
                    <div
                      key={product.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{product.commercialName}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">
                            {product.formulation}
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium capitalize">
                            {product.agrochemicalClass.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {product.activeIngredient} • Dose padrão: {product.defaultDose} {product.doseUnit}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={isAdded}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isAdded ? 'Já no Tanque' : 'Adicionar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Teste de Jarra (Jar Test) Passo a Passo */}
      {showJarTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-amber-500 text-gray-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FlaskConical className="w-5 h-5" />
                  <span>Protocolo Técnico de Teste de Jarra (Jar Test - 1 Litro)</span>
                </div>
                <p className="text-xs text-amber-950/80 mt-0.5">
                  Proporções milimétricas calculadas para validação em frasco graduado antes de abastecer o tanque
                </p>
              </div>
              <button
                onClick={() => setShowJarTestModal(false)}
                className="text-amber-950 hover:bg-amber-600/30 p-1.5 rounded-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Instrução Prática:</strong> Utilize um béquer ou jarro transparente de 1.000 mL (1 Litro) e a mesma água que será utilizada no abastecimento do pulverizador.
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordem de Adição no Jarro (1L)</h4>
                {jarTest.steps.map(step => (
                  <div key={step.stepNumber} className="p-3 rounded-xl border border-gray-200 bg-white flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {step.productName} ({step.formulation})
                      </div>
                      <div className="text-xs font-bold text-emerald-700 mt-0.5">{step.jarDoseText}</div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{step.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tempos de Leitura e Avaliação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {jarTest.checkpoints.map(cp => (
                    <div key={cp.timeMinutes} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                      <span className="font-bold text-emerald-700">{cp.timeMinutes} minutos:</span>
                      <p className="text-gray-600 text-[11px] mt-0.5">{cp.criteria}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowJarTestModal(false)}
                className="bg-gray-900 text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-gray-800"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Salvar Receita */}
      {showSaveRecipePrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Salvar Receita de Calda</h3>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nome da Receita</label>
              <input
                type="text"
                placeholder="Ex: Dessecação Buva e Amargoso 2026"
                value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Observações Técnicas</label>
              <textarea
                rows={3}
                placeholder="Ex: Aplicar nas primeiras horas da manhã com umidade > 60%..."
                value={recipeNotes}
                onChange={e => setRecipeNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveRecipePrompt(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!recipeName) return;
                  onSaveRecipe(recipeName, recipeNotes);
                  setShowSaveRecipePrompt(false);
                  setRecipeName('');
                  setRecipeNotes('');
                }}
                disabled={!recipeName}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                Salvar no Banco
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
