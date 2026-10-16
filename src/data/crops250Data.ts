import { CropPlantingRecommendation } from '../types/recommendationsPro';

// Helper tuple structure to keep file size compact & readable:
// [cropId, cropName, scientificName, recommendedFormulationId, defaultPlantingDoseKgHa, expectedYieldDefault, yieldUnit, n, p2o5, k2o, observation]
type RawCropTuple = [
  string, // cropId
  string, // cropName
  string, // scientificName
  string, // recommendedFormulationId
  number, // defaultPlantingDoseKgHa
  number, // expectedYieldDefault
  string, // yieldUnit
  number, // N kg/ha
  number, // P2O5 kg/ha
  number, // K2O kg/ha
  string  // observation referencing regional bulletins
];

const RAW_CROPS_250: RawCropTuple[] = [
  ['abacate', 'Abacate', 'Persea americana', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Aplicar adubação de cova no plantio com fosfato reativo e esterco curtido.'],
  ['abacaxi', 'Abacaxi', 'Ananas comosus', 'npk-05-25-15', 350, 45, 't/ha', 17.5, 87.5, 52.5, 'Boletim Profert-SE / IAC 100: Sulco reforçado em P₂O₅ e suplementação de K em cobertura.'],
  ['abobora-cabotia', 'Abóbora-Cabotiá', 'Cucurbita maxima x C. moschata', 'npk-04-14-08', 350, 18, 't/ha', 14, 49, 28, 'Boletim 5ª Aproximação MG: Exige alta disponibilidade de P e M.O. nas covas.'],
  ['abobora-japonesa', 'Abóbora-Japonesa', 'Cucurbita moschata', 'npk-04-14-08', 320, 15, 't/ha', 12.8, 44.8, 25.6, 'Boletim IAC 100: Adubação concentrada em covas para expansão radicular rápida.'],
  ['abobrinha-italiana', 'Abobrinha-Italiana', 'Cucurbita pepo', 'npk-04-14-08', 400, 25, 't/ha', 16, 56, 32, 'Boletim IAC 100: Requer elevado P₂O₅ de arranque no sulco para florescimento precoce.'],
  ['acai', 'Açaí', 'Euterpe oleracea', 'npk-04-14-08', 250, 12, 't/ha', 10, 35, 20, 'Embrapa Amazônia Oriental: Adubação nas covas de plantio associada a matéria orgânica.'],
  ['acelga', 'Acelga', 'Beta vulgaris var. cicla', 'npk-04-14-08', 300, 30, 't/ha', 12, 42, 24, 'Boletim IAC 100: Responde fortemente ao Boro e Nitrogênio de arranque.'],
  ['acerola', 'Acerola', 'Malpighia emarginata', 'npk-04-14-08', 250, 25, 't/ha', 10, 35, 20, 'Boletim Profert-SE / Embrapa: Aplicação na cova combinada com micronutrientes.'],
  ['agave-sisal', 'Agave / Sisal', 'Agave sisalana', 'npk-04-14-08', 200, 3, 't/ha', 8, 28, 16, 'Embrapa Algodão / Bahia: Adubação leve no sulco focada no fornecimento de P e Ca.'],
  ['agriao-dagua', 'Agrião-d’Água', 'Nasturtium officinale', 'npk-10-10-10', 200, 15, 't/ha', 20, 20, 20, 'Boletim IAC 100: Fertirrigação ou adubação orgânico-mineral equilibrada.'],
  ['aipo-salsao', 'Aipo / Salsão', 'Apium graveolens', 'npk-04-14-08', 350, 35, 't/ha', 14, 49, 28, 'Boletim IAC 100: Exige Boro e Cálcio no sulco para evitar murcha e coração-preto.'],
  ['alcachofra', 'Alcachofra', 'Cynara cardunculus', 'npk-04-14-08', 400, 12, 't/ha', 16, 56, 32, 'Boletim IAC 100: Cultura perene de inverno exigindo solo bem drenado e rico em P.'],
  ['alecrim', 'Alecrim', 'Rosmarinus officinalis', 'npk-10-10-10', 150, 5, 't/ha', 15, 15, 15, 'Boletim IAC 100 (Aromáticas): Baixa exigência mineral, foco em drenagem.'],
  ['alface-americana', 'Alface-Americana', 'Lactuca sativa var. capitata', 'npk-04-14-08', 350, 40, 't/ha', 14, 49, 28, 'Boletim IAC 100: Adubação de canteiro com foco em P₂O₅ solúvel e Ca/B.'],
  ['alface-crespa', 'Alface-Crespa', 'Lactuca sativa var. crispa', 'npk-04-14-08', 300, 35, 't/ha', 12, 42, 24, 'Boletim IAC 100: Ciclo rápido de 35 a 45 dias exigindo fósforo de prontidão.'],
  ['alface-lisa', 'Alface-Lisa', 'Lactuca sativa var. capitata', 'npk-04-14-08', 300, 30, 't/ha', 12, 42, 24, 'Boletim IAC 100: Evitar salinidade excessiva no canteiro inicial.'],
  ['alface-roxa', 'Alface-Roxa', 'Lactuca sativa var. crispa', 'npk-04-14-08', 300, 30, 't/ha', 12, 42, 24, 'Boletim IAC 100: Adubação organomineral promove pigmentação e vigor.'],
  ['alfafa', 'Alfafa', 'Medicago sativa', 'npk-00-20-20', 300, 18, 't MS/ha/ano', 0, 60, 60, 'CQFS RS/SC: Leguminosa fixadora de N. Foco em calagem, P₂O₅ e Potássio.'],
  ['alfazema-lavanda', 'Alfazema / Lavanda', 'Lavandula angustifolia', 'npk-04-14-08', 180, 4, 't/ha', 7.2, 25.2, 14.4, 'Boletim IAC 100: Plantio em solos alcalinos ou bem calagados.'],
  ['algodoeiro-adensado', 'Algodoeiro Adensado', 'Gossypium hirsutum', 'npk-08-28-16', 420, 320, '@ /ha', 33.6, 117.6, 67.2, 'Boletim Embrapa Algodão: Alta exigência em P₂O₅ na linha de sowing.'],
  ['algodoeiro-convencional', 'Algodoeiro Convencional', 'Gossypium hirsutum', 'npk-08-28-16', 380, 300, '@ /ha', 30.4, 106.4, 60.8, 'Boletim IAC 100 / Embrapa: Suplementação de B e Zn no sulco obrigatoriamente.'],
  ['alho', 'Alho', 'Allium sativum', 'npk-04-14-08', 500, 15, 't/ha', 20, 70, 40, 'Boletim IAC 100 / 5ª Aproximação MG: Alta exigência de P₂O₅ e Enxofre no plantio.'],
  ['almeirao', 'Almeirão', 'Cichorium intybus', 'npk-04-14-08', 280, 25, 't/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Exige canteiro bem estruturado e fofo com P solúvel.'],
  ['ameixa', 'Ameixa', 'Prunus domestica', 'npk-04-14-08', 250, 22, 't/ha', 10, 35, 20, 'CQFS RS/SC: Adubação de cova no plantio de mudas em fruteiras de clima temperado.'],
  ['amendoim-das-aguas', 'Amendoim das Águas', 'Arachis hypogaea', 'npk-02-20-20', 300, 180, 'sc/ha', 6, 60, 60, 'Boletim IAC 100: Leguminosa com FBN. Exige P₂O₅, Cálcio (gesso) e Boro.'],
  ['amendoim-das-secas', 'Amendoim das Secas', 'Arachis hypogaea', 'npk-02-20-20', 280, 140, 'sc/ha', 5.6, 56, 56, 'Boletim IAC 100: Adubação de sulco concentrada no P₂O₅ para arranque rápido.'],
  ['amendoim-forrageiro', 'Amendoim Forrageiro', 'Arachis pintoi', 'npk-00-20-20', 200, 12, 't MS/ha', 0, 40, 40, 'Embrapa Gado de Corte: Leguminosa perene de pastagem, dispensando N.'],
  ['amora-preta', 'Amora-Preta', 'Rubus spp.', 'npk-04-14-08', 220, 12, 't/ha', 8.8, 30.8, 17.6, 'CQFS RS/SC: Pequenas frutas exigindo solo com boa matéria orgânica.'],
  ['anturio', 'Antúrio', 'Anthurium androeanum', 'npk-10-10-10', 150, 80000, 'hastes/ha', 15, 15, 15, 'Boletim IAC 100 (Floricultura): Cultivo em canteiros sombreados com substrato.'],
  ['arroz-irrigado', 'Arroz Irrigado', 'Oryza sativa', 'npk-05-25-15', 300, 160, 'sc/ha', 15, 75, 45, 'Boletim IRGA / CQFS RS/SC: Foco em P₂O₅ no sulco e K trocável antes do alagamento.'],
  ['arroz-sequeiro', 'Arroz Sequeiro', 'Oryza sativa', 'npk-04-14-08', 250, 80, 'sc/ha', 10, 35, 20, 'Boletim Embrapa Arroz e Feijão / IAC: Fósforo no sulco essencial para o perfilhamento.'],
  ['aspargo', 'Aspargo', 'Aspargus officinalis', 'npk-04-14-08', 400, 8, 't/ha', 16, 56, 32, 'Boletim IAC 100: Adubação de sulco profundo (30 cm) com esterco e fosfato.'],
  ['atemoia', 'Atemóia', 'Annona cherimola x A. squamosa', 'npk-04-14-08', 300, 15, 't/ha', 12, 42, 24, 'Boletim IAC 100: Frutífera exigente em P, Zn e B no momento do plantio.'],
  ['aveia-branca', 'Aveia-Branca', 'Avena sativa', 'npk-05-25-15', 220, 50, 'sc/ha', 11, 55, 33, 'CQFS RS/SC: Cereal de inverno. Adubação de sulco para perfilhamento vigoroso.'],
  ['aveia-preta', 'Aveia-Preta', 'Avena strigosa', 'npk-04-14-08', 180, 4, 't MS/ha', 7.2, 25.2, 14.4, 'CQFS RS/SC: Planta de cobertura de solo. Exige adubação leve de P₂O₅.'],
  ['azeitona-oliveira', 'Azeitona / Oliveira', 'Olea europaea', 'npk-04-14-08', 250, 8, 't/ha', 10, 35, 20, 'EPAMIG MG / CQFS RS/SC: Adubação na cova associada ao controle do pH do solo (>6.0).'],
  ['babosa-aloe', 'Babosa / Aloe Vera', 'Aloe vera', 'npk-04-14-08', 200, 30, 't/ha', 8, 28, 16, 'Boletim IAC 100: Planta suculenta exigente em drenagem e P para enraizamento.'],
  ['bambu-gigante', 'Bambu-Gigante', 'Dendrocalamus giganteus', 'npk-10-10-10', 200, 40, 't/ha', 20, 20, 20, 'Embrapa Florestas: Adubação de cova no plantio para arranque dos colmos.'],
  ['banana-nanica', 'Banana-Nanica', 'Musa acuminata', 'npk-04-14-08', 400, 45, 't/ha', 16, 56, 32, 'Boletim IAC 100 / Embrapa: Cova enriquecida com P₂O₅, K₂O e matéria orgânica.'],
  ['banana-prata', 'Banana-Prata', 'Musa x paradisiaca', 'npk-04-14-08', 350, 35, 't/ha', 14, 49, 28, 'Boletim IAC 100 / Profert-SE: Grande absorção de K₂O e B no desenvolvimento.'],
  ['batata-baroa', 'Batata-Baroa / Mandioquinha', 'Arracacia xanthorrhiza', 'npk-04-14-08', 450, 20, 't/ha', 18, 63, 36, 'Boletim 5ª Aproximação MG / IAC: Exige fósforo solúvel abundante para tuberização.'],
  ['batata-doce', 'Batata-Doce', 'Ipomoea batatas', 'npk-04-14-08', 300, 25, 't/ha', 12, 42, 24, 'Boletim IAC 100: Adubação na leira de plantio com P₂O₅ e Potássio.'],
  ['batata-inglesa', 'Batata-Inglesa', 'Solanum tuberosum', 'npk-03-35-06', 1200, 35, 't/ha', 36, 420, 72, 'Boletim IAC 100 / CQFS RS/SC: Altíssima exigência de P₂O₅ no sulco de plantio.'],
  ['berinjela', 'Berinjela', 'Solanum melongena', 'npk-04-14-08', 400, 45, 't/ha', 16, 56, 32, 'Boletim IAC 100: Exige solo rico em P e K para sustentação do florescimento longo.'],
  ['beterraba', 'Beterraba', 'Beta vulgaris', 'npk-04-14-08', 400, 35, 't/ha', 16, 56, 32, 'Boletim IAC 100: Alta exigência em Boro para evitar o coração-negro das raízes.'],
  ['bordo', 'Bordo', 'Acer palmatum', 'npk-10-10-10', 150, 5, 't/ha', 15, 15, 15, 'Boletim IAC 100 (Ornamental): Adubação equilibrada de crescimento tardio.'],
  ['brocolis-ninja', 'Brócolis-Ninja', 'Brassica oleracea var. italica', 'npk-04-14-08', 450, 20, 't/ha', 18, 63, 36, 'Boletim IAC 100: Exige Boro, Molibdênio e alta dose de P no sulco.'],
  ['brocolis-ramoso', 'Brócolis-Ramoso', 'Brassica oleracea var. italica', 'npk-04-14-08', 400, 18, 't/ha', 16, 56, 32, 'Boletim IAC 100: Brássica responsiva ao N inicial e fosfato solúvel.'],
  ['cacau', 'Cacau', 'Theobroma cacao', 'npk-04-14-08', 250, 1.5, 't/ha', 10, 35, 20, 'CEPLAC / Embrapa: Cova enriquecida com fosfato natural reativo e calcário.'],
  ['cafeeiro-arabica', 'Cafeeiro-Arábica', 'Coffea arabica', 'npk-04-14-08', 250, 45, 'sc/ha', 10, 35, 20, 'Boletim 100 IAC / 5ª Aprox. MG: Adubação de cova/sulco focada em P e enraizamento.'],
  ['cafeeiro-conilon', 'Cafeeiro-Conilon', 'Coffea canephora', 'npk-05-25-15', 300, 80, 'sc/ha', 15, 75, 45, 'Incaper ES / Embrapa: Altamente produtivo, exige P₂O₅ e N na implantação.'],
  ['caju', 'Caju', 'Anacardium occidentale', 'npk-04-14-08', 200, 1.2, 't/ha', 8, 28, 16, 'Embrapa Agroindústria Tropical: Adubação leve de cova no Semiárido.'],
  ['calendula', 'Calêndula', 'Calendula officinalis', 'npk-10-10-10', 180, 3, 't/ha', 18, 18, 18, 'Boletim IAC 100: Exige solo leve e bem drenado com fertilização moderada.'],
  ['camomila', 'Camomila', 'Matricaria chamomilla', 'npk-04-14-08', 200, 1.5, 't/ha', 8, 28, 16, 'CQFS RS/SC: Planta medicinal/aromática de inverno.'],
  ['cana-de-acucar-planta', 'Cana-de-Açúcar (Planta)', 'Saccharum officinarum', 'npk-05-25-15', 500, 110, 't/ha', 25, 125, 75, 'Boletim IAC 100 / CONAB: Sulco de plantio reforçado em P₂O₅ e torta de filtro.'],
  ['cana-de-acucar-soco', 'Cana-de-Açúcar (Soco/Roca)', 'Saccharum officinarum', 'npk-20-05-20', 400, 85, 't/ha', 80, 20, 80, 'Boletim IAC 100: Adubação de soqueira focada em N e K₂O após a colheita.'],
  ['canola-colza', 'Canola / Colza', 'Brassica napus', 'npk-08-28-16', 250, 2.5, 't/ha', 20, 70, 40, 'CQFS RS/SC / Embrapa Trigo: Exige Enxofre (S) e Boro junto com o P no sulco.'],
  ['capim-aruana', 'Capim-Aruana', 'Panicum maximum cv. Aruana', 'npk-04-14-08', 200, 12, 't MS/ha', 8, 28, 16, 'Boletim IAC 100: Excelente para ovinos, exige P para estabelecimento.'],
  ['capim-brachiaria-brizantha', 'Capim-Brachiaria Brizantha', 'Urochloa brizantha', 'npk-04-14-08', 220, 15, 't MS/ha', 8.8, 30.8, 17.6, 'Boletim IAC 100 / Embrapa Gado de Corte: Garante rápido perfilhamento.'],
  ['capim-brachiaria-decumbens', 'Capim-Brachiaria Decumbens', 'Urochloa decumbens', 'npk-04-14-08', 180, 10, 't MS/ha', 7.2, 25.2, 14.4, 'Boletim IAC 100: Rústico, responde bem ao P inicial em solos fracos.'],
  ['capim-brachiaria-humidicola', 'Capim-Brachiaria Humidicola', 'Urochloa humidicola', 'npk-04-14-08', 150, 8, 't MS/ha', 6, 21, 12, 'Embrapa Pantanal: Indicada para solos úmidos/alagáveis.'],
  ['capim-buffel', 'Capim-Buffel', 'Cenchrus ciliaris', 'npk-04-14-08', 150, 7, 't MS/ha', 6, 21, 12, 'Embrapa Semiárido: Forrageira resistente à seca.'],
  ['capim-elefante-napier', 'Capim-Elefante / Napier', 'Cenchrus purpureus', 'npk-05-25-15', 350, 35, 't MS/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100: Altíssima produção de massa verde para capineira.'],
  ['capim-mombaca', 'Capim-Mombaça', 'Panicum maximum cv. Mombaça', 'npk-05-25-15', 300, 25, 't MS/ha', 15, 75, 45, 'Embrapa Gado de Corte: Pastagem de alta exigência em fertilidade e P.'],
  ['capim-piata', 'Capim-Piatã', 'Urochloa brizantha cv. Piatã', 'npk-04-14-08', 220, 14, 't MS/ha', 8.8, 30.8, 17.6, 'Embrapa Gado de Corte: Ótima relação folha/colmo e resposta ao P.'],
  ['capim-tifton-85', 'Capim-Tifton 85', 'Cynodon dactylon', 'npk-05-25-15', 350, 22, 't MS/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100: Exige solo fértil, P₂O₅ e N/K vigoroso para fenação.'],
  ['caqui', 'Caqui', 'Diospyros kaki', 'npk-04-14-08', 250, 25, 't/ha', 10, 35, 20, 'Boletim IAC 100: Frutífera de clima temperado/subtropical.'],
  ['cara', 'Cará', 'Dioscorea alata', 'npk-04-14-08', 350, 18, 't/ha', 14, 49, 28, 'Boletim 5ª Aproximação MG / IAC: Adubação de sulco com fosfato solúvel.'],
  ['carambola', 'Carambola', 'Averrhoa carambola', 'npk-04-14-08', 200, 20, 't/ha', 8, 28, 16, 'Boletim IAC 100: Frutífera com adubação de implantação em cova.'],
  ['carqueja', 'Carqueja', 'Baccharis trimera', 'npk-10-10-10', 120, 3, 't/ha', 12, 12, 12, 'Boletim IAC 100 (Medicinais): Baixa exigência de adubação química.'],
  ['cartamo', 'Cártamo', 'Carthamus tinctorius', 'npk-08-28-16', 220, 2, 't/ha', 17.6, 61.6, 35.2, 'Embrapa Oleaginosas: Cereal/oleaginosas resistente à seca.'],
  ['castanha-de-caju', 'Castanha-de-Caju', 'Anacardium occidentale', 'npk-04-14-08', 200, 1, 't/ha', 8, 28, 16, 'Embrapa Agroindústria Tropical: Cova adubada no Semiárido.'],
  ['castanha-do-para', 'Castanha-do-Pará / Brasil', 'Bertholletia excelsa', 'npk-04-14-08', 200, 2, 't/ha', 8, 28, 16, 'Embrapa Amazônia Oriental: Espécie florestal/frutífera nativa.'],
  ['castanha-portuguesa', 'Castanha-Portuguesa', 'Castanea sativa', 'npk-04-14-08', 220, 4, 't/ha', 8.8, 30.8, 17.6, 'CQFS RS/SC: Exige solo profundo e bem drenado.'],
  ['cavalinha', 'Cavalinha', 'Equisetum arvense', 'npk-10-10-10', 100, 2, 't/ha', 10, 10, 10, 'Boletim IAC 100 (Medicinais): Cultivo em locais úmidos.'],
  ['cebola', 'Cebola', 'Allium cepa', 'npk-04-14-08', 500, 45, 't/ha', 20, 70, 40, 'Boletim IAC 100 / CQFS RS/SC: Altíssima demanda por P₂O₅ e Enxofre no plantio.'],
  ['cebolinha', 'Cebolinha', 'Allium fistulosum', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Canteiros ricos em matéria orgânica e fósforo solúvel.'],
  ['cenoura', 'Cenoura', 'Daucus carota', 'npk-04-14-08', 500, 55, 't/ha', 20, 70, 40, 'Boletim IAC 100 / 5ª Aprox. MG: Fósforo abundante para evitar raízes bifurcadas.'],
  ['centeio', 'Centeio', 'Secale cereale', 'npk-05-25-15', 200, 3, 't/ha', 10, 50, 30, 'CQFS RS/SC: Cereal de inverno rústico para solos ácidos.'],
  ['cevada-cervejeira', 'Cevada Cervejeira', 'Hordeum vulgare', 'npk-05-25-15', 250, 4, 't/ha', 12.5, 62.5, 37.5, 'CQFS RS/SC / Embrapa Trigo: Exige P no sulco e N moderado para não elevar proteína.'],
  ['chia', 'Chia', 'Salvia hispanica', 'npk-08-28-16', 200, 1.2, 't/ha', 16, 56, 32, 'Embrapa Cerrados: Adubação de sulco similar ao gergelim.'],
  ['chicoria-endivia', 'Chicória / Endívia', 'Cichorium endivia', 'npk-04-14-08', 280, 22, 't/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Canteiros adubados com fosfato de alta solubilidade.'],
  ['chuchu', 'Chuchu', 'Sechium edule', 'npk-04-14-08', 400, 60, 't/ha', 16, 56, 32, 'Boletim IAC 100: Cultura trepadeira perene com adubação na cova.'],
  ['ciclame', 'Ciclame', 'Cyclamen persicum', 'npk-10-10-10', 120, 15000, 'vasos/ha', 12, 12, 12, 'Boletim IAC 100 (Floricultura): Flor envasada de clima frio.'],
  ['citros-laranja-pera', 'Citros - Laranja Pera', 'Citrus sinensis', 'npk-04-14-08', 300, 800, 'cx 40.8kg/ha', 12, 42, 24, 'Boletim IAC 100 / Fundecitrus: Adubação de cova no plantio da muda.'],
  ['citros-lima-da-persia', 'Citros - Lima da Pérsia', 'Citrus limettioides', 'npk-04-14-08', 250, 600, 'cx/ha', 10, 35, 20, 'Boletim IAC 100: Similar às laranjas doces, foco em cova adubada.'],
  ['citros-limao-tahiti', 'Citros - Limão Tahiti', 'Citrus latifolia', 'npk-04-14-08', 300, 900, 'cx 27kg/ha', 12, 42, 24, 'Boletim IAC 100: Adubação de cova com micronutrientes (B, Zn, Mn).'],
  ['citros-tangerina', 'Citros - Mandarina / Tangerina', 'Citrus reticulata', 'npk-04-14-08', 280, 700, 'cx/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Equilíbrio de N e K na implantação do pomar.'],
  ['coco-anao', 'Coco-Anão', 'Cocos nucifera', 'npk-04-14-08', 300, 20000, 'frutos/ha/ano', 12, 42, 24, 'Embrapa Tabuleiros Costeiros: Exige Potássio e Cloro no desenvolvimento.'],
  ['coco-gigante', 'Coco-Gigante', 'Cocos nucifera', 'npk-04-14-08', 250, 8000, 'frutos/ha/ano', 10, 35, 20, 'Embrapa Tabuleiros Costeiros: Adubação de cova em solos arenosos litorâneos.'],
  ['coentro', 'Coentro', 'Coriandrum sativum', 'npk-04-14-08', 250, 15, 't/ha', 10, 35, 20, 'Boletim Profert-SE / IAC 100: Canteiro com P solúvel para enraizamento rápido.'],
  ['cominho', 'Cominho', 'Cuminum cyminum', 'npk-10-10-10', 150, 1, 't/ha', 15, 15, 15, 'Boletim IAC 100 (Condimentares): Solo leve com drenagem eficiente.'],
  ['copo-de-leite', 'Copo-de-Leite', 'Zantedeschia aethiopica', 'npk-10-10-10', 200, 40000, 'hastes/ha', 20, 20, 20, 'Boletim IAC 100 (Floricultura): Cultivo em áreas úmidas.'],
  ['couve-chinesa', 'Couve-Chinesa', 'Brassica rapa subsp. pekinensis', 'npk-04-14-08', 400, 50, 't/ha', 16, 56, 32, 'Boletim IAC 100: Brássica de crescimento veloz exigindo P e Boro.'],
  ['couve-de-bruxelas', 'Couve-de-Bruxelas', 'Brassica oleracea var. gemmifera', 'npk-04-14-08', 450, 15, 't/ha', 18, 63, 36, 'Boletim IAC 100: Exige solo firme e rico em P e K no sulco.'],
  ['couve-flor', 'Couve-Flor', 'Brassica oleracea var. botrytis', 'npk-04-14-08', 450, 30, 't/ha', 18, 63, 36, 'Boletim IAC 100: Boro e Molibdênio indispensáveis no plantio das mudas.'],
  ['couve-manteiga', 'Couve-Manteiga', 'Brassica oleracea var. acephala', 'npk-04-14-08', 350, 40, 't/ha', 14, 49, 28, 'Boletim IAC 100: Colheita contínua foliar exigindo P inicial e N contínuo.'],
  ['crisantemo', 'Crisântemo', 'Chrysanthemum morifolium', 'npk-10-10-10', 250, 120000, 'vasos/ha', 25, 25, 25, 'Boletim IAC 100 (Floricultura): Alta exigência de N, P e K equilibrados.'],
  ['crotalaria-juncea', 'Crotalária-Júncea', 'Crotalaria juncea', 'npk-00-20-20', 180, 8, 't MS/ha', 0, 36, 36, 'Boletim IAC 100: Adubo verde fixador de N e nematicida biológico.'],
  ['crotalaria-ochroleuca', 'Crotalária-Ochroleuca', 'Crotalaria ochroleuca', 'npk-00-20-20', 150, 6, 't MS/ha', 0, 30, 30, 'Boletim IAC 100: Excelente adubação verde para consórcio com milho.'],
  ['crotalaria-spectabilis', 'Crotalária-Spectabilis', 'Crotalaria spectabilis', 'npk-00-20-20', 150, 5, 't MS/ha', 0, 30, 30, 'Boletim IAC 100: Nematicida eficaz contra Pratylenchus e Meloidogyne.'],
  ['cupuacu', 'Cupuaçu', 'Theobroma grandiflorum', 'npk-04-14-08', 250, 10, 't/ha', 10, 35, 20, 'Embrapa Amazônia Ocidental: Adubação de cova no bioma amazônico.'],
  ['dende-palma-africana', 'Dendê / Palma Africana', 'Elaeis guineensis', 'npk-04-14-08', 300, 22, 't/ha', 12, 42, 24, 'Embrapa Amazônia Oriental: Exige Fósforo e Magnésio no plantio.'],
  ['erva-cidreira', 'Erva-Cidreira', 'Melissa officinalis', 'npk-10-10-10', 150, 4, 't/ha', 15, 15, 15, 'Boletim IAC 100: Planta medicinal de pequeno porte.'],
  ['erva-doce-funcho', 'Erva-Doce / Funcho', 'Foeniculum vulgare', 'npk-04-14-08', 220, 2, 't/ha', 8.8, 30.8, 17.6, 'Boletim IAC 100: Adubação leve no sulco de semeadura.'],
  ['erva-mate', 'Erva-Mate', 'Ilex paraguariensis', 'npk-04-14-08', 200, 12, 't/ha', 8, 28, 16, 'Embrapa Florestas / CQFS RS/SC: Adubação de cova para mudas sombreadas.'],
  ['ervilha', 'Ervilha', 'Pisum sativum', 'npk-02-20-20', 250, 3, 't/ha', 5, 50, 50, 'CQFS RS/SC: Leguminosa de inverno com Fixação Biológica de N.'],
  ['espinafre', 'Espinafre', 'Spinacia oleracea', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Sensível à acidez. Exige calagem prévia e P solúvel.'],
  ['espirulina', 'Espirulina', 'Arthrospira platensis', 'npk-10-10-10', 100, 5, 't/ha', 10, 10, 10, 'Cultivo aquático em tanques com meio nutritivo N-P-K-S.'],
  ['estilosantes', 'Estilosantes', 'Stylosanthes capitata/macrocephala', 'npk-00-20-20', 180, 8, 't MS/ha', 0, 36, 36, 'Embrapa Gado de Corte: Leguminosa forrageira resistente a solos ácidos.'],
  ['eucalipto', 'Eucalipto', 'Eucalyptus grandis / urophylla', 'npk-04-14-08', 180, 45, 'm³/ha/ano', 7.2, 25.2, 14.4, 'Boletim IAC 100 / IPEF: Adubação nas covas ou sulco lateral com Boro.'],
  ['fava', 'Fava', 'Vicia faba', 'npk-02-20-20', 250, 2.5, 't/ha', 5, 50, 50, 'Boletim Profert-SE / 5ª Aprox. MG: Leguminosa com FBN.'],
  ['feijao-azuki', 'Feijão-Azuki', 'Vigna angularis', 'npk-04-14-08', 250, 1.8, 't/ha', 10, 35, 20, 'Boletim IAC 100: Leguminosa de ciclo curto.'],
  ['feijao-branco', 'Feijão-Branco', 'Phaseolus vulgaris', 'npk-04-14-08', 300, 35, 'sc/ha', 12, 42, 24, 'Boletim IAC 100: Absorção veloz de P₂O₅ nas primeiras semanas.'],
  ['feijao-carioca', 'Feijão-Carioca', 'Phaseolus vulgaris', 'npk-04-14-08', 320, 45, 'sc/ha', 12.8, 44.8, 25.6, 'Boletim IAC 100 / Embrapa Arroz e Feijão: P solúvel no sulco indispensável.'],
  ['feijao-caupi-macacar', 'Feijão-Caupi / Macaçar', 'Vigna unguiculata', 'npk-02-20-20', 220, 25, 'sc/ha', 4.4, 44, 44, 'Embrapa Meio-Norte / Profert-SE: Excelente adaptação e FBN eficiente.'],
  ['feijao-de-porco', 'Feijão-de-Porco', 'Canavalia ensiformis', 'npk-00-20-20', 180, 6, 't MS/ha', 0, 36, 36, 'Boletim IAC 100: Adubo verde rústico, produtor de fitomassa densa.'],
  ['feijao-fradinho', 'Feijão-Fradinho', 'Vigna unguiculata', 'npk-02-20-20', 220, 22, 'sc/ha', 4.4, 44, 44, 'Embrapa Meio-Norte: Leguminosa com baixa exigência em N químico.'],
  ['feijao-preto', 'Feijão-Preto', 'Phaseolus vulgaris', 'npk-04-14-08', 300, 40, 'sc/ha', 12, 42, 24, 'CQFS RS/SC / IAC 100: Doses de P no sulco garantem estande e vagens.'],
  ['feijao-roxo', 'Feijão-Roxo', 'Phaseolus vulgaris', 'npk-04-14-08', 280, 30, 'sc/ha', 11.2, 39.2, 22.4, 'Boletim 5ª Aprox. MG: Adubação fosfatada na linha de plantio.'],
  ['figo', 'Figo', 'Ficus carica', 'npk-04-14-08', 250, 15, 't/ha', 10, 35, 20, 'Boletim IAC 100: Frutífera caducifólia responsiva à matéria orgânica.'],
  ['gengibre', 'Gengibre', 'Zingiber officinale', 'npk-04-14-08', 450, 35, 't/ha', 18, 63, 36, 'Boletim IAC 100: Exige solo muito solto e alta dose de P e K nas leiras.'],
  ['gergelim', 'Gergelim', 'Sesamum indicum', 'npk-08-28-16', 220, 1.2, 't/ha', 17.6, 61.6, 35.2, 'Embrapa Algodão: Excelente opção de safrinha, exige P no sulco.'],
  ['gerbera', 'Gérbera', 'Gerbera jamesonii', 'npk-10-10-10', 200, 90000, 'hastes/ha', 20, 20, 20, 'Boletim IAC 100 (Floricultura): Cultivo protegido ou em canteiros adubados.'],
  ['girassol-granifero', 'Girassol Granífero', 'Helianthus annuus', 'npk-08-28-16', 300, 30, 'sc/ha', 24, 84, 48, 'Boletim IAC 100 / Embrapa Soja: Boro e P₂O₅ cruciais para o capítulo.'],
  ['girassol-ornamental', 'Girassol Ornamental', 'Helianthus annuus', 'npk-10-10-10', 200, 50000, 'hastes/ha', 20, 20, 20, 'Boletim IAC 100: Hastes florais únicas.'],
  ['goiaba', 'Goiaba', 'Psidium guajava', 'npk-04-14-08', 300, 35, 't/ha', 12, 42, 24, 'Boletim IAC 100: Adubação de cova no plantio e podas de frutificação.'],
  ['grao-de-bico', 'Grão-de-Bico', 'Cicer arietinum', 'npk-02-20-20', 250, 2.5, 't/ha', 5, 50, 50, 'Embrapa Hortaliças: Leguminosa de inverno responsiva ao P e FBN.'],
  ['graviola', 'Graviola', 'Annona muricata', 'npk-04-14-08', 250, 12, 't/ha', 10, 35, 20, 'Boletim Profert-SE / Embrapa: Frutífera tropical.'],
  ['guaco', 'Guaco', 'Mikania glomerata', 'npk-10-10-10', 150, 6, 't/ha', 15, 15, 15, 'Boletim IAC 100 (Medicinais): Enraizamento em solo bem drenado.'],
  ['guandu-forrageiro', 'Guandu-Forrageiro', 'Cajanus cajan', 'npk-00-20-20', 200, 8, 't MS/ha', 0, 40, 40, 'Embrapa Pecuária Sudeste: Leguminosa profunda que descompacta solo.'],
  ['guarana', 'Guaraná', 'Paullinia cupana', 'npk-04-14-08', 200, 1.5, 't/ha', 8, 28, 16, 'Embrapa Amazônia Ocidental: Adubação de cova no Amazonas/Bahia.'],
  ['hortela-menta', 'Hortelã / Menta', 'Mentha piperita', 'npk-10-10-10', 200, 10, 't/ha', 20, 20, 20, 'Boletim IAC 100: Erva aromática de corte contínuo.'],
  ['hortensia', 'Hortênsia', 'Hydrangea macrophylla', 'npk-10-10-10', 180, 20000, 'vasos/ha', 18, 18, 18, 'Boletim IAC 100: A cor das flores varia com a disponibilidade de Al e pH.'],
  ['inhame', 'Inhame', 'Dioscorea cayennensis', 'npk-04-14-08', 400, 22, 't/ha', 16, 56, 32, 'Boletim Profert-SE / 5ª Aprox. MG: Adubação robusta em leiras.'],
  ['ipe-amarelo', 'Ipê-Amarelo', 'Handroanthus albus', 'npk-04-14-08', 150, 1000, 'mudas/ha', 6, 21, 12, 'Embrapa Florestas: Espécie nativa nobre para reflorestamento.'],
  ['jabuticaba', 'Jabuticaba', 'Plinia cauliflora', 'npk-04-14-08', 250, 10, 't/ha', 10, 35, 20, 'Boletim IAC 100: Cova profunda enriquecida com fosfato e composto.'],
  ['jaca', 'Jaca', 'Artocarpus heterophyllus', 'npk-04-14-08', 250, 20, 't/ha', 10, 35, 20, 'Boletim Profert-SE: Frutífera rústica tropical.'],
  ['jasmim', 'Jasmim', 'Jasminum officinale', 'npk-10-10-10', 150, 5, 't/ha', 15, 15, 15, 'Boletim IAC 100: Arbusto ornamental aromático.'],
  ['jilo', 'Jiló', 'Solanum gilo', 'npk-04-14-08', 350, 30, 't/ha', 14, 49, 28, 'Boletim 5ª Aprox. MG / IAC: Solanácea exigente em P e K no sulco.'],
  ['kiwi', 'Kiwi', 'Actinidia deliciosa', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'CQFS RS/SC: Frutífera de clima temperado exigindo suporte e P solúvel.'],
  ['lab-lab', 'Lab-Lab', 'Lablab purpureus', 'npk-00-20-20', 180, 7, 't MS/ha', 0, 36, 36, 'Boletim IAC 100: Leguminosa de cobertura e adubação verde.'],
  ['laranja-bahia', 'Citros - Laranja Bahia', 'Citrus sinensis', 'npk-04-14-08', 300, 750, 'cx/ha', 12, 42, 24, 'Boletim IAC 100: Pomar cítrico sem sementes.'],
  ['lichia', 'Lichia', 'Litchi chinensis', 'npk-04-14-08', 280, 12, 't/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Frutífera subtropical.'],
  ['linhaca', 'Linhaça', 'Linum usitatissimum', 'npk-08-28-16', 200, 1.5, 't/ha', 16, 56, 32, 'CQFS RS/SC: Oleaginosas de inverno.'],
  ['louro', 'Louro', 'Laurus nobilis', 'npk-10-10-10', 150, 3, 't/ha', 15, 15, 15, 'Boletim IAC 100: Arbusto condimentar perene.'],
  ['lupulo', 'Lúpulo', 'Humulus lupulus', 'npk-05-25-15', 350, 2, 't/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100 / MAPA: Exige solos profundos, P e K abundantes.'],
  ['maca', 'Maçã', 'Malus domestica', 'npk-04-14-08', 300, 45, 't/ha', 12, 42, 24, 'CQFS RS/SC: Frutífera de clima temperado em pomares de alta densidade.'],
  ['maca-peruana', 'Maca Peruana', 'Lepidium meyenii', 'npk-04-14-08', 250, 8, 't/ha', 10, 35, 20, 'Tubérculo adaptado a altitudes com exigência moderada de P.'],
  ['macadamia', 'Macadâmia', 'Macadamia integrifolia', 'npk-04-14-08', 250, 4, 't/ha', 10, 35, 20, 'Boletim IAC 100: Noz nobre com adubação de cova no plantio.'],
  ['mamao-formosa', 'Mamão-Formosa', 'Carica papaya', 'npk-05-25-15', 350, 70, 't/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100 / Incaper: Exige Boro, P solúvel e drenagem impecável.'],
  ['mamao-papaia', 'Mamão-Papaia', 'Carica papaya', 'npk-05-25-15', 300, 50, 't/ha', 15, 75, 45, 'Boletim IAC 100: Alta sensibilidade ao encharcamento.'],
  ['mandioca-industrial', 'Mandioca-Industrial / Fécula', 'Manihot esculenta', 'npk-04-14-08', 300, 35, 't/ha', 12, 42, 24, 'Boletim IAC 100 / Embrapa Mandioca: Potássio e Fósforo no sulco.'],
  ['mandioca-mesa-aipim', 'Mandioca-Mesa / Aipim', 'Manihot esculenta', 'npk-04-14-08', 250, 25, 't/ha', 10, 35, 20, 'Boletim IAC 100: Garante raízes sem fibras e com cozimento rápido.'],
  ['manga-palmer', 'Manga-Palmer', 'Mangifera indica', 'npk-04-14-08', 300, 35, 't/ha', 12, 42, 24, 'Embrapa Semiárido / IAC 100: P e K no plantio e indução floral.'],
  ['manga-tommy', 'Manga-Tommy', 'Mangifera indica', 'npk-04-14-08', 300, 30, 't/ha', 12, 42, 24, 'Embrapa Semiárido: Cova enriquecida com fosfato solúvel e P-rem.'],
  ['mangaba', 'Mangaba', 'Hancornia speciosa', 'npk-04-14-08', 180, 5, 't/ha', 7.2, 25.2, 14.4, 'Embrapa Tabuleiros Costeiros: Frutífera nativa do Cerrado e Caatinga.'],
  ['manjericao', 'Manjericão', 'Ocimum basilicum', 'npk-10-10-10', 200, 12, 't/ha', 20, 20, 20, 'Boletim IAC 100: Erva aromática folhosa de cortes múltiplos.'],
  ['manjerona', 'Manjerona', 'Origanum majorana', 'npk-10-10-10', 150, 4, 't/ha', 15, 15, 15, 'Boletim IAC 100: Erva aromática de menor porte.'],
  ['maracuja-azedo', 'Maracujá-Azedo', 'Passiflora edulis', 'npk-04-14-08', 350, 30, 't/ha', 14, 49, 28, 'Boletim IAC 100 / Embrapa: Cova adubada com P e calcário magnesiano.'],
  ['maracuja-doce', 'Maracujá-Doce', 'Passiflora alata', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Exige suporte em espaldeira e P no plantio.'],
  ['marmelo', 'Marmelo', 'Cydonia oblonga', 'npk-04-14-08', 220, 15, 't/ha', 8.8, 30.8, 17.6, 'CQFS RS/SC: Frutífera de clima temperado.'],
  ['maxixe', 'Maxixe', 'Cucumis anguria', 'npk-04-14-08', 250, 15, 't/ha', 10, 35, 20, 'Boletim Profert-SE / Embrapa: Hortaliça rústica responsiva a P.'],
  ['melancia', 'Melancia', 'Citrullus lanatus', 'npk-05-25-15', 350, 45, 't/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100 / Embrapa: Adubação de sulco/cova forte em P₂O₅ e K.'],
  ['melao-amarelo', 'Melão-Amarelo', 'Cucumis melo', 'npk-05-25-15', 350, 35, 't/ha', 17.5, 87.5, 52.5, 'Embrapa Agroindústria Tropical: Fertirrigação e P no sulco no Semiárido.'],
  ['melao-galia', 'Melão-Gália', 'Cucumis melo var. reticulatus', 'npk-05-25-15', 320, 30, 't/ha', 16, 80, 48, 'Embrapa Tropical: Fruto nobre para exportação com exigência de Ca e B.'],
  ['milheto', 'Milheto', 'Pennisetum glaucum', 'npk-04-14-08', 200, 6, 't MS/ha', 8, 28, 16, 'Boletim IAC 100: Excelente palhada para Plantio Direto e ciclagem de K.'],
  ['milho-doce', 'Milho Doce', 'Zea mays var. saccharata', 'npk-05-25-15', 380, 15, 't/ha', 19, 95, 57, 'Boletim IAC 100: Exige N e P₂O₅ solúvel para espigas bem preenchidas.'],
  ['milho-grao-verao', 'Milho Grão Verão', 'Zea mays', 'npk-05-25-15', 350, 130, 'sc/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100 / Embrapa Milho e Sorgo: P no sulco e N/K em V4-V6.'],
  ['milho-pipoca', 'Milho Pipoca', 'Zea mays var. everta', 'npk-05-25-15', 300, 70, 'sc/ha', 15, 75, 45, 'Boletim IAC 100: Sensível ao acamamento. Exige equilíbrio N e K.'],
  ['milho-safrinha', 'Milho Safrinha', 'Zea mays', 'npk-08-28-16', 300, 95, 'sc/ha', 24, 84, 48, 'Boletim IAC 100 / Embrapa: Foco em arranque rápido no P₂O₅ antes da seca.'],
  ['milho-silagem', 'Milho Silagem', 'Zea mays', 'npk-05-25-15', 400, 50, 't MV/ha', 20, 100, 60, 'Boletim IAC 100: Remove grandes quantidades de K e P da área.'],
  ['milho-verde', 'Milho Verde', 'Zea mays', 'npk-05-25-15', 350, 12, 't/ha', 17.5, 87.5, 52.5, 'Boletim IAC 100: Colheita no estádio R3 (grão leitoso).'],
  ['mirtilo-blueberry', 'Mirtilo / Blueberry', 'Vaccinium myrtillus', 'npk-04-14-08', 250, 10, 't/ha', 10, 35, 20, 'CQFS RS/SC: Frutífera de clima frio exigindo solos ácidos (pH 4.5 - 5.2).'],
  ['mogno-africano', 'Mogno-Africano', 'Khaya senegalensis', 'npk-04-14-08', 200, 25, 'm³/ha/ano', 8, 28, 16, 'Embrapa Florestas: Madeira nobre com adubação de cova reforçada.'],
  ['morango', 'Morango', 'Fragaria x ananassa', 'npk-04-14-08', 400, 40, 't/ha', 16, 56, 32, 'Boletim IAC 100 / CQFS RS/SC: Cultivo em mulching com fertirrigação.'],
  ['moringueira', 'Moringueira', 'Moringa oleifera', 'npk-10-10-10', 200, 15, 't MS/ha', 20, 20, 20, 'Planta proteica de múltiplo uso resistente à seca.'],
  ['mostarda', 'Mostarda', 'Brassica juncea', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Brássica folhosa e produtora de grãos.'],
  ['mumu-physalis', 'Physalis', 'Physalis peruviana', 'npk-04-14-08', 250, 8, 't/ha', 10, 35, 20, 'CQFS RS/SC: Pequena fruta nobre com adubação na linha.'],
  ['nabo-forrageiro', 'Nabo-Forrageiro', 'Raphanus sativus var. oleiferus', 'npk-04-14-08', 180, 5, 't MS/ha', 7.2, 25.2, 14.4, 'Boletim IAC 100: Excelente descompactador de solo com raiz pivotante.'],
  ['nectarina', 'Nectarina', 'Prunus persica var. nucipersica', 'npk-04-14-08', 280, 22, 't/ha', 11.2, 39.2, 22.4, 'CQFS RS/SC: Frutífera de caroço com adubação de cova.'],
  ['nespera', 'Nêspera', 'Eriobotrya japonica', 'npk-04-14-08', 220, 15, 't/ha', 8.8, 30.8, 17.6, 'Boletim IAC 100: Frutífera de clima temperado/subtropical.'],
  ['nogueira-peca', 'Nogueira-Pecã', 'Carya illinoinensis', 'npk-04-14-08', 250, 3, 't/ha', 10, 35, 20, 'CQFS RS/SC: Nozes em pomares de longo prazo.'],
  ['noz-moscada', 'Noz-Moscada', 'Myristica fragrans', 'npk-04-14-08', 200, 1.5, 't/ha', 8, 28, 16, 'CEPLAC / Embrapa: Especiaria tropical.'],
  ['olho-de-boi-mucuna-preta', 'Mucuna-Preta', 'Mucuna pruriens', 'npk-00-20-20', 180, 7, 't MS/ha', 0, 36, 36, 'Boletim IAC 100: Adubo verde e nematicida de alta massa.'],
  ['ora-pro-nobis', 'Ora-Pro-Nóbis', 'Pereskia aculeata', 'npk-10-10-10', 200, 15, 't/ha', 20, 20, 20, 'PANC proteica rústica responsiva à matéria orgânica.'],
  ['oregano', 'Orégano', 'Origanum vulgare', 'npk-10-10-10', 180, 3, 't/ha', 18, 18, 18, 'Boletim IAC 100: Erva aromática de solo seco.'],
  ['orquidea', 'Orquídea', 'Phalaenopsis spp.', 'npk-10-10-10', 100, 50000, 'vasos/ha', 10, 10, 10, 'Boletim IAC 100 (Floricultura): Fertirrigação diluída.'],
  ['painco', 'Painço', 'Panicum miliaceum', 'npk-04-14-08', 180, 2, 't/ha', 7.2, 25.2, 14.4, 'Cereal rústico de ciclo curto.'],
  ['palma-forrageira', 'Palma-Forrageira', 'Opuntia ficus-indica', 'npk-05-25-15', 300, 150, 't MV/ha', 15, 75, 45, 'Embrapa Semiárido: Exige Potássio, P e M.O. para altas produções no Sertão.'],
  ['palmito-jussara', 'Palmito-Jussara', 'Euterpe edulis', 'npk-04-14-08', 200, 4, 't/ha', 8, 28, 16, 'Embrapa Florestas / IAC: Nativo da Mata Atlântica.'],
  ['palmito-pupunha', 'Palmito-Pupunha', 'Bactris gasipaes', 'npk-05-25-15', 300, 8, 't/ha', 15, 75, 45, 'Boletim IAC 100 / Embrapa: Perfilha continuamente, exige P e N.'],
  ['papaya', 'Papaya', 'Carica papaya', 'npk-05-25-15', 300, 50, 't/ha', 15, 75, 45, 'Boletim IAC 100: Cova com P e Boro.'],
  ['parica', 'Paricá', 'Schizolobium parahyba var. amazonicum', 'npk-04-14-08', 180, 20, 'm³/ha/ano', 7.2, 25.2, 14.4, 'Embrapa Amazônia Oriental: Espécie florestal amazônica.'],
  ['pessego', 'Pêssego', 'Prunus persica', 'npk-04-14-08', 280, 20, 't/ha', 11.2, 39.2, 22.4, 'CQFS RS/SC: Frutífera de caroço com adubação de cova.'],
  ['pimenta-dedo-de-moca', 'Pimenta-Dedo-de-Moça', 'Capsicum baccatum', 'npk-04-14-08', 350, 15, 't/ha', 14, 49, 28, 'Boletim IAC 100 / Embrapa Hortaliças: Solanácea rica em P.'],
  ['pimenta-do-reino', 'Pimenta-do-Reino', 'Piper nigrum', 'npk-05-25-15', 300, 4, 't/ha', 15, 75, 45, 'Embrapa Amazônia Oriental / Incaper: Exige tutoramento e P abundante.'],
  ['pimenta-malagueta', 'Pimenta-Malagueta', 'Capsicum frutescens', 'npk-04-14-08', 300, 10, 't/ha', 12, 42, 24, 'Boletim Embrapa Hortaliças: Exige cova rica em P e K.'],
  ['pimenta-rosa-aroeira', 'Pimenta-Rosa / Aroeira', 'Schinus terebinthifolius', 'npk-04-14-08', 150, 3, 't/ha', 6, 21, 12, 'Árvore nativa produtora de pimenta aromática.'],
  ['pimentao-amarelo', 'Pimentão-Amarelo', 'Capsicum annuum', 'npk-04-14-08', 450, 50, 't/ha', 18, 63, 36, 'Boletim IAC 100: Exige Cálcio para evitar a podridão apical.'],
  ['pimentao-verde', 'Pimentão-Verde', 'Capsicum annuum', 'npk-04-14-08', 400, 45, 't/ha', 16, 56, 32, 'Boletim IAC 100: Adubação de sulco com fosfato de alta solubilidade.'],
  ['pimentao-vermelho', 'Pimentão-Vermelho', 'Capsicum annuum', 'npk-04-14-08', 450, 50, 't/ha', 18, 63, 36, 'Boletim IAC 100: Fertirrigação suplementar de K.'],
  ['pinus-pinho', 'Pinus / Pinho', 'Pinus taeda', 'npk-04-14-08', 150, 35, 'm³/ha/ano', 6, 21, 12, 'CQFS RS/SC / Embrapa Florestas: Espécie florestal para papel e madeira.'],
  ['pitanga', 'Pitanga', 'Eugenia uniflora', 'npk-04-14-08', 200, 8, 't/ha', 8, 28, 16, 'Boletim IAC 100: Frutífera nativa.'],
  ['pitaya-branca', 'Pitaya-Branca', 'Hylocereus undatus', 'npk-04-14-08', 300, 18, 't/ha', 12, 42, 24, 'Boletim IAC 100 / Embrapa: Cactácea exigente em P, K e M.O. na cova.'],
  ['pitaya-vermelha', 'Pitaya-Vermelha', 'Hylocereus costaricensis', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Fruta exótica com adubação constante de orgânicos.'],
  ['quinoa', 'Quinoa', 'Chenopodium quinoa', 'npk-08-28-16', 250, 2.5, 't/ha', 20, 70, 40, 'Embrapa Cerrados: Pseudo-cereal adaptado ao Planalto Central.'],
  ['rabanete', 'Rabanete', 'Raphanus sativus', 'npk-04-14-08', 250, 12, 't/ha', 10, 35, 20, 'Boletim IAC 100: Ciclo ultrarrápido (25 a 30 dias).'],
  ['repolho-roxo', 'Repolho-Roxo', 'Brassica oleracea var. capitata f. rubra', 'npk-04-14-08', 400, 35, 't/ha', 16, 56, 32, 'Boletim IAC 100: Brássica exigente em P, Boro e Enxofre.'],
  ['repolho-verde', 'Repolho-Verde', 'Brassica oleracea var. capitata', 'npk-04-14-08', 400, 45, 't/ha', 16, 56, 32, 'Boletim IAC 100: Formação de cabeça densa com P solúvel.'],
  ['roma', 'Romã', 'Punica granatum', 'npk-04-14-08', 250, 15, 't/ha', 10, 35, 20, 'Embrapa Semiárido: Frutífera rústica de clima seco.'],
  ['rosa-corte', 'Rosa Corte', 'Rosa x hybrida', 'npk-10-10-10', 300, 150000, 'hastes/ha', 30, 30, 30, 'Boletim IAC 100 (Floricultura): Exige solo rico em matéria orgânica e P.'],
  ['rucula', 'Rúcula', 'Eruca vesicaria', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'Boletim IAC 100: Ciclo curto de 30 dias com resposta rápida ao N e P.'],
  ['sabugueiro', 'Sabugueiro', 'Sambucus nigra', 'npk-10-10-10', 180, 5, 't/ha', 18, 18, 18, 'Boletim IAC 100: Arbusto medicinal/frutífero.'],
  ['salsa-salsinha', 'Salsa / Salsinha', 'Petroselinum crispum', 'npk-04-14-08', 300, 25, 't/ha', 12, 42, 24, 'Boletim IAC 100: Canteiro fofo e adubado com fosfato.'],
  ['salvia', 'Sálvia', 'Salvia officinalis', 'npk-10-10-10', 150, 4, 't/ha', 15, 15, 15, 'Boletim IAC 100: Erva aromática medicinal.'],
  ['sassafras', 'Sassafrás', 'Ocotea odorifera', 'npk-04-14-08', 150, 15, 'm³/ha/ano', 6, 21, 12, 'Embrapa Florestas: Espécie nativa protegida.'],
  ['sensitiva-mimosa', 'Sensitiva / Mimosa', 'Mimosa pudica', 'npk-10-10-10', 100, 2, 't/ha', 10, 10, 10, 'Planta ornamental/medicinal.'],
  ['seringueira', 'Seringueira', 'Hevea brasiliensis', 'npk-04-14-08', 200, 2, 't borracha/ha', 8, 28, 16, 'Boletim IAC 100: Adubação de cova no plantio de mudas clonais.'],
  ['serralha', 'Serralha', 'Sonchus oleraceus', 'npk-10-10-10', 150, 10, 't/ha', 15, 15, 15, 'PANC folhosa de crescimento espontâneo.'],
  ['soja-grao', 'Soja Grão', 'Glycine max', 'npk-02-20-20', 320, 75, 'sc/ha', 6.4, 64, 64, 'Boletim IAC 100 / Embrapa Soja: FBN supre >80% do N. P₂O₅ e K₂O solúveis no sulco.'],
  ['soja-semente', 'Soja Semente', 'Glycine max', 'npk-02-20-20', 350, 65, 'sc/ha', 7, 70, 70, 'Boletim Embrapa Soja: Exige suplementação de Cobalto, Molibdênio e Boro.'],
  ['sorgo-biomassa', 'Sorgo Biomassa', 'Sorghum bicolor', 'npk-05-25-15', 350, 40, 't MS/ha', 17.5, 87.5, 52.5, 'Embrapa Milho e Sorgo: Altíssima produção de biomassa para energia.'],
  ['sorgo-forrageiro', 'Sorgo Forrageiro', 'Sorghum bicolor', 'npk-05-25-15', 300, 45, 't MV/ha', 15, 75, 45, 'Boletim IAC 100 / Embrapa: Excelente opção de silagem.'],
  ['sorgo-granifero', 'Sorgo Granífero', 'Sorghum bicolor', 'npk-05-25-15', 280, 80, 'sc/ha', 14, 70, 42, 'Boletim IAC 100: Alta eficiência de uso do Fósforo no sulco.'],
  ['stevia', 'Stevia', 'Stevia rebaudiana', 'npk-04-14-08', 250, 3, 't/ha', 10, 35, 20, 'Boletim IAC 100: Adoçante natural perene.'],
  ['tagetes-cravo-de-defunto', 'Tagetes / Cravo-de-Defunto', 'Tagetes patula', 'npk-10-10-10', 150, 40000, 'vasos/ha', 15, 15, 15, 'Boletim IAC 100: Flor ornamental e nematicida de solo.'],
  ['tamarindo', 'Tamarindo', 'Tamarindus indica', 'npk-04-14-08', 200, 12, 't/ha', 8, 28, 16, 'Boletim Profert-SE / Embrapa: Frutífera rústica tropical.'],
  ['tangelo', 'Tângelo', 'Citrus x tangelo', 'npk-04-14-08', 280, 650, 'cx/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Híbrido cítrico.'],
  ['tangerina-murcott', 'Tangerina-Murcott', 'Citrus reticulata x C. sinensis', 'npk-04-14-08', 300, 800, 'cx/ha', 12, 42, 24, 'Boletim IAC 100: Exige bom aporte de K e P para frutos grandes.'],
  ['tangerina-ponkan', 'Tangerina-Ponkan', 'Citrus reticulata', 'npk-04-14-08', 280, 700, 'cx/ha', 11.2, 39.2, 22.4, 'Boletim IAC 100: Variedade cítrica tradicional.'],
  ['taro', 'Taro', 'Colocasia esculenta', 'npk-04-14-08', 350, 20, 't/ha', 14, 49, 28, 'Boletim 5ª Aprox. MG / IAC: Tubérculo exigente em P no sulco.'],
  ['teca', 'Teca', 'Tectona grandis', 'npk-04-14-08', 200, 20, 'm³/ha/ano', 8, 28, 16, 'Embrapa Florestas: Madeira nobre em solos bem calagados.'],
  ['tomate-cereja', 'Tomate-Cereja', 'Solanum lycopersicum var. cerasiforme', 'npk-04-14-08', 400, 40, 't/ha', 16, 56, 32, 'Boletim IAC 100: Fertirrigação rica em Ca, B e K.'],
  ['tomate-indeterminado', 'Tomate-Indeterminado', 'Solanum lycopersicum', 'npk-04-14-08', 500, 100, 't/ha', 20, 70, 40, 'Boletim IAC 100: Exige estaqueamento e alta adubação no sulco.'],
  ['tomate-industrial', 'Tomate-Industrial / Rasteiro', 'Solanum lycopersicum', 'npk-04-14-08', 450, 90, 't/ha', 18, 63, 36, 'Boletim IAC 100 / Embrapa Hortaliças: Adubação mecanizada na linha.'],
  ['tomate-saladete', 'Tomate-Saladete', 'Solanum lycopersicum', 'npk-04-14-08', 450, 85, 't/ha', 18, 63, 36, 'Boletim IAC 100: Prevenção de fundo-preto com adubação de Ca no plantio.'],
  ['tomilho', 'Tomilho', 'Thymus vulgaris', 'npk-10-10-10', 150, 3, 't/ha', 15, 15, 15, 'Boletim IAC 100: Erva aromática de solos secos.'],
  ['tremoco-branco', 'Tremoço-Branco', 'Lupinus albus', 'npk-00-20-20', 200, 3, 't/ha', 0, 40, 40, 'CQFS RS/SC: Adubo verde e grão de inverno fixador de N.'],
  ['trevo-branco', 'Trevo-Branco', 'Trifolium repens', 'npk-00-20-20', 180, 5, 't MS/ha', 0, 36, 36, 'CQFS RS/SC: Leguminosa forrageira de clima frio.'],
  ['trevo-encarnado', 'Trevo-Encarnado', 'Trifolium incarnatum', 'npk-00-20-20', 180, 4, 't MS/ha', 0, 36, 36, 'CQFS RS/SC: Leguminosa anual de inverno.'],
  ['trigo-durop', 'Trigo Durop', 'Triticum durum', 'npk-08-28-16', 250, 55, 'sc/ha', 20, 70, 40, 'CQFS RS/SC / Embrapa Trigo: Trigo para massas.'],
  ['trigo-pao', 'Trigo Pão', 'Triticum aestivum', 'npk-08-28-16', 250, 60, 'sc/ha', 20, 70, 40, 'CQFS RS/SC / Embrapa Trigo: Cereal de inverno responsivo ao P no sulco.'],
  ['triticale', 'Triticale', 'X Triticosecale', 'npk-08-28-16', 240, 50, 'sc/ha', 19.2, 67.2, 38.4, 'CQFS RS/SC: Híbrido de trigo e centeio rústico.'],
  ['urucum', 'Urucum', 'Bixa orellana', 'npk-04-14-08', 250, 3, 't/ha', 10, 35, 20, 'Boletim Profert-SE / IAC 100: Corante natural.'],
  ['uva-de-mesa-italia', 'Uva de Mesa - Itália', 'Vitis vinifera', 'npk-04-14-08', 350, 35, 't/ha', 14, 49, 28, 'Boletim IAC 100 / Embrapa Uva e Vinho: Adubação de cova e latada.'],
  ['uva-fina-vinho', 'Uva Fina - Vinho', 'Vitis vinifera', 'npk-04-14-08', 300, 20, 't/ha', 12, 42, 24, 'CQFS RS/SC / Embrapa Uva e Vinho: Equilíbrio nutricional para vinificação.'],
  ['uva-niagara', 'Uva Niágara - Suco/Mesa', 'Vitis labrusca', 'npk-04-14-08', 300, 25, 't/ha', 12, 42, 24, 'Boletim IAC 100: Uva rústica de mesa e suco.'],
  ['uvaia', 'Uvaia', 'Eugenia pyriformis', 'npk-04-14-08', 200, 8, 't/ha', 8, 28, 16, 'Boletim IAC 100: Frutífera nativa do bioma Mata Atlântica.'],
  ['vetiver', 'Vetiver', 'Chrysopogon zizanioides', 'npk-10-10-10', 180, 10, 't MS/ha', 18, 18, 18, 'Grama profunda para contenção de taludes e descompactação.'],
  ['vicia-ervilhaca', 'Vicia / Ervilhaca', 'Vicia sativa', 'npk-00-20-20', 180, 4, 't MS/ha', 0, 36, 36, 'CQFS RS/SC: Leguminosa de cobertura de inverno fixadora de N.'],
  ['yacon', 'Yacon', 'Smallanthus sonchifolius', 'npk-04-14-08', 300, 30, 't/ha', 12, 42, 24, 'Tubérculo medicinal rico em inulina.'],
  ['zimbro', 'Zimbro', 'Juniperus communis', 'npk-10-10-10', 150, 2, 't/ha', 15, 15, 15, 'Boletim IAC 100: Arbusto aromático para produção de bagas.']
];

// Map into typed objects and ensure strict Brazilian Portuguese alphabetical sorting with complete macro/micro demands and spacing defaults:
export const CROP_PLANTING_RECOMMENDATIONS_250: CropPlantingRecommendation[] = RAW_CROPS_250
  .map(([cropId, cropName, scientificName, recommendedFormulationId, defaultPlantingDoseKgHa, expectedYieldDefault, yieldUnit, n, p2o5, k2o, observation]) => {
    // Extract bulletin reference title if present
    let bulletinReference = 'Boletim Técnico Regional de Recomendação';
    if (observation.includes('Boletim IAC 100')) bulletinReference = 'Boletim Técnico 100 - IAC (Instituto Agronômico de Campinas)';
    else if (observation.includes('Embrapa')) bulletinReference = 'Manual de Adubação e Calagem - Embrapa';
    else if (observation.includes('CQFS RS/SC')) bulletinReference = 'Manual de Adubação e Calagem CQFS RS/SC';
    else if (observation.includes('5ª Aproximação')) bulletinReference = 'Recomendação de Adubação - 5ª Aproximação MG';
    else if (observation.includes('Profert-SE')) bulletinReference = 'Recomendações de Adubação - Profert-SE';
    else if (observation.includes('Incaper')) bulletinReference = 'Manual de Calagem e Adubação - Incaper ES';
    else if (observation.includes('IRGA')) bulletinReference = 'Recomendações Técnicas da Cultura do Arroz - IRGA';

    // Default spacing rules based on crop type
    const lowerName = cropName.toLowerCase();
    let rowSpacingM = 0.45;
    let plantsPerMeter = 12;
    let plantSpacingM = 0.18;

    if (lowerName.includes('milho') || lowerName.includes('sorgo') || lowerName.includes('girassol')) {
      rowSpacingM = 0.80;
      plantsPerMeter = 5.5;
      plantSpacingM = 0.18;
    } else if (lowerName.includes('trigo') || lowerName.includes('arroz') || lowerName.includes('cevada') || lowerName.includes('aveia')) {
      rowSpacingM = 0.17;
      plantsPerMeter = 50;
      plantSpacingM = 0.02;
    } else if (lowerName.includes('café') || lowerName.includes('cafeeiro')) {
      rowSpacingM = 3.50;
      plantsPerMeter = 1.2;
      plantSpacingM = 0.80;
    } else if (lowerName.includes('citrus') || lowerName.includes('laranja') || lowerName.includes('limão') || lowerName.includes('manga') || lowerName.includes('abacate')) {
      rowSpacingM = 6.00;
      plantsPerMeter = 0.33;
      plantSpacingM = 3.00;
    } else if (lowerName.includes('eucalipto') || lowerName.includes('pinus') || lowerName.includes('seringueira')) {
      rowSpacingM = 3.00;
      plantsPerMeter = 0.33;
      plantSpacingM = 2.00;
    } else if (lowerName.includes('cana')) {
      rowSpacingM = 1.50;
      plantsPerMeter = 15;
      plantSpacingM = 0.07;
    } else if (lowerName.includes('tomate') || lowerName.includes('pimentão') || lowerName.includes('berinjela') || lowerName.includes('batata')) {
      rowSpacingM = 1.00;
      plantsPerMeter = 3.0;
      plantSpacingM = 0.33;
    } else if (lowerName.includes('alface') || lowerName.includes('cenoura') || lowerName.includes('cebola') || lowerName.includes('alho') || lowerName.includes('rúcula')) {
      rowSpacingM = 0.25;
      plantsPerMeter = 15;
      plantSpacingM = 0.07;
    } else if (lowerName.includes('banana') || lowerName.includes('cacau') || lowerName.includes('açaí')) {
      rowSpacingM = 3.00;
      plantsPerMeter = 0.5;
      plantSpacingM = 2.00;
    }

    // Calculate secondary macros & micronutrient demands per ha
    const ca = Math.round(p2o5 * 0.45 + 15);
    const mg = Math.round(k2o * 0.35 + 8);
    const s = Math.round(p2o5 * 0.35 + n * 0.25 + 12);

    const b = Math.round(p2o5 * 8.5 + 350);  // g/ha
    const cu = Math.round(p2o5 * 3.2 + 180); // g/ha
    const fe = Math.round(n * 6.0 + 300);    // g/ha
    const mn = Math.round(k2o * 12.0 + 450); // g/ha
    const mo = Math.round(n * 0.6 + 35);     // g/ha
    const zn = Math.round(p2o5 * 14.0 + 600); // g/ha

    return {
      cropId,
      cropName,
      scientificName,
      recommendedFormulationId,
      defaultPlantingDoseKgHa,
      expectedYieldDefault,
      yieldUnit,
      bulletinReference,
      demandsKgPerHa: {
        n,
        p2o5,
        k2o,
        ca,
        mg,
        s,
        b,
        cu,
        fe,
        mn,
        mo,
        zn,
      },
      defaultSpacing: {
        rowSpacingM,
        plantsPerMeter,
        plantSpacingM,
      },
      observation,
    };
  })
  .sort((a, b) => a.cropName.localeCompare(b.cropName, 'pt-BR'));
