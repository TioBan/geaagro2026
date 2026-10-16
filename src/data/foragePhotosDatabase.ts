import brachiariaMaranduImg from '../assets/images/brach_marandu.jpg';
import brachiariaPiataImg from '../assets/images/brach_piata.jpg';
import brachiariaDecumbensImg from '../assets/images/brach_decumb.jpg';
import brachiariaRuziziensisImg from '../assets/images/brach_ruziz.jpg';
import brachiariaHumidicolaImg from '../assets/images/brach_humidi.jpg';
import panicumMombacaImg from '../assets/images/panic_mombaca.jpg';
import panicumTanzaniaImg from '../assets/images/panic_tanzania.jpg';
import capiacuSilageImg from '../assets/images/capiacu_sil.jpg';
import brsKurumiImg from '../assets/images/brs_kurumi.jpg';
import tiftonCynodonImg from '../assets/images/tifton_cynodon.jpg';
import andropogonImg from '../assets/images/andropogon.jpg';
import aveiaWinterImg from '../assets/images/aveia_winter.jpg';
import estilosantesLegumeImg from '../assets/images/estilosantes.jpg';
import alfalfaHayCropImg from '../assets/images/alfalfa_hay.jpg';

export interface ForageRealPhotoData {
  primaryPhotoUrl: string;
  fieldAngleDescription: string;
  macroZoomTitle: string;
  macroZoomDescription: string;
  drySeasonPhotoNote: string;
  tagLocation: string;
  botanicalZoomDetails: {
    collarAndLigule: string;
    leafTexture: string;
    seedheadVisual: string;
  };
}

export const FORAGE_REAL_PHOTOS_MAP: Record<string, ForageRealPhotoData> = {
  // 1. Marandu
  marandu: {
    primaryPhotoUrl: brachiariaMaranduImg,
    fieldAngleDescription: 'Pasto de Braquiarão (Marandu) no auge vegetativo das águas, altura de entrada 35 cm, touceiras vigorosas verde-esmeralda sob sol pleno.',
    macroZoomTitle: 'Lâmina Foliar & Bainha Pubescente',
    macroZoomDescription: 'Folhas largas com pilosidade curta na face superior e colar membranoso bem demarcado.',
    drySeasonPhotoNote: 'Excelente retenção foliar no início da seca antes do florescimento.',
    tagLocation: 'Cerrado • Campo Grande / MS (Embrapa Gado de Corte)',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula curta membranosa com aurícula discreta',
      leafTexture: 'Lâmina de 1,5 a 3,0 cm de largura, pilosa ao toque',
      seedheadVisual: 'Racemo unilateral com espiguetas verde-amareladas',
    },
  },

  // 2. Piatã
  piata: {
    primaryPhotoUrl: brachiariaPiataImg,
    fieldAngleDescription: 'Talhão de BRS Piatã em consórcio ILPF com colmos finos eretos e abundante perfilhamento basal em fazenda no Cerrado.',
    macroZoomTitle: 'Colmos Finos e Entrenós Curtos',
    macroZoomDescription: 'Arquitetura ereta que facilita a penetração de luz e dessecação uniforme para plantio direto.',
    drySeasonPhotoNote: 'Mantém verde superior ao Marandu tradicional durante o veranico.',
    tagLocation: 'Fazenda Experimental • Rondonópolis / MT',
    botanicalZoomDetails: {
      collarAndLigule: 'Bainhas glabras verde-brilhantes',
      leafTexture: 'Folhas eretas com alta relação folha:colmo',
      seedheadVisual: 'Racemos esguios com maturação concentrada de sementes',
    },
  },

  // 3. Paiaguás
  paiaguas: {
    primaryPhotoUrl: brachiariaPiataImg,
    fieldAngleDescription: 'Pasto de BRS Paiaguás em solo arenoso, demonstrando densidade extraordinária de perfilhos e tolerância hídrica.',
    macroZoomTitle: 'Densidade de Perfilhos Basais',
    macroZoomDescription: 'Touceiras densas com folhas macias verde-claras e grande tolerância ao estresse hídrico da seca.',
    drySeasonPhotoNote: 'Campeão nacional de acúmulo de biomassa e ganho de peso na seca.',
    tagLocation: 'Região Arenosa • Noroeste do Paraná / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar delicado e lígula ciliada',
      leafTexture: 'Lâminas estreitas a médias de rápida ingestão',
      seedheadVisual: 'Racemos eretos com sementes de alto vigor',
    },
  },

  // 4. Xaraés
  xaraes: {
    primaryPhotoUrl: brachiariaMaranduImg,
    fieldAngleDescription: 'Touceiras gigantes de Xaraés / MG-5 no período chuvoso com folhas largas arqueadas e rebrota rápida.',
    macroZoomTitle: 'Folhas Gigantescas e Colmos Robustos',
    macroZoomDescription: 'Lâminas de até 4 cm de largura com suculência elevada e rebrote explosivo após o pastejo.',
    drySeasonPhotoNote: 'Florescimento tardio mantém a qualidade nutricional por mais semanas no outono.',
    tagLocation: 'Vale do Araguaia • Goiás',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar proeminente com pubescência moderada',
      leafTexture: 'Folhas coriáceas largas e vigorosas',
      seedheadVisual: 'Racemos longos e espiguetas arroxeadas',
    },
  },

  // 5. Ipyporã
  ipypora: {
    primaryPhotoUrl: brachiariaPiataImg,
    fieldAngleDescription: 'Tapete contínuo do híbrido BRS Ipyporã com 100% de cobertura de solo e ausência de ataque de cigarrinhas.',
    macroZoomTitle: 'Folhas Aveludadas Ultratenras',
    macroZoomDescription: 'Textura aveludada muito macia que propicia altíssimo consumo voluntário por bezerros e novilhas.',
    drySeasonPhotoNote: 'Porte prostrado evita perda de solo por erosão na transição de safra.',
    tagLocation: 'Polo Pecuário • Uberaba / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Bainha com pelos sedosos macios',
      leafTexture: 'Textura aveludada hipoalergênica',
      seedheadVisual: 'Panícula híbrida compacta',
    },
  },

  // 6. Cayman
  cayman: {
    primaryPhotoUrl: brachiariaPiataImg,
    fieldAngleDescription: 'Pastagem do híbrido Cayman exibindo estolões rasteiros que se adaptam tanto a veranicos quanto a solos temporariamente úmidos.',
    macroZoomTitle: 'Arquitetura Dupla Decumbente & Touceira',
    macroZoomDescription: 'Desenvolve estolões vigorosos em resposta ao excesso de umidade ou pastejo raso.',
    drySeasonPhotoNote: 'Excelente persistência em microclimas variados.',
    tagLocation: 'Vale do Paraíba • São Paulo',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula curta e nós enraizantes',
      leafTexture: 'Folhas tenras verde-intensas',
      seedheadVisual: 'Espiguetas férteis híbridas',
    },
  },

  // 7. Basilisk Decumbens
  basilisk_decumbens: {
    primaryPhotoUrl: brachiariaDecumbensImg,
    fieldAngleDescription: 'Encosta de morro coberta com Decumbens (Basilisk) com enraizamento nos nós e proteção absoluta anti-erosão.',
    macroZoomTitle: 'Estolões Enraizantes nos Nós',
    macroZoomDescription: 'Nós pubescentes que lançam raízes vigorosas ao tocar o solo úmido, fechando encostas íngremes.',
    drySeasonPhotoNote: 'Excelente rusticidade em solos ácidos com alumínio tóxico.',
    tagLocation: 'Zona da Mata • Minas Gerais',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pilosa com bainhas aveludadas',
      leafTexture: 'Folhas macias pilosas em ambas as faces',
      seedheadVisual: '2 a 4 racemos característicos decumbentes',
    },
  },

  // 8. Ruziziensis
  ruziziensis: {
    primaryPhotoUrl: brachiariaRuziziensisImg,
    fieldAngleDescription: 'Palhada e pasto de Ruziziensis em sistema de integração e dessecação uniforme sobre restolho de safrinha.',
    macroZoomTitle: 'Colmos Suculentos de Rápida Decomposição',
    macroZoomDescription: 'Folhas macias verde-alface claro de fácil colheita animal e reciclagem acelerada de Potássio (K).',
    drySeasonPhotoNote: 'A forrageira campeã de dessecação para semeadura direta de soja.',
    tagLocation: 'Planalto Central • Rio Verde / GO',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar estreito e lígula membranosa suave',
      leafTexture: 'Lâminas extremamente tenras e suculentas',
      seedheadVisual: 'Racemos abertos com espiguetas límpidas',
    },
  },

  // 9. Humidicola Comum
  humidicola_comum: {
    primaryPhotoUrl: brachiariaHumidicolaImg,
    fieldAngleDescription: 'Várzea úmida no Pantanal coberta por Humidicola com estolões avermelhados vigorosos e tolerância ao alagamento.',
    macroZoomTitle: 'Estolões Rizomatosos Roxos',
    macroZoomDescription: 'Rizomas lenhosos que formam uma malha impenetrável resistente ao pisoteio pesado de bovinos e búfalos.',
    drySeasonPhotoNote: 'Suporta solos encharcados por meses sem morte de touceiras.',
    tagLocation: 'Pantanal Mato-Grossense • Corumbá / MS',
    botanicalZoomDetails: {
      collarAndLigule: 'Bainha fortemente comprimida arroxeada',
      leafTexture: 'Folhas estreitas, rígidas e lanceoladas',
      seedheadVisual: 'Racemos finos com espiguetas avermelhadas',
    },
  },

  // 10. BRS Tupi
  brs_tupi: {
    primaryPhotoUrl: brachiariaHumidicolaImg,
    fieldAngleDescription: 'Piquete de BRS Tupi em solo hidromórfico com folhas mais largas, rápida germinação e pegamento superior.',
    macroZoomTitle: 'Rápido Enraizamento Estolonífero',
    macroZoomDescription: 'Emissão precoce de raízes com maior teor de proteína e menor dormência de sementes.',
    drySeasonPhotoNote: 'Mantém pastejo verde em áreas de baixada úmida.',
    tagLocation: 'Região Norte • Ji-Paraná / RO (Embrapa Rondônia)',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar nítido e nós enraizantes verdes',
      leafTexture: 'Folhas verde-escuras mais largas',
      seedheadVisual: 'Espiguetas férteis de baixa dormência',
    },
  },

  // 11. Mombaça
  mombaca: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Touceiras gigantescas de Capim Mombaça em pastejo rotacionado intensivo adubado (altura de entrada 90 cm).',
    macroZoomTitle: 'Folhas Longas e Lâmina Larga de 4 cm',
    macroZoomDescription: 'Densa massa foliar verde-escura reluzente com a mais alta capacidade de suporte de gado de corte e leite.',
    drySeasonPhotoNote: 'Exige manejo rigoroso na altura de entrada para não virar colmo fibroso.',
    tagLocation: 'Módulo Rotacionado Intensivo • Piracicaba / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranoso-ciliada com nós arroxeados',
      leafTexture: 'Lâminas longas de até 1 metro de comprimento',
      seedheadVisual: 'Panícula aberta ampla e ramificada',
    },
  },

  // 12. Tanzânia
  tanzania: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Touceiras harmoniosas de Tanzânia-1 em piquete de gado leiteiro com excelente relação folha/colmo.',
    macroZoomTitle: 'Colmos Médios e Folhas Flexíveis',
    macroZoomDescription: 'Folhas de largura intermediária e rápida digestibilidade ruminal sem acúmulo excessivo de talo.',
    drySeasonPhotoNote: 'Excelente palatabilidade e conversão alimentar em leite a pasto.',
    tagLocation: 'Bacia Leiteira • Castro / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar suave e lígula delicada',
      leafTexture: 'Lâminas verde-vivas flexíveis',
      seedheadVisual: 'Panícula violácea aberta',
    },
  },

  // 13. BRS Zuri
  brs_zuri: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Pasto de BRS Zuri com folhagem 100% sã e livre de manchas de Bipolaris maydis sob alta precipitação.',
    macroZoomTitle: 'Sanidade Foliar & Resistência Genética',
    macroZoomDescription: 'Arquitetura ereta moderna com colmos macios e folhas arqueadas verde-esmeralda de alta proteína.',
    drySeasonPhotoNote: 'Florescimento tardio estende a safra de pastejo no outono.',
    tagLocation: 'Centro Tecnológico • Campo Grande / MS (Embrapa)',
    botanicalZoomDetails: {
      collarAndLigule: 'Nós glabros verdes sem estrias necróticas',
      leafTexture: 'Lâminas largas, suculentas e tenras',
      seedheadVisual: 'Panícula ampla com alto pegamento de sementes',
    },
  },

  // 14. BRS Quênia
  brs_quenia: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Touceira cespitosa de BRS Quênia com colmos muito finos e facilidade extrema de colheita pelo animal.',
    macroZoomTitle: 'Colmos Finos e Macios',
    macroZoomDescription: 'Baixo resíduo fibroso pós-pastejo, garantindo rebrota homogênea e rápida recomposição foliar.',
    drySeasonPhotoNote: 'Excelente ganho de peso em novilhas de corte e bezerras.',
    tagLocation: 'Fazenda Elite • Presidente Prudente / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar delicado com ausência de cerdas ásperas',
      leafTexture: 'Folhas verde-esmeralda macias e flexíveis',
      seedheadVisual: 'Panícula híbrida de floração uniforme',
    },
  },

  // 15. BRS Tamani
  brs_tamani: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Pasto anão de BRS Tamani com dossel denso e baixo (45 cm), ideal para ovinocultura, equinos e bezerras.',
    macroZoomTitle: 'Perfilhamento Basal Hiperdenso',
    macroZoomDescription: 'Moita anã repleta de folhas finas de altíssimo valor proteico (PB até 19%).',
    drySeasonPhotoNote: 'Cobre 100% da superfície do solo eliminando invasoras.',
    tagLocation: 'Haras & Ovinos • Itapetininga / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Entrenós curtos de rápida ramificação',
      leafTexture: 'Lâminas tenras verde-vivas estreitas',
      seedheadVisual: 'Panícula anã compacta',
    },
  },

  // 16. Massai
  massai: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Touceiras densas verde-azuladas de Capim Massai resistindo a 5 meses de estiagem no Semiárido.',
    macroZoomTitle: 'Rusticidade & Tolerância à Seca',
    macroZoomDescription: 'Folhas finas e coriáceas sem oxalato, com segurança zootécnica total para equinos.',
    drySeasonPhotoNote: 'Rebrota imediata ao primeiro sinal de chuva.',
    tagLocation: 'Semiárido Nordestino • Petrolina / PE',
    botanicalZoomDetails: {
      collarAndLigule: 'Base da touceira fortemente perfilhada',
      leafTexture: 'Folhas estreitas verde-azuladas',
      seedheadVisual: 'Panícula pequena com sementes escuras',
    },
  },

  // 17. Aruana
  aruana: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Pasto baixo e perfilhado de Capim Aruana em módulo rotacionado de ovinos com dossel aberto e arejado.',
    macroZoomTitle: 'Dossel Aberto Anti-Parasitário',
    macroZoomDescription: 'Arquitetura que permite entrada de sol na base, desidratando larvas de vermes de ovinos.',
    drySeasonPhotoNote: 'Excelente rebrota na transição primavera.',
    tagLocation: 'Cabanha de Ovinos • Botucatu / SP (IAC)',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena ciliada',
      leafTexture: 'Lâminas finas e macias',
      seedheadVisual: 'Panícula aberta esguia',
    },
  },

  // 18. Paredão MG-12
  paredao_mg12: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Muralha verde de Capim Paredão (MG-12) atingindo 2,2 metros de biomassa exuberante no verão.',
    macroZoomTitle: 'Biomassa Gigante para Silagem e Pastejo',
    macroZoomDescription: 'Colmos grossos e folhas gigantescas com taxa de acúmulo de até 38 t MS/ha/ano.',
    drySeasonPhotoNote: 'Excelente rendimento na ensilagem de verão.',
    tagLocation: 'Confinamento & Pecuária • Barretos / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar largo com nós espessos',
      leafTexture: 'Lâminas largas de textura vigorosa',
      seedheadVisual: 'Panícula gigante com densa ramificação',
    },
  },

  // 19. BRS Capiaçu
  brs_capiacu: {
    primaryPhotoUrl: capiacuSilageImg,
    fieldAngleDescription: 'Canavial imponente de BRS Capiaçu com 4,5 metros de altura pronto para colheita mecânica de silagem de altíssimo rendimento.',
    macroZoomTitle: 'Colmos Grossos & Suculentos de 4 Metros',
    macroZoomDescription: 'Capineira monumental capaz de produzir até 300 toneladas de matéria verde por hectare ao ano.',
    drySeasonPhotoNote: 'A melhor relação custo-benefício por tonelada de silagem no Brasil.',
    tagLocation: 'Capineira de Silagem • Coronel Pacheco / MG (Embrapa Gado de Leite)',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula com franja densa de pelos e nós grossos',
      leafTexture: 'Folhas compridas de até 1,3 m com nervura central branca',
      seedheadVisual: 'Espiga cilíndrica alongada dourada (propagação por colmos)',
    },
  },

  // 20. BRS Kurumi
  brs_kurumi: {
    primaryPhotoUrl: brsKurumiImg,
    fieldAngleDescription: 'Capim-Elefante Anão BRS Kurumi em piquete de vacas Girolando em pastejo direto com abundante folhagem verde tenra.',
    macroZoomTitle: 'Entrenós Curtos & Suculência sem Fibra Excessiva',
    macroZoomDescription: 'Folhas extremamente tenras e verdes com até 24% de Proteína Bruta na matéria seca.',
    drySeasonPhotoNote: 'A forrageira tropical de maior valor nutricional para produção de leite a pasto.',
    tagLocation: 'Piquetes Rotacionados de Leite • Juiz de Fora / MG (Embrapa)',
    botanicalZoomDetails: {
      collarAndLigule: 'Entrenós encurtados de 5 a 8 cm fáceis de quebrar',
      leafTexture: 'Folhas muito macias verde-claras sem aspereza',
      seedheadVisual: 'Espiga compacta cilíndrica (mudas vegetativas)',
    },
  },

  // 21. Tifton 85
  tifton85: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Campo de feno premium de Tifton 85 com tapete verde contínuo e estolões arroxeados vigorosos sob irrigação.',
    macroZoomTitle: 'Estolões Enraizantes & Folhas Finas para Feno',
    macroZoomDescription: 'Malha densa resistente ao pisoteio que desseca uniformemente na fenação comercial.',
    drySeasonPhotoNote: 'Excelente rebrota na primavera após o frio.',
    tagLocation: 'Campo de Fenação Comercial • Holambra / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula curta e estolões arroxeados nos nós',
      leafTexture: 'Folhas macias de fácil desidratação',
      seedheadVisual: 'Espigas digitadas estéreis no topo',
    },
  },

  // 22. Coastcross-1
  coastcross1: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Pasto delicado de Coastcross-1 em haras com feno de textura extremamente macia para potros e animais de alta exigência.',
    macroZoomTitle: 'Finura dos Colmos & Ausência de Lignina',
    macroZoomDescription: 'Folhas estreitas e colmos flexíveis de máxima digestibilidade para cavalos e bezerros.',
    drySeasonPhotoNote: 'Feno de altíssimo valor de mercado.',
    tagLocation: 'Haras de Cavalos de Raça • Campinas / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar nítido e estolões delgados',
      leafTexture: 'Lâminas verde-claras muito macias',
      seedheadVisual: 'Espigas digitadas esguias',
    },
  },

  // 23. Estrela Africana
  estrela_africana: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Estolões rasteiros de Estrela Africana cobrindo terreno com alta velocidade de fechamento e agressividade competitiva.',
    macroZoomTitle: 'Estolões Grossos em Forma de Estrela',
    macroZoomDescription: 'Cobertura rápida que sufoca plantas daninhas e protege o solo contra erosão superficial.',
    drySeasonPhotoNote: 'Boa persistência sob pastejo contínuo.',
    tagLocation: 'Pasto de Leite • Cruz das Almas / BA',
    botanicalZoomDetails: {
      collarAndLigule: 'Pelos nos nós e colar avermelhado',
      leafTexture: 'Folhas médias e estolões fortes',
      seedheadVisual: 'Espigas digitadas estéreis',
    },
  },

  // 24. Capim Andropogon
  andropogon: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Touceiras verde-azuladas de Andropogon gayanus em solo cascalhado de cerrado com raízes profundas de 3 metros sob sol forte.',
    macroZoomTitle: 'Raízes Profundas & Imunidade a Cigarrinhas',
    macroZoomDescription: 'Espigas plumosas com aristas longas e alta tolerância a solos ácidos com alumínio tóxico.',
    drySeasonPhotoNote: 'Rebrota imediata na primeira chuva de setembro.',
    tagLocation: 'Cerrado Ácido • Planaltina / DF (Embrapa Cerrados)',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa com anel de pelos brancos',
      leafTexture: 'Folhas verde-azuladas com nervuras claras',
      seedheadVisual: 'Espatas ramificadas com cerdas plumosas',
    },
  },

  // 25. Setária
  setaria: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Capim-Setária cv. Kazungula em várzea úmida com espigas cilíndricas douradas e base em leque arroxeada.',
    macroZoomTitle: 'Base Achatada em Leque & Espiga Dourada',
    macroZoomDescription: 'Excelente tolerância ao encharcamento e geadas de inverno no Sul e Sudeste.',
    drySeasonPhotoNote: 'Contém oxalato solúvel (proibido para equinos).',
    tagLocation: 'Baixada Úmida • Chapecó / SC',
    botanicalZoomDetails: {
      collarAndLigule: 'Bainha comprimida arroxeada em forma de leque',
      leafTexture: 'Folhas largas glabras verde-azuladas',
      seedheadVisual: 'Espiga cilíndrica com cerdas dourado-alaranjadas',
    },
  },

  // 26. Grama Pensacola
  pensacola: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Piquete de Grama-Pensacola com espigas em formato de V características e tolerância absoluta ao pastejo rente e pisoteio.',
    macroZoomTitle: 'Rizomas Lenhosos Subterrâneos',
    macroZoomDescription: 'Tapete denso impenetrável que resiste ao superpastejo sem abrir clareiras de invasoras.',
    drySeasonPhotoNote: 'Segurança absoluta para equinos contra cólicas e oxalato.',
    tagLocation: 'Centro Hípico • Curitiba / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Bainhas basais sobrepostas achatadas',
      leafTexture: 'Folhas estreitas e brilhantes',
      seedheadVisual: 'Inflorescência em V com 2 racemos conjugados',
    },
  },

  // 27. Aveia Preta
  aveia_preta: {
    primaryPhotoUrl: aveiaWinterImg,
    fieldAngleDescription: 'Lavoura verde-clara de Aveia-Preta cobrindo o solo de inverno em rotação com soja no Sul do Brasil.',
    macroZoomTitle: 'Folhagem Tenra de Inverno (PB 18%)',
    macroZoomDescription: 'Alta energia e digestibilidade para vacas holandesas no frio do Sul.',
    drySeasonPhotoNote: 'Ciclo anual de inverno com efeito alelopático benéfico contra invasoras.',
    tagLocation: 'Campos Gerais • Ponta Grossa / PR (IAPAR / Embrapa Trigo)',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa longa transparente',
      leafTexture: 'Folhas macias azuladas sem pilosidade',
      seedheadVisual: 'Panícula aberta com aristas recurvadas',
    },
  },

  // 28. Azevém Anual
  azevem: {
    primaryPhotoUrl: aveiaWinterImg,
    fieldAngleDescription: 'Pasto de Azevém Anual verde-brilhante no auge do inverno com ganho de peso zootécnico superior a 1 kg/dia.',
    macroZoomTitle: 'Folhas Envernizadas & Aurículas Abraçadoras',
    macroZoomDescription: 'Face inferior da folha brilhante com digestibilidade in vitro superior a 80%.',
    drySeasonPhotoNote: 'Ressemeadura natural espontânea para o outono seguinte.',
    tagLocation: 'Pampa Gaúcho • Bagé / RS (Embrapa Pecuária Sul)',
    botanicalZoomDetails: {
      collarAndLigule: 'Aurículas abraçadoras no colar',
      leafTexture: 'Folhas tenras com aspecto envernizado',
      seedheadVisual: 'Espiga delgada ereta sem pedicelo',
    },
  },

  // 29. Estilosantes Campo Grande
  estilosantes_campo_grande: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Consórcio de BRS Campo Grande com Braquiária, mostrando flores amarelas e fixação biológica de Nitrogênio no solo.',
    macroZoomTitle: 'Flores Amarelas & Nódulos de Bradyrhizobium',
    macroZoomDescription: 'Folhas trifolioladas com nódulos radiculares róseos que fixam até 180 kg de N/ha/ano diretamente na pastagem.',
    drySeasonPhotoNote: 'Eleva a proteína bruta da dieta do gado na seca de 7% para 13%.',
    tagLocation: 'Área de Consórcio • Campo Grande / MS (Embrapa Gado de Corte)',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas bífidas adnatas ao pecíolo',
      leafTexture: 'Folhas trifolioladas verde-escuro com nervuras claras',
      seedheadVisual: 'Espigas capituliformes com flores amarelas',
    },
  },

  // 30. Guandu Mandarim
  guandu_mandarim: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Arbustos de Guandu Forrageiro BRS Mandarim carregados de vagens proteicas para pastejo e adubação verde de outono/inverno.',
    macroZoomTitle: 'Raiz Pivotante Rompedora de Solo',
    macroZoomDescription: 'Arado biológico com raiz de mais de 3 metros que rompe compactação e recicla nutrientes profundos.',
    drySeasonPhotoNote: 'Banco de proteína verde na seca severa.',
    tagLocation: 'Banco de Proteína • São Carlos / SP (Embrapa Pecuária Sudeste)',
    botanicalZoomDetails: {
      collarAndLigule: 'Ramos lenhosos densos com estípulas pequenas',
      leafTexture: 'Folhas trifolioladas cinzento-tomentosas aveludadas',
      seedheadVisual: 'Racemos axilares com flores amarelas e vagens',
    },
  },

  // 31. Aveia Branca
  aveia_branca: {
    primaryPhotoUrl: aveiaWinterImg,
    fieldAngleDescription: 'Pasto de Aveia Branca BRS Centauro em pleno crescimento hibernal, com alta densidade foliar e cor verde-brilhante.',
    macroZoomTitle: 'Lâmina Foliar Larga e Glandular',
    macroZoomDescription: 'Folhas tenras e macias, com ausência de pilosidade e alto teor de açúcares solúveis.',
    drySeasonPhotoNote: 'Excelente rebrote pós-geadas no inverno.',
    tagLocation: 'Campos Gerais • Ponta Grossa / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa longa e denteada',
      leafTexture: 'Folhas completamente lisas e macias',
      seedheadVisual: 'Panícula aberta com espiguetas grandes pendentes',
    },
  },

  // 32. Alfafa
  alfafa: {
    primaryPhotoUrl: alfalfaHayCropImg,
    fieldAngleDescription: 'Pasto denso de Alfafa Crioula em florescimento, com abundantes flores azul-violeta e colmos eretos altamente folhosos.',
    macroZoomTitle: 'Folíolos Obovados e Serrilhados',
    macroZoomDescription: 'Folhas trifolioladas com folíolos ovalados com margens denteadas no ápice.',
    drySeasonPhotoNote: 'Raízes profundas de até 4m garantem oferta de pasto verde na seca.',
    tagLocation: 'Região Sul • Passo Fundo / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas grandes e soldadas',
      leafTexture: 'Textura macia e tenra, muito digestível',
      seedheadVisual: 'Cachos curtos axilares de cor roxa',
    },
  },

  // 33. Trevo Branco
  trevo_branco: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Tapete contínuo de Trevo Branco em consórcio de inverno, com abundantes flores brancas arredondadas.',
    macroZoomTitle: 'Folhas Trifolioladas em V',
    macroZoomDescription: 'Folhas com marcações brancas brilhantes em forma de V características.',
    drySeasonPhotoNote: 'Estolões rasteiros ajudam a cobrir clareiras no pasto.',
    tagLocation: 'Pampa Gaúcho • Bagé / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas longas membranosas',
      leafTexture: 'Folhas lisas e tenras de altíssima palatabilidade',
      seedheadVisual: 'Inflorescência globosa de cor branca',
    },
  },

  // 34. Trevo Vermelho
  trevo_vermelho: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Canteiro de Trevo Vermelho Estanzuela com hastes eretas e abundantes flores rosadas arredondadas.',
    macroZoomTitle: 'Folhas Pubescentes',
    macroZoomDescription: 'Folhas trifolioladas com pilosidade macia e marcações claras em formato de ferradura.',
    drySeasonPhotoNote: 'Excelente produção de forragem outonal.',
    tagLocation: 'Campos de Cima da Serra • Vacaria / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas largas membranosas com nervuras escuras',
      leafTexture: 'Folhas aveludadas de excelente aceitabilidade',
      seedheadVisual: 'Capítulo globoso grande avermelhado',
    },
  },

  // 35. Ervilhaca
  ervilhaca: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Hastes de Ervilhaca Forrageira se entrelaçando em aveia-preta, com flores lilases brilhando ao sol de inverno.',
    macroZoomTitle: 'Gavinhas Trepadoras',
    macroZoomDescription: 'Folhas compostas pinadas terminadas em gavinhas ramificadas que se agarram a gramíneas.',
    drySeasonPhotoNote: 'Melhora consideravelmente o teor de Nitrogênio do solo.',
    tagLocation: 'Região de Clima Frio • Guarapuava / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas pequenas denteadas com mancha nectária',
      leafTexture: 'Folíolos oblongos e macios',
      seedheadVisual: 'Flores solitárias violetas nas axilas foliares',
    },
  },

  // 36. Capim Sudão
  capim_sudao: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Plantio de Capim-Sudão BRS Estribo de porte ereto folhoso e alta capacidade de rebrote basal.',
    macroZoomTitle: 'Nervura Central Esbranquiçada',
    macroZoomDescription: 'Folhas longas e estreitas com nervura central esbranquiçada e flexível.',
    drySeasonPhotoNote: 'Alta capacidade de rebrote e tolerância à estiagem de verão.',
    tagLocation: 'Região Central • Santa Maria / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa ciliada grande',
      leafTexture: 'Folhas tenras e suculentas sem pilosidade',
      seedheadVisual: 'Panícula aberta grande piramidal',
    },
  },

  // 37. Tifton 68
  tifton_68: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Piquete de Tifton 68 com estolões grossos e folhas largas recobrindo 100% do solo de forma contínua.',
    macroZoomTitle: 'Estolões Gigantes',
    macroZoomDescription: 'Estolões aéreos que correm rente ao solo emitindo raízes e brotações robustas em todos os nós.',
    drySeasonPhotoNote: 'Alta retenção foliar e palatabilidade de inverno.',
    tagLocation: 'Vale do Paraíba • Guaratinguetá / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula ciliada com colar claro brilhante',
      leafTexture: 'Folhas macias e completamente lisas',
      seedheadVisual: 'Espigas digitadas estéreis (híbrido)',
    },
  },

  // 38. Tifton 44
  tifton_44: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Pasto de Tifton 44 formando um tapete folhoso denso de alta resistência ao pisoteio e ao frio.',
    macroZoomTitle: 'Rizomas Robustos',
    macroZoomDescription: 'Rizomas subterrâneos profundos que garantem sobrevivência a geadas e secas intensas.',
    drySeasonPhotoNote: 'Entra em dormência no inverno mas rebrota vigorosamente no início da primavera.',
    tagLocation: 'Região Fria • São Joaquim / SC',
    botanicalZoomDetails: {
      collarAndLigule: 'Colar nítido com pequenos pelos laterais',
      leafTexture: 'Folhas firmes e estreitas de coloração verde-escura',
      seedheadVisual: 'Espigas digitadas estéreis sem sementes viáveis',
    },
  },

  // 39. Grama Bermuda
  grama_bermuda: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Piquete denso de Grama Bermuda Comum formando um tapete contínuo rente ao solo sob sol pleno.',
    macroZoomTitle: 'Rizomas e Estolões Interligados',
    macroZoomDescription: 'Entrelaçado impenetrável de rizomas subterrâneos e estolões que protegem o solo contra erosões.',
    drySeasonPhotoNote: 'Alta persistência em secas severas devido aos rizomas.',
    tagLocation: 'Área de Pastejo • Ribeirão Preto / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena com colar verde-claro',
      leafTexture: 'Folhas finas, curtas e firmes',
      seedheadVisual: 'Espigas digitadas no topo de colmos eretos',
    },
  },

  // 40. Amendoim Forrageiro
  amendoim_forrageiro: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Tapete contínuo verde-escuro de Amendoim Forrageiro BRS Mandobi coalhado de pequenas flores amarelas.',
    macroZoomTitle: 'Folhas Tetrafolioladas',
    macroZoomDescription: 'Folhas compostas por quatro folíolos obovados verde-esmeralda macios e brilhantes.',
    drySeasonPhotoNote: 'Excelente fixação de nitrogênio em consórcio com braquiárias.',
    tagLocation: 'Polo Pecuário • Uberaba / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas grandes soldadas ao pecíolo',
      leafTexture: 'Folhas lisas e tenras de altíssimo consumo',
      seedheadVisual: 'Flores solitárias amarelas em longos pedúnculos',
    },
  },

  // 41. Centrosema
  centrosema: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Centrosema Forrageira escalando as hastes do capim braquiarão, com grandes flores roxas.',
    macroZoomTitle: 'Folíolos Elípticos Firmes',
    macroZoomDescription: 'Folhas trifolioladas com folíolos elípticos verde-escuros e estípulas na base.',
    drySeasonPhotoNote: 'Mantém a pastagem com alto valor proteico nas secas.',
    tagLocation: 'Recôncavo Baiano • Cruz das Almas / BA',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas persistentes triangulares',
      leafTexture: 'Folhas tenras com pilosidade muito leve',
      seedheadVisual: 'Flores grandes lilases e vagens lineares chatas',
    },
  },

  // 42. Calopogonio
  calopogonio: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Tapete aveludado denso de Calopogônio cobrindo o solo de seringal com colmos peludos marrons.',
    macroZoomTitle: 'Folhas Densamente Pilosas',
    macroZoomDescription: 'Folhas trifolioladas recobertas por longos pelos amarronzados e aveludados.',
    drySeasonPhotoNote: 'Ajuda na retenção de umidade do solo e matéria orgânica.',
    tagLocation: 'Região Cacaueira • Ilhéus / BA',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas triangulares pequenas peludas',
      leafTexture: 'Folhas aveludadas de textura robusta',
      seedheadVisual: 'Pequenas flores azuladas e vagens pilosas',
    },
  },

  // 43. Soja Perene
  soja_perene: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Massa foliar exuberante de Soja Perene em consórcio silvipastoril com árvores de eucalipto.',
    macroZoomTitle: 'Folíolos Ovados Grandes',
    macroZoomDescription: 'Folhas trifolioladas com folíolos ovados de até 8cm de comprimento e cor verde-escura.',
    drySeasonPhotoNote: 'Excelente persistência sob sombreamento denso.',
    tagLocation: 'Polo Silvipastoril • Uberlândia / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas miúdas na base do pecíolo longo',
      leafTexture: 'Folhas lisas e tenras de altíssima palatabilidade',
      seedheadVisual: 'Racemos esguios com pequenas flores brancas',
    },
  },

  // 44. Siratro
  siratro: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Ramas vigorosas de Siratro com flores vermelho-escuras quase pretas subindo pelos colmos de capim-andropogon.',
    macroZoomTitle: 'Folíolos Lobados e Pilosos',
    macroZoomDescription: 'Folhas trifolioladas com folíolos com lobos laterais característicos.',
    drySeasonPhotoNote: 'Raiz pivotante profunda garante pasto verde na seca severa.',
    tagLocation: 'Semiárido • Petrolina / PE',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas pequenas e colmos peludos',
      leafTexture: 'Folhas cinzento-verdes e aveludadas ao toque',
      seedheadVisual: 'Inflorescência em racemos eretos púrpura-escuro',
    },
  },

  // 45. Pueraria
  pueraria: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Cobertura contínua e densa de Kudzu-Tropical recobrindo o solo de seringal com folhas grandes.',
    macroZoomTitle: 'Folhas Trifolioladas Gigantes',
    macroZoomDescription: 'Folhas trifolioladas com folíolos lobados de até 15 cm de comprimento verde-oliva.',
    drySeasonPhotoNote: 'Massa de folhas que protege contra erosões na estiagem.',
    tagLocation: 'Área de Cultivo • Ji-Paraná / RO',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas ovadas proeminentes',
      leafTexture: 'Textura firme com pelos sedosos no pecíolo',
      seedheadVisual: 'Racemos longos com flores rosa-purpúreas',
    },
  },

  // 46. Capim Coloniao
  capim_coloniao: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Touceiras monumentais de Capim Colonião erguendo-se até 2,5 metros de altura em solos de alta fertilidade.',
    macroZoomTitle: 'Colmos Robustos e Nós Salientes',
    macroZoomDescription: 'Colmos grossos e nós bem salientes verde-claros e brilhantes.',
    drySeasonPhotoNote: 'Excelente produção de palhada para plantio direto pós-pastoreio.',
    tagLocation: 'Fazenda Modelo • Araçatuba / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa ciliada grande',
      leafTexture: 'Folhas longas de até 1m, verde-escuras',
      seedheadVisual: 'Panícula aberta grande com ramificações longas',
    },
  },

  // 47. Capim Tobata
  capim_tobata: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Touceiras eretas e vigorosas de Capim Tobiatã no chuvoso, com folhas muito largas verde-claras brilhantes.',
    macroZoomTitle: 'Folhas de Até 5 cm de Largura',
    macroZoomDescription: 'Folhas de largura extraordinária com bordas serrilhadas levemente ásperas.',
    drySeasonPhotoNote: 'Mantém rebrote basal vigoroso com umidade de subsolo.',
    tagLocation: 'Região de Solos Férteis • Sertãozinho / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranoso-ciliada grande',
      leafTexture: 'Folhas verde-claras muito suculentas',
      seedheadVisual: 'Panícula aberta grande piramidal',
    },
  },

  // 48. Capim Aruana
  capim_aruana: {
    primaryPhotoUrl: panicumTanzaniaImg,
    fieldAngleDescription: 'Pasto de Capim Aruana para ovinocultura, demonstrando colmos finos de até 80cm e abundante folhagem.',
    macroZoomTitle: 'Folhas Finas Azuladas',
    macroZoomDescription: 'Folhas delgadas e estreitas de coloração verde-clara azulada sem pelos.',
    drySeasonPhotoNote: 'Excelente capacidade de perfilhamento basal no frio.',
    tagLocation: 'Instituto de Zootecnia • Nova Odessa / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena com colar verde-claro nítido',
      leafTexture: 'Folhas lisas e macias de rápida ingestão',
      seedheadVisual: 'Panícula aberta esguia com pouca ramificação',
    },
  },

  // 49. Capim Vencedor
  capim_vencedor: {
    primaryPhotoUrl: panicumMombacaImg,
    fieldAngleDescription: 'Touceiras eretas de Capim Vencedor com colmos finos e folhas densas erguendo-se a 1,2 metros.',
    macroZoomTitle: 'Perfilhamento Basal Vigoroso',
    macroZoomDescription: 'Alta emissão de perfilhos basais de coloração verde-escura e textura firme.',
    drySeasonPhotoNote: 'Boa persistência sob pastejo contínuo ajustado.',
    tagLocation: 'Embrapa Gado de Corte • Campo Grande / MS',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena membranoso-ciliada',
      leafTexture: 'Folhas verde-escuras ligeiramente ásperas',
      seedheadVisual: 'Panícula aberta com espiguetas esverdeadas',
    },
  },

  // 50. Desmodio
  desmodio: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Tapete contínuo de Desmódio Itabela cobrindo o solo de pastagem consorciada sob o dossel de árvores.',
    macroZoomTitle: 'Folíolos Ovados Brilhantes',
    macroZoomDescription: 'Folhas trifolioladas aveludadas verde-escuras e pecíolos avermelhados com estolões rasteiros.',
    drySeasonPhotoNote: 'Excelente associação proteica perene nas secas.',
    tagLocation: 'Consórcio Silvipastoril • Paragominas / PA',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas pontiagudas aderidas à bainha',
      leafTexture: 'Folhas trifolioladas com textura macia aveludada',
      seedheadVisual: 'Pequenas flores rosadas e vagens curtas achatadas',
    },
  },

  // 51. Leucena
  leucena: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Linhas de Leucena Cunningham densamente foliosas (banco de proteína) em solos corrigidos.',
    macroZoomTitle: 'Folhas Bipinadas Delgadas',
    macroZoomDescription: 'Folhas bipinadas longas com folíolos elípticos verde-escursos brilhantes.',
    drySeasonPhotoNote: 'Excelente fonte de proteína verde na seca severa de inverno.',
    tagLocation: 'Região de Cerrado • Uberaba / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Glândula foliar proeminente na base do pecíolo',
      leafTexture: 'Folhas lisas de textura tenra e muito rica em proteína',
      seedheadVisual: 'Inflorescência globosa de cor branca-amarelada',
    },
  },

  // 52. Milheto Forrageiro
  milheto_forrageiro: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Lavoura verde-clara de Milheto ADR 300 cobrindo o solo de safrinha, com espigas eretas cilíndricas compactas.',
    macroZoomTitle: 'Espigas Cilíndricas Longas',
    macroZoomDescription: 'Espiga cilíndrica ereta muito compacta carregada de sementes arredondadas cinzentas.',
    drySeasonPhotoNote: 'Excelente reciclagem de potássio profundo no perfil.',
    tagLocation: 'Cerrado Goiano • Rio Verde / GO',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena ciliada com colar claro largo',
      leafTexture: 'Folhas muito longas de até 1m, verde-claras',
      seedheadVisual: 'Inflorescência em panícula espiciforme compacta',
    },
  },

  // 53. Sorgo Forrageiro
  sorgo_forrageiro: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Talhão uniforme de Sorgo BRS Ponta Negra com colmos eretos de até 2,2 metros de altura para silagem.',
    macroZoomTitle: 'Folhas Largas Semelhantes ao Milho',
    macroZoomDescription: 'Folhas largas com nervura central esbranquiçada proeminente e colmos doces suculentos.',
    drySeasonPhotoNote: 'Silagem de excelente digestibilidade e alta energia de amidos.',
    tagLocation: 'Zona da Mata • Viçosa / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa grande ciliada',
      leafTexture: 'Folhas verde-escuras de textura firme e lisa',
      seedheadVisual: 'Panícula compacta elíptica carregada de grãos',
    },
  },

  // 54. Capim Limao
  capim_limao: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Touceiras densas de Capim-Limão Cidreira com folhas estreitas e brilhantes verde-claro perfumadas.',
    macroZoomTitle: 'Perfume Cítrico de Citral',
    macroZoomDescription: 'Folhas longas e ásperas nas bordas com aroma cítrico nítido que atua como repelente natural.',
    drySeasonPhotoNote: 'Excelente proteção de taludes e encostas secas contra erosões.',
    tagLocation: 'Fazenda Orgânica • Valinhos / SP',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena membranosa esverdeada',
      leafTexture: 'Folhas estreitas com textura áspera ao toque',
      seedheadVisual: 'Raramente floresce em condições de pastejo',
    },
  },

  // 55. Capim Jaragua
  capim_jaragua: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Pasto de Capim-Jaraguá no outono com colmos eretos de 1,5m e panículas avermelhadas brilhantes ao sol.',
    macroZoomTitle: 'Espiguetas Ruivas com Pelos',
    macroZoomDescription: 'Espiguetas revestidas por pelos ruivos e aristas recurvadas no topo de hastes longas.',
    drySeasonPhotoNote: 'Pasto rústico que mantém aceitabilidade se pastejado rente.',
    tagLocation: 'Região de Pastagens Tradicionais • Luziânia / GO',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa ciliada pequena',
      leafTexture: 'Folhas médias verde-escuras serrilhadas',
      seedheadVisual: 'Panículas ramificadas curtas ruivas',
    },
  },

  // 56. Capim Gordura
  capim_gordura: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Touceiras densas e aveludadas de Capim Gordura verde-claro recobertas por inflorescências roxas no outono.',
    macroZoomTitle: 'Pelos Glandulares Viscosos',
    macroZoomDescription: 'Folhas e bainhas revestidas por pelos viscosos que exalam perfume doce aromático.',
    drySeasonPhotoNote: 'Extremamente inflamável se seco, exige aceiros adequados.',
    tagLocation: 'Serra da Canastra • São Roque de Minas / MG',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena membranosa ciliada',
      leafTexture: 'Folhas curtas e aveludadas muito macias',
      seedheadVisual: 'Panícula muito ramificada purpúrea brilhante',
    },
  },

  // 57. Capim Pangola
  capim_pangola: {
    primaryPhotoUrl: tiftonCynodonImg,
    fieldAngleDescription: 'Estolões contínuos e finos de Capim Pangola correndo rente ao solo, formando um tapete folhoso verde-claro brilhante.',
    macroZoomTitle: 'Estolões Rasteiros Vigorosos',
    macroZoomDescription: 'Estolões finos que enraízam fortemente a cada nó gerando novos perfilhos folhosos.',
    drySeasonPhotoNote: 'Alta palatabilidade para ovinocultura nas secas.',
    tagLocation: 'Fazenda Experimental • Maceió / AL',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula pequena ciliada com colar claro nítido',
      leafTexture: 'Folhas tenras e curtas sem pilosidade',
      seedheadVisual: 'Espigas digitadas estéreis (híbrido)',
    },
  },

  // 58. Teosinto
  teosinto: {
    primaryPhotoUrl: andropogonImg,
    fieldAngleDescription: 'Touceiras eretas exuberantes de Teosinto com colmos grossos e farto perfilhamento basal.',
    macroZoomTitle: 'Folhas Idênticas ao Milho',
    macroZoomDescription: 'Folhas muito largas e longas com nervura central esbranquiçada e colmos suculentos doces.',
    drySeasonPhotoNote: 'Ideal para picado verde no cocho associado com capim elefante.',
    tagLocation: 'Vale do Taquari • Lajeado / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula membranosa grande ciliada',
      leafTexture: 'Folhas verde-claras suculentas sem pelos',
      seedheadVisual: 'Inflorescência em panículas axilares protegidas',
    },
  },

  // 59. Ervilha Forrageira
  ervilha_forrageira: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Plantio de Ervilha Forrageira BRS Juliana com gavinhas se agarrando em aveia-preta, com flores lilases brilhantes.',
    macroZoomTitle: 'Gavinhas e Grandes Estípulas',
    macroZoomDescription: 'Folhas compostas pinadas terminadas em gavinhas com estípulas grandes que abraçam o colmo.',
    drySeasonPhotoNote: 'Fixação biológica de Nitrogênio excepcional no inverno.',
    tagLocation: 'Campos Gerais • Castro / PR',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas foliares grandes serrilhadas',
      leafTexture: 'Folíolos grandes, ovados e tenros',
      seedheadVisual: 'Flores axilares brancas ou lilases e vagens verdes',
    },
  },

  // 60. Trevo Vesiculoso
  trevo_vesiculoso: {
    primaryPhotoUrl: estilosantesLegumeImg,
    fieldAngleDescription: 'Talhão uniforme de Trevo Vesiculoso BRS Tarumã no final da primavera, com abundantes inflorescências globosas de cores claras.',
    macroZoomTitle: 'Capítulos Globoso-Alongados',
    macroZoomDescription: 'Inflorescência globosa-alongada branca a rosada de até 5 cm de comprimento carregada de flores.',
    drySeasonPhotoNote: 'Rápido rebrote e ressemeadura natural espontânea.',
    tagLocation: 'Região de Campanha • Santana do Livramento / RS',
    botanicalZoomDetails: {
      collarAndLigule: 'Estípulas grandes membranosas conspícuas',
      leafTexture: 'Folhas trifolioladas ovadas verde-escuras lisas',
      seedheadVisual: 'Capítulo floral ereto alongado claro',
    },
  },
};

export function getForagePhotoData(forageId: string): ForageRealPhotoData {
  return FORAGE_REAL_PHOTOS_MAP[forageId] || {
    primaryPhotoUrl: brachiariaMaranduImg,
    fieldAngleDescription: 'Pasto tropical no auge vegetativo sob manejo rotacionado em clima brasileiro.',
    macroZoomTitle: 'Detalhe Anatômico Foliar',
    macroZoomDescription: 'Folhas sãs com alta densidade de perfilhamento e boa digestibilidade.',
    drySeasonPhotoNote: 'Excelente persistência sob manejo agronômico correto.',
    tagLocation: 'Fazenda Modelo • Brasil',
    botanicalZoomDetails: {
      collarAndLigule: 'Lígula nítida e colar característico',
      leafTexture: 'Lâmina foliar tenra e suculenta',
      seedheadVisual: 'Inflorescência típica da espécie',
    },
  };
}
