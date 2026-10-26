export interface AgroCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  region?: string;
  notes?: string;
}

export const BRAZILIAN_AGRO_CITIES: AgroCity[] = [
  // MATO GROSSO
  { name: 'Sorriso', state: 'MT', lat: -12.5448, lng: -55.7214, region: 'Centro-Oeste', notes: 'Capital Nacional do Agronegócio' },
  { name: 'Lucas do Rio Verde', state: 'MT', lat: -13.0644, lng: -55.9125, region: 'Centro-Oeste' },
  { name: 'Nova Mutum', state: 'MT', lat: -13.8317, lng: -56.0825, region: 'Centro-Oeste' },
  { name: 'Sinop', state: 'MT', lat: -11.8608, lng: -55.5097, region: 'Centro-Oeste', notes: 'Polo do Norte do MT' },
  { name: 'Primavera do Leste', state: 'MT', lat: -15.5583, lng: -54.2967, region: 'Centro-Oeste' },
  { name: 'Campo Novo do Parecis', state: 'MT', lat: -13.6756, lng: -57.8892, region: 'Centro-Oeste' },
  { name: 'Rondonópolis', state: 'MT', lat: -16.4674, lng: -54.6368, region: 'Centro-Oeste', notes: 'Maior entroncamento rodoferroviário do MT' },
  { name: 'Sapezal', state: 'MT', lat: -13.5436, lng: -58.8144, region: 'Centro-Oeste' },
  { name: 'Querência', state: 'MT', lat: -12.6075, lng: -52.1931, region: 'Centro-Oeste' },
  { name: 'Canarana', state: 'MT', lat: -13.5519, lng: -52.2689, region: 'Centro-Oeste' },
  { name: 'Diamantino', state: 'MT', lat: -14.4047, lng: -56.4461, region: 'Centro-Oeste' },
  { name: 'Campo Verde', state: 'MT', lat: -15.5458, lng: -55.1683, region: 'Centro-Oeste' },
  { name: 'Tapurah', state: 'MT', lat: -12.7844, lng: -56.5056, region: 'Centro-Oeste' },
  { name: 'Ipiranga do Norte', state: 'MT', lat: -12.2417, lng: -56.1625, region: 'Centro-Oeste' },
  { name: 'Vera', state: 'MT', lat: -12.3081, lng: -55.3217, region: 'Centro-Oeste' },
  { name: 'Campos de Júlio', state: 'MT', lat: -13.9042, lng: -59.1558, region: 'Centro-Oeste' },
  { name: 'Cuiabá', state: 'MT', lat: -15.601, lng: -56.0974, region: 'Centro-Oeste', notes: 'Capital de Mato Grosso' },

  // GOIÁS
  { name: 'Rio Verde', state: 'GO', lat: -17.7922, lng: -50.9192, region: 'Centro-Oeste', notes: 'Polo líder em grãos do Sudoeste Goiano' },
  { name: 'Jataí', state: 'GO', lat: -17.8814, lng: -51.7144, region: 'Centro-Oeste' },
  { name: 'Cristalina', state: 'GO', lat: -16.7686, lng: -47.6136, region: 'Centro-Oeste', notes: 'Maior área irrigada por pivôs da América Latina' },
  { name: 'Mineiros', state: 'GO', lat: -17.5694, lng: -52.5511, region: 'Centro-Oeste' },
  { name: 'Catalão', state: 'GO', lat: -18.1658, lng: -47.9464, region: 'Centro-Oeste' },
  { name: 'Morrinhos', state: 'GO', lat: -17.7311, lng: -49.0994, region: 'Centro-Oeste' },
  { name: 'Itumbiara', state: 'GO', lat: -18.4194, lng: -49.2158, region: 'Centro-Oeste' },
  { name: 'Chapadão do Céu', state: 'GO', lat: -18.3933, lng: -52.6322, region: 'Centro-Oeste' },
  { name: 'Montividiu', state: 'GO', lat: -17.4439, lng: -51.1733, region: 'Centro-Oeste' },
  { name: 'Goiânia', state: 'GO', lat: -16.6869, lng: -49.2648, region: 'Centro-Oeste', notes: 'Capital de Goiás' },
  { name: 'Anápolis', state: 'GO', lat: -16.3267, lng: -48.9534, region: 'Centro-Oeste' },
  { name: 'Formosa', state: 'GO', lat: -15.5392, lng: -47.3364, region: 'Centro-Oeste' },
  { name: 'Luziânia', state: 'GO', lat: -16.2525, lng: -47.95, region: 'Centro-Oeste' },

  // MATO GROSSO DO SUL
  { name: 'Dourados', state: 'MS', lat: -22.2231, lng: -54.8119, region: 'Centro-Oeste', notes: 'Principal polo do Sul de MS' },
  { name: 'Maracaju', state: 'MS', lat: -21.6144, lng: -55.1683, region: 'Centro-Oeste', notes: 'Maior produtor de grãos de MS' },
  { name: 'Sidrolândia', state: 'MS', lat: -20.9317, lng: -54.9614, region: 'Centro-Oeste' },
  { name: 'Ponta Porã', state: 'MS', lat: -22.5361, lng: -55.7256, region: 'Centro-Oeste' },
  { name: 'Rio Brilhante', state: 'MS', lat: -21.8019, lng: -54.5464, region: 'Centro-Oeste' },
  { name: 'São Gabriel do Oeste', state: 'MS', lat: -21.4939, lng: -54.5722, region: 'Centro-Oeste' },
  { name: 'Chapadão do Sul', state: 'MS', lat: -18.7936, lng: -52.6186, region: 'Centro-Oeste' },
  { name: 'Naviraí', state: 'MS', lat: -23.065, lng: -54.1906, region: 'Centro-Oeste' },
  { name: 'Campo Grande', state: 'MS', lat: -20.4697, lng: -54.6201, region: 'Centro-Oeste', notes: 'Capital de Mato Grosso do Sul' },
  { name: 'Três Lagoas', state: 'MS', lat: -20.7849, lng: -51.7008, region: 'Centro-Oeste' },
  { name: 'Costa Rica', state: 'MS', lat: -18.5444, lng: -53.1294, region: 'Centro-Oeste' },

  // PARANÁ
  { name: 'Cascavel', state: 'PR', lat: -24.9578, lng: -53.4595, region: 'Sul', notes: 'Capital do Oeste Paranaense e Show Rural' },
  { name: 'Londrina', state: 'PR', lat: -23.3045, lng: -51.1696, region: 'Sul', notes: 'Sede da Embrapa Soja' },
  { name: 'Maringá', state: 'PR', lat: -23.4205, lng: -51.9333, region: 'Sul' },
  { name: 'Toledo', state: 'PR', lat: -24.7247, lng: -53.7431, region: 'Sul', notes: 'Capital Paranaense do Agronegócio' },
  { name: 'Castro', state: 'PR', lat: -24.7911, lng: -50.0119, region: 'Sul', notes: 'Capital Nacional do Leite' },
  { name: 'Ponta Grossa', state: 'PR', lat: -25.0994, lng: -50.1583, region: 'Sul', notes: 'Campos Gerais' },
  { name: 'Campo Mourão', state: 'PR', lat: -24.0458, lng: -52.3789, region: 'Sul', notes: 'Sede da Coamo' },
  { name: 'Guarapuava', state: 'PR', lat: -25.3908, lng: -51.4628, region: 'Sul', notes: 'Polo de Cevada e Trigo' },
  { name: 'Pato Branco', state: 'PR', lat: -26.2289, lng: -52.6711, region: 'Sul' },
  { name: 'Francisco Beltrão', state: 'PR', lat: -26.0811, lng: -53.055, region: 'Sul' },
  { name: 'Palotina', state: 'PR', lat: -24.2839, lng: -53.8406, region: 'Sul', notes: 'Sede da C.Vale' },
  { name: 'Ubiratã', state: 'PR', lat: -24.5444, lng: -52.9917, region: 'Sul' },
  { name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, region: 'Sul', notes: 'Capital do Paraná' },

  // BAHIA (MATOPIBA)
  { name: 'Luís Eduardo Magalhães', state: 'BA', lat: -12.0964, lng: -45.7958, region: 'Nordeste', notes: 'Capital do Oeste Baiano / Bahia Farm Show' },
  { name: 'Barreiras', state: 'BA', lat: -12.1444, lng: -44.9969, region: 'Nordeste', notes: 'Polo regional do Oeste da Bahia' },
  { name: 'São Desidério', state: 'BA', lat: -12.3619, lng: -44.9739, region: 'Nordeste', notes: 'Um dos maiores produtores de algodão do país' },
  { name: 'Correntina', state: 'BA', lat: -13.3433, lng: -44.6367, region: 'Nordeste' },
  { name: 'Formosa do Rio Preto', state: 'BA', lat: -11.0483, lng: -45.1931, region: 'Nordeste' },
  { name: 'Juazeiro', state: 'BA', lat: -9.4167, lng: -40.5, region: 'Nordeste', notes: 'Vale do São Francisco (Fruticultura Irrigada)' },
  { name: 'Salvador', state: 'BA', lat: -12.9777, lng: -38.5016, region: 'Nordeste', notes: 'Capital da Bahia' },

  // PERNAMBUCO
  { name: 'Petrolina', state: 'PE', lat: -9.3986, lng: -40.5008, region: 'Nordeste', notes: 'Polo de Manga e Uva Exportação' },
  { name: 'Garanhuns', state: 'PE', lat: -8.8906, lng: -36.4928, region: 'Nordeste' },

  // MINAS GERAIS
  { name: 'Uberlândia', state: 'MG', lat: -18.9186, lng: -48.2772, region: 'Sudeste', notes: 'Triângulo Mineiro' },
  { name: 'Uberaba', state: 'MG', lat: -19.7483, lng: -47.9319, region: 'Sudeste', notes: 'Capital Mundial do Zebu / Fertilizantes' },
  { name: 'Patos de Minas', state: 'MG', lat: -18.5789, lng: -46.5181, region: 'Sudeste', notes: 'Alto Paranaíba' },
  { name: 'Unaí', state: 'MG', lat: -16.3575, lng: -46.9058, region: 'Sudeste', notes: 'Noroeste Mineiro (Maior produtor de feijão)' },
  { name: 'Paracatu', state: 'MG', lat: -17.2222, lng: -46.8747, region: 'Sudeste' },
  { name: 'Passos', state: 'MG', lat: -20.7189, lng: -46.6097, region: 'Sudeste' },
  { name: 'Alfenas', state: 'MG', lat: -21.4258, lng: -45.9467, region: 'Sudeste', notes: 'Sul de Minas (Café)' },
  { name: 'Araguari', state: 'MG', lat: -18.6464, lng: -48.1872, region: 'Sudeste' },
  { name: 'Patrocínio', state: 'MG', lat: -18.9439, lng: -46.9928, region: 'Sudeste', notes: 'Maior produtor de café arábica do Brasil' },
  { name: 'Manhuaçu', state: 'MG', lat: -20.2575, lng: -42.0333, region: 'Sudeste', notes: 'Matas de Minas (Café)' },
  { name: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345, region: 'Sudeste', notes: 'Capital de Minas Gerais' },

  // SÃO PAULO
  { name: 'Ribeirão Preto', state: 'SP', lat: -21.1775, lng: -47.8103, region: 'Sudeste', notes: 'Capital do Agronegócio Paulista / Agrishow' },
  { name: 'Campinas', state: 'SP', lat: -22.9056, lng: -47.0608, region: 'Sudeste', notes: 'Polo de Pesquisa e Tecnologia Agro (IAC/Embrapa)' },
  { name: 'Piracicaba', state: 'SP', lat: -22.7253, lng: -47.6492, region: 'Sudeste', notes: 'AgTech Valley / ESALQ USP' },
  { name: 'Presidente Prudente', state: 'SP', lat: -22.1256, lng: -51.3889, region: 'Sudeste' },
  { name: 'Assis', state: 'SP', lat: -22.6617, lng: -50.4183, region: 'Sudeste' },
  { name: 'Ourinhos', state: 'SP', lat: -22.9789, lng: -49.8706, region: 'Sudeste' },
  { name: 'Avaré', state: 'SP', lat: -23.0989, lng: -48.9256, region: 'Sudeste' },
  { name: 'Barretos', state: 'SP', lat: -20.5572, lng: -48.5678, region: 'Sudeste', notes: 'Polo Cítrico e Pecuária' },
  { name: 'Bebedouro', state: 'SP', lat: -20.9494, lng: -48.4792, region: 'Sudeste', notes: 'Capital da Laranja' },
  { name: 'Franca', state: 'SP', lat: -20.5386, lng: -47.4008, region: 'Sudeste', notes: 'Café da Alta Mogiana' },
  { name: 'Itapetininga', state: 'SP', lat: -23.5917, lng: -48.0531, region: 'Sudeste' },
  { name: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333, region: 'Sudeste', notes: 'Capital de São Paulo' },

  // RIO GRANDE DO SUL
  { name: 'Passo Fundo', state: 'RS', lat: -28.2628, lng: -52.4067, region: 'Sul', notes: 'Capital do Norte Gaúcho / Trigo e Soja' },
  { name: 'Carazinho', state: 'RS', lat: -28.2839, lng: -52.7864, region: 'Sul' },
  { name: 'Cruz Alta', state: 'RS', lat: -28.6389, lng: -53.6064, region: 'Sul', notes: 'Terra da Panelinha e Soja' },
  { name: 'Ijuí', state: 'RS', lat: -28.3878, lng: -53.9253, region: 'Sul' },
  { name: 'Santa Maria', state: 'RS', lat: -29.6842, lng: -53.8069, region: 'Sul', notes: 'Coração do Rio Grande' },
  { name: 'Santo Ângelo', state: 'RS', lat: -28.2989, lng: -54.2631, region: 'Sul', notes: 'Missões' },
  { name: 'Erechim', state: 'RS', lat: -27.6342, lng: -52.2739, region: 'Sul' },
  { name: 'Não-Me-Toque', state: 'RS', lat: -28.4589, lng: -52.8208, region: 'Sul', notes: 'Capital Nacional da Agricultura de Precisão / Expodireto' },
  { name: 'Bagé', state: 'RS', lat: -31.3283, lng: -54.1069, region: 'Sul', notes: 'Fronteira Oeste / Pecuária' },
  { name: 'Uruguaiana', state: 'RS', lat: -29.7547, lng: -57.0883, region: 'Sul', notes: 'Maior produtor de arroz irrigado' },
  { name: 'Pelotas', state: 'RS', lat: -31.7654, lng: -52.3376, region: 'Sul' },
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, region: 'Sul', notes: 'Capital do Rio Grande do Sul' },

  // SANTA CATARINA
  { name: 'Chapecó', state: 'SC', lat: -27.1006, lng: -52.6153, region: 'Sul', notes: 'Capital da Agroindústria e Proteína Animal' },
  { name: 'Concórdia', state: 'SC', lat: -27.2333, lng: -52.0258, region: 'Sul' },
  { name: 'Xanxerê', state: 'SC', lat: -26.8747, lng: -52.4036, region: 'Sul', notes: 'Capital do Milho' },
  { name: 'Campos Novos', state: 'SC', lat: -27.4017, lng: -51.225, region: 'Sul', notes: 'Celeiro Catarinense' },
  { name: 'Curitibanos', state: 'SC', lat: -27.2828, lng: -50.5844, region: 'Sul' },
  { name: 'Fraiburgo', state: 'SC', lat: -27.0264, lng: -50.9217, region: 'Sul', notes: 'Terra da Maçã' },
  { name: 'São Joaquim', state: 'SC', lat: -28.2936, lng: -49.9317, region: 'Sul' },
  { name: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.548, region: 'Sul' },

  // MARANHÃO
  { name: 'Balsas', state: 'MA', lat: -7.5322, lng: -46.0356, region: 'Nordeste', notes: 'Maior produtor de grãos do Maranhão' },
  { name: 'Tasso Fragoso', state: 'MA', lat: -8.4756, lng: -45.7444, region: 'Nordeste' },
  { name: 'Imperatriz', state: 'MA', lat: -5.5264, lng: -47.4778, region: 'Nordeste' },
  { name: 'São Raimundo das Mangabeiras', state: 'MA', lat: -7.0219, lng: -45.4811, region: 'Nordeste' },
  { name: 'São Luís', state: 'MA', lat: -2.5307, lng: -44.3068, region: 'Nordeste' },

  // PIAUÍ
  { name: 'Uruçuí', state: 'PI', lat: -7.2289, lng: -44.5561, region: 'Nordeste', notes: 'Cerrado Piauiense' },
  { name: 'Bom Jesus', state: 'PI', lat: -9.0744, lng: -44.3581, region: 'Nordeste', notes: 'Polo do Cerrado e Soja no Piauí' },
  { name: 'Baixa Grande do Ribeiro', state: 'PI', lat: -7.8506, lng: -45.2144, region: 'Nordeste' },
  { name: 'Currais', state: 'PI', lat: -9.0069, lng: -44.4031, region: 'Nordeste' },
  { name: 'Teresina', state: 'PI', lat: -5.0919, lng: -42.8034, region: 'Nordeste' },

  // TOCANTINS
  { name: 'Palmas', state: 'TO', lat: -10.1844, lng: -48.3336, region: 'Norte', notes: 'Capital do Tocantins' },
  { name: 'Porto Nacional', state: 'TO', lat: -10.7083, lng: -48.4172, region: 'Norte' },
  { name: 'Gurupi', state: 'TO', lat: -11.7292, lng: -49.0686, region: 'Norte' },
  { name: 'Pedro Afonso', state: 'TO', lat: -8.9669, lng: -48.1758, region: 'Norte' },
  { name: 'Campos Lindos', state: 'TO', lat: -7.9944, lng: -47.6653, region: 'Norte' },
  { name: 'Araguaína', state: 'TO', lat: -7.1925, lng: -48.2044, region: 'Norte', notes: 'Capital Econômica do Tocantins' },

  // RONDÔNIA
  { name: 'Vilhena', state: 'RO', lat: -12.7406, lng: -60.1458, region: 'Norte', notes: 'Portal da Amazônia / Cone Sul de RO' },
  { name: 'Ariquemes', state: 'RO', lat: -9.9133, lng: -63.0408, region: 'Norte' },
  { name: 'Cacoal', state: 'RO', lat: -11.4386, lng: -61.4472, region: 'Norte', notes: 'Capital do Café Robusta Amazônico' },
  { name: 'Ji-Paraná', state: 'RO', lat: -10.8847, lng: -61.9511, region: 'Norte', notes: 'Rondônia Rural Show' },
  { name: 'Cerejeiras', state: 'RO', lat: -13.1889, lng: -60.8164, region: 'Norte' },
  { name: 'Porto Velho', state: 'RO', lat: -8.7619, lng: -63.9039, region: 'Norte' },

  // DISTRITO FEDERAL
  { name: 'Brasília', state: 'DF', lat: -15.7801, lng: -47.9292, region: 'Centro-Oeste', notes: 'PAD-DF / AgroBrasília' },
  { name: 'Planaltina', state: 'DF', lat: -15.6178, lng: -47.6536, region: 'Centro-Oeste', notes: 'Sede da Embrapa Cerrados' },

  // ESPÍRITO SANTO
  { name: 'Linhares', state: 'ES', lat: -19.3911, lng: -40.0722, region: 'Sudeste', notes: 'Polo de Café Conilon e Cacau' },
  { name: 'Colatina', state: 'ES', lat: -19.5392, lng: -40.6308, region: 'Sudeste' },
  { name: 'Venda Nova do Imigrante', state: 'ES', lat: -20.3275, lng: -41.1347, region: 'Sudeste', notes: 'Cafés Especiais e Agroturismo' },

  // PARÁ
  { name: 'Paragominas', state: 'PA', lat: -2.9989, lng: -47.3533, region: 'Norte', notes: 'Polo de Grãos do Leste Paraense' },
  { name: 'Santarém', state: 'PA', lat: -2.4431, lng: -54.7083, region: 'Norte' },
  { name: 'Redenção', state: 'PA', lat: -8.0267, lng: -50.0319, region: 'Norte', notes: 'Polo Pecuário do Sul do Pará' },
  { name: 'Altamira', state: 'PA', lat: -3.2033, lng: -52.2064, region: 'Norte' },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca rápida local em memória (funciona 100% offline).
 */
export function searchLocalBrazilianCities(query: string, maxResults = 8): AgroCity[] {
  if (!query || query.trim().length < 2) return [];

  const normQuery = normalizeText(query);
  const parts = normQuery.split(/[\s,-]+/).filter(Boolean);

  const matched = BRAZILIAN_AGRO_CITIES.filter((city) => {
    const normName = normalizeText(city.name);
    const normState = normalizeText(city.state);
    const full = `${normName} ${normState}`;

    // Busca por todas as palavras digitadas (ex: "rio verde go")
    return parts.every(part => full.includes(part));
  });

  return matched.slice(0, maxResults);
}

/**
 * Busca online através do serviço Nominatim OpenStreetMap para qualquer cidade do Brasil.
 */
export async function searchOnlineCityNominatim(query: string, limit = 6): Promise<AgroCity[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const encoded = encodeURIComponent(`${query.trim()}, Brasil`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&addressdetails=1&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': 'GeaAgro-AgroMap-CitySearch',
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .map((item: any) => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.municipality || addr.village || item.name;
        const stateName = addr.state || addr.region || '';
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (!cityName || isNaN(lat) || isNaN(lng)) return null;

        return {
          name: cityName,
          state: stateName,
          lat,
          lng,
          notes: item.display_name,
        } as AgroCity;
      })
      .filter((c): c is AgroCity => c !== null);
  } catch (err) {
    console.warn('[AgroCitySearch] Falha na consulta online Nominatim:', err);
    return [];
  }
}
