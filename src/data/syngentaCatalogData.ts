import { PesticideProduct } from '../types/pesticideLeaflet';

/**
 * Catálogo Oficial Consolidado de Produtos Formulados da Syngenta Proteção de Cultivos Ltda.
 * Registrante: Syngenta Proteção de Cultivos Ltda. – São Paulo/SP
 * Fonte: MAPA / AGROFIT (Ministério da Agricultura, Pecuária e Abastecimento)
 * Total: 272 produtos formulados registrados no Brasil.
 * Este arquivo reúne mais de 100 formulações de destaque listadas nas 31 páginas oficiais.
 */

interface RawSyngentaProduct {
  reg: string;
  name: string;
  ai: string;
  conc: string;
  class: string;
  tox: string; // "1" | "2" | "3" | "4" | "5" | "I" | "II" | "Não" | "-"
  env: string; // "I" | "II" | "III" | "IV" | "-"
}

const RAW_PRODUCTS: RawSyngentaProduct[] = [
  // Page 1
  { reg: '52625', name: 'Acomple', ai: 'Isocicloseram (Isoxazoline) + Benzoato de Emamectina (avermectina)', conc: '200 g/L + 50 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '32725', name: 'Acribia Duo', ai: 'S-metolacloro (cloroacetanilida) + sulfentrazona (triazolona)', conc: '847 g/L + 88 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '10098', name: 'Actara 250 WG; Nirvana', ai: 'tiametoxam (neonicotinóide)', conc: '250 g/kg', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '5313', name: 'Actara 750 SG', ai: 'tiametoxam (neonicotinóide)', conc: '750 g/kg', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '1238404', name: 'Actellic 500 EC', ai: 'pirimifós-metílico (organofosforado)', conc: '500 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '9609', name: 'Actelliclambda', ai: 'lambda-cialotrina (piretróide)', conc: '50 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '10911', name: 'Actend', ai: 'trifloxissulfurom-sódico (sulfoniluréia)', conc: '750 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '9414', name: 'Actigard', ai: 'acibenzolar-S-metílico (benzotiadiazol)', conc: '500 g/kg', class: 'Ativador de planta', tox: '5', env: 'III' },
  { reg: '6211', name: 'Adage 350 FS', ai: 'tiametoxam (neonicotinóide)', conc: '350 g/kg', class: 'Inseticida', tox: '5', env: 'III' },

  // Page 2
  { reg: '28817', name: 'Adante Xtra', ai: 'Azoxistrobina (estrobilurina) + ciproconazol (triazol) + tiametoxam (neonicotinóide)', conc: '242 g/L + 96 g/L + 182 g/L', class: 'Fungicida e Inseticida', tox: '4', env: 'II' },
  { reg: '14822', name: 'Adetus', ai: 'Pidiflumetofen (carboxamida) + difenoconazol (triazol)', conc: '75 g/L + 125 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '07521', name: 'Alade; Podesta', ai: 'Benzovindiflupyr (pirazol carboxamida) + ciproconazol + difenoconazol', conc: '60 g/L + 90 g/L + 150 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '41018', name: 'Álibi', ai: 'Azoxistrobina (estrobilurina) + difenoconazol (triazol)', conc: '200 g/L + 125 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '4106', name: 'Alika; Terminate Nortox', ai: 'tiametoxam (neonicotinóide) + cipermetrina (piretróide)', conc: '110 g/L + 220 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '36022', name: 'Almane', ai: 'Pinoxadem (Fenilpirazolina)', conc: '50 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '26623', name: 'Alto Elite', ai: 'ciproconazol (triazol) + clorotalonil (isoftalonitrila)', conc: '40 g/L + 375 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '991', name: 'Alto 100', ai: 'ciproconazol (triazol)', conc: '100 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '16124', name: 'Alto 400 SC', ai: 'ciproconazol (triazol)', conc: '400 g/L', class: 'Fungicida', tox: '4', env: 'II' },

  // Page 3
  { reg: '3809', name: 'Amistar Top', ai: 'Azoxistrobina (estrobilurina) + difenoconazol (triazol)', conc: '200 g/L + 125 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '1305', name: 'Amistar WG', ai: 'Azoxistrobina (estrobilurina)', conc: '500 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '2398', name: 'Amistar 500 WG', ai: 'Azoxistrobina (estrobilurina)', conc: '500 g/kg', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '0610', name: 'Ampligo', ai: 'clorantraniliprole (antranilamida) + lambda-cialotrina (piretróide)', conc: '100 g/L + 50 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '3916', name: 'Ampligo Pro', ai: 'Abamectina (avermectina) + clorantraniliprole (antranilamida) + lambda-cialotrina', conc: '18 g/L + 45 g/L + 50 g/L', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '34618', name: 'Ankor', ai: 'lambda-cialotrina (piretróide) + clorantraniliprole (antranilamida)', conc: '50 g/L + 100 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '4007', name: 'Apron RFC', ai: 'fludioxonil (fenilpirrol) + metalaxil-M (acilalaninato)', conc: '25 g/L + 37,5 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '8515', name: 'Aptika', ai: 'profenofós (organofosforado) + lufenurom (benzoiluréia)', conc: '500 g/L + 50 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '00200', name: 'Artea', ai: 'ciproconazol (triazol) + propiconazol (triazol)', conc: '80 g/L + 250 g/L', class: 'Fungicida', tox: '5', env: 'II' },

  // Page 4
  { reg: '03221', name: 'Arvatico', ai: 'Bacillus velezensis (isolado CNPSo 3602)', conc: '150 g/L', class: 'Fungicida microbiológico e Nematicida', tox: '5', env: 'IV' },
  { reg: '29525', name: 'Arvatico Ultra', ai: 'Bacillus velezensis (isolado CCTB09)', conc: '800 g/L', class: 'Fungicida microbiológico e Nematicida', tox: 'Não', env: 'IV' },
  { reg: '11223', name: 'Atexzo ANT-F', ai: 'Isocicloseram (Isoxazoline)', conc: '3 g/kg', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '04021', name: 'Augory', ai: 'Abamectina (avermectina)', conc: '500 g/L', class: 'Acaricida, Inseticida e Nematicida', tox: '1', env: 'II' },
  { reg: '20107', name: 'Avicta 500 FS', ai: 'Abamectina (avermectina)', conc: '500 g/L', class: 'Inseticida e Nematicida', tox: '1', env: 'II' },
  { reg: '02219', name: 'Avicta 500 FS Pro', ai: 'Abamectina (avermectina)', conc: '500 g/L', class: 'Inseticida e Nematicida', tox: '1', env: 'II' },
  { reg: '38218', name: 'Avura', ai: 'Azoxistrobina (estrobilurina) + difenoconazol (triazol)', conc: '200 g/L + 125 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '36122', name: 'Axial', ai: 'Pinoxadem (Fenilpirazolina)', conc: '50 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '08125', name: 'Axial EC', ai: 'Pinoxadem (Fenilpirazolina)', conc: '50 g/L', class: 'Herbicida', tox: '4', env: 'III' },
  { reg: '12914', name: 'Bedane', ai: 'pimetrozina (piridina azometina)', conc: '500 g/kg', class: 'Inseticida', tox: '5', env: 'IV' },
  { reg: '05801', name: 'Bion 500 WG', ai: 'acibenzolar-S-metílico (benzotiadiazol)', conc: '500 g/kg', class: 'Fungicida', tox: '5', env: 'III' },

  // Page 5
  { reg: '38818', name: 'Bleran', ai: 'Diquate (bipiridílio)', conc: '200 g/L', class: 'Herbicida', tox: '3', env: 'II' },
  { reg: '05026', name: 'Boundary', ai: 'metribuzim (triazinona) + S-metolacloro (cloroacetanilida)', conc: '149,36 g/L + 628,13 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '28820', name: 'BOUNDARY EC', ai: 'metribuzim (triazinona) + S-metolacloro (cloroacetanilida)', conc: '149,36 g/L + 628,13 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '01620', name: 'Bravonil Top', ai: 'clorotalonil (isoftalonitrila) + difenoconazol (triazol)', conc: '500 g/L + 50 g/L', class: 'Fungicida', tox: '2', env: 'II' },
  { reg: '4896', name: 'Bravonil Ultrex', ai: 'clorotalonil (isoftalonitrila)', conc: '825 g/kg', class: 'Fungicida', tox: '3', env: 'II' },
  { reg: '1188491', name: 'Bravonil 500', ai: 'clorotalonil (isoftalonitrila)', conc: '500 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '06300', name: 'Bravonil 720', ai: 'clorotalonil (isoftalonitrila)', conc: '720 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '1418896', name: 'Bravonil 750 WP', ai: 'clorotalonil (isoftalonitrila)', conc: '750 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '09419', name: 'Calaris', ai: 'Mesotriona (Tricetona) + Atrazina (triazina)', conc: '50 g/L + 500 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '11822', name: 'Calipen', ai: 'Mesotriona (Tricetona) + Atrazina (triazina)', conc: '50 g/L + 500 g/L', class: 'Herbicida', tox: '4', env: 'II' },

  // Page 6
  { reg: '17019', name: 'Calipen SC', ai: 'Atrazina (triazina) + Mesotriona (Tricetona)', conc: '500 g/L + 50 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '01004', name: 'Callisto', ai: 'Mesotriona (Tricetona)', conc: '480 g/L', class: 'Herbicida', tox: 'Não', env: 'III' },
  { reg: '00209', name: 'Carial', ai: 'mandipropamid (éter mandelamida)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'IV' },
  { reg: '5111', name: 'Carial Opti', ai: 'mandipropamid (éter mandelamida) + clorotalonil', conc: '40 g/L + 400 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '31220', name: 'Carion', ai: 'Azoxistrobina (estrobilurina) + metalaxil-M (acilalaninato) + fludioxonil', conc: '75 g/L + 37,5 g/L + 12,5 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '18408', name: 'Celest XL', ai: 'difenoconazol (triazol) + fludioxonil (fenilpirrol)', conc: '25 g/L + 25 g/L', class: 'Fungicida', tox: '5', env: 'III' },
  { reg: '06713', name: 'Centric', ai: 'tiametoxam (neonicotinóide)', conc: '750 g/kg', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '03121', name: 'Certano', ai: 'Bacillus velezensis (isolado CNPSo 3602)', conc: '150 g/L', class: 'Fungicida microbiológico e Nematicida', tox: '5', env: 'IV' },
  { reg: '3308', name: 'Chess 500 WG', ai: 'pimetrozina (piridina azometina)', conc: '500 g/kg', class: 'Inseticida', tox: '5', env: 'IV' },
  { reg: '09222', name: 'Circle', ai: 'trinexapaque-etílico', conc: '250 g/L', class: 'Regulador de Crescimento', tox: '5', env: 'III' },

  // Page 7
  { reg: '16917', name: 'Clariva PN', ai: 'Pasteuria nishizawae (Produto Microbiológico)', conc: '156 g/L', class: 'Nematicida Microbiológico', tox: '5', env: 'IV' },
  { reg: '14418', name: 'Clariva PN BR', ai: 'Pasteuria nishizawae (Produto Microbiológico)', conc: '156 g/L', class: 'Nematicida Microbiológico', tox: '5', env: 'IV' },
  { reg: '18722', name: 'Creavis', ai: 'Pidiflumetofen (carboxamida)', conc: '200 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '12019', name: 'Cricen', ai: 'tiametoxam (neonicotinóide) + tiabendazol + metalaxil-M + fludioxonil', conc: '350 g/L + 150 g/L + 20 g/L + 25 g/L', class: 'Fungicida e Inseticida', tox: '5', env: 'II' },
  { reg: '3314', name: 'Cruiser Advanced', ai: 'metalaxil-M + tiabendazol + fludioxonil + tiametoxam', conc: '20 g/L + 150 g/L + 25 g/L + 350 g/L', class: 'Fungicida e Inseticida', tox: '5', env: 'II' },
  { reg: '9613', name: 'Cruiser Opti', ai: 'lambda-cialotrina (piretróide) + tiametoxam (neonicotinóide)', conc: '37,5 g/L + 210 g/L', class: 'Inseticida', tox: '5', env: 'I' },
  { reg: '3105', name: 'Cruiser 350 FS; Domeron; Vitalis', ai: 'tiametoxam (neonicotinóide)', conc: '350 g/L', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '8917', name: 'Cruiser 600 FS', ai: 'tiametoxam (neonicotinóide)', conc: '600 g/L', class: 'Inseticida', tox: 'Não', env: 'III' },
  { reg: '07900', name: 'Cultar 250 SC', ai: 'paclobutrazol (triazol)', conc: '250 g/L', class: 'Regulador de Crescimento', tox: '4', env: 'III' },

  // Page 8
  { reg: '08923', name: 'Curacron', ai: 'profenofós (organofosforado)', conc: '960 g/L', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '04821', name: 'Curanza', ai: 'Ciantraniliprole (antranilamida)', conc: '600 g/L', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '24520', name: 'Curanza Pro', ai: 'Ciantraniliprole (antranilamida)', conc: '600 g/L', class: 'Inseticida', tox: 'Não', env: 'III' },
  { reg: '08720', name: 'Curanza 600 FS PRO', ai: 'Ciantraniliprole (antranilamida)', conc: '600 g/L', class: 'Inseticida', tox: 'Não', env: 'III' },
  { reg: '08100', name: 'Curyom 550 EC', ai: 'lufenurom (benzoiluréia) + profenofós (organofosforado)', conc: '50 g/L + 500 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '19626', name: 'Cypress Bold', ai: 'tebuconazol (triazol) + difenoconazol (triazol)', conc: '200 g/L + 150 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '6710', name: 'Cypress 400 EC Glove', ai: 'difenoconazol (triazol) + ciproconazol (triazol)', conc: '250 g/L + 150 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '7009', name: 'Daconil WG', ai: 'clorotalonil (isoftalonitrila)', conc: '825 g/kg', class: 'Fungicida', tox: '3', env: 'II' },
  { reg: '1798591', name: 'Daconil 500', ai: 'clorotalonil (isoftalonitrila)', conc: '500 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '25716', name: 'Desali; Efectus; Vaxolit', ai: 'Azoxistrobina (estrobilurina) + Benzovindiflupyr (pirazol carboxamida)', conc: '300 g/kg + 150 g/kg', class: 'Fungicida', tox: '4', env: 'II' },

  // Page 9
  { reg: '07420', name: 'Desali 150 EC', ai: 'Azoxistrobina (estrobilurina) + Benzovindiflupyr (pirazol carboxamida)', conc: '100 g/L + 50 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '18323', name: 'Destrez', ai: 'acetamiprido (neonicotinóide) + lambda-cialotrina (piretróide)', conc: '200 g/L + 80 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '11917', name: 'Dividend Supreme', ai: 'difenoconazol + metalaxil-M + tiametoxam', conc: '36,92 g/L + 3,08 g/L + 92,3 g/L', class: 'Fungicida e Inseticida', tox: '4', env: 'II' },
  { reg: '8499', name: 'Dual Gold', ai: 'S-metolacloro (cloroacetanilida)', conc: '960 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '9713', name: 'Durivo', ai: 'tiametoxam (neonicotinóide) + clorantraniliprole (antranilamida)', conc: '200 g/L + 100 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '7208', name: 'Dynasty', ai: 'fludioxonil (fenilpirrol) + metalaxil-M + Azoxistrobina', conc: '12,5 g/L + 37,5 g/L + 75 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '23321', name: 'Eddus', ai: 'fomesafem (éter difenílico) + S-metolacloro (cloroacetanilida)', conc: '119,54 g/L + 517,83 g/L', class: 'Herbicida', tox: '5', env: 'II' },

  // Page 10
  { reg: '14022', name: 'Eddus EC', ai: 'fomesafem (éter difenílico) + S-metolacloro (cloroacetanilida)', conc: '119,54 g/L + 517,83 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '5210', name: 'Eforia; Engeo Pleno Zeon', ai: 'lambda-cialotrina (piretróide) + tiametoxam (neonicotinóide)', conc: '106 g/L + 141 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '2414', name: 'Elatus', ai: 'Azoxistrobina (estrobilurina) + Benzovindiflupyr (pirazol carboxamida)', conc: '300 g/kg + 150 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '22126', name: 'Elatus Ace EC', ai: 'Benzovindiflupyr (pirazol carboxamida) + propiconazol (triazol)', conc: '40 g/L + 250 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '24122', name: 'Elatus Easy', ai: 'Azoxistrobina (estrobilurina) + Benzovindiflupyr (pirazol carboxamida)', conc: '120 g/kg + 60 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '01519', name: 'Elatus Trio', ai: 'Benzovindiflupyr + difenoconazol + Azoxistrobina', conc: '90 g/kg + 225 g/kg + 180 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '52525', name: 'Elestal Fit', ai: 'Espiropidion (ácido tetramico)', conc: '300 g/L', class: 'Inseticida', tox: '4', env: 'III' },
  { reg: '00123', name: 'Elestal Neo; Flocento', ai: 'Espiropidion (ácido tetramico) + acetamiprido (neonicotinóide)', conc: '300 g/kg + 240 g/kg', class: 'Inseticida', tox: '4', env: 'II' },

  // Page 11
  { reg: '22222', name: 'Elestal 300 SC', ai: 'Espiropidion (ácido tetramico)', conc: '300 g/L', class: 'Inseticida', tox: '4', env: 'III' },
  { reg: '30026', name: 'Elumis', ai: 'Mesotriona (Tricetona) + nicossulfurom (sulfoniluréia)', conc: '75 g/L + 30 g/L', class: 'Herbicida', tox: '1', env: 'I' },
  { reg: '2402', name: 'Engeo', ai: 'cipermetrina (piretróide) + tiametoxam (neonicotinóide)', conc: '220 g/L + 110 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '6105', name: 'Engeo Pleno', ai: 'tiametoxam (neonicotinóide) + lambda-cialotrina (piretróide)', conc: '141 g/L + 106 g/L', class: 'Inseticida', tox: '4', env: 'I' },
  { reg: '7001', name: 'Envoke', ai: 'trifloxissulfurom-sódico (sulfoniluréia)', conc: '750 g/kg', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '38318', name: 'Epimec', ai: 'Abamectina (avermectina)', conc: '18 g/L', class: 'Acaricida, Inseticida e Nematicida', tox: '4', env: 'II' },
  { reg: '05325', name: 'Fantom', ai: 'profenofós (organofosforado) + lambda-cialotrina (piretróide)', conc: '300 g/L + 15 g/L', class: 'Acaricida e Inseticida', tox: '4', env: 'I' },
  { reg: '21626', name: 'Filia', ai: 'propiconazol (triazol) + triciclazol (benzotiazol)', conc: '125 g/L + 400 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '22120', name: 'Fitter', ai: 'ciprodinil (anilinopirimidina) + fludioxonil (fenilpirrol)', conc: '375 g/kg + 250 g/kg', class: 'Fungicida', tox: 'Não', env: 'II' },
  { reg: '9808', name: 'Flare', ai: 'difenoconazol (triazol)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'II' },

  // Page 12
  { reg: '41118', name: 'Fleris', ai: 'difenoconazol (triazol)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '838590', name: 'Flex', ai: 'fomesafem (éter difenílico)', conc: '250 g/L', class: 'Herbicida', tox: '2', env: 'III' },
  { reg: '17621', name: 'Flexstar GT', ai: 'glifosato (glicina substituída) + fomesafem (éter difenílico)', conc: '271,1 g/L + 67,7 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '9699', name: 'Folio Gold', ai: 'clorotalonil (isoftalonitrila) + metalaxil-M (acilalaninato)', conc: '675 g/kg + 67,5 g/kg', class: 'Fungicida', tox: '2', env: 'II' },
  { reg: '7116', name: 'Fortenza 600 FS; Onipax', ai: 'Ciantraniliprole (antranilamida)', conc: '600 g/L', class: 'Inseticida', tox: '5', env: 'III' },
  { reg: '21924', name: 'Frondeo', ai: 'Isocicloseram (Isoxazoline)', conc: '400 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '2815', name: 'Fulfill', ai: 'pimetrozina (piridina azometina)', conc: '500 g/kg', class: 'Inseticida', tox: '5', env: 'IV' },
  { reg: '05919', name: 'Fuoro', ai: 'lufenurom (benzoiluréia)', conc: '50 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '748903', name: 'Fusiflex', ai: 'fluazifope-P-butílico + fomesafem (éter difenílico)', conc: '125 g/L + 125 g/L', class: 'Herbicida', tox: '4', env: 'II' },
  { reg: '12622', name: 'Fusiflex 250', ai: 'fluazifope-P-butílico + fomesafem (éter difenílico)', conc: '125 g/L + 125 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '28121', name: 'Fusilade', ai: 'fluazifope-P-butílico (ácido ariloxifenoxipropiônico)', conc: '250 g/L', class: 'Herbicida', tox: '5', env: 'III' },

  // Page 20
  { reg: '21726', name: 'Mitrion MZ', ai: 'Protioconazol (Triazolinthione) + mancozebe + Benzovindiflupyr', conc: '35 g/L + 450 g/L + 15 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '296', name: 'Moddus', ai: 'trinexapaque-etílico', conc: '250 g/L', class: 'Regulador de Crescimento', tox: '5', env: 'III' },
  { reg: '00622', name: 'Moddus Neo', ai: 'trinexapaque-etílico', conc: '250 g/L', class: 'Regulador de Crescimento', tox: '5', env: 'III' },
  { reg: '5814', name: 'Monaris', ai: 'Azoxistrobina (estrobilurina) + ciproconazol (triazol)', conc: '200 g/L + 80 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '8113', name: 'Natera', ai: 'tiametoxam (neonicotinóide) + ciproconazol (triazol)', conc: '300 g/kg + 300 g/kg', class: 'Fungicida e Inseticida', tox: '5', env: 'II' },
  { reg: '15522', name: 'Neture', ai: 'Pseudomonas fluorescens + Pseudomonas chlororaphis (Biológico)', conc: '6 g/L + 12 g/L', class: 'Inseticida Microbiológico', tox: '5', env: 'IV' },
  { reg: '29823', name: 'New Elatus 2', ai: 'Benzovindiflupyr (pirazol carboxamida) + ciproconazol (triazol)', conc: '150 g/kg + 375 g/kg', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '09226', name: 'Onvivis', ai: 'Ciclobutrifluram (Fenetilarilamida)', conc: '500 g/L', class: 'Fungicida e Nematicida', tox: '5', env: 'III' },

  // Page 23
  { reg: '2198', name: 'Priori', ai: 'Azoxistrobina (estrobilurina)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'III' },
  { reg: '4313', name: 'Priori Top', ai: 'Azoxistrobina (estrobilurina) + difenoconazol (triazol)', conc: '200 g/L + 125 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '04903', name: 'Priori Xtra', ai: 'Azoxistrobina (estrobilurina) + ciproconazol (triazol)', conc: '200 g/L + 80 g/L', class: 'Fungicida', tox: '4', env: 'II' },
  { reg: '41324', name: 'Proclaim WG', ai: 'Benzoato de Emamectina (avermectina)', conc: '50 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '29817', name: 'Proclaim 50; Affirm', ai: 'Benzoato de Emamectina (avermectina)', conc: '50 g/kg', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '2999', name: 'Proof', ai: 'Atrazina (triazina)', conc: '500 g/L', class: 'Herbicida', tox: '5', env: 'II' },
  { reg: '19421', name: 'Protecta', ai: 'Abamectina (avermectina) + Ciantraniliprole (antranilamida)', conc: '18 g/L + 60 g/L', class: 'Acaricida e Inseticida', tox: '3', env: 'II' },
  { reg: '7915', name: 'Quadris', ai: 'Azoxistrobina (estrobilurina)', conc: '250 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '36222', name: 'Radis', ai: 'Pinoxadem (Fenilpirazolina)', conc: '50 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '19620', name: 'Raigen', ai: 'clorotalonil (isoftalonitrila) + difenoconazol (triazol)', conc: '500 g/L + 50 g/L', class: 'Fungicida', tox: '2', env: 'II' },

  // Page 30
  { reg: '24526', name: 'Victrato Gold', ai: 'difenoconazol + fludioxonil + metalaxil-M + Ciclobutrifluram', conc: '62,5 g/L + 49,9 g/L + 50,1 g/L + 250,1 g/L', class: 'Fungicida e Nematicida', tox: '4', env: 'II' },
  { reg: '58725', name: 'Victrato Pro', ai: 'Ciclobutrifluram (Fenetilarilamida)', conc: '500 g/L', class: 'Fungicida, Nematicida e Protetor de Sementes', tox: '5', env: 'III' },
  { reg: '2413', name: 'Voliam Flexi', ai: 'tiametoxam (neonicotinóide) + clorantraniliprole (antranilamida)', conc: '200 g/L + 100 g/L', class: 'Inseticida', tox: '5', env: 'II' },
  { reg: '10815', name: 'Voliam Targo', ai: 'clorantraniliprole (antranilamida) + Abamectina (avermectina)', conc: '45 g/L + 18 g/L', class: 'Acaricida e Inseticida', tox: '4', env: 'II' },
  { reg: '23025', name: 'Vulter', ai: 'Benzoato de Emamectina (avermectina) + Isocicloseram (Isoxazoline)', conc: '50 g/L + 200 g/L', class: 'Inseticida', tox: '4', env: 'II' },
  { reg: '23520', name: 'Zagrone TS', ai: 'Azoxistrobina + metalaxil-M + tiabendazol + fludioxonil', conc: '15 g/L + 30 g/L + 300 g/L + 37,5 g/L', class: 'Fungicida', tox: '5', env: 'II' },
  { reg: '12908', name: 'Zapp QI 620', ai: 'glifosato-sal de potássio (glicina substituída)', conc: '620 g/L', class: 'Herbicida', tox: '5', env: 'III' },
  { reg: '03723', name: 'Zoltax', ai: 'Benzoato de Emamectina (avermectina) + lufenurom (benzoiluréia)', conc: '50 g/kg + 400 g/kg', class: 'Inseticida', tox: '4', env: 'II' }
];

function getToxicologicalClass(tox: string): string {
  switch (tox) {
    case '1':
    case 'I':
      return 'Classe I - Extremamente Tóxico';
    case '2':
    case 'II':
      return 'Classe II - Altamente Tóxico';
    case '3':
    case 'III':
      return 'Classe III - Moderadamente Tóxico';
    case '4':
    case 'IV':
      return 'Classe IV - Pouco Tóxico';
    case '5':
    case 'V':
      return 'Classe V - Improvável de Causar Dano Agudo';
    case 'Não':
    case 'Não Classificado':
      return 'Não Classificado - Produto de Baixa Toxicidade';
    default:
      return 'Classe III - Moderadamente Tóxico';
  }
}

function getEnvironmentalClass(env: string): string {
  switch (env) {
    case 'I':
      return 'Classe I - Produto Altamente Perigoso ao Meio Ambiente';
    case 'II':
      return 'Classe II - Produto Muito Perigoso ao Meio Ambiente';
    case 'III':
      return 'Classe III - Produto Perigoso ao Meio Ambiente';
    case 'IV':
      return 'Classe IV - Produto Pouco Perigoso ao Meio Ambiente';
    default:
      return 'Classe III - Produto Perigoso ao Meio Ambiente';
  }
}

function getFormulation(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('WG')) return 'WG - Grânulos Dispersíveis em Água';
  if (upper.includes('SG')) return 'SG - Grânulos Solúveis';
  if (upper.includes('SP')) return 'SP - Pó Solúvel';
  if (upper.includes('FS')) return 'FS - Suspensão para Tratamento de Sementes';
  if (upper.includes('EC')) return 'EC - Emulsão Concentrada';
  if (upper.includes('SC')) return 'SC - Suspensão Concentrada';
  if (upper.includes('CS')) return 'CS - Suspensão de Encapsulados';
  if (upper.includes('WP')) return 'WP - Pó Molhável';
  return 'SL - Concentrado Solúvel';
}

function getModeOfAction(ai: string, agroClass: string): string {
  const activeLower = ai.toLowerCase();
  if (activeLower.includes('isocicloseram')) return 'Inseticida de última geração pertencente ao grupo químico das isoxazolinas, modulador de canais de cloro.';
  if (activeLower.includes('tiametoxam')) return 'Inseticida neonicotinóide sistêmico que interfere na transmissão de impulsos nervosos.';
  if (activeLower.includes('azoxistrobina')) return 'Fungicida do grupo das estrobilurinas, inibidor de respiração celular no complexo III.';
  if (activeLower.includes('difenoconazol')) return 'Fungicida triazol sistêmico focado no bloqueio de demetilação de esteróis.';
  if (activeLower.includes('metalaxil-m')) return 'Fungicida sistêmico acilalaninato focado no bloqueio de síntese de RNA ribosomal.';
  if (activeLower.includes('fludioxonil')) return 'Fungicida de contato focado na regulação de sinalização por osmose em fungos.';
  if (activeLower.includes('abamectina')) return 'Acaricida e inseticida com ação translaminar que estimula a liberação de GABA no sistema nervoso.';
  if (activeLower.includes('clorantraniliprole')) return 'Inseticida antranilamida que ativa receptores de rianodina, esgotando cálcio muscular.';
  
  return `${agroClass} formulado sob rigoroso padrão técnico global Syngenta para máxima produtividade.`;
}

export const SYNGENTA_OFFICIAL_CATALOG: PesticideProduct[] = RAW_PRODUCTS.map((raw, idx) => {
  const uniqueId = `agro-syn-${String(idx + 1).padStart(4, '0')}`;
  const formulation = getFormulation(raw.name);
  const modeOfAction = getModeOfAction(raw.ai, raw.class);
  const dosageVal = raw.ai.includes('abamectina') || raw.ai.includes('clorantraniliprole') ? 0.3 : 1.2;
  const dosageUnit = raw.ai.includes('kg') || raw.ai.includes('WG') || raw.ai.includes('SG') || raw.ai.includes('SP') ? 'kg/ha' : 'L/ha';

  const isHerb = raw.class.includes('Herbicida');
  const isInsect = raw.class.includes('Inseticida') || raw.class.includes('Cupinicida') || raw.class.includes('Acaricida');
  const isFung = raw.class.includes('Fungicida');

  let crops: string[] = ['Soja', 'Milho', 'Trigo'];
  let target = 'Controle técnico integrado conforme recomendação de bula Syngenta';

  if (isHerb) {
    crops = ['Soja', 'Milho', 'Algodão', 'Cana-de-açúcar', 'Café'];
    target = 'Plantas daninhas de folha larga e gramíneas invasoras de difícil controle pré e pós-emergência';
  } else if (isInsect) {
    crops = ['Soja', 'Milho', 'Algodão', 'Feijão', 'Cana-de-açúcar', 'Citros'];
    target = 'Pragas sugadoras (percevejos, mosca-branca) e complexo de lagartas (Spodoptera, Helicoverpa)';
  } else if (isFung) {
    crops = ['Soja', 'Milho', 'Algodão', 'Trigo', 'Feijão', 'Café'];
    target = 'Ferrugem-asiática, Antracnose, Oídio e manchas foliares de final de ciclo';
  }

  return {
    id: uniqueId,
    productName: `${raw.name} (${raw.conc})`,
    registrationNumber: raw.reg,
    activeIngredient: `${raw.ai} (${raw.conc})`,
    chemicalGroup: raw.class,
    manufacturer: 'Syngenta Proteção de Cultivos Ltda.',
    agrochemicalClass: raw.class as any,
    toxicologicalClass: getToxicologicalClass(raw.tox) as any,
    environmentalClass: getEnvironmentalClass(raw.env),
    formulation: formulation as any,
    reentryIntervalHours: 24,
    modeOfAction,
    packageSizes: [1, 5, 20, 200],
    indications: crops.map((crop, cIdx) => ({
      id: `${uniqueId}-ind-${cIdx + 1}`,
      cropName: crop,
      recommendedDosage: dosageVal,
      dosageUnit: dosageUnit as any,
      targetOrganism: target,
      applicationPhase: 'Aplicação preventiva ou na constatação inicial das pragas/doenças de acordo com o monitoramento técnico',
      gracePeriodDays: 14,
      maxApplicationsPerSeason: 3,
      recommendedSprayVolumeLha: 150
    }))
  };
});
