import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da Nortox S.A.
 * Registrante: Nortox S.A.
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: 173 produtos formulados químicos, biológicos e reguladores registrados no Brasil.
 */
export const NORTOX_OFFICIAL_CATALOG: PesticideProduct[] = [
  {
    "id": "nortox-ofc-2923-1",
    "productName": "Aba 400 WG Nortox",
    "registrationNumber": "02923",
    "activeIngredient": "Abamectina (400 g/kg)",
    "chemicalGroup": "Avermectina (Grupo 6)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ativador de canais de cloro com ação translaminar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2923-1-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-rajado, Ácaro-da-leprose, Bicho-mineiro e Nematoides",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-2923-1-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2923-1-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2923-1-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-2923-1-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-5501-2",
    "productName": "Abamectin Nortox",
    "registrationNumber": "05501",
    "activeIngredient": "Abamectina (18 g/L)",
    "chemicalGroup": "Avermectina (Grupo 6)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Acaricida de profundidade com excelente ação translaminar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-5501-2-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Ácaro-branco e Larva-minadora",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-5501-2-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5501-2-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5501-2-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-5501-2-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.75,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-6020-3",
    "productName": "Abamectin Nortox 400 WG",
    "registrationNumber": "06020",
    "activeIngredient": "Abamectina (400 g/kg)",
    "chemicalGroup": "Avermectina (Grupo 6)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração WG com rápido choque e residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6020-3-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-rajado, Ácaro-da-leprose e Bicho-mineiro",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-6020-3-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6020-3-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6020-3-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-6020-3-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-3624-4",
    "productName": "Abamectin Nortox 72 EC",
    "registrationNumber": "03624",
    "activeIngredient": "Abamectina (72 g/L)",
    "chemicalGroup": "Avermectina (Grupo 6)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inseticida neurotóxico sobre minadores e sugadores.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3624-4-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicho-mineiro, Mosca-minadora e Traça-do-tomateiro",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3624-4-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3624-4-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3624-4-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-3624-4-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-29617-5",
    "productName": "Abamectin 72 EC Nortox",
    "registrationNumber": "29617",
    "activeIngredient": "Abamectina (72 g/L)",
    "chemicalGroup": "Avermectina (Grupo 6)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação líquida emulsionável de alta eficácia translaminar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-29617-5-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Ácaro-vermelho e Larva-minadora",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-29617-5-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29617-5-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29617-5-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-29617-5-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-16024-6",
    "productName": "Acefato Max Nortox",
    "registrationNumber": "16024",
    "activeIngredient": "Acefato (970 g/kg)",
    "chemicalGroup": "Organofosforado (Grupo 1B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SP - Pó Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da acetilcolinesterase sistêmico com alta penetração.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-16024-6-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.75,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Percevejo-marrom, Percevejo-da-soja e Pulgões",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16024-6-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.75,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16024-6-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.83,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16024-6-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.75,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-16024-6-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.13,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-16907-7",
    "productName": "Acefato Nortox",
    "registrationNumber": "16907",
    "activeIngredient": "Acefato (750 g/L)",
    "chemicalGroup": "Organofosforado (Grupo 1B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SP - Pó Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inseticida sistêmico e de contato de amplo espectro.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-16907-7-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Percevejo-barriga-verde, Percevejo-marrom e Mosca-branca",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16907-7-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16907-7-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16907-7-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-16907-7-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-43619-8",
    "productName": "Acetamiprid Nortox",
    "registrationNumber": "43619",
    "activeIngredient": "Acetamiprido (200 g/kg)",
    "chemicalGroup": "Neonicotinoide (Grupo 4A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SP - Pó Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Modulador de receptores nicotínicos sistêmico ascendente.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-43619-8-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mosca-branca, Pulgão-do-algodoeiro e Cigarrinha-do-milho",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43619-8-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43619-8-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43619-8-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-43619-8-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-1218-9",
    "productName": "Acetamiprid Nortox 200 SP",
    "registrationNumber": "01218",
    "activeIngredient": "Acetamiprido (200 g/kg)",
    "chemicalGroup": "Neonicotinoide (Grupo 4A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SP - Pó Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inseticida sistêmico em pó solúvel para pulverização foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1218-9-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mosca-branca, Cigarrinha-do-milho e Tripes",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1218-9-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1218-9-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1218-9-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-1218-9-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-11601-10",
    "productName": "Alaclor + Atrazina SC Nortox",
    "registrationNumber": "11601",
    "activeIngredient": "Alacloro (240 g/L) + Atrazina (250 g/L)",
    "chemicalGroup": "Cloroacetanilida (Grupo 15) + Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mistura herbicida pré-emergente de duplo mecanismo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11601-10-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Folhas largas",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11601-10-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Folhas largas",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11601-10-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11601-10-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 3.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11601-10-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 4.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-1038601-11",
    "productName": "Alaclor Nortox",
    "registrationNumber": "1038601",
    "activeIngredient": "Alacloro (480 g/L)",
    "chemicalGroup": "Cloroacetanilida (Grupo 15)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ácidos graxos de cadeia muito longa (VLCFA).",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1038601-11-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-colchão, Capim-pé-de-galinha e Caruru",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-1038601-11-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-colchão, Capim-pé-de-galinha e Caruru",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1038601-11-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 3.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1038601-11-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.98,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1038601-11-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 4.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-12522-12",
    "productName": "Ametrina Nortox",
    "registrationNumber": "12522",
    "activeIngredient": "Ametrina (800 g/kg)",
    "chemicalGroup": "Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da fotossíntese no fotossistema II em pré e pós-precoce.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12522-12-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-braquiária, Capim-colonião e Corda-de-viola",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 250
      },
      {
        "id": "nortox-ofc-12522-12-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-6222-13",
    "productName": "Amicarbazone Nortox",
    "registrationNumber": "06222",
    "activeIngredient": "Amicarbazona (700 g/kg)",
    "chemicalGroup": "Triazolinona (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida sistêmico de excelente atividade no solo com palha.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6222-13-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Corda-de-viola, Mamona, Caruru e Picão-preto",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-6222-13-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Corda-de-viola, Mamona, Caruru e Picão-preto",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6222-13-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6222-13-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.02,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6222-13-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.44,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-6723-14",
    "productName": "Arkeiro Nortox",
    "registrationNumber": "06723",
    "activeIngredient": "Clorimurom (100 g/kg) + Flumioxazina (200 g/kg) + Imazetapir (400 g/kg)",
    "chemicalGroup": "Sulfoniluréia + N-fenilftalimida + Imidazolinona",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Tripla ação inibidora de ALS e PROTOX com longo residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6723-14-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Capim-amargoso e Picão-preto em dessecação pré-plantio",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6723-14-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Capim-amargoso e Picão-preto em dessecação pré-plantio",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6723-14-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6723-14-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.13,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6723-14-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-11707-15",
    "productName": "Arrow",
    "registrationNumber": "11707",
    "activeIngredient": "Trifluralina (450 g/L)",
    "chemicalGroup": "Dinitroanilina (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da montagem de microtúbulos em pré-emergência ou PPI.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11707-15-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-colchão e Caruru",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11707-15-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-colchão e Caruru",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11707-15-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11707-15-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11707-15-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-8818-16",
    "productName": "Atrazina Max Nortox",
    "registrationNumber": "08818",
    "activeIngredient": "Atrazina (900 g/kg)",
    "chemicalGroup": "Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação WG de alta concentração para controle de folhas largas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-8818-16-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Picão-preto, Corda-de-viola e Trapoeraba",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-8818-16-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Picão-preto, Corda-de-viola e Trapoeraba",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8818-16-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8818-16-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8818-16-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-10425-17",
    "productName": "Atrazina Nortox SC",
    "registrationNumber": "10425",
    "activeIngredient": "Atrazina (500 g/L)",
    "chemicalGroup": "Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de fotossíntese de amplo espectro em formulação líquida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10425-17-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais no milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-10425-17-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais no milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10425-17-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 3.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10425-17-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.98,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10425-17-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 4.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-596-18",
    "productName": "Atrazina Nortox 500 SC",
    "registrationNumber": "596",
    "activeIngredient": "Atrazina (500 g/L)",
    "chemicalGroup": "Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação seletiva sistêmica absorvida pelas raízes e folhas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-596-18-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Picão-preto, Caruru, Trapoeraba e Guanxuma",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-596-18-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Picão-preto, Caruru, Trapoeraba e Guanxuma",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-596-18-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 3.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-596-18-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.98,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-596-18-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 4.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-23720-19",
    "productName": "Azoxistrobin Nortox",
    "registrationNumber": "23720",
    "activeIngredient": "Azoxistrobina (250 g/L)",
    "chemicalGroup": "Estrobilurina (Grupo 11)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da respiração mitocondrial com ação preventiva sistêmica.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23720-19-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo, Cercospora e Helmintosporiose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23720-19-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23720-19-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23720-19-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-23720-19-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-44124-20",
    "productName": "Bifentrina A BRX",
    "registrationNumber": "44124",
    "activeIngredient": "Acetamiprido (100 g/L) + Bifentrina (67 g/L)",
    "chemicalGroup": "Neonicotinoide (4A) + Piretróide (3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe I - Produto Altamente Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Choque fulminante combinado com residual sistêmico.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-44124-20-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Percevejo-marrom, Mosca-branca e Cigarrinha",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44124-20-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44124-20-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44124-20-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-44124-20-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-16322-21",
    "productName": "Bifentrina A Nortox",
    "registrationNumber": "16322",
    "activeIngredient": "Bifentrina (67 g/L) + Acetamiprido (100 g/L)",
    "chemicalGroup": "Piretróide (3A) + Neonicotinoide (4A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe I - Produto Altamente Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Efeito desalojante, choque de contato e controle sistêmico.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-16322-21-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Mosca-branca e Percevejos",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16322-21-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16322-21-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16322-21-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-16322-21-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-10325-22",
    "productName": "Bifentrina Nortox",
    "registrationNumber": "10325",
    "activeIngredient": "Bifentrina (100 g/L)",
    "chemicalGroup": "Piretróide (Grupo 3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Modulador de canais de sódio com contato e ingestão.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10325-22-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Lagarta-da-soja e Percevejos",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10325-22-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Lagarta-da-soja e Percevejos",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10325-22-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10325-22-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-10325-22-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-19020-23",
    "productName": "Bifentrina 100 EC Nortox",
    "registrationNumber": "19020",
    "activeIngredient": "Bifentrina (100 g/L)",
    "chemicalGroup": "Piretróide (Grupo 3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação de alta persistência na cutícula foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-19020-23-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaros tetraniquídeos, Bicudo e Lagartas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19020-23-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaros tetraniquídeos, Bicudo e Lagartas",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19020-23-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19020-23-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-19020-23-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 10,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-35224-24",
    "productName": "Bio Folha Nortox",
    "registrationNumber": "35224",
    "activeIngredient": "Quitosana (10 g/L) + Folcisteína (50 g/L)",
    "chemicalGroup": "Polissacarídeo + Derivado bioativador",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Regulador de Crescimento",
    "toxicologicalClass": "Não Classificado",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Bioestimulante fisiológico que ativa defesas e divisão celular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-35224-24-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Estimulação de crescimento vegetativo e tolerância a estresses",
        "applicationPhase": "Em conjunto com fungicidas ou inseticidas em V4 a R5.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35224-24-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Estimulação de crescimento vegetativo e tolerância a estresses",
        "applicationPhase": "No estádio V4 a V8 junto com manejo foliar.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35224-24-ind-3",
        "cropName": "Citros",
        "recommendedDosage": 0.44999999999999996,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cochonilhas, ácaros e dispersão de calda",
        "applicationPhase": "Pulverização com cobertura completa da copa.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-25824-25",
    "productName": "Bio Raiz Nortox",
    "registrationNumber": "25824",
    "activeIngredient": "Folcisteína (16,7 g/L)",
    "chemicalGroup": "Derivado bioativador de enraizamento",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Regulador de Crescimento",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fisioativador de brotação e expansão radicular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-25824-25-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Desenvolvimento radicular vigoroso e emissão de radicelas",
        "applicationPhase": "Em conjunto com fungicidas ou inseticidas em V4 a R5.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25824-25-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Desenvolvimento radicular vigoroso e emissão de radicelas",
        "applicationPhase": "No estádio V4 a V8 junto com manejo foliar.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25824-25-ind-3",
        "cropName": "Citros",
        "recommendedDosage": 0.75,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cochonilhas, ácaros e dispersão de calda",
        "applicationPhase": "Pulverização com cobertura completa da copa.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-25421-26",
    "productName": "Bispiribac Nortox",
    "registrationNumber": "25421",
    "activeIngredient": "Bispiribaque-sódico (400 g/L)",
    "chemicalGroup": "Ácido pirimidiniloxibenzóico (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS sistêmico seletivo ao arroz irrigado.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-25421-26-ind-1",
        "cropName": "Arroz",
        "recommendedDosage": 0.12,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-arroz, Angiquinho e Ciperáceas no arroz",
        "applicationPhase": "Pós-emergência das plantas daninhas em arroz irrigado e sequeiro.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25421-26-ind-2",
        "cropName": "Soja",
        "recommendedDosage": 0.12,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e ciperáceas",
        "applicationPhase": "Pré-plantio ou pós-emergência inicial.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-4124-27",
    "productName": "Boscalid Nortox",
    "registrationNumber": "04124",
    "activeIngredient": "Boscalida (500 g/kg)",
    "chemicalGroup": "Anilida / Carboxamida (Grupo 7)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de succinato desidrogenase com potente ação protetora.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-4124-27-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-branco, Alternaria e Botrytis",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4124-27-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4124-27-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4124-27-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.16,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-4124-27-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.24,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-35922-28",
    "productName": "Boscalid Nortox 500 WG",
    "registrationNumber": "35922",
    "activeIngredient": "Boscalida (500 g/kg)",
    "chemicalGroup": "Anilida (Grupo 7)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida sistêmico protetor e curativo com fixação cuticular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-35922-28-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-branco, Mancha-de-alternaria e Podridão-cinzenta",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35922-28-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35922-28-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35922-28-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.16,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-35922-28-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.24,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-24824-29",
    "productName": "Carfentrazone Nortox",
    "registrationNumber": "24824",
    "activeIngredient": "Carfentrazona-etílica (400 g/L)",
    "chemicalGroup": "Triazolona (Grupo 14)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de PROTOX de contato com dessecação ultrarrápida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-24824-29-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Corda-de-viola, Trapoeraba, Guanxuma e dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24824-29-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Corda-de-viola, Trapoeraba, Guanxuma e dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24824-29-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.07,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24824-29-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.07,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24824-29-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-26725-30",
    "productName": "Cipermetrina Nortox",
    "registrationNumber": "26725",
    "activeIngredient": "Cipermetrina (250 g/L)",
    "chemicalGroup": "Piretróide (Grupo 3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Modulador de canais de sódio com alto poder de choque.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-26725-30-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicudo",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26725-30-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicudo",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26725-30-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26725-30-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-26725-30-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-3101-31",
    "productName": "Cipermetrina Nortox 250 EC",
    "registrationNumber": "3101",
    "activeIngredient": "Cipermetrina (250 g/L)",
    "chemicalGroup": "Piretróide (Grupo 3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação de contato e ingestão com efeito desalojante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3101-31-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras, Percevejos e Curuquerê",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3101-31-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras, Percevejos e Curuquerê",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3101-31-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3101-31-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-3101-31-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-7324-32",
    "productName": "Ciproconazole Nortox",
    "registrationNumber": "07324",
    "activeIngredient": "Ciproconazol (100 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese do ergosterol com ação curativa.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7324-32-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro, Ferrugem-asiática e Oídio",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7324-32-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7324-32-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7324-32-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-7324-32-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-6126-33",
    "productName": "Cletodim H Nortox",
    "registrationNumber": "06126",
    "activeIngredient": "Cletodim (240 g/L) + Haloxifope (123,6 g/L)",
    "chemicalGroup": "Ciclohexanodiona + Fop (Grupo 1)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação graminicida potente inibidora da ACCase.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6126-33-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Capim-pé-de-galinha e Milho tiguera",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6126-33-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Capim-pé-de-galinha e Milho tiguera",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6126-33-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6126-33-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.51,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6126-33-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-12217-34",
    "productName": "Cletodim Nortox",
    "registrationNumber": "12217",
    "activeIngredient": "Cletodim (240 g/L)",
    "chemicalGroup": "Ciclohexanodiona (Grupo 1)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Graminicida sistêmico inibidor da síntese de lipídios.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12217-34-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Capim-colchão e Milho RR voluntário",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12217-34-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Capim-colchão e Milho RR voluntário",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12217-34-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.41,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12217-34-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12217-34-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-9525-35",
    "productName": "Cletodim Oleum Nortox",
    "registrationNumber": "09525",
    "activeIngredient": "Cletodim (240 g/L)",
    "chemicalGroup": "Ciclohexanodiona (Grupo 1)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação OLEUM com adjuvante para máxima absorção.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9525-35-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais e perenes com óleo metilado embutido",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9525-35-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais e perenes com óleo metilado embutido",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9525-35-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.41,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9525-35-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9525-35-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-22921-36",
    "productName": "Clomazone Nortox",
    "registrationNumber": "22921",
    "activeIngredient": "Clomazona (500 g/L)",
    "chemicalGroup": "Isoxazolidinona (Grupo 13)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese de carotenóides gerando branqueamento.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-22921-36-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-colchão, Capim-marmelada e Corda-de-viola",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-22921-36-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-colchão, Capim-marmelada e Corda-de-viola",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-22921-36-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-22921-36-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-22921-36-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-9325-37",
    "productName": "Clomazone Nortox 360 CS",
    "registrationNumber": "09325",
    "activeIngredient": "Clomazona (360 g/L)",
    "chemicalGroup": "Isoxazolidinona (Grupo 13)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "CS - Suspensão de Encapsulados",
    "reentryIntervalHours": 24,
    "modeOfAction": "Cápsulas microscópicas que reduzem volatilidade.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9325-37-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas e folhas largas com liberação microencapsulada lenta",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-9325-37-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas e folhas largas com liberação microencapsulada lenta",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9325-37-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9325-37-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9325-37-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-28721-38",
    "productName": "Clomazone 500 EC Nortox",
    "registrationNumber": "28721",
    "activeIngredient": "Clomazona (500 g/L)",
    "chemicalGroup": "Isoxazolidinona (Grupo 13)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida seletivo pré-emergente de alta retenção no solo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28721-38-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-arroz e Ervas anuais",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-28721-38-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-arroz e Ervas anuais",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28721-38-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28721-38-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28721-38-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-2026-39",
    "productName": "Clorantraniliprole Nortox",
    "registrationNumber": "02026",
    "activeIngredient": "Clorantraniliprole (400 g/L)",
    "chemicalGroup": "Diamida / Antranilamida (Grupo 28)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Modulador de receptores de rianodina provocando paralisia.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2026-39-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Helicoverpa e Spodoptera",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2026-39-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Helicoverpa e Spodoptera",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2026-39-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.06,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2026-39-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-2026-39-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-39925-40",
    "productName": "Clorantraniliprole Nortox 400 SC",
    "registrationNumber": "39925",
    "activeIngredient": "Clorantraniliprole (400 g/L)",
    "chemicalGroup": "Diamida (Grupo 28)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Diamida de alta concentração com longo residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-39925-40-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Broca-da-cana e Bicho-furão",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-39925-40-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Broca-da-cana e Bicho-furão",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-39925-40-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.06,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-39925-40-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-39925-40-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-16220-41",
    "productName": "Clorfenapir Nortox",
    "registrationNumber": "16220",
    "activeIngredient": "Clorfenapir (240 g/L)",
    "chemicalGroup": "Pirazol (Grupo 13)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Desacoplador mitocondrial de alta eficiência.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-16220-41-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Traça-do-tomateiro e Lagartas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-16220-41-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-rajado, Traça-do-tomateiro e Lagartas",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16220-41-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.66,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16220-41-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-16220-41-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-26621-42",
    "productName": "Clorimurom Max Nortox",
    "registrationNumber": "26621",
    "activeIngredient": "Clorimurom-etílico (750 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS WG de alta concentração para dessecação.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-26621-42-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Picão-preto, Guanxuma e Trapoeraba",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26621-42-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Picão-preto, Guanxuma e Trapoeraba",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26621-42-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26621-42-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26621-42-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.04,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-4008-43",
    "productName": "Clorimurom Nortox",
    "registrationNumber": "4008",
    "activeIngredient": "Clorimurom-etílico (250 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WP - Pó Molhável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS com absorção radicular e foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-4008-43-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas anuais e perenes na dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4008-43-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas anuais e perenes na dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4008-43-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4008-43-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4008-43-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-31123-44",
    "productName": "Clorimurom S Nortox",
    "registrationNumber": "31123",
    "activeIngredient": "Clorimurom (200 g/kg) + Sulfometurom (150 g/kg)",
    "chemicalGroup": "Sulfoniluréias combinadas (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Duplo inibidor de ALS com excelente residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-31123-44-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas e gramíneas em cana-de-açúcar",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-902-45",
    "productName": "Clorimuron Master Nortox",
    "registrationNumber": "00902",
    "activeIngredient": "Clorimurom-etílico (250 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WP - Pó Molhável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida sistêmico seletivo para dessecação pré-plantio.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-902-45-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Picão-preto e Corda-de-viola",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-902-45-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Picão-preto e Corda-de-viola",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-902-45-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-902-45-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-902-45-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-621-46",
    "productName": "Clorotalonil Nortox",
    "registrationNumber": "00621",
    "activeIngredient": "Clorotalonil (500 g/L)",
    "chemicalGroup": "Isoftalonitrila / Multissítio (Grupo M05)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida protetor multissítio antirrugem.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-621-46-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo e Antracnose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-621-46-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-621-46-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-621-46-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-621-46-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-21824-47",
    "productName": "Clorotalonil Nortox 720 SC",
    "registrationNumber": "21824",
    "activeIngredient": "Clorotalonil (720 g/L)",
    "chemicalGroup": "Isoftalonitrila / Multissítio (Grupo M05)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração com aderência e resistência à chuva.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-21824-47-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-parda e Requeima",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21824-47-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21824-47-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21824-47-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-21824-47-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-12419-48",
    "productName": "Clorpirifós Nortox EC",
    "registrationNumber": "12419",
    "activeIngredient": "Clorpirifós (480 g/L)",
    "chemicalGroup": "Organofosforado (Grupo 1B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Choque fulminante por contato, ingestão e vapor.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12419-48-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-elasmo e Bicudo",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12419-48-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-elasmo e Bicudo",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12419-48-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12419-48-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-12419-48-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-13120-49",
    "productName": "Diafentiuron Nortox",
    "registrationNumber": "13120",
    "activeIngredient": "Diafentiurom (500 g/L)",
    "chemicalGroup": "Feniltiouréia (Grupo 12A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da ATP sintase ativado pela luz solar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-13120-49-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-branco, Mosca-branca e Pulgões",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-13120-49-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-13120-49-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.88,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-13120-49-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-13120-49-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-46325-50",
    "productName": "Dicamba Nortox",
    "registrationNumber": "46325",
    "activeIngredient": "Dicamba (480 g/L)",
    "chemicalGroup": "Ácido Benzóico / Auxina (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina para dessecação de folhas largas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-46325-50-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Caruru-palmeri e Corda-de-viola",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-46325-50-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Caruru-palmeri e Corda-de-viola",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-46325-50-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-46325-50-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.51,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-46325-50-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-56125-51",
    "productName": "Diclosulam Nortox",
    "registrationNumber": "56125",
    "activeIngredient": "Diclosulam (840 g/kg)",
    "chemicalGroup": "Triazolopirimidina (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS com longo residual na soja.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-56125-51-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.035,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Trapoeraba, Corda-de-viola e Apaga-fogo",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56125-51-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.035,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva, Trapoeraba, Corda-de-viola e Apaga-fogo",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56125-51-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56125-51-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.03,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56125-51-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.04,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-34124-52",
    "productName": "Difenoconazol Nortox 250 SC",
    "registrationNumber": "34124",
    "activeIngredient": "Difenoconazol (250 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazol sistêmico de rápida absorção em manchas foliares.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-34124-52-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Mancha-alvo, Cercospora, Antracnose e Oídio",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34124-52-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34124-52-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34124-52-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-34124-52-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.42,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-7597-53",
    "productName": "Dimetoato 500 EC Nortox",
    "registrationNumber": "7597",
    "activeIngredient": "Dimetoato (500 g/L)",
    "chemicalGroup": "Organofosforado (Grupo 1B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inseticida e acaricida com potente ação de choque.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7597-53-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Tripes, Pulgões, Ácaro-rajado e Mosca-das-frutas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7597-53-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7597-53-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.88,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7597-53-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-7597-53-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-17025-54",
    "productName": "Dimetomorfe Nortox",
    "registrationNumber": "17025",
    "activeIngredient": "Dimetomorfe (500 g/L)",
    "chemicalGroup": "Morfolina / CAA (Grupo 40)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de parede celular com ação antiesporulante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17025-54-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Requeima, Míldio e Podridão-de-raízes",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17025-54-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17025-54-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17025-54-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17025-54-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-26122-55",
    "productName": "Diquat Nortox",
    "registrationNumber": "26122",
    "activeIngredient": "Diquate (373,5 g/L)",
    "chemicalGroup": "Bipiridílio (Grupo 22)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Desviador de elétrons do fotossistema I com queima imediata.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-26122-55-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação pré-colheita e dessecação de plantas daninhas",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26122-55-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação pré-colheita e dessecação de plantas daninhas",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26122-55-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26122-55-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26122-55-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-40225-56",
    "productName": "Diquat Nortox SL",
    "registrationNumber": "40225",
    "activeIngredient": "Diquate (373,5 g/L)",
    "chemicalGroup": "Bipiridílio (Grupo 22)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação rápida de contato fotodependente.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-40225-56-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Uniformização de grãos e dessecação pré-colheita",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40225-56-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Uniformização de grãos e dessecação pré-colheita",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40225-56-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40225-56-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40225-56-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-988692-57",
    "productName": "Diuron Nortox",
    "registrationNumber": "988692",
    "activeIngredient": "Diurom (800 g/kg)",
    "chemicalGroup": "Uréia (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor do fotossistema II com longo residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-988692-57-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-colchão, Picão-preto, Caruru e Guanxuma",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-988692-57-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-colchão, Picão-preto, Caruru e Guanxuma",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-988692-57-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-988692-57-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-988692-57-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-8895-58",
    "productName": "Diuron Nortox 500 SC",
    "registrationNumber": "8895",
    "activeIngredient": "Diurom (500 g/L)",
    "chemicalGroup": "Uréia (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação líquida SC facilitando diluição e aplicação.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-8895-58-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas anuais de folhas largas e gramíneas",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-8895-58-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas anuais de folhas largas e gramíneas",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8895-58-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8895-58-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8895-58-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-25024-59",
    "productName": "Epoxiconazole Nortox",
    "registrationNumber": "25024",
    "activeIngredient": "Epoxiconazol (125 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazol sistêmico de excelente translocação preventiva e curativa.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-25024-59-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática da soja e Ferrugem-da-folha do trigo",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25024-59-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25024-59-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25024-59-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-25024-59-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-28125-60",
    "productName": "Espirodiclofen Nortox",
    "registrationNumber": "28125",
    "activeIngredient": "Espirodiclofeno (240 g/L)",
    "chemicalGroup": "Ácido tetrônico (Grupo 23)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Acaricida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de síntese de lipídios em ovos e ninfas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28125-60-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Ácaro-da-falsa-ferrugem e Ácaro-rajado",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-28125-60-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28125-60-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28125-60-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-28125-60-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-217-61",
    "productName": "Fipronil Nortox",
    "registrationNumber": "00217",
    "activeIngredient": "Fipronil (250 g/L)",
    "chemicalGroup": "Fenilpirazol (Grupo 2B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Bloqueador de canais GABA com alto poder residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-217-61-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cupins, Tamanduá-da-soja e Bicudo-da-cana",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-217-61-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-217-61-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.22,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-217-61-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-217-61-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-11021-62",
    "productName": "Fipronil Nortox Max",
    "registrationNumber": "11021",
    "activeIngredient": "Fipronil (500 g/L)",
    "chemicalGroup": "Fenilpirazol (Grupo 2B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração líquida para sulco e soqueira.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11021-62-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Sphenophorus levis, Cupins e Pragas de solo",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11021-62-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11021-62-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.11,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11021-62-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-11021-62-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-10412-63",
    "productName": "Fipronil Nortox 800 WG",
    "registrationNumber": "10412",
    "activeIngredient": "Fipronil (800 g/kg)",
    "chemicalGroup": "Fenilpirazol (Grupo 2B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação por contato e ingestão no perfil de solo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10412-63-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Cupinicida e inseticida de solo concentrado WG",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10412-63-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10412-63-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.09,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10412-63-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-10412-63-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-12219-64",
    "productName": "Fluazinam Nortox 500 SC",
    "registrationNumber": "12219",
    "activeIngredient": "Fluazinam (500 g/L)",
    "chemicalGroup": "Fenilpiridinilamina (Grupo 29)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Desacoplador mitocondrial multissítio protetor.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12219-64-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-branco, Requeima e Sarna-da-maçã",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-12219-64-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12219-64-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12219-64-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-12219-64-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-10225-65",
    "productName": "Flumioxazin I Nortox",
    "registrationNumber": "10225",
    "activeIngredient": "Flumioxazina (100 g/L) + Imazetapir (200 g/L)",
    "chemicalGroup": "N-fenilftalimida + Imidazolinona",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação líquida com duplo mecanismo residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10225-65-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Capim-amargoso, Caruru e Picão-preto",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10225-65-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Capim-amargoso, Caruru e Picão-preto",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10225-65-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10225-65-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.42,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10225-65-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-35923-66",
    "productName": "Flumioxazin Nortox",
    "registrationNumber": "35923",
    "activeIngredient": "Flumioxazina (500 g/L)",
    "chemicalGroup": "N-fenilftalimida (Grupo 14)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de PROTOX com rápida dessecação foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-35923-66-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.12,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Trapoeraba, Picão-preto e dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35923-66-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.12,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Trapoeraba, Picão-preto e dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35923-66-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.11,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35923-66-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-35923-66-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.14,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-17026-67",
    "productName": "Flumioxazina C Nortox",
    "registrationNumber": "17026",
    "activeIngredient": "Clorimurom (103 g/kg) + Flumioxazina (300 g/kg)",
    "chemicalGroup": "Sulfoniluréia + N-fenilftalimida",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Sinergismo PROTOX + ALS para manejo antirresistência.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17026-67-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva resistente e banco de sementes de dicotiledôneas",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17026-67-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Buva resistente e banco de sementes de dicotiledôneas",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17026-67-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.09,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17026-67-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.09,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17026-67-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-34824-68",
    "productName": "Flumioxazina 500 WP Cropchem",
    "registrationNumber": "34824",
    "activeIngredient": "Flumioxazina (500 g/kg)",
    "chemicalGroup": "N-fenilftalimida (Grupo 14)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "WP - Pó Molhável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de PROTOX formulado em pó molhável.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-34824-68-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Trapoeraba e Corda-de-viola em pré-plantio",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34824-68-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Caruru, Trapoeraba e Corda-de-viola em pré-plantio",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34824-68-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.11,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34824-68-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-34824-68-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 45,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-23324-69",
    "productName": "Fluroxipir + Picloram Nortox",
    "registrationNumber": "23324",
    "activeIngredient": "Fluroxipir (115,3 g/L) + Picloram (143,4 g/L)",
    "chemicalGroup": "Piridiloxiacetato + Piridinocarboxílico",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Auxinas sintéticas para controle de plantas lenhosas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23324-69-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Arbustivas, Assa-peixe e Ervas duras em pastagem",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-23324-69-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-23424-70",
    "productName": "Fluroxipir + Triclopir Nortox",
    "registrationNumber": "23424",
    "activeIngredient": "Fluroxipir (115,3 g/L) + Triclopir (333,8 g/L)",
    "chemicalGroup": "Piridiloxiacetatos combinados (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação hormonal de rápida absorção foliar e basal.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23424-70-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas de porte arbustivo",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-23424-70-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-56325-71",
    "productName": "Fluroxipir A Nortox",
    "registrationNumber": "56325",
    "activeIngredient": "Aminopiralide (47,36 g/L) + Fluroxipir (115,3 g/L)",
    "chemicalGroup": "Ácidos piridinocarboxílicos (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação sistêmica de amplo espectro herbicida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-56325-71-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas de pastagens e reflorestamentos",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-56325-71-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas de pastagens e reflorestamentos",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56325-71-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56325-71-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.02,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56325-71-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-33123-72",
    "productName": "Fluroxipir Nortox",
    "registrationNumber": "33123",
    "activeIngredient": "Fluroxipir-meptílico (287,9 g/L)",
    "chemicalGroup": "Piridiloxiacetato (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida auxínico seletivo a gramíneas forrageiras.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-33123-72-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Guanxuma, Trapoeraba e Malva em pastagens e cana",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-33123-72-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Guanxuma, Trapoeraba e Malva em pastagens e cana",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-33123-72-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-33123-72-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.68,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-33123-72-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-323-73",
    "productName": "Fluroxipir Nortox 200 EC",
    "registrationNumber": "00323",
    "activeIngredient": "Fluroxipir-meptílico (287,9 g/L)",
    "chemicalGroup": "Piridiloxiacetato (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina com translocação sistêmica.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-323-73-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas em pastagens e dessecação dirigida",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-323-73-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas em pastagens e dessecação dirigida",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-323-73-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-323-73-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.68,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-323-73-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-18421-74",
    "productName": "Fluroxipir P Nortox",
    "registrationNumber": "18421",
    "activeIngredient": "Picloram (143,4 g/L) + Fluroxipir (115,3 g/L)",
    "chemicalGroup": "Piridinocarboxílico + Piridiloxiacetato",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Dupla ação reguladora do crescimento com controle de rebrota.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-18421-74-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-18421-74-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-43718-75",
    "productName": "Flutriafol Nortox",
    "registrationNumber": "43718",
    "activeIngredient": "Flutriafol (500 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazol de maior velocidade de penetração e translocação acrópeta.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-43718-75-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Oídio e Mancha-foliar",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43718-75-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.23,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43718-75-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-43718-75-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-43718-75-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-4323-76",
    "productName": "Forcane",
    "registrationNumber": "04323",
    "activeIngredient": "2,4-D (433,4 g/L) + Picloram (26,7 g/L)",
    "chemicalGroup": "Fenoxiacético + Piridinocarboxílico",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida hormonal para controle foliar e toco.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-4323-76-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas anuais e perenes em pastagens",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-4323-76-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-3078394-77",
    "productName": "Glifosato Nortox",
    "registrationNumber": "3078394",
    "activeIngredient": "Glifosato (480 g/L)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da enzima EPSPS de ação sistêmica total.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3078394-77-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas anuais e perenes em dessecação total",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3078394-77-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas anuais e perenes em dessecação total",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3078394-77-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3078394-77-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3078394-77-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-7316-78",
    "productName": "Glifosato Nortox SL",
    "registrationNumber": "7316",
    "activeIngredient": "Glifosato IPA (480 g/L)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Translocação floemática para raiz e rizomas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7316-78-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Controle total de gramíneas e folhas largas em pré-plantio",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7316-78-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Controle total de gramíneas e folhas largas em pré-plantio",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7316-78-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7316-78-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7316-78-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-12321-79",
    "productName": "Glifosato Nortox Ultra",
    "registrationNumber": "12321",
    "activeIngredient": "Glifosato IPA (720 g/L)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de EPSPS altamente concentrado.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12321-79-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação de alta concentração com alto rendimento operacional",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12321-79-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação de alta concentração com alto rendimento operacional",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12321-79-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12321-79-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12321-79-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-2502-80",
    "productName": "Glifosato Nortox WG",
    "registrationNumber": "2502",
    "activeIngredient": "Glifosato (792,5 g/kg)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação sólida em grânulos de dissolução instantânea.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2502-80-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Dessecação pré-plantio e manejo em pós-emergência RR",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2502-80-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Dessecação pré-plantio e manejo em pós-emergência RR",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2502-80-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.62,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2502-80-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.53,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2502-80-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.16,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-14007-81",
    "productName": "Glifosato Nortox 480 BR",
    "registrationNumber": "14007",
    "activeIngredient": "Glifosato IPA (480 g/kg)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida não seletivo sistêmico com surfactante especial.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-14007-81-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies de folhas estreitas e largas em área total",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-14007-81-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies de folhas estreitas e largas em área total",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-14007-81-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-14007-81-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-14007-81-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-5712-82",
    "productName": "Glifosato Nortox 480 SL",
    "registrationNumber": "5712",
    "activeIngredient": "Glifosato IPA (480 g/L)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibição de aminoácidos aromáticos essenciais.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-5712-82-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação agrícola e controle sob copa de perenes",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5712-82-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Dessecação agrícola e controle sob copa de perenes",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5712-82-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5712-82-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5712-82-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-6117-83",
    "productName": "Glifosato 720 WG Nortox",
    "registrationNumber": "6117",
    "activeIngredient": "Glifosato-sal de amônio (792,5 g/kg)",
    "chemicalGroup": "Glicina substituída (Grupo 9)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Sal de amônio de rápida absorção e translocação.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6117-83-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas resistentes e volumosas em dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6117-83-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas resistentes e volumosas em dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6117-83-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.62,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6117-83-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.53,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6117-83-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.16,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-9225-84",
    "productName": "Glove Nortox",
    "registrationNumber": "09225",
    "activeIngredient": "Difenoconazol (250 g/L) + Ciproconazol (150 g/L)",
    "chemicalGroup": "Triazóis combinados (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Duplo triazol sistêmico de ação curativa e erradicante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9225-84-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo e Cercosporiose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9225-84-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9225-84-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9225-84-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-9225-84-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-29120-85",
    "productName": "Glufosinato Nortox",
    "registrationNumber": "29120",
    "activeIngredient": "Glufosinato-sal de amônio (200 g/L)",
    "chemicalGroup": "Ácido fosfínico (Grupo 10)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da glutamina sintetase provocando acúmulo de amônia celular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-29120-85-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Buva, Caruru e dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29120-85-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso, Buva, Caruru e dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29120-85-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29120-85-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29120-85-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-26825-86",
    "productName": "Glufosinato Nortox 880 SG",
    "registrationNumber": "26825",
    "activeIngredient": "Glufosinato-sal de amônio (880 g/kg)",
    "chemicalGroup": "Ácido fosfínico (Grupo 10)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SG - Grânulos Solúveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração sólida SG para dessecação rápida e uniforme.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-26825-86-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Manejo de plantas tolerantes a glifosato em pré-plantio e pós LibertyLink",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26825-86-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Manejo de plantas tolerantes a glifosato em pré-plantio e pós LibertyLink",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26825-86-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.45,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26825-86-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.42,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26825-86-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.6,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-54625-87",
    "productName": "Haloxifop Nortox",
    "registrationNumber": "54625",
    "activeIngredient": "Haloxifope-P-metílico (249,4 g/L)",
    "chemicalGroup": "Ariloxifenoxipropionato (Grupo 1)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da ACCase de altíssima eficiência sistêmica acrópeta e basípeta.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-54625-87-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso perenizado, Capim-pé-de-galinha e Milho tiguera",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-54625-87-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-amargoso perenizado, Capim-pé-de-galinha e Milho tiguera",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-54625-87-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-54625-87-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.34,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-54625-87-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.48,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-8009-88",
    "productName": "Hexazinona - D Nortox",
    "registrationNumber": "08009",
    "activeIngredient": "Hexazinona (132 g/kg) + Diurom (468 g/kg)",
    "chemicalGroup": "Triazinona + Uréia (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação sinérgica com longo residual em cana-planta e soca.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-8009-88-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-colonião, Capim-braquiária e Folhas largas na cana",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-8009-88-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.6,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-15920-89",
    "productName": "Hexazinona DT Nortox; Tricana Nortox",
    "registrationNumber": "15920",
    "activeIngredient": "Diurom (430 g/kg) + Hexazinona (70 g/kg) + Tebutiurom (300 g/kg)",
    "chemicalGroup": "Triazina + Uréias substituídas (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Tripla ação inibidora da fotossíntese com espectro imbatível.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-15920-89-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Controle total de banco de sementes e soqueiras em canaviais",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-15920-89-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-1509-90",
    "productName": "Hexazinona Nortox",
    "registrationNumber": "1509",
    "activeIngredient": "Hexazinona (250 g/L)",
    "chemicalGroup": "Triazinona (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida sistêmico absorvido pelas raízes e folhas com alta solubilidade.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1509-90-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-colonião, Capim-braquiária e Ervas perenes",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-1509-90-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-35321-91",
    "productName": "Hexazinona-T Nortox",
    "registrationNumber": "35321",
    "activeIngredient": "Hexazinona (170 g/kg) + Tebutiurom (630 g/kg)",
    "chemicalGroup": "Triazinona + Uréia (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta potência residual para períodos secos e transição.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-35321-91-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Gramíneas pesadas e folhas largas de difícil controle em cana",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-35321-91-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.44,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-1409-92",
    "productName": "Hexicana",
    "registrationNumber": "1409",
    "activeIngredient": "Hexazinona (250 g/L)",
    "chemicalGroup": "Triazinona (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor do fotossistema II formulado em concentrado solúvel.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1409-92-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-braquiária, Capim-colonião e Corda-de-viola",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-1409-92-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-19223-93",
    "productName": "Imazaduo",
    "registrationNumber": "19223",
    "activeIngredient": "Imazapique (175 g/kg) + Imazapir (525 g/kg)",
    "chemicalGroup": "Imidazolinonas combinadas (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Dupla imidazolinona sistêmica com ação foliar e de solo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-19223-93-ind-1",
        "cropName": "Arroz",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Arroz-vermelho e gramíneas em sistema Clearfield",
        "applicationPhase": "Pós-emergência das plantas daninhas em arroz irrigado e sequeiro.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19223-93-ind-2",
        "cropName": "Soja",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e ciperáceas",
        "applicationPhase": "Pré-plantio ou pós-emergência inicial.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-7424-94",
    "productName": "Imazapique I Nortox",
    "registrationNumber": "07424",
    "activeIngredient": "Imazapir (525 g/kg) + Imazapique (175 g/kg)",
    "chemicalGroup": "Imidazolinonas combinadas (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS específico para lavouras de arroz tolerante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7424-94-ind-1",
        "cropName": "Arroz",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Arroz-vermelho, Angiquinho e Capim-arroz",
        "applicationPhase": "Pós-emergência das plantas daninhas em arroz irrigado e sequeiro.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7424-94-ind-2",
        "cropName": "Soja",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e ciperáceas",
        "applicationPhase": "Pré-plantio ou pós-emergência inicial.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-3802-95",
    "productName": "Imazaquim Ultra Nortox",
    "registrationNumber": "03802",
    "activeIngredient": "Imazaquim (150 g/L)",
    "chemicalGroup": "Imidazolinona (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida seletivo sistêmico com absorção radicular e foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3802-95-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Picão-preto, Guanxuma, Caruru e Trapoeraba na soja",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3802-95-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Picão-preto, Guanxuma, Caruru e Trapoeraba na soja",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3802-95-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3802-95-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.85,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3802-95-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-16620-96",
    "productName": "Imazetapir Nortox",
    "registrationNumber": "16620",
    "activeIngredient": "Imazetapir (212 g/L)",
    "chemicalGroup": "Imidazolinona (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS com amplo período de controle de reinfestações.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-16620-96-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais em soja, feijão e milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16620-96-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais em soja, feijão e milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16620-96-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16620-96-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.68,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-16620-96-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-1002-97",
    "productName": "Imazetapir Plus Nortox",
    "registrationNumber": "1002",
    "activeIngredient": "Imazetapir (106 g/L + 100 g/L)",
    "chemicalGroup": "Imidazolinona (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de síntese de aminoácidos de cadeia ramificada.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1002-97-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Controle pré e pós-emergente precoce em leguminosas",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1002-97-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Controle pré e pós-emergente precoce em leguminosas",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1002-97-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1002-97-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.85,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1002-97-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-11012-98",
    "productName": "Imidacloprid Nortox",
    "registrationNumber": "11012",
    "activeIngredient": "Imidacloprido (480 g/L)",
    "chemicalGroup": "Neonicotinoide (Grupo 4A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Agonista dos receptores nicotínicos com translocação sistêmica rápida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11012-98-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mosca-branca, Cigarrinha-do-milho, Pulgões e Tripes",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11012-98-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11012-98-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.33,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11012-98-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-11012-98-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-3123-99",
    "productName": "Imidacloprid Nortox 480 SC",
    "registrationNumber": "03123",
    "activeIngredient": "Imidacloprido (480 g/L)",
    "chemicalGroup": "Neonicotinoide (Grupo 4A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação sistêmica foliar e via solo com longo residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3123-99-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Percevejo-marrom, Cigarrinha-das-pastagens e Psilídeo",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3123-99-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3123-99-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.33,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3123-99-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-3123-99-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-15024-100",
    "productName": "Imidafol",
    "registrationNumber": "15024",
    "activeIngredient": "Flutriafol (175 g/L) + Imidacloprido (225 g/L)",
    "chemicalGroup": "Triazol + Neonicotinoide",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Solução combinada fungicida e inseticida sistêmica para drench e foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-15024-100-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro, Bicho-mineiro e Cigarrinhas",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-15024-100-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-15024-100-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-15024-100-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.64,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-15024-100-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-28924-101",
    "productName": "Imperium Nortox",
    "registrationNumber": "28924",
    "activeIngredient": "Trifloxistrobina (100 g/L) + Tebuconazol (200 g/L)",
    "chemicalGroup": "Estrobilurina + Triazol",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação sistêmica de amplo espectro com efeito curativo e preventivo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28924-101-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.75,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Oídio, Mancha-alvo e Cercosporiose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28924-101-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.68,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28924-101-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.75,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28924-101-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-28924-101-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-40325-102",
    "productName": "Indoxacarbe Nortox",
    "registrationNumber": "40325",
    "activeIngredient": "Indoxacarbe (300 g/kg)",
    "chemicalGroup": "Oxadiazina (Grupo 22A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Bloqueador de canais de sódio ativado no organismo da praga.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-40325-102-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Spodoptera e Helicoverpa",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40325-102-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Spodoptera e Helicoverpa",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40325-102-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40325-102-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-40325-102-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-12120-103",
    "productName": "Iprodione Nortox",
    "registrationNumber": "12120",
    "activeIngredient": "Iprodiona (500 g/L)",
    "chemicalGroup": "Dicarboximida (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da transdução de sinal osmótico em hortifrúti.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-12120-103-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-cinzento (Botrytis cinerea), Alternariose e Podridão",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-12120-103-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12120-103-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-12120-103-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-12120-103-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-9125-104",
    "productName": "Isoxaflutol Florestal Nortox",
    "registrationNumber": "09125",
    "activeIngredient": "Isoxaflutol (750 g/kg)",
    "chemicalGroup": "Isoxazol / HPPD (Grupo 27)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de HPPD de longo residual e efeito reativação pós-chuva.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9125-104-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Braquiárias, Capim-colonião e Corda-de-viola no eucalipto",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9125-104-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Braquiárias, Capim-colonião e Corda-de-viola no eucalipto",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9125-104-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9125-104-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.17,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9125-104-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.24,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-44724-105",
    "productName": "Isoxaflutol Nortox",
    "registrationNumber": "44724",
    "activeIngredient": "Isoxaflutol (750 g/kg)",
    "chemicalGroup": "Isoxazol / HPPD (Grupo 27)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Bloqueador da síntese de carotenóides com excelente seletividade.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-44724-105-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas na cana-de-açúcar e milho em pré-emergência",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44724-105-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas na cana-de-açúcar e milho em pré-emergência",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44724-105-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44724-105-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.13,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-44724-105-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-9425-106",
    "productName": "Lambda-Cialotrina Nortox",
    "registrationNumber": "09425",
    "activeIngredient": "Lambda-cialotrina (250 g/L)",
    "chemicalGroup": "Piretróide (Grupo 3A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "CS - Suspensão de Encapsulados",
    "reentryIntervalHours": 24,
    "modeOfAction": "Piretróide microencapsulado com alto poder de choque e residual estendido.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9425-106-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas, Percevejos, Bicudo e Cigarrinhas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9425-106-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas, Percevejos, Bicudo e Cigarrinhas",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9425-106-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.06,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9425-106-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.05,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-9425-106-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-23818-107",
    "productName": "Lufenuron Nortox 100 EC",
    "registrationNumber": "23818",
    "activeIngredient": "Lufenurom (100 g/L)",
    "chemicalGroup": "Benzoiluréia / RCI (Grupo 15)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese de quitina impedindo a troca de pele larval.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23818-107-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicho-mineiro",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23818-107-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicho-mineiro",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23818-107-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.33,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23818-107-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-23818-107-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-25124-108",
    "productName": "Lufenuron Nortox 50 EC",
    "registrationNumber": "25124",
    "activeIngredient": "Lufenurom (50 g/L)",
    "chemicalGroup": "Benzoiluréia (Grupo 15)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Regulador de crescimento de insetos altamente seletivo a inimigos naturais.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-25124-108-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras e pragas minadoras em grãos",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25124-108-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras e pragas minadoras em grãos",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25124-108-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.66,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-25124-108-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-25124-108-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-21219-109",
    "productName": "Mancozeb Nortox",
    "registrationNumber": "21219",
    "activeIngredient": "Mancozebe (750 g/kg)",
    "chemicalGroup": "Ditiocarbamato / Multissítio (Grupo M03)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida protetor multissítio clássico para manejo antirresistência.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-21219-109-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo, Requeima e Míldio",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21219-109-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21219-109-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-21219-109-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.6,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-21219-109-ind-5",
        "cropName": "Café",
        "recommendedDosage": 2.4,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-10125-110",
    "productName": "Mancozeb Nortox SC",
    "registrationNumber": "10125",
    "activeIngredient": "Mancozebe (600 g/L)",
    "chemicalGroup": "Ditiocarbamato (Grupo M03)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Multissítio protetor com micronutrientes Manganês e Zinco incorporados.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10125-110-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Manchas foliares e ferrugens em formulação líquida facilitada",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10125-110-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10125-110-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10125-110-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-10125-110-ind-5",
        "cropName": "Café",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-15824-111",
    "productName": "Mancozeb Nortox 750 WG",
    "registrationNumber": "15824",
    "activeIngredient": "Mancozebe (750 g/kg)",
    "chemicalGroup": "Ditiocarbamato (Grupo M03)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Grânulos dispersíveis de rápida dissolução sem pó e sem entupimento.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-15824-111-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-da-soja, Pinta-preta e Antracnose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-15824-111-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-15824-111-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-15824-111-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.6,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-15824-111-ind-5",
        "cropName": "Café",
        "recommendedDosage": 2.4,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-11619-112",
    "productName": "Mancozeb Nortox 800 WP",
    "registrationNumber": "11619",
    "activeIngredient": "Mancozebe (800 g/kg)",
    "chemicalGroup": "Ditiocarbamato (Grupo M03)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WP - Pó Molhável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação de contato multissítio com elevada adesividade foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11619-112-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Requeima, Míldio, Ferrugem e Sarna em hortifrúti",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11619-112-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11619-112-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11619-112-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.6,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11619-112-ind-5",
        "cropName": "Café",
        "recommendedDosage": 2.4,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-38925-113",
    "productName": "Maximus EVO Nortox",
    "registrationNumber": "38925",
    "activeIngredient": "Clorotalonil (250 g/L) + Oxicloreto de cobre (110 g/L) + Tebuconazol (60 g/L)",
    "chemicalGroup": "Multissítios + Triazol",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Tripla barreira de proteção protetora, curativa e antibacteriana.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-38925-113-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo, Cercospora e Bacterioses",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38925-113-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38925-113-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38925-113-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-38925-113-ind-5",
        "cropName": "Café",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-28919-114",
    "productName": "Mesotriona Cana Nortox",
    "registrationNumber": "28919",
    "activeIngredient": "Mesotriona (480 g/L)",
    "chemicalGroup": "Tricetona / HPPD (Grupo 27)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de HPPD com absorção foliar e radicular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28919-114-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Corda-de-viola, Caruru, Trapoeraba e Guanxuma na cana",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28919-114-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-17517-115",
    "productName": "Mesotriona Nortox",
    "registrationNumber": "17517",
    "activeIngredient": "Mesotriona (480 g/L)",
    "chemicalGroup": "Tricetona / HPPD (Grupo 27)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Seletividade ao milho com branqueamento de folhas daninhas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17517-115-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ervas de folhas largas em milho e cana em pós-emergência",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17517-115-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ervas de folhas largas em milho e cana em pós-emergência",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17517-115-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17517-115-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17517-115-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.42,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-29521-116",
    "productName": "Metomil Nortox",
    "registrationNumber": "29521",
    "activeIngredient": "Metomil (215 g/L)",
    "chemicalGroup": "Carbamato (Grupo 1A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação fulminante de choque imediato e ovicida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-29521-116-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Spodoptera e Helicoverpa",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29521-116-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Spodoptera e Helicoverpa",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29521-116-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-29521-116-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-29521-116-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-23920-117",
    "productName": "Metomil 215 SL Nortox",
    "registrationNumber": "23920",
    "activeIngredient": "Metomil (215 g/L)",
    "chemicalGroup": "Carbamato (Grupo 1A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da acetilcolinesterase de altíssima rapidez de parada alimentar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23920-117-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas e insetos sugadores em emergência populacional",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23920-117-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas e insetos sugadores em emergência populacional",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23920-117-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23920-117-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-23920-117-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-30822-118",
    "productName": "Metoxifenozide Nortox",
    "registrationNumber": "30822",
    "activeIngredient": "Metoxifenozida (240 g/L)",
    "chemicalGroup": "Diacilhidrazina / RCI (Grupo 18)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Agonista do ecdisônio provocando ecdise letal prematura.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-30822-118-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Lagarta-da-soja e Spodoptera",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30822-118-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-falsa-medideira, Lagarta-da-soja e Spodoptera",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30822-118-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30822-118-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-30822-118-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-30923-119",
    "productName": "Metribuzim Nortox",
    "registrationNumber": "30923",
    "activeIngredient": "Metribuzim (480 g/L)",
    "chemicalGroup": "Triazinona (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor do fotossistema II com absorção radicular na soja e cana.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-30923-119-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Caruru, Picão-preto e Capim-colchão",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30923-119-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Caruru, Picão-preto e Capim-colchão",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30923-119-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.72,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30923-119-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.68,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30923-119-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-4523-120",
    "productName": "Metsulfuron Nortox",
    "registrationNumber": "04523",
    "activeIngredient": "Metsulfurom-metílico (600 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS de microdosagem com excelente seletividade a cereais de inverno.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-4523-120-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.005,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas em trigo, aveia, cevada e dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4523-120-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.005,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas em trigo, aveia, cevada e dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4523-120-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4523-120-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4523-120-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.01,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-2903-121",
    "productName": "Nicosulfuron Nortox 40 SC",
    "registrationNumber": "2903",
    "activeIngredient": "Nicossulfurom (40 g/L)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de ALS sistêmico seletivo na cultura do milho.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2903-121-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-carrapicho e Folhas largas no milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2903-121-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-carrapicho e Folhas largas no milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2903-121-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2903-121-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.02,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2903-121-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-28519-122",
    "productName": "Nicosulfuron Nortox 750 WG",
    "registrationNumber": "28519",
    "activeIngredient": "Nicossulfurom (750 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração WG para pós-emergência de milho.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28519-122-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Gramíneas anuais e dicotiledôneas em pós-emergência no milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28519-122-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Gramíneas anuais e dicotiledôneas em pós-emergência no milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28519-122-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28519-122-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28519-122-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-11409-123",
    "productName": "Norton",
    "registrationNumber": "11409",
    "activeIngredient": "2,4-D (402 g/L) + Picloram (103,5 g/L)",
    "chemicalGroup": "Fenoxiacético + Piridinocarboxílico",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina com duplo controle foliar e toco.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11409-123-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas de pastagens e reflorestamentos de eucalipto",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11409-123-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-223-124",
    "productName": "Novaluron Nortox",
    "registrationNumber": "00223",
    "activeIngredient": "Novalurom (200 g/L)",
    "chemicalGroup": "Benzoiluréia / RCI (Grupo 15)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese de quitina com longo período residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-223-124-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicho-furão",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-223-124-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja e Bicho-furão",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-223-124-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.11,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-223-124-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-223-124-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.15,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-7697-125",
    "productName": "Óleo Vegetal Nortox",
    "registrationNumber": "07697",
    "activeIngredient": "Óleo vegetal (930 g/L)",
    "chemicalGroup": "Éster de óleo vegetal / Adjuvante e Inseticida",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação física de asfixia em pragas e espalhante-adesivo penetrante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7697-125-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cochonilhas, Ácaros e melhoria de calda de pulverização",
        "applicationPhase": "Em conjunto com fungicidas ou inseticidas em V4 a R5.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7697-125-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cochonilhas, Ácaros e melhoria de calda de pulverização",
        "applicationPhase": "No estádio V4 a V8 junto com manejo foliar.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7697-125-ind-3",
        "cropName": "Citros",
        "recommendedDosage": 0.75,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cochonilhas, ácaros e dispersão de calda",
        "applicationPhase": "Pulverização com cobertura completa da copa.",
        "gracePeriodDays": 0,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-10025-126",
    "productName": "Oxicloreto de Cobre C Nortox",
    "registrationNumber": "10025",
    "activeIngredient": "Oxicloreto de cobre (420 g/kg) + Clorotalonil (400 g/kg)",
    "chemicalGroup": "Cúprico + Isoftalonitrila (M01 + M05)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Duplo fungicida multissítio protetor e bactericida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10025-126-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem, Mancha-alvo, Antracnose e Bacterioses",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10025-126-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.35,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10025-126-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10025-126-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-10025-126-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-4024-127",
    "productName": "Oxicloreto de Cobre Nortox",
    "registrationNumber": "04024",
    "activeIngredient": "Oxicloreto de cobre (588 g/L)",
    "chemicalGroup": "Inorgânico cúprico (Grupo M01)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Bactericida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida e bactericida protetor de liberação contínua de íons Cu++.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-4024-127-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Cancro-cítrico, Mancha-bacteriana, Ferrugem e Podridões",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-4024-127-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4024-127-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-4024-127-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-4024-127-ind-5",
        "cropName": "Café",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-11618-128",
    "productName": "Picloram Cana Nortox",
    "registrationNumber": "11618",
    "activeIngredient": "Picloram (388 g/L)",
    "chemicalGroup": "Ácido piridinocarboxílico (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina com translocação até rizomas e gemas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11618-128-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Corda-de-viola, Mamona e Cipós em canaviais",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11618-128-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-20023-129",
    "productName": "Picloram Nortox",
    "registrationNumber": "20023",
    "activeIngredient": "Picloram (388 g/L)",
    "chemicalGroup": "Ácido piridinocarboxílico (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida sistêmico para controle de plantas lenhosas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-20023-129-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Arbustivas em pastagens, toco e foliar",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-20023-129-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-50225-130",
    "productName": "Picoxistrobin Nortox",
    "registrationNumber": "50225",
    "activeIngredient": "Picoxistrobina (250 g/L)",
    "chemicalGroup": "Estrobilurina (Grupo 11)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Estrobilurina de alta mobilidade e fase de vapor.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-50225-130-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática da soja, Mancha-alvo e DFCs",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-50225-130-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-50225-130-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-50225-130-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-50225-130-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-38725-131",
    "productName": "Pimetrozina Nortox",
    "registrationNumber": "38725",
    "activeIngredient": "Pimetrozina (500 g/kg)",
    "chemicalGroup": "Piridina azometina (Grupo 9B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe IV - Produto Pouco Prejudicial",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Bloqueador neural de alimentação específico para sugadores.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-38725-131-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Pulgão-do-algodoeiro, Mosca-branca e Cigarrinhas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38725-131-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38725-131-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.22,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38725-131-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-38725-131-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.3,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 7,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-30823-132",
    "productName": "Piraclostrobin Nortox",
    "registrationNumber": "30823",
    "activeIngredient": "Piraclostrobina (250 g/L)",
    "chemicalGroup": "Estrobilurina (Grupo 11)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da respiração com benefícios na síntese de clorofila.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-30823-132-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem, Antracnose, Cercospora e Efeito Fisiológico verde",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30823-132-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30823-132-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-30823-132-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-30823-132-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.42,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-19624-133",
    "productName": "Piriproxifem BRX",
    "registrationNumber": "19624",
    "activeIngredient": "Piriproxifem (200 g/L)",
    "chemicalGroup": "Éter piridiloxipropílico / RCI (Grupo 7C)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador do hormônio juvenil impedindo a eclosão e maturação.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-19624-133-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mosca-branca (ovos e ninfas), Cochonilhas e Lagartas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19624-133-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mosca-branca (ovos e ninfas), Cochonilhas e Lagartas",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19624-133-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-19624-133-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-19624-133-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-6419-134",
    "productName": "Piriproxifen Nortox",
    "registrationNumber": "06419",
    "activeIngredient": "Piriproxifem (200 g/L)",
    "chemicalGroup": "Éter piridiloxipropílico (Grupo 7C)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Regulador de crescimento de insetos supressor de postura e esterilizante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6419-134-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mosca-branca, Psilídeo-dos-citros e Cochonilhas",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6419-134-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-do-cartucho e Cigarrinha-do-milho",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6419-134-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.28,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-6419-134-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-6419-134-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.38,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-11509-135",
    "productName": "Pri-Mordial",
    "registrationNumber": "11509",
    "activeIngredient": "2,4-D (402 g/L) + Picloram (103,5 g/L)",
    "chemicalGroup": "Fenoxiacético + Piridinocarboxílico",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida auxínico clássico para limpeza de pastagens.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11509-135-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas lenhosas e invasoras de pasto",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11509-135-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-17525-136",
    "productName": "Profenofós Nortox",
    "registrationNumber": "17525",
    "activeIngredient": "Profenofós (500 g/L)",
    "chemicalGroup": "Organofosforado (Grupo 1B)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação de choque fulminante e profundidade translaminar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17525-136-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-das-maçãs, Bicudo, Lagarta-falsa-medideira e Ácaros",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17525-136-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagarta-das-maçãs, Bicudo, Lagarta-falsa-medideira e Ácaros",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17525-136-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.88,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17525-136-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-17525-136-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-17922-137",
    "productName": "Propiconazole Max Nortox",
    "registrationNumber": "17922",
    "activeIngredient": "Propiconazol (500 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazol concentrado de ação curativa e sistêmica em cereais.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17922-137-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-da-folha, Mancha-amarela, Helmintosporiose e Oídio",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17922-137-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17922-137-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17922-137-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17922-137-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-17807-138",
    "productName": "Propiconazole Nortox",
    "registrationNumber": "17807",
    "activeIngredient": "Propiconazol (250 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese do ergosterol fúngico.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17807-138-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Ferrugens, Manchas foliares e Antracnose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17807-138-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17807-138-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17807-138-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17807-138-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-11022-139",
    "productName": "Propiconazole Nortox 500 EC",
    "registrationNumber": "11022",
    "activeIngredient": "Propiconazol (500 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação líquida EC concentrada com rápida absorção.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11022-139-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Complexo de doenças foliares em trigo, milho, arroz e banana",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11022-139-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11022-139-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11022-139-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.24,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11022-139-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-125-140",
    "productName": "Protection Nortox",
    "registrationNumber": "00125",
    "activeIngredient": "Fluazinam (200 g/L) + Tiofanato-metílico (400 g/L)",
    "chemicalGroup": "Fenilpiridinilamina + Benzimidazol",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Dupla ação sistêmica e de contato com ação inibidora de mitose e respiração.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-125-140-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-branco (Sclerotinia sclerotiorum), Mancha-alvo e Antracnose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-125-140-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.08,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-125-140-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-125-140-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.96,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-125-140-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.44,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-9925-141",
    "productName": "Protioconazol Nortox",
    "registrationNumber": "09925",
    "activeIngredient": "Protioconazol (250 g/L)",
    "chemicalGroup": "Triazolintiona (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazolintiona de alta eficácia preventiva e curativa.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9925-141-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Mancha-alvo e Giberela em cereais",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9925-141-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9925-141-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9925-141-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.32,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-9925-141-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.48,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-17225-142",
    "productName": "Protioconazol Nortox 480 SC",
    "registrationNumber": "17225",
    "activeIngredient": "Protioconazol (480 g/L)",
    "chemicalGroup": "Triazolintiona (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração de protioconazol para máxima proteção da lavoura.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17225-142-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-da-soja, Mancha-alvo, Cercospora e Septoria",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17225-142-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.23,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17225-142-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.25,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-17225-142-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17225-142-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-27023-143",
    "productName": "Scudeiro Nortox",
    "registrationNumber": "27023",
    "activeIngredient": "Protioconazol (175 g/L) + Tebuconazol (300 g/L)",
    "chemicalGroup": "Triazolintiona + Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Combinação potente de triazóis de choque e residual.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-27023-143-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática da soja, Mancha-alvo, Oídio e Cercospora",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-27023-143-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.41,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-27023-143-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-27023-143-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-27023-143-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-28819-144",
    "productName": "Selezione Nortox",
    "registrationNumber": "28819",
    "activeIngredient": "Atrazina (16 g/kg) + Nicossulfurom (750 g/kg)",
    "chemicalGroup": "Triazina + Sulfoniluréia",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Sinergismo em grânulos dispersíveis para lavouras de milho.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28819-144-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão, Trapoeraba e Caruru no milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28819-144-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão, Trapoeraba e Caruru no milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28819-144-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28819-144-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28819-144-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-7594-145",
    "productName": "Sempra",
    "registrationNumber": "07594",
    "activeIngredient": "Halossulfurom-metílico (750 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Não Classificado",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Especialista no controle sistemático de tubérculos de tiririca.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7594-145-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Tiririca (Cyperus rotundus e Cyperus esculentus) em cana e gramados",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7594-145-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.1,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Tiririca (Cyperus rotundus e Cyperus esculentus) em cana e gramados",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7594-145-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.09,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7594-145-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.09,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7594-145-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-18723-146",
    "productName": "S-Metolacloro Nortox",
    "registrationNumber": "18723",
    "activeIngredient": "S-metolacloro (960 g/L)",
    "chemicalGroup": "Cloroacetamida (Grupo 15)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de VLCFA de altíssima atividade em gramíneas resistentes.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-18723-146-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-amargoso e Caruru em pré-emergência",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-18723-146-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Capim-amargoso e Caruru em pré-emergência",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-18723-146-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-18723-146-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-18723-146-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-6226-147",
    "productName": "Sulfentrazone Nortox",
    "registrationNumber": "06226",
    "activeIngredient": "Sulfentrazona (500 g/L)",
    "chemicalGroup": "Triazolinona / PROTOX (Grupo 14)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de PROTOX de excelente ação de solo e residual duradouro.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-6226-147-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Tiririca (Cyperus spp.), Corda-de-viola e Mamona na cana e soja",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-6226-147-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-17823-148",
    "productName": "Sulfometuron Nortox",
    "registrationNumber": "17823",
    "activeIngredient": "Sulfometurom-metílico (750 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Regulador de Crescimento",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibição do crescimento vegetativo canalizando energia para teor de ATR.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17823-148-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.02,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Maturador químico para acúmulo de sacarose em cana-de-açúcar",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 30,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 100
      }
    ]
  },
  {
    "id": "nortox-ofc-24821-149",
    "productName": "Tebuco A Nortox",
    "registrationNumber": "24821",
    "activeIngredient": "Azoxistrobina (125 g/L) + Tebuconazol (240 g/L)",
    "chemicalGroup": "Estrobilurina + Triazol",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Duplo modo de ação preventiva, curativa e antiesporulante.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-24821-149-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática, Oídio, Manchas foliares e Giberela",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24821-149-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24821-149-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-24821-149-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-24821-149-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-7718-150",
    "productName": "Tebuco BRX",
    "registrationNumber": "07718",
    "activeIngredient": "Tebuconazol (430 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Triazol sistêmico concentrado para pulverização foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7718-150-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Ferrugens, Manchas foliares, Oídio e Antracnose",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7718-150-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7718-150-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7718-150-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-7718-150-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-11108-151",
    "productName": "Tebuco Nortox",
    "registrationNumber": "11108",
    "activeIngredient": "Tebuconazol (200 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida sistêmico protetor e curativo com absorção cuticular rápida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-11108-151-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-da-soja, Mancha-parda e Cercospora",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11108-151-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11108-151-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-11108-151-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-11108-151-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-8418-152",
    "productName": "Tebuco 430 SC Nortox",
    "registrationNumber": "08418",
    "activeIngredient": "Tebuconazol (430 g/L)",
    "chemicalGroup": "Triazol (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da síntese do ergosterol formulado em suspensão concentrada.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-8418-152-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Ferrugens e manchas em grãos, hortaliças e fruteiras",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8418-152-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8418-152-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8418-152-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-8418-152-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-14620-153",
    "productName": "Tebutiuron Nortox",
    "registrationNumber": "14620",
    "activeIngredient": "Tebutiurom (500 g/L)",
    "chemicalGroup": "Uréia substituída (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida de solo de longo residual e excelente tolerância à seca.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-14620-153-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais e perenes e folhas largas em cana-planta e soca",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-14620-153-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-40525-154",
    "productName": "Tempus Nortox",
    "registrationNumber": "40525",
    "activeIngredient": "Clorantraniliprole (32 g/L) + Clorpirifós (480 g/L)",
    "chemicalGroup": "Diamida + Organofosforado",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe I - Extremamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Choque devastador aliado a efeito fisiológico residual prolongado.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-40525-154-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Spodoptera frugiperda, Helicoverpa, Percevejos e Pragas de solo",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40525-154-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Spodoptera frugiperda, Helicoverpa, Percevejos e Pragas de solo",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40525-154-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.88,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-40525-154-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-40525-154-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-26925-155",
    "productName": "Terbutilazina Nortox",
    "registrationNumber": "26925",
    "activeIngredient": "Terbutilazina (500 g/L)",
    "chemicalGroup": "Triazina (Grupo 5)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor de fotossistema II alternativo à atrazina para manejo de resistência.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-26925-155-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Caruru, Picão-preto, Trapoeraba e Gramíneas no milho e cana",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-26925-155-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 3,
        "dosageUnit": "L/ha",
        "targetOrganism": "Caruru, Picão-preto, Trapoeraba e Gramíneas no milho e cana",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26925-155-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 2.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26925-155-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 2.55,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-26925-155-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 3.6,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-38625-156",
    "productName": "Tiodicarbe Nortox",
    "registrationNumber": "38625",
    "activeIngredient": "Tiodicarbe (800 g/kg)",
    "chemicalGroup": "Carbamato / Ovicida (Grupo 1A)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe III - Moderadamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da acetilcolinesterase com potente ação ovicida e larvicida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-38625-156-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja, Helicoverpa e Ovos",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38625-156-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Lagarta-do-cartucho, Lagarta-da-soja, Helicoverpa e Ovos",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38625-156-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.17,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-38625-156-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-38625-156-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 0.22,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-5522-157",
    "productName": "Tiofanato Nortox",
    "registrationNumber": "05522",
    "activeIngredient": "Tiofanato-metílico (500 g/L)",
    "chemicalGroup": "Benzimidazol (Grupo 1)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da tubulina/mitose de alta ação sistêmica preventiva e curativa.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-5522-157-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática e Mofo-branco, Antracnose, Mancha-parda e Podridões",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5522-157-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.9,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5522-157-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-5522-157-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-5522-157-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-9725-158",
    "productName": "Tiotalonil Nortox",
    "registrationNumber": "09725",
    "activeIngredient": "Clorotalonil (600 g/kg) + Tiofanato-metílico (240 g/kg)",
    "chemicalGroup": "Isoftalonitrila + Benzimidazol",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Fungicida duplo com ação sistêmica curativa e multissítio protetora.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9725-158-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-asiática, Antracnose, Mancha-alvo e Cercospora",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9725-158-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.35,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9725-158-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.5,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9725-158-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-9725-158-ind-5",
        "cropName": "Café",
        "recommendedDosage": 1.8,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-1224-159",
    "productName": "Totalcorn",
    "registrationNumber": "01224",
    "activeIngredient": "Nicossulfurom (750 g/kg)",
    "chemicalGroup": "Sulfoniluréia (Grupo 2)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Graminicida pós-emergente de alta seletividade na cultura do milho.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-1224-159-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Ervas infestantes do milho",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1224-159-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.06,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Ervas infestantes do milho",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1224-159-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1224-159-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.05,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-1224-159-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 0.07,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-18120-160",
    "productName": "Triclopir F Nortox",
    "registrationNumber": "18120",
    "activeIngredient": "Triclopir (333,8 g/L) + Fluroxipir (115,3 g/L)",
    "chemicalGroup": "Piridiloxiacetatos combinados (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Auxinas sintéticas com ação de desfolha e morte do sistema radicular.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-18120-160-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Guanxuma, Assa-peixe, Malva e Plantas lenhosas",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-18120-160-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-5821-161",
    "productName": "Triclopir Nortox",
    "registrationNumber": "05821",
    "activeIngredient": "Triclopir-butotílico (667 g/L)",
    "chemicalGroup": "Piridiloxiacetato (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina para aplicação basal, foliar e toco.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-5821-161-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Arbustivas, Plantas lenhosas e Tocos em pastagens",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-5821-161-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-38825-162",
    "productName": "Triclopir Nortox EC",
    "registrationNumber": "38825",
    "activeIngredient": "Triclopir-butotílico (667 g/L)",
    "chemicalGroup": "Piridiloxiacetato (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Alta concentração emulsionável com penetração na casca e folhas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-38825-162-ind-1",
        "cropName": "Pastagens",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas de porte arbóreo e arbustivo",
        "applicationPhase": "Aplicação foliar em área total no início do desenvolvimento vegetativo das plantas infestantes ou toco.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-38825-162-ind-2",
        "cropName": "Eucalipto",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas lenhosas e semi-lenhosas",
        "applicationPhase": "Aplicação dirigida nas entrelinhas ou coroamento de mudas.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-7726-163",
    "productName": "Trifloxistrobina Nortox",
    "registrationNumber": "07726",
    "activeIngredient": "Trifloxistrobina (500 g/kg)",
    "chemicalGroup": "Estrobilurina (Grupo 11)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Estrobilurina com efeito mesostêmico de redistribuição superficial e vapor.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-7726-163-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-asiática da soja, Oídio e Manchas foliares",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7726-163-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.14,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7726-163-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.15,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-7726-163-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.12,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-7726-163-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.18,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-23626-164",
    "productName": "Trifluralina F Nortox",
    "registrationNumber": "23626",
    "activeIngredient": "Trifluralina (450 g/L) + Flumioxazina (17 g/L)",
    "chemicalGroup": "Dinitroanilina + N-fenilftalimida",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Duplo mecanismo pré-emergente inibindo divisão celular e PROTOX.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-23626-164-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Caruru, Buva e Picão-preto",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-23626-164-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-pé-de-galinha, Caruru, Buva e Picão-preto",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23626-164-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23626-164-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-23626-164-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-17718-165",
    "productName": "Trifluralina H Nortox",
    "registrationNumber": "17718",
    "activeIngredient": "Trifluralina (400 g/L) + Hexazinona (100 g/L)",
    "chemicalGroup": "Dinitroanilina + Triazinona",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe I - Produto Altamente Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Pré-emergente com ampla cobertura de espectro e controle duradouro.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-17718-165-ind-1",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais e folhas largas na cana-de-açúcar",
        "applicationPhase": "Pré-emergência ou pós-emergência precoce em cana-planta ou soca.",
        "gracePeriodDays": 90,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-17718-165-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Folhas largas e gramíneas anuais",
        "applicationPhase": "Pré-emergência da cultura ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      }
    ]
  },
  {
    "id": "nortox-ofc-2438591-166",
    "productName": "Trifluralina Nortox",
    "registrationNumber": "2438591",
    "activeIngredient": "Trifluralina (445 g/L)",
    "chemicalGroup": "Dinitroanilina (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Inibidor da divisão celular nos meristemas radiculares de plântulas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2438591-166-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Caruru em PPI ou pré",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-2438591-166-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Capim-marmelada, Capim-colchão e Caruru em PPI ou pré",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2438591-166-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2438591-166-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2438591-166-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-8698-167",
    "productName": "Trifluralina Nortox Gold",
    "registrationNumber": "8698",
    "activeIngredient": "Trifluralina (450 g/L)",
    "chemicalGroup": "Dinitroanilina (Grupo 3)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "EC - Concentrado Emulsionável",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida de solo clássico para manejo pré-emergente.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-8698-167-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais em soja, algodão, feijão e cana",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-8698-167-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 2,
        "dosageUnit": "L/ha",
        "targetOrganism": "Gramíneas anuais em soja, algodão, feijão e cana",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8698-167-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8698-167-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.7,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-8698-167-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.4,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-9825-168",
    "productName": "Trivial",
    "registrationNumber": "09825",
    "activeIngredient": "Protioconazol (175 g/L) + Trifloxistrobina (150 g/L)",
    "chemicalGroup": "Triazolintiona + Estrobilurina",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Fungicida",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Excelente sinergia sistêmica e mesostêmica de alta performance.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-9825-168-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-asiática da soja, Mancha-alvo e Cercospora",
        "applicationPhase": "Preventivo no fechamento de entrelinhas (V8 a R1) e reaplicações a cada 14-21 dias.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9825-168-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 0.41,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-cercospora, Helmintosporiose e Mancha-branca",
        "applicationPhase": "Aplicação preventiva em pré-pendoamento (V8 a VT).",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9825-168-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 0.45,
        "dosageUnit": "L/ha",
        "targetOrganism": "Mancha-de-ramulária (Ramulariopsis gossypii) e Mancha-alvo",
        "applicationPhase": "Início da emissão dos primeiros botões florais (B1) em diante.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-9825-168-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 0.36,
        "dosageUnit": "L/ha",
        "targetOrganism": "Antracnose (Colletotrichum lindemuthianum) e Mofo-branco",
        "applicationPhase": "Aos primeiros sintomas ou preventivamente no florescimento.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-9825-168-ind-5",
        "cropName": "Café",
        "recommendedDosage": 0.54,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ferrugem-do-cafeeiro (Hemileia vastatrix) e Cercosporiose",
        "applicationPhase": "Dezembro a março em pulverizações preventivas de alta cobertura.",
        "gracePeriodDays": 21,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 400
      }
    ]
  },
  {
    "id": "nortox-ofc-28325-169",
    "productName": "Typhoon Nortox",
    "registrationNumber": "28325",
    "activeIngredient": "Clorantraniliprole (21,5 g/L) + Metomil (215 g/L)",
    "chemicalGroup": "Diamida + Carbamato",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Inseticida",
    "toxicologicalClass": "Classe II - Altamente Tóxico",
    "environmentalClass": "Classe II - Produto Muito Perigoso",
    "formulation": "SC - Suspensão Concentrada",
    "reentryIntervalHours": 24,
    "modeOfAction": "Ação imediata de parada alimentar aliada ao residual prolongado da diamida.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-28325-169-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras, Spodoptera frugiperda e Helicoverpa",
        "applicationPhase": "Atingimento dos níveis de dano econômico para lagartas ou percevejos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28325-169-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Lagartas desfolhadoras, Spodoptera frugiperda e Helicoverpa",
        "applicationPhase": "Estádios V2 a V6 aos primeiros sinais de raspagem foliar.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28325-169-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Bicudo-do-algodoeiro, Pulgões, Mosca-branca e Lagartas",
        "applicationPhase": "Monitoramento semanal e aplicação ao atingir nível de controle.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-28325-169-ind-4",
        "cropName": "Tomate",
        "recommendedDosage": 1,
        "dosageUnit": "L/ha",
        "targetOrganism": "Traça-do-tomateiro, Mosca-branca e Tripes",
        "applicationPhase": "Início da infestação nas folhas e brotações.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 4,
        "recommendedSprayVolumeLha": 500
      },
      {
        "id": "nortox-ofc-28325-169-ind-5",
        "cropName": "Citros",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Ácaro-da-leprose, Bicho-furão e Psilídeo-dos-citros",
        "applicationPhase": "Constatação de formas móveis em folhas e frutos.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 3,
        "recommendedSprayVolumeLha": 1000
      }
    ]
  },
  {
    "id": "nortox-ofc-10926-170",
    "productName": "Velox Nortox",
    "registrationNumber": "10926",
    "activeIngredient": "Ciclanilida (60 g/L) + Etefom (480 g/L)",
    "chemicalGroup": "Reguladores de maturação e desfolha",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Regulador de Crescimento",
    "toxicologicalClass": "Classe V - Improvável de Causar Dano Agudo",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Estimula a síntese endógena de etileno promovendo a abscisão foliar.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-10926-170-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Desfolhador e maturador para abertura uniforme de maçãs de algodão",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 100
      },
      {
        "id": "nortox-ofc-10926-170-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Desfolhador e maturador para abertura uniforme de maçãs de algodão",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10926-170-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10926-170-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-10926-170-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-56425-171",
    "productName": "2,4-D A Nortox",
    "registrationNumber": "56425",
    "activeIngredient": "2,4-D (596,9 g/L) + Aminopiralide (76,9 g/L)",
    "chemicalGroup": "Fenoxiacético + Piridinocarboxílico",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Mimetizador de auxina com alta carga de ácido ativo.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-56425-171-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas resistentes de pastagens e dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      },
      {
        "id": "nortox-ofc-56425-171-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas resistentes de pastagens e dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56425-171-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.62,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56425-171-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.53,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-56425-171-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 2.16,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 60,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-3009-172",
    "productName": "2,4-D Nortox",
    "registrationNumber": "03009",
    "activeIngredient": "2,4-D (806 g/kg)",
    "chemicalGroup": "Ácido ariloxialcanóico / Fenoxiacético (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "SL - Concentrado Solúvel",
    "reentryIntervalHours": 24,
    "modeOfAction": "Herbicida hormonal para dessecação e pós-emergência em gramíneas.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-3009-172-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Corda-de-viola, Picão-preto e Trapoeraba em dessecação",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3009-172-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.5,
        "dosageUnit": "L/ha",
        "targetOrganism": "Buva, Corda-de-viola, Picão-preto e Trapoeraba em dessecação",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3009-172-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.35,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3009-172-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.27,
        "dosageUnit": "L/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-3009-172-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.8,
        "dosageUnit": "L/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  },
  {
    "id": "nortox-ofc-2920-173",
    "productName": "2,4-D Nortox 970 WG",
    "registrationNumber": "02920",
    "activeIngredient": "2,4-D (970 g/kg)",
    "chemicalGroup": "Fenoxiacético (Grupo 4)",
    "manufacturer": "Nortox S.A.",
    "agrochemicalClass": "Herbicida",
    "toxicologicalClass": "Classe IV - Pouco Tóxico",
    "environmentalClass": "Classe III - Produto Perigoso",
    "formulation": "WG - Grânulos Dispersíveis em Água",
    "reentryIntervalHours": 24,
    "modeOfAction": "Formulação em grânulos de altíssima concentração com baixo odor.",
    "packageSizes": [
      1,
      5,
      20,
      200
    ],
    "indications": [
      {
        "id": "nortox-ofc-2920-173-ind-1",
        "cropName": "Soja",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas em dessecação pré-plantio e lavouras de cana e cereais",
        "applicationPhase": "Dessecação em pré-plantio ou pós-emergência dirigida/seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2920-173-ind-2",
        "cropName": "Milho",
        "recommendedDosage": 1.2,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Folhas largas em dessecação pré-plantio e lavouras de cana e cereais",
        "applicationPhase": "Dessecação pré-plantio ou pós-emergência seletiva.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2920-173-ind-3",
        "cropName": "Algodão",
        "recommendedDosage": 1.08,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas daninhas dicotiledôneas e gramíneas anuais",
        "applicationPhase": "Pré-plantio ou dessecação pré-colheita.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2920-173-ind-4",
        "cropName": "Feijão",
        "recommendedDosage": 1.02,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Plantas infestantes de folhas largas e estreitas",
        "applicationPhase": "Manejo pré-emergente ou pós-emergência precoce.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 1,
        "recommendedSprayVolumeLha": 150
      },
      {
        "id": "nortox-ofc-2920-173-ind-5",
        "cropName": "Cana-de-açúcar",
        "recommendedDosage": 1.44,
        "dosageUnit": "kg/ha",
        "targetOrganism": "Espécies infestantes em cana-planta e soqueira",
        "applicationPhase": "Pré ou pós-emergência em área total ou quebra-lombo.",
        "gracePeriodDays": 14,
        "maxApplicationsPerSeason": 2,
        "recommendedSprayVolumeLha": 200
      }
    ]
  }
];
