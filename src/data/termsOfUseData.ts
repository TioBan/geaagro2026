export interface TermsSection {
  id: string;
  number: string;
  title: string;
  content: string;
  bullets?: string[];
  subsections?: { title: string; text: string }[];
}

export const TERMS_OF_USE_VERSION = '4.2.3';
export const TERMS_OF_USE_LAST_UPDATED = '14 de setembro de 2026';

export const TERMS_OF_USE_DATA: {
  title: string;
  subtitle: string;
  version: string;
  summaryPoints: {
    icon: string;
    title: string;
    description: string;
  }[];
  sections: TermsSection[];
} = {
  title: 'Termos e Condições de Uso dos Serviços Agronômicos',
  subtitle: 'Condições gerais, responsabilidades técnicas e licença de uso do GeaAgro CRM',
  version: TERMS_OF_USE_VERSION,
  summaryPoints: [
    {
      icon: 'Scale',
      title: 'Caráter Consultivo e Orientativo',
      description: 'As recomendações de adubação, calagem e diagnósticos de IA possuem finalidade técnica consultiva e educacional.',
    },
    {
      icon: 'AlertTriangle',
      title: 'Exigência Legal de ART e Receituário Agronômico',
      description: 'A aplicação de defensivos no campo requer prescrição por Engenheiro Agrônomo com ART registrada no CREA.',
    },
    {
      icon: 'BookOpen',
      title: 'Base Oficial do Bulário (MAPA)',
      description: 'Consulta de 2.900 produtos formulados com base nas diretrizes oficiais do Ministério da Agricultura e Pecuária.',
    },
    {
      icon: 'Award',
      title: 'Licença de Uso PWA Offline',
      description: 'Licença de uso individual, não exclusiva e intransferível para gestão técnica de lavouras e propriedades.',
    },
  ],
  sections: [
    {
      id: 'terms-aceitacao',
      number: '1',
      title: 'Aceitação das Condições de Uso',
      content:
        'Ao acessar, instalar ou utilizar o GeaAgro CRM v4.2.3, o usuário expressa concordância plena e irrestrita com todas as disposições deste Termo de Uso. Caso discorde de qualquer cláusula, deverá cessar imediatamente o uso da plataforma.',
    },
    {
      id: 'terms-bulario',
      number: '2',
      title: 'Escopo Informativo do Bulário e Simuladores de Nutrição',
      content:
        'As ferramentas de recomendação nutricional, interpretação de análise de solo (boletins IAC, Embrapa Cerrados, SBCS, CFSEMG, UFV) e o Bulário de Defensivos Agrícolas constituem instrumentos de auxílio à tomada de decisão agronômica.',
      bullets: [
        'O bulário compila informações públicas oficiais disponibilizadas pelo Ministério da Agricultura e Pecuária (MAPA).',
        'As dosagens de fertilizantes e corretivos são aproximações matemáticas fundamentadas em tabelas científicas consagradas.',
        'As análises de inteligência artificial (Nema IA) operam como triagem inicial de sintomas fitossanitários.',
      ],
    },
    {
      id: 'terms-art-crea',
      number: '3',
      title: 'Exigência de Responsabilidade Técnica (A.R.T. e CREA)',
      content:
        'Em estrito respeito à Lei Federal nº 5.194/1966 e à Lei nº 7.802/1989 (Lei dos Agrotóxicos), o GeaAgro CRM NÃO substitui o Receituário Agronômico nem a emissão da Anotação de Responsabilidade Técnica (ART) por Engenheiro Agrônomo devidamente registrado no Conselho Regional de Engenharia e Agronomia (CREA). O usuário assume a obrigação de validar toda prescrição com o profissional técnico responsável pela lavoura.',
    },
    {
      id: 'terms-responsabilidade',
      number: '4',
      title: 'Limitação de Responsabilidade Operacional',
      content:
        'Os idealizadores e desenvolvedores da plataforma não se responsabilizam por:',
      bullets: [
        'Decisões operacionais tomadas em campo sem supervisão agronômica presencial;',
        'Aplicações de defensivos fora das instruções do fabricante ou sem observância de carência/EPI;',
        'Erros de digitação ou divergências em laudos laboratoriais inseridos pelo operador;',
        'Quebras de safra resultantes de secas, geadas, pragas exóticas ou adversidades climáticas.',
      ],
    },
    {
      id: 'terms-propriedade',
      number: '5',
      title: 'Propriedade Intelectual e Licença de Software',
      content:
        'O código-fonte, algoritmos de cálculo, design de interface e identidade visual são de titularidade de Fatima Leão e Lucas Mendes. É concedida ao usuário licença pessoal, não exclusiva e intransferível para uso em suas atividades agropecuárias.',
    },
  ],
};
