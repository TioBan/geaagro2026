import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Sprout,
  CheckCircle2,
  Activity,
  X,
  ChevronRight,
  ShieldCheck,
  Scale,
  Award,
  Zap,
  Microscope,
  FileSpreadsheet
} from 'lucide-react';

interface ParametroReferencia {
  parametro: string;
  unidade: string;
  faixaCritica: string;
  faixaIdeal: string;
  interpretacao: string;
}

interface ArtigoTecnico {
  id: string;
  categoria:
    | 'Física do Solo & Compactação'
    | 'Química & Fertilidade'
    | 'Biologia & BioAS'
    | 'Pastagens Degradadas'
    | 'Plantas de Cobertura'
    | 'Conservação & Erosão'
    | 'Recuperação Ambiental & APP'
    | 'Sistemas Integrados (ILPF)'
    | 'Legislação & Normas';
  titulo: string;
  subtitulo?: string;
  autoria: string;
  instituicao: string;
  ano: number;
  referenciaAbnt: string;
  tags: string[];
  resumo: string;
  diagnosticoCampo: string;
  protocoloIntervencao: {
    fase: string;
    acao: string;
    detalhes: string;
  }[];
  parametrosCriticos: ParametroReferencia[];
  pontosChave: string[];
  insumosOuEspecies: string[];
  relevanciaAgronomica: string;
}

const ARTIGOS_COMPENDIO: ArtigoTecnico[] = [
  // 1. FÍSICA DO SOLO & COMPACTAÇÃO
  {
    id: 'reichert_compactacao_solo',
    categoria: 'Física do Solo & Compactação',
    titulo: 'Compactação do Solo e Intervalo Hídrico Ótimo: Diagnóstico e Manejo',
    subtitulo: 'Parâmetros físicos críticos para o desenvolvimento radicular em solos agrícolas tropicais e subtropicais',
    autoria: 'Reichert, J.M.; Suzuki, L.E.A.S.; Reinert, D.J.',
    instituicao: 'Universidade Federal de Santa Maria (UFSM) / Sociedade Brasileira de Ciência do Solo',
    ano: 2020,
    referenciaAbnt: 'REICHERT, J. M.; SUZUKI, L. E. A. S.; REINERT, D. J. Compactação do solo e intervalo hídrico ótimo: diagnóstico, causas e manejo. Tópicos em Ciência do Solo, Viçosa: SBCS, v. 6, p. 329-394, 2020.',
    tags: ['densidade-do-solo', 'resistencia-penetracao', 'escarificacao', 'descompactacao-biologica', 'IHO'],
    resumo: 'Este estudo sintetiza as bases conceituais da degradação física de solos agrícolas. Estabelece a densidade crítica do solo (DsC) e a resistência mecânica à penetração (RP) como os dois indicadores mais sensíveis e práticos de campo para identificar camadas compactadas (pé-de-arado ou pé-de-grade) provocadas pelo tráfego de máquinas pesadas e pisoteio contínuo de gado.',
    diagnosticoCampo: 'Avaliação com penetrômetro de impacto ou digital (anotando profundidades onde RP > 2,0 MPa), abertura de trincheiras de diagnóstico morfológico (abertura de 1 m de profundidade) observando raízes pivotantes bifurcadas em formato de "L" ou "T", formato de agregados em lâminas/blocos e presença de mosqueados de hidromorfia temporária.',
    protocoloIntervencao: [
      { fase: 'Mapeamento', acao: 'Trincheira diagnóstica e penetrometria', detalhes: 'Determinar a profundidade exata da camada compactada (comumente entre 12 e 28 cm).' },
      { fase: 'Intervenção Mecânica', acao: 'Escarificação ou subsolagem no ponto de friabilidade', detalhes: 'Trabalhar com a haste regulada de 5 a 10 cm abaixo da camada adensada com o solo friável (nem plástico, nem excessivamente seco).' },
      { fase: 'Consolidação Biológica', acao: 'Semeadura imediata de espécies de raízes agressivas', detalhes: 'Semear Crotalaria juncea, Guandu ou Nabo Forrageiro para preencher os bioporos abertos pelo escarificador, impedindo a recompactação.' }
    ],
    parametrosCriticos: [
      { parametro: 'Resistência à Penetração (RP)', unidade: 'MPa', faixaCritica: '> 2,0 MPa', faixaIdeal: '< 1,5 MPa', interpretacao: 'Acima de 2,0 MPa há bloqueio severo do alongamento de raízes da maioria das gramíneas e leguminosas.' },
      { parametro: 'Densidade Aparente (Argiloso > 60%)', unidade: 'g/cm³', faixaCritica: '> 1,35 g/cm³', faixaIdeal: '1,00 - 1,15 g/cm³', interpretacao: 'Indica redução drástica de macroporos responsáveis pela aeração do solo.' },
      { parametro: 'Macroporosidade Total', unidade: '% do volume', faixaCritica: '< 10%', faixaIdeal: '> 15%', interpretacao: 'Valores abaixo de 10% geram anoxia temporária nas raízes durante eventos chuvosos.' }
    ],
    pontosChave: [
      'A descompactação mecânica isolada tem meia-vida de apenas 6 a 12 meses se não for seguida de plantio imediato com espécies de raízes profundas.',
      'A umidade do solo no momento da escarificação é o fator mais determinante para o sucesso: trabalhar no limite de plasticidade gera espelhamento lateral e piora a degradação.',
      'O consórcio de braquiárias com raízes fasciculadas abundantes e leguminosas com raiz pivotante vigorosa promove estruturação contínua do solo.'
    ],
    insumosOuEspecies: ['Crotalaria juncea', 'Cajanus cajan (Guandu)', 'Raphanus sativus (Nabo Forrageiro)', 'Urochloa ruziziensis'],
    relevanciaAgronomica: 'Essencial para dimensionar operações prévias de preparo do solo e escolher implementos (escarificador vs. subsolador).'
  },

  // 2. QUÍMICA & FERTILIDADE DO SOLO
  {
    id: 'sousa_lobato_cerrados',
    categoria: 'Química & Fertilidade',
    titulo: 'Cerrado: Correção do Solo e Adubação Estrutural',
    subtitulo: 'Metodologias quantitativas de calagem, fosfatagem corretiva profunda e gessagem para neutralização de alumínio',
    autoria: 'Sousa, D.M.G.; Lobato, E.; Rein, T.A.',
    instituicao: 'Embrapa Cerrados / MAPA',
    ano: 2018,
    referenciaAbnt: 'SOUSA, D. M. G.; LOBATO, E. Cerrado: correção do solo e adubação. 2. ed. Brasília: Embrapa Informação Tecnológica, 2018. 416 p.',
    tags: ['calagem', 'gessagem', 'fosfatagem-corretiva', 'saturacao-bases', 'aluminio-toxico', 'subsolo'],
    resumo: 'Manual clássico de referência para solos sob vegetação de Cerrado e áreas tropicais altamente intemperizadas (Latossolos e Argissolos). Trata da acidez superficial e subsuperficial, saturação por alumínio (m%), baixa capacidade de troca catiônica efetiva (CTCe) e fixação severa de fósforo por oxi-hidróxidos de ferro e alumínio.',
    diagnosticoCampo: 'Coleta de amostras compostas em duas profundidades obrigatórias: 0-20 cm (diagnóstico da camada arável) e 20-40 cm (diagnóstico da barreira química de subsolo). Identificação de m% > 15-20%, Ca < 0,5 cmolc/dm³ e V% < 40%.',
    protocoloIntervencao: [
      { fase: 'Calagem Superficial', acao: 'Aplicação de calcário dolomítico com PRNT > 80%', detalhes: 'Calcular NC para elevar V% a 60-70% (pastagens/grãos). Incorporar a 0-20 cm ou aplicar em superfície em áreas sob SPD consolidado.' },
      { fase: 'Gessagem Subsuperficial', acao: 'Aplicação de gesso agrícola (sulfato de cálcio)', detalhes: 'Dose baseada no teor de argila (NG kg/ha = 50 a 60 × %Argila para lavouras e 30 a 35 × %Argila para pastagens) visando lixiviar o sulfato com o cálcio para neutralizar o Al subsuperficial.' },
      { fase: 'Fosfatagem Corretiva', acao: 'Adubação fosfatada corretiva a lanço ou no sulco', detalhes: 'Aplicar fonte solúvel ou termo-fosfato para elevar os teores de P acima do nível crítico de acordo com a classe textural e P-remanescente.' }
    ],
    parametrosCriticos: [
      { parametro: 'Saturação por Alumínio em Subsolo (m% a 20-40 cm)', unidade: '%', faixaCritica: '> 20%', faixaIdeal: '< 10%', interpretacao: 'Gera impedimento químico ao aprofundamento das raízes, tornando a cultura vulnerável a veranicos.' },
      { parametro: 'Cálcio Trocável em Subsolo (20-40 cm)', unidade: 'cmolc/dm³', faixaCritica: '< 0,4 cmolc/dm³', faixaIdeal: '> 1,0 cmolc/dm³', interpretacao: 'O cálcio é imóvel na planta e necessita estar presente em contato direto com a coifa da raiz para permitir sua divisão celular.' },
      { parametro: 'Fósforo Disponível Mehlich-1 (Argila > 40%)', unidade: 'mg/dm³', faixaCritica: '< 4,0 mg/dm³', faixaIdeal: '12 - 18 mg/dm³', interpretacao: 'Principal nutriente limitante na degradação de pastagens brasileiras.' }
    ],
    pontosChave: [
      'O calcário neutraliza o alumínio apenas onde é fisicamente incorporado ou em contato com a água na superfície; não corrige o subsolo com velocidade.',
      'O gesso agrícola NÃO é corretivo de acidez (não altera o pH), mas é um condicionador de subsolo que fornece Ca e SO4-2 solúveis que carregam Al tóxico para formas não tóxicas (AlSO4+).',
      'A fosfatagem em área degradada sem correção de acidez prévia resulta em perda de até 80% do fósforo aplicado por fixação química irreversível.'
    ],
    insumosOuEspecies: ['Calcário Dolomítico (PRNT 85-90%)', 'Gesso Agrícola (Fosfogesso)', 'Superfosfato Simples', 'Termofosfato Magnesiano'],
    relevanciaAgronomica: 'Fundamenta as calculadoras de calagem e gessagem utilizadas em todo o território nacional.'
  },

  // 3. BIOLOGIA DO SOLO & BIOAS
  {
    id: 'mendes_bioas_saude_solo',
    categoria: 'Biologia & BioAS',
    titulo: 'BioAS: Tecnologia de Bioanálise de Solo para Avaliação da Saúde do Solo',
    subtitulo: 'Uso de bioindicadores enzimáticos (Beta-Glicosidase e Arilsulfatase) na detecção precoce da regeneração de áreas degradadas',
    autoria: 'Mendes, I.C.; Reis-Junior, F.B.; Sousa, D.M.G.',
    instituicao: 'Embrapa Cerrados',
    ano: 2021,
    referenciaAbnt: 'MENDES, I. C.; REIS-JUNIOR, F. B.; SOUSA, D. M. G. Bioanálise de solo: como acessar e interpretar a saúde do solo. Planaltina, DF: Embrapa Cerrados, 2021. 52 p. (Documentos / Embrapa Cerrados, 363).',
    tags: ['bioas', 'enzimas-do-solo', 'beta-glicosidase', 'arilsulfatase', 'materia-organica', 'saude-do-solo'],
    resumo: 'A tecnologia BioAS da Embrapa revolucionou a avaliação da recuperação de áreas degradadas ao demonstrar que as enzimas Beta-Glicosidase (ciclo do carbono) e Arilsulfatase (ciclo do enxofre) funcionam como bioindicadores precoces de saúde do solo. Elas acusam a degradação ou a regeneração biológica até 3 a 5 anos antes de qualquer alteração mensurável na análise química de rotina ou nos teores totais de matéria orgânica.',
    diagnosticoCampo: 'Coleta de amostra de solo superficial (0-10 cm) em época seca (após a safra) ou de repouso vegetativo, mantendo a amostra refrigerada ou seca ao ar à sombra, para quantificação da atividade enzimática em laboratórios credenciados pela rede BioAS Embrapa.',
    protocoloIntervencao: [
      { fase: 'Diagnóstico Basal', acao: 'Bioanálise de solo da área degradada', detalhes: 'Quantificar os níveis de Beta-Glicosidase e Arilsulfatase e calcular os Índices de Qualidade do Solo (IQS).' },
      { fase: 'Aporte de Biomassa', acao: 'Consórcio de plantas com elevada relação C/N e raízes densas', detalhes: 'Aporte mínimo de 8 a 12 t/ha/ano de massa seca vegetal na superfície para alimentar a biota do solo.' },
      { fase: 'Manutenção do Habitat', acao: 'Supressão de queimadas e de revolvimento mecânico contínuo', detalhes: 'Proteger a superfície contra insolação excessiva (temperaturas de solo > 45 °C esterilizam microrganismos benéficos).' }
    ],
    parametrosCriticos: [
      { parametro: 'Beta-Glicosidase (Ciclo do Carbono)', unidade: 'mg p-nitrofenol/kg solo/h', faixaCritica: '< 40 (Baixo)', faixaIdeal: '> 110 (Adequado)', interpretacao: 'Indica a capacidade do solo em decompor resíduos orgânicos e liberar nutrientes.' },
      { parametro: 'Arilsulfatase (Ciclo do Enxofre)', unidade: 'mg p-nitrofenol/kg solo/h', faixaCritica: '< 25 (Baixo)', faixaIdeal: '> 75 (Adequado)', interpretacao: 'Altamente sensível a manejos conservacionistas e uso de agrotóxicos desregulados.' },
      { parametro: 'Índice de Qualidade Biológica (IQB)', unidade: 'escala 0 - 1', faixaCritica: '< 0,40', faixaIdeal: '> 0,75', interpretacao: 'Expressa o status global de funcionamento biológico e imunológico do solo contra fitopatógenos radiculares.' }
    ],
    pontosChave: [
      'A microbiota do solo é responsável por mais de 90% das transformações e ciclagem de nutrientes em solos agrícolas tropicais.',
      'Solos biologicamente ativos conseguem suprimir naturalmente fungos fitopatogênicos (como Macrophomina e Rhizoctonia) e fitonematoides.',
      'A diversidade de espécies de plantas de cobertura multiplica a diversidade enzimática e acelera a recuperação de pastos degradados.'
    ],
    insumosOuEspecies: ['Inoculantes com Bradyrhizobium e Azospirillum', 'Composto Orgânico Curado', 'Biomassa de Urochloa ruziziensis', 'Crotalarias'],
    relevanciaAgronomica: 'Componente central da dimensão biológica do índice IGRA do GeaAgro Recupera.'
  },

  // 4. RECUPERAÇÃO DE PASTAGENS DEGRADADAS
  {
    id: 'zimmer_pastagens_embrapa',
    categoria: 'Pastagens Degradadas',
    titulo: 'Degradação e Recuperação de Pastagens: Diagnóstico e Métodos de Renovação',
    subtitulo: 'Protocolos de recuperação direta, reforma total e sistemas integrados Lavoura-Pecuária (ILP)',
    autoria: 'Zimmer, A.H.; Macedo, M.C.M.; Kichel, A.N.; Martha Junior, G.B.',
    instituicao: 'Embrapa Gado de Corte / Embrapa Cerrados',
    ano: 2021,
    referenciaAbnt: 'ZIMMER, A. H.; MACEDO, M. C. M.; KICHEL, A. N.; MARTHA JUNIOR, G. B. Degradação de pastagens e sistemas de recuperação e renovação. Campo Grande: Embrapa Gado de Corte, 2021. 78 p.',
    tags: ['pastagens', 'brachiaria', 'panicum', 'lotacao-rotacionada', 'valor-cultural', 'reforma-pastagem'],
    resumo: 'Estudo abrangente sobre as 4 fases da degradação das pastagens brasileiras (Fase 1: perda de vigor e amarelecimento; Fase 2: surgimento de solo exposto e ervas daninhas; Fase 3: erosão laminar e cupinzeiros; Fase 4: erosão em sulcos e voçorocas, perda quase total de gramíneas). Estabelece critérios de decisão entre recuperação direta (apenas adubação/manejo) e renovação (destruição e replantio).',
    diagnosticoCampo: 'Contagem da porcentagem de solo descoberto em transecto de 100 metros (se solo exposto > 30%, necessita replantio), amostragem de fertilidade (P < 5 mg/dm³ é o fator causal principal) e avaliação da altura média de resíduo pós-pastejo da forrageira.',
    protocoloIntervencao: [
      { fase: 'Manejo Inicial', acao: 'Alívio de carga animal e vedação temporal', detalhes: 'Retirar o gado durante 60 a 90 dias no início da estação chuvosa para recompor as reservas de carboidratos nas raízes.' },
      { fase: 'Correção Química', acao: 'Calagem e adubação fosfatada fosfatada corretiva', detalhes: 'Aplicar 1,5 a 3,0 t/ha de calcário a lanço no início das chuvas e 60 a 90 kg/ha de P2O5.' },
      { fase: 'Reintrodução Forrageira', acao: 'Semeadura com sementes de alto VC% (> 75%)', detalhes: 'Semear a lanço ou com grade niveladora aberta na profundidade de 1 a 2 cm com taxa ajustada pela fórmula de recomendação técnica.' }
    ],
    parametrosCriticos: [
      { parametro: 'Taxa de Solo Descoberto', unidade: '% da área', faixaCritica: '> 35%', faixaIdeal: '< 5%', interpretacao: 'Acima de 35% a infiltração de água cai pela metade e o escoamento superficial deflagra ravinamento.' },
      { parametro: 'Fósforo Mehlich-1 em Pastagem', unidade: 'mg/dm³', faixaCritica: '< 3,0 mg/dm³', faixaIdeal: '8,0 - 15,0 mg/dm³', interpretacao: 'A deficiência de P impede a emissão de novos perfilhos, acelerando a morte de touceiras.' },
      { parametro: 'Lotação Suportada (Degradada vs. Recuperada)', unidade: 'UA/ha', faixaCritica: '< 0,5 UA/ha', faixaIdeal: '1,5 - 2,5 UA/ha', interpretacao: 'A recuperação triplica a capacidade de suporte com ganho de peso vivo por hectare de 400 kg/ha/ano.' }
    ],
    pontosChave: [
      'A causa raiz de mais de 70% das pastagens degradadas no Brasil não é o esgotamento do solo, mas sim o superpastejo contínuo que esgota as reservas energéticas da touceira.',
      'Sementes com VC baixo (< 40%) contêm impurezas e sementes de plantas daninhas agressivas; o uso de sementes fiscalizadas com VC > 75% reduz o custo de pós-emergência.',
      'O Sistema Santa Fé (consórcio milho safrinha + braquiária) permite recuperar o solo e pagar os custos de calagem e adubação com a venda do grão.'
    ],
    insumosOuEspecies: ['Urochloa brizantha cv. Marandu/BRS Paiaguás', 'Urochloa decumbens cv. Basilisk', 'Megathyrsus maximus cv. Mombaça/BRS Zuri', 'Superfosfato Simples'],
    relevanciaAgronomica: 'Referência direta para o módulo Recuperação de Pastagens e a Calculadora de Sementes com VC% do GeaAgro.'
  },

  // 5. PLANTAS DE COBERTURA & ADUBAÇÃO VERDE
  {
    id: 'calegari_adubacao_verde',
    categoria: 'Plantas de Cobertura',
    titulo: 'Plantas de Cobertura de Solo e Adubação Verde: Fundamentos e Manejo',
    subtitulo: 'Fixação biológica de nitrogênio, descompactação biológica de subsolo e ciclagem de nutrientes',
    autoria: 'Calegari, A.; Santos, H.P.; Franchini, J.C.',
    instituicao: 'Instituto de Desenvolvimento Rural do Paraná (IDR-Paraná) / Embrapa Soja',
    ano: 2019,
    referenciaAbnt: 'CALEGARI, A.; SANTOS, H. P.; FRANCHINI, J. C. Plantas de cobertura e rotação de culturas para a sustentabilidade da agricultura. Londrina: IAPAR, 2019. 142 p.',
    tags: ['plantas-de-cobertura', 'crotalaria', 'milheto', 'fbn', 'ciclagem-potassio', 'adubacao-verde'],
    resumo: 'Trabalho essencial sobre a utilização de espécies de cobertura solteiras e em coquetéis multiespécies (mix de coberturas). Detalha a produção de matéria seca (8 a 15 t/ha), a fixação biológica de nitrogênio por leguminosas (150 a 300 kg/ha de N) e a potente capacidade de reciclagem de potássio e fósforo das camadas profundas para a superfície.',
    diagnosticoCampo: 'Avaliação da espessura da camada de palhada superficial (mínimo de 6 t/ha de massa seca constante) e teste de infiltração de água com anel de penetração (anéis concêntricos) antes e após a rotação.',
    protocoloIntervencao: [
      { fase: 'Seleção do Mix', acao: 'Planejamento de coquetel com 3 a 5 espécies funcionais', detalhes: 'Combinar gramíneas (alta C/N e palha duradoura), leguminosas (fixação de N) e crucíferas (descompactação).' },
      { fase: 'Semeadura', acao: 'Implantação no início das chuvas ou pós-safra', detalhes: 'Garantir boa profundidade de deposição de sementes e população adequada (ex: 25 kg/ha de Crotalaria juncea + 12 kg/ha de Milheto).' },
      { fase: 'Manejo da Biomassa', acao: 'Rolamento com rolo-faca no estádio de floração plena', detalhes: 'Rolar antes da formação de sementes viáveis para maximizar o teor de nitrogênio e evitar que a planta se torne infestante.' }
    ],
    parametrosCriticos: [
      { parametro: 'Aporte de Massa Seca (Mix Completo)', unidade: 't/ha/ano', faixaCritica: '< 4,0 t/ha', faixaIdeal: '8,0 - 14,0 t/ha', interpretacao: 'Abaixo de 4 t/ha a palhada decompõe rapidamente e o solo fica exposto a gotas de chuva erosivas.' },
      { parametro: 'Fixação Biológica de Nitrogênio (Leguminosas)', unidade: 'kg N/ha', faixaCritica: '< 50 kg N/ha', faixaIdeal: '150 - 280 kg N/ha', interpretacao: 'Equivale a 300 a 600 kg/ha de ureia química mineral poupada no sistema produtivo.' },
      { parametro: 'Relação C/N da Palhada de Cobertura', unidade: 'adimensional', faixaCritica: '< 15 (degradação rápida)', faixaIdeal: '25 - 35 (equilibrada)', interpretacao: 'Relação equilibrada garante proteção do solo por até 120 dias sem imobilizar nitrogênio em excesso.' }
    ],
    pontosChave: [
      'A Crotalaria spectabilis, além de fixar N, produz alcaloides que funcionam como armadilha para nematoide-das-galhas (Meloidogyne) e nematoide-das-lesões (Pratylenchus).',
      'O Milheto BRS 1501 possui raízes que descem a mais de 2 metros de profundidade, reciclando potássio lixiviado de volta à camada superficial.',
      'O Nabo Forrageiro possui raiz tuberosa volumosa que atua como uma "escarificação biológica", abrindo canais verticais que facilitam a penetração de água.'
    ],
    insumosOuEspecies: ['Crotalaria ochroleuca', 'Crotalaria spectabilis', 'Pennisetum glaucum (Milheto)', 'Nabo Forrageiro (Raphanus sativus)', 'Mucuna-cinza'],
    relevanciaAgronomica: 'Diretriz técnica para a seleção de espécies na aba Plantas de Cobertura do GeaAgro.'
  },

  // 6. ENGENHARIA DE CONSERVAÇÃO DO SOLO & EROSÃO
  {
    id: 'lombardi_conservacao_erosao',
    categoria: 'Conservação & Erosão',
    titulo: 'Manejo e Conservação do Solo: Práticas Mecânicas e Terraceamento',
    subtitulo: 'Dimensionamento de terraços embutidos e em desnível pelas fórmulas de Bentley e Lombardi Neto',
    autoria: 'Lombardi Neto, F.; Bertolini, D.; Drugowich, M.I.; Bertoni, J.',
    instituicao: 'Instituto Agronômico de Campinas (IAC) / CATI-SP',
    ano: 2018,
    referenciaAbnt: 'LOMBARDI NETO, F.; BERTOLINI, D.; DRUGOWICH, M. I. Terraceamento agrícola. 3. ed. Campinas: Instituto Agronômico, 2018. 110 p. (Boletim Técnico IAC, 206).',
    tags: ['terraceamento', 'bentley', 'espacamento-vertical', 'erosao-hidrica', 'vocoroca', 'lombardi-neto'],
    resumo: 'Manual clássico de engenharia agronômica que fundamenta o dimensionamento de obras de terra para controle de erosão hídrica laminar, em sulcos e voçorocas. Fornece as equações empíricas calibradas para solos brasileiros para cálculo do Espaçamento Vertical (EV) e Espaçamento Horizontal (EH) entre canais de retenção e infiltração.',
    diagnosticoCampo: 'Levantamento topográfico da rampa (declividade em %, comprimento da rampa em metros), identificação da classe textural do solo, capacidade de infiltração e presença de sulcos incipientes de escoamento concentrado.',
    protocoloIntervencao: [
      { fase: 'Levantamento Topográfico', acao: 'Demarcação de curvas de nível com nível de mangueira ou GPS RTK', detalhes: 'Medir a declividade média da encosta e marcar os pontos de mesma cota altimétrica.' },
      { fase: 'Dimensionamento Matemático', acao: 'Aplicação da Fórmula de Bentley / Lombardi Neto', detalhes: 'EV (m) = [ (Declividade% / a) + b ] × FatorSolo × FatorUso.' },
      { fase: 'Construção Mecânica', acao: 'Passadas de terraceador de arrasto ou motoniveladora', detalhes: 'Conformar o canal com profundidade mínima de 0,40 a 0,60 m e camalhão compactado para suportar o volume pluviométrico crítico de projeto (tempo de retorno de 10 anos).' }
    ],
    parametrosCriticos: [
      { parametro: 'Espaçamento Vertical de Terraço (EV)', unidade: 'metros', faixaCritica: '> 3,5 m (em declive forte)', faixaIdeal: '1,2 - 2,5 m', interpretacao: 'Acima do limite a lâmina de enxurrada atinge velocidade erosiva (> 1 m/s) rompendo o dique inferior.' },
      { parametro: 'Declividade Limite para Terraceamento Convencional', unidade: '%', faixaCritica: '> 18%', faixaIdeal: '2 - 12%', interpretacao: 'Acima de 18% o terraceamento com trator de pneus torna-se perigoso e ineficiente, exigindo faixas de contenção florestadas.' },
      { parametro: 'Tempo de Retorno de Chuva de Projeto (Tr)', unidade: 'anos', faixaCritica: '< 5 anos', faixaIdeal: '10 anos (agrícola) / 25 anos (voçorocas)', interpretacao: 'Critério de segurança para calcular a seção transversal do canal do terraço.' }
    ],
    pontosChave: [
      'O terraço é uma prática mecânica paliativa de segurança; ele NUNCA substitui a cobertura vegetal contínua do solo.',
      'O rompimento de um terraço em crista causa um efeito dominó catastrófico na encosta, formando sulcos profundos e voçorocas em poucas horas de chuva torrencial.',
      'Em solos arenosos (como Neossolos Quartzarênicos), o terraço deve ser em desnível com canal escoadouro empalamado ou gramado, pois o terraço em nível rompe por liquefação do dique.'
    ],
    insumosOuEspecies: ['Gramas de contenção (Paspalum notatum / Grama-Batatais)', 'Bambu para paliçadas', 'Trator de esteira / Motoniveladora'],
    relevanciaAgronomica: 'Equações e parâmetros utilizados na aba Conservação de Solo & Terraços do GeaAgro Recupera.'
  },

  // 7. RECUPERAÇÃO AMBIENTAL, APP & RESERVA LEGAL
  {
    id: 'kageyama_restauracao_ecossistemas',
    categoria: 'Recuperação Ambiental & APP',
    titulo: 'Restauração Ecológica de Ecossistemas Tropicais: Grupos Sucessionais',
    subtitulo: 'Metodologia de modelos sucessionais de alta diversidade para recomposição de matas ciliares e áreas degradadas',
    autoria: 'Kageyama, P.Y.; Gandara, F.B.; Oliveira, R.E.',
    instituicao: 'Escola Superior de Agricultura "Luiz de Queiroz" (ESALQ / USP)',
    ano: 2017,
    referenciaAbnt: 'KAGEYAMA, P. Y.; GANDARA, F. B.; OLIVEIRA, R. E. Restauração de ecossistemas tropicais e recuperação de áreas degradadas. Piracicaba: ESALQ/USP, 2017. 185 p.',
    tags: ['restauracao-florestal', 'mata-ciliar', 'app', 'grupos-ecologicos', 'pioneiras', 'reserva-legal'],
    resumo: 'Marco teórico e prático da restauração ecológica no Brasil. Estabelece a segregação funcional das espécies arbóreas nativas em Grupos de Preenchimento (espécies Pioneiras e Secundárias Iniciais de crescimento rápido e copa ampla) e Grupos de Diversidade (espécies Secundárias Tardias e Clímax de madeira densa e vida longa). Demonstra que o equilíbrio 50/50 desses grupos garante o fechamento rápido da copa e a sustentabilidade ecológica da floresta por séculos.',
    diagnosticoCampo: 'Inspeção do entorno para verificar fontes de propágulos (fragmentos nativos a menos de 200 m), presença de regeneração natural espontânea no sub-bosque e identificação de fatores de degradação contínua (gado pisoteando, fogo periódico ou formigas saúvas).',
    protocoloIntervencao: [
      { fase: 'Isolamento Obrigatório', acao: 'Cercamento perimetral completo com 4 a 5 fios de arame liso', detalhes: 'Impedir qualquer entrada de animais domésticos; cercar nascentes com raio de 50 metros.' },
      { fase: 'Controle de Competição', acao: 'Combate a formigas cortadeiras e coroamento de 1 m de raio', detalhes: 'Eliminar ninhos de Atta sexdens (saúva-limão) antes do plantio e limpar a braquiária que asfixia as mudas.' },
      { fase: 'Plantio Técnico', acao: 'Plantio intercalado de Pioneiras e Não-Pioneiras em covas adubadas', detalhes: 'Adubar cada cova com 150-200 g de superfosfato simples + 2 kg de matéria orgânica; incluir 15% de margem para replantio.' }
    ],
    parametrosCriticos: [
      { parametro: 'Espaçamento Padrão de Plantio', unidade: 'm x m', faixaCritica: '> 4,0 x 4,0 m (demora a fechar copa)', faixaIdeal: '3,0 x 2,0 m (1.666 mudas/ha)', interpretacao: 'Espaçamentos mais adensados fecham a copa em 18 a 24 meses, sombreando e matando o capim invasor.' },
      { parametro: 'Proporção Ecológica de Preenchimento vs Diversidade', unidade: '%', faixaCritica: '< 30% de Pioneiras', faixaIdeal: '50% Pioneiras / 50% Não-Pioneiras', interpretacao: 'Pouca pioneira deixa as mudas tardias vulneráveis à queima solar direta.' },
      { parametro: 'Mortalidade Aceitável no 1º Ano', unidade: '%', faixaCritica: '> 25%', faixaIdeal: '< 10%', interpretacao: 'Acima de 25% de mortalidade o PRAD exige replantio obrigatório para não perder a licença ambiental.' }
    ],
    pontosChave: [
      'A regeneração natural assistida (RNA) custa até 70% menos do que o plantio em área total quando há remanescentes florestais próximos e banco de sementes viável.',
      'O coroamento mecânico ou químico das mudas deve ser mantido a cada 60 dias durante os primeiros dois anos até que a copa projete sombra suficiente.',
      'A inclusão de espécies leguminosas nativas fixadoras de N (como Inga, Schizolobium e Senna) acelera o enriquecimento nutricional do horizonte O do solo.'
    ],
    insumosOuEspecies: ['Schinus terebinthifolius (Aroeira-pimenteira)', 'Cecropia pachystachya (Embaúba)', 'Inga vera (Ingá)', 'Cedrela fissilis (Cedro-rosa)', 'Hymenaea courbaril (Jatobá)'],
    relevanciaAgronomica: 'Fundamenta o dimensionamento de mudas e espécies da aba APP & Reserva Legal do GeaAgro.'
  },

  // 8. SISTEMAS INTEGRADOS (ILPF)
  {
    id: 'balbino_ilpf_recuperacao',
    categoria: 'Sistemas Integrados (ILPF)',
    titulo: 'Integração Lavoura-Pecuária-Floresta (ILPF) como Estratégia de Recuperação de Solos',
    subtitulo: 'Sinergias agronômicas, viabilidade bioeconômica e sequestro de carbono em solos tropicais degradados',
    autoria: 'Balbino, L.C.; Bungenstab, E.J.; Vilela, L.; Kichel, A.N.',
    instituicao: 'Embrapa / Rede ILPF',
    ano: 2020,
    referenciaAbnt: 'BALBINO, L. C.; BUNGENSTAB, E. J.; VILELA, L.; KICHEL, A. N. Integração Lavoura-Pecuária-Floresta: alternativa para recuperação de pastagens degradadas e descarbonização da agropecuária. Brasília: Embrapa, 2020. 210 p.',
    tags: ['ilpf', 'ilp', 'agrofloresta', 'sequestro-carbono', 'recuperacao-economica', 'microclima'],
    resumo: 'Demonstra como a integração produtiva supera o principal obstáculo da recuperação de áreas degradadas: o alto investimento inicial de capital (CapEx). Ao introduzir lavoura de grãos (soja ou milho) nos primeiros 2 a 3 anos, o produtor amortiza os custos de calagem, gessagem e fosfatagem corretiva profunda, entregando no quarto ano uma pastagem de altíssima produtividade com árvores que promovem ambiência térmica e bem-estar animal.',
    diagnosticoCampo: 'Avaliação de aptidão edafoclimática da fazenda para mecanização de grãos (relevo < 12%, profundidade do solo > 80 cm) e logística de escoamento e insumos.',
    protocoloIntervencao: [
      { fase: 'Ano 1: Correção & Soja', acao: 'Correção profunda do perfil e cultivo de soja', detalhes: 'Aplicar calcário e gesso na dose plena; semear soja para pagar a correção e fixar nitrogênio no solo.' },
      { fase: 'Ano 2: Milho Safrinha + Braquiária', acao: 'Consórcio Sistema Santa Fé', detalhes: 'Semear milho consorciado com Urochloa ruziziensis. Colhe-se o milho e a braquiária forma pasto imediato para o outono/inverno.' },
      { fase: 'Ano 3 em diante: Pecuária Rotacionada', acao: 'Entrada do gado na pastagem revigorada', detalhes: 'Pastagem com alta capacidade de suporte (3 a 4 UA/ha no verão) com solo estruturado e corrigido.' }
    ],
    parametrosCriticos: [
      { parametro: 'Taxa de Retorno do Investimento (Payback)', unidade: 'anos', faixaCritica: '> 6 anos (reforma convencional)', faixaIdeal: '2 - 3 anos (com ILP/ILPF)', interpretacao: 'O grão paga o calcário e adubação residual aproveitada pela pastagem subsequente.' },
      { parametro: 'Estoque de Carbono Orgânico no Solo (0-30 cm)', unidade: 't C/ha', faixaCritica: '< 30 t C/ha', faixaIdeal: '> 65 t C/ha', interpretacao: 'Sistemas ILPF acumulam em média 1,5 a 2,8 t de C/ha/ano no perfil do solo via biomassa radicular contínua.' },
      { parametro: 'Conforto Térmico Animal (Índice THI)', unidade: 'adimensional', faixaCritica: '> 82 (estresse calórico severo)', faixaIdeal: '< 72 (sob renques de árvores)', interpretacao: 'A sombra das árvores em renques leste-oeste eleva a taxa de prenhez em até 15% e o ganho de peso diário.' }
    ],
    pontosChave: [
      'A rotação de gramíneas forrageiras de raiz agressiva com culturas graníferas interrompe o ciclo de pragas de solo e doenças fúngicas.',
      'O componente arbóreo (eucalipto, cedro australiano ou nativas) deve ser plantado no alinhamento Leste-Oeste em renques simples ou duplos para minimizar sombreamento excessivo na entrelinha agrícola.',
      'Áreas em ILPF apresentam infiltração de água 3 a 5 vezes superior a pastagens em degradação contínua.'
    ],
    insumosOuEspecies: ['Eucalyptus urograndis', 'Soja BRS', 'Milho Híbrido', 'Urochloa brizantha cv. BRS Paiaguás', 'Urochloa ruziziensis'],
    relevanciaAgronomica: 'Modelo econômico prioritário para recuperação sustentável de grandes glebas rurais.'
  },

  // 9. LEGISLAÇÃO & NORMAS OFICIAIS (PRAD)
  {
    id: 'conama_429_codigo_florestal',
    categoria: 'Legislação & Normas',
    titulo: 'Regulamentação e Metodologias Oficiais para PRAD: Lei 12.651 e Resolução CONAMA 429',
    subtitulo: 'Diretrizes jurídicas, faixas de proteção de APP e métodos válidos para aprovação de planos de recuperação junto a órgãos ambientais',
    autoria: 'Conselho Nacional do Meio Ambiente (CONAMA) / Presidência da República',
    instituicao: 'Ministério do Meio Ambiente (MMA) / IBAMA',
    ano: 2012,
    referenciaAbnt: 'BRASIL. Lei nº 12.651, de 25 de maio de 2012. Dispõe sobre a proteção da vegetação nativa; altera as Leis nºs 6.938/1981, 9.393/1996 e 11.428/2006; revoga as Leis nºs 4.771/1965 e 7.754/1989. Diário Oficial da União, Brasília, DF, 28 maio 2012.',
    tags: ['codigo-florestal', 'conama-429', 'prad', 'app-largura', 'termo-de-compromisso', 'reserva-legal'],
    resumo: 'Compilação sistemática dos critérios legais e metodológicos exigidos para a aprovação e fiscalização de Planos de Recuperação de Áreas Degradadas ou Alteradas (PRAD). Define as três metodologias reconhecidas oficialmente pela Resolução CONAMA 429/2011: I) Condução da regeneração natural de espécies nativas; II) Plantio de espécies nativas; III) Plantio de espécies nativas conjugado com a condução da regeneração natural.',
    diagnosticoCampo: 'Enquadramento da propriedade quanto ao Módulo Fiscal regional (pequena propriedade vs. grande propriedade), medição da largura do curso d\'água (calha regular) e raio de nascentes (50 m) para definir a faixa exata de APP conforme os artigos 4º e 61-A do Código Florestal.',
    protocoloIntervencao: [
      { fase: 'Elaboração do PRAD', acao: 'Protocolo de projeto assinado por RT habilitado com ART/CREA', detalhes: 'Mapeamento vetorial do imóvel, caracterização de solo, cronograma de operações e plano de monitoramento semestral.' },
      { fase: 'Execução e Isolamento', acao: 'Isolamento de fatores de perturbação e implantação', detalhes: 'Assinatura do Termo de Compromisso Ambiental (TCA) e implantação das ações em até 180 dias após aprovação.' },
      { fase: 'Monitoramento Oficial', acao: 'Emissão de Relatórios Periódicos de Cumprimento de Metas', detalhes: 'Envio de relatórios fotográficos com coordenadas georreferenciadas a cada 12 meses até a consolidação ecológica (3 a 5 anos).' }
    ],
    parametrosCriticos: [
      { parametro: 'APP de Cursos d\'Água até 10 metros de largura', unidade: 'metros', faixaCritica: '< 30 m (Regra Geral)', faixaIdeal: '30 metros de cada margem', interpretacao: 'Largura mínima obrigatória de recomposição da vegetação ciliar para propriedades comuns.' },
      { parametro: 'APP no Raio de Nascentes e Olhos d\'Água Perenes', unidade: 'metros', faixaCritica: '< 50 m', faixaIdeal: 'Raio de 50 metros', interpretacao: 'Área intocável de proteção hidrológica obrigatória com cerca de contenção.' },
      { parametro: 'Reserva Legal (Bioma Cerrado na Amazônia Legal)', unidade: '% da propriedade', faixaCritica: '< 35%', faixaIdeal: '35%', interpretacao: 'Percentual legal de vegetação nativa obrigatória que não pode ser desmatada.' }
    ],
    pontosChave: [
      'A emissão do PRAD exige obrigatoriamente a Anotação de Responsabilidade Técnica (ART) do Engenheiro Agrônomo ou Engenheiro Florestal habilitado.',
      'O não cumprimento do cronograma aprovado no PRAD sujeita o proprietário a multas diárias e execução de termos de ajustamento de conduta (TAC) do Ministério Público.',
      'O Cadastro Ambiental Rural (CAR) ativo e validado é o documento base para qualquer regularização ambiental perante os órgãos estaduais.'
    ],
    insumosOuEspecies: ['Cercas de Arame Liso', 'Placas de Sinalização de Área em Recuperação', 'Mudas Nativas com Registro RENASEM'],
    relevanciaAgronomica: 'Diretriz jurídica para os 13 relatórios oficiais em PDF gerados pelo GeaAgro Recupera.'
  }
];

export const RecuperaBibliotecaView: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [artigoSelecionado, setArtigoSelecionado] = useState<ArtigoTecnico | null>(null);
  const [abaExibicao, setAbaExibicao] = useState<'compendio' | 'parametros' | 'normas'>('compendio');

  const categorias = useMemo(() => [
    'todas',
    'Física do Solo & Compactação',
    'Química & Fertilidade',
    'Biologia & BioAS',
    'Pastagens Degradadas',
    'Plantas de Cobertura',
    'Conservação & Erosão',
    'Recuperação Ambiental & APP',
    'Sistemas Integrados (ILPF)',
    'Legislação & Normas'
  ], []);

  const artigosFiltrados = useMemo(() => {
    return ARTIGOS_COMPENDIO.filter(a => {
      const termo = busca.toLowerCase();
      const matchBusca =
        a.titulo.toLowerCase().includes(termo) ||
        (a.subtitulo && a.subtitulo.toLowerCase().includes(termo)) ||
        a.autoria.toLowerCase().includes(termo) ||
        a.instituicao.toLowerCase().includes(termo) ||
        a.resumo.toLowerCase().includes(termo) ||
        a.tags.some(t => t.toLowerCase().includes(termo)) ||
        a.pontosChave.some(p => p.toLowerCase().includes(termo));

      const matchCat = categoriaAtiva === 'todas' || a.categoria === categoriaAtiva;
      return matchBusca && matchCat;
    });
  }, [busca, categoriaAtiva]);

  // Lista consolidada de todos os parâmetros críticos para o Guia Rápido
  const todosParametros = useMemo(() => {
    return ARTIGOS_COMPENDIO.flatMap(a =>
      a.parametrosCriticos.map(p => ({
        ...p,
        origemArtigo: a.titulo,
        categoria: a.categoria
      }))
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Compêndio Técnico de Recuperação de Áreas Degradadas
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Biblioteca Científica e Prática Agronômica Oficial</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Trabalhos de referência, normas ABNT/CONAMA, valores críticos de solo, parâmetros de dimensionamento e metodologias da Embrapa, IAC, ESALQ/USP, UFV e SBCS 100% disponíveis offline para atuação a campo.
          </p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por termo, autor, norma ou #tag..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Abas Superiores de Visualização */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setAbaExibicao('compendio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            abaExibicao === 'compendio'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artigos & Manuais Técnicos ({artigosFiltrados.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaExibicao('parametros')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            abaExibicao === 'parametros'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tabela Rápida de Parâmetros Críticos</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaExibicao('normas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            abaExibicao === 'normas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Legislação & Normas Regulamentadoras</span>
        </button>
      </div>

      {/* ABA 1: ARTIGOS & MANUAIS TÉCNICOS */}
      {abaExibicao === 'compendio' && (
        <div className="space-y-4">
          {/* Filtros de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {categorias.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  categoriaAtiva === cat
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                {cat === 'todas' ? 'Todas as Categorias' : cat}
              </button>
            ))}
          </div>

          {/* Grid de Artigos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artigosFiltrados.map(artigo => (
              <div
                key={artigo.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {artigo.categoria}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{artigo.ano}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {artigo.titulo}
                  </h3>

                  {artigo.subtitulo && (
                    <p className="text-[11px] text-slate-500 leading-snug mb-2 font-medium line-clamp-2">
                      {artigo.subtitulo}
                    </p>
                  )}

                  <p className="text-[10px] text-slate-400 font-medium mb-3">
                    {artigo.autoria} • {artigo.instituicao}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-4">
                    {artigo.resumo}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artigo.tags.slice(0, 4).map(t => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Destaque de Diretriz */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      💡 Ponto Chave Agronômico:
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {artigo.pontosChave[0]}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setArtigoSelecionado(artigo)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                >
                  <span>Abrir Ficha Técnica Completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {artigosFiltrados.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum artigo encontrado para o filtro aplicado
              </p>
              <p className="text-xs text-slate-400">
                Tente buscar por termos mais genéricos como "calcário", "voçoroca", "raiz" ou selecione "Todas as Categorias".
              </p>
              <button
                type="button"
                onClick={() => { setBusca(''); setCategoriaAtiva('todas'); }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Limpar Filtros de Busca
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: GUIA RÁPIDO DE PARÂMETROS CRÍTICOS */}
      {abaExibicao === 'parametros' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Gatilhos Críticos & Indicadores de Degradação (Diagnóstico de Campo)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabela de consulta rápida para agrônomos com valores de corte agronômico, unidades de medida e interpretação imediata.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Parâmetro Agronômico</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Unidade</th>
                  <th className="py-2.5 px-3 text-rose-600">Faixa Crítica (Degradação)</th>
                  <th className="py-2.5 px-3 text-emerald-600">Faixa Adequada / Alvo</th>
                  <th className="py-2.5 px-3">Interpretação e Ação Técnica Requerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todosParametros.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {p.parametro}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {p.unidade}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                      {p.faixaCritica}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {p.faixaIdeal}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {p.interpretacao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: LEGISLAÇÃO & NORMAS REGULAMENTADORAS */}
      {abaExibicao === 'normas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lei Federal nº 12.651/2012 (Novo Código Florestal)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Define os limites obrigatórios de Áreas de Preservação Permanente (APP) ao longo de cursos d'água, nascentes e topos de morro, além dos percentuais exigidos para Reserva Legal em cada bioma brasileiro (Amazônia Legal: 80% floresta, 35% cerrado; Demais regiões: 20%).
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1 text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">Faixas de APP por Largura do Rio:</p>
              <p>• Até 10 m de largura: 30 metros de proteção em cada margem.</p>
              <p>• De 10 a 50 m de largura: 50 metros de proteção em cada margem.</p>
              <p>• Nascentes e olhos d'água perenes: Raio fixo de 50 metros.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Resolução CONAMA nº 429/2011 (Metodologias de PRAD)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Estabelece a metodologia legal para recuperação de Áreas de Preservação Permanente degradadas. Reconhece três caminhos técnicos oficiais:
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Regeneração Natural Conduzida (RNA):</strong> Isolamento do fator de degradação e manejo do banco de sementes.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Plantio de Espécies Nativas:</strong> Introdução de mudas ou sementes com equilíbrio ecológico (50/50).</span>
              </p>
              <p className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sistema Conjugado:</strong> Enriquecimento de áreas em regeneração com espécies clímax de alto valor ecológico.</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Norma ABNT NBR 10703: Degradação do Solo — Terminologia
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Padroniza os conceitos técnicos de erosão laminar, sulcos, voçorocas, compactação, salinização e acidificação, unificando a linguagem dos laudos periciais e agronômicos junto ao Poder Judiciário e órgãos ambientais estaduais (SEMA/CETESB/IAP/INEA).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Legislação de Sementes e Mudas (Lei Federal nº 10.711/2003)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Exige que sementes de forrageiras e plantas de cobertura comercializadas no Brasil possuam certificado oficial do MAPA com declaração expressa de pureza (P%) e germinação (G%), compondo o Valor Cultural (VC% = (P × G) / 100). Mudas florestais nativas devem ser originárias de viveiros credenciados no RENASEM.
            </p>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DA FICHA TÉCNICA DO ARTIGO */}
      {artigoSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {artigoSelecionado.categoria}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {artigoSelecionado.titulo}
                </h2>
                {artigoSelecionado.subtitulo && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {artigoSelecionado.subtitulo}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  {artigoSelecionado.autoria} • {artigoSelecionado.instituicao} ({artigoSelecionado.ano})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setArtigoSelecionado(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo Científico Expandido */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Resumo Técnico & Fundamentação</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {artigoSelecionado.resumo}
              </p>
            </div>

            {/* Diagnóstico de Campo */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-emerald-600" />
                <span>Como Diagnosticar a Campo (Sintomas & Sinais)</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                {artigoSelecionado.diagnosticoCampo}
              </p>
            </div>

            {/* Protocolo de Intervenção Passo a Passo */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Protocolo de Intervenção Agronômica Sequenciada</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {artigoSelecionado.protocoloIntervencao.map((etapa, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        {etapa.fase}: {etapa.acao}
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        {etapa.detalhes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabela de Parâmetros Críticos do Artigo */}
            {artigoSelecionado.parametrosCriticos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Valores Críticos de Referência</span>
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2 px-3">Parâmetro</th>
                        <th className="py-2 px-3">Unidade</th>
                        <th className="py-2 px-3 text-rose-600">Faixa Crítica</th>
                        <th className="py-2 px-3 text-emerald-600">Faixa Ideal</th>
                        <th className="py-2 px-3">Interpretação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {artigoSelecionado.parametrosCriticos.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{p.parametro}</td>
                          <td className="py-2 px-3 font-mono">{p.unidade}</td>
                          <td className="py-2 px-3 font-bold text-rose-600">{p.faixaCritica}</td>
                          <td className="py-2 px-3 font-bold text-emerald-600">{p.faixaIdeal}</td>
                          <td className="py-2 px-3 text-slate-500">{p.interpretacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insumos e Espécies Chave */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Espécies / Insumos Recomendados:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {artigoSelecionado.insumosOuEspecies.map((ins, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]"
                  >
                    ✓ {ins}
                  </span>
                ))}
              </div>
            </div>

            {/* Referência Bibliográfica ABNT Oficial */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                Citação ABNT NBR 6023 (Para inclusão em Laudos e PRADs):
              </span>
              <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 select-all leading-relaxed">
                {artigoSelecionado.referenciaAbnt}
              </p>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setArtigoSelecionado(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition"
              >
                Fechar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
