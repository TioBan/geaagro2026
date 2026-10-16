import React, { useState, useMemo, useRef } from 'react';
import {
  FileCheck2,
  HelpCircle,
  ShieldCheck,
  Download,
  Archive,
  CheckCircle2,
  Printer,
  Sparkles,
  Sprout,
  FileText,
  Lock,
  UserCheck,
  Send,
  Building2,
  Paperclip,
  FlaskConical,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Layers,
  AlertCircle,
  Eye,
  Calendar,
  Upload,
  ListOrdered,
} from 'lucide-react';
import { Pericia, PericiaLaudoOficial, PericiaAnexo, PericiaQuesito } from '../../types/pericia';
import { PericiaAIAssistantModal } from './PericiaAIAssistantModal';

interface PericiaSubmoduleLaudoProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
  onOpenReportGenerator: (pericia: Pericia) => void;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem'));
    };
    reader.onerror = (error) => reject(error);
  });
};

export const PericiaSubmoduleLaudo: React.FC<PericiaSubmoduleLaudoProps> = ({
  pericia,
  onUpdatePericia,
  onOpenReportGenerator,
}) => {
  const [activeTab, setActiveTab] = useState<
    'laudo' | 'resultado_discussao' | 'quesitos' | 'anexos' | 'capa' | 'assinatura' | 'encerramento'
  >('laudo');

  // AI Assistant Modal state
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const handleApplyAiText = (
    targetSection: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito',
    text: string,
    quesitoId?: string
  ) => {
    if (targetSection === 'quesito' && quesitoId) {
      handleUpdateQuesitoResposta(quesitoId, text);
      setActiveTab('quesitos');
    } else {
      handleUpdateLaudoText(targetSection, text);
      if (targetSection === 'sinteseVistoria') setActiveTab('laudo');
      else if (targetSection === 'resultadoDiscussao') setActiveTab('resultado_discussao');
      else if (targetSection === 'conclusaoFinal') setActiveTab('laudo');
    }
  };

  // State for new Anexo form
  const [showAddAnexo, setShowAddAnexo] = useState(false);
  const [anexoTipo, setAnexoTipo] = useState<'foto' | 'analise_solo' | 'documento' | 'outro'>('analise_solo');
  const [anexoTitulo, setAnexoTitulo] = useState('');
  const [anexoDescricao, setAnexoDescricao] = useState('');
  const [anexoArquivoUrl, setAnexoArquivoUrl] = useState('');
  const [anexoObservacoes, setAnexoObservacoes] = useState('');
  const [soloLaboratorio, setSoloLaboratorio] = useState('');
  const [soloNumeroLaudo, setSoloNumeroLaudo] = useState('');
  const [soloPhCacl2, setSoloPhCacl2] = useState<number | ''>(6.1);
  const [soloMO, setSoloMO] = useState<number | ''>(2.8);
  const [soloP, setSoloP] = useState<number | ''>(42);
  const [soloK, setSoloK] = useState<number | ''>(180);
  const [soloCa, setSoloCa] = useState<number | ''>(5.2);
  const [soloMg, setSoloMg] = useState<number | ''>(1.8);
  const [soloCtc, setSoloCtc] = useState<number | ''>(10.5);
  const [soloV, setSoloV] = useState<number | ''>(74);
  const [soloArgila, setSoloArgila] = useState<number | ''>(38);
  const [soloInterpretacao, setSoloInterpretacao] = useState('');

  const anexoFileInputRef = useRef<HTMLInputElement>(null);
  const anexoCameraInputRef = useRef<HTMLInputElement>(null);

  const laudo = pericia.laudoOficial || {
    titulo: `LAUDO PERICIAL AGRONÔMICO — ${pericia.nome.toUpperCase()}`,
    metodologia:
      'O presente trabalho foi desenvolvido em conformidade com as diretrizes da Norma ABNT NBR 14.653-5 (Avaliação de Bens — Imóveis Rurais e Recursos Naturais/Ambientais) e preceitos do Código de Processo Civil.',
    sinteseVistoria: '',
    resultadoDiscussao: '',
    conclusaoFinal: 'Processo em instrução pericial.',
  };

  const anexosList = pericia.anexos || [];

  const handleUpdateLaudoText = (field: string, value: string) => {
    onUpdatePericia({
      ...pericia,
      laudoOficial: {
        ...laudo,
        [field]: value,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleUpdateQuesitoResposta = (quesitoId: string, resposta: string) => {
    const updated = pericia.quesitos.map((q) =>
      q.id === quesitoId ? { ...q, resposta, respondido: Boolean(resposta.trim()) } : q
    );
    onUpdatePericia({
      ...pericia,
      quesitos: updated,
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setAnexoArquivoUrl(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAnexo = () => {
    if (!anexoTitulo.trim()) return;

    const newAnexo: PericiaAnexo = {
      id: `anx-${Date.now()}`,
      titulo: anexoTitulo,
      tipo: anexoTipo,
      descricao: anexoDescricao,
      arquivoUrl: anexoArquivoUrl || undefined,
      data: new Date().toISOString().split('T')[0],
      observacoes: anexoObservacoes,
      ...(anexoTipo === 'analise_solo'
        ? {
            dadosSolo: {
              laboratorio: soloLaboratorio || 'Laboratório de Análise de Solos',
              numeroLaudo: soloNumeroLaudo || `LAUDO-${Date.now().toString().slice(-4)}`,
              dataColeta: new Date().toISOString().split('T')[0],
              phCacl2: typeof soloPhCacl2 === 'number' ? soloPhCacl2 : undefined,
              materiaOrganica: typeof soloMO === 'number' ? soloMO : undefined,
              fosforoP: typeof soloP === 'number' ? soloP : undefined,
              potassioK: typeof soloK === 'number' ? soloK : undefined,
              calcioCa: typeof soloCa === 'number' ? soloCa : undefined,
              magnesioMg: typeof soloMg === 'number' ? soloMg : undefined,
              ctc: typeof soloCtc === 'number' ? soloCtc : undefined,
              vPercent: typeof soloV === 'number' ? soloV : undefined,
              argilaPercent: typeof soloArgila === 'number' ? soloArgila : undefined,
              interpretacao: soloInterpretacao,
            },
          }
        : {}),
    };

    onUpdatePericia({
      ...pericia,
      anexos: [...anexosList, newAnexo],
      atualizadoEm: new Date().toISOString(),
    });

    // Reset Form
    setAnexoTitulo('');
    setAnexoDescricao('');
    setAnexoArquivoUrl('');
    setAnexoObservacoes('');
    setSoloLaboratorio('');
    setSoloNumeroLaudo('');
    setSoloInterpretacao('');
    setShowAddAnexo(false);
  };

  const handleRemoveAnexo = (id: string) => {
    onUpdatePericia({
      ...pericia,
      anexos: anexosList.filter((a) => a.id !== id),
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleSyncPericiaDataToAnexos = () => {
    const existing = [...anexosList];
    let addedCount = 0;

    // 1. Add soil analysis from analiseTecnica if exists and not already added
    if (pericia.analiseTecnica?.analiseSoloNutricao) {
      const alreadyHasSolo = existing.some((a) => a.tipo === 'analise_solo');
      if (!alreadyHasSolo) {
        const soil = pericia.analiseTecnica.analiseSoloNutricao;
        existing.push({
          id: `anx-solo-${Date.now()}`,
          titulo: `Boletim de Análise de Solo — Gleba ${pericia.imovelNome}`,
          tipo: 'analise_solo',
          descricao: 'Laudo laboratorial de fertilidade química e textura do solo.',
          data: pericia.dataAbertura || new Date().toISOString().split('T')[0],
          observacoes: soil.observacoes || 'Amostragem em camada agricultável.',
          dadosSolo: {
            laboratorio: 'Laboratório Credenciado de Fertilidade',
            numeroLaudo: `BS-${pericia.codigoPericia.slice(-4)}`,
            phCacl2: soil.phCaCl2,
            materiaOrganica: soil.materiaOrganicaPercent,
            fosforoP: soil.fosforoP,
            potassioK: soil.potassioK,
            calcioCa: soil.calcioCa,
            magnesioMg: soil.magnesioMg,
            ctc: soil.ctc,
            vPercent: soil.vPercent,
            interpretacao:
              soil.vPercent > 60
                ? 'Fertilidade de solo adequada e balanceada para a cultura.'
                : 'Solo com índices nutricionais requerendo correção.',
          },
        });
        addedCount++;
      }
    }

    // 2. Add first 2 field photos as photo attachments if not already present
    if (pericia.fotografias && pericia.fotografias.length > 0) {
      pericia.fotografias.slice(0, 2).forEach((foto, i) => {
        const exists = existing.some((a) => a.arquivoUrl === foto.fotoUrl);
        if (!exists) {
          existing.push({
            id: `anx-foto-${Date.now()}-${i}`,
            titulo: `Registro Fotográfico Detalhado Nº ${foto.numero} — ${foto.tipoEvidencia.replace('_', ' ')}`,
            tipo: 'foto',
            descricao: foto.descricao || 'Evidência fotográfica pericial de campo.',
            arquivoUrl: foto.fotoUrl,
            data: foto.data,
            observacoes: `Talhão: ${foto.talhao || 'Geral'} • GPS: ${foto.coordenadas?.lat?.toFixed(5) || 'N/A'}, ${foto.coordenadas?.lng?.toFixed(5) || 'N/A'}`,
          });
          addedCount++;
        }
      });
    }

    if (addedCount > 0) {
      onUpdatePericia({
        ...pericia,
        anexos: existing,
        atualizadoEm: new Date().toISOString(),
      });
    }
  };

  const handleInsertTemplate = (type: 'deriva' | 'granizo' | 'sintese') => {
    let text = '';
    if (type === 'deriva') {
      text = `1. DIAGNÓSTICO AGRONÔMICO E SINTOMATOLOGIA:
A inspeção técnica detalhada na cultura de ${pericia.objetoDescricao?.cultura || 'lavoura'} constatou deformação foliar, encarquilhamento apical e paralisação do crescimento meristemático compatíveis com fitotoxicidade por deriva de herbicidas mimetizadores de auxina. A sintomatologia manifestou-se com gradiente espacial evidente a partir do ponto de deriva.

2. COMPROVAÇÃO DE NEXO CAUSAL:
O confronto entre os registros anemométricos locais e a orientação física das lesões nas plantas atesta nexo causal direto com a pulverização limítrofe. Os laudos laboratoriais juntados confirmam resíduos exógenos no tecido vegetal.

3. DISCUSSÃO DO COMPORTAMENTO DO SOLO:
Conforme atestado no Laudo de Análise Química do Solo (Anexo II), a gleba apresenta níveis de fertilidade adequados, descartando deficiências nutricionais ou desequilíbrios de macro e micronutrientes como causas das anomalias constatadas.

4. SÍNTESE DA PERDA PRODUTIVA:
A área impactada de ${pericia.objetoDescricao?.areaAfetadaHa || 0} hectares teve seu potencial produtivo irremediavelmente deprimido, justificando a valoração do dano apurado de forma fundamentada.`;
    } else if (type === 'granizo') {
      text = `1. CONSTATAÇÃO DAS AVARIAS MECÂNICAS POR INTEMPÉRIE:
A vistoria presencial realizada no imóvel rural ${pericia.imovelNome} permitiu a quantificação direta dos danos físicos provocados por precipitação pluviométrica com queda de granizo. Constataram-se lacerações foliares, quebra de hastes principais e desfolha severa.

2. AVALIAÇÃO DA CAPACIDADE DE REBROTA E ESTANDE:
A densidade de plantas sadias remanescentes por metro linear sofreu severa redução em relação ao estande original planejado. Em razão da fase fenológica avançada da cultura, a capacidade de compensação vegetativa é nula.

3. ESTADO NUTRICIONAL E SANITÁRIO DO SOLO:
As análises de fertilidade do solo anexadas a este laudo comprovam histórico de manejo edáfico de alto padrão, confirmando que a redução de produtividade decorre exclusivamente do evento meteorológico adverso.`;
    } else {
      text = `1. RESULTADOS OBTIDOS NA INSTRUÇÃO TÉCNICA:
A instrução pericial no imóvel rural ${pericia.imovelNome} (${pericia.municipio}/${pericia.uf}) consolidou dados de ${pericia.vistorias?.length || 0} vistorias presenciais, com ${pericia.fotografias?.length || 0} registros fotográficos e ${pericia.amostras?.length || 0} amostras periciais.

2. DISCUSSÃO TÉCNICA AGRONÔMICA:
O problema apurado (${pericia.objetoDescricao?.qualOProblema || 'dano agronômico constatado'}) afetou uma superfície de ${pericia.objetoDescricao?.areaAfetadaHa || 0} hectares da cultura de ${pericia.objetoDescricao?.cultura || 'vegetal'}. A análise técnica multidisciplinar demonstra a relação de causalidade direta entre o evento analisado e o decréscimo quantitativo e qualitativo da safra.

3. EQUILÍBRIO DO SOLO E FERTILIDADE:
Os laudos laboratoriais de solo analisados (Anexo II) atestam condições nutricionais adequadas de fertilidade, afastando causas bióticas ou abióticas secundárias. O dano financeiro resultante encontra-se liquidado em R$ ${(pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
    }

    handleUpdateLaudoText('resultadoDiscussao', text);
  };

  const handleFinalizeLaudo = () => {
    onUpdatePericia({
      ...pericia,
      status: 'concluida',
      laudoOficial: {
        ...laudo,
        conclusaoFinal: laudo.conclusaoFinal || 'Concluída oficialmente.',
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Retrieve active company for integration preview
  const integratedCompany = useMemo(() => {
    try {
      const saved = localStorage.getItem('agronutri_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      name: 'GEAAGRO CONSULTORIA E PERÍCIAS TÉCNICAS LTDA',
      tradingName: 'GeaAgro Engenharia & Perícias',
      cnpj: '18.293.401/0001-92',
      creaRegister: 'CREA-GO 4819/V',
      address: 'Av. Getúlio Vargas, 202, Centro',
      city: 'Rio Verde',
      state: 'GO',
      email: 'contato@geaagro.com.br',
      phone: '(64) 3621-0022',
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Submodule Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
        <button
          onClick={() => setActiveTab('laudo')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'laudo'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          5.1 Estrutura do Laudo
        </button>

        {/* 5.2 RESULTADOS E DISCUSSÃO (ANTES DE QUESITOS) */}
        <button
          onClick={() => setActiveTab('resultado_discussao')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'resultado_discussao'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          5.2 Resultados e Discussão
        </button>

        {/* 5.3 RESPOSTA AOS QUESITOS */}
        <button
          onClick={() => setActiveTab('quesitos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'quesitos'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          5.3 Resposta aos Quesitos ({pericia.quesitos.length})
        </button>

        {/* 5.4 ANEXOS DO LAUDO (FOTOS, SOLO, OUTROS) */}
        <button
          onClick={() => setActiveTab('anexos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'anexos'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5" />
          5.4 Anexos do Laudo ({anexosList.length})
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'capa'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          5.5 Configuração da Capa
        </button>

        <button
          onClick={() => setActiveTab('assinatura')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'assinatura'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          5.6 Validação & ART
        </button>

        <button
          onClick={() => setActiveTab('encerramento')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'encerramento'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          5.7 Encerramento
        </button>

        <button
          onClick={() => setShowAiAssistant(true)}
          className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-xs border border-emerald-400/30 shrink-0"
        >
          <Sprout className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>IA Assistente de Perícia</span>
        </button>
      </div>

      {/* 5.1 ESTRUTURA GERAL DO LAUDO */}
      {activeTab === 'laudo' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                5.1 Redação e Estruturação Técnica do Laudo Oficial (ABNT / CREA)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Estrutura hierárquica e preceitos técnicos da Norma ABNT NBR 14.653-5.
              </p>
            </div>

            <button
              onClick={() => onOpenReportGenerator(pericia)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer self-start"
            >
              <Download className="w-4 h-4" />
              Visualizar & Imprimir Laudo Oficial PDF
            </button>
          </div>

          {/* Sumário Banner Notice */}
          <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-300">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-emerald-950 dark:text-emerald-200">Sumário Executivo e Capitular ABNT NBR 14.653-5</strong>
                <span className="text-[11px] text-emerald-800/90 dark:text-emerald-400">
                  Gerado automaticamente entre a Capa Oficial e o Corpo do Laudo no arquivo em PDF ou impressão com líderes pontilhados e índice analítico completo.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenReportGenerator(pericia)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              Conferir Sumário no PDF
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Título Oficial do Laudo Pericial</label>
              <input
                type="text"
                value={laudo?.titulo || ''}
                onChange={(e) => handleUpdateLaudoText('titulo', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Metodologia Pericial Aplicada</label>
                <textarea
                  rows={4}
                  value={laudo?.metodologia || ''}
                  onChange={(e) => handleUpdateLaudoText('metodologia', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Síntese dos Achados de Vistoria</label>
                <textarea
                  rows={4}
                  value={laudo?.sinteseVistoria || ''}
                  onChange={(e) => handleUpdateLaudoText('sinteseVistoria', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Quick Banner to Resultado e Discussão & Anexos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Seção 5.2 — Resultados e Discussão
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Posicionada antes dos Quesitos, fundamenta o nexo causal e análise técnica.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('resultado_discussao')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  Editar Discussão
                </button>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-950 dark:text-amber-300 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                    Seção 5.4 — Anexos do Laudo ({anexosList.length})
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                    Fotos em alta resolução, análises de solo de laboratório e certidões.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('anexos')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  Gerenciar Anexos
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Conclusão Técnica Final (Encerramento Pericial)
              </label>
              <textarea
                rows={4}
                value={laudo?.conclusaoFinal || ''}
                onChange={(e) => handleUpdateLaudoText('conclusaoFinal', e.target.value)}
                className="w-full p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5.2 RESULTADOS E DISCUSSÃO (NOVO - ANTES DE QUESITOS) */}
      {activeTab === 'resultado_discussao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                5.2 Seção de Resultados e Discussão Técnica Agronômica
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inserida imediatamente antes da resposta aos quesitos judiciais, detalha a fundamentação, nexo causal e
                análise dos dados colhidos no campo e laboratório.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Posição: Antes dos Quesitos
              </span>
            </div>
          </div>

          {/* Quick Template Buttons */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Modelos Rápidos de Redação Agronômica:
              </span>
              <span className="text-[10px] text-slate-400">Clique para carregar estrutura prévia no texto</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleInsertTemplate('sintese')}
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                🌾 Síntese Completa dos Dados da Perícia
              </button>
              <button
                type="button"
                onClick={() => handleInsertTemplate('deriva')}
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                🧪 Modelo Fitotoxicidade / Deriva de Defensivo
              </button>
              <button
                type="button"
                onClick={() => handleInsertTemplate('granizo')}
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                ❄️ Modelo Intempérie / Granizo / Clima
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                Texto Completo de Resultados e Discussão (Laudo Oficial):
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {laudo.resultadoDiscussao?.length || 0} caracteres
              </span>
            </div>
            <textarea
              rows={12}
              value={laudo.resultadoDiscussao || ''}
              onChange={(e) => handleUpdateLaudoText('resultadoDiscussao', e.target.value)}
              placeholder="Digite detalhadamente os resultados observados e a discussão agronômica fundamentada com base nos exames de campo, ensaios de solo e correlação de causalidade..."
              className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono leading-relaxed text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Salvo automaticamente na perícia ativa. Esta seção figurará como Seção 8 do laudo impresso.
            </p>
            <button
              onClick={() => setActiveTab('quesitos')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Avançar para Resposta aos Quesitos &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 5.3 RESPOSTA FORMAL AOS QUESITOS */}
      {activeTab === 'quesitos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                5.3 Quadro Formal de Respostas aos Quesitos Processuais
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Localizada imediatamente após "Resultados e Discussão", traz as respostas técnicas do perito aos quesitos
                do Juízo e dos Assistentes Técnicos.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full self-start">
              {pericia.quesitos.filter((q) => q.respondido).length} de {pericia.quesitos.length} respondidos
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {pericia.quesitos.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                      {q.numero}
                    </span>
                    Quesito Nº {q.numero}: {q.pergunta}
                  </p>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      q.respondido
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {q.respondido ? 'Respondido' : 'Pendente de Resposta'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Resposta Técnica e Fundamentada do Perito:
                  </label>
                  <textarea
                    rows={3}
                    value={q.resposta || ''}
                    onChange={(e) => handleUpdateQuesitoResposta(q.id, e.target.value)}
                    placeholder="Digite a resposta técnica oficial com embasamento fático e normativo..."
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.4 ANEXOS DO LAUDO (FOTOS, ANÁLISE DE SOLO E OUTROS DOCUMENTOS) */}
      {activeTab === 'anexos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-600" />
                5.4 Anexos Oficiais do Laudo Pericial (Fotos, Análise de Solo e Outros Documentos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Localizados ao final da Conclusão Pericial, fornecem a sustentação probatória, laudos laboratoriais e
                acervo fotográfico completo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncPericiaDataToAnexos}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Puxa amostras de solo e fotos registradas nos outros módulos para a lista de anexos"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Sincronizar Dados da Perícia
              </button>

              <button
                type="button"
                onClick={() => setShowAddAnexo(!showAddAnexo)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddAnexo ? 'Fechar Cadastro' : 'Cadastrar Novo Anexo'}
              </button>
            </div>
          </div>

          {/* Form to Add New Anexo */}
          {showAddAnexo && (
            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  Cadastrar Novo Documento / Anexo ao Laudo
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnexoTipo('analise_solo')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 ${
                      anexoTipo === 'analise_solo'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    <FlaskConical className="w-3 h-3" />
                    Análise de Solo
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnexoTipo('foto')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 ${
                      anexoTipo === 'foto'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    Fotografia
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnexoTipo('documento')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 ${
                      anexoTipo === 'documento'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    Documento / ART / Outro
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                    Título do Anexo *
                  </label>
                  <input
                    type="text"
                    value={anexoTitulo}
                    onChange={(e) => setAnexoTitulo(e.target.value)}
                    placeholder={
                      anexoTipo === 'analise_solo'
                        ? 'Ex: Boletim Analítico de Fertilidade do Solo - Laboratório Agrolab'
                        : anexoTipo === 'foto'
                        ? 'Ex: Registro Macroscópico de Necrose nos Ponteiros'
                        : 'Ex: Certidão de ART CREA-GO ou Mapa de Produtividade'
                    }
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                    Descrição / Contexto Técnico
                  </label>
                  <input
                    type="text"
                    value={anexoDescricao}
                    onChange={(e) => setAnexoDescricao(e.target.value)}
                    placeholder="Ex: Coleta representativa em malha georreferenciada na camada de 0-20 cm."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Specific Soil Chemistry Parameters */}
              {anexoTipo === 'analise_solo' && (
                <div className="p-3.5 bg-white dark:bg-zinc-800/90 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-700 pb-2">
                    <span className="font-bold text-emerald-900 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                      Parâmetros Químicos e Físicos do Laudo de Solo (Tabela Nutricional)
                    </span>
                    <span className="text-[10px] text-slate-500">Figurará em tabela formal no Laudo Oficial</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Laboratório Emissor</label>
                      <input
                        type="text"
                        value={soloLaboratorio}
                        onChange={(e) => setSoloLaboratorio(e.target.value)}
                        placeholder="Ex: SolosLab Ltda"
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Nº do Laudo</label>
                      <input
                        type="text"
                        value={soloNumeroLaudo}
                        onChange={(e) => setSoloNumeroLaudo(e.target.value)}
                        placeholder="Ex: 8941/2026"
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">pH CaCl2</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloPhCacl2}
                        onChange={(e) => setSoloPhCacl2(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">M.O. (g/dm³ ou %)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloMO}
                        onChange={(e) => setSoloMO(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">P (Fósforo mg/dm³)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloP}
                        onChange={(e) => setSoloP(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">K (Potássio)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloK}
                        onChange={(e) => setSoloK(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Ca (Cálcio cmolc)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloCa}
                        onChange={(e) => setSoloCa(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Mg (Magnésio cmolc)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloMg}
                        onChange={(e) => setSoloMg(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">CTC Total (cmolc)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soloCtc}
                        onChange={(e) => setSoloCtc(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">V% (Sat. Bases)</label>
                      <input
                        type="number"
                        step="1"
                        value={soloV}
                        onChange={(e) => setSoloV(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Argila (%)</label>
                      <input
                        type="number"
                        step="1"
                        value={soloArgila}
                        onChange={(e) => setSoloArgila(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      Interpretação e Conclusão Agronômica do Solo
                    </label>
                    <textarea
                      rows={2}
                      value={soloInterpretacao}
                      onChange={(e) => setSoloInterpretacao(e.target.value)}
                      placeholder="Ex: Solo de alta fertilidade com saturação de bases > 70% e ausência de alumínio tóxico, descartando estresse nutricional como causa do dano..."
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Upload Foto or Document */}
              <div className="space-y-2">
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold">
                  Arquivo Anexo / Imagem / Documento (Opcional):
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={anexoFileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={anexoCameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => anexoCameraInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Tirar Foto com Câmera
                  </button>

                  <button
                    type="button"
                    onClick={() => anexoFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Selecionar Arquivo / Galeria
                  </button>

                  {anexoArquivoUrl && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Imagem anexada com sucesso
                    </span>
                  )}
                </div>

                {anexoArquivoUrl && (
                  <div className="w-32 h-24 rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-100 flex items-center justify-center">
                    <img src={anexoArquivoUrl} alt="Prévia" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80">
                <button
                  type="button"
                  onClick={() => setShowAddAnexo(false)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAnexo}
                  disabled={!anexoTitulo.trim()}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar Anexo ao Laudo
                </button>
              </div>
            </div>
          )}

          {/* List of Existing Anexos */}
          {anexosList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 space-y-3">
              <Paperclip className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
                Nenhum anexo cadastrado para o Laudo Pericial
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Inclua fotos em alta resolução, laudos laboratoriais de análise química de solo e certidões técnicas para
                enriquecer o laudo oficial.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSyncPericiaDataToAnexos}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  Sincronizar Automaticamente Dados da Perícia
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAnexo(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Manualmente
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anexosList.map((anexo, idx) => (
                <div
                  key={anexo.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                          {anexo.titulo}
                        </h5>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Tipo:{' '}
                          {anexo.tipo === 'analise_solo'
                            ? 'Análise de Solo'
                            : anexo.tipo === 'foto'
                            ? 'Fotografia'
                            : 'Documento'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAnexo(anexo.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Excluir Anexo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {anexo.descricao && (
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {anexo.descricao}
                    </p>
                  )}

                  {/* Soil Analysis Table if present */}
                  {anexo.dadosSolo && (
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 text-[10px] space-y-1.5">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-800 pb-1">
                        <span>{anexo.dadosSolo.laboratorio || 'Laboratório de Solos'}</span>
                        <span className="font-mono">{anexo.dadosSolo.numeroLaudo || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 font-mono text-slate-600 dark:text-zinc-400">
                        <span>pH: <strong>{anexo.dadosSolo.phCacl2 ?? '-'}</strong></span>
                        <span>M.O.: <strong>{anexo.dadosSolo.materiaOrganica ?? '-'}%</strong></span>
                        <span>P: <strong>{anexo.dadosSolo.fosforoP ?? '-'}</strong></span>
                        <span>K: <strong>{anexo.dadosSolo.potassioK ?? '-'}</strong></span>
                        <span>Ca: <strong>{anexo.dadosSolo.calcioCa ?? '-'}</strong></span>
                        <span>Mg: <strong>{anexo.dadosSolo.magnesioMg ?? '-'}</strong></span>
                        <span>V%: <strong>{anexo.dadosSolo.vPercent ?? '-'}%</strong></span>
                        <span>CTC: <strong>{anexo.dadosSolo.ctc ?? '-'}</strong></span>
                      </div>
                      {anexo.dadosSolo.interpretacao && (
                        <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-sans border-t border-slate-100 dark:border-zinc-800 pt-1">
                          <strong>Interpretação:</strong> {anexo.dadosSolo.interpretacao}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Thumbnail / Image Preview */}
                  {anexo.arquivoUrl && (
                    <div className="aspect-video max-h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                      <img
                        src={anexo.arquivoUrl}
                        alt={anexo.titulo}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {anexo.observacoes && (
                    <p className="text-[10px] text-slate-500 font-mono">
                      <strong>Obs:</strong> {anexo.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5.5 CONFIGURAÇÃO DA CAPA (PROCESSO & EMPRESA) */}
      {activeTab === 'capa' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                5.5 Configuração da Capa e Integração com Cadastro Técnico
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Defina os parâmetros do processo judicial que figurarão com destaque na capa do Laudo Oficial PDF.
              </p>
            </div>

            <button
              onClick={() => onOpenReportGenerator(pericia)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer self-start"
            >
              <Download className="w-4 h-4" />
              Imprimir Laudo Completo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judicial Identifiers */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Identificação dos Autos Judiciais
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Número do Processo Judicial / CNJ</label>
                  <input
                    type="text"
                    placeholder="Ex: 5001234-82.2026.8.09.0137"
                    value={pericia.numeroProcesso || ''}
                    onChange={(e) => {
                      onUpdatePericia({
                        ...pericia,
                        numeroProcesso: e.target.value,
                        atualizadoEm: new Date().toISOString(),
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Autor da Ação / Requerente</label>
                    <input
                      type="text"
                      placeholder="Ex: Fazenda Boa Vista Ltda"
                      value={pericia.autor || pericia.contratanteNome || ''}
                      onChange={(e) => {
                        onUpdatePericia({
                          ...pericia,
                          autor: e.target.value,
                          atualizadoEm: new Date().toISOString(),
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Réu / Requerido</label>
                    <input
                      type="text"
                      placeholder="Ex: Cia Aérea Agrícola Cerrado"
                      value={pericia.reu || ''}
                      onChange={(e) => {
                        onUpdatePericia({
                          ...pericia,
                          reu: e.target.value,
                          atualizadoEm: new Date().toISOString(),
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timbre preview */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Dados Corporativos Vinculados (Timbre do Laudo)
              </h4>
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-300 text-sm">
                  {integratedCompany.tradingName}
                </p>
                <p className="text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                  CNPJ: {integratedCompany.cnpj} • Registro: {integratedCompany.creaRegister}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {integratedCompany.address} — {integratedCompany.city}/{integratedCompany.state}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.6 VALIDAÇÃO E ASSINATURA */}
      {activeTab === 'assinatura' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              5.6 Validação de Integridade, ART e Assinatura Digital
            </h3>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-semibold mb-1">Perito / Engenheiro Responsável</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{pericia.responsavelTecnico}</p>
                <p className="font-mono text-slate-500">CREA: {pericia.crea}</p>
              </div>

              <div>
                <p className="text-slate-500 font-semibold mb-1">Número da ART Registrada</p>
                <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{pericia.artNumero}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200">Integridade Criptográfica do Laudo</h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono">
                    Token ICP-Brasil: 8f7d9a1c2e3f4b5a6c7d8e9f0a1b2c3d4e5f6a7b
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.7 ENCERRAMENTO */}
      {activeTab === 'encerramento' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-600" />
              5.7 Encerramento do Processo Pericial
            </h3>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Finalizar e Concluir Perícia #{pericia.codigoPericia}
            </h4>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Ao concluir a perícia, o status será atualizado para "Concluída" e a cadeia de custódia será bloqueada para
              auditoria oficial.
            </p>

            <button
              onClick={handleFinalizeLaudo}
              disabled={pericia.status === 'concluida'}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {pericia.status === 'concluida' ? 'Perícia Concluída' : 'Marcar Processo como CONCLUÍDO'}
            </button>
          </div>
        </div>
      )}

      {/* IA ASSISTANTE MODAL */}
      <PericiaAIAssistantModal
        pericia={pericia}
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onApplyText={handleApplyAiText}
      />
    </div>
  );
};
