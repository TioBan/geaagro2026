import { ConfigCulturaIntegrada, UnidadeComercializacao } from '../types/gestaoRural';

export interface CropPresetDefinition extends ConfigCulturaIntegrada {
  id: string;
  icon: string;
  categoria: 'Fruticultura' | 'Grãos & Cereais' | 'Olericultura' | 'Industriais & Outros';
  exemplosVariedades: string[];
}

export const CROP_COMMERCIALIZATION_PRESETS: CropPresetDefinition[] = [
  {
    id: 'banana',
    cultura: 'Banana',
    icon: '🍌',
    categoria: 'Fruticultura',
    variedade: 'Prata Anã (Gorutuba)',
    exemplosVariedades: ['Prata Anã', 'Nanica (Cavendish)', 'Grande Naine', 'Maçã', 'Terra', 'Pacovan', 'BRS Platina'],
    unidadeComercializacaoPrincipal: 'cx',
    unidadesHabilitadas: ['cx', 'sc', 'kg', 'ton'],
    pesoPorUnidadeKg: 20,
    apelidoUnidade: 'Caixa (20 kg)',
    precoReferenciaUnitarioR$: 68.0,
    metaProdutividadePadraoHa: 1500, // 1.500 caixas/ha (~30 ton/ha)
    descricaoComercializacao: 'Comercializada em caixas (20 a 22 kg) para Ceasa/redes de supermercados, ou a granel por tonelada/kg para indústrias de doces/farinha.'
  },
  {
    id: 'soja',
    cultura: 'Soja',
    icon: '🌱',
    categoria: 'Grãos & Cereais',
    variedade: 'Intacta 2 Xtend',
    exemplosVariedades: ['BMX Potência', 'TMG 7062', 'Brasmax Foco', 'Monsoy 6410', 'Don Mario 66i68'],
    unidadeComercializacaoPrincipal: 'sc',
    unidadesHabilitadas: ['sc', 'ton', 'kg'],
    pesoPorUnidadeKg: 60,
    apelidoUnidade: 'Saca (60 kg)',
    precoReferenciaUnitarioR$: 128.5,
    metaProdutividadePadraoHa: 68, // 68 sc/ha (~4.080 kg/ha)
    descricaoComercializacao: 'Comercializada em sacas de 60kg com base no padrão Chicago/Porto de Paranaguá, ou por tonelada métrica exportação.'
  },
  {
    id: 'milho',
    cultura: 'Milho',
    icon: '🌽',
    categoria: 'Grãos & Cereais',
    variedade: 'Híbrido VIPTERA 3',
    exemplosVariedades: ['DKB 360 PRO3', 'FS 575 PWU', 'P3898', 'K9606 VIP3', 'AG 8088'],
    unidadeComercializacaoPrincipal: 'sc',
    unidadesHabilitadas: ['sc', 'ton', 'kg'],
    pesoPorUnidadeKg: 60,
    apelidoUnidade: 'Saca (60 kg)',
    precoReferenciaUnitarioR$: 62.0,
    metaProdutividadePadraoHa: 140, // 140 sc/ha (~8.400 kg/ha)
    descricaoComercializacao: 'Comercializada em sacas de 60kg para granjas/cooperativas ou granel em toneladas para fábricas de ração e etanol.'
  },
  {
    id: 'cafe',
    cultura: 'Café',
    icon: '☕',
    categoria: 'Grãos & Cereais',
    variedade: 'Arábica Catuaí Vermelho 144',
    exemplosVariedades: ['Catuaí Vermelho', 'Catuaí Amarelo', 'Mundo Novo', 'Bourbon Amarelo', 'Conilon BRS'],
    unidadeComercializacaoPrincipal: 'sc',
    unidadesHabilitadas: ['sc', 'kg', 'ton'],
    pesoPorUnidadeKg: 60,
    apelidoUnidade: 'Saca Beneficiada (60 kg)',
    precoReferenciaUnitarioR$: 1280.0,
    metaProdutividadePadraoHa: 42, // 42 sc/ha
    descricaoComercializacao: 'Comercializada em sacas de 60kg bica corrida ou cereja descascado para cooperativas e exportadores.'
  },
  {
    id: 'citros',
    cultura: 'Laranja / Citros',
    icon: '🍊',
    categoria: 'Fruticultura',
    variedade: 'Pêra Rio',
    exemplosVariedades: ['Pêra Rio', 'Valência', 'Natal', 'Hamlin', 'Tangerina Ponkan', 'Limão Tahiti'],
    unidadeComercializacaoPrincipal: 'cx',
    unidadesHabilitadas: ['cx', 'ton', 'kg'],
    pesoPorUnidadeKg: 40.8,
    apelidoUnidade: 'Caixa Padrão Indústria (40.8 kg)',
    precoReferenciaUnitarioR$: 52.0,
    metaProdutividadePadraoHa: 1200, // 1.200 cx/ha (~48 ton/ha)
    descricaoComercializacao: 'Comercializada em caixas padrão de 40.8 kg para fábricas de suco concentrado (FCOJ) ou caixas de 20kg para mesa/Ceasa.'
  },
  {
    id: 'tomate',
    cultura: 'Tomate',
    icon: '🍅',
    categoria: 'Olericultura',
    variedade: 'Italiano Saladete',
    exemplosVariedades: ['Saladete', 'Débora', 'Carmen', 'Holandês', 'Sweet Grape', 'Cereja'],
    unidadeComercializacaoPrincipal: 'cx',
    unidadesHabilitadas: ['cx', 'kg', 'ton'],
    pesoPorUnidadeKg: 20,
    apelidoUnidade: 'Caixa K (20 kg)',
    precoReferenciaUnitarioR$: 75.0,
    metaProdutividadePadraoHa: 4200, // 4.200 caixas/ha (~84 ton/ha)
    descricaoComercializacao: 'Comercializado em caixas K (20 a 22 kg) para Ceasa/mercados ou por tonelada para indústrias de atomatados.'
  },
  {
    id: 'mandioca',
    cultura: 'Mandioca',
    icon: '🥔',
    categoria: 'Industriais & Outros',
    variedade: 'BRS Formosa',
    exemplosVariedades: ['BRS Formosa', 'Fécula Branca', 'Mansa/Aipim Cacau', 'Vassourinha'],
    unidadeComercializacaoPrincipal: 'ton',
    unidadesHabilitadas: ['ton', 'sc', 'kg'],
    pesoPorUnidadeKg: 1000,
    apelidoUnidade: 'Tonelada (1.000 kg)',
    precoReferenciaUnitarioR$: 580.0,
    metaProdutividadePadraoHa: 32, // 32 ton/ha
    descricaoComercializacao: 'Comercializada por tonelada métrica de raízes com teor de amido medido na balança hidrostática para fecularias e farinheiras.'
  },
  {
    id: 'uva',
    cultura: 'Uva',
    icon: '🍇',
    categoria: 'Fruticultura',
    variedade: 'Vitória Sem Semente',
    exemplosVariedades: ['BRS Vitória', 'Niágara Rosada', 'Itália', 'Thompson', 'Crimson', 'BRS Magna'],
    unidadeComercializacaoPrincipal: 'cx',
    unidadesHabilitadas: ['cx', 'kg', 'ton'],
    pesoPorUnidadeKg: 18,
    apelidoUnidade: 'Caixa (18 kg)',
    precoReferenciaUnitarioR$: 95.0,
    metaProdutividadePadraoHa: 1800, // 1.800 cx/ha
    descricaoComercializacao: 'Comercializada em caixas de 5kg ou 18kg para mercado fresco e caçambas por tonelada para vinícolas e sucos.'
  },
  {
    id: 'algodao',
    cultura: 'Algodão',
    icon: '☁️',
    categoria: 'Industriais & Outros',
    variedade: 'FM 985 GLTP',
    exemplosVariedades: ['FiberMax 985', 'TMG 81WS', 'DP 1744', 'IMA 5801'],
    unidadeComercializacaoPrincipal: '@',
    unidadesHabilitadas: ['@', 'ton', 'kg'],
    pesoPorUnidadeKg: 15,
    apelidoUnidade: 'Arroba Pluma (15 kg)',
    precoReferenciaUnitarioR$: 135.0,
    metaProdutividadePadraoHa: 310, // 310 @/ha pluma
    descricaoComercializacao: 'Comercializado em arrobas de pluma (15 kg) e fardos de 220kg com classificação HVI e caroço por tonelada.'
  },
  {
    id: 'cacau',
    cultura: 'Cacau',
    icon: '🍫',
    categoria: 'Fruticultura',
    variedade: 'CCN-51',
    exemplosVariedades: ['CCN-51', 'CEPEC 2002', 'PS-1319', 'FA-13', 'PH-16'],
    unidadeComercializacaoPrincipal: '@',
    unidadesHabilitadas: ['@', 'sc', 'kg'],
    pesoPorUnidadeKg: 15,
    apelidoUnidade: 'Arroba Fermentada (15 kg)',
    precoReferenciaUnitarioR$: 450.0,
    metaProdutividadePadraoHa: 95, // 95 @/ha (~1.425 kg/ha)
    descricaoComercializacao: 'Amêndoas secas e fermentadas comercializadas em arrobas de 15 kg ou sacas de 60 kg para moageiras industriais.'
  },
  {
    id: 'feijao',
    cultura: 'Feijão',
    icon: '🫘',
    categoria: 'Grãos & Cereais',
    variedade: 'Carioca BRS Estilo',
    exemplosVariedades: ['BRS Estilo', 'Pérola', 'BRS Esteio (Preto)', 'BRS Dama', 'IPR Campos Gerais'],
    unidadeComercializacaoPrincipal: 'sc',
    unidadesHabilitadas: ['sc', 'ton', 'kg'],
    pesoPorUnidadeKg: 60,
    apelidoUnidade: 'Saca (60 kg)',
    precoReferenciaUnitarioR$: 220.0,
    metaProdutividadePadraoHa: 45, // 45 sc/ha
    descricaoComercializacao: 'Comercializado em sacas de 60 kg padrão comercial peneira 12 com desconto por grãos bandados ou manchados.'
  },
  {
    id: 'manga',
    cultura: 'Manga',
    icon: '🥭',
    categoria: 'Fruticultura',
    variedade: 'Palmer',
    exemplosVariedades: ['Palmer', 'Tommy Atkins', 'Keitt', 'Kent', 'Haden', 'Espada'],
    unidadeComercializacaoPrincipal: 'cx',
    unidadesHabilitadas: ['cx', 'kg', 'ton'],
    pesoPorUnidadeKg: 20,
    apelidoUnidade: 'Caixa (20 kg)',
    precoReferenciaUnitarioR$: 55.0,
    metaProdutividadePadraoHa: 1400, // 1.400 cx/ha (~28 ton/ha)
    descricaoComercializacao: 'Comercializada em caixas de 4 a 6 kg para exportação aérea/marítima, caixas de 20 kg no mercado interno ou granel por tonelada.'
  },
  {
    id: 'abacaxi',
    cultura: 'Abacaxi',
    icon: '🍍',
    categoria: 'Fruticultura',
    variedade: 'Pérola',
    exemplosVariedades: ['Pérola', 'Smooth Cayenne', 'BRS Imperial', 'Vitória'],
    unidadeComercializacaoPrincipal: 'un',
    unidadesHabilitadas: ['un', 'cx', 'ton', 'kg'],
    pesoPorUnidadeKg: 1.6,
    apelidoUnidade: 'Fruto / Unidade (1.6 kg)',
    precoReferenciaUnitarioR$: 4.5,
    metaProdutividadePadraoHa: 28000, // 28.000 frutos/ha
    descricaoComercializacao: 'Comercializado por milheiro ou unidade para redes de varejo, ou em caixas de 10 a 12 unidades (18 kg) e tonelada para polpas.'
  },
  {
    id: 'cana',
    cultura: 'Cana-de-Açúcar',
    icon: '🎋',
    categoria: 'Industriais & Outros',
    variedade: 'RB867515',
    exemplosVariedades: ['RB867515', 'CTC4', 'RB966928', 'CTC9001', 'SP80-3280'],
    unidadeComercializacaoPrincipal: 'ton',
    unidadesHabilitadas: ['ton', 'kg'],
    pesoPorUnidadeKg: 1000,
    apelidoUnidade: 'Tonelada de Cana (ATR)',
    precoReferenciaUnitarioR$: 145.0,
    metaProdutividadePadraoHa: 85, // 85 ton/ha
    descricaoComercializacao: 'Comercializada por tonelada entregue na usina com remuneração calculada sobre os kg de Açúcar Total Recuperável (ATR/ton).'
  }
];

export const UNIDADE_DESCRICOES: Record<UnidadeComercializacao, { nome: string; sigla: string; descricao: string; pesoPadraoKg: number }> = {
  cx: {
    nome: 'Caixa Comercial',
    sigla: 'cx',
    descricao: 'Caixas de madeira, papelão ou plástico (padrão hortifrúti / frutas / banana)',
    pesoPadraoKg: 20
  },
  sc: {
    nome: 'Saca Agrícola',
    sigla: 'sc',
    descricao: 'Saca padrão de 60 kg (grãos, cereais, café, milho, soja) ou 50 kg',
    pesoPadraoKg: 60
  },
  kg: {
    nome: 'Quilograma',
    sigla: 'kg',
    descricao: 'Unidade decimal por peso líquido',
    pesoPadraoKg: 1
  },
  ton: {
    nome: 'Tonelada Métrica',
    sigla: 'ton',
    descricao: 'Cargas a granel, cana, mandioca, silagem (1.000 kg)',
    pesoPadraoKg: 1000
  },
  '@': {
    nome: 'Arroba Agrícola',
    sigla: '@',
    descricao: 'Padrão para algodão pluma, cacau e pecuária (15 kg)',
    pesoPadraoKg: 15
  },
  un: {
    nome: 'Unidade / Fruto',
    sigla: 'un',
    descricao: 'Venda por fruto individual ou cabeça (abacaxi, melancia, coco)',
    pesoPadraoKg: 1.5
  },
  bandeja: {
    nome: 'Bandeja / Pack',
    sigla: 'bandeja',
    descricao: 'Frutas climatizadas ou morangos embalados',
    pesoPadraoKg: 2.5
  },
  cacho: {
    nome: 'Cacho Inteiro',
    sigla: 'cacho',
    descricao: 'Venda de banana ou palma inteira direto da roça',
    pesoPadraoKg: 25
  },
  litros: {
    nome: 'Litros / Volume',
    sigla: 'litros',
    descricao: 'Líquidos, polpas e derivados agroindustriais',
    pesoPadraoKg: 1
  }
};

/**
 * Retorna a configuração padrão de cultura integrada para o app (Banana como destaque conforme solicitado)
 */
export const DEFAULT_CONFIG_CULTURA: ConfigCulturaIntegrada = {
  cultura: 'Banana',
  variedade: 'Prata Anã (Gorutuba)',
  unidadeComercializacaoPrincipal: 'cx',
  unidadesHabilitadas: ['cx', 'sc', 'kg', 'ton'],
  pesoPorUnidadeKg: 20,
  apelidoUnidade: 'Caixa (20 kg)',
  precoReferenciaUnitarioR$: 68.0,
  metaProdutividadePadraoHa: 1500,
  descricaoComercializacao: 'Banana comercializada preferencialmente em caixas de 20kg (cx), aceitando também vendas por saco (sc), kg ou tonelada (ton).'
};
