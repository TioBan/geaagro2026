import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Calculator,
  ShieldAlert,
  Clock,
  Pill,
  FileText,
  Info,
  X,
  Building2,
  Syringe,
  AlertTriangle,
  Tag,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { VeterinaryProduct } from '../types/veterinaryBulario';
import { Farm, RuralProducer, Agronomist, Company } from '../types/agronomy';
import {
  ALL_VETERINARY_PRODUCTS,
  PRODUCT_CATEGORIES,
  TARGET_SPECIES_LIST,
  calculateProductDose,
} from '../data/veterinaryBularioDatabase';
import {
  VeterinaryPrescriptionModule,
  PrescriptionSubView,
} from './veterinary/VeterinaryPrescriptionModule';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAGE_BATCH_SIZE = 48;

const PREDEFINED_LABS = [
  { id: 'Agener', label: 'Agener União' },
  { id: 'Alere', label: 'Alere' },
  { id: 'Avert', label: 'Avert Saúde Animal' },
  { id: 'Bayer', label: 'Bayer / Elanco' },
  { id: 'Bimeda', label: 'Bimeda' },
  { id: 'Biofarm', label: 'Biofarm' },
  { id: 'Biogénesis', label: 'Biogénesis Bagó' },
  { id: 'Bionatural', label: 'Bionatural' },
  { id: 'Biosyn', label: 'Biosyn' },
  { id: 'Biovet', label: 'Biovet / Vaxxinova' },
  { id: 'Boehringer', label: 'Boehringer Ingelheim' },
  { id: 'Calbos', label: 'Calbos' },
  { id: 'Ceva', label: 'Ceva' },
  { id: 'Champion', label: 'Champion' },
  { id: 'Chemitec', label: 'Chemitec' },
  { id: 'Clarion', label: 'Clarion' },
  { id: 'Dechra', label: 'Dechra' },
  { id: 'Hipra', label: 'Hipra' },
  { id: 'Ibasa', label: 'Ibasa' },
  { id: 'MSD', label: 'MSD Saúde Animal' },
  { id: 'Ourofino', label: 'Ourofino' },
  { id: 'Syntec', label: 'Syntec' },
  { id: 'Vallée', label: 'Vallée' },
  { id: 'Vansil', label: 'Vansil' },
  { id: 'Vetbras', label: 'VetBras' },
  { id: 'Vetnil', label: 'Vetnil' },
  { id: 'Virbac', label: 'Virbac' },
  { id: 'Zoetis', label: 'Zoetis' },
];

export interface VeterinaryBularioModuleProps {
  isDarkMode?: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
  companies?: Company[];
  farms?: Farm[];
  producers?: RuralProducer[];
  agronomists?: Agronomist[];
  setAgronomists?: React.Dispatch<React.SetStateAction<Agronomist[]>>;
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  setActiveTab?: (tab: string) => void;
}

const matchesLab = (manufacturer: string, labId: string): boolean => {
  const mfg = manufacturer.toLowerCase();
  const target = labId.toLowerCase();
  return (
    mfg.includes(target) ||
    (target === 'bayer' && mfg.includes('elanco')) ||
    (target === 'biovet' && mfg.includes('vaxxinova'))
  );
};

const parseMlValue = (doseFormatted?: string): number | null => {
  if (!doseFormatted) return null;
  const m = doseFormatted.match(/([\d.,]+)\s*mL/i);
  if (!m) return null;
  const num = Number(m[1].replace(',', '.'));
  return Number.isFinite(num) ? num : null;
};

export const VeterinaryBularioModule: React.FC<VeterinaryBularioModuleProps> = ({
  companies = [],
  farms = [],
  producers = [],
  agronomists = [],
  setAgronomists,
  activeSubTab = 'bulario',
  setActiveSubTab,
  setActiveTab,
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab || 'bulario');

  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // Catalog Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_BATCH_SIZE);
  const [selectedProduct, setSelectedProduct] = useState<VeterinaryProduct | null>(null);

  // Grace Period Table Filters & Pagination
  const [carenciaQuery, setCarenciaQuery] = useState('');
  const [carenciaCategory, setCarenciaCategory] = useState('all');
  const [carenciaSpecies, setCarenciaSpecies] = useState('all');
  const [carenciaVisibleCount, setCarenciaVisibleCount] = useState<number>(60);

  // Dosage Calculator State (separate quick modal flag so tab doesn't spawn modal)
  const [calcProduct, setCalcProduct] = useState<VeterinaryProduct | null>(
    () => ALL_VETERINARY_PRODUCTS[0] || null
  );
  const [calcQuickModalOpen, setCalcQuickModalOpen] = useState(false);
  const [calcSearch, setCalcSearch] = useState('');
  const [calcSpecies, setCalcSpecies] = useState<string>('Bovinos');
  const [calcWeight, setCalcWeight] = useState<number>(450);
  const [calcAnimalCount, setCalcAnimalCount] = useState<number>(1);

  // Cross-module product transfer to Prescription
  const [productToPrescribe, setProductToPrescribe] = useState<VeterinaryProduct | null>(null);

  // Reset pagination when catalog filters change
  useEffect(() => {
    setVisibleCount(PAGE_BATCH_SIZE);
  }, [searchQuery, selectedLetter, selectedCategory, selectedSpecies, selectedManufacturer]);

  useEffect(() => {
    setCarenciaVisibleCount(60);
  }, [carenciaQuery, carenciaCategory, carenciaSpecies]);

  const laboratoriesList = useMemo(() => {
    return PREDEFINED_LABS.map((lab) => ({
      ...lab,
      count: ALL_VETERINARY_PRODUCTS.filter((p) => matchesLab(p.manufacturer, lab.id)).length,
    }))
      .filter((lab) => lab.count > 0)
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_VETERINARY_PRODUCTS.filter((prod) => {
      if (selectedLetter && prod.name.trim().charAt(0).toUpperCase() !== selectedLetter) {
        return false;
      }
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }
      if (
        selectedSpecies !== 'all' &&
        !(prod.targetSpecies || []).some((sp) => sp.toLowerCase() === selectedSpecies.toLowerCase())
      ) {
        return false;
      }
      if (selectedManufacturer !== 'all' && !matchesLab(prod.manufacturer, selectedManufacturer)) {
        return false;
      }
      if (q) {
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.activeIngredient.toLowerCase().includes(q) ||
          prod.indications.toLowerCase().includes(q) ||
          prod.manufacturer.toLowerCase().includes(q) ||
          prod.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedLetter, selectedCategory, selectedSpecies, selectedManufacturer]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const filteredCarencias = useMemo(() => {
    const q = carenciaQuery.trim().toLowerCase();
    return ALL_VETERINARY_PRODUCTS.filter((prod) => {
      if (carenciaCategory !== 'all' && prod.category !== carenciaCategory) return false;
      if (
        carenciaSpecies !== 'all' &&
        !(prod.targetSpecies || []).some((sp) => sp.toLowerCase() === carenciaSpecies.toLowerCase())
      ) {
        return false;
      }
      if (q) {
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.activeIngredient.toLowerCase().includes(q) ||
          prod.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [carenciaQuery, carenciaCategory, carenciaSpecies]);

  const calcSearchResults = useMemo(() => {
    const q = calcSearch.trim().toLowerCase();
    if (!q) return ALL_VETERINARY_PRODUCTS.slice(0, 60);
    return ALL_VETERINARY_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.activeIngredient.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
    ).slice(0, 60);
  }, [calcSearch]);

  const calculatedDoseResult = useMemo(() => {
    if (!calcProduct) return null;
    return calculateProductDose(calcProduct, calcSpecies, calcWeight);
  }, [calcProduct, calcSpecies, calcWeight]);

  const totalHerdMl = useMemo(() => {
    const perHead = parseMlValue(calculatedDoseResult?.doseFormatted);
    if (perHead === null) return null;
    return perHead * Math.max(1, calcAnimalCount);
  }, [calculatedDoseResult, calcAnimalCount]);

  const handleOpenQuickCalculator = (product: VeterinaryProduct) => {
    setCalcProduct(product);
    if ((product.targetSpecies || []).length > 0) {
      setCalcSpecies(product.targetSpecies[0]);
    }
    setCalcQuickModalOpen(true);
  };

  const handleSendToPrescription = (product: VeterinaryProduct) => {
    setProductToPrescribe(product);
    handleTabChange('receituario');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedLetter !== null ||
    selectedCategory !== 'all' ||
    selectedSpecies !== 'all' ||
    selectedManufacturer !== 'all';

  const clearCatalogFilters = () => {
    setSearchQuery('');
    setSelectedLetter(null);
    setSelectedCategory('all');
    setSelectedSpecies('all');
    setSelectedManufacturer('all');
  };

  const isPrescriptionTab =
    currentTab === 'receituario' ||
    currentTab === 'protocolos' ||
    currentTab === 'historico_receitas';

  const prescriptionSubView: PrescriptionSubView =
    currentTab === 'protocolos'
      ? 'protocolos'
      : currentTab === 'historico_receitas'
      ? 'historico'
      : 'emitir';

  const handlePrescriptionSubViewChange = (view: PrescriptionSubView) => {
    if (view === 'protocolos') handleTabChange('protocolos');
    else if (view === 'historico') handleTabChange('historico_receitas');
    else handleTabChange('receituario');
  };

  const prescriptionControlledCount = useMemo(
    () => ALL_VETERINARY_PRODUCTS.filter((p) => p.requiresPrescription).length,
    []
  );

  return (
    <div id="veterinary-bulario-module" className="space-y-4 pb-8">
      {/* Compact Header & Navigation Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Farmacologia &amp; Sanidade Animal · {ALL_VETERINARY_PRODUCTS.length.toLocaleString('pt-BR')} produtos ·{' '}
              {laboratoriesList.length} laboratórios
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 mt-0.5">
              Compêndio Veterinário
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Consulta de bulas, prescrição oficial (CFMV/MAPA), protocolos clínicos, calculadora de doses e prazos de carência.
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 lg:pb-0">
            <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs">
              {(
                [
                  { id: 'bulario', label: 'Bulário', icon: BookOpen },
                  { id: 'receituario', label: 'Receituário', icon: FileText },
                  { id: 'protocolos', label: 'Protocolos', icon: Sparkles },
                  { id: 'historico_receitas', label: 'Histórico', icon: Clock },
                  { id: 'calculadora', label: 'Calculadora', icon: Calculator },
                  { id: 'carencias', label: 'Carências', icon: ShieldAlert },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: RECEITUÁRIO / PROTOCOLOS / HISTÓRICO */}
      {isPrescriptionTab && (
        <VeterinaryPrescriptionModule
          companies={companies}
          farms={farms}
          producers={producers}
          agronomists={agronomists}
          setAgronomists={setAgronomists}
          initialProductToPrescribe={productToPrescribe}
          onClearInitialProduct={() => setProductToPrescribe(null)}
          onNavigateToBulario={() => handleTabChange('bulario')}
          activeSubView={prescriptionSubView}
          onSubViewChange={handlePrescriptionSubViewChange}
          onNavigateToCadastros={
            setActiveTab
              ? () => {
                  setActiveTab('cadastros');
                  if (setActiveSubTab) setActiveSubTab('agronomos');
                }
              : undefined
          }
        />
      )}

      {/* SUB-VIEW 2: CALCULADORA DE DOSES INTERATIVA */}
      {currentTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Seletor Pesquisável de Medicamento */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                1. Selecionar Medicamento
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pesquise pelo nome comercial, princípio ativo ou laboratório.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={calcSearch}
                onChange={(e) => setCalcSearch(e.target.value)}
                placeholder="Ex: Ivermectina, Draxxin, Meloxicam..."
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg">
              {calcSearchResults.map((p) => {
                const selected = calcProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setCalcProduct(p);
                      if ((p.targetSpecies || []).length > 0) setCalcSpecies(p.targetSpecies[0]);
                    }}
                    className={`w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold truncate ${
                        selected
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {p.activeIngredient} · {p.manufacturer}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parâmetros e Resultado */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                2. Parâmetros de Cálculo por Peso Vivo &amp; Lote
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Cálculo automático da dose individual e volume total para o lote.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Espécie Alvo
                </label>
                <select
                  value={calcSpecies}
                  onChange={(e) => setCalcSpecies(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {TARGET_SPECIES_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Nº de Animais no Lote
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={calcAnimalCount}
                  onChange={(e) => setCalcAnimalCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {calcProduct ? (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {calcProduct.category} · {calcProduct.manufacturer} · MAPA {calcProduct.mapaRegistration}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {calcProduct.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    {calcProduct.activeIngredient} ({calcProduct.concentration})
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
                  <div className="p-3.5 space-y-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Dose Individual ({calcSpecies} · {calcWeight} kg)
                    </span>
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {calculatedDoseResult?.doseFormatted || calcProduct.dosage}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Via: <strong className="text-slate-800 dark:text-zinc-200">{calcProduct.administrationRoute}</strong>
                    </p>
                    {calculatedDoseResult?.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{calculatedDoseResult.notes}</p>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Volume Total ({calcAnimalCount} cab) &amp; Carência
                    </span>
                    {totalHerdMl !== null ? (
                      <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {totalHerdMl.toFixed(1).replace('.0', '')} mL
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        {calcAnimalCount} × ({calculatedDoseResult?.doseFormatted || 'conforme bula'})
                      </p>
                    )}
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5">
                      <div>Abate: {calcProduct.gracePeriodMeat || 'Zero dias'}</div>
                      <div>Leite: {calcProduct.gracePeriodMilk || 'Zero horas'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(calcProduct)}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
                  >
                    Ver Bula Completa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendToPrescription(calcProduct)}
                    className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Prescrever no Receituário
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione um medicamento ao lado para calcular a dose.
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TABELA DE CARÊNCIAS */}
      {currentTab === 'carencias' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Tabela Oficial de Prazos de Carência Sanitária (MAPA)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Prazos obrigatórios de retenção para abate e descarte de leite em todo o catálogo ({filteredCarencias.length.toLocaleString('pt-BR')} itens).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={carenciaQuery}
                  onChange={(e) => setCarenciaQuery(e.target.value)}
                  placeholder="Filtrar por medicamento, princípio ativo ou laboratório..."
                  className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  value={carenciaCategory}
                  onChange={(e) => setCarenciaCategory(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas as categorias</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <select
                  value={carenciaSpecies}
                  onChange={(e) => setCarenciaSpecies(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas as espécies</option>
                  {TARGET_SPECIES_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3.5">Produto Comercial</th>
                    <th className="py-2.5 px-3">Princípio Ativo</th>
                    <th className="py-2.5 px-3">Fabricante</th>
                    <th className="py-2.5 px-3">Carência Abate</th>
                    <th className="py-2.5 px-3">Carência Leite</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {filteredCarencias.slice(0, carenciaVisibleCount).map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-zinc-100">
                        {prod.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                        {prod.activeIngredient}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                        {prod.manufacturer}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-amber-700 dark:text-amber-400">
                        {prod.gracePeriodMeat || 'Descarte Zero'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-amber-700 dark:text-amber-400">
                        {prod.gracePeriodMilk || 'Descarte Zero'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(prod)}
                            className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
                          >
                            Bula
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendToPrescription(prod)}
                            className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium cursor-pointer"
                          >
                            Receitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCarencias.length > carenciaVisibleCount && (
              <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>
                  Exibindo {carenciaVisibleCount} de {filteredCarencias.length.toLocaleString('pt-BR')} produtos
                </span>
                <button
                  type="button"
                  onClick={() => setCarenciaVisibleCount((c) => c + 60)}
                  className="h-7 px-3 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
                >
                  Carregar mais 60
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: BULÁRIO DE MEDICAMENTOS */}
      {currentTab === 'bulario' && (
        <div className="space-y-4">
          {/* Unified KPI Strip */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
            <div className="p-3.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Catálogo Total
              </span>
              <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                {ALL_VETERINARY_PRODUCTS.length.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Resultados Filtrados
              </span>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                {filteredProducts.length.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Laboratórios
              </span>
              <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                {laboratoriesList.length}
              </p>
            </div>
            <div className="p-3.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Sob Prescrição Veterinária
              </span>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                {prescriptionControlledCount.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              <div className="lg:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produto, princípio ativo, indicação ou laboratório..."
                  className="w-full h-8 pl-8 pr-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    aria-label="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3 relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todos os laboratórios ({laboratoriesList.length})</option>
                  {laboratoriesList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.label} ({lab.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas categorias</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 relative">
                <Syringe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas espécies</option>
                  {TARGET_SPECIES_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compact A-Z Filter Strip */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedLetter(null)}
                  className={`h-6 px-2 text-[11px] font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
                    selectedLetter === null
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Todos
                </button>
                {ALPHABET.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                    className={`w-6 h-6 text-[11px] font-medium rounded-md transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                      selectedLetter === letter
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearCatalogFilters}
                  className="h-6 px-2 rounded-md text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Product Grid (Paginated for Instant Rendering) */}
          {visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleProducts.map((prod) => (
                  <article
                    key={prod.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-600/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-500 dark:text-zinc-400 truncate">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              {prod.category}
                            </span>
                            <span className="mx-1.5" aria-hidden="true">
                              ·
                            </span>
                            <span>{prod.manufacturer}</span>
                          </span>
                          {prod.requiresPrescription && (
                            <span
                              className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 shrink-0"
                              title="Venda sob prescrição do médico veterinário"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Prescrição
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1 leading-snug">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                          {prod.activeIngredient}
                          {prod.concentration ? ` (${prod.concentration})` : ''}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {prod.indications}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <div className="truncate">
                          <span className="font-medium text-slate-700 dark:text-zinc-300">Espécies:</span>{' '}
                          {(prod.targetSpecies || []).join(' · ')}
                        </div>
                        <div className="line-clamp-2">
                          <span className="font-medium text-slate-700 dark:text-zinc-300">Posologia:</span>{' '}
                          {prod.dosage} ({prod.administrationRoute})
                        </div>
                        {(prod.gracePeriodMeat || prod.gracePeriodMilk) && (
                          <div className="text-amber-700 dark:text-amber-400 flex items-center gap-1 pt-0.5 truncate">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              Carência: Abate {prod.gracePeriodMeat || 'Zero'} · Leite{' '}
                              {prod.gracePeriodMilk || 'Zero'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className="flex-1 h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Detalhes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickCalculator(prod)}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Calcular dose por peso"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        Dose
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendToPrescription(prod)}
                        className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1 cursor-pointer"
                        title="Adicionar ao Receituário Veterinário"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receitar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredProducts.length > visibleProducts.length && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>
                    Exibindo {visibleProducts.length.toLocaleString('pt-BR')} de{' '}
                    {filteredProducts.length.toLocaleString('pt-BR')} medicamentos encontrados
                  </span>
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_BATCH_SIZE)}
                    className="h-7 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                  >
                    Carregar mais {Math.min(PAGE_BATCH_SIZE, filteredProducts.length - visibleProducts.length)} produtos
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
              <Pill className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Nenhum medicamento encontrado
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ajuste os termos de busca ou limpe os filtros aplicados.
              </p>
              <button
                type="button"
                onClick={clearCatalogFilters}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {selectedProduct.category} · {selectedProduct.manufacturer}
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {selectedProduct.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Princípio Ativo: <strong className="text-slate-800 dark:text-zinc-200">{selectedProduct.activeIngredient}</strong>{' '}
                  ({selectedProduct.concentration})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Registro MAPA</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {selectedProduct.mapaRegistration}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Via de Administração</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">
                    {selectedProduct.administrationRoute}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Apresentação</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">
                    {selectedProduct.presentation || 'Conforme embalagem'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                  Espécies Indicadas
                </h4>
                <p className="text-slate-600 dark:text-zinc-300">
                  {(selectedProduct.targetSpecies || []).join(' · ')}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                  Indicações Terapêuticas
                </h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {selectedProduct.indications}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                  Posologia e Modo de Usar
                </h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {selectedProduct.dosage}
                </p>
              </div>

              {(selectedProduct.gracePeriodMeat || selectedProduct.gracePeriodMilk) && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-semibold inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Período de Carência Oficial
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {selectedProduct.gracePeriodMeat && (
                      <div>
                        <strong>Abate:</strong> {selectedProduct.gracePeriodMeat}
                      </div>
                    )}
                    {selectedProduct.gracePeriodMilk && (
                      <div>
                        <strong>Leite:</strong> {selectedProduct.gracePeriodMilk}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedProduct.contraindications && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
                    Contraindicações &amp; Precauções
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedProduct.contraindications}
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleOpenQuickCalculator(p);
                }}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                Calcular Dose
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleSendToPrescription(p);
                }}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Adicionar ao Receituário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Dosage Calculator Modal (only opened explicitly from card/details) */}
      {calcQuickModalOpen && calcProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCalcQuickModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Calculadora Rápida de Dose
              </h3>
              <button
                type="button"
                onClick={() => setCalcQuickModalOpen(false)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                <p className="font-semibold text-slate-900 dark:text-zinc-100">{calcProduct.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {calcProduct.activeIngredient} · {calcProduct.manufacturer}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Espécie Alvo
                  </label>
                  <select
                    value={calcSpecies}
                    onChange={(e) => setCalcSpecies(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    {(calcProduct.targetSpecies || TARGET_SPECIES_LIST).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Peso Vivo (kg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Dose Recomendada
                </span>
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {calculatedDoseResult?.doseFormatted || calcProduct.dosage}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Via: <strong className="text-slate-800 dark:text-zinc-200">{calcProduct.administrationRoute}</strong>
                </p>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCalcQuickModalOpen(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = calcProduct;
                  setCalcQuickModalOpen(false);
                  handleSendToPrescription(p);
                }}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Prescrever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
