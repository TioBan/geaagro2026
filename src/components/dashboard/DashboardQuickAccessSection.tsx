import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  FlaskConical,
  Tractor,
  Leaf,
  Calendar,
  QrCode,
  Sparkles,
  Bug,
  ShieldCheck,
  CloudSun,
  Sprout,
  Droplets,
  DollarSign,
  Beef,
  BarChart2,
  FileCheck2,
  Search,
  ArrowUpRight,
  GripVertical,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Settings2,
} from 'lucide-react';
import { ModuleTooltip } from '../common/ModuleTooltip';
import {
  isModuleActiveInCurrentProfile,
  getActiveProfileId,
  USER_PROFILES,
  UserProfileId,
} from '../../utils/userProfilesStorage';
import { UserProfileCustomizationModal } from '../common/UserProfileCustomizationModal';

const QUICK_ACCESS_ORDER_KEY = 'geaagro_quick_access_order_v1';

export function getStoredQuickAccessOrder(): string[] | null {
  try {
    const data = localStorage.getItem(QUICK_ACCESS_ORDER_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler ordem do Acesso Rápido:', e);
  }
  return null;
}

export function saveStoredQuickAccessOrder(order: string[]): void {
  try {
    localStorage.setItem(QUICK_ACCESS_ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    console.error('Erro ao salvar ordem do Acesso Rápido:', e);
  }
}

export function resetStoredQuickAccessOrder(): void {
  try {
    localStorage.removeItem(QUICK_ACCESS_ORDER_KEY);
  } catch (e) {
    console.error('Erro ao resetar ordem do Acesso Rápido:', e);
  }
}

export interface QuickAccessItem {
  id: string;
  tab: string;
  subTab?: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'solos' | 'campo' | 'protecao' | 'clima' | 'gestao';
  badge?: string;
  badgeColor?: string;
}

export const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    id: 'cadastros',
    tab: 'cadastros',
    title: 'Gestão Agronômica',
    description: 'Propriedades rurais, produtores, agrônomos & talhões mapeados',
    icon: Building2,
    category: 'solos',
    badge: 'Estrutura',
    badgeColor: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300',
  },
  {
    id: 'solos',
    tab: 'solos',
    title: 'Laudos de Solo',
    description: 'Análises químicas completas, textura física, CTC e saturação de bases',
    icon: FlaskConical,
    category: 'solos',
    badge: 'Laboratório',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
  },
  {
    id: 'recomendacoes',
    tab: 'recomendacoes',
    title: 'Manejo & Recomendações',
    description: 'Cálculos de calagem (V%), gessagem, fosfatagem e adubação NPK',
    icon: Tractor,
    category: 'solos',
    badge: 'Nutrição',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'foliar',
    tab: 'foliar',
    title: 'Diagnose Foliar & DRIS',
    description: 'Interpretação de teores em folhas, faixas críticas e desequilíbrios',
    icon: Leaf,
    category: 'solos',
    badge: 'Diagnose',
    badgeColor: 'bg-lime-100 dark:bg-lime-950/80 text-lime-800 dark:text-lime-300',
  },
  {
    id: 'caderno_campo',
    tab: 'caderno_campo',
    subTab: 'operations',
    title: 'Caderno de Campo Digital',
    description: 'Diário oficial de operações, plantio, pulverizações e colheitas',
    icon: Calendar,
    category: 'campo',
    badge: 'GlobalG.A.P.',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300',
  },
  {
    id: 'rastreabilidade',
    tab: 'rastreabilidade',
    title: 'Rastreabilidade Vegetal',
    description: 'Conformidade INC 02/2018, lotes de HF, etiquetas térmicas e QR Code',
    icon: QrCode,
    category: 'campo',
    badge: 'INC 02/2018',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'nema_ia',
    tab: 'nema_ia',
    title: 'Nema IA',
    description: 'Inteligência artificial agronômica para diagnóstico e tomada de decisão',
    icon: Sparkles,
    category: 'campo',
    badge: 'Nema IA',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300',
  },
  {
    id: 'pragas',
    tab: 'pragas',
    title: 'MIP - Pragas & Doenças',
    description: 'Monitoramento integrado de pragas, níveis de controle e armadilhas',
    icon: Bug,
    category: 'protecao',
    badge: 'MIP',
    badgeColor: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300',
  },
  {
    id: 'bulario',
    tab: 'bulario',
    title: 'Bulário de Defensivos',
    description: 'Consulta ágil de defensivos registrados no MAPA, doses e carências',
    icon: ShieldCheck,
    category: 'protecao',
    badge: 'Fitossanitário',
    badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300',
  },
  {
    id: 'meteorologia',
    tab: 'meteorologia',
    title: 'Clima & Pluviometria',
    description: 'Previsão do tempo, histórico pluviométrico e balanço hídrico',
    icon: CloudSun,
    category: 'clima',
    badge: 'Tempo Real',
    badgeColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300',
  },
  {
    id: 'plantabilidade',
    tab: 'plantabilidade',
    title: 'Plantabilidade & Sementes',
    description: 'Estande, vigor, espaçamento de sementes e calibração de dosadores',
    icon: Sprout,
    category: 'clima',
    badge: 'Plantio',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'fertirrigacao',
    tab: 'fertirrigacao',
    title: 'Fertirrigação & Tankmix',
    description: 'Compatibilidade de caldas em tanque e injeção equilibrada de adubos',
    icon: Droplets,
    category: 'clima',
    badge: 'Engenharia',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300',
  },
  {
    id: 'custos',
    tab: 'custos',
    title: 'Gestão de Custos & DRE',
    description: 'Custos operacionais por hectare, margem de contribuição e lucro',
    icon: DollarSign,
    category: 'gestao',
    badge: 'Financeiro',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'forrageiras',
    tab: 'forrageiras',
    title: 'Informações sobre Forrageiras',
    description: 'Catálogo de 30 forrageiras com fotos reais offline, adubação, fenologia, bromatologia e doenças',
    icon: Leaf,
    category: 'campo',
    badge: '30 Forrageiras',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'pecuaria',
    tab: 'pecuaria',
    title: 'Pecuária & Nutrição Animal',
    description: 'Controle de rebanhos, formulação de rações e ganho de peso diário',
    icon: Beef,
    category: 'gestao',
    badge: 'Zootecnia',
    badgeColor: 'bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-300',
  },
  {
    id: 'historico',
    tab: 'historico',
    title: 'Histórico & Comparativos',
    description: 'Evolução temporal da fertilidade do solo e comparativos de safras',
    icon: BarChart2,
    category: 'solos',
    badge: 'Analytics',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300',
  },
  {
    id: 'laudo',
    tab: 'laudo',
    title: 'Laudos Técnicos & ART',
    description: 'Emissão de laudos agronômicos padronizados prontos para impressão',
    icon: FileCheck2,
    category: 'solos',
    badge: 'Emissão PDF',
    badgeColor: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300',
  },
];

interface DashboardQuickAccessSectionProps {
  onNavigate: (tab: string, subTab?: string) => void;
  compact?: boolean;
  title?: string;
  description?: string;
}

interface QuickAccessCardProps {
  item: QuickAccessItem;
  onNavigate: (tab: string, subTab?: string) => void;
  priorityIndex?: number;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ item, onNavigate, priorityIndex }) => {
  const Icon = item.icon;
  const iconRef = React.useRef<HTMLDivElement>(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const hoverTimeoutRef = React.useRef<any>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTooltipOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTooltipOpen(false);
    }, 220);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      onClick={() => onNavigate(item.tab, item.subTab)}
      className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/15 transition-all flex flex-col justify-between group text-left cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-sm relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            ref={iconRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-100/60 dark:border-emerald-800/40 shrink-0 cursor-help"
            title={`Guia rápido: ${item.title}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {priorityIndex !== undefined && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                  priorityIndex < 3
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300/40'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                }`}
                title={`Prioridade de Campo #${priorityIndex + 1}`}
              >
                #{priorityIndex + 1}
              </span>
            )}
            {item.badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border border-black/5 dark:border-white/5 ${
                  item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
          <span>{item.title}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600 dark:text-emerald-400" />
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        <span>Acessar ferramenta</span>
        <span>→</span>
      </div>

      {/* Interactive Tooltip Card */}
      <ModuleTooltip
        moduleId={item.tab}
        targetRef={iconRef}
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        onOpen={() => setIsTooltipOpen(true)}
        onNavigate={(tab, sub) => onNavigate(tab, sub || item.subTab)}
      />
    </div>
  );
};

export const DashboardQuickAccessSection: React.FC<DashboardQuickAccessSectionProps> = ({
  onNavigate,
  compact = false,
  title = 'Acesso Rápido às Funcionalidades',
  description = 'Navegue diretamente pelos módulos técnicos, ferramentas de campo e calculadoras',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReorderMenuOpen, setIsReorderMenuOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [itemsOrder, setItemsOrder] = useState<string[]>(() => {
    return getStoredQuickAccessOrder() || QUICK_ACCESS_ITEMS.map(item => item.id);
  });

  const [activeProfileId, setActiveProfileId] = useState<UserProfileId>(() => getActiveProfileId());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleProfileChange = (e: any) => {
      setActiveProfileId(e.detail?.profileId || getActiveProfileId());
    };
    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => {
      window.removeEventListener('geaagro:profile-changed', handleProfileChange);
    };
  }, []);

  const touchStartY = useRef<number>(0);
  const touchStartIndex = useRef<number | null>(null);

  const categories = useMemo(() => [
    { id: 'todos', label: 'Todos os Módulos' },
    { id: 'solos', label: 'Solos & Nutrição' },
    { id: 'campo', label: 'Campo & Operações' },
    { id: 'protecao', label: 'Proteção & Defensivos' },
    { id: 'clima', label: 'Clima & Engenharia' },
    { id: 'gestao', label: 'Custos & Pecuária' },
  ], []);

  const orderedAllItems = useMemo(() => {
    const itemMap = new Map(QUICK_ACCESS_ITEMS.map(item => [item.id, item]));
    const result: QuickAccessItem[] = [];
    for (const id of itemsOrder) {
      const it = itemMap.get(id);
      if (it) {
        result.push(it);
        itemMap.delete(id);
      }
    }
    for (const it of itemMap.values()) {
      result.push(it);
    }
    // Filter according to active user profile (dashboard is always enabled)
    return result.filter(item => {
      if (item.tab === 'dashboard') return true;
      return isModuleActiveInCurrentProfile(item.tab, activeProfileId);
    });
  }, [itemsOrder, activeProfileId]);

  const isCustomized = useMemo(() => {
    const defaultIds = QUICK_ACCESS_ITEMS.map(item => item.id);
    if (itemsOrder.length !== defaultIds.length) return true;
    return itemsOrder.some((id, idx) => id !== defaultIds[idx]);
  }, [itemsOrder]);

  const filteredItems = useMemo(() => {
    return orderedAllItems.filter(item => {
      let matchesCategory = false;
      if (selectedCategory === 'todos') {
        matchesCategory = true;
      } else {
        matchesCategory = item.category === selectedCategory;
      }

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [orderedAllItems, selectedCategory, searchQuery]);

  const notifyChange = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 2500);
  };

  const reorderItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const itemToMove = filteredItems[fromIndex];
    const targetItem = filteredItems[toIndex];
    if (!itemToMove || !targetItem) return;

    setItemsOrder(prev => {
      const currentList = [...prev];
      const fromGlobal = currentList.indexOf(itemToMove.id);
      const toGlobal = currentList.indexOf(targetItem.id);
      if (fromGlobal === -1 || toGlobal === -1) return prev;

      currentList.splice(fromGlobal, 1);
      currentList.splice(toGlobal, 0, itemToMove.id);

      saveStoredQuickAccessOrder(currentList);
      return currentList;
    });

    notifyChange(`"${itemToMove.title}" movido para prioridade #${toIndex + 1}!`);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < filteredItems.length) {
      reorderItems(index, targetIndex);
    }
  };

  const resetOrder = () => {
    resetStoredQuickAccessOrder();
    const defaultIds = QUICK_ACCESS_ITEMS.map(i => i.id);
    setItemsOrder(defaultIds);
    notifyChange('Ordem padrão de ferramentas restaurada!');
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderItems(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobile Touch Drag and Drop handlers
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartIndex.current = index;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIndex.current === null) return;
    const currentY = e.touches[0].clientY;
    const elements = document.querySelectorAll('[data-drag-item-index]');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (currentY >= rect.top && currentY <= rect.bottom) {
        const idx = Number(el.getAttribute('data-drag-item-index'));
        if (!isNaN(idx) && idx !== dragOverIndex) {
          setDragOverIndex(idx);
        }
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIndex.current !== null && dragOverIndex !== null && touchStartIndex.current !== dragOverIndex) {
      reorderItems(touchStartIndex.current, dragOverIndex);
    }
    touchStartIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              {title}
            </h3>
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {filteredItems.length} ferramentas
            </span>
            {/* Active User Profile Badge */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-800 px-2 py-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
              title="Personalizar ou alterar módulos deste perfil"
            >
              <span>Perfil: <strong>{USER_PROFILES[activeProfileId]?.name || 'Ativo'}</strong></span>
              <SlidersHorizontal className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
            </button>
            {isCustomized && (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Ordem de Campo Ativa
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>
          )}
        </div>

        {/* Search Control */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar funcionalidade..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Filter & Reorder Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Mobile: Category Dropdown + Reorder Button */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex-1">
            <label htmlFor="category-select" className="sr-only">Filtrar por Categoria</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500 font-bold outline-none shadow-2xs"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            id="btn-reorder-dropdown-mobile"
            data-testid="btn-reorder-dropdown-mobile"
            onClick={() => setIsReorderMenuOpen(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              isReorderMenuOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : isCustomized
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500'
            }`}
            title="Ordenar ferramentas de acordo com a prioridade no campo"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span>Prioridade</span>
            {isCustomized && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {isReorderMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Desktop: Category Filter Chips */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: Reorder Toggle Button */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-reorder-dropdown-desktop"
            data-testid="btn-reorder-dropdown-desktop"
            onClick={() => setIsReorderMenuOpen(prev => !prev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isReorderMenuOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : isCustomized
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500'
            }`}
            title="Organizar ferramentas por prioridade no campo (Drag & Drop)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Prioridade no Campo (Drag & Drop)</span>
            {isCustomized && (
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-black">
                Personalizado
              </span>
            )}
            {isReorderMenuOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Reorder Dropdown Menu (Menu Suspenso com Drag-and-Drop) */}
      {isReorderMenuOpen && (
        <div
          id="quick-access-reorder-dropdown-menu"
          data-testid="quick-access-reorder-dropdown-menu"
          className="bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 animate-fadeIn"
        >
          {/* Header of Dropdown Menu */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Menu Suspenso • Priorização de Ferramentas no Campo</span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Arraste os itens (drag-and-drop) pelo ícone ⠿ ou use as setas ▲/▼ para ordenar as ferramentas conforme sua rotina agronômica na lavoura.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isCustomized && (
                <button
                  type="button"
                  onClick={resetOrder}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Restaurar a ordem padrão das ferramentas"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReorderMenuOpen(false)}
                className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>

          {/* Quick Notification Pill */}
          {notificationMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* Draggable List */}
          <div className="max-h-80 overflow-y-auto pr-1 space-y-1.5 no-scrollbar select-none">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={item.id}
                  data-drag-item-id={item.id}
                  data-drag-item-index={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                    isDragging
                      ? 'opacity-40 bg-slate-100 dark:bg-zinc-800 border-dashed border-emerald-500 scale-[0.99]'
                      : isOver
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm scale-[1.01]'
                      : 'bg-slate-50/70 dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Drag Handle & Priority Badge & Icon & Title */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
                      title="Clique e arraste para reordenar"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                        index < 3
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Title and Badge */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setIsReorderMenuOpen(false);
                            onNavigate(item.tab, item.subTab);
                          }}
                          className="font-bold text-xs text-slate-800 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                              item.badgeColor || 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Move Up/Down Controls & Direct Access */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredItems.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>✓ Ordem sincronizada com a tela e salva localmente</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {filteredItems.length} módulos ordenados
            </span>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div
        className={`grid gap-3 ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {filteredItems.map((item, index) => (
          <QuickAccessCard
            key={item.id}
            item={item}
            onNavigate={onNavigate}
            priorityIndex={index}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma funcionalidade encontrada para "{searchQuery}".
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todos');
              }}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Ver todos os módulos
            </button>
          </div>
        </div>
      )}

      {/* Modal de Personalização dos Módulos do Perfil */}
      <UserProfileCustomizationModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
