import React, { useState, useEffect, useMemo } from 'react';
import { PlantaCoberturaInfo, AreaDegradadaItem } from '../../types/recupera';
import { Sprout, Calculator, Search, CheckCircle2 } from 'lucide-react';

interface Props {
  areaAtiva?: AreaDegradadaItem;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const PLANTAS_COBERTURA_CATALOGO: PlantaCoberturaInfo[] = [
  {
    id: 'crotalaria_ochroleuca',
    nomePopular: 'Crotalária Ochroleuca',
    nomeCientifico: 'Crotalaria ochroleuca',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 4.0,
    producaoBiomassaSecaTHaMax: 8.0,
    relacaoCN: '18:1 a 22:1 (Decomposição Rápida / Liberação de N)',
    epocaSemeadura: 'Outubro a Março (Águas e Safrinha)',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Ampla adaptação em solos tropicais e arenosos do Cerrado',
    taxaSemeaduraKgHa: 10,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Fixação biológica de Nitrogênio (100 a 180 kg N/ha)',
      'Redução drástica de Pratylenchus brachyurus e Meloidogyne javanica',
      'Descompactação biológica de camadas adensadas',
      'Controle e abafamento de plantas daninhas'
    ],
    consorciosRecomendados: ['Milheto', 'Brachiaria ruziziensis', 'Capim-sudão']
  },
  {
    id: 'crotalaria_spectabilis',
    nomePopular: 'Crotalária Spectabilis',
    nomeCientifico: 'Crotalaria spectabilis',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 3.5,
    producaoBiomassaSecaTHaMax: 6.0,
    relacaoCN: '15:1 a 20:1',
    epocaSemeadura: 'Novembro a Fevereiro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Excelente em solos de média a alta fertilidade',
    taxaSemeaduraKgHa: 12,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Espécie número 1 para controle biológico de nematoides de cisto e das galhas',
      'Excelente reciclagem de potássio e fósforo',
      'Fixação simbiótica de nitrogênio atmosférico'
    ],
    consorciosRecomendados: ['Aveia preta', 'Milheto']
  },
  {
    id: 'milheto_grao',
    nomePopular: 'Milheto (Pennisetum glaucum)',
    nomeCientifico: 'Pennisetum glaucum cv. ADR300',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 7.0,
    producaoBiomassaSecaTHaMax: 14.0,
    relacaoCN: '30:1 a 40:1 (Palhada durável no solo)',
    epocaSemeadura: 'Fevereiro a Abril (Safrinha)',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Altíssima tolerância a estresse hídrico e seca',
    taxaSemeaduraKgHa: 15,
    profundidadeSemeaduraCm: '1.5 a 3 cm',
    beneficiosSolo: [
      'Enorme produção de palhada para proteção térmica do solo',
      'Extração eficiente de nutrientes em camadas profundas (>1.5 m)',
      'Prevenção de erosão hídrica e eólica',
      'Melhoria rápida da estrutura física superficial'
    ],
    consorciosRecomendados: ['Crotalária ochroleuca', 'Feijão-guandu']
  },
  {
    id: 'feijao_guandu',
    nomePopular: 'Feijão-Guandu Anão',
    nomeCientifico: 'Cajanus cajan',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Bianual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 5.0,
    producaoBiomassaSecaTHaMax: 10.0,
    relacaoCN: '20:1 a 25:1',
    epocaSemeadura: 'Outubro a Dezembro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Tolerância extrema a secas prolongadas e solos pobres',
    taxaSemeaduraKgHa: 25,
    profundidadeSemeaduraCm: '3 a 5 cm',
    beneficiosSolo: [
      'Poderosa capacidade de romper camadas compactadas de solo (arado biológico)',
      'Fixação de até 200 kg N/ha',
      'Solubilização de fósforo fixado por exudatos radiculares ácidos'
    ],
    consorciosRecomendados: ['Milheto', 'Brachiaria decumbens']
  },
  {
    id: 'brachiaria_ruziziensis',
    nomePopular: 'Brachiaria ruziziensis',
    nomeCientifico: 'Urochloa ruziziensis',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Perene',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 6.0,
    producaoBiomassaSecaTHaMax: 11.0,
    relacaoCN: '35:1 a 45:1',
    epocaSemeadura: 'Fevereiro a Março (Consórcio Safrinha)',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Regiões tropicais sem geadas severas',
    taxaSemeaduraKgHa: 8,
    profundidadeSemeaduraCm: '1 a 2 cm',
    beneficiosSolo: [
      'Geração de palhada uniforme de fácil dessecação com glifosato',
      'Estruturação biológica de agregados do solo pelas raízes fasciculadas',
      'Supressão de plantas daninhas resistentes'
    ],
    consorciosRecomendados: ['Milho safrinha', 'Crotalária spectabilis']
  },
  {
    id: 'nabo_forrageiro',
    nomePopular: 'Nabo Forrageiro',
    nomeCientifico: 'Raphanus sativus var. oleiferus',
    familia: 'Crucífera (Brassicaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 3.0,
    producaoBiomassaSecaTHaMax: 7.0,
    relacaoCN: '12:1 a 18:1 (Ciclagem ultrarrápida)',
    epocaSemeadura: 'Abril a Junho (Outono/Inverno)',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Clima subtropical e regiões com inverno ameno a frio',
    taxaSemeaduraKgHa: 12,
    profundidadeSemeaduraCm: '1 a 2 cm',
    beneficiosSolo: [
      'Raiz pivotante carnosa que deixa galerias biológicas de drenagem e aeração no solo',
      'Altíssima reciclagem de nitrogênio e fósforo para a cultura seguinte',
      'Efeito biofumigante contra patógenos do solo por glucosinolatos'
    ],
    consorciosRecomendados: ['Aveia preta', 'Centeio']
  },
  {
    id: 'aveia_preta',
    nomePopular: 'Aveia Preta',
    nomeCientifico: 'Avena strigosa',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 4.0,
    producaoBiomassaSecaTHaMax: 8.0,
    relacaoCN: '28:1 a 35:1',
    epocaSemeadura: 'Março a Maio',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Regiões Sul, Sudeste e Centro-Sul',
    taxaSemeaduraKgHa: 50,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Efeito alelopático supressor de plantas daninhas de inverno',
      'Excelente cobertura e proteção de encostas contra erosão',
      'Reciclagem de potássio na biomassa'
    ],
    consorciosRecomendados: ['Nabo forrageiro', 'Ervilhaca comum']
  },
  {
    id: 'mucuna_preta',
    nomePopular: 'Mucuna Preta',
    nomeCientifico: 'Mucuna aterrima',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 6.0,
    producaoBiomassaSecaTHaMax: 10.0,
    relacaoCN: '18:1 a 22:1',
    epocaSemeadura: 'Outubro a Dezembro',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Altamente vigorosa em clima quente e úmido',
    taxaSemeaduraKgHa: 70,
    profundidadeSemeaduraCm: '3 a 5 cm',
    beneficiosSolo: [
      'Espécie campeã em abafamento e controle de tiririca (Cyperus rotundus)',
      'Fixação maciça de até 250 kg N/ha',
      'Enriquecimento do solo em matéria orgânica jovem'
    ],
    consorciosRecomendados: ['Milho safrinha (em linhas alternadas)']
  },
  {
    id: 'crotalaria_juncea',
    nomePopular: 'Crotalária Juncea',
    nomeCientifico: 'Crotalaria juncea',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 8.0,
    producaoBiomassaSecaTHaMax: 15.0,
    relacaoCN: '22:1 a 26:1',
    epocaSemeadura: 'Outubro a Fevereiro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Crescimento ultrarrápido em regiões tropicais e subtropicais',
    taxaSemeaduraKgHa: 25,
    profundidadeSemeaduraCm: '2 a 4 cm',
    beneficiosSolo: [
      'Maior produção de biomassa e altura entre leguminosas tropicais (até 3 m)',
      'Fixação simbiótica de 150 a 280 kg N/ha em 90-110 dias',
      'Forte supressão de nematoides das galhas e cisto',
      'Rompimento de camadas compactadas e rápida proteção contra erosão'
    ],
    consorciosRecomendados: ['Milheto', 'Sorgo biomassa', 'Capim-sudão']
  },
  {
    id: 'crotalaria_breviflora',
    nomePopular: 'Crotalária Breviflora',
    nomeCientifico: 'Crotalaria breviflora',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 2.5,
    producaoBiomassaSecaTHaMax: 4.5,
    relacaoCN: '16:1 a 20:1',
    epocaSemeadura: 'Outubro a Março',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Porte baixo ideal para entrelinhas de perenes e citros/café',
    taxaSemeaduraKgHa: 15,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Porte reduzido (~0,8 m) sem competir por luz com culturas perenes',
      'Controle eficaz de Meloidogyne incognita, M. javanica e Pratylenchus',
      'Aporte rápido de nitrogênio e cobertura viva nas entrelinhas'
    ],
    consorciosRecomendados: ['Café e Citros (entrelinhas)', 'Brachiaria ruziziensis']
  },
  {
    id: 'feijao_de_porco',
    nomePopular: 'Feijão-de-Porco',
    nomeCientifico: 'Canavalia ensiformis',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 4.5,
    producaoBiomassaSecaTHaMax: 8.0,
    relacaoCN: '15:1 a 20:1',
    epocaSemeadura: 'Outubro a Janeiro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Rústico, tolera solos ácidos, baixa fertilidade e sombreamento parcial',
    taxaSemeaduraKgHa: 80,
    profundidadeSemeaduraCm: '3 a 5 cm',
    beneficiosSolo: [
      'Efeito alelopático potente contra tiririca (Cyperus rotundus) e gramíneas',
      'Fixação de 120 a 190 kg N/ha e mobilização de cálcio e fósforo',
      'Cobertura agressiva do solo logo nos primeiros 35 dias'
    ],
    consorciosRecomendados: ['Milho', 'Frutíferas', 'Cafeeiro']
  },
  {
    id: 'estilosantes_campo_grande',
    nomePopular: 'Estilosantes Campo Grande',
    nomeCientifico: 'Stylosanthes capitata + S. macrocephala',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Perene',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 4.0,
    producaoBiomassaSecaTHaMax: 9.0,
    relacaoCN: '18:1 a 23:1',
    epocaSemeadura: 'Outubro a Janeiro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Excelente em solos arenosos de baixa fertilidade natural do Cerrado',
    taxaSemeaduraKgHa: 3.5,
    profundidadeSemeaduraCm: '1 a 2 cm',
    beneficiosSolo: [
      'Consorciação clássica com gramíneas forrageiras em pastagens degradadas',
      'Fixação contínua de 80 a 180 kg N/ha/ano reduzindo adubação nitrogenada',
      'Eleva teor proteico da dieta animal e ressemeadura natural anual'
    ],
    consorciosRecomendados: ['Brachiaria decumbens', 'Brachiaria brizantha']
  },
  {
    id: 'lablab',
    nomePopular: 'Labe-Labe (Feijão-Labe)',
    nomeCientifico: 'Lablab purpureus',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 4.5,
    producaoBiomassaSecaTHaMax: 7.5,
    relacaoCN: '17:1 a 22:1',
    epocaSemeadura: 'Novembro a Março',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Regiões tropicais e subtropicais; boa tolerância à seca após estabelecimento',
    taxaSemeaduraKgHa: 30,
    profundidadeSemeaduraCm: '3 a 5 cm',
    beneficiosSolo: [
      'Dupla aptidão: adubação verde de alta massa e forragem proteica na entressafra',
      'Raiz pivotante profunda com excelente reciclagem de potássio e cálcio',
      'Persistência verde por mais tempo no início do período seco'
    ],
    consorciosRecomendados: ['Milho safrinha', 'Sorgo forrageiro']
  },
  {
    id: 'ervilhaca_comum',
    nomePopular: 'Ervilhaca Comum',
    nomeCientifico: 'Vicia sativa',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Ramificado superficial',
    producaoBiomassaSecaTHaMin: 3.0,
    producaoBiomassaSecaTHaMax: 6.0,
    relacaoCN: '12:1 a 16:1 (Mineralização rápida de N)',
    epocaSemeadura: 'Abril a Junho (Inverno)',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Clima subtropical e temperado com invernos frios',
    taxaSemeaduraKgHa: 45,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Fixação de 90 a 150 kg N/ha no inverno antecedendo milho verão',
      'Baixa relação C/N acelera liberação de nitrogênio para gramíneas sucessoras',
      'Proteção total contra erosão de inverno quando consorciada com aveia'
    ],
    consorciosRecomendados: ['Aveia preta', 'Centeio', 'Nabo forrageiro']
  },
  {
    id: 'tremoco_branco',
    nomePopular: 'Tremoço-Branco',
    nomeCientifico: 'Lupinus albus',
    familia: 'Leguminosa (Fabaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 3.5,
    producaoBiomassaSecaTHaMax: 6.5,
    relacaoCN: '15:1 a 19:1',
    epocaSemeadura: 'Abril a Maio',
    exigenciaHidrica: 'Média',
    adaptacaoClimatica: 'Regiões Sul e Sudeste de altitude com inverno ameno/frio',
    taxaSemeaduraKgHa: 60,
    profundidadeSemeaduraCm: '3 a 4 cm',
    beneficiosSolo: [
      'Raízes proteoides secretam ácidos orgânicos que disponibilizam P retido',
      'Descompactação biológica profunda em áreas de plantio direto consolidado',
      'Fixação biológica de 110 a 170 kg N/ha'
    ],
    consorciosRecomendados: ['Aveia preta', 'Centeio']
  },
  {
    id: 'brachiaria_decumbens',
    nomePopular: 'Brachiaria Decumbens',
    nomeCientifico: 'Urochloa decumbens',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Perene',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 7.0,
    producaoBiomassaSecaTHaMax: 13.0,
    relacaoCN: '38:1 a 48:1',
    epocaSemeadura: 'Outubro a Março',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Altíssima rusticidade em solos ácidos, álicos e de baixa fertilidade',
    taxaSemeaduraKgHa: 8,
    profundidadeSemeaduraCm: '1 a 2 cm',
    beneficiosSolo: [
      'Excelente para contenção de taludes, cabeceiras de drenagem e áreas erodidas',
      'Densidade radicular superior para retenção de solo superficial',
      'Produção de palhada persistente em sistemas de recuperação gradual'
    ],
    consorciosRecomendados: ['Estilosantes Campo Grande', 'Feijão-guandu']
  },
  {
    id: 'capim_sudao',
    nomePopular: 'Capim-Sudão',
    nomeCientifico: 'Sorghum sudanense',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 6.0,
    producaoBiomassaSecaTHaMax: 12.0,
    relacaoCN: '32:1 a 42:1',
    epocaSemeadura: 'Setembro a Março',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Ampla adaptação a veranicos, solos arenosos e áreas em reforma',
    taxaSemeaduraKgHa: 18,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Crescimento inicial acelerado com ótimo potencial de rebrota',
      'Raízes profundas recuperam estrutura física e porosidade do solo',
      'Alta produção de palhada ou pastejo estratégico na entressafra'
    ],
    consorciosRecomendados: ['Crotalária ochroleuca', 'Crotalária juncea']
  },
  {
    id: 'sorgo_biomassa',
    nomePopular: 'Sorgo Biomassa / Forrageiro',
    nomeCientifico: 'Sorghum bicolor',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 10.0,
    producaoBiomassaSecaTHaMax: 20.0,
    relacaoCN: '40:1 a 55:1 (Altíssima persistência)',
    epocaSemeadura: 'Outubro a Março',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Regiões quentes com déficit hídrico sazonal',
    taxaSemeaduraKgHa: 12,
    profundidadeSemeaduraCm: '2 a 4 cm',
    beneficiosSolo: [
      'Campeão absoluto de matéria seca e carbono orgânico incorporado ao solo',
      'Raiz vigorosa recicla potássio lixiviado de horizontes subsuperficiais',
      'Reduz temperatura superficial e evaporação em até 60%'
    ],
    consorciosRecomendados: ['Crotalária juncea', 'Feijão-guandu']
  },
  {
    id: 'centeio',
    nomePopular: 'Centeio',
    nomeCientifico: 'Secale cereale',
    familia: 'Gramínea (Poaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Fasciculado denso e profundo',
    producaoBiomassaSecaTHaMin: 4.5,
    producaoBiomassaSecaTHaMax: 8.5,
    relacaoCN: '35:1 a 45:1',
    epocaSemeadura: 'Abril a Junho',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Excelente tolerância a frio, seca hibernal e solos arenosos/pobres',
    taxaSemeaduraKgHa: 55,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Forte ação alelopática sobre plantas daninhas de difícil controle (buva, capim-amargoso)',
      'Desenvolve sistema radicular vigoroso mesmo sob baixa umidade de outono',
      'Palhada de decomposição lenta garante cobertura duradoura para soja'
    ],
    consorciosRecomendados: ['Nabo forrageiro', 'Ervilhaca comum', 'Tremoço-branco']
  },
  {
    id: 'trigo_mourisco',
    nomePopular: 'Trigo Mourisco (Trigo-Sarraceno)',
    nomeCientifico: 'Fagopyrum esculentum',
    familia: 'Poligonácea (Polygonaceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Ramificado superficial',
    producaoBiomassaSecaTHaMin: 2.5,
    producaoBiomassaSecaTHaMax: 5.0,
    relacaoCN: '22:1 a 28:1',
    epocaSemeadura: 'Setembro a Abril',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Ciclo ultracurto (45-60 dias), adapta-se a janelas curtas entre safras',
    taxaSemeaduraKgHa: 40,
    profundidadeSemeaduraCm: '2 a 3 cm',
    beneficiosSolo: [
      'Solubilizador excepcional de fósforo pouco lábil por exsudação de ácidos',
      'Cobertura rápida em apenas 20 dias após emergência',
      'Atrai polinizadores e inimigos naturais de pragas para o agroecossistema'
    ],
    consorciosRecomendados: ['Milheto', 'Crotalária spectabilis', 'Nabo forrageiro']
  },
  {
    id: 'girassol_cobertura',
    nomePopular: 'Girassol (Cobertura & Ciclagem)',
    nomeCientifico: 'Helianthus annuus',
    familia: 'Asterácea (Asteraceae)',
    ciclo: 'Anual',
    sistemaRadicular: 'Pivotante vigoroso e descompactador',
    producaoBiomassaSecaTHaMin: 4.0,
    producaoBiomassaSecaTHaMax: 7.5,
    relacaoCN: '24:1 a 30:1',
    epocaSemeadura: 'Fevereiro a Abril / Agosto a Outubro',
    exigenciaHidrica: 'Baixa',
    adaptacaoClimatica: 'Ampla tolerância térmica e hídrica em diversas latitudes brasileiras',
    taxaSemeaduraKgHa: 8,
    profundidadeSemeaduraCm: '3 a 4 cm',
    beneficiosSolo: [
      'Sistema radicular pivotante profundo que recicla boro, potássio e cálcio',
      'Diversifica famílias botânicas no mix de cobertura (quebra de ciclo de pragas)',
      'Promove aeração biológica e atrai polinizadores'
    ],
    consorciosRecomendados: ['Milheto', 'Crotalária ochroleuca', 'Trigo mourisco']
  }
];

export const RecuperaPlantasCoberturaView: React.FC<Props> = ({ areaAtiva }) => {
  const [busca, setBusca] = useState('');
  const [filtroFamilia, setFiltroFamilia] = useState<string>('todas');
  const [plantaSelecionada, setPlantaSelecionada] = useState<PlantaCoberturaInfo>(PLANTAS_COBERTURA_CATALOGO[0]);

  const [especie1, setEspecie1] = useState<string>('crotalaria_ochroleuca');
  const [especie2, setEspecie2] = useState<string>('milheto_grao');
  const [proporcaoEspecie1, setProporcaoEspecie1] = useState<number>(50);
  const [areaSimuladaHa, setAreaSimuladaHa] = useState<string>(areaAtiva?.areaHa ? String(areaAtiva.areaHa) : '');

  useEffect(() => {
    setAreaSimuladaHa(areaAtiva?.areaHa ? String(areaAtiva.areaHa) : '');
  }, [areaAtiva?.id, areaAtiva?.areaHa]);

  const p1 = PLANTAS_COBERTURA_CATALOGO.find(p => p.id === especie1) || PLANTAS_COBERTURA_CATALOGO[0];
  const p2 = PLANTAS_COBERTURA_CATALOGO.find(p => p.id === especie2) || PLANTAS_COBERTURA_CATALOGO[2];

  const areaHaNum = Math.max(0, parseFloat(areaSimuladaHa) || 0);
  const taxaP1 = (p1.taxaSemeaduraKgHa * (proporcaoEspecie1 / 100)).toFixed(1);
  const taxaP2 = (p2.taxaSemeaduraKgHa * ((100 - proporcaoEspecie1) / 100)).toFixed(1);
  const biomassaMediaEstimada = (
    ((p1.producaoBiomassaSecaTHaMin + p1.producaoBiomassaSecaTHaMax) / 2) * (proporcaoEspecie1 / 100) +
    ((p2.producaoBiomassaSecaTHaMin + p2.producaoBiomassaSecaTHaMax) / 2) * ((100 - proporcaoEspecie1) / 100)
  ).toFixed(1);

  const leguminosas = useMemo(
    () => PLANTAS_COBERTURA_CATALOGO.filter(p => p.familia.includes('Leguminosa')),
    []
  );
  const naoLeguminosas = useMemo(
    () => PLANTAS_COBERTURA_CATALOGO.filter(p => !p.familia.includes('Leguminosa')),
    []
  );

  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return PLANTAS_COBERTURA_CATALOGO.filter(p => {
      const matchFamilia =
        filtroFamilia === 'todas' ||
        (filtroFamilia === 'leguminosa' && p.familia.includes('Leguminosa')) ||
        (filtroFamilia === 'graminea' && p.familia.includes('Gramínea')) ||
        (filtroFamilia === 'outras' && !p.familia.includes('Leguminosa') && !p.familia.includes('Gramínea'));
      const matchBusca =
        p.nomePopular.toLowerCase().includes(termo) ||
        p.nomeCientifico.toLowerCase().includes(termo) ||
        p.familia.toLowerCase().includes(termo) ||
        p.beneficiosSolo.some(b => b.toLowerCase().includes(termo));
      return matchFamilia && matchBusca;
    });
  }, [busca, filtroFamilia]);

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider tabular-nums">
            Fase 4 • Plantas de Cobertura & Adubação Verde ({PLANTAS_COBERTURA_CATALOGO.length} espécies)
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Biblioteca Técnica & Simulador de Consórcios</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Biomassa seca, relação C/N, sistema radicular descompactador e cálculo de taxas
            {areaAtiva?.nomeTalhao ? ` para ${areaAtiva.nomeTalhao}` : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={filtroFamilia}
            onChange={e => setFiltroFamilia(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="todas">Todas as famílias ({PLANTAS_COBERTURA_CATALOGO.length})</option>
            <option value="leguminosa">Leguminosas (Fabaceae)</option>
            <option value="graminea">Gramíneas (Poaceae)</option>
            <option value="outras">Crucíferas / Poligonáceas / Asteráceas</option>
          </select>

          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar espécie ou benefício..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Espécies + Ficha Técnica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filtradas.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
              Nenhuma espécie encontrada com os filtros atuais.
            </div>
          ) : (
            filtradas.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlantaSelecionada(p)}
                className={`w-full p-3.5 rounded-xl border transition text-left text-xs ${
                  plantaSelecionada.id === p.id
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100">{p.nomePopular}</h4>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 shrink-0">
                    {p.familia.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic mb-1.5">{p.nomeCientifico}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                  <span>
                    Biomassa:{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {p.producaoBiomassaSecaTHaMin}-{p.producaoBiomassaSecaTHaMax} t/ha
                    </strong>
                  </span>
                  <span>
                    Taxa: <strong className="text-slate-800 dark:text-zinc-200">{p.taxaSemeaduraKgHa} kg/ha</strong>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Ficha Técnica da Espécie Selecionada */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {plantaSelecionada.familia} • {plantaSelecionada.ciclo}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              {plantaSelecionada.nomePopular}{' '}
              <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 italic">
                ({plantaSelecionada.nomeCientifico})
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-200/80 dark:border-zinc-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
            <div className="p-3">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Sistema Radicular</span>
              <strong className="font-semibold text-slate-800 dark:text-zinc-200">
                {plantaSelecionada.sistemaRadicular}
              </strong>
            </div>
            <div className="p-3">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Biomassa Seca</span>
              <strong className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {plantaSelecionada.producaoBiomassaSecaTHaMin} a {plantaSelecionada.producaoBiomassaSecaTHaMax} t/ha
              </strong>
            </div>
            <div className="p-3">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Relação C/N</span>
              <strong className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                {plantaSelecionada.relacaoCN}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Época de Semeadura</span>
              <p className="text-slate-600 dark:text-zinc-400">{plantaSelecionada.epocaSemeadura}</p>
            </div>
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                Profundidade & Taxa Pura
              </span>
              <p className="text-slate-600 dark:text-zinc-400 tabular-nums">
                {plantaSelecionada.profundidadeSemeaduraCm} • {plantaSelecionada.taxaSemeaduraKgHa} kg/ha
              </p>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-2">
              Principais Benefícios para Recuperação do Solo:
            </span>
            <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
              {plantaSelecionada.beneficiosSolo.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Simulador Interativo de Consórcios */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Simulador de Consórcios & Taxa de Sementes Ponderada</span>
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
            O consórcio entre uma Gramínea (alta palhada e C/N elevado) e uma Leguminosa (fixação de N e C/N baixo) equilibra a decomposição da matéria orgânica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
              Leguminosa (Fixadora de N)
            </label>
            <select value={especie1} onChange={e => setEspecie1(e.target.value)} className={INPUT_CLASS}>
              {leguminosas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nomePopular}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
              Gramínea / Outra Família (Palhada)
            </label>
            <select value={especie2} onChange={e => setEspecie2(e.target.value)} className={INPUT_CLASS}>
              {naoLeguminosas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nomePopular}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium tabular-nums">
              Proporção: {proporcaoEspecie1}% / {100 - proporcaoEspecie1}%
            </label>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={proporcaoEspecie1}
              onChange={e => setProporcaoEspecie1(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 mt-2.5"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
              Área para Cálculo Total (ha)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={areaSimuladaHa}
              onChange={e => setAreaSimuladaHa(e.target.value)}
              placeholder="Ex: 15"
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>
        </div>

        {/* Resultado Consolidado do Consórcio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-200/80 dark:border-zinc-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800 overflow-hidden bg-slate-50/70 dark:bg-zinc-950/60">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Dose de {p1.nomePopular.split(' ')[0]}
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
              {taxaP1} kg/ha
            </p>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {areaHaNum > 0
                ? `Total (${areaHaNum} ha): ${(parseFloat(taxaP1) * areaHaNum).toFixed(1)} kg`
                : 'Informe a área em ha para calcular total'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Dose de {p2.nomePopular.split(' ')[0]}
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
              {taxaP2} kg/ha
            </p>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {areaHaNum > 0
                ? `Total (${areaHaNum} ha): ${(parseFloat(taxaP2) * areaHaNum).toFixed(1)} kg`
                : 'Informe a área em ha para calcular total'}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
              Biomassa Seca Combinada
            </span>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
              ~{biomassaMediaEstimada} t/ha
            </p>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              Equilíbrio C/N ideal para o solo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
