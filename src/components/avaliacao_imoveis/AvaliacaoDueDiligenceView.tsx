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

const inputCls =
  'w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';

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
    setLista((prev) => [...prev, novo]);
  };

  const handleUpdateDoc = (id: string, patch: Partial<DocumentoDueDiligence>) => {
    setLista((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const handleRemover = (id: string) => {
    setLista((prev) => prev.filter((d) => d.id !== id));
  };

  const conferidos = lista.filter((d) => d.statusConferencia === 'conferido_valido').length;
  const pendentes = lista.filter((d) => d.statusConferencia === 'pendente').length;
  const criticos = lista.filter(
    (d) => d.statusConferencia === 'irregular' || d.statusConferencia === 'vencido'
  ).length;

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Due Diligence Cartorial, Fundiária & Ambiental
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Conferência de matrículas, certidões negativas de ônus, CAR, CCIR, ITR e outorgas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
            </span>
          )}
          <button
            type="button"
            onClick={handleAddDoc}
            className="h-8 px-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/70 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Documento
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Auditoria
          </button>
        </div>
      </div>

      {/* Faixa de Resumo de Status */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Validados e Regulares
            </span>
            <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {conferidos}
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Pendentes de Entrega
            </span>
            <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
              {pendentes}
            </p>
          </div>
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Vencidos / Irregulares
            </span>
            <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              {criticos}
            </p>
          </div>
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider tabular-nums">
            Documentos Auditados da Propriedade ({lista.length})
          </h3>
        </div>

        {lista.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum documento cadastrado. Clique em <strong>Novo Documento</strong> para iniciar a conferência.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {lista.map((doc) => (
              <div
                key={doc.id}
                className="p-4 space-y-2.5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end text-xs">
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Tipo de Documento
                    </label>
                    <select
                      value={doc.tipo}
                      onChange={(e) =>
                        handleUpdateDoc(doc.id, {
                          tipo: e.target.value as DocumentoDueDiligence['tipo']
                        })
                      }
                      className={`${inputCls} font-medium`}
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
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Número / Identificação
                    </label>
                    <input
                      type="text"
                      value={doc.numeroDocumento}
                      onChange={(e) =>
                        handleUpdateDoc(doc.id, { numeroDocumento: e.target.value })
                      }
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Órgão Emissor
                    </label>
                    <input
                      type="text"
                      value={doc.orgaoEmissor}
                      onChange={(e) => handleUpdateDoc(doc.id, { orgaoEmissor: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Status da Conferência
                    </label>
                    <select
                      value={doc.statusConferencia}
                      onChange={(e) =>
                        handleUpdateDoc(doc.id, {
                          statusConferencia: e.target.value as DocumentoDueDiligence['statusConferencia']
                        })
                      }
                      className={`w-full h-8 px-2.5 rounded-md border font-medium text-xs ${
                        doc.statusConferencia === 'conferido_valido'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                          : doc.statusConferencia === 'pendente'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
                      }`}
                    >
                      <option value="conferido_valido">Conferido & Válido</option>
                      <option value="pendente">Pendente de Entrega</option>
                      <option value="declarado_sem_comprovacao">Declarado s/ Comprovação</option>
                      <option value="vencido">Vencido</option>
                      <option value="irregular">Irregular / Restrição</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemover(doc.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remover documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={doc.observacoes}
                  onChange={(e) => handleUpdateDoc(doc.id, { observacoes: e.target.value })}
                  placeholder="Observação da conferência pericial (ex: certidão negativa de ações atualizada)"
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
