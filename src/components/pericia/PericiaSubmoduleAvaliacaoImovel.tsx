import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  Calculator,
  Download,
  TrendingUp,
  Scale,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Maximize2,
  FileSpreadsheet,
  Layers,
  PieChart,
  Trees,
  Sprout,
  ShieldCheck,
  RotateCcw,
  HelpCircle,
  Tractor,
  Truck,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import {
  Pericia,
  PericiaAmostraTerraNua,
  PericiaAvaliacaoImovel,
  PericiaClasseTerraItem,
  PericiaAproveitamentoImovel,
} from '../../types/pericia';
import { AvaliacaoBenfeitoriasTab } from './avaliacao/AvaliacaoBenfeitoriasTab';
import { AvaliacaoMaquinasTab } from './avaliacao/AvaliacaoMaquinasTab';
import { AvaliacaoVeiculosTab } from './avaliacao/AvaliacaoVeiculosTab';
import { AvaliacaoSemoventesTab } from './avaliacao/AvaliacaoSemoventesTab';
import { AvaliacaoRecursosNaturaisTab } from './avaliacao/AvaliacaoRecursosNaturaisTab';
import { AvaliacaoFrutosTab } from './avaliacao/AvaliacaoFrutosTab';
import { AvaliacaoDireitosTab } from './avaliacao/AvaliacaoDireitosTab';
import { AvaliacaoResumoGlobalTab } from './avaliacao/AvaliacaoResumoGlobalTab';
import { PericiaInventarioAtivos } from './PericiaInventarioAtivos';

// Helper to generate standard 8 Land Capability Classes (ABNT NBR 14653-3 & Sistema Lepsch)
const createDefaultClassesTerras = (areaTotal: number, basePriceHa: number): PericiaClasseTerraItem[] => {
  const c1Area = Math.round(areaTotal * 0.35 * 10) / 10;
  const c2Area = Math.round(areaTotal * 0.25 * 10) / 10;
  const c3Area = Math.round(areaTotal * 0.12 * 10) / 10;
  const c4Area = Math.round(areaTotal * 0.05 * 10) / 10;
  const c5Area = Math.round(areaTotal * 0.03 * 10) / 10;
  const c6Area = 0;
  const c7Area = 0;
  const c8Area = Math.max(0, Math.round((areaTotal - (c1Area + c2Area + c3Area + c4Area + c5Area)) * 10) / 10);

  return [
    {
      id: 'classe-1',
      classe: 'Classe I',
      grupoUso: 'Grupo A - Cultiváveis',
      descricaoUso: 'Terras cultiváveis aparentemente sem limitações, aptas a culturas anuais intensivas, relevo plano (0-2%), profundas e bem drenadas',
      areaHa: c1Area,
      percentualArea: areaTotal > 0 ? Math.round((c1Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 1.00,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 1.00),
      valorTotalEstimadoBrl: Math.round(c1Area * basePriceHa * 1.00),
      declividadePredominante: 'Plano (0 a 2%)',
      restricoesManejo: 'Nenhuma limitação severa; práticas usuais de calagem, adubação e rotação',
    },
    {
      id: 'classe-2',
      classe: 'Classe II',
      grupoUso: 'Grupo A - Cultiváveis',
      descricaoUso: 'Terras cultiváveis com moderadas limitações de conservação (relevo suave-ondulado 2-5%), suscetíveis à erosão laminar',
      areaHa: c2Area,
      percentualArea: areaTotal > 0 ? Math.round((c2Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 0.88,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.88),
      valorTotalEstimadoBrl: Math.round(c2Area * basePriceHa * 0.88),
      declividadePredominante: 'Suave-Ondulado (2 a 5%)',
      restricoesManejo: 'Plantio direto na palha em nível, terraceamento em desnível e rotação de culturas',
    },
    {
      id: 'classe-3',
      classe: 'Classe III',
      grupoUso: 'Grupo A - Cultiváveis',
      descricaoUso: 'Terras cultiváveis com severas limitações de manejo ou conservação (relevo ondulado 5-10% ou fertilidade média a baixa)',
      areaHa: c3Area,
      percentualArea: areaTotal > 0 ? Math.round((c3Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 0.74,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.74),
      valorTotalEstimadoBrl: Math.round(c3Area * basePriceHa * 0.74),
      declividadePredominante: 'Moderadamente Ondulado (5 a 10%)',
      restricoesManejo: 'Manejo intensivo do solo, terraços base larga/média, palhada permanente',
    },
    {
      id: 'classe-4',
      classe: 'Classe IV',
      grupoUso: 'Grupo A - Cultiváveis',
      descricaoUso: 'Terras com limitações muito severas para culturas anuais, melhor adaptadas a pastagens, silvicultura ou culturas perenes',
      areaHa: c4Area,
      percentualArea: areaTotal > 0 ? Math.round((c4Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 0.60,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.60),
      valorTotalEstimadoBrl: Math.round(c4Area * basePriceHa * 0.60),
      declividadePredominante: 'Ondulado (10 a 15%)',
      restricoesManejo: 'Cultivo anual apenas ocasional; pastagens com controle de lotação',
    },
    {
      id: 'classe-5',
      classe: 'Classe V',
      grupoUso: 'Grupo B - Pastagem / Silvicultura',
      descricaoUso: 'Terras planas ou com excesso sazonal de umidade/várzeas, inadequadas para lavoura mecanizada anual sem drenagem, excelentes para pastagens',
      areaHa: c5Area,
      percentualArea: areaTotal > 0 ? Math.round((c5Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 0.48,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.48),
      valorTotalEstimadoBrl: Math.round(c5Area * basePriceHa * 0.48),
      declividadePredominante: 'Plano Hidromórfico (0 a 1%)',
      restricoesManejo: 'Limitação por encharcamento periódico; pastoreio com gramíneas adaptadas',
    },
    {
      id: 'classe-6',
      classe: 'Classe VI',
      grupoUso: 'Grupo B - Pastagem / Silvicultura',
      descricaoUso: 'Terras com limitações severas de declividade ou pedregosidade, não cultiváveis para anuais, adequadas para pastagem ou silvicultura comercial',
      areaHa: c6Area,
      percentualArea: 0,
      fatorHomogeneizacao: 0.38,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.38),
      valorTotalEstimadoBrl: Math.round(c6Area * basePriceHa * 0.38),
      declividadePredominante: 'Forte-Ondulado (15 a 25%)',
      restricoesManejo: 'Sem preparo de solo; silvicultura protetora ou pastoreio moderado',
    },
    {
      id: 'classe-7',
      classe: 'Classe VII',
      grupoUso: 'Grupo B - Pastagem / Silvicultura',
      descricaoUso: 'Terras com limitações extremamente severas, declividade acentuada (> 25%), uso restrito a pastoreio extensivo controlado ou reflorestamento protetor',
      areaHa: c7Area,
      percentualArea: 0,
      fatorHomogeneizacao: 0.22,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.22),
      valorTotalEstimadoBrl: Math.round(c7Area * basePriceHa * 0.22),
      declividadePredominante: 'Montanhoso (> 25%)',
      restricoesManejo: 'Evitar sobrepastoreio para não deflagrar voçorocas e erosão acelerada',
    },
    {
      id: 'classe-8',
      classe: 'Classe VIII',
      grupoUso: 'Grupo C - Preservação / Inaproveitável',
      descricaoUso: 'Terras impróprias para exploração agrossilvopastoril comercial, destinadas exclusivamente à preservação ambiental (APP, Reserva Legal, topos de morro)',
      areaHa: c8Area,
      percentualArea: areaTotal > 0 ? Math.round((c8Area / areaTotal) * 1000) / 10 : 0,
      fatorHomogeneizacao: 0.12,
      valorUnitarioEstimadoBrl: Math.round(basePriceHa * 0.12),
      valorTotalEstimadoBrl: Math.round(c8Area * basePriceHa * 0.12),
      declividadePredominante: 'Escarposo / Encostas / APPs',
      restricoesManejo: 'Preservação permanente obrigatória conforme Código Florestal (Lei 12.651/2012)',
    },
  ];
};

// Helper to generate default land utilization balance
const createDefaultAproveitamento = (areaTotal: number, basePriceHa: number): PericiaAproveitamentoImovel => {
  const lavoura = Math.round(areaTotal * 0.65 * 10) / 10;
  const pastagemFormada = Math.round(areaTotal * 0.10 * 10) / 10;
  const benfeitorias = Math.round(areaTotal * 0.02 * 10) / 10;
  const rl = Math.round(areaTotal * 0.20 * 10) / 10;
  const app = Math.max(0, Math.round((areaTotal - (lavoura + pastagemFormada + benfeitorias + rl)) * 10) / 10);
  const aproveitavelTotal = lavoura + pastagemFormada + benfeitorias;
  const coef = areaTotal > 0 ? (aproveitavelTotal / areaTotal) * 100 : 0;

  return {
    areaTotalHa: areaTotal,
    areaAgricultavelLavouraHa: lavoura,
    areaPastagemFormadaHa: pastagemFormada,
    areaPastagemNaturalHa: 0,
    areaSilviculturaHa: 0,
    areaBenfeitoriasEstruturasHa: benfeitorias,
    areaReservaLegalHa: rl,
    areaPreservacaoPermanenteHa: app,
    areaInaproveitavelOutrosHa: 0,
    areaAproveitavelTotalHa: aproveitavelTotal,
    coeficienteAproveitamentoPercent: Math.round(coef * 10) / 10,
    grauUtilizacaoTerraGutPercent: 88.5,
    moduloFiscalHa: 30.0,
    quantidadeModulosFiscais: Math.round((areaTotal / 30.0) * 10) / 10,
    fracaoMinimaParcelamentoHa: 3.0,
    observacoesAproveitamento: 'O imóvel apresenta alto coeficiente de aproveitamento econômico (77%), com predomínio de áreas agricultáveis mecanizáveis de Classes I e II, estando as áreas de preservação ambiental (Reserva Legal e APP) plenamente constituídas em conformidade com o Código Florestal (CAR ativo).',
    classesTerras: createDefaultClassesTerras(areaTotal, basePriceHa),
  };
};

interface PericiaSubmoduleAvaliacaoImovelProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaSubmoduleAvaliacaoImovel: React.FC<PericiaSubmoduleAvaliacaoImovelProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  // Safe initial structure for AvaliacaoImovel
  const avaliacao: PericiaAvaliacaoImovel = useMemo(() => {
    return (
      pericia.avaliacaoImovel || {
        avaliacaoJudicial: '',
        comportamentoMercado: '',
        valorizantesDesvalorizantes: '',
        precificacaoTerraNua: [],
      }
    );
  }, [pericia.avaliacaoImovel]);

  // Form State for registering a new sample
  const [newAmostra, setNewAmostra] = useState({
    amostra: '',
    areaTotalHa: '',
    aptidao: 'Lavoura de Grãos (Soja/Milho)',
    topografia: 'Plana (0 a 3%)',
    municipio: pericia.municipio ? `${pericia.municipio}/${pericia.uf || 'UF'}` : '',
    valorBrl: '',
    valorUnitario: '',
    tipoNegocio: 'Venda',
    imobiliaria: '',
    contato: '',
    observacoes: '',
  });

  // Mode for auto-calculation in form: 'totalToUnit' or 'unitToTotal'
  const [calcMode, setCalcMode] = useState<'totalToUnit' | 'unitToTotal'>('totalToUnit');

  // Inline editing state for table
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PericiaAmostraTerraNua | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');

  // Interactive Property Area for Land Value simulation (defaults to imovelAvaliado.areaTotal or 0)
  const [simulatedPropertyArea, setSimulatedPropertyArea] = useState<number>(
    pericia.imovelAvaliado?.areaTotal || pericia.objetoDescricao?.areaAfetadaHa || 0
  );

  // Submodule navigation tab: All 8 NBR 14653-3 components + Resumo Global + Fundamentação
  type AvaliacaoTabKey =
    | 'resumo_global'
    | 'inventario_ativos'
    | 'terra_nua'
    | 'classes_aproveitamento'
    | 'benfeitorias'
    | 'maquinas'
    | 'veiculos'
    | 'semoventes'
    | 'recursos'
    | 'frutos'
    | 'direitos'
    | 'fundamentacao';

  const [activeTab, setActiveTab] = useState<AvaliacaoTabKey>('resumo_global');

  // Success Notification banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to update avaliacao in pericia
  const updateAvaliacao = (updatedAvaliacao: PericiaAvaliacaoImovel) => {
    onUpdatePericia({
      ...pericia,
      avaliacaoImovel: updatedAvaliacao,
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Generic field update for textareas (judicial, mercado, valorizantes)
  const handleFieldChange = (field: keyof PericiaAvaliacaoImovel, value: string) => {
    updateAvaliacao({
      ...avaliacao,
      [field]: value,
    });
  };

  // Handle Form input changes with live auto-calculation of unit or total value
  const handleAreaChange = (val: string) => {
    const area = parseFloat(val);
    setNewAmostra(prev => {
      let nextTotal = prev.valorBrl;
      let nextUnit = prev.valorUnitario;

      if (!isNaN(area) && area > 0) {
        if (calcMode === 'totalToUnit' && prev.valorBrl) {
          const total = parseFloat(prev.valorBrl);
          if (!isNaN(total)) {
            nextUnit = (total / area).toFixed(2);
          }
        } else if (calcMode === 'unitToTotal' && prev.valorUnitario) {
          const unit = parseFloat(prev.valorUnitario);
          if (!isNaN(unit)) {
            nextTotal = (unit * area).toFixed(2);
          }
        }
      }

      return {
        ...prev,
        areaTotalHa: val,
        valorBrl: nextTotal,
        valorUnitario: nextUnit,
      };
    });
  };

  const handleValorBrlChange = (val: string) => {
    const total = parseFloat(val);
    const area = parseFloat(newAmostra.areaTotalHa);
    let unit = newAmostra.valorUnitario;
    if (!isNaN(total) && !isNaN(area) && area > 0) {
      unit = (total / area).toFixed(2);
    }
    setCalcMode('totalToUnit');
    setNewAmostra(prev => ({
      ...prev,
      valorBrl: val,
      valorUnitario: unit,
    }));
  };

  const handleValorUnitarioChange = (val: string) => {
    const unit = parseFloat(val);
    const area = parseFloat(newAmostra.areaTotalHa);
    let total = newAmostra.valorBrl;
    if (!isNaN(unit) && !isNaN(area) && area > 0) {
      total = (unit * area).toFixed(2);
    }
    setCalcMode('unitToTotal');
    setNewAmostra(prev => ({
      ...prev,
      valorUnitario: val,
      valorBrl: total,
    }));
  };

  // Add new sample to list
  const handleAddAmostra = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const area = parseFloat(newAmostra.areaTotalHa);
    const total = parseFloat(newAmostra.valorBrl);

    if (!newAmostra.amostra.trim() || isNaN(area) || area <= 0 || isNaN(total) || total <= 0) {
      alert('Por favor, preencha a identificação da Amostra, Área (ha) e Valor Total válidos.');
      return;
    }

    const calculatedUnit = total / area;

    const newItem: PericiaAmostraTerraNua = {
      id: `atn-${Date.now()}`,
      amostra: newAmostra.amostra.trim(),
      areaTotalHa: area,
      aptidao: newAmostra.aptidao,
      topografia: newAmostra.topografia,
      municipio: newAmostra.municipio.trim() || `${pericia.municipio}/${pericia.uf}`,
      valorBrl: total,
      valorUnitario: calculatedUnit,
      tipoNegocio: newAmostra.tipoNegocio,
      imobiliaria: newAmostra.imobiliaria.trim() || 'Pesquisa Direta de Campo',
      contato: newAmostra.contato.trim(),
      observacoes: newAmostra.observacoes.trim(),
      dataPesquisa: new Date().toISOString().split('T')[0],
    };

    updateAvaliacao({
      ...avaliacao,
      precificacaoTerraNua: [...(avaliacao.precificacaoTerraNua || []), newItem],
    });

    // Reset Form
    setNewAmostra({
      amostra: '',
      areaTotalHa: '',
      aptidao: 'Lavoura de Grãos (Soja/Milho)',
      topografia: 'Plana (0 a 3%)',
      municipio: pericia.municipio ? `${pericia.municipio}/${pericia.uf || 'UF'}` : '',
      valorBrl: '',
      valorUnitario: '',
      tipoNegocio: 'Venda',
      imobiliaria: '',
      contato: '',
      observacoes: '',
    });

    showNotification(`Amostra "${newItem.amostra}" cadastrada com sucesso!`);
  };

  // Remove Sample
  const handleRemoveAmostra = (id: string) => {
    const target = avaliacao.precificacaoTerraNua?.find(item => item.id === id);
    if (!target) return;
    if (window.confirm(`Deseja realmente excluir a amostra "${target.amostra}"?`)) {
      updateAvaliacao({
        ...avaliacao,
        precificacaoTerraNua: (avaliacao.precificacaoTerraNua || []).filter(item => item.id !== id),
      });
      showNotification(`Amostra "${target.amostra}" removida.`);
    }
  };

  // Duplicate Sample
  const handleDuplicateAmostra = (item: PericiaAmostraTerraNua) => {
    const duplicated: PericiaAmostraTerraNua = {
      ...item,
      id: `atn-${Date.now()}`,
      amostra: `${item.amostra} (Cópia)`,
    };
    updateAvaliacao({
      ...avaliacao,
      precificacaoTerraNua: [...(avaliacao.precificacaoTerraNua || []), duplicated],
    });
    showNotification(`Amostra "${item.amostra}" duplicada.`);
  };

  // Start Editing inline
  const handleStartEdit = (item: PericiaAmostraTerraNua) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  // Save Inline Edit
  const handleSaveEdit = () => {
    if (!editingData || !editingId) return;
    const area = Number(editingData.areaTotalHa) || 1;
    const total = Number(editingData.valorBrl) || 0;
    const recalculatedUnit = total / area;

    const updatedList = (avaliacao.precificacaoTerraNua || []).map(item => {
      if (item.id === editingId) {
        return {
          ...editingData,
          areaTotalHa: area,
          valorBrl: total,
          valorUnitario: recalculatedUnit,
        };
      }
      return item;
    });

    updateAvaliacao({
      ...avaliacao,
      precificacaoTerraNua: updatedList,
    });

    setEditingId(null);
    setEditingData(null);
    showNotification('Amostra atualizada na tabela.');
  };

  // In-line edit field change with live recalculation of unit value
  const handleInlineChange = (field: keyof PericiaAmostraTerraNua, value: any) => {
    if (!editingData) return;
    const updated = { ...editingData, [field]: value };
    if (field === 'areaTotalHa' || field === 'valorBrl') {
      const area = field === 'areaTotalHa' ? Number(value) : Number(updated.areaTotalHa);
      const total = field === 'valorBrl' ? Number(value) : Number(updated.valorBrl);
      if (area > 0 && total > 0) {
        updated.valorUnitario = total / area;
      }
    }
    setEditingData(updated);
  };

  // Quick Seed: Load Realistic Region Samples
  const handleLoadMarketSamples = () => {
    const munic = pericia.municipio ? `${pericia.municipio}/${pericia.uf || 'GO'}` : 'Cristalina/GO';
    const sampleItems: PericiaAmostraTerraNua[] = [
      {
        id: `atn-demo-1`,
        amostra: 'Amostra 01 - Fazenda São Bento',
        areaTotalHa: 450.0,
        aptidao: 'Lavoura de Grãos (Soja/Milho)',
        topografia: 'Plana (0 a 3%)',
        municipio: munic,
        valorBrl: 21600000,
        valorUnitario: 48000,
        tipoNegocio: 'Venda',
        imobiliaria: 'Terra Capital Imóveis Rurais',
        contato: '(61) 99821-4400',
        observacoes: 'Terra roxa mecanizável, índice pluviométrico 1.750mm/ano, a 8 km do asfalto.',
        dataPesquisa: new Date().toISOString().split('T')[0],
      },
      {
        id: `atn-demo-2`,
        amostra: 'Amostra 02 - Gleba Rio Manso',
        areaTotalHa: 620.0,
        aptidao: 'Lavoura de Grãos (Pivô Central)',
        topografia: 'Plana (0 a 3%)',
        municipio: munic,
        valorBrl: 32240000,
        valorUnitario: 52000,
        tipoNegocio: 'Oferta',
        imobiliaria: 'AgroFazendas Consultoria',
        contato: '(61) 98114-5500',
        observacoes: 'Outorga d’água aprovada para 2 pivôs de 90 ha. Energia trifásica conectada.',
        dataPesquisa: new Date().toISOString().split('T')[0],
      },
      {
        id: `atn-demo-3`,
        amostra: 'Amostra 03 - Fazenda Santa Luzia',
        areaTotalHa: 380.0,
        aptidao: 'Lavoura de Grãos (Sequeiro)',
        topografia: 'Suave-Ondulada (3 a 8%)',
        municipio: munic,
        valorBrl: 16720000,
        valorUnitario: 44000,
        tipoNegocio: 'Venda',
        imobiliaria: 'Corretor Regional Carlos Andrade',
        contato: '(64) 99201-3131',
        observacoes: 'Área consolidada há mais de 12 safras, argila 45% a 50%.',
        dataPesquisa: new Date().toISOString().split('T')[0],
      },
      {
        id: `atn-demo-4`,
        amostra: 'Amostra 04 - Fazenda Boa Esperança',
        areaTotalHa: 800.0,
        aptidao: 'Mista (Grãos e Integração Pecuária)',
        topografia: 'Suave-Ondulada (3 a 8%)',
        municipio: munic,
        valorBrl: 33600000,
        valorUnitario: 42000,
        tipoNegocio: 'Oferta',
        imobiliaria: 'Imobiliária Rural Planalto Central',
        contato: '(61) 3612-8899',
        observacoes: '500 ha em agricultura e 300 ha em pastagem rotacionada.',
        dataPesquisa: new Date().toISOString().split('T')[0],
      },
      {
        id: `atn-demo-5`,
        amostra: 'Amostra 05 - Estância Alvorada',
        areaTotalHa: 290.0,
        aptidao: 'Lavoura de Grãos (Soja/Feijão)',
        topografia: 'Plana (0 a 3%)',
        municipio: munic,
        valorBrl: 13920000,
        valorUnitario: 48000,
        tipoNegocio: 'Venda',
        imobiliaria: 'AgroCorretores Associados',
        contato: '(61) 98765-4321',
        observacoes: 'Margem de rodovia estadual pavimentada, excelente logística.',
        dataPesquisa: new Date().toISOString().split('T')[0],
      },
    ];

    updateAvaliacao({
      ...avaliacao,
      comportamentoMercado:
        avaliacao.comportamentoMercado ||
        `O mercado de imóveis rurais em ${munic} apresenta forte liquidez para áreas com aptidão para lavoura de grãos e solos de alta fertilidade (argila acima de 40%). Constata-se valorização anual média de 12% a 15% nos últimos 3 anos, puxada pela expansão da cultura da soja e feijão irrigado. A demanda por arrendamentos supera a oferta de terras disponíveis, com contratos girando entre 14 a 18 sc de soja por hectare/ano.`,
      valorizantesDesvalorizantes:
        avaliacao.valorizantesDesvalorizantes ||
        `Fatores Valorizantes: Solos de textura argilosa (>40%), relevo predominantemente plano a suave-ondulado favorecendo colheita mecanizada, presença de rodovias pavimentadas para escoamento da safra e proximidade de polos de recebimento de grãos (tradings e cooperativas).\n\nFatores Desvalorizantes: Ocorrência de manchas localizadas de cascalho em alguns talhões limítrofes e presença de restrições de APP ao longo dos corpos hídricos.`,
      avaliacaoJudicial:
        avaliacao.avaliacaoJudicial ||
        `Avaliação pericial realizada mediante Método Comparativo Direto de Dados de Mercado (NBR 14653-3 da ABNT), com amostragem coletada junto aos principais operadores imobiliários do agronegócio da comarca. O objetivo é estabelecer o valor venal e de terra nua praticado no município na data do fato gerador.`,
      precificacaoTerraNua: sampleItems,
    });

    showNotification('5 amostras representativas de mercado carregadas com sucesso!');
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const list = avaliacao.precificacaoTerraNua || [];
    if (list.length === 0) {
      alert('Nenhuma amostra para exportar.');
      return;
    }

    const headers = [
      'Amostra',
      'Area_ha',
      'Aptidao',
      'Topografia',
      'Municipio',
      'Valor_Total_BRL',
      'Valor_Unitario_BRL_ha',
      'Tipo_Negocio',
      'Imobiliaria_Fonte',
      'Contato',
      'Observacoes',
    ];

    const rows = list.map(item => {
      const unit = item.areaTotalHa > 0 ? item.valorBrl / item.areaTotalHa : 0;
      return [
        `"${item.amostra.replace(/"/g, '""')}"`,
        item.areaTotalHa,
        `"${item.aptidao}"`,
        `"${item.topografia}"`,
        `"${item.municipio}"`,
        item.valorBrl,
        unit.toFixed(2),
        `"${item.tipoNegocio}"`,
        `"${item.imobiliaria.replace(/"/g, '""')}"`,
        `"${(item.contato || '').replace(/"/g, '""')}"`,
        `"${(item.observacoes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `precificacao_terra_nua_${pericia.codigoPericia}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Tabela exportada para CSV com sucesso!');
  };

  // Filtered List of Samples
  const filteredSamples = useMemo(() => {
    const list = avaliacao.precificacaoTerraNua || [];
    return list.filter(item => {
      const matchesSearch =
        searchTerm === '' ||
        item.amostra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.imobiliaria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aptidao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo = filterTipo === 'todos' || item.tipoNegocio === filterTipo;

      return matchesSearch && matchesTipo;
    });
  }, [avaliacao.precificacaoTerraNua, searchTerm, filterTipo]);

  // Statistical Calculations & Land Price Averages (NBR 14653)
  const stats = useMemo(() => {
    const list = avaliacao.precificacaoTerraNua || [];
    if (list.length === 0) {
      return {
        totalAmostras: 0,
        areaTotalAmostrada: 0,
        valorTotalAmostrado: 0,
        mediaSimplesPorHa: 0,
        mediaPonderadaPorHa: 0,
        medianaPorHa: 0,
        desvioPadrao: 0,
        coeficienteVariacao: 0,
        valorMinimoHa: 0,
        valorMaximoHa: 0,
        isHomogeneo: true,
        valorTotalImovelEstimado: 0,
      };
    }

    const unitValues = list.map(item => {
      const area = item.areaTotalHa > 0 ? item.areaTotalHa : 1;
      return item.valorBrl / area;
    });

    const totalAmostras = list.length;
    const areaTotalAmostrada = list.reduce((acc, curr) => acc + (curr.areaTotalHa || 0), 0);
    const valorTotalAmostrado = list.reduce((acc, curr) => acc + (curr.valorBrl || 0), 0);

    // 1. Média Simples por hectare
    const somaUnitarios = unitValues.reduce((acc, curr) => acc + curr, 0);
    const mediaSimplesPorHa = somaUnitarios / totalAmostras;

    // 2. Média Ponderada por hectare (Valor Total acumulado / Área Total acumulada)
    const mediaPonderadaPorHa =
      areaTotalAmostrada > 0 ? valorTotalAmostrado / areaTotalAmostrada : mediaSimplesPorHa;

    // 3. Mediana
    const sorted = [...unitValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianaPorHa =
      sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // 4. Desvio Padrão Amostral
    let desvioPadrao = 0;
    if (totalAmostras > 1) {
      const somaQuadrados = unitValues.reduce(
        (acc, curr) => acc + Math.pow(curr - mediaSimplesPorHa, 2),
        0
      );
      desvioPadrao = Math.sqrt(somaQuadrados / (totalAmostras - 1));
    }

    // 5. Coeficiente de Variação (CV %) = (Desvio Padrão / Média) * 100
    const coeficienteVariacao =
      mediaSimplesPorHa > 0 ? (desvioPadrao / mediaSimplesPorHa) * 100 : 0;

    // NBR 14653 recomenda CV <= 30% para amostragem homogênea
    const isHomogeneo = coeficienteVariacao <= 30;

    const valorMinimoHa = sorted[0];
    const valorMaximoHa = sorted[sorted.length - 1];

    // Estimativa da área periciada
    const valorTotalImovelEstimado = simulatedPropertyArea * mediaSimplesPorHa;

    return {
      totalAmostras,
      areaTotalAmostrada,
      valorTotalAmostrado,
      mediaSimplesPorHa,
      mediaPonderadaPorHa,
      medianaPorHa,
      desvioPadrao,
      coeficienteVariacao,
      valorMinimoHa,
      valorMaximoHa,
      isHomogeneo,
      valorTotalImovelEstimado,
    };
  }, [avaliacao.precificacaoTerraNua, simulatedPropertyArea]);

  // Base price and property area for Land Capability and Utilization
  const baseLandPrice = stats.mediaSimplesPorHa > 0 ? stats.mediaSimplesPorHa : 45000;
  const propertyArea = pericia.imovelAvaliado?.areaTotal || simulatedPropertyArea || pericia.objetoDescricao?.areaAfetadaHa || 0;

  const aproveitamento: PericiaAproveitamentoImovel = useMemo(() => {
    if (avaliacao.aproveitamentoTerras) {
      return avaliacao.aproveitamentoTerras;
    }
    return createDefaultAproveitamento(propertyArea, baseLandPrice);
  }, [avaliacao.aproveitamentoTerras, propertyArea, baseLandPrice]);

  const updateAproveitamento = (updated: PericiaAproveitamentoImovel) => {
    updateAvaliacao({
      ...avaliacao,
      aproveitamentoTerras: updated,
    });
  };

  const handleAproveitamentoFieldChange = (field: keyof PericiaAproveitamentoImovel, value: any) => {
    const updated: PericiaAproveitamentoImovel = {
      ...aproveitamento,
      [field]: value,
    };
    // Recalculate totals
    const lavoura = Number(field === 'areaAgricultavelLavouraHa' ? value : updated.areaAgricultavelLavouraHa || 0);
    const pastagemFormada = Number(field === 'areaPastagemFormadaHa' ? value : updated.areaPastagemFormadaHa || 0);
    const pastagemNatural = Number(field === 'areaPastagemNaturalHa' ? value : updated.areaPastagemNaturalHa || 0);
    const silvicultura = Number(field === 'areaSilviculturaHa' ? value : updated.areaSilviculturaHa || 0);
    const benfeitorias = Number(field === 'areaBenfeitoriasEstruturasHa' ? value : updated.areaBenfeitoriasEstruturasHa || 0);
    const areaTotal = Number(field === 'areaTotalHa' ? value : updated.areaTotalHa || propertyArea);

    const aproveitavelTotal = lavoura + pastagemFormada + pastagemNatural + silvicultura + benfeitorias;
    const coef = areaTotal > 0 ? (aproveitavelTotal / areaTotal) * 100 : 0;
    const modulo = Number(updated.moduloFiscalHa || 30);
    const qtdModulos = modulo > 0 ? areaTotal / modulo : 0;

    updated.areaAproveitavelTotalHa = Math.round(aproveitavelTotal * 10) / 10;
    updated.coeficienteAproveitamentoPercent = Math.round(coef * 10) / 10;
    updated.quantidadeModulosFiscais = Math.round(qtdModulos * 10) / 10;

    updateAproveitamento(updated);
  };

  const handleClassAreaChange = (classId: string, newAreaHa: number) => {
    const totalArea = aproveitamento.areaTotalHa || propertyArea;
    const updatedClasses = aproveitamento.classesTerras.map(item => {
      if (item.id === classId) {
        const area = Math.max(0, newAreaHa);
        const percent = totalArea > 0 ? (area / totalArea) * 100 : 0;
        const valorUnit = item.valorUnitarioEstimadoBrl || Math.round(baseLandPrice * item.fatorHomogeneizacao);
        const valorTotal = Math.round(area * valorUnit);
        return {
          ...item,
          areaHa: area,
          percentualArea: Math.round(percent * 10) / 10,
          valorTotalEstimadoBrl: valorTotal,
        };
      }
      return item;
    });

    updateAproveitamento({
      ...aproveitamento,
      classesTerras: updatedClasses,
    });
  };

  const handleLoadDefaultClassesAndAproveitamento = () => {
    const defaultData = createDefaultAproveitamento(propertyArea, baseLandPrice);
    updateAproveitamento(defaultData);
    showNotification('Classe de Terras e Aproveitamento preenchidos com parâmetros típicos da NBR 14653-3!');
  };

  const valorTotalPonderadoTerras = useMemo(() => {
    if (!aproveitamento.classesTerras || aproveitamento.classesTerras.length === 0) return 0;
    return aproveitamento.classesTerras.reduce((acc, curr) => acc + (curr.valorTotalEstimadoBrl || 0), 0);
  }, [aproveitamento.classesTerras]);

  const somaAreaClasses = useMemo(() => {
    if (!aproveitamento.classesTerras || aproveitamento.classesTerras.length === 0) return 0;
    return aproveitamento.classesTerras.reduce((acc, curr) => acc + (curr.areaHa || 0), 0);
  }, [aproveitamento.classesTerras]);

  return (
    <div id="submodulo-avaliacao-imovel" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-emerald-150">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header / Card Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              <span>Engenharia de Avaliações Rurais • ABNT NBR 14653-3</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Submódulo: Avaliação do Imóvel e Precificação da Terra Nua
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl">
              Coleta de dados de mercado, homogeneização de amostras imobiliárias rurais, cálculo
              automático do valor médio do hectare e valoração pericial do imóvel periciado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadMarketSamples}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Carregar Amostras Típicas
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!avaliacao.precificacaoTerraNua || avaliacao.precificacaoTerraNua.length === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Dynamic Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Preço Médio da Terra
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {stats.mediaSimplesPorHa.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
              <span className="text-xs font-normal text-slate-400">/ha</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Média simples de {stats.totalAmostras} amostras
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Média Ponderada
            </span>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">
              {stats.mediaPonderadaPorHa.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
              <span className="text-xs font-normal text-slate-400">/ha</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Ponderado por {stats.areaTotalAmostrada.toLocaleString('pt-BR')} ha
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Homogeneidade (CV %)
            </span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1 flex items-center gap-2">
              {stats.coeficienteVariacao.toFixed(1)}%
              {stats.totalAmostras > 1 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    stats.isHomogeneo
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {stats.isHomogeneo ? 'Homogêneo' : 'Disperso'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Desvio Padrão: {stats.desvioPadrao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/80 to-blue-950/80 border border-emerald-600/40 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
              Valor da Propriedade Periciada
            </span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {stats.valorTotalImovelEstimado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              })}
            </div>
            <span className="text-[10px] text-emerald-200/80 mt-0.5 block">
              Para {simulatedPropertyArea.toLocaleString('pt-BR')} ha de terra nua
            </span>
          </div>
        </div>
      </div>

      {/* SUBMODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('resumo_global')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'resumo_global'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-emerald-200 dark:border-emerald-800/60'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-emerald-600" />
          <span>Resumo Global</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventario_ativos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'inventario_ativos'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Inventário de Ativos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
            {pericia.inventarioAtivos?.length ||
              (avaliacao.maquinasEquipamentos?.length || 0) + (avaliacao.veiculos?.length || 0) ||
              13}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terra_nua')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'terra_nua'
              ? 'bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>5.2.1 Terra Nua</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classes_aproveitamento')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'classes_aproveitamento'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>5.2.2 Capacidade & Uso</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('benfeitorias')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'benfeitorias'
              ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-amber-500" />
          <span>5.2.3 Benfeitorias</span>
          {(avaliacao.benfeitorias?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
              {avaliacao.benfeitorias?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maquinas')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'maquinas'
              ? 'bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Tractor className="w-4 h-4 text-blue-500" />
          <span>5.2.4 Máquinas</span>
          {(avaliacao.maquinasEquipamentos?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
              {avaliacao.maquinasEquipamentos?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('veiculos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'veiculos'
              ? 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-500" />
          <span>5.2.5 Veículos</span>
          {(avaliacao.veiculos?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono">
              {avaliacao.veiculos?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('semoventes')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'semoventes'
              ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-600" />
          <span>5.2.6 Semoventes</span>
          {(avaliacao.semoventes?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
              {avaliacao.semoventes?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recursos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'recursos'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>5.2.7 Rec. Naturais</span>
          {(avaliacao.recursosNaturais?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
              {avaliacao.recursosNaturais?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frutos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'frutos'
              ? 'bg-white dark:bg-zinc-900 text-lime-700 dark:text-lime-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-4 h-4 text-lime-600" />
          <span>5.2.8 Frutos</span>
          {(avaliacao.frutos?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-lime-100 dark:bg-lime-950 text-lime-800 dark:text-lime-300 font-mono">
              {avaliacao.frutos?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('direitos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'direitos'
              ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-purple-600" />
          <span>5.2.9 Direitos</span>
          {(avaliacao.direitos?.length || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono">
              {avaliacao.direitos?.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fundamentacao')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'fundamentacao'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <span>Parecer & Fundamentação</span>
        </button>
      </div>

      {/* TAB: RESUMO GLOBAL */}
      {activeTab === 'resumo_global' && (
        <AvaliacaoResumoGlobalTab
          avaliacao={avaliacao}
          areaTotalImovelHa={propertyArea}
          onUpdateAvaliacao={updateAvaliacao}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onShowNotification={showNotification}
        />
      )}

      {/* TAB 1: PRECIFICAÇÃO DA TERRA NUA & AMOSTRAS DE MERCADO */}
      {activeTab === 'terra_nua' && (
        <div className="space-y-6">
          {/* FORMULÁRIO DE CADASTRO DE AMOSTRA DE TERRA NUA */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cadastrar Amostra de Mercado (Precificação da Terra Nua)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Insira os dados da pesquisa de mercado imobiliário regional para cálculo automático do valor unitário por hectare.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              * Campos Obrigatórios
            </span>
          </div>
        </div>

        <form onSubmit={handleAddAmostra} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Amostra Name */}
            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Identificação da Amostra / Imóvel Ofertado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Amostra 01 - Fazenda Morro Alto (Gleba Norte)"
                value={newAmostra.amostra}
                onChange={e => setNewAmostra({ ...newAmostra, amostra: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Área Total (ha) */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Área Total (ha) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ex: 450.00"
                value={newAmostra.areaTotalHa}
                onChange={e => handleAreaChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Tipo de Negócio */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Tipo de Negócio *
              </label>
              <select
                value={newAmostra.tipoNegocio}
                onChange={e => setNewAmostra({ ...newAmostra, tipoNegocio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="Venda">Venda (Transação Efetiva)</option>
                <option value="Oferta">Oferta (Preço Pedido)</option>
                <option value="Permuta">Permuta</option>
                <option value="Arrendamento">Arrendamento</option>
                <option value="Leilão">Leilão Judicial</option>
              </select>
            </div>

            {/* Aptidão */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Aptidão Agrícola
              </label>
              <select
                value={newAmostra.aptidao}
                onChange={e => setNewAmostra({ ...newAmostra, aptidao: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="Lavoura de Grãos (Soja/Milho)">Lavoura de Grãos (Soja/Milho)</option>
                <option value="Lavoura Irrigada (Pivô Central)">Lavoura Irrigada (Pivô Central)</option>
                <option value="Silvicultura (Eucalipto)">Silvicultura (Eucalipto)</option>
                <option value="Pecuária (Pastagem)">Pecuária (Pastagem)</option>
                <option value="Fruticultura / HF">Fruticultura / HF</option>
                <option value="Mista (Grãos e Pecuária)">Mista (Grãos e Pecuária)</option>
              </select>
            </div>

            {/* Topografia */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Topografia / Relevo
              </label>
              <select
                value={newAmostra.topografia}
                onChange={e => setNewAmostra({ ...newAmostra, topografia: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="Plana (0 a 3%)">Plana (0 a 3%)</option>
                <option value="Suave-Ondulada (3 a 8%)">Suave-Ondulada (3 a 8%)</option>
                <option value="Ondulada (8 a 20%)">Ondulada (8 a 20%)</option>
                <option value="Acidentada (> 20%)">Acidentada (&gt; 20%)</option>
              </select>
            </div>

            {/* Município */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Município / UF *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cristalina/GO"
                value={newAmostra.municipio}
                onChange={e => setNewAmostra({ ...newAmostra, municipio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Imobiliária / Fonte */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Imobiliária / Corretor / Fonte
              </label>
              <input
                type="text"
                placeholder="Ex: Terra Nobre Imóveis Rurais"
                value={newAmostra.imobiliaria}
                onChange={e => setNewAmostra({ ...newAmostra, imobiliaria: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Valor Total (R$) */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center justify-between mb-1">
                <label className="text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                  Valor Total (R$) *
                </label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  Montante Global
                </span>
              </div>
              <input
                type="number"
                step="1000"
                min="100"
                required
                placeholder="Ex: 21600000"
                value={newAmostra.valorBrl}
                onChange={e => handleValorBrlChange(e.target.value)}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-lg font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Valor Unitário (R$/ha) - Auto Calculated or Typed */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/40">
              <div className="flex items-center justify-between mb-1">
                <label className="text-blue-900 dark:text-blue-300 font-bold text-xs">
                  Valor Unitário (R$/ha)
                </label>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono">
                  Auto-Calculado
                </span>
              </div>
              <input
                type="number"
                step="100"
                placeholder="Ex: 48000"
                value={newAmostra.valorUnitario}
                onChange={e => handleValorUnitarioChange(e.target.value)}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-lg font-mono font-bold text-blue-800 dark:text-blue-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Contato / Telefone */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Contato / Telefone
              </label>
              <input
                type="text"
                placeholder="Ex: (61) 99821-4400"
                value={newAmostra.contato}
                onChange={e => setNewAmostra({ ...newAmostra, contato: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-bold mb-1">
                Observações de Campo / Benfeitorias
              </label>
              <input
                type="text"
                placeholder="Ex: Solo com 45% de argila, poço artesiano, casa sede..."
                value={newAmostra.observacoes}
                onChange={e => setNewAmostra({ ...newAmostra, observacoes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-250 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              <span>
                O valor unitário é obtido automaticamente dividindo o Valor Total pela Área. Você
                também pode digitar o valor unitário para calcular o valor global.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Amostra à Tabela
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TABELA EDITÁVEL DE PRECIFICAÇÃO DA TERRA NUA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Tabela de Amostragem de Mercado da Terra Nua ({filteredSamples.length} Amostras)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Permite editar diretamente os valores, duplicar amostras ou excluir registros para homogeneização técnica.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar amostra, município, imobiliária..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-250 dark:border-zinc-700 rounded-xl text-xs w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-zinc-800 border border-slate-250 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Negócios</option>
              <option value="Venda">Somente Venda</option>
              <option value="Oferta">Somente Oferta</option>
              <option value="Permuta">Somente Permuta</option>
              <option value="Arrendamento">Somente Arrendamento</option>
            </select>
          </div>
        </div>

        {/* The Editable Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Amostra</th>
                <th className="p-3">Área (ha)</th>
                <th className="p-3">Aptidão</th>
                <th className="p-3">Topografia</th>
                <th className="p-3">Município</th>
                <th className="p-3">Valor Total (R$)</th>
                <th className="p-3 text-right">Valor Unitário (R$/ha)</th>
                <th className="p-3">Negócio</th>
                <th className="p-3">Imobiliária / Fonte</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Landmark className="w-8 h-8 text-slate-300 dark:text-zinc-600 stroke-[1.5]" />
                      <p className="font-semibold text-xs">
                        Nenhuma amostra encontrada com os filtros selecionados.
                      </p>
                      <button
                        onClick={handleLoadMarketSamples}
                        className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-100 cursor-pointer"
                      >
                        Carregar Amostras Típicas da Região
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSamples.map((item, idx) => {
                  const isEditing = editingId === item.id;
                  const unitVal = item.areaTotalHa > 0 ? item.valorBrl / item.areaTotalHa : 0;

                  // Highlighting check against average (deviation > 25%)
                  const deviationPercent =
                    stats.mediaSimplesPorHa > 0
                      ? Math.abs(unitVal - stats.mediaSimplesPorHa) / stats.mediaSimplesPorHa
                      : 0;
                  const isOutlier = deviationPercent > 0.25;

                  if (isEditing && editingData) {
                    return (
                      <tr
                        key={item.id}
                        className="bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-[11px]"
                      >
                        <td className="p-2">
                          <input
                            type="text"
                            value={editingData.amostra}
                            onChange={e => handleInlineChange('amostra', e.target.value)}
                            className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.areaTotalHa}
                            onChange={e => handleInlineChange('areaTotalHa', e.target.value)}
                            className="w-20 p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded font-mono font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editingData.aptidao}
                            onChange={e => handleInlineChange('aptidao', e.target.value)}
                            className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editingData.topografia}
                            onChange={e => handleInlineChange('topografia', e.target.value)}
                            className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editingData.municipio}
                            onChange={e => handleInlineChange('municipio', e.target.value)}
                            className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editingData.valorBrl}
                            onChange={e => handleInlineChange('valorBrl', e.target.value)}
                            className="w-28 p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded font-mono font-bold text-emerald-700"
                          />
                        </td>
                        <td className="p-2 font-mono font-bold text-right text-blue-700 dark:text-blue-400">
                          {editingData.areaTotalHa > 0
                            ? (editingData.valorBrl / editingData.areaTotalHa).toLocaleString(
                                'pt-BR',
                                { style: 'currency', currency: 'BRL' }
                              )
                            : 'R$ 0,00'}
                          /ha
                        </td>
                        <td className="p-2">
                          <select
                            value={editingData.tipoNegocio}
                            onChange={e => handleInlineChange('tipoNegocio', e.target.value)}
                            className="p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded"
                          >
                            <option value="Venda">Venda</option>
                            <option value="Oferta">Oferta</option>
                            <option value="Permuta">Permuta</option>
                            <option value="Arrendamento">Arrendamento</option>
                            <option value="Leilão">Leilão</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editingData.imobiliaria}
                            onChange={e => handleInlineChange('imobiliaria', e.target.value)}
                            className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-300 rounded"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              title="Salvar alterações"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              title="Cancelar edição"
                              className="p-1.5 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-150 dark:border-zinc-800/60 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 text-[11px] transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                          {item.amostra}
                        </span>
                        {item.observacoes && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {item.observacoes}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {item.areaTotalHa.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}{' '}
                        ha
                      </td>
                      <td className="p-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {item.aptidao}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {item.topografia}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {item.municipio}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {item.valorBrl.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="p-3 font-mono font-bold text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              isOutlier
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {unitVal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                            /ha
                          </span>
                          {isOutlier && (
                            <span title="Dispersão superior a 25% da média amostral">
                              <AlertTriangle className="w-3 h-3 text-amber-500 inline" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded font-bold text-[10px]">
                          {item.tipoNegocio}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-zinc-400">
                        <span className="block font-medium">{item.imobiliaria}</span>
                        {item.contato && (
                          <span className="text-[10px] text-slate-400">{item.contato}</span>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            title="Editar amostra"
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateAmostra(item)}
                            title="Duplicar amostra"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveAmostra(item.id)}
                            title="Excluir amostra"
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary / Homogeneization Calculations */}
        <div className="bg-slate-50 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-700 pb-3">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Quadro de Homogeneização Estatística (NBR 14653-3)
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Determinação do valor unitário por hectare representativo da terra nua na comarca periciada.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Simulação da Propriedade:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={simulatedPropertyArea}
                  onChange={e => setSimulatedPropertyArea(parseFloat(e.target.value) || 0)}
                  className="w-24 p-1.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-right"
                />
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">ha</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Média Simples</span>
              <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
                {stats.mediaSimplesPorHa.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
                /ha
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Média Ponderada</span>
              <span className="text-sm font-bold font-mono text-blue-700 dark:text-blue-400 mt-1 block">
                {stats.mediaPonderadaPorHa.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
                /ha
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mediana da Amostra</span>
              <span className="text-sm font-bold font-mono text-purple-700 dark:text-purple-400 mt-1 block">
                {stats.medianaPorHa.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
                /ha
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Amplitude Amostral</span>
              <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-zinc-300 mt-1 block">
                {stats.valorMinimoHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} a{' '}
                {stats.valorMaximoHa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Coeficiente Variação</span>
              <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                {stats.coeficienteVariacao.toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">
                Terra Nua Avaliada
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1 block">
                {stats.valorTotalImovelEstimado.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* TAB 2: CLASSE DE TERRAS E APROVEITAMENTO (NBR 14653-3 & SISTEMA LEPSCH) */}
  {activeTab === 'classes_aproveitamento' && (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ABNT NBR 14653-3 • Sistema Lepsch / USDA / INCRA</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              5.2.2 Capacidade de Uso das Terras e Aproveitamento da Propriedade
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Balanço de ocupação da propriedade, classificação nas 8 classes de capacidade de uso e valoração ponderada da terra nua conforme a aptidão edafoclimática e declividade.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDefaultClassesAndAproveitamento}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Carregar distribuição de classes e balanço típico da região"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Carregar Parâmetros Típicos
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Área Total do Imóvel
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {(aproveitamento.areaTotalHa || propertyArea).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-400">ha</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {aproveitamento.quantidadeModulosFiscais || Math.round(((aproveitamento.areaTotalHa || propertyArea) / 30) * 10) / 10} Módulos Fiscais
            </span>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Área Aproveitável Total
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-200">
                {(aproveitamento.areaAproveitavelTotalHa || 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400">ha</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
              Coeficiente: {aproveitamento.coeficienteAproveitamentoPercent || 0}% da gleba
            </span>
          </div>

          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Preservação (APP + RL)
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-blue-900 dark:text-blue-200">
                {(Number(aproveitamento.areaReservaLegalHa || 0) + Number(aproveitamento.areaPreservacaoPermanenteHa || 0)).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-400">ha</span>
            </div>
            <span className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
              {aproveitamento.areaTotalHa > 0
                ? (((Number(aproveitamento.areaReservaLegalHa || 0) + Number(aproveitamento.areaPreservacaoPermanenteHa || 0)) / aproveitamento.areaTotalHa) * 100).toFixed(1)
                : '0.0'}% da propriedade
            </span>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 to-slate-900 text-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Valor Ponderado pelas Classes
            </span>
            <div className="mt-1">
              <span className="text-lg font-black font-mono text-emerald-300 block">
                {valorTotalPonderadoTerras.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">
                Média: {(somaAreaClasses > 0 ? valorTotalPonderadoTerras / somaAreaClasses : baseLandPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}/ha
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: BALANÇO DE OCUPAÇÃO E APROVEITAMENTO DO IMÓVEL */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-150 dark:border-zinc-800 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            1. Balanço de Ocupação e Aproveitamento Global da Gleba
          </h4>
          <span className="text-[11px] text-slate-500">
            Valores em Hectares (ha)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Área Total do Imóvel (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaTotalHa ?? propertyArea}
              onChange={e => handleAproveitamentoFieldChange('areaTotalHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Lavouras / Anuais (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaAgricultavelLavouraHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaAgricultavelLavouraHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Pastagem Formada (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaPastagemFormadaHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaPastagemFormadaHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Pastagem Natural / Campo (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaPastagemNaturalHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaPastagemNaturalHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Silvicultura / Floresta (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaSilviculturaHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaSilviculturaHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Benfeitorias e Sedes (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaBenfeitoriasEstruturasHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaBenfeitoriasEstruturasHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Reserva Legal - RL (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaReservaLegalHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaReservaLegalHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-blue-700 dark:text-blue-400"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Preservação Permanente - APP (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaPreservacaoPermanenteHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaPreservacaoPermanenteHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-blue-700 dark:text-blue-400"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Áreas Inaproveitáveis (ha)</label>
            <input
              type="number"
              step="0.01"
              value={aproveitamento.areaInaproveitavelOutrosHa ?? ''}
              onChange={e => handleAproveitamentoFieldChange('areaInaproveitavelOutrosHa', parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Módulo Fiscal Região (ha)</label>
            <input
              type="number"
              step="1"
              value={aproveitamento.moduloFiscalHa ?? 30}
              onChange={e => handleAproveitamentoFieldChange('moduloFiscalHa', parseFloat(e.target.value) || 30)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: CLASSIFICAÇÃO DA CAPACIDADE DE USO DAS TERRAS (CLASSES I A VIII) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-zinc-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              2. Classes de Capacidade de Uso das Terras (ABNT NBR 14653-3)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Edite a área em hectares para cada classe identificada. O valor unitário e subtotal são calculados com base na terra nua de referência ({baseLandPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ha).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              Math.abs(somaAreaClasses - (aproveitamento.areaTotalHa || propertyArea)) < 0.5
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
            }`}>
              Soma das Classes: {somaAreaClasses.toFixed(1)} / {(aproveitamento.areaTotalHa || propertyArea).toFixed(1)} ha
            </span>
          </div>
        </div>

        {/* Land Classes Interactive Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700">
                <th className="p-3 font-bold">Classe & Grupo</th>
                <th className="p-3 font-bold">Aptidão Agronômica & Restrições</th>
                <th className="p-3 font-bold">Relevo</th>
                <th className="p-3 font-bold text-center w-28">Área (ha)</th>
                <th className="p-3 font-bold text-center w-20">% Gleba</th>
                <th className="p-3 font-bold text-center w-20">Fator</th>
                <th className="p-3 font-bold text-right">Unitário (R$/ha)</th>
                <th className="p-3 font-bold text-right">Subtotal (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {aproveitamento.classesTerras.map(item => {
                const isGrupoA = item.grupoUso.includes('Grupo A');
                const isGrupoB = item.grupoUso.includes('Grupo B');
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Classe & Grupo */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {item.classe}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase inline-block mt-0.5 ${
                        isGrupoA
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isGrupoB
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {isGrupoA ? 'Cultivável' : isGrupoB ? 'Pastil/Silv.' : 'Preservação'}
                      </span>
                    </td>

                    {/* Descrição */}
                    <td className="p-3 max-w-xs text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {item.descricaoUso}
                    </td>

                    {/* Declividade */}
                    <td className="p-3 text-slate-600 dark:text-zinc-300 text-[11px] whitespace-nowrap">
                      {item.declividadePredominante || '—'}
                    </td>

                    {/* Área (ha) Input */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.areaHa ?? 0}
                        onChange={e => handleClassAreaChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 p-1.5 text-center bg-slate-50 dark:bg-zinc-800 border border-slate-250 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </td>

                    {/* % Gleba */}
                    <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {(item.percentualArea || 0).toFixed(1)}%
                    </td>

                    {/* Fator Homogeneização */}
                    <td className="p-3 text-center font-mono text-slate-500">
                      {item.fatorHomogeneizacao.toFixed(2)}
                    </td>

                    {/* Valor Unitário Estimado */}
                    <td className="p-3 text-right font-mono font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                      {(item.valorUnitarioEstimadoBrl || Math.round(baseLandPrice * item.fatorHomogeneizacao)).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    {/* Subtotal */}
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {(item.valorTotalEstimadoBrl || Math.round((item.areaHa || 0) * (item.valorUnitarioEstimadoBrl || (baseLandPrice * item.fatorHomogeneizacao)))).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-zinc-800/90 font-bold border-t-2 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white">
                <td colSpan={3} className="p-3 text-right uppercase text-[11px] tracking-wider">
                  Total Geral Homogeneizado:
                </td>
                <td className="p-3 text-center font-mono text-sm text-emerald-700 dark:text-emerald-400">
                  {somaAreaClasses.toFixed(1)} ha
                </td>
                <td className="p-3 text-center font-mono">
                  {aproveitamento.areaTotalHa > 0 ? ((somaAreaClasses / aproveitamento.areaTotalHa) * 100).toFixed(1) : '100.0'}%
                </td>
                <td className="p-3 text-center font-mono text-xs text-slate-500">
                  —
                </td>
                <td className="p-3 text-right font-mono text-xs text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                  Méd. {(somaAreaClasses > 0 ? valorTotalPonderadoTerras / somaAreaClasses : baseLandPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}/ha
                </td>
                <td className="p-3 text-right font-mono text-sm text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                  {valorTotalPonderadoTerras.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SEÇÃO 3: PARECER TÉCNICO PERICIAL DE APTIDÃO E APROVEITAMENTO */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-150 dark:border-zinc-800 pb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            3. Parecer Pericial de Aptidão Agrícola e Aproveitamento Econômico
          </h4>
          <span className="text-[11px] text-slate-500">
            Fundamentação para o Laudo Pericial
          </span>
        </div>

        <textarea
          rows={4}
          value={aproveitamento.observacoesAproveitamento || ''}
          onChange={e => handleAproveitamentoFieldChange('observacoesAproveitamento', e.target.value)}
          placeholder="Descreva a capacidade de uso da gleba, adequabilidade das práticas agrícolas atuais, relevo predominante, conservação do solo e conformidade com o Código Florestal (CAR)..."
          className="w-full p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed text-xs"
        />
      </div>
    </div>
  )}

  {/* TAB 3: PARECER TÉCNICO E FUNDAMENTAÇÃO JUDICIAL */}
  {activeTab === 'fundamentacao' && (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-150 dark:border-zinc-800 pb-3">
        <Scale className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Fundamentação Pericial da Avaliação
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Avaliação Judicial */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 dark:text-zinc-200 font-bold">
            1. Avaliação Judicial / Justificativa Pericial
          </label>
          <textarea
            rows={5}
            value={avaliacao.avaliacaoJudicial || ''}
            onChange={e => handleFieldChange('avaliacaoJudicial', e.target.value)}
            placeholder="Descreva o propósito da avaliação no processo, instrução da lide, assistência técnica e fundamentação legal conforme o CPC e NBR 14653..."
            className="w-full p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
          />
        </div>

        {/* Comportamento do Mercado */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 dark:text-zinc-200 font-bold">
            2. Comportamento do Mercado de Imóveis Rurais
          </label>
          <textarea
            rows={5}
            value={avaliacao.comportamentoMercado || ''}
            onChange={e => handleFieldChange('comportamentoMercado', e.target.value)}
            placeholder="Descreva a liquidez do mercado local, pressão compradora, comportamento dos preços da saca de soja/arrendamento e tendências..."
            className="w-full p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
          />
        </div>

        {/* Valorizantes e Desvalorizantes */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 dark:text-zinc-200 font-bold">
            3. Fatores Valorizantes e Desvalorizantes
          </label>
          <textarea
            rows={5}
            value={avaliacao.valorizantesDesvalorizantes || ''}
            onChange={e => handleFieldChange('valorizantesDesvalorizantes', e.target.value)}
            placeholder="Fatores de valorização (rodovia pavimentada, energia trifásica, outorga hídrica) e de desvalorização (declividade acentuada, passivos ambientais)..."
            className="w-full p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
          />
        </div>
      </div>
    </div>
  )}

  {/* INVENTÁRIO DE ATIVOS UNIFICADO: MÁQUINAS, EQUIPAMENTOS E VEÍCULOS */}
  {activeTab === 'inventario_ativos' && (
    <PericiaInventarioAtivos
      pericia={pericia}
      onUpdatePericia={onUpdatePericia}
      onShowNotification={showNotification}
    />
  )}

  {/* COMPONENTES COMPLEMENTARES DA ABNT NBR 14653-3 */}
  {activeTab === 'benfeitorias' && (
    <AvaliacaoBenfeitoriasTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'maquinas' && (
    <AvaliacaoMaquinasTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'veiculos' && (
    <AvaliacaoVeiculosTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'semoventes' && (
    <AvaliacaoSemoventesTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'recursos' && (
    <AvaliacaoRecursosNaturaisTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'frutos' && (
    <AvaliacaoFrutosTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}

  {activeTab === 'direitos' && (
    <AvaliacaoDireitosTab
      avaliacao={avaliacao}
      onUpdateAvaliacao={updateAvaliacao}
      onShowNotification={showNotification}
    />
  )}
    </div>
  );
};
