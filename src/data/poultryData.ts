import { PoultryShed, PoultryBatch, PoultryDisease, IEA_Result } from '../types/poultry';
import bronqInfecImg from '../assets/images/bronq_infec.jpg';
import gumboroImg from '../assets/images/gumboro.jpg';
import newcastleDisImg from '../assets/images/newcastle_dis.jpg';
import boubaAviarImg from '../assets/images/bouba_aviar.jpg';
import coccidPoultrImg from '../assets/images/coccid_poultr.jpg';
import corizaPoultrImg from '../assets/images/coriza_poultr.jpg';

export const INITIAL_POULTRY_SHEDS: PoultryShed[] = [];

export const INITIAL_POULTRY_BATCHES: PoultryBatch[] = [];

export const POULTRY_DISEASES: PoultryDisease[] = [
  {
    id: 'd1',
    name: 'Bronquite Infecciosa das Aves',
    agent: 'Gama-coronavirus (VBI)',
    image: bronqInfecImg,
    symptoms: 'Estertores respiratórios (roncos), tosse, espirros, corrimento nasal, olhos lacrimejantes e prostração severa. Em matrizes e poedeiras, causa uma queda drástica na postura (até 50%) e ovos com casca deformada, áspera, fina ou "emborrachada", com clara extremamente líquida e aquosa.',
    etiology: 'Vírus da Bronquite Infecciosa (VBI), um Coronavírus da família Coronaviridae de fita simples de RNA envelopado. Possui extrema variabilidade genética devido a mutações e recombinações frequentes, gerando múltiplos sorotipos e variantes antigênicas (ex: cepa Massachussets e variantes locais BR). Replica-se fortemente no epitélio ciliado respiratório, no oviduto e, em algumas variantes nefropatogênicas, nos túbulos renais causando nefrite.',
    control: 'Não há tratamento antiviral específico aplicável. O controle baseia-se em biosseguridade estrita: vazio sanitário rigoroso de pelo menos 14 dias entre lotes, restrição absoluta ao trânsito de pessoas/veículos, arcos de desinfecção operantes e eliminação rápida de fômites contaminados. Desinfetantes clorados, iodados ou à base de quaternários de amônia e glutaraldeído são altamente eficazes contra o envelope viral.',
    care: 'Suplementação ativa de eletrólitos, aminoácidos e polivitamínicos na água de bebida para combater o estresse hídrico e metabólico das aves afetadas. Ajuste fino da temperatura de aquecimento do galpão, evitando correntes de ar frio que sobrecarregam o sistema respiratório. Inalações ou nebulizações de óleos essenciais expectorantes (como eucalipto ou mentol) podem aliviar o muco traqueal.',
    management: 'Imunização vacinal estratégica com vacinas vivas atenuadas aplicadas via spray ou água de bebida na fase jovem (ex: com 1 dia no incubatório e reforços), e vacinas inativadas oleosas antes do período de postura. Monitorar com precisão o fluxo de ventilação mínima do galpão para manter os níveis de amônia abaixo de 10 ppm, impedindo a paralisia dos cílios traqueais que facilita a entrada do vírus e de bactérias secundárias (Escherichia coli).',
    transmission: 'Inalação de aerossóis e gotículas respiratórias expelidas por aves infectadas, dispersão de poeira da cama contaminada pelo vento, e transporte mecânico por caixas, caminhões, calçados e equipamentos.',
    mortality: 'Baixa em aves adultas (menor que 1%), mas pode chegar a 25-30% em pintinhos de corte se houver complicação por cepas nefropatogênicas que induzem uremia profunda ou por colibacilose secundária.',
    incubation: '18 a 36 horas (propagação extremamente explosiva no lote).'
  },
  {
    id: 'd2',
    name: 'Doença de Gumboro (Infecciosa da Bolsa)',
    agent: 'Avibirnavirus (VDG)',
    image: gumboroImg,
    symptoms: 'Prostração profunda, aves apáticas com cabeça baixa, penas do pescoço arrepiadas, tremores, diarreia aquosa esbranquiçada a amarelada com acúmulo de urato nas penas cloacais, desidratação severa e debilidade geral. As aves afetadas buscam se isolar nos cantos do galpão e apresentam autocontrole de dor cutucando a região cloacal.',
    etiology: 'Vírus da Doença de Gumboro (VDG), um vírus sem envelope, com genoma de RNA de fita dupla segmentado, pertencente à família Birnaviridae. É extraordinariamente resistente a variações de pH, calor e desinfetantes comuns. O vírus infecta e destrói de forma lítica os linfócitos B imaturos dentro da Bolsa de Fabrício (Bursa), gerando atrofia linfoide severa e imunossupressão permanente se a infecção ocorrer nas primeiras semanas.',
    control: 'Erradicação difícil devido à estabilidade do vírus. Exige o uso exclusivo de desinfetantes altamente potentes na desinfecção pós-lote, como misturas de glutaraldeído, formaldeído, e formulações de peróxidos ativos (Monopersulfato de Potássio). O isolamento rígido da granja e o controle microbiológico de roedores e insetos (que agem como reservatórios mecânicos) são cruciais.',
    care: 'Fornecer eletrólitos purificados combinados com dextrose na água para reidratar as aves rapidamente e restaurar o equilíbrio osmótico. Evitar rações hiperproteicas durante a fase aguda da infecção para poupar os rins sobrecarregados pela excreção de uratos e imunocomplexos que causam nefrite obstrutiva.',
    management: 'Imunização baseada em duas frentes fundamentais: vacinação hiperimune das matrizes para transferir altos títulos de anticorpos maternais aos pintinhos (imunidade passiva protetora nas primeiras 3 semanas), e vacinação direta dos pintinhos de corte na granja por via de água de bebida, spray, ou injeção in-ovo com vacinas de complexo imune ou vacinas recombinantes vetoradas (HVT-IBD) para quebrar as janelas imunológicas de risco.',
    transmission: 'Via fecal-oral através da ingestão de água, cama, ração contaminadas, ou coprofagia. O vírus permanece viável e infectante nas instalações e fômites por mais de 120 dias.',
    mortality: 'Tipicamente entre 5% e 30% em lotes comerciais, mas surtos provocados por cepas hipervirulentas (vvIBD) podem desencadear perdas de 50% a 60% de forma fulminante.',
    incubation: '2 a 3 dias.'
  },
  {
    id: 'd3',
    name: 'Doença de Newcastle',
    agent: 'Paramyxovirus Aviário Tipo 1 (APMV-1)',
    image: newcastleDisImg,
    symptoms: 'Sintomas triplos severos: Respiratórios (estertores, tosse, respiração com bico aberto), Digestivos (diarreia aquosa esverdeada brilhante e fétida) e Neurológicos marcantes (torcicolo com pescoço completamente virado para trás, tremores de cabeça, paralisia de pernas e asas, ataxia e andar para trás). Queda total na postura em poedeiras com ovos moles.',
    etiology: 'Vírus da Doença de Newcastle (VDN), um vírus envelopado de RNA de fita simples e sentido negativo, pertencente à família Paramyxoviridae, gênero Orthonavirus. Classifica-se em três patotipos: lentogênico (baixo poder patogênico, usado em vacinas), mesogênico (moderada gravidade) e velogênico (altamente letal, afetando múltiplos órgãos). As cepas velogênicas viscerotrópicas causam hemorragias massivas no proventrículo e placas de Peyer intestinais.',
    control: ' Newcastle é uma enfermidade de NOTIFICAÇÃO COMPULSÓRIA IMEDIATA às autoridades de defesa sanitária (MAPA). Havendo suspeita ou confirmação de cepas velogênicas de campo, aplica-se isolamento total da área, sacrifício sanitário de todo o lote, queima e enterrio controlado de carcaças, vazio sanitário prolongado e desinfecção maciça com soda cáustica ou compostos fenólicos.',
    care: 'Não são permitidos tratamentos ou cuidados paliativos em surtos de campo patogênicos devido aos protocolos nacionais e internacionais de erradicação obrigatória. Para reações pós-vacinais de cepas lentogênicas, pode-se usar vitaminas de suporte (A, C, D e E) e otimização térmica da cama.',
    management: 'Biosseguridade de nível industrial: uso obrigatório de telas de malha fina (máximo 1 polegada / 2,54 cm) nos galpões para proibir a entrada de aves silvestres livres e roedores. Vacinação preventiva obrigatória e monitorada por sorologia oficial, combinando vacinas vivas (cepas lentogênicas como LaSota ou B1 via água/óculo) e bacterinas inativadas emulsionadas em óleo.',
    transmission: 'Contato direto com secreções traqueais, conjuntivais e fezes de aves doentes. Aerossóis de curta distância dentro de galpões integrados e disseminação por caminhões de ração contaminados.',
    mortality: 'Pode atingir até 100% em infecções causadas por estirpes velogênicas viscerotrópicas ou neurotrópicas.',
    incubation: '2 a 15 dias (média de 5 a 6 dias).'
  },
  {
    id: 'd4',
    name: 'Bouba Aviária (Fowl Pox / Varíola)',
    agent: 'Avipoxvirus (Vírus da Bouba)',
    image: boubaAviarImg,
    symptoms: 'Dividida em duas apresentações clínicas distintas: Forma Cutânea (Seca), com nódulos amarelados que evoluem para crostas escuras, rugosas e ásperas semelhantes a verrugas localizadas na crista, barbelas, pálpebras, bico e pernas. Forma Diftérica (Úmida), com placas e membranas amareladas fibrosas e crupais aderidas à boca, língua, esôfago e traqueia, que dificultam a respiração e alimentação.',
    etiology: 'Vírus da Bouba Aviária, um vírus de DNA dupla fita com envelope grande e complexo, pertencente à família Poxviridae, gênero Avipoxvirus. É um patógeno altamente resistente a dessecação e calor moderado. Penetra no organismo das aves através de microlesões e abrasões na pele ou pela picada direta de insetos vetores, infectando o tecido epitelial.',
    control: 'Tratamento de suporte com isolamento imediato das aves mais afetadas para conter o contágio direto. Aplicação tópica de vaselina iodada, glicerina com iodo a 10% ou pomadas cicatrizantes antissépticas diretamente sobre as crostas cutâneas para acelerar a queda. O controle químico e biológico de mosquitos transmissores e moscas nos arredores dos galpões é imperativo.',
    care: 'Aves com a forma diftérica requerem alimentação com ração úmida, pastosa e altamente palatável para viabilizar a deglutição sem traumatizar a mucosa oral. Limpeza, troca constante e cloração adequada da água de bebida (3 a 5 ppm de cloro livre) para evitar a proliferação do vírus na água compartilhada.',
    management: 'Vacinação preventiva sistemática de todo o plantel por meio de punção na membrana da asa ("wing-web method") com agulha de fenda dupla sulcada, normalmente a partir de 21 dias de idade ou antecipada em regiões de alta densidade de mosquitos. Checagem obrigatória da reação vacinal ("take") entre o 7º e o 10º dia após a vacinação; a ausência de um pequeno nódulo cicatricial no local indica falha na aplicação.',
    transmission: 'Transmitido principalmente por picada mecânica de mosquitos hematófagos (Culex spp., Aedes spp.) e moscas, contato direto com crostas descamadas que caem na cama e permanecem infectantes por meses, e brigas/bicadas entre as aves.',
    mortality: 'Geralmente muito baixa na forma cutânea (1% a 5%), mas severa e fatal na forma diftérica úmida, podendo alcançar 40-50% devido à asfixia provocada por obstrução mecânica da traqueia.',
    incubation: '4 a 10 dias.'
  },
  {
    id: 'd5',
    name: 'Coccidiose Aviária',
    agent: 'Protozoários do Gênero Eimeria',
    image: coccidPoultrImg,
    symptoms: 'Diarreia mucoide profusa com presença de sangue vivo ou coloração "chocolate", aves pálidas (cristas e barbelas descoradas indicando anemia profunda), desidratação, penas totalmente eriçadas, perda de peso acelerada, apatia extrema, amontoamento sob fontes de calor e atraso acentuado no desenvolvimento zootécnico.',
    etiology: 'Infecção parasitária intestinal causada por protozoários coccídeos intracelulares obrigatórios do gênero Eimeria. As principais espécies na avicultura comercial são Eimeria tenella (corta os cecos provocando hemorragia fatal), Eimeria necatrix (intestino médio), Eimeria acervulina (intestino anterior com estrias transversais brancas) e Eimeria maxima (intestino médio com muco cor de laranja). Multiplicam-se agressivamente nas células epiteliais do lúmen intestinal.',
    control: 'Uso profilático contínuo de coccidiostáticos na ração (ionóforos como Monensina, Salinomicina ou químicos como Nicarbazina) respeitando o período de carência pré-abate. Em caso de surto clínico instaurado, administrar tratamento curativo imediato via água de bebida com coccidicidas à base de Toltrazuril, Amprólio ou Sulfas associadas a Trimetoprim por 3 a 5 dias.',
    care: 'Suplementar o lote afetado com doses elevadas de Vitamina K na água de bebida para auxiliar na síntese de protrombina e estancar as hemorragias intestinais internas. Adicionar Vitamina A para otimizar o processo de regeneração e cicatrização celular do epitélio intestinal danificado, devolvendo a capacidade de absorção de nutrientes.',
    management: 'Controle absoluto da umidade da cama do aviário (manter sempre entre 20% e 25%), revolvendo a cama compactada e corrigindo vazamentos de bicos nipple imediatamente, pois os oocistos necessitam de calor e umidade elevada para esporular (tornar-se infectantes) no ambiente. Utilizar vacinas com oocistos viáveis atenuados em poedeiras comerciais e matrizes para conferir imunidade natural precoce.',
    transmission: 'Ingestão oral ativa de oocistos esporulados espalhados na cama úmida, calçados contaminados de operários ou equipamentos sujos.',
    mortality: 'Pode variar de 5% a 50% em lotes não tratados ou infectados por Eimeria tenella e Eimeria necatrix de alta virulência.',
    incubation: '4 a 7 dias (tempo de ciclo de vida biológica dos protozoários).'
  },
  {
    id: 'd6',
    name: 'Coriza Infecciosa das Aves',
    agent: 'Bactéria Avibacterium paragallinarum',
    image: corizaPoultrImg,
    symptoms: 'Espirros constantes, corrimento nasal fétido (odor característico de pus e-fétido ou azedo), edema facial severo simétrico ou assimétrico ("síndrome da cabeça inchada"), pálpebras coladas por secreção ocular purulenta acumulada que endurece como massas queijeiras no saco conjuntival, prostração e queda instantânea na ingestão de ração.',
    etiology: 'Doença bacteriana aguda causada pela bactéria Gram-negativa, anaeróbia facultativa e altamente exigente de fatores de crescimento Avibacterium paragallinarum (anteriormente denominada Haemophilus paragallinarum). O patógeno possui três sorogrupos imunologicamente distintos (A, B e C), o que exige que a imunização cubra as cepas específicas que circulam na região.',
    control: 'Tratamento imediato com antibióticos de amplo espectro adicionados à água de bebida ou por via injetável individual em plantéis menores (ex: Enrofloxacina, Amoxicilina, Sulfas potencializadas ou Eritromicina) sob orientação veterinária estrita. Cloração contínua da água de bebida (3-5 ppm) para inibir a transmissão horizontal entre aves que utilizam o mesmo cano.',
    care: 'Uso de expectorantes mucolíticos na água ou nebulizados para ajudar a desobstruir as vias aéreas superiores e os seios infraorbitais. Em plantéis de alta seleção, realizar a higienização física das crostas oculares e das narinas das aves mais debilitadas com soluções fisiológicas mornas.',
    management: 'Imunização preventiva de poedeiras e reprodutoras com vacinas inativadas (bacterinas) com duas doses injetáveis antes do início da produção de ovos. Adotar criteriosamente o manejo de núcleo único "tudo dentro, tudo fora" (All-In All-Out), prevenindo de forma absoluta a manutenção de aves portadoras crônicas ou idades mistas que recirculam a bactéria continuamente na propriedade.',
    transmission: 'Contato direto focinho-a-focinho entre aves sadias e aves portadoras sadias ou doentes, inalação de gotículas suspensas no ar, e consumo de água contaminada com exsudato nasal bacteriano.',
    mortality: 'Baixa (geralmente entre 1% e 10%), mas a morbidade é altíssima (até 100% das aves no aviário adoecem), acarretando perdas econômicas maciças por refugo, retardo no crescimento e quebra drástica na taxa de postura.',
    incubation: '1 a 3 dias.'
  }
];

// Cálculo do Índice de Eficiência Avícola (IEA) para Corte
export function calculateIEA(batch: PoultryBatch, totalFeedKg: number, slaughterWeightKg: number, ageDays: number): IEA_Result {
  const mortalityRate = ((batch.initialQuantity - batch.currentQuantity) / batch.initialQuantity) * 100;
  const viability = 100 - mortalityRate;
  
  // CA = Consumo de Ração / Peso Vivo
  const feedConversion = (totalFeedKg / batch.initialQuantity) / slaughterWeightKg;

  // IEA = (Viabilidade * Peso Médio) / (Idade * Conversão Alimentar) * 100
  const ieaScore = (viability * slaughterWeightKg * 100) / (ageDays * feedConversion);

  let status: IEA_Result['status'] = 'Atenção';
  if (ieaScore >= 400) status = 'Excelente';
  else if (ieaScore >= 350) status = 'Bom';
  else if (ieaScore < 300) status = 'Crítico';

  return {
    score: Number(ieaScore.toFixed(0)),
    feedConversion: Number(feedConversion.toFixed(2)),
    mortalityRate: Number(mortalityRate.toFixed(2)),
    uniformity: (batch?.weighings && batch.weighings.length > 0) ? (batch.weighings[batch.weighings.length - 1]?.uniformity || 0) : 0,
    status
  };
}
