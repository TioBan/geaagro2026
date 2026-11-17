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
    sublabel: 'Culturas & Campo',
    defaultCrop: 'Soja',
  },
  {
    id: 'fertilidade',
    label: 'Solos & Nutrição',
    sublabel: 'Adubação & BioAS',
    defaultCrop: 'Milho',
  },
  {
    id: 'nematologia',
    label: 'Fitossanidade',
    sublabel: 'Nema, Doenças & Rec.',
    defaultCrop: 'Soja',
  },
  {
    id: 'pecuaria',
    label: 'Pecuária & Vet',
    sublabel: 'Bovino, Suíno & Búfalo',
    defaultCrop: 'Brachiaria brizantha',
  },
  {
    id: 'avicultura',
    label: 'Avicultura',
    sublabel: 'Corte, Postura & Amb.',
    defaultCrop: 'Frango de Corte',
  },
  {
    id: 'geoprocessamento',
    label: 'Geo, NDVI & Máquinas',
    sublabel: 'Plantab. & Seringueira',
    defaultCrop: 'Seringueira (Hevea)',
  },
  {
    id: 'pericia_avaliacao',
    label: 'Perícia & Avaliação',
    sublabel: 'NBR 14653-3 & Laudos',
    defaultCrop: 'Imóvel Rural',
  },
  {
    id: 'ensino_pesquisa',
    label: 'Ensino & Pesquisa',
    sublabel: 'Educação & Dúvidas',
    defaultCrop: 'Pesquisa Agrícola',
  },
];

export const PRESET_PROMPTS: Record<AIDomain, { title: string; prompt: string }[]> = {
  geral: [
    {
      title: 'Planejamento de Semeadura',
      prompt: 'Como planejar a população de plantas, espaçamento e janela de semeadura considerando umidade do solo e risco climático?',
    },
    {
      title: 'Receituário Agronômico Técnico',
      prompt: 'Estruture um modelo de recomendação técnica / receituário agronômico para controle de pragas e doenças, indicando princípio ativo, dose, volume de calda, EPI e período de carência.',
    },
    {
      title: 'Manejo Integrado de Pragas',
      prompt: 'Quais os níveis de ação e rotação de ingredientes ativos (IRAC/FRAC) mais recomendados para evitar resistência em grandes culturas?',
    },
    {
      title: 'Heveicultura (Seringueira)',
      prompt: 'Quais as boas práticas de manejo de painel, sistema de sangria (ex: 1/2S d/3 ou d/4), uso de etefon e controle do mal-das-folhas e seca de painel na heveicultura?',
    },
  ],
  fertilidade: [
    {
      title: 'Adubação NPK & Parcelamento',
      prompt: 'Com base na análise de solo e expectativa de produtividade, como calcular a adubação de plantio (P2O5, K2O, S, B, Zn) e parcelamento de N em cobertura?',
    },
    {
      title: 'Equilíbrio Físico-Químico-Biológico',
      prompt: 'Como integrar indicadores físicos (densidade aparente, macroporosidade, compactação), químicos (CTC, V%, Al3+) e biológicos (BioAS Embrapa: Beta-glicosidase, Arilsulfatase, Fosfatase ácida) no manejo do solo?',
    },
    {
      title: 'Calagem & Gessagem Profunda',
      prompt: 'Qual a diferença prática entre os critérios de calagem (V%, SMP, Al/Ca+Mg) e quando entrar com gessagem agrícola para condicionar a camada 20–40 cm?',
    },
    {
      title: 'Nutrição Foliar & Correção Rápida',
      prompt: 'Como interpretar a relação N/K, Ca/Mg e P/Zn na análise foliar e definir a melhor formulação foliar para o estádio reprodutivo?',
    },
  ],
  nematologia: [
    {
      title: 'Diagnóstico de Nematoides & Doenças de Solo',
      prompt: 'Analise o risco de Pratylenchus brachyurus, Meloidogyne spp., Heterodera glycines e fungos de solo (Fusarium, Macrophomina, Rhizoctonia), diferenciando sintomas de reboleira no campo.',
    },
    {
      title: 'Protocolo Biológico (TS + Sulco)',
      prompt: 'Monte um protocolo técnico com bionematicidas e biofungicidas (Purpureocillium lilacinum, Bacillus firmus/velezensis, Trichoderma) indicando compatibilidade de calda e doses.',
    },
    {
      title: 'Rotação Redutora (FR < 1)',
      prompt: 'Indique espécies de cobertura (Crotalaria spectabilis/ochroleuca, milheto, braquiária) para reduzir o Fator de Reprodução (FR < 1) na entressafra.',
    },
    {
      title: 'Auditoria de Laudo Nematológico',
      prompt: 'Avalie os níveis populacionais em solo e raiz frente ao Nível de Dano Econômico (NDE) e defina prioridades por ordem de severidade.',
    },
  ],
  pecuaria: [
    {
      title: 'Bovinocultura (Corte & Leite)',
      prompt: 'Como ajustar taxa de lotação (UA/ha), altura de manejo de pasto e suplementação proteico-energética na seca e nas águas para maximizar o GMD ou produção leiteira?',
    },
    {
      title: 'Suinocultura (Maternidade a Terminação)',
      prompt: 'Quais os principais indicadores zootécnicos, controle térmico, biosseguridade e manejo nutricional por fase na suinocultura moderna?',
    },
    {
      title: 'Bubalinocultura (Búfalos Leite/Corte)',
      prompt: 'Quais as particularidades de manejo nutricional, reprodutivo, conforto térmico (acesso a áreas de imersão/sombra) e sanidade na bubalinocultura?',
    },
    {
      title: 'Receituário Médico-Veterinário',
      prompt: 'Estruture um protocolo sanitário e orientação de receituário médico-veterinário (princípio ativo, via de administração, dose por kg de peso vivo e período de carência para abate/leite).',
    },
  ],
  avicultura: [
    {
      title: 'Conversão Alimentar & IEP',
      prompt: 'Como otimizar a conversão alimentar (CA), ganho de peso diário e IEP (Índice de Eficiência Produtiva) em lotes de frangos de corte?',
    },
    {
      title: 'Ambiência & Ventilação em Galpão',
      prompt: 'Como regular exaustores, placas evaporativas, velocidade do ar e temperatura efetiva nas primeiras semanas de vida versus fase de terminação?',
    },
    {
      title: 'Biosseguridade & Cascudinho',
      prompt: 'Detalhe o protocolo completo de vazio sanitário, fermentação de cama, controle de cascudinho (Alphitobius diaperinus) e qualidade microbiológica da água.',
    },
    {
      title: 'Avicultura de Postura',
      prompt: 'Como equilibrar cálcio granular, fósforo disponível e programa de luz para manter qualidade de casca e pico de postura acima de 92%?',
    },
  ],
  geoprocessamento: [
    {
      title: 'Interpretação de Mapas NDVI / Vigor',
      prompt: 'Como interpretar zonas de baixo, médio e alto NDVI na lavoura, distinguir falhas de estande de estresse nutricional/hídrico e gerar prescrição em taxa variável (VRA)?',
    },
    {
      title: 'Plantabilidade & Semeadoras',
      prompt: 'Como auditar e melhorar a plantabilidade (coeficiente de variação, duplas, falhas, singularidade e profundidade) regulando dosadores pneumáticos/mecânicos, vácuo e velocidade?',
    },
    {
      title: 'Máquinas, Tratores & Pulverizadores',
      prompt: 'Como calcular lastro de trator, índice de patinagem ideal (8–12%), seleção de pontas de pulverização e calibração de vazão para evitar deriva?',
    },
    {
      title: 'Análise KML / GeoTIFF / Grid Amostral',
      prompt: 'Como estruturar um grid amostral georreferenciado eficiente e cruzar camadas vetoriais (KML/GeoJSON) com mapas de colheita e altimetria?',
    },
  ],
  pericia_avaliacao: [
    {
      title: 'Avaliação Rural (ABNT NBR 14653-3)',
      prompt: 'Quais os passos metodológicos para avaliação de imóvel rural pela ABNT NBR 14653-3 (tratamento de fatores vs regressão linear, saneamento de amostras e graus de fundamentação)?',
    },
    {
      title: 'Depreciação de Benfeitorias (Ross-Heidecke)',
      prompt: 'Como aplicar corretamente o critério de Ross-Heidecke combinando idade aparente, vida útil provável e estado de conservação em benfeitorias rurais?',
    },
    {
      title: 'Perícia Agronômica de Sinistros e Danos',
      prompt: 'Como estruturar um laudo pericial rural para quantificação de perdas por deriva de herbicida, granizo, seca ou quebra contratual de arrendamento?',
    },
    {
      title: 'Vistoria & Capacidade de Uso das Terras',
      prompt: 'Como classificar glebas por Capacidade de Uso do Solo e aplicar a Nota Agronômica / Índice de Terra Nua na valoração rural?',
    },
  ],
  ensino_pesquisa: [
    {
      title: 'Delineamento Experimental Agrícola',
      prompt: 'Qual a diferença entre DIC, DBC e Parcelas Subdivididas na pesquisa agronômica, e quando aplicar Tukey versus Scott-Knott ou regressão?',
    },
    {
      title: 'Aula Prática & Didática Rural',
      prompt: 'Explique de forma didática para aula ou treinamento de equipe de campo como funcionam a CTC do solo, a saturação por bases (V%) e a fixação biológica de nitrogênio.',
    },
    {
      title: 'Estruturação de TCC / Artigo Científico',
      prompt: 'Ajude a estruturar um protocolo de pesquisa experimental (objetivos, variáveis respostas, repetições e análise estatística) sobre manejo biológico ou fertilidade.',
    },
    {
      title: 'Tira-Dúvidas Técnico Livre',
      prompt: 'Tenho uma dúvida conceitual ou de cálculo agronômico/zootécnico: explique passo a passo com fórmulas e exemplos práticos.',
    },
  ],
};
