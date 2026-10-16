import React, { useState, useMemo } from 'react';
import {
  Tractor,
  Truck,
  Wrench,
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Camera,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  RefreshCw,
  Calculator,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Pericia,
  PericiaAtivoInventario,
  CategoriaAtivoRural,
  EstadoConservacaoAtivo,
} from '../../types/pericia';
import {
  createDefaultInventarioAtivos,
  converterMaquinasEVeiculosParaAtivos,
  sincronizarInventarioParaComponentes,
  estimarValorMercadoAtivo,
} from '../../utils/periciaAvaliacaoComponentesUtils';

interface PericiaInventarioAtivosProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
  onShowNotification?: (msg: string) => void;
}

export const PericiaInventarioAtivos: React.FC<PericiaInventarioAtivosProps> = ({
  pericia,
  onUpdatePericia,
  onShowNotification,
}) => {
  // Extract or initialize the assets inventory
  const inventario: PericiaAtivoInventario[] = useMemo(() => {
    if (pericia.inventarioAtivos && pericia.inventarioAtivos.length > 0) {
      return pericia.inventarioAtivos;
    }
    if (
      pericia.avaliacaoImovel?.inventarioAtivos &&
      pericia.avaliacaoImovel.inventarioAtivos.length > 0
    ) {
      return pericia.avaliacaoImovel.inventarioAtivos;
    }
    // Fallback: convert existing maquinas & veiculos
    const maqs = pericia.avaliacaoImovel?.maquinasEquipamentos || [];
    const veics = pericia.avaliacaoImovel?.veiculos || [];
    if (maqs.length > 0 || veics.length > 0) {
      return converterMaquinasEVeiculosParaAtivos(maqs, veics);
    }
    // Clean empty state for professional use
    return [];
  }, [pericia]);

  // Filters and UI state
  const [selectedCategoria, setSelectedCategoria] = useState<'todas' | CategoriaAtivoRural>('todas');
  const [selectedEstado, setSelectedEstado] = useState<'todos' | EstadoConservacaoAtivo>('todos');
  const [selectedStatusOp, setSelectedStatusOp] = useState<'todos' | 'em_operacao' | 'em_manutencao' | 'parado' | 'inoperante'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtivoId, setEditingAtivoId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'dados' | 'valores' | 'detalhes'>('dados');

  // Form State
  const initialFormState: Partial<PericiaAtivoInventario> = {
    categoria: 'maquina',
    subtipo: 'Trator de Pneus Agrícola',
    marca: 'John Deere',
    modelo: '',
    numeroSerie: '',
    placaOuRegistro: '',
    anoFabricacao: new Date().getFullYear() - 2,
    anoModelo: `${new Date().getFullYear() - 2}/${new Date().getFullYear() - 2}`,
    horimetroOuKm: '1.250 horas',
    potenciaCapacidade: '210 cv',
    combustivel: 'Diesel S10',
    estadoConservacao: 'bom',
    valorNovoReposicaoBrl: 850000,
    valorMercadoAtualizadoBrl: 620000,
    referenciaMercado: 'Pesquisa Concessionária / Tabela FIPE',
    localizacaoFisica: 'Galpão Principal - Sede',
    statusOperacional: 'em_operacao',
    fotoUrl: '',
    observacoes: '',
    incluirNoLaudo: true,
  };

  const [formData, setFormData] = useState<Partial<PericiaAtivoInventario>>(initialFormState);

  // Helper notification
  const notify = (msg: string) => {
    if (onShowNotification) {
      onShowNotification(msg);
    }
  };

  // Helper to persist updated inventario to pericia and keep avaliacaoImovel synced
  const saveInventario = (updatedInventario: PericiaAtivoInventario[], successMsg?: string) => {
    const { maquinas, veiculos } = sincronizarInventarioParaComponentes(updatedInventario);

    const updatedPericia: Pericia = {
      ...pericia,
      inventarioAtivos: updatedInventario,
      avaliacaoImovel: {
        ...(pericia.avaliacaoImovel || {
          avaliacaoJudicial: '',
          comportamentoMercado: '',
          valorizantesDesvalorizantes: '',
          precificacaoTerraNua: [],
        }),
        inventarioAtivos: updatedInventario,
        maquinasEquipamentos: maquinas,
        veiculos: veiculos,
        incluirMaquinasEquipamentos: updatedInventario.some(
          a => (a.categoria === 'maquina' || a.categoria === 'equipamento') && a.incluirNoLaudo
        ),
        incluirVeiculos: updatedInventario.some(
          a => a.categoria === 'veiculo' && a.incluirNoLaudo
        ),
      },
      atualizadoEm: new Date().toISOString(),
    };

    onUpdatePericia(updatedPericia);
    if (successMsg) notify(successMsg);
  };

  // Filtered Assets
  const filteredAtivos = useMemo(() => {
    return inventario.filter(item => {
      const matchCategoria =
        selectedCategoria === 'todas' || item.categoria === selectedCategoria;
      const matchEstado =
        selectedEstado === 'todos' || item.estadoConservacao === selectedEstado;
      const matchStatusOp =
        selectedStatusOp === 'todos' || item.statusOperacional === selectedStatusOp;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.marca.toLowerCase().includes(q) ||
        item.modelo.toLowerCase().includes(q) ||
        item.numeroSerie.toLowerCase().includes(q) ||
        (item.placaOuRegistro && item.placaOuRegistro.toLowerCase().includes(q)) ||
        item.subtipo.toLowerCase().includes(q) ||
        (item.localizacaoFisica && item.localizacaoFisica.toLowerCase().includes(q));

      return matchCategoria && matchEstado && matchStatusOp && matchSearch;
    });
  }, [inventario, selectedCategoria, selectedEstado, selectedStatusOp, searchTerm]);

  // Executive Statistics
  const stats = useMemo(() => {
    const total = inventario.length;
    const ativosNoLaudo = inventario.filter(a => a.incluirNoLaudo);
    const totalValorMercado = ativosNoLaudo.reduce(
      (acc, a) => acc + (a.valorMercadoAtualizadoBrl || 0),
      0
    );
    const totalValorNovo = ativosNoLaudo.reduce(
      (acc, a) => acc + (a.valorNovoReposicaoBrl || a.valorMercadoAtualizadoBrl || 0),
      0
    );
    const depreciacaoTotal = Math.max(0, totalValorNovo - totalValorMercado);

    const maquinas = inventario.filter(a => a.categoria === 'maquina');
    const valorMaquinas = maquinas.reduce(
      (acc, a) => acc + (a.incluirNoLaudo ? a.valorMercadoAtualizadoBrl || 0 : 0),
      0
    );

    const equipamentos = inventario.filter(a => a.categoria === 'equipamento');
    const valorEquipamentos = equipamentos.reduce(
      (acc, a) => acc + (a.incluirNoLaudo ? a.valorMercadoAtualizadoBrl || 0 : 0),
      0
    );

    const veiculos = inventario.filter(a => a.categoria === 'veiculo');
    const valorVeiculos = veiculos.reduce(
      (acc, a) => acc + (a.incluirNoLaudo ? a.valorMercadoAtualizadoBrl || 0 : 0),
      0
    );

    const operacionais = inventario.filter(a => a.statusOperacional === 'em_operacao').length;
    const emManutencao = inventario.filter(a => a.statusOperacional === 'em_manutencao').length;

    return {
      total,
      totalValorMercado,
      totalValorNovo,
      depreciacaoTotal,
      depreciacaoPercent:
        totalValorNovo > 0 ? Math.round((depreciacaoTotal / totalValorNovo) * 1000) / 10 : 0,
      maquinasCount: maquinas.length,
      valorMaquinas,
      equipamentosCount: equipamentos.length,
      valorEquipamentos,
      veiculosCount: veiculos.length,
      valorVeiculos,
      operacionais,
      emManutencao,
    };
  }, [inventario]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingAtivoId(null);
    setFormData({
      ...initialFormState,
      numeroSerie: `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setActiveModalTab('dados');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ativo: PericiaAtivoInventario) => {
    setEditingAtivoId(ativo.id);
    setFormData({ ...ativo });
    setActiveModalTab('dados');
    setIsModalOpen(true);
  };

  const handleDuplicate = (ativo: PericiaAtivoInventario) => {
    const duplicated: PericiaAtivoInventario = {
      ...ativo,
      id: `ativo-${Date.now()}`,
      numeroSerie: `${ativo.numeroSerie}-COPIA`,
      placaOuRegistro: ativo.placaOuRegistro ? `${ativo.placaOuRegistro} (Cópia)` : '',
      observacoes: ativo.observacoes ? `${ativo.observacoes} [Registro duplicado para revisão]` : '',
    };
    saveInventario([...inventario, duplicated], `Ativo "${ativo.marca} ${ativo.modelo}" duplicado!`);
  };

  const handleDelete = (id: string) => {
    const target = inventario.find(a => a.id === id);
    if (!target) return;
    if (confirm(`Confirma a exclusão do ativo "${target.marca} ${target.modelo}" (Série: ${target.numeroSerie})?`)) {
      const updated = inventario.filter(a => a.id !== id);
      saveInventario(updated, 'Ativo removido do inventário.');
    }
  };

  const handleToggleLaudo = (id: string) => {
    const updated = inventario.map(a =>
      a.id === id ? { ...a, incluirNoLaudo: !a.incluirNoLaudo } : a
    );
    saveInventario(updated);
  };

  const handleCopySerie = (serie: string, id: string) => {
    navigator.clipboard.writeText(serie);
    setCopiedId(id);
    notify(`Número de série "${serie}" copiado para a área de transferência!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLoadDemoDataset = () => {
    if (
      inventario.length > 0 &&
      !confirm('Deseja carregar o inventário de ativos padrão de demonstração? Isso substituirá a lista atual.')
    ) {
      return;
    }
    const defaults = createDefaultInventarioAtivos();
    saveInventario(defaults, `${defaults.length} ativos padrão carregados com sucesso!`);
  };

  // Deprec calculation inside modal
  const handleAutoEstimateValue = () => {
    if (!formData.valorNovoReposicaoBrl || !formData.anoFabricacao) return;
    const est = estimarValorMercadoAtivo(
      formData.valorNovoReposicaoBrl,
      formData.anoFabricacao,
      formData.estadoConservacao || 'bom',
      formData.categoria || 'maquina'
    );
    setFormData(prev => ({
      ...prev,
      valorMercadoAtualizadoBrl: est.valorEstimadoBrl,
      referenciaMercado: `Estimado p/ metodologia IBAPE/ABNT (Depreciação acumulada: ${est.depreciacaoPercent}%)`,
    }));
    notify(`Valor de mercado recalculado com base na idade (${est.depreciacaoPercent}% de depreciação sugerida).`);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marca?.trim() || !formData.modelo?.trim()) {
      alert('Por favor, informe a marca e o modelo do ativo.');
      return;
    }
    if (!formData.numeroSerie?.trim()) {
      alert('Por favor, informe o número de série do ativo (requisito do inventário).');
      return;
    }

    const itemToSave: PericiaAtivoInventario = {
      id: editingAtivoId || `ativo-${Date.now()}`,
      categoria: formData.categoria || 'maquina',
      subtipo: formData.subtipo || 'Máquina Agrícola',
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      numeroSerie: formData.numeroSerie.trim(),
      placaOuRegistro: formData.placaOuRegistro?.trim() || '',
      anoFabricacao: Number(formData.anoFabricacao) || new Date().getFullYear(),
      anoModelo: formData.anoModelo?.trim() || `${formData.anoFabricacao}/${formData.anoFabricacao}`,
      horimetroOuKm: formData.horimetroOuKm?.trim() || '',
      potenciaCapacidade: formData.potenciaCapacidade?.trim() || '',
      combustivel: formData.combustivel?.trim() || 'Diesel',
      estadoConservacao: formData.estadoConservacao || 'bom',
      valorNovoReposicaoBrl: Number(formData.valorNovoReposicaoBrl) || 0,
      valorMercadoAtualizadoBrl: Number(formData.valorMercadoAtualizadoBrl) || 0,
      referenciaMercado: formData.referenciaMercado?.trim() || '',
      localizacaoFisica: formData.localizacaoFisica?.trim() || 'Sede da Fazenda',
      statusOperacional: formData.statusOperacional || 'em_operacao',
      fotoUrl: formData.fotoUrl?.trim() || '',
      observacoes: formData.observacoes?.trim() || '',
      incluirNoLaudo: formData.incluirNoLaudo !== false,
      dataAvaliacao: new Date().toISOString().split('T')[0],
    };

    let nextInventario: PericiaAtivoInventario[];
    if (editingAtivoId) {
      nextInventario = inventario.map(a => (a.id === editingAtivoId ? itemToSave : a));
      notify(`Ativo "${itemToSave.marca} ${itemToSave.modelo}" atualizado com sucesso!`);
    } else {
      nextInventario = [...inventario, itemToSave];
      notify(`Ativo "${itemToSave.marca} ${itemToSave.modelo}" cadastrado no inventário!`);
    }

    saveInventario(nextInventario);
    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (inventario.length === 0) {
      alert('Nenhum ativo para exportar.');
      return;
    }
    const headers = [
      'Categoria',
      'Subtipo',
      'Marca',
      'Modelo',
      'Numero de Serie',
      'Placa/Registro',
      'Ano Fabricacao',
      'Horimetro ou Km',
      'Estado Conservacao',
      'Valor Novo (R$)',
      'Valor Mercado Atualizado (R$)',
      'Status Operacional',
      'Localizacao',
      'Incluir no Laudo',
    ];

    const rows = inventario.map(a => [
      `"${a.categoria.toUpperCase()}"`,
      `"${a.subtipo}"`,
      `"${a.marca}"`,
      `"${a.modelo}"`,
      `"${a.numeroSerie}"`,
      `"${a.placaOuRegistro || ''}"`,
      a.anoFabricacao,
      `"${a.horimetroOuKm || ''}"`,
      `"${a.estadoConservacao}"`,
      a.valorNovoReposicaoBrl,
      a.valorMercadoAtualizadoBrl,
      `"${a.statusOperacional}"`,
      `"${a.localizacaoFisica || ''}"`,
      a.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_ativos_${pericia.codigoPericia || 'pericia'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Inventário de ativos exportado em formato CSV (Excel)!');
  };

  // Helper Badge Colors
  const getEstadoBadge = (estado: EstadoConservacaoAtivo) => {
    switch (estado) {
      case 'novo':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: 'Novo / Sem Uso',
          dot: 'bg-emerald-500',
        };
      case 'excelente':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          label: 'Excelente',
          dot: 'bg-teal-500',
        };
      case 'bom':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          label: 'Bom',
          dot: 'bg-blue-500',
        };
      case 'regular':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'Regular',
          dot: 'bg-amber-500',
        };
      case 'reparos_necessarios':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          label: 'Reparos Necessários',
          dot: 'bg-orange-500',
        };
      case 'sucateado':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          label: 'Sucateado / Inoperante',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-300',
          label: estado,
          dot: 'bg-slate-400',
        };
    }
  };

  const getCategoriaIcon = (cat: CategoriaAtivoRural) => {
    switch (cat) {
      case 'maquina':
        return <Tractor className="w-4 h-4 text-amber-600" />;
      case 'equipamento':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'veiculo':
        return <Truck className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCategoriaLabel = (cat: CategoriaAtivoRural) => {
    switch (cat) {
      case 'maquina':
        return 'Máquina Agrícola';
      case 'equipamento':
        return 'Equipamento / Implemento';
      case 'veiculo':
        return 'Veículo / Frota';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Layers className="w-3.5 h-3.5" />
              Inventário Geral de Ativos Rurais
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Inventário de Ativos: Máquinas, Equipamentos e Veículos
            </h2>
            <p className="text-sm text-emerald-200/90 max-w-3xl">
              Levantamento pericial estruturado com categorização, rastreamento por{' '}
              <strong className="text-white">número de série</strong>, classificação técnica do{' '}
              <strong className="text-white">estado de conservação</strong> e apuração do{' '}
              <strong className="text-white">valor de mercado atualizado</strong> para fundamentação do laudo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadDemoDataset}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/20 shadow-sm"
              title="Carregar inventário de demonstração com marcas de ponta do agro"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Exemplo da Fazenda
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/20 shadow-sm"
              title="Exportar planilha completa em CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              Exportar CSV
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              Novo Ativo
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 uppercase font-medium tracking-wider block">
              Total de Ativos
            </span>
            <div className="text-2xl font-black text-white mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-emerald-300/80">
              {stats.operacionais} operacionais • {stats.emManutencao} oficina
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1 lg:col-span-2">
            <span className="text-[11px] text-emerald-200 uppercase font-medium tracking-wider block">
              Valor de Mercado Atualizado
            </span>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">
              R$ {stats.totalValorMercado.toLocaleString('pt-BR')}
            </div>
            <span className="text-[10px] text-emerald-300/80">
              Valor Novo Reposição: R$ {stats.totalValorNovo.toLocaleString('pt-BR')} (-{stats.depreciacaoPercent}%)
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Tractor className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase font-medium tracking-wider">Máquinas ({stats.maquinasCount})</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              R$ {stats.valorMaquinas.toLocaleString('pt-BR')}
            </div>
            <span className="text-[10px] text-slate-300">
              {stats.totalValorMercado > 0
                ? `${Math.round((stats.valorMaquinas / stats.totalValorMercado) * 100)}% do patrimônio`
                : '0%'}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Wrench className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase font-medium tracking-wider">Equipamentos ({stats.equipamentosCount})</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              R$ {stats.valorEquipamentos.toLocaleString('pt-BR')}
            </div>
            <span className="text-[10px] text-slate-300">
              {stats.totalValorMercado > 0
                ? `${Math.round((stats.valorEquipamentos / stats.totalValorMercado) * 100)}% do patrimônio`
                : '0%'}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Truck className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase font-medium tracking-wider">Veículos ({stats.veiculosCount})</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              R$ {stats.valorVeiculos.toLocaleString('pt-BR')}
            </div>
            <span className="text-[10px] text-slate-300">
              {stats.totalValorMercado > 0
                ? `${Math.round((stats.valorVeiculos / stats.totalValorMercado) * 100)}% do patrimônio`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        {/* Category Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setSelectedCategoria('todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                selectedCategoria === 'todas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todos os Ativos</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {inventario.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategoria('maquina')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategoria === 'maquina'
                  ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tractor className="w-3.5 h-3.5 text-amber-600" />
              <span>Máquinas Agrícolas</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {stats.maquinasCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategoria('equipamento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategoria === 'equipamento'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>Equipamentos & Implementos</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {stats.equipamentosCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategoria('veiculo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategoria === 'veiculo'
                  ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Veículos & Utilitários</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                {stats.veiculosCount}
              </span>
            </button>
          </div>

          {/* View toggle table/grid */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Tabela Detalhada"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Grade de Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, série, placa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Estado de Conservação Filter */}
          <div>
            <select
              value={selectedEstado}
              onChange={e => setSelectedEstado(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Estado de Conservação: Todos</option>
              <option value="novo">Novo / Sem Uso</option>
              <option value="excelente">Excelente (Pouco Uso)</option>
              <option value="bom">Bom (Uso Normal)</option>
              <option value="regular">Regular (Desgaste Aparente)</option>
              <option value="reparos_necessarios">Reparos Necessários</option>
              <option value="sucateado">Sucateado / Inoperante</option>
            </select>
          </div>

          {/* Status Operacional Filter */}
          <div>
            <select
              value={selectedStatusOp}
              onChange={e => setSelectedStatusOp(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Status Operacional: Todos</option>
              <option value="em_operacao">Em Operação Normal</option>
              <option value="em_manutencao">Em Manutenção / Oficina</option>
              <option value="parado">Parado / Reserva</option>
              <option value="inoperante">Inoperante / Desativado</option>
            </select>
          </div>

          {/* Summary / Counter */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span>Exibindo:</span>
            <span className="font-bold text-slate-800">
              {filteredAtivos.length} de {inventario.length} ativos
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredAtivos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum ativo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nenhum item corresponde aos filtros selecionados. Tente limpar os termos de busca ou carregar os ativos de demonstração.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategoria('todas');
                setSelectedEstado('todos');
                setSelectedStatusOp('todos');
                setSearchTerm('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Ativo
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Laudo</th>
                  <th className="py-3 px-4">Ativo & Categoria</th>
                  <th className="py-3 px-4">
                    <span className="text-emerald-700 font-bold">Número de Série</span> / Plaqueta
                  </th>
                  <th className="py-3 px-4">Ano / Uso</th>
                  <th className="py-3 px-4">
                    <span className="text-emerald-700 font-bold">Estado Conservação</span>
                  </th>
                  <th className="py-3 px-4 text-right">Valor Reposição (Novo)</th>
                  <th className="py-3 px-4 text-right">
                    <span className="text-emerald-700 font-bold">Valor Mercado Atualizado</span>
                  </th>
                  <th className="py-3 px-4">Localização & Status</th>
                  <th className="py-3 px-4 text-center w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAtivos.map(ativo => {
                  const estadoBadge = getEstadoBadge(ativo.estadoConservacao);
                  const isCopied = copiedId === ativo.id;

                  return (
                    <tr
                      key={ativo.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !ativo.incluirNoLaudo ? 'opacity-50 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Checkbox Inclusão Laudo */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleLaudo(ativo.id)}
                          className={`p-1 rounded transition ${
                            ativo.incluirNoLaudo
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-300 hover:bg-slate-100'
                          }`}
                          title={ativo.incluirNoLaudo ? 'Incluído no Laudo Pericial' : 'Excluído do Laudo'}
                        >
                          {ativo.incluirNoLaudo ? (
                            <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Ativo & Categoria */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 mt-0.5 border border-slate-200">
                            {getCategoriaIcon(ativo.categoria)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>
                                {ativo.marca} {ativo.modelo}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-medium text-slate-600">{ativo.subtipo}</span>
                              {ativo.potenciaCapacidade && (
                                <>
                                  <span>•</span>
                                  <span>{ativo.potenciaCapacidade}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NÚMERO DE SÉRIE (REQUIRED FIELD) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] font-bold text-slate-800 tracking-wider select-all">
                            {ativo.numeroSerie || 'N/A'}
                          </code>
                          <button
                            onClick={() => handleCopySerie(ativo.numeroSerie, ativo.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Copiar número de série"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {ativo.placaOuRegistro && (
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            {ativo.placaOuRegistro}
                          </span>
                        )}
                      </td>

                      {/* Ano / Uso */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {ativo.anoFabricacao}
                          {ativo.anoModelo && ativo.anoModelo !== `${ativo.anoFabricacao}` && (
                            <span className="text-slate-400 text-[11px]"> ({ativo.anoModelo})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{ativo.horimetroOuKm || '—'}</div>
                      </td>

                      {/* ESTADO DE CONSERVAÇÃO (REQUIRED FIELD) */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${estadoBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${estadoBadge.dot}`} />
                          {estadoBadge.label}
                        </span>
                      </td>

                      {/* Valor Novo / Reposição */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-slate-600 font-medium">
                          R$ {ativo.valorNovoReposicaoBrl.toLocaleString('pt-BR')}
                        </div>
                        {ativo.valorNovoReposicaoBrl > ativo.valorMercadoAtualizadoBrl && (
                          <div className="text-[10px] text-rose-500">
                            -
                            {Math.round(
                              ((ativo.valorNovoReposicaoBrl - ativo.valorMercadoAtualizadoBrl) /
                                ativo.valorNovoReposicaoBrl) *
                                100
                            )}
                            % depr.
                          </div>
                        )}
                      </td>

                      {/* VALOR DE MERCADO ATUALIZADO (REQUIRED FIELD) */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm font-black text-emerald-700">
                          R$ {ativo.valorMercadoAtualizadoBrl.toLocaleString('pt-BR')}
                        </div>
                        {ativo.referenciaMercado && (
                          <div
                            className="text-[10px] text-slate-400 truncate max-w-[140px] ml-auto"
                            title={ativo.referenciaMercado}
                          >
                            {ativo.referenciaMercado}
                          </div>
                        )}
                      </td>

                      {/* Localização & Status Operacional */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium truncate max-w-[150px]">
                          {ativo.localizacaoFisica || 'Sede da Fazenda'}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ativo.statusOperacional === 'em_operacao'
                                ? 'bg-emerald-500'
                                : ativo.statusOperacional === 'em_manutencao'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className="text-slate-500 capitalize">
                            {ativo.statusOperacional.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(ativo)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Editar ativo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(ativo)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition"
                            title="Duplicar ativo"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ativo.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Excluir ativo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAtivos.map(ativo => {
            const estadoBadge = getEstadoBadge(ativo.estadoConservacao);
            const isCopied = copiedId === ativo.id;

            return (
              <div
                key={ativo.id}
                className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between ${
                  !ativo.incluirNoLaudo ? 'opacity-60 bg-slate-50/50' : ''
                }`}
              >
                <div>
                  {/* Top bar of card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                        {getCategoriaIcon(ativo.categoria)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                          {getCategoriaLabel(ativo.categoria)}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {ativo.marca} {ativo.modelo}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleLaudo(ativo.id)}
                      className={`p-1 rounded ${
                        ativo.incluirNoLaudo ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                      title={ativo.incluirNoLaudo ? 'Incluído no laudo' : 'Fora do laudo'}
                    >
                      {ativo.incluirNoLaudo ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-50" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">{ativo.subtipo}</p>

                  {/* Highlighted Serial Number */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Número de Série / Chassi
                      </span>
                      <code className="font-mono text-xs font-bold text-slate-800 tracking-wide select-all">
                        {ativo.numeroSerie}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopySerie(ativo.numeroSerie, ativo.id)}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-emerald-700 transition"
                      title="Copiar número de série"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Estado de Conservação Badge & Ano */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${estadoBadge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${estadoBadge.dot}`} />
                      {estadoBadge.label}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Ano: {ativo.anoFabricacao} • {ativo.horimetroOuKm || 'N/A'}
                    </span>
                  </div>

                  {/* Observações */}
                  {ativo.observacoes && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-2">
                      "{ativo.observacoes}"
                    </p>
                  )}
                </div>

                {/* Bottom Financial Values & Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Reposição (Novo)
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        R$ {ativo.valorNovoReposicaoBrl.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                        Valor de Mercado Atualizado
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        R$ {ativo.valorMercadoAtualizadoBrl.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px] truncate max-w-[160px]">
                      📍 {ativo.localizacaoFisica || 'Sede'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(ativo)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-700"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(ativo)}
                        className="p-1 rounded text-slate-500 hover:text-blue-700"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ativo.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CADASTRO / EDIÇÃO COMPLETA DE ATIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {formData.categoria === 'veiculo' ? (
                    <Truck className="w-5 h-5" />
                  ) : formData.categoria === 'equipamento' ? (
                    <Wrench className="w-5 h-5" />
                  ) : (
                    <Tractor className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingAtivoId ? 'Editar Ativo do Inventário' : 'Novo Ativo no Inventário'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Preencha os dados periciais, número de série, conservação e valoração de mercado.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveModalTab('dados')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
                  activeModalTab === 'dados'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Identificação & Número de Série
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('valores')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
                  activeModalTab === 'valores'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Conservação & Valor de Mercado
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('detalhes')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
                  activeModalTab === 'detalhes'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Operação, Localização & Laudo
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeModalTab === 'dados' && (
                <div className="space-y-4">
                  {/* Categoria Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Categoria do Ativo <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            categoria: 'maquina',
                            subtipo: 'Trator de Pneus Agrícola',
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                          formData.categoria === 'maquina'
                            ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Tractor className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Máquina Agrícola</div>
                          <div className="text-[10px] text-slate-500">Tratores, colheitadeiras, pulverizadores</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            categoria: 'equipamento',
                            subtipo: 'Plantadeira Adubadeira',
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                          formData.categoria === 'equipamento'
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Wrench className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Equipamento / Implemento</div>
                          <div className="text-[10px] text-slate-500">Grades, pivôs, geradores, bombas</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            categoria: 'veiculo',
                            subtipo: 'Camionete 4x4',
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                          formData.categoria === 'veiculo'
                            ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Truck className="w-5 h-5 text-indigo-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Veículo / Frota</div>
                          <div className="text-[10px] text-slate-500">Caminhões, camionetes, utilitários</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Subtipo e Marca/Modelo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subtipo / Função <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subtipo || ''}
                        onChange={e => setFormData(prev => ({ ...prev, subtipo: e.target.value }))}
                        placeholder="Ex: Trator de Pneus, Colheitadeira, Caminhão"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Marca do Fabricante <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.marca || ''}
                        onChange={e => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                        placeholder="Ex: John Deere, Case IH, Toyota, Volvo"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Modelo Comercial <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.modelo || ''}
                        onChange={e => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                        placeholder="Ex: 7230J, Axial-Flow 7250, Hilux SRX"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* REQUIRED FIELD: NÚMERO DE SÉRIE */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                        Campo Obrigatório
                      </span>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Rastreabilidade & Número de Série
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Número de Série do Fabricante / Chassi <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.numeroSerie || ''}
                          onChange={e => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
                          placeholder="Ex: 1BM7230JALC019842 ou 9BVFH540NZB881920"
                          className="w-full text-xs font-mono font-bold py-2 px-3 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-amber-800/80 mt-1 block">
                          Número gravado na plaqueta de identificação metálica ou estampado no chassi.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Placa, RENAVAM ou Plaqueta Patrimonial
                        </label>
                        <input
                          type="text"
                          value={formData.placaOuRegistro || ''}
                          onChange={e => setFormData(prev => ({ ...prev, placaOuRegistro: e.target.value }))}
                          placeholder="Ex: Placa RBD-4J20 / Tombamento #TR-04"
                          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Registro auxiliar de trânsito, outorga ou controle interno de frota.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ano e Especificações */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ano Fabricação
                      </label>
                      <input
                        type="number"
                        min="1970"
                        max={new Date().getFullYear() + 1}
                        value={formData.anoFabricacao || new Date().getFullYear()}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, anoFabricacao: Number(e.target.value) }))
                        }
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ano / Modelo
                      </label>
                      <input
                        type="text"
                        value={formData.anoModelo || ''}
                        onChange={e => setFormData(prev => ({ ...prev, anoModelo: e.target.value }))}
                        placeholder="Ex: 2022/2023"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Horímetro ou Km
                      </label>
                      <input
                        type="text"
                        value={formData.horimetroOuKm || ''}
                        onChange={e => setFormData(prev => ({ ...prev, horimetroOuKm: e.target.value }))}
                        placeholder="Ex: 2.890 horas / 85.000 km"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Potência / Capacidade
                      </label>
                      <input
                        type="text"
                        value={formData.potenciaCapacidade || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, potenciaCapacidade: e.target.value }))
                        }
                        placeholder="Ex: 230 cv, 35 pés, 3.000 L"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'valores' && (
                <div className="space-y-4">
                  {/* REQUIRED FIELD: ESTADO DE CONSERVAÇÃO */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Estado de Conservação do Ativo <span className="text-rose-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          key: 'novo',
                          title: 'Novo / Sem Uso',
                          desc: '0 horas/km, garantia de fábrica ativa',
                          badge: 'border-emerald-500 bg-emerald-50 text-emerald-800',
                        },
                        {
                          key: 'excelente',
                          title: 'Excelente',
                          desc: 'Pouco uso, revisões em concessionária',
                          badge: 'border-teal-500 bg-teal-50 text-teal-800',
                        },
                        {
                          key: 'bom',
                          title: 'Bom',
                          desc: 'Uso normal, manutenções em dia, íntegro',
                          badge: 'border-blue-500 bg-blue-50 text-blue-800',
                        },
                        {
                          key: 'regular',
                          title: 'Regular',
                          desc: 'Desgastes aparentes, necessidade de revisão',
                          badge: 'border-amber-500 bg-amber-50 text-amber-800',
                        },
                        {
                          key: 'reparos_necessarios',
                          title: 'Reparos Necessários',
                          desc: 'Avarias mecânicas ou estruturais parciais',
                          badge: 'border-orange-500 bg-orange-50 text-orange-800',
                        },
                        {
                          key: 'sucateado',
                          title: 'Sucateado / Inoperante',
                          desc: 'Fim de vida útil, valor residual de sucata',
                          badge: 'border-rose-500 bg-rose-50 text-rose-800',
                        },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({ ...prev, estadoConservacao: opt.key as any }))
                          }
                          className={`p-3 rounded-xl border text-left transition ${
                            formData.estadoConservacao === opt.key
                              ? `${opt.badge} ring-2 ring-slate-900/10 shadow-sm font-semibold`
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* REQUIRED FIELD: VALOR DE MERCADO ATUALIZADO */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">
                          Valoração Pericial
                        </span>
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Valor de Mercado Atualizado & Reposição
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoEstimateValue}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                        title="Calcular depreciação técnica sugerida pela idade e estado de conservação"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        Estimar Depreciação
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Valor Novo de Reposição (R$)
                        </label>
                        <input
                          type="number"
                          step="1000"
                          value={formData.valorNovoReposicaoBrl || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              valorNovoReposicaoBrl: Number(e.target.value),
                            }))
                          }
                          placeholder="Ex: 850000"
                          className="w-full text-xs font-bold py-2 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Custo de aquisição de bem idêntico ou similar novo no mercado.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-emerald-900 mb-1">
                          Valor de Mercado Atualizado (R$) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="1000"
                          required
                          value={formData.valorMercadoAtualizadoBrl || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              valorMercadoAtualizadoBrl: Number(e.target.value),
                            }))
                          }
                          placeholder="Ex: 620000"
                          className="w-full text-sm font-black text-emerald-800 py-2 px-3 rounded-lg border border-emerald-400 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                        />
                        <span className="text-[10px] text-emerald-800 mt-1 block">
                          Valor presente apurado para a data base da perícia rural.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fonte / Referência da Cotação de Mercado
                      </label>
                      <input
                        type="text"
                        value={formData.referenciaMercado || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, referenciaMercado: e.target.value }))
                        }
                        placeholder="Ex: Tabela FIPE Set/2024, Pesquisa Concessionária John Deere, Molicar"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'detalhes' && (
                <div className="space-y-4">
                  {/* Localização e Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Localização Física na Propriedade
                      </label>
                      <input
                        type="text"
                        value={formData.localizacaoFisica || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, localizacaoFisica: e.target.value }))
                        }
                        placeholder="Ex: Galpão Principal - Sede, Talhão 04, Oficina"
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status Operacional
                      </label>
                      <select
                        value={formData.statusOperacional || 'em_operacao'}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, statusOperacional: e.target.value as any }))
                        }
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="em_operacao">Em Operação Normal</option>
                        <option value="em_manutencao">Em Manutenção / Oficina</option>
                        <option value="parado">Parado / Reserva</option>
                        <option value="inoperante">Inoperante / Desativado</option>
                      </select>
                    </div>
                  </div>

                  {/* Foto do Ativo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL da Fotografia / Evidência Visual
                    </label>
                    <input
                      type="url"
                      value={formData.fotoUrl || ''}
                      onChange={e => setFormData(prev => ({ ...prev, fotoUrl: e.target.value }))}
                      placeholder="https://exemplo.com/foto-trator.jpg"
                      className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Observações Periciais */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Observações Técnicas e Periciais (Avarias, Pneus, Cabine, Histórico)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.observacoes || ''}
                      onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Informe detalhes sobre desgaste de esteiras, vazamentos hidráulicos, estado dos pneus, pintura, implementos acoplados e documentação..."
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Checkbox de Inclusão no Laudo */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Incluir este ativo no Laudo Pericial Oficial
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Se desmarcado, o ativo continuará registrado no inventário interno, mas não somará no valor patrimonial do laudo.
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.incluirNoLaudo !== false}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, incluirNoLaudo: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  {activeModalTab !== 'dados' && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModalTab(activeModalTab === 'detalhes' ? 'valores' : 'dados')
                      }
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Voltar
                    </button>
                  )}

                  {activeModalTab !== 'detalhes' ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModalTab(activeModalTab === 'dados' ? 'valores' : 'detalhes')
                      }
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                    >
                      Próximo Passo
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Salvar Ativo no Inventário
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
