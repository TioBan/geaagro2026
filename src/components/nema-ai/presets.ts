import { AIDomain } from './types';

export interface DomainOption {
  id: AIDomain;
  label: string;
  sublabel: string;
  defaultCrop: string;
}

export const DOMAINS_CONFIG: DomainOption[] = [
  {
    id: 'geral',
    label: 'Agronomia',
    sublabel: 'Grandes Culturas',
    defaultCrop: 'Soja',
  },
  {
    id: 'fertilidade',
    label: 'Solos & Nutrição',
    sublabel: 'Fertilidade & BioAS',
    defaultCrop: 'Milho',
  },
  {
    id: 'nematologia',
    label: 'Fitossanidade',
    sublabel: 'Nematoides & Patol.',
    defaultCrop: 'Soja',
  },
  {
    id: 'pecuaria',
    label: 'Pecuária',
    sublabel: 'Corte, Leite & Pastos',
    defaultCrop: 'Brachiaria brizantha',
  },
  {
    id: 'avicultura',
    label: 'Avicultura',
    sublabel: 'Corte, Ovos & Amb.',
    defaultCrop: 'Frango de Corte',
  },
];

export const PRESET_PROMPTS: Record<AIDomain, { title: string; prompt: string }[]> = {
  geral: [
    {
      title: 'Planejamento de Semeadura',
      prompt: 'Como planejar a população de plantas, espaçamento e época de plantio da Soja/Milho frente às previsões climáticas de El Niño/La Niña?',
    },
    {
      title: 'Manejo Integrado de Pragas (MIP)',
      prompt: 'Quais os Níveis de Ação críticos para lagartas e percevejos na cultura e como calibrar pulverizadores terrestres de forma eficiente?',
    },
    {
      title: 'Pulverização com Drones',
      prompt: 'Como configurar taxa de aplicação (L/ha), altura e velocidade de voo de drones de pulverização para aplicação de bioinsumos?',
    },
    {
      title: 'Estresse Hídrico & Veranicos',
      prompt: 'Quais as melhores estratégias fisiológicas e hormonais para mitigar os efeitos de veranicos e altas temperaturas na fase reprodutiva da cultura?',
    },
  ],
  fertilidade: [
    {
      title: 'Equilíbrio de Bases Ca-Mg-K',
      prompt: 'Como calcular a calagem pelos métodos de Saturação por Bases (V%) versus Solução Tampão SMP, visando um equilíbrio ideal de Ca, Mg e K?',
    },
    {
      title: 'Gessagem e Subsuperfície',
      prompt: 'Qual o critério técnico para aplicação de gesso agrícola visando aprofundamento radicular e neutralização do Alumínio tóxico em subsuperfície?',
    },
    {
      title: 'Adubação de Plantio NPK',
      prompt: 'Como formular uma adubação fosfatada e potássica de plantio balanceada com base no teor de argila do solo e metas elevadas de produtividade?',
    },
    {
      title: 'Interpretação BioAS (Enzimas)',
      prompt: 'Como interpretar os teores das enzimas Beta-glicosidase, Fosfatase ácida e Arilsulfatase na avaliação da qualidade e saúde biológica do solo?',
    },
  ],
  nematologia: [
    {
      title: 'Auditoria de Laudo Técnico',
      prompt: 'Realize uma auditoria completa das populações de nematóides no solo e na raiz deste talhão, calculando o Nível de Dano Econômico (NDE) e risco de perdas.',
    },
    {
      title: 'Rotação Redutora (FR < 1)',
      prompt: 'Gere um plano de rotação e cobertura na entressafra (ex: Crotalaria spectabilis, ochroleuca, Milheto ADR 300) para derrubar o Fator de Reprodução (FR) dos fitonematoides.',
    },
    {
      title: 'Prescrição de Bioinsumos',
      prompt: 'Escreva um protocolo agronômico detalhado de controle biológico com Purpureocillium lilacinum, Bacillus firmus/velezensis e Trichoderma, indicando dosagens e momentos.',
    },
    {
      title: 'Sintomatologia de Reboleiras',
      prompt: 'Como diferenciar no campo sintomas de reboleiras causadas por nematoides de sintomas causados por compactação de solo ou deficiência de micronutrientes?',
    },
  ],
  pecuaria: [
    {
      title: 'Manejo de Pastejo Rotacionado',
      prompt: 'Qual a altura ideal de entrada e saída para pastagens de Brachiaria brizantha e Panicum maximum (Mombaça/Zuri), e como planejar os dias de descanso?',
    },
    {
      title: 'Taxa de Lotação (UA/ha)',
      prompt: 'Como calcular a capacidade de suporte (UA/ha) de um pasto rotacionado com base na produção de matéria seca e estacionalidade das chuvas?',
    },
    {
      title: 'Suplementação Seca vs Águas',
      prompt: 'Estratégia de suplementação proteico-energética de precisão no cocho para gado de corte (recria/engorda) no período seco do ano.',
    },
    {
      title: 'Dieta e Formulação no Confinamento',
      prompt: 'Como formular uma ração eficiente com silagem de milho, farelo de soja e caroço de algodão visando GMD de 1,4 a 1,6 kg/dia em confinamento?',
    },
  ],
  avicultura: [
    {
      title: 'Conversão Alimentar & IEP',
      prompt: 'Como otimizar a conversão alimentar (CA), viabilidade e IEP (Índice de Eficiência Produtiva) de um lote de frangos de corte de 1 a 42 dias?',
    },
    {
      title: 'Ambiência Dark House',
      prompt: 'Quais as melhores práticas de ambiência de galpão Dark House (velocidade do ar, umidade e nebulização) em dias de calor extremo para evitar estresse térmico?',
    },
    {
      title: 'Biosseguridade & Vazio Sanitário',
      prompt: 'Protocolo completo de desinfecção de aviários no vazio sanitário, controle de cascudinho (Alphitobius diaperinus) e biosseguridade de galpão.',
    },
    {
      title: 'Curva de Peso por Fase',
      prompt: 'Como ajustar a nutrição (dietas pré-inicial, inicial, crescimento e terminação) para acompanhar a curva de peso padrão da linhagem Cobb/Ross?',
    },
  ],
};
