import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Droplets,
  Tractor,
  Layers,
  Leaf,
  ShieldCheck,
  Clock,
  Trash2,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';
import {
  TraceabilityOperation,
  TraceabilityLot,
  TraceabilityProperty,
  OperationType,
} from '../../types/traceability';

interface OperationsBookProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  operations: TraceabilityOperation[];
  onSaveOperation: (op: TraceabilityOperation) => void;
  onDeleteOperation: (opId: string) => void;
}

export const TraceabilityOperationsBook: React.FC<OperationsBookProps> = ({
  property,
  lots,
  operations,
  onSaveOperation,
  onDeleteOperation,
}) => {
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<TraceabilityOperation | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    lotId: string;
    type: OperationType;
    date: string;
    description: string;
    operatorName: string;
    commercialProduct: string;
    activeIngredient: string;
    dosagePerHa: string;
    totalQuantityUsed: string;
    waterVolumeLitersPerHa: number;
    withholdingPeriodDays: number;
    targetPestDisease: string;
    agronomistPrescriptionArt: string;
    totalOperationCostBrl: number;
  }>({
    lotId: lots[0]?.id || '',
    type: 'pulverizacao',
    date: new Date().toISOString().split('T')[0],
    description: '',
    operatorName: property?.technicalResponsible || '',
    commercialProduct: '',
    activeIngredient: '',
    dosagePerHa: '',
    totalQuantityUsed: '',
    waterVolumeLitersPerHa: 0,
    withholdingPeriodDays: 0,
    targetPestDisease: '',
    agronomistPrescriptionArt: '',
    totalOperationCostBrl: 0,
  });

  // Filtered Operations
  const filteredOperations = useMemo(() => {
    return (operations || []).filter(op => {
      if (!op) return false;
      const matchLot = selectedLotFilter === 'all' || op.lotId === selectedLotFilter;
      const matchType = selectedTypeFilter === 'all' || op.type === selectedTypeFilter;
      const search = (searchTerm || '').toLowerCase();
      const matchSearch =
        !search ||
        (op.description || '').toLowerCase().includes(search) ||
        (op.lotCode || '').toLowerCase().includes(search) ||
        (op.commercialProduct || '').toLowerCase().includes(search) ||
        (op.operatorName || '').toLowerCase().includes(search) ||
        (op.activeIngredient || '').toLowerCase().includes(search) ||
        (op.targetPestDisease || '').toLowerCase().includes(search);
      return matchLot && matchType && matchSearch;
    });
  }, [operations, selectedLotFilter, selectedTypeFilter, searchTerm]);

  // Total investment across filtered ops
  const totalCost = useMemo(() => {
    return filteredOperations.reduce((acc, op) => acc + (op.totalOperationCostBrl || 0), 0);
  }, [filteredOperations]);

  const handleOpenCreateModal = () => {
    setFormData({
      lotId: lots[0]?.id || '',
      type: 'pulverizacao',
      date: new Date().toISOString().split('T')[0],
      description: '',
      operatorName: property?.technicalResponsible || '',
      commercialProduct: '',
      activeIngredient: '',
      dosagePerHa: '',
      totalQuantityUsed: '',
      waterVolumeLitersPerHa: 0,
      withholdingPeriodDays: 0,
      targetPestDisease: '',
      agronomistPrescriptionArt: '',
      totalOperationCostBrl: 0,
    });
    setEditingOp(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === formData.lotId) || lots[0];

    // Compute quarantine date if withholding period applies
    let safeHarvestDate: string | undefined = undefined;
    if (formData.withholdingPeriodDays > 0 && formData.type === 'pulverizacao') {
      const opDate = new Date(formData.date);
      opDate.setDate(opDate.getDate() + Number(formData.withholdingPeriodDays));
      safeHarvestDate = opDate.toISOString().split('T')[0];
    }

    const op: TraceabilityOperation = {
      id: editingOp ? editingOp.id : `op-${Date.now()}`,
      lotId: lotObj.id,
      lotCode: lotObj.lotCode,
      plotId: lotObj.plotId,
      date: formData.date,
      type: formData.type,
      description: formData.description,
      operatorName: formData.operatorName,
      commercialProduct: formData.commercialProduct,
      activeIngredient: formData.activeIngredient,
      dosagePerHa: formData.dosagePerHa,
      totalQuantityUsed: formData.totalQuantityUsed,
      waterVolumeLitersPerHa: formData.waterVolumeLitersPerHa ? Number(formData.waterVolumeLitersPerHa) : undefined,
      withholdingPeriodDays: Number(formData.withholdingPeriodDays),
      safeHarvestDate: safeHarvestDate,
      targetPestDisease: formData.targetPestDisease,
      agronomistPrescriptionArt: formData.agronomistPrescriptionArt,
      totalOperationCostBrl: Number(formData.totalOperationCostBrl),
      createdAt: editingOp ? editingOp.createdAt : new Date().toISOString(),
    };

    onSaveOperation(op);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Caderno de Campo Digital & Histórico de Operações
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Registro auditável de pulverizações, fertirrigações, adubações e tratos culturais com cálculo automático de carência
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              Custo Total: R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar Operação
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por produto, praga, operador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div>
            <select
              value={selectedLotFilter}
              onChange={e => setSelectedLotFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="all">Todos os Lotes ({lots.length})</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName} ({l.cultivarName})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="all">Todos os Tipos de Manejo</option>
              <option value="pulverizacao">Pulverização / Defensivos</option>
              <option value="adubacao_cobertura">Adubação de Cobertura / Solo</option>
              <option value="irrigacao">Irrigação / Fertirrigação</option>
              <option value="trato_cultural">Tratos Culturais / Desbrota / Poda</option>
              <option value="preparo_solo">Preparo de Solo / Canteiros</option>
              <option value="plantio">Semeadura / Transplante</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operations Timeline / Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            {filteredOperations.length} Lançamentos Encontrados
          </span>
          <span className="text-[11px] text-slate-400">
            Conforme Exigência MAPA / GlobalG.A.P.
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {filteredOperations.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Nenhum registro de operação encontrado no Caderno de Campo.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Registrar Primeira Operação
              </button>
            </div>
          )}
          {filteredOperations.map(op => {
            const isSpraying = op.type === 'pulverizacao';
            const hasQuarantine = op.withholdingPeriodDays && op.withholdingPeriodDays > 0;
            const todayStr = new Date().toISOString().split('T')[0];
            const isSafe = op.safeHarvestDate ? op.safeHarvestDate <= todayStr : true;

            return (
              <div key={op.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {op.lotCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 capitalize">
                      {(op.type || 'operacao').replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(op.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    {op.description}
                  </h4>

                  {/* Defensivo / Insumo Details */}
                  {op.commercialProduct && (
                    <div className="text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-3 flex-wrap">
                      <span>Insumo: <strong className="text-slate-900 dark:text-white">{op.commercialProduct}</strong> ({op.activeIngredient})</span>
                      <span>Dose: <strong>{op.dosagePerHa}</strong></span>
                      {op.targetPestDisease && (
                        <span className="text-slate-500">Alvo: {op.targetPestDisease}</span>
                      )}
                      {op.agronomistPrescriptionArt && (
                        <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">ART: {op.agronomistPrescriptionArt}</span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    Operador: {op.operatorName} • Custo: R$ {(op.totalOperationCostBrl || 0).toFixed(2)}
                  </p>
                </div>

                {/* Right: Quarantine Status & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  {isSpraying && hasQuarantine && (
                    <div className={`p-2.5 rounded-xl border text-xs text-right ${
                      isSafe
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    }`}>
                      <div className="font-bold flex items-center justify-end gap-1">
                        {isSafe ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        {isSafe ? 'Carência Cumprida' : 'Em Período de Carência'}
                      </div>
                      <span className="text-[10px] block">
                        Carência: {op.withholdingPeriodDays} dias • Seguro: {op.safeHarvestDate ? new Date(op.safeHarvestDate).toLocaleDateString('pt-BR') : '--'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este registro de operação?')) {
                        onDeleteOperation(op.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                    title="Excluir Lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Registro de Operação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tractor className="w-5 h-5 text-emerald-600" />
                Registrar Operação Agrícola no Caderno de Campo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lote */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Lote de Produção *</label>
                  <select
                    value={formData.lotId}
                    onChange={e => setFormData(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-semibold"
                    required
                  >
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName} ({l.cultivarName})</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Operação */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Tipo de Manejo *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as OperationType }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="pulverizacao">Pulverização / Tratamento Fitossanitário</option>
                    <option value="adubacao_cobertura">Adubação de Cobertura / Fertirrigação</option>
                    <option value="irrigacao">Lâmina de Irrigação</option>
                    <option value="trato_cultural">Tratos Culturais (Poda, Desbrota, Tutoramento)</option>
                    <option value="preparo_solo">Preparo de Canteiros / Substrato</option>
                    <option value="plantio">Semeadura / Transplante</option>
                  </select>
                </div>

                {/* Data */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data da Aplicação/Manejo *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>

                {/* Operador */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Operador Responsável *</label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={e => setFormData(prev => ({ ...prev, operatorName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Descrição / Objetivo do Manejo *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  required
                />
              </div>

              {/* Se for pulverização / insumo */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                  Detalhes do Insumo / Defensivo / Fertilizante
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Nome Comercial</label>
                    <input
                      type="text"
                      value={formData.commercialProduct}
                      onChange={e => setFormData(prev => ({ ...prev, commercialProduct: e.target.value }))}
                      placeholder="Ex: Score, Amistar"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Ingrediente Ativo</label>
                    <input
                      type="text"
                      value={formData.activeIngredient}
                      onChange={e => setFormData(prev => ({ ...prev, activeIngredient: e.target.value }))}
                      placeholder="Ex: Difenoconazol"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Dose por Hectare</label>
                    <input
                      type="text"
                      value={formData.dosagePerHa}
                      onChange={e => setFormData(prev => ({ ...prev, dosagePerHa: e.target.value }))}
                      placeholder="Ex: 0.5 L/ha"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Período de Carência (Dias) *</label>
                    <input
                      type="number"
                      value={formData.withholdingPeriodDays}
                      onChange={e => setFormData(prev => ({ ...prev, withholdingPeriodDays: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold text-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Alvo Biológico / Praga</label>
                    <input
                      type="text"
                      value={formData.targetPestDisease}
                      onChange={e => setFormData(prev => ({ ...prev, targetPestDisease: e.target.value }))}
                      placeholder="Ex: Mosca branca"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Custo Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalOperationCostBrl}
                      onChange={e => setFormData(prev => ({ ...prev, totalOperationCostBrl: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Salvar no Caderno de Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
