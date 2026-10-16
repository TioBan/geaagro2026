import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Calculator,
  ShieldAlert,
  Clock,
  Pill,
  Sparkles,
  FileText,
  Printer,
  Info,
  CheckCircle,
  X,
  ChevronRight,
  Stethoscope,
  Building2,
  Syringe,
  AlertTriangle,
  Layers,
  Tag,
  ListFilter,
  ArrowRight,
  Check,
  Calendar,
  Layers3,
} from 'lucide-react';
import { VeterinaryProduct, ProductCategory } from '../types/veterinaryBulario';
import { Farm, RuralProducer, Agronomist, Company } from '../types/agronomy';
import {
  ALL_VETERINARY_PRODUCTS,
  PRODUCT_CATEGORIES,
  TARGET_SPECIES_LIST,
  calculateProductDose,
} from '../data/veterinaryBularioDatabase';
import { VeterinaryPrescriptionModule } from './veterinary/VeterinaryPrescriptionModule';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

export const VeterinaryBularioModule: React.FC<VeterinaryBularioModuleProps> = ({
  isDarkMode: propIsDarkMode,
  setIsDarkMode: propSetIsDarkMode,
  companies = [],
  farms = [],
  producers = [],
  agronomists = [],
  setAgronomists,
  activeSubTab = 'bulario',
  setActiveSubTab,
  setActiveTab,
}) => {
  // Theme State with detection and sync
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agronutri_theme');
      if (saved) return saved === 'dark';
      return (
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('agronutri_theme') === 'dark';
      setInternalDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : internalDarkMode;

  // Active Main SubTab
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<VeterinaryProduct | null>(null);

  // Dosage Calculator State
  const [calcModalProduct, setCalcModalProduct] = useState<VeterinaryProduct | null>(null);
  const [calcSpecies, setCalcSpecies] = useState<string>('Bovinos');
  const [calcWeight, setCalcWeight] = useState<number>(450);

  // Cross-module prescription product transfer
  const [productToPrescribe, setProductToPrescribe] = useState<VeterinaryProduct | null>(null);

  // List of all laboratories with count, sorted strictly in alphabetical order
  const laboratoriesList = useMemo(() => {
    const predefinedLabs = [
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

    return predefinedLabs
      .map((lab) => {
        const count = ALL_VETERINARY_PRODUCTS.filter((p) => {
          const mfg = p.manufacturer.toLowerCase();
          const target = lab.id.toLowerCase();
          if (mfg.includes(target)) return true;
          if (target === 'bayer' && mfg.includes('elanco')) return true;
          if (target === 'biovet' && mfg.includes('vaxxinova')) return true;
          return false;
        }).length;
        return { ...lab, count };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return ALL_VETERINARY_PRODUCTS.filter((prod) => {
      // Alphabetical filter
      if (selectedLetter) {
        const firstLetter = prod.name.trim().charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }

      // Species filter
      if (
        selectedSpecies !== 'all' &&
        !(prod.targetSpecies || []).some((sp) => sp.toLowerCase() === selectedSpecies.toLowerCase())
      ) {
        return false;
      }

      // Manufacturer filter
      if (selectedManufacturer !== 'all') {
        const mfg = prod.manufacturer.toLowerCase();
        const target = selectedManufacturer.toLowerCase();
        const matches =
          mfg.includes(target) ||
          (target === 'bayer' && mfg.includes('elanco')) ||
          (target === 'biovet' && mfg.includes('vaxxinova'));
        if (!matches) {
          return false;
        }
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesActive = prod.activeIngredient.toLowerCase().includes(q);
        const matchesIndication = prod.indications.toLowerCase().includes(q);
        const matchesManufacturer = prod.manufacturer.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesActive ||
          matchesIndication ||
          matchesManufacturer ||
          matchesCategory
        );
      }

      return true;
    });
  }, [searchQuery, selectedLetter, selectedCategory, selectedSpecies, selectedManufacturer]);

  // Open calculator for a product
  const handleOpenCalculator = (product: VeterinaryProduct) => {
    setCalcModalProduct(product);
    if ((product.targetSpecies || []).length > 0) {
      setCalcSpecies(product.targetSpecies[0]);
    }
  };

  // Transfer product to prescription module
  const handleSendToPrescription = (product: VeterinaryProduct) => {
    setProductToPrescribe(product);
    handleTabChange('receituario');
  };

  const calculatedDoseResult = useMemo(() => {
    if (!calcModalProduct) return null;
    return calculateProductDose(calcModalProduct, calcSpecies, calcWeight);
  }, [calcModalProduct, calcSpecies, calcWeight]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedLetter !== null ||
    selectedCategory !== 'all' ||
    selectedSpecies !== 'all' ||
    selectedManufacturer !== 'all';

  return (
    <div
      id="veterinary-bulario-module"
      className={`min-h-screen transition-colors duration-200 pb-16 ${
        isDarkMode
          ? 'bg-black text-zinc-100 dark'
          : 'bg-[#f8faf9] text-slate-900'
      }`}
    >
      {/* Top Header & Navigation Switcher */}
      <div
        className={`border-b relative z-10 shadow-xs transition-colors duration-200 ${
          isDarkMode
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Análise Técnica &bull; Farmacologia & Sanidade Animal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 flex flex-wrap items-center gap-3">
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Compêndio Veterinário
                </span>
                <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 rounded-full border border-emerald-200">
                  {ALL_VETERINARY_PRODUCTS.length} Produtos Cadastrados
                </span>
              </h1>
              <p
                className={`text-sm mt-0.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                Consulta de bulas farmacológicas, prescrição oficial (CFMV/MAPA), calculadora de doses e prazos de carência.
              </p>
            </div>

            {/* SubTab Navigation Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('bulario')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'bulario'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Bulário ({ALL_VETERINARY_PRODUCTS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('receituario')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'receituario' || currentTab === 'protocolos' || currentTab === 'historico_receitas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Módulo de Receituário</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('calculadora')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'calculadora'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Calculadora de Doses</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('carencias')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'carencias'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Prazos de Carência</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: RECEITUÁRIO VETERINÁRIO (DEDICATED MODULE) */}
      {(currentTab === 'receituario' || currentTab === 'protocolos' || currentTab === 'historico_receitas') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <VeterinaryPrescriptionModule
            isDarkMode={isDarkMode}
            companies={companies}
            farms={farms}
            producers={producers}
            agronomists={agronomists}
            setAgronomists={setAgronomists}
            initialProductToPrescribe={productToPrescribe}
            onClearInitialProduct={() => setProductToPrescribe(null)}
            onNavigateToBulario={() => handleTabChange('bulario')}
            onNavigateToCadastros={
              setActiveTab
                ? () => {
                    setActiveTab('cadastros');
                    if (setActiveSubTab) setActiveSubTab('agronomos');
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* SUB-VIEW 2: CALCULADORA DE DOSES INTERATIVA */}
      {currentTab === 'calculadora' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Calculadora Técnica de Dosagem Veterinária
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cálculo automático de volume (mL / gramas / frascos) por espécie e peso corporal vivo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Selecione o Medicamento do Bulário:
                </label>
                <select
                  value={calcModalProduct?.id || ''}
                  onChange={(e) => {
                    const prod = ALL_VETERINARY_PRODUCTS.find((p) => p.id === e.target.value);
                    if (prod) {
                      setCalcModalProduct(prod);
                      if ((prod.targetSpecies || []).length > 0) setCalcSpecies(prod.targetSpecies[0]);
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Selecione um medicamento...</option>
                  {ALL_VETERINARY_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.manufacturer})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Espécie Alvo:
                </label>
                <select
                  value={calcSpecies}
                  onChange={(e) => setCalcSpecies(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  {TARGET_SPECIES_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Peso Corporal Estimado (kg):
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            {calcModalProduct && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-200">
                    Resultado do Cálculo: {calcModalProduct.name}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    {calcSpecies} • {calcWeight} kg
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-emerald-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">DOSE CALCULADA RECOMENDADA:</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                      {calculatedDoseResult?.doseFormatted || calcModalProduct.dosage}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Via de administração: <strong>{calcModalProduct.administrationRoute}</strong>
                    </span>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-emerald-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CARÊNCIA SANITÁRIA (MAPA):</span>
                    <div className="mt-1 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                      <div>🥩 <strong>Abate:</strong> {calcModalProduct.gracePeriodMeat || 'Zero dias'}</div>
                      <div>🥛 <strong>Leite:</strong> {calcModalProduct.gracePeriodMilk || 'Zero horas'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => handleSendToPrescription(calcModalProduct)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Emitir Receituário com Esta Dose</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TABELA DE CARÊNCIAS */}
      {currentTab === 'carencias' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Tabela Oficial de Prazos de Carência Sanitária (MAPA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Prazos legais obrigatórios de retenção de abate e descarte de leite para conformidade sanitária e exportação.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Produto Comercial</th>
                    <th className="py-2.5 px-3">Princípio Ativo</th>
                    <th className="py-2.5 px-3">Fabricante</th>
                    <th className="py-2.5 px-3">Carência Abate (Carne)</th>
                    <th className="py-2.5 px-3">Carência Leite</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {ALL_VETERINARY_PRODUCTS.slice(0, 100).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{prod.name}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{prod.activeIngredient}</td>
                      <td className="py-2.5 px-3 text-slate-500">{prod.manufacturer}</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-700 dark:text-amber-400">
                        {prod.gracePeriodMeat || 'Descarte Zero'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-700 dark:text-amber-400">
                        {prod.gracePeriodMilk || 'Descarte Zero'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSendToPrescription(prod)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-bold text-[10px] hover:bg-emerald-100 cursor-pointer"
                        >
                          Receitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: BULÁRIO DE MEDICAMENTOS (1600+ PRODUTOS) */}
      {currentTab === 'bulario' && (
        <>
          {/* Filters Area */}
          <div
            className={`border-b shadow-2xs transition-colors duration-200 ${
              isDarkMode
                ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome do produto, princípio ativo (ex: Ivermectina, Enrofloxacino, Meloxicam), indicação ou laboratório..."
                  className={`w-full pl-11 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Modern Dropdown Filters Bar */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Laboratório Dropdown */}
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 pointer-events-none z-10" />
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border appearance-none focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer transition-colors ${
                      selectedManufacturer !== 'all'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200'
                        : isDarkMode
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <option value="all">Laboratório: Todos os Fabricantes ({(laboratoriesList || []).length})</option>
                    {laboratoriesList.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.label} ({lab.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Categoria Dropdown */}
                <div className="relative flex items-center">
                  <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 pointer-events-none z-10" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border appearance-none focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer transition-colors ${
                      selectedCategory !== 'all'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200'
                        : isDarkMode
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <option value="all">Categoria: Todas as Categorias</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Espécie Dropdown */}
                <div className="relative flex items-center">
                  <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 pointer-events-none z-10" />
                  <select
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border appearance-none focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer transition-colors ${
                      selectedSpecies !== 'all'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200'
                        : isDarkMode
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <option value="all">Espécie: Todas as Espécies</option>
                    {TARGET_SPECIES_LIST.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Letra Inicial Dropdown */}
                <div className="relative flex items-center">
                  <ListFilter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 pointer-events-none z-10" />
                  <select
                    value={selectedLetter || 'all'}
                    onChange={(e) => setSelectedLetter(e.target.value === 'all' ? null : e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border appearance-none focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer transition-colors ${
                      selectedLetter !== null
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200'
                        : isDarkMode
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <option value="all">Letra Inicial: Todas (A-Z)</option>
                    {ALPHABET.map((letter) => (
                      <option key={letter} value={letter}>
                        Letra &quot;{letter}&quot;
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Alphabet Pills Bar */}
              <div className="flex flex-wrap items-center gap-1 pt-1 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedLetter === null
                      ? 'bg-emerald-600 text-white'
                      : isDarkMode
                      ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                {ALPHABET.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                      selectedLetter === letter
                        ? 'bg-emerald-600 text-white'
                        : isDarkMode
                        ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Exibindo {(filteredProducts || []).length} medicamentos veterinários encontrados
              </span>
            </div>

            {(filteredProducts || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-slate-200/80 hover:border-emerald-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      className={`p-4 sm:p-5 border-b ${
                        isDarkMode
                          ? 'border-zinc-800 bg-zinc-950/40'
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <Pill className="w-3 h-3" />
                          {prod.category}
                        </span>
                        {prod.requiresPrescription && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800"
                            title="Venda sob prescrição do médico veterinário"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Sob Prescrição
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-lg font-bold mt-2 transition-colors ${
                          isDarkMode
                            ? 'text-white group-hover:text-emerald-400'
                            : 'text-slate-900 group-hover:text-emerald-700'
                        }`}
                      >
                        {prod.name}
                      </h3>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{prod.activeIngredient}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                      {/* Target Species */}
                      <div>
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}
                        >
                          Espécies Indicadas:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {prod.targetSpecies.map((sp) => (
                            <span
                              key={sp}
                              className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                isDarkMode
                                  ? 'bg-zinc-800 text-zinc-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Indications */}
                      <div>
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider block mb-0.5 ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}
                        >
                          Indicações Terapêuticas:
                        </span>
                        <p
                          className={`line-clamp-2 leading-relaxed ${
                            isDarkMode ? 'text-zinc-300' : 'text-slate-600'
                          }`}
                        >
                          {prod.indications}
                        </p>
                      </div>

                      {/* Dosage & Administration */}
                      <div
                        className={`rounded-xl p-3 border space-y-1.5 ${
                          isDarkMode
                            ? 'bg-zinc-950/80 border-zinc-800'
                            : 'bg-slate-50 border-slate-200/70'
                        }`}
                      >
                        <div>
                          <div
                            className={`font-semibold flex items-center gap-1 text-[11px] ${
                              isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                            }`}
                          >
                            <Syringe className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Dosagem e Modo de Usar:</span>
                          </div>
                          <p
                            className={`mt-0.5 leading-snug ${
                              isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                            }`}
                          >
                            {prod.dosage}
                          </p>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-[11px] pt-1 border-t ${
                            isDarkMode
                              ? 'border-zinc-800 text-zinc-400'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <span
                            className={`font-medium ${
                              isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                            }`}
                          >
                            Via:
                          </span>
                          <span>{prod.administrationRoute}</span>
                        </div>
                      </div>

                      {/* Grace Period (Carência) */}
                      {(prod.gracePeriodMilk || prod.gracePeriodMeat) && (
                        <div
                          className={`rounded-xl p-2.5 border text-[11px] space-y-1 ${
                            isDarkMode
                              ? 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                              : 'bg-amber-50/60 border-amber-200/70 text-amber-900'
                          }`}
                        >
                          <div className="font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Período de Carência:</span>
                          </div>
                          {prod.gracePeriodMilk && (
                            <div>
                              <strong>Leite:</strong> {prod.gracePeriodMilk}
                            </div>
                          )}
                          {prod.gracePeriodMeat && (
                            <div>
                              <strong>Abate / Carne:</strong> {prod.gracePeriodMeat}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      className={`p-4 sm:p-5 pt-0 flex items-center gap-2 border-t mt-2 ${
                        isDarkMode
                          ? 'bg-zinc-900 border-zinc-800/80'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className={`flex-1 py-2 px-3 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Info className="w-3.5 h-3.5 opacity-80" />
                        <span>Detalhes</span>
                      </button>

                      <button
                        onClick={() => handleOpenCalculator(prod)}
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        title="Calcular dosagem exata por peso do animal"
                      >
                        <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Dose</span>
                      </button>

                      <button
                        onClick={() => handleSendToPrescription(prod)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        title="Adicionar medicamento ao Receituário Veterinário Oficial"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receitar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-2xl border p-12 text-center max-w-md mx-auto my-8 ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Pill className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-base">Nenhum medicamento encontrado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tente ajustar a busca ou limpar os filtros de categoria e laboratório.
                </p>
                <button
                  onClick={() => {
                    setSelectedLetter(null);
                    setSelectedCategory('all');
                    setSelectedSpecies('all');
                    setSelectedManufacturer('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden ${
              isDarkMode
                ? 'bg-zinc-900 border-zinc-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 bg-emerald-600 text-white flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider bg-emerald-700 px-2 py-0.5 rounded">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">{selectedProduct.name}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Princípio Ativo: <strong>{selectedProduct.activeIngredient}</strong> ({selectedProduct.concentration})
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block font-medium">Fabricante:</span>
                  <span className="font-bold">{selectedProduct.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block font-medium">Registro MAPA:</span>
                  <span className="font-bold">{selectedProduct.mapaRegistration}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Indicações e Modo de Ação</h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{selectedProduct.indications}</p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Posologia e Dosagem</h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{selectedProduct.dosage}</p>
                <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  Via de Administração: {selectedProduct.administrationRoute}
                </div>
              </div>

              {(selectedProduct.gracePeriodMeat || selectedProduct.gracePeriodMilk) && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Período de Carência Oficial</span>
                  </h4>
                  {selectedProduct.gracePeriodMeat && (
                    <div>🥩 <strong>Abate:</strong> {selectedProduct.gracePeriodMeat}</div>
                  )}
                  {selectedProduct.gracePeriodMilk && (
                    <div>🥛 <strong>Leite:</strong> {selectedProduct.gracePeriodMilk}</div>
                  )}
                </div>
              )}

              {selectedProduct.contraindications && (
                <div>
                  <h4 className="font-bold text-sm mb-1 text-rose-600 dark:text-rose-400">Contraindicações & Efeitos Adversos</h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{selectedProduct.contraindications}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleOpenCalculator(p);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Calculator className="w-4 h-4" />
                <span>Calcular Dose</span>
              </button>

              <button
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleSendToPrescription(p);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Adicionar ao Receituário</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Dosage Calculator Modal */}
      {calcModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-lg w-full shadow-2xl border overflow-hidden ${
              isDarkMode
                ? 'bg-zinc-900 border-zinc-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Calculadora de Dosagem Animal</h3>
              </div>
              <button
                onClick={() => setCalcModalProduct(null)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{calcModalProduct.name}</span>
                <span className="block text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
                  {calcModalProduct.activeIngredient} • {calcModalProduct.manufacturer}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Espécie Alvo:
                  </label>
                  <select
                    value={calcSpecies}
                    onChange={(e) => setCalcSpecies(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {calcModalProduct.targetSpecies.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Peso do Animal (kg):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className={`w-full p-2 rounded-xl border text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {calculatedDoseResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DOSE CALCULADA:</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {calculatedDoseResult.doseFormatted}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Via: <strong>{calcModalProduct.administrationRoute}</strong>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`p-4 border-t flex items-center justify-between ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                onClick={() => setCalcModalProduct(null)}
                className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer text-xs"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const p = calcModalProduct;
                  setCalcModalProduct(null);
                  handleSendToPrescription(p);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Prescrever no Receituário</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
