import React, { useState } from 'react';
import { InputItem, InputCategory } from '../../types/costs';
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Check,
  X,
  AlertOctagon,
  TrendingDown,
  Sparkles,
  Layers,
  FlaskConical,
  ShoppingCart,
  Sliders,
  ShieldAlert,
  Clock,
  Building,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
} from 'lucide-react';

interface InputsStockViewProps {
  inputs: InputItem[];
  onAddInput: (input: InputItem) => void;
  onUpdateInput: (input: InputItem) => void;
  onDeleteInput: (id: string) => void;
  selectedFarmId: string;
}

export const InputsStockView: React.FC<InputsStockViewProps> = ({
  inputs = [],
  onAddInput,
  onUpdateInput,
  onDeleteInput,
  selectedFarmId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical_fert' | 'warning' | 'safe' | 'all_fert'>('all');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInput, setEditingInput] = useState<InputItem | null>(null);
  
  // Quick Restock Modal state
  const [quickRestockItem, setQuickRestockItem] = useState<InputItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number | ''>('');
  const [restockPrice, setRestockPrice] = useState<number | ''>('');
  const [restockBatch, setRestockBatch] = useState('');
  
  // Quick Threshold Adjustment Modal state
  const [adjustThresholdItem, setAdjustThresholdItem] = useState<InputItem | null>(null);
  const [newCriticalThreshold, setNewCriticalThreshold] = useState<number | ''>('');
  
  // Copy notification toast
  const [copySuccess, setCopySuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InputCategory>('Fertilizantes');
  const [unit, setUnit] = useState<'kg' | 'L' | 'saco' | 'dose' | 't' | 'galão'>('kg');
  const [quantityPurchased, setQuantityPurchased] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [npkFormulation, setNpkFormulation] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Helpers for fertilizer identification and status
  const isFertilizer = (item: InputItem) => {
    if (item.category === 'Fertilizantes') return true;
    const nameLower = (item.name || '').toLowerCase();
    return nameLower.includes('npk') ||
      nameLower.includes('ureia') ||
      nameLower.includes('potássio') ||
      nameLower.includes('cloreto') ||
      nameLower.includes('fósforo') ||
      nameLower.includes('adubo') ||
      nameLower.includes('map ') ||
      nameLower.includes('dap ') ||
      nameLower.includes('sulfato de amônio') ||
      nameLower.includes('superfosfato');
  };

  const getItemStockStatus = (item: InputItem) => {
    const isFert = isFertilizer(item);
    const criticalThreshold = item.minStockAlert || 0;
    
    if (item.currentStock <= criticalThreshold) {
      return {
        level: 'critical',
        isFertilizer: isFert,
        label: isFert ? 'CRÍTICO (Abaixo do Ponto Crítico)' : 'Abaixo do Mínimo',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
        deficit: Math.max(0, criticalThreshold - item.currentStock),
        ratioPct: criticalThreshold > 0 ? (item.currentStock / criticalThreshold) * 100 : 0,
      };
    }

    if (criticalThreshold > 0 && item.currentStock <= criticalThreshold * 1.3) {
      return {
        level: 'warning',
        isFertilizer: isFert,
        label: 'Atenção (Próximo ao Ponto Crítico)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
        deficit: 0,
        ratioPct: (item.currentStock / criticalThreshold) * 100,
      };
    }

    return {
      level: 'safe',
      isFertilizer: isFert,
      label: 'Estoque Seguro',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
      deficit: 0,
      ratioPct: criticalThreshold > 0 ? (item.currentStock / criticalThreshold) * 100 : 150,
    };
  };

  // Critical Fertilizers analysis
  const allFertilizers = (inputs || []).filter(isFertilizer);
  const criticalFertilizers = allFertilizers.filter(item => item.currentStock <= (item.minStockAlert || 0));
  const warningFertilizers = allFertilizers.filter(item => {
    const thresh = item.minStockAlert || 0;
    return item.currentStock > thresh && item.currentStock <= thresh * 1.3;
  });
  const safeFertilizers = allFertilizers.filter(item => item.currentStock > (item.minStockAlert || 0) * 1.3);

  // Overall calculations
  const totalFertilizerStockKg = allFertilizers.reduce((acc, item) => {
    let multiplier = 1;
    if (item.unit === 't') multiplier = 1000;
    if (item.unit === 'saco') multiplier = 50;
    return acc + (item.currentStock * multiplier);
  }, 0);

  const totalFertilizerInvestment = allFertilizers.reduce((acc, item) => acc + (item.currentStock * item.unitPrice), 0);
  
  const totalCriticalDeficitCost = criticalFertilizers.reduce((acc, item) => {
    const def = Math.max(0, (item.minStockAlert || 0) - item.currentStock);
    return acc + (def * item.unitPrice);
  }, 0);

  const totalStockValue = (inputs || []).reduce((acc, item) => acc + (item.currentStock * item.unitPrice), 0);
  const allLowStockCount = (inputs || []).filter(item => item.currentStock <= item.minStockAlert).length;

  // Filter items
  const filteredInputs = (inputs || []).filter((item) => {
    const isFert = isFertilizer(item);
    const status = getItemStockStatus(item);

    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.supplier || '').toLowerCase().includes(term) ||
      (item.batchNumber || '').toLowerCase().includes(term) ||
      (item.npkFormulation || '').toLowerCase().includes(term) ||
      (item.storageLocation || '').toLowerCase().includes(term);

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'critical_fert') {
      matchesStatus = isFert && status.level === 'critical';
    } else if (statusFilter === 'warning') {
      matchesStatus = status.level === 'warning';
    } else if (statusFilter === 'safe') {
      matchesStatus = status.level === 'safe';
    } else if (statusFilter === 'all_fert') {
      matchesStatus = isFert;
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const handleOpenModal = (item?: InputItem) => {
    if (item) {
      setEditingInput(item);
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setQuantityPurchased(item.quantityPurchased);
      setCurrentStock(item.currentStock);
      setMinStockAlert(item.minStockAlert);
      setUnitPrice(item.unitPrice);
      setSupplier(item.supplier);
      setBatchNumber(item.batchNumber);
      setPurchaseDate(item.purchaseDate || new Date().toISOString().split('T')[0]);
      setNpkFormulation(item.npkFormulation || '');
      setStorageLocation(item.storageLocation || '');
      setNotes(item.notes || '');
    } else {
      setEditingInput(null);
      setName('');
      setCategory('Fertilizantes');
      setUnit('kg');
      setQuantityPurchased('');
      setCurrentStock('');
      setMinStockAlert('');
      setUnitPrice('');
      setSupplier('');
      setBatchNumber('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNpkFormulation('');
      setStorageLocation('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyPurchasedNum = Number(quantityPurchased);
    const unitPriceNum = Number(unitPrice);
    
    const inputData: InputItem = {
      id: editingInput ? editingInput.id : `inp-${Date.now()}`,
      farmId: selectedFarmId || 'farm-1',
      name,
      category,
      unit,
      quantityPurchased: qtyPurchasedNum,
      currentStock: Number(currentStock),
      minStockAlert: Number(minStockAlert),
      unitPrice: unitPriceNum,
      totalInvestment: qtyPurchasedNum * unitPriceNum,
      supplier: supplier || 'Fornecedor Local',
      batchNumber: batchNumber || `LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseDate,
      npkFormulation: npkFormulation.trim() || undefined,
      storageLocation: storageLocation.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingInput) {
      onUpdateInput(inputData);
    } else {
      onAddInput(inputData);
    }
    setIsModalOpen(false);
  };

  // Quick Restock Handler
  const handleOpenQuickRestock = (item: InputItem) => {
    setQuickRestockItem(item);
    setRestockAmount('');
    setRestockPrice(item.unitPrice);
    setRestockBatch(`LOT-ENTRADA-${Date.now().toString().slice(-4)}`);
  };

  const handleExecuteQuickRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRestockItem || Number(restockAmount) <= 0) return;

    const addedQty = Number(restockAmount);
    const newStock = quickRestockItem.currentStock + addedQty;
    const newQtyPurchased = (quickRestockItem.quantityPurchased || 0) + addedQty;
    const finalPrice = Number(restockPrice) > 0 ? Number(restockPrice) : quickRestockItem.unitPrice;

    const updated: InputItem = {
      ...quickRestockItem,
      currentStock: newStock,
      quantityPurchased: newQtyPurchased,
      unitPrice: finalPrice,
      totalInvestment: newQtyPurchased * finalPrice,
      batchNumber: restockBatch || quickRestockItem.batchNumber,
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    onUpdateInput(updated);
    setQuickRestockItem(null);
  };

  // Quick Threshold Adjustment Handler
  const handleOpenAdjustThreshold = (item: InputItem) => {
    setAdjustThresholdItem(item);
    setNewCriticalThreshold(item.minStockAlert || 0);
  };

  const handleExecuteAdjustThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustThresholdItem || newCriticalThreshold === '') return;

    const updated: InputItem = {
      ...adjustThresholdItem,
      minStockAlert: Number(newCriticalThreshold),
    };

    onUpdateInput(updated);
    setAdjustThresholdItem(null);
  };

  // Copy Quotation / Purchase Requirement to Clipboard
  const handleCopyQuotationSummary = () => {
    if (criticalFertilizers.length === 0) return;
    
    let text = `📋 SOLICITAÇÃO DE COTAÇÃO / REPOSIÇÃO DE FERTILIZANTES CRÍTICOS\n`;
    text += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `Propriedade: ${selectedFarmId || 'Fazenda Principal'}\n\n`;
    
    criticalFertilizers.forEach((fert, idx) => {
      const deficit = Math.max(0, (fert.minStockAlert || 0) - fert.currentStock);
      text += `${idx + 1}. ${fert.name}\n`;
      if (fert.npkFormulation) text += `   - Formulação NPK: ${fert.npkFormulation}\n`;
      text += `   - Estoque Atual: ${fert.currentStock.toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Ponto Crítico Mínimo: ${(fert.minStockAlert || 0).toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Quantidade Necessária p/ Reposição: ${deficit.toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Último Preço Ref.: R$ ${fert.unitPrice.toLocaleString('pt-BR')} / ${fert.unit}\n`;
      text += `   - Fornecedor Habitual: ${fert.supplier || 'N/A'}\n\n`;
    });

    text += `Valor Estimado Total de Reposição: R$ ${totalCriticalDeficitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* 🚨 VISUAL CRITICAL ALERT BANNER (High Visibility & Pulsing) */}
      {criticalFertilizers.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-950 text-white p-5 sm:p-6 shadow-xl border-2 border-rose-500/80 animate-pulse-subtle">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            {/* Header of the Alert */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-700/60 pb-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-rose-600/80 border border-rose-400/50 rounded-2xl shadow-lg shrink-0 flex items-center justify-center animate-bounce-subtle">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[11px] font-black uppercase tracking-wider border border-rose-400/40 mb-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-300" />
                    Alerta Crítico de Estoque & Suprimento
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {criticalFertilizers.length} Fertilizante{criticalFertilizers.length > 1 ? 's' : ''} Abaixo do Ponto Crítico Definido
                  </h2>
                  <p className="text-xs text-rose-200/90 font-medium">
                    O estoque atual de fertilizantes está abaixo da margem de segurança configurada. Risco de interrupção nas próximas etapas de adubação.
                  </p>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyQuotationSummary}
                  className="px-3 py-2 bg-rose-700/80 hover:bg-rose-700 border border-rose-400/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Copiado p/ Cotação!' : 'Copiar p/ Cotação'}
                </button>

                <button
                  onClick={() => setStatusFilter('critical_fert')}
                  className="px-3.5 py-2 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md"
                >
                  <Sliders className="w-4 h-4 text-rose-700" />
                  Filtrar Críticos
                </button>
              </div>
            </div>

            {/* Critical Fertilizers Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {criticalFertilizers.map((fert) => {
                const deficit = Math.max(0, (fert.minStockAlert || 0) - fert.currentStock);
                const safetyPct = fert.minStockAlert > 0 ? Math.round((fert.currentStock / fert.minStockAlert) * 100) : 0;
                const deficitCost = deficit * fert.unitPrice;

                return (
                  <div
                    key={fert.id}
                    className="bg-black/30 backdrop-blur-md rounded-xl p-3.5 border border-rose-500/40 hover:border-rose-400 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-black text-sm text-white leading-tight">
                          {fert.name}
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white tracking-wide shrink-0">
                          {safetyPct}% DO MÍNIMO
                        </span>
                      </div>

                      {fert.npkFormulation && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-rose-200 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                          NPK {fert.npkFormulation}
                        </span>
                      )}

                      {/* Visual Meter Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] text-rose-200 font-medium">
                          <span>Estoque: <strong className="text-white font-bold">{fert.currentStock.toLocaleString('pt-BR')} {fert.unit}</strong></span>
                          <span>Ponto Crítico: <strong className="text-white font-bold">{fert.minStockAlert.toLocaleString('pt-BR')} {fert.unit}</strong></span>
                        </div>
                        
                        <div className="w-full bg-rose-950/80 rounded-full h-2.5 overflow-hidden border border-rose-700/50">
                          <div
                            className="bg-gradient-to-r from-red-500 to-rose-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(8, safetyPct))}%` }}
                          />
                        </div>
                      </div>

                      {/* Deficit Alert Tag */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] bg-rose-950/70 p-2 rounded-lg border border-rose-800/40">
                        <span className="text-rose-300 font-medium">Falta p/ Estoque Mínimo:</span>
                        <span className="font-black text-rose-100">
                          - {deficit.toLocaleString('pt-BR')} {fert.unit} (R$ {deficitCost.toLocaleString('pt-BR')})
                        </span>
                      </div>
                    </div>

                    {/* Action buttons inside critical card */}
                    <div className="pt-2 flex items-center gap-2 border-t border-rose-800/40">
                      <button
                        onClick={() => handleOpenQuickRestock(fert)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Reabastecer
                      </button>
                      <button
                        onClick={() => handleOpenAdjustThreshold(fert)}
                        className="py-1.5 px-2.5 bg-rose-800 hover:bg-rose-700 text-rose-100 font-medium text-[11px] rounded-lg transition flex items-center justify-center gap-1 border border-rose-600/40"
                        title="Ajustar Ponto Crítico"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Ponto Crítico
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4 MONITORING KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estoque Total Fertilizantes */}
        <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Estoque de Fertilizantes</span>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl">
              <FlaskConical className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-100 block">
              {(totalFertilizerStockKg / 1000).toFixed(1)} t <span className="text-sm font-semibold text-slate-500">({allFertilizers.length} itens)</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
              R$ {totalFertilizerInvestment.toLocaleString('pt-BR')} investidos
            </span>
          </div>
        </div>

        {/* Card 2: Fertilizantes Abaixo do Ponto Crítico */}
        <div className={`p-4.5 rounded-2xl border shadow-sm flex flex-col justify-between transition ${
          criticalFertilizers.length > 0
            ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Fertilizantes Críticos
            </span>
            <div className={`p-2.5 rounded-xl ${
              criticalFertilizers.length > 0
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className={`text-2xl font-black block ${
              criticalFertilizers.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'
            }`}>
              {criticalFertilizers.length} abaixo do limite
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">
              {criticalFertilizers.length > 0 ? 'Requer compra / reabastecimento' : 'Todos acima do ponto crítico'}
            </span>
          </div>
        </div>

        {/* Card 3: Custo Estimado de Reposição */}
        <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Reposição p/ Ponto Seguro</span>
            <div className="p-2.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-xl">
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
              R$ {totalCriticalDeficitCost.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">
              Para cobrir o déficit de adubação
            </span>
          </div>
        </div>

        {/* Card 4: Total Geral de Insumos */}
        <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Estoque Total da Fazenda</span>
            <div className="p-2.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-xl">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-100 block">
              R$ {totalStockValue.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">
              {(inputs || []).length} insumos ({allLowStockCount} alertas no total)
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATUS CHIPS & FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => { setStatusFilter('all'); setSelectedCategory('all'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'all' && selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Todos os Insumos ({(inputs || []).length})
        </button>

        <button
          onClick={() => { setStatusFilter('critical_fert'); setSelectedCategory('Fertilizantes'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'critical_fert'
              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300 dark:ring-rose-900'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          🔴 Fertilizantes Críticos ({criticalFertilizers.length})
        </button>

        <button
          onClick={() => { setStatusFilter('all_fert'); setSelectedCategory('Fertilizantes'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'all_fert'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          🌱 Todos os Fertilizantes ({allFertilizers.length})
        </button>

        <button
          onClick={() => setStatusFilter('warning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'warning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          🟡 Em Atenção ({warningFertilizers.length})
        </button>

        <button
          onClick={() => setStatusFilter('safe')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'safe'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          🟢 Estoque Seguro ({safeFertilizers.length})
        </button>
      </div>

      {/* Control Actions & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fertilizante, NPK, lote ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none font-medium"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Fertilizantes">🌱 Fertilizantes & Adubos</option>
            <option value="Sementes">🌾 Sementes</option>
            <option value="Corretivos">🪨 Corretivos (Calcário/Gesso)</option>
            <option value="Defensivos">🛡️ Defensivos</option>
            <option value="Bioinsumos">🧪 Bioinsumos</option>
            <option value="Inoculantes">🧬 Inoculantes</option>
            <option value="Adjuvantes">💧 Adjuvantes</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Insumo / Fertilizante
          </button>
        </div>
      </div>

      {/* TABELA DE INSUMOS COM ALERTAS VISUAIS DE PONTO CRÍTICO */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Insumo & Formulação</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Status de Estoque</th>
                <th className="p-3.5 text-center">Ponto Crítico Mínimo</th>
                <th className="p-3.5 text-center">Estoque Atual</th>
                <th className="p-3.5">Nível de Segurança</th>
                <th className="p-3.5 text-right">Valor em Estoque</th>
                <th className="p-3.5 text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredInputs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                    Nenhum insumo encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredInputs.map((item) => {
                  const status = getItemStockStatus(item);
                  const isCritical = status.level === 'critical';
                  const isWarning = status.level === 'warning';
                  const isFert = isFertilizer(item);
                  const itemValue = item.currentStock * item.unitPrice;
                  const ratioPct = item.minStockAlert > 0 ? Math.round((item.currentStock / item.minStockAlert) * 100) : 100;

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isCritical
                          ? 'bg-rose-50/70 dark:bg-rose-950/25 border-l-4 border-l-rose-500 hover:bg-rose-100/60 dark:hover:bg-rose-950/40'
                          : isWarning
                          ? 'bg-amber-50/40 dark:bg-amber-950/15 border-l-4 border-l-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Insumo & Formulação */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2">
                          {isCritical && (
                            <span className="p-1 bg-rose-500 text-white rounded-md shrink-0 mt-0.5 animate-pulse" title="Abaixo do ponto crítico!">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div>
                            <div className="font-black text-slate-900 dark:text-zinc-100 text-xs">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                              {item.npkFormulation && (
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                  NPK {item.npkFormulation}
                                </span>
                              )}
                              <span>{item.supplier}</span>
                              <span>• Lote: {item.batchNumber}</span>
                            </div>
                            {item.storageLocation && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3" />
                                {item.storageLocation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isFert
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Status de Estoque */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border ${status.badgeColor}`}>
                          {isCritical ? <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" /> : isWarning ? <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {status.label}
                        </span>
                        {isCritical && status.deficit > 0 && (
                          <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                            Déficit: -{status.deficit.toLocaleString('pt-BR')} {item.unit}
                          </div>
                        )}
                      </td>

                      {/* Ponto Crítico Mínimo */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-zinc-300">
                          <span>{item.minStockAlert ? item.minStockAlert.toLocaleString('pt-BR') : 0} {item.unit}</span>
                          <button
                            onClick={() => handleOpenAdjustThreshold(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition"
                            title="Ajustar Ponto Crítico de Segurança"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Estoque Atual */}
                      <td className="p-3.5 text-center">
                        <span className={`text-xs font-black ${
                          isCritical ? 'text-rose-600 dark:text-rose-400 text-sm' : 'text-slate-900 dark:text-zinc-100'
                        }`}>
                          {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                        </span>
                      </td>

                      {/* Barra Visual de Nível de Segurança */}
                      <td className="p-3.5 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{ratioPct}% do ponto crítico</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, ratioPct))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Valor em Estoque */}
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-zinc-100">
                        <div>R$ {itemValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {item.unit}
                        </div>
                      </td>

                      {/* Ações Rápidas */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Restock Button */}
                          <button
                            onClick={() => handleOpenQuickRestock(item)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg transition"
                            title="Entrada Rápida de Estoque (+ Reabastecer)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Full Item */}
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition"
                            title="Editar Dados Completos"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => onDeleteInput(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Excluir Insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CADASTRO / EDIÇÃO COMPLETA DE INSUMO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingInput ? 'Editar Insumo / Fertilizante' : 'Cadastrar Novo Insumo ou Fertilizante'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Nome do Insumo / Fertilizante</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: NPK 04-14-08 Granulado, Ureia Protegida 45%, MAP 11-52-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InputCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium"
                  >
                    <option value="Fertilizantes">🌱 Fertilizantes & Adubos</option>
                    <option value="Sementes">🌾 Sementes</option>
                    <option value="Corretivos">🪨 Corretivos (Calcário/Gesso)</option>
                    <option value="Defensivos">🛡️ Defensivos</option>
                    <option value="Bioinsumos">🧪 Bioinsumos</option>
                    <option value="Inoculantes">🧬 Inoculantes</option>
                    <option value="Adjuvantes">💧 Adjuvantes</option>
                    <option value="Outros">📦 Outros</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Formulação NPK (Opcional)</label>
                  <input
                    type="text"
                    value={npkFormulation}
                    onChange={(e) => setNpkFormulation(e.target.value)}
                    placeholder="Ex: 04-14-08, 45-00-00, 00-00-60"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Unidade de Medida</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium"
                  >
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="t">t (Toneladas)</option>
                    <option value="saco">Saco (50 kg)</option>
                    <option value="L">L (Litros)</option>
                    <option value="dose">Dose</option>
                    <option value="galão">Galão</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Qtd. Total Adquirida</label>
                  <input
                    type="number"
                    value={quantityPurchased}
                    onChange={(e) => setQuantityPurchased(Number(e.target.value))}
                    required
                    placeholder="Ex: 15000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                {/* Estoque Atual */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Estoque Físico Atual</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    required
                    placeholder="Ex: 1200"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-black text-emerald-700 dark:text-emerald-400"
                  />
                </div>

                {/* Ponto Crítico de Estoque */}
                <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  <label className="font-black text-rose-800 dark:text-rose-300 block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Ponto Crítico de Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    required
                    placeholder="Ex: 5000"
                    className="w-full p-2 rounded-lg border border-rose-300 dark:border-rose-700 dark:bg-zinc-800 text-rose-900 dark:text-rose-200 font-bold"
                  />
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-1">
                    Emite alerta visual quando o estoque estiver igual ou abaixo deste valor.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                    placeholder="Ex: 3.20"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Data da Entrada</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Fornecedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Yara Brasil, Mosaic, EuroChem"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Número do Lote</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Ex: LOT-2026-99"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Local de Armazenamento / Galpão</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="Ex: Galpão de Insumos - Box A1, Silo de Fertilizantes"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Observações Agronômicas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Adubo formulado para plantio da cultura de soja. Proteger da umidade."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md transition"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENTRADA RÁPIDA DE ESTOQUE (REABASTECIMENTO) */}
      {quickRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Entrada Rápida de Estoque (Reabastecer)
              </h3>
              <button onClick={() => setQuickRestockItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickRestock} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <div className="font-black text-slate-900 dark:text-zinc-100">{quickRestockItem.name}</div>
                <div className="text-[11px] text-slate-500">
                  Estoque Atual: <strong className="text-slate-800 dark:text-zinc-200">{quickRestockItem.currentStock.toLocaleString('pt-BR')} {quickRestockItem.unit}</strong> | Ponto Crítico: <strong className="text-rose-600">{quickRestockItem.minStockAlert.toLocaleString('pt-BR')} {quickRestockItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Quantidade Recebida (+ {quickRestockItem.unit})
                </label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  required
                  min="0.1"
                  step="any"
                  placeholder={`Ex: ${Math.max(100, (quickRestockItem.minStockAlert || 0) - quickRestockItem.currentStock)}`}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-black text-base outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={restockPrice}
                    onChange={(e) => setRestockPrice(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Lote / NF</label>
                  <input
                    type="text"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {Number(restockAmount) > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <div className="font-bold">Novo Estoque Resultante:</div>
                  <div className="text-base font-black">
                    {(quickRestockItem.currentStock + Number(restockAmount)).toLocaleString('pt-BR')} {quickRestockItem.unit}
                  </div>
                  <div className="text-[11px] mt-0.5">
                    {quickRestockItem.currentStock + Number(restockAmount) >= quickRestockItem.minStockAlert ? (
                      <span className="text-emerald-600 font-bold">✅ O estoque retornará ao nível seguro!</span>
                    ) : (
                      <span className="text-amber-600 font-bold">⚠️ Ainda permanecerá abaixo do ponto crítico ({quickRestockItem.minStockAlert.toLocaleString('pt-BR')} {quickRestockItem.unit})</span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQuickRestockItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AJUSTE RÁPIDO DO PONTO CRÍTICO */}
      {adjustThresholdItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                Configurar Ponto Crítico de Segurança
              </h3>
              <button onClick={() => setAdjustThresholdItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustThreshold} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <div className="font-black text-slate-900 dark:text-zinc-100">{adjustThresholdItem.name}</div>
                <div className="text-[11px] text-slate-500">
                  Estoque Atual: <strong className="text-slate-800 dark:text-zinc-200">{adjustThresholdItem.currentStock.toLocaleString('pt-BR')} {adjustThresholdItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Novo Ponto Crítico ({adjustThresholdItem.unit})
                </label>
                <input
                  type="number"
                  value={newCriticalThreshold}
                  onChange={(e) => setNewCriticalThreshold(Number(e.target.value))}
                  required
                  min="0"
                  step="any"
                  placeholder="Ex: 5000"
                  className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-black text-base outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-500 block mt-1.5">
                  Quando o estoque físico atingir ou ficar abaixo deste valor, o sistema emitirá alertas visuais automáticos em todo o módulo de Custos & DRE.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustThresholdItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black shadow-md"
                >
                  Salvar Ponto Crítico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
