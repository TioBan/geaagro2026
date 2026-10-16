export interface PolicySection {
  id: string;
  number: string;
  title: string;
  content: string;
  bullets?: string[];
  subsections?: { title: string; text: string }[];
}

export const PRIVACY_POLICY_VERSION = '4.2.2';
export const PRIVACY_POLICY_LAST_UPDATED = '14 de setembro de 2026';
export const DPO_CONTACT_EMAIL = 'geaagrobrasil@gmail.com';

export const PRIVACY_POLICY_DATA: {
  title: string;
  subtitle: string;
  legislation: string;
  controller: {
    system: string;
    version: string;
    developers: string;
    dpoEmail: string;
  };
  summaryPoints: {
    icon: string;
    title: string;
    description: string;
  }[];
  sections: PolicySection[];
} = {
  title: 'Política de Privacidade e Proteção de Dados Pessoais',
  subtitle: 'Diretrizes de conformidade com a Lei Geral de Proteção de Dados (LGPD nº 13.709/2018)',
  legislation: 'Lei Federal nº 13.709, de 14 de agosto de 2018 (LGPD)',
  controller: {
    system: 'GeaAgro CRM — Plataforma de Inteligência Agronômica',
    version: PRIVACY_POLICY_VERSION,
    developers: 'Fatima Leão & Lucas Mendes',
    dpoEmail: DPO_CONTACT_EMAIL,
  },
  summaryPoints: [
    {
      icon: 'Lock',
      title: 'Armazenamento 100% Local (Offline-First)',
      description: 'Seus laudos de solo, foliar, talhões e histórico de campo são salvos no IndexedDB criptografado do seu próprio dispositivo.',
    },
    {
      icon: 'ShieldCheck',
      title: 'Sigilo de Amostras Agronômicas',
      description: 'Nenhum dado laboratorial ou de recomendação de adubação é comercializado ou repassado a empresas de defensivos.',
    },
    {
      icon: 'CheckCircle2',
      title: 'Direitos do Titular (Art. 18 LGPD)',
      description: 'Acesso total, retificação, portabilidade (exportação JSON/CSV) e exclusão definitiva de dados a qualquer momento.',
    },
    {
      icon: 'UserCheck',
      title: 'Consentimento Livre e Esclarecido',
      description: 'O tratamento de dados fundamenta-se estritamente na execução das rotinas agronômicas solicitadas pelo usuário.',
    },
  ],
  sections: [
    {
      id: 'sec-objetivo',
      number: '1',
      title: 'Objetivos e Escopo da Política',
      content:
        'A presente Política de Privacidade estabelece as diretrizes para a coleta, armazenamento, processamento e proteção dos dados pessoais e cadastrais de produtores rurais, consultores agronômicos e técnicos no âmbito do sistema GeaAgro CRM, em estrita observância à Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709, de 14 de agosto de 2018).',
    },
    {
      id: 'sec-dados',
      number: '2',
      title: 'Categorias de Dados Tratados',
      content:
        'O sistema coleta e processa unicamente os dados necessários para o cumprimento das funcionalidades agronômicas, discriminados nas seguintes categorias:',
      bullets: [
        'Dados Cadastrais de Propriedades Rurais: Razão social, nome da fazenda, CNPJ/CPF do produtor, Inscrição Estadual, NIRF, CAR, município e estado (UF).',
        'Dados Laboratoriais de Solo e Nutrição: Resultados de análises químicas, texturais e bioanálise enzimática do solo (BioAS - Beta-glicosidase e Arilsulfatase).',
        'Dados de Diagnose Foliar e Nutrição Vegetal: Teores foliares (N, P, K, Ca, Mg, S, B, Cu, Fe, Mn, Zn), estágio fenológico e índices DRIS/CND.',
        'Registros do Caderno de Campo: Operações de plantio, tratos culturais, colheita, calibração de pulverizadores e monitoramento fitossanitário (MIP).',
        'Dados Zootécnicos: Histórico de rebanhos bovinos, bubalinos, caprinos, equinos, suínos e plantéis avícolas.',
        'Metadados de Auditoria Local: Registros de data, hora e versão do consentimento armazenados localmente para conformidade legal.',
      ],
    },
    {
      id: 'sec-base-legal',
      number: '3',
      title: 'Base Legal e Finalidade do Tratamento',
      content:
        'O tratamento dos dados pessoais e técnicos tem fundamento no Artigo 7º, Inciso I (Consentimento do Titular) e Inciso V (Execução de Contrato/Serviço) da Lei nº 13.709/2018. A finalidade exclusiva é o processamento de cálculos agronômicos (calagem, gessagem, adubação mineral/orgânica), geração de laudos técnicos em PDF/Excel e controle operacional de propriedades rurais.',
    },
    {
      id: 'sec-seguranca',
      number: '4',
      title: 'Arquitetura Offline-First, Criptografia e Armazenamento',
      content:
        'O GeaAgro foi desenvolvido sob o princípio de Privacy by Design. O repositório primário de dados reside diretamente no armazenamento isolado do navegador/dispositivo do usuário (IndexedDB/LocalStorage). Não há sincronização automática não autorizada para nuvens externas.',
      subsections: [
        {
          title: 'Transmissão Segura em Módulos de IA (Nema IA & OCR)',
          text: 'Quando o usuário aciona voluntariamente o assistente de diagnose Nema IA ou o leitor óptico de laudos (OCR), os dados solicitados trafegam de forma pontual via protocolo HTTPS com encriptação TLS 1.3 de ponta a ponta, sem retenção permanente.',
        },
      ],
    },
    {
      id: 'sec-direitos',
      number: '5',
      title: 'Direitos Inalienáveis do Titular dos Dados (Artigo 18)',
      content:
        'Em cumprimento integral ao Artigo 18 da LGPD, o titular poderá a qualquer momento exercer seus direitos fundamentais diretamente através da interface do sistema:',
      bullets: [
        'Confirmação e Acesso: Visualizar a totalidade dos dados cadastrados e laudos salvos no painel principal.',
        'Retificação: Corrigir informações incorretas, incompletas ou desatualizadas nos módulos de cadastro.',
        'Portabilidade: Baixar cópia integral de segurança de seus dados nos formatos padronizados JSON e CSV.',
        'Eliminação e Revogação: Excluir definitivamente o banco de dados local ou revogar o consentimento LGPD nas opções do módulo Sobre.',
      ],
    },
    {
      id: 'sec-dpo',
      number: '6',
      title: 'Canal de Atendimento e Encarregado de Dados (DPO)',
      content: `Para esclarecimento de dúvidas, solicitações formais sobre tratamento de dados ou exercício de direitos do titular, entre em contato diretamente com o Encarregado de Proteção de Dados (DPO) pelo endereço eletrônico: ${DPO_CONTACT_EMAIL}.`,
    },
  ],
};
