import React, { useState, useEffect, useRef } from 'react';
import { SolicitanteAvaliacao, FinalidadeAvaliacao } from '../../types/avaliacaoImoveis';
import { UserCheck, Save, CheckCircle2, Shield, FileCheck } from 'lucide-react';

interface Props {
  solicitante: SolicitanteAvaliacao;
  onSalvarSolicitante: (sol: SolicitanteAvaliacao) => void;
}

const FINALIDADES_OPCOES: { key: FinalidadeAvaliacao; label: string; desc: string }[] = [
  { key: 'compra_venda', label: 'Compra e Venda', desc: 'Determinação do valor justo de mercado para negociação' },
  { key: 'garantia_bancaria', label: 'Garantia Bancária', desc: 'Alienação fiduciária ou hipoteca para instituições financeiras' },
  { key: 'credito_rural', label: 'Crédito Rural / Custeio / Investimento', desc: 'Comprovação patrimonial para linhas de financiamento agro' },
  { key: 'inventario_partilha', label: 'Inventário e Partilha', desc: 'Divisão judicial ou extrajudicial de herança e sucessão' },
  { key: 'desapropriacao', label: 'Desapropriação / Indenizatória', desc: 'Utilidade pública ou interesse social com justa indenização' },
  { key: 'seguro_agricola', label: 'Seguro Agrícola e Patrimonial', desc: 'Determinação do Limite Máximo de Garantia segurável' },
  { key: 'operacoes_societarias', label: 'Operações Societárias', desc: 'Fusões, cisões, incorporações e aporte de capital' },
  { key: 'revisao_patrimonial', label: 'Revisão Patrimonial / Balanço', desc: 'Adequação contábil e teste de recuperabilidade (Impairment)' },
  { key: 'pericia_judicial', label: 'Perícia Judicial', desc: 'Atuação como perito do juízo em processos cíveis' },
  { key: 'assistencia_tecnica', label: 'Assistência Técnica Judicial', desc: 'Elaboração de parecer técnico divergente ou convergente' },
  { key: 'outros', label: 'Outras Finalidades Especiais', desc: 'Demandas específicas conforme contrato técnico' }
];

const inputCls =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const AvaliacaoSolicitantesView: React.FC<Props> = ({ solicitante, onSalvarSolicitante }) => {
  const [form, setForm] = useState<SolicitanteAvaliacao>({ ...solicitante });
  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({ ...solicitante });
  }, [solicitante]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarSolicitante(form);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Solicitante, Finalidade & Responsabilidade Técnica
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Definição da finalidade legal da avaliação, premissas técnicas, limites de atuação e ART do CREA
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dados salvos
            </span>
          )}
          <button
            type="submit"
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Solicitante
          </button>
        </div>
      </div>

      {/* Finalidade da Avaliação */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Finalidade da Avaliação (ABNT NBR 14653-3)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FINALIDADES_OPCOES.map((opcao) => {
            const isSelected = form.finalidade === opcao.key;
            return (
              <label
                key={opcao.key}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/40'
                }`}
              >
                <input
                  type="radio"
                  name="finalidade"
                  value={opcao.key}
                  checked={isSelected}
                  onChange={() => setForm({ ...form, finalidade: opcao.key })}
                  className="mt-0.5 accent-emerald-600 focus:ring-emerald-500"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                    {opcao.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 block leading-relaxed">
                    {opcao.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dados do Solicitante e Contratante */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Dados das Partes Envolvidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Solicitante da Avaliação (Banco, Cooperativa, Tribunal ou Cliente) *
            </label>
            <input
              type="text"
              required
              value={form.solicitanteNome}
              onChange={(e) => setForm({ ...form, solicitanteNome: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>CPF / CNPJ do Solicitante</label>
            <input
              type="text"
              value={form.solicitanteCpfCnpj}
              onChange={(e) => setForm({ ...form, solicitanteCpfCnpj: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Contratante dos Serviços Técnicos</label>
            <input
              type="text"
              value={form.contratanteNome}
              onChange={(e) => setForm({ ...form, contratanteNome: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Data de Referência da Avaliação *</label>
            <input
              type="date"
              required
              value={form.dataReferencia}
              onChange={(e) => setForm({ ...form, dataReferencia: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Objeto da Avaliação</label>
            <textarea
              rows={2}
              value={form.objetoAvaliacao}
              onChange={(e) => setForm({ ...form, objetoAvaliacao: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>
              Pressupostos e Condições Limitantes da Avaliação (NBR 14653)
            </label>
            <textarea
              rows={3}
              value={form.pressupostosCondicoesLimitantes}
              onChange={(e) =>
                setForm({ ...form, pressupostosCondicoesLimitantes: e.target.value })
              }
              className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Responsável Técnico & CREA/ART */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Habilitação Profissional do Avaliador (CONFEA / CREA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Profissional Habilitado Responsável *</label>
            <input
              type="text"
              required
              value={form.profissionalResponsavel}
              onChange={(e) => setForm({ ...form, profissionalResponsavel: e.target.value })}
              className={`${inputCls} font-medium`}
            />
          </div>

          <div>
            <label className={labelCls}>Registro no CREA *</label>
            <input
              type="text"
              required
              value={form.creaNumero}
              onChange={(e) => setForm({ ...form, creaNumero: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Número da ART (Anotação de Resp. Técnica) *</label>
            <input
              type="text"
              required
              value={form.artNumero}
              onChange={(e) => setForm({ ...form, artNumero: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
