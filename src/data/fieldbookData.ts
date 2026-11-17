import {
  Field,
  FieldBookDashboardSummary,
  FieldBookSubTab,
  FieldOperation,
  GlobalGapAuditData,
} from '../types/fieldbook';

export interface FieldBookTabOption {
  value: FieldBookSubTab;
  label: string;
}

export interface FieldBookTabGroup {
  label: string;
  options: FieldBookTabOption[];
}

export const FIELDBOOK_TAB_GROUPS: FieldBookTabGroup[] = [
  {
    label: 'Visão Geral & Controle Operacional',
    options: [
      { value: 'dashboard', label: 'Dashboard Geral (Resumo)' },
      { value: 'operations', label: 'Operações & Histórico' },
      { value: 'fields', label: 'Gestão de Talhões' },
      { value: 'digital_twin', label: 'Gêmeo Digital 360° (Talhão)' },
      { value: 'producao_mudas', label: 'Produção de Mudas (Viveiro)' },
      { value: 'hidroponia', label: 'Cultivo Hidropônico (Estufa)' },
    ],
  },
  {
    label: 'Calda, Semeadura & Fertilidade',
    options: [
      { value: 'tankmix', label: 'TankMix (Calda & Defensivos)' },
      { value: 'plantabilidade', label: 'Plantabilidade & Semeadura' },
      { value: 'solos', label: 'Análise de Solo & Fertilidade' },
      { value: 'foliar', label: 'Diagnose Foliar & DRIS' },
      { value: 'analise_agua', label: 'Análise de Água (USSL/IGA)' },
      { value: 'brix', label: 'Brix Foliar & Trofobiose' },
      { value: 'fenologia', label: 'Fenologia & Absorção' },
      { value: 'recomendacoes', label: 'Recomendação de Adubação & Calagem' },
    ],
  },
  {
    label: 'Água, Clima & Fitossanidade',
    options: [
      { value: 'irrigacao', label: 'Irrigação & Balanço Hídrico' },
      { value: 'pluviometria', label: 'Pluviometria & Chuvas' },
      { value: 'meteorologia', label: 'Climatologia & Previsão' },
      { value: 'nematology', label: 'Monitoramento de Nematoides' },
      { value: 'doencas_solo', label: 'Doenças de Solo & Patógenos' },
    ],
  },
  {
    label: 'Pecuária & Bem-Estar Animal',
    options: [
      { value: 'pecuaria', label: 'Bovinocultura (Corte & Leite)' },
      { value: 'nutricao_animal', label: 'Nutrição Animal (NRC/Br-Corte)' },
      { value: 'avicultura', label: 'Avicultura (Frango & Postura)' },
      { value: 'suinocultura', label: 'Suinocultura (Granja & Creche)' },
      { value: 'bubalinos', label: 'Bubalinocultura' },
      { value: 'caprinos', label: 'Caprinocultura & Ovino' },
      { value: 'equinos', label: 'Equinocultura & Tropa' },
    ],
  },
  {
    label: 'Gestão Econômica, Laudos & Auditoria',
    options: [
      { value: 'custos', label: 'Custos & Rentabilidade (DRE)' },
      { value: 'relatorios', label: 'Laudo Técnico Oficial & ART' },
      { value: 'reports', label: 'Auditoria GlobalG.A.P.' },
      { value: 'historico', label: 'Histórico Multissafras' },
    ],
  },
  {
    label: 'Bulários & Compêndios Técnicos',
    options: [
      { value: 'bulario', label: 'Bulário de Defensivos (Agrofit)' },
      { value: 'bulario_vet', label: 'Compêndio Veterinário (MAPA)' },
    ],
  },
];

export const INITIAL_FIELDS: Field[] = [];

export const INITIAL_OPERATIONS: FieldOperation[] = [];

export const MOCK_DASHBOARD_SUMMARY: FieldBookDashboardSummary = {
  todayOperations: 0,
  plannedOperations: 0,
  activeFields: 0,
  cultivatedAreaHa: 0,
  totalCosts: 0,
  machineryHours: 0,
  fuelUsedLiters: 0,
  iggsScore: 0,
};

export const MOCK_GLOBAL_GAP_AUDIT: GlobalGapAuditData = {
  certificateNumber: '',
  certificationBody: '',
  standardVersion: 'GLOBALG.A.P. IFA v6.0 - Smart (Integrated Farm Assurance)',
  auditDate: '',
  expiryDate: '',
  status: 'pending',
  auditorName: '',
  auditorRegistration: '',
  farmName: '',
  scope: [],
  complianceScore: {
    overallPct: 0,
    majorMustsPct: 0,
    minorMustsPct: 0,
    recommendationsPct: 0,
  },
  summaryStats: {
    totalControlPoints: 0,
    compliantPoints: 0,
    minorNonCompliancesResolved: 0,
    majorNonCompliances: 0,
    notApplicable: 0,
  },
  chapters: [],
  residueAnalysis: {
    labName: '',
    sampleDate: '',
    reportNumber: '',
    overallStatus: '',
    testedMatrix: '',
    substances: [],
  },
};

