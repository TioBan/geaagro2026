import { MemoryCategory, NemaMemoryItem, NemaMemoryState } from '../components/nema-ai/types';

const MEMORY_STORAGE_KEY = 'agronutri_nema_memory_v1';
const MAX_MEMORY_ITEMS = 30;

const DEFAULT_MEMORY_STATE: NemaMemoryState = {
  enabled: true,
  situationSummary: '',
  items: [],
  lastUpdatedAt: 0,
};

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  talhao_solo: 'Solo & Talhão',
  sanidade_pragas: 'Sanidade & Pragas',
  pecuaria_manejo: 'Pecuária & Rebanho',
  maquinas_operacao: 'Máquinas & Operação',
  decisao_recomendacao: 'Decisão Técnica',
  observacao_campo: 'Ocorrência de Campo',
};

export function loadNemaMemory(): NemaMemoryState {
  if (typeof window === 'undefined') return DEFAULT_MEMORY_STATE;
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return DEFAULT_MEMORY_STATE;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      situationSummary: typeof parsed.situationSummary === 'string' ? parsed.situationSummary : '',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : 0,
    };
  } catch {
    return DEFAULT_MEMORY_STATE;
  }
}

export function saveNemaMemory(state: NemaMemoryState): NemaMemoryState {
  const next: NemaMemoryState = {
    ...state,
    items: state.items.slice(0, MAX_MEMORY_ITEMS),
    lastUpdatedAt: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('[NemaMemory] Erro ao salvar memória local:', e);
    }
  }
  return next;
}

export function toggleNemaMemory(enabled: boolean): NemaMemoryState {
  const current = loadNemaMemory();
  return saveNemaMemory({ ...current, enabled });
}

export function addManualMemoryItem(
  category: MemoryCategory,
  content: string,
  farmScope?: string
): NemaMemoryState {
  const clean = content.trim();
  if (!clean) return loadNemaMemory();
  const current = loadNemaMemory();
  const now = Date.now();
  const item: NemaMemoryItem = {
    id: `mem_${now}_${Math.random().toString(36).slice(2, 6)}`,
    category,
    content: clean,
    farmScope: farmScope?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    source: 'manual',
  };
  return saveNemaMemory({
    ...current,
    items: [item, ...current.items].slice(0, MAX_MEMORY_ITEMS),
  });
}

export function updateSituationSummary(situationSummary: string): NemaMemoryState {
  const current = loadNemaMemory();
  return saveNemaMemory({
    ...current,
    situationSummary: situationSummary.trim(),
  });
}

export function removeMemoryItem(id: string): NemaMemoryState {
  const current = loadNemaMemory();
  return saveNemaMemory({
    ...current,
    items: current.items.filter((it) => it.id !== id),
  });
}

export function clearNemaMemory(): NemaMemoryState {
  const current = loadNemaMemory();
  return saveNemaMemory({
    enabled: current.enabled,
    situationSummary: '',
    items: [],
    lastUpdatedAt: Date.now(),
  });
}

export function applyAIMemoryUpdates(
  updates: {
    updatedSituationSummary?: string;
    newFacts?: { category: MemoryCategory; content: string }[];
  } | undefined,
  farmScope?: string
): { state: NemaMemoryState; addedCount: number } {
  const current = loadNemaMemory();
  if (!current.enabled || !updates) {
    return { state: current, addedCount: 0 };
  }

  let addedCount = 0;
  const now = Date.now();
  const existingNormalized = new Set(
    current.items.map((i) => i.content.toLowerCase().replace(/\s+/g, ' ').trim())
  );

  const newItems: NemaMemoryItem[] = [];
  if (Array.isArray(updates.newFacts)) {
    for (const fact of updates.newFacts) {
      const clean = (fact?.content || '').trim();
      if (!clean || clean.length < 8) continue;
      const norm = clean.toLowerCase().replace(/\s+/g, ' ');
      if (existingNormalized.has(norm)) continue;
      existingNormalized.add(norm);
      const validCategories: MemoryCategory[] = [
        'talhao_solo',
        'sanidade_pragas',
        'pecuaria_manejo',
        'maquinas_operacao',
        'decisao_recomendacao',
        'observacao_campo',
      ];
      const cat: MemoryCategory = validCategories.includes(fact.category)
        ? fact.category
        : 'observacao_campo';

      newItems.push({
        id: `mem_${now}_${Math.random().toString(36).slice(2, 6)}`,
        category: cat,
        content: clean,
        farmScope: farmScope?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        source: 'auto',
      });
      addedCount++;
    }
  }

  const nextSummary =
    updates.updatedSituationSummary && updates.updatedSituationSummary.trim().length > 10
      ? updates.updatedSituationSummary.trim()
      : current.situationSummary;

  if (addedCount === 0 && nextSummary === current.situationSummary) {
    return { state: current, addedCount: 0 };
  }

  const saved = saveNemaMemory({
    ...current,
    situationSummary: nextSummary,
    items: [...newItems, ...current.items].slice(0, MAX_MEMORY_ITEMS),
  });

  return { state: saved, addedCount };
}
