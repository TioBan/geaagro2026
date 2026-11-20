import React, { useState } from 'react';
import {
  Calculator,
  FileSpreadsheet,
  BarChart3,
  Check,
} from 'lucide-react';
import { Pericia, PericiaCalculoDanos } from '../../types/pericia';

interface PericiaSubmoduleCalculosProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PericiaSubmoduleCalculos: React.FC<PericiaSubmoduleCalculosProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  const [activeTab, setActiveTab] = useState<'calculadora' | 'fontes' | 'sintese'>('calculadora');
  const [savedNotice, setSavedNotice] = useState(false);

  const calc = pericia.calculosDanos;

  const [areaHa, setAreaHa] = useState<number>(
    calc?.areaTotalAfetadaHa || pericia.objetoDescricao?.areaAfetadaHa || 50
  );
  const [prodEsperadaSacas, setProdEsperadaSacas] = useState<number>(
    calc?.produtividadeEsperadaSacasHa ||
      (pericia.analiseTecnica?.caracterizacaoCultura?.produtividadeEsperadaKgHa || 3600) / 60
  );
  const [prodObtidaSacas, setProdObtidaSacas] = useState<number>(
    calc?.produtividadeObtidaSacasHa ||
      (pericia.analiseTecnica?.caracterizacaoCultura?.produtividadeObservadaKgHa || 1200) / 60
  );
  const [precoSacaBrl, setPrecoSacaBrl] = useState<number>(calc?.precoUnitarioSacaBrl || 135.0);
  const [custosAdicionaisBrl, setCustosAdicionaisBrl] = useState<number>(calc?.custosAdicionaisBrl || 15000);
  const [custoReimplantioBrl, setCustoReimplantioBrl] = useState<number>(calc?.custoReimplantioBrl || 0);

  const perdaSacasPorHa = Math.max(0, prodEsperadaSacas - prodObtidaSacas);
  const perdaTotalSacas = perdaSacasPorHa * areaHa;
  const valorPerdaProducaoBrl = perdaTotalSacas * precoSacaBrl;
  const danoEmergenteTotalBrl = custoReimplantioBrl + custosAdicionaisBrl;
  const perdaFinanceiraTotalBrl = valorPerdaProducaoBrl + danoEmergenteTotalBrl;

  const handleSaveCalculos = () => {
    const updatedCalculos: PericiaCalculoDanos = {
      ...calc,
      areaTotalAfetadaHa: areaHa,
      produtividadeEsperadaSacasHa: prodEsperadaSacas,
      produtividadeObtidaSacasHa: prodObtidaSacas,
      precoUnitarioSacaBrl: precoSacaBrl,
      perdaTotalSacas,
      valorPerdaProducaoBrl,
      custoReimplantioBrl,
      custosAdicionaisBrl,
      danoEmergenteTotalBrl,
      lucrosCessantesTotalBrl: valorPerdaProducaoBrl,
      perdaFinanceiraTotalBrl,
      memoriaCalculoTexto: `CÁLCULO OFICIAL GEAAGRO:\n• Área Afetada: ${areaHa} ha\n• Quebra de Produtividade: ${perdaSacasPorHa.toFixed(1)} sc/ha\n• Total Sacas Perdidas: ${perdaTotalSacas.toLocaleString('pt-BR')} sc\n• Preço da Saca (Fonte: CEPEA/B3): R$ ${precoSacaBrl.toFixed(2)}\n• Perda da Receita Bruta (Lucros Cessantes): ${formatBRL(valorPerdaProducaoBrl)}\n• Danos Emergentes (Reimplantio + Custos Extra): ${formatBRL(danoEmergenteTotalBrl)}\n• TOTAL DA VALORAÇÃO: ${formatBRL(perdaFinanceiraTotalBrl)}`,
    };

    onUpdatePericia({
      ...pericia,
      calculosDanos: updatedCalculos,
      status: pericia.status === 'em_analise' ? 'em_calculo' : pericia.status,
      atualizadoEm: new Date().toISOString(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER + SUB-TABS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cálculos Periciais &amp; Valoração de Danos</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Apuração de lucros cessantes, danos emergentes e memória de cálculo oficial
            </p>
          </div>
          {activeTab === 'calculadora' && (
            <button
              type="button"
              onClick={handleSaveCalculos}
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {savedNotice && <Check className="w-3.5 h-3.5" />}
              <span>{savedNotice ? 'Memória Gravada' : 'Gravar Memória no Processo'}</span>
            </button>
          )}
        </div>

        <div className="px-5 flex items-center gap-5 overflow-x-auto">
          {[
            { id: 'calculadora' as const, label: 'Calculadora & Memória', icon: Calculator },
            { id: 'fontes' as const, label: 'Fontes de Preços', icon: FileSpreadsheet },
            { id: 'sintese' as const, label: 'Síntese Financeira', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-9 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* CALCULADORA */}
      {activeTab === 'calculadora' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-zinc-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Parâmetros de Produção e Perda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Área Afetada (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={areaHa}
                  onChange={e => setAreaHa(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço do Produto (R$ / saca)</label>
                <input
                  type="number"
                  step="0.01"
                  value={precoSacaBrl}
                  onChange={e => setPrecoSacaBrl(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Produtividade Esperada (sc/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prodEsperadaSacas}
                  onChange={e => setProdEsperadaSacas(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Produtividade Obtida (sc/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prodObtidaSacas}
                  onChange={e => setProdObtidaSacas(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Custo de Reimplantio (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={custoReimplantioBrl}
                  onChange={e => setCustoReimplantioBrl(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Custos Adicionais (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={custosAdicionaisBrl}
                  onChange={e => setCustosAdicionaisBrl(Number(e.target.value))}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* LIVE RESULTS */}
          <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-slate-50/50 dark:bg-zinc-950/30 space-y-4">
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Apuração Oficial de Danos
              </div>

              <div className="pb-3 border-b border-slate-200/80 dark:border-zinc-800 space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Lucros Cessantes (Perda de Produção)
                </span>
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
                  {formatBRL(valorPerdaProducaoBrl)}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums block">
                  {perdaTotalSacas.toLocaleString('pt-BR')} sc perdidas ({perdaSacasPorHa.toFixed(1)} sc/ha) × R$ {precoSacaBrl.toFixed(2)}
                </span>
              </div>

              <div className="pb-3 border-b border-slate-200/80 dark:border-zinc-800 space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Danos Emergentes (Reimplantio + Extras)
                </span>
                <span className="text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums block">
                  {formatBRL(danoEmergenteTotalBrl)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Valoração Total do Dano
              </span>
              <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 tabular-nums block mt-0.5">
                {formatBRL(perdaFinanceiraTotalBrl)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FONTES DE PREÇO */}
      {activeTab === 'fontes' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
          {[
            { fonte: 'CEPEA / ESALQ', desc: 'Indicador de Soja Paranaguá e praça regional', ref: 'Referência Fev/2026' },
            { fonte: 'CONAB', desc: 'Série histórica de preços recebidos pelos produtores', ref: 'Boletim 2025/2026' },
            { fonte: 'B3 / Futuros', desc: 'Cotações futuras de milho e soja para liquidação de safra', ref: 'Contrato Futuro' },
            { fonte: 'Notas Fiscais Locais', desc: 'Comprovantes de compra de insumos, sementes e operações', ref: 'Anexo Vistoria' },
          ].map(item => (
            <div key={item.fonte} className="p-4 space-y-1">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{item.fonte}</div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{item.desc}</p>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">{item.ref}</span>
            </div>
          ))}
        </div>
      )}

      {/* SÍNTESE FINANCEIRA */}
      {activeTab === 'sintese' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            Memória de Cálculo Registrada no Processo
          </h4>
          <div className="p-4 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40">
            <p className="whitespace-pre-line font-mono text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
              {calc?.memoriaCalculoTexto ||
                'Nenhuma memória gravada ainda. Utilize a aba Calculadora & Memória e clique em "Gravar Memória no Processo".'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
