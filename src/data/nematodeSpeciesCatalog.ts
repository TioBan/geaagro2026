import { NematodeSpecies } from '../types/nematology';
import { getSpeciesMediaData } from './nematodeMediaAtlas';

// Metadata definition of the 50 major agricultural nematodes species
const SPECIES_BASE_DATA = [
  // 1-8. Meloidogyne Genus (Galls)
  { id: 'meloidogyne_incognita', name: 'Meloidogyne incognita', common: 'Nematoide-das-galhas-comum', type: 'globose', mainHost: 'Soja, Algodão, Café, Feijão, Tomate' },
  { id: 'meloidogyne_javanica', name: 'Meloidogyne javanica', common: 'Nematoide-das-galhas-da-soja', type: 'globose', mainHost: 'Soja, Tomate, Cana-de-açúcar, Cenoura' },
  { id: 'meloidogyne_arenaria', name: 'Meloidogyne arenaria', common: 'Nematoide-das-galhas-do-amendoim', type: 'globose', mainHost: 'Amendoim, Soja, Tabaco, Videira' },
  { id: 'meloidogyne_hapla', name: 'Meloidogyne hapla', common: 'Nematoide-das-galhas-do-clima-frio', type: 'globose', mainHost: 'Batata, Cenoura, Morangueiro, Alface' },
  { id: 'meloidogyne_enterolobii', name: 'Meloidogyne enterolobii', common: 'Nematoide-das-galhas-da-goiabeira', type: 'globose', mainHost: 'Goiabeira, Pimentão, Tomate, Quiabo' },
  { id: 'meloidogyne_exigua', name: 'Meloidogyne exigua', common: 'Nematoide-das-galhas-do-cafeeiro', type: 'globose', mainHost: 'Cafeeiro, Pimenta-do-reino, Plantas daninhas' },
  { id: 'meloidogyne_paranaensis', name: 'Meloidogyne paranaensis', common: 'Nematoide-das-galhas-do-café-paraná', type: 'globose', mainHost: 'Cafeeiro, Tomateiro, Melancia' },
  { id: 'meloidogyne_mali', name: 'Meloidogyne mali', common: 'Nematoide-das-galhas-da-macieira', type: 'globose', mainHost: 'Macieira, Porta-enxertos de rosáceas' },

  // 9-14. Pratylenchus Genus (Lesions)
  { id: 'pratylenchus_brachyurus', name: 'Pratylenchus brachyurus', common: 'Nematoide-das-lesões-radiculares-comum', type: 'vermiform', mainHost: 'Soja, Milho, Algodão, Braquiária, Cana-de-açúcar' },
  { id: 'pratylenchus_coffeae', name: 'Pratylenchus coffeae', common: 'Nematoide-das-lesões-do-cafeeiro', type: 'vermiform', mainHost: 'Café, Citros, Bananeira, Inhame' },
  { id: 'pratylenchus_zeae', name: 'Pratylenchus zeae', common: 'Nematoide-das-lesões-do-milho', type: 'vermiform', mainHost: 'Milho, Cana-de-açúcar, Sorgo, Arroz' },
  { id: 'pratylenchus_penetrans', name: 'Pratylenchus penetrans', common: 'Nematoide-das-lesões-de-clima-temperado', type: 'vermiform', mainHost: 'Frutíferas de clima temperado, Alho, Batata' },
  { id: 'pratylenchus_jaehni', name: 'Pratylenchus jaehni', common: 'Nematoide-das-lesões-dos-citros', type: 'vermiform', mainHost: 'Citros, Café, Pastagens' },
  { id: 'pratylenchus_vulnus', name: 'Pratylenchus vulnus', common: 'Nematoide-das-lesões-das-frutíferas', type: 'vermiform', mainHost: 'Videira, Pessegueiro, Macieira, Roseiras' },

  // 15-19. Heterodera / Globodera (Cysts)
  { id: 'heterodera_glycines', name: 'Heterodera glycines', common: 'Nematoide-de-cisto-da-soja (NCS)', type: 'cyst', mainHost: 'Soja, Feijão, Lupinus, Ervilha' },
  { id: 'heterodera_avenae', name: 'Heterodera avenae', common: 'Nematoide-de-cisto-dos-cereais', type: 'cyst', mainHost: 'Trigo, Aveia, Cevada, Centeio' },
  { id: 'heterodera_schachtii', name: 'Heterodera schachtii', common: 'Nematoide-de-cisto-da-beterraba', type: 'cyst', mainHost: 'Beterraba sacarina, Repolho, Brócolis, Canola' },
  { id: 'globodera_rostochiensis', name: 'Globodera rostochiensis', common: 'Nematoide-de-cisto-dourado-da-batata', type: 'cyst', mainHost: 'Batata, Tomate, Berinjela' },
  { id: 'globodera_pallida', name: 'Globodera pallida', common: 'Nematoide-de-cisto-pálido-da-batata', type: 'cyst', mainHost: 'Batata, Tomate, Solanáceas silvestres' },

  // 20-22. Rotylenchulus & Tylenchulus
  { id: 'rotylenchulus_reniformis', name: 'Rotylenchulus reniformis', common: 'Nematoide-reniforme', type: 'reniform', mainHost: 'Algodão, Soja, Melão, Maracujá, Café' },
  { id: 'radopholus_similis', name: 'Radopholus similis', common: 'Nematoide-cavernícola-da-banana', type: 'vermiform', mainHost: 'Bananeira, Antúrio, Pimenta-do-reino' },
  { id: 'tylenchulus_semipenetrans', name: 'Tylenchulus semipenetrans', common: 'Nematoide-dos-citros', type: 'reniform', mainHost: 'Laranjeira, Limoeiro, Videira, Cafeeiro' },

  // 23-25. Aphelenchoides (Foliar Nematodes)
  { id: 'aphelenchoides_besseyi', name: 'Aphelenchoides besseyi', common: 'Nematoide-da-ponta-branca-do-arroz', type: 'vermiform', mainHost: 'Arroz, Algodão (causador do Apical Malformation), Morangueiro' },
  { id: 'aphelenchoides_ritzemabosi', name: 'Aphelenchoides ritzemabosi', common: 'Nematoide-das-folhas-do-crisântemo', type: 'vermiform', mainHost: 'Crisântemo, Plantas ornamentais, Tabaco' },
  { id: 'aphelenchoides_fragariae', name: 'Aphelenchoides fragariae', common: 'Nematoide-do-morangueiro', type: 'vermiform', mainHost: 'Morangueiro, Samambaias, Begônia' },

  // 26-27. Ditylenchus
  { id: 'ditylenchus_dipsaci', name: 'Ditylenchus dipsaci', common: 'Nematoide-dos-bulbos-e-hastes', type: 'vermiform', mainHost: 'Alho, Cebola, Alfafa, Aveia' },
  { id: 'ditylenchus_destructor', name: 'Ditylenchus destructor', common: 'Nematoide-da-podridão-da-batata', type: 'vermiform', mainHost: 'Batata, Tulipas, Gladíolos, Trevo' },

  // 28-29. Bursaphelenchus & Nacobbus
  { id: 'nacobbus_aberrans', name: 'Nacobbus aberrans', common: 'Nematoide-falso-das-galhas', type: 'globose', mainHost: 'Batata, Tomate, Beterraba, Feijão' },
  { id: 'bursaphelenchus_xylophilus', name: 'Bursaphelenchus xylophilus', common: 'Nematoide-do-murchamento-do-pinheiro', type: 'vermiform', mainHost: 'Pinus spp., Coníferas' },
  { id: 'bursaphelenchus_cocophilus', name: 'Bursaphelenchus cocophilus', common: 'Nematoide-do-anel-vermelho-do-coqueiro', type: 'vermiform', mainHost: 'Coqueiro, Palma-de-óleo, Palmeiras' },

  // 31-33. Helicotylenchus / Scutellonema (Spiral)
  { id: 'scutellonema_bradys', name: 'Scutellonema bradys', common: 'Nematoide-da-casca-preta-do-inhame', type: 'spiral', mainHost: 'Inhame, Mandioca' },
  { id: 'helicotylenchus_dihystera', name: 'Helicotylenchus dihystera', common: 'Nematoide-espiral-comum', type: 'spiral', mainHost: 'Soja, Milho, Algodão, Trigo, Gramados' },
  { id: 'helicotylenchus_multicinctus', name: 'Helicotylenchus multicinctus', common: 'Nematoide-espiral-da-bananeira', type: 'spiral', mainHost: 'Bananeira, Citros, Manga' },

  // 34-35. Criconemoides / Mesocriconema (Sheaths)
  { id: 'criconemoides_onoensis', name: 'Criconemoides onoensis', common: 'Nematoide-anelado-do-arroz', type: 'sheath', mainHost: 'Arroz irrigado, Gramíneas forrageiras' },
  { id: 'mesocriconema_xenoplax', name: 'Mesocriconema xenoplax', common: 'Nematoide-anelado-das-caroços', type: 'sheath', mainHost: 'Pessegueiro, Ameixeira, Videira' },

  // 36-37. Xiphinema (Daggers)
  { id: 'xiphinema_index', name: 'Xiphinema index', common: 'Nematoide-adaga-da-videira', type: 'dagger', mainHost: 'Videira, Figueira' },
  { id: 'xiphinema_americanum', name: 'Xiphinema americanum', common: 'Nematoide-adaga-vetor-de-vírus', type: 'dagger', mainHost: 'Maçã, Uva, Pêssego, Solanáceas' },

  // 38-39. Trichodorus & Paratrichodorus (Stubbys)
  { id: 'trichodorus_christiei', name: 'Trichodorus christiei', common: 'Nematoide-das-raízes-curtas', type: 'pin', mainHost: 'Milho, Tomate, Cebola, Gramados' },
  { id: 'paratrichodorus_minor', name: 'Paratrichodorus minor', common: 'Nematoide-das-raízes-grossas', type: 'pin', mainHost: 'Cereais, Batata, Algodão' },

  // 40-42. Needles (Belonolaimus, Dolichodorus, Longidorus)
  { id: 'belonolaimus_longicaudatus', name: 'Belonolaimus longicaudatus', common: 'Nematoide-agulha-gigante', type: 'dagger', mainHost: 'Milho, Gramíneas, Morango, Citros' },
  { id: 'dolichodorus_heterocephalus', name: 'Dolichodorus heterocephalus', common: 'Nematoide-de-agulha-longa-de-várzea', type: 'dagger', mainHost: 'Aipo, Tomate, Arroz de várzea' },
  { id: 'longidorus_elongatus', name: 'Longidorus elongatus', common: 'Nematoide-agulha-dos-cereais', type: 'dagger', mainHost: 'Trigo, Cevada, Hortelã, Morango' },

  // 43-44. Hoplolaimus (Lances)
  { id: 'hoplolaimus_galeatus', name: 'Hoplolaimus galeatus', common: 'Nematoide-lança-dos-campos', type: 'dagger', mainHost: 'Milho, Trigo, Algodão, Gramados' },
  { id: 'hoplolaimus_columbus', name: 'Hoplolaimus columbus', common: 'Nematoide-lança-columbia', type: 'dagger', mainHost: 'Soja, Algodão, Trigo' },

  // 45-50. Specialty/Specifics (Anguina, Hemicycliophora, Subanguina, Paratylenchus, Hirschmanniella, Tylenchorhynchus)
  { id: 'anguina_tritici', name: 'Anguina tritici', common: 'Nematoide-das-galhas-de-sementes', type: 'vermiform', mainHost: 'Trigo, Centeio' },
  { id: 'tylenchorhynchus_claytoni', name: 'Tylenchorhynchus claytoni', common: 'Nematoide-do-dúbio', type: 'vermiform', mainHost: 'Tabaco, Milho, Azaleias' },
  { id: 'hemicycliophora_arenaria', name: 'Hemicycliophora arenaria', common: 'Nematoide-bainha', type: 'sheath', mainHost: 'Citros, Tomate, Abóbora' },
  { id: 'subanguina_radicicola', name: 'Subanguina radicicola', common: 'Nematoide-das-galhas-das-gramas', type: 'globose', mainHost: 'Poáceas, Trigo, Cevada' },
  { id: 'paratylenchus_dianectus', name: 'Paratylenchus dianectus', common: 'Nematoide-alfinete', type: 'pin', mainHost: 'Hortaliças, Crisântemo, Aipo' },
  { id: 'hirschmanniella_oryzae', name: 'Hirschmanniella oryzae', common: 'Nematoide-das-raízes-do-arroz-irrigado', type: 'vermiform', mainHost: 'Arroz irrigado, Junco' }
];

export const NEMATODE_SPECIES_CATALOG_50: NematodeSpecies[] = SPECIES_BASE_DATA.map((base, idx) => {
  let etiology = '';
  let identification = '';
  let symptoms = '';
  let morphology = '';
  let biologicalCycle = '25 a 35 dias (ideal a 28°C)';
  let survival = 'Sobrevivência em restos radiculares no solo sob a forma de ovos e anidrobiose.';
  let chemicalControl = '';
  let physicalControl = '';
  let culturalControl = '';
  let managementStrategies = '';
  let economicDamage = 'Perdas que variam de 15% a 45% na produção da cultura comercial principal.';
  let riskThresholds = { moderate: 50, high: 200, veryHigh: 500 };

  // Generate highly specific agronomic data based on the Morphological Group (Anatomy)
  switch (base.type) {
    case 'globose':
      etiology = 'Parasitas biotróficos obrigatórios altamente especializados. O segundo estágio juvenil (J2) penetra nas pontas das raízes e secreta proteínas que induzem hipertrofia celular (formação de células gigantes alimentares). As fêmeas tornam-se sedentárias, incham e adquirem formato periforme ou globoso, expelindo centenas de ovos em uma massa de mucilagem protetora.';
      identification = 'Extração de fêmeas adultas do tecido radicular, análise microscópica da estriação cuticular da região perineal (padrão perineal), ou via testes genéticos rápidos de PCR de primers específicos e eletroforese clássica de isoenzimas (Esterase e Malato Desidrogenase).';
      symptoms = 'Formação característica de galhas radiculares em tamanhos e quantidades variadas, redução severa dos pelos absorventes, murchamento repentino das plantas nas horas mais quentes do dia e nanismo em reboleiras na lavoura.';
      morphology = 'Fêmeas adultas esféricas ou periformes de coloração branca perolada; machos e juvenis estritamente vermiformes.';
      chemicalControl = 'Tratamento profilático de sementes com nematicidas sistêmicos (Abamectina, Cadusafós) e pulverização no sulco de semeadura com inibidores modernos (Fluopiram ou Fluensulfona).';
      physicalControl = 'Solarização do solo com cobertura de lona plástica translúcida de polietileno em períodos secos quentes, ou rotação de inundação temporária da área.';
      culturalControl = 'Utilização de adubos verdes supressores (Crotalaria spectabilis, Crotalaria ochroleuca ou Tagetes patula) por pelo menos 90 dias, e adoção de sementes e porta-enxertos certificados livres de patógenos.';
      managementStrategies = 'Manejo integrado focado no uso de Crotalaria ochroleuca na safrinha, cultivares resistentes com boa tecnologia, e inoculação no sulco de Bacillus methylotrophicus.';
      riskThresholds = { moderate: 40, high: 150, veryHigh: 400 };
      break;

    case 'vermiform':
      etiology = 'Nematoides endoparasitas migradores. Conservam a forma vermiforme móvel em todos os estágios de vida (J2, J3, J4 e adultos), invadindo o córtex radicular de forma mecânica e enzimática. Movem-se livremente entre as células do hospedeiro, destruindo as paredes celulares enquanto se alimentam e deixando canais necróticos.';
      identification = 'Extração laboratorial de solo e raízes por centrifugação em solução de sacarose e posterior análise microscópica de lâmina para identificação do estilete curto e grosso e número de anéis na região labial.';
      symptoms = 'Surgimento de extensas lesões necróticas escuras nas raízes finas, perda rápida da capacidade de absorção de água e nutrientes, amarelecimento foliar geral e decréscimo visível da produtividade agrícola.';
      morphology = 'Corpo cilíndrico vermiforme, estilete bucal proeminente e robusto com botões basais largos para penetração mecânica.';
      chemicalControl = 'Tratamento de sementes com nematicidas sistêmicos (como Tiodicarbe) ou aplicação sulco-líquida de organofosforados e inibidores de succinato desidrogenase.';
      physicalControl = 'Revolvimento profundo do solo (subsolagem ou aração) no período seco para acelerar a dessecação térmica e dessecação mecânica dos nematóides livres.';
      culturalControl = 'Limpeza mecânica estrita de tratores e implementos, vazio sanitário de plantas voluntárias (tigueras de milho), e rotação com espécies não hospedeiras como Crotalaria breviflora.';
      managementStrategies = 'Plantio de coberturas não-hospedeiras associado ao tratamento biológico contínuo do sulco de semeadura com Bacillus subtilis e Bacillus amyloliquefaciens.';
      riskThresholds = { moderate: 80, high: 250, veryHigh: 600 };
      break;

    case 'cyst':
      etiology = 'Parasitas sedentários biológicos de extrema importância econômica. A fêmea adulta penetra e estabelece um sincício de alimentação fixo. Após a fertilização, a fêmea morre e sua parede externa sofre um processo de endurecimento e curtimento (cutícula rica em proteínas ligadas a quinonas), formando um cisto protetor marrom que resguarda centenas de ovos no solo por até 8 anos.';
      identification = 'Inspeção direta e cuidadosa das fêmeas brancas nas raízes ou extração laboratorial de cistos do solo secado ao ar através de método de flutuador de Fenwick seguido de contagem microscópica dos ovos liberados.';
      symptoms = 'Clorose e nanismo severo nas folhas (doença do nanismo amarelo), perda de produtividade drástica e presença visível de pequenos pontos esbranquiçados a marrons (os cistos) aderidos ao sistema radicular.';
      morphology = 'Fêmeas adultas com formato típico de limão e coloração inicial branca, transicionando para cistos escuros de casca dura queratinizada.';
      chemicalControl = 'Aplicação via sulco de nematicidas químicos potentes e sementes imunizadas com indutores biológicos de resistência.';
      physicalControl = 'Desinfecção por jato de alta pressão de água e calor dos pneus e discos de plantadeiras para eliminação mecânica absoluta de cistos viáveis.';
      culturalControl = 'Rotação rigorosa de longo prazo (mínimo de 3 anos) com plantas não-hospedeiras e alternância controlada de cultivares comerciais com diferentes fontes de resistência (PI 88788 vs Peking).';
      managementStrategies = 'Práticas estritas de quarentena de maquinário, rotação de lavoura e uso de biológicos como Purpureocillium lilacinum que parasita os ovos dentro do cisto.';
      riskThresholds = { moderate: 10, high: 40, veryHigh: 120 };
      break;

    case 'reniform':
      etiology = 'Nematoides semi-endoparasitas sedentários. A fêmea jovem vermiforme penetra parcialmente o córtex radicular, estabelecendo sítio de alimentação, enquanto a porção posterior do seu corpo permanece exposta no exterior da raiz, adquirindo o formato de rim e secretando uma matriz gelatinosa protetora com ovos.';
      identification = 'Extração laboratorial de fêmeas semipenetradas de cor escura recobertas de partículas de solo sob estereomicroscópio e identificação do estágio J2 livre de cauda afilada.';
      symptoms = 'Redução crônica do tamanho do sistema radicular, folhas de cor bronzeada ou clorótica, perda de peso de frutos e fibras, e plantas subdesenvolvidas.';
      morphology = 'Fêmeas maduras de formato reniforme (semelhante a um rim) com cutícula espessa e J2 vermiforme móvel.';
      chemicalControl = 'Nematicidas sistêmicos no tratamento de sementes ou aplicados no bico de pulverização do sulco.';
      physicalControl = 'Período de alqueive limpo com dessecação química de plantas invasoras hospedeiras.';
      culturalControl = 'Rotação de culturas com espécies altamente resistentes (como Milho, Sorgo ou Crotalaria spectabilis) e erradicação de plantas daninhas como a corda-de-viola.';
      managementStrategies = 'Inoculação de microrganismos de controle biológico colonizadores de raiz como Trichoderma harzianum combinados com nematicidas biológicos.';
      riskThresholds = { moderate: 60, high: 180, veryHigh: 450 };
      break;

    case 'dagger':
      etiology = 'Ectoparasitas de grande porte e migradores. Alimentam-se externamente inserindo seu estilete excepcionalmente longo e afiado (estilete tipo odontostilete) nas células apicais das raízes. Além do dano físico direto, são vetores biológicos eficientes de vírus de plantas (Nepovirus e Tobravirus).';
      identification = 'Extração laboratorial de solo por peneiramento úmido modificado devido ao grande tamanho do corpo e observação microscópica do estilete longo e duplo do nematóide.';
      symptoms = 'Engrossamento e curvamento das pontas das raízes (raízes em formato de gancho), necrose de ápices radiculares e sintomas severos de viroses sistêmicas transmitidas pelo inseto no dossel foliar.';
      morphology = 'Corpo vermiforme muito longo (geralmente de 2 a 5 mm de comprimento) com estilete extremamente comprido dotado de flanges basais fortes.';
      chemicalControl = 'Nematicidas de contato granulados incorporados no solo e tratamentos sistêmicos na linha de semeadura.';
      physicalControl = 'Alqueive prolongado de 1 a 2 anos com controle estrito de plantas daninhas hospedeiras de vírus.';
      culturalControl = 'Uso exclusivo de material propagativo (mudas/borbulhas) testado e certificado livre de vírus e nematóides.';
      managementStrategies = 'Combinação de longa rotação de culturas, controle de plantas daninhas e aplicação preventiva de nematicidas químicos de solo.';
      riskThresholds = { moderate: 15, high: 60, veryHigh: 150 };
      break;

    case 'spiral':
      etiology = 'Nematoides ectoparasitas ou semi-endoparasitas de comportamento migrador. Alimentam-se das células epidérmicas superficiais do sistema radicular. Quando perturbados ou fixados, assumem uma forma espiralada em C ou espiral fechada.';
      identification = 'Extração por centrifugação de solo e observação de nematóides vermiformes de estilete curto e cauda arredondada que assumem forma helicoidal marcante ao repouso ou morte.';
      symptoms = 'Pequenas lesões superficiais nas raízes finas, perda gradual de vigor da lavoura, amarelecimento foliar ameno e sensibilidade aumentada a estresses hídricos temporários.';
      morphology = 'Corpo vermiforme robusto que assume forma de espiral fechada e cauda curta obtusa.';
      chemicalControl = 'Nematicidas biológicos inoculados na semeadura para inibir o movimento e fixação nas raízes.';
      physicalControl = 'Aração superficial e subsolagem controlada para exposição térmica e solar do solo.';
      culturalControl = 'Manutenção de matéria orgânica no solo em níveis elevados (compostagem ou palhada) para estimular predadores naturais.';
      managementStrategies = 'Uso de palhadas orgânicas ricas em matéria orgânica, associadas a microrganismos antagônicos e fertilizantes organominerais.';
      riskThresholds = { moderate: 150, high: 450, veryHigh: 1000 };
      break;

    case 'sheath':
      etiology = 'Nematoides ectoparasitas migradores caracterizados por possuírem uma cutícula externa dupla espessa (bainha cuticular) em todas as fases do ciclo, que os protege de estresses osmóticos e de dessecação nas camadas superficiais.';
      identification = 'Morfologia labial refinada sob microscópio óptico com identificação clara da presença da bainha cuticular flácida externa envolvendo todo o corpo.';
      symptoms = 'Parada de crescimento apical das raízes secundárias, galhas diminutas nas pontas das raízes e clorose na parte aérea.';
      morphology = 'Cilíndrico com anelação profunda na cutícula externa e uma bainha envolvente visível sob microscopia.';
      chemicalControl = 'Tratamento de solo localizado com nematicidas organofosforados sistêmicos.';
      physicalControl = 'Uso de solarização do solo no verão quente e revolvimento mecânico do solo.';
      culturalControl = 'Rotação com plantas de baixa suscetibilidade e uso de sementes limpas em lavouras irrigadas.';
      managementStrategies = 'Estratégias de adubação equilibrada com potássio e silício para fortificar as paredes das raízes, aliada a nematicidas biológicos.';
      riskThresholds = { moderate: 100, high: 300, veryHigh: 700 };
      break;

    case 'pin':
    default:
      etiology = 'Nematoides ectoparasitas migradores de tamanho reduzido (microscópicos). Alimentam-se inserindo seu estilete nas células epidérmicas radiculares, ocorrendo alta proliferação populacional em condições de monocultivo contínuo e solos úmidos.';
      identification = 'Extração laboratorial de solo por flutuação centrífuga e identificação do corpo diminuto com estilete bem visível.';
      symptoms = 'Sintomas de subdesenvolvimento geral, redução na massa de raízes secundárias e folhas finas com pontas cloróticas.';
      morphology = 'Nematoides de tamanho minúsculo (geralmente menores que 0.5 mm) em formato cilíndrico-retangular fino.';
      chemicalControl = 'Tratamento químico protetor de sementes com nematicidas modernos de amplo espectro.';
      physicalControl = 'Manutenção de um período curto de pousio seco sob sol forte para reduzir populações superficiais.';
      culturalControl = 'Adubação verde com adubos orgânicos bem decompostos e rotação com gramíneas resistentes.';
      managementStrategies = 'Controle focado na melhoria das condições físicas e biológicas do solo e inoculação de fungos micorrízicos benéficos.';
      riskThresholds = { moderate: 120, high: 400, veryHigh: 900 };
      break;
  }

  if (base.id === 'anguina_tritici') {
    etiology = 'Endoparasita da parte aérea e inflorescências de trigo e centeio (primeiro fitonematoide descrito cientificamente por Needham em 1743). Invade os primórdios florais da espiga transformando os grãos em galhas coriáceas (ear-cockles) repletas de até 30.000 juvenis J2 viáveis em anidrobiose por décadas.';
    identification = 'Abertura e maceração de grãos escurecidos (cockles) em gota d’água sob estereomicroscópio para observação do enxame de juvenis J2 móveis ou fêmeas adultas infladas.';
    symptoms = 'Substituição das sementes normais por galhas de semente negras ou castanhas arredondadas (ear-cockles), espigas deformadas com glumas divergentes e retorcimento espiralado acentuado das folhas jovens na emergência.';
    morphology = 'Fêmea adulta extremamente espessada e encurvada ventralmente (em forma de C ou vírgula dilatada, 3 a 5 mm); machos menores com bursas estreitas; estilete curto (8-11 µm) e bulbo esofagiano característico.';
    survival = 'Sobrevivência de juvenis J2 em criptobiose/anidrobiose no interior das galhas de semente secas por mais de 30 anos.';
    culturalControl = 'Uso rigoroso de sementes certificadas e limpas por mesa de gravidade ou flotação em salmoura (solução de NaCl a 20%) para descarte das galhas flutuantes.';
  } else if (base.id === 'aphelenchoides_besseyi') {
    etiology = 'Ecto e endoparasita facultativo da parte aérea, gemas e inflorescências de arroz, soja e plantas forrageiras/ornamentais. É o agente causal da doença da Ponta-Branca do Arroz e está associado à Síndrome da Haste Verde e Retenção Foliar da Soja no Cerrado (soja louca II).';
    identification = 'Imersão de sementes de arroz ou fragmentos de folhas e gemas em água destilada (método do funil de Baermann ou placas de Petri) por 24-48h para extração dos nematoides anidrobióticos ativos; exame microscópico do mucro caudal estrelado.';
    symptoms = 'Branqueamento apical característico (2-5 cm) das folhas superiores do arroz (ponta-branca), retorcimento foliar, redução do tamanho das panículas, esterilidade de espiguetas com grãos chochos e deformados. Na soja: retenção foliar, haste verde e abortamento floral.';
    morphology = 'Corpo delgado (0.6 a 0.8 mm), bulbo esofagiano mediano (metacorpo) arredondado e muito desenvolvido, estilete delicado (10-12 µm) com nódulos basais pequenos e cauda cônica provida de um mucro estrelado com 2 a 4 pontas diagnósticas.';
    survival = 'Capacidade notável de anidrobiose nas cascas e sementes secas de arroz, permanecendo viável por mais de 3 anos sob armazenamento convencional.';
    physicalControl = 'Tratamento térmico de sementes com imersão em água quente (52-54 °C por 10 a 15 minutos após pré-embebição em água fria) ou tratamento químico de sementes.';
    culturalControl = 'Utilização obrigatória de sementes fiscalizadas e livres de nematoide; dessecação e queima de restos culturais infestados; uso de cultivares resistentes de arroz.';
  } else if (base.id === 'aphelenchoides_fragariae') {
    etiology = 'Ecto e endoparasita foliar e de gemas apicais de morangueiro, samambaias, begônias e diversas espécies ornamentais. Causa a doença do encrespamento ou enfezamento primaveril (spring dwarf ou crimp disease).';
    identification = 'Fragmentação de tecidos foliares ou gemas de brotação em água em câmara úmida ou funil de Baermann para migração e contagem; microscopia para conferência do mucro caudal simples de ponta única.';
    symptoms = 'Folhas novas de morangueiro estreitas, encarquilhadas, retorcidas e coriáceas com pecíolos curtos e avermelhados (folhas em formato de colher/cravo); superbrotamento de gemas e atrofia severa dos botões florais e frutos.';
    morphology = 'Corpo delgado (0.5 a 0.8 mm), estilete delicado (10-11 µm) com pequenos nódulos basais, metacorpo bem delineado e cauda cônica delgada terminando em um processo mucronado apical simples (1 espículo/ponta).';
    survival = 'Sobrevivência em gemas dormentes, coroas e restos foliares secos protegidos de umidade extrema; disseminação por estolões e mudas micropropagadas contaminadas.';
    physicalControl = 'Termoterapia em mudas e estolões de morango: imersão em água a 46-48 °C durante 10 a 15 minutos (com controle rígido de tempo e temperatura para evitar danos fisiológicos à coroa).';
    culturalControl = 'Aquisição exclusiva de mudas matrizes certificadas indexadas; eliminação e queima imediata de plantas sintomáticas no viveiro; irrigação por gotejamento evitando aspersão foliar.';
  } else if (base.id === 'aphelenchoides_ritzemabosi') {
    etiology = 'Endoparasita e ectoparasita foliar de crisântemo, zínia, dália, begônia, fumo e mais de 200 espécies de angiospermas. Penetra pelos estômatos e movimenta-se no parênquima foliar nos filmes de água superficial.';
    identification = 'Dissecação ou corte de setores de folhas com lesões em água destilada sob lupa/microscópio (migração em 12-24h) e análise do mucro caudal com 2 a 4 processos espiculares.';
    symptoms = 'Lesões foliares necróticas angulares e em forma de cunha, rigorosamente delimitadas pelas nervuras secundárias das folhas; oxidação de polifenóis causando escurecimento intenso, murcha e desfolha acrópeta.';
    morphology = 'Corpo esbelto (0.8 a 1.2 mm), bulbo esofagiano mediano volumoso, estilete delicado (12 µm) com nódulos basais bem formados e cauda cônica terminando em um mucro com 2 a 4 pontas terminais.';
    survival = 'Capacidade de anidrobiose em folhas secas caídas ao solo por até 3 anos; sobrevivência em gemas e brotos dormentes.';
    physicalControl = 'Termoterapia em estacas ou gemas de crisântemo por imersão em água quente a 48 °C por 5 a 6 minutos; eliminação do filme de água foliar com ventilação de estufas.';
    culturalControl = 'Eliminação imediata de folhas e restos de poda caídos no solo; uso de irrigação localizada por gotejamento; mudas e estacas sadias certificadas.';
  } else if (base.id === 'belonolaimus_longicaudatus') {
    etiology = 'Ectoparasita migrador de raízes extremamente destrutivo (nematoide-agulha ou sting nematode). Possui hábito estrito em solos muito arenosos (teor de areia > 80%), atacando meristemas radiculares de gramíneas, milho, algodão, morango, amendoim e citros.';
    identification = 'Centrifugação e flutuação em sacarose de amostras de solo arenoso (extração direta com peneiramento suave); exame de estilete gigante (>100 µm) e cauda longa com término arredondado.';
    symptoms = 'Destruição e necrose dos meristemas apicais das radicelas resultando em sistema radicular atrofiado, curto e grosso (aspecto de "toco" ou raiz aparada a faca / stubby root); na parte aérea causa nanismo drástico, clorose e murcha rápida sob déficit hídrico.';
    morphology = 'Corpo cilíndrico muito longo (2.0 a 3.0 mm), estilete longo e flexível em formato de agulha (60 a 140 µm) com grandes nódulos basais arredondados, região labial proeminente dividida em 4 lobos e cauda cilíndrica alongada.';
    survival = 'Sobrevivência no solo como ovos ou formas juvenis e adultas livres na rizosfera profunda, migrando verticalmente conforme a umidade do perfil do solo.';
    culturalControl = 'Rotação de culturas com espécies não hospedeiras (como fumo ou crotalária específica, dependendo do biótipo); incorporação de matéria orgânica pesada para aumentar a retenção hídrica em solos arenosos.';
  } else if (base.id === 'bursaphelenchus_xylophilus') {
    etiology = 'Endoparasita migrador de xilema e canais resiníferos de coníferas (Pinus spp.). Causador do Murchamento Fulminante do Pinheiro (Pine Wilt Disease), transmitido phoreticamente pelos besouros serra-pau do gênero Monochamus (Cerambycidae). Praga quarentenária A1/A2 de altíssimo impacto global.';
    identification = 'Extração por funil de Baermann a partir de serragem/cavacos de madeira de troncos e galhos suspeitos (incubação por 24-48h); confirmação microscópica dos espículos masculinos em forma de garra com cucullus discóide e aba vulvar feminina.';
    symptoms = 'Interrupção súbita da exsudação de resina nas incisões da casca; amarelecimento e ressecamento generalizado das acículas (folhas aciculares) em toda a copa; colapso vascular por cavitação e morte fulminante da árvore em 4 a 12 semanas.';
    morphology = 'Corpo esguio (0.8 a 1.0 mm), estilete fino (12-15 µm) com nódulos diminutos, bulbo mediano muscular bem dilatado, fêmeas com aba vulvar distinta e saco pós-uterino longo; machos com espículos arqueados robustos dotados de cucullus terminal discóide.';
    survival = 'Sobrevivência nos canais de resina da madeira morta alimentando-se de fungos associados (como Ceratocystis e Botrytis) e no interior do sistema traqueal de adultos e pupas de besouros Monochamus.';
    physicalControl = 'Tratamento térmico de madeira e embalagens de madeira (Norma Internacional ISPM 15 / NIMF 15: aquecimento do núcleo da madeira a 56 °C por no mínimo 30 minutos) ou fumigação.';
    culturalControl = 'Corte raso e destruição (queima ou trituração/queima térmica) imediata de árvores infestadas antes da emergência dos besouros vetores na primavera; armadilhas com atraentes e feromônios para monitoramento de Monochamus.';
  } else if (base.id === 'bursaphelenchus_cocophilus') {
    etiology = 'Endoparasita obrigatório e vascular de palmeiras (coqueiro, dendezeiro/palma-de-óleo). Agente etiológico da severa doença do Anel-Vermelho (Red Ring Disease), transmitido pelo coleóptero vetor Rhynchophorus palmarum (broca-do-olho-do-coqueiro).';
    identification = 'Amostragem com trado no estipe do coqueiro a ~1 m de altura; fragmentação de cavacos do anel vermelho em água destilada (funil de Baermann ou béquer) com migração rápida de milhares de juvenis; confirmação da aba vulvar e espículos discóides.';
    symptoms = 'Faixa contínua necrótica vermelho-acastanhada circular de 3-5 cm no interior do tronco visível em corte transversal; amarelecimento das folhas basais e medianas com aspecto de "guarda-chuva fechado", aborto de cocos e morte em 2 a 4 meses.';
    morphology = 'Corpo extremamente esguio e afilado (1.0 a 1.2 mm), região labial saliente e esclerotizada, estilete delicado com nódulos basais indistintos, fêmeas com aba vulvar bem demarcada e machos com espículos arqueados portando expansão discóide distal e bursa terminal reduzida.';
    survival = 'Sobrevivência nos tecidos vivos do estipe e nas galerias/corpo do besouro vetor Rhynchophorus palmarum; viabilidade restrita a apenas 3-4 dias quando livre no solo úmido.';
    culturalControl = 'Erradicação imediata e queima/quimização de palmeiras com sintomas de anel-vermelho; monitoramento rigoroso e captura massal da broca-do-olho com armadilhas contendo feromônio de agregação (Rhynchophorol) e toletes de cana-de-açúcar.';
  } else if (base.id === 'criconemoides_onoensis') {
    etiology = 'Ectoparasita migrador obrigatório de raízes (nematoide-anelado do arroz e gramíneas / Ring Nematode). Alimenta-se externamente de células do córtex e ápices de raízes finas de arroz irrigado, cana-de-açúcar, abacaxi e gramíneas forrageiras em solos arenosos ou hidromórficos.';
    identification = 'Centrifugação e flutuação em sacarose (método de Jenkins) com peneiramento cuidadoso (peneiras de 200 a 400 mesh); confirmação microscópica da cutícula fortemente anelada com anéis retrorsos e estilete rígido volumoso.';
    symptoms = 'Encurtamento, necrose e pontas das raízes recurvadas em formato de gancho ("hook-shaped root tips"); redução do perfilhamento, clorose leve da copa e perdas de 15 a 20% na produtividade de grãos sob altas densidades.';
    morphology = 'Corpo cilíndrico robusto e curto (0.40 a 0.60 mm), anéis cuticulares profundos e retrorsos sem incisuras laterais, estilete maciço longo (50 a 80 µm) com nódulos basais côncavos voltados para a frente em formato de âncora, vulva fechada com lábio anterior liso.';
    survival = 'Alta capacidade de sobrevivência à dessecação e anóxia periódica em solos alagados protegidos pela espessura cuticular; sobrevivência em plantas espontâneas e soqueiras de arroz.';
    culturalControl = 'Manejo criterioso da lâmina de água de irrigação; rotação com leguminosas não hospedeiras e incorporação de matéria orgânica no solo para estimular predadores nematófagos.';
  } else if (base.id === 'ditylenchus_destructor') {
    etiology = 'Endoparasita migrador de tecidos subterrâneos (nematoide-da-podridão-da-batata). Penetra ativamente em tubérculos, bulbos e rizomas, destruindo tecidos parenquimáticos por meio de secreções enzimáticas (celulases). Causa podridão seca grave em batata e bulbos ornamentais.';
    identification = 'Extração laboratorial de fatias de tecido lesionado de tubérculos ou bulbos por embebição em água destilada (método de funil de Baermann) por 24-48h; diferenciação microscópica com base no campo lateral (6 incisuras longitudinais contra 4 de D. dipsaci) e morfologia caudal.';
    symptoms = 'Surgimento de pequenas manchas brancas e farináceas sob a pele do tubérculo; evolução para lesões côncavas secas de coloração parda ou escura, rachaduras cuticulares, casca papirácea que se desprende com facilidade e necrose seca severa.';
    morphology = 'Corpo cilíndrico esguio e vermiforme (0.8 a 1.4 mm), esqueleto cefálico reduzido, estilete curto e fino (10-12 µm) com pequenos nódulos basais arredondados, cauda cônica e término tipicamente arredondado ou rombo. Campo lateral com 6 incisuras.';
    survival = 'Sobrevivência nos restos de culturas, tubérculos no armazém ou no solo na forma de ovos e estágios ativos. Alimenta-se e reproduz-se em hifas de fungos de solo. Sensível à dessecação extrema e desprovido de anidrobiose foliar (não forma lã de nematoide).';
    culturalControl = 'Uso exclusivo de batatas-semente e bulbos certificados livres de nematóides; rotação de culturas de longo prazo com espécies não hospedeiras e eliminação de plantas daninhas hospedeiras; controle de umidade no armazenamento de tubérculos.';
  } else if (base.id === 'ditylenchus_dipsaci') {
    etiology = 'Endoparasita migrador de bulbos, caules e folhas (nematoide dos bulbos e caules). Ataca órgãos aéreos e de reserva de alho, cebola, alfafa e aveia, dissolvendo a lamela média de células parenquimáticas por meio de secreções de pectinases, causando o amolecimento e intumescimento esponjoso característico dos tecidos hospedeiros.';
    identification = 'Extração laboratorial de dentes de alho ou hastes foliares por desfiamento de tecidos frescos e suspensão em água destilada (funil de Baermann) por 12-24h; observação em microscópio óptico do campo lateral (com exatamente 4 linhas longitudinais paralelas) e cauda longa com ponta delgada e aguda.';
    symptoms = 'Folhas e caules retorcidos, intumescidos, espessados e distorcidos ("bloated and twisted leaves"); amolecimento esponjoso com descoloração e fendas nos dentes internos de alho ("galinhaça") e bulbos de cebola; redução severa do crescimento em alfafa.';
    morphology = 'Corpo vermiforme alongado e delgado (1.0 a 1.3 mm), esqueleto cefálico sutil, estilete muito curto e delicado (10-12 µm) dotado de pequenos nódulos arredondados, esôfago característico de Tylenchina com lobos glandulares sobrepostos ao intestino e cauda progressivamente afilada terminando em ponta fina, aguda e lisa.';
    survival = 'Excelente sobrevivência a estresses ambientais severos; os juvenis de quarto estágio (J4) entram em criptobiose/anidrobiose sob condições secas, aglomerando-se em massa na superfície de bulbos, sementes e palhadas secas, formando a famosa "lã de nematoide" (eelworm wool) viável por vários anos.';
    culturalControl = 'Uso obrigatório de sementes sadias, dentes de alho e bulbos certificados livres de nematoides; rotação de culturas de 3 a 4 anos com espécies não hospedeiras e eliminação precoce de plantas daninhas hospedeiras; limpeza rigorosa do maquinário de plantio e cultivo.';
  } else if (base.id === 'dolichodorus_heterocephalus') {
    etiology = 'Ectoparasita migrador obrigatório de grande porte (nematoide-de-agulha-longa-de-várzea / Awl Nematode). Alimenta-se profundamente inserindo seu longo estilete no meristema apical e tecidos vasculares corticais de raízes de aipo, tomateiro, arroz de várzea e plantas ornamentais de áreas úmidas.';
    identification = 'Centrifugação e flutuação em sacarose (Jenkins) ou decantação com peneiramento manual devido ao tamanho avantajado do nematoide (utilizando peneiras de malha de 100 a 200 mesh); confirmação microscópica da região cefálica lobada e estilete gigante.';
    symptoms = 'Paralisação abrupta e irreversível do crescimento das raízes finas; formação de lesões necróticas escuras nas pontas das raízes, nanismo acentuado das mudas aéreas, amarelecimento foliar prematuro e definhamento rápido em reboleiras úmidas.';
    morphology = 'Corpo cilíndrico alongado e de grande porte (2.0 a 3.0 mm), região cefálica distintamente expandida (heterocéfalo) dividida em quatro lobos proeminentes e separada do corpo por uma constrição profunda. Estilete extraordinariamente longo, rígido e robusto (90 a 130 µm). Cauda cônica afinada subitamente.';
    survival = 'Alta dependência de solos hidromórficos de baixada, turfeiras de alta umidade, solos arenosos úmidos e margens de corpos d\'água; sobrevive alimentando-se em plantas aquáticas invasoras espontâneas e gramíneas de várzea.';
    culturalControl = 'Drenagem cuidadosa de solos de baixada saturados e controle rigoroso de umidade excessiva; rotação com culturas não hospedeiras de sequeiro; eliminação sistemática de plantas daninhas aquáticas que servem de reservatório natural.';
  }

  // Set the specific details and return the complete object
  return {
    id: base.id,
    scientificName: base.name,
    commonName: base.common,
    morphology,
    biologicalCycle,
    survival,
    hosts: base.mainHost.split(', '),
    symptoms,
    identificationMethods: base.id === 'anguina_tritici' ? 'Flotação em Salmoura / Dissecação de Galhas de Semente' : base.id.startsWith('aphelenchoides') ? 'Embebição de Tecidos / Funil de Baermann / Análise de Mucro Caudal' : base.id.startsWith('bursaphelenchus') ? 'Amostragem de Madeira/Tronco / Funil de Baermann / Morfologia de Espículos e Vulva' : base.id === 'criconemoides_onoensis' ? 'Centrifugação e Flutuação em Sacarose / Análise da Anelação Cuticular e Estilete' : base.id === 'ditylenchus_destructor' ? 'Extração por Funil de Baermann / Análise do Campo Lateral (6 Linhas) e Morfologia Caudal' : base.id === 'ditylenchus_dipsaci' ? 'Dissecação de Tecidos e Funil de Baermann / Identificação de Campo Lateral (4 Linhas) e Cauda Aguda' : base.id === 'dolichodorus_heterocephalus' ? 'Decantação e Peneiramento Manual / Identificação de Estilete Longo e Região Lobada' : base.common.includes('cisto') ? 'Flutuação de Fenwick / Cistos' : 'Centrifugação e Flutuação em Sacarose',
    economicDamage,
    managementStrategies,
    references: base.id === 'anguina_tritici' ? 'UC Davis Nemaplex (TaxaData G006S4), USDA-ARS & CIMMYT' : base.id === 'aphelenchoides_besseyi' ? 'UC Davis Nemaplex (TaxaData G011S1), IRRI & EMBRAPA Arroz e Feijão' : base.id === 'aphelenchoides_fragariae' ? 'UC Davis Nemaplex (TaxaData G011S2) & INRAE / EPPO' : base.id === 'aphelenchoides_ritzemabosi' ? 'UC Davis Nemaplex (TaxaData G011S3) & CDFA / EPPO' : base.id === 'belonolaimus_longicaudatus' ? 'UC Davis Nemaplex (TaxaData G022S1), University of Florida (UF/IFAS) & USDA' : base.id === 'bursaphelenchus_xylophilus' ? 'UC Davis Nemaplex (TaxaData G145S1), USDA Forest Service & EPPO' : base.id === 'bursaphelenchus_cocophilus' ? 'UC Davis Nemaplex (TaxaData G145S3), EMBRAPA Tabuleiros Costeiros & CIRAD' : base.id === 'criconemoides_onoensis' ? 'UC Davis Nemaplex (TaxaData G036/G150), CABI Digital Library & IRGA' : base.id === 'ditylenchus_destructor' ? 'UC Davis Nemaplex (TaxaData G042S2), EPPO & CIP' : base.id === 'ditylenchus_dipsaci' ? 'UC Davis Nemaplex (TaxaData G042S1), CDFA & Castillo et al., 2007' : base.id === 'dolichodorus_heterocephalus' ? 'UC Davis Nemaplex (TaxaData G044S1), Cobb (1914) & CIH Descriptions (1974)' : 'Sociedade Brasileira de Nematologia (SBN) & EMBRAPA',
    riskThresholds,
    etiology,
    identification,
    chemicalControl,
    physicalControl,
    culturalControl,
    anatomyType: base.type as any,
    media: getSpeciesMediaData(base.id, base.type)
  };
});
