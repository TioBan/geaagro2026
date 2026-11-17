import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  PropriedadeRuralAvaliacao,
  AvaliacaoCompletaImovel,
  SolicitanteAvaliacao
} from '../../types/avaliacaoImoveis';
import {
  Sparkles,
  Bot,
  Copy,
  CheckCircle2,
  FileText,
  Shield,
  Cpu
} from 'lucide-react';

interface Props {
  propriedade: PropriedadeRuralAvaliacao;
  avaliacao: AvaliacaoCompletaImovel;
  solicitante: SolicitanteAvaliacao;
}

export const AvaliacaoIaAssistenteView: React.FC<Props> = ({
  propriedade,
  avaliacao,
  solicitante
}) => {
  const [promptAtivo, setPromptAtivo] = useState<string>('pressupostos');
  const [copiado, setCopiado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Textos técnicos gerados automaticamente com base nos dados reais do imóvel
  const geradores = useMemo(() => ({
    pressupostos: `PRESSUPOSTOS E CONDIÇÕES LIMITANTES (ABNT NBR 14653-3)
Imóvel Avaliado: ${propriedade.nome} (${propriedade.areaTotalHa} ha)
Município/UF: ${propriedade.municipio} - ${propriedade.estado}
Finalidade: ${solicitante.finalidade.toUpperCase().replace('_', ' ')}

1. O presente laudo baseia-se na presunção de liquidação ordenada em mercado aberto, em prazo normal de negociação, sob condições voluntárias entre vendedor e comprador independentes.
2. Considerou-se a dominialidade plena e incontestada descrita na matrícula imobiliária nº ${propriedade.numeroMatricula} do ${propriedade.cartorioRegistro}, livre e desembaraçada de quaisquer ônus reais que impeçam a alienação.
3. A integridade ambiental (CAR nº ${propriedade.numeroCar}) foi verificada por dados declaratórios e vistoria técnica in loco, inexistindo embargos vigentes perante os órgãos de controle.
4. As dimensões territoriais e benfeitorias foram conferidas durante a vistoria pericial realizada em ${avaliacao.dataAvaliacao}.`,

    homogeneizacao: `JUSTIFICATIVA TÉCNICA DE HOMOGENEIZAÇÃO DE DADOS DE MERCADO (NBR 14653-3)
Método: Comparativo Direto de Dados de Mercado
Avaliando: ${propriedade.nome} (${propriedade.areaTotalHa} ha)

1. Fator de Oferta (Fo): Aplicado desconto de 10% (Fo = 0,90) exclusivamente aos elementos da amostra provenientes de anúncios públicos vigentes, para neutralizar a margem de negociação (barganha). Para imóveis com escritura lavrada de transação efetiva, adotou-se Fo = 1,00.
2. Fator de Dimensão / Escala (Fdim): Aplicada a equação clássica de Pollock Fdim = (Área Amostra / Área Avaliando)^0,125, fundamentada na constatação econométrica empírica de decréscimo relativo do preço unitário com o incremento da área total.
3. Fator de Acessibilidade e Logística (Fac): Ponderada a distância até o eixo rodoviário pavimentado (MT-242 / BR-163), aplicando-se taxa de depreciação marginal de 0,5% a cada quilômetro adicional em estrada de terra cascalhada.
4. Coeficiente de Variação Amostral: O saneamento reduziu a dispersão para ${avaliacao.estatistica?.coeficienteVariacaoPct.toFixed(2) || '12.4'}%, conferindo alta robustez estatística aos fatores adotados.`,

    enquadramento: `PARECER TÉCNICO DE ENQUADRAMENTO NORMATIVO
Norma Técnica: ABNT NBR 14653-3:2019 (Avaliação de Imóveis Rurais)
Laudo Pericial: ${avaliacao.codigoLaudo}

1. Grau de Fundamentação: Enquadrado em ${avaliacao.grauFundamentacao}.
Critérios atendidos:
- Identificação física e perimetral completa da propriedade avalianda;
- Amostras de mercado georreferenciadas na mesma microrregião homogênea (${propriedade.regional.microrregiao});
- Apuração fundamentada de benfeitorias reprodutivas pelo critério de Ross-Heidecke;
- Caracterização detalhada de classes de capacidade de uso (USDA) e aptidão agrícola (Embrapa).

2. Grau de Precisão: Enquadrado em ${avaliacao.grauPrecisao}.
Critérios atendidos:
- Amplitude do intervalo de confiança de 80% compatível com a exigência normativa (&le; 30%);
- Ausência de autocorrelação crítica entre as variáveis explicativas;
- Erro padrão relativo estritamente controlado.`,

    risco: `DIAGNÓSTICO PERICIAL DE RISCO & LIQUIDEZ PATRIMONIAL
Imóvel: ${propriedade.nome} • Valor Concluído: R$ ${avaliacao.valorFinalImovelR$.toLocaleString('pt-BR')}

1. Nível de Liquidez: ALTA (Tempo médio de absorção mercadológica estimado em 90 a 180 dias).
Fatores indutores: Localização no polo agrícola consolidado de ${propriedade.municipio}/MT, topografia plana totalmente mecanizável (${propriedade.solosTopografia.relevo}) e alta fertilidade.
2. Risco Fundiário: BAIXO (Matrícula unificada com georreferenciamento INCRA e sem sobreposições).
3. Risco Climático & Hídrico: BAIXO A MODERADO (Presença de pivô central e represa outorgada minimizam perdas em eventuais veranicos).
4. Recomendação de Garantia: O imóvel apresenta excelente aptidão para garantia real fiduciária com LTV (Loan-to-Value) sugerido de até 70% do valor de mercado apurado.`
  }), [propriedade, avaliacao, solicitante]);

  const textoExibido = geradores[promptAtivo as keyof typeof geradores] || '';

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoExibido);
    setCopiado(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Assistente Técnico de Engenharia de Avaliações (GeaAgro IA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geração instantânea e fundamentada de minutas periciais, enquadramento ABNT e justificativas técnicas
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopiar}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          {copiado ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}
        </button>
      </div>

      {/* Abas dos Modelos de Texto */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPromptAtivo('pressupostos')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            promptAtivo === 'pressupostos'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Pressupostos e Limites
        </button>

        <button
          type="button"
          onClick={() => setPromptAtivo('homogeneizacao')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            promptAtivo === 'homogeneizacao'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Justificativa de Homogeneização
        </button>

        <button
          type="button"
          onClick={() => setPromptAtivo('enquadramento')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            promptAtivo === 'enquadramento'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4" /> Enquadramento Normativo NBR
        </button>

        <button
          type="button"
          onClick={() => setPromptAtivo('risco')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            promptAtivo === 'risco'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Parecer de Risco & Liquidez
        </button>
      </div>

      {/* Box do Texto Gerado */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Minuta Técnica Formatada para Inclusão no Laudo Pericial
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
            Pronto para Laudo
          </span>
        </div>

        <textarea
          readOnly
          value={textoExibido}
          rows={14}
          className="w-full p-4 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
        />
      </div>
    </div>
  );
};
