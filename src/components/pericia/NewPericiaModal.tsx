import React, { useState, useMemo } from 'react';
import { X, Scale, Building2, MapPin, Calendar, FileText, User, Plus, UserCheck } from 'lucide-react';
import { Pericia, TipoPericia } from '../../types/pericia';
import { TIPO_PERICIA_LABELS } from './PericiaDashboard';
import { Agronomist } from '../../types/agronomy';

interface NewPericiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePericia: (newPericia: Pericia) => void;
}

export const NewPericiaModal: React.FC<NewPericiaModalProps> = ({
  isOpen,
  onClose,
  onCreatePericia,
}) => {
  // Fetch registered agronomists from local storage
  const registeredAgronomists = useMemo(() => {
    let list: Agronomist[] = [];
    try {
      const saved = localStorage.getItem('agronutri_agronomists');
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }
    return Array.isArray(list) ? list : [];
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'agronomica' as TipoPericia,
    contratanteNome: '',
    imovelNome: '',
    municipio: '',
    uf: 'GO',
    responsavelTecnico: '',
    crea: '',
    artNumero: '',
    dataAbertura: new Date().toISOString().split('T')[0],
    prazoFinal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    objetivo: '',
    descricaoInicial: '',
    cultura: 'Soja',
    areaAfetadaHa: 50,
    numeroProcesso: '',
    autor: '',
    reu: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.contratanteNome || !formData.imovelNome) return;

    const newCode = `PER-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPericiaObj: Pericia = {
      id: `pericia-${Date.now()}`,
      codigoPericia: newCode,
      numeroInterno: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: formData.nome,
      tipo: formData.tipo,
      status: 'aberta',
      contratanteNome: formData.contratanteNome,
      imovelNome: formData.imovelNome,
      municipio: formData.municipio || 'Rio Verde',
      uf: formData.uf || 'GO',
      responsavelTecnico: formData.responsavelTecnico,
      crea: formData.crea,
      artNumero: formData.artNumero,
      dataAbertura: formData.dataAbertura,
      prazoFinal: formData.prazoFinal,
      objetivo: formData.objetivo || 'Apuração pericial de ocorrência agrícola.',
      descricaoInicial: formData.descricaoInicial || 'Processo cadastrado para início de planejamento.',
      observacoes: '',
      numeroProcesso: formData.numeroProcesso,
      autor: formData.autor,
      reu: formData.reu,
      historicoAuditoria: [],

      partesEnvolvidas: [
        {
          id: `p-${Date.now()}-1`,
          nome: formData.contratanteNome,
          cpfCnpj: '',
          contato: '',
          endereco: '',
          papel: 'contratante',
        },
      ],

      objetoDescricao: {
        oQueEstaSendoPericiado: formData.cultura ? `Lavoura de ${formData.cultura}` : '',
        qualOProblema: formData.objetivo || '',
        finalidade: 'Instrução técnica pericial',
        periodoEnvolvido: '',
        localTalhao: '',
        cultura: formData.cultura || '',
        areaAfetadaHa: formData.areaAfetadaHa || 0,
        eventoRelacionado: '',
      },

      quesitos: [],
      documentosIniciais: [],
      checklistPreliminar: [
        { id: `ck-1`, item: 'Solicitar ART de Perícia e Anotação CREA', checado: false },
        { id: `ck-2`, item: 'Definir roteiro de campo e pontos GPS de amostragem', checado: false },
        { id: `ck-3`, item: 'Agendar vistoria presencial com acompanhamento das partes', checado: false },
      ],

      vistorias: [],
      fotografias: [],
      audiosVideos: [],
      amostras: [],
      checklistCampo: [],
      diarioCampo: [
        {
          id: `dc-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().substring(0, 5),
          atividade: 'Abertura oficial do processo de perícia',
          usuario: formData.responsavelTecnico || 'Perito Responsável',
          observacao: 'Início dos trabalhos',
        },
      ],

      cadeiaEvidencias: [],

      analiseTecnica: {
        caracterizacaoCultura: {
          cultura: formData.cultura || '',
          cultivar: '',
          areaHa: formData.areaAfetadaHa || 0,
          idadeOuCiclo: '',
          estagioFenologico: '',
          populacaoPlantasHa: 0,
          espacamento: '',
          sistemaCultivo: 'Direto',
          historicoManejo: '',
          produtividadeEsperadaKgHa: 0,
          produtividadeObservadaKgHa: 0,
        },
        analiseSoloNutricao: {
          phCaCl2: 0,
          materiaOrganicaPercent: 0,
          fosforoP: 0,
          potassioK: 0,
          calcioCa: 0,
          magnesioMg: 0,
          ctc: 0,
          vPercent: 0,
          mPercent: 0,
          compactacaoSolo: '',
          observacoes: '',
        },
        hipotesesTecnicas: [],
        fitotoxicidade: {
          possuiFitotoxicidade: false,
          produtoUtilizado: '',
          ingredienteAtivo: '',
          doseAplicada: '',
          dataAplicacao: '',
          equipamentoUtilizado: '',
          climaNaAplicacao: '',
          sintomasConstatados: '',
          distribuicaoSintomas: '',
          areaAfetadaHa: 0,
          historicoDerivaOuCalda: '',
        },
        pragasEDoencas: [],
        climaEventosAdversos: [],
        irrigacao: {
          possuiIrrigacao: false,
          sistema: 'Sequeiro',
          vazaoLh: '',
          pressaoBar: '',
          uniformidadePercent: 0,
          falhasConstatadas: '',
        },
        diagnosticoEstruturado: {
          observacaoGeral: '',
          evidenciaChave: '',
          dadoTecnicoBase: '',
          analiseCausal: '',
          conclusaoTecnicaPreliminar: '',
        },
      },

      calculosDanos: {
        tipoDanoPredominante: 'Perda de Produção',
        areaTotalHa: formData.areaAfetadaHa || 0,
        areaAfetadaHa: formData.areaAfetadaHa || 0,
        areaTotalAfetadaHa: formData.areaAfetadaHa || 0,
        percentualAreaAfetada: 0,
        severidadeMediaPercent: 0,
        produtividadeEsperadaKgHa: 0,
        produtividadeObservadaKgHa: 0,
        perdaFisicaKgHa: 0,
        perdaFisicaTotalKg: 0,
        valorUnitarioBrlPorKg: 0,
        perdaFinanceiraTotalBrl: 0,
        custosAdicionais: [],
        totalCustosAdicionaisBrl: 0,
        valoracaoAtivos: [],
        depreciacaoItens: [],
        cenarios: {
          esperado: { producaoKg: 0, receitaBrl: 0, custoBrl: 0, margemBrl: 0 },
          observado: { producaoKg: 0, receitaBrl: 0, custoBrl: 0, margemBrl: 0 },
          comRecuperacao: { producaoKg: 0, receitaBrl: 0, custoBrl: 0, margemBrl: 0 },
          perdaTotal: { producaoKg: 0, receitaBrl: 0, custoBrl: 0, margemBrl: 0 },
        },
        memoriaCalculo: [],
        memoriaCalculoTexto: '',
      },

      encerrametoLaudo: {
        sinteseFatos: '',
        analiseCritica: '',
        conclusaoTexto: '',
        limitacoesTecnicas: '',
        responsavelTecnico: {
          nome: formData.responsavelTecnico,
          profissao: 'Engenheiro Agrônomo',
          crea: formData.crea,
          artNumero: formData.artNumero,
          declaracaoAceite: true,
          dataAssinatura: new Date().toISOString().split('T')[0],
        },
        dataEncerramento: new Date().toISOString().split('T')[0],
        checklistEncerramento: [
          { id: 'cle-1', item: 'Emissão de Laudo Definitivo', checado: false },
        ],
        encerrada: false,
        versaoDocumento: 1,
      },

      dadosRegiao: {
        caracteristicas: '',
        dadosClimatologicos: [],
      },

      imovelAvaliado: {
        imovelNome: formData.imovelNome,
        matricula: '',
        areaTotal: formData.areaAfetadaHa || 0,
        areaAgricultavel: formData.areaAfetadaHa || 0,
        acesso: '',
        indicePluviometrico: '',
        topografia: '',
        caracteristicasSolo: '',
        aptidao: '',
        infraestrutura: '',
        produtividadeCulturas: '',
        benfeitorias: '',
        fotosAdicionais: [],
      },

      laudoOficial: {
        titulo: `LAUDO PERICIAL AGRONÔMICO — ${formData.nome.toUpperCase()}`,
        metodologia: 'Norma ABNT NBR 14.653-5 — Avaliação de Imóveis Rurais e Perícias Agronômicas.',
        conclusaoFinal: 'Processo em andamento.',
      },

      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onCreatePericia(newPericiaObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Abertura de Nova Perícia Rural</h3>
              <p className="text-xs text-slate-500">Cadastre um novo processo pericial para vistoria e laudo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 overscroll-contain">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Título / Nome da Perícia *</label>
              <input
                type="text"
                required
                placeholder="Ex: Perícia de Deriva de Defensivo em Lavoura de Tomate"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Tipo de Perícia *</label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({ ...formData, tipo: e.target.value as TipoPericia })}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                {Object.entries(TIPO_PERICIA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Contratante / Solicitante *</label>
              <input
                type="text"
                required
                placeholder="Ex: Fazenda Santa Helena / Banco Agro"
                value={formData.contratanteNome}
                onChange={e => setFormData({ ...formData, contratanteNome: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nome do Imóvel Rural *</label>
              <input
                type="text"
                required
                placeholder="Ex: Fazenda Progresso - Gleba A"
                value={formData.imovelNome}
                onChange={e => setFormData({ ...formData, imovelNome: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Município / UF *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Município"
                  value={formData.municipio}
                  onChange={e => setFormData({ ...formData, municipio: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.uf}
                  onChange={e => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                  className="w-16 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold uppercase text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cultura Principal</label>
              <input
                type="text"
                value={formData.cultura}
                onChange={e => setFormData({ ...formData, cultura: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Área Estimada Afetada (ha)</label>
              <input
                type="number"
                value={formData.areaAfetadaHa}
                onChange={e => setFormData({ ...formData, areaAfetadaHa: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Objetivo da Perícia</label>
              <textarea
                rows={2}
                placeholder="Descreva resumidamente o objetivo técnico..."
                value={formData.objetivo}
                onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            {/* Judicial / Processual Fields for Capa */}
            <div className="md:col-span-2 border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4 text-emerald-600" />
                Dados Judiciais / Processuais (Para Capa do Laudo)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/60">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Número do Processo</label>
                  <input
                    type="text"
                    placeholder="Ex: 5012938-42.2026.8.09.0051"
                    value={formData.numeroProcesso}
                    onChange={e => setFormData({ ...formData, numeroProcesso: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Autor (Requerente)</label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={formData.autor}
                    onChange={e => setFormData({ ...formData, autor: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Réu (Requerido)</label>
                  <input
                    type="text"
                    placeholder="Ex: Seguradora Agro SA"
                    value={formData.reu}
                    onChange={e => setFormData({ ...formData, reu: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Technical Responsability Registry Integration Block */}
            <div className="md:col-span-2 border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Responsabilidade Técnica (Integrada ao Cadastro Técnico)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/60">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-500 font-semibold">Selecionar RT do Cadastro Técnico</label>
                    {(formData.responsavelTecnico || formData.crea || formData.artNumero) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            responsavelTecnico: '',
                            crea: '',
                            artNumero: '',
                          });
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                      >
                        Limpar dados do RT
                      </button>
                    )}
                  </div>
                  <select
                    value={formData.responsavelTecnico}
                    onChange={e => {
                      const selectedName = e.target.value;
                      const selected = registeredAgronomists.find(a => a.name === selectedName);
                      if (selected) {
                        setFormData({
                          ...formData,
                          responsavelTecnico: selected.name,
                          crea: selected.crea,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          responsavelTecnico: selectedName,
                        });
                      }
                    }}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  >
                    <option value="">-- Selecionar RT ou Inserir Manualmente --</option>
                    {registeredAgronomists.map(a => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.crea || 'Sem CREA'})
                      </option>
                    ))}
                    {registeredAgronomists.length === 0 && (
                      <option value="" disabled>
                        Nenhum profissional cadastrado no Cadastro Técnico
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Confirmar Nome do Perito</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do Responsável Técnico"
                    value={formData.responsavelTecnico}
                    onChange={e => setFormData({ ...formData, responsavelTecnico: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Número de Registro / CREA</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CREA-GO 109823/D"
                    value={formData.crea}
                    onChange={e => setFormData({ ...formData, crea: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Número da ART Vinculada</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ART-2026-999123"
                    value={formData.artNumero}
                    onChange={e => setFormData({ ...formData, artNumero: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Sticky Footer with Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/90 dark:bg-zinc-900/90 backdrop-blur-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar Processo de Perícia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
