import { CalculatorItem, CalculatorField, CalculationResult } from '../types/agronomicCalculations';

export interface CalculationModel {
  fields: CalculatorField[];
  sampleData: Record<string, number | string>;
  calculate: (values: Record<string, any>) => {
    results: CalculationResult[];
    interpretation?: string;
    hasData: boolean;
  };
}

export const CALCULATION_ENGINES: Record<string, CalculationModel> = {
  // 1. Plantabilidade - PMS
  plant_pms: {
    fields: [
      { key: 'pms', label: 'PMS - Peso de Mil Sementes', unit: 'g', placeholder: 'Ex: 170', step: 1 },
      { key: 'populacao', label: 'População Desejada', unit: 'pl/ha', placeholder: 'Ex: 300000', step: 5000 },
      { key: 'germinacao', label: 'Germinação do Lote', unit: '%', placeholder: 'Ex: 90', step: 0.5 },
      { key: 'pureza', label: 'Pureza Física', unit: '%', placeholder: 'Ex: 99', step: 0.1 },
      { key: 'espacamento', label: 'Espaçamento entre Linhas', unit: 'm', placeholder: 'Ex: 0.45', step: 0.05 },
      { key: 'area', label: 'Área do Talhão / Fazenda', unit: 'ha', placeholder: 'Ex: 120', step: 5 },
      { key: 'peso_saca', label: 'Peso da Saca Comercial', unit: 'kg', placeholder: 'Ex: 40', step: 5, defaultValue: 40 },
      { key: 'preco_saca', label: 'Preço da Saca', unit: 'R$', placeholder: 'Ex: 380', step: 10 },
    ],
    sampleData: {
      pms: 170,
      populacao: 300000,
      germinacao: 90,
      pureza: 99,
      espacamento: 0.45,
      area: 120,
      peso_saca: 40,
      preco_saca: 380,
    },
    calculate: (v) => {
      const pms = Number(v.pms) || 0;
      const pop = Number(v.populacao) || 0;
      const germ = Number(v.germinacao) || 0;
      const pur = Number(v.pureza) || 0;
      const esp = Number(v.espacamento) || 0;
      const area = Number(v.area) || 0;
      const pesoSaca = Number(v.peso_saca) || 40;
      const precoSaca = Number(v.preco_saca) || 0;

      const hasData = pms > 0 && pop > 0 && germ > 0 && pur > 0 && esp > 0;
      if (!hasData) return { results: [], hasData: false };

      const kgHa = Math.round(((pop * pms) / ((germ / 100) * (pur / 100) * 1000000)) * 10) / 10;
      const sementesMetro = Math.round(((pop / (10000 / esp)) / ((germ / 100) * (pur / 100))) * 10) / 10;
      const sementesHaTotal = Math.round(pop / ((germ / 100) * (pur / 100)));
      const totalKg = Math.round(kgHa * (area || 1));
      const totalSacas = Math.ceil(totalKg / pesoSaca);
      const totalCusto = Math.round(totalSacas * precoSaca);
      const custoHa = area > 0 ? Math.round(totalCusto / area) : Math.round((kgHa / pesoSaca) * precoSaca);

      return {
        hasData: true,
        interpretation: `Para atingir ${pop.toLocaleString('pt-BR')} plantas/ha com germinação de ${germ}%, regule a semeadora para distribuir ${sementesMetro} sementes por metro linear (${kgHa} kg/ha).`,
        results: [
          { label: 'Taxa de Semeadura', value: `${kgHa}`, unit: 'kg/ha', highlight: true, color: 'emerald' },
          { label: 'Sementes por Metro Linear', value: `${sementesMetro}`, unit: 'sem/m', highlight: true, color: 'teal' },
          { label: 'Sementes a Distribuir por Hectare', value: sementesHaTotal.toLocaleString('pt-BR'), unit: 'sem/ha', color: 'slate' },
          { label: `Total de Sacas (${pesoSaca} kg)`, value: totalSacas.toLocaleString('pt-BR'), unit: 'sacas', color: 'blue' },
          { label: 'Custo de Sementes por Hectare', value: precoSaca > 0 ? `R$ ${custoHa.toLocaleString('pt-BR')}` : '—', unit: 'R$/ha', color: 'amber' },
          { label: 'Investimento Total do Talhão', value: totalCusto > 0 ? `R$ ${totalCusto.toLocaleString('pt-BR')}` : '—', color: 'emerald' },
        ],
      };
    },
  },

  // 1. Plantabilidade - Forrageiras VC%
  plant_forrageiras_vc: {
    fields: [
      { key: 'germinacao', label: 'Germinação Forrageira', unit: '%', placeholder: 'Ex: 80', step: 1 },
      { key: 'pureza', label: 'Pureza do Lote', unit: '%', placeholder: 'Ex: 60', step: 1 },
      { key: 'dose_pura', label: 'Recomendação de Sementes Puras Viáveis', unit: 'kg/ha', placeholder: 'Ex: 4.0', step: 0.5 },
      { key: 'area', label: 'Área da Pastagem', unit: 'ha', placeholder: 'Ex: 50', step: 5 },
    ],
    sampleData: { germinacao: 80, pureza: 60, dose_pura: 4.0, area: 50 },
    calculate: (v) => {
      const germ = Number(v.germinacao) || 0;
      const pur = Number(v.pureza) || 0;
      const dosePura = Number(v.dose_pura) || 0;
      const area = Number(v.area) || 0;

      const hasData = germ > 0 && pur > 0 && dosePura > 0;
      if (!hasData) return { results: [], hasData: false };

      const vc = Math.round(((germ * pur) / 100) * 10) / 10;
      const taxaReal = vc > 0 ? Math.round((dosePura / (vc / 100)) * 10) / 10 : 0;
      const totalKg = Math.round(taxaReal * (area || 1));

      return {
        hasData: true,
        interpretation: `O lote possui Valor Cultural de ${vc}% VC. Para garantir os ${dosePura} kg/ha de sementes puras recomendadas, aplique ${taxaReal} kg/ha de sementes comerciais no campo.`,
        results: [
          { label: 'Valor Cultural (VC%)', value: `${vc}%`, highlight: true, color: 'teal' },
          { label: 'Taxa Real de Semeadura', value: `${taxaReal}`, unit: 'kg/ha', highlight: true, color: 'emerald' },
          { label: 'Gramas por Metro Quadrado', value: `${Math.round(taxaReal * 0.1 * 100) / 100}`, unit: 'g/m²', color: 'slate' },
          { label: 'Volume Total para a Área', value: area > 0 ? `${totalKg.toLocaleString('pt-BR')}` : '—', unit: 'kg', color: 'blue' },
        ],
      };
    },
  },

  // 1. Plantabilidade - População
  plant_populacao: {
    fields: [
      { key: 'plantas_m', label: 'Contagem de Plantas por Metro Linear', unit: 'pl/m', placeholder: 'Ex: 13.5', step: 0.1 },
      { key: 'espacamento', label: 'Espaçamento entre Linhas', unit: 'm', placeholder: 'Ex: 0.45', step: 0.05 },
    ],
    sampleData: { plantas_m: 13.5, espacamento: 0.45 },
    calculate: (v) => {
      const plM = Number(v.plantas_m) || 0;
      const esp = Number(v.espacamento) || 0;
      const hasData = plM > 0 && esp > 0;
      if (!hasData) return { results: [], hasData: false };

      const plHa = Math.round((plM * 10000) / esp);
      const plM2 = Math.round((plHa / 10000) * 10) / 10;
      const metrosLinearesHa = Math.round(10000 / esp);

      return {
        hasData: true,
        interpretation: `Com ${plM} plantas por metro no espaçamento de ${(esp * 100)} cm, o estande final é de ${plHa.toLocaleString('pt-BR')} plantas por hectare (${plM2} plantas/m²).`,
        results: [
          { label: 'População de Plantas', value: plHa.toLocaleString('pt-BR'), unit: 'plantas/ha', highlight: true, color: 'emerald' },
          { label: 'Densidade por Metro Quadrado', value: `${plM2}`, unit: 'plantas/m²', color: 'teal' },
          { label: 'Metros Lineares de Sulco por Hectare', value: metrosLinearesHa.toLocaleString('pt-BR'), unit: 'm/ha', color: 'slate' },
        ],
      };
    },
  },

  // 2. Regulagens de Adubo - Bandejas de Coleta
  adubo_bandejas: {
    fields: [
      { key: 'coleta_g', label: 'Peso Coletado na Linha / Bandeja', unit: 'g', placeholder: 'Ex: 225', step: 1 },
      { key: 'distancia_m', label: 'Distância Percorrida na Amostragem', unit: 'm', placeholder: 'Ex: 50', step: 1 },
      { key: 'espacamento_m', label: 'Espaçamento entre Linhas', unit: 'm', placeholder: 'Ex: 0.45', step: 0.05 },
      { key: 'area_ha', label: 'Área a Adubar', unit: 'ha', placeholder: 'Ex: 100', step: 5 },
    ],
    sampleData: { coleta_g: 225, distancia_m: 50, espacamento_m: 0.45, area_ha: 100 },
    calculate: (v) => {
      const coleta = Number(v.coleta_g) || 0;
      const dist = Number(v.distancia_m) || 0;
      const esp = Number(v.espacamento_m) || 0;
      const area = Number(v.area_ha) || 0;
      const hasData = coleta > 0 && dist > 0 && esp > 0;
      if (!hasData) return { results: [], hasData: false };

      const gMetro = coleta / dist;
      const kgHa = Math.round(gMetro * (10 / esp) * 10) / 10;
      const totalKg = Math.round(kgHa * (area || 1));
      const totalSacas = Math.ceil(totalKg / 50);

      return {
        hasData: true,
        interpretation: `A taxa medida é de ${gMetro.toFixed(2)} g por metro linear de sulco, correspondendo a ${kgHa} kg/ha de fertilizante.`,
        results: [
          { label: 'Taxa Real no Sulco', value: `${kgHa}`, unit: 'kg/ha', highlight: true, color: 'emerald' },
          { label: 'Descarga por Metro Linear', value: `${gMetro.toFixed(2)}`, unit: 'g/m', highlight: true, color: 'teal' },
          { label: 'Descarga em 10 Metros', value: `${(gMetro * 10).toFixed(1)}`, unit: 'g/10m', color: 'slate' },
          { label: 'Total de Fertilizante (Sacas 50kg)', value: area > 0 ? `${totalSacas}` : '—', unit: 'sc 50kg', color: 'blue' },
        ],
      };
    },
  },

  // 2. Regulagens de Adubo - Custo do Ponto NPK
  adubo_custo_ponto: {
    fields: [
      { key: 'preco_ton', label: 'Preço da Tonelada do Fertilizante', unit: 'R$/t', placeholder: 'Ex: 3400', step: 50 },
      { key: 'garantia_pct', label: 'Garantia do Nutriente na Fórmula', unit: '%', placeholder: 'Ex: 45', step: 1 },
      { key: 'nome_nutriente', label: 'Identificação (N, P₂O₅ ou K₂O)', type: 'text', placeholder: 'Ex: N da Ureia' },
    ],
    sampleData: { preco_ton: 3400, garantia_pct: 45, nome_nutriente: 'N da Ureia 45%' },
    calculate: (v) => {
      const preco = Number(v.preco_ton) || 0;
      const gar = Number(v.garantia_pct) || 0;
      const hasData = preco > 0 && gar > 0;
      if (!hasData) return { results: [], hasData: false };

      const custoKgNutriente = Math.round((preco / (gar * 10)) * 100) / 100;
      const custoPonto = Math.round(custoKgNutriente * 10 * 100) / 100;

      return {
        hasData: true,
        interpretation: `Com a tonelada a R$ ${preco.toLocaleString('pt-BR')} e garantia de ${gar}%, cada 1 kg do nutriente puro custa R$ ${custoKgNutriente.toFixed(2)} (R$ ${custoPonto.toFixed(2)} por ponto percentual).`,
        results: [
          { label: 'Custo do Kg de Nutriente Efetivo', value: `R$ ${custoKgNutriente.toFixed(2)}`, unit: '/kg', highlight: true, color: 'emerald' },
          { label: 'Custo por Ponto (1% = 10kg)', value: `R$ ${custoPonto.toFixed(2)}`, unit: '/ponto', color: 'teal' },
          { label: 'Nutriente Fornecido por Tonelada', value: `${gar * 10}`, unit: 'kg de nutriente', color: 'slate' },
        ],
      };
    },
  },

  // 3. Produtividade & Perdas - Soja
  prod_soja_estimativa: {
    fields: [
      { key: 'plantas_m2', label: 'Plantas por m²', unit: 'pl/m²', placeholder: 'Ex: 28', step: 1 },
      { key: 'vagens_planta', label: 'Vagens por Planta (média)', unit: 'vagens', placeholder: 'Ex: 45', step: 1 },
      { key: 'graos_vagem', label: 'Grãos por Vagem (média)', unit: 'grãos', placeholder: 'Ex: 2.4', step: 0.1 },
      { key: 'pms', label: 'PMS Estimado do Grão', unit: 'g', placeholder: 'Ex: 165', step: 5 },
      { key: 'area', label: 'Área do Talhão', unit: 'ha', placeholder: 'Ex: 120', step: 5 },
      { key: 'preco_saca', label: 'Preço da Saca de Soja', unit: 'R$', placeholder: 'Ex: 125', step: 5 },
    ],
    sampleData: { plantas_m2: 28, vagens_planta: 45, graos_vagem: 2.4, pms: 165, area: 120, preco_saca: 125 },
    calculate: (v) => {
      const plM2 = Number(v.plantas_m2) || 0;
      const vagens = Number(v.vagens_planta) || 0;
      const graos = Number(v.graos_vagem) || 0;
      const pms = Number(v.pms) || 0;
      const area = Number(v.area) || 0;
      const preco = Number(v.preco_saca) || 0;

      const hasData = plM2 > 0 && vagens > 0 && graos > 0 && pms > 0;
      if (!hasData) return { results: [], hasData: false };

      const scHa = Math.round(((plM2 * vagens * graos * (pms / 1000)) / 60) * 10) / 10;
      const kgHa = Math.round(scHa * 60);
      const tonHa = Math.round((kgHa / 1000) * 100) / 100;
      const totalSacas = Math.round(scHa * (area || 1));
      const receitaTotal = Math.round(totalSacas * preco);
      const receitaHa = Math.round(scHa * preco);

      return {
        hasData: true,
        interpretation: `Com base na estrutura de ${plM2} plantas/m² e média de ${(vagens * graos).toFixed(0)} grãos por planta, a previsão de safra é de ${scHa} sc/ha (${tonHa} t/ha).`,
        results: [
          { label: 'Produtividade Estimada', value: `${scHa}`, unit: 'sc/ha', highlight: true, color: 'emerald' },
          { label: 'Produtividade em Quilos', value: kgHa.toLocaleString('pt-BR'), unit: 'kg/ha', highlight: true, color: 'teal' },
          { label: 'Produtividade em Toneladas', value: `${tonHa}`, unit: 't/ha', color: 'slate' },
          { label: 'Volume Total do Talhão', value: area > 0 ? totalSacas.toLocaleString('pt-BR') : '—', unit: 'sacas', color: 'blue' },
          { label: 'Receita Bruta Estimada por Hectare', value: preco > 0 ? `R$ ${receitaHa.toLocaleString('pt-BR')}` : '—', unit: 'R$/ha', color: 'amber' },
        ],
      };
    },
  },

  // 3. Produtividade & Perdas - Perdas Soja
  prod_perdas_soja: {
    fields: [
      { key: 'graos_m2', label: 'Grãos Coletados no Quadro de 1 m²', unit: 'grãos/m²', placeholder: 'Ex: 120', step: 5 },
      { key: 'pms', label: 'PMS do Lote', unit: 'g', placeholder: 'Ex: 165', step: 5, defaultValue: 165 },
      { key: 'preco_saca', label: 'Preço da Saca', unit: 'R$', placeholder: 'Ex: 125', step: 5 },
      { key: 'area', label: 'Área Total Colhida', unit: 'ha', placeholder: 'Ex: 350', step: 10 },
    ],
    sampleData: { graos_m2: 120, pms: 165, preco_saca: 125, area: 350 },
    calculate: (v) => {
      const graos = Number(v.graos_m2) || 0;
      const pms = Number(v.pms) || 165;
      const preco = Number(v.preco_saca) || 0;
      const area = Number(v.area) || 0;

      const hasData = graos > 0;
      if (!hasData) return { results: [], hasData: false };

      const perdaScHa = Math.round(((graos * pms) / 60000) * 100) / 100;
      const perdaKgHa = Math.round(perdaScHa * 60);
      const perdaReaisHa = Math.round(perdaScHa * preco);
      const perdaTotalReais = Math.round(perdaReaisHa * (area || 1));

      return {
        hasData: true,
        interpretation: `A perda de ${graos} grãos/m² representa ${perdaScHa} sc/ha perdidas na colheita. (Referência: limite agronômico tolerável é de até 1.0 sc/ha ou ~60 grãos/m²).`,
        results: [
          { label: 'Perda de Colheita', value: `${perdaScHa}`, unit: 'sc/ha', highlight: true, color: perdaScHa > 1.0 ? 'rose' : 'emerald' },
          { label: 'Perda em Quilos', value: `${perdaKgHa}`, unit: 'kg/ha', color: 'slate' },
          { label: 'Prejuízo por Hectare', value: preco > 0 ? `R$ ${perdaReaisHa.toLocaleString('pt-BR')}` : '—', unit: 'R$/ha', color: 'amber' },
          { label: 'Prejuízo Total na Área', value: preco > 0 && area > 0 ? `R$ ${perdaTotalReais.toLocaleString('pt-BR')}` : '—', color: 'rose' },
        ],
      };
    },
  },

  // 4. Análise de Solo - CTC e Relações Catiônicas
  solo_ctc_relacoes: {
    fields: [
      { key: 'ca', label: 'Cálcio (Ca²⁺)', unit: 'cmol_c/dm³', placeholder: 'Ex: 3.8', step: 0.1 },
      { key: 'mg', label: 'Magnésio (Mg²⁺)', unit: 'cmol_c/dm³', placeholder: 'Ex: 1.2', step: 0.1 },
      { key: 'k', label: 'Potássio (K⁺)', unit: 'mg/dm³', placeholder: 'Ex: 117', step: 1 },
      { key: 'al', label: 'Alumínio Trocável (Al³⁺)', unit: 'cmol_c/dm³', placeholder: 'Ex: 0.1', step: 0.05 },
      { key: 'h_al', label: 'Acidez Potencial (H+Al)', unit: 'cmol_c/dm³', placeholder: 'Ex: 3.5', step: 0.1 },
    ],
    sampleData: { ca: 3.8, mg: 1.2, k: 117, al: 0.1, h_al: 3.5 },
    calculate: (v) => {
      const ca = Number(v.ca) || 0;
      const mg = Number(v.mg) || 0;
      const kMgDm3 = Number(v.k) || 0;
      const kCmolc = kMgDm3 / 391;
      const al = Number(v.al) || 0;
      const hAl = Number(v.h_al) || 0;

      const hasData = ca > 0 || mg > 0 || kMgDm3 > 0;
      if (!hasData) return { results: [], hasData: false };

      const sb = Math.round((ca + mg + kCmolc) * 100) / 100;
      const ctce = Math.round((sb + al) * 100) / 100;
      const ctcPh7 = Math.round((sb + hAl) * 100) / 100;
      const vPct = ctcPh7 > 0 ? Math.round((sb / ctcPh7) * 1000) / 10 : 0;
      const mPct = ctce > 0 ? Math.round((al / ctce) * 1000) / 10 : 0;
      const relCaMg = mg > 0 ? Math.round((ca / mg) * 10) / 10 : 0;
      const relMgK = kCmolc > 0 ? Math.round((mg / kCmolc) * 10) / 10 : 0;
      const caPctCtc = ctcPh7 > 0 ? Math.round((ca / ctcPh7) * 1000) / 10 : 0;
      const mgPctCtc = ctcPh7 > 0 ? Math.round((mg / ctcPh7) * 1000) / 10 : 0;
      const kPctCtc = ctcPh7 > 0 ? Math.round((kCmolc / ctcPh7) * 1000) / 10 : 0;

      return {
        hasData: true,
        interpretation: `Saturação por Bases de ${vPct}% V (Soma de Bases = ${sb} cmol_c/dm³). Relação Ca/Mg = ${relCaMg}:1 (faixa ideal 3:1 a 4:1).`,
        results: [
          { label: 'Saturação por Bases (V%)', value: `${vPct}%`, highlight: true, color: vPct >= 60 ? 'emerald' : 'amber' },
          { label: 'Saturação por Alumínio (m%)', value: `${mPct}%`, highlight: true, color: mPct > 15 ? 'rose' : 'teal' },
          { label: 'Soma de Bases (SB)', value: `${sb}`, unit: 'cmol_c/dm³', color: 'slate' },
          { label: 'CTC Efetiva (t)', value: `${ctce}`, unit: 'cmol_c/dm³', color: 'slate' },
          { label: 'CTC a pH 7.0 (T)', value: `${ctcPh7}`, unit: 'cmol_c/dm³', color: 'blue' },
          { label: 'Relação Ca / Mg', value: `${relCaMg} : 1`, color: 'teal' },
          { label: 'Relação Mg / K', value: `${relMgK} : 1`, color: 'slate' },
          { label: 'Participação na CTC (Ca / Mg / K)', value: `${caPctCtc}% Ca • ${mgPctCtc}% Mg • ${kPctCtc}% K`, color: 'emerald' },
        ],
      };
    },
  },

  // 5. Calagem - Método V% (IAC / EMBRAPA)
  cal_v_prnt: {
    fields: [
      { key: 'v_atual', label: 'V% Atual da Análise de Solo', unit: '%', placeholder: 'Ex: 38', step: 1 },
      { key: 'v_meta', label: 'V% Meta da Cultura Desejada', unit: '%', placeholder: 'Ex: 70', step: 1 },
      { key: 'ctc', label: 'CTC a pH 7.0 (T)', unit: 'cmol_c/dm³', placeholder: 'Ex: 9.5', step: 0.1 },
      { key: 'prnt', label: 'PRNT do Calcário', unit: '%', placeholder: 'Ex: 85', step: 1, defaultValue: 85 },
      { key: 'umidade', label: 'Umidade do Calcário', unit: '%', placeholder: 'Ex: 5', step: 1, defaultValue: 5 },
      { key: 'profundidade', label: 'Profundidade de Correção', unit: 'cm', placeholder: 'Ex: 20', step: 5, defaultValue: 20 },
      { key: 'area', label: 'Área do Talhão', unit: 'ha', placeholder: 'Ex: 120', step: 5 },
    ],
    sampleData: { v_atual: 38, v_meta: 70, ctc: 9.5, prnt: 85, umidade: 5, profundidade: 20, area: 120 },
    calculate: (v) => {
      const v1 = Number(v.v_atual) || 0;
      const v2 = Number(v.v_meta) || 0;
      const ctc = Number(v.ctc) || 0;
      const prnt = Number(v.prnt) || 85;
      const umid = Number(v.umidade) || 0;
      const prof = Number(v.profundidade) || 20;
      const area = Number(v.area) || 0;

      const hasData = v1 > 0 && v2 > 0 && ctc > 0;
      if (!hasData) return { results: [], hasData: false };

      const deltaV = Math.max(0, v2 - v1);
      const fatorProf = prof / 20;
      const fatorUmid = 100 / Math.max(1, 100 - umid);
      const nc = Math.round((((deltaV * ctc) / (10 * prnt)) * fatorProf * fatorUmid) * 100) / 100;
      const totalT = Math.round(nc * (area || 1) * 10) / 10;
      const gM2 = Math.round(nc * 100);

      return {
        hasData: true,
        interpretation: `Para elevar a saturação de ${v1}% para ${v2}% na camada de 0-${prof} cm, aplique ${nc} t/ha de calcário com PRNT de ${prnt}%.`,
        results: [
          { label: 'Dose de Calcário Recomendada', value: `${nc}`, unit: 't/ha', highlight: true, color: 'amber' },
          { label: 'Aplicação por Metro Quadrado', value: `${gM2}`, unit: 'g/m²', highlight: true, color: 'teal' },
          { label: 'Dose em Quilos por Hectare', value: `${Math.round(nc * 1000)}`, unit: 'kg/ha', color: 'slate' },
          { label: 'Volume Total para a Área', value: area > 0 ? `${totalT}` : '—', unit: 'Toneladas', color: 'emerald' },
        ],
      };
    },
  },

  // 6. Gessagem - Argila (Sousa & Lobato / EMBRAPA)
  gesso_sousa_lobato: {
    fields: [
      { key: 'argila', label: 'Teor de Argila do Solo', unit: '%', placeholder: 'Ex: 45', step: 1 },
      {
        key: 'cultura',
        label: 'Grupo de Culturas',
        type: 'select',
        options: [
          { value: 'anuais', label: 'Culturas Anuais (Soja, Milho, Algodão - Fator 50)' },
          { value: 'perenes', label: 'Culturas Perenes (Café, Citros - Fator 60)' },
          { value: 'pastagens', label: 'Pastagens e Forrageiras (Fator 40)' },
        ],
        defaultValue: 'anuais',
      },
      { key: 'area', label: 'Área do Talhão', unit: 'ha', placeholder: 'Ex: 120', step: 5 },
    ],
    sampleData: { argila: 45, cultura: 'anuais', area: 120 },
    calculate: (v) => {
      const arg = Number(v.argila) || 0;
      const cult = String(v.cultura || 'anuais');
      const area = Number(v.area) || 0;
      const hasData = arg > 0;
      if (!hasData) return { results: [], hasData: false };

      const fator = cult === 'anuais' ? 50 : cult === 'perenes' ? 60 : 40;
      const ngKgHa = arg * fator;
      const ngTHa = Math.round((ngKgHa / 1000) * 100) / 100;
      const totalT = Math.round(ngTHa * (area || 1) * 10) / 10;

      return {
        hasData: true,
        interpretation: `Para solo com ${arg}% de argila em culturas ${cult}, a necessidade de gesso agrícola é de ${ngKgHa} kg/ha (${ngTHa} t/ha).`,
        results: [
          { label: 'Dose de Gesso Agrícola', value: `${ngKgHa}`, unit: 'kg/ha', highlight: true, color: 'blue' },
          { label: 'Dose em Toneladas por Hectare', value: `${ngTHa}`, unit: 't/ha', highlight: true, color: 'teal' },
          { label: 'Gramas por Metro Quadrado', value: `${Math.round(ngKgHa * 0.1)}`, unit: 'g/m²', color: 'slate' },
          { label: 'Volume Total para a Área', value: area > 0 ? `${totalT}` : '—', unit: 'Toneladas', color: 'emerald' },
        ],
      };
    },
  },

  // 6. Gessagem - V% Demattê (20-40 cm)
  gesso_dematte: {
    fields: [
      { key: 'v_sub', label: 'V% Atual Subsuperficial (20-40cm)', unit: '%', placeholder: 'Ex: 25', step: 1 },
      { key: 'v_meta_sub', label: 'V% Meta Subsuperfície', unit: '%', placeholder: 'Ex: 50', step: 1, defaultValue: 50 },
      { key: 'ctc_sub', label: 'CTC da Camada Subsuperficial', unit: 'cmol_c/dm³', placeholder: 'Ex: 8.0', step: 0.1 },
      { key: 'profundidade', label: 'Espessura da Camada a Corrigir', unit: 'cm', placeholder: 'Ex: 20', step: 5, defaultValue: 20 },
    ],
    sampleData: { v_sub: 25, v_meta_sub: 50, ctc_sub: 8.0, profundidade: 20 },
    calculate: (v) => {
      const vSub = Number(v.v_sub) || 0;
      const vMeta = Number(v.v_meta_sub) || 50;
      const ctc = Number(v.ctc_sub) || 0;
      const prof = Number(v.profundidade) || 20;

      const hasData = vSub > 0 && vMeta > 0 && ctc > 0;
      if (!hasData) return { results: [], hasData: false };

      const deltaV = Math.max(0, vMeta - vSub);
      const ngTHa = Math.round(((deltaV * ctc * prof) / 1000) * 100) / 100;
      const ngKgHa = Math.round(ngTHa * 1000);

      return {
        hasData: true,
        interpretation: `Para elevar o V% subsuperficial de ${vSub}% para ${vMeta}% na camada de ${prof} cm, aplique ${ngTHa} t/ha de gesso agrícola.`,
        results: [
          { label: 'Dose de Gesso Recomendada', value: `${ngKgHa}`, unit: 'kg/ha', highlight: true, color: 'blue' },
          { label: 'Dose em Toneladas', value: `${ngTHa}`, unit: 't/ha', highlight: true, color: 'teal' },
        ],
      };
    },
  },

  // 6. Gessagem - CTCe Caires
  gesso_caires: {
    fields: [
      { key: 'ctce', label: 'CTC Efetiva - t (20-40cm)', unit: 'cmol_c/dm³', placeholder: 'Ex: 6.0', step: 0.1 },
      { key: 'ca_sub', label: 'Teor de Cálcio na Camada 20-40cm', unit: 'cmol_c/dm³', placeholder: 'Ex: 1.0', step: 0.1 },
    ],
    sampleData: { ctce: 6.0, ca_sub: 1.0 },
    calculate: (v) => {
      const ctce = Number(v.ctce) || 0;
      const ca = Number(v.ca_sub) || 0;
      const hasData = ctce > 0 && ca >= 0;
      if (!hasData) return { results: [], hasData: false };

      const ngKgHa = Math.round(Math.max(0, (0.6 * ctce - ca) * 640));
      const ngTHa = Math.round((ngKgHa / 1000) * 100) / 100;

      return {
        hasData: true,
        interpretation: `Pelo critério de Caires & Guimarães (meta de 60% de Ca na CTC efetiva subsuperficial), a dose recomendada é de ${ngKgHa} kg/ha de gesso.`,
        results: [
          { label: 'Dose de Gesso (Caires)', value: `${ngKgHa}`, unit: 'kg/ha', highlight: true, color: 'blue' },
          { label: 'Dose em Toneladas', value: `${ngTHa}`, unit: 't/ha', color: 'teal' },
        ],
      };
    },
  },

  // 10. Pulverização - Vazão da Ponta
  pulv_vazao_ponta: {
    fields: [
      { key: 'taxa_l_ha', label: 'Taxa de Aplicação Desejada', unit: 'L/ha', placeholder: 'Ex: 100', step: 5 },
      { key: 'velocidade_km_h', label: 'Velocidade Operacional', unit: 'km/h', placeholder: 'Ex: 18', step: 0.5 },
      { key: 'espacamento_bicos_m', label: 'Espaçamento entre Bicos na Barra', unit: 'm', placeholder: 'Ex: 0.5', step: 0.05, defaultValue: 0.5 },
      { key: 'num_bicos', label: 'Número Total de Bicos na Barra', unit: 'bicos', placeholder: 'Ex: 48', step: 2 },
    ],
    sampleData: { taxa_l_ha: 100, velocidade_km_h: 18, espacamento_bicos_m: 0.5, num_bicos: 48 },
    calculate: (v) => {
      const taxa = Number(v.taxa_l_ha) || 0;
      const vel = Number(v.velocidade_km_h) || 0;
      const esp = Number(v.espacamento_bicos_m) || 0.5;
      const bicos = Number(v.num_bicos) || 0;

      const hasData = taxa > 0 && vel > 0 && esp > 0;
      if (!hasData) return { results: [], hasData: false };

      const vazaoLMin = Math.round(((taxa * vel * esp) / 60000) * 1000) / 1000;
      const vazaoMLMin = Math.round(vazaoLMin * 1000);
      const vazaoTotalBarraLMin = bicos > 0 ? Math.round(vazaoLMin * bicos * 10) / 10 : 0;

      return {
        hasData: true,
        interpretation: `Para aplicar ${taxa} L/ha a ${vel} km/h, cada bico deve ter vazão nominal de ${vazaoLMin} L/min (${vazaoMLMin} mL/min).`,
        results: [
          { label: 'Vazão Nominal Exigida por Ponta', value: `${vazaoLMin}`, unit: 'L/min', highlight: true, color: 'cyan' },
          { label: 'Volume Coletado em 1 Minuto', value: `${vazaoMLMin}`, unit: 'mL/min', highlight: true, color: 'teal' },
          { label: 'Vazão Total da Barra', value: bicos > 0 ? `${vazaoTotalBarraLMin}` : '—', unit: 'L/min', color: 'blue' },
        ],
      };
    },
  },

  // 11. Pulverização com Drone - Calda e Execução
  drone_calda_execucao: {
    fields: [
      { key: 'tanque_l', label: 'Capacidade do Tanque do Drone', unit: 'L', placeholder: 'Ex: 40', step: 5, defaultValue: 40 },
      { key: 'taxa_l_ha', label: 'Taxa de Aplicação Ultra-Baixa', unit: 'L/ha', placeholder: 'Ex: 10', step: 1, defaultValue: 10 },
      { key: 'dose_produto_l_ha', label: 'Dose do Defensivo Recomendada', unit: 'L/ha', placeholder: 'Ex: 0.8', step: 0.1 },
      { key: 'area_total', label: 'Área Total a Pulverizar', unit: 'ha', placeholder: 'Ex: 150', step: 10 },
    ],
    sampleData: { tanque_l: 40, taxa_l_ha: 10, dose_produto_l_ha: 0.8, area_total: 150 },
    calculate: (v) => {
      const tanque = Number(v.tanque_l) || 0;
      const taxa = Number(v.taxa_l_ha) || 0;
      const doseProd = Number(v.dose_produto_l_ha) || 0;
      const areaTotal = Number(v.area_total) || 0;

      const hasData = tanque > 0 && taxa > 0;
      if (!hasData) return { results: [], hasData: false };

      const areaPorVoo = Math.round((tanque / taxa) * 10) / 10;
      const dosePorVoo = Math.round(areaPorVoo * doseProd * 100) / 100;
      const aguaPorVoo = Math.round((tanque - dosePorVoo) * 100) / 100;
      const totalVoos = areaTotal > 0 ? Math.ceil(areaTotal / areaPorVoo) : 0;
      const totalProdutoL = areaTotal > 0 ? Math.round(areaTotal * doseProd * 10) / 10 : 0;

      return {
        hasData: true,
        interpretation: `Com tanque de ${tanque} L e taxa de ${taxa} L/ha, cada voo/bateria cobre ${areaPorVoo} hectares. Adicione ${dosePorVoo} L de produto e ${aguaPorVoo} L de água por tanque.`,
        results: [
          { label: 'Área Coberta por Voo / Bateria', value: `${areaPorVoo}`, unit: 'ha/voo', highlight: true, color: 'violet' },
          { label: 'Defensivo a Adicionar por Tanque', value: `${dosePorVoo}`, unit: 'Litros', highlight: true, color: 'emerald' },
          { label: 'Água a Adicionar por Tanque', value: `${aguaPorVoo}`, unit: 'Litros', color: 'teal' },
          { label: 'Total de Voos Estimados', value: areaTotal > 0 ? `${totalVoos}` : '—', unit: 'voos', color: 'blue' },
          { label: 'Consumo Total de Defensivo', value: areaTotal > 0 ? `${totalProdutoL}` : '—', unit: 'Litros', color: 'amber' },
        ],
      };
    },
  },

  // 12. Mecanização - Capacidade de Campo
  mec_capacidade_campo: {
    fields: [
      { key: 'largura_m', label: 'Largura Útil de Trabalho do Implemento', unit: 'm', placeholder: 'Ex: 7.2', step: 0.1 },
      { key: 'velocidade_km_h', label: 'Velocidade Média de Operação', unit: 'km/h', placeholder: 'Ex: 6.5', step: 0.5 },
      { key: 'eficiencia_pct', label: 'Eficiência Operacional de Campo', unit: '%', placeholder: 'Ex: 75', step: 1, defaultValue: 75 },
      { key: 'area_ha', label: 'Área Total a Trabalhar', unit: 'ha', placeholder: 'Ex: 120', step: 5 },
      { key: 'horas_dia', label: 'Jornada de Trabalho Diária', unit: 'h/dia', placeholder: 'Ex: 8', step: 1, defaultValue: 8 },
    ],
    sampleData: { largura_m: 7.2, velocidade_km_h: 6.5, eficiencia_pct: 75, area_ha: 120, horas_dia: 8 },
    calculate: (v) => {
      const largura = Number(v.largura_m) || 0;
      const vel = Number(v.velocidade_km_h) || 0;
      const efic = Number(v.eficiencia_pct) || 0;
      const area = Number(v.area_ha) || 0;
      const horasDia = Number(v.horas_dia) || 8;

      const hasData = largura > 0 && vel > 0 && efic > 0;
      if (!hasData) return { results: [], hasData: false };

      const cct = Math.round(((largura * vel) / 10) * 100) / 100;
      const cce = Math.round((cct * (efic / 100)) * 100) / 100;
      const horasNecessarias = cce > 0 && area > 0 ? Math.round((area / cce) * 10) / 10 : 0;
      const diasNecessarios = horasNecessarias > 0 ? Math.round((horasNecessarias / horasDia) * 10) / 10 : 0;

      return {
        hasData: true,
        interpretation: `O conjunto implemento-trator possui Capacidade de Campo Efetiva de ${cce} ha/hora. Para ${area} ha, a operação demandará aproximadamente ${horasNecessarias} horas (${diasNecessarios} dias de ${horasDia}h).`,
        results: [
          { label: 'Capacidade de Campo Efetiva (CCE)', value: `${cce}`, unit: 'ha/hora', highlight: true, color: 'emerald' },
          { label: 'Capacidade Teórica (CCT)', value: `${cct}`, unit: 'ha/hora', color: 'slate' },
          { label: 'Tempo Total de Trabalho', value: area > 0 ? `${horasNecessarias}` : '—', unit: 'Horas', color: 'blue' },
          { label: 'Dias de Trabalho Necessários', value: area > 0 ? `${diasNecessarios}` : '—', unit: 'Dias', color: 'teal' },
        ],
      };
    },
  },

  // 13. Hídrico - ETc
  hidro_necessidade_etc: {
    fields: [
      { key: 'eto', label: 'ETo - Evapotranspiração de Referência', unit: 'mm/dia', placeholder: 'Ex: 5.2', step: 0.1 },
      { key: 'kc', label: 'Kc - Coeficiente da Cultura na Fase', placeholder: 'Ex: 1.15', step: 0.05 },
      { key: 'area', label: 'Área Irrigada do Pivô / Setor', unit: 'ha', placeholder: 'Ex: 85', step: 5 },
    ],
    sampleData: { eto: 5.2, kc: 1.15, area: 85 },
    calculate: (v) => {
      const eto = Number(v.eto) || 0;
      const kc = Number(v.kc) || 0;
      const area = Number(v.area) || 0;
      const hasData = eto > 0 && kc > 0;
      if (!hasData) return { results: [], hasData: false };

      const etc = Math.round(eto * kc * 10) / 10;
      const m3HaDia = Math.round(etc * 10 * 10) / 10;
      const totalM3Dia = area > 0 ? Math.round(m3HaDia * area) : 0;

      return {
        hasData: true,
        interpretation: `A demanda hídrica diária da cultura (ETc) é de ${etc} mm/dia, correspondendo a ${m3HaDia} m³/ha/dia de água.`,
        results: [
          { label: 'Evapotranspiração da Cultura (ETc)', value: `${etc}`, unit: 'mm/dia', highlight: true, color: 'blue' },
          { label: 'Lâmina de Água em Litros', value: `${etc}`, unit: 'L/m²/dia', color: 'teal' },
          { label: 'Volume Diário por Hectare', value: `${m3HaDia}`, unit: 'm³/ha/dia', highlight: true, color: 'cyan' },
          { label: 'Demanda Total do Pivô / Setor', value: area > 0 ? totalM3Dia.toLocaleString('pt-BR') : '—', unit: 'm³/dia', color: 'emerald' },
        ],
      };
    },
  },

  // 13. Hídrico - IAF
  hidro_iaf: {
    fields: [
      { key: 'area_foliar_planta', label: 'Área Foliar Total por Planta', unit: 'm²', placeholder: 'Ex: 0.22', step: 0.01 },
      { key: 'populacao', label: 'População de Plantas por Hectare', unit: 'pl/ha', placeholder: 'Ex: 280000', step: 5000 },
    ],
    sampleData: { area_foliar_planta: 0.22, populacao: 280000 },
    calculate: (v) => {
      const af = Number(v.area_foliar_planta) || 0;
      const pop = Number(v.populacao) || 0;
      const hasData = af > 0 && pop > 0;
      if (!hasData) return { results: [], hasData: false };

      const iaf = Math.round(((af * pop) / 10000) * 100) / 100;
      return {
        hasData: true,
        interpretation: `O Índice de Área Foliar (IAF) é de ${iaf}. ${iaf >= 3.5 && iaf <= 5.5 ? 'Excelente interceptação de radiação solar (>95%).' : iaf < 3.5 ? 'Dossel ainda aberto, potencial de perda de luz.' : 'Dossel muito fechado, risco de autossombreamento.'}`,
        results: [
          { label: 'Índice de Área Foliar (IAF)', value: `${iaf}`, unit: 'm² folha / m² solo', highlight: true, color: iaf >= 3.5 && iaf <= 5.5 ? 'emerald' : 'amber' },
          { label: 'Área Foliar Verde Total', value: `${Math.round(af * pop).toLocaleString('pt-BR')}`, unit: 'm²/ha', color: 'teal' },
        ],
      };
    },
  },

  // 1. Plantabilidade - Fluxo Contínuo
  plant_fluxo_continuo: {
    fields: [
      { key: 'taxa_kg_ha', label: 'Taxa Desejada de Semente', unit: 'kg/ha', placeholder: 'Ex: 45', step: 1 },
      { key: 'espacamento_m', label: 'Espaçamento entre Linhas', unit: 'm', placeholder: 'Ex: 0.17', step: 0.01, defaultValue: 0.17 },
      { key: 'distancia_teste_m', label: 'Distância da Pista de Teste', unit: 'm', placeholder: 'Ex: 50', step: 5, defaultValue: 50 },
    ],
    sampleData: { taxa_kg_ha: 45, espacamento_m: 0.17, distancia_teste_m: 50 },
    calculate: (v) => {
      const taxa = Number(v.taxa_kg_ha) || 0;
      const esp = Number(v.espacamento_m) || 0.17;
      const dist = Number(v.distancia_teste_m) || 50;
      const hasData = taxa > 0 && esp > 0;
      if (!hasData) return { results: [], hasData: false };

      const gMetro = Math.round(((taxa * esp) / 10) * 100) / 100;
      const gPista = Math.round(gMetro * dist * 10) / 10;

      return {
        hasData: true,
        interpretation: `Para semear ${taxa} kg/ha no espaçamento de ${(esp * 100).toFixed(0)} cm, cada linha de semeadura deve descarregar ${gMetro} g/m (${gPista} g no percurso de ${dist} metros).`,
        results: [
          { label: 'Descarga por Metro Linear', value: `${gMetro}`, unit: 'g/m', highlight: true, color: 'emerald' },
          { label: `Descarga na Pista (${dist}m)`, value: `${gPista}`, unit: `g em ${dist}m`, highlight: true, color: 'teal' },
          { label: 'Metros de Sulco por Hectare', value: `${Math.round(10000 / esp).toLocaleString('pt-BR')}`, unit: 'm/ha', color: 'slate' },
        ],
      };
    },
  },

  // 2. Regulagens de Adubo - Fertilizantes Simples
  adubo_fertilizantes_simples: {
    fields: [
      {
        key: 'fonte',
        label: 'Fonte / Fertilizante Simples',
        type: 'select',
        options: [
          { value: 'ureia', label: 'Ureia (45% N)' },
          { value: 'sulfato_amonio', label: 'Sulfato de Amônio (21% N + 24% S)' },
          { value: 'nitrato_amonio', label: 'Nitrato de Amônio (33% N)' },
          { value: 'map', label: 'MAP (11% N + 52% P₂O₅)' },
          { value: 'dap', label: 'DAP (18% N + 46% P₂O₅)' },
          { value: 'super_triplo', label: 'Superfosfato Triplo (41% P₂O₅)' },
          { value: 'super_simples', label: 'Superfosfato Simples (18% P₂O₅ + 10% S + 16% Ca)' },
          { value: 'kcl', label: 'Cloreto de Potássio - KCl (60% K₂O)' },
          { value: 'sulfato_potassio', label: 'Sulfato de Potássio (50% K₂O + 17% S)' },
        ],
        defaultValue: 'kcl',
      },
      { key: 'dose_nutriente', label: 'Dose do Nutriente Desejada', unit: 'kg/ha', placeholder: 'Ex: 90', step: 5 },
      { key: 'area', label: 'Área da Aplicação', unit: 'ha', placeholder: 'Ex: 100', step: 5 },
    ],
    sampleData: { fonte: 'kcl', dose_nutriente: 90, area: 100 },
    calculate: (v) => {
      const fonte = String(v.fonte || 'kcl');
      const doseNutr = Number(v.dose_nutriente) || 0;
      const area = Number(v.area) || 0;
      const hasData = doseNutr > 0;
      if (!hasData) return { results: [], hasData: false };

      const garantias: Record<string, number> = {
        ureia: 45,
        sulfato_amonio: 21,
        nitrato_amonio: 33,
        map: 52,
        dap: 46,
        super_triplo: 41,
        super_simples: 18,
        kcl: 60,
        sulfato_potassio: 50,
      };

      const gar = garantias[fonte] || 60;
      const doseComercial = Math.round((doseNutr / (gar / 100)) * 10) / 10;
      const sacas50kg = Math.ceil(doseComercial / 50);
      const totalT = Math.round((doseComercial * (area || 1)) / 100) / 10;

      return {
        hasData: true,
        interpretation: `Para aplicar ${doseNutr} kg/ha do nutriente através de ${fonte.toUpperCase()} (${gar}% de garantia), aplique ${doseComercial} kg/ha do produto comercial (${sacas50kg} sacas de 50 kg/ha).`,
        results: [
          { label: 'Dose Comercial do Fertilizante', value: `${doseComercial}`, unit: 'kg/ha', highlight: true, color: 'emerald' },
          { label: 'Sacas de 50 kg por Hectare', value: `${sacas50kg}`, unit: 'sc/ha', highlight: true, color: 'teal' },
          { label: 'Volume Total para a Área', value: area > 0 ? `${totalT}` : '—', unit: 'Toneladas', color: 'blue' },
        ],
      };
    },
  },

  // 3. Produtividade - Estimativa Milho
  prod_milho_contagem: {
    fields: [
      { key: 'espigas_ha', label: 'População de Espigas Férteis', unit: 'espigas/ha', placeholder: 'Ex: 65000', step: 1000 },
      { key: 'fileiras', label: 'Fileiras de Grãos por Espiga (média)', unit: 'fileiras', placeholder: 'Ex: 16', step: 1 },
      { key: 'graos_fileira', label: 'Grãos por Fileira (média)', unit: 'grãos', placeholder: 'Ex: 36', step: 1 },
      { key: 'pms', label: 'PMS Estimado do Híbrido', unit: 'g', placeholder: 'Ex: 330', step: 10, defaultValue: 330 },
      { key: 'area', label: 'Área do Talhão', unit: 'ha', placeholder: 'Ex: 150', step: 5 },
      { key: 'preco_saca', label: 'Preço da Saca de Milho', unit: 'R$', placeholder: 'Ex: 58', step: 2 },
    ],
    sampleData: { espigas_ha: 65000, fileiras: 16, graos_fileira: 36, pms: 330, area: 150, preco_saca: 58 },
    calculate: (v) => {
      const espigas = Number(v.espigas_ha) || 0;
      const fileiras = Number(v.fileiras) || 0;
      const graos = Number(v.graos_fileira) || 0;
      const pms = Number(v.pms) || 330;
      const area = Number(v.area) || 0;
      const preco = Number(v.preco_saca) || 0;

      const hasData = espigas > 0 && fileiras > 0 && graos > 0;
      if (!hasData) return { results: [], hasData: false };

      const scHa = Math.round(((espigas * fileiras * graos * (pms / 1000)) / 60000) * 10) / 10;
      const kgHa = Math.round(scHa * 60);
      const tonHa = Math.round((kgHa / 1000) * 100) / 100;
      const totalSacas = Math.round(scHa * (area || 1));
      const receitaHa = Math.round(scHa * preco);

      return {
        hasData: true,
        interpretation: `Com ${espigas.toLocaleString('pt-BR')} espigas/ha e média de ${(fileiras * graos)} grãos por espiga (PMS ${pms}g), a produtividade estimada é de ${scHa} sc/ha (${tonHa} t/ha).`,
        results: [
          { label: 'Produtividade Estimada Milho', value: `${scHa}`, unit: 'sc/ha', highlight: true, color: 'emerald' },
          { label: 'Produtividade em Quilos', value: `${kgHa.toLocaleString('pt-BR')}`, unit: 'kg/ha', color: 'teal' },
          { label: 'Produtividade em Toneladas', value: `${tonHa}`, unit: 't/ha', color: 'slate' },
          { label: 'Total de Sacas na Área', value: area > 0 ? `${totalSacas.toLocaleString('pt-BR')}` : '—', unit: 'sacas', color: 'blue' },
          { label: 'Receita Bruta Estimada', value: preco > 0 ? `R$ ${receitaHa.toLocaleString('pt-BR')}` : '—', unit: 'R$/ha', color: 'amber' },
        ],
      };
    },
  },

  // 7. Correção da Nutrição - Fósforo Mehlich-1 por Argila
  nutri_p_mehlich: {
    fields: [
      { key: 'p_atual', label: 'Teor de P Atual no Solo (Mehlich-1)', unit: 'mg/dm³', placeholder: 'Ex: 6.5', step: 0.5 },
      { key: 'p_critico', label: 'Teor Crítico / Meta Desejada', unit: 'mg/dm³', placeholder: 'Ex: 18.0', step: 0.5, defaultValue: 18 },
      { key: 'argila', label: 'Teor de Argila do Solo', unit: '%', placeholder: 'Ex: 45', step: 1 },
      { key: 'profundidade', label: 'Profundidade da Camada', unit: 'cm', placeholder: 'Ex: 20', step: 5, defaultValue: 20 },
    ],
    sampleData: { p_atual: 6.5, p_critico: 18.0, argila: 45, profundidade: 20 },
    calculate: (v) => {
      const pAtual = Number(v.p_atual) || 0;
      const pMeta = Number(v.p_critico) || 18;
      const arg = Number(v.argila) || 0;
      const prof = Number(v.profundidade) || 20;

      const hasData = pAtual >= 0 && pMeta > 0 && arg > 0;
      if (!hasData) return { results: [], hasData: false };

      const deltaP = Math.max(0, pMeta - pAtual);
      // Fator de fixação de fósforo em função da argila (quanto mais argiloso, mais P2O5 para elevar 1 mg/dm3)
      const fatorFixacao = 2.0 + (arg / 100) * 4.0;
      const kgP2O5Ha = Math.round(deltaP * fatorFixacao * 2.29 * (prof / 20) * 10) / 10;
      const kgMAP = Math.round(kgP2O5Ha / 0.52);
      const kgSuperSimples = Math.round(kgP2O5Ha / 0.18);

      return {
        hasData: true,
        interpretation: `Para elevar o P Mehlich-1 de ${pAtual} para ${pMeta} mg/dm³ em solo com ${arg}% de argila, são necessários ${kgP2O5Ha} kg/ha de P₂O₅ solúvel.`,
        results: [
          { label: 'Demanda de Fósforo (P₂O₅)', value: `${kgP2O5Ha}`, unit: 'kg P₂O₅/ha', highlight: true, color: 'amber' },
          { label: 'Equivalente em MAP (52% P₂O₅)', value: `${kgMAP}`, unit: 'kg MAP/ha', highlight: true, color: 'teal' },
          { label: 'Equivalente em Super Simples (18%)', value: `${kgSuperSimples}`, unit: 'kg SS/ha', color: 'slate' },
        ],
      };
    },
  },

  // 7. Correção da Nutrição - Potássio K2O no Solo
  nutri_k_solo: {
    fields: [
      { key: 'k_atual', label: 'Teor Atual de K no Solo', unit: 'mg/dm³', placeholder: 'Ex: 45', step: 1 },
      { key: 'k_meta', label: 'Teor Meta Desejado', unit: 'mg/dm³', placeholder: 'Ex: 110', step: 5, defaultValue: 110 },
      { key: 'profundidade', label: 'Profundidade da Amostra', unit: 'cm', placeholder: 'Ex: 20', step: 5, defaultValue: 20 },
    ],
    sampleData: { k_atual: 45, k_meta: 110, profundidade: 20 },
    calculate: (v) => {
      const k1 = Number(v.k_atual) || 0;
      const k2 = Number(v.k_meta) || 110;
      const prof = Number(v.profundidade) || 20;

      const hasData = k1 >= 0 && k2 > 0;
      if (!hasData) return { results: [], hasData: false };

      const deltaK = Math.max(0, k2 - k1);
      const kgK2OHa = Math.round(deltaK * 2 * 1.2046 * (prof / 20) * 10) / 10;
      const kgKCl = Math.round(kgK2OHa / 0.6);

      return {
        hasData: true,
        interpretation: `Para elevar o potássio de ${k1} para ${k2} mg/dm³, recomenda-se a aplicação corretiva de ${kgK2OHa} kg/ha de K₂O (${kgKCl} kg/ha de KCl 60%).`,
        results: [
          { label: 'Demanda Corretiva de K₂O', value: `${kgK2OHa}`, unit: 'kg K₂O/ha', highlight: true, color: 'emerald' },
          { label: 'Equivalente em KCl (60% K₂O)', value: `${kgKCl}`, unit: 'kg KCl/ha', highlight: true, color: 'teal' },
          { label: 'Sacas de 50 kg de KCl por Hectare', value: `${Math.ceil(kgKCl / 50)}`, unit: 'sc 50kg/ha', color: 'slate' },
        ],
      };
    },
  },

  // 8. Manutenção - Nitrogênio para Milho
  manut_n_milho: {
    fields: [
      { key: 'produtividade_esperada', label: 'Meta de Produtividade de Milho', unit: 'sc/ha', placeholder: 'Ex: 140', step: 5 },
      { key: 'n_solo', label: 'N Fornecido pelo Solo / Palhada', unit: 'kg N/ha', placeholder: 'Ex: 30', step: 5, defaultValue: 30 },
      { key: 'area', label: 'Área de Plantio', unit: 'ha', placeholder: 'Ex: 150', step: 5 },
    ],
    sampleData: { produtividade_esperada: 140, n_solo: 30, area: 150 },
    calculate: (v) => {
      const scHa = Number(v.produtividade_esperada) || 0;
      const nSolo = Number(v.n_solo) || 0;
      const area = Number(v.area) || 0;

      const hasData = scHa > 0;
      if (!hasData) return { results: [], hasData: false };

      const tonHa = (scHa * 60) / 1000;
      const nTotalDemanda = Math.round(tonHa * 21); // Regra agronômica: ~21 kg de N por tonelada de grão
      const nAplicar = Math.max(0, nTotalDemanda - nSolo);
      const kgUreia = Math.round(nAplicar / 0.45);
      const totalUreiaT = Math.round((kgUreia * (area || 1)) / 100) / 10;

      return {
        hasData: true,
        interpretation: `Para colher ${scHa} sc/ha (${tonHa.toFixed(1)} t/ha), a planta demanda ${nTotalDemanda} kg/ha de N. Descontando ${nSolo} kg do solo, aplique ${nAplicar} kg N/ha (${kgUreia} kg/ha de Ureia 45%).`,
        results: [
          { label: 'Dose Efetiva de N a Aplicar', value: `${nAplicar}`, unit: 'kg N/ha', highlight: true, color: 'emerald' },
          { label: 'Dose em Ureia (45% N)', value: `${kgUreia}`, unit: 'kg Ureia/ha', highlight: true, color: 'teal' },
          { label: 'Sacas de Ureia por Hectare', value: `${Math.ceil(kgUreia / 50)}`, unit: 'sc 50kg', color: 'slate' },
          { label: 'Volume Total para o Talhão', value: area > 0 ? `${totalUreiaT}` : '—', unit: 'Toneladas', color: 'blue' },
        ],
      };
    },
  },

  // 10. Pulverização - Delta T
  pulv_delta_t: {
    fields: [
      { key: 'temp', label: 'Temperatura do Ar', unit: '°C', placeholder: 'Ex: 26', step: 0.5 },
      { key: 'ur', label: 'Umidade Relativa do Ar', unit: '%', placeholder: 'Ex: 62', step: 1 },
      { key: 'vento', label: 'Velocidade do Vento', unit: 'km/h', placeholder: 'Ex: 5.5', step: 0.5 },
    ],
    sampleData: { temp: 26, ur: 62, vento: 5.5 },
    calculate: (v) => {
      const t = Number(v.temp) || 0;
      const ur = Number(v.ur) || 0;
      const vento = Number(v.vento) || 0;

      const hasData = t > 0 && ur > 0;
      if (!hasData) return { results: [], hasData: false };

      // Fórmula psicrométrica aproximada para bulbo úmido e Delta T
      const tw = t * Math.atan(0.151977 * Math.pow(ur + 8.313659, 0.5)) + Math.atan(t + ur) - Math.atan(ur - 1.676331) + 0.00391838 * Math.pow(ur, 1.5) * Math.atan(0.023101 * ur) - 4.686035;
      const deltaT = Math.round((t - tw) * 10) / 10;
      const twRounded = Math.round(tw * 10) / 10;

      let condicao = 'ÓTIMA PARA PULVERIZAÇÃO';
      let cor: 'emerald' | 'amber' | 'rose' = 'emerald';
      if (deltaT < 2.0) {
        condicao = 'ALERTA: Baixa evaporação e risco de gota não secar ou escorrer (ΔT < 2°C).';
        cor = 'amber';
      } else if (deltaT > 8.0 && deltaT <= 10.0) {
        condicao = 'ATENÇÃO: Risco moderado de evaporação de gotas finas (ΔT entre 8°C e 10°C). Use gotas grossas.';
        cor = 'amber';
      } else if (deltaT > 10.0) {
        condicao = 'CRÍTICA: Alto risco de evaporação rápida da calda (ΔT > 10°C). Suspenda a aplicação.';
        cor = 'rose';
      }

      return {
        hasData: true,
        interpretation: `Delta T calculado: ${deltaT}°C (Bulbo úmido: ${twRounded}°C). ${condicao}`,
        results: [
          { label: 'Delta T (ΔT)', value: `${deltaT}`, unit: '°C', highlight: true, color: cor },
          { label: 'Temperatura de Bulbo Úmido', value: `${twRounded}`, unit: '°C', color: 'teal' },
          { label: 'Condição Climática', value: deltaT >= 2 && deltaT <= 8 ? 'Ideal (2 a 8°C)' : deltaT > 8 ? 'Alerta Evaporação' : 'Alerta Inversão', color: cor },
        ],
      };
    },
  },

  // 12. Mecanização - Patinagem
  mec_patinagem_rodados: {
    fields: [
      { key: 'voltas_com_carga', label: 'Voltas do Pneu na Distância COM Carga', unit: 'voltas', placeholder: 'Ex: 11.2', step: 0.1 },
      { key: 'voltas_sem_carga', label: 'Voltas do Pneu na Mesma Distância SEM Carga', unit: 'voltas', placeholder: 'Ex: 10.0', step: 0.1, defaultValue: 10.0 },
      {
        key: 'tracao',
        label: 'Tipo de Tração do Trator',
        type: 'select',
        options: [
          { value: '4x2_tda', label: 'Trator 4x2 TDA (Faixa ideal: 8% a 12%)' },
          { value: '4x4', label: 'Trator 4x4 Integral (Faixa ideal: 10% a 15%)' },
          { value: '4x2', label: 'Trator 4x2 Simples (Faixa ideal: 12% a 18%)' },
        ],
        defaultValue: '4x2_tda',
      },
    ],
    sampleData: { voltas_com_carga: 11.2, voltas_sem_carga: 10.0, tracao: '4x2_tda' },
    calculate: (v) => {
      const vCom = Number(v.voltas_com_carga) || 0;
      const vSem = Number(v.voltas_sem_carga) || 0;
      const hasData = vCom > 0 && vSem > 0;
      if (!hasData) return { results: [], hasData: false };

      const patinagem = Math.round((((vCom - vSem) / vCom) * 100) * 10) / 10;
      return {
        hasData: true,
        interpretation: `Índice de patinagem medido: ${patinagem}%. ${patinagem >= 8 && patinagem <= 15 ? 'Operação na faixa de eficiência ótima de tração e consumo de diesel.' : patinagem < 8 ? 'Patinagem baixa: risco de lastro excessivo, compactação de solo e sobrecarga mecânica.' : 'Patinagem alta: perda de rendimento, desgaste acelerado de pneus e alto consumo de combustível.'}`,
        results: [
          { label: 'Índice de Patinagem', value: `${patinagem}%`, highlight: true, color: patinagem >= 8 && patinagem <= 15 ? 'emerald' : 'amber' },
          { label: 'Diagnóstico de Tração', value: patinagem >= 8 && patinagem <= 15 ? 'Ideal' : patinagem < 8 ? 'Excesso de Lastro' : 'Perda de Tração', color: 'teal' },
        ],
      };
    },
  },
};

