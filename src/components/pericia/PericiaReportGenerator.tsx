import React, { useRef, useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, Scale, ShieldCheck, CheckCircle2, FileText, Building2, MapPin, UserCheck, HelpCircle, FileCheck, ClipboardList, AlertTriangle, CloudSun, Landmark, Camera, Image, Sparkles, Paperclip, FlaskConical, ListOrdered, BookOpen, Navigation, Building, Tractor, Truck, Tag, Trees, Sprout } from 'lucide-react';
import { Pericia } from '../../types/pericia';
import { TIPO_PERICIA_LABELS } from './PericiaDashboard';
import { calcularResumoValoresImovel } from '../../utils/periciaAvaliacaoComponentesUtils';

interface PericiaReportGeneratorProps {
  isOpen: boolean;
  pericia: Pericia | null;
  onClose: () => void;
}

export const PericiaReportGenerator: React.FC<PericiaReportGeneratorProps> = ({
  isOpen,
  pericia,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [showSumario, setShowSumario] = useState(true);

  // Manage print classes on document.body to isolate print rendering completely
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('pericia-modal-open');
    } else {
      document.body.classList.remove('pericia-modal-open');
      document.body.classList.remove('pericia-printing-now');
    }
    return () => {
      document.body.classList.remove('pericia-modal-open');
      document.body.classList.remove('pericia-printing-now');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('pericia-printing-now');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Find Agronomist details from LocalStorage (Cadastro Técnico / Cadastro de Agrônomos)
  const matchingRT = useMemo(() => {
    if (!pericia) return null;
    let list = [];
    try {
      const saved = localStorage.getItem('agronutri_agronomists');
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }

    // Search in registered agronomists
    const registeredList = Array.isArray(list) ? list : [];
    
    // Attempt exact match on name
    let matched = registeredList.find(
      (a: any) => a && a.name && a.name.toLowerCase().trim() === (pericia.responsavelTecnico || '').toLowerCase().trim()
    );

    // If no exact match, try substring match
    if (!matched && pericia.responsavelTecnico) {
      matched = registeredList.find(
        (a: any) => a && a.name && (
          pericia.responsavelTecnico.toLowerCase().includes(a.name.toLowerCase().trim()) ||
          a.name.toLowerCase().includes(pericia.responsavelTecnico.toLowerCase().trim())
        )
      );
    }

    return matched || {
      name: pericia.responsavelTecnico || 'Não informado',
      profession: 'Engenheiro Agrônomo',
      crea: pericia.crea || 'Não informado',
      creaState: pericia.uf || 'GO',
      rnp: 'N/A',
      cpf: 'N/A',
      email: '',
      phone: '',
      specialty: 'Perícias & Avaliações Rurais',
      address: 'Endereço profissional registrado no sistema GeaAgro',
      hasDigitalSignature: false,
      legalSignatureHash: '',
      legalSignatureDate: '',
    };
  }, [pericia]);

  // Integrated Company Data Lookup
  const matchingCompany = useMemo(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('agronutri_companies');
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }

    const defaultCompany = {
      id: 'comp-1',
      name: 'GEAAGRO CONSULTORIA E PERÍCIAS TÉCNICAS LTDA',
      tradingName: 'GeaAgro Engenharia & Perícias',
      cnpj: '18.293.401/0001-92',
      stateRegistration: '10.291.829-0',
      creaRegister: 'CREA-GO 4819/V',
      mapaRegister: 'MAPA-GO 10293-A',
      address: 'Av. Getúlio Vargas, 202, Centro',
      city: 'Rio Verde',
      state: 'GO',
      email: 'contato@geaagro.com.br',
      phone: '(64) 3621-0022',
    };

    if (Array.isArray(list) && list.length > 0) {
      // Find company associated with professional, or fallback to the first active registered company
      const companyId = matchingRT?.companyId;
      const found = list.find((c: any) => c && c.id === companyId) || list[0];
      if (found) {
        return {
          ...defaultCompany,
          ...found,
        };
      }
    }
    return defaultCompany;
  }, [matchingRT]);

  // Cover Page Date Formatter
  const formattedCoverDate = useMemo(() => {
    if (!pericia?.dataAbertura) return 'Setembro de 2026';
    try {
      const parts = pericia.dataAbertura.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch (e) {
      console.warn(e);
    }
    return 'Setembro de 2026';
  }, [pericia?.dataAbertura]);

  const regionalAndClimate = useMemo(() => {
    const defaultClimate = [
      { mes: 'Janeiro', minima: 19.5, maxima: 29.5, precipitacao: 240 },
      { mes: 'Fevereiro', minima: 19.4, maxima: 29.8, precipitacao: 210 },
      { mes: 'Março', minima: 19.2, maxima: 30.1, precipitacao: 180 },
      { mes: 'Abril', minima: 17.5, maxima: 29.8, precipitacao: 80 },
      { mes: 'Maio', minima: 14.8, maxima: 29.0, precipitacao: 30 },
      { mes: 'Junho', minima: 12.5, maxima: 28.5, precipitacao: 5 },
      { mes: 'Julho', minima: 12.0, maxima: 28.6, precipitacao: 2 },
      { mes: 'Agosto', minima: 13.8, maxima: 30.5, precipitacao: 8 },
      { mes: 'Setembro', minima: 17.0, maxima: 32.5, precipitacao: 45 },
      { mes: 'Outubro', minima: 18.5, maxima: 31.8, precipitacao: 130 },
      { mes: 'Novembro', minima: 19.1, maxima: 30.0, precipitacao: 200 },
      { mes: 'Dezembro', minima: 19.4, maxima: 29.2, precipitacao: 260 },
    ];

    const defaultChar = 
      'Região caracterizada pelo bioma Cerrado, relevo predominantemente plano a suave ondulado, favorável à mecanização agrícola intensiva. Solo predominante do tipo Latossolo Vermelho distrófico, argiloso, com alta capacidade de drenagem. O clima é tropical sazonal (Aw na classificação de Köppen), com estação chuvosa bem definida entre outubro e abril, e estiagem acentuada de maio a setembro.';

    return {
      caracteristicas: pericia?.dadosRegiao?.caracteristicas || defaultChar,
      dadosClimatologicos: pericia?.dadosRegiao?.dadosClimatologicos && pericia.dadosRegiao.dadosClimatologicos.length === 12
        ? pericia.dadosRegiao.dadosClimatologicos
        : defaultClimate,
    };
  }, [pericia?.dadosRegiao]);

  const valorDanos = pericia?.calculosDanos?.perdaFinanceiraTotalBrl || 0;

  // Official ABNT NBR 14.653-5 Table of Contents Structure (Hook 9 called unconditionally)
  const tocSections = useMemo(() => {
    if (!pericia) return [];
    return [
      {
        id: 'sec-1-lide',
        number: '1',
        title: 'LIDE E CONTEXTO PROCESSUAL',
        subtitle: 'Identificação das partes litigantes, comarca e objeto periciado',
        tag: 'Capítulo 1',
      },
      {
        id: 'sec-2-rt',
        number: '2',
        title: 'RESPONSABILIDADE TÉCNICA E HABILITAÇÃO PROFISSIONAL',
        subtitle: 'Qualificação do perito engenheiro agrônomo, registro CREA e ART vinculada',
        tag: 'Capítulo 2',
      },
      {
        id: 'sec-3-metodologia',
        number: '3',
        title: 'METODOLOGIA PERICIAL APLICADA (ABNT NBR 14.653-5)',
        subtitle: 'Diretrizes normativas, procedimentos de amostragem e fundamentação técnica',
        tag: 'Capítulo 3',
      },
      {
        id: 'sec-4-clima',
        number: '4',
        title: 'CARACTERIZAÇÃO DA REGIÃO E DADOS CLIMATOLÓGICOS HISTÓRICOS',
        subtitle: 'Histórico meteorológico de 12 meses, precipitação, temperaturas e bioma',
        tag: 'Capítulo 4',
      },
      {
        id: 'sec-5-objeto',
        number: '5',
        title: 'OBJETO DA AVALIAÇÃO E CARACTERIZAÇÃO DO IMÓVEL',
        subtitle: 'Área afetada, talhões vistoriados, cultura agrícola e caracterização da lavoura',
        tag: 'Capítulo 5',
        subitems: [
          {
            id: 'sec-5-1-imovel',
            number: '5.1',
            title: 'Do Imóvel Avaliado, Benfeitorias e Croqui Situacional',
            tag: 'Item 5.1',
          },
          ...(pericia.avaliacaoImovel ? [
            {
              id: 'sec-5-2-avaliacao',
              number: '5.2',
              title: 'Precificação da Terra Nua e Aptidão Agrícola (NBR 14653-3)',
              tag: 'Item 5.2',
            },
            ...(pericia.avaliacaoImovel.benfeitorias && pericia.avaliacaoImovel.benfeitorias.length > 0 && pericia.avaliacaoImovel.incluirBenfeitorias !== false ? [{
              id: 'sec-5-3-benfeitorias',
              number: '5.3',
              title: `Avaliação de Benfeitorias (${pericia.avaliacaoImovel.benfeitorias.length} itens)`,
              tag: 'Item 5.3',
            }] : []),
            ...(pericia.avaliacaoImovel.maquinasEquipamentos && pericia.avaliacaoImovel.maquinasEquipamentos.length > 0 && pericia.avaliacaoImovel.incluirMaquinasEquipamentos !== false ? [{
              id: 'sec-5-4-maquinas',
              number: '5.4',
              title: `Máquinas e Equipamentos (${pericia.avaliacaoImovel.maquinasEquipamentos.length} itens)`,
              tag: 'Item 5.4',
            }] : []),
            ...(pericia.avaliacaoImovel.veiculos && pericia.avaliacaoImovel.veiculos.length > 0 && pericia.avaliacaoImovel.incluirVeiculos !== false ? [{
              id: 'sec-5-5-veiculos',
              number: '5.5',
              title: `Veículos e Utilitários (${pericia.avaliacaoImovel.veiculos.length} itens)`,
              tag: 'Item 5.5',
            }] : []),
            ...(pericia.avaliacaoImovel.semoventes && pericia.avaliacaoImovel.semoventes.length > 0 && pericia.avaliacaoImovel.incluirSemoventes !== false ? [{
              id: 'sec-5-6-semoventes',
              number: '5.6',
              title: `Semoventes e Rebanho (${pericia.avaliacaoImovel.semoventes.length} lotes)`,
              tag: 'Item 5.6',
            }] : []),
            ...(pericia.avaliacaoImovel.recursosNaturais && pericia.avaliacaoImovel.recursosNaturais.length > 0 && pericia.avaliacaoImovel.incluirRecursosNaturais !== false ? [{
              id: 'sec-5-7-recursos',
              number: '5.7',
              title: `Recursos Naturais e Florestais (${pericia.avaliacaoImovel.recursosNaturais.length} itens)`,
              tag: 'Item 5.7',
            }] : []),
            ...(pericia.avaliacaoImovel.frutos && pericia.avaliacaoImovel.frutos.length > 0 && pericia.avaliacaoImovel.incluirFrutos !== false ? [{
              id: 'sec-5-8-frutos',
              number: '5.8',
              title: `Frutos e Safras Pendentes (${pericia.avaliacaoImovel.frutos.length} safras)`,
              tag: 'Item 5.8',
            }] : []),
            ...(pericia.avaliacaoImovel.direitos && pericia.avaliacaoImovel.direitos.length > 0 && pericia.avaliacaoImovel.incluirDireitos !== false ? [{
              id: 'sec-5-9-direitos',
              number: '5.9',
              title: `Direitos, Servidões e Ônus (${pericia.avaliacaoImovel.direitos.length} itens)`,
              tag: 'Item 5.9',
            }] : []),
            {
              id: 'sec-5-10-resumo-global',
              number: '5.10',
              title: 'Quadro Resumo da Avaliação Global do Imóvel Rural',
              tag: 'Item 5.10',
            },
          ] : []),
        ],
      },
      {
        id: 'sec-6-vistorias',
        number: '6',
        title: 'VISTORIAS DE CAMPO, LEVANTAMENTO BIOMÉTRICO E EVIDÊNCIAS',
        subtitle: `${pericia.vistorias?.length || 0} vistorias in loco com ${pericia.fotografias?.length || 0} fotos georreferenciadas auditadas`,
        tag: 'Capítulo 6',
        subitems: [
          {
            id: 'sec-6-vistorias',
            number: '6.1',
            title: 'Vistorias Presenciais Realizadas e Equipe Participante',
            tag: 'Item 6.1',
          },
          {
            id: 'sec-6-painel-fotos',
            number: '6.2',
            title: `Painel Fotográfico Georreferenciado (${pericia.fotografias?.length || 0} registros periciais)`,
            tag: 'Item 6.2',
          },
        ],
      },
      {
        id: 'sec-7-valoracao',
        number: '7',
        title: 'VALORAÇÃO ECONÔMICA DO DANO APURADO (CÁLCULO FINAL)',
        subtitle: `Memória de cálculo liquidada em R$ ${valorDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        tag: 'Capítulo 7',
      },
      {
        id: 'sec-8-resultados',
        number: '8',
        title: 'RESULTADOS E DISCUSSÃO TÉCNICA AGRONÔMICA',
        subtitle: 'Diagnóstico fisiológico, dispersão/deriva, nexo causal e estado edáfico do solo',
        tag: 'Capítulo 8',
      },
      {
        id: 'sec-9-quesitos',
        number: '9',
        title: 'RESPOSTA FORMAL AOS QUESITOS PROCESSUAIS',
        subtitle: `Esclarecimentos periciais fundamentados (${pericia.quesitos?.length || 0} quesitos instruídos)`,
        tag: 'Capítulo 9',
      },
      {
        id: 'sec-10-conclusao',
        number: '10',
        title: 'CONCLUSÃO PERICIAL FINAL',
        subtitle: 'Parecer técnico final, síntese forense e encerramento do mister pericial',
        tag: 'Capítulo 10',
      },
      {
        id: 'sec-11-anexos',
        number: '11',
        title: 'ANEXOS DO LAUDO PERICIAL',
        subtitle: 'Documentação probatória complementar, ensaios laboratoriais e certidões',
        tag: 'Capítulo 11',
        subitems: [
          {
            id: 'sec-11-1-fotos',
            number: '11.1',
            title: 'Anexo I — Registros Fotográficos Complementares e Croquis',
            tag: 'Anexo I',
          },
          {
            id: 'sec-11-2-solo',
            number: '11.2',
            title: 'Anexo II — Laudos Laboratoriais e Boletins Químicos de Fertilidade do Solo',
            tag: 'Anexo II',
          },
          {
            id: 'sec-11-3-docs',
            number: '11.3',
            title: 'Anexo III — Documentos Complementares, ART CREA e Certidões Legais',
            tag: 'Anexo III',
          },
        ],
      },
      {
        id: 'sec-12-assinatura',
        number: '12',
        title: 'TERMO DE ENCERRAMENTO E ASSINATURA DIGITAL',
        subtitle: 'Validação jurídica, certificado profissional e token ICP-Brasil',
        tag: 'Chancela',
      },
    ];
  }, [pericia, valorDanos]);

  if (!isOpen || !pericia || !matchingRT) return null;

  const handlePrint = () => {
    document.body.classList.add('pericia-printing-now');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('pericia-printing-now');
    }, 1200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tipoLabel = TIPO_PERICIA_LABELS[pericia.tipo] || pericia.tipo;

  return createPortal(
    <div id="pericia-report-portal">
      {/* CSS Print Styles Injector */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 15mm 12mm;
          }

          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide everything outside the pericia report portal */
          body > *:not(#pericia-report-portal),
          body #root {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }

          #pericia-report-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          .pericia-modal-overlay {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            z-index: auto !important;
          }

          .pericia-modal-card {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .pericia-scroll-container {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .pericia-printable-document {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .pericia-cover-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 255mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 10mm !important;
            margin: 0 !important;
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
          }

          .pericia-toc-page {
            page-break-before: always !important;
            page-break-after: always !important;
            break-before: page !important;
            break-after: page !important;
            min-height: 255mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 10mm 12mm !important;
            margin: 0 !important;
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
          }

          .pericia-toc-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .pericia-report-body {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }

          .pericia-card-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 16px !important;
          }

          .pericia-signature-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 32px !important;
          }

          .print\\:hidden,
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="pericia-modal-overlay fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none">
        <div className="pericia-modal-card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto space-y-4 print:my-0 print:space-y-0 print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white print:overflow-visible">
          {/* Top Control Bar */}
          <div className="p-4 bg-slate-100 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                Visualização de Laudo Oficial PDF — {pericia.codigoPericia}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sumário Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSumario(!showSumario)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showSumario
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700 hover:bg-slate-50'
                }`}
                title="Incluir ou ocultar a folha de Sumário no Laudo Pericial"
              >
                <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sumário ABNT {showSumario ? '(Incluso)' : '(Oculto)'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar em PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Paper Document Container */}
          <div className="pericia-scroll-container p-8 max-h-[80vh] overflow-y-auto bg-slate-200/50 dark:bg-zinc-950 print:p-0 print:bg-white print:max-h-none print:overflow-visible">
            <div
              ref={printRef}
              className="pericia-printable-document max-w-3xl mx-auto space-y-10 font-sans print:m-0 print:w-full print:space-y-0"
            >
              {/* ========================================== */}
              {/* CAPA DO LAUDO (COVER PAGE) */}
              {/* ========================================== */}
              <div className="pericia-cover-page bg-white text-slate-900 p-12 shadow-xl rounded-xl border border-slate-200 font-sans print:shadow-none print:p-8 print:m-0 print:w-full print:border print:border-slate-300 flex flex-col justify-between" style={{ minHeight: '940px' }}>
              
              {/* Top: Empresa & Identificação */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-3 text-emerald-850">
                  <Building2 className="w-10 h-10 text-emerald-700 shrink-0" />
                  <div className="text-left">
                    <h2 className="text-sm font-black tracking-wider uppercase leading-snug text-emerald-950 font-sans">
                      {matchingCompany.name}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
                      {matchingCompany.tradingName} • REGISTRO CONSELHO: {matchingCompany.creaRegister}
                    </p>
                  </div>
                </div>
                <div className="w-full border-b border-slate-100 my-1" />
                <div className="text-[9px] text-slate-500 font-mono flex flex-wrap gap-x-3 justify-center">
                  <span>CNPJ: {matchingCompany.cnpj}</span>
                  <span>•</span>
                  <span>Endereço: {matchingCompany.address}, {matchingCompany.city} - {matchingCompany.state}</span>
                  <span>•</span>
                  <span>Contato: {matchingCompany.phone} | {matchingCompany.email}</span>
                </div>
              </div>

              {/* Middle: Title & Subtitle */}
              <div className="text-center my-12 space-y-4">
                <p className="text-[11px] text-emerald-800 font-black tracking-[0.25em] uppercase">
                  DOCUMENTO TÉCNICO OFICIAL
                </p>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif uppercase leading-tight max-w-2xl mx-auto border-y border-emerald-900/10 py-5">
                  Laudo Pericial Agronômico
                </h1>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Trabalho técnico-científico de instrução pericial elaborado em conformidade com as diretrizes da Norma ABNT NBR 14.653-5.
                </p>
              </div>

              {/* Judicial / Processual Metadata Card */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-6 space-y-4 max-w-2xl mx-auto w-full">
                <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest border-b border-emerald-900/10 pb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  Identificação do Processo Judicial
                </h4>
                
                <div className="grid grid-cols-1 gap-y-3 text-xs text-slate-800">
                  <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Processo Nº:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900 text-sm">
                      {pericia.numeroProcesso || pericia.codigoPericia || 'Não informado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Autor (Requerente):</span>
                    <span className="col-span-2 font-bold text-slate-950 text-sm">
                      {pericia.autor || 'Não especificado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Réu (Requerido):</span>
                    <span className="col-span-2 font-bold text-slate-950 text-sm">
                      {pericia.reu || 'Não especificado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Objeto Periciado:</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {pericia.nome}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Imóvel Rural:</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {pericia.imovelNome} — {pericia.municipio} / {pericia.uf}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: Signature / Date */}
              <div className="flex flex-col items-center text-center space-y-4 pt-10">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Responsável Técnico</p>
                  <p className="text-base font-black text-slate-950">{matchingRT.name}</p>
                  <p className="text-xs font-mono text-slate-600">
                    {matchingRT.profession || 'Engenheiro Agrônomo'} • Registro: {matchingRT.crea}
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {pericia.municipio} - {pericia.uf}, {formattedCoverDate}
                </div>
              </div>

            </div>

            {/* ========================================== */}
            {/* PÁGINA DE SUMÁRIO DO LAUDO (TABLE OF CONTENTS) */}
            {/* ========================================== */}
            {showSumario && (
              <>
                {/* Print separation placeholder */}
                <div style={{ pageBreakAfter: 'always' }} className="print:hidden h-10 border-t border-dashed border-slate-300 dark:border-zinc-800 my-8 flex items-center justify-center relative">
                  <span className="bg-slate-200 dark:bg-zinc-950 px-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Página 1 • Capa Oficial &rarr; Página 2 • Sumário do Laudo
                  </span>
                </div>

                <div
                  id="pericia-sumario-page"
                  className="pericia-toc-page bg-white text-slate-900 p-10 shadow-xl rounded-xl border border-slate-200 font-sans print:shadow-none print:p-8 print:m-0 print:w-full print:border print:border-slate-300 flex flex-col justify-between"
                  style={{ minHeight: '940px' }}
                >
                  {/* Top: Header do Sumário com Timbre Técnico */}
                  <div className="border-b border-slate-200 pb-3 font-sans">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
                      <div className="flex items-center gap-2 text-emerald-850">
                        <Building2 className="w-6 h-6 text-emerald-700 shrink-0" />
                        <div>
                          <h3 className="text-xs font-black uppercase text-emerald-950 leading-tight">
                            {matchingCompany.tradingName}
                          </h3>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {matchingCompany.name} • REGISTRO: {matchingCompany.creaRegister}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[9.5px] font-mono text-slate-600">
                        <p>PROCESSO Nº: <strong>{pericia.numeroProcesso || pericia.codigoPericia}</strong></p>
                        <p className="text-[8.5px] text-slate-400">ART: {pericia.artNumero} • {pericia.municipio}/{pericia.uf}</p>
                      </div>
                    </div>
                  </div>

                  {/* Title & Introduction */}
                  <div className="text-center my-4 space-y-1">
                    <div className="inline-flex items-center gap-2 border-b-2 border-emerald-800 pb-1 px-8">
                      <ListOrdered className="w-5 h-5 text-emerald-700 print:hidden" />
                      <h2 className="text-xl font-black font-serif uppercase tracking-wider text-slate-950">
                        SUMÁRIO
                      </h2>
                    </div>
                    <p className="text-[10.5px] text-slate-600 max-w-xl mx-auto italic font-serif pt-1">
                      Estrutura capitular e tópicos analíticos do Laudo Pericial em conformidade com as diretrizes da Norma ABNT NBR 14.653-5 e preceitos do Código de Processo Civil (CPC).
                    </p>
                    <p className="text-[9px] text-emerald-700 font-mono print:hidden">
                      (Dica: no visualizador, clique em qualquer item para navegar diretamente até a seção)
                    </p>
                  </div>

                  {/* Sumário Body (Leader Dots List) */}
                  <div className="space-y-1.5 text-xs text-slate-900 font-sans my-auto py-2">
                    {tocSections.map((sec) => (
                      <div key={sec.id} className="pericia-toc-item space-y-0.5">
                        <div
                          onClick={() => scrollToSection(sec.id)}
                          className="flex items-baseline justify-between group cursor-pointer hover:bg-emerald-50/60 p-1 rounded transition-colors"
                          title="Clique para ir até este capítulo"
                        >
                          <div className="flex items-baseline gap-2 font-bold text-slate-950 group-hover:text-emerald-900 text-[11px] leading-tight">
                            <span className="font-mono text-emerald-800 text-[11.5px] w-5 text-right shrink-0">
                              {sec.number}.
                            </span>
                            <span className="uppercase tracking-wide">
                              {sec.title}
                            </span>
                            {sec.subtitle && (
                              <span className="font-normal text-[9.5px] text-slate-500 group-hover:text-emerald-700 hidden lg:inline">
                                — {sec.subtitle}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 border-b-2 border-dotted border-slate-300 mx-2 mb-1 min-w-[24px]" />
                          <span className="font-mono font-bold text-[10px] text-slate-600 group-hover:text-emerald-800 bg-slate-100 px-1.5 py-0.5 rounded text-right shrink-0">
                            {sec.tag}
                          </span>
                        </div>

                        {/* Subitems */}
                        {sec.subitems && sec.subitems.length > 0 && (
                          <div className="space-y-0.5 pl-7">
                            {sec.subitems.map((sub) => (
                              <div
                                key={sub.id}
                                onClick={() => scrollToSection(sub.id)}
                                className="flex items-baseline justify-between group cursor-pointer hover:bg-emerald-50/40 py-0.5 px-1 rounded transition-colors text-[10.5px]"
                                title="Clique para ir até este item"
                              >
                                <div className="flex items-baseline gap-2 text-slate-800 group-hover:text-emerald-800">
                                  <span className="font-mono text-emerald-700 font-semibold text-[10px] w-7 shrink-0">
                                    {sub.number}
                                  </span>
                                  <span className="font-medium">
                                    {sub.title}
                                  </span>
                                </div>
                                <div className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1 min-w-[16px]" />
                                <span className="font-mono text-[9px] text-slate-500 group-hover:text-emerald-700 shrink-0">
                                  {sub.tag}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Forensic Elements Summary Badge */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Quadro Resumo dos Elementos Instrutórios da Perícia
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[9.5px]">
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[8px] uppercase">Vistorias</span>
                        <strong className="text-slate-900 font-bold">{pericia.vistorias?.length || 0} realizadas</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[8px] uppercase">Fotografias</span>
                        <strong className="text-slate-900 font-bold">{pericia.fotografias?.length || 0} catalogadas</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[8px] uppercase">Amostras Solo</span>
                        <strong className="text-slate-900 font-bold">{pericia.amostras?.length || 0} ensaios</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[8px] uppercase">Quesitos</span>
                        <strong className="text-slate-900 font-bold">{pericia.quesitos?.length || 0} formulados</strong>
                      </div>
                      <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg col-span-2 sm:col-span-1">
                        <span className="text-emerald-600 block text-[8px] uppercase font-bold">Dano Liquidado</span>
                        <strong className="text-emerald-900 font-bold font-mono">
                          {valorDanos > 0 ? `R$ ${(valorDanos / 1000).toFixed(0)}k` : 'R$ 0,00'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Rodapé Legal do Sumário */}
                  <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
                    <div>
                      <span>ABNT NBR 14.653-5 • Artigos 464 a 484 da Lei Federal nº 13.105/2015 (CPC)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Perito Judicial: <strong>{matchingRT.name}</strong></span>
                      <span>•</span>
                      <span>CREA: <strong>{matchingRT.crea}</strong></span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Print separation placeholder */}
            <div style={{ pageBreakAfter: 'always' }} className="print:hidden h-10 border-t border-dashed border-slate-300 dark:border-zinc-800 my-8 flex items-center justify-center relative">
              <span className="bg-slate-200 dark:bg-zinc-950 px-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                {showSumario ? 'Página 2 • Sumário Concluído → Página 3 • Início do Laudo Detalhado' : 'Fim da Capa • Início do Laudo Detalhado'}
              </span>
            </div>

            {/* ========================================== */}
            {/* CORPO DO LAUDO DETALHADO (MAIN REPORT) */}
            {/* ========================================== */}
            <div className="pericia-report-body bg-white text-slate-900 p-10 max-w-3xl mx-auto shadow-xl rounded-xl space-y-8 font-serif print:shadow-none print:p-0 print:m-0 print:w-full print:border-none print:space-y-6">
              
              {/* Header / Timbre */}
              <div className="border-b-2 border-emerald-800 pb-5 text-center space-y-2 font-sans">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-emerald-850 text-left">
                    <Building2 className="w-8 h-8 text-emerald-700 shrink-0" />
                    <div>
                      <h2 className="text-sm font-black uppercase text-emerald-950 leading-none">
                        {matchingCompany.tradingName}
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {matchingCompany.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right text-[9px] text-slate-500 font-mono space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
                    <p><strong>RT:</strong> {matchingRT.name}</p>
                    <p><strong>REGISTRO:</strong> {matchingRT.crea} | <strong>ART:</strong> {pericia.artNumero}</p>
                    <p><strong>CONTATO:</strong> {matchingRT.email} • {matchingRT.phone}</p>
                  </div>
                </div>
                <div className="w-full border-t border-slate-100 my-1" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Laudo Oficial elaborado em conformidade com as Normas ABNT NBR 14.653-5
                </p>
              </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-sans uppercase text-emerald-950">
                {pericia.laudoOficial?.titulo || `LAUDO PERICIAL AGRONÔMICO — ${pericia.nome}`}
              </h2>
              <p className="text-xs font-sans font-mono text-slate-500">
                CÓDIGO OFICIAL: <strong>{pericia.codigoPericia}</strong> • ART Nº <strong>{pericia.artNumero}</strong>
              </p>
            </div>

            {/* Section 1: Lide (Contexto Processual) */}
            <div id="sec-1-lide" className="pericia-card-section space-y-3 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/80 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                1. LIDE E CONTEXTO PROCESSUAL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-800">
                <p><strong>Título da Perícia:</strong> {pericia.nome}</p>
                <p><strong>Tipo de Perícia:</strong> {tipoLabel}</p>
                <p><strong>Contratante / Solicitante:</strong> {pericia.contratanteNome}</p>
                <p><strong>Nome do Imóvel Rural:</strong> {pericia.imovelNome}</p>
                <p><strong>Município / UF:</strong> {pericia.municipio} - {pericia.uf}</p>
                <p className="md:col-span-2"><strong>Objetivo da Perícia:</strong> {pericia.objetivo}</p>
              </div>
            </div>

            {/* Section 2: Responsabilidade Técnica */}
            <div id="sec-2-rt" className="pericia-card-section space-y-3 font-sans text-xs border border-emerald-100 p-5 rounded-xl bg-emerald-50/20 scroll-mt-6">
              <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                2. RESPONSABILIDADE TÉCNICA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-800">
                <p><strong>Profissional Responsável:</strong> {matchingRT.name}</p>
                <p><strong>Título Profissional:</strong> {matchingRT.profession || 'Engenheiro Agrônomo'}</p>
                <p><strong>Órgão Regulador / CREA:</strong> {matchingRT.crea} ({matchingRT.creaState || 'GO'})</p>
                <p><strong>RNP (Reg. Nacional Profissional):</strong> {matchingRT.rnp || 'N/A'}</p>
                <p><strong>CPF:</strong> {matchingRT.cpf || 'N/A'}</p>
                <p><strong>Especialidade Técnica:</strong> {matchingRT.specialty}</p>
                <p><strong>Contato:</strong> {matchingRT.email} | {matchingRT.phone}</p>
                <p className="md:col-span-2"><strong>Endereço Profissional:</strong> {matchingRT.address || matchingRT.clinicAddress || 'Endereço registrado no sistema GeaAgro'}</p>
                
                {matchingRT.hasDigitalSignature && (
                  <p className="md:col-span-2 mt-1 px-2.5 py-1.5 bg-emerald-100/50 rounded-lg text-[10px] font-mono text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Assinado Eletronicamente via ICP-Brasil • Token ICP-ID: {matchingRT.legalSignatureHash || '8f7d9a1c2e3f4b5a6c7d8e9f0a1b2c3d4e5f6a7b'} ({matchingRT.legalSignatureDate || '2026-09-22'})
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Metodologia Aplicada (Localizada abaixo de Responsabilidade Técnica) */}
            <div id="sec-3-metodologia" className="pericia-card-section space-y-3 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/70 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                3. METODOLOGIA APLICADA
              </h3>
              <p className="text-slate-800 leading-relaxed text-justify">
                {pericia.laudoOficial?.metodologia ||
                  'O presente trabalho pericial foi desenvolvido com base em vistorias presenciais minuciosas de campo, georreferenciamento de pontos de amostragem, coleta sistemática de evidências fotográficas auditáveis e rigorosa observância aos preceitos da Norma Técnica Brasileira ABNT NBR 14.653-5 (Avaliação de Bens — Parte 5: Imóveis Rurais e Recursos Naturais/Ambientais).'}
              </p>
            </div>

            {/* Section 4: Caracterização da Região e Climatologia */}
            <div id="sec-4-clima" className="pericia-card-section space-y-4 font-sans text-xs border border-amber-100 p-5 rounded-xl bg-amber-50/10 scroll-mt-6">
              <h3 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] border-b border-amber-200 pb-1.5 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-600" />
                4. CARACTERIZAÇÃO DA REGIÃO E DADOS CLIMATOLÓGICOS HISTÓRICOS
              </h3>
              
              <div className="text-slate-800 text-[11px] leading-relaxed text-justify space-y-3">
                <p><strong>Aspectos Físicos e Geográficos:</strong> {regionalAndClimate.caracteristicas}</p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">Média Mensal Climatológica (Histórico de 12 Meses)</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* We can render monthly climatology inside compact visual blocks */}
                  {regionalAndClimate.dadosClimatologicos.map((item) => (
                    <div key={item.mes} className="bg-white border border-slate-200/60 rounded-lg p-2 text-center space-y-1">
                      <p className="font-bold text-slate-900 text-[10px] border-b border-slate-100 pb-0.5">{item.mes}</p>
                      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[7px] uppercase font-bold">Mín</span>
                          <span className="font-bold">{item.minima}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[7px] uppercase font-bold">Máx</span>
                          <span className="font-bold">{item.maxima}°C</span>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50/50 py-0.5 rounded border border-emerald-100/40">
                        <span className="text-[7px] text-slate-400 uppercase block font-bold">Precipitação</span>
                        <strong className="text-[10px]">{item.precipitacao} mm</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Objeto da Avaliação */}
            <div id="sec-5-objeto" className="pericia-card-section space-y-3 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/80 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                5. OBJETO DA AVALIAÇÃO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-800">
                <p className="md:col-span-2"><strong>O que está sendo periciado:</strong> {pericia.objetoDescricao?.oQueEstaSendoPericiado || `Lavoura / Ativo Agrícola de ${pericia.imovelNome}`}</p>
                <p className="md:col-span-2"><strong>Problema / Sinistro Constatado:</strong> {pericia.objetoDescricao?.qualOProblema || 'Danos de produtividade ou fisiológicos na cultura.'}</p>
                <p><strong>Finalidade da Avaliação:</strong> {pericia.objetoDescricao?.finalidade || 'Instrução probatória e caracterização técnica.'}</p>
                <p><strong>Período Envolvido:</strong> {pericia.objetoDescricao?.periodoEnvolvido || 'Safra Corrente'}</p>
                <p><strong>Local / Talhões:</strong> {pericia.objetoDescricao?.localTalhao || 'Área mapeada'}</p>
                <p><strong>Cultura Principal:</strong> {pericia.objetoDescricao?.cultura || 'Soja'}</p>
                <p><strong>Área Afetada:</strong> {pericia.objetoDescricao?.areaAfetadaHa || 0} hectares</p>
                <p><strong>Evento Relacionado:</strong> {pericia.objetoDescricao?.eventoRelacionado || 'Vistoria solicitada'}</p>
              </div>
            </div>

            {/* Section 5.1: Do Imóvel Avaliado */}
            <div id="sec-5-1-imovel" className="pericia-card-section space-y-4 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/50 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                5.1 DO IMÓVEL AVALIADO
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-800">
                {/* Left side: Dados e Áreas */}
                <div className="space-y-2 md:border-r md:border-slate-200 md:pr-4">
                  <p><strong>Imóvel:</strong> {pericia.imovelAvaliado?.imovelNome || pericia.imovelNome || 'Não informado'}</p>
                  <p><strong>Matrícula:</strong> {pericia.imovelAvaliado?.matricula || 'Não informado'}</p>
                  <p><strong>Área Total:</strong> {pericia.imovelAvaliado?.areaTotal ? `${pericia.imovelAvaliado.areaTotal} ha` : 'Não informado'}</p>
                  <p><strong>Área Agricultável:</strong> {pericia.imovelAvaliado?.areaAgricultavel ? `${pericia.imovelAvaliado.areaAgricultavel} ha` : 'Não informado'}</p>
                  <p><strong>Acesso:</strong> {pericia.imovelAvaliado?.acesso || 'Não informado'}</p>
                  <p><strong>Índice Pluviométrico:</strong> {pericia.imovelAvaliado?.indicePluviometrico || 'Não informado'}</p>
                </div>

                {/* Right side: Solo, Infra & Produtividade */}
                <div className="space-y-2 md:pl-2">
                  <p><strong>Topografia:</strong> {pericia.imovelAvaliado?.topografia || 'Não informado'}</p>
                  <p><strong>Características do Solo:</strong> {pericia.imovelAvaliado?.caracteristicasSolo || 'Não informado'}</p>
                  <p><strong>Aptidão:</strong> {pericia.imovelAvaliado?.aptidao || 'Não informado'}</p>
                  <p><strong>Infraestrutura:</strong> {pericia.imovelAvaliado?.infraestrutura || 'Não informado'}</p>
                  <p><strong>Produtividade (Culturas e Períodos):</strong> {pericia.imovelAvaliado?.produtividadeCulturas || 'Não informado'}</p>
                  <p><strong>Benfeitorias Identificadas:</strong> {pericia.imovelAvaliado?.benfeitorias || 'Não informado'}</p>
                </div>
              </div>

              {/* Imovel Photo section - Primary & Additional Photos */}
              {pericia.imovelAvaliado?.fotoAreaUrl && (
                <div className="pericia-card-section mt-4 space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/70">
                  <div className="overflow-hidden rounded-lg aspect-video max-h-72 bg-slate-100 flex items-center justify-center border border-slate-200">
                    <img
                      src={pericia.imovelAvaliado.fotoAreaUrl}
                      alt="Croqui / Foto do Imóvel Avaliado"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-slate-100/80 text-center py-1.5 px-2 rounded text-[10px] text-slate-700 font-medium border border-slate-200/60">
                    <strong>Figura 1:</strong> Fotografia Aérea / Croqui Situacional do Imóvel Periciado ({pericia.imovelAvaliado.imovelNome || pericia.imovelNome})
                  </div>
                </div>
              )}

              {/* Additional Imóvel Photos / Croquis if available */}
              {pericia.imovelAvaliado?.fotosAdicionais && pericia.imovelAvaliado.fotosAdicionais.length > 0 && (
                <div className="pericia-card-section mt-3 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">
                    Registros Fotográficos Complementares do Imóvel
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {pericia.imovelAvaliado.fotosAdicionais.map((url, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-lg p-2 bg-slate-50/60 space-y-1">
                        <div className="aspect-video max-h-44 overflow-hidden rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                          <img
                            src={url}
                            alt={`Foto complementar ${idx + 1}`}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[9px] text-center font-medium text-slate-600">
                          <strong>Figura 1.{idx + 1}:</strong> Registro Complementar do Imóvel / Benfeitoria
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 5.2: Avaliação do Imóvel & Precificação da Terra Nua */}
            {pericia.avaliacaoImovel && (
              <div id="sec-5-2-avaliacao" className="pericia-card-section space-y-4 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/50 scroll-mt-6">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  5.2 AVALIAÇÃO DO IMÓVEL E PRECIFICAÇÃO DA TERRA NUA
                </h3>

                <div className="space-y-3 text-[11px] text-slate-800 text-justify">
                  {pericia.avaliacaoImovel.avaliacaoJudicial && (
                    <p><strong>Avaliação Judicial:</strong> {pericia.avaliacaoImovel.avaliacaoJudicial}</p>
                  )}
                  {pericia.avaliacaoImovel.comportamentoMercado && (
                    <p><strong>Comportamento do Mercado de Imóveis Rurais na Região:</strong> {pericia.avaliacaoImovel.comportamentoMercado}</p>
                  )}
                  {pericia.avaliacaoImovel.valorizantesDesvalorizantes && (
                    <p><strong>Valorizantes e Desvalorizantes:</strong> {pericia.avaliacaoImovel.valorizantesDesvalorizantes}</p>
                  )}
                </div>

                {pericia.avaliacaoImovel.precificacaoTerraNua && pericia.avaliacaoImovel.precificacaoTerraNua.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">Amostragem de Mercado para Precificação da Terra Nua</p>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Amostra</th>
                            <th className="p-2">Área (ha)</th>
                            <th className="p-2">Aptidão</th>
                            <th className="p-2">Topografia</th>
                            <th className="p-2">Município</th>
                            <th className="p-2">Valor (R$)</th>
                            <th className="p-2">Negócio</th>
                            <th className="p-2 text-right">Unitário (R$/ha)</th>
                            <th className="p-2">Imobiliária</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.precificacaoTerraNua.map((item) => {
                            const unitarioVal = item.areaTotalHa > 0 ? (item.valorBrl / item.areaTotalHa) : 0;
                            return (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.amostra}</td>
                                <td className="p-2 font-mono">{item.areaTotalHa.toLocaleString('pt-BR')} ha</td>
                                <td className="p-2">{item.aptidao}</td>
                                <td className="p-2">{item.topografia}</td>
                                <td className="p-2">{item.municipio}</td>
                                <td className="p-2 font-mono font-bold text-emerald-800">
                                  {item.valorBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="p-2">{item.tipoNegocio}</td>
                                <td className="p-2 font-mono font-bold text-right text-slate-800">
                                  {unitarioVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ha
                                </td>
                                <td className="p-2 text-slate-600">{item.imobiliaria}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Preço Médio calculated for the PDF */}
                    <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                      <span className="font-bold text-emerald-950 uppercase text-[9px] tracking-wider">
                        Preço Médio Calculado da Terra Nua (Homogeneizado):
                      </span>
                      <span className="font-mono font-bold text-emerald-900 text-sm">
                        {(() => {
                          const list = pericia.avaliacaoImovel?.precificacaoTerraNua || [];
                          const unitValues = list.map(item => {
                            const area = item.areaTotalHa || 1;
                            return item.valorBrl / area;
                          });
                          const sum = unitValues.reduce((acc, curr) => acc + curr, 0);
                          const avg = list.length > 0 ? sum / list.length : 0;
                          return avg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        })()}/ha
                      </span>
                    </div>
                  </div>
                )}

                {/* Land Capability and Utilization Subsection (5.2.2) */}
                {pericia.avaliacaoImovel.aproveitamentoTerras && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">
                      5.2.2 Balanço de Ocupação e Classes de Capacidade de Uso das Terras (ABNT NBR 14653-3)
                    </p>

                    {/* Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Área Total</span>
                        <strong className="font-mono text-slate-900">{pericia.avaliacaoImovel.aproveitamentoTerras.areaTotalHa} ha</strong>
                        <span className="text-[9px] text-slate-400 block">({pericia.avaliacaoImovel.aproveitamentoTerras.quantidadeModulosFiscais || '-'} Módulos Fiscais)</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 block text-[9px] uppercase font-bold">Área Aproveitável</span>
                        <strong className="font-mono text-emerald-800">{pericia.avaliacaoImovel.aproveitamentoTerras.areaAproveitavelTotalHa} ha</strong>
                        <span className="text-[9px] text-emerald-600 block">({pericia.avaliacaoImovel.aproveitamentoTerras.coeficienteAproveitamentoPercent}% da gleba)</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-blue-200">
                        <span className="text-blue-700 block text-[9px] uppercase font-bold">Preservação (APP + RL)</span>
                        <strong className="font-mono text-blue-800">
                          {(Number(pericia.avaliacaoImovel.aproveitamentoTerras.areaReservaLegalHa || 0) + Number(pericia.avaliacaoImovel.aproveitamentoTerras.areaPreservacaoPermanenteHa || 0)).toFixed(1)} ha
                        </strong>
                        <span className="text-[9px] text-blue-600 block">RL: {pericia.avaliacaoImovel.aproveitamentoTerras.areaReservaLegalHa || 0} ha | APP: {pericia.avaliacaoImovel.aproveitamentoTerras.areaPreservacaoPermanenteHa || 0} ha</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Lavouras / Pastagens</span>
                        <strong className="font-mono text-slate-800">
                          {pericia.avaliacaoImovel.aproveitamentoTerras.areaAgricultavelLavouraHa || 0} ha Lav.
                        </strong>
                        <span className="text-[9px] text-slate-500 block">{pericia.avaliacaoImovel.aproveitamentoTerras.areaPastagemFormadaHa || 0} ha Past. Formada</span>
                      </div>
                    </div>

                    {/* Classes Table */}
                    {pericia.avaliacaoImovel.aproveitamentoTerras.classesTerras && pericia.avaliacaoImovel.aproveitamentoTerras.classesTerras.length > 0 && (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                              <th className="p-2">Classe</th>
                              <th className="p-2">Aptidão Agrícola Predominante</th>
                              <th className="p-2">Relevo</th>
                              <th className="p-2 text-center">Área (ha)</th>
                              <th className="p-2 text-center">% Gleba</th>
                              <th className="p-2 text-right">Valor Unitário (R$/ha)</th>
                              <th className="p-2 text-right">Subtotal (R$)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pericia.avaliacaoImovel.aproveitamentoTerras.classesTerras.map((cl) => (
                              <tr key={cl.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{cl.classe}</td>
                                <td className="p-2 text-slate-700">{cl.descricaoUso}</td>
                                <td className="p-2 text-slate-600">{cl.declividadePredominante || '-'}</td>
                                <td className="p-2 font-mono text-center font-bold text-slate-800">{cl.areaHa} ha</td>
                                <td className="p-2 font-mono text-center text-slate-600">{cl.percentualArea}%</td>
                                <td className="p-2 font-mono text-right text-slate-700">
                                  {cl.valorUnitarioEstimadoBrl?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ha
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-emerald-800">
                                  {cl.valorTotalEstimadoBrl?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                              <td colSpan={3} className="p-2 text-right uppercase text-[9px]">Total Homogeneizado das Classes:</td>
                              <td className="p-2 text-center font-mono text-emerald-800">
                                {pericia.avaliacaoImovel.aproveitamentoTerras.classesTerras.reduce((acc, curr) => acc + (curr.areaHa || 0), 0).toFixed(1)} ha
                              </td>
                              <td className="p-2 text-center font-mono">100%</td>
                              <td className="p-2 text-right font-mono text-[9px] text-slate-600">—</td>
                              <td className="p-2 text-right font-mono text-emerald-900">
                                {pericia.avaliacaoImovel.aproveitamentoTerras.classesTerras.reduce((acc, curr) => acc + (curr.valorTotalEstimadoBrl || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {pericia.avaliacaoImovel.aproveitamentoTerras.observacoesAproveitamento && (
                      <p className="text-[10.5px] text-slate-800 leading-relaxed text-justify bg-white p-2.5 rounded border border-slate-200">
                        <strong>Parecer Técnico de Aptidão e Aproveitamento:</strong> {pericia.avaliacaoImovel.aproveitamentoTerras.observacoesAproveitamento}
                      </p>
                    )}
                  </div>
                )}

                {/* 5.3 AVALIAÇÃO DE BENFEITORIAS */}
                {pericia.avaliacaoImovel.benfeitorias && pericia.avaliacaoImovel.benfeitorias.length > 0 && pericia.avaliacaoImovel.incluirBenfeitorias !== false && (
                  <div id="sec-5-3-benfeitorias" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-600" />
                        5.3 Avaliação Pericial das Benfeitorias Reprodutivas e Não Reprodutivas
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.benfeitorias.filter(b => b.incluirNoLaudo !== false).length} itens no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Item / Descrição</th>
                            <th className="p-2">Categoria</th>
                            <th className="p-2">Dimensões / Qtd</th>
                            <th className="p-2">Estado Conservação</th>
                            <th className="p-2 text-right">Custo Novo (R$)</th>
                            <th className="p-2 text-center">Fator Deprec.</th>
                            <th className="p-2 text-right">Valor Depreciado (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.benfeitorias
                            .filter(b => b.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.descricao}</td>
                                <td className="p-2 text-slate-600">{item.categoria || item.tipo}</td>
                                <td className="p-2 font-mono text-slate-700">
                                  {item.quantidade} {item.unidade}
                                </td>
                                <td className="p-2 text-slate-700">{item.estadoConservacao || 'bom'} ({item.vidaUtilAnos ? `${item.idadeAnos || 0}/${item.vidaUtilAnos}a` : '-'})</td>
                                <td className="p-2 font-mono text-right text-slate-600">
                                  {item.custoNovoUnitarioBrl ? (item.custoNovoUnitarioBrl * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono text-center text-amber-700 font-semibold">
                                  {item.fatorDepreciacao !== undefined ? item.fatorDepreciacao.toFixed(2) : '1.00'}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-amber-850">
                                  {item.valorDepreciadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={6} className="p-2 text-right uppercase text-[9px]">Total Geral de Benfeitorias:</td>
                            <td className="p-2 text-right font-mono text-amber-900">
                              {pericia.avaliacaoImovel.benfeitorias
                                .filter(b => b.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.valorDepreciadoBrl || 0), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.4 MÁQUINAS E EQUIPAMENTOS */}
                {pericia.avaliacaoImovel.maquinasEquipamentos && pericia.avaliacaoImovel.maquinasEquipamentos.length > 0 && pericia.avaliacaoImovel.incluirMaquinasEquipamentos !== false && (
                  <div id="sec-5-4-maquinas" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Tractor className="w-3.5 h-3.5 text-blue-600" />
                        5.4 Avaliação de Máquinas Agrícolas, Implementos e Equipamentos Fixos
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.maquinasEquipamentos.filter(m => m.incluirNoLaudo !== false).length} itens no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Tipo / Equipamento</th>
                            <th className="p-2">Marca / Modelo</th>
                            <th className="p-2 text-center">Ano Fab.</th>
                            <th className="p-2 text-center">Horímetro / Uso</th>
                            <th className="p-2">Estado Conservação</th>
                            <th className="p-2 text-right">Valor Novo (R$)</th>
                            <th className="p-2 text-right">Valor Atual Mercado (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.maquinasEquipamentos
                            .filter(m => m.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.tipo}</td>
                                <td className="p-2 text-slate-700">{item.marca} {item.modelo}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.anoFabricacao || '-'}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.horimetroOuUso || '-'}</td>
                                <td className="p-2 text-slate-700">{item.estadoConservacao}</td>
                                <td className="p-2 font-mono text-right text-slate-600">
                                  {item.valorNovoBrl ? item.valorNovoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-blue-900">
                                  {item.valorAtualMercadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={6} className="p-2 text-right uppercase text-[9px]">Total de Máquinas e Equipamentos:</td>
                            <td className="p-2 text-right font-mono text-blue-900">
                              {pericia.avaliacaoImovel.maquinasEquipamentos
                                .filter(m => m.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.valorAtualMercadoBrl || 0), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.5 VEÍCULOS */}
                {pericia.avaliacaoImovel.veiculos && pericia.avaliacaoImovel.veiculos.length > 0 && pericia.avaliacaoImovel.incluirVeiculos !== false && (
                  <div id="sec-5-5-veiculos" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        5.5 Avaliação de Veículos Automotores, Caminhões e Utilitários Rurais
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.veiculos.filter(v => v.incluirNoLaudo !== false).length} itens no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Veículo</th>
                            <th className="p-2">Marca / Modelo</th>
                            <th className="p-2">Placa / Chassi</th>
                            <th className="p-2 text-center">Ano / Mod</th>
                            <th className="p-2 text-center">KM / Estado</th>
                            <th className="p-2 text-right">Referência FIPE (R$)</th>
                            <th className="p-2 text-right">Valor Avaliado (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.veiculos
                            .filter(v => v.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.tipo}</td>
                                <td className="p-2 text-slate-700">{item.marca} {item.modelo}</td>
                                <td className="p-2 font-mono text-slate-600">{item.placaOuChassi || '-'}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.anoModelo || '-'}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.quilometragemOuEstado || '-'}</td>
                                <td className="p-2 font-mono text-right text-slate-500">
                                  {item.referenciaFipeBrl ? item.referenciaFipeBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-indigo-900">
                                  {item.valorAvaliadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={6} className="p-2 text-right uppercase text-[9px]">Total de Veículos e Utilitários:</td>
                            <td className="p-2 text-right font-mono text-indigo-900">
                              {pericia.avaliacaoImovel.veiculos
                                .filter(v => v.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + curr.valorAvaliadoBrl, 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.6 SEMOVENTES */}
                {pericia.avaliacaoImovel.semoventes && pericia.avaliacaoImovel.semoventes.length > 0 && pericia.avaliacaoImovel.incluirSemoventes !== false && (
                  <div id="sec-5-6-semoventes" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                        5.6 Avaliação de Semoventes, Plantel e Rebanho
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.semoventes.filter(s => s.incluirNoLaudo !== false).length} lotes no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Lote / Espécie</th>
                            <th className="p-2">Raça / Categoria</th>
                            <th className="p-2 text-center">Cabeças</th>
                            <th className="p-2 text-center">Peso Médio</th>
                            <th className="p-2">Finalidade Zootécnica</th>
                            <th className="p-2 text-right">Unitário (R$/cab)</th>
                            <th className="p-2 text-right">Valor Total (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.semoventes
                            .filter(s => s.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.especie} - {item.categoria}</td>
                                <td className="p-2 text-slate-700">{item.raca || '-'}</td>
                                <td className="p-2 font-mono text-center font-bold text-slate-800">{item.quantidadeCabecas}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.pesoMedioKgOuArrobas || '-'}</td>
                                <td className="p-2 text-slate-700">{item.finalidadeZootecnica || 'Comercial'}</td>
                                <td className="p-2 font-mono text-right text-slate-700">
                                  {item.valorUnitarioCabecaBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-amber-900">
                                  {item.valorTotalBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={6} className="p-2 text-right uppercase text-[9px]">Total Geral de Semoventes:</td>
                            <td className="p-2 text-right font-mono text-amber-900">
                              {pericia.avaliacaoImovel.semoventes
                                .filter(s => s.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.valorTotalBrl || 0), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.7 RECURSOS NATURAIS */}
                {pericia.avaliacaoImovel.recursosNaturais && pericia.avaliacaoImovel.recursosNaturais.length > 0 && pericia.avaliacaoImovel.incluirRecursosNaturais !== false && (
                  <div id="sec-5-7-recursos" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Trees className="w-3.5 h-3.5 text-emerald-600" />
                        5.7 Avaliação de Recursos Naturais, Florestas Nativas/Plantadas e Minerais
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.recursosNaturais.filter(r => r.incluirNoLaudo !== false).length} itens no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Recurso / Descrição</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Volume / Área Estimada</th>
                            <th className="p-2">Situação Licenciamento</th>
                            <th className="p-2 text-right">Valor Unitário</th>
                            <th className="p-2 text-right">Valor Total Avaliado (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.recursosNaturais
                            .filter(r => r.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.descricaoLocalizacao}</td>
                                <td className="p-2 text-slate-600">{item.tipoRecurso}</td>
                                <td className="p-2 font-mono text-slate-700">{item.volumeOuAreaEstimada || '-'}</td>
                                <td className="p-2 text-slate-700">{item.situacaoLicenciamento || 'Em conformidade legal'}</td>
                                <td className="p-2 font-mono text-right text-slate-600">
                                  {item.valorUnitarioBrl ? item.valorUnitarioBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-emerald-900">
                                  {item.valorTotalAvaliadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={5} className="p-2 text-right uppercase text-[9px]">Total de Recursos Naturais:</td>
                            <td className="p-2 text-right font-mono text-emerald-900">
                              {pericia.avaliacaoImovel.recursosNaturais
                                .filter(r => r.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.valorTotalAvaliadoBrl || 0), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.8 FRUTOS E SAFRAS PENDENTES */}
                {pericia.avaliacaoImovel.frutos && pericia.avaliacaoImovel.frutos.length > 0 && pericia.avaliacaoImovel.incluirFrutos !== false && (
                  <div id="sec-5-8-frutos" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-lime-600" />
                        5.8 Avaliação de Frutos, Culturas em Andamento e Safras Pendentes
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.frutos.filter(f => f.incluirNoLaudo !== false).length} safras no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Cultura / Safra</th>
                            <th className="p-2 text-center">Área (ha)</th>
                            <th className="p-2">Estádio Vegetativo</th>
                            <th className="p-2 text-center">Produtividade Esperada</th>
                            <th className="p-2 text-right">Custo Invertido (R$)</th>
                            <th className="p-2 text-right">Valor Esperado Colheita</th>
                            <th className="p-2 text-right">Valor Avaliado (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.frutos
                            .filter(f => f.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.cultura}</td>
                                <td className="p-2 font-mono text-center font-bold text-slate-800">{item.areaCultivadaHa} ha</td>
                                <td className="p-2 text-slate-700">{item.estagioVegetativo}</td>
                                <td className="p-2 font-mono text-center text-slate-600">{item.produtividadeEsperada}</td>
                                <td className="p-2 font-mono text-right text-slate-500">
                                  {item.custoInvestidoAteDataBrl ? item.custoInvestidoAteDataBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono text-right text-slate-600">
                                  {item.valorEsperadoColheitaBrl ? item.valorEsperadoColheitaBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-lime-900">
                                  {item.valorAvaliadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={6} className="p-2 text-right uppercase text-[9px]">Total de Frutos e Safras Pendentes:</td>
                            <td className="p-2 text-right font-mono text-lime-900">
                              {pericia.avaliacaoImovel.frutos
                                .filter(f => f.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.valorAvaliadoBrl || 0), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.9 DIREITOS E SERVIDÕES */}
                {pericia.avaliacaoImovel.direitos && pericia.avaliacaoImovel.direitos.length > 0 && pericia.avaliacaoImovel.incluirDireitos !== false && (
                  <div id="sec-5-9-direitos" className="space-y-3 pt-3 border-t border-slate-200 scroll-mt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-purple-600" />
                        5.9 Avaliação de Direitos, Servidões de Passagem, Ônus e Gravames
                      </p>
                      <span className="text-[9px] font-mono text-slate-500">
                        {pericia.avaliacaoImovel.direitos.filter(d => d.incluirNoLaudo !== false).length} itens no laudo
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                            <th className="p-2">Direito / Gravame</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Titular / Beneficiário</th>
                            <th className="p-2">Impacto / Vigência</th>
                            <th className="p-2 text-right">Impacto Financeiro (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pericia.avaliacaoImovel.direitos
                            .filter(d => d.incluirNoLaudo !== false)
                            .map((item) => (
                              <tr key={item.id} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{item.denominacao}</td>
                                <td className="p-2 text-slate-600">{item.tipoDireito}</td>
                                <td className="p-2 text-slate-700">{item.titularOuConcessionaria || '-'}</td>
                                <td className="p-2 text-slate-700">
                                  <span className={item.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? 'text-red-700 font-semibold' : 'text-purple-800 font-semibold'}>
                                    {item.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? 'Desvalorizante / Ônus (-)' : item.naturezaImpacto === 'positivo_valorizacao' ? 'Valorizante (+)' : 'Neutro / Informativo'}
                                  </span>
                                  {item.prazoVigencia ? ` • ${item.prazoVigencia}` : ''}
                                </td>
                                <td className={`p-2 font-mono font-bold text-right ${item.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? 'text-red-700' : 'text-purple-900'}`}>
                                  {item.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? '- ' : item.naturezaImpacto === 'positivo_valorizacao' ? '+ ' : ''}
                                  {item.valorAvaliadoBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                            <td colSpan={4} className="p-2 text-right uppercase text-[9px]">Saldo Líquido de Direitos e Ônus:</td>
                            <td className="p-2 text-right font-mono text-purple-900">
                              {pericia.avaliacaoImovel.direitos
                                .filter(d => d.incluirNoLaudo !== false)
                                .reduce((acc, curr) => acc + (curr.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? -curr.valorAvaliadoBrl : curr.valorAvaliadoBrl), 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5.10 QUADRO SÍNTESE DA AVALIAÇÃO GLOBAL DO IMÓVEL RURAL */}
                {(() => {
                  const areaTotalPropriedade = pericia.imovelAvaliado?.areaTotal || pericia.objetoDescricao?.areaAfetadaHa || 0;
                  const resumoGlobal = calcularResumoValoresImovel(pericia.avaliacaoImovel, areaTotalPropriedade);

                  const componentsBreakdown = [
                    { nome: 'Terra Nua (VTN)', valor: resumoGlobal.valorTerraNuaBrl, percent: resumoGlobal.percentTerraNua, ativo: true },
                    { nome: 'Benfeitorias e Construções', valor: resumoGlobal.valorBenfeitoriasBrl, percent: resumoGlobal.percentBenfeitorias, ativo: pericia.avaliacaoImovel.incluirBenfeitorias !== false },
                    { nome: 'Máquinas e Equipamentos', valor: resumoGlobal.valorMaquinasEquipamentosBrl, percent: resumoGlobal.percentMaquinas, ativo: pericia.avaliacaoImovel.incluirMaquinasEquipamentos !== false },
                    { nome: 'Veículos e Utilitários', valor: resumoGlobal.valorVeiculosBrl, percent: resumoGlobal.percentVeiculos, ativo: pericia.avaliacaoImovel.incluirVeiculos !== false },
                    { nome: 'Semoventes e Rebanho', valor: resumoGlobal.valorSemoventesBrl, percent: resumoGlobal.percentSemoventes, ativo: pericia.avaliacaoImovel.incluirSemoventes !== false },
                    { nome: 'Recursos Naturais e Florestas', valor: resumoGlobal.valorRecursosNaturaisBrl, percent: resumoGlobal.percentRecursosNaturais, ativo: pericia.avaliacaoImovel.incluirRecursosNaturais !== false },
                    { nome: 'Frutos e Safras Pendentes', valor: resumoGlobal.valorFrutosBrl, percent: resumoGlobal.percentFrutos, ativo: pericia.avaliacaoImovel.incluirFrutos !== false },
                    { nome: 'Direitos e Servidões (Saldo Líquido)', valor: resumoGlobal.valorDireitosBrl, percent: resumoGlobal.percentDireitos, ativo: pericia.avaliacaoImovel.incluirDireitos !== false },
                  ];

                  return (
                    <div id="sec-5-10-resumo-global" className="space-y-3 pt-4 border-t-2 border-slate-300 scroll-mt-6">
                      <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[11px] uppercase tracking-wider text-emerald-400">
                            5.10 Quadro Síntese da Avaliação Global do Imóvel Rural (NBR 14653-3)
                          </p>
                          <p className="text-[9.5px] text-slate-300">
                            Consolidação de todos os componentes corpóreos e incorpóreos do patrimônio periciado
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Valor Global Avaliado</span>
                          <span className="text-base font-mono font-bold text-emerald-300">
                            {resumoGlobal.valorTotalImovelBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                              <th className="p-2">Componente Avaliado (NBR 14653-3)</th>
                              <th className="p-2 text-center">Status no Laudo</th>
                              <th className="p-2 text-right">Valor Total (R$)</th>
                              <th className="p-2 text-center">% Part.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {componentsBreakdown.map((comp, idx) => (
                              <tr key={idx} className="border-b border-slate-200/60 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-900">{comp.nome}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${comp.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                    {comp.ativo ? 'Incluso no Laudo' : 'Omitido'}
                                  </span>
                                </td>
                                <td className="p-2 font-mono font-bold text-right text-slate-800">
                                  {comp.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="p-2 font-mono text-center text-slate-600 font-semibold">
                                  {comp.percent}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-emerald-50/80 font-bold text-slate-900 border-t-2 border-emerald-300">
                              <td className="p-2.5 uppercase text-[10px] text-emerald-950 font-black">
                                VALOR PATRIMONIAL TOTAL DO IMÓVEL RURAL:
                              </td>
                              <td className="p-2.5 text-center font-mono text-[9px] text-emerald-800">
                                Gleba de {areaTotalPropriedade.toLocaleString('pt-BR')} ha
                              </td>
                              <td className="p-2.5 text-right font-mono text-base font-black text-emerald-950">
                                {resumoGlobal.valorTotalImovelBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                              <td className="p-2.5 text-center font-mono font-black text-emerald-950">
                                100%
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Section 6: Vistorias & Evidence Summary */}
            <div id="sec-6-vistorias" className="pericia-card-section space-y-3 font-sans text-xs scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                6. VISTORIAS DE CAMPO E EVIDÊNCIAS
              </h3>
              <p className="text-slate-800 leading-relaxed text-justify">
                Foram realizadas <strong>{pericia.vistorias.length} vistorias</strong> técnicas presenciais no imóvel{' '}
                {pericia.imovelNome}, com coleta de <strong>{pericia.fotografias.length} evidências fotográficas</strong>{' '}
                e <strong>{pericia.amostras.length} amostras de laboratório</strong> vinculadas à cadeia de custódia.
              </p>

              {/* Georreferenciamento e Delimitação Espacial */}
              {pericia.georreferenciamento && pericia.georreferenciamento.pontos.length > 0 && (
                <div id="sec-6-georreferenciamento" className="space-y-2.5 pt-2 border-t border-slate-200 scroll-mt-6">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    6.1 Georreferenciamento e Delimitação Espacial do Talhão Periciado
                  </h4>

                  {/* Geodesic Summary Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Sistema Geodésico</span>
                      <strong className="text-slate-800 font-mono text-[9.5px]">
                        {pericia.georreferenciamento.sistemaReferencia}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Centroide Pericial</span>
                      <strong className="text-slate-800 font-mono text-[9.5px]">
                        Lat: {pericia.georreferenciamento.centroide?.lat?.toFixed(5)}°<br />
                        Lng: {pericia.georreferenciamento.centroide?.lng?.toFixed(5)}°
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-emerald-200">
                      <span className="text-emerald-700 block text-[9px] uppercase font-bold">Área Poligonal Calculada</span>
                      <strong className="text-emerald-800 font-mono text-xs">
                        {pericia.georreferenciamento.areaCalculadaHa || pericia.objetoDescricao.areaAfetadaHa} ha
                      </strong>
                      <span className="text-[9px] text-slate-400 block">
                        ({((pericia.georreferenciamento.areaCalculadaHa || pericia.objetoDescricao.areaAfetadaHa) * 10000).toLocaleString('pt-BR')} m²)
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Perímetro e Vértices</span>
                      <strong className="text-slate-800 font-mono text-xs">
                        {pericia.georreferenciamento.perimetroCalculadoMeters || 1780} m
                      </strong>
                      <span className="text-[9px] text-slate-500 block">
                        {pericia.georreferenciamento.pontos.length} marcos/vértices
                      </span>
                    </div>
                  </div>

                  {/* Vertices Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[8.5px]">
                          <th className="p-1.5">Ponto</th>
                          <th className="p-1.5">Tipo</th>
                          <th className="p-1.5 font-mono">Latitude (DD)</th>
                          <th className="p-1.5 font-mono">Longitude (DD)</th>
                          <th className="p-1.5 font-mono text-center">Alt (m)</th>
                          <th className="p-1.5">Confrontação / Descrição Técnica</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pericia.georreferenciamento.pontos.map((p, idx) => (
                          <tr key={p.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-1.5 font-mono font-bold text-slate-900">{p.identificador}</td>
                            <td className="p-1.5 text-slate-600">
                              {p.tipo === 'vertice_perimetro'
                                ? 'Vértice de Perímetro'
                                : p.tipo === 'foto'
                                ? 'Ponto Fotográfico'
                                : p.tipo === 'ponto_amostra'
                                ? 'Amostra de Laboratório'
                                : p.tipo}
                            </td>
                            <td className="p-1.5 font-mono text-slate-800">{p.lat?.toFixed(6)}°</td>
                            <td className="p-1.5 font-mono text-slate-800">{p.lng?.toFixed(6)}°</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{p.altitude || '—'}</td>
                            <td className="p-1.5 text-slate-600">{p.descricao || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pericia.georreferenciamento.observacoesGeodesicas && (
                    <p className="text-[9.5px] text-slate-600 italic">
                      <strong>Nota Geodésica:</strong> {pericia.georreferenciamento.observacoesGeodesicas}
                      {pericia.georreferenciamento.arquivoImportadoNome && (
                        <span> (Arquivo fonte: <em>{pericia.georreferenciamento.arquivoImportadoNome}</em>)</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Photographic Evidence Gallery in Report */}
              {pericia.fotografias && pericia.fotografias.length > 0 && (
                <div id="sec-6-painel-fotos" className="space-y-3 pt-2 scroll-mt-6">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    6.2 Painel Fotográfico de Evidências Periciais ({pericia.fotografias.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {pericia.fotografias.map((foto, idx) => (
                      <div
                        key={foto.id || idx}
                        className="pericia-card-section border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 space-y-1.5 break-inside-avoid shadow-3xs"
                      >
                        <div className="aspect-video max-h-48 rounded overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <img
                            src={foto.fotoUrl}
                            alt={foto.descricao || `Evidência Fotográfica ${foto.numero}`}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1 text-[9px] text-slate-700 font-sans">
                          <div className="flex items-center justify-between font-bold text-slate-950 border-b border-slate-200/80 pb-0.5">
                            <span>Foto Nº {foto.numero}</span>
                            <span className="uppercase text-[8px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              {foto.tipoEvidencia.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">
                            <strong>Descrição:</strong> {foto.descricao || 'Registro pericial de campo'}
                          </p>
                          <div className="grid grid-cols-2 gap-x-2 text-[8px] text-slate-600 font-mono pt-0.5 border-t border-slate-100">
                            <span><strong>Data:</strong> {foto.data} {foto.hora}</span>
                            <span><strong>Talhão:</strong> {foto.talhao || 'Geral'}</span>
                            <span className="col-span-2">
                              <strong>Coordenadas GPS:</strong> {foto.coordenadas?.lat?.toFixed(5)}, {foto.coordenadas?.lng?.toFixed(5)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Financial Valuation */}
            <div id="sec-7-valoracao" className="pericia-card-section space-y-2 font-sans text-xs border p-4 rounded-lg bg-emerald-50/50 border-emerald-200 scroll-mt-6">
              <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] border-b border-emerald-200 pb-1">
                7. VALORAÇÃO DO DANO APURADO (CÁLCULO FINAL)
              </h3>
              <p className="font-mono text-sm font-bold text-emerald-900">
                VALOR TOTAL DOS DANOS CALCULADOS: R${' '}
                {valorDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-700 whitespace-pre-line font-mono mt-2">
                {pericia.calculosDanos?.memoriaCalculoTexto}
              </p>
            </div>

            {/* Section 8: Resultados e Discussão (Posicionada ANTES dos Quesitos) */}
            <div id="sec-8-resultados" className="pericia-card-section space-y-3 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/70 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                8. RESULTADOS E DISCUSSÃO
              </h3>
              <div className="text-slate-800 leading-relaxed text-justify space-y-2.5 whitespace-pre-line font-sans text-[11px]">
                {pericia.laudoOficial?.resultadoDiscussao ||
                  `1. DIAGNÓSTICO AGRONÔMICO E CARACTERIZAÇÃO TÉCNICA:
A instrução pericial procedida no imóvel rural ${pericia.imovelNome} (${pericia.municipio}/${pericia.uf}) identificou comprometimento fisiológico na cultura de ${pericia.objetoDescricao?.cultura || 'lavoura'}, cobrindo uma extensão de ${pericia.objetoDescricao?.areaAfetadaHa || 0} hectares. Os sintomas observados decorrem de ${pericia.objetoDescricao?.qualOProblema || 'dano agronômico apurado'}.

2. NEXO CAUSAL E CORRELAÇÃO DE EVIDÊNCIAS:
A análise cruzada entre os dados climáticos da região, os registros fotográficos georreferenciados e a constatação presencial in loco estabelece nexo de causalidade direto entre os eventos descritos e as perdas de produtividade apuradas.

3. ESTADO EDÁFICO E FERTILIDADE DO SOLO:
Conforme atestado nos boletins analíticos laboratoriais juntados aos Anexos deste Laudo Pericial, os níveis de fertilidade, saturação por bases (V%) e equilíbrio químico do solo encontram-se em patamares adequados para o pleno desenvolvimento da cultura, afastando qualquer hipótese de estresse nutricional nativo como causa primária das perdas apuradas.`}
              </div>
            </div>

            {/* Section 9: Resposta Formal aos Quesitos (Posicionada após Resultados e Discussão) */}
            <div id="sec-9-quesitos" className="pericia-card-section space-y-3 font-sans text-xs border border-slate-200 p-5 rounded-xl bg-slate-50/50 scroll-mt-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                9. RESPOSTA FORMAL AOS QUESITOS PROCESSUAIS
              </h3>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                Em estrito atendimento aos preceitos do Código de Processo Civil e às normas técnicas de perícia agronômica, o Perito passa a responder pontualmente e de forma fundamentada aos quesitos formulados nos autos:
              </p>

              <div className="space-y-3 pt-1">
                {pericia.quesitos && pericia.quesitos.length > 0 ? (
                  pericia.quesitos.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-3xs break-inside-avoid"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="font-bold text-slate-900 text-[11px]">
                          Quesito Nº {q.numero}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {q.respondido ? 'Respondido Conclusivamente' : 'Respondido'}
                        </span>
                      </div>
                      <p className="text-slate-800 text-[11px] font-medium">
                        <strong>Pergunta:</strong> {q.pergunta}
                      </p>
                      <div className="p-2.5 bg-slate-50 rounded text-[11px] text-slate-900 border-l-2 border-emerald-600 leading-relaxed text-justify">
                        <strong>Resposta Pericial Fundamentada:</strong>{' '}
                        {q.resposta ||
                          'O exame técnico pericial in loco e as amostras coletadas corroboram a caracterização fática descrita no corpo deste Laudo, confirmando os reflexos na lavoura sob a responsabilidade técnica do Perito.'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-[11px]">
                    Nenhum quesito formal apresentado pelas partes até o fechamento deste Laudo.
                  </p>
                )}
              </div>
            </div>

            {/* Section 10: Conclusão Pericial Final */}
            <div id="sec-10-conclusao" className="pericia-card-section space-y-2 font-sans text-xs border border-emerald-200 p-5 rounded-xl bg-emerald-50/30 scroll-mt-6">
              <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] border-b border-emerald-200 pb-1">
                10. CONCLUSÃO PERICIAL FINAL
              </h3>
              <p className="text-slate-800 leading-relaxed text-justify font-medium text-[11px]">
                {pericia.laudoOficial?.conclusaoFinal ||
                  'Diante do conjunto fático-probatório coligido durante a instrução pericial, exames de campo, ensaios laboratoriais e cálculos agroeconômicos fundamentados, conclui-se formalmente pela procedência dos fatos apurados, fixando-se a valoração técnica dos prejuízos no montante liquidado neste Laudo, submetendo-se à apreciação superior.'}
              </p>
            </div>

            {/* Section 11: Anexos do Laudo Pericial (Fotos, Análise de Solo e Outras Informações Relevantes) */}
            <div id="sec-11-anexos" className="pericia-card-section space-y-5 font-sans text-xs border border-slate-300 p-6 rounded-xl bg-slate-50/40 scroll-mt-6">
              <div className="border-b-2 border-emerald-800 pb-2">
                <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-700" />
                  11. ANEXOS DO LAUDO PERICIAL
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Documentação probatória complementar: Fotodocumentação de alta resolução, Boletins de Análise de Solo e Documentos Técnicos.
                </p>
              </div>

              {/* 11.1 Anexo I: Painel Fotográfico Complementar */}
              <div id="sec-11-1-fotos" className="space-y-3 scroll-mt-6">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10.5px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  11.1 ANEXO I — REGISTROS FOTOGRÁFICOS COMPLEMENTARES E CROQUIS
                </h4>

                {(() => {
                  const fotoAnexos = (pericia.anexos || []).filter((a) => a.tipo === 'foto');
                  const extraImovelFotos = pericia.imovelAvaliado?.fotosAdicionais || [];
                  const extraFieldFotos = (pericia.fotografias || []).slice(0, 4);

                  if (fotoAnexos.length > 0) {
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {fotoAnexos.map((foto, idx) => (
                          <div
                            key={foto.id || idx}
                            className="border border-slate-200 rounded-lg p-2.5 bg-white space-y-1.5 shadow-3xs break-inside-avoid"
                          >
                            {foto.arquivoUrl && (
                              <div className="aspect-video max-h-48 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                <img
                                  src={foto.arquivoUrl}
                                  alt={foto.titulo}
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <p className="font-bold text-slate-950 text-[10px]">
                              Figura Anexa 1.{idx + 1}: {foto.titulo}
                            </p>
                            {foto.descricao && (
                              <p className="text-[9px] text-slate-700 leading-snug">{foto.descricao}</p>
                            )}
                            {foto.observacoes && (
                              <p className="text-[8px] text-slate-500 font-mono">Obs: {foto.observacoes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (extraImovelFotos.length > 0 || extraFieldFotos.length > 0) {
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {extraFieldFotos.map((foto, idx) => (
                          <div
                            key={foto.id || idx}
                            className="border border-slate-200 rounded-lg p-2.5 bg-white space-y-1.5 shadow-3xs break-inside-avoid"
                          >
                            <div className="aspect-video max-h-48 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                              <img
                                src={foto.fotoUrl}
                                alt={`Foto ${foto.numero}`}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <p className="font-bold text-slate-950 text-[10px]">
                              Figura Anexa 1.{idx + 1}: Foto Nº {foto.numero} — {foto.tipoEvidencia.replace('_', ' ')}
                            </p>
                            <p className="text-[9px] text-slate-700 leading-snug">
                              {foto.descricao || 'Registro fotográfico pericial de campo.'}
                            </p>
                            <p className="text-[8px] text-slate-500 font-mono">
                              Talhão: {foto.talhao || 'Geral'} • Data: {foto.data}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <p className="text-slate-500 italic text-[11px]">
                      Nenhum registro fotográfico complementar anexado.
                    </p>
                  );
                })()}
              </div>

              {/* 11.2 Anexo II: Análise de Solo e Laudos Laboratoriais */}
              <div id="sec-11-2-solo" className="space-y-3 pt-2 scroll-mt-6">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10.5px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                  11.2 ANEXO II — LAUDOS LABORATORIAIS E ANÁLISES QUÍMICAS DE SOLO
                </h4>

                {(() => {
                  const soloAnexos = (pericia.anexos || []).filter((a) => a.tipo === 'analise_solo');
                  const soilDefault = pericia.analiseTecnica?.analiseSoloNutricao;

                  if (soloAnexos.length > 0) {
                    return (
                      <div className="space-y-4">
                        {soloAnexos.map((anexo, idx) => (
                          <div
                            key={anexo.id || idx}
                            className="border border-amber-200/80 rounded-xl p-4 bg-amber-50/20 space-y-3 break-inside-avoid"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200/60 pb-2">
                              <div>
                                <h5 className="font-bold text-amber-950 text-xs">
                                  Laudo de Fertilidade Nº {idx + 1}: {anexo.titulo}
                                </h5>
                                <p className="text-[10px] text-slate-600">
                                  Laboratório: <strong>{anexo.dadosSolo?.laboratorio || 'Laboratório de Solos'}</strong> • Laudo Nº: <strong>{anexo.dadosSolo?.numeroLaudo || 'N/A'}</strong>
                                </p>
                              </div>
                              <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded self-start">
                                Camada: {anexo.dadosSolo?.profundidadeCm || '0 - 20 cm'}
                              </span>
                            </div>

                            {/* Soil Chemical Attributes Table */}
                            {anexo.dadosSolo && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse border border-amber-200 bg-white text-[10px]">
                                  <thead>
                                    <tr className="bg-amber-100/60 font-bold text-amber-950">
                                      <th className="border border-amber-200 px-2 py-1">pH CaCl₂</th>
                                      <th className="border border-amber-200 px-2 py-1">M.O. (g/dm³)</th>
                                      <th className="border border-amber-200 px-2 py-1">P (mg/dm³)</th>
                                      <th className="border border-amber-200 px-2 py-1">K (cmolc)</th>
                                      <th className="border border-amber-200 px-2 py-1">Ca (cmolc)</th>
                                      <th className="border border-amber-200 px-2 py-1">Mg (cmolc)</th>
                                      <th className="border border-amber-200 px-2 py-1">CTC Total</th>
                                      <th className="border border-amber-200 px-2 py-1">V (%)</th>
                                      <th className="border border-amber-200 px-2 py-1">Argila (%)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="font-mono text-slate-800">
                                      <td className="border border-amber-200 px-2 py-1 font-bold">{anexo.dadosSolo.phCacl2 ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.materiaOrganica ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1 font-bold text-emerald-800">{anexo.dadosSolo.fosforoP ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.potassioK ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.calcioCa ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.magnesioMg ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.ctc ?? '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1 font-bold text-emerald-900 bg-emerald-50/50">{anexo.dadosSolo.vPercent ? `${anexo.dadosSolo.vPercent}%` : '-'}</td>
                                      <td className="border border-amber-200 px-2 py-1">{anexo.dadosSolo.argilaPercent ? `${anexo.dadosSolo.argilaPercent}%` : '-'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {anexo.dadosSolo?.interpretacao && (
                              <p className="text-[10.5px] text-slate-800 leading-relaxed text-justify bg-white p-2.5 rounded border border-amber-200/60">
                                <strong>Parecer Agronômico sobre a Fertilidade do Solo:</strong> {anexo.dadosSolo.interpretacao}
                              </p>
                            )}

                            {anexo.arquivoUrl && (
                              <div className="aspect-video max-h-56 rounded overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                                <img
                                  src={anexo.arquivoUrl}
                                  alt="Certificado do Laudo de Solo"
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (soilDefault) {
                    return (
                      <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/20 space-y-2.5 break-inside-avoid">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/70 pb-1.5 gap-1">
                          <div>
                            <h5 className="font-bold text-amber-950 text-xs">
                              Quadro Síntese de Fertilidade e Física do Solo da Gleba Avaliada
                            </h5>
                            <p className="text-[9px] text-slate-500">
                              Laboratório: <strong>{soilDefault.laboratorio || 'Laboratório de Análise de Solos'}</strong> • Laudo Nº: <strong>{soilDefault.numeroLaudo || 'N/A'}</strong>
                              {soilDefault.dataColeta ? ` • Coleta: ${new Date(soilDefault.dataColeta).toLocaleDateString('pt-BR')}` : ''}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded self-start">
                            Camada: {soilDefault.profundidadeAmostra || '0 - 20 cm'} {soilDefault.texturaSolo ? `• ${soilDefault.texturaSolo}` : ''}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-center border-collapse border border-amber-200 bg-white text-[10px]">
                            <thead>
                              <tr className="bg-amber-100/60 font-bold text-amber-950">
                                <th className="border border-amber-200 px-2 py-1">pH CaCl₂</th>
                                <th className="border border-amber-200 px-2 py-1">M.O. (%)</th>
                                <th className="border border-amber-200 px-2 py-1">P (mg/dm³)</th>
                                <th className="border border-amber-200 px-2 py-1">K (mg/dm³)</th>
                                <th className="border border-amber-200 px-2 py-1">Ca (cmolc)</th>
                                <th className="border border-amber-200 px-2 py-1">Mg (cmolc)</th>
                                <th className="border border-amber-200 px-2 py-1">Al (cmolc)</th>
                                <th className="border border-amber-200 px-2 py-1">H+Al</th>
                                <th className="border border-amber-200 px-2 py-1">CTC Total</th>
                                <th className="border border-amber-200 px-2 py-1">V (%)</th>
                                <th className="border border-amber-200 px-2 py-1">m (%)</th>
                                <th className="border border-amber-200 px-2 py-1">Argila (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="font-mono text-slate-800">
                                <td className="border border-amber-200 px-2 py-1 font-bold">{soilDefault.phCaCl2 ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.materiaOrganicaPercent ? `${soilDefault.materiaOrganicaPercent}%` : '-'}</td>
                                <td className="border border-amber-200 px-2 py-1 font-bold text-emerald-800">{soilDefault.fosforoP ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.potassioK ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.calcioCa ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.magnesioMg ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.aluminioAl ?? '0.0'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.hMaisAl ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.ctc ?? '-'}</td>
                                <td className="border border-amber-200 px-2 py-1 font-bold text-emerald-900 bg-emerald-50/50">{soilDefault.vPercent ? `${soilDefault.vPercent}%` : '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.mPercent != null ? `${soilDefault.mPercent}%` : '-'}</td>
                                <td className="border border-amber-200 px-2 py-1">{soilDefault.teorArgilaPercent != null ? `${soilDefault.teorArgilaPercent}%` : '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[10px] text-slate-700 leading-relaxed text-justify">
                          <strong>Interpretação Técnica:</strong> {soilDefault.observacoes || 'Saturação por bases e equilíbrio iônico em níveis adequados à cultura, atestando fertilidade favorável.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p className="text-slate-500 italic text-[11px]">
                      Nenhuma análise química de solo vinculada aos anexos deste Laudo.
                    </p>
                  );
                })()}
              </div>

              {/* 11.3 Anexo III: Documentos Complementares & Outras Informações Relevantes */}
              <div id="sec-11-3-docs" className="space-y-3 pt-2 scroll-mt-6">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10.5px] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  11.3 ANEXO III — DOCUMENTOS COMPLEMENTARES E INFORMAÇÕES RELEVANTES
                </h4>

                {(() => {
                  const docAnexos = (pericia.anexos || []).filter((a) => a.tipo === 'documento' || a.tipo === 'outro');
                  const initialDocs = pericia.documentosIniciais || [];

                  if (docAnexos.length > 0) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docAnexos.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 shadow-3xs break-inside-avoid"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                              <span className="font-bold text-slate-900 text-[10.5px]">
                                Doc. Anexo 3.{idx + 1}: {doc.titulo}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">{doc.data || 'N/A'}</span>
                            </div>
                            {doc.descricao && (
                              <p className="text-[9.5px] text-slate-700 leading-relaxed">{doc.descricao}</p>
                            )}
                            {doc.arquivoUrl && (
                              <div className="aspect-video max-h-36 rounded overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <img
                                  src={doc.arquivoUrl}
                                  alt={doc.titulo}
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            {doc.observacoes && (
                              <p className="text-[8.5px] text-slate-500 font-mono">Obs: {doc.observacoes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (initialDocs.length > 0) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {initialDocs.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-3xs break-inside-avoid text-[10px]"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1">
                              <span>Doc. 3.{idx + 1}: {doc.nome}</span>
                              <span className="font-mono text-slate-500 text-[9px]">{doc.data}</span>
                            </div>
                            <p className="text-slate-700"><strong>Fonte/Emissor:</strong> {doc.fonte}</p>
                            <p className="text-slate-600 leading-snug">{doc.descricao}</p>
                            <p className="text-[9px] font-mono text-emerald-800">Arquivo: {doc.arquivoNome}</p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[10.5px] text-slate-700 space-y-1">
                      <p><strong>Anotação de Responsabilidade Técnica (ART):</strong> {pericia.artNumero} registrada no {pericia.crea}.</p>
                      <p><strong>Cadeia de Custódia Pericial:</strong> {pericia.cadeiaEvidencias?.length || 0} itens catalogados e auditados.</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Signature Block */}
            <div id="sec-12-assinatura" className="pericia-signature-section pt-12 text-center space-y-2 font-sans text-xs scroll-mt-6">
              <div className="w-64 border-t border-slate-900 mx-auto pt-2 font-bold text-slate-900">
                {matchingRT.name}
              </div>
              <p className="text-[11px] text-slate-600 font-mono">
                {matchingRT.profession || 'Engenheiro Agrônomo'} • {matchingRT.crea}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                ART Nº {pericia.artNumero} • Documento assinado digitalmente no sistema GeaAgro
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
