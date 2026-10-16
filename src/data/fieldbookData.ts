import { FieldOperation, Field, FieldBookDashboardSummary } from '../types/fieldbook';

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
  iggsScore: 100,
};

export const MOCK_GLOBAL_GAP_AUDIT = {
  certificateNumber: 'GGN 4063487291034',
  certificationBody: 'Control Union Certifications B.V. (ISO 17065)',
  standardVersion: 'GLOBALG.A.P. IFA v6.0 - Smart (Integrated Farm Assurance)',
  auditDate: '2026-07-14',
  expiryDate: '2027-07-13',
  status: 'valid' as const,
  auditorName: 'Eng. Agrônomo Roberto Carlos Mendes (Auditor Cadastrado GLOBALG.A.P.)',
  auditorRegistration: 'IRCA / GG-AUD-98211',
  farmName: 'Fazenda Santa Maria - Sede',
  scope: [
    'Grandes Culturas (Soja e Milho)',
    'Rastreabilidade Lote a Lote',
    'Manejo Integrado de Pragas (MIP)',
    'Gestão e Segurança do Trabalho (NR-31)'
  ],
  complianceScore: {
    overallPct: 98.4,
    majorMustsPct: 100.0, // Requisito Mínimo: 100%
    minorMustsPct: 96.8,  // Requisito Mínimo: 95%
    recommendationsPct: 92.0
  },
  summaryStats: {
    totalControlPoints: 218,
    compliantPoints: 212,
    minorNonCompliancesResolved: 4,
    majorNonCompliances: 0,
    notApplicable: 2
  },
  chapters: [
    {
      id: 'ch-1',
      code: 'AF - General',
      title: 'Rastreabilidade, Histórico do Local e Mapeamento',
      mustType: 'Major' as const,
      status: 'compliant' as const,
      scorePct: 100,
      verifiedCount: 28,
      totalCount: 28,
      description: 'Identificação inequívoca de todos os talhões, registros de histórico de uso do solo por 5 anos e sistema de recall em até 2 horas.'
    },
    {
      id: 'ch-2',
      code: 'CB - Crop Base',
      title: 'Material de Propagação Vegetal (Sementes & Mudas)',
      mustType: 'Major' as const,
      status: 'compliant' as const,
      scorePct: 100,
      verifiedCount: 16,
      totalCount: 16,
      description: 'Sementes comerciais de fontes idôneas com atestado de sanidade, rastreabilidade de lote e declaração de inocuidade OGM.'
    },
    {
      id: 'ch-3',
      code: 'CB.3 - Soil & Fertility',
      title: 'Manejo do Solo e Rotação de Nutrientes',
      mustType: 'Minor' as const,
      status: 'compliant' as const,
      scorePct: 98,
      verifiedCount: 32,
      totalCount: 33,
      description: 'Laudos laboratoriais de análise química/física do solo, recomendação agronômica assinada e controle de erosão.'
    },
    {
      id: 'ch-4',
      code: 'CB.4 - Water Management',
      title: 'Gestão Racional da Água e Irrigação',
      mustType: 'Minor' as const,
      status: 'compliant' as const,
      scorePct: 95,
      verifiedCount: 20,
      totalCount: 21,
      description: 'Outorga atempada de direito de uso de água, análises microbiológicas da água de pulverização e irrigação por pivô.'
    },
    {
      id: 'ch-5',
      code: 'CB.6 - Crop Protection',
      title: 'Proteção de Cultivos, Receituário e Carência (LMR)',
      mustType: 'Major' as const,
      status: 'compliant' as const,
      scorePct: 100,
      verifiedCount: 45,
      totalCount: 45,
      description: 'Controle rigoroso dos Limites Máximos de Resíduos (LMR), cumprimento do intervalo de segurança (PHI) e devolução de embalagens no InpEV.'
    },
    {
      id: 'ch-6',
      code: 'AH - Worker Health',
      title: 'Saúde, Segurança e Bem-Estar Agrícola (NR-31)',
      mustType: 'Major' as const,
      status: 'compliant' as const,
      scorePct: 97,
      verifiedCount: 34,
      totalCount: 35,
      description: 'EPIs certificados, exames admissionais/periódicos (PCMSO), área de vivência e capacitação em primeiros socorros.'
    },
    {
      id: 'ch-7',
      code: 'ENV - Environment',
      title: 'Biodiversidade, Conservação e Áreas APPs',
      mustType: 'Minor' as const,
      status: 'compliant' as const,
      scorePct: 96,
      verifiedCount: 24,
      totalCount: 25,
      description: 'Manutenção de Áreas de Preservação Permanente (APP) e Reserva Legal (CAR ativo), corredores ecológicos e proteção a abelhas.'
    },
    {
      id: 'ch-8',
      code: 'WST - Waste & Storage',
      title: 'Armazenamento de Insumos e Bacias de Contenção',
      mustType: 'Major' as const,
      status: 'compliant' as const,
      scorePct: 100,
      verifiedCount: 19,
      totalCount: 19,
      description: 'Depósito de defensivos ventilado, trancado, com piso impermeável, canaleta de contenção e chuveiro Lava-Olhos de emergência.'
    }
  ],
  residueAnalysis: {
    labName: 'Eurofins AgroAnalítica do Brasil (Credenciado ISO 17025 / MAPA)',
    sampleDate: '2026-07-02',
    reportNumber: 'LA-2026-88492-MRL',
    overallStatus: 'CONFORME_LMR_APROVADO',
    testedMatrix: 'Grãos de Soja e Milho (Amostragem de Pré-Colheita)',
    substances: [
      { ingredient: 'Glifosato (Glyphosate)', detectedValueMgKg: 0.12, mrlAllowedMgKg: 10.0, mrlSource: 'ANVISA / Codex / EU', status: 'OK' as const },
      { ingredient: 'Azoxistrobina (Azoxystrobin)', detectedValueMgKg: 0.04, mrlAllowedMgKg: 0.5, mrlSource: 'ANVISA / EU', status: 'OK' as const },
      { ingredient: 'Ciproconazol (Cyproconazole)', detectedValueMgKg: 0.01, mrlAllowedMgKg: 0.1, mrlSource: 'ANVISA / EU', status: 'OK' as const },
      { ingredient: 'Imidacloprido (Imidacloprid)', detectedValueMgKg: 0.02, mrlAllowedMgKg: 1.0, mrlSource: 'ANVISA / Codex', status: 'OK' as const },
      { ingredient: 'Fludioxonil', detectedValueMgKg: 0.005, mrlAllowedMgKg: 0.02, mrlSource: 'ANVISA / EU', status: 'OK' as const },
      { ingredient: 'Mancozebe (Mancozeb)', detectedValueMgKg: 0.08, mrlAllowedMgKg: 2.0, mrlSource: 'ANVISA / Codex', status: 'OK' as const }
    ]
  }
};
