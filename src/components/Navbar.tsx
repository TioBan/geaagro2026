import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { handleAgroLogoClick } from '../utils/agroEasterEgg';
import {
  Layers,
  FlaskConical,
  Calculator,
  Leaf,
  FileText,
  Cpu,
  Building2,
  Warehouse,
  Download,
  UploadCloud,
  Menu,
  X,
  ChevronRight,
  History,
  Moon,
  Sun,
  Smartphone,
  Check,
  Flower2,
  Droplets,
  CloudSun,
  CloudRain,
  Sparkles,
  Sprout,
  Microscope,
  Bug,
  Beef,
  Tractor,
  LayoutGrid,
  Target,
  Home,
  Thermometer,
  Wheat,
  Scale,
  Syringe,
  BookOpen,
  Plus,
  FileSearch,
  FileCheck2,
  MapPin,
  Calendar,
  Activity,
  Bot,
  Boxes,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Database,
  QrCode,
  Dna,
  Camera,
  Search,
  BarChart2,
  FileSpreadsheet,
  Sliders,
  AlertTriangle,
  Gauge,
  Compass,
  Clock,
  DollarSign,
  Settings,
  RefreshCw,
  MessageSquarePlus,
  Package,
  Egg,
  TrendingUp,
  Eye,
  CheckCircle2,
  Globe,
  Youtube,
  Layers3,
  HelpCircle,
  Info,
  Heart,
  User,
  GraduationCap,
  ExternalLink,
  Bell,
  Award,
  Hammer,
  Ruler,
  Wrench,
  Landmark,
  Tag,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  Building,
  UserCheck,
} from 'lucide-react';
import { SuinoIcon } from './icons/SuinoIcon';
import { CaprinoIcon } from './icons/CaprinoIcon';
import { EquinoIcon } from './icons/EquinoIcon';
import { BovinoIcon } from './icons/BovinoIcon';
import { BubalinoIcon } from './icons/BubalinoIcon';
import { NemaIAEstatisticaIcon } from './icons/NemaIAEstatisticaIcon';
import { Farm, RuralProducer, Agronomist, Company } from '../types/agronomy';
import { ModuleTooltip } from './common/ModuleTooltip';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  isModuleActiveInCurrentProfile,
  getActiveProfileId,
  setActiveProfileId,
  UserProfileId,
} from '../utils/userProfilesStorage';
import { usePWAInstall } from '../hooks/usePWAInstall';

const UserProfileCustomizationModal = lazyWithRetry(() =>
  import('./common/UserProfileCustomizationModal').then(m => ({ default: m.UserProfileCustomizationModal }))
);

export interface NavSubItem {
  id: string;
  label: string;
  badge?: string;
  icon?: any;
  externalUrl?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  externalUrl?: string;
  subItems?: NavSubItem[];
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  farms: Farm[];
  producers: RuralProducer[];
  agronomists: Agronomist[];
  company?: Company;
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarCollapsed?: boolean;
  setIsSidebarCollapsed?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
}

const AVALIACAO_IMOVEIS_NAV_ITEM: NavItem = {
  id: 'avaliacao_imoveis',
  label: 'Avaliação de Imóveis Rurais',
  icon: Landmark,
  badge: 'NBR 14653-3',
  subItems: [
    { id: 'dashboard', label: 'Dashboard & Indicadores', icon: LayoutGrid },
    { id: 'propriedade', label: '1. Imóvel & Território', icon: Building2 },
    { id: 'solicitante', label: '2. Solicitante & Finalidade', icon: UserCheck },
    { id: 'vistoria', label: '3. Vistoria & Pontos GPS', icon: MapPin },
    { id: 'benfeitorias', label: '4. Benfeitorias Ross-Heidecke', icon: Building },
    { id: 'solos_aptidao', label: '5. Solos & Aptidão Embrapa', icon: Sprout },
    { id: 'pesquisa_mercado', label: '6. Pesquisa de Mercado', icon: TrendingUp },
    { id: 'estatistica', label: '7. Tratamento Estatístico', icon: Calculator },
    { id: 'metodos', label: '8. Métodos de Avaliação', icon: Scale },
    { id: 'mapa', label: '9. Mapa Interativo OSM', icon: Compass },
    { id: 'due_diligence', label: '10. Due Diligence Legal', icon: FileCheck2 },
    { id: 'simulador', label: '11. CapEx & Valorização', icon: Sparkles },
    { id: 'laudo_emissao', label: '12. Emissão de Laudo PDF', icon: FileText },
    { id: 'indicadores_gea', label: '13. Índices GeaAgro', icon: Award },
    { id: 'ia_assistente', label: '14. Assistente Técnico IA', icon: Bot },
    { id: 'biblioteca', label: '15. Biblioteca de Normas', icon: BookOpen },
  ],
};

const RECUPERA_NAV_ITEM: NavItem = {
  id: 'recupera',
  label: 'Recupera — Áreas Degradadas',
  icon: Sprout,
  badge: 'PWA 7 Fases',
  subItems: [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutGrid },
    { id: 'propriedades', label: '1. Propriedades & Território', icon: Building2 },
    { id: 'areas', label: '2. Áreas Degradadas', icon: MapPin },
    { id: 'diagnostico', label: '3. Diagnóstico Técnico', icon: FlaskConical },
    { id: 'analises_solo', label: '4. Análise de Solo', icon: Sprout },
    { id: 'projetos', label: '5. Projetos de Recuperação', icon: FileText },
    { id: 'calculadoras', label: '6. Calculadoras Agronômicas', icon: Calculator },
    { id: 'pastagens', label: '7. Pastagens Degradadas', icon: Beef },
    { id: 'cobertura', label: '8. Plantas de Cobertura', icon: Leaf },
    { id: 'conservacao_solo', label: '9. Conservação & Terraços', icon: Layers },
    { id: 'ambiental', label: '10. APP, Reserva & Mudas', icon: Flower2 },
    { id: 'mapas', label: '11. Mapeamento & GPS', icon: Compass },
    { id: 'monitoramento', label: '12. Monitoramento & IGRA', icon: Activity },
    { id: 'custos', label: '13. Custos & Orçamento', icon: DollarSign },
    { id: 'cronogramas', label: '14. Cronograma Operacional', icon: Calendar },
    { id: 'relatorios', label: '15. Relatórios & Laudos PDF', icon: FileCheck2 },
    { id: 'biblioteca', label: '16. Biblioteca Técnica Embrapa', icon: BookOpen },
  ],
};

const NAV_PRINCIPAL: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Warehouse },
  AVALIACAO_IMOVEIS_NAV_ITEM,
  RECUPERA_NAV_ITEM,
    {
      id: 'nema_ia',
      label: 'Nema IA',
      icon: Sprout,
      subItems: [
        { id: 'nema_ia_chat', label: 'Conversa com Nema IA', icon: Bot },
        { id: 'ia_estatistica', label: 'Nema IA Estatística', icon: NemaIAEstatisticaIcon },
      ],
    },
    {
      id: 'caderno_campo',
      label: 'Caderno de Campo',
      icon: Tractor,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutGrid },
        { id: 'operations', label: 'Operações & Manejo', icon: Calendar },
        { id: 'fields', label: 'Talhões & Culturas', icon: MapPin },
        { id: 'digital_twin', label: 'Gêmeo Digital do Talhão', icon: Target },
        { id: 'nematology', label: 'Monitoramento de Nematoides', icon: Microscope },
        { id: 'producao_mudas', label: 'Produção de Mudas (Viveiro)', icon: Flower2 },
        { id: 'hidroponia', label: 'Hidroponia & Estufas', icon: Droplets },
        { id: 'tankmix', label: 'Tankmix (Calda & Defensivos)', icon: FlaskConical },
        { id: 'avicultura', label: 'Avicultura', icon: Egg },
        { id: 'nutricao_animal', label: 'Nutrição Animal', icon: Wheat },
        { id: 'pecuaria', label: 'Bovinocultura', icon: BovinoIcon },
        { id: 'suinocultura', label: 'Suinocultura', icon: SuinoIcon },
        { id: 'recomendacoes', label: 'Recomendações Agronômicas', icon: Calculator },
        { id: 'reports', label: 'Auditoria & Relatórios GlobalG.A.P.', icon: ShieldCheck },
      ],
    },
    { id: 'cadastros', label: 'Cadastro Técnico', icon: Building2 },
    { id: 'geaagro_edu', label: 'GeaAgro Edu', icon: GraduationCap },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      subItems: [
        { id: 'perfil_uso', label: 'Perfil de Uso', icon: Sliders },
        { id: 'memoria', label: 'Módulo de Memória', icon: Cpu },
        { id: 'energia', label: 'Módulo de Energia', icon: Zap },
        { id: 'tema', label: 'Módulo Tema', icon: Sun },
        { id: 'atualizacoes', label: 'Atualizações do Sistema', icon: RefreshCw },
        { id: 'sobre', label: 'Sobre', icon: Info },
        {
          id: 'feedback',
          label: 'Feedback',
          icon: MessageSquarePlus,
          externalUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?usp=publish-editor',
        },
      ],
    },
];

const NAV_TECNICO: NavItem[] = [
    {
      id: 'forrageiras',
      label: 'Informações sobre Forrageiras',
      icon: Leaf,
      subItems: [
        { id: 'catalogo', label: 'Catálogo de Forrageiras (60)', icon: Leaf },
        { id: 'indicacao_solo', label: 'Recomendador por Solo & Clima', icon: Compass },
        { id: 'doencas', label: 'Sanidade & Doenças', icon: Bug },
        { id: 'calculadora_semeadura', label: 'Calculadora de Semeadura (VC%)', icon: Calculator },
        { id: 'comparador', label: 'Comparador Lado a Lado', icon: Scale },
      ],
    },
    {
      id: 'gestao_rural',
      label: 'Administração e Gestão Rural',
      icon: Building2,
      badge: 'ERP 360°',
      subItems: [
        { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutGrid },
        { id: 'administracao', label: '1. Fazenda & Talhões', icon: Building2 },
        { id: 'planejamento', label: '2. Safras & Cronograma', icon: Calendar },
        { id: 'operacoes', label: '3. Operações de Campo', icon: Tractor },
        { id: 'financeiro', label: '4. ERP Financeiro', icon: DollarSign },
        { id: 'estoque', label: '5. Estoque & Almoxarifado', icon: Package },
        { id: 'comercializacao', label: '6/7. Compras & Vendas', icon: ShoppingCart },
        { id: 'maquinas_rh', label: '8/9. Máquinas & RH', icon: Users },
        { id: 'irrigacao_clima_bi', label: '10-12. Irrigação, Clima & BI', icon: BarChart3 },
        { id: 'relatorios_ia', label: '13/14. Relatórios & IA', icon: Bot },
      ],
    },
    {
      id: 'pericia_rural',
      label: 'Perícia Rural & Laudos',
      icon: Scale,
      subItems: [
        { id: 'dashboard', label: 'Dashboard de Perícias', icon: LayoutGrid },
        { id: 'abertura', label: '1. Abertura & Planejamento', icon: FileText },
        { id: 'dados_regiao', label: 'Dados da Região & Clima', icon: CloudSun },
        { id: 'avaliacao_imovel', label: 'Avaliação do Imóvel (NBR 14653)', icon: Landmark },
        { id: 'vistoria', label: '2. Vistoria & Evidências', icon: MapPin },
        { id: 'analise', label: '3. Análise & Diagnóstico', icon: FlaskConical },
        { id: 'calculos', label: '4. Cálculos & Valoração', icon: Calculator },
        { id: 'laudo', label: '5. Laudo Oficial & Quesitos', icon: FileCheck2 },
      ],
    },
    AVALIACAO_IMOVEIS_NAV_ITEM,
    RECUPERA_NAV_ITEM,
    {
      id: 'rastreabilidade',
      label: 'Rastreabilidade Agrícola',
      icon: QrCode,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IGR', icon: LayoutGrid, badge: 'IGR' },
        { id: 'lotes', label: 'Lotes de Produção', icon: Boxes },
        { id: 'etiquetas', label: 'Etiquetas & QR Code', icon: QrCode, badge: 'Oficial' },
        { id: 'operacoes', label: 'Caderno de Campo', icon: FileText },
        { id: 'colheita', label: 'Colheita & Pallets', icon: Leaf },
        { id: 'expedicao', label: 'Expedição & Romaneio', icon: Tractor },
        { id: 'monitoramento', label: 'MIP & Diário', icon: Activity },
        { id: 'culturas', label: 'Catálogo de HF', icon: Sprout },
        { id: 'relatorios', label: 'Auditoria & Laudos', icon: FileCheck2 },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
      ],
    },
    {
      id: 'geoprocessamento',
      label: 'Geoprocessamento',
      icon: Compass,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Inteligente', icon: BarChart2, badge: 'IA & Satélite' },
        { id: 'layers', label: 'Gerenciador de Camadas', icon: Layers, badge: 'Multicamadas' },
        { id: 'list', label: 'Talhões & Cadastro', icon: Boxes },
        { id: 'draw', label: 'Delimitar & Desenho', icon: Tag },
        { id: 'ndvi', label: 'NDVI & Espectros', icon: Leaf },
        { id: 'pois', label: 'POIs & Vistorias', icon: MapPin },
      ],
    },
    {
      id: 'zarc_risco',
      label: 'ZARC & Risco Climático',
      icon: CloudSun,
      subItems: [
        { id: 'dashboard', label: 'Dashboard ZARC', icon: LayoutGrid },
        { id: 'consulta', label: '1. Consulta ZARC', icon: Search },
        { id: 'propriedades', label: '2. Propriedade & Talhões', icon: Building2 },
        { id: 'analise_risco', label: '3. Análise Climática', icon: CloudSun },
        { id: 'simulador', label: '4. Simulador Scenarios', icon: Sliders },
        { id: 'historico_alertas', label: '5. Relatórios & Alertas', icon: FileText },
      ],
    },
    {
      id: 'custos',
      label: 'Gestão de Custo',
      icon: DollarSign,
      subItems: [
        { id: '360', label: 'Gêmeo Econômico 360°', icon: Sparkles, badge: 'IA & 360°' },
        { id: 'dashboard', label: 'Dashboard Financeiro', icon: BarChart2 },
        { id: 'planning', label: 'Safra & Propriedade', icon: Wheat },
        { id: 'inputs', label: 'Insumos & Almoxarifado', icon: Package },
        { id: 'operations', label: 'Operações & Frota', icon: Tractor },
        { id: 'commercialization', label: 'Comercialização & Vendas', icon: DollarSign },
        { id: 'simulators', label: 'Simulador "E Se...?"', icon: Sliders, badge: 'Exclusivo' },
        { id: 'map', label: 'Mapa Econômico da Fazenda', icon: MapPin },
        { id: 'timeline', label: 'Linha do Tempo & Diário', icon: Calendar },
        { id: 'reports', label: 'Relatórios & DRE Agrícola', icon: FileText },
      ],
    },
    {
      id: 'plantabilidade',
      label: 'Plantabilidade',
      icon: Leaf,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IGP', icon: LayoutGrid },
        { id: 'fields', label: 'Cadastro da Propriedade', icon: Building2 },
        { id: 'equipment', label: 'Plantadeira & Linhas', icon: Tractor },
        { id: 'seeds', label: 'Lotes de Sementes', icon: Leaf },
        { id: 'sampling', label: 'Amostragem em Campo', icon: Ruler },
        { id: 'digital-twin', label: 'Gêmeo Digital 360°', icon: Target },
        { id: 'diagnostics', label: 'Diagnósticos de Regulagem', icon: Wrench },
        { id: 'loss-simulator', label: 'Simulador de Perdas', icon: DollarSign, badge: 'Exclusivo' },
        { id: 'map', label: 'Mapa Interativo', icon: Compass },
        { id: 'photo-diary', label: 'Diário Fotográfico', icon: Camera },
        { id: 'reports', label: 'Relatórios & Laudo', icon: FileText },
      ],
    },
    {
      id: 'fenologia',
      label: 'Fenologia',
      icon: Leaf,
      subItems: [
        { id: 'linha_tempo', label: 'Linha do Tempo Fenológica', icon: Leaf },
        { id: 'gemeo_digital', label: 'Índice IDC & Diagnóstico', icon: Activity },
        { id: 'fisiologia', label: 'Fisiologia & Curvas', icon: Leaf },
        { id: 'nutricao_agua', label: 'Demanda Hídrica & Nutrição', icon: Droplets },
        { id: 'sanidade', label: 'Sanidade Fitossanitária', icon: ShieldAlert },
        { id: 'diario_fotos', label: 'Diário Fotográfico', icon: Camera },
        { id: 'agenda_tecnica', label: 'Agenda Técnica', icon: Calendar },
        { id: 'cadastro_lavouras', label: 'Cadastro de Lavouras', icon: MapPin },
      ],
    },
    {
      id: 'solos',
      label: 'Análise de Solo',
      icon: FlaskConical,
      subItems: [
        { id: 'amostras', label: 'Amostras & Laudos', icon: FlaskConical },
        { id: 'mapeamento', label: 'Mapeamento no Talhão', icon: Compass, badge: 'Novo' },
        { id: 'leitura_ia', label: 'Leitura Inteligente (IA / OCR)', icon: Sparkles, badge: 'IA' },
        { id: 'cadastro_manual', label: 'Cadastro Manual Completo', icon: Plus },
        { id: 'importar_csv', label: 'Importação em Lote (CSV)', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'analise_agua',
      label: 'Análise de Água',
      icon: Droplets,
      subItems: [
        { id: 'dashboard_iga', label: 'Dashboard & IGA', icon: LayoutGrid },
        { id: 'laboratorio_amostras', label: 'Laboratório & Amostras', icon: FlaskConical },
        { id: 'interpretacao_agronomica', label: 'Interpretação Agronômica & USSL', icon: BookOpen },
        { id: 'assistente_correcao', label: 'Assistente de Correção', icon: Sparkles },
        { id: 'pontos_coleta', label: 'Pontos de Coleta', icon: MapPin },
        { id: 'banco_culturas', label: 'Culturas & Tolerância', icon: Leaf },
        { id: 'laudo_oficial', label: 'Laudo Oficial de Água', icon: FileText },
      ],
    },
    {
      id: 'irrigacao',
      label: 'Irrigação',
      icon: Droplets,
      subItems: [
        { id: 'dashboard', label: 'Dashboard 360°', icon: LayoutGrid },
        { id: 'soils_areas', label: 'Áreas, Solos & Culturas', icon: Layers },
        { id: 'systems', label: 'Sistemas & Equipamentos', icon: Settings },
        { id: 'weather', label: 'Meteorologia & ET0', icon: Sun },
        { id: 'calculator', label: 'Manejo & Lâminas', icon: Gauge },
        { id: 'energy_fertigation', label: 'Energia & Fertirrigação', icon: Zap },
        { id: 'water_quality', label: 'Qualidade Água & Diário', icon: Camera },
        { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Activity },
        { id: 'simulator', label: 'Simulador "E Se...?"', icon: Sparkles },
        { id: 'reports', label: 'Relatórios & IGEH', icon: FileText },
      ],
    },
    {
      id: 'hidroponia',
      label: 'Hidroponia',
      icon: Droplets,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Geral', icon: Activity },
        { id: 'mapa_estufa', label: 'Mapa Digital da Estufa', icon: Compass },
        { id: 'solucao_nutritiva', label: 'Solução & Reservatórios', icon: Droplets },
        { id: 'simulador_receitas', label: 'Simulador de Receitas', icon: Calculator },
        { id: 'producao_bancadas', label: 'Bancadas & Lotes', icon: Leaf },
        { id: 'ambiente', label: 'Clima & Estufa', icon: Thermometer },
        { id: 'irrigacao', label: 'Bombas & Timer', icon: Clock },
        { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
        { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
        { id: 'financeiro', label: 'Custos & Margem', icon: DollarSign },
        { id: 'fitossanidade', label: 'Fitossanidade', icon: ShieldCheck },
        { id: 'comercial', label: 'Vendas & Clientes', icon: Package },
        { id: 'biblioteca', label: 'Biblioteca Técnica', icon: BookOpen },
      ],
    },
    {
      id: 'recomendacoes',
      label: 'Recomendações Agronômicas',
      icon: Calculator,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IGF', icon: BarChart2 },
        { id: 'mapeamento_talhao', label: 'Mapeamento no Talhão', icon: Compass, badge: 'Novo' },
        { id: 'nutriinterpretacao', label: 'Nutriinterpretação', icon: HelpCircle },
        { id: 'curvas_calibracao', label: 'Curvas de Calibração', icon: Sliders },
        { id: 'calagem', label: 'Calagem & Calcário', icon: Sparkles },
        { id: 'gessagem', label: 'Gessagem Subsuperficial', icon: Layers },
        { id: 'adubacao_organica', label: 'Adubação Orgânica', icon: Leaf },
        { id: 'adubacao_plantio', label: 'Adubação (Plantio & Cobertura)', icon: Leaf },
        { id: 'recomendacoes_personalizadas', label: 'Recomendações Personalizadas', icon: Sparkles, badge: 'Tailored' },
        { id: 'calculadora_populacao', label: 'Calculadora de População', icon: Calculator },
        { id: 'curvas_absorcao', label: 'Curvas de Absorção', icon: TrendingUp },
        { id: 'banco_fertilizantes', label: 'Banco de Fertilizantes', icon: Layers3 },
        { id: 'mistura_fertilizantes', label: 'Misturador de Fórmulas', icon: Calculator },
        { id: 'simulador_cenarios', label: 'Simulador de Cenários', icon: Zap },
        { id: 'gemeo_digital_solo', label: 'Gêmeo Digital do Solo', icon: Globe },
        { id: 'mapas_fertilidade', label: 'Mapas de Fertilidade', icon: Activity },
        { id: 'relatorio_laudo', label: 'Laudo Técnico Oficial', icon: FileText },
      ],
    },
    {
      id: 'relatorios',
      label: 'Laudo Técnico Oficial',
      icon: FileText,
      subItems: [
        { id: 'laudo', label: 'Emissão de Laudo ART', icon: FileText },
        { id: 'assinatura', label: 'Assinatura Digital', icon: Check },
      ],
    },
    {
      id: 'historico',
      label: 'Histórico & Comparativo',
      icon: History,
      subItems: [
        { id: 'timeline', label: 'Evolução Temporal', icon: Calendar },
        { id: 'compare', label: 'Comparativo de Safras', icon: Activity },
      ],
    },
    {
      id: 'foliar',
      label: 'Diagnose Foliar',
      icon: Leaf,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Nutricional', icon: BarChart2 },
        { id: 'amostra', label: 'Cadastro Amostra', icon: FileText },
        { id: 'interpretacao', label: 'Interpretação', icon: CheckCircle2 },
        { id: 'indices', label: 'Índices e Relações', icon: Calculator },
        { id: 'gemeo_nutricional', label: 'Gêmeo Nutricional', icon: Zap },
        { id: 'curva_absorcao', label: 'Curva de Absorção', icon: TrendingUp },
        { id: 'historico', label: 'Histórico', icon: History },
        { id: 'mapa', label: 'Mapa Nutricional', icon: MapPin },
        { id: 'diario', label: 'Diário Fotográfico', icon: Camera },
        { id: 'sintomas', label: 'Sintomas', icon: AlertTriangle },
        { id: 'integracao_solo', label: 'Solo & Fert', icon: Droplets },
        { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
      ],
    },
    {
      id: 'brix',
      label: 'Brix Foliar',
      icon: Droplets,
      subItems: [
        { id: 'dashboard_isf', label: 'Dashboard & ISF', icon: LayoutGrid },
        { id: 'leituras_refratometro', label: 'Leituras & Refratômetro', icon: Gauge },
        { id: 'mapa_calor_talhoes', label: 'Mapa de Calor dos Talhões', icon: MapPin },
        { id: 'banco_culturas', label: 'Banco de Culturas & Faixas', icon: BookOpen },
        { id: 'inteligencia_trofobiose', label: 'Trofobiose & Imunidade', icon: Leaf },
        { id: 'estatisticas_variabilidade', label: 'Estatísticas & Variabilidade', icon: Activity },
        { id: 'laudo_oficial', label: 'Laudo Oficial de Brix', icon: FileText },
      ],
    },
    {
      id: 'nematologia',
      label: 'Nematologia',
      icon: Microscope,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & Mapa', icon: LayoutGrid },
        { id: 'nema_ia_chat', label: 'Conversa com Nema IA', icon: Bot },
        { id: 'nema_ia_score', label: 'Nema Score', icon: Activity },
        { id: 'gemeo_digital', label: 'Gêmeo Digital do Talhão', icon: Target },
        { id: 'amostragem', label: 'Amostragem & Laudos', icon: FlaskConical },
        { id: 'banco_especies', label: 'Biblioteca de Espécies', icon: BookOpen },
        { id: 'rotacao_manejo', label: 'Rotação & Manejo', icon: Leaf },
        { id: 'diario_fotografico', label: 'Diário Fotográfico', icon: FileSearch },
      ],
    },
    {
      id: 'doencas_solo',
      label: 'Doenças do Solo',
      icon: ShieldAlert,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & Sanidade', icon: LayoutGrid },
        { id: 'coleta_amostras', label: 'Inspeção & Amostragem', icon: FlaskConical },
        { id: 'laudo_amostragem', label: 'Laudo de Amostragem', icon: FileCheck2 },
        { id: 'triagem_diagnostico', label: 'Triagem & Diagnósticos', icon: ShieldAlert },
        { id: 'biblioteca', label: 'Biblioteca & Sintomas', icon: BookOpen },
        { id: 'analise_clima', label: 'Solo & Clima', icon: Droplets },
        { id: 'diario_fotografico', label: 'Diário Fotográfico', icon: Camera },
        { id: 'mapa_offline', label: 'Mapa de Ocorrências', icon: MapPin },
        { id: 'igss_calculadora', label: 'Índice IGSS', icon: Gauge },
        { id: 'relatorios_backup', label: 'Laudos PDF', icon: FileText },
      ],
    },
    {
      id: 'pluviometria',
      label: 'Pluviometria',
      icon: CloudRain,
      subItems: [
        { id: 'painel', label: 'Painel de Chuvas', icon: CloudRain },
        { id: 'mapa_inteligente', label: 'Mapa Inteligente de Chuvas', icon: MapPin },
        { id: 'eficiencia_iec', label: 'Eficiência da Chuva (IEC)', icon: Gauge },
        { id: 'lancamento', label: 'Lançamentos & Histórico', icon: FileSpreadsheet },
        { id: 'cadastro_pluviometros', label: 'Cadastro de Pluviômetros', icon: Sliders },
        { id: 'balanco_culturas', label: 'Balanço Hídrico por Cultura', icon: Leaf },
        { id: 'relatorios', label: 'Relatórios & Comparações', icon: BarChart2 },
        { id: 'alertas', label: 'Alertas Pluviométricos', icon: AlertTriangle },
      ],
    },
    {
      id: 'meteorologia',
      label: 'Climatologia',
      icon: CloudSun,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Climático', icon: CloudSun },
        { id: 'janela_operacional', label: 'Janela Operacional (IJO)', icon: Gauge },
        { id: 'previsao_15dias', label: 'Previsão 24h & 15 Dias', icon: Calendar },
        { id: 'culturas', label: 'Limites por Cultura', icon: Leaf },
        { id: 'balanco_hidrico', label: 'Irrigação & Balanço Hídrico', icon: Droplets },
        { id: 'chuva_historico', label: 'Chuvas & Histórico', icon: BarChart2 },
        { id: 'alertas', label: 'Alertas Climáticos', icon: AlertTriangle },
        { id: 'biblioteca', label: 'Biblioteca Técnica', icon: BookOpen },
      ],
    },
    {
      id: 'viveiros',
      label: 'Produção de Mudas',
      icon: Flower2,
      subItems: [
        { id: 'gemeo_digital', label: 'Gêmeo Digital', icon: Activity },
        { id: 'producao', label: 'Lotes de Produção', icon: Leaf },
        { id: 'atlas_fitossanitario', label: 'Atlas de Doenças & Pragas (Fotos)', icon: Bug },
        { id: 'diagnostico_offline', label: 'Diagnóstico Visual (Sem IA)', icon: Eye },
        { id: 'irrigacao', label: 'Irrigação & Fertirrigação', icon: Droplets },
        { id: 'ambiente', label: 'Ambiente Protegido', icon: Thermometer },
        { id: 'fitossanitario', label: 'Fitossanitário (MIP)', icon: ShieldCheck },
        { id: 'nutricional', label: 'Nutricional & Sintomas', icon: Sparkles },
        { id: 'comercial', label: 'Comercial & Pedidos', icon: Package },
        { id: 'financeiro', label: 'Custos & Margem', icon: DollarSign },
        { id: 'biblioteca', label: 'Biblioteca de Culturas', icon: BookOpen },
      ],
    },
    {
      id: 'geaagro_edu',
      label: 'GeaAgro Edu',
      icon: GraduationCap,
      subItems: [
        {
          id: 'tutoriais_youtube',
          label: 'Vídeos no YouTube (@Lucasgeaagrobr)',
          icon: Youtube,
          externalUrl: 'https://www.youtube.com/@Lucasgeaagrobr',
        },
        {
          id: 'portal_blog',
          label: 'Blog Oficial (GeaAgro Brasil)',
          icon: Globe,
          externalUrl: 'https://geaagrobrasil.blogspot.com.br',
        },
      ],
    },
    {
      id: 'avicultura',
      label: 'Avicultura de Precisão',
      icon: Egg,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IEA', icon: LayoutGrid },
        { id: 'lote_twin', label: 'Gêmeo Digital do Lote', icon: Activity },
        { id: 'galpao_twin', label: 'Gêmeo Digital do Galpão', icon: Home },
        { id: 'ambiente', label: 'Climatização & Ambiência', icon: Thermometer },
        { id: 'nutricao', label: 'Nutrição & Rações', icon: Wheat },
        { id: 'agua', label: 'Água & Bebedouros', icon: Droplets },
        { id: 'pesagem', label: 'Pesagens & Uniformidade', icon: Scale },
        { id: 'sanidade', label: 'Sanidade & Vacinas', icon: Syringe },
        { id: 'banco_doencas', label: 'Guia de Enfermidades', icon: BookOpen },
        { id: 'biosseguridade', label: 'Biosseguridade', icon: ShieldAlert },
        { id: 'producao', label: 'Postura & Ovos', icon: Egg },
        { id: 'rastreabilidade', label: 'Rastreabilidade de Lotes', icon: ShieldCheck },
      ],
    },
    {
      id: 'suinocultura',
      label: 'Suinocultura',
      icon: SuinoIcon,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IES', icon: LayoutGrid },
        { id: 'maternidade', label: 'Maternidade & Leitões', icon: Heart },
        { id: 'creche', label: 'Creche & Desenvolvimento', icon: Activity },
        { id: 'terminacao', label: 'Terminação & GMD', icon: Scale },
        { id: 'gestacao', label: 'Gestação & Matrizes', icon: ShieldCheck },
        { id: 'nutricao', label: 'Nutrição & Rações', icon: Wheat },
        { id: 'sanidade', label: 'Sanidade & Vacinações', icon: Syringe },
        { id: 'guia_enfermidades', label: 'Guia de Enfermidades', icon: BookOpen },
        { id: 'biometria', label: 'Biometria & Ponderal', icon: Scale },
        { id: 'relatorios', label: 'Relatórios & Desempenho', icon: FileText },
      ],
    },
    {
      id: 'pecuaria',
      label: 'Bovinocultura (Pecuária)',
      icon: BovinoIcon,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Pecuário', icon: LayoutGrid },
        { id: 'corte', label: 'Pecuária de Corte (GMD)', icon: Beef },
        { id: 'leite', label: 'Pecuária de Leite & Tanque', icon: Droplets },
        { id: 'reproducao', label: 'Reprodução, IATF & TE', icon: Heart },
        { id: 'rebanho', label: 'Manejo do Rebanho & Brincos', icon: ShieldCheck },
        { id: 'nutricao', label: 'Nutrição & Dieta Total', icon: Wheat },
        { id: 'pastagens', label: 'Pastagens & Piquetes', icon: Leaf },
        { id: 'sanidade', label: 'Sanidade, Vacinas & Parasitas', icon: Syringe },
        { id: 'guia_doencas', label: 'Guia de Enfermidades', icon: BookOpen },
        { id: 'relatorios', label: 'Relatórios Zootécnicos', icon: FileText },
      ],
    },
    {
      id: 'nutricao_animal',
      label: 'Nutrição Animal',
      icon: Wheat,
      subItems: [
        { id: 'dashboard', label: 'Dashboard Nutricional', icon: LayoutGrid },
        { id: 'formulacao', label: 'Formulação de Rações (Mínimo Custo)', icon: Calculator },
        { id: 'ingredientes', label: 'Banco de Ingredientes & BROM', icon: Package },
        { id: 'premistura', label: 'Misturas, Premix & Aditivos', icon: FlaskConical },
        { id: 'dietas', label: 'Simulador de Dieta Total', icon: Sparkles },
        { id: 'custos', label: 'Custos & Matéria-Prima', icon: DollarSign },
        { id: 'laudo', label: 'Laudo Nutricional Oficial', icon: FileText },
      ],
    },
    {
      id: 'bulario_vet',
      label: 'Compêndio Veterinário',
      icon: BookOpen,
      subItems: [
        { id: 'bulario', label: 'Bulário Veterinário', icon: BookOpen },
        { id: 'receituario', label: 'Receituário Veterinário', icon: FileText },
        { id: 'protocolos', label: 'Protocolos Clínicos', icon: Sparkles },
        { id: 'historico_receitas', label: 'Histórico de Receitas', icon: Clock },
        { id: 'calculadora', label: 'Calculadora de Doses', icon: Calculator },
        { id: 'carencias', label: 'Tabela de Carências', icon: ShieldAlert },
      ],
    },
    {
      id: 'bubalinos',
      label: 'Bubalinos',
      icon: BubalinoIcon,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IEB', icon: LayoutGrid },
        { id: 'registry', label: 'Cadastro Individual', icon: ShieldCheck },
        { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Activity },
        { id: 'genealogy', label: 'Genealogia & ABCB', icon: Dna },
        { id: 'reproduction', label: 'Reprodução & IATF', icon: Heart },
        { id: 'calves', label: 'Bezerreiro & Maternidade', icon: Leaf },
        { id: 'dairy', label: 'Leite & Queijaria (Mozzarella)', icon: Droplets, badge: 'Mozzarella' },
        { id: 'beef', label: 'Carne & GMD', icon: Beef },
        { id: 'welfare_water', label: 'Bem-Estar & Água (Açudes)', icon: Droplets, badge: 'Exclusivo' },
        { id: 'nutrition', label: 'Nutrição & Rúmen', icon: Wheat },
        { id: 'pastures', label: 'Pastagens & Piquetes', icon: Leaf },
        { id: 'health', label: 'Sanidade & Vacinas', icon: Syringe },
        { id: 'diseases_lib', label: 'Biblioteca de Doenças', icon: BookOpen },
        { id: 'pharmacy', label: 'Farmácia Veterinária', icon: Package },
        { id: 'facilities', label: 'Instalações & Currais', icon: Building2 },
        { id: 'smart_map', label: 'Mapa Zootécnico', icon: Compass },
        { id: 'reports', label: 'Relatórios & Exportação', icon: FileText },
        { id: 'photo_diary', label: 'Diário Fotográfico', icon: Camera },
      ],
    },
    {
      id: 'caprinos',
      label: 'Caprinos',
      icon: CaprinoIcon,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & IEC', icon: LayoutGrid },
        { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Sparkles },
        { id: 'registry', label: 'Cadastro (RFID/QR)', icon: ShieldCheck },
        { id: 'genealogy', label: 'Genealogia & Inbreeding', icon: Dna },
        { id: 'reproduction', label: 'Reprodução & IA', icon: Heart },
        { id: 'kids', label: 'Criação de Cabritos', icon: Leaf },
        { id: 'milk', label: 'Produção Leiteira', icon: Droplets },
        { id: 'meat', label: 'Carne & Pesagens', icon: Beef },
        { id: 'nutrition', label: 'Nutrição (NRC)', icon: Wheat },
        { id: 'pastures', label: 'Pastagens & Caprineira', icon: Leaf },
        { id: 'health', label: 'Sanidade & FAMACHA', icon: Syringe },
        { id: 'pharmacy', label: 'Farmácia Veterinária', icon: Package },
        { id: 'disease_library', label: 'Biblioteca de Doenças', icon: BookOpen },
        { id: 'photo_diary', label: 'Diário Fotográfico', icon: Camera },
        { id: 'facilities', label: 'Apriscos & Instalações', icon: Building2 },
        { id: 'reports', label: 'Relatórios & Exportação', icon: FileText },
      ],
    },
    {
      id: 'equinos',
      label: 'Equinos',
      icon: EquinoIcon,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & Tropa', icon: LayoutGrid },
        { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Sparkles, badge: '360°' },
        { id: 'registry', label: 'Plantel & Registro', icon: ShieldCheck },
        { id: 'genealogy', label: 'Genealogia & Cruzamentos', icon: Dna },
        { id: 'reproduction', label: 'Reprodução & TE', icon: Heart },
        { id: 'biometrics', label: 'Biometria & Henneke', icon: Scale },
        { id: 'nutrition', label: 'Nutrição NRC', icon: Wheat },
        { id: 'health', label: 'Sanidade & Vacinas', icon: Syringe },
        { id: 'farriery', label: 'Ferrageamento', icon: Hammer },
        { id: 'training', label: 'Treinos & Provas', icon: Award },
        { id: 'dental', label: 'Odontologia', icon: Activity },
        { id: 'financial', label: 'Custos & Haras', icon: DollarSign },
        { id: 'facilities_inventory', label: 'Instalações & Estoque', icon: Building2 },
        { id: 'diseases_bank', label: 'Guia de Enfermidades', icon: BookOpen },
      ],
    },
    {
      id: 'analise_sementes',
      label: 'Análise de Sementes & IQS',
      icon: Leaf,
      subItems: [
        { id: 'dashboard_estatisticas', label: 'Dashboard IQS', icon: LayoutGrid },
        { id: 'recepcao_amostras', label: 'Recepção de Lotes', icon: Boxes },
        { id: 'identidade_gemeo_digital', label: 'Gêmeo da Semente', icon: Target },
        { id: 'qualidade_fisica', label: 'Pureza Física', icon: Scale },
        { id: 'germinacao', label: 'Germinação & Vigor', icon: Leaf },
        { id: 'vigor', label: 'Tetrazólio & Vigor', icon: Sparkles },
        { id: 'sanidade', label: 'Patologia de Sementes', icon: Microscope },
        { id: 'certificados', label: 'Certificados & Laudos', icon: FileText },
      ],
    },
    {
      id: 'pragas',
      label: 'MIP & Radar Fitossanitário',
      icon: Bug,
      subItems: [
        { id: 'dashboard', label: 'Dashboard MIP', icon: LayoutGrid },
        { id: 'radar', label: 'Radar Fitossanitário', icon: Zap },
        { id: 'monitoramento', label: 'Inspeções de Campo', icon: Target },
        { id: 'mapa', label: 'Mapa de Distribuição', icon: MapPin },
        { id: 'curvas', label: 'Curvas Populacionais', icon: Activity },
        { id: 'manejo', label: 'Manejo & Níveis de Ação', icon: ShieldCheck },
        { id: 'banco_pragas', label: 'Banco de Pragas', icon: BookOpen },
        { id: 'inimigos_naturais', label: 'Controle Biológico', icon: Bug },
      ],
    },
    {
      id: 'bulario',
      label: 'Compêndio de Defensivos',
      icon: BookOpen,
      subItems: [
        { id: 'catalog', label: 'Compêndio & Bulas MAPA', icon: BookOpen },
        { id: 'calculator', label: 'Calculadora de Dosagem', icon: Calculator },
        { id: 'add_product', label: 'Cadastrar Defensivo', icon: Plus },
        { id: 'receituario', label: 'Receituário Agronômico', icon: FileText },
      ],
    },
    {
      id: 'calculos_agronomicos',
      label: 'Cálculos Agronômicos',
      icon: Calculator,
      subItems: [
        { id: 'plantabilidade', label: 'Plantabilidade', icon: Leaf },
        { id: 'regulagens_adubo', label: 'Regulagens de Adubo', icon: Layers },
        { id: 'produtividade', label: 'Produtividade & Perdas', icon: Target },
        { id: 'analise_solo', label: 'Análise de Solo', icon: FlaskConical },
        { id: 'calagem', label: 'Calagem (8 Métodos)', icon: Sparkles },
        { id: 'gessagem', label: 'Gessagem Agrícola', icon: Layers },
        { id: 'correcao_nutricao', label: 'Correção da Nutrição', icon: Activity },
        { id: 'manutencao_adubacao', label: 'Manutenção & Exportação', icon: Target },
        { id: 'foliar_ts', label: 'Foliar & TS', icon: Droplets },
        { id: 'pulverizacao', label: 'Pulverização Terrestre', icon: Tractor },
        { id: 'pulverizacao_drone', label: 'Pulverização com Drone', icon: Zap },
        { id: 'mecanizacao', label: 'Mecanização & Tratores', icon: Cpu },
        { id: 'hidrico_iaf', label: 'Balanço Hídrico & IAF', icon: CloudRain },
      ],
    },
    {
      id: 'fertirrigacao',
      label: 'Compatibilidade de Fertilizantes',
      icon: FlaskConical,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & Indicadores', icon: LayoutGrid },
        { id: 'simulador_tanque', label: 'Laboratório Virtual (Simulador)', icon: FlaskConical },
        { id: 'matriz_compatibilidade', label: 'Matriz de Compatibilidade', icon: Zap },
        { id: 'tanques_ab', label: 'Separação Tanques A & B', icon: Layers },
        { id: 'banco_fertilizantes', label: 'Banco de Fertilizantes', icon: Boxes },
        { id: 'biblioteca_tecnica', label: 'Biblioteca Técnica', icon: BookOpen },
        { id: 'qualidade_agua', label: 'Qualidade da Água & Ácidos', icon: Droplets },
        { id: 'solubilidade', label: 'Solubilidade × Temperatura', icon: Thermometer },
        { id: 'receitas_laudos', label: 'Receitas & Laudo Técnico', icon: FileText },
      ],
    },
    {
      id: 'tankmix',
      label: 'TankMix (Defensivos)',
      icon: FlaskConical,
      subItems: [
        { id: 'dashboard', label: 'Dashboard & ICG', icon: LayoutGrid },
        { id: 'compatibility_matrix', label: 'Matriz de Compatibilidade', icon: Zap },
        { id: 'water_quality', label: 'Qualidade da Água', icon: Droplets },
        { id: 'formulations_library', label: 'Biblioteca de Formulações', icon: BookOpen },
        { id: 'products_catalog', label: 'Banco de Defensivos & MAPA', icon: Boxes },
        { id: 'weather_app', label: 'Clima, Delta T & Bicos', icon: CloudSun },
        { id: 'sprayers', label: 'Pulverizadores & Bicos', icon: Tractor },
        { id: 'traceability', label: 'Rastreabilidade de Pulverização', icon: ShieldCheck },
        { id: 'reports', label: 'Laudo Técnico Oficial & Receitas', icon: FileText },
      ],
    },
    {
      id: 'estatistica',
      label: 'GeaAgro Estatística',
      icon: BarChart3,
      badge: 'PWA Científico',
      subItems: [
        { id: 'projetos', label: 'Projetos & Experimentos', icon: Layers },
        { id: 'dados', label: 'Dados & Importação', icon: UploadCloud },
        { id: 'ia_estatistica', label: 'Nema IA Estatística', icon: NemaIAEstatisticaIcon },
        { id: 'descritiva', label: 'Estatística Descritiva', icon: Calculator },
        { id: 'delineamentos', label: 'Delineamentos Experimentais', icon: LayoutGrid },
        { id: 'anova', label: 'Análise de Variância (ANOVA)', icon: BarChart3 },
        { id: 'medias', label: 'Comparação de Médias', icon: Sparkles },
        { id: 'regressao', label: 'Regressão & Modelos', icon: Zap },
        { id: 'correlacao', label: 'Correlação Linear & Postos', icon: Compass },
        { id: 'pressupostos', label: 'Pressupostos & Diagnóstico', icon: ShieldCheck },
        { id: 'nao_parametrica', label: 'Não Paramétrica', icon: Scale },
        { id: 'multivariada', label: 'Multivariada (PCA & Clusters)', icon: Cpu },
        { id: 'especiais', label: 'Séries, Logística & Sobrevivência', icon: History },
        { id: 'graficos', label: 'Gráficos Científicos', icon: BarChart3 },
        { id: 'relatorios', label: 'Relatórios & Exportação', icon: FileText },
      ],
    },
    {
      id: 'backup',
      label: 'Backup e Restauração',
      icon: Database,
      subItems: [
        { id: 'dashboard', label: 'Dashboard do Backup', icon: Database },
        { id: 'criacao', label: 'Criar Backup Completo', icon: UploadCloud },
        { id: 'snapshots', label: 'Snapshots & Versionamento', icon: Sparkles },
        { id: 'modulos', label: 'Backup por Módulo', icon: Layers },
        { id: 'estatistica_opfs', label: 'Backup & Integridade OPFS (Estatística)', icon: BarChart3 },
        { id: 'restauracao', label: 'Restauração de Dados', icon: History },
        { id: 'historico', label: 'Histórico & SHA-256', icon: ShieldCheck },
        { id: 'agendamento', label: 'Agendamento & Eventos', icon: Calendar },
        { id: 'migracao', label: 'Migração entre Celulares', icon: Smartphone },
        { id: 'qrcode', label: 'Backup por QR Code', icon: QrCode },
      ],
    },
];

interface NavItemRowProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  activeSubTab: string;
  onParentClick: (item: NavItem) => void;
  onToggleExpand: (itemId: string, e?: React.MouseEvent) => void;
  onSubClick: (tabId: string, subId?: string, externalUrl?: string) => void;
}

const NavItemRow: React.FC<NavItemRowProps> = React.memo(({
  item,
  isActive,
  isExpanded,
  activeSubTab,
  onParentClick,
  onToggleExpand,
  onSubClick,
}) => {
  const Icon = item.icon;
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
  const iconTriggerRef = React.useRef<HTMLDivElement>(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIconMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTooltipOpen(true);
    }, 180);
  };

  const handleIconMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTooltipOpen(false);
    }, 220);
  };

  const handleTooltipOpen = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTooltipOpen(true);
  };

  const handleTooltipClose = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTooltipOpen(false);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-0.5 relative">
      {/* Main Module Button */}
      <div
        className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all text-left cursor-pointer ${
          isActive
            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border-l-3 border-emerald-600 dark:border-emerald-400 shadow-2xs'
            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 hover:text-slate-900 dark:hover:text-white'
        }`}
        onClick={() => {
          setIsTooltipOpen(false);
          onParentClick(item);
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Module Icon Container with Interactive Tooltip Trigger on Hover */}
          <div
            ref={iconTriggerRef}
            onMouseEnter={handleIconMouseEnter}
            onMouseLeave={handleIconMouseLeave}
            className="p-1 -m-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950/80 hover:scale-110 transition-all shrink-0 cursor-help flex items-center justify-center"
            title={`Guia rápido: ${item.label}`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              }`}
            />
          </div>

          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.externalUrl && (
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          )}

          {hasSubItems && !item.externalUrl && (
            <button
              type="button"
              onClick={e => onToggleExpand(item.id, e)}
              className={`p-1 rounded-md transition-transform duration-200 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer ${
                isExpanded ? 'rotate-90 text-emerald-600 dark:text-emerald-400' : ''
              }`}
              aria-label={`Expandir funcionalidades de ${item.label}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Tooltip Card for Rural Producer (mounted only when open) */}
      {isTooltipOpen && (
        <ModuleTooltip
          moduleId={item.id}
          targetRef={iconTriggerRef}
          isOpen={isTooltipOpen}
          onClose={handleTooltipClose}
          onOpen={handleTooltipOpen}
          onNavigate={(modId, subId) => {
            setIsTooltipOpen(false);
            onParentClick(item);
            if (subId) {
              onSubClick(modId, subId);
            }
          }}
          subItems={item.subItems}
        />
      )}

      {/* Sub-menu Items (Expanded Accordion) */}
      {hasSubItems && isExpanded && (
        <div className="ml-3.5 pl-3 border-l-2 border-slate-200 dark:border-zinc-800 space-y-0.5 pt-0.5 pb-1">
          {item.subItems!.map(sub => {
            const SubIcon = sub.icon || Target;
            const isSubActive = isActive && activeSubTab === sub.id;

            return (
              <button
                key={sub.id}
                id={`nav-sub-${item.id}-${sub.id}`}
                onClick={() => onSubClick(item.id, sub.id, sub.externalUrl)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left cursor-pointer ${
                  isSubActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span className="truncate">{sub.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sub.externalUrl && (
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeSubTab = 'dashboard',
  setActiveSubTab,
  farms,
  agronomists,
  company,
  selectedFarmId,
  isDarkMode,
  setIsDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSidebarCollapsed = false,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onLogout,
}) => {
  const currentFarm = (farms || []).find(f => f?.id === selectedFarmId) || farms?.[0];
  const currentAgronomist =
    (agronomists || []).find(a => a?.id === (currentFarm?.agronomistId || (currentFarm as any)?.responsibleAgronomistId)) ||
    agronomists?.[0];
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Accordion expanded state for modules with sub-functionalities
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => ({
    [activeTab]: true,
    avicultura: activeTab === 'avicultura',
  }));

  // Keep the active tab expanded
  useEffect(() => {
    if (activeTab) {
      setExpandedMenus(prev => ({
        ...prev,
        [activeTab]: true,
      }));
    }
  }, [activeTab]);

  const toggleExpand = useCallback((itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // User Profile state (Agricultor, Pecuarista, Administrador, Perícia, Todos)
  const [activeProfileId, setActiveProfileIdState] = useState<UserProfileId>(() => getActiveProfileId());
  const [isProfileCustomizationOpen, setIsProfileCustomizationOpen] = useState(false);

  useEffect(() => {
    const handleProfileChange = (e: any) => {
      const newProfile = e.detail?.profileId || getActiveProfileId();
      setActiveProfileIdState(newProfile);
    };
    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => {
      window.removeEventListener('geaagro:profile-changed', handleProfileChange);
    };
  }, []);

  // Filter modules according to active user profile
  const filteredNavPrincipal = useMemo(() => {
    return NAV_PRINCIPAL.filter(item => {
      if (item.id === 'dashboard' || item.id === 'configuracoes' || item.id === 'avaliacao_imoveis' || item.id === 'recupera') return true;
      return isModuleActiveInCurrentProfile(item.id, activeProfileId);
    });
  }, [activeProfileId]);

  const filteredNavTecnico = useMemo(() => {
    return NAV_TECNICO.filter(item => {
      if (item.id === 'avaliacao_imoveis' || item.id === 'recupera' || item.id === 'estatistica') return true;
      return isModuleActiveInCurrentProfile(item.id, activeProfileId);
    });
  }, [activeProfileId]);

  const handleNavClick = useCallback((tabId: string, subTabId?: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'pericia_rural' && subTabId === 'avaliacao_imovel') {
      setActiveTab('avaliacao_imoveis');
      if (setActiveSubTab) {
        setActiveSubTab('dashboard');
      }
      setExpandedMenus(prev => ({
        ...prev,
        avaliacao_imoveis: true,
      }));
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'sobre') {
      setActiveTab('configuracoes');
      if (setActiveSubTab) {
        setActiveSubTab(subTabId || 'sobre');
      }
      setExpandedMenus(prev => ({
        ...prev,
        configuracoes: true,
      }));
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'configuracoes') {
      if (subTabId && ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'].includes(subTabId)) {
        setActiveProfileId(subTabId as UserProfileId);
      }
      setActiveTab('configuracoes');
      if (subTabId && setActiveSubTab) {
        setActiveSubTab(subTabId);
      }
      setExpandedMenus(prev => ({
        ...prev,
        [tabId]: true,
      }));
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'nema_ia' && subTabId === 'ia_estatistica') {
      setActiveTab('estatistica');
      if (setActiveSubTab) {
        setActiveSubTab('ia_estatistica');
      }
      setExpandedMenus(prev => ({
        ...prev,
        estatistica: true,
      }));
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'nema_ia' && (subTabId === 'nema_ia' || subTabId === 'nema_ia_chat' || subTabId === 'nema_ia_score')) {
      setActiveTab('nema_ia');
      if (setActiveSubTab) {
        setActiveSubTab(subTabId === 'nema_ia' ? 'nema_ia_chat' : subTabId);
      }
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveTab(tabId);
    if (subTabId && setActiveSubTab) {
      setActiveSubTab(subTabId);
    }
    setExpandedMenus(prev => ({
      ...prev,
      [tabId]: true,
    }));
    setIsMobileMenuOpen(false);
  }, [setActiveTab, setActiveSubTab, setIsMobileMenuOpen]);

  const handleParentItemClick = useCallback((item: NavItem) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      setIsMobileMenuOpen(false);
      return;
    }

    if (activeTab === item.id) {
      toggleExpand(item.id);
    } else {
      setActiveTab(item.id);
      if (item.subItems && item.subItems.length > 0 && item.subItems[0]?.id && setActiveSubTab) {
        setActiveSubTab(item.subItems[0].id);
      }
      setExpandedMenus(prev => ({
        ...prev,
        [item.id]: true,
      }));
      if (!item.subItems || item.subItems.length === 0) {
        setIsMobileMenuOpen(false);
      }
    }
  }, [activeTab, toggleExpand, setActiveTab, setActiveSubTab, setIsMobileMenuOpen]);

  const renderNavGroup = (items: NavItem[]) => {
    return items.map(item => (
      <NavItemRow
        key={item.id}
        item={item}
        isActive={activeTab === item.id}
        isExpanded={!!expandedMenus[item.id]}
        activeSubTab={activeSubTab}
        onParentClick={handleParentItemClick}
        onToggleExpand={toggleExpand}
        onSubClick={handleNavClick}
      />
    ));
  };

  return (
    <>
      {/* Mobile & Tablet Header with Hamburger Button on LEFT & Quick Actions on RIGHT */}
      <header
        style={{
          paddingTop: 'max(0.625rem, calc(env(safe-area-inset-top, 0px) + 0.375rem))',
        }}
        className="lg:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-3 sm:px-4 pb-2.5 sm:pb-3 flex items-center justify-between sticky top-0 z-[1200] transition-colors"
      >
        {/* Left Section: Hamburger Menu Trigger + Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu Trigger on Left */}
          <button
            id="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="p-2.5 -ml-1 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand & Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={(e) => {
              handleAgroLogoClick(e);
              handleNavClick('sobre');
            }}
          >
            <div
              className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xs overflow-hidden p-0.5 shrink-0 transition-transform duration-200 active:scale-90 group-hover:scale-105"
              title="GeaAgro CRM - Inteligência Agronômica"
            >
              <img
                src="/icon.png"
                alt="GeaAgro Logo"
                className="w-full h-full object-contain rounded-md pointer-events-none"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <Warehouse className="w-5 h-5 hidden" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight text-emerald-950 dark:text-emerald-400 leading-none">
                  GeaAgro CRM
                </h1>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  4.2.3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Inteligência Agronômica</p>
            </div>
          </div>
        </div>

        {/* Right Actions: Company Name + Notifications Bell + Dark Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              title="Instalar App GeaAgro no Dispositivo (PWA Offline)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {company && (company.tradingName || company.name) && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-slate-600 dark:text-zinc-300 font-medium truncate max-w-[110px] sm:max-w-[180px]">
                {company.tradingName || company.name}
              </span>
            </div>
          )}

          {/* Mobile Notification Bell */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenNotifications?.();
            }}
            aria-label="Abrir central de notificações"
            className="p-2.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-black"></span>
            )}
          </button>

          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            aria-label="Alternar modo escuro"
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title={isDarkMode ? 'Mudar para Modo Claro' : 'Ativar Modo Escuro'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </header>


      {/* Desktop Sidebar (Left Fixed) & Responsive Drawer for Mobile/Tablet */}
      <aside
        id="app-sidebar-drawer"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        }}
        className={`fixed inset-y-0 left-0 z-[1200] w-72 lg:w-68 bg-white dark:bg-black border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isSidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 scrollbar-thin">
          {/* Top Brand & Close/Collapse button */}
          <div className="flex items-center justify-between mb-5">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={(e) => {
                handleAgroLogoClick(e);
                handleNavClick('sobre');
              }}
            >
              <div
                className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xs overflow-hidden p-0.5 shrink-0 transition-transform duration-200 active:scale-90 group-hover:scale-105"
                title="GeaAgro CRM - Inteligência Agronômica"
              >
                <img
                  src="/icon.png"
                  alt="GeaAgro Logo"
                  className="w-full h-full object-contain rounded-md pointer-events-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <Warehouse className="w-5 h-5 hidden" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-lg tracking-tight text-emerald-950 dark:text-emerald-400 leading-none">
                    GeaAgro CRM
                  </h1>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    4.2.3.8
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium mt-0.5">
                  Inteligência Agronômica
                </p>
              </div>
            </div>

            {/* Close button on Mobile with accessible 44px touch target */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              title="Fechar menu"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Group 1: Principal */}
          {filteredNavPrincipal.length > 0 && (
            <nav className="space-y-1 mb-4">
              <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2">
                Principal
              </div>
              {renderNavGroup(filteredNavPrincipal)}


            </nav>
          )}

          {/* Group 2: Análise Técnica / Módulos Operacionais */}
          {filteredNavTecnico.length > 0 && (
            <nav className="mt-5 space-y-1">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Módulos Habilitados
                </span>
                <button
                  type="button"
                  onClick={() => setIsProfileCustomizationOpen(true)}
                  title="Incluir ou Alterar Módulos deste Perfil"
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Sliders className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Ajustar</span>
                </button>
              </div>
              {renderNavGroup(filteredNavTecnico)}
            </nav>
          )}
        </div>

        {/* Simplified Footer Bar: Notifications, Theme, User, About Icons */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/90 flex items-center justify-around gap-2">
          {/* 1. Ícone Notificações Push */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenNotifications?.();
            }}
            title="Central de Notificação (Tarefas & Laudos)"
            className="p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:scale-105"
          >
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* 2. Ícone do Tema */}
          <button
            type="button"
            onClick={() => setIsDarkMode(prev => !prev)}
            title={isDarkMode ? 'Modo Escuro (Ativo) - Clique para alternar' : 'Modo Claro (Ativo) - Clique para alternar'}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode
                ? 'bg-zinc-900 text-amber-400 border border-zinc-800 hover:bg-zinc-800 hover:scale-105'
                : 'bg-white text-amber-500 border border-slate-200 shadow-2xs hover:bg-slate-100 hover:scale-105'
            }`}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* 3. Ícone do Usuário */}
          <button
            type="button"
            onClick={() => handleNavClick('cadastros')}
            title={`${currentAgronomist?.name || 'Dr. Carlos Miranda'} | ${currentAgronomist?.profession || 'Responsável Técnico'} (${currentAgronomist?.councilType || 'CREA'}-${currentAgronomist?.creaState || 'MT'} nº ${currentAgronomist?.crea || '145.892/D'})`}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'cadastros'
                ? 'bg-emerald-600 text-white shadow-xs hover:scale-105'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:scale-105'
            }`}
          >
            <User className="w-4 h-4" />
          </button>

          {/* 4. Ícone Sobre */}
          <button
            type="button"
            onClick={() => handleNavClick('sobre')}
            title="Sobre o GeaAgro 4.2.3.8"
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'sobre'
                ? 'bg-emerald-600 text-white shadow-xs hover:scale-105'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:scale-105'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* 5. Ícone Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sair do Sistema"
              className="p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </aside>

      {/* Backdrop for Mobile Hamburger Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[1100] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Perfil de Uso Customization Modal */}
      {isProfileCustomizationOpen && (
        <Suspense fallback={null}>
          <UserProfileCustomizationModal
            isOpen={isProfileCustomizationOpen}
            onClose={() => setIsProfileCustomizationOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
};
