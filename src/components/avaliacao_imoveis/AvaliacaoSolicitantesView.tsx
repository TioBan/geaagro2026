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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Solicitante, Finalidade & Responsabilidade Técnica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Definição da finalidade legal da avaliação, premissas técnicas, limites de atuação e ART do CREA
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Dados salvos!
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar Solicitante
          </button>
        </div>
      </div>

      {/* Finalidade da Avaliação */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Finalidade da Avaliação (ABNT NBR 14653-3)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FINALIDADES_OPCOES.map((opcao) => {
            const isSelected = form.finalidade === opcao.key;
            return (
              <label
                key={opcao.key}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="finalidade"
                    value={opcao.key}
                    checked={isSelected}
                    onChange={() => setForm({ ...form, finalidade: opcao.key })}
                    className="mt-1 accent-emerald-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {opcao.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                      {opcao.desc}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dados do Solicitante e Contratante */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <FileCheck className="w-4 h-4 text-emerald-500" />
          Dados das Partes Envolvidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Solicitante da Avaliação (Banco, Cooperativa, Tribunal ou Cliente) *
            </label>
            <input
              type="text"
              required
              value={form.solicitanteNome}
              onChange={(e) => setForm({ ...form, solicitanteNome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              CPF / CNPJ do Solicitante
            </label>
            <input
              type="text"
              value={form.solicitanteCpfCnpj}
              onChange={(e) => setForm({ ...form, solicitanteCpfCnpj: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contratante dos Serviços Técnicos
            </label>
            <input
              type="text"
              value={form.contratanteNome}
              onChange={(e) => setForm({ ...form, contratanteNome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data de Referência da Avaliação *
            </label>
            <input
              type="date"
              required
              value={form.dataReferencia}
              onChange={(e) => setForm({ ...form, dataReferencia: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Objeto da Avaliação
            </label>
            <textarea
              rows={2}
              value={form.objetoAvaliacao}
              onChange={(e) => setForm({ ...form, objetoAvaliacao: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pressupostos e Condições Limitantes da Avaliação (NBR 14653)
            </label>
            <textarea
              rows={3}
              value={form.pressupostosCondicoesLimitantes}
              onChange={(e) => setForm({ ...form, pressupostosCondicoesLimitantes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Responsável Técnico & CREA/ART */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          Habilitação Profissional do Avaliador (CONFEA / CREA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Profissional Habilitado Responsável *
            </label>
            <input
              type="text"
              required
              value={form.profissionalResponsavel}
              onChange={(e) => setForm({ ...form, profissionalResponsavel: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Registro no CREA *
            </label>
            <input
              type="text"
              required
              value={form.creaNumero}
              onChange={(e) => setForm({ ...form, creaNumero: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Número da ART (Anotação de Resp. Técnica) *
            </label>
            <input
              type="text"
              required
              value={form.artNumero}
              onChange={(e) => setForm({ ...form, artNumero: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
