import React, { useState, useEffect, useRef } from 'react';
import { DocumentoDueDiligence } from '../../types/avaliacaoImoveis';
import {
  FileCheck2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface Props {
  documentos: DocumentoDueDiligence[];
  propriedadeId: string;
  onSalvarDocumentos: (docs: DocumentoDueDiligence[]) => void;
}

export const AvaliacaoDueDiligenceView: React.FC<Props> = ({
  documentos,
  propriedadeId,
  onSalvarDocumentos
}) => {
  const [lista, setLista] = useState<DocumentoDueDiligence[]>([...documentos]);
  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLista([...documentos]);
  }, [documentos, propriedadeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSalvar = () => {
    onSalvarDocumentos(lista);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  const handleAddDoc = () => {
    const novo: DocumentoDueDiligence = {
      id: `doc-${Date.now()}`,
      propriedadeId,
      tipo: 'outro',
      numeroDocumento: 'Documento s/n',
      dataEmissao: new Date().toISOString().split('T')[0],
      orgaoEmissor: 'Órgão Competente',
      statusConferencia: 'pendente',
      observacoes: 'Aguardando apresentação de certidão original'
    };
    setLista([...lista, novo]);
  };

  const handleRemover = (id: string) => {
    setLista(lista.filter((d) => d.id !== id));
  };

  const conferidos = lista.filter((d) => d.statusConferencia === 'conferido_valido').length;
  const pendentes = lista.filter((d) => d.statusConferencia === 'pendente').length;
  const criticos = lista.filter((d) => d.statusConferencia === 'irregular' || d.statusConferencia === 'vencido').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Due Diligence Cartorial, Fundiária & Ambiental
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conferência rigorosa de matrículas, certidões negativas de ônus, CAR, CCIR, ITR e outorgas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Checklist Salvo!
            </span>
          )}
          <button
            type="button"
            onClick={handleAddDoc}
            className="px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Documento
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar Auditoria
          </button>
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Validados e Regulares</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{conferidos}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Pendentes de Apresentação</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendentes}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Vencidos / Irregulares</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{criticos}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Documentos Auditados da Propriedade ({lista.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {lista.map((doc, idx) => (
            <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={doc.tipo}
                    onChange={(e: any) => {
                      const upd = [...lista];
                      upd[idx].tipo = e.target.value;
                      setLista(upd);
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="matricula">Matrícula Imobiliária / Ônus</option>
                    <option value="car">CAR (Cadastro Ambiental Rural)</option>
                    <option value="ccir">CCIR (INCRA)</option>
                    <option value="itr">ITR / NIRF (Receita Federal)</option>
                    <option value="outorga_agua">Outorga de Uso de Água</option>
                    <option value="licenca_ambiental">Licença Ambiental (LP/LI/LO)</option>
                    <option value="art_crea">ART do CREA</option>
                    <option value="certidao_onus">Certidão Vintenária / Reipersecutória</option>
                    <option value="outro">Outro Documento</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Número / Identificação
                  </label>
                  <input
                    type="text"
                    value={doc.numeroDocumento}
                    onChange={(e) => {
                      const upd = [...lista];
                      upd[idx].numeroDocumento = e.target.value;
                      setLista(upd);
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Órgão Emissor
                  </label>
                  <input
                    type="text"
                    value={doc.orgaoEmissor}
                    onChange={(e) => {
                      const upd = [...lista];
                      upd[idx].orgaoEmissor = e.target.value;
                      setLista(upd);
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Status da Conferência
                  </label>
                  <select
                    value={doc.statusConferencia}
                    onChange={(e: any) => {
                      const upd = [...lista];
                      upd[idx].statusConferencia = e.target.value;
                      setLista(upd);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded border font-bold ${
                      doc.statusConferencia === 'conferido_valido'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : doc.statusConferencia === 'pendente'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400'
                    }`}
                  >
                    <option value="conferido_valido">Conferido & Válido</option>
                    <option value="pendente">Pendente de Entrega</option>
                    <option value="declarado_sem_comprovacao">Declarado s/ Comprovação</option>
                    <option value="vencido">Vencido</option>
                    <option value="irregular">Irregular / Restrição</option>
                  </select>
                </div>

                <div className="md:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemover(doc.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Observações da Auditoria */}
              <div>
                <input
                  type="text"
                  value={doc.observacoes}
                  onChange={(e) => {
                    const upd = [...lista];
                    upd[idx].observacoes = e.target.value;
                    setLista(upd);
                  }}
                  placeholder="Observação da conferência pericial (ex: certidão negativa de ações reipersecutórias atualizada)"
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
