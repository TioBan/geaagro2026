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

type PromptKey = 'pressupostos' | 'homogeneizacao' | 'enquadramento' | 'risco';

const MODELOS_TABS: { key: PromptKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'pressupostos', label: 'Pressupostos e Limites', icon: Shield },
  { key: 'homogeneizacao', label: 'Justificativa de Homogeneização', icon: FileText },
  { key: 'enquadramento', label: 'Enquadramento Normativo NBR', icon: Cpu },
  { key: 'risco', label: 'Parecer de Risco & Liquidez', icon: Sparkles }
];

export const AvaliacaoIaAssistenteView: React.FC<Props> = ({
  propriedade,
  avaliacao,
  solicitante
}) => {
  const [promptAtivo, setPromptAtivo] = useState<PromptKey>('pressupostos');
  const [copiado, setCopiado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const geradores = useMemo<Record<PromptKey, string>>(
    () => ({
      pressupostos: `PRESSUPOSTOS E CONDIÇÕES LIMITANTES (ABNT NBR 14653-3)
Imóvel Avaliado: ${propriedade.nome || 'Imóvel Rural'} (${propriedade.areaTotalHa} ha)
Município/UF: ${propriedade.municipio || 'Não informado'} - ${propriedade.estado || 'UF'}
Finalidade: ${solicitante.finalidade.toUpperCase().replace(/_/g, ' ')}

1. O presente laudo baseia-se na presunção de liquidação ordenada em mercado aberto, em prazo normal de negociação, sob condições voluntárias entre vendedor e comprador independentes.
2. Considerou-se a dominialidade plena e incontestada descrita na matrícula imobiliária nº ${propriedade.numeroMatricula || '—'} do ${propriedade.cartorioRegistro || 'CRI competente'}, livre e desembaraçada de quaisquer ônus reais que impeçam a alienação.
3. A integridade ambiental (CAR nº ${propriedade.numeroCar || '—'}) foi verificada por dados declaratórios e vistoria técnica in loco, inexistindo embargos vigentes perante os órgãos de controle.
4. As dimensões territoriais e benfeitorias foram conferidas durante a vistoria pericial realizada em ${avaliacao.dataAvaliacao}.`,

      homogeneizacao: `JUSTIFICATIVA TÉCNICA DE HOMOGENEIZAÇÃO DE DADOS DE MERCADO (NBR 14653-3)
Método: Comparativo Direto de Dados de Mercado
Avaliando: ${propriedade.nome || 'Imóvel Rural'} (${propriedade.areaTotalHa} ha)

1. Fator de Oferta (Fo): Aplicado desconto de 10% (Fo = 0,90) exclusivamente aos elementos da amostra provenientes de anúncios públicos vigentes, para neutralizar a margem de negociação (barganha). Para imóveis com escritura lavrada de transação efetiva, adotou-se Fo = 1,00.
2. Fator de Dimensão / Escala (Fdim): Aplicada a equação clássica de Pollock Fdim = (Área Amostra / Área Avaliando)^0,125, fundamentada na constatação econométrica empírica de decréscimo relativo do preço unitário com o incremento da área total.
3. Fator de Acessibilidade e Logística (Fac): Ponderada a distância até o eixo rodoviário pavimentado principal, aplicando-se taxa de depreciação marginal de 0,5% a cada quilômetro adicional em estrada vicinal não pavimentada.
4. Coeficiente de Variação Amostral: O saneamento conduziu a dispersão para ${avaliacao.estatistica?.coeficienteVariacaoPct.toFixed(2) || '0.00'}%, conferindo consistência estatística aos fatores adotados.`,

      enquadramento: `PARECER TÉCNICO DE ENQUADRAMENTO NORMATIVO
Norma Técnica: ABNT NBR 14653-3:2019 (Avaliação de Imóveis Rurais)
Laudo Pericial: ${avaliacao.codigoLaudo}

1. Grau de Fundamentação: Enquadrado em ${avaliacao.grauFundamentacao}.
Critérios atendidos:
- Identificação física e perimetral completa da propriedade avalianda;
- Amostras de mercado georreferenciadas na mesma microrregião homogênea (${propriedade.regional.microrregiao || 'microrregião local'});
- Apuração fundamentada de benfeitorias reprodutivas pelo critério de Ross-Heidecke;
- Caracterização detalhada de classes de capacidade de uso (USDA) e aptidão agrícola (Embrapa).

2. Grau de Precisão: Enquadrado em ${avaliacao.grauPrecisao}.
Critérios atendidos:
- Amplitude do intervalo de confiança de 80% compatível com a exigência normativa (≤ 30%);
- Ausência de autocorrelação crítica entre as variáveis explicativas;
- Erro padrão relativo estritamente controlado.`,

      risco: `DIAGNÓSTICO PERICIAL DE RISCO & LIQUIDEZ PATRIMONIAL
Imóvel: ${propriedade.nome || 'Imóvel Rural'} • Valor Concluído: R$ ${avaliacao.valorFinalImovelR$.toLocaleString('pt-BR')}

1. Nível de Liquidez: ALTA (Tempo médio de absorção mercadológica estimado em 90 a 180 dias).
Fatores indutores: Localização no polo agrícola de ${propriedade.municipio || 'Município'}/${propriedade.estado || 'UF'}, topografia (${propriedade.solosTopografia.relevo}) e condições produtivas levantadas em campo.
2. Risco Fundiário: BAIXO (Matrícula conferida com georreferenciamento e análise dominial).
3. Risco Climático & Hídrico: BAIXO A MODERADO (Condicionado à disponibilidade hídrica e práticas conservacionistas adotadas).
4. Recomendação de Garantia: O imóvel apresenta aptidão para garantia real fiduciária com LTV (Loan-to-Value) sugerido de até 70% do valor de mercado apurado.`
    }),
    [propriedade, avaliacao, solicitante]
  );

  const textoExibido = geradores[promptAtivo];

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoExibido);
    setCopiado(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Assistente Técnico de Engenharia de Avaliações (GeaAgro IA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Geração de minutas periciais, enquadramento ABNT e justificativas técnicas com base nos dados do imóvel
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopiar}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          {copiado ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiado ? 'Copiado' : 'Copiar Minuta'}
        </button>
      </div>

      {/* Abas dos Modelos de Texto */}
      <div className="flex flex-wrap items-center gap-1.5">
        {MODELOS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = promptAtivo === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPromptAtivo(tab.key)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Caixa do Texto Gerado */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Minuta Técnica Formatada para Laudo
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
            Pronto para uso
          </span>
        </div>

        <textarea
          readOnly
          value={textoExibido}
          rows={14}
          className="w-full p-3.5 text-xs font-mono rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 text-slate-800 dark:text-zinc-200 leading-relaxed focus:outline-none"
        />
      </div>
    </div>
  );
};
