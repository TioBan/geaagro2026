// Storage & Engine for Menu Customization (Análise Técnica & Navbar)
import { NavItem } from '../components/Navbar';

export interface MenuItemCustomization {
  id: string;
  customLabel?: string;
  hidden?: boolean;
  pinned?: boolean;
  order?: number;
}

export interface MenuPreferences {
  preset?: 'default' | 'graos' | 'pecuaria' | 'gestao' | 'hortifruti' | 'custom';
  customOrder: string[]; // List of IDs in order
  items: Record<string, MenuItemCustomization>;
}

export const MENU_STORAGE_KEY = 'agronutri_menu_customization_v1';

export const MENU_PRESETS: Record<string, { label: string; description: string; iconEmoji: string; priorityIds: string[]; hiddenIds?: string[] }> = {
  default: {
    label: 'Padrão / Completo',
    description: 'Exibe todos os módulos na organização padrão do GeaAgro.',
    iconEmoji: '🌟',
    priorityIds: [],
  },
  graos: {
    label: 'Grãos & Grande Lavoura',
    description: 'Focado em Soja, Milho, Algodão: Solos, Folha, ZARC, Fenologia, Plantabilidade, Custos e Defensivos.',
    iconEmoji: '🌾',
    priorityIds: [
      'solos',
      'foliar',
      'recomendacoes',
      'zarc_risco',
      'fenologia',
      'plantabilidade',
      'custos',
      'nematologia',
      'doencas_solo',
      'pluviometria',
      'meteorologia',
      'bulario',
      'tankmix',
      'geoprocessamento',
      'gestao_rural',
    ],
    hiddenIds: ['avicultura', 'suinocultura', 'bubalinos', 'caprinos', 'equinos', 'hidroponia', 'viveiros'],
  },
  pecuaria: {
    label: 'Pecuária & Zootecnia',
    description: 'Focado em Bovinocultura de Corte/Leite, Nutrição Animal, Forrageiras, Equinos e Veterinária.',
    iconEmoji: '🐄',
    priorityIds: [
      'pecuaria',
      'nutricao_animal',
      'forrageiras',
      'bulario_vet',
      'equinos',
      'suinocultura',
      'avicultura',
      'bubalinos',
      'caprinos',
      'gestao_rural',
      'custos',
      'pluviometria',
    ],
    hiddenIds: ['hidroponia', 'viveiros', 'plantabilidade', 'brix', 'doencas_solo'],
  },
  gestao: {
    label: 'Gestão, Custos & DRE',
    description: 'Focado em Administração Rural ERP, Custos Agrícolas 360°, Rastreabilidade e Perícia.',
    iconEmoji: '🚜',
    priorityIds: [
      'custos',
      'gestao_rural',
      'rastreabilidade',
      'pericia_rural',
      'geoprocessamento',
      'zarc_risco',
      'relatorios',
      'historico',
    ],
  },
  hortifruti: {
    label: 'Hortifruti & Irrigação',
    description: 'Focado em Hidroponia, Irrigação de Precisão, Análise de Água, Viveiros, Brix e HF.',
    iconEmoji: '💧',
    priorityIds: [
      'irrigacao',
      'hidroponia',
      'analise_agua',
      'viveiros',
      'brix',
      'foliar',
      'solos',
      'recomendacoes',
      'rastreabilidade',
      'meteorologia',
    ],
    hiddenIds: ['pecuaria', 'bubalinos', 'caprinos', 'equinos', 'suinocultura', 'avicultura'],
  },
};

/**
 * Loads menu customization preferences from localStorage with fallback
 */
export const loadMenuPreferences = (defaultItems: NavItem[]): MenuPreferences => {
  try {
    const saved = localStorage.getItem(MENU_STORAGE_KEY);
    if (saved) {
      const parsed: MenuPreferences = JSON.parse(saved);
      if (parsed && typeof parsed.items === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[MenuCustomization] Failed to parse menu preferences:', err);
  }

  // Generate initial default structure based on current items
  return {
    preset: 'default',
    customOrder: defaultItems.map(item => item.id),
    items: defaultItems.reduce((acc, item, idx) => {
      acc[item.id] = {
        id: item.id,
        customLabel: undefined,
        hidden: false,
        pinned: false,
        order: idx,
      };
      return acc;
    }, {} as Record<string, MenuItemCustomization>),
  };
};

/**
 * Saves menu preferences to localStorage
 */
export const saveMenuPreferences = (preferences: MenuPreferences) => {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.warn('[MenuCustomization] Failed to save menu preferences:', err);
  }
};

/**
 * Applies custom ordering, renaming, and visibility to nav items
 */
export const applyMenuCustomization = (
  defaultItems: NavItem[],
  preferences: MenuPreferences
): NavItem[] => {
  if (!preferences || !preferences.items) return defaultItems;

  const defaultItemsMap = new Map<string, NavItem>();
  defaultItems.forEach(item => defaultItemsMap.set(item.id, item));

  // Determine order: custom order + any new items not yet in custom order
  const orderedIds: string[] = [];
  
  // 1. First add pinned items in their order
  const pinnedIds = (preferences.customOrder || []).filter(id => preferences.items[id]?.pinned);
  orderedIds.push(...pinnedIds);

  // 2. Add remaining non-pinned items from custom order
  (preferences.customOrder || []).forEach(id => {
    if (!orderedIds.includes(id)) {
      orderedIds.push(id);
    }
  });

  // 3. Add any newly registered items from code that weren't in saved storage
  defaultItems.forEach(item => {
    if (!orderedIds.includes(item.id)) {
      orderedIds.push(item.id);
    }
  });

  // Construct customized list
  const customizedList: NavItem[] = [];

  orderedIds.forEach(id => {
    const original = defaultItemsMap.get(id);
    if (!original) return;

    const custom = preferences.items[id];
    
    // Filter out hidden items
    if (custom?.hidden) {
      return;
    }

    customizedList.push({
      ...original,
      label: (custom?.customLabel && custom.customLabel.trim().length > 0) ? custom.customLabel : original.label,
    });
  });

  return customizedList;
};

/**
 * Generates preferences for a given preset
 */
export const generatePresetPreferences = (
  presetKey: string,
  defaultItems: NavItem[]
): MenuPreferences => {
  const preset = MENU_PRESETS[presetKey] || MENU_PRESETS.default;
  const allIds = defaultItems.map(item => item.id);
  const priorityIds = preset.priorityIds.filter(id => allIds.includes(id));
  const otherIds = allIds.filter(id => !priorityIds.includes(id));
  
  const customOrder = [...priorityIds, ...otherIds];
  const hiddenSet = new Set(preset.hiddenIds || []);

  const items: Record<string, MenuItemCustomization> = {};
  customOrder.forEach((id, idx) => {
    items[id] = {
      id,
      customLabel: undefined,
      hidden: hiddenSet.has(id),
      pinned: false,
      order: idx,
    };
  });

  return {
    preset: presetKey as any,
    customOrder,
    items,
  };
};
