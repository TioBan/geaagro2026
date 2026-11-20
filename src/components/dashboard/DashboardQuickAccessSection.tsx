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
    description: 'Propriedades rurais, produtores, agrônomos e talhões mapeados',
    icon: Building2,
    category: 'solos',
    badge: 'Estrutura',
  },
  {
    id: 'solos',
    tab: 'solos',
    title: 'Laudos de Solo',
    description: 'Análises químicas completas, textura física, CTC e saturação de bases',
    icon: FlaskConical,
    category: 'solos',
    badge: 'Laboratório',
  },
  {
    id: 'recomendacoes',
    tab: 'recomendacoes',
    title: 'Manejo e Recomendações',
    description: 'Cálculos de calagem (V%), gessagem, fosfatagem e adubação NPK',
    icon: Tractor,
    category: 'solos',
    badge: 'Nutrição',
  },
  {
    id: 'foliar',
    tab: 'foliar',
    title: 'Diagnose Foliar e DRIS',
    description: 'Interpretação de teores em folhas, faixas críticas e desequilíbrios',
    icon: Leaf,
    category: 'solos',
    badge: 'Diagnose',
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
  },
  {
    id: 'rastreabilidade',
    tab: 'rastreabilidade',
    title: 'Rastreabilidade Vegetal',
    description: 'Conformidade INC 02/2018, lotes de HF, etiquetas térmicas e QR Code',
    icon: QrCode,
    category: 'campo',
    badge: 'INC 02/2018',
  },
  {
    id: 'nema_ia',
    tab: 'nema_ia',
    title: 'Nema IA',
    description: 'Inteligência artificial agronômica para diagnóstico e tomada de decisão',
    icon: Sparkles,
    category: 'campo',
    badge: 'Nema IA',
  },
  {
    id: 'pragas',
    tab: 'pragas',
    title: 'MIP — Pragas e Doenças',
    description: 'Monitoramento integrado de pragas, níveis de controle e armadilhas',
    icon: Bug,
    category: 'protecao',
    badge: 'MIP',
  },
  {
    id: 'bulario',
    tab: 'bulario',
    title: 'Bulário de Defensivos',
    description: 'Consulta ágil de defensivos registrados no MAPA, doses e carências',
    icon: ShieldCheck,
    category: 'protecao',
    badge: 'Fitossanitário',
  },
  {
    id: 'meteorologia',
    tab: 'meteorologia',
    title: 'Clima e Pluviometria',
    description: 'Previsão do tempo, histórico pluviométrico e balanço hídrico',
    icon: CloudSun,
    category: 'clima',
    badge: 'Clima',
  },
  {
    id: 'plantabilidade',
    tab: 'plantabilidade',
    title: 'Plantabilidade e Sementes',
    description: 'Estande, vigor, espaçamento de sementes e calibração de dosadores',
    icon: Sprout,
    category: 'clima',
    badge: 'Plantio',
  },
  {
    id: 'fertirrigacao',
    tab: 'fertirrigacao',
    title: 'Fertirrigação e Tankmix',
    description: 'Compatibilidade de caldas em tanque e injeção equilibrada de adubos',
    icon: Droplets,
    category: 'clima',
    badge: 'Engenharia',
  },
  {
    id: 'custos',
    tab: 'custos',
    title: 'Gestão de Custos e DRE',
    description: 'Custos operacionais por hectare, margem de contribuição e lucro',
    icon: DollarSign,
    category: 'gestao',
    badge: 'Financeiro',
  },
  {
    id: 'forrageiras',
    tab: 'forrageiras',
    title: 'Catálogo de Forrageiras',
    description: '30 forrageiras com fotos offline, adubação, fenologia, bromatologia e doenças',
    icon: Leaf,
    category: 'campo',
    badge: '30 espécies',
  },
  {
    id: 'pecuaria',
    tab: 'pecuaria',
    title: 'Pecuária e Nutrição Animal',
    description: 'Controle de rebanhos, formulação de rações e ganho de peso diário',
    icon: Beef,
    category: 'gestao',
    badge: 'Zootecnia',
  },
  {
    id: 'historico',
    tab: 'historico',
    title: 'Histórico e Comparativos',
    description: 'Evolução temporal da fertilidade do solo e comparativos de safras',
    icon: BarChart2,
    category: 'solos',
    badge: 'Analytics',
  },
  {
    id: 'laudo',
    tab: 'laudo',
    title: 'Laudos Técnicos e ART',
    description: 'Emissão de laudos agronômicos padronizados prontos para impressão',
    icon: FileCheck2,
    category: 'solos',
    badge: 'PDF',
  },
  {
    id: 'estatistica',
    tab: 'estatistica',
    title: 'GeaAgro Estatística',
    description: 'Experimentação científica, ANOVA multi-estratos, regressão, PCA e laudos offline',
    icon: BarChart2,
    category: 'campo',
    badge: 'Científico',
  },
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'solos', label: 'Solos e Nutrição' },
  { id: 'campo', label: 'Campo e Operações' },
  { id: 'protecao', label: 'Proteção' },
  { id: 'clima', label: 'Clima e Engenharia' },
  { id: 'gestao', label: 'Custos e Pecuária' },
] as const;

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

const QuickAccessCard: React.FC<QuickAccessCardProps> = React.memo(({ item, onNavigate, priorityIndex }) => {
  const Icon = item.icon;
  const iconRef = useRef<HTMLDivElement>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsTooltipOpen(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsTooltipOpen(false), 220);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(item.tab, item.subTab)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(item.tab, item.subTab);
        }
      }}
      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/70 dark:hover:border-emerald-500/60 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col justify-between group text-left cursor-pointer relative"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div
            ref={iconRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center shrink-0 cursor-help"
            title={`Guia rápido: ${item.title}`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
            {item.badge && <span>{item.badge}</span>}
            {item.badge && priorityIndex !== undefined && (
              <span className="text-slate-300 dark:text-zinc-700">·</span>
            )}
            {priorityIndex !== undefined && (
              <span
                className={
                  priorityIndex < 3
                    ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                    : 'font-medium text-slate-400 dark:text-zinc-500'
                }
                title={`Prioridade de campo #${priorityIndex + 1}`}
              >
                #{priorityIndex + 1}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-semibold text-[13px] text-slate-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between gap-1.5">
          <span className="truncate">{item.title}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400 shrink-0" />
        </h4>

        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>

      {isTooltipOpen && (
        <ModuleTooltip
          moduleId={item.tab}
          targetRef={iconRef}
          isOpen={isTooltipOpen}
          onClose={() => setIsTooltipOpen(false)}
          onOpen={() => setIsTooltipOpen(true)}
          onNavigate={(tab, sub) => onNavigate(tab, sub || item.subTab)}
        />
      )}
    </div>
  );
});

export const DashboardQuickAccessSection: React.FC<DashboardQuickAccessSectionProps> = ({
  onNavigate,
  compact = false,
  title = 'Acesso rápido às funcionalidades',
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
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ profileId?: UserProfileId }>;
      setActiveProfileId(customEvent.detail?.profileId || getActiveProfileId());
    };
    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => {
      window.removeEventListener('geaagro:profile-changed', handleProfileChange);
    };
  }, []);

  const touchStartY = useRef<number>(0);
  const touchStartIndex = useRef<number | null>(null);
  const notifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    };
  }, []);

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
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orderedAllItems.filter(item => {
      const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        (item.badge?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [orderedAllItems, selectedCategory, searchQuery]);

  const notifyChange = (msg: string) => {
    if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    setNotificationMsg(msg);
    notifyTimeoutRef.current = setTimeout(() => {
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

    notifyChange(`"${itemToMove.title}" movido para prioridade #${toIndex + 1}.`);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < filteredItems.length) {
      reorderItems(index, targetIndex);
    }
  };

  const resetOrder = () => {
    resetStoredQuickAccessOrder();
    setItemsOrder(QUICK_ACCESS_ITEMS.map(i => i.id));
    notifyChange('Ordem padrão de ferramentas restaurada.');
  };

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
    if (
      touchStartIndex.current !== null &&
      dragOverIndex !== null &&
      touchStartIndex.current !== dragOverIndex
    ) {
      reorderItems(touchStartIndex.current, dragOverIndex);
    }
    touchStartIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const activeProfileName = USER_PROFILES[activeProfileId]?.name || 'Ativo';

  return (
    <section className="space-y-3.5">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {title}
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              · {filteredItems.length} ferramentas
            </span>
            <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              title="Personalizar ou alterar módulos deste perfil"
            >
              <span>Perfil: {activeProfileName}</span>
              <SlidersHorizontal className="w-3 h-3" />
            </button>
            {isCustomized && (
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                · Ordem personalizada
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar funcionalidade..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Filter & Reorder Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Mobile: Category Dropdown + Reorder Button */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex-1">
            <label htmlFor="category-select" className="sr-only">
              Filtrar por categoria
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:border-emerald-500 outline-none"
            >
              {CATEGORIES.map(cat => (
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
            className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 border whitespace-nowrap ${
              isReorderMenuOpen
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isCustomized
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
            title="Ordenar ferramentas de acordo com a prioridade no campo"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span>Prioridade</span>
            {isReorderMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Desktop: Category Filter Tabs */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-7 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: Reorder Toggle Button */}
        <div className="hidden sm:flex items-center shrink-0">
          <button
            type="button"
            id="btn-reorder-dropdown-desktop"
            data-testid="btn-reorder-dropdown-desktop"
            onClick={() => setIsReorderMenuOpen(prev => !prev)}
            className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
              isReorderMenuOpen
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isCustomized
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
            title="Organizar ferramentas por prioridade no campo (arrastar e soltar)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Prioridade no campo</span>
            {isReorderMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Reorder Panel */}
      {isReorderMenuOpen && (
        <div
          id="quick-access-reorder-dropdown-menu"
          data-testid="quick-access-reorder-dropdown-menu"
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Priorização de ferramentas no campo
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Arraste pelo ícone ou use as setas para ordenar os módulos conforme sua rotina.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {isCustomized && (
                <button
                  type="button"
                  onClick={resetOrder}
                  className="h-7 px-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Restaurar a ordem padrão das ferramentas"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar padrão</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReorderMenuOpen(false)}
                className="h-7 px-2.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Concluir
              </button>
            </div>
          </div>

          {notificationMsg && (
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80 select-none">
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
                  className={`px-3.5 py-2.5 transition-colors flex items-center justify-between gap-2.5 ${
                    isDragging
                      ? 'opacity-40 bg-slate-100 dark:bg-zinc-800'
                      : isOver
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
                      title="Arraste para reordenar"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[11px] font-semibold tabular-nums w-6 shrink-0 ${
                        index < 3
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsReorderMenuOpen(false);
                            onNavigate(item.tab, item.subTab);
                          }}
                          className="font-medium text-xs text-slate-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 truncate text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                        {item.badge && (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0 hidden sm:inline">
                            · {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredItems.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Ordem salva automaticamente neste dispositivo</span>
            <span className="font-medium text-slate-700 dark:text-zinc-300 tabular-nums">
              {filteredItems.length} módulos
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
        <div className="p-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma funcionalidade encontrada para "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('todos');
            }}
            className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Ver todos os módulos
          </button>
        </div>
      )}

      {isProfileModalOpen && (
        <UserProfileCustomizationModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </section>
  );
};
