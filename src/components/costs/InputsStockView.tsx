import React, { useState, useEffect, useRef } from 'react';
import { InputItem, InputCategory } from '../../types/costs';
import { isFertilizerInput } from '../../utils/costStorage';
import {
  AlertOctagon,
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  FlaskConical,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sliders,
  Trash2,
  X,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInput, setEditingInput] = useState<InputItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [quickRestockItem, setQuickRestockItem] = useState<InputItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number | ''>('');
  const [restockPrice, setRestockPrice] = useState<number | ''>('');
  const [restockBatch, setRestockBatch] = useState('');

  const [adjustThresholdItem, setAdjustThresholdItem] = useState<InputItem | null>(null);
  const [newCriticalThreshold, setNewCriticalThreshold] = useState<number | ''>('');

  const [copySuccess, setCopySuccess] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen && !quickRestockItem && !adjustThresholdItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setQuickRestockItem(null);
        setAdjustThresholdItem(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, quickRestockItem, adjustThresholdItem]);

  const getItemStockStatus = (item: InputItem) => {
    const isFert = isFertilizerInput(item);
    const criticalThreshold = item.minStockAlert || 0;

    if (item.currentStock <= criticalThreshold) {
      return {
        level: 'critical' as const,
        isFertilizer: isFert,
        label: isFert ? 'Crítico (abaixo do mínimo)' : 'Abaixo do mínimo',
        textColor: 'text-rose-700 dark:text-rose-400',
        deficit: Math.max(0, criticalThreshold - item.currentStock),
      };
    }

    if (criticalThreshold > 0 && item.currentStock <= criticalThreshold * 1.3) {
      return {
        level: 'warning' as const,
        isFertilizer: isFert,
        label: 'Atenção (próximo ao limite)',
        textColor: 'text-amber-700 dark:text-amber-400',
        deficit: 0,
      };
    }

    return {
      level: 'safe' as const,
      isFertilizer: isFert,
      label: 'Estoque seguro',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      deficit: 0,
    };
  };

  const allFertilizers = (inputs || []).filter(isFertilizerInput);
  const criticalFertilizers = allFertilizers.filter((item) => item.currentStock <= (item.minStockAlert || 0));
  const warningFertilizers = allFertilizers.filter((item) => {
    const thresh = item.minStockAlert || 0;
    return item.currentStock > thresh && item.currentStock <= thresh * 1.3;
  });
  const safeFertilizers = allFertilizers.filter((item) => item.currentStock > (item.minStockAlert || 0) * 1.3);

  const totalFertilizerStockKg = allFertilizers.reduce((acc, item) => {
    let multiplier = 1;
    if (item.unit === 't') multiplier = 1000;
    if (item.unit === 'saco') multiplier = 50;
    return acc + item.currentStock * multiplier;
  }, 0);

  const totalFertilizerInvestment = allFertilizers.reduce((acc, item) => acc + item.currentStock * item.unitPrice, 0);

  const totalCriticalDeficitCost = criticalFertilizers.reduce((acc, item) => {
    const def = Math.max(0, (item.minStockAlert || 0) - item.currentStock);
    return acc + def * item.unitPrice;
  }, 0);

  const totalStockValue = (inputs || []).reduce((acc, item) => acc + item.currentStock * item.unitPrice, 0);
  const allLowStockCount = (inputs || []).filter((item) => item.currentStock <= item.minStockAlert).length;

  const filteredInputs = (inputs || []).filter((item) => {
    const isFert = isFertilizerInput(item);
    const status = getItemStockStatus(item);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.supplier || '').toLowerCase().includes(term) ||
      (item.batchNumber || '').toLowerCase().includes(term) ||
      (item.npkFormulation || '').toLowerCase().includes(term) ||
      (item.storageLocation || '').toLowerCase().includes(term);

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
    const qtyPurchasedNum = Number(quantityPurchased) || 0;
    const unitPriceNum = Number(unitPrice) || 0;

    const inputData: InputItem = {
      id: editingInput ? editingInput.id : `inp-${Date.now()}`,
      farmId: selectedFarmId || 'farm-1',
      name,
      category,
      unit,
      quantityPurchased: qtyPurchasedNum,
      currentStock: Number(currentStock) || 0,
      minStockAlert: Number(minStockAlert) || 0,
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

  const handleCopyQuotationSummary = () => {
    if (criticalFertilizers.length === 0) return;

    let text = `SOLICITAÇÃO DE COTAÇÃO / REPOSIÇÃO DE FERTILIZANTES CRÍTICOS\n`;
    text += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `Propriedade: ${selectedFarmId || 'Propriedade Principal'}\n\n`;

    criticalFertilizers.forEach((fert, idx) => {
      const deficit = Math.max(0, (fert.minStockAlert || 0) - fert.currentStock);
      text += `${idx + 1}. ${fert.name}\n`;
      if (fert.npkFormulation) text += `   - Formulação NPK: ${fert.npkFormulation}\n`;
      text += `   - Estoque Atual: ${fert.currentStock.toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Ponto Crítico Mínimo: ${(fert.minStockAlert || 0).toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Reposição Necessária: ${deficit.toLocaleString('pt-BR')} ${fert.unit}\n`;
      text += `   - Último Preço Ref.: R$ ${fert.unitPrice.toLocaleString('pt-BR')} / ${fert.unit}\n`;
      text += `   - Fornecedor Habitual: ${fert.supplier || 'N/A'}\n\n`;
    });

    text += `Valor Estimado Total de Reposição: R$ ${totalCriticalDeficitCost.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    })}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Critical Fertilizer Alert Panel */}
      {criticalFertilizers.length > 0 && (
        <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/80 dark:border-rose-900/50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  Alerta Crítico de Suprimento
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {criticalFertilizers.length} Fertilizante{criticalFertilizers.length > 1 ? 's' : ''} Abaixo do Ponto Crítico
                </h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Estoque abaixo da margem de segurança configurada para as próximas aplicações.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyQuotationSummary}
                className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copySuccess ? 'Copiado p/ Cotação' : 'Copiar p/ Cotação'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('critical_fert');
                  setSelectedCategory('Fertilizantes');
                }}
                className="h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                Filtrar Críticos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalFertilizers.map((fert) => {
              const deficit = Math.max(0, (fert.minStockAlert || 0) - fert.currentStock);
              const safetyPct = fert.minStockAlert > 0 ? Math.round((fert.currentStock / fert.minStockAlert) * 100) : 0;
              const deficitCost = deficit * fert.unitPrice;

              return (
                <div
                  key={fert.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-3.5 border border-rose-200/80 dark:border-rose-900/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 leading-snug">
                          {fert.name}
                        </div>
                        {fert.npkFormulation && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                            NPK {fert.npkFormulation}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                        {safetyPct}% mín.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                        <span>
                          Atual: <strong className="text-slate-900 dark:text-zinc-100">{fert.currentStock.toLocaleString('pt-BR')} {fert.unit}</strong>
                        </span>
                        <span>
                          Mín.: <strong className="text-slate-900 dark:text-zinc-100">{fert.minStockAlert.toLocaleString('pt-BR')} {fert.unit}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-rose-100 dark:bg-rose-950/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(6, safetyPct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 px-2.5 py-1.5 rounded-md border border-rose-200/60 dark:border-rose-900/40 tabular-nums">
                      <span>Déficit</span>
                      <span className="font-semibold">
                        -{deficit.toLocaleString('pt-BR')} {fert.unit} (R$ {deficitCost.toLocaleString('pt-BR')})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickRestock(fert)}
                      className="flex-1 h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Reabastecer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAdjustThreshold(fert)}
                      className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Limite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unified 4-Metric Hairline Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Estoque de Fertilizantes</span>
              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {(totalFertilizerStockKg / 1000).toFixed(1)} t{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                ({allFertilizers.length} itens)
              </span>
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
              R$ {totalFertilizerInvestment.toLocaleString('pt-BR')} investidos
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Fertilizantes Críticos</span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  criticalFertilizers.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                }`}
              />
            </div>
            <div
              className={`text-xl font-bold tabular-nums ${
                criticalFertilizers.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {criticalFertilizers.length} abaixo do limite
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              {criticalFertilizers.length > 0 ? 'Requer reposição' : 'Todos acima do ponto crítico'}
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Reposição p/ Ponto Seguro</span>
              <ShoppingCart className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              R$ {totalCriticalDeficitCost.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Déficit estimado de adubação</div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Estoque Total da Fazenda</span>
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {totalStockValue.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {(inputs || []).length} insumos · {allLowStockCount} alertas
            </div>
          </div>
        </div>
      </div>

      {/* Filter Segmented Controls + Search & Create Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setSelectedCategory('all');
            }}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === 'all' && selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Todos ({(inputs || []).length})
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('critical_fert');
              setSelectedCategory('Fertilizantes');
            }}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === 'critical_fert'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50/70 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-950/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Fertilizantes Críticos ({criticalFertilizers.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('all_fert');
              setSelectedCategory('Fertilizantes');
            }}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === 'all_fert'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Todos Fertilizantes ({allFertilizers.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('warning')}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === 'warning'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Em Atenção ({warningFertilizers.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('safe')}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              statusFilter === 'safe'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-50/70 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Estoque Seguro ({safeFertilizers.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar insumo, NPK, lote ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <select
              aria-label="Filtrar categoria"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Fertilizantes">Fertilizantes &amp; Adubos</option>
              <option value="Sementes">Sementes</option>
              <option value="Corretivos">Corretivos (Calcário/Gesso)</option>
              <option value="Defensivos">Defensivos</option>
              <option value="Bioinsumos">Bioinsumos</option>
              <option value="Inoculantes">Inoculantes</option>
              <option value="Adjuvantes">Adjuvantes</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Insumo
          </button>
        </div>
      </div>

      {/* Inputs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3.5">Insumo &amp; Formulação</th>
                <th className="py-3 px-3.5">Categoria</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-center">Ponto Crítico</th>
                <th className="py-3 px-3.5 text-center">Estoque Atual</th>
                <th className="py-3 px-3.5">Segurança</th>
                <th className="py-3 px-3.5 text-right">Valor em Estoque</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredInputs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 dark:text-zinc-500">
                    Nenhum insumo encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredInputs.map((item) => {
                  const status = getItemStockStatus(item);
                  const isCritical = status.level === 'critical';
                  const isWarning = status.level === 'warning';
                  const itemValue = item.currentStock * item.unitPrice;
                  const ratioPct =
                    item.minStockAlert > 0 ? Math.round((item.currentStock / item.minStockAlert) * 100) : 100;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-rose-50/40 dark:bg-rose-950/15 hover:bg-rose-50/70 dark:hover:bg-rose-950/25'
                          : isWarning
                          ? 'bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
                          : 'hover:bg-slate-50/70 dark:hover:bg-zinc-950/40'
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100">{item.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                            {item.npkFormulation && (
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                NPK {item.npkFormulation} ·
                              </span>
                            )}
                            <span>{item.supplier}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">Lote {item.batchNumber}</span>
                          </div>
                          {item.storageLocation && (
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                              <Building className="w-3 h-3 shrink-0" />
                              <span>{item.storageLocation}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{item.category}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className={`inline-flex items-center gap-1.5 font-semibold ${status.textColor}`}>
                          {isCritical ? (
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                          ) : isWarning ? (
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{status.label}</span>
                        </div>
                        {isCritical && status.deficit > 0 && (
                          <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 tabular-nums">
                            Déficit: -{status.deficit.toLocaleString('pt-BR')} {item.unit}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300 tabular-nums">
                          <span>
                            {(item.minStockAlert || 0).toLocaleString('pt-BR')} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustThreshold(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors"
                            title="Ajustar Ponto Crítico"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`font-semibold tabular-nums ${
                            isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'
                          }`}
                        >
                          {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 w-40">
                        <div className="space-y-1">
                          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                            {ratioPct}% do mínimo
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, ratioPct))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          R$ {itemValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {item.unit}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteInput(item.id);
                                setConfirmDeleteId(null);
                              }}
                              className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                            >
                              Excluir
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickRestock(item)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors"
                              title="Entrada Rápida de Estoque"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModal(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Excluir Insumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Cadastro / Edição Completa */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {editingInput ? 'Editar Insumo / Fertilizante' : 'Cadastrar Novo Insumo'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Nome do Insumo / Fertilizante
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  placeholder="Ex: NPK 04-14-08 Granulado, Ureia Protegida 45%"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InputCategory)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Fertilizantes">Fertilizantes &amp; Adubos</option>
                    <option value="Sementes">Sementes</option>
                    <option value="Corretivos">Corretivos (Calcário/Gesso)</option>
                    <option value="Defensivos">Defensivos</option>
                    <option value="Bioinsumos">Bioinsumos</option>
                    <option value="Inoculantes">Inoculantes</option>
                    <option value="Adjuvantes">Adjuvantes</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Formulação NPK (Opcional)
                  </label>
                  <input
                    type="text"
                    value={npkFormulation}
                    onChange={(e) => setNpkFormulation(e.target.value)}
                    placeholder="Ex: 04-14-08"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as InputItem['unit'])}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
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
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Qtd. Adquirida</label>
                  <input
                    type="number"
                    value={quantityPurchased}
                    onChange={(e) => setQuantityPurchased(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="Ex: 15000"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Estoque Físico Atual
                  </label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="Ex: 1200"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 font-semibold tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-rose-700 dark:text-rose-400 block mb-1">
                    Ponto Crítico Mínimo
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="Ex: 5000"
                    className="w-full h-9 px-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 text-slate-900 dark:text-zinc-100 font-semibold tabular-nums outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="Ex: 3.20"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Data da Entrada</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Fornecedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Yara Brasil, Mosaic"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Número do Lote</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Ex: LOT-2026-99"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Local de Armazenamento
                </label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="Ex: Galpão de Insumos - Box A1"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações de armazenamento ou aplicação..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Entrada Rápida (Reabastecimento) */}
      {quickRestockItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setQuickRestockItem(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Entrada Rápida de Estoque
              </h3>
              <button
                type="button"
                onClick={() => setQuickRestockItem(null)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickRestock} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-zinc-100">{quickRestockItem.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  Atual: <strong className="text-slate-800 dark:text-zinc-200">{quickRestockItem.currentStock.toLocaleString('pt-BR')} {quickRestockItem.unit}</strong> · Crítico:{' '}
                  <strong className="text-rose-600 dark:text-rose-400">{quickRestockItem.minStockAlert.toLocaleString('pt-BR')} {quickRestockItem.unit}</strong>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Quantidade Recebida (+{quickRestockItem.unit})
                </label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min="0.1"
                  step="any"
                  placeholder={`Ex: ${Math.max(100, (quickRestockItem.minStockAlert || 0) - quickRestockItem.currentStock)}`}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 font-semibold tabular-nums outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={restockPrice}
                    onChange={(e) => setRestockPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Lote / NF</label>
                  <input
                    type="text"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {Number(restockAmount) > 0 && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                  <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Novo Estoque Resultante</div>
                  <div className="text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {(quickRestockItem.currentStock + Number(restockAmount)).toLocaleString('pt-BR')} {quickRestockItem.unit}
                  </div>
                  <div className="text-[11px]">
                    {quickRestockItem.currentStock + Number(restockAmount) >= quickRestockItem.minStockAlert ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        O estoque retornará ao nível seguro.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium tabular-nums">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Ainda abaixo do ponto crítico ({quickRestockItem.minStockAlert.toLocaleString('pt-BR')} {quickRestockItem.unit}).
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQuickRestockItem(null)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Ajuste Rápido de Ponto Crítico */}
      {adjustThresholdItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setAdjustThresholdItem(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Configurar Ponto Crítico
              </h3>
              <button
                type="button"
                onClick={() => setAdjustThresholdItem(null)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustThreshold} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-zinc-100">{adjustThresholdItem.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  Estoque Atual:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {adjustThresholdItem.currentStock.toLocaleString('pt-BR')} {adjustThresholdItem.unit}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Novo Ponto Crítico ({adjustThresholdItem.unit})
                </label>
                <input
                  type="number"
                  value={newCriticalThreshold}
                  onChange={(e) => setNewCriticalThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min="0"
                  step="any"
                  placeholder="Ex: 5000"
                  className="w-full h-9 px-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 font-semibold tabular-nums outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1.5">
                  Quando o estoque físico atingir ou ficar abaixo deste limite, o sistema destacará o alerta no módulo.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustThresholdItem(null)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
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
