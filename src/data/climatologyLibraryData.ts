export interface ClimatologyTopic {
  id: string;
  title: string;
  shortDesc: string;
  category:
    | 'Agrometeorologia Prática'
    | 'Proteção Vegetal & Deriva'
    | 'Manejo Hídrico & Irrigação'
    | 'Climatologia Regional & El Niño'
    | 'Fisiologia & Graus-Dia'
    | 'Sensoramento & Micrometeorologia';
  readTime: string;
  iconName: string;
  tags: string[];
  summaryBulletPoints: string[];
  technicalConcept: string;
  physiologicalImpacts: string;
  formulasAndThresholds?: {
    name: string;
    formula?: string;
    explanation: string;
  }[];
  practicalManagement: string[];
  fieldChecklist: string[];
  faq: {
    question: string;
    answer: string;
  }[];
}

export const CLIMATOLOGY_LIBRARY_TOPICS: ClimatologyTopic[] = [
  {
    id: 'geadas-radiacao-adveccao',
    title: 'Geadas: Radiação vs. Advecção e Mitigação Agronômica',
    category: 'Agrometeorologia Prática',
    readTime: '7 min de leitura',
    iconName: 'Snowflake',
    tags: ['Geadas', 'Inversão Térmica', 'Café', 'Milho Safrinha', 'Mitigação'],
    shortDesc: 'Diferenças fisiológicas entre geada branca e negra, inversão térmica em baixadas e medidas de mitigação ativa e passiva no campo.',
    summaryBulletPoints: [
      'Geada Radiativa ocorre em noites de céu límpido, ar calmo e inversão térmica rente ao solo.',
      'Geada Advectiva é causada pelo deslocamento de ventos polares gelados, afetando topos e encostas.',
      'Geada Negra congela a seiva internamente sem formação visível de gelo externo, matando os tecidos foliares.',
      'Irrigação contínua por aspersão liberta calor latente (80 cal/g) protegendo a cultura durante o congelamento.',
    ],
    technicalConcept: `A geada é um fenômeno agrometeorológico caracterizado pelo congelamento dos tecidos vegetais ou deposição de gelo em superfícies expostas quando a temperatura da relva cai abaixo de 0°C.

Existem dois tipos fundamentais quanto ao mecanismo meteorológico:
1. Geada de Radiação: Ocorre em noites com céu sem nuvens, vento muito fraco ou calmaria (massa de ar estável). O solo perde calor rapidamente por emissão de radiação infravermelha para o espaço, resfriando a camada de ar imediatamente acima. Ocorre forte inversão térmica nas primeiras camadas da atmosfera.
2. Geada de Advecção (ou Canela de Geada): Ocorre pela invasão de massas de ar de origem polar extremamente frias e ventosas. Afeta encostas e topos de morro sem necessidade de inversão térmica, sendo devastadora e difícil de controlar por métodos tradicionais.

Quanto ao aspecto visual e fisiológico:
- Geada Branca: Ocorre quando a umidade relativa do ar é alta e o ponto de orvalho é inferior a 0°C. O vapor de água sublima diretamente na superfície das folhas em forma de cristais de gelo brancos.
- Geada Negra: Ocorre quando o ar está extremamente seco e a temperatura celular despenca abaixo do ponto de congelamento da seiva antes que o orvalho se forme. O congelamento intracelular rompe membranas e necrosa a folha rapidamente, deixando o dossel escurecido sem cristais visíveis.`,
    physiologicalImpacts: `O congelamento causa dois danos principais nas plantas:
1. Cristalização Intracelular: Cristais de gelo pontiagudos perfuram a membrana plasmática e a parede celular. Ao degelar pela manhã, o conteúdo celular vaza e o tecido morre por necrose instantânea.
2. Desidratação Celular Severa: A água pura congela primeiro no espaço extracelular. Isso cria um gradiente osmótico que "suga" a água do interior da célula para o exterior, levando à plasmólise irreversível.`,
    formulasAndThresholds: [
      {
        name: 'Estimativa da Temperatura da Relva',
        formula: 'T_relva ≈ T_abrigo - (2.0 a 3.5 °C)',
        explanation: 'A temperatura medida no abrigo meteorológico a 2 metros de altura costuma ser de 2°C a 3.5°C mais quente do que a folha/relva em noites de geada radiativa.',
      },
      {
        name: 'Calor Latente de Fusão da Água',
        formula: 'Q = 80 cal/g (334 kJ/kg)',
        explanation: 'Cada grama de água que se transforma em gelo sobre a folha libera 80 calorias de calor, mantendo a temperatura do tecido vegetal cravada em 0°C.',
      },
    ],
    practicalManagement: [
      'Medidas Passivas (Planejamento): Plantar culturas sensíveis (como Café, Citros e Frutíferas) no terço médio de encostas, evitando fundos de vale ("baixadas de geada").',
      'Manejo do Solo: Manter o solo limpo de ervas daninhas, adensado e umedecido antes da frente fria. Solos molhados e limpos armazenam até 3x mais calor durante o dia para emitir à noite.',
      'Medidas Ativas (Em Emergência): Irrigação por aspersão supra-dossel contínua com taxa mínima de 3.0 a 5.0 mm/h. A irrigação NUNCA deve ser desligada antes do sol nascer e o gelo derreter completamente.',
      'Uso de Queimadores e Torres de Vento: Torres de ventilação misturam o ar quente da camada de inversão (15m acima) com o ar frio rente ao solo.',
    ],
    fieldChecklist: [
      'Verificar previsão do tempo de 3 dias para massa polar antecedente.',
      'Checar bombas e aspersores de irrigação de emergência 24h antes.',
      'Medir umidade do solo: se estiver seco, realizar irrigação preventiva de recarga no dia anterior.',
      'Desmisturar palhada acumulada excessiva rente ao tronco de mudas jovens de café para permitir aquecimento do solo.',
    ],
    faq: [
      {
        question: 'Posso desligar a irrigação assim que a temperatura começar a subir ao amanhecer?',
        answer: 'Jamais! Se desligar a água enquanto ainda houver congelamento na folha, a evaporação rápida resfria o tecido vegetal ainda mais por perda evaporativa, causando destruição total.',
      },
      {
        question: 'Por que a palhada alta do Plantio Direto pode aumentar o risco de geada radiativa leve?',
        answer: 'A palhada atua como isolante térmico. Ela impede que a radiação solar diurna aqueça o solo mineral abaixo. À noite, há menos calor acumulado no solo para irradiar para a cultura.',
      },
    ],
  },
  {
    id: 'tecnologia-aplicacao-deriva',
    title: 'Tecnologia de Aplicação, Microclima e Deriva Meteorológica',
    category: 'Proteção Vegetal & Deriva',
    readTime: '6 min de leitura',
    iconName: 'Wind',
    tags: ['Deriva', 'Pulverização', 'Gotas', 'Vento', 'Delta T'],
    shortDesc: 'Aprenda como temperatura, umidade relativa, velocidade do vento e Delta T afetam a deposição e evaporação de defensivos na lavoura.',
    summaryBulletPoints: [
      'A janela meteorológica ideal exige Vento entre 3 e 10 km/h, UR > 55% e Temperatura < 30°C.',
      'Vento zero (calmaria absoluta) sinaliza Inversão Térmica: gotas finas ficam suspensas e derivam sem deposição.',
      'O indicador Delta T (ΔT) deve ser mantido entre 2°C e 8°C para evitar evaporação rápida de gotas.',
      'Bicos com indução de ar produzem gotas grossas imunes a ventos moderados e baixa umidade.',
    ],
    technicalConcept: `A tecnologia de aplicação de defensivos agrícolas depende criticamente das condições microclimáticas no momento da pulverização. Mais de 40% das perdas de produto em aplicações terrestres e aéreas ocorrem por fatores meteorológicos desfavoráveis:

1. Deriva Exógena (Vento): O vento sopra as gotas para fora do alvo desejado, podendo atingir lavouras vizinhas, cursos d'água ou áreas de preservação.
2. Evaporação de Gotas (Temperatura e Baixa Umidade): Gotas finas (< 150 micras) evaporam completamente no ar em menos de 3 segundos em ambientes de ar seco (UR < 50% e T > 30°C), reduzindo a quantidade de ingrediente ativo que atinge o alvo.
3. Inversão Térmica (Calmaria Abstrata, Vento < 2 km/h): As gotas ficam flutuando em uma camada de ar estagnada e não depositam nas folhas. Quando o vento retorna, a nuvem concentrada é arrastada em bloco.`,
    physiologicalImpacts: `Gotas evaporadas reduzem dramaticamente a absorção sistêmica de fungicidas e inseticidas, além de causar queima por fitotoxicidade concentrada (cristalização do produto na superfície foliar).`,
    formulasAndThresholds: [
      {
        name: 'Cálculo de Delta T (ΔT)',
        formula: 'ΔT = T_bulbo_seco - T_bulbo_umido',
        explanation: 'Delta T relaciona a temperatura do ar com o resfriamento evaporativo. ΔT entre 2 e 8 °C representa a janela perfeita de pulverização.',
      },
      {
        name: 'Limites Meteorológicos de Campo',
        explanation: 'Temperatura < 30°C | Umidade Relativa > 55% | Vento entre 3.0 km/h e 10.0 km/h.',
      },
    ],
    practicalManagement: [
      'Seleção de Pontas (Bicos): Utilizar bicos com indução de ar (gotas extremamente grossas / ultra grossas) para aplicações com ventos de até 12 km/h ou sob baixa umidade.',
      'Ajuste de Altura da Barra: Manter a barra a 50 cm acima do topo do dossel para evitar a dissipação pelo vento.',
      'Uso de Adjuvantes antideriva e umectantes: Adjuvantes oleosos (óleos minerais ou vegetais) reduzem a taxa de evaporação da gota de água.',
      'Horários de Aplicação: Priorizar horários de início da manhã (após a saída do orvalho pesado) ou final da tarde e noite.',
    ],
    fieldChecklist: [
      'Medir T, UR e Vento com anemômetro termo-higrômetro de bolso na altura da barra antes de abastecer.',
      'Verificar a presença de névoa flutuante (indicativo de inversão térmica).',
      'Ajustar pressão do circuito para manter o diâmetro mediano volumétrico (DMV) adequado.',
      'Consultar o módulo de Janela Operacional da GeaAgro antes de iniciar o talhão.',
    ],
    faq: [
      {
        question: 'Posso aplicar defensivos à noite se a temperatura estiver amena?',
        answer: 'Sim, desde que a umidade não esteja em 100% com orvalho escorrendo (que lavaria o produto) e que não haja inversão térmica severa.',
      },
      {
        question: 'Por que pulverizar com vento 0 km/h é perigoso?',
        answer: 'Vento zero indica estabilidade atmosférica e ausência de turbulência vertical. Sem turbulência para empurrar as gotas para baixo, o produto fica suspenso e flutua sem atingir o alvo.',
      },
    ],
  },
  {
    id: 'dpv-deficite-pressao-vapor',
    title: 'Déficit de Pressão de Vapor (DPV) & Abertura Estomática',
    category: 'Fisiologia & Graus-Dia',
    readTime: '8 min de leitura',
    iconName: 'Droplets',
    tags: ['DPV', 'Estômatos', 'Transpiração', 'Estresse Hídrico', 'Fisiologia'],
    shortDesc: 'Aprenda como o DPV mede a demanda evaporativa do ar e influencia diretamente a fotossíntese e absorção de nutrientes.',
    summaryBulletPoints: [
      'O DPV mede a força que a atmosfera exerce para extrair água das folhas das plantas.',
      'DPV Alto (> 1.8 kPa): A planta fecha os estômatos, para de fazer fotossíntese e trava o crescimento.',
      'DPV Baixo (< 0.4 kPa): A transpiração para, impedindo o transporte de Cálcio e Boro via xilema.',
      'A faixa ideal universal para vegetação e culturas agrícolas fica entre 0.8 e 1.2 kPa.',
    ],
    technicalConcept: `O Déficit de Pressão de Vapor (DPV ou VPD em inglês) é o indicador meteorológico definitivo para estimar o estresse hídrico atmosférico sentido pela planta. Diferente da umidade relativa isolada, o DPV combina a Temperatura do Ar com a Umidade Relativa.

Ele é calculado como a diferença entre a Pressão de Vapor de Saturação (e_s) — a quantidade máxima de vapor que o ar consegue reter em determinada temperatura — e a Pressão Real de Vapor (e_a).

Valores de DPV e suas respostas biológicas:
- DPV < 0.4 kPa (Ar Muito Úmido / Quase Saturado): O ar está tão cheio de umidade que a água não evapora dos estômatos. A transpiração cessa. A planta para de puxar água e nutrientes do solo.
- DPV entre 0.8 e 1.2 kPa (Faixa Ótima Agronômica): A taxa transpiratória é máxima e equilibrada. Os estômatos permanecem totalmente abertos, absorvendo CO2 e mantendo alta taxa fotossintética.
- DPV > 1.8 kPa (Ar Extremamente Seco / Seca Atmosférica): O ar "suga" água das folhas mais rápido do que as raízes conseguem absorver. Para evitar a morte por cavitação nos vasos do xilema, a planta fecha os estômatos (fechamento estomático induzido pelo hormônio ABA). O crescimento e enchimento de grãos travam.`,
    physiologicalImpacts: `Quando o DPV permanece acima de 2.0 kPa durante o meio do dia, ocorre o estresse fotoinibitório. A energia solar continua atingindo as folhas, mas sem CO2 entrando (estômatos fechados), a planta acumula radicais livres reativos de oxigênio (ROS), causando destruição dos cloroplastos e amarelecimento precoce.`,
    formulasAndThresholds: [
      {
        name: 'Equação de Tetens para e_s(T)',
        formula: 'e_s(T) = 0.61078 × exp((17.27 × T) / (T + 237.3))',
        explanation: 'Fornece a pressão de vapor de saturação em kPa para uma determinada temperatura T em °C.',
      },
      {
        name: 'Cálculo do DPV Real',
        formula: 'DPV = e_s × (1 - (UR / 100))',
        explanation: 'Onde UR é a Umidade Relativa em porcentagem (%).',
      },
    ],
    practicalManagement: [
      'Uso na Irrigação: Em momentos de DPV alto (> 1.6 kPa), pulsos curtos de microaspersão em cultivos protegidos ou folhosas resfriam o ar e elevam a umidade, reduzindo o DPV para a faixa ótima.',
      'Momentos de Adubação Foliar: Aplicar fertilizantes foliares apenas quando o DPV estiver abaixo de 1.2 kPa, garantindo estômatos abertos e cutícula foliar hidratada para máxima absorção.',
    ],
    fieldChecklist: [
      'Monitorar o gráfico de DPV no painel da GeaAgro.',
      'Identificar horários do dia com DPV > 1.5 kPa para pausar aplicações de bioinsumos suscetíveis ao dessecação.',
      'Em estufas, acionar nebulizadores quando o DPV ultrapassar 1.3 kPa.',
    ],
    faq: [
      {
        question: 'Qual a diferença entre Umidade Relativa e DPV?',
        answer: 'A Umidade Relativa depende fortemente da temperatura do ar. 60% de UR a 18°C resulta em um DPV confortável (0.8 kPa), enquanto 60% de UR a 35°C resulta em um DPV muito alto e estressante (2.2 kPa).',
      },
    ],
  },
  {
    id: 'fao-penman-monteith-et0',
    title: 'Método FAO Penman-Monteith (ET₀ e ETc) para Irrigação',
    category: 'Manejo Hídrico & Irrigação',
    readTime: '9 min de leitura',
    iconName: 'Gauge',
    tags: ['ET0', 'ETc', 'FAO 56', 'Penman-Monteith', 'Irrigação', 'Balanço Hídrico'],
    shortDesc: 'O padrão global para cálculo de evapotranspiração e manejo de lâminas de irrigação em pivô e gotejamento.',
    summaryBulletPoints: [
      'ET₀ representa o consumo de água por uma cultura de referência (grama de 12cm bem irrigada).',
      'ETc = ET₀ × Kc calcula a água consumida exatamente pela sua cultura em seu estágio atual.',
      'Considera saldo de radiação solar, velocidade do vento a 2m, temperatura e umidade relativa.',
      'Permite aplicar lâminas precisas evitando desperdício de energia, lixiviação e déficit hídrico.',
    ],
    technicalConcept: `O boletim FAO 56 estabeleceu a equação de Penman-Monteith como o único método físico padrão para determinação da Evapotranspiração de Referência (ET₀). A ET₀ quantifica a perda de água por evaporação direta do solo combinada com a transpiração vegetal.

A equação fundamenta-se nos princípios da conservação de energia e do transporte de massa aerodinâmico:
- Saldo de Radiação na Superfície (Rn): Energia solar direta e difusa convertida em energia térmica na superfície do solo e plantas.
- Fluxo de Calor no Solo (G): Energia absorvida ou liberada pelo solo.
- Déficit de Saturação do Ar (es - ea): Capacidade de retenção de vapor do ar ao redor das folhas.
- Velocidade do Vento a 2 metros (u2): Turbulência aerodinâmica responsável por renovar o ar úmido do dossel por ar seco.

A partir da ET₀ diária calculada pela estação meteorológica IoT, obtém-se a Evapotranspiração da Cultura (ETc):
ETc = ET₀ × Kc
Onde Kc é o Coeficiente da Cultura, que varia de acordo com o estágio fenológico (emitição de folhas, florescimento, maturação).`,
    physiologicalImpacts: `Irrigar abaixo da ETc provoca déficit hídrico, reduzindo a expansão celular e a produtividade final. Irrigar em excesso (acima da ETc) satura o solo de água, expulsando o oxigênio dos poros (hipoxia radicular), favorecendo podridões de raiz e lixiviando Nitrogênio e Potássio para o lençol freático.`,
    formulasAndThresholds: [
      {
        name: 'Equação Completa FAO Penman-Monteith',
        formula: 'ET₀ = [0.408 × Δ × (Rn - G) + γ × (900 / (T + 273)) × u2 × (es - ea)] / [Δ + γ × (1 + 0.34 × u2)]',
        explanation: 'Δ: inclinação da curva de pressão de vapor | γ: constante psicrométrica | T: temperatura média a 2m | u2: vento a 2m.',
      },
      {
        name: 'Evapotranspiração da Cultura e Eficiência',
        formula: 'Lâmina_Bruta = (ET₀ × Kc) / Eficiência_Sistema',
        explanation: 'Exemplo: Pivô Central com 88% de eficiência (0.88). Se ETc = 5.0 mm, Lâmina Bruta a aplicar = 5.0 / 0.88 = 5.68 mm.',
      },
    ],
    practicalManagement: [
      'Acompanhar a ET₀ diária acumulada emitida no painel da GeaAgro.',
      'Ajustar a tabela de Kc quinzenalmente conforme o desenvolvimento do índice de área foliar (IAF).',
      'Descontar precipitações efetivas medidas pelo pluviômetro IoT no cálculo do turno de rega.',
    ],
    fieldChecklist: [
      'Conferir se o anemômetro da estação está limpo e girando livremente a 2 metros do solo.',
      'Aferir a pluviometria real no talhão após eventos de chuva.',
      'Atualizar a fase fenológica da cultura no sistema para ajustar o Kc.',
    ],
    faq: [
      {
        question: 'O que é o Kc ajustado para estresse hídrico (Ks)?',
        answer: 'Quando a umidade do solo cai abaixo da Água Criticamente Disponível, adiciona-se o fator de estresse Ks (< 1.0), reduzindo a ETc real pois a planta já fechou parte dos estômatos.',
      },
    ],
  },
  {
    id: 'graus-dia-acumulados-gdd',
    title: 'Graus-Dia Acumulados (GDD) e Modelagem Fenológica',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'Sun',
    tags: ['GDD', 'Graus-Dia', 'Fenologia', 'Milho', 'Soja', 'Colheita'],
    shortDesc: 'Aprenda a prever datas de florescimento, maturação fisiológica e colheita acumulando energia térmica real.',
    summaryBulletPoints: [
      'Plantas desenvolvem-se com base no calor acumulado (unidades térmicas), não em dias de calendário.',
      'Cada cultura possui uma Temperatura Base Mínima (Tb) abaixo da qual o desenvolvimento cessa.',
      'GDD permite comparar safras de anos diferentes e programar a colheita com precisão industrial.',
      'Ajuda no escalonamento de plantio para evitar picos simultâneos de colheita ou secagem.',
    ],
    technicalConcept: `As plantas são organismos ectotérmicos: a velocidade de suas reações bioquímicas, divisão celular e avanço nos estágios fenológicos é regida pela temperatura do ambiente. A contagem de tempo por "dias corridos de calendário" é falha, pois 30 dias em um mês quente acumulam muito mais energia metabólica do que 30 dias em um mês frio.

O conceito de Graus-Dia Acumulados (GDD - Growing Degree Days) quantifica a soma de energia térmica diária efetiva acumulada acima da Temperatura Base Mínima (Tb) da cultura.

Temperaturas Base Mínimas (Tb) Típicas:
- Milho e Sorgo: Tb = 10.0 °C
- Soja e Feijão: Tb = 10.0 °C
- Trigo e Aveia: Tb = 4.0 °C
- Caña-de-Açúcar e Algodão: Tb = 12.0 a 15.0 °C
- Bananeira e Citros: Tb = 13.0 °C`,
    physiologicalImpacts: `O acúmulo de calor determina a síntese hormonal para transição do estado vegetativo (V) para o reprodutivo (R). Se ocorrerem dias com frio excessivo (< Tb), o relógio fenológico da cultura "pausa" temporariamente sem avançar na fase.`,
    formulasAndThresholds: [
      {
        name: 'Fórmula Padrão de GDD Diário',
        formula: 'GDD = [(T_max + T_min) / 2] - Tb',
        explanation: 'Regra de corte: Se T_min < Tb, considera-se T_min = Tb. Se T_max > TB (Limite Superior), considera-se T_max = TB.',
      },
      {
        name: 'Soma Térmica Acumulada',
        formula: 'GDD_total = Σ GDD_diario (da emergência até a maturação)',
        explanation: 'Exemplo: Um híbrido de milho de 1.400 GDD exige que a soma diária alcance 1.400 unidades térmicas para atingir a maturação R6.',
      },
    ],
    practicalManagement: [
      'Escalonamento de Semeadura: Espaçar o plantio de talhões com base em intervalos de GDD em vez de dias da semana para evitar gargalos na colheita e secagem.',
      'Modelagem de Pragas: O ciclo de insetos como a Lagarta-do-Cartucho (*Spodoptera frugiperda*) e Broca-da-Cana também é regido por GDD, permitindo prever o surgimento de lagartas recém-eclodidas com precisão.',
    ],
    fieldChecklist: [
      'Registrar a data exata de emergência (VE) da lavoura no aplicativo.',
      'Definir a Tb correta da cultivar/híbrido semeado.',
      'Acompanhar a curva de GDD acumulado no relatório agroclimático da GeaAgro.',
    ],
    faq: [
      {
        question: 'O que acontece se a temperatura máxima ultrapassar a Temperatura Limite Superior (TB)?',
        answer: 'Temperaturas acima do limite (ex: > 35°C para milho) causam estresse térmico em vez de acelerar o desenvolvimento, inibindo a atividade enzimática. Nesses casos, o cálculo ajusta a T_max para o limite máximo.',
      },
    ],
  },
  {
    id: 'el-nino-la-nina-enso',
    title: 'El Niño (ENSO), La Niña e Tendências Climáticas Globais',
    category: 'Climatologia Regional & El Niño',
    readTime: '8 min de leitura',
    iconName: 'CloudRain',
    tags: ['El Niño', 'La Niña', 'ENSO', 'Climatologia', 'Macroclima', 'Brasil'],
    shortDesc: 'Compreenda a dinâmica do Oceano Pacífico Equatorial e como ela afeta as chuvas na sua região.',
    summaryBulletPoints: [
      'El Niño aquece as águas do Pacífico Equatorial; La Niña resfria.',
      'No Sul do Brasil: El Niño traz chuvas abundantes e enchentes; La Niña gera secas históricas.',
      'No Norte e Nordeste: El Niño provoca secas e calor extremo; La Niña traz chuvas acima da média.',
      'No Centro-Oeste: El Niño desorganiza a regularidade do início das chuvas na safrinha.',
    ],
    technicalConcept: `O fenômeno El Niño-Oscilação do Sul (ENOS ou ENSO em inglês) é o mais influente motor climático interanual do planeta. Trata-se da alteração no acoplamento entre a temperatura da superfície do mar (TSM) no Oceano Pacífico Tropical Central e Oriental e a circulação atmosférica global (Célula de Walker).

Fases do ENOS:
1. El Niño (Fase Quente): Desaceleração ou inversão dos ventos Alísios. As águas quentes acumulam-se na costa da América do Sul. Altera a corrente de jato polar e subtropical, bloqueando frentes frias no Sul do Brasil e impedindo a formação do ZCAS (Zona de Convergência do Atlântico Sul) sobre o Nordeste.
2. La Niña (Fase Fria): Intensificação dos ventos Alísios. As águas superficiais do Pacífico ficam significativamente mais frias do que a média histórica. Fortalece as chuvas tropicais no Norte e bloqueia a passagem frequente de frentes frias produtivas na Região Sul.
3. Neutro: Condições oceanográficas dentro da média climatológica.`,
    physiologicalImpacts: `Anos de La Niña impõem estresse hídrico severo no momento do enchimento de grãos no Rio Grande do Sul e Paraná. Anos de El Niño podem causar excesso de chuvas na colheita no Sul, favorecendo o mofo-branco, germinação na espiga e perda de qualidade de grão/fibra.`,
    formulasAndThresholds: [
      {
        name: 'Índice do Niño Oceânico (ONI)',
        explanation: 'Média móvel de 3 meses das anomalias de TSM na região do Niño 3.4. ONI ≥ +0.5 °C indica El Niño. ONI ≤ -0.5 °C indica La Niña.',
      },
    ],
    practicalManagement: [
      'Ajuste de Época de Semeadura em Anos de La Niña no Sul: Antecipar o plantio do milho para aproveitar a umidade residual de inverno ou optar por híbridos de ciclo superprecoce e maior tolerância à seca.',
      'Ajuste em Anos de El Niño no Matopiba / Cerrado: Adequar a população de plantas por hectare para evitar concorrência por água caso ocorram veranicos e altas temperaturas na fase reprodutiva.',
    ],
    fieldChecklist: [
      'Verificar o boletim trimestral do ENOS emitido pela NOAA/CPTEC.',
      'Rever a estratégia de escolha de cultivares e ciclos de maturação com 6 meses de antecedência ao plantio.',
      'Adequar a capacidade de armazenamento e secagem de grãos em safras sob El Niño forte no Sul.',
    ],
    faq: [
      {
        question: 'O El Niño sempre afeta o Brasil da mesma maneira em todas as edições?',
        answer: 'Não obrigatoriamente. A intensidade do El Niño (Fraco, Moderado ou Forte) e o estado térmico do Oceano Atlântico Tropical (Dipolo do Atlântico) podem modular ou intensificar o impacto regional.',
      },
    ],
  },
  {
    id: 'inversao-termica-deriva-aerea',
    title: 'Inversão Térmica e Riscos em Aplicações Agrícolas',
    category: 'Proteção Vegetal & Deriva',
    readTime: '6 min de leitura',
    iconName: 'ShieldAlert',
    tags: ['Inversão Térmica', 'Deriva', 'Segurança', 'Pulverização', 'Fumaça'],
    shortDesc: 'Aprenda a detectar a camada de inversão térmica antes de pulverizar e evite contaminações por deriva em massa.',
    summaryBulletPoints: [
      'Inversão Térmica aprisiona gotas finas em uma névoa estagnada rente ao solo.',
      'Sinais no campo: Fumaça subindo que dobra horizontalmente a 2-5m de altura, ausência total de vento.',
      'A névoa de defensivo pode viajar por quilômetros quando o vento fraco retornar horas depois.',
      'Aplicações noturnas sob céu limpo exigem monitoramento rigoroso para evitar esse fenômeno.',
    ],
    technicalConcept: `Sob condições normais durante o dia, a atmosfera é instável: o ar aquecido pelo solo sobe e o ar frio desce (convecção). Essa turbulência vertical ajuda a empurrar as gotas de pulverização em direção às folhas e dilui qualquer névoa residual.

No entanto, no final da tarde e durante a noite, se o céu estiver limpo (sem nuvens) e não houver vento, ocorre a Inversão Térmica:
1. O solo resfria rapidamente por emissão radiativa e esfria a camada de ar em contato direto com ele.
2. A camada de ar rente ao solo fica mais fria e densa do que a camada de ar logo acima.
3. A circulação vertical cessa completamente. Forma-se uma "tampa" de ar quente aprisionando a camada fria inferior.

Se uma pulverização com gotas finas ou médias for realizada sob inversão térmica, as gotas não conseguem descer nem se dispersar. Elas ficam flutuando em suspensão criando uma nuvem concentrada de defensivo. Ao nascer do sol, quando o vento suave retorna, essa nuvem desloca-se inteira (deriva de massa) podendo atingir pomares, lavouras vizinhas sensíveis ou áreas urbanas a quilômetros de distância.`,
    physiologicalImpacts: `Causa danos severos por fitotoxicidade secundária em lavouras vizinhas (ex: deriva de Herbicidas Hormonais como 2,4-D ou Dicamba em pomares de uva ou hortaliças).`,
    formulasAndThresholds: [
      {
        name: 'Gradiente Térmico Vertical Invertido',
        explanation: 'Temperatura a 2.0m de altura é maior do que a temperatura a 0.5m do solo (T_2m > T_0.5m).',
      },
    ],
    practicalManagement: [
      'Teste Prático da Fumaça no Campo: Acender um bastão de fumaça atóxico no talhão. Se a fumaça subir verticalmente e dispersar, NÃO há inversão. Se a fumaça subir alguns metros e se achatar como uma lâmina horizontal, HÁ inversão térmica: PAUSE A APLICAÇÃO IMEDIATAMENTE.',
      'Evitar Aplicação Noturna com Vento Certo Zero e Céu Limpo: Exigir ventos mínimos de 3.0 km/h para garantir alguma turbulência aerodinâmica.',
    ],
    fieldChecklist: [
      'Observar se há neblina rasteira ou poeira flutuante estagnada nas estradas da fazenda.',
      'Consultar o sensor de inversão térmica ou termo-higrômetro duplo da estação.',
      'Garantir o uso de pontas de indução de ar caso precise aplicar no início da manhã.',
    ],
    faq: [
      {
        question: 'A inversão térmica afeta apenas aplicações aéreas?',
        answer: 'Não! Afeta pulverizadores terrestres de barra e atomizadores turbo em pomares com a mesma gravidade.',
      },
    ],
  },
  {
    id: 'estiagens-veranicos-cerrado',
    title: 'Estiagens, Veranicos e Manejo do Perfil do Solo',
    category: 'Agrometeorologia Prática',
    readTime: '7 min de leitura',
    iconName: 'Sparkles',
    tags: ['Veranico', 'Cerrado', 'Perfil de Raízes', 'Gesso', 'Plantio Direto', 'Palhada'],
    shortDesc: 'Estratégias para fazer a lavoura suportar de 15 a 20 dias sem chuva no meio da safra sem perder teto produtivo.',
    summaryBulletPoints: [
      'Veranicos combinam falta de chuva, radiação solar altíssima e DPV elevado no verão.',
      'Aprofundamento de raízes via gessagem agrícola (>40cm) é a maior defesa contra o veranico.',
      'Palhada de Plantio Direto reduz a temperatura da superfície do solo em até 8°C e conserva a umidade.',
      'A escolha do arranjo espacial e densidade reduz a competição por água na crise.',
    ],
    technicalConcept: `O veranico é um período de estiagem de curta a média duração (geralmente entre 10 e 20 dias) que ocorre dentro da estação chuvosa (verão), acompanhado por dias ensolarados, baixas taxas de umidade relativa e forte insolação.

No bioma Cerrado e regiões tropicais, o veranico é devastador por duas razões combinadas:
1. Alta Demanda Evaporativa (ET₀ muito elevada, > 6.0 mm/dia).
2. Presença de barreira química no subsolo (alcançando altos teores de Alumínio tóxico Al³⁺ e baixo Cálcio Ca²⁺), que impede que as raízes da planta desçam além de 20 cm.

Quando a camada superficial de 0-20 cm seca completamente em 4 a 5 dias de veranico, a cultura entra em ponto de murcha permanente se suas raízes não alcançarem as camadas profundas do solo onde ainda há água armazenada.`,
    physiologicalImpacts: `Estresse hídrico no estágio reprodutivo causa abortamento de flores na soja, maçarocamento/má-formação de espigas no milho e queda prematura de capulhos no algodão.`,
    formulasAndThresholds: [
      {
        name: 'Água Disponível no Solo (CAD)',
        formula: 'CAD = (CC - PMP) × ds × Z / 10',
        explanation: 'CC: Capacidade de Campo (%) | PMP: Ponto de Murcha Permanente (%) | ds: densidade do solo (g/cm³) | Z: profundidade efetiva de raízes (cm).',
      },
    ],
    practicalManagement: [
      'Gessagem Agrícola em Profundidade: Aplicar Gesso Agrícola (CaSO4·2H2O) para carregar Cálcio para as camadas subsuperficiais (30-60 cm) e neutralizar o Alumínio tóxico, permitindo a exploração profunda das raízes.',
      'Construção de Palhada (Sistema de Plantio Direto): Cultivar espécies de cobertura com alto Relação C/N (como Brachiaria ruziziensis) que produzem palhada duradoura. A cobertura morta bloqueia a radiação solar direta no solo, conservando a água por 5 a 7 dias a mais.',
      'Manejo de Variedades: Diversificar ciclos de cultivares (30% precoce, 50% médio, 20% tardio) para diluir o risco de veranico na fase crítica.',
    ],
    fieldChecklist: [
      'Realizar amostragem de solo nas camadas 20-40 cm e 40-60 cm para checar saturação por Alumínio.',
      'Medir a biomassa seca de palhada sobre o solo (> 6 toneladas/ha ideal).',
      'Verificar o estado das raízes através de trincheiras de observação.',
    ],
    faq: [
      {
        question: 'O gesso agrícola substitui o calcário?',
        answer: 'Não! O calcário corrige o pH e neutraliza o Alumínio na camada superficial (0-20cm). O gesso não altera o pH, mas é solúvel o suficiente para descer e liberar Cálcio e inativar o Alumínio no subsolo.',
      },
    ],
  },
  {
    id: 'horas-frio-fruticultura-temperada',
    title: 'Horas de Frio (HF) e Quebra de Dormência em Frutíferas',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'Thermometer',
    tags: ['Horas de Frio', 'Fruticultura', 'Maçã', 'Uva', 'Dormência'],
    shortDesc: 'Aprenda a monitorar o acúmulo de horas de frio no inverno e planejar a aplicação de indutores de brotamento.',
    summaryBulletPoints: [
      'Frutíferas temperadas necessitam acumular horas < 7.2°C para quebrar a dormência de gemas.',
      'Insuficiência de frio causa brotação desuniforme, abortamento de flores e desfolha precoce.',
      'O monitoramento diário do acumulador de frio define o momento exato do uso de reguladores vegetais.',
      'Cultivares modernas de baixo requerimento de frio viabilizam a fruticultura em regiões tropicais.',
    ],
    technicalConcept: `As espécies frutíferas de clima temperado (como Maçã, Pêssego, Ameixa, Uva, Pera e Mirtilo) entram em um estado de repouso fisiológico no outono/inverno denominado Dormência (Endodormência). Esse mecanismo evolutivo impede que a planta brote durante um breve período quente no meio do inverno e seja destruída por uma geada subsequente.

Para sair da endodormência e retomar a atividade meristemática na primavera, a planta precisa acumular um número específico de Horas de Frio (HF), tradicionalmente definidas como horas registradas com temperatura menor ou igual a 7.2 °C (45 °F).

Modelos de Contagem de Frio:
1. Modelo Padrão de Utah: Atribui pesos diferentes a faixas térmicas. Temperaturas entre 2.5°C e 9.1°C somam 1.0 unidade de frio, enquanto temperaturas acima de 16°C causam anulação ("decréscimo") do frio acumulado.
2. Modelo Dinâmico: Considera a formação reversível e irreversível de intermediários bioquímicos de frio (porções de frio).`,
    physiologicalImpacts: `Sem o acúmulo adequado de frio, ocorre a dominância apical desordenada, abertura desuniforme das flores ao longo dos ramos, baixas taxas de vingamento de frutos e murcha de gemas florais.`,
    formulasAndThresholds: [
      {
        name: 'Modelo de Horas de Frio Simples',
        formula: 'HF = Σ Horas com T ≤ 7.2 °C',
        explanation: 'Exemplo: Maçã Gala exige de 500 a 700 HF. Uva Niágara exige de 150 a 300 HF.',
      },
    ],
    practicalManagement: [
      'Manejo Químico da Quebra de Dormência: Em anos com inverno ameno e déficit de HF acumulado, aplica-se indutores químicos de brotamento (como Erger ou Cianamida Hidrogenada combinada com Óleo Mineral) quando a cultura atinge de 50% a 70% da sua exigência fria.',
      'Podas de Inverno: Ajustar o momento da poda para coincidir com a saída natural da dormência.',
    ],
    fieldChecklist: [
      'Acompanhar o contador automático de Horas de Frio na aba de Climatologia da GeaAgro.',
      'Inspecionar gemas de ramos do ano para checar o nível de intumescimento.',
      'Preparar o maquinário para aplicação uniforme dos reguladores de brotamento.',
    ],
    faq: [
      {
        question: 'Temperaturas negativas (ex: -3°C) contam mais frio do que 5°C?',
        answer: 'Não. Pelo modelo de Utah, temperaturas abaixo de 1.4°C não acumulam unidades efetivas de quebra de dormência, pois o metabolismo vegetal fica estático.',
      },
    ],
  },
  {
    id: 'balanco-hidrico-climatologico-thornthwaite',
    title: 'Balanço Hídrico Climatológico (Thornthwaite & Mather)',
    category: 'Manejo Hídrico & Irrigação',
    readTime: '8 min de leitura',
    iconName: 'BarChart2',
    tags: ['Balanço Hídrico', 'Solo', 'CAD', 'Thornthwaite', 'Deficiência Hídrica'],
    shortDesc: 'A contabilidade mensal e diária da água no solo para dimensionamento de safras e irrigação estratégica.',
    summaryBulletPoints: [
      'Relaciona a Precipitação (P), a Evapotranspiração Potencial (ETP) e a Capacidade do Solo (CAD).',
      'Identifica com clareza os períodos de Excedente Hídrico (EXC) e Deficiência Hídrica (DEF).',
      'Fundamental para zoneamento agrícola de risco climático (ZARC) e época de plantio.',
      'Mapeia a capacidade de armazenamento de água no perfil explorado pelas raízes.',
    ],
    technicalConcept: `O Balanço Hídrico Climatológico desenvolvido por Thornthwaite & Mather (1955) é um método contábil que monitora as entradas de água no sistema solo-planta (via Chuva/Irrigação) e as saídas (via Evapotranspiração e Percolação), considerando a Capacidade de Água Disponível (CAD) do solo.

Etapas Fisiológicas do Balanço:
1. Reposição: As chuvas superam a evapotranspiração e começam a recarregar o reservatório de água do solo esgotado anteriormente.
2. Excedente Hídrico (EXC): O solo atinge 100% da sua capacidade de campo (Armazenamento = CAD). Toda chuva adicional escoa por superfície ou percola para o lençol freático.
3. Retirada: As chuvas cessam ou ficam abaixo da demanda evapotranspiratória. A planta consome a água armazenada na zona radicular.
4. Deficiência Hídrica (DEF): O reservatório de água do solo zera ou cai abaixo do ponto crítico. A evapotranspiração real (ETA) fica menor que a potencial (ETP), gerando estresse hídrico.`,
    physiologicalImpacts: `A ocorrência prolongada de Deficiência Hídrica (DEF > 30 mm/mês) força a planta a fechar estômatos e descartar estruturas reprodutivas. O Excedente Hídrico prolongado satura os poros, matando raízes por asfixia radicular (ausência de oxigênio).`,
    formulasAndThresholds: [
      {
        name: 'Equação de Balanço de Massa Simples',
        formula: 'ARM_hoje = ARM_ontem + Precipitação - ET_real',
        explanation: 'Limitado pelo valor máximo de CAD do solo. Se ARM > CAD, o excedente vira escoamento (EXC = ARM - CAD).',
      },
    ],
    practicalManagement: [
      'Determinante para o ZARC: Seguir as janelas de plantio estabelecidas pelo zoneamento oficial, que se baseia neste balanço hídrico para garantir risco de perda < 20%.',
      'Ajuste da CAD por Tipo de Solo: Solos argilosos possuem CAD alta (1.2 a 1.5 mm de água por cm de solo), enquanto solos arenosos possuem CAD baixa (0.5 a 0.8 mm/cm).',
    ],
    fieldChecklist: [
      'Calcular a CAD real da sua área com base na análise física do solo (Argila/Areia) e profundidade de raízes.',
      'Consultar o histórico do balanço hídrico na aba da GeaAgro.',
    ],
    faq: [
      {
        question: 'Por que o solo arenoso necessita de irrigações mais frequentes?',
        answer: 'Devido à sua baixa CAD (poros grandes que retêm pouca água por capilaridade). Ele atinge o ponto de deficiência muito mais rápido do que um solo argiloso.',
      },
    ],
  },
  {
    id: 'microclima-dossel-molhamento-foliar',
    title: 'Microclima de Dossel e Duração de Molhamento Foliar (DMF)',
    category: 'Sensoramento & Micrometeorologia',
    readTime: '7 min de leitura',
    iconName: 'CloudSun',
    tags: ['Microclima', 'Molhamento Foliar', 'Doenças', 'Míldio', 'Ferrugem', 'DMF'],
    shortDesc: 'Aprenda como o microclima interno da lavoura favorece ou previne epidemias de fungos e bactérias.',
    summaryBulletPoints: [
      'O microclima no interior da lavoura é completamente diferente do clima medido na estação aberta.',
      'A Duração do Molhamento Foliar (DMF) é o fator primordial para a germinação de esporos de fungos.',
      'Combinação crítica: Molhamento foliar > 8 horas seguidas com temperatura entre 18°C e 24°C.',
      'Poda, espaçamento e orientação de linhas ajudam a arejar o dossel e acelerar a secagem.',
    ],
    technicalConcept: `Enquanto a estação meteorológica mede os parâmetros a 2 metros de altura em campo aberto, a arquitetura de plantas de uma lavoura adulta cria o seu próprio Microclima de Dossel:
- Menor velocidade do vento (as folhas atuam como barreira aerodinâmica).
- Umidade relativa muito mais alta (devido à transpiração combinada de milhares de plantas).
- Temperatura mais amena durante o dia e mais quente à noite.

A Duração do Molhamento Foliar (DMF) é o tempo acumulado em que há uma filme livre de água ou orvalho depositado sobre a superfície da folha. Os esporos da grande maioria dos fungos patogênicos (como *Phakopsora pachyrhizi* na soja, *Phytophthora infestans* na batata/tomate e *Plasmopara viticola* na videira) necessitam obrigatoriamente de um filme de água líquida para germinar e emitir o tubo germinativo que penetra pelos estômatos.`,
    physiologicalImpacts: `Sem filme de água (folha seca), o esporo do fungo desidrata e morre sob a ação do sol antes de conseguir infectar a planta.`,
    formulasAndThresholds: [
      {
        name: 'Regra de Alerta Epidemiológico',
        explanation: 'DMF ≥ 8 horas contínuas + Temperatura Média no Dossel entre 18°C e 24°C = Risco Crítico de Infecção por Ferrugem e Míldios.',
      },
    ],
    practicalManagement: [
      'Manejo de População de Plantas: Evitar populações excessivas de plantas por metro linear que fechem o dossel precocemente, impedindo a ventilação interna.',
      'Aero-Ventilação em Horticultura: Em estufa ou pomares, realizar podas de limpeza e desfolha da saia inferior para permitir que o ar flua e seque o orvalho rapidamente pela manhã.',
      'Aplicação Preventiva de Fungicidas: Acionar a pulverização com base no relatório de DMF da estação IoT da GeaAgro antes da emergência visível de lesões.',
    ],
    fieldChecklist: [
      'Instalar o sensor foliar (Leaf Wetness) posicionado no terço médio do dossel.',
      'Avaliar a presença de orvalho acumulado nas folhas do terço inferior às 09:00 da manhã.',
      'Verificar a ventilação entre as fileiras de plantio.',
    ],
    faq: [
      {
        question: 'O orvalho sozinho pode causar epidemia de doenças sem ter chovido?',
        answer: 'Com certeza! Noites longas de inversão térmica produzem orvalho intenso que pode manter as folhas molhadas por mais de 10 horas seguidas, disparando infecções fúngicas sem cair uma única gota de chuva.',
      },
    ],
  },
  {
    id: 'balanco-radiacao-eficiencia-uso-luz',
    title: 'Radiação Solar e Eficiência de Uso da Radiação (EUR)',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'Sun',
    tags: ['Radiação', 'Fotosfeticamente Ativa', 'EUR', 'IAF', 'Fotossíntese'],
    shortDesc: 'Como a interceptação da luz solar e o Índice de Área Foliar (IAF) definem o teto produtivo de biomassa da lavoura.',
    summaryBulletPoints: [
      'Apenas a Radiação Fotosfeticamente Ativa (PAR, 400-700nm) é aproveitada pelas clorofilas.',
      'Índice de Área Foliar (IAF) de 3.5 a 4.5 é necessário para interceptar 95% da luz incidente.',
      'Folhas eretas (como no milho moderno) permitem a penetração de luz nas camadas inferiores.',
      'Nuvens finas e luz difusa podem aumentar a eficiência fotossintética do dossel inferior.',
    ],
    technicalConcept: `A energia solar é a matéria-prima primária de toda a agricultura. No entanto, as plantas utilizam apenas uma faixa do espectro eletromagnético solar denominada Radiação Fotosfeticamente Ativa (PAR - Photosynthetically Active Radiation), compreendida nos comprimentos de onda entre 400 nm e 700 nm.

A produção total de biomassa de uma lavoura é diretamente proporcional à quantidade de PAR Interceptada (PARi) acumulada ao longo do ciclo multiplicada pela Eficiência de Uso da Radiação (EUR):
Biomassa (g/m²) = Σ (PARi) × EUR

Fatores Arquitetônicos de Interceptação:
1. Índice de Área Foliar (IAF): Razão entre a área de folhas verdes e a área de solo ocupada. Quando o IAF atinge o valor crítico de 3.5 a 4.5, a lavoura intercepta 95% da luz solar.
2. Ângulo Foliar e Extinção de Luz (k): Plantas com folhas eretas (eretas) possuem um coeficiente de extinção menor, permitindo que a luz penetre até o terço inferior e ative as folhas baixeiras sem saturar as folhas do topo.`,
    physiologicalImpacts: `Folhas do terço inferior que não recebem luz ficam abaixo do Ponto de Compensação Lumínica. Em vez de produzir açúcares, tornam-se dreno (consumidoras de energia), amarelecem e caem prematuramente.`,
    formulasAndThresholds: [
      {
        name: 'Lei de Beer-Lambert para Interceptação de Luz',
        formula: 'PARi = PAR_incidente × [1 - exp(-k × IAF)]',
        explanation: 'k: coeficiente de extinção foliar (0.4 a 0.7 dependendo do porte da folha) | IAF: Índice de Área Foliar.',
      },
    ],
    practicalManagement: [
      'Ajuste do Espaçamento entre Linhas: O encurtamento do espaçamento (ex: de 50cm para 45cm na soja) acelera o fechamento do entrelinha e o alcance do IAF crítico, capturando mais luz solar diária.',
      'Manejo de Nutrição Nitrogenada: O Nitrogênio é o componente chave da molécula de Clorofila e da enzima RuBisCO. Nutrição adequada garante alta EUR.',
    ],
    fieldChecklist: [
      'Avaliar o fechamento do entrelinha da lavoura aos 40-50 dias após emergência.',
      'Inspecionar o estado nutricional das folhas baixeiras quanto à luz e amarelecimento.',
    ],
    faq: [
      {
        question: 'Por que dias com névoa leve ou nebulosidade difusa às vezes produzem alta taxa fotossintética?',
        answer: 'A luz difusa espalha-se em todas as direções, penetrando profundamente na estrutura do dossel sem causar o aquecimento excessivo e fotoinibição que ocorrem sob luz solar direta intensa no topo.',
      },
    ],
  },

  // 13
  {
    id: 'estresse-termico-aborta-flores',
    title: 'Abortamento Floral e Estresse Térmico no Florescimento',
    category: 'Fisiologia & Graus-Dia',
    readTime: '7 min de leitura',
    iconName: 'Thermometer',
    tags: ['Estresse Térmico', 'Florescimento', 'Vingamento', 'Soja', 'Milho', 'Polinização'],
    shortDesc: 'Impacto de temperaturas acima de 35°C na viabilidade do pólen, tubo polínico e abortamento de vagens e espigas.',
    summaryBulletPoints: [
      'Temperaturas > 35°C inviabilizam os grãos de pólen e ressecam a superfície estigmática.',
      'No milho, o desencontro entre a liberação do pólen e a emergência dos estigmas (estilo-estigmas) causa espigas falhadas.',
      'A soja aborta flores e vagens jovens para preservar a sobrevivência da planta sob calor extremo.',
      'Biostimulantes à base de aminoácidos e extrato de algas atenuam o dano oxidativo nas flores.',
    ],
    technicalConcept: `O florescimento e a fertilização são os estágios fisiológicos mais sensíveis a altas temperaturas em todas as culturas agrícolas. Quando a temperatura máxima do ar ultrapassa os 35°C durante a antese:
1. Desidratação do Pólen: Os grãos de pólen perdem água rapidamente, perdendo a capacidade de germinar e emitir o tubo polínico.
2. Degeneração do Saco Embrionário: O estigma resseca antes da chegada do pólen fertilizador.
3. Desbalanço Hormonal: Ocorre aumento abrupto na concentração de Ácido Abscísico (ABA) e Etileno no pedúnculo floral, acionando a zona de abscisão e provocando a queda (abortamento) das flores e vagens jovens.`,
    physiologicalImpacts: `Perda direta e irreversível do componente primário de rendimento: número de grãos por m² ou frutos por planta.`,
    formulasAndThresholds: [
      {
        name: 'Limiares Térmicos de Abortamento',
        explanation: 'Soja: T > 35°C por 3h seguidas | Milho: T > 36°C com UR < 40% | Algodão: T > 38°C.',
      },
    ],
    practicalManagement: [
      'Aplicação de Bioestimulantes Preventivos: Aplicar Extrato de *Ascophyllum nodosum* e aminoácidos (Prolina e Glicina-Betaína) 5 a 7 dias antes do pico de florescimento para mitigar radicais livres.',
      'Irrigação de Resfriamento: Em áreas irrigadas, rodar o pivô com lâminas baixas (3 a 5 mm) nas horas mais quentes do dia para resfriar a canópia.',
    ],
    fieldChecklist: [
      'Monitorar o termômetro da estação IoT nos dias de florescimento.',
      'Contar o número de flores abortadas acumuladas no chão do entrelinha.',
      'Avaliar a umidade do estilo-estigma nas espigas de milho.',
    ],
    faq: [
      {
        question: 'A irrigação no meio do dia prejudica a polinização do milho?',
        answer: 'Não se for aplicada uma lâmina leve de resfriamento (3mm). O resfriamento do ar diminui o choque térmico do pólen e evita a morte dos cabelos da espiga.',
      },
    ],
  },

  // 14
  {
    id: 'zcas-zona-convergencia-atlantico-sul',
    title: 'Zona de Convergência do Atlântico Sul (ZCAS) & Inundações',
    category: 'Climatologia Regional & El Niño',
    readTime: '8 min de leitura',
    iconName: 'CloudRain',
    tags: ['ZCAS', 'Chuvas Intensas', 'Cerrado', 'Inundação', 'Manejo de Solo'],
    shortDesc: 'A faixa persistente de nebulosidade e chuva que atinge o Sudeste e Centro-Oeste por dias seguidos.',
    summaryBulletPoints: [
      'A ZCAS é uma faixa contínua de umidade que se estende da Amazônia ao Atlântico Sudeste.',
      'Causa de 4 a 10 dias ininterruptos de céu encoberto, chuvas volumosas e baixíssima insolação.',
      'Promove saturação do perfil do solo, erosão hídrica em sulcos e atraso nas operações de colheita.',
      'A ausência prolongada de sol paralisa a fotossíntese e reduz a taxa de enchimento de grãos.',
    ],
    technicalConcept: `A Zona de Convergência do Atlântico Sul (ZCAS) é um dos principais sistemas meteorológicos do verão na América do Sul. Trata-se de uma faixa quase estacionária de nebulosidade e precipitação que se estabelece desde o sul da Região Amazônica, atravessando o Centro-Oeste e o Sudeste do Brasil, até alcançar o Oceano Atlântico.

Dinâmica da ZCAS:
- Transporte de Umidade: A Floresta Amazônica atua como uma bomba de umidade (Jatos em Baixos Níveis - JBN), canalizando o ar quente e úmido para o Centro-Sul.
- Persistência: Diferente de tempestades isoladas de verão, a ZCAS pode permanecer ativa por mais de 5 dias seguidos no mesmo local, acumulando volumes superiores a 250 mm de chuva em uma única semana.`,
    physiologicalImpacts: `Lixiviação profunda de Potássio e Nitrato, anaerobiose temporária no solo por excesso de umidade e queda de insolação útil (PAR) que limita o carboidrato disponível para o fruto.`,
    formulasAndThresholds: [
      {
        name: 'Critério Climatológico de ZCAS',
        explanation: 'Persistência de banda de nebulosidade e chuva por no mínimo 4 dias consecutivos sobre a mesma faixa de latitude.',
      },
    ],
    practicalManagement: [
      'Manutenção de Curvas de Nível e Terracionamento: Garantir que a infraestrutura de conservação do solo suporte volumes de enxurrada de pico.',
      'Descompactação de Solo Anterior: Solos sem camadas compactadas permitem a infiltração rápida da água da ZCAS para o lençol freático sem erosão laminar.',
    ],
    fieldChecklist: [
      'Inspecionar canais de escoamento e caixas de retenção de água nas estradas internas da fazenda.',
      'Monitorar a acumulação pluviométrica diária no pluviômetro IoT.',
      'Pausar tráfego de máquinas pesadas em solos saturados para evitar compactação severa.',
    ],
    faq: [
      {
        question: 'Qual a diferença entre ZCAS e uma Frente Fria simples?',
        answer: 'A frente fria é um sistema dinâmico que se desloca rapidamente de sul para norte em 24-48h. A ZCAS fica acoplada e parada sobre a mesma região por muitos dias.',
      },
    ],
  },

  // 15
  {
    id: 'granizo-danos-fisiologicos-recuperacao',
    title: 'Granizo: Mecânica do Dano Foliar e Cicatrização Vegetal',
    category: 'Agrometeorologia Prática',
    readTime: '7 min de leitura',
    iconName: 'ShieldAlert',
    tags: ['Granizo', 'Dano Mecânico', 'Desfolha', 'Fungicidas', 'Cicatrização'],
    shortDesc: 'Como socorrer lavouras atingidas por chuva de granizo e evitar infecções secundárias por patógenos.',
    summaryBulletPoints: [
      'O impacto pedras de gelo destrói a área foliar, quebra hastes e fere a epiderme das plantas.',
      'Ferimentos expostos são porta de entrada para bactérias (*Erwinia*, *Xanthomonas*) e fungos de ferida.',
      'A aplicação imediata (até 48h) de fungicidas protetores com efeito bactericida/cicatrizante é crucial.',
      'A capacidade de rebrotamento depende da preservação do meristema apical de crescimento.',
    ],
    technicalConcept: `O granizo é uma precipitação sólida de pedras de gelo formadas dentro de nuvens de tempestade de grande desenvolvimento vertical (*Cumulonimbus*). Quando as correntes ascendentes violentas transportam gotas supercongeladas para altitudes acima de 8.000 metros, elas congelam em camadas sucessivas até ficarem pesadas demais e caírem.

Fisiologia do Dano por Granizo:
1. Perda Mecânica de Área Foliar: Redução instantânea do aparelho fotossintético.
2. Lacerações Epidérmicas e Fraturas de Hastes: Rompimento do córtex e dos vasos condutores de seiva.
3. Portal de Entrada Epidemiológico: As lesões abertas liberam exsudatos celulares que atraem bactérias oportunistas e esporos fúngicos aerotransportados.`,
    physiologicalImpacts: `Se o ponto de crescimento (gema apical) for destruído (ex: milho acima de V6), a planta não consegue mais emitir folhas novas. Na soja, o dano em V3 permite emissão de ramos axilares laterais se houver reserva nutricional.`,
    formulasAndThresholds: [
      {
        name: 'Estimativa de Perda de Rendimento por Desfolha',
        explanation: 'Tabelas oficiais de seguro agrícola correlacionam a % de área foliar destruída com o estágio fenológico atual.',
      },
    ],
    practicalManagement: [
      'Pulverização Emergencial Cicatrizante: Aplicar sais de Cobre (Cobre Fixo/Hidróxido de Cobre) associados a Fungicidas de Sítio Múltiplo até 48 horas após a tempestade.',
      'Suplementação Nutricional Foliar: Aplicar Micronutrientes (Zinco, Boro e Manganês) combinados com aminoácidos para estimular a síntese de citocininas e brotação lateral.',
    ],
    fieldChecklist: [
      'Inspecionar o meristema de crescimento (gema apical) cortando o caule ao meio para checar necrose.',
      'Quantificar a porcentagem média de desfolhamento por m² no talhão.',
      'Acionar o perito do seguro agrícola antes de realizar qualquer manejo na área.',
    ],
    faq: [
      {
        question: 'Devo aplicar adubação nitrogenada de cobertura após o granizo?',
        answer: 'Sim, se a cultura ainda estiver no estágio vegetativo com ponto de crescimento viável. O Nitrogênio impulsiona a reconstrução rápida do dossel foliar.',
      },
    ],
  },

  // 16
  {
    id: 'estresse-salino-evapotranspiracao',
    title: 'Salinização do Solo, Condutividade Elétrica e Pressão Osmótica',
    category: 'Manejo Hídrico & Irrigação',
    readTime: '7 min de leitura',
    iconName: 'Gauge',
    tags: ['Salinidade', 'Irrigação', 'Condutividade Elétrica', 'Osmose', 'Seca Fisiológica'],
    shortDesc: 'Aprenda como o acúmulo de sais na zona radicular causa a seca fisiológica mesmo em solos úmidos.',
    summaryBulletPoints: [
      'Água de irrigação com alto teor de sais solúveis eleva a Condutividade Elétrica (CE) do solo.',
      'Seca Fisiológica: A água fica retida no solo por força osmótica, impedindo a absorção pelas raízes.',
      'Sintomas de toxidez por Sódio (Na⁺) e Cloreto (Cl⁻): Queimadura nas margens foliares.',
      'Lixiviação estratégica de sais com fração de lavagem é a principal forma de recuperação do solo.',
    ],
    technicalConcept: `A salinização do solo é um processo de degradação físico-química associado à irrigação com água de baixa qualidade ou drenagem deficiente em regiões áridas e semiáridas de alta demanda evaporativa.

Mecanismo de Ação Osmótica:
A água move-se espontaneamente do meio de menor concentração de sais para o meio de maior concentração (Osmose). Em solos normais, a solução do solo tem menor salinidade do que o interior das células da raiz, permitindo a entrada passiva de água.

Quando a Condutividade Elétrica da Extrato de Saturação (CEe) ultrapassa 4.0 dS/m:
O potencial osmótico do solo cai drasticamente. A planta precisa gastar energia metabólica massiva (ajuste osmótico) para conseguir puxar água. Em casos graves, a raiz perde água para o solo, resultando na **Seca Fisiológica** mesmo com o solo visualmente molhado.`,
    physiologicalImpacts: `Redução severa no diâmetro do caule, acúmulo tóxico de íons Na+ nos cloroplastos provocando necrose marginal foliar em leque.`,
    formulasAndThresholds: [
      {
        name: 'Fração de Lavagem (FL) de Sais',
        formula: 'FL = CE_agua / CE_drenagem_admissivel',
        explanation: 'Determina a porcentagem extra de água de irrigação necessária para lavar os sais para baixo da zona radicular.',
      },
    ],
    practicalManagement: [
      'Monitoramento Periódico da CE da Água e do Solo com condutivímetro portátil.',
      'Uso de Sistemas de Drenagem Subsuperficial para escoar a água salina lixiviada.',
      'Aplicação de Gesso Agrícola para deslocar o Sódio (Na⁺) trocável por Cálcio (Ca²⁺) no complexo de troca.',
    ],
    fieldChecklist: [
      'Medir a CE da fonte de água de irrigação (açude, poço tubular ou rio).',
      'Inspecionar crostas brancas salinas na superfície dos sulcos ou gotejadores.',
      'Verificar o bordo das folhas quanto a queimaduras marginais amareladas.',
    ],
    faq: [
      {
        question: 'Gotejamento aumenta o risco de salinização local?',
        answer: 'Pode concentrar sais na periferia do bulbo úmido. Chuvas leves subsequentes podem empurrar essa coroa de sais de volta para o centro das raízes, exigindo regas contínuas para manter os sais afastados.',
      },
    ],
  },

  // 17
  {
    id: 'ondas-de-calor-queima-de-frutos-sunscald',
    title: 'Ondas de Calor (Heat Waves) e Queima por Sol (Sunscald)',
    category: 'Agrometeorologia Prática',
    readTime: '6 min de leitura',
    iconName: 'Sun',
    tags: ['Onda de Calor', 'Sunscald', 'Frutas', 'Café', 'Protetores Solares', 'Caolim'],
    shortDesc: 'Proteção de frutos e dossel foliar contra a radiação solar extrema e temperaturas de superfície acima de 45°C.',
    summaryBulletPoints: [
      'Ondas de Calor são definidas por 3+ dias seguidos com temperaturas 5°C acima da média histórica.',
      'Queima por Sol (*Sunscald*) ocorre quando a temperatura da casca do fruto ultrapassa 45°C.',
      'Danifica os tecidos de citros, maçã, café, tomate, pimentão e uva de mesa, inviabilizando a venda.',
      'Protetores solares à base de Caolim Processado (argila branca) refletem o excesso de IV e UV.',
    ],
    technicalConcept: `As Ondas de Calor (*Heat Waves*) são eventos extremos causados por domos de alta pressão atmosférica (bloqueios atmosféricos) que reprimem a formação de nuvens e comprimem o ar contra a superfície, gerando aquecimento adiabático severo.

Durante esses eventos, a temperatura do ar pode atingir 38-42°C, mas a temperatura direta da superfície dos frutos expostos ao sol radiante pode alcançar 48-50°C.

Três Tipos de Danos por Sol nos Frutos:
1. Necrose por Queima de Sol (*Sunscald Necrosis*): A casca atinge o ponto térmico letal (> 46°C por 1 hora), matando as células e criando depressões escuras e secas.
2. Escalradura por Sol (*Sunscald Browning*): Alteração de cor sem necrose imediata, mas degradando clorofila e carotenoides (fruto fica manchado de castanho).
3. Fotodestruição da Clorofila: Descoloração de casca que reduz o tempo de prateleira.`,
    physiologicalImpacts: `Destruição das membranas celulares da epiderme do fruto, colapso de vesículas de suco e invasão secundária por fungos de podridão em pós-colheita.`,
    formulasAndThresholds: [
      {
        name: 'Temperatura Crítica de Superfície do Fruto (Tsf)',
        explanation: 'Tsf = T_ar + (8.0 a 12.0 °C) sob radiação solar direta sem vento.',
      },
    ],
    practicalManagement: [
      'Aplicação de Caolim Processado (Protetor Solar Agrícola): Pulverizar filme protetor refletivo de Caolim a 2-3% criando uma barreira branca que reflete a luz infravermelha.',
      'Uso de Telas de Sombreamento (Sombrite 18-30%): Instalação de malhas termo-refletoras em pomares de alto valor agregado.',
      'Manutenção da Enfolhamento (Não desfolhar excessivamente durante o raleio).',
    ],
    fieldChecklist: [
      'Verificar alertas meteorológicos para bloqueios de alta pressão.',
      'Verificar a cobertura foliar de proteção dos frutos orientados para a oeste (sol da tarde).',
      'Revisar a dosagem de Caolim na calda de aplicação.',
    ],
    faq: [
      {
        question: 'O filme de Caolim reduz a fotossíntese da planta?',
        answer: 'Não. O Caolim de grau agrícola é formulado para permitir a passagem seletiva da luz fotosfeticamente ativa (PAR), bloqueando apenas o infravermelho (calor) e o ultravioleta nocivo.',
      },
    ],
  },

  // 18
  {
    id: 'vento-acamamento-estresse-mecanico',
    title: 'Ventos Fortes, Acamamento (Lodging) e Estresse Mecânico',
    category: 'Agrometeorologia Prática',
    readTime: '6 min de leitura',
    iconName: 'Wind',
    tags: ['Vento', 'Acamamento', 'Lodging', 'Milho', 'Trigo', 'Reguladores de Crescimento'],
    shortDesc: 'Mecanismos de quebra de colmo e acamamento radicular provocados por rajadas de vento em tempestades.',
    summaryBulletPoints: [
      'O acamamento reduz a eficiência de colheita mecânica e favorece a deterioração dos grãos.',
      'Acamamento de Raiz: A planta tomba inteira do solo molhado sob rajadas > 45 km/h.',
      'Acamamento de Colmo: O gomo basal do caule quebra por falta de lignificação ou ataque de pragas.',
      'Reguladores de crescimento (Modificadores de Estatura) reduzem o entre-nó basal e enrijecem a palhada.',
    ],
    technicalConcept: `O acamamento (*Lodging*) é o tombamento permanente dos caules das culturas gramíneas (Milho, Trigo, Cevada, Arroz, Sorgo e Cana-de-Açúcar) em relação à verticalidade normal. Ocorre pela interação entre rajadas de vento intenso de tempestades (*microbursts* ou linhas de estabilidade) e o estado estrutural da lavoura.

Dois Mecanismos Principais:
1. Acamamento Radicular: Ocorre quando o solo está completamente saturado de água (perda de coesão mecânica do solo) e o vento exerce torque na base. As raízes de ancoragem cedem e a planta tomba intacta.
2. Acamamento de Colmo: Acontece quando o torque do vento supera a resistência à flexão dos primeiros entre-nós basais da planta, causando fratura mecânica do caule.`,
    physiologicalImpacts: `Impossibilidade de translocação normal de fotoassimilados da folha para os grãos, sombreamento mútuo violento e perdas de colheita mecânica que podem atingir de 30% a 70%.`,
    formulasAndThresholds: [
      {
        name: 'Velocidade Crítica de Vento para Acamamento',
        explanation: 'Ventos constantes > 35 km/h ou rajadas > 50 km/h em solos saturados provocam tombamento de trigo e milho alto.',
      },
    ],
    practicalManagement: [
      'Uso de Redutores de Crescimento (ex: Clormequat, Trinexapac-etil): Reduzem a altura da planta e espessam as paredes celulares do colmo em cereais de inverno.',
      'Nutrição Equilibrada Potássio/Nitrogênio: Excesso de Nitrogênio com falta de Potássio gera colmos finos, estiolados e sem lignina.',
      'Escolha de Híbridos/Cultivares com Altura de Inserção de Espiga Baixa e Enraizamento Profundo.',
    ],
    fieldChecklist: [
      'Avaliar a sanidade do colmo abrindo plantas longitudinalmente para checar Podridão de Fusarium/Pythium.',
      'Checar a firmeza de ancoragem das raízes adventícias (raízes suporte do milho).',
      'Ajustar a velocidade de avanço da plataforma da colhedora em talhões acamados.',
    ],
    faq: [
      {
        question: 'A planta de milho consegue se erguer sozinha após acamar no vegetativo?',
        answer: 'Sim! Se o acamamento for radicular no estágio vegetativo (até V10-V12), a planta exibe tropismo negativo e consegue erguer a parte superior ("curvatura em joelho"), embora com perda parcial de rendimento.',
      },
    ],
  },

  // 19
  {
    id: 'albedo-temperatura-solo',
    title: 'Albedo da Superfície, Cobertura Vegetal e Térmica do Solo',
    category: 'Sensoramento & Micrometeorologia',
    readTime: '6 min de leitura',
    iconName: 'Sparkles',
    tags: ['Albedo', 'Temperatura do Solo', 'Palhada', 'Radiação', 'Emergência'],
    shortDesc: 'Como a cor do solo, umidade e palhada refletem a radiação e afetam a temperatura da zona de sementes.',
    summaryBulletPoints: [
      'Albedo é a fração de radiação solar refletida por uma superfície (0.0 a 1.0).',
      'Solos escuros e úmidos têm albedo baixo (0.10) e absorvem 90% da radiação, esquentando muito.',
      'Palhada clara seca tem albedo alto (0.25-0.30), refletindo calor e mantendo o solo fresco.',
      'Temperaturas do solo > 40°C na zona de germinação "cozinham" a semente de soja e feijão.',
    ],
    technicalConcept: `O albedo ($\alpha$) é a propriedade física que mensura a refletividade de uma superfície para a radiação solar global incidente. Varia em uma escala de 0.0 (superfície negra que absorve toda a radiação) a 1.0 (superfície totalmente refletiva como neve fresca).

Valores Típicos no Campo:
- Solo Escuro Úmido (Latossolo Vermelho/Escuro molhado): $\alpha = 0.08 - 0.12$
- Solo Claro Seco (Arenoso seco): $\alpha = 0.20 - 0.25$
- Palhada de Gramínea Seca (Brachiaria): $\alpha = 0.25 - 0.32$
- Dossel Vegetal Verde Fechado (Soja/Milho): $\alpha = 0.18 - 0.23$

Impacto na Temperatura da Zona de Semente (0-5 cm):
Em solos descobertos expostos ao sol pleno de verão, a temperatura da camada superficial de 0-5 cm pode atingir de 45°C a 52°C às 14:00 horas. A presença de cobertura morta (palhada) eleva o albedo e atua como isolante térmico, mantendo o solo a confortáveis 28-32°C.`,
    physiologicalImpacts: `Sementes germinando sob solo > 40°C sofrem desnaturação enzimática de proteínas de reserva, encurtamento do hipocótilo e tombamento de plântulas por canela de preto térmica.`,
    formulasAndThresholds: [
      {
        name: 'Cálculo de Balanço de Radiação de Onda Curta',
        formula: 'Rns = (1 - α) × Rs',
        explanation: 'Rns: saldo de radiação de onda curta absorvido pelo solo | Rs: radiação solar incidente.',
      },
    ],
    practicalManagement: [
      'Manutenção contínua de palhada no Plantio Direto para amortecer picos de temperatura do solo.',
      'Aferição da temperatura do solo antes da semeadura de precisão em períodos quentes.',
    ],
    fieldChecklist: [
      'Inserir termômetro de espeto a 5 cm de profundidade no solo às 14:00.',
      'Medir a espessura da camada de palhada residual no talhão.',
    ],
    faq: [
      {
        question: 'O albedo muda quando o solo é irrigado?',
        answer: 'Sim! Solos molhados ficam visivelmente mais escuros, o que reduz seu albedo e aumenta a absorção inicial de radiação, embora a evaporação da água ajude a resfriá-lo em seguida.',
      },
    ],
  },

  // 20
  {
    id: 'nebulosidade-fotossintese-luz-difusa',
    title: 'Radiação Difusa vs. Direta na Eficiência Fotossintética',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'CloudSun',
    tags: ['Luz Difusa', 'Radiação', 'Fotossíntese', 'Nuvens', 'Dossel'],
    shortDesc: 'Entenda por que dias levemente nublados podem aumentar a produção de fotoassimilados nas folhas inferiores.',
    summaryBulletPoints: [
      'Radiação Direta vem em feixes paralelos do Sol, saturando apenas o topo da lavoura.',
      'Radiação Difusa é espalhada por nuvens e aerossóis, penetrando em todos os ângulos do dossel.',
      'Efeito de Iluminação Uniforme: Folhas do terço inferior saem da sombra e aumentam a fotossíntese total.',
      'Dosséis densos e altos (como Cana e Milho) beneficiam-se muito de dias com fração de luz difusa.',
    ],
    technicalConcept: `A radiação solar que atinge o topo da atmosfera terrestre sofre interações ao passar pelos gases, aerossóis e nuvens, dividindo-se em duas componentes principais na superfície:

1. Radiação Solar Direta: Chega diretamente em feixes unidirecionais sem ser espalhada.
2. Radiação Solar Difusa: Teve sua trajetória alterada por espalhamento moleculares e reflexões em nuvens finas (Cirrus, Altocumulus) ou aerossóis.

A Ilusão do Dia Ensolarado:
Em dias de céu limpo (sem nuvens), a radiação direta é altíssima. No entanto, as folhas do topo do dossel ficam saturadas de luz (atingem o Ponto de Saturação Lumínica) e desperdiçam energia na forma de calor. Ao mesmo tempo, o terço inferior da planta fica em sombra projetada intensa.

Em dias com nebulosidade leve/difusa:
A luz difusa incide em múltiplos ângulos simultaneamente. Ela consegue "contornar" as folhas do topo e penetrar profundamente no dossel, iluminando a saia inferior das plantas sem causar estresse fotoinibitório no topo.`,
    physiologicalImpacts: `Aumento da fotossíntese canopial integrada diária, reduzindo a senescência precoce das folhas baixeiras.`,
    formulasAndThresholds: [
      {
        name: 'Fração de Radiação Difusa (Kd)',
        formula: 'Kd = R_difusa / R_global',
        explanation: 'Kd varia de 0.15 (céu limpo) a 1.0 (céu totalmente encoberto por nuvens espessas).',
      },
    ],
    practicalManagement: [
      'Arquitetura de Plantas Eretofilas: Cultivares modernas com folhas eretas mimetizam os benefícios da luz difusa, permitindo maior penetração de feixes diretos.',
    ],
    fieldChecklist: [
      'Observar o sensor de radiação PAR global e difusa da estação.',
      'Verificar a coloração e atividade das folhas do terço inferior da lavoura.',
    ],
    faq: [
      {
        question: 'Céu totalmente encoberto por nuvens pretas de chuva aumenta a fotossíntese?',
        answer: 'Não. Nuvens muito espessas (Nimbostratus) cortam a radiação global total para níveis abaixo do Ponto de Compensação Lumínica, paralisando a produção de carboidratos.',
      },
    ],
  },

  // 21
  {
    id: 'orvalho-contribuicao-hidrica-foliar',
    title: 'Orvalho: Contribuição Hídrica Não-Pluvial e Absorção Foliar',
    category: 'Manejo Hídrico & Irrigação',
    readTime: '6 min de leitura',
    iconName: 'Droplets',
    tags: ['Orvalho', 'Absorção Foliar', 'Umidade', 'Ponto de Orvalho', 'Balanço Hídrico'],
    shortDesc: 'O papel do orvalho noturno no alívio do estresse hídrico e na fertilização foliar natural.',
    summaryBulletPoints: [
      'O orvalho forma-se quando a temperatura da superfície foliar cai até a Temperatura do Ponto de Orvalho (Tpo).',
      'Pode contribuir com 0.2 mm a 0.5 mm de água por noite em regiões de alta umidade.',
      'Rehidrata a cutícula foliar pela manhã e reduz o Déficit de Pressão de Vapor inicial.',
      'Atua como vetor para absorção de adubos foliares e bioestimulantes aplicados ao anoitecer.',
    ],
    technicalConcept: `O orvalho é uma forma de precipitaçãooculta (não pluvial) que se forma por condensação direta do vapor de água atmosférico sobre superfícies frias expostas à radiação noturna.

Condições para Formação Intensa:
1. Céu limpo e limpo durante a noite (para máxima perda radiativa de calor).
2. Ventos muito fracos (entre 1.0 e 3.0 km/h) para trazer ar úmido sem dissipar o frio da superfície.
3. Alta Umidade Relativa na camada limite.

Quando a temperatura do dossel foliar atinge a Temperatura do Ponto de Orvalho ($T_{po}$), o vapor d'água condensa em microgotas sobre as folhas.

Importância Fisiológica:
Embora o volume de água (0.2 a 0.5 mm/noite) seja pequeno comparado à necessidade diária da cultura (4 a 6 mm), o orvalho molha a epiderme foliar e preenche os microporos da cutícula. Isso diminui a transpiração matinal precoce e permite que a planta inicie o dia com potencial hídrico foliar elevado.`,
    physiologicalImpacts: `Alívio do estresse hídrico noturno e facilitação da abertura estomática logo aos primeiros raios solares.`,
    formulasAndThresholds: [
      {
        name: 'Aproximação da Temperatura do Ponto de Orvalho (Tpo)',
        formula: 'Tpo ≈ T - ((100 - UR) / 5)',
        explanation: 'Se T = 20°C e UR = 80%, Tpo ≈ 20 - (20/5) = 16°C. Quando a folha esfria até 16°C, o orvalho começa a se depositar.',
      },
    ],
    practicalManagement: [
      'Aproveitamento de Orvalho para Nutrição Foliar: Aplicações no final da tarde se beneficiam do orvalho noturno para manter o adubo solubilizado na folha por mais tempo.',
    ],
    fieldChecklist: [
      'Verificar o valor de Tpo no painel meteorológico da GeaAgro.',
      'Observar a espessura do filme de água na folha nas primeiras horas da manhã.',
    ],
    faq: [
      {
        question: 'O orvalho substitui a irrigação em épocas de seca?',
        answer: 'Não. O volume acumulado é insuficiente para suprir as raízes no solo, agindo apenas como um mitigador temporário do estresse evaporativo das folhas.',
      },
    ],
  },

  // 22
  {
    id: 'mudancas-climaticas-zarc',
    title: 'Mudanças Climáticas e Atualização do Zoneamento (ZARC)',
    category: 'Climatologia Regional & El Niño',
    readTime: '7 min de leitura',
    iconName: 'BarChart2',
    tags: ['ZARC', 'Risco Climático', 'Zoneamento', 'Seguro Agrícola', 'Adaptação'],
    shortDesc: 'Como o aquecimento global e as mudanças nas séries históricas alteram as janelas de plantio seguro.',
    summaryBulletPoints: [
      'O ZARC calcula a probabilidade de perdas agrícolas por seca ou frio com base em 30 anos de dados.',
      'Mudanças nos padrões de chuva estão estreitando as janelas de plantio da safrinha no Centro-Oeste.',
      'Seguradoras e bancos exigem cumprimento rigoroso das datas do ZARC para liberação de crédito (Proagro/PSR).',
      'O ZARC Nível de Manejo agora penaliza solos desprovidos de palhada e descompactação.',
    ],
    technicalConcept: `O Zoneamento Agrícola de Risco Climático (ZARC) é uma ferramenta oficial de política agrícola e gestão de riscos no Brasil, desenvolvida pela Embrapa e Ministério da Agricultura. O sistema cruza séries históricas de precipitação e temperatura (mínimo 30 anos) com tipos de solo (CAD) e fases fenológicas da cultura.

Análise de Probabilidade de Falha Hídrica:
O modelo simula o balanço hídrico diário para cada município e indica os decêndios (períodos de 10 dias) em que a probabilidade de frustração de safra é inferior a 20% (Baixo Risco), entre 20% e 30% (Médio Risco) ou superior a 40% (Alto Risco / Fora do ZARC).

Modernização para ZARC Nível de Manejo (ZARC 4.0):
Anteriormente, o ZARC considerava apenas a textura do solo (Arenoso, Médio, Argiloso). Atualmente, incorpora o Nível de Manejo do Solo (presença de Plantio Direto consolidado, teor de Matéria Orgânica e profundidade de raízes), premiando produtores que adotam boas práticas agrícolas com janelas de plantio mais amplas.`,
    physiologicalImpacts: `Plantios realizados fora do ZARC enfrentam probabilidade elevada de estresse hídrico no florescimento ou congelamento por geadas tardias.`,
    formulasAndThresholds: [
      {
        name: 'Índice de Satisfação Hídrica (ISNA)',
        formula: 'ISNA = ETR / ETP',
        explanation: 'Razão entre Evapotranspiração Real e Potencial. O ZARC exige ISNA ≥ 0.55 na fase de florescimento e enchimento.',
      },
    ],
    practicalManagement: [
      'Consultar a portaria atualizada do ZARC para a sua cultivar e município antes de fechar a compra de sementes.',
      'Registrar os talhões com manejo Nível de Manejo 3 (alta qualidade de solo) para estender a janela de plantio seguro.',
    ],
    fieldChecklist: [
      'Verificar a data limite de semeadura aprovada no aplicativo da GeaAgro.',
      'Emitir laudo de conformidade do ZARC para apresentação ao banco financiador.',
    ],
    faq: [
      {
        question: 'O que acontece se eu plantar 2 dias após o encerramento da janela do ZARC?',
        answer: 'Sua lavoura perde automaticamente a cobertura do seguro agrícola e do Proagro para qualquer sinistro climático decorrente de seca ou geada.',
      },
    ],
  },

  // 23
  {
    id: 'estresse-por-encharcamento-anoxia',
    title: 'Encharcamento do Solo, Anoxia Radicular e Desnitrificação',
    category: 'Manejo Hídrico & Irrigação',
    readTime: '7 min de leitura',
    iconName: 'Droplets',
    tags: ['Encharcamento', 'Anoxia', 'Hipoxia', 'Desnitrificação', 'Drenagem', 'Asfixia'],
    shortDesc: 'A rápida degradação do sistema radicular em solos saturados de água e a perda de Nitrogênio em forma de gás.',
    summaryBulletPoints: [
      'Solos encharcados esgotam todo o Oxigênio ($O_2$) livre dos macroporos em menos de 24 horas.',
      'Anoxia Radicular paralisa a respiração celular das raízes e impede o transporte ativo de nutrientes.',
      'Bactérias anaeróbicas convertem Nitrato ($NO_3^-$) em gás Nitrogênio ($N_2O$ e $N_2$), volatilizando a adubação.',
      'Sintoma visual: Amarelecimento intenso (clorose) e murchamento de plantas sob solo encharcado.',
    ],
    technicalConcept: `O encharcamento do solo ocorre quando todos os poros (macro e microporos) ficam preenchidos por água líquida, eliminando a fase gasosa do solo. Em condições normais, o solo necessita de no mínimo 10 a 15% de porosidade livre de água para permitir a difusão de Oxigênio do ar para as raízes.

Cadeia de Eventos Degenerativos:
1. Hipoxia para Anoxia (0 a 24h): A respiração das raízes e dos microrganismos consome o $O_2$ dissolvido na água. O ambiente torna-se totalmente anóxico (sem oxigênio).
2. Queda do Potencial de Redox ($Eh$): O solo passa de um ambiente oxidativo para um ambiente altamente redutor.
3. Respiração Anaeróbica e Acúmulo de substâncias tóxicas: As raízes passam a fazer fermentação alcoólica, acumulando etanol e acetaldeído, substâncias altamente tóxicas.
4. Perda de Nitrogênio por Desnitrificação: Bactérias anaeróbicas facultativas (*Pseudomonas*, *Paracoccus*) utilizam o Nitrato como aceptor de elétrons, reduzindo o $NO_3^-$ a gás Óxido Nitroso ($N_2O$) e Nitrogênio gasoso ($N_2$), que escapam para a atmosfera.`,
    physiologicalImpacts: `Morte celular da coifa e dos pelos absorventes, murchamento paradoxal (planta murcha no molhado pois os canais de aquaporinas fecham) e deficiência severa de Nitrogênio.`,
    formulasAndThresholds: [
      {
        name: 'Tempo Limite de Tolerância à Anoxia',
        explanation: 'Soja: 48 a 72h | Milho: 24 a 48h | Feijão: 24h | Arroz Irrigado: Altamente adaptado (possui aênquima).',
      },
    ],
    practicalManagement: [
      'Construção de Canais de Drenagem e Sulcos de Sangria em áreas de baixada.',
      'Aplicação de Nitrogênio de Correção em Cobertura (Ureia com inibidor ou Nitrato de Amônio) após a drenagem para recompor as perdas por desnitrificação.',
      'Uso de Subsolagem para romper pé de grade que impede a percolação vertical da água.',
    ],
    fieldChecklist: [
      'Medir o tempo de permanência de lâmina de água parada sobre a superfície do talhão.',
      'Avaliar a cor das raízes (raízes saudáveis são brancas; raízes sob anoxia ficam castanhas/pretas com odor de fermentação).',
    ],
    faq: [
      {
        question: 'Por que a planta de soja murcha no solo encharcado?',
        answer: 'Sem oxigênio, as células da raiz não produzem ATP. Sem ATP, as bombas de aquaporinas (canais de água) travam fechadas, impedindo a entrada de água para a parte aérea.',
      },
    ],
  },

  // 24
  {
    id: 'chuvada-na-colheita-qualidade-graos',
    title: 'Chuvas na Pré-Colheita: Germinação na Espiga e Mofo-Branco',
    category: 'Agrometeorologia Prática',
    readTime: '7 min de leitura',
    iconName: 'CloudRain',
    tags: ['Colheita', 'Chuva', 'Germinação na Espiga', 'Grãos Avariados', 'Qualidade'],
    shortDesc: 'A perda de qualidade comercial, peso hectolítrico (PH) e contaminação por micotoxinas devido ao excesso de umidade.',
    summaryBulletPoints: [
      'Chuvas contínuas no momento da maturação fisiológica reidratam o grão seco no campo.',
      'Viviparidade (Germinação na Espiga/Vagem): O grão ativa a amilase e começa a emitir radícula antes da colheita.',
      'Perda de Peso Hectolítrico (PH) em trigo e milho reduz drasticamente o valor de venda nos moinhos.',
      'Desenvolvimento de micotoxinas (*Aflatoxinas*, *Fumonisisnas*) inviabiliza a comercialização.',
    ],
    technicalConcept: `O período de pré-colheita é a fase final do ciclo agronômico em que os grãos atingiram a maturação fisiológica (máximo acúmulo de matéria seca) e estão perdendo umidade naturalmente no campo para alcançar a umidade de colheita ideal (13 a 14% para soja/milho, 12% para feijão).

Se ocorrerem eventos de chuvas frequentes ou alta umidade relativa (> 85%) por vários dias consecutivos nessa fase:
1. Reidratação e Emissão de Amilases: O grão absorve água por embebição. O Ácido Abscísico (ABA) que mantinha o grão dormente é degradado, e a Giberelina (GA) aciona a quebra do amido pelas enzimas alfa e beta-amilase.
2. Avarias e Racha de Tegumento: As vagens de soja racham (*pod shattering*) e os grãos expandem, ficando expostos a fungos oportunistas (*Phomopsis*, *Fusarium*).
3. Perda de Densidade: O grão incha ao molhar e encolhe ao secar repetidamente, criando cavidades internas que reduzem o Peso Hectolítrico (PH).`,
    physiologicalImpacts: `Grãos ardidos, brotados, mofados e avariados, resultando em descontos severos de classificação e recusa de cargas nas tradings.`,
    formulasAndThresholds: [
      {
        name: 'Umidade Ideal de Entrada das Colhedoras',
        explanation: 'Soja: 14% a 16% (com secagem artificial) | Milho: 16% a 18% | Feijão: 14% a 15%.',
      },
    ],
    practicalManagement: [
      'Uso de Dessecantes Pré-Colheita no Momento Certo (R7.3 na soja): Uniformiza a maturação da lavoura e permite antecipar a colheita antes da chegada de frentes frias chuvosas.',
      'Monitoramento da Previsão do Tempo de Curto Prazo para priorizar a colheita dos talhões mais maduros.',
    ],
    fieldChecklist: [
      'Coletar amostras de grãos para determinar a umidade exata com determinador portátil de bancada.',
      'Inspecionar o percentual de vagens abertas e grãos iniciando germinação.',
      'Dimensionar a velocidade de secagem da fazenda para receber grãos mais úmidos se necessário.',
    ],
    faq: [
      {
        question: 'Vale a pena colher soja com 18% de umidade sob ameaça de chuva contínua?',
        answer: 'Sim! Embora haja o custo da secagem artificial no armazém, é infinitamente mais econômico do que deixar a soja no campo sofrendo germinação na vagem e grãos ardidos.',
      },
    ],
  },

  // 25
  {
    id: 'fogo-queimadas-microclima',
    title: 'Incêndios Florestais, Fogo e Microclima de Solo',
    category: 'Agrometeorologia Prática',
    readTime: '6 min de leitura',
    iconName: 'ShieldAlert',
    tags: ['Fogo', 'Queimada', 'Materia Orgânica', 'Microclima', 'Cerrado', 'Recuperação'],
    shortDesc: 'A destruição da camada orgânica superficial, volatilização do Nitrogênio e alterações térmicas do solo após incêndios.',
    summaryBulletPoints: [
      'Temperaturas do fogo na superfície superam 600°C, destruindo a matéria orgânica (MOS).',
      'Volatilizam 100% do Nitrogênio e Enxofre contidos na palhada e biomassa superficial.',
      'Formação de Camada Hidrofóbica: O solo torna-se repelente à água, impedindo a infiltração de chuvas.',
      'Eliminação completa da microbiologia benéfica (micorrizas e bactérias fixadoras de $N_2$).',
    ],
    technicalConcept: `Os incêndios rurais e queimadas acidentais durante a estação seca (inverno no Centro-Oeste e Sudeste) representam o desastre microclimático mais severo para a física e biologia do solo.

Impactos Físico-Químicos do Fogo:
1. Destruição da Cobertura Morta (Palhada): A camada protetora é convertida em cinzas, elevando a radiação absorvida pelo solo no ciclo seguinte (queda do albedo).
2. Volatilização Térmica de Nutrientes: O Nitrogênio (N) volatiliza em forma de gás a apenas 200°C. O Enxofre (S) volatiliza a 375°C. Apenas Fósforo (P), Cálcio (Ca) e Potássio (K) permanecem nas cinzas em formas altamente solúveis e suscetíveis a levarias pela primeira chuva.
3. Repelência à Água (Hidrofobocidade): Substâncias orgânicas cerosas vaporizadas pelo fogo condensam-se nas partículas minerais de solo a 2-5 cm de profundidade, criando uma camada impermeável que impede a infiltração de água e gera enxurradas gigantescas.`,
    physiologicalImpacts: `Esterilização da camada de 0-5 cm do solo, morte por esterilização térmica dos bioinsumos aplicados e perda do reservatório de retenção hídrica.`,
    formulasAndThresholds: [
      {
        name: 'Perda Nutricional por Hectare Queimado',
        explanation: 'A queimada de 6 t/ha de palhada de milho/brachiaria volatiliza cerca de 40-60 kg de N/ha e 8-12 kg de S/ha.',
      },
    ],
    practicalManagement: [
      'Construção e Manutenção de Aceiros (faixas de solo limpo de 6 a 10 metros de largura) ao redor dos talhões e reservas de APPs.',
      'Re-inoculação Massiva com *Bradyrhizobium* e *Azospirillum* e adição de Composto Orgânico para acelerar a recolonização biológica.',
    ],
    fieldChecklist: [
      'Monitorar focos de calor via satélite no painel de alertas da GeaAgro.',
      'Verificar a prontidão do caminhão pipa e abafadores da brigada interna de incêndio.',
    ],
    faq: [
      {
        question: 'As cinzas da queimada servem como um bom adubo?',
        answer: 'Falsamente sim no curtíssimo prazo devido à liberação pontual de K e Ca solúveis. Porém, a perda definitiva de Matéria Orgânica e Nitrogênio destrói a fertilidade sustentável do solo.',
      },
    ],
  },

  // 26
  {
    id: 'sensores-meteorologicos-calibracao',
    title: 'Micrometeorologia de Precisão: Calibração Padrão WMO',
    category: 'Sensoramento & Micrometeorologia',
    readTime: '7 min de leitura',
    iconName: 'Gauge',
    tags: ['Estação Meteorológica', 'WMO', 'Sensores', 'Calibração', 'Padrão Agronômico'],
    shortDesc: 'Normas de instalação, altura correta e procedimentos de calibração para estações IoT de campo.',
    summaryBulletPoints: [
      'Instalação incorreta de sensores gera erros de até 4°C na temperatura e 30% no vento.',
      'Norma WMO: Anemômetro a 2.0 metros (para irrigação) ou 10.0 metros (para agrometeorologia geral).',
      'Termo-Higrômetro exige Abrigo Meteorológico Ventilado para evitar aquecimento por radiação solar.',
      'Limpeza periódica do Pluviômetro basculante é vital para evitar entupimento por folhas e poeira.',
    ],
    technicalConcept: `A qualidade dos modelos agrometeorológicos (ET₀ Penman-Monteith, DPV, Alerta de Geada, Janela de Aplicação) depende da acurácia dos dados brutos coletados pelos sensores no campo. A Organização Meteorológica Mundial (WMO) e a FAO estabeleceram padrões estritos para a instalação de estações agrometeorológicas.

Requisitos de Padrão de Instalação:
1. Localização do Sítio: Área aberta, coberta por vegetação rasteira curta (gramado), afastada de árvores, edifícios e barreiras por uma distância equivalente a no mínimo 10 vezes a altura do obstáculo.
2. Abrigo Solar (Radshield): O sensor de Temperatura e Umidade deve obrigatoriamente ficar protegido dentro de um escudo de pratos multi-laminados brancos que bloqueia a radiação solar direta e refletida, mantendo a ventilação natural.
3. Altura Padrão dos Sensores:
   - Anemômetro: 2.0 metros do solo para uso em equações de Evapotranspiração (FAO 56).
   - Termo-Higrômetro: 1.5 a 2.0 metros acima do solo.
   - Pluviômetro: Boca de captação nivelada a 1.5 metro de altura.`,
    physiologicalImpacts: `Dados de temperatura incorretos por abrigo deficiente resultam em cálculos errôneos de GDD (Graus-Dia) e erros na aplicação de irrigação.`,
    formulasAndThresholds: [
      {
        name: 'Fórmula de Ajuste de Vento de 10m para 2m',
        formula: 'u2 = u10 × [4.87 / ln(67.8 × 10 - 5.42)]',
        explanation: 'Converte a velocidade do vento medida a 10 metros para a altura padrão de 2 metros (u2 ≈ u10 × 0.748).',
      },
    ],
    practicalManagement: [
      'Calibração Anual de Sensores com padrões de referência certificados.',
      'Nivelamento com bolha de ar do pluviômetro de bascula após ventos fortes.',
    ],
    fieldChecklist: [
      'Verificar se há teias de aranha ou sujeira bloqueando o funil do pluviômetro.',
      'Limpar os pratos do escudo solar do termo-higrômetro.',
      'Verificar a tensão da bateria e funcionamento do painel solar da estação IoT.',
    ],
    faq: [
      {
        question: 'Posso instalar a estação meteorológica no telhado da sede da fazenda?',
        answer: 'Jamais! O telhado de telhas ou zinco irradia calor excessivo durante o dia, alterando completamente a medição de temperatura e umidade relativa do ar.',
      },
    ],
  },

  // 27
  {
    id: 'ciclones-extratropicais-frentes-frias',
    title: 'Ciclones Extratropicais, Frentes Frias e Linhas de Estabilidade',
    category: 'Climatologia Regional & El Niño',
    readTime: '7 min de leitura',
    iconName: 'Wind',
    tags: ['Ciclone Extratropical', 'Frente Fria', 'Vento Forte', 'Sul do Brasil', 'Tempestades'],
    shortDesc: 'A formação de tempestades severas e vendavais provocados por ciclones na costa da América do Sul.',
    summaryBulletPoints: [
      'Ciclones Extratropicais são sistemas de baixa pressão atmosférica associados a frentes frias.',
      'Geram vendavais intensos (> 80 km/h), ressacas marítimas e tempestades severas no Sul e Sudeste.',
      'O deslocamento da Frente Fria marca a transição entre a massa quente tropical e a massa polar.',
      'Alerta de Vendaval: Risco extremo para estufas, pivôs centrais e galpões agrícolas.',
    ],
    technicalConcept: `Um Ciclone Extratropical é um centro de baixa pressão atmosférica que se forma em médias e altas latitudes, impulsionado pelo contraste térmico entre massas de ar tropical quente e massas de ar polar frio (frente polar).

Ciclo de Vida do Sistema:
1. Ciclogênese: Formação do centro de baixa pressão (pressão central caindo abaixo de 1000 hPa), frequentemente sobre o estuário do Rio da Prata ou na costa do Rio Grande do Sul e Uruguai.
2. Frente Fria Associada: Uma linha em formato de cunha onde o ar polar denso e frio avança por baixo do ar quente e úmido, forçando a convecção violenta e a formação de nuvens de tempestade (*Cumulonimbus*).
3. Linhas de Estabilidade: Faixas organizadas de tempestades que se deslocam à frente do ciclone, provocando chuva de granizo e ventos destrutivos (*downbursts*).`,
    physiologicalImpacts: `Dano físico a estruturas agrícolas (rasgamento de plásticos de estufa, tombamento de lançantes de pivô central) e destruição por acamamento de culturas em pé.`,
    formulasAndThresholds: [
      {
        name: 'Escala de Vento Beaufort Agronômica',
        explanation: 'Ventos > 62 km/h (Força 8) causam quebra de galhos grandes e tombamento de pivôs desancorados.',
      },
    ],
    practicalManagement: [
      'Ancoragem Preventiva de Lançantes de Pivô Central na posição paralela ao vento predominante.',
      'Fechamento e Reforço de Cortinas laterais em estufas e galpões avícolas antes da chegada da frente fria.',
    ],
    fieldChecklist: [
      'Consultar cartas de pressão ao nível do mar e imagens de satélite de vapor d\'água.',
      'Verificar a fixação das telhas de galpões e depósitos de insumos.',
    ],
    faq: [
      {
        question: 'Ciclone Extratropical é o mesmo que um Furacão?',
        answer: 'Não. Furacões (Ciclones Tropicais) formam-se em águas tropicais muito quentes sem presença de frente fria. Ciclones extratropicais nascem do contraste entre ar quente e ar frio em médias latitudes.',
      },
    ],
  },

  // 28
  {
    id: 'radiavet-estresse-uvb-flavonoides',
    title: 'Radiação UV-B, Estresse Oxidativo e Síntese de Flavonoides',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'Sun',
    tags: ['UV-B', 'Estresse Oxidativo', 'Flavonoides', 'Foto-Proteção', 'Qualidade de Frutos'],
    shortDesc: 'Como o excesso de radiação ultravioleta danifica o DNA vegetal e aciona respostas defensivas antioxidantes.',
    summaryBulletPoints: [
      'Radiação UV-B (280-315 nm) possui alta energia e causa quebras no DNA e fotosistemas.',
      'Plantas respondem sintetizando flavonoides, antocianas e compostos fenólicos na epiderme.',
      'Em uvas viníferas e frutas vermelhas, o estresse moderado por UV-B aumenta a qualidade organoléptica.',
      'Excesso severo de UV-B paralisa a fotossíntese e causa branqueamento de tecidos.',
    ],
    technicalConcept: `A radiação Ultravioleta B (UV-B, 280-315 nm) representa uma pequena fração do espectro solar que atinge a superfície terrestre, mas possui alta energia fótonica capaz de induzir modificações moleculares diretas em biomoléculas.

Mecanismos de Resposta Vegetal:
1. Percepção via Fotorreceptor UVR8: A luz UV-B é detectada pelo fotorreceptor UVR8 nas células foliares.
2. Ativação da Rota dos Phenylpropanoides: O fotorreceptor sinaliza para o núcleo ativar genes de enzimas chaves como a Fenilalanina Amônia-Líase (PAL).
3. Síntese de "Filtro Solar Natural": A planta acumula flavonoides, antocianas e ésteres de ácido hidroxicocinâmico nos vacúolos das células da epiderme. Esses compostos absorvem a radiação UV-B antes que ela alcance o mesófilo sensível.`,
    physiologicalImpacts: `Em níveis moderados, aumenta a concentração de antioxidantes salutares em frutas (Resveratrol em uvas, Antocianas em mirtilo/morango). Em níveis extremos, destrói o fotossistema II (PSII).`,
    formulasAndThresholds: [
      {
        name: 'Índice UV Agronômico',
        explanation: 'Índice UV > 11 (Extremo) exige monitoramento de estresse foto-oxidativo nas culturas hortícolas.',
      },
    ],
    practicalManagement: [
      'Manejo de Exposição em Fruticultura de Clima Temperado: Desfolha moderada na zona dos cachos em videiras para expor os frutos ao UV-B controlado, estimulando a cor e polifenóis sem queimar.',
    ],
    fieldChecklist: [
      'Monitorar o sensor de radiação UV no módulo meteorológico.',
      'Avaliar a intensidade da coloração de antocianas nos frutos.',
    ],
    faq: [
      {
        question: 'Estufas de policarbonato bloqueiam a radiação UV-B?',
        answer: 'A maioria dos filmes plásticos e placas de policarbonato convencionais bloqueia 90-99% do UV-B, o que pode reduzir a coloração vermelha de alguns frutos se não forem usados filmes transparentes ao UV.',
      },
    ],
  },

  // 29
  {
    id: 'balanco-carbono-respiracao-noite',
    title: 'Temperatura Noturna Elevada e Respiração de Manutenção',
    category: 'Fisiologia & Graus-Dia',
    readTime: '6 min de leitura',
    iconName: 'Thermometer',
    tags: ['Temperatura Noturna', 'Respiração', 'Balanço de Carbono', 'Produtividade', 'Noites Quentes'],
    shortDesc: 'Por que noites quentes reduzem o rendimento de grãos ao acelerar a queima de açúcares acumulados no dia.',
    summaryBulletPoints: [
      'Durante o dia a planta realiza Fotossíntese (ganha açúcar) e Respiração.',
      'À noite não há luz: a planta realiza apenas Respiração de Manutenção (consome açúcar).',
      'Temperaturas noturnas elevadas (> 22°C) dobram a taxa respiratória noturna.',
      'Resultado: Menos fotoassimilados sobram para enchimento de grãos, tubérculos e frutos.',
    ],
    technicalConcept: `O rendimento líquido final de matéria seca de qualquer lavoura depende da equação do Balanço Diário de Carbono:
Ganho Líquido de Carbono = Fotossíntese Diurna - (Respiração Diurna + Respiração Noturna)

A Respiração Noturna de Manutenção:
À noite, na ausência de radiação solar para a fotossíntese, as plantas precisam continuar vivas, mantendo gradientes iônicos, reparando proteínas e transportando açúcares pelo floema. A energia para esse trabalho celular é obtida queimando (oxidando) a glicose e amido sintetizados durante o dia.

O Efeito da Temperatura Noturna (Q10):
A taxa das reações respiratórias enzimáticas duplica para cada elevação de 10°C na temperatura (Coeficiente Q10 ≈ 2.0).
- Em noites amarenas (15 a 18°C): A respiração noturna consome apenas 15-20% do carboidrato produzido no dia.
- Em noites muito quentes (> 24°C): A respiração noturna acelera violentamente, podendo queimar de 40 a 60% de todo o açúcar produzido no dia.`,
    physiologicalImpacts: `Chop (redução da densidade dos grãos), grãos chochos, menor teor de amido no milho/arroz e menor acúmulo de brix (açúcar) em frutas e cana.`,
    formulasAndThresholds: [
      {
        name: 'Regra da Respiração Q10',
        formula: 'R2 = R1 × Q10^((T2 - T1) / 10)',
        explanation: 'Mostra o aumento exponencial da perda respiratória noturna com a elevação da temperatura.',
      },
    ],
    practicalManagement: [
      'Seleção de Genótipos Tolerantes a Noites Quentes em regiões de baixa altitude e clima quente.',
      'Adequação de Época de Semeadura para coincidir o enchimento de grãos com os meses de noites mais ameno no outono.',
    ],
    fieldChecklist: [
      'Acompanhar o gráfico de temperatura mínima noturna na estação da GeaAgro.',
      'Avaliar o peso de 1.000 grãos no momento da colheita.',
    ],
    faq: [
      {
        question: 'Por que a batata e a cebola não produzem bem em regiões com noites muito quentes?',
        answer: 'Porque o consumo respiratório noturno consome toda a reserva de carboidratos, impedindo que a planta transloque açúcares para o enchimento dos tubérculos e bulbos.',
      },
    ],
  },

  // 30
  {
    id: 'indices-secas-spei-pdi',
    title: 'Índices Avançados de Seca (SPEI, SPI e Palmer) na Monitoria',
    category: 'Climatologia Regional & El Niño',
    readTime: '8 min de leitura',
    iconName: 'BarChart2',
    tags: ['Seca', 'SPEI', 'SPI', 'Monitoramento', 'Climatologia', 'Indicadores'],
    shortDesc: 'Uso de estatística climatológica de longo prazo para diferenciar secas meteorológicas, agrícolas e hidrológicas.',
    summaryBulletPoints: [
      'SPI (Standardized Precipitation Index) mede desvios padronizados de chuva em relação à média histórica.',
      'SPEI (Standardized Precipitation Evapotranspiration Index) inclui o efeito do aquecimento e da ET₀.',
      'Seca Agrícola ocorre quando a umidade do solo cai a níveis que afetam a produtividade da cultura.',
      'Esses índices auxiliam no acionamento de declarações de emergência e planejamento multianual.',
    ],
    technicalConcept: `A seca é um fenômeno climático complexo e insidioso, categorizado tradicionalmente em quatro tipos progressivos:
1. Seca Meteorológica: Deficiência sustentada de precipitação em relação à média climatológica histórica de uma região.
2. Seca Agrícola: Ocorre quando a umidade disponível no perfil do solo não supremo a demanda evapotranspiratória das culturas.
3. Seca Hidrológica: Redução nos níveis de reservatórios, açudes, rios e aquíferos subterrâneos.
4. Seca Socioeconômica: Impacto do déficit hídrico no abastecimento urbano e economia agrícola.

Índices Monitorados pela GeaAgro:
- SPI (Índice Padronizado de Precipitação): Considera apenas os dados de chuva em escalas de 1, 3, 6, 12 e 24 meses.
- SPEI (Índice Padronizado de Precipitação e Evapotranspiração): O estado da arte em monitoramento. Considera o balanço entre Precipitação e ET₀. Sensível ao aumento de temperatura provocado pelo aquecimento global.`,
    physiologicalImpacts: `Valores de SPEI < -1.5 indicam seca severa a extrema, exigindo alteração drástica nas estratégias de planejamento de safra.`,
    formulasAndThresholds: [
      {
        name: 'Classificação Padrão de SPEI / SPI',
        explanation: '≥ +2.0: Extremamente Úmido | -0.99 a +0.99: Normal | -1.0 a -1.49: Seca Moderada | -1.5 a -1.99: Seca Severa | ≤ -2.0: Seca Extrema.',
      },
    ],
    practicalManagement: [
      'Uso do SPEI de 3 meses para tomada de decisão sobre o plantio da segunda safra (safrinha).',
      'Dimensionamento de Reservatórios de Irrigação com base no histórico do SPI de 12 meses.',
    ],
    fieldChecklist: [
      'Consultar o mapa de anomalia SPEI regional integrado no sistema GeaAgro.',
      'Avaliar a tendência do índice para os próximos 30-60 dias.',
    ],
    faq: [
      {
        question: 'Por que o SPEI é superior ao SPI em regiões quentes como o Cerrado e Nordeste?',
        answer: 'Porque o SPI olha apenas se choveu ou não. O SPEI considera que, se chover 50mm em um local quente de alta evapotranspiração (ET₀ = 8mm/dia), o solo secará muito mais rápido do que na mesma chuva em local frio.',
      },
    ],
  },
];
