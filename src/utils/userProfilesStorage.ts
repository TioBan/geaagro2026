/**
 * GeaAgro - Configurações: Sistema de Perfis de Uso & Personalização de Módulos
 * 
 * Perfis Nativos:
 * - Agricultor: Focado em lavoura, manejo de solo, nutrição foliar, fitossanidade, irrigação e defensivos.
 * - Pecuarista: Focado em bovinocultura, nutrição animal, forrageiras, suínos, aves, equinos e veterinária.
 * - Administrador: Focado em administração rural, ERP 360°, custos, safras, máquinas, contratos e relatórios.
 * - Perícia: Focado em avaliação de imóveis rurais (NBR 14653), vistorias, geoprocessamento, satélite e laudos ART.
 * - Todos: Exibe todos os módulos sem filtros.
 * 
 * Permite que qualquer usuário inclua, oculte ou altere módulos livremente no seu perfil dentro de Configurações.
 */

export type UserProfileId = 'agricultor' | 'pecuarista' | 'administrador' | 'pericia' | 'todos';

export interface UserProfileInfo {
  id: UserProfileId;
  name: string;
  shortLabel: string;
  badge: string;
  description: string;
  iconName: 'Sprout' | 'Beef' | 'Building2' | 'Scale' | 'Layers';
  colorClass: string;
  activeBgClass: string;
  defaultModuleIds: string[];
}

export interface SystemModuleMetadata {
  id: string;
  label: string;
  category: 'agricultura' | 'pecuaria' | 'gestao' | 'pericia' | 'geral';
  categoryLabel: string;
  description: string;
  defaultInProfiles: UserProfileId[];
}

export const ACTIVE_PROFILE_KEY = 'geaagro_active_user_profile_v1';
export const PROFILE_MODULES_PREFIX = 'geaagro_profile_modules_v1_';

// Catálogo completo de módulos da plataforma
export const SYSTEM_MODULES: SystemModuleMetadata[] = [
  // Módulos Essenciais / Gerais (Módulo Principal)
  {
    id: 'dashboard',
    label: 'Dashboard Executivo',
    category: 'geral',
    categoryLabel: 'Painel Central',
    description: 'Visão geral da fazenda, KPIs produtivos, alertas e acessos rápidos.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    category: 'geral',
    categoryLabel: 'Principal & Sistema',
    description: 'Configuração de perfis de uso (Agricultor, Pecuarista, Administrador, Perícia, Todos) e personalização de módulos.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'],
  },
  {
    id: 'cadastros',
    label: 'Cadastro Técnico',
    category: 'geral',
    categoryLabel: 'Cadastros',
    description: 'Gestão de fazendas, produtores rurais, responsáveis técnicos e talhões.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'],
  },
  {
    id: 'geaagro_edu',
    label: 'GeaAgro Edu',
    category: 'geral',
    categoryLabel: 'Educação & Conteúdo',
    description: 'Portal de conhecimento agronômico: tutoriais em vídeo do software no YouTube, artigos técnicos, cálculos e mapas mentais.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'],
  },
  {
    id: 'caderno_campo',
    label: 'Caderno de Campo Digital',
    category: 'agricultura',
    categoryLabel: 'Operações de Campo',
    description: 'Registros diários de operações, pulverizações, adubações e rastreabilidade.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'todos'],
  },
  {
    id: 'nema_ia',
    label: 'Nema IA (Assistente Técnico)',
    category: 'agricultura',
    categoryLabel: 'Inteligência Artificial',
    description: 'Diagnósticos por imagem, conversa técnica e cálculo de risco por talhão.',
    defaultInProfiles: ['agricultor', 'todos'],
  },

  // Módulos de Agricultura
  {
    id: 'solos',
    label: 'Análise de Solo',
    category: 'agricultura',
    categoryLabel: 'Manejo de Solo',
    description: 'Interpretação química e física completa de laudos de solo com IA/OCR.',
    defaultInProfiles: ['agricultor', 'pericia', 'todos'],
  },
  {
    id: 'recomendacoes',
    label: 'Recomendações Agronômicas',
    category: 'agricultura',
    categoryLabel: 'Nutrição Vegetal',
    description: 'Cálculo de calagem (8 métodos), gessagem, fosfatagem e NPK para 40+ culturas.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'foliar',
    label: 'Diagnose Foliar',
    category: 'agricultura',
    categoryLabel: 'Nutrição Vegetal',
    description: 'Equilíbrio nutricional de folhas, índices DRIS, CND e faixas críticas.',
    defaultInProfiles: ['agricultor', 'pericia', 'todos'],
  },
  {
    id: 'brix',
    label: 'Brix Foliar & Trofobiose',
    category: 'agricultura',
    categoryLabel: 'Fisiologia Vegetal',
    description: 'Medição de sólidos solúveis, imunidade vegetal e índice de saúde foliar (ISF).',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'plantabilidade',
    label: 'Plantabilidade de Precisão',
    category: 'agricultura',
    categoryLabel: 'Engenharia de Plantio',
    description: 'Uniformidade de sementes, espaçamento, singulação e índice IGP.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'fenologia',
    label: 'Fenologia & Gêmeo Digital',
    category: 'agricultura',
    categoryLabel: 'Manejo de Safra',
    description: 'Escalas fenológicas (BBCH/Feekes), acúmulo térmico (GDD) e diário fotográfico.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'pragas',
    label: 'MIP & Radar Fitossanitário',
    category: 'agricultura',
    categoryLabel: 'Sanidade Vegetal',
    description: 'Manejo Integrado de Pragas, níveis de ação econômica e inimigos naturais.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'nematologia',
    label: 'Nematologia Agrícola',
    category: 'agricultura',
    categoryLabel: 'Sanidade Vegetal',
    description: 'Monitoramento, identificação e controle de fitonematoides por talhão.',
    defaultInProfiles: ['agricultor', 'pericia', 'todos'],
  },
  {
    id: 'doencas_solo',
    label: 'Doenças do Solo & Raízes',
    category: 'agricultura',
    categoryLabel: 'Sanidade Vegetal',
    description: 'Manejo de fungos radiculares, murcha, podridões e índice IGSS.',
    defaultInProfiles: ['agricultor', 'pericia', 'todos'],
  },
  {
    id: 'bulario',
    label: 'Compêndio de Defensivos MAPA',
    category: 'agricultura',
    categoryLabel: 'Tecnologia de Aplicação',
    description: 'Consulta oficial a mais de 2.000 defensivos registrados com bulas e doses.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'tankmix',
    label: 'TankMix (Compatibilidade de Calda)',
    category: 'agricultura',
    categoryLabel: 'Tecnologia de Aplicação',
    description: 'Ordem WALES, incompatibilidades físico-químicas e ICG de calda de pulverização.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'fertirrigacao',
    label: 'Compatibilidade de Fertilizantes',
    category: 'agricultura',
    categoryLabel: 'Irrigação & Nutrição',
    description: 'Simulador de tanques A e B, solubilidade iônica e misturas de sais.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'irrigacao',
    label: 'Irrigação & Manejo Hídrico',
    category: 'agricultura',
    categoryLabel: 'Irrigação & Nutrição',
    description: 'Dimensionamento de pivôs, gotejo, lâmina de irrigação e balanço hídrico.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'analise_agua',
    label: 'Análise de Água (Irrigação & Campo)',
    category: 'agricultura',
    categoryLabel: 'Qualidade Hídrica',
    description: 'Classificação USSL, SAR/RAS, risco de entupimento e salinidade.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'todos'],
  },
  {
    id: 'hidroponia',
    label: 'Hidroponia & Estufas',
    category: 'agricultura',
    categoryLabel: 'Ambiente Protegido',
    description: 'Gestão de bancadas NFT/semi-hidropônico, soluções nutritivas e condutividade.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'viveiros',
    label: 'Produção de Mudas (Viveiro)',
    category: 'agricultura',
    categoryLabel: 'Ambiente Protegido',
    description: 'Rastreabilidade de bandejas, substratos, sanidade e expedição de mudas.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'analise_sementes',
    label: 'Análise de Sementes & IQS',
    category: 'agricultura',
    categoryLabel: 'Sementes',
    description: 'Testes de germinação, pureza física, tetrazólio e vigor de lotes.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'calculos_agronomicos',
    label: 'Cálculos Agronômicos',
    category: 'agricultura',
    categoryLabel: 'Calculadoras',
    description: 'População de plantas, velocidade de plantio, calibração de bicos e perdas.',
    defaultInProfiles: ['agricultor', 'todos'],
  },
  {
    id: 'pluviometria',
    label: 'Pluviometria & Chuvas',
    category: 'agricultura',
    categoryLabel: 'Clima',
    description: 'Apontamento de pluviômetros, mapas de precipitação e índice IEC.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'pericia', 'todos'],
  },
  {
    id: 'meteorologia',
    label: 'Climatologia & Previsão 15 Dias',
    category: 'agricultura',
    categoryLabel: 'Clima',
    description: 'Temperatura, umidade relativa, vento, delta T e janelas ideais de pulverização.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'pericia', 'todos'],
  },
  {
    id: 'rastreabilidade',
    label: 'Rastreabilidade Agrícola',
    category: 'agricultura',
    categoryLabel: 'Rastreabilidade',
    description: 'Etiquetas térmicas, QR Codes e rastreabilidade total de colheita.',
    defaultInProfiles: ['agricultor', 'administrador', 'todos'],
  },

  // Módulos de Pecuária & Zootecnia
  {
    id: 'pecuaria',
    label: 'Bovinocultura (Corte & Leite)',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Gestão de rebanho, pesagens (GMD), reprodução IATF, leite e pastagens.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'nutricao_animal',
    label: 'Nutrição Animal & Rações',
    category: 'pecuaria',
    categoryLabel: 'Zootecnia',
    description: 'Formulação de rações por custo mínimo (Simplex), bromatologia e premix.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'forrageiras',
    label: 'Catálogo de Forrageiras & Pastagens',
    category: 'pecuaria',
    categoryLabel: 'Pastagens',
    description: 'Catálogo de 60 gramíneas/leguminosas, cálculo de semeadura VC% e sanidade.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'bubalinos',
    label: 'Bubalinocultura de Precisão',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Controle de búfalos de leite e corte, mozzarella e genealogia ABCB.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'caprinos',
    label: 'Caprinos & Ovinos',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Manejo de ovinos e caprinos, controle leiteiro, corte e índice FAMACHA.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'equinos',
    label: 'Equinocultura & Haras',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Controle de plantel equino, treinos, ferrageamento e escore Henneke.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'suinocultura',
    label: 'Suinocultura',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Maternidade, creche, terminação e acompanhamento de GMD e conversão alimentar.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'avicultura',
    label: 'Avicultura de Precisão',
    category: 'pecuaria',
    categoryLabel: 'Pecuária',
    description: 'Controle de galpões, ambiência térmica, curvas de postura e índice IEA.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },
  {
    id: 'bulario_vet',
    label: 'Compêndio Veterinário',
    category: 'pecuaria',
    categoryLabel: 'Saúde Animal',
    description: 'Bulário veterinário completo, doses por peso vivo e tabela de carências.',
    defaultInProfiles: ['pecuarista', 'todos'],
  },

  // Módulos de Administração & Gestão Rural
  {
    id: 'gestao_rural',
    label: 'Administração & Gestão Rural',
    category: 'gestao',
    categoryLabel: 'ERP & Gestão',
    description: 'ERP 360°, controle financeiro, almoxarifado, compras, vendas, máquinas e RH.',
    defaultInProfiles: ['administrador', 'todos'],
  },
  {
    id: 'custos',
    label: 'Gestão de Custo & DRE Agrícola',
    category: 'gestao',
    categoryLabel: 'ERP & Gestão',
    description: 'Custos operacionais (COE, COT, CT), margem de contribuição e simuladores.',
    defaultInProfiles: ['administrador', 'pecuarista', 'todos'],
  },
  {
    id: 'geoprocessamento',
    label: 'Geoprocessamento & NDVI',
    category: 'pericia',
    categoryLabel: 'Geotecnologia',
    description: 'Mapeamento de talhões com satélite, cálculo de área e índices espectrais.',
    defaultInProfiles: ['administrador', 'pericia', 'todos'],
  },
  {
    id: 'zarc_risco',
    label: 'ZARC & Risco Climático',
    category: 'pericia',
    categoryLabel: 'Zoneamento Agrícola',
    description: 'Zoneamento agrícola de risco climático do MAPA e janelas de plantio.',
    defaultInProfiles: ['administrador', 'pericia', 'todos'],
  },
  {
    id: 'relatorios',
    label: 'Laudo Técnico Oficial & ART',
    category: 'pericia',
    categoryLabel: 'Documentação',
    description: 'Emissão oficial de laudos periciais e agronômicos formatados com CREA/ART.',
    defaultInProfiles: ['agricultor', 'administrador', 'pericia', 'todos'],
  },
  {
    id: 'pericia_rural',
    label: 'Perícia Rural & Avaliação NBR 14653',
    category: 'pericia',
    categoryLabel: 'Perícia & Avaliação',
    description: 'Avaliação de imóveis rurais, benfeitorias, máquinas agrícolas e vistorias.',
    defaultInProfiles: ['pericia', 'todos'],
  },
  {
    id: 'historico',
    label: 'Histórico & Comparativo de Safras',
    category: 'gestao',
    categoryLabel: 'Auditoria',
    description: 'Evolução de produtividade e comparativo multi-safras.',
    defaultInProfiles: ['agricultor', 'administrador', 'todos'],
  },
  {
    id: 'backup',
    label: 'Backup e Restauração',
    category: 'geral',
    categoryLabel: 'Segurança',
    description: 'Cópias de segurança, restauração e exportação criptografada offline.',
    defaultInProfiles: ['administrador', 'todos'],
  },
  {
    id: 'sobre',
    label: 'Sobre o Sistema',
    category: 'geral',
    categoryLabel: 'Sistema',
    description: 'Informações institucionais, normas agronômicas e versões do GeaAgro.',
    defaultInProfiles: ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'],
  },
];

// Configuração oficial dos 5 Perfis de Uso
export const USER_PROFILES: Record<UserProfileId, UserProfileInfo> = {
  agricultor: {
    id: 'agricultor',
    name: 'Agricultor',
    shortLabel: 'Agricultura',
    badge: 'Lavoura & Solos',
    description: 'Módulos focados no manejo da lavoura, solo, sementes, nutrição, MIP, defensivos e colheita.',
    iconName: 'Sprout',
    colorClass: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/40',
    activeBgClass: 'bg-emerald-600 text-white',
    defaultModuleIds: SYSTEM_MODULES.filter(m => m.defaultInProfiles.includes('agricultor')).map(m => m.id),
  },
  pecuarista: {
    id: 'pecuarista',
    name: 'Pecuarista',
    shortLabel: 'Pecuária',
    badge: 'Agropecuária & Rebanho',
    description: 'Módulos dedicados à pecuária de corte, leite, nutrição animal, pastagens, suínos, aves e equinos.',
    iconName: 'Beef',
    colorClass: 'text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/40',
    activeBgClass: 'bg-amber-600 text-white',
    defaultModuleIds: SYSTEM_MODULES.filter(m => m.defaultInProfiles.includes('pecuarista')).map(m => m.id),
  },
  administrador: {
    id: 'administrador',
    name: 'Administrador',
    shortLabel: 'Administração',
    badge: 'Gestão Rural ERP',
    description: 'Módulos de gestão financeira, custos, planejamento de safras, estoques, máquinas, RH e contratos.',
    iconName: 'Building2',
    colorClass: 'text-blue-700 dark:text-blue-400 border-blue-500/40 bg-blue-50/80 dark:bg-blue-950/40',
    activeBgClass: 'bg-blue-600 text-white',
    defaultModuleIds: SYSTEM_MODULES.filter(m => m.defaultInProfiles.includes('administrador')).map(m => m.id),
  },
  pericia: {
    id: 'pericia',
    name: 'Perícia',
    shortLabel: 'Perícia & Avaliação',
    badge: 'Laudos & NBR 14653',
    description: 'Módulos de avaliação imobiliária rural, vistorias técnicas, geoprocessamento satelital e laudos judiciais.',
    iconName: 'Scale',
    colorClass: 'text-purple-700 dark:text-purple-400 border-purple-500/40 bg-purple-50/80 dark:bg-purple-950/40',
    activeBgClass: 'bg-purple-600 text-white',
    defaultModuleIds: SYSTEM_MODULES.filter(m => m.defaultInProfiles.includes('pericia')).map(m => m.id),
  },
  todos: {
    id: 'todos',
    name: 'Todos os Módulos',
    shortLabel: 'Todos',
    badge: 'Visão Completa',
    description: 'Exibe a plataforma completa com todos os módulos de agricultura, pecuária, gestão e perícia.',
    iconName: 'Layers',
    colorClass: 'text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 bg-slate-100/80 dark:bg-zinc-800/80',
    activeBgClass: 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900',
    defaultModuleIds: SYSTEM_MODULES.map(m => m.id),
  },
};

export const USER_PROFILES_LIST: UserProfileInfo[] = Object.values(USER_PROFILES);

function getLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

function emitProfileChanged(detail: any): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('geaagro:profile-changed', { detail }));
  } else if (typeof globalThis !== 'undefined' && typeof (globalThis as any).dispatchEvent === 'function') {
    (globalThis as any).dispatchEvent(new CustomEvent('geaagro:profile-changed', { detail }));
  }
}

/**
 * Lê o perfil de uso ativo no momento (padrão: 'todos' para manter acesso integral por padrão)
 */
export function getActiveProfileId(): UserProfileId {
  const storage = getLocalStorage();
  if (!storage) return 'todos';
  try {
    const saved = storage.getItem(ACTIVE_PROFILE_KEY);
    if (saved && (saved in USER_PROFILES)) {
      return saved as UserProfileId;
    }
  } catch (e) {
    console.error('Erro ao ler perfil ativo:', e);
  }
  return 'todos';
}

/**
 * Salva o perfil ativo e dispara evento global de atualização
 */
export function setActiveProfileId(profileId: UserProfileId): void {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(ACTIVE_PROFILE_KEY, profileId);
    } catch (e) {
      console.error('Erro ao salvar perfil ativo:', e);
    }
  }
  emitProfileChanged({ profileId });
}

/**
 * Retorna a lista de módulos habilitados para determinado perfil,
 * considerando personalizações feitas pelo usuário ou o padrão do perfil.
 */
export function getProfileEnabledModules(profileId: UserProfileId): string[] {
  const storage = getLocalStorage();
  if (!storage) {
    return USER_PROFILES[profileId]?.defaultModuleIds || [];
  }

  try {
    const customKey = `${PROFILE_MODULES_PREFIX}${profileId}`;
    const saved = storage.getItem(customKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Erro ao carregar módulos customizados do perfil ${profileId}:`, e);
  }

  return USER_PROFILES[profileId]?.defaultModuleIds || [];
}

/**
 * Salva a lista personalizada de módulos de um perfil
 */
export function setProfileEnabledModules(profileId: UserProfileId, moduleIds: string[]): void {
  const sanitized = Array.from(new Set(['dashboard', 'configuracoes', ...moduleIds]));
  const storage = getLocalStorage();
  if (storage) {
    try {
      const customKey = `${PROFILE_MODULES_PREFIX}${profileId}`;
      storage.setItem(customKey, JSON.stringify(sanitized));
    } catch (e) {
      console.error(`Erro ao salvar módulos customizados do perfil ${profileId}:`, e);
    }
  }
  emitProfileChanged({ profileId, moduleIds: sanitized });
}

/**
 * Restaura os módulos padrão de um perfil
 */
export function resetProfileToDefault(profileId: UserProfileId): string[] {
  const defaultModules = USER_PROFILES[profileId]?.defaultModuleIds || [];
  const storage = getLocalStorage();
  if (storage) {
    try {
      const customKey = `${PROFILE_MODULES_PREFIX}${profileId}`;
      storage.removeItem(customKey);
    } catch (e) {
      console.error(`Erro ao resetar perfil ${profileId}:`, e);
    }
  }
  emitProfileChanged({ profileId, moduleIds: defaultModules });
  return defaultModules;
}

/**
 * Verifica se um módulo está ativo no perfil atual
 */
export function isModuleActiveInCurrentProfile(moduleId: string, activeProfileId?: UserProfileId): boolean {
  // O dashboard e as configurações são permanentes no módulo Principal
  if (moduleId === 'dashboard' || moduleId === 'configuracoes') return true;

  const currentProfile = activeProfileId || getActiveProfileId();
  if (currentProfile === 'todos') {
    // Verifica se o usuário customizou a lista de 'todos'
    const enabled = getProfileEnabledModules('todos');
    return enabled.includes(moduleId);
  }

  const enabled = getProfileEnabledModules(currentProfile);
  return enabled.includes(moduleId);
}
